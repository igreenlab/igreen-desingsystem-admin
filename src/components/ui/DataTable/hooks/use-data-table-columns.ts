import { useCallback, useMemo, useState } from "react";
import { useColumnWidths } from "../../Table";
import type { ColumnPinned } from "../../Table";
import type { DataTableColumnDef } from "../data-table.types";
import { columnTypeRegistry } from "../column-types";

export type UseDataTableColumnsParams<T> = {
  columns: DataTableColumnDef<T>[];
  /** Estado inicial hidratado (de localStorage ou prop) — aplicado apenas no mount. */
  initialWidthOverrides?: Record<string, number>;
  initialPinnedOverrides?: Record<string, ColumnPinned>;
  initialHiddenColumns?: string[];
  initialColumnOrder?: string[];
  /**
   * Widths calculados pelo `useColumnAutoWidth` (autoFit). Precedência:
   * resize manual (`widthOverrides`) > autoFit (`autoWidths`) > col.width > typeDef.defaultWidth.
   * Quando autoFit está desligado, passe `undefined` ou `{}`.
   */
  autoWidths?: Record<string, number>;
};

export type UseDataTableColumnsResult<T> = {
  /** Colunas após aplicar hiddenColumns e columnOrder. */
  effectiveColumns: DataTableColumnDef<T>[];
  /** Widths em px por field. */
  columnWidths: Record<string, number>;
  /** Sticky offsets por field. */
  stickyOffsets: Record<string, number>;
  /** Hidden columns state. */
  hiddenColumns: Set<string>;
  /** Pinned columns state. */
  pinnedColumns: Record<string, ColumnPinned>;
  /** Column order state. */
  columnOrder: string[];

  /** Handlers. */
  handleResize: (field: string, widthPx: number) => void;
  handlePin: (field: string, side: ColumnPinned) => void;
  handleHide: (field: string) => void;
  handleShow: (field: string) => void;
  handleReorder: (newOrder: string[]) => void;
  /** Aplica snapshot completo de columns state (usado por applyView). */
  applyColumnState: (state: {
    columnWidths?: Record<string, number>;
    pinnedColumns?: Record<string, ColumnPinned>;
    hiddenColumns?: string[];
    columnOrder?: string[];
  }) => void;
};

/**
 * Gerencia estado de colunas (widths, pin, hide, order) e calcula offsets sticky.
 * Tudo uncontrolled na v1 — controle via props vem em F7 (persistência).
 */
