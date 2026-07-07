import { forwardRef } from "react";
import { getContrastTextColor } from "@/utils/color-contrast";
import { avatarVariants } from "./avatar.styles";
import type { AvatarProps } from "./avatar.types";

/**
 * Avatar — circular badge with initials.
 *
 * Supports semantic `color` presets (brand, success, warning, critical, info, muted)
 * and a `colorHex` override for person-specific hex colors.
 *
 * Auto contrast (v0.7.1, L-027): quando `colorHex` é fornecido, calcula o
 * contraste WCAG entre branco/preto e o bg, escolhendo a cor de texto com
 * MAIOR ratio. Antes aplicava `text-white` cego — quebrava em cores claras
 * (ex: BB amarelo #FAE128 → ratio 1.29:1, falha WCAG AA). Agora respeita
 * o threshold dinâmico baseado em luminância (Y > 0.5 → preto, else branco).
 *
 * Override: pra forçar uma cor específica (caso de marca que exige X), passe
 * `className` com classe Tailwind `text-X` — ela sobrescreve a auto-pickada
 * pela ordem de cascade.
 *
 * Accessibility:
 * - With `aria-label` → role="img" (semantic avatar)
 * - Without `aria-label` → aria-hidden="true" (decorative, inside a card/cell)
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(
    {
      size,
      color,
      colorHex,
      children,
      className,
      style,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const isHex = typeof colorHex === "string" && colorHex.startsWith("#");

    // Cor de texto auto-calculada quando hex é fornecido — sempre o maior
    // contraste WCAG entre white/black. Fallback "white" pra hex inválido
    // (preserva comportamento legado).
    const autoTextClass = isHex
      ? getContrastTextColor(colorHex) === "black"
        ? "text-black"
        : "text-white"
      : null;

    const computedClassName = avatarVariants({
      size,
      color: isHex ? "_custom" : color,
      className: isHex
        ? [autoTextClass, className].filter(Boolean).join(" ")
        : className,
    });

    const computedStyle = isHex
      ? { ...style, backgroundColor: colorHex }
      : style;

    return (
      <div
        ref={ref}
        className={computedClassName}
        style={computedStyle}
        {...(ariaLabel
          ? { role: "img", "aria-label": ariaLabel }
          : { "aria-hidden": true as const })}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
