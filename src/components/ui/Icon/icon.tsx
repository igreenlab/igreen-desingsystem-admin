import { forwardRef } from "react";
import { icons } from "./icons";
import { IconSvg } from "./icon-svg";
import type { IconProps } from "./icon.types";

/**
 * Icon — biblioteca de ícones iGreen, resolvida por NOME: o `name` busca o(s)
 * path(s) em `icons[name]` e o desenho fica com o `IconSvg` (viewBox, tamanho,
 * cor, acessibilidade).
 *
 * ⚠️ Resolver por nome amarra o mapa INTEIRO (2.404 ícones, ~4,3 MB) ao bundle de
 * quem importa este componente — bundler não poda chave de objeto. Dentro de
 * componente do DS, com ícone fixo, use `IconSvg` + constante de `icon-glyphs.ts`.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(({ name, ...props }, ref) => (
  <IconSvg ref={ref} glyph={{ name, d: icons[name] }} {...props} />
));

Icon.displayName = "Icon";
