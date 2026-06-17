import { tv, type VariantProps } from "@/utils/tv";

/**
 * Avatar styles — iGreen DS
 *
 * Circular badge with initials. No interactive states (no hover, no focus, no disabled).
 *
 * Size uses `size-comp-*` tokens (square: width = height):
 *   xs = 20px (comp-2xs)  |  sm = 24px (comp-xs)  |  md = 28px (comp-sm)
 *   lg = 32px (comp-md)   |  xl = 40px (comp-xl)
 *
 * Color applies bg + fg pairs from semantic tokens.
 * `_custom` is an internal-only variant used when `colorHex` overrides the
 * background via inline style — it intentionally applies no bg/fg so the
 * component can set them manually.
 *
 * Typography scales with size to keep initials proportional inside the circle.
 */
export const avatarVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "shrink-0",
    "rounded-radius-full",
    "overflow-hidden",
    "leading-none",
    "font-bold",
    "select-none",
  ],

  variants: {
    size: {
      xs: "size-comp-2xs text-caption-sm",  // 20px / 11px
      sm: "size-comp-xs  text-caption-sm",  // 24px / 11px
      md: "size-comp-sm  text-caption-sm",  // 28px / 11px — default
      lg: "size-comp-md  text-body-sm font-normal",  // 32px / 13px
      xl: "size-comp-xl  text-body-md font-medium",    // 40px / 14px
    },

    color: {
      brand:    "bg-bg-brand    text-fg-on-brand",
      success:  "bg-bg-success  text-fg-on-success",
      warning:  "bg-bg-warning  text-fg-on-warning",
      critical: "bg-bg-danger   text-fg-on-danger",
      info:     "bg-bg-info     text-fg-on-info",
      muted:    "bg-bg-muted    text-fg-muted",
      /** Internal: used by colorHex override — no bg/fg applied. */
      _custom:  "",
    },
  },

  defaultVariants: {
    size: "md",
    color: "muted",
  },
});

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;
