import { useCallback, useState } from "react";
import type { SortModel } from "../data-table.types";

/** Normaliza valor controlled/initial pra array (aceita single, array ou null). */
function toArray(v: SortModel | SortModel[] | null | undefined): SortModel[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

export type UseDataTableSortParams = {
  /**
   * Controlled sort. Aceita single (1 criterio) ou array (multi-sort).
   * Array vazio ou null = sem sort.
   */
  sortModel?: SortModel | SortModel[] | null;
  /** Callback quando muda. Sempre recebe array. */
  onSortModelChange?: (model: SortModel[]) => void;
  /** Hidratado de localStorage. Single ou array. */
  initialSortModel?: SortModel | SortModel[] | null;
};

export type UseDataTableSortResult = {
  /** Lista de criterios — primeiro = prioridade maior. */
  sortModels: SortModel[];
  /** Backward-compat: primeiro criterio (ou null). */
  sortModel: SortModel | null;
  /** Click no header — ciclo asc → desc → null. Substitui multi por single. */
  handleSort: (field: string) => void;
  /** Setter direto (substitui lista inteira). */
  setSortModels: (models: SortModel[]) => void;
  /**
   * @deprecated — use setSortModels com array.
   * Compat: aceita single objeto/null e wrappea pra array.
   */
  setSortModel: (model: SortModel | null) => void;
};

/**
 * Sort state — multi-sort com array de criterios.
 *
 * Click no header zera multi e define 1 criterio (ciclo asc/desc/null).
 * Multi-sort eh editado via popover (SortPopover usa setSortModels com array).
 *
 * Controlled quando `sortModel` prop presente (aceita single ou array).
 */
export function useDataTableSort({
  sortModel: controlledSort,
  onSortModelChange,
  initialSortModel,
}: UseDataTableSortParams = {}): UseDataTableSortResult {
  const [uncontrolledSort, setUncontrolledSort] = useState<SortModel[]>(
    () => toArray(initialSortModel),
  );
  const isControlled = controlledSort !== undefined;
  const sortModels = isControlled ? toArray(controlledSort) : uncontrolledSort;

  const setSortModels = useCallback(
    (models: SortModel[]) => {
      if (!isControlled) setUncontrolledSort(models);
      onSortModelChange?.(models);
    },
    [isControlled, onSortModelChange],
  );

  const setSortModel = useCallback(
    (model: SortModel | null) => {
      setSortModels(model ? [model] : []);
    },
    [setSortModels],
  );

  const handleSort = useCallback(
    (field: string) => {
      // Click no header SEMPRE zera multi e define 1 criterio com ciclo.
      // Pra adicionar multi, usar SortPopover.
      const current = sortModels.find((s) => s.field === field);
      if (!current) {
        setSortModels([{ field, direction: "asc" }]);
      } else if (current.direction === "asc") {
        setSortModels([{ field, direction: "desc" }]);
      } else {
        setSortModels([]);
      }
    },
    [sortModels, setSortModels],
  );

  return {
    sortModels,
    sortModel: sortModels[0] ?? null,
    handleSort,
    setSortModels,
    setSortModel,
  };
}
