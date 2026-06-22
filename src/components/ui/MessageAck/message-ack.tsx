import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageAckStyles } from "./message-ack.styles";
import type { MessageAckProps } from "./message-ack.types";

/**
 * MessageAck — glifo de status/ack de mensagem (estilo WhatsApp).
 *
 * Mapeia o valor de `ack` (0..5) para ícone + cor semântica:
 *   - 0|1 → Clock (pendente/enviando, fg-muted)
 *   - 2   → Check (enviado, fg-muted)
 *   - 3   → CheckCheck (entregue, fg-muted)
 *   - 4|5 → CheckCheck (lido/reproduzido, fg-success)
 *
 * `error` sobrepõe o ack e mostra AlertCircle (fg-danger).
 * Decorativo por padrão (aria-hidden) — o status é comunicado pelo timestamp/contexto.
 */
export const MessageAck = ({ ack, error = false, className }: MessageAckProps) => {
  if (error) {
    const styles = messageAckStyles({ tone: "danger" });
    return <AlertCircle aria-hidden className={cn(styles.icon(), className)} />;
  }

  const tone = ack >= 4 ? "success" : "muted";
  const styles = messageAckStyles({ tone });
  const iconClassName = cn(styles.icon(), className);

  if (ack >= 4) return <CheckCheck aria-hidden className={iconClassName} />;
  if (ack === 3) return <CheckCheck aria-hidden className={iconClassName} />;
  if (ack === 2) return <Check aria-hidden className={iconClassName} />;
  return <Clock aria-hidden className={iconClassName} />;
};

MessageAck.displayName = "MessageAck";
