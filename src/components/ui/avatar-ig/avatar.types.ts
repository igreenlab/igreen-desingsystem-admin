import type { AvatarVariantProps } from "./avatar.styles";

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    Omit<AvatarVariantProps, "color"> {
  /**
   * Semantic color preset for bg + fg pairing.
   * Ignored when `colorHex` is provided.
   * @default "muted"
   */
  color?: "brand" | "success" | "warning" | "critical" | "info" | "muted";

  /**
   * Hex color override (e.g. person-specific color).
   * When provided, background is set via inline style and text becomes white.
   * Takes precedence over `color`.
   */
  colorHex?: string;
}
