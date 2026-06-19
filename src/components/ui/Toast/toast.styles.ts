import { tv, type VariantProps } from "@/utils/tv";

/**
 * Toast (card sobre o Sonner) — superfície neutra (surface) sempre.
 * O `status` muda APENAS o icon-chip: bg fraco (`-muted`) + ícone forte (`fg-*`).
 * O card nunca é tingido (decisão de design: feedback pelo ícone, não pelo fundo).
 *
 * Slots: root · iconChip · body · header · title · meta · description · footer.
 */
export const toastVariants = tv({
  slots: {
    root: "relative flex w-full items-start gap-gp-xl rounded-radius-xl border border-border-default bg-bg-surface p-pad-2xl text-left shadow-sh-lg",
    iconChip:
      "flex size-form-md shrink-0 items-center justify-center rounded-radius-lg [&_svg]:size-[18px]",
    body: "flex min-w-0 flex-1 flex-col gap-gp-xs",
    header: "flex items-start gap-gp-md",
    title: "min-w-0 flex-1 text-body-sm font-semibold text-fg-default",
    rightCluster: "flex shrink-0 items-center gap-gp-sm",
    meta: "whitespace-nowrap text-caption-sm text-fg-subtle",
    description: "text-body-sm text-fg-muted",
    footer: "mt-gp-xs flex items-center justify-between gap-gp-md",
  },

  variants: {
    status: {
      default: { iconChip: "bg-bg-muted text-fg-default" },
      info: { iconChip: "bg-bg-info-muted text-fg-info" },
      success: { iconChip: "bg-bg-success-muted text-fg-success" },
      warning: { iconChip: "bg-bg-warning-muted text-fg-warning" },
      danger: { iconChip: "bg-bg-danger-muted text-fg-danger" },
    },
  },

  defaultVariants: {
    status: "default",
  },
});

export type ToastVariantProps = VariantProps<typeof toastVariants>;
export type ToastStatus = NonNullable<ToastVariantProps["status"]>;
