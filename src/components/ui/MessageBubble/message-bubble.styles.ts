import { tv, type VariantProps } from "@/utils/tv";

/**
 * MessageBubble — bolha de mensagem do atendimento (chat WA).
 *
 * Anatomia (só o wrapper; MessageAck/MarkdownText/Avatar/Button/Popover trazem
 * o próprio estilo):
 *   row        = linha inteira (avatar + bolha), alinhada por `side`
 *   bubble     = a bolha em si (bg por `side`, raio com/sem rabeta por `tail`)
 *   author     = nome do autor no topo (grupos)
 *   quoted*    = barra de citação (border-l + nome + prévia)
 *   media*     = container/elementos do MessageMediaRenderer
 *   body       = corpo markdown
 *   meta       = rodapé HH:mm + label editada + MessageAck
 *   actions*   = botão de ações (hover, top-right) + Popover content
 *
 * Cor: `sent` = `bg-bg-success-muted` (verde sutil — espelha o "balão enviado"
 * do WA, claro/escuro via token). `received` = `bg-bg-surface`. Sem hardcode.
 *
 * `max-w-[70%]` é exceção documentada — não há token DS de porcentagem para
 * largura de bolha de chat (regra do domínio: bolha nunca passa de 70% da coluna).
 *
 * disabled = n/a (bolha não é controle interativo). `tail` é o único modifier
 * de raio; `side` controla bg + alinhamento + lado da rabeta.
 */
export const messageBubbleStyles = tv({
  slots: {
    row: "group/bubble flex w-full items-end gap-gp-sm",
    avatarSlot: "shrink-0 self-end",
    /* coluna da bolha — limita a 70% da largura da linha (exceção documentada) */
    column: "relative flex min-w-0 max-w-[70%] flex-col",
    bubble: [
      "relative flex min-w-0 flex-col gap-gp-xs",
      "px-pad-2xl py-pad-lg",
      "rounded-radius-md shadow-sh-sm",
      "border border-transparent",
    ],
    author: "text-caption-md font-semibold text-fg-brand",
    /* citação (reply) */
    quoted: [
      "mb-gp-xs flex min-w-0 flex-col gap-gp-xs",
      "border-l-2 border-border-brand-subtle",
      "rounded-radius-xs bg-bg-muted",
      "px-pad-lg py-pad-md",
    ],
    quotedAuthor: "truncate text-caption-sm font-semibold text-fg-brand",
    quotedPreview: "flex min-w-0 items-center gap-gp-xs",
    quotedPreviewText: "truncate text-caption-sm text-fg-muted",
    quotedThumb: "size-icon-xl shrink-0 rounded-radius-xs object-cover",
    /* mídia */
    media: "flex min-w-0 flex-col gap-gp-xs",
    mediaImage:
      "max-w-full cursor-pointer rounded-radius-sm object-cover transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
    mediaVideo:
      "max-w-full rounded-radius-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
    mediaAudio: "w-full",
    mediaDoc: [
      "flex items-center gap-gp-md",
      "rounded-radius-sm bg-bg-muted",
      "px-pad-lg py-pad-md",
    ],
    mediaDocIcon: "shrink-0 text-fg-brand",
    mediaDocInfo: "flex min-w-0 flex-col",
    mediaDocName: "truncate text-body-sm font-semibold text-fg-default",
    mediaDocHint: "text-caption-sm text-fg-muted",
    mediaLocation: [
      "flex items-center gap-gp-md",
      "rounded-radius-sm bg-bg-muted",
      "px-pad-lg py-pad-md",
      "text-body-sm text-fg-default",
      "transition-colors hover:bg-bg-muted-hover",
    ],
    mediaLocationIcon: "shrink-0 text-fg-brand",
    mediaContact: [
      "flex items-center gap-gp-md",
      "rounded-radius-sm bg-bg-muted",
      "px-pad-lg py-pad-md",
    ],
    mediaContactInfo: "flex min-w-0 flex-col",
    mediaContactName: "truncate text-body-sm font-semibold text-fg-default",
    mediaContactHint: "text-caption-sm text-fg-muted",
    /* corpo */
    body: "min-w-0 text-body-sm text-fg-default",
    /* corpo de mensagem apagada */
    deleted: [
      "flex items-center gap-gp-xs",
      "text-body-sm italic text-fg-muted",
    ],
    deletedIcon: "shrink-0",
    /* rodapé */
    meta: "mt-gp-xs flex items-center justify-end gap-gp-xs self-end",
    metaTime: "text-caption-sm text-fg-muted tabular-nums",
    metaEdited: "text-caption-sm italic text-fg-muted",
    /* ações (hover) */
    actionsTrigger: [
      "absolute right-pad-md top-pad-md",
      "opacity-0 transition-opacity",
      "group-hover/bubble:opacity-100 focus-visible:opacity-100",
    ],
    actionsContent: "flex min-w-0 flex-col gap-gp-xs",
  },
  variants: {
    side: {
      sent: {
        row: "flex-row-reverse",
        column: "items-end",
        bubble: "bg-bg-success-muted",
      },
      received: {
        row: "flex-row",
        column: "items-start",
        bubble: "bg-bg-surface",
      },
    },
    tail: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    /* rabeta = canto reto no lado de quem enviou */
    { side: "sent", tail: true, class: { bubble: "rounded-br-none" } },
    { side: "received", tail: true, class: { bubble: "rounded-bl-none" } },
  ],
  defaultVariants: {
    side: "received",
    tail: true,
  },
});

export type MessageBubbleVariantProps = VariantProps<
  typeof messageBubbleStyles
>;
