import { Chip } from "@/components/ui/Chip";
import { ChannelDot } from "../ChannelDot/channel-dot";
import { PersonAvatar } from "../PersonAvatar";
import { conversationListItemStyles } from "./conversation-list-item.styles";
import type { ConversationListItemProps } from "./conversation-list-item.types";

/**
 * Item da fila de conversas. Avatar (36px) à esquerda + 3 rows de info à direita.
 * Variant `isActive` adiciona strip lateral brand de 3px + bg muted.
 */
export function ConversationListItem({
  conv,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  const s = conversationListItemStyles({ isActive });

  return (
    <button
      type="button"
      onClick={() => onSelect(conv.id)}
      className={s.root()}
      aria-pressed={isActive}
    >
      <PersonAvatar initials={conv.initials} hex={conv.avatarHex} size="md" />

      <div className={s.content()}>
        <div className={s.rowTop()}>
          <span className={s.name()}>{conv.name}</span>
          <span className={s.time()}>{conv.time}</span>
        </div>

        <div className={s.rowMid()}>
          <span className={s.preview()}>{conv.last}</span>
          {conv.unread > 0 && (
            <span className={s.unread()} aria-label={`${conv.unread} não lidas`}>
              {conv.unread}
            </span>
          )}
        </div>

        <div className={s.rowBot()}>
          <ChannelDot channel={conv.channel} />
          <Chip color={conv.tagKind} variant="soft" size="sm" shape="pill">
            {conv.tag}
          </Chip>
          <span className={s.id()}>{conv.id}</span>
        </div>
      </div>
    </button>
  );
}
