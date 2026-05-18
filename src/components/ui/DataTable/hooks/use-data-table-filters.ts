import { useCallback, useState } from "react";
import type { FilterModel } from "../data-table.types";

export type UseDataTableFiltersParams = {
  filterModel?: FilterModel;
  onFilterModelChange?: (model: FilterModel) => void;
  initialFilterModel?: FilterModel;
};

export type UseDataTableFiltersResult = {
  filterModel: FilterModel;
  setFilterModel: (model: FilterModel) => void;
  clearFilters: () => void;
};

const EMPTY_MODEL: FilterModel = { items: [], logicOperator: "AND" };

export function useDataTableFilters({
  filterModel: controlled,
  onFilterModelChange,
  initialFilterModel,
}: UseDataTableFiltersParams = {}): UseDataTableFiltersResult {
  const [uncontrolled, setUncontrolled] = useState<FilterModel>(
    initialFilterModel ?? EMPTY_MODEL,
  );
  const isControlled = controlled !== undefined;
  const filterModel = isControlled ? controlled : uncontrolled;

  const setFilterModel = useCallback(
    (model: FilterModel) => {
      if (!isControlled) setUncontrolled(model);
      onFilterModelChange?.(model);
    },
    [isControlled, onFilterModelChange],
  );

  const clearFilters = useCallback(() => {
    setFilterModel(EMPTY_MODEL);
  }, [setFilterModel]);

  return { filterModel, setFilterModel, clearFilters };
}
