import { useCallback, useEffect, useRef, useState } from "react";

export type UseColumnResizeParams = {
  currentWidth: number;
  minWidth?: number;
  maxWidth?: number;
  /** Disparado a cada `mousemove` durante o drag.
   *  Tipicamente usado pra side-effect "live preview" pelo consumer.
   *  Em consumers React, prefira `onResizeEnd` pra evitar re-render storm —
   *  use `onResizeLiveDOM` pra DOM mutation síncrona sem state. */
  onResize?: (widthPx: number) => void;
  /** Disparado no `mouseup` com largura final em px.
   *  Pra consumers React: ideal pra commit no state (1 update por drag). */
  onResizeEnd?: (widthPx: number) => void;
  /** Callback síncrono pra DOM mutation durante drag (sem state React).
   *  Recomendado pra atualizar inline styles em massa (ex: <Cell width>) sem
   *  causar re-render storm. Chamado a cada mousemove em paralelo com `onResize`.
   *  Pattern: consumer query DOM via ref + aplica `style.width` direto. */
  onResizeLiveDOM?: (widthPx: number) => void;
};

export type UseColumnResizeResult = {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
};

const DEFAULT_MIN = 60;
const DEFAULT_MAX = 800;

export function useColumnResize({
  currentWidth,
  minWidth = DEFAULT_MIN,
  maxWidth = DEFAULT_MAX,
  onResize,
  onResizeEnd,
  onResizeLiveDOM,
}: UseColumnResizeParams): UseColumnResizeResult {
  const [isDragging, setIsDragging] = useState(false);

  const onResizeRef = useRef(onResize);
  const onResizeEndRef = useRef(onResizeEnd);
  const onResizeLiveDOMRef = useRef(onResizeLiveDOM);
  const minRef = useRef(minWidth);
  const maxRef = useRef(maxWidth);

  onResizeRef.current = onResize;
  onResizeEndRef.current = onResizeEnd;
  onResizeLiveDOMRef.current = onResizeLiveDOM;
  minRef.current = minWidth;
  maxRef.current = maxWidth;

  const stateRef = useRef<{
    startX: number;
    startWidth: number;
    lastWidth: number;
    dragging: boolean;
  }>({ startX: 0, startWidth: 0, lastWidth: currentWidth, dragging: false });

  stateRef.current.lastWidth = currentWidth;

  const handlersRef = useRef<{
    move: (e: MouseEvent) => void;
    up: (e: MouseEvent) => void;
  } | null>(null);

  if (!handlersRef.current) {
    handlersRef.current = {
      move: (e: MouseEvent) => {
        if (!stateRef.current.dragging) return;
        const delta = e.clientX - stateRef.current.startX;
        const next = Math.min(
          maxRef.current,
          Math.max(minRef.current, stateRef.current.startWidth + delta),
        );
        stateRef.current.lastWidth = next;
        // Live DOM primeiro (síncrono, sem React) — feedback visual fluido.
        // Depois o callback onResize (estado/state). Os 2 podem coexistir.
        onResizeLiveDOMRef.current?.(next);
        onResizeRef.current?.(next);
      },
      up: () => {
        if (!stateRef.current.dragging) return;
        stateRef.current.dragging = false;
        setIsDragging(false);
        document.removeEventListener("mousemove", handlersRef.current!.move);
        document.removeEventListener("mouseup", handlersRef.current!.up);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        onResizeEndRef.current?.(stateRef.current.lastWidth);
      },
    };
  }

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stateRef.current = {
        startX: e.clientX,
        startWidth: currentWidth,
        lastWidth: currentWidth,
        dragging: true,
      };
      setIsDragging(true);
      document.addEventListener("mousemove", handlersRef.current!.move);
      document.addEventListener("mouseup", handlersRef.current!.up);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [currentWidth],
  );

  useEffect(() => {
    return () => {
      if (stateRef.current.dragging && handlersRef.current) {
        document.removeEventListener("mousemove", handlersRef.current.move);
        document.removeEventListener("mouseup", handlersRef.current.up);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, []);

  return {
    onMouseDown,
    isDragging,
  };
}
