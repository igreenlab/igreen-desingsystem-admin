/**
 * use-column-auto-width.ts — ResizeObserver hook that auto-calculates
 * column widths to fill the container.
 *
 * Quando ativo (`enabled: true`), observa o container via ResizeObserver e
 * delega o cálculo de widths para `calculateColumnWidths` (3 layers).
 * Retorna `Record<field, number>` com widths em pixels que devem ser
 * aplicados na precedência: resize manual > autoFit (este hook) > col.width.
 *
 * Notas:
 * - Quando `enabled: false` (default em consumers que não passam `autoFit`),
 *   retorna `{}` e não instala o observer — zero overhead.
 * - Recalcula apenas no resize do container OU mudanças relevantes
 *   (columns count/widths estáticos, rows sample). NÃO recalcula a cada render.
 * - Usa `requestAnimationFrame` pra coalescer múltiplos resize events.
 */

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { DataTableColumnDef } from "../data-table.types";
import {
  calculateColumnWidths,
  type CalculateColumnWidthsOptions,
} from "../utils/calculate-column-widths";

export interface UseColumnAutoWidthOptions {
  /** Liga/desliga o auto-width. Default false. */
  enabled: boolean;
  /** Tamanho da amostra de rows pra Layer 2. Default 20. */
  sampleSize?: number;
  /**
   * Pixels reservados no container que NÃO contam pro cálculo das colunas
   * (ex: largura da coluna `selection` checkbox que é injetada pelo DataTable
   * e não vem em `props.columns`). Subtraído do `contentRect.width` antes de
   * chamar `calculateColumnWidths`. Default 0.
   */
  reservedWidth?: number;
}

export interface UseColumnAutoWidthResult {
  /** Map de widths calculados, indexado por field. {} quando desligado ou pre-mount. */
  autoWidths: Record<string, number>;
}

/**
 * Hook que observa o container e calcula widths via `calculateColumnWidths`.
 *
 * @param containerRef — ref do elemento que tem o tamanho de referência (geralmente o `scrollContainerRef` do Table)
 * @param columns — colunas atuais (effectiveColumns do DataTable)
 * @param rows — rows visíveis pra amostragem de Layer 2
 * @param options — `{ enabled, sampleSize }`
 */
export function useColumnAutoWidth<T>(
  containerRef: RefObject<HTMLDivElement | null>,
  columns: DataTableColumnDef<T>[],
  rows: T[],
  options: UseColumnAutoWidthOptions,
): UseColumnAutoWidthResult {
  const { enabled, sampleSize, reservedWidth = 0 } = options;

  const [autoWidths, setAutoWidths] = useState<Record<string, number>>({});
  const rafIdRef = useRef<number | null>(null);

  // Snapshot estável das colunas/rows pra evitar re-observer churn.
  // Quando colunas/rows mudam, o effect re-roda naturalmente.
  const columnsRef = useRef(columns);
  const rowsRef = useRef(rows);
  columnsRef.current = columns;
  rowsRef.current = rows;

  useEffect(() => {
    if (!enabled) {
      setAutoWidths((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const el = containerRef.current;
    if (!el) return;
    if (typeof ResizeObserver === "undefined") return; // SSR / IE safe

    const recalculate = (containerWidth: number) => {
      // Desconta colunas externas (ex: selection checkbox de 56px) que ocupam
      // espaço no container mas não estão em `props.columns`.
      const effectiveWidth = Math.max(0, containerWidth - reservedWidth);
      const calcOptions: CalculateColumnWidthsOptions = {
        containerWidth: effectiveWidth,
        autoFit: enabled,
        sampleSize,
      };
      const next = calculateColumnWidths(
        columnsRef.current,
        rowsRef.current,
        calcOptions,
      );

      setAutoWidths((prev) => {
        // Skip re-render se nada mudou
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length === nextKeys.length) {
          let same = true;
          for (const k of nextKeys) {
            if (prev[k] !== next[k]) {
              same = false;
              break;
            }
          }
          if (same) return prev;
        }
        return next;
      });
    };

    // Cálculo inicial — usa `clientWidth` (content-box, EXCLUI scrollbar) pra ficar
    // consistente com `entry.contentRect.width` do ResizeObserver. Antes usava
    // getBoundingClientRect().width (border-box, INCLUI scrollbar vertical), o que
    // sobre-estimava a largura no 1º paint quando já havia scroll-Y (totalizer/altura
    // forçada) → colunas largas demais até o 1º resize. clientWidth alinha as duas vias.
    recalculate(el.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // Coalesce múltiplos resize events via rAF
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        recalculate(entry.contentRect.width);
      });
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
    // Recalcula quando:
    //  - enabled flip
    //  - número de colunas muda (add/remove)
    //  - número de rows muda significativamente (sample diferente)
    //  - sampleSize muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    containerRef,
    sampleSize,
    reservedWidth,
    columns.length,
    rows.length,
    // Inclui campos das columns pra recalcular quando consumer muda a schema
    columns.map((c) => String(c.field)).join("|"),
  ]);

  return { autoWidths };
}
