import { tv } from "@/utils/tv";

/**
 * Ícone circular (56x56) com bg-tone-muted + fg-tone.
 * Alinhado com `.tbl-confirm-icon` do sandbox.
 */
export const alertModalIcon = tv({
  base: [
    "inline-flex items-center justify-center",
    "size-[56px] shrink-0 rounded-radius-full",
    "[&_svg]:size-[26px]",
  ],
  variants: {
    tone: {
      default: "bg-bg-brand-subtle text-fg-brand",
      neutral: "bg-bg-muted text-fg-muted",
      danger:  "bg-bg-danger-muted text-fg-danger",
      warning: "bg-bg-warning-muted text-fg-warning",
      success: "bg-bg-success-muted text-fg-success",
    },
  },
  defaultVariants: { tone: "default" },
});
