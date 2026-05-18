import { useMemo } from "react";
import type { ReactNode } from "react";
import type {
  AppliedFilter,
  FilterPopoverColumn,
  FilterPopoverEntry,
} from "../../TableToolbar";
import { columnTypeRegistry } from "../column-types";
import type { ColumnOption } from "../column-types";
import type {
  DataTableColumnDef,
  FilterItem,
  FilterModel,
} from "../data-table.types";
import {
  FILTER_OP_TO_POPOVER_OP,
  POPOVER_OP_TO_FILTER_OP,
} from "../utils/operator-mapping";

/** True quando um FilterValue é "vazio" (sem efeito) — null, string vazia,
 *  ou tupla com todos sides nulos/strings vazias. */
function isFilterValueEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.length === 0;
  if (Array.isArray(v)) {
    return v.every(
      (x) => x == null || (typeof x === "string" && x.length === 0),
    );
  }
  return false;
}

export type FilterGroup<T> = {
  key: string;
  field: string;
  operator: FilterItem["operator"];
  items: FilterItem[];
};

export type UseFilterPopoverAdapterParams<T> = {
  /** Colunas efetivas pós hidden/order. */
  effectiveColumns: DataTableColumnDef<T>[];
  /** ColumnDef props originais — usado pra options de filtros. */
  allColumns: DataTableColumnDef<T>[];
  /** Rows (client mode) pra auto-extract options de select. */
  rows: T[] | undefined;
  /** FilterModel atual + setter. */
  filterModel: FilterModel;
  setFilterModel: (model: FilterModel) => void;
  /** Map de field → DataTableColumnDef (memoized externamente pra evitar dupla criação). */
  colsByField: Map<string, DataTableColumnDef<T>>;
  /** Map de field → label do header. */
  colLabelMap: Record<string, string>;
  /** Chave de chip pendente de abertura — pra incluir items vazios renderizando "phantom chip". */
  pendingOpenChipKey: string | null;
};

export type UseFilterPopoverAdapterResult<T> = {
  filterPopoverColumns: FilterPopoverColumn[];
  filterPopoverEntries: FilterPopoverEntry[];
  appliedGroups: FilterGroup<T>[];
  appliedFilters: AppliedFilter[];
  removeGroup: (groupKey: string) => void;
  updateGroupValue: (groupKey: string, newValue: unknown) => void;
  getGroupOptions: (groupKey: string) => ColumnOption[];
  handleFiltersChange: (entries: FilterPopoverEntry[]) => void;
  isFilterValueEmpty: (v: unknown) => boolean;
};

/**
 * Adapter completo: ColumnDef + FilterModel ↔ FilterPopover/ToolbarApplied props.
 *
 * Encapsula a tradução entre o estado do DataTable (FilterModel.items lista flat)
 * e o estado visual do TableToolbar (chips agrupados por field+operator). Mantém
 * regras importantes:
 *  - "Phantom chip" (item vazio renderiza chip se `pendingOpenChipKey` casa) pra
 *    que o filter shortcut do header tenha popover âncora válido.
 *  - `between` (tupla) → 1 item single com value=tupla; demais → spread em N items.
 *  - `renderChipValue` do registry vence labelOf padrão.
 *  - Items vazios filtrados na renderização normal (sem polluir o toolbar).
 */
