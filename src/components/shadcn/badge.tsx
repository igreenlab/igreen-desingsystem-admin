import * as React from "react";
import { tv, type VariantProps } from "@/utils/tv";

/**
 * Badge — pill/tag visual indicator alinhado com sandbox.
 *
 * Patterns suportados:
 *   - Counter (.tbl-page-count): default shape (radius-sm 6px), soft primary
 *   - Status chip (.chip): shape="pill" (radius-full), soft + colored
 *   - Inline tag: default shape, qualquer cor
 *
 * API:
 *   color:   primary | secondary | critical | success | warning | info
 *   variant: solid | soft | outline | ghost
 *   size:    sm (20px) | md (24px, default) | lg (28px)
 *   shape:   default (radius 6px) | pill (radius full)
 */
const badgeVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "border border-transparent",
    "font-semibold leading-none whitespace-nowrap",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],

  variants: {
    color: {
      primary: "",
      secondary: "",
      critical: "",
      success: "",
      warning: "",
      info: "",
    },

    variant: {
      solid: "",
      soft: "",
      outline: "bg-transparent",
      ghost: "bg-transparent border-transparent",
    },

    size: {
      sm: "h-comp-2xs px-pad-sm text-caption-xs gap-gp-2xs [&_svg]:size-3",     // 20px / 6 / 10
      md: "h-comp-xs px-pad-md text-body-xs gap-gp-xs [&_svg]:size-3.5",  // 24px / 8 / 12 (default)
      lg: "h-comp-sm px-pad-lg text-body-sm font-normal gap-gp-sm [&_svg]:size-4",      // 28px / 10 / 13
    },

    shape: {
      default: "rounded-radius-sm",   // 6px — counter, value tags
      pill: "rounded-radius-full",    // pill — status chips
    },
  },

  compoundVariants: [
    /* ── Primary (brand) ─────────────────────────────────────────────── */
    { color: "primary", variant: "solid",   class: "bg-bg-brand text-fg-on-brand" },
    { color: "primary", variant: "soft",    class: "bg-bg-brand-subtle text-fg-brand" },
    { color: "primary", variant: "outline", class: "border-border-brand text-fg-brand" },
    { color: "primary", variant: "ghost",   class: "text-fg-brand" },

    /* ── Secondary (neutral) ─────────────────────────────────────────── */
    { color: "secondary", variant: "solid",   class: "bg-bg-emphasis text-fg-default" },
    { color: "secondary", variant: "soft",    class: "bg-bg-muted text-fg-muted" },
    { color: "secondary", variant: "outline", class: "border-border-default text-fg-default" },
    { color: "secondary", variant: "ghost",   class: "text-fg-muted" },

    /* ── Critical (danger) ───────────────────────────────────────────── */
    { color: "critical", variant: "solid",   class: "bg-bg-danger text-fg-on-danger" },
    { color: "critical", variant: "soft",    class: "bg-bg-danger-muted text-fg-danger" },
    { color: "critical", variant: "outline", class: "border-border-danger-muted text-fg-danger" },
    { color: "critical", variant: "ghost",   class: "text-fg-danger" },

    /* ── Success ─────────────────────────────────────────────────────── */
    { color: "success", variant: "solid",   class: "bg-bg-success text-fg-on-success" },
    { color: "success", variant: "soft",    class: "bg-bg-success-muted text-fg-success" },
    { color: "success", variant: "outline", class: "border-border-success-muted text-fg-success" },
    { color: "success", variant: "ghost",   class: "text-fg-success" },

    /* ── Warning ─────────────────────────────────────────────────────── */
    { color: "warning", variant: "solid",   class: "bg-bg-warning text-fg-on-warning" },
    { color: "warning", variant: "soft",    class: "bg-bg-warning-muted text-fg-warning" },
    { color: "warning", variant: "outline", class: "border-border-warning-muted text-fg-warning" },
    { color: "warning", variant: "ghost",   class: "text-fg-warning" },

    /* ── Info ────────────────────────────────────────────────────────── */
    { color: "info", variant: "solid",   class: "bg-bg-info text-fg-on-info" },
    { color: "info", variant: "soft",    class: "bg-bg-info-muted text-fg-info" },
    { color: "info", variant: "outline", class: "border-border-info-muted text-fg-info" },
    { color: "info", variant: "ghost",   class: "text-fg-info" },
  ],

  defaultVariants: {
    color: "secondary",
    variant: "soft",
    size: "md",
    shape: "default",
  },
});

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    BadgeVariantProps {
  asChild?: boolean;
}

function Badge({ className, color, variant, size, shape, ...props }: BadgeProps) {
  return (
    <span
      className={badgeVariants({ color, variant, size, shape, className })}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
