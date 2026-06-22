import type { ReactNode, KeyboardEvent } from "react";
import type { MessageComposerVariantProps } from "./message-composer.styles";

/** Estado do composer. `open` = editável · `disabled` = bloqueado · `read-only` = sem campo (mostra banner). */
export type MessageComposerState = NonNullable<
  MessageComposerVariantProps["state"]
>;

/** Tamanho do composer (altura/padding do field e da textarea). */
export type MessageComposerSize = NonNullable<
  MessageComposerVariantProps["size"]
>;

export interface MessageComposerProps {
  /** Texto controlado da mensagem. Obrigatório. */
  value: string;
  /** Chamado a cada alteração do texto. Obrigatório. */
  onChange: (value: string) => void;
  /**
   * Chamado ao enviar (Enter sem Shift, ou clique no botão de envio).
   * O composer NÃO valida regra de negócio — só dispara quando há texto e não está disabled.
   */
  onSend: () => void;
  /**
   * Handler adicional de teclado na textarea. Executa ANTES da lógica interna de
   * Enter→onSend; chame `e.preventDefault()` aqui para suprimir o envio padrão.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Placeholder da textarea. */
  placeholder?: string;
  /**
   * Estado do composer. `open` (default) edita · `disabled` bloqueia o campo ·
   * `read-only` esconde o campo e exibe somente o `banner`.
   */
  state?: MessageComposerState;
  /** Tamanho. `sm` = field compacto · `md` (default) = padrão. */
  size?: MessageComposerSize;
  /** Slot à esquerda da textarea (ex.: emoji, anexo). */
  toolbarStart?: ReactNode;
  /** Slot à direita, antes do botão de envio (ex.: mic toggle, ações extra). */
  toolbarEnd?: ReactNode;
  /** Barra de citação acima da textarea (reply/quote preview). */
  replyPreview?: ReactNode;
  /** Aviso acima do campo (ex.: 'janela de 24h', motivo de read-only). */
  banner?: ReactNode;
  /** Indica envio em andamento — coloca o botão de envio em loading e bloqueia. */
  sending?: boolean;
  /**
   * Slot que SUBSTITUI a textarea enquanto grava áudio (waveform, timer, ações).
   * Quando presente, a textarea não é renderizada.
   */
  recording?: ReactNode;
  /** className do container (root). */
  className?: string;
}
