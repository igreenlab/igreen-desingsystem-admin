import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { EQUIVALENTE, VOCAB_SHADCN, shadcnVocab } from "./shadcn-vocab.mjs";

/* Três grupos:

   1. "premissa" — prova que as 19 chaves REALMENTE não existem no tema gerado. Se um
      dia alguma passar a existir, o gate estaria acusando código correto, e este teste
      falha antes disso.

   2. "repo real" — o gate. Componente distribuído usando vocabulário da bridge reprova
      a PR.

   3. "mecanismo" — enxerga o defeito e não acusa código bom. */

const CSS = readFileSync("src/styles/theme/tailwind-theme.css", "utf8");

const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const COMPONENTES = walk("src/components")
  .filter((f) => /\.tsx?$/.test(f))
  .map((f) => ({ file: f.split(sep).join("/"), text: readFileSync(f, "utf8") }));

describe("vocabulário shadcn em componente distribuído", () => {
  it("premissa: nenhuma das 19 chaves da bridge existe no tema gerado", () => {
    // É o que torna a regra válida: essas vars só existem via `globals.css`/`index.css`,
    // que não viajam pros canais npm e submódulo.
    const noTema = new Set([...CSS.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    expect(VOCAB_SHADCN.filter((v) => noTema.has(v))).toEqual([]);
  });

  it("todo componente usa token DS, não vocabulário da bridge", () => {
    const { usos } = shadcnVocab(COMPONENTES);
    expect(
      usos.map((u) => `${u.classe} — ${u.file}:${u.line}  → use ${u.sugestao}`),
    ).toEqual([]);
  });

  it("está medindo os componentes, não um conjunto vazio", () => {
    expect(COMPONENTES.length).toBeGreaterThan(100);
  });
});

describe("shadcn-vocab — o defeito que pega e o que NÃO acusa", () => {
  it("reproduz o defeito REAL do Card (L-064)", () => {
    // Texto literal que estava em `shadcn/card.tsx` até 2026-08-08. No consumidor npm
    // o `ring-foreground/5` virava `currentColor` SÓLIDO — o `/5` some junto, porque
    // não há cor à qual aplicar o alpha. O mantenedor viu num print; o pipeline não.
    const antes = `"bg-bg-surface shadow-sh-lg ring-1 ring-foreground/5 dark:ring-foreground/10"`;
    const { usos } = shadcnVocab([{ file: "card.tsx", text: antes }]);
    expect(usos.map((u) => u.classe)).toEqual(["ring-foreground/5", "ring-foreground/10"]);
    expect(usos[0].sugestao).toContain("fg-default");

    // O texto corrigido passa — e o valor computado é o MESMO (a bridge resolvia
    // `foreground` justamente pra `--color-fg-default`).
    const depois = `"bg-bg-surface shadow-sh-lg ring-1 ring-fg-default/5 dark:ring-fg-default/10"`;
    expect(shadcnVocab([{ file: "card.tsx", text: depois }]).usos).toEqual([]);
  });

  it("NÃO acusa o token DS cujo nome CONTÉM uma chave da bridge", () => {
    // `bg-bg-muted` contém "muted"; `border-border-default` contém "border";
    // `text-fg-muted` contém "muted". Sem as fronteiras, ~todo componente reprovava.
    const bom = `"bg-bg-muted border-border-default text-fg-muted ring-ring-brand bg-bg-muted-hover border-border-danger-muted"`;
    expect(shadcnVocab([{ file: "ok.tsx", text: bom }]).usos).toEqual([]);
  });

  it("NÃO acusa citação em comentário", () => {
    const texto = `// bg-popover e text-muted-foreground dependem da bridge — não usar\nconst x = "bg-bg-dropdown";`;
    expect(shadcnVocab([{ file: "c.tsx", text: texto }]).usos).toEqual([]);
  });

  it("acusa dentro de variante (dark:, hover:)", () => {
    const { usos } = shadcnVocab([{ file: "d.tsx", text: `"dark:bg-background hover:bg-bg-muted"` }]);
    expect(usos.map((u) => u.classe)).toEqual(["bg-background"]);
  });

  it("toda chave tem equivalente DS mapeado — a mensagem de erro é acionável", () => {
    for (const chave of VOCAB_SHADCN) {
      expect(EQUIVALENTE[chave], `sem equivalente para "${chave}"`).toBeTruthy();
    }
  });
});
