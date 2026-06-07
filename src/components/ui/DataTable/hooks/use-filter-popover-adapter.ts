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

  /** Operadores que tradicionalmente agrupam múltiplos valores numa única
   *  condição UI (chip+popover) — multiSelect, tags, etc usam isAnyOf/isNoneOf
   *  e o filterModel guarda 1 item por valor (spread). Pra renderizar no popover
   *  de "Filtros" como 1 entry com value=array, agrupamos aqui. */
  const MULTI_VALUE_OPERATORS = new Set<FilterItem["operator"]>(["isAnyOf", "isNoneOf"]);

  const filterPopoverEntries = useMemo<FilterPopoverEntry[]>(() => {
    // 1ª passada: coletar items por chave multi (field|operator)
    const multiGroups = new Map<string, FilterItem[]>();
    for (const item of filterModel.items) {
      if (MULTI_VALUE_OPERATORS.has(item.operator)) {
        const key = `${item.field}|${item.operator}`;
        if (!multiGroups.has(key)) multiGroups.set(key, []);
        multiGroups.get(key)!.push(item);
      }
    }

    // 2ª passada: emitir entries NA ORDEM ORIGINAL do filterModel.
    // Multi groups são emitidos UMA vez, na posição do primeiro item do grupo
    // (preserva visual position quando user toggla valores). Sem isso, multi
    // groups eram empurrados pro fim e o chip pulava de posição ao editar.
    const seenMultiKeys = new Set<string>();
    const result: FilterPopoverEntry[] = [];
    for (const item of filterModel.items) {
      if (MULTI_VALUE_OPERATORS.has(item.operator)) {
        const key = `${item.field}|${item.operator}`;
        if (seenMultiKeys.has(key)) continue;
        seenMultiKeys.add(key);
        const groupItems = multiGroups.get(key)!;
        result.push({
          // ⚠️ ID ESTÁVEL = `${field}|${operator}` (não groupItems[0].id que
          // muda a cada spread no handleFiltersChange). Sem isso, key do
          // FilterRowEditor mudava → unmount/remount → Popover interno do
          // MultiSelectFieldDropdown perdia state e FECHAVA a cada toggle.
          id: key,
          columnKey: groupItems[0].field,
          op: FILTER_OP_TO_POPOVER_OP[groupItems[0].operator] ?? groupItems[0].operator,
          value: groupItems
            .map((it) => it.value)
            .filter((v) => v != null && v !== ""),
        });
      } else {
        result.push({
          id: item.id,
          columnKey: item.field,
          op: FILTER_OP_TO_POPOVER_OP[item.operator] ?? item.operator,
          value: item.value ?? "",
        });
      }
    }

    return result;
  }, [filterModel]);

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

        // Chip placeholder: grupo cujos items todos têm value vazio.
        // Acontece em 2 cenários:
        //   1) Filter shortcut do header (chip "fantasma" via pendingOpenChipKey)
        //   2) showEmptyFilterChips=true com filterModel pré-ativos vazios
        // ToolbarApplied usa isEmpty pra renderizar apenas o columnLabel.
        const allItemsEmpty = g.items.every((it) => isFilterValueEmpty(it.value));
        if (allItemsEmpty) {
          return {
            id: g.key,
            columnLabel,
            op: FILTER_OP_TO_POPOVER_OP[g.operator] ?? g.operator,
            value: [],
            isEmpty: true,
          };
        }

        const labelOf = (v: unknown): string => {
          const opt = col?.filterOptions?.find(
            (o) => String(o.value) === String(v),
          );
          return opt?.label ?? String(v);
        };

        const typeId = col?.filterType ?? col?.type ?? "text";
        const typeDef = columnTypeRegistry.get(typeId);
        if (typeDef.renderChipValue && g.items.length > 0) {
          // Passa options pro renderChipValue resolver value → label friendly.
          // Sem isso, o chip mostrava o RAW value (ex: "active" em vez de "Ativo").
          const chipOptions = col?.filterOptions as ColumnOption[] | undefined;
          const chipValues = g.items.map((it) =>
            typeDef.renderChipValue!(it.value as never, chipOptions),
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
    const groupIds = new Set(group.items.map((i) => i.id));
    const newId = () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newItems: FilterItem[] = [];
    const isTupleOperator = group.operator === "between";

    // Auto-promote operator escalar → multi quando filterType=multiSelect e value
    // chegou como array (widget multiSelect SEMPRE manda array, mesmo com 1 valor).
    // Sem esse normalize, filter shortcut do header em coluna multiSelect persiste
    // operator "eq" e cria N items separados — bug que aparece no popover Filtros
    // como N linhas em vez de 1 agrupada.
    const col = colsByField.get(group.field);
    const widgetIsMulti = col?.filterType === "multiSelect";
    const effectiveOperator: FilterItem["operator"] =
      Array.isArray(newValue) &&
      widgetIsMulti &&
      !MULTI_VALUE_OPERATORS.has(group.operator)
        ? group.operator === "neq"
          ? "isNoneOf"
          : "isAnyOf"
        : group.operator;

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
          operator: effectiveOperator,
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
          operator: effectiveOperator,
          value: v as FilterItem["value"],
        });
      }
    }
    // Preserva a POSIÇÃO ORIGINAL do grupo no array — sem isso, o chip era
    // empurrado pro fim ao editar valor (visualmente confuso quando há 3+ chips).
    // Substituímos os items do grupo IN-PLACE pelos newItems, na posição da
    // primeira ocorrência.
    const reconstructed: FilterItem[] = [];
    let inserted = false;
    for (const item of filterModel.items) {
      if (groupIds.has(item.id)) {
        if (!inserted) {
          reconstructed.push(...newItems);
          inserted = true;
        }
        // demais items do grupo: skip (já adicionados via spread acima)
      } else {
        reconstructed.push(item);
      }
    }
    // Fallback defensivo: se grupo não foi achado (edge case), append no fim
    if (!inserted) reconstructed.push(...newItems);

    setFilterModel({ ...filterModel, items: reconstructed });
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
    const newId = () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const items: FilterItem[] = [];
    for (const e of entries) {
      const rawOperator =
        POPOVER_OP_TO_FILTER_OP[e.op] ?? (e.op as FilterItem["operator"]);

      // Auto-promote operator pra `isAnyOf`/`isNoneOf` quando o widget mandou
      // array mas o operator é escalar (eq/neq). Acontece quando preset/saved
      // view foi declarado com `{ field, value }` (default operator="equals")
      // mas a column.filterType="multiSelect" — o widget MultiSelectFieldDropdown
      // sempre togglea com array, então o operator escalar fica inconsistente
      // (chip mostraria "Status = active, pending" em vez de "é um de").
      const col = colsByField.get(e.columnKey);
      const widgetIsMulti = col?.filterType === "multiSelect";
      const operator: FilterItem["operator"] =
        Array.isArray(e.value) &&
        widgetIsMulti &&
        !MULTI_VALUE_OPERATORS.has(rawOperator)
          ? rawOperator === "neq"
            ? "isNoneOf"
            : "isAnyOf"
          : rawOperator;

      // Operadores multi (isAnyOf/isNoneOf): popover passa value=array
      // (vimos como 1 entry agrupada em filterPopoverEntries); spreadar
      // de volta em N items no filterModel (1 por valor), pra match com
      // a representação interna que outros caminhos como updateGroupValue
      // já esperam (1 item por valor selecionado).
      if (MULTI_VALUE_OPERATORS.has(operator) && Array.isArray(e.value)) {
        for (const v of e.value as unknown[]) {
          if (v == null || v === "") continue;
          items.push({
            id: newId(),
            field: e.columnKey,
            operator,
            value: v as FilterItem["value"],
          });
        }
      } else {
        items.push({
          id: e.id,
          field: e.columnKey,
          operator,
          value: e.value as FilterItem["value"],
        });
      }
    }
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
