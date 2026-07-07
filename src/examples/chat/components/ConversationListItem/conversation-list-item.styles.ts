import { tv, type VariantProps } from "@/utils/tv";

export const conversationListItemStyles = tv({
  slots: {
    /** Card raiz (button) — flex horizontal com avatar + conteúdo. */
    root: [
      "group/conv text-left relative",
      "flex gap-gp-md p-pad-md rounded-radius-md",
      "cursor-pointer transition-colors duration-150",
    ].join(" "),
    /** Coluna direita (3 rows). */
    content: "flex-1 min-w-0 flex flex-col gap-[3px]",
    /** Row 1 — nome + horário. */
    rowTop: "flex items-center gap-gp-sm",
    /** Nome (ellipsis). */
    name: "text-body-sm font-semibold text-fg-default whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0",
    /** Horário. */
    time: "text-caption-sm text-fg-muted shrink-0 [font-variant-numeric:tabular-nums]",
    /** Row 2 — preview + badge unread. */
    rowMid: "flex items-center gap-gp-sm",
    /** Preview da última mensagem (ellipsis). */
    preview:
      "text-body-xs font-normal text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0",
    /** Badge contador de não lidas — `caption-xs` (10/400) + override
        `font-bold leading-none` pra centralizar o número dentro do círculo.
        Tabular-nums alinha dígitos verticalmente em badges com counters dinâmicos. */
    unread:
      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-radius-full bg-bg-brand text-fg-on-brand text-caption-xs font-bold leading-none shrink-0 [font-variant-numeric:tabular-nums]",
    /** Row 3 — canal + tag + ID. */
    rowBot: "flex items-center gap-gp-sm",
    /** ID da conversa (canto inferior direito). */
    id: "ml-auto text-caption-xs text-fg-subtle shrink-0 [font-variant-numeric:tabular-nums]",
  },
  variants: {
    isActive: {
      true: {
        root: [
          "bg-bg-muted dark:bg-bg-emphasis",
          "before:content-[''] before:absolute before:left-0 before:top-[10px] before:bottom-[10px]",
          "before:w-[3px] before:bg-bg-brand before:rounded-r-[2px] before:pointer-events-none",
        ].join(" "),
      },
      false: {
        root: "hover:bg-bg-muted",
      },
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

export type ConversationListItemVariants = VariantProps<
  typeof conversationListItemStyles
>;
