import { tv, type VariantProps } from "@/utils/tv";

/**
 * ColorPicker — seletor de cor hex (#RRGGBB) controlado para Tags / Filas.
 *
 * Anatomia visual (só o wrapper; Input/Button/Popover trazem os próprios estilos):
 *   trigger        = linha [swatch button] + [Input hex flex-1]
 *   swatch         = quadrado clicável que abre o popover; bg vem por INLINE
 *                    STYLE (exceção L-027 — cor dinâmica externa), aqui só
 *                    altura/borda/radius/foco tokenizados
 *   content        = grid de presets + separator + input hex livre
 *   presetsGrid    = grid-cols-10 de swatches dos presets
 *   preset         = swatch de preset (size-comp-xs); checkmark colorido via
 *                    getContrastTextColor no .tsx (inline)
 *
 * Foco:
 *   - swatch + preset → Padrão 1 (botão): focus-visible:outline-none + ring-4 brand
 *   - Input hex → herda o Input do DS (Padrão 2, animado)
 *
 * `state` controla SÓ a borda do trigger swatch (espelha os states do Input),
 * NÃO é uma color variant. `disabled` é o ÚLTIMO compoundVariant (L-006).
 */
export const colorPickerStyles = tv({
  slots: {
    root: "inline-flex w-full items-center gap-gp-md",
    swatch: [
      "relative inline-flex shrink-0 items-center justify-center",
      "rounded-radius-md border",
      "transition-[border-color,box-shadow]",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
      // opacity do disabled vem do slot root (cobre tudo uniformemente) — não duplicar aqui
      "disabled:cursor-not-allowed",
    ],
    hexInput: "flex-1",
    content: "flex flex-col gap-gp-lg p-sp-md min-w-container-dropdown-lg",
    presetsGrid: "grid grid-cols-10 gap-gp-sm",
    preset: [
      "relative inline-flex items-center justify-center",
      "size-comp-xs rounded-radius-md border border-border-input",
      "transition-[box-shadow,border-color]",
      "hover:border-border-brand",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
    ],
    presetCheck: "size-icon-sm",
    customRow: "flex flex-col gap-gp-md",
  },
  variants: {
    size: {
      sm: { swatch: "size-form-md" },
      md: { swatch: "size-form-lg" },
    },
    state: {
      default: { swatch: "border-border-input hover:border-border-brand" },
      error: { swatch: "border-border-danger-muted" },
      warning: { swatch: "border-border-warning-muted" },
      success: { swatch: "border-border-success-muted" },
    },
    disabled: {
      true: { root: "pointer-events-none opacity-50" },
    },
  },
  compoundVariants: [
    // disabled SEMPRE por último (L-006)
    {
      disabled: true,
      class: { swatch: "border-border-input hover:border-border-input" },
    },
  ],
  defaultVariants: {
    size: "md",
    state: "default",
    disabled: false,
  },
});

export type ColorPickerVariantProps = VariantProps<typeof colorPickerStyles>;
