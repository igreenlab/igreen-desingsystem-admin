import { forwardRef } from "react";
import { avatarVariants } from "./avatar.styles";
import type { AvatarProps } from "./avatar.types";

/**
 * Avatar — circular badge with initials.
 *
 * Supports semantic `color` presets (brand, success, warning, critical, info, muted)
 * and a `colorHex` override for person-specific hex colors.
 *
 * When `colorHex` is provided, background is set via inline style and text
 * becomes `text-white` (decorative text over solid color — analogous to L-014).
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

    const computedClassName = avatarVariants({
      size,
      color: isHex ? "_custom" : color,
      className: isHex ? ["text-white", className].filter(Boolean).join(" ") : className,
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
