import { tv, type VariantProps } from "@/utils/tv";

/**
 * MonthYearPicker — seletor de período mês+ano (valor `YYYY-MM`).
 *
 * O DS só tem um `calendar` de dia (react-day-picker), então este compõe um
 * `Popover` + uma grade de 12 meses com navegação de ano. O `trigger` espelha
 * 1:1 o `SelectTrigger`/`Combobox` (mesma altura, borda, radius, foco) pra
 * parear com Selects irmãos num filtro.
 */
export const monthYearStyles = tv({
  slots: {
    trigger: [
      "flex min-h-form-lg w-full items-center justify-between gap-gp-md",
      "rounded-radius-lg px-pad-xl",
      "bg-bg-input dark:bg-bg-muted",
      "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover",
      "border border-border-input",
      "text-body-sm font-normal text-fg-default text-left",
      "transition-[color,box-shadow,background-color,border-color]",
      "focus-visible:outline-none",
      "data-[placeholder]:text-fg-muted data-[placeholder]:opacity-70",
      "focus-visible:border-border-brand data-[state=open]:border-border-brand",
      "focus-visible:shadow-sh-ring data-[state=open]:shadow-sh-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "disabled:hover:bg-bg-input dark:disabled:hover:bg-bg-muted",
    ],
    triggerLeadingIcon: "size-icon-sm shrink-0 text-fg-muted",
    value: "min-w-0 flex-1 truncate",
    triggerIcon: "size-icon-sm shrink-0 text-fg-muted",
    // Dropdown compacto — largura própria (não amarra na do trigger, a grade
    // 3×4 tem largura natural).
    content: "w-[16rem] p-pad-md",
    header: "flex items-center justify-between gap-gp-md pb-pad-md",
    navButton: [
      "inline-flex size-form-sm items-center justify-center shrink-0",
      "rounded-radius-base text-fg-muted",
      "hover:bg-bg-muted hover:text-fg-default",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
      "disabled:pointer-events-none disabled:opacity-40",
    ],
    yearLabel: "text-body-sm font-semibold text-fg-default tabular-nums",
    grid: "grid grid-cols-3 gap-gp-sm",
  },
});

export type MonthYearStylesProps = VariantProps<typeof monthYearStyles>;

/**
 * Botão de mês da grade — variantes selected/disabled separadas do slot-tv
 * acima porque precisam de estado por-item.
 */
export const monthYearMonthButton = tv({
  base: [
    "flex items-center justify-center min-h-form-md px-pad-md",
    "rounded-radius-base text-body-sm font-medium",
    "transition-[background-color,color]",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
  variants: {
    selected: {
      true: "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-hover",
      false: "text-fg-default hover:bg-bg-muted",
    },
    disabled: {
      true: "pointer-events-none opacity-40",
    },
  },
  defaultVariants: {
    selected: false,
  },
});
