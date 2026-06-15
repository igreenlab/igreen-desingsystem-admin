import { tv, type VariantProps } from "@/utils/tv";

/**
 * iconStyles — presets de tamanho via tokens de sizing (`size-icon-*`) e
 * tom semântico via tokens de cor (`fg.*`). Cor também herda `currentColor`
 * (controlável por classe `text-*`) ou via prop `color` (qualquer CSS).
 */
export const iconStyles = tv({
  base: "inline-block shrink-0 transition-colors",
  variants: {
    size: {
      xs: "size-icon-xs", // 12px
      sm: "size-icon-sm", // 16px
      md: "size-icon-md", // 20px
      lg: "size-icon-lg", // 24px
      xl: "size-icon-xl", // 32px
    },
    tone: {
      default: "text-fg-default",
      muted: "text-fg-muted",
      brand: "text-fg-brand",
      danger: "text-fg-danger",
      success: "text-fg-success",
      warning: "text-fg-warning",
      info: "text-fg-info",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type IconVariants = VariantProps<typeof iconStyles>;
