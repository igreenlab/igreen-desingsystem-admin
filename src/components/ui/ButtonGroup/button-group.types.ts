import type { ReactNode } from "react";
import type { ButtonProps } from "@/components/ui/Button/button.types";

/**
 * Props compartilhadas pelo group e pelos slots Primary/Chevron.
 * Permite override individual via prop direta nos slots.
 */
export type ButtonGroupSharedProps = Pick<
  ButtonProps,
  "color" | "variant" | "size" | "disabled"
>;

/**
 * Props do wrapper ButtonGroup.
 * color/variant/size propagam aos filhos via context. Filhos podem dar override.
 */
export interface ButtonGroupProps extends ButtonGroupSharedProps {
  children: ReactNode;
  className?: string;
  /**
   * Quando true, propaga `disabled` aos 2 slots. Default false.
   * Slots individuais podem ter `disabled` próprio independente desse.
   */
  disabled?: boolean;
}

/**
 * Props do slot Primary — botão da ação principal (label + onClick).
 * Aceita TODAS as props do Button exceto color/variant/size (vêm do group via context).
 * Pode dar OVERRIDE passando essas props explicitamente.
 */
export type ButtonGroupPrimaryProps = Omit<ButtonProps, "shape" | "fullWidth">;

/**
 * Props do slot Chevron — icon button com chevron-down default.
 * Largura compacta (mais estreita que icon-* size do Button).
 */
export interface ButtonGroupChevronProps
  extends Omit<ButtonProps, "shape" | "fullWidth" | "children" | "loading" | "iconLeft" | "iconRight"> {
  /**
   * Ícone do chevron — default `<ChevronDown>`. Customize se quiser usar
   * outro ícone (ex: `<MoreVertical>` pra menu kebab).
   */
  icon?: ReactNode;
  /**
   * Aria-label obrigatório — chevron é icon-only, leitor de tela precisa
   * descrever a ação.
   */
  "aria-label": string;
}
