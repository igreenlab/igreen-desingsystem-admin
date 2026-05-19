import { tv, type VariantProps } from "@/utils/tv";

export const filterRowStyles = tv({
  slots: {
    button: [
      "flex items-center gap-gp-md w-full",
      "px-pad-md py-pad-sm rounded-radius-md text-left",
      "transition-colors duration-150 cursor-pointer",
    ].join(" "),
    /** Leading slot (icon ou dot fallback). */
    leading: "shrink-0 inline-flex items-center justify-center size-[18px]",
    /** Label do filtro (ellipsis). */
    label:
      "flex-1 min-w-0 text-body-xs whitespace-nowrap overflow-hidden text-ellipsis",
    /** Dot brand 6px pra "tem novidades". */
    unreadDot: "size-[6px] rounded-radius-full bg-bg-brand shrink-0",
    /** Contador à direita. */
    count: "text-caption-sm text-fg-muted shrink-0 [font-variant-numeric:tabular-nums]",
    /** Dot fallback (quando item não tem icon). */
    fallbackDot: "size-[8px] rounded-radius-full",
  },
  variants: {
    isActive: {
      true: {
        button: "bg-bg-muted dark:bg-bg-emphasis text-fg-default font-semibold",
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

export type FilterRowVariants = VariantProps<typeof filterRowStyles>;
