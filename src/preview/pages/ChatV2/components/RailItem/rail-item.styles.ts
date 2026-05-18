import { tv, type VariantProps } from "@/utils/tv";

export const railItemStyles = tv({
  slots: {
    button: [
      "relative grid place-items-center size-form-md rounded-radius-md cursor-pointer",
      "transition-colors duration-150",
    ].join(" "),
    /** Badge dot 6px (top-right) pra "tem novidades". */
    unreadDot:
      "absolute top-[2px] right-[2px] size-[6px] rounded-radius-full bg-bg-brand",
    /** Fallback dot (quando item não tem icon). */
    fallbackDot: "size-[10px] rounded-radius-full",
  },
  variants: {
    isActive: {
      true: {
        button: "bg-bg-muted dark:bg-bg-emphasis text-fg-default",
      },
      false: {
        button: "text-fg-muted hover:bg-bg-muted hover:text-fg-default",
      },
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

export type RailItemVariants = VariantProps<typeof railItemStyles>;
