import { useCallback, useEffect, useRef, useState } from "react";

export type UseResizableOptions = {
  /** Largura inicial (em px) antes do localStorage hidratar. */
  initial: number;
  /** Largura mínima permitida (em px). */
  min: number;
  /** Largura máxima permitida (em px). */
  max: number;
  /** Chave no localStorage pra persistir o último valor entre sessões. */
  storageKey: string;
};

export type UseResizableResult = {
  /** Largura atual em px (controlada pelo drag + hidratação localStorage). */
  width: number;
  /** Handler pra começar o drag — atribuir em `onMouseDown` do handle. */
  onResizeStart: (e: React.MouseEvent) => void;
};

/**
 * Hook de drag-resize horizontal pra split-panes com persist em localStorage.
 *
 * Comportamento: o handle é assumido como estando no **left edge** do painel —
 * arrastar pra esquerda (delta negativo em X) **aumenta** a largura. Reverter o
 * sinal de `delta` no handler caso o handle esteja no right edge.
 *
 * Hidratação:
 *  - No mount, tenta ler `localStorage[storageKey]` e validar dentro de
 *    [min, max]. Se válido, usa esse valor; senão, usa `initial`.
 *  - Após hidratação, qualquer mudança de `width` é salva (com check de
 *    `hydrated.current` pra evitar overwrite do valor persistido com o
 *    `initial` no primeiro paint).
 *
 * Cleanup:
 *  - `mousemove`/`mouseup` são listeners globais durante o drag. `mouseup`
 *    remove os 2 + restaura `cursor` e `user-select` do `<body>`.
 */
export function useResizable({
  initial,
  min,
  max,
  storageKey,
}: UseResizableOptions): UseResizableResult {
  const [width, setWidth] = useState<number>(initial);
  const hydrated = useRef(false);

  // Hidrata do localStorage no mount
  useEffect(() => {
    if (typeof window === "undefined") return;
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
    if (!hydrated.current || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, String(width));
    } catch {
      /* ignore */
    }
  }, [width, storageKey]);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;

      const onMove = (ev: MouseEvent) => {
        // Handle no left edge: drag pra ESQUERDA (delta < 0 em X) AUMENTA o width
        const delta = startX - ev.clientX;
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
    [width, min, max],
  );

  return { width, onResizeStart };
}
