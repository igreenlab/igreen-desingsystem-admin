import type { ReactNode } from "react";
import type { DataTableColumnDef } from "../data-table.types";
import { applyValueGetter } from "./resolve-value";

/**
 * Agregação de coluna — fonte ÚNICA. Antes a mesma lógica (switch
 * sum/avg/count/min/max + filtro de números + formatter) estava duplicada em
 * `data-table-group-header-row` e `data-table-totalizer-row`, com uma
 * divergência sutil: o totalizer NÃO respeitava `col.valueGetter` (lia só o
 * dot-path), o group-header sim. Agora ambos usam `applyValueGetter` → consistente.
 */

/**
 * Computa o valor agregado built-in (sum/avg/count/min/max) de uma coluna sobre
 * `rows`. Retorna `null` quando `aggregate` não é um keyword built-in numérico.
 */
export function computeAggregate<T>(
  col: DataTableColumnDef<T>,
  rows: T[],
): number | null {
  if (typeof col.aggregate !== "string") return null;
  const values = rows
    .map((r) => applyValueGetter(r, col))
    .filter((v): v is number => typeof v === "number" && !isNaN(v));

  switch (col.aggregate) {
    case "sum":
      return values.reduce((acc, v) => acc + v, 0);
    case "avg":
      return values.length === 0
        ? 0
        : values.reduce((acc, v) => acc + v, 0) / values.length;
    case "count":
      return rows.length;
    case "min":
      return values.length === 0 ? 0 : Math.min(...values);
    case "max":
      return values.length === 0 ? 0 : Math.max(...values);
    default:
      return null;
  }
}

/**
 * Resolve o conteúdo renderizável do aggregate de uma coluna:
 *  1. `override` explícito (quando passado, ex: aggregateRow do server mode)
 *  2. `col.aggregate` função custom → ReactNode livre
 *  3. keyword built-in → número computado + `aggregateFormatter ?? valueFormatter`
 *  4. senão → null
 */
export function renderAggregate<T>(
  col: DataTableColumnDef<T>,
  rows: T[],
  override?: ReactNode,
): ReactNode {
  if (override !== undefined) return override;
  if (col.aggregate === undefined) return null;
  if (typeof col.aggregate === "function") return col.aggregate(rows);

  const result = computeAggregate(col, rows);
  if (result === null) return null;
  const formatter = col.aggregateFormatter ?? col.valueFormatter;
  return formatter ? formatter(result) : String(result);
}
