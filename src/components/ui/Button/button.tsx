import { forwardRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import type { ButtonProps } from "./button.types";
import { buttonVariants } from "./button.styles";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      color,
      variant,
      size,
      shape,
      fullWidth,
      loading = false,
      disabled = false,
      disabledReason,
      iconLeft,
      iconRight,
      children,
      className,
      onClick,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    /**
     * Desabilitado **com motivo**. O atributo `disabled` tira o elemento do hover e
     * do foco, e `pointer-events-none` fecha o que sobrava: sem nenhum dos dois não
     * existe superfície onde a tooltip possa abrir, e o estado apaga a própria
     * explicação (L-070). Por isso, com `disabledReason`, o botão passa a anunciar o
     * estado por `aria-disabled` e segue alcançável.
     */
    const explicado = isDisabled && Boolean(disabledReason);

    /**
     * ⚠️ `aria-disabled` é anúncio, não trava: o navegador continua disparando o
     * clique, o Enter/Espaço continua virando clique, e um `type="submit"` continua
     * submetendo o formulário. **Esta função é a única trava** — o `preventDefault`
     * mata o submit e o `return` mata o `onClick` do consumidor.
     */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (explicado) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    };

    const botao = (
      <button
        ref={ref}
        type={type}
        disabled={explicado ? undefined : isDisabled}
        onClick={handleClick}
        className={buttonVariants({
          color,
          variant,
          size,
          shape,
          fullWidth,
          disabled: isDisabled && !explicado,
          ariaDisabled: explicado,
          className,
        })}
        {...rest}
        // Depois do spread de propósito: é estado do componente, não override do
        // consumidor. `undefined` não emite atributo — sem a prop, o DOM é o de sempre.
        aria-disabled={explicado || undefined}
      >
        {loading && <Spinner />}
        {!loading && iconLeft}
        {children}
        {!loading && iconRight}
      </button>
    );

    if (!explicado) return botao;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{botao}</TooltipTrigger>
        <TooltipContent>{disabledReason}</TooltipContent>
      </Tooltip>
    );
  },
);

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="8"
        className="opacity-70"
      />
    </svg>
  );
}
