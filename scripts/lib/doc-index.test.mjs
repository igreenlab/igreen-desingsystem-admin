import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  headings,
  slug,
  buildIndice,
  aplicarIndice,
  INDEXADOS,
  INICIO,
  FIM,
} from "./doc-index.mjs";

describe("doc-index — parsing", () => {
  it("pega H2 e ignora H3 quando nivel=2", () => {
    expect(headings("## a\n### b\n## c", 2).map((h) => h.texto)).toEqual(["a", "c"]);
  });

  it("ignora heading dentro de bloco de código", () => {
    // Doc do repo é cheio de exemplo com `## algo` dentro de fence — contá-lo geraria
    // link pra âncora que não existe.
    const txt = "## real\n```md\n## falso\n```\n## real2";
    expect(headings(txt, 2).map((h) => h.texto)).toEqual(["real", "real2"]);
  });

  it("ignora o próprio índice ao recalcular — senão ele se aninha a cada rodada", () => {
    const comIndice = `# T\n${INICIO}\n\n**Índice**\n\n- [x](#x)\n\n${FIM}\n\n## x`;
    expect(headings(comIndice, 2).map((h) => h.texto)).toEqual(["x"]);
  });

  it("slug PRESERVA acento (o GitHub não remove) e derruba pontuação", () => {
    expect(slug("Tipografia avulsa")).toBe("tipografia-avulsa");
    expect(slug("`container` não dobra prefixo")).toBe("container-não-dobra-prefixo");
    expect(slug("Dark mode (4 regras combinadas)")).toBe("dark-mode-4-regras-combinadas");
  });
});

describe("doc-index — aplicação", () => {
  it("insere depois do H1 e do blockquote de abertura", () => {
    const { texto, mudou } = aplicarIndice("# Título\n\n> nota de contexto\n\n## a\n\n## b");
    expect(mudou).toBe(true);
    const linhas = texto.split("\n");
    expect(linhas[0]).toBe("# Título");
    // o índice não fica ANTES da nota de abertura
    expect(linhas.findIndex((l) => l.includes(INICIO))).toBeGreaterThan(
      linhas.findIndex((l) => l.startsWith("> nota")),
    );
  });

  it("é idempotente — rodar 2× não muda nada nem aninha o bloco", () => {
    const base = "# T\n\n## a\n\n## b";
    const um = aplicarIndice(base).texto;
    const dois = aplicarIndice(um);
    expect(dois.mudou).toBe(false);
    expect(dois.texto).toBe(um);
    expect(um.split(INICIO).length - 1, "um único bloco").toBe(1);
  });

  it("detecta defasagem quando um heading é renomeado", () => {
    const comIndice = aplicarIndice("# T\n\n## antigo").texto;
    const renomeado = comIndice.replace("## antigo", "## novo");
    expect(aplicarIndice(renomeado).mudou).toBe(true);
  });

  it("preserva o EOL do arquivo (o repo é CRLF)", () => {
    const { texto } = aplicarIndice("# T\r\n\r\n## a", 2, "\r\n");
    expect(texto).toContain("\r\n");
    expect(/[^\r]\n/.test(texto), "não deve sobrar LF solto").toBe(false);
  });

  it("estoura em marcador de início sem fim, em vez de gerar lixo", () => {
    expect(() => aplicarIndice(`# T\n${INICIO}\n## a`)).toThrow(/sem fim/);
  });
});

describe("doc-index — o repo hoje", () => {
  it("todo arquivo indexado está em sync com os próprios headings", () => {
    for (const { arquivo, nivel } of INDEXADOS) {
      const original = readFileSync(arquivo, "utf8");
      const eol = original.includes("\r\n") ? "\r\n" : "\n";
      const { mudou } = aplicarIndice(original, nivel, eol);
      expect(mudou, `${arquivo}: índice defasado → node scripts/doc-index.mjs --write`).toBe(false);
    }
  });

  it("nenhum auto-carregado entrou na lista", () => {
    // Índice é ferramenta de LEITURA PARCIAL. CLAUDE.md e ds-standards.md chegam
    // INTEIROS no contexto de toda sessão: ali o índice não ajuda a achar nada e
    // adiciona tokens ao arquivo mais caro do repo — o oposto do item D1.
    const proibidos = ["CLAUDE.md", ".claude/rules/ds-standards.md"];
    for (const p of proibidos) {
      expect(
        INDEXADOS.some((i) => i.arquivo === p),
        `${p} é project instruction — índice ali é custo puro`,
      ).toBe(false);
    }
  });

  it("todo indexado tem motivo declarado e é RASTREADO pelo git", () => {
    // "Existe no disco" não basta, e isso foi medido: o `DESIGN.md` da raiz entrou na
    // primeira versão da lista e está no `.gitignore` — o índice nele não seria
    // commitado, e este teste passaria aqui e quebraria com ENOENT em clone limpo e
    // no CI. `git ls-files` é o critério certo.
    expect(INDEXADOS.length).toBeGreaterThan(0);
    for (const { arquivo, motivo } of INDEXADOS) {
      expect(String(motivo).length, `${arquivo} sem motivo`).toBeGreaterThan(20);
      const rastreado = execFileSync("git", ["ls-files", "--", arquivo], { encoding: "utf8" }).trim();
      expect(rastreado, `${arquivo} não é rastreado pelo git — índice nele não viaja`).not.toBe("");
    }
  });

  it("o índice gerado não inventa âncora — todo link aponta pra heading real", () => {
    for (const { arquivo, nivel } of INDEXADOS) {
      const txt = readFileSync(arquivo, "utf8");
      const ancorasReais = new Set(headings(txt, nivel).map((h) => slug(h.texto)));
      const bloco = buildIndice(txt, nivel);
      const links = [...bloco.matchAll(/\]\(#([^)]+)\)/g)].map((m) => m[1]);
      expect(links.length, `${arquivo}: índice vazio?`).toBeGreaterThan(0);
      for (const a of links) {
        expect(ancorasReais.has(a), `${arquivo}: âncora #${a} não corresponde a heading`).toBe(true);
      }
    }
  });
});
