import { useCallback, useState } from "react";
import type { SortDirection } from "../table-toolbar.types";

// Re-export pra backward-compat (consumers que importavam daqui).
export type { SortDirection };

export type ToolbarSortEntry = {
  columnKey: string;
  direction: SortDirection;
};

export type UseToolbarSortOptions = {
  initial?: ToolbarSortEntry[];
  /** Limite máximo de colunas ordenadas simultaneamente. Default: Infinity. */
  maxColumns?: number;
};

export type UseToolbarSortResult = {
  list: ToolbarSortEntry[];
  toggle: (columnKey: string) => void;
  set: (columnKey: string, direction: SortDirection) => void;
  remove: (columnKey: string) => void;
  clear: () => void;
  replaceAll: (next: ToolbarSortEntry[]) => void;
  count: number;
  directionOf: (columnKey: string) => SortDirection | undefined;
};

/**
 * useToolbarSort — helper opcional **standalone** pra ordenação multi-coluna
 * num `<TableToolbar>` montado à mão (fora do DataTable).
 *
 * ⚠️ **Fronteira**: NÃO é usado pelo DataTable — ele tem seu próprio pipeline
 * (`useDataTableSort` + `SortModel` + adapter). Use este apenas em toolbars
 * custom standalone.
 *
 * Retorna:
 *   - `list`: array de { columnKey, direction }
 *   - `toggle(columnKey)`: cicla asc → desc → off (remove)
 *   - `set(columnKey, direction)`: força um valor
 *   - `remove(columnKey)`: remove a ordenação de uma coluna
 *   - `clear()`: zera
 *   - `replaceAll(next)`: substitui
 *   - `count`: tamanho da lista
 *   - `directionOf(columnKey)`: lookup helper
 */
export function useToolbarSort(options?: UseToolbarSortOptions): UseToolbarSortResult {
  const { initial = [], maxColumns = Infinity } = options ?? {};
  const [list, setList] = useState<ToolbarSortEntry[]>(initial);

  const toggle = useCallback(
    (columnKey: string) => {
      setList((prev) => {
        const idx = prev.findIndex((s) => s.columnKey === columnKey);
        if (idx === -1) {
          // off → asc; respeita maxColumns
          const next = [...prev, { columnKey, direction: "asc" as const }];
          if (next.length > maxColumns) next.shift();
          return next;
        }
        const current = prev[idx];
        if (current.direction === "asc") {
          // asc → desc
          const next = [...prev];
          next[idx] = { ...current, direction: "desc" };
          return next;
        }
        // desc → off (remove)
        return prev.filter((_, i) => i !== idx);
      });
    },
    [maxColumns],
  );

  const set = useCallback(
    (columnKey: string, direction: SortDirection) => {
      setList((prev) => {
        const idx = prev.findIndex((s) => s.columnKey === columnKey);
        if (idx === -1) {
          const next = [...prev, { columnKey, direction }];
          if (next.length > maxColumns) next.shift();
          return next;
        }
        const next = [...prev];
        next[idx] = { columnKey, direction };
        return next;
      });
    },
    [maxColumns],
  );

  const remove = useCallback((columnKey: string) => {
    setList((prev) => prev.filter((s) => s.columnKey !== columnKey));
  }, []);

  const clear = useCallback(() => setList([]), []);
  const replaceAll = useCallback(
    (next: ToolbarSortEntry[]) => setList(next),
    [],
  );

  const directionOf = useCallback(
    (columnKey: string): SortDirection | undefined =>
      list.find((s) => s.columnKey === columnKey)?.direction,
    [list],
  );

  return {
    list,
    toggle,
    set,
    remove,
    clear,
    replaceAll,
    count: list.length,
    directionOf,
  };
}
