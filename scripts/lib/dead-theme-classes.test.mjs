import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { deadThemeClasses } from "./dead-theme-classes.mjs";

/* Dois grupos, por razões diferentes:

   1. "contra o repo real" — o gate. Roda no `npm test` do CI, então uma classe
      de cor inexistente reprova a PR. Fonte real e não fixture: o defeito que
      importa é o código e o tema DIVERGIREM no futuro, e só dado real detecta.

   2. "classes de falha" — prova que o check enxerga o defeito E que não acusa
      código correto. O segundo caso é o que quase deu errado: sem a fronteira
      à direita, `border-border-warning` casa dentro de
      `border-border-warning-muted` e ~40 arquivos bons reprovam. */

const CSS = readFileSync("src/styles/theme/tailwind-theme.css", "utf8");

const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const FONTES = walk("src")
  .filter((f) => /\.(ts|tsx|md)$/.test(f))
  .map((f) => ({ file: f.split(sep).join("/"), text: readFileSync(f, "utf8") }));

describe("classes de cor do DS × tema gerado (repo real)", () => {
  it("toda classe de cor usada em src/ tem CSS var correspondente", () => {
    const { mortas } = deadThemeClasses(CSS, FONTES);
    // Mensagem legível na falha: classe + onde, não só a contagem.
    expect(mortas.map((m) => `${m.classe} — ${m.file}:${m.line}`)).toEqual([]);
  });

  // Guarda contra o check virar vacuously-true: se o regex parasse de casar
  // nada, ou o CSS viesse vazio, o teste acima passaria sem medir.
  it("está medindo o repo inteiro, não um subconjunto vazio", () => {
    const { varsConhecidas, usosVarridos } = deadThemeClasses(CSS, FONTES);
    expect(varsConhecidas).toBeGreaterThan(50);
    expect(usosVarridos).toBeGreaterThan(1000);
  });
});

describe("dead-theme-classes — o defeito que pega e o que NÃO acusa", () => {
  const css = `@theme {
    --color-ring-brand: #000;
    --color-border-warning-muted: #111;
    --color-fg-danger: #222;
  }`;

  it("acusa classe cuja var não existe (o caso ring-ring-primary)", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "a.ts", text: `"focus-visible:ring-4 focus-visible:ring-ring-primary"` },
    ]);
    expect(mortas).toEqual([{ classe: "ring-ring-primary", file: "a.ts", line: 1 }]);
  });

  it("NÃO acusa a classe correta cujo nome contém uma inexistente como prefixo", () => {
    // `border-border-warning` não existe; `border-border-warning-muted` existe.
    // Sem fronteira à direita, este teste falha — foi o bug real do instrumento.
    const { mortas } = deadThemeClasses(css, [
      { file: "b.ts", text: `"border border-border-warning-muted"` },
    ]);
    expect(mortas).toEqual([]);
  });

  it("aceita modificador de opacidade sem confundir o nome da var", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "c.ts", text: `"border-border-warning-muted/50"` },
    ]);
    expect(mortas).toEqual([]);
  });

  it("acusa dentro de variante (dark:, hover:, focus-visible:)", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "d.ts", text: `"dark:text-fg-critical hover:text-fg-danger"` },
    ]);
    expect(mortas.map((m) => m.classe)).toEqual(["text-fg-critical"]);
  });

  it("reporta linha certa em arquivo multi-linha", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "e.ts", text: `ok\n"bg-bg-nao-existe"\nok` },
    ]);
    expect(mortas).toEqual([{ classe: "bg-bg-nao-existe", file: "e.ts", line: 2 }]);
  });
});
