import { tv, type VariantProps } from "@/utils/tv";

/**
 * MessageAck styles — glifo de status/ack de mensagem (estilo WhatsApp).
 *
 * Slot único `icon`: define tamanho (size-icon-xs) + cor por estado de ack.
 * A cor é mapeada via variante `tone`, derivada do valor de `ack` (0..5) ou
 * do estado de erro pelo componente.
 *
 *   - ack 0|1  → Clock        → tone "muted"   (pendente/enviando)
 *   - ack 2    → Check        → tone "muted"   (enviado ao servidor)
 *   - ack 3    → CheckCheck   → tone "muted"   (entregue)
 *   - ack 4|5  → CheckCheck   → tone "success" (lido/reproduzido)
 *   - error    → AlertCircle  → tone "danger"  (falha no envio)
 *
 * Cores claro/escuro resolvidas pelos tokens semânticos (fg-muted/success/danger).
 */
export const messageAckStyles = tv({
  slots: {
    icon: "inline-block shrink-0 align-middle size-icon-xs",
  },
  variants: {
    tone: {
      muted:   { icon: "text-fg-muted" },
      success: { icon: "text-fg-success" },
      danger:  { icon: "text-fg-danger" },
    },
  },
  defaultVariants: { tone: "muted" },
});

export type MessageAckVariantProps = VariantProps<typeof messageAckStyles>;
