import { tv, type VariantProps } from "@/utils/tv";

export const messageBubbleStyles = tv({
  slots: {
    /** Wrapper que controla o alinhamento horizontal (esquerda/direita). */
    row: "flex",
    /** Balão em si — variants definem cor + corner pointer. */
    bubble:
      "max-w-[70%] px-pad-xl py-pad-md rounded-radius-xl shadow-sh-sm",
    /** Texto da mensagem. */
    text: "text-body-md leading-[1.45] whitespace-pre-wrap break-words",
    /** Footer com horário + status icon. */
    meta: "flex items-center justify-end gap-[4px] mt-[2px] text-caption-xs",
    /** Span do horário (tabular-nums pra alinhar). */
    time: "[font-variant-numeric:tabular-nums]",
  },
  variants: {
    from: {
      me: {
        row: "justify-end",
        bubble: "bg-bg-brand text-fg-on-brand rounded-br-[4px]",
        meta: "text-fg-on-brand opacity-80",
      },
      them: {
        row: "justify-start",
        bubble:
          "bg-bg-surface text-fg-default border border-border-subtle rounded-bl-[4px]",
        meta: "text-fg-muted",
      },
    },
  },
  defaultVariants: {
    from: "them",
  },
});

export type MessageBubbleVariants = VariantProps<typeof messageBubbleStyles>;