export function useFilterPopoverAdapter<T>({
  effectiveColumns,
  allColumns,
  rows,
  filterModel,
  setFilterModel,
  colsByField,
  colLabelMap,
  pendingOpenChipKey,
}: UseFilterPopoverAdapterParams<T>): UseFilterPopoverAdapterResult<T> {
  const filterPopoverColumns = useMemo<FilterPopoverColumn[]>(
    () =>
      effectiveColumns
        .filter((c) => c.enableColumnFilter)
        .map((c) => {
          let popoverType: FilterPopoverColumn["type"] = "text";
          if (c.filterType === "number") popoverType = "number";
          else if (c.filterType === "select" || c.filterType === "multiSelect") {
            popoverType = "select";
          }
          let options = c.filterOptions?.map((o) => ({
            value: String(o.value),
            label: o.label,
          }));
          if (popoverType === "select" && (!options || options.length === 0) && rows) {
            const set = new Set<string>();
            for (const r of rows) {
              const v = c.valueGetter
                ? c.valueGetter(r)
                : (r as Record<string, unknown>)[String(c.field)];
              if (v != null && v !== "") set.add(String(v));
            }
            options = Array.from(set).map((v) => ({ value: v, label: v }));
          }
          return {
            key: String(c.field),
            label: c.headerName,
            type: popoverType,
            options,
            filterType: c.filterType,
          };
        }),
    [effectiveColumns, rows],
  );

  const filterPopoverEntries = useMemo<FilterPopoverEntry[]>(
    () =>
      filterModel.items.map((item) => ({
        id: item.id,
        columnKey: item.field,
        op: FILTER_OP_TO_POPOVER_OP[item.operator] ?? item.operator,
        value: item.value ?? "",
      })),
    [filterModel],
  );

  const appliedGroups = useMemo<FilterGroup<T>[]>(() => {
    const grouped = new Map<string, FilterItem[]>();
    for (const item of filterModel.items) {
      const key = `${item.field}|${item.operator}`;
      const isEmpty = isFilterValueEmpty(item.value);
      // Items vazios são pulados — exceção: pending pra abrir popover (filter shortcut)
      if (isEmpty && key !== pendingOpenChipKey) continue;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    }
    return Array.from(grouped.entries()).map(([key, items]) => ({
      key,
      field: items[0].field,
      operator: items[0].operator,
      items,
    }));
  }, [filterModel, pendingOpenChipKey]);

  const appliedFilters = useMemo<AppliedFilter[]>(
    () =>
      appliedGroups.map((g) => {
        const col = colsByField.get(g.field);
        const columnLabel = colLabelMap[g.field] ?? g.field;

        const labelOf = (v: unknown): string => {
          const opt = col?.filterOptions?.find(
            (o) => String(o.value) === String(v),
          );
          return opt?.label ?? String(v);
        };

        const typeId = col?.filterType ?? col?.type ?? "text";
        const typeDef = columnTypeRegistry.get(typeId);
        if (typeDef.renderChipValue && g.items.length > 0) {
          const chipValues = g.items.map((it) =>
            typeDef.renderChipValue!(it.value as never),
          );
          const filteredChips = chipValues.filter(
            (v) => v != null && v !== "",
          );
          const value: ReactNode | ReactNode[] =
            filteredChips.length === 1
              ? filteredChips[0]
              : filteredChips.length <= 2
                ? (filteredChips as ReactNode[])
                : `${filteredChips.length} selecionados`;
          return {
            id: g.key,
            columnLabel,
            op: FILTER_OP_TO_POPOVER_OP[g.operator] ?? g.operator,
            value,
          };
        }

        const allValues: string[] = [];
        for (const item of g.items) {
          if (Array.isArray(item.value)) {
            for (const v of item.value as unknown[]) allValues.push(labelOf(v));
          } else if (item.value != null) {
            allValues.push(labelOf(item.value));
          }
        }
        const value: ReactNode | ReactNode[] =
          allValues.length <= 2 ? allValues : `${allValues.length} selecionados`;
        return {
          id: g.key,
          columnLabel,
          op: FILTER_OP_TO_POPOVER_OP[g.operator] ?? g.operator,
          value,
        };
      }),
    [appliedGroups, colLabelMap, colsByField],
  );

  const removeGroup = (groupKey: string) => {
    const group = appliedGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const ids = new Set(group.items.map((i) => i.id));
    setFilterModel({
      ...filterModel,
      items: filterModel.items.filter((i) => !ids.has(i.id)),
    });
  };

  const updateGroupValue = (groupKey: string, newValue: unknown) => {
    const group = appliedGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const otherItems = filterModel.items.filter(
      (i) => !group.items.some((gi) => gi.id === i.id),
    );
    const newId = () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newItems: FilterItem[] = [];
    const isTupleOperator = group.operator === "between";
    if (isTupleOperator) {
      const isEmpty =
        newValue == null ||
        (Array.isArray(newValue) &&
          newValue.every(
            (x) => x == null || (typeof x === "string" && x.length === 0),
          ));
      if (!isEmpty) {
        newItems.push({
          id: newId(),
          field: group.field,
          operator: group.operator,
          value: newValue as FilterItem["value"],
        });
      }
    } else {
      const arr = Array.isArray(newValue)
        ? (newValue as unknown[])
        : newValue != null && newValue !== ""
          ? [newValue]
          : [];
      for (const v of arr) {
        newItems.push({
          id: newId(),
          field: group.field,
          operator: group.operator,
          value: v as FilterItem["value"],
        });
      }
    }
    setFilterModel({
      ...filterModel,
      items: [...otherItems, ...newItems],
    });
  };

  const getGroupOptions = (groupKey: string): ColumnOption[] => {
    const group = appliedGroups.find((g) => g.key === groupKey);
    if (!group) return [];
    const col = colsByField.get(group.field);
    if (col?.filterOptions && col.filterOptions.length > 0) {
      return col.filterOptions.map((o) => ({
        label: o.label,
        value: o.value as string | number,
        color: o.color,
      }));
    }
    const rowsForExtract = rows ?? [];
    const set = new Set<string>();
    for (const r of rowsForExtract) {
      const v = col?.valueGetter
        ? col.valueGetter(r)
        : (r as Record<string, unknown>)[group.field];
      if (v != null && v !== "") set.add(String(v));
    }
    return Array.from(set).map((v) => ({ label: v, value: v }));
  };

  const handleFiltersChange = (entries: FilterPopoverEntry[]) => {
    const items: FilterItem[] = entries.map((e) => ({
      id: e.id,
      field: e.columnKey,
      operator: POPOVER_OP_TO_FILTER_OP[e.op] ?? (e.op as FilterItem["operator"]),
      value: e.value as FilterItem["value"],
    }));
    setFilterModel({ ...filterModel, items });
  };

  return {
    filterPopoverColumns,
    filterPopoverEntries,
    appliedGroups,
    appliedFilters,
    removeGroup,
    updateGroupValue,
    getGroupOptions,
    handleFiltersChange,
    isFilterValueEmpty,
  };
}
