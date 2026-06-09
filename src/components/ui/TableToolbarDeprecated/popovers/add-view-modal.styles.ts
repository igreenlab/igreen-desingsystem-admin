import { tv } from "@/utils/tv";

/**
 * Slots tv() pro AddViewModal — replica literal do modal do sandbox
 * /design-and-table-v2 (TblViewsModal).
 *
 * Valores fora da escala DS (14px gap, 18px gap, 22px py, 13.5/17px font,
 * 3px gap) usados como arbitrary — calibração visual exata do sandbox.
 * Quando o token semantico existe na medida certa (form-lg, form-md,
 * radius-lg, pad-4xl=24, etc), usar o token.
 */

export const dialog = tv({
  base: [
    // Override do DialogContent default (grid + p-pad-4xl + rounded-radius-base + shadow-sh-xl)
    "!gap-0 !p-0",
    "!max-w-[540px] w-[calc(100%-32px)]",
    "border border-border-default",       // sandbox tem border 1px solid — DialogContent default não traz
    "!rounded-radius-2xl !shadow-sh-2xl",  // radius-2xl=18px (sandbox quer 16, mantemos token DS)
    "outline-float",                      // halo 6px alpha em volta — match sandbox
    "flex flex-col overflow-hidden",
  ],
});

/**
 * Close button manual — substitui o padrão do DialogContent (que usa
 * opacity-70 + cor herdada). Sandbox: 28×28, text-fg-muted, opacity 0.55 →
 * 1 no hover + bg-muted no hover.
 */
export const closeBtn = tv({
  base: [
    "absolute top-[14px] right-[14px] z-[1]",
    "grid place-items-center size-[28px]",
    "rounded-radius-md bg-transparent border-0 cursor-pointer",
    "text-fg-muted opacity-55",
    "transition-[background-color,color,opacity] duration-150",
    "hover:bg-bg-muted hover:text-fg-default hover:opacity-100",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "dark:hover:bg-bg-muted-hover",
  ],
});

export const head = tv({
  base: [
    "flex items-center gap-[14px]",       // sandbox 14px (não tem na escala)
    "px-pad-4xl pt-pad-4xl pb-pad-3xl",   // 24/24/20 — sandbox literal
    "border-b border-border-default",
  ],
});

export const headIcon = tv({
  base: [
    "shrink-0 grid place-items-center size-form-lg",   // 40×40 — sandbox
    "bg-bg-muted border border-border-input rounded-radius-lg",
    "text-fg-default",
    "dark:bg-bg-accent dark:border-border-subtle",
  ],
});

export const headTitleWrap = tv({
  base: [
    "flex-1 min-w-0",
    // Reserva espaço pro X close do DialogContent (absolute right-4 / size ~24px)
    // — evita sobreposição quando o título quebra ou é longo (mobile estreito).
    "pr-pad-3xl",
  ],
});

export const title = tv({
  base: [
    "m-0 mb-[2px]",
    // leading-[1.3] balanceia o bloco verticalmente com o icon container 40px
    // (leading-none deixava o glyph colado no top → parecia subido).
    "text-body-lg font-bold leading-[1.3]",
    "text-fg-default",
    "tracking-[-0.01em]",
  ],
});

export const sub = tv({
  base: "m-0 text-body-xs font-normal text-fg-muted leading-[1.45]",
});

export const body = tv({
  base: "flex flex-col gap-[18px] px-pad-4xl py-[22px]",
});

export const toggleRow = tv({
  base: [
    "flex items-center gap-gp-xl",        // 12px — sandbox
    "px-pad-2xl py-[14px]",               // 16 / 14 — sandbox
    "bg-bg-muted border border-border-default rounded-radius-xl",  // radius-xl=14px (sandbox quer 12, mantemos token DS)
    "cursor-pointer transition-[background-color,border-color] duration-200",
  ],
  variants: {
    on: {
      true: "bg-bg-brand-subtle border-border-brand",
    },
  },
});

export const toggleIcon = tv({
  base: [
    "shrink-0 grid place-items-center size-form-md rounded-radius-lg",   // 36×36 / radius-lg=10px
    "bg-bg-surface border border-border-subtle text-fg-default",
    "dark:bg-bg-accent dark:border-border-input dark:text-fg-muted",
    "transition-[background-color,border-color,color] duration-200",
  ],
  variants: {
    on: {
      true: "!bg-bg-surface !border-border-brand !text-fg-brand",
    },
  },
});

export const toggleText = tv({
  base: "flex-1 min-w-0 flex flex-col gap-[3px]",
});

export const toggleLabel = tv({
  base: "text-body-md font-semibold text-fg-default leading-[1.3]",
});

export const toggleDesc = tv({
  base: "text-body-xs font-normal text-fg-muted leading-[1.45]",
});

export const foot = tv({
  base: [
    "flex items-center justify-end gap-gp-lg",        // 10px — sandbox
    "px-pad-4xl pt-pad-md pb-[22px]",                 // 24 / 8 / 22 — sandbox literal
  ],
});
