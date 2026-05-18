import type { ReactNode } from "react";

/** Tone semântico — afeta cor do ícone e do botão de confirmação. */
export type AlertModalTone =
  | "default"
  | "neutral"
  | "danger"
  | "warning"
  | "success";

export type AlertModalProps = {
  /** Controle de abertura */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Tone semântico (default = primary brand) */
  tone?: AlertModalTone;

  /** Conteúdo */
  title: ReactNode;
  description?: ReactNode;

  /** Botões */
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Esconde o botão Cancel (modal de aviso sem opção de cancelar) */
  hideCancel?: boolean;
  /** Esconde o botão X (close) no canto superior direito. Default: false. */
  hideClose?: boolean;

  /** Callback do botão de confirmação. Fecha automaticamente após chamar. */
  onConfirm?: () => void;

  /** Override do ícone default. Passe `null` pra esconder o ícone. */
  icon?: ReactNode | null;

  /** Loading state no botão de confirmação */
  loading?: boolean;

  /** className extra no AlertDialogContent */
  className?: string;
};
