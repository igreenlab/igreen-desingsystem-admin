import * as React from "react";
import {
  Bell,
  CircleCheck,
  Info,
  OctagonX,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/Button";
import { toastVariants, type ToastStatus } from "./toast.styles";

/** Ação de um toast — botão. `tone` controla a cor (brand/neutro/danger). */
export interface ToastAction {
  label: string;
  onClick?: () => void;
  /** brand (default) = primário · neutral = secundário · danger = destrutivo. */
  tone?: "brand" | "neutral" | "danger";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export interface ToastCardProps {
  /** Muda só a cor do icon-chip. Default = neutro. */
  status?: ToastStatus;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Override do ícone do chip. Sem isso, usa o ícone padrão do status. */
  icon?: React.ReactNode;
  /** Texto curto à direita do título (ex.: "agora", "há 2 min"). */
  meta?: React.ReactNode;
  /** Botão primário. Sozinho → inline à direita; com `cancel` → rodapé. */
  action?: ToastAction;
  /** Botão secundário. Renderiza rodapé (cancel à esquerda, action à direita). */
  cancel?: ToastAction;
  /** Mostra o X de fechar. Recebe o id pra dar dismiss no Sonner. */
  onClose?: () => void;
  /** id do toast no Sonner (injetado pelo helper) — usado pra dismiss. */
  toastId?: string | number;
}

const DEFAULT_ICON: Record<ToastStatus, React.ReactNode> = {
  default: <Bell />,
  info: <Info />,
  success: <CircleCheck />,
  warning: <TriangleAlert />,
  danger: <OctagonX />,
};

const TONE_PROPS = {
  brand: { color: "primary", variant: "filled" },
  neutral: { color: "secondary", variant: "soft" },
  danger: { color: "critical", variant: "soft" },
} as const;

function ActionButton({ action }: { action: ToastAction }) {
  const tone = TONE_PROPS[action.tone ?? "brand"];
  return (
    <Button
      color={tone.color}
      variant={tone.variant}
      size="xs"
      iconLeft={action.iconLeft}
      iconRight={action.iconRight}
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  );
}

/**
 * ToastCard — conteúdo visual do toast (consumido via `toast.custom` do Sonner).
 * Não use direto pra disparar; use o helper `toast` de `./toast`.
 */
export function ToastCard({
  status = "default",
  title,
  description,
  icon,
  meta,
  action,
  cancel,
  onClose,
  toastId,
}: ToastCardProps) {
  const s = toastVariants({ status });
  const hasFooter = Boolean(cancel);
  const inlineAction = action && !hasFooter ? action : null;

  const handleClose = () => {
    onClose?.();
    if (toastId !== undefined) sonnerToast.dismiss(toastId);
  };

  return (
    <div className={s.root()}>
      {/* linha principal — tudo centralizado verticalmente */}
      <div className={s.row()}>
        <span className={s.iconChip()}>{icon ?? DEFAULT_ICON[status]}</span>

        <div className={s.content()}>
          <div className={s.title()}>{title}</div>
          {description && <div className={s.description()}>{description}</div>}
        </div>

        {(meta || inlineAction || onClose) && (
          <div className={s.rightCluster()}>
            {meta && <span className={s.meta()}>{meta}</span>}
            {inlineAction && <ActionButton action={inlineAction} />}
            {onClose && (
              <Button
                color="secondary"
                variant="ghost"
                size="icon-2xs"
                aria-label="Fechar"
                iconLeft={<X />}
                onClick={handleClose}
              />
            )}
          </div>
        )}
      </div>

      {/* rodapé — 2 botões juntos, à direita, gap 4px */}
      {hasFooter && (
        <div className={s.footer()}>
          {cancel && <ActionButton action={{ tone: "neutral", ...cancel }} />}
          {action && <ActionButton action={action} />}
        </div>
      )}
    </div>
  );
}
