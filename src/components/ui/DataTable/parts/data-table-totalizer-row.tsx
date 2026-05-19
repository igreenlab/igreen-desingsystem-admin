import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TableCell } from "../../Table";
import type { DataTableColumnDef } from "../data-table.types";

export type DataTableTotalizerRowProps<T> = {
  /** Colunas efetivas (apos hidden/order) — mesma fonte do header. */
  columns: DataTableColumnDef<T>[];
  /** Rows pra agregar. Em client mode: allPagesProcessed (todas filtradas).
   *  Em server mode: current page rows (ou empty se consumer só usar aggregateRow). */
  rows: T[];
  /** Override pre-computado por field — vence aggregate built-in/custom. */
  overrides?: Record<string, ReactNode>;
  /** Widths efetivos por field (mesma fonte do header pra alinhar). */
  columnWidths: Record<string, number>;
  /** Sticky offsets pra colunas pinned. */
  stickyOffsets: Record<string, number>;
  /** Tem coluna de selection enabled? Renderiza cell vazia na esquerda. */
  hasSelection?: boolean;
};

/**
 * Footer row sticky no bottom do body — mostra agregacoes por coluna.
 *
 * Para cada coluna:
 *   - Se `overrides[field]` definido → renderiza esse valor (server mode).
 *   - Senao, se `column.aggregate` definido → computa local.
 *   - Senao, cell vazia (apenas mantem largura/alinhamento).
 *
 * `column.aggregate` aceita:
 *   - 'sum' | 'avg' | 'count' | 'min' | 'max' — built-ins (so funcionam em valores numericos).
 *   - (rows: T[]) => ReactNode — funcao custom, recebe rows pra computar livremente.
 *
 * Formatacao do resultado built-in: `column.aggregateFormatter(value)` >
 * `column.valueFormatter(value)` > toString.
 */
export function DataTableTotalizerRow<T>({
  columns,
  rows,
  overrides,
  columnWidths,
  stickyOffsets,
  hasSelection = false,
}: DataTableTotalizerRowProps<T>) {
  return (
    <div
      role="row"
      className={cn(
        "flex w-max min-w-full",
        "sticky bottom-0 z-[8]",
        "bg-bg-table-head border-t border-border-table",
        "h-[42px]",
      )}
    >
      {hasSelection && (
        <TableCell width={56} align="center" className="!px-0">
          {/* Empty cell pra alinhar com checkbox column. */}
        </TableCell>
      )}
      {columns.map((col) => {
        const field = String(col.field);
        const content = resolveTotalizerContent(col, rows, overrides?.[field]);
        return (
          <TableCell
            key={field}
            field={field}
            width={columnWidths[field]}
            pinned={col.pinned}
            pinOffset={stickyOffsets[field]}
            align={col.align}
            ellipsis={col.ellipsis}
            className="text-body-md font-medium text-fg-strong bg-bg-table-head"
          >
            {content}
          </TableCell>
        );
      })}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function resolveTotalizerContent<T>(
  col: DataTableColumnDef<T>,
  rows: T[],
  override: ReactNode | undefined,
): ReactNode {
  if (override !== undefined) return override;
  if (col.aggregate === undefined) return null;

  // Custom function
  if (typeof col.aggregate === "function") {
    return col.aggregate(rows);
  }

  // Built-in keyword
  const field = String(col.field);
  const values = rows
    .map((r) => getFieldValue(r, field))
    .filter((v): v is number => typeof v === "number" && !isNaN(v));

  let result: number;
  switch (col.aggregate) {
    case "sum":
      result = values.reduce((acc, v) => acc + v, 0);
      break;
    case "avg":
      result = values.length === 0 ? 0 : values.reduce((acc, v) => acc + v, 0) / values.length;
      break;
    case "count":
      result = rows.length;
      break;
    case "min":
      result = values.length === 0 ? 0 : Math.min(...values);
      break;
    case "max":
      result = values.length === 0 ? 0 : Math.max(...values);
      break;
    default:
      return null;
  }

  const formatter = col.aggregateFormatter ?? col.valueFormatter;
  return formatter ? formatter(result) : String(result);
}

function getFieldValue<T>(row: T, field: string): unknown {
  if (!field.includes(".")) return (row as Record<string, unknown>)[field];
  return field
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc as Record<string, unknown> | null | undefined)?.[key],
      row,
    );
}
