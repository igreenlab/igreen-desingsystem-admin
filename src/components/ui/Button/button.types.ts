import type { ButtonVariantProps } from "./button.styles";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "color">,
    // `ariaDisabled` é pele interna: ligada sozinha, pinta o botão de desabilitado
    // sem barrar o clique. Quem a liga é o `disabledReason`, no `button.tsx`.
    Omit<ButtonVariantProps, "ariaDisabled"> {
  loading?: boolean;
  /**
   * Por que o botão está desabilitado. Com ele, o botão troca o atributo `disabled`
   * por `aria-disabled` — volta a receber hover e foco — e mostra este texto numa
   * tooltip. O clique e o submit continuam barrados (no handler, não no CSS).
   *
   * Sem a prop, `disabled` segue exatamente como sempre foi.
   */
  disabledReason?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}
