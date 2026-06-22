import type { ReactNode } from "react";

import type { MessageBubbleVariantProps } from "./message-bubble.styles";

/** Lado da bolha — quem enviou. `sent` = nós (direita), `received` = contato (esquerda). */
export type MessageSide = NonNullable<MessageBubbleVariantProps["side"]>;

/** Tipo de mídia que a bolha carrega. `text` = sem mídia (só corpo). */
export type MessageMediaType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "location"
  | "vcard"
  | "contact";

/**
 * Mensagem citada (reply/quote) — renderiza como barra lateral com nome do autor
 * e prévia (truncada) do conteúdo original. `null` = sem citação.
 */
export interface QuotedMessage {
  /** Nome de quem escreveu a mensagem citada. */
  authorName?: string;
  /** Se a mensagem citada foi enviada por nós (muda a cor/label do autor). */
  fromMe?: boolean;
  /** Corpo da mensagem citada (markdown WA → prévia inline truncada). */
  body?: string;
  /** Tipo de mídia da citada — exibe rótulo (📷 Imagem, 🎵 Áudio, etc). */
  mediaType?: MessageMediaType;
  /** URL da mídia citada (thumb quando imagem). */
  mediaUrl?: string;
}

export interface MessageBubbleProps {
  /**
   * Lado da bolha. **Obrigatório.** `sent` = direita (bg success), `received` =
   * esquerda (bg surface).
   */
  side: MessageSide;
  /** Corpo textual em markdown WhatsApp (`*bold*`, `_italic_`, etc). */
  body?: string;
  /** Data/hora de criação. **Obrigatório.** Formatada como `HH:mm`. */
  createdAt: string | Date;
  /**
   * Status de entrega (0–5) → renderiza `MessageAck`. Só aparece quando
   * `side="sent"`.
   */
  ack?: 0 | 1 | 2 | 3 | 4 | 5;
  /**
   * Marca o ack como erro de envio → `MessageAck` sobrepõe o glifo com o ícone
   * de erro. Só tem efeito junto de `ack` em `side="sent"`.
   */
  ackError?: boolean;
  /** Tipo de mídia. Default `"text"`. */
  mediaType?: MessageMediaType;
  /** URL da mídia (usada pelo renderer interno). */
  mediaUrl?: string;
  /**
   * Slot de override da mídia. Quando passado, substitui o
   * `MessageMediaRenderer` interno.
   */
  media?: ReactNode;
  /** Mensagem citada (reply). `null`/omitido = sem citação. */
  quotedMessage?: QuotedMessage | null;
  /** Marca a mensagem como editada (label `editada`). */
  isEdited?: boolean;
  /**
   * Mensagem apagada → corpo/mídia/ações suprimidos, texto em itálico mudo com
   * ícone de proibido.
   */
  isDeleted?: boolean;
  /**
   * Mostra a "rabeta" (canto reto) apontando para o lado do remetente. Default
   * `true`.
   */
  tail?: boolean;
  /** Nome do autor (exibido no topo da bolha — útil em grupos). */
  authorName?: string;
  /** Slot de avatar (renderizado ao lado da bolha). */
  avatar?: ReactNode;
  /**
   * Slot de ações — vira o conteúdo de um Popover acionado por um botão que
   * aparece no hover (top-right da bolha).
   */
  actions?: ReactNode;
  /** Callback ao clicar na mídia (ex: abrir lightbox da imagem). */
  onMediaClick?: () => void;
  /** className do wrapper externo (linha inteira). */
  className?: string;
}

/** Props do renderer interno de mídia (subcomponente). */
export interface MessageMediaRendererProps {
  mediaType: MessageMediaType;
  mediaUrl?: string;
  body?: string;
  onMediaClick?: () => void;
}
