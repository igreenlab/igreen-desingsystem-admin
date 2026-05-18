import { useMemo } from "react";
import type {
  SortPopoverColumn,
  SortPopoverCriterion,
} from "../../TableToolbar";
import type { DataTableColumnDef, SortModel } from "../data-table.types";

export type UseSortPopoverAdapterParams<T> = {
  effectiveColumns: DataTableColumnDef<T>[];
  sortModels: SortModel[];
  setSortModels: (models: SortModel[]) => void;
};

export type UseSortPopoverAdapterResult = {
  /** Colunas filtradas (sem actions, sortable !== false) no formato do SortPopover. */
  sortPopoverColumns: SortPopoverColumn[];
  /** Critérios atuais (field + dir) — mapeado de sortModels. */
  sortPopoverCriteria: SortPopoverCriterion[];
  /** Handler que converte critérios do popover → setSortModels. */
  handleSortChange: (criteria: SortPopoverCriterion[]) => void;
};

/**
 * Adapter: ColumnDef + SortModel ↔ SortPopover props.
 *
 * Extraído do data-table.tsx pra isolar a tradução entre tipos do TableToolbar
 * e tipos do DataTable. Filtra colunas não-sortables (type === "actions" ou
 * sortable === false) — só aparecem no popover as que fazem sentido.
 */
export function useSortPopoverAdapter<T>({
  effectiveColumns,
  sortModels,
  setSortModels,
}: UseSortPopoverAdapterParams<T>): UseSortPopoverAdapterResult {
  const sortPopoverColumns = useMemo<SortPopoverColumn[]>(
    () =>
      effectiveColumns
        .filter((c) => c.type !== "actions" && c.sortable !== false)
        .map((c) => ({
          key: String(c.field),
          label: c.headerName,
          icon: c.icon,
        })),
    [effectiveColumns],
  );

  const sortPopoverCriteria = useMemo<SortPopoverCriterion[]>(
    () => sortModels.map((s) => ({ key: s.field, dir: s.direction })),
    [sortModels],
  );

  const handleSortChange = (criteria: SortPopoverCriterion[]) => {
    setSortModels(criteria.map((c) => ({ field: c.key, direction: c.dir })));
  };

  return {
    sortPopoverColumns,
    sortPopoverCriteria,
    handleSortChange,
  };
}
