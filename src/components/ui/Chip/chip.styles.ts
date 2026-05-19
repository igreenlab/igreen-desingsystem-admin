import { tv, type VariantProps } from "@/utils/tv";

/**
 * Chip styles — pílula compacta pra status, tags, filtros, abas.
 *
 * Pode ser estático (span) ou interativo (button via `onClick` / dentro de ChipGroup).
 *
 * Variantes:
 *   - color: primary | neutral | danger | warning | success | info
 *   - variant: solid | outline | soft
 *   - size: sm (24px) | md (28px = form-xs) | lg (32px = form-sm)
 *
 * Padding/font-size escalam por size — alturas coerentes com o sistema (sm < form-xs
 * pra ficar mais compacto que o menor botão; md/lg alinham com Button).
 */
export const chipVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-gp-xs shrink-0",
    "font-semibold whitespace-nowrap select-none",
    "transition-[background-color,color,border-color,box-shadow] duration-150",
    "[&_svg]:shrink-0",
  ],
  variants: {
    size: {
      sm: "h-[24px] px-pad-md text-caption-sm [&_svg]:size-[12px]",
      md: "h-form-xs px-pad-lg text-body-xs font-normal [&_svg]:size-[12px]",  // 28px
      lg: "h-form-sm px-pad-xl text-body-sm font-normal [&_svg]:size-[14px]",  // 32px
      xl: "h-form-md px-pad-xl text-body-sm font-normal [&_svg]:size-[14px]",  // 36px (= Button md)
    },
    /**
     * `pill` = rounded-full (default — chip pílula clássico).
     * `rounded` = canto arredondado igual ao Button (radius-md em sm/md, radius-lg em lg/xl).
     */
    shape: {
      pill:    "rounded-radius-full",
      rounded: "",  // aplica via compoundVariants por size
    },
    color: {
      primary:  "",
      neutral:  "",
      danger:   "",
      warning:  "",
      success:  "",
      info:     "",
    },
    variant: {
      solid:        "",
      outline:      "border",
      soft:         "",
      "soft-outline": "border",
    },
    interactive: {
      true:  "cursor-pointer outline-none focus-visible:shadow-sh-ring",
      false: "",
    },
    selected: {
      true:  "",
      false: "",
    },
  },
  compoundVariants: [
    /* ── Shape rounded × size — radius proporcional ao Button ──── */
    { shape: "rounded", size: "sm", class: "rounded-radius-md" },
    { shape: "rounded", size: "md", class: "rounded-radius-md" },
    { shape: "rounded", size: "lg", class: "rounded-radius-lg" },
    { shape: "rounded", size: "xl", class: "rounded-radius-lg" },

    /* ── Solid ──────────────────────────────────────────────────── */
    { color: "primary", variant: "solid", class: "bg-bg-brand text-fg-on-brand" },
    { color: "neutral", variant: "solid", class: "bg-bg-muted text-fg-default" },
    { color: "danger",  variant: "solid", class: "bg-bg-danger text-fg-on-danger" },
    { color: "warning", variant: "solid", class: "bg-bg-warning text-fg-on-warning" },
    { color: "success", variant: "solid", class: "bg-bg-success text-fg-on-success" },
    { color: "info",    variant: "solid", class: "bg-bg-info text-fg-on-info" },

    /* ── Outline ────────────────────────────────────────────────── */
    { color: "primary", variant: "outline", class: "bg-transparent border-border-brand text-fg-brand" },
    { color: "neutral", variant: "outline", class: "bg-transparent border-border-default text-fg-default" },
    { color: "danger",  variant: "outline", class: "bg-transparent border-border-danger-muted text-fg-danger" },
    { color: "warning", variant: "outline", class: "bg-transparent border-border-warning-muted text-fg-warning" },
    { color: "success", variant: "outline", class: "bg-transparent border-border-success-muted text-fg-success" },
    { color: "info",    variant: "outline", class: "bg-transparent border-border-info-muted text-fg-info" },

    /* ── Soft ───────────────────────────────────────────────────── */
    { color: "primary", variant: "soft", class: "bg-bg-brand-subtle text-fg-brand" },
    { color: "neutral", variant: "soft", class: "bg-bg-muted text-fg-muted" },
    { color: "danger",  variant: "soft", class: "bg-bg-danger-muted text-fg-danger" },
    { color: "warning", variant: "soft", class: "bg-bg-warning-muted text-fg-warning" },
    { color: "success", variant: "soft", class: "bg-bg-success-muted text-fg-success" },
    { color: "info",    variant: "soft", class: "bg-bg-info-muted text-fg-info" },

    /* ── Soft + Outline (bg sutil + borda definida) ─────────────── */
    { color: "primary", variant: "soft-outline", class: "bg-bg-brand-subtle border-border-brand text-fg-brand" },
    { color: "neutral", variant: "soft-outline", class: "bg-bg-muted border-border-default text-fg-muted" },
    { color: "danger",  variant: "soft-outline", class: "bg-bg-danger-muted border-border-danger-muted text-fg-danger" },
    { color: "warning", variant: "soft-outline", class: "bg-bg-warning-muted border-border-warning-muted text-fg-warning" },
    { color: "success", variant: "soft-outline", class: "bg-bg-success-muted border-border-success-muted text-fg-success" },
    { color: "info",    variant: "soft-outline", class: "bg-bg-info-muted border-border-info-muted text-fg-info" },

    /* ── Hover (somente quando interactive) ────────────────────── */
    { interactive: true, color: "primary", variant: "solid", class: "hover:bg-bg-brand-hover" },
    { interactive: true, color: "neutral", variant: "solid", class: "hover:bg-bg-muted-hover" },
    { interactive: true, color: "danger",  variant: "solid", class: "hover:bg-bg-danger-hover" },
    { interactive: true, color: "warning", variant: "solid", class: "hover:bg-bg-warning-hover" },
    { interactive: true, color: "success", variant: "solid", class: "hover:bg-bg-success-hover" },
    { interactive: true, color: "info",    variant: "solid", class: "hover:bg-bg-info-hover" },

    { interactive: true, color: "primary", variant: "outline", class: "hover:bg-bg-brand-subtle" },
    { interactive: true, color: "neutral", variant: "outline", class: "hover:bg-bg-muted" },
    { interactive: true, color: "danger",  variant: "outline", class: "hover:bg-bg-danger-muted" },
    { interactive: true, color: "warning", variant: "outline", class: "hover:bg-bg-warning-muted" },
    { interactive: true, color: "success", variant: "outline", class: "hover:bg-bg-success-muted" },
    { interactive: true, color: "info",    variant: "outline", class: "hover:bg-bg-info-muted" },

    { interactive: true, color: "primary", variant: "soft", class: "hover:bg-bg-brand-subtle-hover" },
    { interactive: true, color: "neutral", variant: "soft", class: "hover:bg-bg-muted-hover hover:text-fg-default" },
    { interactive: true, color: "danger",  variant: "soft", class: "hover:bg-bg-danger-muted-hover" },
    { interactive: true, color: "warning", variant: "soft", class: "hover:bg-bg-warning-muted-hover" },
    { interactive: true, color: "success", variant: "soft", class: "hover:bg-bg-success-muted-hover" },
    { interactive: true, color: "info",    variant: "soft", class: "hover:bg-bg-info-muted-hover" },

    { interactive: true, color: "primary", variant: "soft-outline", class: "hover:bg-bg-brand-subtle-hover" },
    { interactive: true, color: "neutral", variant: "soft-outline", class: "hover:bg-bg-muted-hover hover:text-fg-default" },
    { interactive: true, color: "danger",  variant: "soft-outline", class: "hover:bg-bg-danger-muted-hover" },
    { interactive: true, color: "warning", variant: "soft-outline", class: "hover:bg-bg-warning-muted-hover" },
    { interactive: true, color: "success", variant: "soft-outline", class: "hover:bg-bg-success-muted-hover" },
    { interactive: true, color: "info",    variant: "soft-outline", class: "hover:bg-bg-info-muted-hover" },

    /* ── Selected (ChipGroup) — força "soft" da color como visual ativo ── */
    { selected: true, color: "primary", class: "bg-bg-brand-subtle text-fg-brand border-transparent" },
    { selected: true, color: "neutral", class: "bg-bg-accent text-fg-default font-semibold border-transparent shadow-sh-sm" },
    { selected: true, color: "danger",  class: "bg-bg-danger-muted text-fg-danger border-transparent" },
    { selected: true, color: "warning", class: "bg-bg-warning-muted text-fg-warning border-transparent" },
    { selected: true, color: "success", class: "bg-bg-success-muted text-fg-success border-transparent" },
    { selected: true, color: "info",    class: "bg-bg-info-muted text-fg-info border-transparent" },
  ],
  defaultVariants: {
    color: "neutral",
    variant: "soft",
    size: "md",
    shape: "pill",
    interactive: false,
    selected: false,
  },
});

export type ChipVariantProps = VariantProps<typeof chipVariants>;

/** Contador inline pra usar como adornment no Chip (ex: "Não lidas (3)") */
export const chipCount = tv({
  base: [
    "inline-flex items-center justify-center min-w-[16px] h-[16px] px-[4px]",
    "rounded-radius-full text-caption-xs font-semibold leading-none",
    "bg-bg-muted text-fg-default",
  ],
});
