import type { ColorPickerVariantProps } from "./color-picker.styles";

/** Estado visual da borda do trigger — NÃO é color variant. */
export type ColorPickerState = NonNullable<ColorPickerVariantProps["state"]>;

/** Tamanho do trigger (altura do input + swatch). */
export type ColorPickerSize = NonNullable<ColorPickerVariantProps["size"]>;

export interface ColorPickerProps {
  /** Valor controlado em hex `#RRGGBB` (maiúsculo). Obrigatório. */
  value: string;
  /** Chamado com o hex normalizado `#RRGGBB` ao escolher preset ou confirmar. */
  onValueChange: (hex: string) => void;
  /**
   * Cores oferecidas no grid do popover. Default: `DEFAULT_COLOR_PRESETS`
   * (paleta curada iGreen + neutras).
   */
  presets?: string[];
  /** id do input hex (linka com label externo via htmlFor). */
  id?: string;
  /** Estado semântico — colore SÓ a borda do trigger swatch. Default `"default"`. */
  state?: ColorPickerState;
  /** Tamanho do trigger. `sm` = form-md (36px) · `md` = form-lg (40px, default). */
  size?: ColorPickerSize;
  /** Desabilita o seletor inteiro. */
  disabled?: boolean;
  /** Permite digitar um hex livre no popover. Default `true`. */
  allowCustomHex?: boolean;
  /** Placeholder do input hex. Default `"#RRGGBB"`. */
  placeholder?: string;
  /** Controle externo de abertura do popover. */
  open?: boolean;
  /** Notifica abertura/fechamento do popover. */
  onOpenChange?: (open: boolean) => void;
  /** className do container (root). */
  className?: string;
}
