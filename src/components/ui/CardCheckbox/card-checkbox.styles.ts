import { tv, type VariantProps } from "@/utils/tv";

/**
 * CardCheckbox — checkbox apresentado como card clicável (área grande,
 * label + description visíveis). Mesma estética dos radio cards (border +
 * bg + padding + selected state com bg-success-muted + border-brand).
 *
 * Estados:
 *   - default: surface + border-default
 *   - hover (não-selected): border-input + bg-muted
 *   - selected (checked): bg-success-muted + border-brand + shadow-sh-sm
 *   - disabled: opacity-50
 */
export const cardCheckbox = tv({
  slots: {
    root: [
      "flex items-center gap-gp-lg w-full",
      "p-pad-xl rounded-radius-lg border text-left cursor-pointer",
      "transition-[border-color,background-color,box-shadow] duration-150",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    ],
    body: "flex flex-col flex-1 min-w-0 gap-gp-2xs",
    label:
      "text-body-sm font-semibold text-fg-default leading-tight truncate",
    description: "text-caption-md text-fg-muted",
  },
  variants: {
    selected: {
      true:  { root: "border-border-brand bg-bg-success-muted shadow-sh-sm" },
      false: {
        root: "border-border-default bg-bg-surface hover:border-border-input hover:bg-bg-muted",
      },
    },
    disabled: {
      true: { root: "opacity-50 cursor-not-allowed pointer-events-none" },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export type CardCheckboxVariants = VariantProps<typeof cardCheckbox>;
