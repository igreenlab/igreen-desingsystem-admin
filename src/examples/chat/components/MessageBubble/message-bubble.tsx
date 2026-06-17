import { Check, CheckCheck } from "lucide-react";
import { messageBubbleStyles } from "./message-bubble.styles";
import type { MessageBubbleProps } from "./message-bubble.types";

/**
 * Balão de mensagem. Variant `from` (me|them) controla cor + alinhamento.
 * Status icons (Check / CheckCheck) renderizam apenas pra `from="me"`.
 */
export function MessageBubble({ msg }: MessageBubbleProps) {
  const from = msg.from === "me" ? "me" : "them";
  const { row, bubble, text, meta, time } = messageBubbleStyles({ from });

  return (
    <div className={row()}>
      <div className={bubble()}>
        <div className={text()}>{msg.text}</div>
        <div className={meta()}>
          <span className={time()}>{msg.time}</span>
          {from === "me" &&
            (msg.status === "read" ? (
              <CheckCheck size={12} strokeWidth={2} />
            ) : (
              <Check size={12} strokeWidth={2} />
            ))}
        </div>
      </div>
    </div>
  );
}
