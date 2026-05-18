import type {
  DataTablePresetView,
  DataTableViewMode,
  FilterItem,
  FilterModel,
  FilterOperator,
  FilterValue,
  GridRowId,
  SortModel,
} from "../data-table.types";
import type { ColumnPinned, TableDensity } from "../../Table";

/**
 * Filtro simplificado pra builder — `id` gerado automaticamente, `logicOperator`
 * default "AND". Consumer só fornece field/operator/value.
 */
export type PresetFilterInput = {
  field: string;
  operator?: FilterOperator;
  value?: FilterValue;
};

export type PresetViewInput = {
  /** ID único e estável — sugerido prefixo `preset:` (ex: `"preset:ativos"`). */
  id: string;
  /** Label da view nos tabs e popovers. */
  name: string;
  /**
   * Filtros aplicados. Forma curta: `[{ field, operator?, value? }]`.
   * Operator default = `"equals"`. `id` é gerado automaticamente.
   */
  filters?: PresetFilterInput[];
  /** Combinação dos filtros — `"AND"` (default) ou `"OR"`. */
  filterLogic?: "AND" | "OR";
  /** Multi-sort: `[{ field, direction }]`. Default `[]`. */
  sort?: SortModel[];
  /** Density visual. Default `"standard"`. */
  density?: TableDensity;
  /** Colunas escondidas (default `[]`). */
  hiddenColumns?: string[];
  /** Pin por field — `{ "field": "left" | "right" }`. Default `{}`. */
  pinnedColumns?: Record<string, ColumnPinned>;
  /** Width override por field (px). Default `{}`. */
  columnWidths?: Record<string, number>;
  /** Ordem visual das colunas. Default = ordem original. */
  columnOrder?: string[];
  /** Modo de visualização — `"table"` (default) ou `"kanban"`. */
  viewMode?: DataTableViewMode;
  /** Field pelo qual agrupar (sem agrupamento se ausente). */
  groupBy?: string;
  /** Rows que iniciam expandidas. Default `[]`. */
  expandedRowIds?: GridRowId[];
};

/**
 * Builder pra declarar `DataTablePresetView` com defaults razoáveis e shape
 * mínimo. Elimina boilerplate de `filterModel.items[0].id`, `logicOperator`,
 * `sortModel: []`, etc.
 *
 * Exemplos:
 *
 * ```tsx
 * // Filtro simples
 * presetView({
 *   id: "preset:ativos",
 *   name: "Ativos",
 *   filters: [{ field: "statusId", value: "active" }],
 * });
 *
 * // Kanban view agrupada
 * presetView({
 *   id: "preset:pipeline",
 *   name: "Pipeline (Kanban)",
 *   viewMode: "kanban",
 *   groupBy: "statusId",
 * });
 *
 * // Multi-filter + sort + layout customizado
 * presetView({
 *   id: "preset:high-value",
 *   name: "Alto valor (decrescente)",
 *   filters: [
 *     { field: "value", operator: "gt", value: 10000 },
 *     { field: "statusId", value: "active" },
 *   ],
 *   sort: [{ field: "value", direction: "desc" }],
 *   pinnedColumns: { name: "left" },
 *   hiddenColumns: ["lastContact"],
 * });
 * ```
 */
export function presetView(input: PresetViewInput): DataTablePresetView {
  const {
    id,
    name,
    filters = [],
    filterLogic = "AND",
    sort = [],
    density = "standard",
    hiddenColumns,
    pinnedColumns,
    columnWidths,
    columnOrder,
    viewMode,
    groupBy,
    expandedRowIds,
  } = input;

  const filterItems: FilterItem[] = filters.map((f, idx) => ({
    id: `${id}-filter-${idx}`,
    field: f.field,
    operator: f.operator ?? "equals",
    value: f.value,
  }));

  const filterModel: FilterModel = {
    items: filterItems,
    logicOperator: filterLogic,
  };

  return {
    id,
    name,
    state: {
      filterModel,
      sortModel: sort,
      density,
      hiddenColumns,
      pinnedColumns,
      columnWidths,
      columnOrder,
      viewMode,
      groupBy,
      expandedRowIds,
    },
  };
}
