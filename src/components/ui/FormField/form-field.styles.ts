import { tv } from "@/utils/tv";

/**
 * Form field styles — alinhado com `.tbl-form-field` do sandbox.
 *
 * Spec: flex column gap 7px (label / field / message).
 */
export const formFieldRoot = tv({
  base: "flex flex-col gap-[7px] w-full",
});

export const formFieldLabel = tv({
  base: [
    "text-body-sm font-semibold tracking-[0.01em] leading-none",
    "text-fg-default dark:text-fg-muted",
    "select-none",
  ],
  variants: {
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
});

export const formFieldRequired = tv({
  base: "ml-[2px] text-fg-danger",
});

export const formFieldMessage = tv({
  base: "text-caption-sm leading-snug",
  variants: {
    state: {
      default: "text-fg-muted",
      error:   "text-fg-danger",
      warning: "text-fg-warning",
      success: "text-fg-success",
    },
  },
  defaultVariants: { state: "default" },
});
