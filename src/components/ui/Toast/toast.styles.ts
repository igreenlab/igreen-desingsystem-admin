import { tv, type VariantProps } from "@/utils/tv";

/**
 * Toast (card sobre o Sonner) — superfície neutra (surface) sempre.
 * O `status` muda APENAS o icon-chip: bg fraco (`-muted`) + ícone forte (`fg-*`).
 * O card nunca é tingido (decisão de design: feedback pelo ícone, não pelo fundo).
 *
 * Layout: root = COLUNA. Linha principal (`row`) centralizada verticalmente
 * (ícone · [título+descrição juntos no `content`] · meta/ação-inline/close).
 * Quando há 2 botões, eles vão no `footer` ABAIXO da linha, alinhados à direita
 * com gap de 4px. A descrição vive dentro do `content` (flex-1) → quebra linha,
 * nunca passa por baixo do botão inline.
 *
 * Slots: root · row · iconChip · content · title · description · rightCluster · meta · footer.
 */
export const toastVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-gp-md rounded-radius-xl border border-border-default bg-bg-surface p-pad-2xl text-left shadow-sh-lg",
    row: "flex items-center gap-gp-xl",
    iconChip:
      "flex size-form-md shrink-0 items-center justify-center rounded-radius-lg [&_svg]:size-[18px]",
    content: "flex min-w-0 flex-1 flex-col gap-gp-2xs",
    title: "text-body-sm font-semibold text-fg-default",
    description: "text-body-sm text-fg-muted",
    rightCluster: "flex shrink-0 items-center gap-gp-sm",
    meta: "whitespace-nowrap text-caption-sm text-fg-subtle",
    footer: "flex items-center justify-end gap-gp-xs",
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
