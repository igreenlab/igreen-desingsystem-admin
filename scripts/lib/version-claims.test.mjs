import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  RAIZES,
  PLACEHOLDER,
  DONO_DA_CONVENCAO,
  versoesLancadas,
  checkVersionClaims,
  checkPlaceholders,
  formatar,
} from "./version-claims.mjs";

/* ═══════════════════════════════════════════════════════════════════════════
   Leitura do estado REAL (só aqui — o módulo é puro)

   As RAIZES vêm do módulo, não daqui: o `scripts/version-claims-check.mjs` varre as
   MESMAS, e duas listas divergem (é o defeito que metade dos gates deste repo existe
   pra pegar).
   ═══════════════════════════════════════════════════════════════════════════ */

function arquivos(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) arquivos(p, out);
    else if (/\.(md|ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

const fontes = () =>
  RAIZES.flatMap((r) => arquivos(r)).map((arquivo) => ({
    arquivo,
    fonte: readFileSync(arquivo, "utf8"),
  }));

const LANCADAS = versoesLancadas(
  readFileSync("src/preview/pages/updates-data.ts", "utf8"),
);

/* ═══════════════════════════════════════════════════════════════════════════
   Estado atual: tem de estar limpo
   ═══════════════════════════════════════════════════════════════════════════ */

describe("version-claims — estado atual do repo", () => {
  const r = checkVersionClaims(fontes(), LANCADAS);

  it("nenhuma doc cita versão de lib que não existe no changelog", () => {
    expect(r.achados, `\n${formatar(r.achados).join("\n")}\n`).toEqual([]);
  });

  it("conferiu de fato (não passa por varredura vazia)", () => {
    // Medido em 2026-08-19: 65 versões lançadas, ~89 citações com `v` nas 4 raízes.
    expect(LANCADAS.size).toBeGreaterThan(50);
    expect(r.citacoesConferidas).toBeGreaterThan(40);
  });

  it("a versão atual do package.json está no changelog", () => {
    // Guarda contra bumpar o package e esquecer a entry — a release ficaria sem changelog.
    const atual = JSON.parse(readFileSync("package.json", "utf8")).version;
    expect(LANCADAS.has(atual), `package.json diz ${atual}, sem entry em updates-data`).toBe(
      true,
    );
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Os defeitos REAIS — o gate só está pronto reprovando estes
   ═══════════════════════════════════════════════════════════════════════════ */

describe("version-claims — reprova o que estava no repo", () => {
  const lancadas = new Set(["0.19.0", "0.19.1", "0.22.0", "0.42.1", "0.43.0"]);

  it("pega o (lib 0.42.2+) que eu publiquei — release saiu 0.43.0", () => {
    const fonte = "Formato de data — **com ano** (lib v0.42.2+). Passe `valueFormatter`.";
    const r = checkVersionClaims([{ arquivo: "generate.md", fonte }], lancadas);
    expect(r.achados).toHaveLength(1);
    expect(r.achados[0].citada).toBe("v0.42.2+");
  });

  it("pega o (v0.19.2+) do USAGE — nunca existiu, o certo era v0.22.0", () => {
    const fonte = "`col.width` é base, não trava fixa (v0.19.2+): colunas com width…";
    const r = checkVersionClaims([{ arquivo: "USAGE.md", fonte }], lancadas);
    expect(r.achados).toHaveLength(1);
    expect(r.achados[0].versao).toBe("0.19.2");
  });

  it("pega versão de CLI escrita como se fosse da lib", () => {
    const fonte = "Toast distribuído na v0.12.0 mas fora do catálogo até v0.13.7.";
    const r = checkVersionClaims([{ arquivo: "review-component.md", fonte }], lancadas);
    // as DUAS: 0.12.0 não está neste set de teste, e 0.13.7 é do CLI
    expect(r.achados.map((a) => a.versao)).toEqual(["0.12.0", "0.13.7"]);
    expect(formatar(r.achados)[1]).toContain('escreva "CLI 0.13.7"');
  });

  it("a mensagem oferece o `vNEXT` — senão manda fazer o impossível", () => {
    // O caso que gerou os DOIS erros é documentar comportamento não lançado. "corrija o
    // número" não tem saída aí: o número não existe. A mensagem tem de dar o placeholder.
    const fonte = "Em DEV sai um `console.warn` (v0.43.1+) nomeando o que foi cortado.";
    const r = checkVersionClaims([{ arquivo: "USAGE.md", fonte }], lancadas);
    expect(r.achados[0].conserto).toContain(PLACEHOLDER);
    expect(r.achados[0].conserto).toContain("ainda");
  });

  it("a forma corrigida passa", () => {
    const fonte = "Toast distribuído na v0.42.1 mas fora do catálogo até a CLI 0.13.7.";
    expect(checkVersionClaims([{ arquivo: "x.md", fonte }], lancadas).achados).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   `vNEXT` — o número não existe quando a frase é escrita
   ═══════════════════════════════════════════════════════════════════════════ */

describe("version-claims — o placeholder da próxima release", () => {
  const fonte = `Em DEV sai um \`console.warn\` (${PLACEHOLDER}) nomeando o que foi cortado.`;

  it("no npm test o `vNEXT` passa — é o estado correto de uma feature PR", () => {
    expect(checkVersionClaims([{ arquivo: "USAGE.md", fonte }], new Set()).achados).toEqual([]);
  });

  it("no release:check ele reprova — aí o número já é conhecido", () => {
    const r = checkPlaceholders([{ arquivo: "USAGE.md", fonte }]);
    expect(r.achados).toHaveLength(1);
    expect(r.achados[0]).toMatchObject({ arquivo: "USAGE.md", linha: 1, citada: PLACEHOLDER });
  });

  it("reprova o `vNEXT` no payload do consumidor também — é o que mais dói publicar", () => {
    const r = checkPlaceholders([
      { arquivo: "cli/templates/default/_claude/skills/crud-builder/generate.md", fonte },
    ]);
    expect(r.achados).toHaveLength(1);
  });

  it("sem placeholder, o modo release não inventa achado", () => {
    const limpo = "Em DEV sai um `console.warn` (v0.43.0+) nomeando o que foi cortado.";
    expect(checkPlaceholders([{ arquivo: "x.md", fonte: limpo }]).achados).toEqual([]);
    expect(checkPlaceholders([]).achados).toEqual([]);
    expect(checkPlaceholders(undefined).achados).toEqual([]);
  });

  it("a receita que MANDA substituir pode citar o placeholder", () => {
    // Sem isso o gate reprovava a própria instrução que resolve o achado.
    const r = checkPlaceholders([
      { arquivo: DONO_DA_CONVENCAO, fonte: `### 6.2a Trocar \`${PLACEHOLDER}\` pelo número` },
    ]);
    expect(r.achados).toEqual([]);
  });

  it("…e a exceção é SÓ ela — outra skill citando o placeholder reprova", () => {
    const r = checkPlaceholders([
      { arquivo: ".claude/skills/crud-builder/generate.md", fonte: `avisa (${PLACEHOLDER})` },
      { arquivo: ".claude/skills/ds-dev/impl-igreen.md", fonte: `desde ${PLACEHOLDER}` },
    ]);
    expect(r.achados).toHaveLength(2);
  });

  it("o dono da convenção existe de fato no disco", () => {
    // Path que não existe = exceção que nunca casa; o gate reprovaria a receita em silêncio.
    expect(existsSync(DONO_DA_CONVENCAO)).toBe(true);
    expect(readFileSync(DONO_DA_CONVENCAO, "utf8")).toContain(PLACEHOLDER);
  });

  it("as RAIZES são as do módulo — o CLI do release varre as mesmas", () => {
    // Se alguém acrescentar raiz só num dos dois, o gate cobre metade do repo em silêncio.
    expect(RAIZES).toContain("cli/templates/default/_claude");
    expect(RAIZES.length).toBeGreaterThanOrEqual(4);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   O que NÃO deve reprovar — foi medido, e é o que decide o desenho da regra
   ═══════════════════════════════════════════════════════════════════════════ */

describe("version-claims — o ruído que a forma sem `v` traria", () => {
  const lancadas = new Set(["0.43.0"]);

  it("critério de acessibilidade não é versão", () => {
    const fonte = "Icon-only sem label viola WCAG 4.1.2. E o SC 1.4.11 pede 3:1.";
    expect(checkVersionClaims([{ arquivo: "USAGE.md", fonte }], lancadas).achados).toEqual([]);
  });

  it("exemplo de semver em tabela de bump não é afirmação", () => {
    const fonte = "| `breaking` presente | MAJOR | 0.3.0 → 1.0.0 |\n| added | MINOR (1.0.0 → 1.1.0) |";
    expect(checkVersionClaims([{ arquivo: "release.md", fonte }], lancadas).achados).toEqual([]);
  });

  it("versão de dependência npm não é afirmação sobre o DS", () => {
    const fonte = 'traz `lucide-react@^1.32.0` e `d3-geo@3.1.1` como dependência';
    expect(checkVersionClaims([{ arquivo: "USAGE.md", fonte }], lancadas).achados).toEqual([]);
  });

  it("mas com `v` ela é conferida — o `v` é o marcador de release", () => {
    const fonte = "disponível desde a v9.9.9";
    expect(checkVersionClaims([{ arquivo: "x.md", fonte }], lancadas).achados).toHaveLength(1);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Fronteiras
   ═══════════════════════════════════════════════════════════════════════════ */

describe("version-claims — fronteiras", () => {
  it("extrai as versões do formato real do updates-data", () => {
    const s = `RELEASES = [
      { version: "0.43.0", date: "2026-08-19" },
      { version: "0.42.1", date: "2026-08-18" },
    ]`;
    expect([...versoesLancadas(s)].sort()).toEqual(["0.42.1", "0.43.0"]);
  });

  it("reporta linha e arquivo, pra o achado ser acionável", () => {
    const fonte = "linha 1\nlinha 2 com v9.9.9\nlinha 3";
    const r = checkVersionClaims([{ arquivo: "a/b.md", fonte }], new Set());
    expect(r.achados[0]).toMatchObject({ arquivo: "a/b.md", linha: 2 });
  });

  it("entrada vazia não lança", () => {
    expect(checkVersionClaims([], new Set()).achados).toEqual([]);
    expect(checkVersionClaims(undefined, new Set()).achados).toEqual([]);
    expect(versoesLancadas("").size).toBe(0);
  });

  it("várias citações na mesma linha são todas conferidas", () => {
    const fonte = "de v1.1.1 até v2.2.2";
    expect(checkVersionClaims([{ arquivo: "x.md", fonte }], new Set()).achados).toHaveLength(2);
  });
});
