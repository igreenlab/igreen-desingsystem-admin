import { useCallback, useMemo, useState } from "react";
import type { GridRowId, GridSelectionState } from "../data-table.types";

export type UseDataTableSelectionParams<T> = {
  rows: T[];
  getRowId: (row: T) => GridRowId;
  /** Controlled selection. */
  selectionModel?: GridSelectionState;
  onSelectionModelChange?: (model: GridSelectionState) => void;
};

export type UseDataTableSelectionResult<T> = {
  /** Estado bruto. */
  state: GridSelectionState;
  /** True se a row está selecionada. */
  isRowSelected: (row: T) => boolean;
  /** Toggle uma row. */
  toggleRow: (row: T) => void;
  /** Seleciona/deseleciona todas as rows da página atual. */
  togglePage: (rowsOnPage: T[]) => void;
  /** Vira "exclude all": seleciona TUDO (incluindo dados não carregados). */
  selectAll: () => void;
  /** Limpa. */
  clear: () => void;
  /** Quantidade selecionada (rows visíveis). */
  selectedCount: number;
  /** IDs como array (utility). */
  selectedIds: GridRowId[];
  /** True quando todas as rows visíveis estão selecionadas. */
  isPageSelected: (rowsOnPage: T[]) => boolean;
  /** True quando ALGUMA (mas não todas) estão selecionadas. Pra indeterminate. */
  isPageIndeterminate: (rowsOnPage: T[]) => boolean;
};

const EMPTY_STATE: GridSelectionState = { type: "include", ids: new Set() };

/**
 * Selection com modelo include/exclude. Permite "select all global" sem materializar IDs.
 */
export function useDataTableSelection<T>({
  rows,
  getRowId,
  selectionModel: controlledState,
  onSelectionModelChange,
}: UseDataTableSelectionParams<T>): UseDataTableSelectionResult<T> {
  const [uncontrolled, setUncontrolled] = useState<GridSelectionState>(EMPTY_STATE);
  const isControlled = controlledState !== undefined;
  const state = isControlled ? controlledState : uncontrolled;

  const setState = useCallback(
    (next: GridSelectionState) => {
      if (!isControlled) setUncontrolled(next);
      onSelectionModelChange?.(next);
    },
    [isControlled, onSelectionModelChange],
  );

  const isRowSelected = useCallback(
    (row: T) => {
      const id = getRowId(row);
      const hasInIds = state.ids.has(id);
      return state.type === "include" ? hasInIds : !hasInIds;
    },
    [state, getRowId],
  );

  const toggleRow = useCallback(
    (row: T) => {
      const id = getRowId(row);
      const nextIds = new Set(state.ids);
      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);
      setState({ type: state.type, ids: nextIds });
    },
    [state, getRowId, setState],
  );

  const togglePage = useCallback(
    (rowsOnPage: T[]) => {
      const allSelected = rowsOnPage.every(isRowSelected);
      const nextIds = new Set(state.ids);
      if (allSelected) {
        for (const r of rowsOnPage) {
          const id = getRowId(r);
          if (state.type === "include") nextIds.delete(id);
          else nextIds.add(id);
        }
      } else {
        for (const r of rowsOnPage) {
          const id = getRowId(r);
          if (state.type === "include") nextIds.add(id);
          else nextIds.delete(id);
        }
      }
      setState({ type: state.type, ids: nextIds });
    },
    [state, isRowSelected, getRowId, setState],
  );

  const selectAll = useCallback(() => {
    setState({ type: "exclude", ids: new Set() });
  }, [setState]);

  const clear = useCallback(() => {
    setState({ type: "include", ids: new Set() });
  }, [setState]);

  const selectedCount = useMemo(() => {
    if (state.type === "include") return state.ids.size;
    return rows.length - state.ids.size;
  }, [state, rows.length]);

  const selectedIds = useMemo<GridRowId[]>(() => {
    if (state.type === "include") return Array.from(state.ids);
    // exclude: visíveis menos os excluídos
    return rows
      .map(getRowId)
      .filter((id) => !state.ids.has(id));
  }, [state, rows, getRowId]);

  const isPageSelected = useCallback(
    (rowsOnPage: T[]) => rowsOnPage.length > 0 && rowsOnPage.every(isRowSelected),
    [isRowSelected],
  );

  const isPageIndeterminate = useCallback(
    (rowsOnPage: T[]) => {
      const sel = rowsOnPage.filter(isRowSelected).length;
      return sel > 0 && sel < rowsOnPage.length;
    },
    [isRowSelected],
  );

  return {
    state,
    isRowSelected,
    toggleRow,
    togglePage,
    selectAll,
    clear,
    selectedCount,
    selectedIds,
    isPageSelected,
    isPageIndeterminate,
  };
}
