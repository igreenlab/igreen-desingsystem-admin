/**
 * Contrato do pacote `dist-lib/ai/`.
 *
 * Roda o gerador DE VERDADE contra o repo, numa pasta temporária — não uma
 * reimplementação do que ele deveria fazer (L-064). Um teste escrito a partir do
 * mesmo modelo mental que gerou o código concorda por construção.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { montarBundle } from "./build-ai-bundle.mjs";

let destino;
let manifesto;

beforeAll(() => {
  destino = fs.mkdtempSync(path.join(os.tmpdir(), "ai-bundle-"));
  ({ manifesto } = montarBundle(destino));
});

afterAll(() => {
  fs.rmSync(destino, { recursive: true, force: true });
});

const ler = (rel) => fs.readFileSync(path.join(destino, rel), "utf8");
const existe = (rel) => fs.existsSync(path.join(destino, rel));

describe("manifesto", () => {
  it("carimba versão e commit — é como o consumidor sabe o que tem na mão", () => {
    expect(manifesto.versao).toMatch(/^\d+\.\d+\.\d+/);
    expect(manifesto.commit).not.toBe("");
    expect(manifesto.pacote).toBe("@snksergio/design-system");
  });

  it("bate com a versão do package.json (carimbo tem que ser do build atual)", () => {
    // Caminho por `cwd`, não por `import.meta.url`: sob o vitest a URL do módulo
    // não é `file:` e `new URL()` estoura. O vitest roda na raiz do repo.
    const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
    expect(manifesto.versao).toBe(pkg.version);
  });
});

describe("cobertura de componentes", () => {
  /**
   * A pergunta que a maioria dos gates esquece: não é "o que está no bundle
   * existe?", é "TUDO que deveria estar, está?". Sem ela o gate mente por
   * omissão — diz "✓ 47 componentes" sobre um conjunto incompleto, e o
   * consumidor nunca fica sabendo do componente novo.
   */
  it("todo componente de ui/ com USAGE chega no bundle", () => {
    const raiz = path.resolve("src/components/ui");
    const noRepo = fs
      .readdirSync(raiz)
      .filter((d) => fs.existsSync(path.join(raiz, d, "USAGE.md")))
      .filter((d) => d !== "TabelaTeste"); // não é exportado pelo npm

    const faltando = noRepo.filter((d) => !existe(`componentes/${d}.md`));
    expect(faltando).toEqual([]);
    expect(manifesto.conteudo.componentes).toBe(noRepo.length);
  });

  it("o índice de componentes aponta só para arquivo que existe", () => {
    const indice = JSON.parse(ler("componentes/indice.json"));
    const orfaos = Object.values(indice).filter((rel) => !existe(rel));
    expect(orfaos).toEqual([]);
  });
});

describe("roteamento", () => {
  it("colhe as rotas da tabela do ds-kit, não de outra tabela do arquivo", () => {
    const { rotas } = JSON.parse(ler("indice.json"));
    expect(rotas.length).toBeGreaterThanOrEqual(15);
    // A regressão real: `mode`/`submodule` vinham da tabela do ds-config.
    const sinais = rotas.flatMap((r) => r.sinais);
    expect(sinais).not.toContain("mode");
    expect(sinais).not.toContain("submodule");
    // E as rotas de verdade estão lá.
    expect(sinais).toContain("tabela");
    expect(sinais).toContain("dashboard");
  });
});

describe("exemplos", () => {
  /**
   * O defeito que originou este teste: a 1ª versão do gerador pulava o TopoJSON
   * (256 KB) por "não ensinar nada", e `dashboard-screen.tsx:41` importa dele.
   * O exemplo chegava quebrado — pior que ausente, porque o consumidor copia o
   * padrão.
   */
  it("nenhum import relativo aponta pra fora do bundle", () => {
    const quebrados = [];
    const varrer = (dir) => {
      for (const e of fs.readdirSync(dir)) {
        const alvo = path.join(dir, e);
        if (fs.statSync(alvo).isDirectory()) varrer(alvo);
        else if (/\.tsx?$/.test(e)) {
          for (const m of fs.readFileSync(alvo, "utf8").matchAll(/from\s+["'](\.[^"']+)["']/g)) {
            const p = path.resolve(path.dirname(alvo), m[1]);
            const achou = ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"].some((x) =>
              fs.existsSync(p + x),
            );
            if (!achou) quebrados.push(`${path.relative(destino, alvo)} → ${m[1]}`);
          }
        }
      }
    };
    varrer(path.join(destino, "exemplos"));
    expect(quebrados).toEqual([]);
  });
});

describe("regras injetáveis", () => {
  it("extrai os blocos ds:regras de compostos e de primitivos", () => {
    const regras = JSON.parse(ler("regras-por-componente.json"));
    expect(regras.DataTable?.length).toBeGreaterThan(0); // composto
    expect(regras.card?.length).toBeGreaterThan(0); // primitivo, bloco nomeado
    expect(Object.keys(regras).length).toBe(manifesto.conteudo.componentesComRegra);
  });

  it("nenhuma regra vem vazia ou com marcador de markdown sobrando", () => {
    const regras = JSON.parse(ler("regras-por-componente.json"));
    for (const [comp, linhas] of Object.entries(regras)) {
      for (const l of linhas) {
        expect(l.trim(), `${comp}: regra vazia`).not.toBe("");
        expect(l.startsWith("-"), `${comp}: marcador não removido`).toBe(false);
      }
    }
  });
});

describe("estrutura mínima", () => {
  it("entrega os globais, as regras e o lint", () => {
    for (const rel of [
      "manifest.json",
      "indice.json",
      "global/composicao.md",
      "global/componentes.md",
      "regras/design.md",
      "lint/ds-lint-patterns.mjs",
      "componentes/_primitivos.md",
    ]) {
      expect(existe(rel), `faltou ${rel}`).toBe(true);
    }
  });

  it("os roteiros levam o aviso de portabilidade", () => {
    for (const id of manifesto.conteudo.roteiros) {
      expect(ler(`roteiros/${id}/roteiro.md`)).toContain("Nota de portabilidade");
    }
  });

  it("nenhum arquivo do bundle sai vazio", () => {
    const vazios = [];
    const varrer = (dir) => {
      for (const e of fs.readdirSync(dir)) {
        const alvo = path.join(dir, e);
        if (fs.statSync(alvo).isDirectory()) varrer(alvo);
        else if (fs.statSync(alvo).size === 0) vazios.push(path.relative(destino, alvo));
      }
    };
    varrer(destino);
    expect(vazios).toEqual([]);
  });
});
