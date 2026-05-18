import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "../../shadcn/dialog";
import { Button } from "../Button/button";
import {
  dialog,
  closeBtn,
  head,
  headIcon,
  headTitleWrap,
  title as titleStyles,
  description as descStyles,
  body,
  foot,
  footRight,
} from "./modal.styles";

/* ─────────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────────── */

export type ModalSize = "sm" | "md" | "lg";

export type ModalAction = {
  /** Texto do botão. */
  label: ReactNode;
  /** Callback do click. */
  onClick?: () => void;
  /** Estado disabled. */
  disabled?: boolean;
  /** Loading com spinner (usa o do <Button>). */
  loading?: boolean;
  /** Quando true, pinta o botão com cor critical (destrutivo). */
  danger?: boolean;
};

export type ModalProps = {
  /** Controlled open. */
  open: boolean;
  /** Callback quando o modal pede pra fechar (X, ESC, overlay click, ou ação). */
  onClose: () => void;

  /* ── Header (tudo opcional) ───────────────────────────────────── */
  /**
   * Ícone do header — renderizado dentro de um container 40×40 à esquerda.
   * Passe o lucide pronto com `className="size-icon-md"` e `strokeWidth={1.7}`.
   * Quando ausente, o header não tem icon container (texto começa à esquerda).
   */
  icon?: ReactNode;
  /** Título principal — 17px / 700. */
  title?: ReactNode;
  /** Descrição/subtítulo — 12.5px / fg-muted. */
  description?: ReactNode;

  /* ── Body ─────────────────────────────────────────────────────── */
  /** Conteúdo do body — flex-col com gap 18px entre filhos. */
  children?: ReactNode;

  /* ── Footer: modo estruturado ────────────────────────────────── */
  /**
   * Ação primária — botão filled (default brand, critical quando `danger`).
   * Fica sempre na ponta direita do footer.
   */
  primaryAction?: ModalAction;
  /**
   * Ação secundária — botão outline secondary.
   * Default label "Cancelar". Default onClick = onClose.
   */
  secondaryAction?: ModalAction;
  /**
   * Ação terciária — opcional. Quando presente, vai pra ESQUERDA do footer
   * (justify-between). Use pra ações destrutivas (delete) ou neutras (ajuda).
   * Estilo: ghost critical quando `danger`, ghost secondary caso contrário.
   */
  tertiaryAction?: ModalAction;

  /* ── Footer: modo override (escape hatch) ────────────────────── */
  /**
   * Se passado, substitui inteiramente as 3 actions estruturadas.
   * Use quando precisar de layout custom (links, multi-step indicator, etc).
   */
  footer?: ReactNode;

  /* ── Visual ───────────────────────────────────────────────────── */
  /**
   * Largura máxima do modal:
   *   - sm: 440px
   *   - md: 540px (default — match TblViewsModal sandbox)
   *   - lg: 720px
   */
  size?: ModalSize;

  /** Esconde o X de fechar no canto superior direito. */
  hideClose?: boolean;
  /** Click no overlay fecha o modal. Default true (comportamento padrão Dialog). */
  closeOnOverlay?: boolean;

  /** ClassName extra no DialogContent (root). */
  className?: string;
};

/* ─────────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────────── */

/**
 * Modal — composto sobre o `<Dialog>` (shadcn) com estrutura de header rico
 * (icon + título + descrição), body livre via children, e footer flexível
 * (até 3 actions estruturadas OU footer custom via slot).
 *
 * Visual alinhado com o `TblViewsModal` do sandbox `/design-and-table-v2`:
 * dialog 540px (md), header com feature-icon 40×40, footer com botões DS.
 *
 * Quando precisar de modal de confirmação destrutiva simples, use `<AlertModal>`.
 */
export function Modal({
  open,
  onClose,
  icon,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  footer,
  size = "md",
  hideClose = false,
  closeOnOverlay = true,
  className,
}: ModalProps) {
  const hasHeader = Boolean(icon || title || description);
  const hasStructuredFooter = Boolean(primaryAction || secondaryAction || tertiaryAction);
  const showFooter = Boolean(footer) || hasStructuredFooter;

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    // Quando closeOnOverlay=false, ignora fechamento por overlay/ESC
    // (Radix dispara onOpenChange em ambos os casos; aqui simplificamos:
    // se você quer prevenir, controle externamente).
    if (!closeOnOverlay) return;
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={dialog({ size, className })}
        hideClose
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {!hideClose && (
          <DialogClose className={closeBtn()} aria-label="Fechar">
            <X className="size-icon-sm" />
          </DialogClose>
        )}

        {hasHeader && (
          <header className={head()}>
            {icon && (
              <span className={headIcon()} aria-hidden="true">
                {icon}
              </span>
            )}
            {(title || description) && (
              <div className={headTitleWrap()}>
                {title && (
                  <h3 id="modal-title" className={titleStyles()}>
                    {title}
                  </h3>
                )}
                {description && (
                  <p id="modal-description" className={descStyles()}>
                    {description}
                  </p>
                )}
              </div>
            )}
          </header>
        )}

        {children !== undefined && children !== null && (
          <div className={body()}>{children}</div>
        )}

        {showFooter && (
          <footer
            className={foot({
              layout: tertiaryAction ? "between" : "end",
            })}
          >
            {footer ?? <StructuredActions
              primary={primaryAction}
              secondary={secondaryAction}
              tertiary={tertiaryAction}
              onClose={onClose}
            />}
          </footer>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Internal — footer estruturado (a partir das 3 actions)
 * ───────────────────────────────────────────────────────────────── */

function StructuredActions({
  primary,
  secondary,
  tertiary,
  onClose,
}: {
  primary?: ModalAction;
  secondary?: ModalAction;
  tertiary?: ModalAction;
  onClose: () => void;
}) {
  // Sem tertiary → 1 grupo só (justify-end pelo container).
  // Com tertiary → 2 grupos (tertiary | secondary+primary), justify-between.

  const renderTertiary = tertiary && (
    <Button
      color={tertiary.danger ? "critical" : "secondary"}
      variant="ghost"
      size="md"
      onClick={tertiary.onClick}
      disabled={tertiary.disabled}
      loading={tertiary.loading}
    >
      {tertiary.label}
    </Button>
  );

  const renderSecondary = secondary && (
    <Button
      color="secondary"
      variant="outline"
      size="md"
      onClick={secondary.onClick ?? onClose}
      disabled={secondary.disabled}
      loading={secondary.loading}
    >
      {secondary.label}
    </Button>
  );

  const renderPrimary = primary && (
    <Button
      color={primary.danger ? "critical" : "primary"}
      variant="filled"
      size="md"
      onClick={primary.onClick}
      disabled={primary.disabled}
      loading={primary.loading}
    >
      {primary.label}
    </Button>
  );

  if (tertiary) {
    return (
      <>
        {renderTertiary}
        <div className={footRight()}>
          {renderSecondary}
          {renderPrimary}
        </div>
      </>
    );
  }

  return (
    <>
      {renderSecondary}
      {renderPrimary}
    </>
  );
}
