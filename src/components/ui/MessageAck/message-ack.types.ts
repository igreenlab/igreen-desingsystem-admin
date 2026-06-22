/**
 * Valor de ack (acknowledgement) de uma mensagem, estilo WhatsApp/Baileys.
 *   0 = pendente · 1 = enviando · 2 = enviado · 3 = entregue · 4 = lido · 5 = reproduzido
 */
export type MessageAckValue = 0 | 1 | 2 | 3 | 4 | 5;

export interface MessageAckProps {
  /** Estado de entrega da mensagem (0..5). */
  ack: MessageAckValue;
  /** Quando true, sobrepõe o ack e renderiza o glifo de erro (AlertCircle). */
  error?: boolean;
  /** Classes extras aplicadas ao ícone. */
  className?: string;
}
