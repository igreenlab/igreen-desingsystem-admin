import { tv, type VariantProps } from "@/utils/tv";

/**
 * Button styles — V3 tokens (alinhado com /design-and-table-v2)
 *
 * Specs base:
 *   - font-size 13px (text-body-md font-medium = 0.8125rem / 600)
 *   - border-radius 10px (rounded-radius-lg)
 *   - secondary usa fg-secondary
 *   - rings cor-pura via ring.{brand|danger|success|warning|secondary}
 *
 * Variants color: primary/secondary/critical/success/warning
 *   - primary  → bg-brand / fg-brand / border-brand
 *   - critical → bg-danger / fg-danger / border-danger-muted
 *   - secondary → neutros (bg-muted, fg-secondary, border-default)
 *
 * Variants visual: filled/outline/soft/ghost
 *
 * Sizes mantidas (largura/espaçamento como estavam).
 *
 * Disabled: opacity-50 (v3 não tem bg-disabled token).
 */
export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "select-none whitespace-nowrap",
    "focus-visible:outline-none",
    "border border-transparent",
    "text-body-sm font-semibold leading-none",  // 13px / 600 — alinhado com sandbox btn
    "[&_svg]:shrink-0",                        // SVG não diminui; tamanho controlado por size
    "transition-all duration-200 ease-out",
    "cursor-pointer",
    "focus-visible:ring-4",
  ],

  variants: {
    color: {
      primary:   "focus-visible:ring-ring-brand",
      secondary: "focus-visible:ring-ring-secondary",
      critical:  "focus-visible:ring-ring-danger",
      success:   "focus-visible:ring-ring-success",
      warning:   "focus-visible:ring-ring-warning",
    },

    variant: {
      filled: "",
      outline: "",
      soft: "",
      ghost: "bg-transparent",
    },

    size: {
      // h28 / pad 10 / gap 6 / radius 8 / icon 12
      "2xs": "min-h-form-xs px-pad-lg gap-gp-sm rounded-radius-md [&_svg]:size-[12px]",
      // h32 / pad 12 / gap 6 / radius 8 / icon 14
      xs:    "min-h-form-sm px-pad-xl gap-gp-sm rounded-radius-md [&_svg]:size-[14px]",
      // h36 / pad 12 / gap 6 / radius 10 / icon 14
      sm:    "min-h-form-md px-pad-xl gap-gp-sm rounded-radius-lg [&_svg]:size-[14px]",
      // h40 / pad 16 / gap 6 / radius 10 / icon 14 (alinhado com sandbox Exportar)
      md:    "min-h-form-lg px-pad-2xl gap-gp-sm rounded-radius-lg [&_svg]:size-[14px]",
      // h44 / pad 16 / gap 8 / radius 10 / icon 16
      lg:    "min-h-form-xl px-pad-2xl gap-gp-md rounded-radius-lg [&_svg]:size-[16px]",

      // Icon buttons — width = height (square). Regra: SVG +2px vs versão com label
      // (precisa preencher mais o quadrado sem o texto carregando peso visual).
      "icon-2xs": "size-form-xs rounded-radius-md p-0 [&_svg]:size-[14px]",  // 28×28 / +2 (12→14)
      "icon-xs":  "size-form-sm rounded-radius-md p-0 [&_svg]:size-[16px]",  // 32×32 / +2 (14→16)
      "icon-sm":  "size-form-md rounded-radius-lg p-0 [&_svg]:size-[16px]",  // 36×36 / +2 (14→16)
      "icon-md":  "size-form-lg rounded-radius-lg p-0 [&_svg]:size-[16px]",  // 40×40 / +2 (14→16)
      "icon-lg":  "size-form-xl rounded-radius-lg p-0 [&_svg]:size-[18px]",  // 44×44 / +2 (16→18)
    },

    fullWidth: {
      true: "w-full flex-1",
    },

    /**
     * Shape do botão:
     *   - rounded (default): mantém o radius da `size` (varia por tamanho)
     *   - pill: força `rounded-full` (override com `!` pra ganhar do size)
     */
    shape: {
      rounded: "",
      pill:    "!rounded-full",
    },

    disabled: {
      true: "pointer-events-none opacity-50",
    },
  },

  compoundVariants: [
    // ── Primary (brand) ─────────────────────────────────────────────
    {
      color: "primary", variant: "filled",
      class: "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-hover",
    },
    {
      color: "primary", variant: "outline",
      class: "bg-bg-surface border-border-brand text-fg-brand shadow-sh-sm hover:bg-bg-brand-subtle hover:border-transparent hover:shadow-sh-none",
    },
    {
      color: "primary", variant: "soft",
      class: "bg-bg-brand-subtle text-fg-brand hover:bg-bg-brand-subtle-hover",
    },
    {
      color: "primary", variant: "ghost",
      class: "text-fg-brand hover:bg-bg-brand-subtle",
    },

    // ── Secondary (neutro) ──────────────────────────────────────────
    {
      color: "secondary", variant: "filled",
      class: "bg-bg-muted text-fg-muted hover:bg-bg-muted-hover hover:text-fg-default",
    },
    {
      // Outline alinhado com `.btn.tbl-tool-btn` do design-and-table-v2:
      // light = bg-surface + border-subtle + fg-default + shadow-sm (mantém no hover)
      // dark  = bg-muted + border-input + fg-muted + sem shadow
      color: "secondary", variant: "outline",
      class: [
        "bg-bg-surface border-border-subtle text-fg-default shadow-sh-sm",
        "dark:bg-bg-muted dark:border-border-input dark:text-fg-muted dark:shadow-sh-none",
        "hover:bg-bg-muted-hover hover:text-fg-default",
        "dark:hover:bg-bg-muted-hover dark:hover:text-fg-default",
      ].join(" "),
    },
    {
      color: "secondary", variant: "soft",
      class: "bg-bg-muted text-fg-muted hover:bg-bg-muted-hover hover:text-fg-default",
    },
    {
      color: "secondary", variant: "ghost",
      class: "text-fg-muted hover:bg-bg-muted hover:text-fg-default",
    },

    // ── Critical (danger) ───────────────────────────────────────────
    {
      color: "critical", variant: "filled",
      class: "bg-bg-danger text-fg-on-danger hover:bg-bg-danger-hover",
    },
    {
      color: "critical", variant: "outline",
      class: "bg-bg-surface border-border-danger-muted text-fg-danger shadow-sh-sm hover:bg-bg-danger-muted hover:shadow-sh-none",
    },
    {
      color: "critical", variant: "soft",
      class: "bg-bg-danger-muted text-fg-danger hover:bg-bg-danger-muted-hover",
    },
    {
      color: "critical", variant: "ghost",
      class: "text-fg-danger hover:bg-bg-danger-muted",
    },

    // ── Success ─────────────────────────────────────────────────────
    {
      color: "success", variant: "filled",
      class: "bg-bg-success text-fg-on-success hover:bg-bg-success-hover",
    },
    {
      color: "success", variant: "outline",
      class: "bg-bg-surface border-border-success-muted text-fg-success shadow-sh-sm hover:bg-bg-success-muted hover:shadow-sh-none",
    },
    {
      color: "success", variant: "soft",
      class: "bg-bg-success-muted text-fg-success hover:bg-bg-success-muted-hover",
    },
    {
      color: "success", variant: "ghost",
      class: "text-fg-success hover:bg-bg-success-muted",
    },

    // ── Warning ─────────────────────────────────────────────────────
    {
      color: "warning", variant: "filled",
      class: "bg-bg-warning text-fg-on-warning hover:bg-bg-warning-hover",
    },
    {
      color: "warning", variant: "outline",
      class: "bg-bg-surface border-border-warning-muted text-fg-warning shadow-sh-sm hover:bg-bg-warning-muted hover:shadow-sh-none",
    },
    {
      color: "warning", variant: "soft",
      class: "bg-bg-warning-muted text-fg-warning hover:bg-bg-warning-muted-hover",
    },
    {
      color: "warning", variant: "ghost",
      class: "text-fg-warning hover:bg-bg-warning-muted",
    },

    // ── Disabled — SEMPRE por último ────────────────────────────────
    { disabled: true, class: "pointer-events-none opacity-50" },
  ],

  defaultVariants: {
    color: "primary",
    variant: "filled",
    size: "md",
    shape: "rounded",
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
