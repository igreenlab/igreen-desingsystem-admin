import { tv } from "@/utils/tv";

/**
 * Panel styles — alinhado com `.tbl-form-drawer` do design-and-table-v2.
 *
 * Spec sandbox:
 *   - position: fixed top/right/bottom 24px (gutter)
 *   - width: 560px (default), max-width: calc(100vw - 48px)
 *   - bg-bg-surface (light) / bg-bg-canvas (dark)
 *   - border 1px + radius 14px (= radius-xl)
 *   - shadow-sh-2xl + halo outline (6px alpha)
 *   - flex column, overflow-hidden
 *   - Mobile: ocupa quase tudo (gutter reduzido)
 */

/* ── Container (override do SheetContent) ─────────────────────────────────── */
/**
 * Container "card flutuante" estilo iGreen — fica destacado do viewport com
 * gutter de 24px, radius e halo. Responsivo: gutter encolhe no mobile.
 */
export const panelContainer = tv({
  base: [
    "flex flex-col overflow-hidden",
    "rounded-radius-xl border border-border-default",
    // Outline padrão de elementos flutuantes
    "outline-float",
    // Altura/largura responde ao side via inset (desktop):
    // right/left → inset-y define height, sizeClass define width
    // top/bottom → inset-x define width, height auto
    //
    // Mobile (max-md) — independente do side, vira sheet bottom-up colado nas
    // bordas do device: flush nas laterais + bottom, só topo arredondado, sem
    // outline/shadow, cap 92vh. Backdrop suave já vem do SheetOverlay (modal).
    // top-auto + bottom-0 sobrescrevem o inset-y-pad-4xl do desktop (media query
    // vence). NÃO usar inset-y-auto aqui — ele zeraria o bottom-0 (tailwind-merge
    // trata inset-y como superset de bottom e removeria a âncora).
    "max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:!w-auto",
    "max-md:max-h-[92vh] max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0",
    "max-md:outline-none max-md:shadow-none",
  ],
  variants: {
    side: {
      right: "inset-y-pad-4xl right-pad-4xl",
      left: "inset-y-pad-4xl left-pad-4xl",
      top: "inset-x-pad-4xl top-pad-4xl",
      bottom: "inset-x-pad-4xl bottom-pad-4xl",
    },
  },
});

/* ── Header (.tbl-form-drawer-head) ───────────────────────────────────────── */
export const panelHeader = tv({
  base: [
    "flex items-center justify-between gap-gp-xl flex-none",
    "px-[20px] py-[18px]",
    "border-b border-border-default",
  ],
});

export const panelHeaderText = tv({
  base: "flex flex-col gap-gp-2xs min-w-0",
});

export const panelTitle = tv({
  base: [
    "flex items-center gap-gp-md min-w-0",
    "text-body-lg font-bold text-fg-default tracking-[-0.01em]",
    "truncate",
  ],
});

export const panelTitleIcon = tv({
  base: "size-[18px] text-fg-brand shrink-0",
});

export const panelDescription = tv({
  base: "text-body-md text-fg-muted",
});

export const panelClose = tv({
  base: [
    "grid place-items-center shrink-0",
    "w-form-sm h-form-sm rounded-radius-md",
    "bg-transparent border-0 cursor-pointer",
    "text-fg-muted opacity-60",
    "transition-[background-color,color,opacity] duration-150",
    "hover:bg-bg-muted hover:text-fg-default hover:opacity-100",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary focus-visible:opacity-100",
    "dark:hover:bg-bg-muted-hover",
  ],
});

/* ── Body (.tbl-form-drawer-body) ─────────────────────────────────────────── */
export const panelBody = tv({
  base: [
    // min-h-0 garante que o flex-1 encolha e o scroll ative (em vez de empurrar
    // header/footer). Scroll automático independente de viewport.
    "flex-1 min-h-0 overflow-y-auto",
    "flex flex-col gap-gp-3xl",         // 20px gap entre form sections
    "py-pad-4xl px-pad-3xl",            // 24px vertical / 20px horizontal
    "scrollbar-thin",
  ],
});

/* ── Footer (.tbl-form-drawer-foot) ───────────────────────────────────────── */
export const panelFooter = tv({
  base: [
    // Botões fluidos lado a lado; quebram pra empilhados quando não cabem.
    "flex flex-wrap items-center gap-gp-md flex-none",
    "[&>*]:flex-1 [&>*]:min-w-[140px]",
    "px-[20px] py-[14px]",
    "border-t border-border-default",
  ],
});
