import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { iconStyles, type IconVariants } from "./icon.styles";
import type { IconSvgProps } from "./icon.types";

const PRESETS = ["xs", "sm", "md", "lg", "xl"] as const;
const isPresetSize = (s: unknown): s is IconVariants["size"] =>
  typeof s === "string" && (PRESETS as readonly string[]).includes(s);

/**
 * Conjunto legado de ícones desenhados em viewBox 18 (primeiros `line-*` da
 * iGreen). Todo o resto — `fill-*` e os `line-*` convertidos do Figma — é 24.
 * Mantido explícito porque o prefixo não distingue 18 de 24 (ambos usam `line-`).
 */
const VIEWBOX_18 = new Set([
  "line-outline", "line-close", "line-id", "line-help", "line-camera", "line-edit",
  "line-upload-document", "line-add", "line-remove", "line-arrow-down", "line-key",
  "line-bin", "line-status", "line-user", "line-building", "line-loading",
  "line-calendar", "line-mail", "line-phone", "line-check", "line-circle-arrow-right",
  "line-edit-doc", "line-arrow-back",
]);

/**
 * IconSvg — desenha um ícone a partir do DADO (`glyph`), sem passar pelo mapa por
 * nome. É o que o `<Icon name>` renderiza por baixo, e o que componente do DS usa
 * direto com uma constante de `icon-glyphs.ts` — assim o mapa de 2.404 ícones não
 * entra no bundle de quem só usou, digamos, o `FileUploadField`.
 *
 * `viewBox` é 18 só para o conjunto legado (`VIEWBOX_18`), senão 24. Cor por
 * `currentColor` (classe `text-*`), `tone` (token semântico) ou `color` (CSS
 * arbitrário). `glyph.d` pode ser uma string (1 path) ou um array (multi-path).
 */
export const IconSvg = forwardRef<SVGSVGElement, IconSvgProps>(
  ({ glyph, size = "md", color, tone, title, className, style, ...props }, ref) => {
    const preset = isPresetSize(size);
    const sizeStyle = preset ? undefined : { width: size, height: size };
    const viewBox = VIEWBOX_18.has(glyph.name) ? "0 0 18 18" : "0 0 24 24";
    const decorative = !title && !props["aria-label"] && !props["aria-labelledby"];
    const paths = Array.isArray(glyph.d) ? glyph.d : [glyph.d];

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
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  },
);

IconSvg.displayName = "IconSvg";
