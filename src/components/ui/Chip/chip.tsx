import { forwardRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  chipLabel,
  chipRemove,
  chipVariants,
  type ChipVariantProps,
} from "./chip.styles";

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
    /**
     * Remover o chip — renderiza um "×" com alvo PRÓPRIO, ao lado da label.
     *
     * Existe porque remover é o comportamento padrão de chip de filtro aplicado, e a
     * receita anterior do DS era `<Chip onClick={remover}>Status: Ativo ×</Chip>`: o "×"
     * digitado no texto, o chip inteiro removendo, e nenhuma forma de ter as duas ações
     * ("editar o filtro" e "tirar o filtro") no mesmo chip.
     *
     * ⚠️ Com `onRemove` a pílula vira `<span>` e a label ganha o próprio `<button>`
     * quando há `onClick` — botão dentro de botão é HTML inválido, o navegador desaninha
     * e o clique no × passaria a disparar o do chip também.
     */
    onRemove?: (e: MouseEvent<HTMLButtonElement>) => void;
    /**
     * Nome acessível do botão de remover. Default: "Remover <label>" quando `children`
     * é texto, senão "Remover". Passe explicitamente quando o chip não for texto — numa
     * barra de filtros, cinco botões chamados "Remover" são indistinguíveis no leitor.
     */
    removeLabel?: string;
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
    onRemove,
    removeLabel,
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

  if (onRemove) {
    const nome =
      removeLabel ??
      (typeof children === "string" ? `Remover ${children}` : "Remover");
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={classes}
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {interactive ? (
          <button
            type={type ?? "button"}
            onClick={onClick}
            className={chipLabel()}
            aria-pressed={selected}
          >
            {children}
          </button>
        ) : (
          <span className={chipLabel()}>{children}</span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className={chipRemove({ size })}
          aria-label={nome}
        >
          <X aria-hidden />
        </button>
      </span>
    );
  }

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
