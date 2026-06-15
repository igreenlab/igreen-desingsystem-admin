import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { icons } from "./icons";
import { iconStyles, type IconVariants } from "./icon.styles";
import type { IconProps } from "./icon.types";

const PRESETS = ["xs", "sm", "md", "lg", "xl"] as const;
const isPresetSize = (s: unknown): s is IconVariants["size"] =>
  typeof s === "string" && (PRESETS as readonly string[]).includes(s);

/**
 * Icon — biblioteca de ícones iGreen. O `name` troca o `d` do path; o `viewBox`
 * é inferido pelo prefixo (`fill-*` = 24, demais = 18). Cor por `currentColor`
 * (classe `text-*`), `tone` (token semântico) ou `color` (CSS arbitrário).
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = "md", color, tone, title, className, style, ...props }, ref) => {
    const preset = isPresetSize(size);
    const sizeStyle = preset ? undefined : { width: size, height: size };
    const viewBox = name.startsWith("fill-") ? "0 0 24 24" : "0 0 18 18";
    const decorative = !title && !props["aria-label"] && !props["aria-labelledby"];

    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        role={decorative ? undefined : "img"}
        aria-hidden={decorative ? true : undefined}
        className={cn(iconStyles({ size: preset ? size : undefined, tone }), className)}
        style={{ ...sizeStyle, ...(color ? { color } : undefined), ...style }}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <path d={icons[name]} />
      </svg>
    );
  },
);

Icon.displayName = "Icon";
