/**
 * tooltip-contrast — a bolha da tooltip precisa ser ACHÁVEL sobre qualquer
 * superfície, inclusive a que está em hover.
 *
 * ## O defeito (item 32 do Sólis / Task 14)
 *
 * A tooltip pintava `bg-bg-emphasis`, que é um cinza NEUTRO da mesma família
 * das superfícies: `gray[100]` (L 0.94) no claro, e 12% de branco — translúcido
 * — no escuro. Medido no browser, a borda da bolha contra o que está atrás:
 *
 *   claro   1,19:1 sobre o card em repouso · **1,10:1 sobre o card em hover**
 *   escuro  1,44:1 nos dois
 *
 * A WCAG 1.4.11 pede **3:1** pro limite de um componente de UI. 1,10 é a bolha
 * sumindo — que é exatamente o relato ("tooltip sobre card em hover some no
 * tema claro"). O texto DENTRO da bolha sempre esteve bem (16,5:1); o que
 * faltava era a bolha.
 *
 * ## Onde a cor morava (a âncora que não resolvia)
 *
 * `grep tooltip` em `color-light.ts` dá **zero**: não havia token de cor
 * chamado tooltip. Os únicos "tooltip" nos tokens são largura
 * (`components/sizing.ts`) e z-index (`elevation.ts`). A cor vinha de
 * `src/components/shadcn/tooltip.tsx` escrevendo `bg-bg-emphasis` —
 * um token compartilhado com o track do Switch, do Slider, do Progress e com
 * o Badge secondary, que por isso não podia ser alterado no lugar.
 *
 * ## Por que o teste mede o CSS GERADO, e não o `.ts`
 *
 * L-066: na marca `vibrant` a medição sobre os arquivos de token passou 10/10
 * enquanto 13 tokens renderizavam o valor do modo errado. O artefato que os 4
 * canais leem é `tailwind-theme.css` — é ele que precisa estar certo, nos DOIS
 * blocos (`@theme` e `.dark`).
 *
 * A conversão OKLCH→sRGB vem do `scripts/brand-contrast.mjs`, que é o
 * instrumento do repo; aqui só se compõe o alpha, que ele não trata.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { contrastRatio, toHex } from "../brand-contrast.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CSS = readFileSync(join(RAIZ, "src/styles/theme/tailwind-theme.css"), "utf8");

/** Limiar da WCAG 1.4.11 pro LIMITE de um componente de UI. */
const LIMIAR_UI = 3;
/** Limiar AA pra texto normal. */
const LIMIAR_TEXTO = 4.5;

/**
 * Valor de uma var no bloco pedido.
 *
 * `light` = o `@theme { … }` que carrega as cores; `dark` = o `.dark { … }`.
 * Busca pela ÚLTIMA ocorrência no bloco certo em vez de pela primeira do
 * arquivo: as duas declarações do mesmo nome existem, e pegar a primeira
 * devolveria sempre o claro — o erro que faria o teste do dark passar por
 * acidente.
 */
function corDoTema(nome, modo) {
  const iDark = CSS.indexOf("\n.dark {");
  if (iDark === -1) throw new Error("bloco `.dark` não encontrado no tema gerado");
  const trecho = modo === "dark" ? CSS.slice(iDark) : CSS.slice(0, iDark);
  const re = new RegExp(`--color-${nome}\\s*:\\s*([^;]+);`, "g");
  const achados = [...trecho.matchAll(re)].map((m) => m[1].trim());
  if (achados.length === 0) {
    throw new Error(`--color-${nome} não existe no bloco ${modo} do tema gerado`);
  }
  return achados[achados.length - 1];
}

/**
 * Separa cor-base e alpha. O tema escreve translucidez de DUAS formas, e as
 * duas aparecem nos tokens que esta medição toca:
 *   `oklch(1 0 0 / 0.03)`                                — alpha no slash
 *   `color-mix(in oklch, oklch(1 0 0) 12%, transparent)` — alpha pela mistura
 * Tratar só a primeira faria o `bg-emphasis` do dark passar como OPACO, que é
 * precisamente metade do defeito sob medição.
 */
