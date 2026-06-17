import type { ChannelId } from "../../chat-v2.types";
import { CHANNEL_HEX, CHANNEL_LABEL } from "../../chat-v2-mocks";

export type ChannelDotProps = {
  channel: ChannelId;
  /** Quando true, mostra apenas o dot (sem label). Default: false. */
  dotOnly?: boolean;
};

/**
 * Dot 8px + label do canal. Cor vem de `CHANNEL_HEX`. Usado em
 * `ConversationListItem`, header de `ConversationColumn` e tooltips.
 */
export function ChannelDot({ channel, dotOnly = false }: ChannelDotProps) {
  return (
    <span
      className="inline-flex items-center gap-[4px] text-caption-sm text-fg-muted"
      title={CHANNEL_LABEL[channel]}
    >
      <span
        className="size-[8px] rounded-radius-full shrink-0"
        style={{ background: CHANNEL_HEX[channel] }}
        aria-hidden
      />
      {!dotOnly && CHANNEL_LABEL[channel]}
    </span>
  );
}
