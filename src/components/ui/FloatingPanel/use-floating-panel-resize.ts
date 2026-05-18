import { useCallback, useEffect, useRef, useState } from "react";

export type UseFloatingPanelResizeOptions = {
  /** Largura inicial (em px) antes do localStorage hidratar. */
  initial: number;
  /** Largura mínima permitida (em px). */
  min: number;
  /** Largura máxima permitida (em px). */
  max: number;
  /** Lado em que o panel está ancorado — determina o sentido do delta. */
  side: "left" | "right";
  /** Chave no localStorage pra persistir (opcional). */
  storageKey?: string;
  /** Se false, o hook não atualiza width (modo "maximizado" ou disabled). */
  enabled?: boolean;
};

export type UseFloatingPanelResizeResult = {
  width: number;
  /** Handler pra começar o drag — atribuir em `onMouseDown` do handle. */
  onResizeStart: (e: React.MouseEvent) => void;
};

/**
 * Hook de drag-resize horizontal pra panels flutuantes com persist opcional
 * em localStorage. Suporta painéis ancorados à direita OU à esquerda — o
 * sentido do delta é invertido automaticamente.
 *
 *   side="right" → handle no LEFT edge → arrastar pra esquerda AUMENTA width
 *   side="left"  → handle no RIGHT edge → arrastar pra direita AUMENTA width
 *
 * Cleanup: listeners globais são removidos no mouseup + restaura cursor/userSelect.
 */
export function useFloatingPanelResize({
  initial,
  min,
  max,
  side,
  storageKey,
  enabled = true,
}: UseFloatingPanelResizeOptions): UseFloatingPanelResizeResult {
  const [width, setWidth] = useState<number>(initial);
  const hydrated = useRef(false);

  // Hidrata do localStorage no mount (se storageKey)
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      hydrated.current = true;
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      const n = raw ? Number(raw) : NaN;
      if (!Number.isNaN(n) && n >= min && n <= max) setWidth(n);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, [min, max, storageKey]);

  // Salva quando muda (após hidratação)
  useEffect(() => {
    if (!hydrated.current || !storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, String(width));
    } catch {
      /* ignore */
    }
  }, [width, storageKey]);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;

      const onMove = (ev: MouseEvent) => {
        // side=right (handle left edge): delta < 0 (cursor pra esquerda) AUMENTA width
        // side=left  (handle right edge): delta > 0 (cursor pra direita) AUMENTA width
        const delta = side === "right" ? startX - ev.clientX : ev.clientX - startX;
        const next = Math.max(min, Math.min(max, startWidth + delta));
        setWidth(next);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width, min, max, side, enabled],
  );

  return { width, onResizeStart };
}
