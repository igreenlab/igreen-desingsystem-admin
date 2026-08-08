import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * O `tailwind-theme.css` é o ÚNICO arquivo que os 3 canais de consumidor leem
 * (npm via `theme.css`, copy-in/scaffold via `styles/theme/`, submódulo por caminho
 * relativo). Tudo que TODO consumidor precisa pra renderizar igual ao showcase tem
 * que estar nele.
 *
 * ## Por que este teste existe
 *
 * Até 2026-08-07 essas peças moravam em `src/styles/globals.css` (showcase) e em
 * `cli/templates/default/src/index.css` (scaffold) — dois arquivos mantidos à mão
 * que deveriam ser equivalentes e derivaram. Medido, seguindo a doc de cada canal:
 *
 *   - npm:       9 regras CSS geradas. Button transparente, 24px, radius 0.
 *   - submódulo: a doc manda importar SÓ o tailwind-theme.css → mesmos gaps
 *   - scaffold:  ok — e é essa cópia paralela que mascarava o problema
 *
 * Nenhum gate pegava: tsc, testes, lint e `dead-theme-classes` passam todos com o
 * consumidor sem fonte, sem dark por classe e com fundo branco no dark mode.
 *
 * Escopo: presença no artefato gerado. Se a regra RESOLVE no browser é a Fase 5 do
 * brand-builder / verificação manual — não dá pra afirmar pixel a partir de string.
 */
const TEMA = "src/styles/theme/tailwind-theme.css";
const BAKED = "cli/templates/default/src/styles/theme/tailwind-theme.css";
const GLOBALS = "src/styles/globals.css";

/** Cada peça: nome legível + regex + por que o consumidor quebra sem ela. */
const PECAS = [
  { nome: "@font-face Geist", re: /@font-face\s*\{[^}]*Geist/, sem: "tipografia inteira cai em system-ui" },
  { nome: "--font-sans", re: /--font-sans:\s*'Geist'/, sem: "os 27 presets tipográficos usam a fonte errada" },
  { nome: "@custom-variant dark", re: /@custom-variant\s+dark/, sem: "`dark:` fica preso ao prefers-color-scheme do SO" },
  { nome: "body background/color", re: /^body\s*\{[\s\S]*?background-color:\s*var\(--color-bg-canvas\)/m, sem: "no dark, card escuro sobre fundo BRANCO" },
  { nome: "button cursor", re: /button\s*\{[\s\S]*?cursor:\s*pointer/, sem: "botão sem cursor de mão" },
  { nome: "@utility outline-float", re: /@utility\s+outline-float/, sem: "14 componentes flutuantes sem o halo" },
  { nome: "bottom-sheet mobile", re: /\[data-radix-popper-content-wrapper\]:has/, sem: "menu mobile não cola no rodapé (L-030)" },
];

describe("runtime base — o tema gerado leva tudo que o consumidor precisa", () => {
  const tema = readFileSync(TEMA, "utf8");

  for (const { nome, re, sem } of PECAS) {
    it(`inclui ${nome}`, () => {
      expect(re.test(tema), `sem isto: ${sem}`).toBe(true);
    });
  }

  it("o baked do CLI é idêntico à fonte (senão o scaffold nasce defasado)", () => {
    const norm = (s) => s.replace(/\r/g, "");
    expect(norm(readFileSync(BAKED, "utf8"))).toBe(norm(tema));
  });
});

describe("runtime base — o globals.css não duplica", () => {
  const globals = readFileSync(GLOBALS, "utf8");

  it("não redeclara @custom-variant dark", () => {
    // Declarar duas vezes faz a SEGUNDA vencer (medido no Tailwind 4.3). Como o
    // globals importa o tema no topo, uma redeclaração aqui mudaria a
    // especificidade do `dark:` no showcase sem ninguém perceber — e é a diferença
    // entre `hover:` funcionar e morrer.
    expect((globals.match(/^@custom-variant\s+dark/gm) ?? [])).toEqual([]);
  });

  it("não redeclara @font-face nem as utilities do tema", () => {
    expect(/^@font-face/m.test(globals), "@font-face duplicado").toBe(false);
    expect(/^@utility\s+outline-float/m.test(globals), "outline-float duplicado").toBe(false);
  });

  it("não redeclara body/html base", () => {
    // O showcase os recebe pelo @import do tema (linha 3).
    expect(/^body\s*\{/m.test(globals), "body duplicado").toBe(false);
  });
});
