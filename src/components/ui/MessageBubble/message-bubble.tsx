import { useState, type KeyboardEvent } from "react";
import { Ban, Reply, MoreVertical } from "lucide-react";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/shadcn/popover";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MessageAck } from "@/components/ui/MessageAck";
import { MarkdownText } from "@/components/ui/MarkdownText";

import { messageBubbleStyles } from "./message-bubble.styles";
import type {
  MessageBubbleProps,
  MessageMediaRendererProps,
  MessageMediaType,
} from "./message-bubble.types";

const styles = messageBubbleStyles();

/**
 * Ativa um callback de clique de mídia via teclado (Enter/Space) — necessário
 * pois `<img>`/`<video>` clicáveis não são focáveis/operáveis por teclado por
 * padrão (a11y: par de `role="button" tabIndex={0}`).
 */
function handleMediaKeyDown(
  event: KeyboardEvent,
  onMediaClick?: () => void,
): void {
  if (!onMediaClick) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onMediaClick();
  }
}

/** Formata um `Date`/string ISO em `HH:mm` (24h, locale pt-BR). */
function formatTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Rótulo curto do tipo de mídia (usado na prévia da citação). */
const MEDIA_LABEL: Record<MessageMediaType, string> = {
  text: "",
  image: "Imagem",
  audio: "Áudio",
  video: "Vídeo",
  document: "Documento",
  location: "Localização",
  vcard: "Contato",
  contact: "Contato",
};

/**
 * MessageMediaRenderer — subcomponente INTERNO. Faz switch por `mediaType` e
 * desenha a mídia adequada (thumb clicável, player nativo, card de doc/local/
 * contato). Não é exportado: a API pública passa por `MessageBubble` (slot
 * `media` faz override completo quando necessário).
 */
function MessageMediaRenderer({
  mediaType,
  mediaUrl,
  body,
  onMediaClick,
}: MessageMediaRendererProps) {
  switch (mediaType) {
    case "image":
      return (
        <div className={styles.media()}>
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt={body || "Imagem"}
              className={styles.mediaImage()}
              role={onMediaClick ? "button" : undefined}
              tabIndex={onMediaClick ? 0 : undefined}
              onClick={onMediaClick}
              onKeyDown={(e) => handleMediaKeyDown(e, onMediaClick)}
            />
          ) : null}
        </div>
      );

    case "audio":
      return (
        <div className={styles.media()}>
          {mediaUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <audio controls src={mediaUrl} className={styles.mediaAudio()} />
          ) : null}
        </div>
      );

    case "video":
      return (
        <div className={styles.media()}>
          {mediaUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              controls
              src={mediaUrl}
              className={styles.mediaVideo()}
              role={onMediaClick ? "button" : undefined}
              tabIndex={onMediaClick ? 0 : undefined}
              onClick={onMediaClick}
              onKeyDown={(e) => handleMediaKeyDown(e, onMediaClick)}
            />
          ) : null}
        </div>
      );

    case "document":
      return (
        <div className={styles.mediaDoc()}>
          <Icon
            name="line-file"
            size="lg"
            className={styles.mediaDocIcon()}
          />
          <div className={styles.mediaDocInfo()}>
            <span className={styles.mediaDocName()}>{body || "Documento"}</span>
            <span className={styles.mediaDocHint()}>Toque para baixar</span>
          </div>
          {mediaUrl ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              color="primary"
              aria-label="Baixar documento"
              onClick={onMediaClick}
            >
              <Icon name="line-download-01" size="sm" />
            </Button>
          ) : null}
        </div>
      );

    case "location":
      return mediaUrl ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mediaLocation()}
          onClick={onMediaClick}
        >
          <Icon
            name="line-pin"
            size="md"
            className={styles.mediaLocationIcon()}
          />
          <span>{body || "Ver localização"}</span>
        </a>
      ) : (
        <div className={styles.mediaLocation()}>
          <Icon
            name="line-pin"
            size="md"
            className={styles.mediaLocationIcon()}
          />
          <span>{body || "Localização"}</span>
        </div>
      );

    case "vcard":
    case "contact":
      return (
        <div className={styles.mediaContact()}>
          <Icon
            name="line-user"
            size="lg"
            className={styles.mediaDocIcon()}
          />
          <div className={styles.mediaContactInfo()}>
            <span className={styles.mediaContactName()}>
              {body || "Contato"}
            </span>
            <span className={styles.mediaContactHint()}>Cartão de contato</span>
          </div>
        </div>
      );

    case "text":
    default:
      return null;
  }
}

