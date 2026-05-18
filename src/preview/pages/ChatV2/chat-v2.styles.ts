import { tv } from "@/utils/tv";

/**
 * Layout root da página Chat V2 — 4 colunas side-by-side em desktop,
 * fullscreen overlays em mobile (<md), controladas por `mobileView`.
 */
export const chatV2Styles = tv({
  slots: {
    /** Body do AppShell — flex row com gap entre colunas. `relative` pra mobile overlays. */
    root: "flex flex-1 min-h-0 gap-gp-2xl relative",
    /** Wrapper dos filtros (col 1) — escondido em mobile. */
    filtersWrap: "hidden md:contents",
  },
});

/**
 * Helpers de className pros 3 estados de mobile view (list/chat/details).
 * Cada coluna recebe a classe correspondente; em desktop ficam sem efeito.
 */
export const mobileOverlay = {
  active: "max-md:absolute max-md:inset-0 max-md:w-full max-md:rounded-radius-none max-md:border-0",
  hidden: "max-md:hidden",
} as const;
