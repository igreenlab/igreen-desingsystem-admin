/**
 * As constantes de largura do cabeçalho do DataTable × os tokens e classes que as geram.
 *
 * `calculate-column-widths.ts` mede o stack de ações do cabeçalho (sort + funil + menu)
 * com números — 28, 12, 4, 12 — que são, na verdade, classes do `Table` e do `Button`
 * convertidas por tokens. Trocar o token (ou a classe) sem trocar o número não derruba
 * nada: o `tsc` passa, os testes de largura passam (eles usam o número), e o botão volta a
 * transbordar da coluna estreita — o defeito que o piso das ações existe pra evitar.
 *
 * Fica em `scripts/` e não ao lado do `header-acoes.test.tsx` porque lê o tema gerado, e o
 * vitest roda com `css: false`: um `?raw` de `.css` devolve string vazia.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const FONTE = "src/components/ui/DataTable/utils/calculate-column-widths.ts";
const TEMA = "src/styles/theme/tailwind-theme.css";
const TABELA = "src/components/ui/Table/table.styles.ts";
const BOTAO = "src/components/ui/Button/button.styles.ts";

const ler = (p) => readFileSync(p, "utf8");

/** Valor numérico de `export const NOME = 28;` na fonte. */
const constante = (nome) => {
  const m = ler(FONTE).match(new RegExp(`export const ${nome}\\s*=\\s*(\\d+)\\s*;`));
  if (!m) throw new Error(`constante ${nome} não encontrada em ${FONTE}`);
  return Number(m[1]);
};

/** Valor em px de `--spacing-<token>` no tema gerado. */
const token = (nome) => {
  const m = ler(TEMA).match(new RegExp(`--spacing-${nome}:\\s*(\\d+)px`));
  if (!m) throw new Error(`token --spacing-${nome} não encontrado em ${TEMA}`);
  return Number(m[1]);
};

describe("header-widths-sync — as constantes valem os tokens", () => {
  it("botão do funil/menu = size-form-xs (Button size=icon-2xs)", () => {
    expect(constante("HEADER_ACTION_BUTTON_PX")).toBe(token("form-xs"));
  });

  it("ícone de sort = size-icon-xs", () => {
    expect(constante("HEADER_SORT_ICON_PX")).toBe(token("icon-xs"));
  });

  it("espaço entre sort e botões = gap-gp-xs", () => {
    expect(constante("HEADER_STACK_GAP_PX")).toBe(token("gp-xs"));
  });

  it("folga do stack = right-pad-md + pl-pad-xs", () => {
    expect(constante("HEADER_STACK_INSET_PX")).toBe(token("pad-md") + token("pad-xs"));
  });
});

describe("header-widths-sync — as classes que geram esses tokens continuam as mesmas", () => {
  it("headRightStack usa right-pad-md, gap-gp-xs e pl-pad-xs", () => {
    const css = ler(TABELA);
    const bloco = css.slice(css.indexOf("headRightStack:"), css.indexOf("headSortActive:"));
    expect(bloco.length).toBeGreaterThan(0);
    for (const classe of ["right-pad-md", "gap-gp-xs", "pl-pad-xs"]) {
      expect(bloco).toContain(classe);
    }
  });

  it("o ícone de sort é size-icon-xs", () => {
    expect(ler(TABELA)).toMatch(/sortIcon:\s*\[\s*"shrink-0 size-icon-xs"/);
  });

  it("Button icon-2xs é size-form-xs", () => {
    expect(ler(BOTAO)).toMatch(/"icon-2xs":\s*"size-form-xs /);
  });
});
