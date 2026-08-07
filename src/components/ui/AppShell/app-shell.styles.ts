import { tv } from "@/utils/tv";

/**
 * Slots do `<AppShell>` template.
 *
 * Layout 2-column: sidebar à esquerda (fixa, full-height) + main area
 * à direita (Header sticky no topo + body abaixo).
 *
 * Body recebe `gap-gp-4xl` (24px) fixo e padding responsivo em 3 patamares
 * (18 / 24 / 32px — ver `bodyInner`) por design — slot "padronizado" pra todas
 * as telas. Consumer customiza só os filhos.
 */

export const root = tv({
  base: [
    "flex h-screen w-full bg-bg-canvas",
    "overflow-hidden", // garante que sidebar + main não vazem viewport
  ],
});

/** Wrapper da área principal (Header + Body). Ocupa o resto do flex row. */
export const main = tv({
  base: [
    "flex flex-col flex-1 min-w-0",
    "overflow-hidden",
  ],
});

/**
 * Body slot — wrapper externo do conteúdo da tela. Gerencia scroll.
 * `min-h-0` permite o body shrink dentro do flex pai pra scroll interno
 * funcionar (children podem ter `overflow-auto` ou `flex-1 min-h-0` próprio).
 *
 * O padding + gap + max-width ficam no `bodyInner` (slot interno) — assim
 * o scroll continua na viewport inteira mesmo em layout=compact.
 */
export const body = tv({
  base: [
    "flex flex-col flex-1 min-h-0",
    "overflow-auto scrollbar-thin",
  ],
});

/**
 * Wrapper interno do body — controla padding, gap entre filhos e o max-width
 * conforme `layout`.
 *
 *   - `fluid`   (default): ocupa 100% da largura disponível (atual)
 *   - `compact`: max-width 1368px (`--container-main-content-max`), centralizado
 *
 * Padding por faixa de viewport — 3 patamares, não 2:
 *
 *   < 768px   (max-md)   18px  — telas pequenas precisam respiro mínimo mas não
 *                               zero (chat/navegação por overlays usam o
 *                               bodyInner cheio).
 *   768–1535  (max-2xl)  24px  — NOTEBOOK. Até 2026-08-04 esta faixa herdava os
 *                               32px do desktop: um 1366×768 gastava a mesma
 *                               moldura de um 4K, com muito menos área útil.
 *                               O corte é em `2xl` (1536) e não em `xl` (1280)
 *                               porque 1366 e 1536 são as duas resoluções de
 *                               notebook dominantes — cortar em `xl` deixaria a
 *                               1536 de fora justamente onde aperta.
 *   ≥ 1536px             32px  — desktop, valor original preservado.
 *
 * ⚠️ `max-md:` tem que vencer `max-2xl:` abaixo de 768px. Vence por ordem de
 * fonte: o Tailwind emite as variantes `max-*` em breakpoint DECRESCENTE, então
 * a regra `max-md` sai depois da `max-2xl` com a mesma especificidade. Medido no
 * browser nos 3 patamares, não deduzido — é a classe de erro da L-066.
 */
export const bodyInner = tv({
  base: [
    "flex flex-col flex-1 min-h-0 w-full mx-auto",
    "gap-gp-4xl p-pad-6xl max-2xl:p-pad-4xl",
  ],
  variants: {
    layout: {
      fluid: "max-w-full",
      compact: "max-w-[var(--container-main-content-max)]",
    },
    /**
     * Em mobile (<md):
     *   - `false` (default): padding reduzido pra 18px (telas pequenas
     *     precisam respiro mínimo).
     *   - `true`: padding zero — útil pra patterns "app feel" (chat,
     *     navegação por overlays fullscreen) onde a page controla o
     *     próprio padding interno.
     */
    mobileEdgeToEdge: {
      true: "max-md:p-0",
      false: "max-md:p-[18px]",
    },
  },
  defaultVariants: {
    layout: "fluid",
    mobileEdgeToEdge: false,
  },
});
