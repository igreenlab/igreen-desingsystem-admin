import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../Button/button";
import { floatingPanelStyles, FLOATING_PANEL_SIZE_PX } from "./floating-panel.styles";
import { useFloatingPanelResize } from "./use-floating-panel-resize";
import type { FloatingPanelProps, FloatingPanelSize } from "./floating-panel.types";

function resolveInitialWidth(size: FloatingPanelProps["size"]): number {
  if (typeof size === "number") return size;
  if (size && size in FLOATING_PANEL_SIZE_PX) {
    return FLOATING_PANEL_SIZE_PX[size as FloatingPanelSize];
  }
  return FLOATING_PANEL_SIZE_PX.md;
}

/**
 * FloatingPanel — drawer "card flutuante" non-modal.
 *
 * No desktop, diferente do `<Panel>`, NÃO renderiza backdrop nem trap de foco —
 * a página atrás continua interativa. Útil pra detail panels, side info,
 * configurações secundárias que precisam coexistir com a tela principal.
 *
 * Features:
 *   - Resize horizontal (drag handle no edge) com persistência opcional
 *   - Maximize toggle (botão no header) — ocupa quase a tela toda
 *   - Responsive: vira sheet bottom-up colado nas bordas em max-md, com
 *     backdrop suave (toque fecha) — só em mobile; desktop segue non-modal
 *   - max-height 92vh em mobile; body com scroll automático
 *   - ESC fecha (configurável)
 *   - Renderizado via portal em document.body (escapa de overflow/transform de ancestrais)
 *
 * Exemplo:
 * ```tsx
 * <FloatingPanel
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Detalhes do cliente"
 *   description="ID: CLI-2401"
 *   resizable
 *   maximizable
 *   headerActions={
 *     <>
 *       <Button variant="soft" color="secondary" size="icon-sm"><Pencil /></Button>
 *       <Button variant="soft" color="critical" size="icon-sm"><Trash2 /></Button>
 *     </>
 *   }
 *   footer={
 *     <>
 *       <Button variant="outline" color="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
 *       <Button variant="filled" color="primary">Salvar</Button>
 *     </>
 *   }
 * >
 *   <DetailContent />
 * </FloatingPanel>
 * ```
 */
export function FloatingPanel({
  open,
  onOpenChange,
  side = "right",
  size = "md",
  title,
  description,
  titleIcon: TitleIcon,
  titleSlot,
  headerActions,
  hideClose,
  footer,
  children,
  resizable = false,
  resizableMinWidth = 320,
  resizableMaxWidth = 800,
  resizableStorageKey,
  maximizable = false,
  defaultMaximized = false,
  closeOnEscape = true,
  className,
}: FloatingPanelProps) {
  const initialWidth = resolveInitialWidth(size);
  const [maximized, setMaximized] = useState<boolean>(defaultMaximized);
  const [dragging, setDragging] = useState<boolean>(false);
  const titleId = useId();
  const descId = useId();
  const handleRef = useRef<HTMLButtonElement>(null);

  const resize = useFloatingPanelResize({
    initial: initialWidth,
    min: resizableMinWidth,
    max: resizableMaxWidth,
    side,
    storageKey: resizableStorageKey,
    enabled: resizable && !maximized,
  });

  // ESC fecha (configurável)
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, onOpenChange]);

  // Capture dragging state pro data-dragging do handle (cor brand persiste)
  useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, [dragging]);

  // SSR safety + render condicional
  if (typeof window === "undefined" || !open) return null;

  const s = floatingPanelStyles({ side, maximized });

  // Width final aplicado no style (ignora em mobile via CSS max-md:!w-auto)
  const widthValue = resizable ? resize.width : initialWidth;

  return createPortal(
    <>
      {/* Backdrop suave — só em mobile (md:hidden). Toque fecha o panel. */}
      <div className={s.backdrop()} aria-hidden="true" onClick={() => onOpenChange(false)} />

      <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      style={maximized ? undefined : { width: widthValue }}
      className={cn(s.root(), className)}
    >
      {/* Resize handle — só quando resizable e !maximized */}
      {resizable && !maximized && (
        <button
          ref={handleRef}
          type="button"
          aria-label="Redimensionar panel"
          data-dragging={dragging || undefined}
          onMouseDown={(e) => {
            setDragging(true);
            resize.onResizeStart(e);
          }}
          className={s.handle()}
        />
      )}

      {/* Header — title / description / actions */}
      {(title || description || titleSlot || headerActions || !hideClose || maximizable) && (
        <header className={s.header()}>
          {titleSlot ? (
            <div className="flex-1 min-w-0">{titleSlot}</div>
          ) : (
            <div className={s.headerText()}>
              {title && (
                <h2 id={titleId} className={s.headerTitle()}>
                  {TitleIcon && <TitleIcon className={s.headerTitleIcon()} strokeWidth={1.8} />}
                  <span className="truncate">{title}</span>
                </h2>
              )}
              {description && (
                <p id={descId} className={s.headerDescription()}>
                  {description}
                </p>
              )}
            </div>
          )}

          <div className={s.headerActions()}>
            {headerActions}
            {maximizable && (
              <Button
                type="button"
                variant="soft"
                color="secondary"
                size="icon-sm"
                aria-label={maximized ? "Restaurar tamanho" : "Maximizar"}
                onClick={() => setMaximized((m) => !m)}
                className="max-md:hidden"
              >
                {maximized ? <Minimize2 /> : <Maximize2 />}
              </Button>
            )}
            {!hideClose && (
              <Button
                type="button"
                variant="soft"
                color="secondary"
                size="icon-sm"
                aria-label="Fechar"
                onClick={() => onOpenChange(false)}
              >
                <X />
              </Button>
            )}
          </div>
        </header>
      )}

      {/* Body */}
      <div className={s.body()}>{children}</div>

      {/* Footer */}
      {footer && <footer className={s.footer()}>{footer}</footer>}
      </aside>
    </>,
    document.body,
  );
}