function decompor(cor) {
  const mix = /^color-mix\(\s*in\s+[a-z-]+\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/i.exec(
    cor.trim(),
  );
  if (mix) return { base: mix[1], alpha: parseFloat(mix[2]) / 100 };
  const slash = /\/\s*([\d.]+%?)\s*\)\s*$/.exec(cor);
  if (slash) {
    const a = slash[1].endsWith("%") ? parseFloat(slash[1]) / 100 : parseFloat(slash[1]);
    return { base: cor, alpha: a };
  }
  return { base: cor, alpha: 1 };
}

const alphaDe = (cor) => decompor(cor).alpha;

const hexParaRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];
const rgbParaHex = (rgb) =>
  "#" +
  rgb
    .map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0"))
    .join("");

/** `frente` sobre `fundoHex`, respeitando o alpha da frente. Devolve hex. */
function sobre(frente, fundoHex) {
  const { base, alpha } = decompor(frente);
  const f = hexParaRgb(toHex(base));
  const b = hexParaRgb(fundoHex);
  return rgbParaHex(f.map((c, i) => c * alpha + b[i] * (1 - alpha)));
}

/**
 * As três superfícies sobre as quais uma tooltip pode cair, por modo.
 * O "card em hover" é `bg-subtle` — o que o `Kpi` (e o `Card` clicável) usam
 * em `hover:`, e o caso exato do relato.
 */
function superficies(modo) {
  const canvas = toHex(corDoTema("bg-canvas", modo));
  const card = sobre(corDoTema("bg-surface", modo), canvas);
  const cardHover = sobre(corDoTema("bg-subtle", modo), card);
  return { canvas, card, cardHover };
}

describe.each(["light", "dark"])("tooltip — contraste da bolha (%s)", (modo) => {
  it("a bolha é OPACA — tooltip translúcida deixa o conteúdo de trás atravessar", () => {
    expect(alphaDe(corDoTema("bg-tooltip", modo))).toBe(1);
  });

  it.each(["canvas", "card", "cardHover"])(
    "a bolha se distingue da superfície (%s) por pelo menos 3:1",
    (qual) => {
      const fundo = superficies(modo)[qual];
      const bolha = sobre(corDoTema("bg-tooltip", modo), fundo);
      expect(contrastRatio(bolha, fundo)).toBeGreaterThanOrEqual(LIMIAR_UI);
    },
  );

  it("o texto dentro da bolha passa o AA de texto normal", () => {
    const bolha = sobre(corDoTema("bg-tooltip", modo), superficies(modo).card);
    const texto = sobre(corDoTema("fg-on-tooltip", modo), bolha);
    expect(contrastRatio(texto, bolha)).toBeGreaterThanOrEqual(LIMIAR_TEXTO);
  });

  /* ── O CAMINHO ANTIGO, medido: o instrumento enxerga o defeito ──────────
     Sem isto, os limiares acima passariam sem provar nada — um teste que só
     aprova o valor novo concorda por construção (L-064). Aqui o token ANTIGO
     é medido pelo MESMO caminho e precisa REPROVAR. */
  it("o token antigo (bg-emphasis) reprovava sobre o card em HOVER — era o defeito", () => {
    const fundo = superficies(modo).cardHover;
    const antiga = sobre(corDoTema("bg-emphasis", modo), fundo);
    expect(contrastRatio(antiga, fundo)).toBeLessThan(LIMIAR_UI);
  });
});

describe("tooltip — o token não vazou pra quem compartilhava o antigo", () => {
  it("bg-emphasis continua existindo e com o valor de sempre", () => {
    // Switch, Slider, Progress e Badge secondary pintam `bg-bg-emphasis`.
    // Trocar o VALOR dele (em vez de criar o token da tooltip) teria mexido
    // nos quatro — por isso a correção é um token novo, não uma edição.
    expect(corDoTema("bg-emphasis", "light")).toBe("oklch(0.94 0 0)");
    expect(alphaDe(corDoTema("bg-emphasis", "dark"))).toBeLessThan(1);
  });
});