/**
 * MessageBubble — bolha de mensagem do atendimento (chat WhatsApp).
 *
 * Compõe `MessageAck` (status de entrega, só em `side="sent"`), `MarkdownText`
 * (corpo + prévia de citação com markdown WA sanitizado), `Icon`/`Button`/
 * `Popover` (ações no hover) e o subcomponente interno `MessageMediaRenderer`.
 *
 * Toda a aparência vem de `message-bubble.styles.ts` (tokens DS). A única
 * exceção de hardcode é `max-w-[70%]` na coluna da bolha — não há token de
 * porcentagem para largura de balão de chat.
 */
export function MessageBubble({
  side,
  body,
  createdAt,
  ack,
  ackError,
  mediaType = "text",
  mediaUrl,
  media,
  quotedMessage,
  isEdited = false,
  isDeleted = false,
  tail = true,
  authorName,
  avatar,
  actions,
  onMediaClick,
  className,
}: MessageBubbleProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const s = messageBubbleStyles({ side, tail });

  const time = formatTime(createdAt);
  const hasMedia = !isDeleted && mediaType !== "text";
  const showAck = side === "sent" && ack !== undefined && !isDeleted;

  return (
    <div className={s.row({ className })}>
      {avatar ? <div className={s.avatarSlot()}>{avatar}</div> : null}

      <div className={s.column()}>
        <div className={s.bubble()}>
          {/* ações no hover (top-right) */}
          {actions && !isDeleted ? (
            <Popover
              open={actionsOpen}
              onOpenChange={setActionsOpen}
              modal={false}
            >
              <PopoverAnchor asChild>
                <Button
                  type="button"
                  size="2xs"
                  variant="ghost"
                  color="secondary"
                  aria-label="Ações da mensagem"
                  aria-haspopup="menu"
                  aria-expanded={actionsOpen}
                  className={s.actionsTrigger()}
                  onClick={() => setActionsOpen((o) => !o)}
                >
                  <MoreVertical aria-hidden="true" />
                </Button>
              </PopoverAnchor>
              <PopoverContent
                align={side === "sent" ? "end" : "start"}
                role="menu"
                className={s.actionsContent()}
              >
                {actions}
              </PopoverContent>
            </Popover>
          ) : null}

          {/* nome do autor (grupos) */}
          {authorName && !isDeleted ? (
            <span className={s.author()}>{authorName}</span>
          ) : null}

          {/* citação / reply */}
          {quotedMessage && !isDeleted ? (
            <div className={s.quoted()}>
              {quotedMessage.authorName ? (
                <span className={s.quotedAuthor()}>
                  {quotedMessage.fromMe ? "Você" : quotedMessage.authorName}
                </span>
              ) : null}
              <div className={s.quotedPreview()}>
                {quotedMessage.mediaType === "image" &&
                quotedMessage.mediaUrl ? (
                  <img
                    src={quotedMessage.mediaUrl}
                    alt=""
                    className={s.quotedThumb()}
                  />
                ) : null}
                <span className={s.quotedPreviewText()}>
                  {quotedMessage.body ? (
                    <MarkdownText inline>{quotedMessage.body}</MarkdownText>
                  ) : (
                    MEDIA_LABEL[quotedMessage.mediaType ?? "text"] || "Mensagem"
                  )}
                </span>
              </div>
            </div>
          ) : null}

          {/* corpo / mídia */}
          {isDeleted ? (
            <span className={s.deleted()}>
              <Ban className={s.deletedIcon()} aria-hidden="true" />
              Mensagem apagada
            </span>
          ) : (
            <>
              {hasMedia
                ? (media ?? (
                    <MessageMediaRenderer
                      mediaType={mediaType}
                      mediaUrl={mediaUrl}
                      body={body}
                      onMediaClick={onMediaClick}
                    />
                  ))
                : null}
              {body && (mediaType === "text" || !hasMedia) ? (
                <MarkdownText className={s.body()}>{body}</MarkdownText>
              ) : null}
            </>
          )}

          {/* rodapé: hora + editada + ack */}
          <div className={s.meta()}>
            {isEdited && !isDeleted ? (
              <span className={s.metaEdited()}>editada</span>
            ) : null}
            <span className={s.metaTime()}>{time}</span>
            {showAck ? <MessageAck ack={ack} error={ackError} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

MessageBubble.displayName = "MessageBubble";

/** Re-export do ícone de reply para consumidores montarem `actions`. */
export { Reply as MessageReplyIcon };
