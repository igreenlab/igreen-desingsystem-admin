import { tv, type VariantProps } from "@/utils/tv";

/**
 * ConversationListItem — item de lista de conversa (Atendimento / Chat).
 *
 * Item NÃO-DataTable: linha clicável que representa um ticket/conversa, com
 * avatar, título, prévia da última mensagem (markdown WA inline truncado),
 * hora, chips de metadados (protocolo/conexão/agente/fila/tags), badge de
 * não-lidas e slot de ações (hover).
 *
 * Anatomia (só o wrapper; Avatar/Chip/Button/MarkdownText trazem o próprio visual):
 *   root      = linha clicável (grid avatar | conteúdo | trailing)
 *   media     = coluna do avatar (slot)
 *   body      = coluna central (min-w-0 pra permitir truncamento)
 *   topRow    = título + hora
 *   title     = nome do contato/conversa (truncado)
 *   time      = hora tabular (caption)
 *   preview   = prévia da última mensagem (line-clamp-1 via MarkdownText inline)
 *   badges    = faixa de chips (wrap)
 *   trailing  = coluna direita: badge não-lidas / ações (hover)
 *   unread    = badge circular de não-lidas (bg-danger)
 *   actions   = slot de ações revelado no hover
 *
 * Stripe de seleção: `before:w-[3px] before:bg-bg-brand` à esquerda — `w-[3px]`
 * é exceção válida (pseudo-element posicional fino, ver ds-standards "Exceções
 * de hardcode válidas"). `max-w` da bolha não se aplica aqui (isso é da MessageBubble).
 *
 * Foco: Padrão 1 (linha clicável = botão) — outline-none + ring-4 brand.
 * `disabled` é o ÚLTIMO compoundVariant (L-006).
 */
export const conversationListItemStyles = tv({
  slots: {
    root: [
      "group/cli relative w-full text-left",
      "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start",
      "gap-gp-lg px-pad-2xl",
      "rounded-radius-md border border-transparent",
      "transition-[background-color,box-shadow] duration-150",
      // stripe de seleção (oculto por padrão)
      "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0",
      "before:w-[3px] before:rounded-r-radius-xs before:bg-transparent",
      "before:transition-colors before:pointer-events-none",
      // hover
      "hover:bg-bg-muted",
      // foco (Padrão 1)
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
    ],
    media: "flex shrink-0 items-center",
    body: "flex min-w-0 flex-col gap-gp-xs",
    topRow: "flex min-w-0 items-center gap-gp-md",
    title: "min-w-0 flex-1 truncate text-body-sm font-semibold text-fg-default",
    time: "shrink-0 text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums]",
    preview: "min-w-0 text-body-xs text-fg-muted [&_*]:line-clamp-1 line-clamp-1",
    badges: "flex flex-wrap items-center gap-gp-xs",
    trailing: "flex shrink-0 flex-col items-end gap-gp-xs",
    unread: [
      // count-badge: dimensões finas alinhadas ao padrão de contadores do DS
      // (Chip/Table usam min-w-[18px] h-[18px] px-[5px] — exceção posicional fina)
      "inline-flex items-center justify-center",
      "min-w-[18px] h-[18px] px-[5px]",
      "rounded-radius-full",
      "bg-bg-danger text-fg-on-danger",
      "text-caption-xs font-semibold [font-variant-numeric:tabular-nums]",
    ],
    actions: [
      "flex items-center gap-gp-xs",
      // revelado no hover/focus-within da linha
      "opacity-0 transition-opacity duration-150",
      "group-hover/cli:opacity-100 group-focus-within/cli:opacity-100",
    ],
  },
  variants: {
    variant: {
      // ticket: layout completo (badges + ações), default
      ticket: {},
      // chat: lista mais simples (DM-style) — body um pouco mais apertado
      chat: { body: "gap-gp-2xs" },
    },
    density: {
      comfortable: { root: "py-pad-lg", media: "py-[2px]" },
      compact: { root: "py-pad-md" },
    },
    selected: {
      true: { root: "bg-bg-muted before:bg-bg-brand" },
      false: {},
    },
    unread: {
      true: { title: "font-bold text-fg-default", preview: "text-fg-default font-medium" },
      false: {},
    },
    disabled: {
      true: { root: "pointer-events-none opacity-50 cursor-not-allowed" },
      false: {},
    },
  },
  compoundVariants: [
    // disabled SEMPRE por último (L-006)
    {
      disabled: true,
      class: {
        root: "hover:bg-transparent before:bg-transparent",
        actions: "opacity-0",
      },
    },
  ],
  defaultVariants: {
    variant: "ticket",
    density: "comfortable",
    selected: false,
    unread: false,
    disabled: false,
  },
});

export type ConversationListItemVariantProps = VariantProps<
  typeof conversationListItemStyles
>;
