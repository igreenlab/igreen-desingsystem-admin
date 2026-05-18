import { useMemo } from "react";
import type { ColumnPinned } from "./table.types";

/** Minimal column shape this hook needs. Real ColumnDef do DataTable é superset. */
export type WidthColumnInput = {
  field: string;
  width?: number;
  /** Default width usado quando `width` undefined. */
  defaultWidth?: number;
  pinned?: ColumnPinned;
};

export type ColumnWidthsResult = {
  /** Largura efetiva por field (px). */
  widths: Record<string, number>;
  /** Offset sticky por field (px). Só faz sentido pra colunas pinned. */
  offsets: Record<string, number>;
  /** Total de largura ocupada pelas colunas pinned left. Usado pra calcular shadow lateral. */
  totalPinLeft: number;
  /** Total de largura ocupada pelas colunas pinned right. */
  totalPinRight: number;
};

const DEFAULT_COLUMN_WIDTH = 160;

/**
 * Calcula widths efetivos e offsets sticky cumulativos.
 *
 * Algoritmo:
 *   1. widths[field] = column.width ?? column.defaultWidth ?? DEFAULT_COLUMN_WIDTH
 *   2. Para colunas pinned="left": offsets[field] = soma das widths das colunas pinned=left que vêm ANTES
 *   3. Para colunas pinned="right": offsets[field] = soma das widths das colunas pinned=right que vêm DEPOIS
 *   4. Colunas não-pinned: offset = undefined
 *
 * @example
 *   useColumnWidths([{field:'a',width:50,pinned:'left'}, {field:'b',width:80,pinned:'left'}, {field:'c'}])
 *   → widths: {a:50, b:80, c:160}
 *   → offsets: {a:0, b:50}
 *   → totalPinLeft: 130, totalPinRight: 0
 */
export function useColumnWidths(
  columns: ReadonlyArray<WidthColumnInput>,
): ColumnWidthsResult {
  return useMemo(() => {
    const widths: Record<string, number> = {};
    const offsets: Record<string, number> = {};
    let totalPinLeft = 0;
    let totalPinRight = 0;

    // Passo 1: widths efetivos
    for (const col of columns) {
      widths[col.field] =
        col.width ?? col.defaultWidth ?? DEFAULT_COLUMN_WIDTH;
    }

    // Passo 2: offsets left (acumulado da esquerda pra direita)
    let leftSum = 0;
    for (const col of columns) {
      if (col.pinned === "left") {
        offsets[col.field] = leftSum;
        leftSum += widths[col.field];
      }
    }
    totalPinLeft = leftSum;

    // Passo 3: offsets right (acumulado da direita pra esquerda)
    let rightSum = 0;
    for (let i = columns.length - 1; i >= 0; i--) {
      const col = columns[i];
      if (col.pinned === "right") {
        offsets[col.field] = rightSum;
        rightSum += widths[col.field];
      }
    }
    totalPinRight = rightSum;

    return { widths, offsets, totalPinLeft, totalPinRight };
  }, [columns]);
}
