import { forwardRef } from "react";
import { spinnerStyles } from "./spinner.styles";
import type { SpinnerProps } from "./spinner.types";

/**
 * Spinner — indicador de loading. Gira via `animate-spin` e para automaticamente
 * quando o usuário pede menos movimento (`prefers-reduced-motion`). Tamanho e cor
 * são 100% via tokens do DS (ver `spinner.styles.ts`).
 *
 * O traço usa `stroke="currentColor"`, então `color="current"` faz o spinner
 * herdar a cor do texto do container (útil dentro de botões).
 */
export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { size, color, label = "Carregando", className, ...rest },
  ref,
) {
  const decorative = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      className={spinnerStyles({ size, color, className })}
      {...rest}
    >
      {/* Trilho (círculo completo, atenuado) */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
      />
      {/* Arco que gira (1/4 da volta) */}
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
});
Spinner.displayName = "Spinner";
