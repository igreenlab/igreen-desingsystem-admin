import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { chipVariants, type ChipVariantProps } from "./chip.styles";

export type ChipProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.HTMLAttributes<HTMLSpanElement>,
  "color"
> &
  ChipVariantProps & {
    /** Conteúdo (label, ícone, etc) */
    children: ReactNode;
    /**
     * Quando passado, o chip vira `<button>` clicável. Se omitido,
     * renderiza como `<span>` estático (pra status/tag).
     */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /** Força renderizar como button mesmo sem onClick */
    asButton?: boolean;
  };

/**
 * Chip — pílula compacta pra status/tags/filtros/abas.
 *
 * Dual-mode:
 *   - **Span estático** (default): usado pra Badge-like (status, categoria, count)
 *   - **Button interativo**: quando recebe `onClick` OU `asButton`
 *
 * Pra grupo de seleção (radio/checkbox via chips), use `<ChipGroup>`.
 *
 * Variantes:
 *   - `color`: primary | neutral | danger | warning | success | info (default `neutral`)
 *   - `variant`: solid | outline | soft (default `soft`)
 *   - `size`: sm (24px) | md (28px) | lg (32px) (default `md`)
 */
export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  {
    children,
    color,
    variant,
    size,
    shape,
    selected,
    onClick,
    asButton,
    className,
    type,
    ...rest
  },
  ref,
) {
  const interactive = Boolean(onClick) || asButton === true;
  const classes = cn(
    chipVariants({ color, variant, size, shape, interactive, selected }),
    className,
  );

  if (interactive) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type ?? "button"}
        onClick={onClick}
        className={classes}
        aria-pressed={selected}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={classes}
      {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
    </span>
  );
});
