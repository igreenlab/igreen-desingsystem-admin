import { tv, type VariantProps } from "@/utils/tv";

/**
 * Spinner — indicador de carregamento (loading) puramente decorativo/visual.
 *
 * Desenha um SVG que gira via `animate-spin`. Respeita `prefers-reduced-motion`
 * (a animação para via `motion-reduce:animate-none`). Tamanho pelos tokens de
 * ícone (`size-icon-*`) e cor pelos tokens de texto (`text-fg-*` / `currentColor`),
 * já que o traço usa `stroke="currentColor"`.
 *
 * Variantes:
 *   - size:  sm (size-icon-sm) | md (size-icon-md) | lg (size-icon-lg)
 *            | xl (size-icon-xl, 32px) | 2xl (size-icon-2xl, 40px) — os dois
 *            maiores existem pra loading de área/página (ScreenLoader), onde
 *            os 24px do lg somem no espaço
 *   - color: current (herda o texto do pai) | default | muted | brand | on-brand
 */
export const spinnerStyles = tv({
  base: ["inline-block shrink-0", "animate-spin motion-reduce:animate-none"],
  variants: {
    size: {
      sm: "size-icon-sm",
      md: "size-icon-md",
      lg: "size-icon-lg",
      xl: "size-icon-xl",
      "2xl": "size-icon-2xl",
    },
    color: {
      current: "text-current",
      default: "text-fg-default",
      muted: "text-fg-muted",
      brand: "text-fg-brand",
      "on-brand": "text-fg-on-brand",
    },
  },
  defaultVariants: {
    size: "md",
    color: "muted",
  },
});

export type SpinnerVariantProps = VariantProps<typeof spinnerStyles>;
