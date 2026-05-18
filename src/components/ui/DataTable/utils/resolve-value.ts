import type { DataTableColumnDef } from "../data-table.types";

/**
 * Helpers compartilhados de resolução de valor de cell.
 *
 * Antes da consolidação, 3 lugares duplicavam lógica:
 *  - data-table.tsx → `resolveCellValue` (cell render)
 *  - hooks/use-data-table-processor.ts → `getFieldValue` + `applyValueGetter` + `applyFormatter` (filter/sort/search)
 *  - utils/group-rows.ts → `resolveGroupValue` (agrupamento)
 *
 * Agora todos consomem daqui — single source of truth pra dot-path lookup,
 * valueGetter, e valueFormatter.
 */

/** Acessa valor em row via dot-path (`user.name`) ou key simples. */
export function getFieldValue<T>(row: T, field: string): unknown {
  if (!field.includes(".")) {
    return (row as Record<string, unknown>)[field];
  }
  return field
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc as Record<string, unknown> | null | undefined)?.[key],
      row,
    );
}

/** Resolve valor da cell: prioriza `column.valueGetter`, senão dot-path do field. */
export function applyValueGetter<T>(row: T, column: DataTableColumnDef<T>): unknown {
  if (column.valueGetter) return column.valueGetter(row);
  return getFieldValue(row, String(column.field));
}

/** Resolve string formatada: pega valor + aplica `column.valueFormatter` se houver. */
export function applyFormatter<T>(row: T, column: DataTableColumnDef<T>): string {
  const value = applyValueGetter(row, column);
  if (column.valueFormatter) return column.valueFormatter(value);
  return value == null ? "" : String(value);
}