export function useDataTableColumns<T>({
  columns,
  initialWidthOverrides,
  initialPinnedOverrides,
  initialHiddenColumns,
  initialColumnOrder,
  autoWidths,
}: UseDataTableColumnsParams<T>): UseDataTableColumnsResult<T> {
  // Width override por field (uncontrolled). Default vem do columnDef.
  const [widthOverrides, setWidthOverrides] = useState<Record<string, number>>(
    () => initialWidthOverrides ?? {},
  );
  // Pinned override (default vem do columnDef.pinned).
  const [pinnedOverrides, setPinnedOverrides] = useState<Record<string, ColumnPinned>>(
    () => initialPinnedOverrides ?? {},
  );
  // Hidden state (uncontrolled).
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(initialHiddenColumns ?? []),
  );
  // Order state (uncontrolled). Default: order do array de columns.
  // Hidrata via initialColumnOrder mas descarta entradas que nao existem mais
  // nas columns atuais (schema validation — campo pode ter sido removido).
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const fieldSet = new Set(columns.map((c) => String(c.field)));
    if (initialColumnOrder) {
      const valid = initialColumnOrder.filter((f) => fieldSet.has(f));
      // Anexa campos que existem agora mas nao estavam no persist (colunas novas).
      const missing = columns
        .map((c) => String(c.field))
        .filter((f) => !valid.includes(f));
      return [...valid, ...missing];
    }
    return columns.map((c) => String(c.field));
  });

  // Efetivo: filtra hidden, aplica order, mescla overrides + defaults do registry
  // por tipo (Fase G.2: width/sortable/align/ellipsis vêm do tipo quando não passados).
  //
  // Precedência de width (mais alta para mais baixa):
  //   1. widthOverrides[field] — resize manual (drag pelo user)
  //   2. autoWidths[field]      — autoFit calculado via ResizeObserver
  //   3. col.width              — explícito do consumer
  //   4. typeDef.defaultWidth   — fallback do tipo registrado
  const effectiveColumns = useMemo<DataTableColumnDef<T>[]>(() => {
    const byField = new Map(columns.map((c) => [String(c.field), c]));
    const ordered: DataTableColumnDef<T>[] = [];
    for (const field of columnOrder) {
      const col = byField.get(field);
      if (!col || hiddenColumns.has(field)) continue;
      const typeDef = col.type ? columnTypeRegistry.get(col.type) : undefined;
      ordered.push({
        ...col,
        width:
          widthOverrides[field] ??
          autoWidths?.[field] ??
          col.width ??
          typeDef?.defaultWidth,
        sortable: col.sortable ?? typeDef?.defaultSortable,
        // align/ellipsis vêm do tipo quando não passados — resolvidos aqui (fonte
        // única) pra que HEADER e FOOTER (que leem só `col.align`) fiquem coerentes
        // com o BODY. Sem isso, `type: "currency/number"` (defaultAlign "right")
        // alinhava só o body à direita; header/footer caíam à esquerda.
        align: col.align ?? typeDef?.defaultAlign,
        ellipsis: col.ellipsis ?? typeDef?.defaultEllipsis,
        pinned: field in pinnedOverrides ? pinnedOverrides[field] : col.pinned,
      });
    }
    return ordered;
  }, [columns, columnOrder, hiddenColumns, widthOverrides, pinnedOverrides, autoWidths]);

  // Calcula offsets sticky via hook do Table primitivo
  const widthsInput = useMemo(
    () =>
      effectiveColumns.map((c) => ({
        field: String(c.field),
        width: c.width,
        defaultWidth: c.width,
        pinned: c.pinned,
      })),
    [effectiveColumns],
  );
  const { widths, offsets } = useColumnWidths(widthsInput);

  const handleResize = useCallback((field: string, widthPx: number) => {
    setWidthOverrides((prev) => ({ ...prev, [field]: widthPx }));
  }, []);

  const handlePin = useCallback((field: string, side: ColumnPinned) => {
    setPinnedOverrides((prev) => ({ ...prev, [field]: side }));
  }, []);

  const handleHide = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  const handleShow = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const handleReorder = useCallback((newOrder: string[]) => {
    // newOrder pode vir INCOMPLETO — o popover de colunas exclui a coluna
    // `actions` (e qualquer não-listada). Mesclar os campos ausentes preserva-os
    // (senão somem da tabela, pois effectiveColumns só itera columnOrder).
    setColumnOrder((prev) => {
      const inNew = new Set(newOrder);
      const missing = prev.filter((f) => !inNew.has(f));
      return [...newOrder, ...missing];
    });
  }, []);

  const applyColumnState = useCallback((state: {
    columnWidths?: Record<string, number>;
    pinnedColumns?: Record<string, ColumnPinned>;
    hiddenColumns?: string[];
    columnOrder?: string[];
  }) => {
    if (state.columnWidths) setWidthOverrides(state.columnWidths);
    if (state.pinnedColumns) setPinnedOverrides(state.pinnedColumns);
    if (state.hiddenColumns) setHiddenColumns(new Set(state.hiddenColumns));
    if (state.columnOrder) {
      // Filtra campos que nao existem mais (schema mudou)
      const fieldSet = new Set(columns.map((c) => String(c.field)));
      const valid = state.columnOrder.filter((f) => fieldSet.has(f));
      const missing = columns
        .map((c) => String(c.field))
        .filter((f) => !valid.includes(f));
      setColumnOrder([...valid, ...missing]);
    }
  }, [columns]);

  // pinnedColumns combinado (overrides + defaults)
  const pinnedColumns = useMemo<Record<string, ColumnPinned>>(() => {
    const result: Record<string, ColumnPinned> = {};
    for (const c of columns) {
      const field = String(c.field);
      result[field] = field in pinnedOverrides ? pinnedOverrides[field] : c.pinned;
    }
    return result;
  }, [columns, pinnedOverrides]);

  return {
    effectiveColumns,
    columnWidths: widths,
    stickyOffsets: offsets,
    hiddenColumns,
    pinnedColumns,
    columnOrder,
    handleResize,
    handlePin,
    handleHide,
    handleShow,
    handleReorder,
    applyColumnState,
  };
}
