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
    // Altura/largura responde ao side via inset:
    // right/left → inset-y define height, sizeClass define width
    // top/bottom → inset-x define width, height auto
  ],
  variants: {
    side: {
      right: [
        "inset-y-pad-4xl right-pad-4xl",
        "max-md:inset-y-pad-md max-md:right-pad-md max-md:left-pad-md",
      ],
      left: [
        "inset-y-pad-4xl left-pad-4xl",
        "max-md:inset-y-pad-md max-md:left-pad-md max-md:right-pad-md",
      ],
      top: [
        "inset-x-pad-4xl top-pad-4xl",
        "max-md:inset-x-pad-md max-md:top-pad-md max-md:bottom-pad-md",
      ],
      bottom: [
        "inset-x-pad-4xl bottom-pad-4xl",
        "max-md:inset-x-pad-md max-md:bottom-pad-md max-md:top-pad-md",
      ],
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
    "flex-1 overflow-y-auto",
    "flex flex-col gap-gp-3xl",         // 20px gap entre form sections
    "py-pad-4xl px-pad-3xl",            // 24px vertical / 20px horizontal
    "scrollbar-thin",
  ],
});

/* ── Footer (.tbl-form-drawer-foot) ───────────────────────────────────────── */
export const panelFooter = tv({
  base: [
    "flex items-center justify-end gap-gp-lg flex-none",
    "px-[20px] py-[14px]",
    "border-t border-border-default",
  ],
});
