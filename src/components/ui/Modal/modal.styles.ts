import { tv } from "@/utils/tv";

/**
 * Slots tv() pro <Modal>.
 *
 * Estrutura visual idêntica ao TblViewsModal do sandbox (/design-and-table-v2):
 *   header (icon + title + sub)  →  body livre (children)  →  footer (actions)
 *
 * Valores fora da escala DS (gaps 14/18/3px, padding 22px, fonts 12.5/13.5/17px)
 * são arbitrary literal — calibração visual exata do sandbox. Onde o token
 * semantico bate (form-lg=40, form-md=36, radius-lg=10, pad-4xl=24), usar token.
 */

/* ── Dialog container ────────────────────────────────────────────── */

export const dialog = tv({
  base: [
    // Override do DialogContent default (grid + p-pad-4xl + rounded-radius-base + shadow-sh-xl)
    "!gap-0 !p-0",
    "border border-border-default",
    "!rounded-radius-2xl !shadow-sh-2xl",
    "outline-float",
    "flex flex-col overflow-hidden",
    "w-[calc(100%-32px)]",
  ],
  variants: {
    size: {
      sm: "!max-w-[440px]",
      md: "!max-w-[540px]",
      lg: "!max-w-[720px]",
    },
  },
  defaultVariants: { size: "md" },
});

/* ── Close button (X) ────────────────────────────────────────────── */

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

/* ── Header (icon + title + description) ─────────────────────────── */

export const head = tv({
  base: [
    "flex items-center gap-[14px]",
    "px-pad-4xl pt-pad-4xl pb-pad-3xl",   // 24/24/20
    "border-b border-border-default",
  ],
  variants: {
    // Sem icon — alinha texto à esquerda direto
    withIcon: { false: "", true: "" },
  },
});

export const headIcon = tv({
  base: [
    "shrink-0 grid place-items-center size-form-lg",   // 40×40
    "bg-bg-muted border border-border-input rounded-radius-lg",   // radius-lg=10px
    "text-fg-default",
    "dark:bg-bg-accent dark:border-border-subtle",
  ],
});

export const headTitleWrap = tv({
  base: [
    "flex-1 min-w-0",
    "flex flex-col justify-center",   // centraliza title+description verticalmente vs icon (40px) à esquerda
    "pr-pad-3xl",                      // reserva espaço pro X close (right-14 + 28px) — evita overlap
  ],
});

export const title = tv({
  base: [
    "m-0 mb-[2px]",
    "text-body-lg font-bold leading-[1.3]",
    "text-fg-default",
    "tracking-[-0.01em]",
  ],
});

export const description = tv({
  base: "m-0 text-body-xs font-normal text-fg-muted leading-[1.45]",
});

/* ── Body (children livre) ───────────────────────────────────────── */

export const body = tv({
  base: "flex flex-col gap-[18px] px-pad-4xl py-[22px]",
});

/* ── Footer ──────────────────────────────────────────────────────── */
/**
 * Default: justify-end (todos os botões à direita).
 * Com tertiary: justify-between (tertiary à esquerda, secondary+primary à direita).
 */
export const foot = tv({
  base: [
    "flex items-center gap-gp-lg",        // gap 10px
    "px-pad-4xl pt-pad-md pb-[22px]",     // 24/8/22
  ],
  variants: {
    layout: {
      end:     "justify-end",
      between: "justify-between",
    },
  },
  defaultVariants: { layout: "end" },
});

/** Grupo da direita do footer (secondary + primary) quando há tertiary à esquerda. */
export const footRight = tv({
  base: "flex items-center gap-gp-lg",
});
