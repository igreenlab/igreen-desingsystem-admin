import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../shadcn/alert-dialog";
import { Button } from "../Button/button";
import { alertModalIcon } from "./alert-modal.styles";
import type { AlertModalProps, AlertModalTone } from "./alert-modal.types";

/**
 * AlertModal — wrapper "one-shot" pro AlertDialog do shadcn.
 *
 * Cobre o caso comum de "confirmação destrutiva" (ex: excluir cliente):
 *   <AlertModal
 *     open={confirmDelete}
 *     onOpenChange={setConfirmDelete}
 *     tone="danger"
 *     title="Excluir cliente?"
 *     description='Esta ação não pode ser desfeita. O cliente "Maria Silva" será removido permanentemente.'
 *     confirmLabel="Excluir cliente"
 *     onConfirm={handleDelete}
 *   />
 *
 * Pra layouts customizados (sem ícone, com input dentro, etc), use o
 * <AlertDialog> primitive direto.
 */

const TONE_ICON: Record<AlertModalTone, React.ReactNode> = {
  default: null,
  neutral: <Info strokeWidth={2.2} />,
  danger:  <AlertTriangle strokeWidth={2.2} />,
  warning: <AlertCircle strokeWidth={2.2} />,
  success: <CheckCircle2 strokeWidth={2.2} />,
};

const TONE_BUTTON_COLOR: Record<
  AlertModalTone,
  "primary" | "critical" | "warning" | "success"
> = {
  default: "primary",
  neutral: "primary",
  danger:  "critical",
  warning: "warning",
  success: "success",
};

export function AlertModal({
  open,
  onOpenChange,
  tone = "default",
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  hideCancel,
  hideClose,
  onConfirm,
  icon,
  loading,
  className,
}: AlertModalProps) {
  const iconNode = icon === undefined ? TONE_ICON[tone] : icon;

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Previne o close default do AlertDialogAction se loading — quem chamar
    // controla onOpenChange após o async terminar.
    if (loading) {
      e.preventDefault();
      return;
    }
    onConfirm?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        {!hideClose && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            aria-label="Fechar"
            className="absolute top-pad-lg right-pad-lg z-10 grid place-items-center size-form-sm rounded-radius-md bg-transparent text-fg-muted opacity-55 transition-[background-color,color,opacity] outline-none hover:bg-bg-muted hover:text-fg-default hover:opacity-100 focus-visible:opacity-100 focus-visible:shadow-sh-ring disabled:pointer-events-none"
          >
            <X className="size-4" />
          </button>
        )}
        <AlertDialogHeader>
          {iconNode && (
            <div className={alertModalIcon({ tone })} aria-hidden="true">
              {iconNode}
            </div>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!hideCancel && (
            <AlertDialogCancel asChild>
              <Button
                type="button"
                color="secondary"
                variant="outline"
                size="md"
                fullWidth
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <Button
              type="button"
              color={TONE_BUTTON_COLOR[tone]}
              variant="filled"
              size="md"
              fullWidth
              loading={loading}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
