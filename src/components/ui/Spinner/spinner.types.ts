import type { ComponentPropsWithoutRef } from "react";
import type { SpinnerVariantProps } from "./spinner.styles";

export interface SpinnerProps
  extends Omit<ComponentPropsWithoutRef<"svg">, "color">,
    SpinnerVariantProps {
  /**
   * Rótulo acessível anunciado por leitores de tela (o SVG usa `role="status"`).
   * Default `"Carregando"`. Para um spinner puramente decorativo (ex.: dentro de
   * um botão que já tem texto "Salvando…"), passe `aria-hidden` que o `label` é
   * ignorado.
   */
  label?: string;
}
