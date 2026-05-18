import { tv } from "@/utils/tv";

/**
 * Slots do `<AppShell>` template.
 *
 * Layout 2-column: sidebar à esquerda (fixa, full-height) + main area
 * à direita (Header sticky no topo + body abaixo).
 *
 * Body recebe `gap-gp-4xl` (24px) e `p-pad-6xl` (32px) por design — slot
 * "padronizado" pra todas as telas. Consumer customiza só os filhos.
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
 * Mobile (<md): padding reduzido pra 18px — telas pequenas precisam respiro
 * mínimo mas não zero (chat/navegação por overlays usam o bodyInner cheio).
 */
export const bodyInner = tv({
  base: [
    "flex flex-col flex-1 min-h-0 w-full mx-auto",
    "gap-gp-4xl p-pad-6xl",
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
