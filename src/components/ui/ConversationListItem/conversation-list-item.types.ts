import type { ReactNode } from "react";
import type { ConversationListItemVariantProps } from "./conversation-list-item.styles";

/** Variante de layout do item. */
export type ConversationListItemVariant = "ticket" | "chat";

/** Densidade vertical do item. */
export type ConversationListItemDensity = "comfortable" | "compact";

/**
 * Dados do avatar quando passado como objeto (atalho).
 * Para casos custom, passe um `ReactNode` direto em `avatar`.
 */
export interface ConversationListItemAvatar {
  /** URL da imagem (profilePicUrl). */
  src?: string;
  /** Nome — usado para iniciais e `aria-label`. */
  name?: string;
  /** Cor hex específica da pessoa/marca (vira bg do Avatar via inline style). */
  colorHex?: string;
}

export interface ConversationListItemProps
  extends Omit<
    ConversationListItemVariantProps,
    "selected" | "disabled" | "unread"
  > {
  /** Título — nome do contato/conversa. Obrigatório. */
  title: string;

  /**
   * Avatar. Objeto `{ src?, name?, colorHex? }` (atalho que renderiza o Avatar
   * do DS) OU um `ReactNode` custom. Omitido → sem coluna de avatar.
   */
  avatar?: ConversationListItemAvatar | ReactNode;

  /**
   * Prévia da última mensagem (markdown WA). Renderizada via `MarkdownText`
   * inline truncado em 1 linha (`line-clamp-1`).
   */
  preview?: string;

  /** Hora da última mensagem (já formatada — ex `14:32` ou `21/06`). */
  time?: string;

  /**
   * Slot de chips de metadados (protocolo, conexão, agente, fila, tags).
   * Renderizar `<Chip>`s do DS aqui.
   */
  badges?: ReactNode;

  /** Quantidade de mensagens não lidas. `> 0` → badge danger; `0`/undefined → sem badge. */
  unread?: number;

  /** Variante de layout. @default "ticket" */
  variant?: ConversationListItemVariant;

  /** Densidade vertical. @default "comfortable" */
  density?: ConversationListItemDensity;

  /** Item selecionado → stripe brand 3px à esquerda + bg muted. */
  selected?: boolean;

  /** Desabilita interação (último compoundVariant, L-006). */
  disabled?: boolean;

  /**
   * Slot de ações revelado no hover/focus (ex: botões editar/excluir ou menu).
   * Renderizar `<Button>`/`<Icon>`/menu do DS aqui.
   */
  actions?: ReactNode;

  /** Handler de clique na linha. */
  onClick?: () => void;

  /** Classe extra no root. */
  className?: string;
}
