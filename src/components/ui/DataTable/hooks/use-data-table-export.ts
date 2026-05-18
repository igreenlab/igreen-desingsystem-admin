import { useCallback } from "react";
import type { DataTableColumnDef, GridRowId } from "../data-table.types";

export type ExportScope = "all" | "filtered" | "selected";

export type UseDataTableExportParams<T> = {
  columns: DataTableColumnDef<T>[];
  /** Rows visiveis na pagina atual (server) ou apos filter+sort+paginate (client). */
  rowsCurrentPage: T[];
  /** Rows apos filter+search+sort, sem paginate. Client mode tem; server tem apenas pagina atual. */
  rowsAfterFilter: T[];
  /** Rows brutas (todas, sem filter). Server mode = vazio. */
  rowsAll: T[];
  /** IDs selecionados (resolvidos do selection state). */
  selectedIds: GridRowId[];
  /** Funcao pra extrair id de uma row. */
  getRowId: (row: T) => GridRowId;
  /** Nome do arquivo (sem extensao). Default "export". */
  filename?: string;
};

export type UseDataTableExportResult = {
  exportCsv: (scope: ExportScope) => void;
};

/**
 * Gera CSV no client a partir das rows do escopo escolhido.
 * Aplica `valueFormatter` da coluna quando presente, senao usa o valor cru convertido pra string.
 * Trigger de download via Blob URL + <a download>.
 */
export function useDataTableExport<T>({
  columns,
  rowsCurrentPage,
  rowsAfterFilter,
  rowsAll,
  selectedIds,
  getRowId,
  filename = "export",
}: UseDataTableExportParams<T>): UseDataTableExportResult {
  const exportCsv = useCallback(
    (scope: ExportScope) => {
      // Seleciona rows do escopo
      let rows: T[];
      if (scope === "all") {
        // Client tem rowsAll; server so temos a pagina atual
        rows = rowsAll.length > 0 ? rowsAll : rowsCurrentPage;
      } else if (scope === "filtered") {
        rows = rowsAfterFilter;
      } else {
        // selected: filtra rowsAfterFilter por IDs selecionados
        const idSet = new Set(selectedIds);
        rows = rowsAfterFilter.filter((r) => idSet.has(getRowId(r)));
      }

      // Colunas exportaveis (exclui type=actions)
      const exportCols = columns.filter((c) => c.type !== "actions");

      const csv = generateCsv(rows, exportCols);
      downloadCsv(csv, `${filename}-${scope}.csv`);
    },
    [columns, rowsCurrentPage, rowsAfterFilter, rowsAll, selectedIds, getRowId, filename],
  );

  return { exportCsv };
}

/* -- CSV utils ----------------------------------------------------------- */

function escapeCsvCell(value: string): string {
  // Wrap em aspas se conter virgula, aspas ou nova linha
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getCellValue<T>(row: T, col: DataTableColumnDef<T>): string {
  let value: unknown;
  if (col.valueGetter) {
    value = col.valueGetter(row);
  } else {
    const field = String(col.field);
    value = field.includes(".")
      ? field.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown> | null)?.[k], row)
      : (row as Record<string, unknown>)[field];
  }
  if (col.valueFormatter) return col.valueFormatter(value);
  if (value == null) return "";
  return String(value);
}

function generateCsv<T>(rows: T[], columns: DataTableColumnDef<T>[]): string {
  const header = columns.map((c) => escapeCsvCell(c.headerName)).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(getCellValue(row, col))).join(","),
  );
  return [header, ...lines].join("\n");
}

function downloadCsv(csv: string, filename: string): void {
  // BOM pra Excel reconhecer UTF-8
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
