import { useMemo } from "react";
import type {
  DataTableColumnDef,
  FilterItem,
  FilterModel,
  PaginationModel,
  SortModel,
} from "../data-table.types";
import { columnTypeRegistry } from "../column-types";
import {
  getFieldValue,
  applyValueGetter,
  applyFormatter,
} from "../utils/resolve-value";

export type UseDataTableProcessorParams<T> = {
  rows: T[];
  columns: DataTableColumnDef<T>[];
  filterModel: FilterModel;
  search: string;
  searchField?: string; // 'all' (default) ou field específico
  /** Multi-sort: array de criterios (primeiro = prioridade maior). */
  sortModel: SortModel[];
  paginationModel: PaginationModel;
  /** Quando false, skip do slice de paginação — `rowsToRender` retorna todas as
   *  rows filtradas/buscadas/ordenadas. Use quando paginationConfig.enabled=false
   *  ou quando virtualize=true (virtualizer cuida do "render só visível"). Default true. */
  paginate?: boolean;
};

export type UseDataTableProcessorResult<T> = {
  /** Rows visíveis depois de filter+search+sort+paginate. */
  rowsToRender: T[];
  /** Rows depois de filter+search+sort (sem paginate) — pra "togglePage" considerar página atual completa. */
  rowsAllPagesProcessed: T[];
  /** Total após filter+search (sem paginate) — pra footer mostrar "1-10 de N". */
  totalAfterFilter: number;
};

// Helpers de resolução consolidados em utils/resolve-value.ts.

/* ── Filter ──────────────────────────────────────────────────────── */

/**
 * Match generico — delega pro ColumnTypeRegistry quando coluna tem filterType,
 * senao usa fallback string-based.
 */
function matchesFilter<T>(value: any, item: FilterItem, col: DataTableColumnDef<T> | undefined): boolean {
  const { operator } = item;
  const target = item.value;

  // Operadores neutros (sem valor)
  if (operator === "isEmpty") return value == null || value === "";
  if (operator === "isNotEmpty") return value != null && value !== "";

  // Delega pro registry quando coluna tem tipo
  if (col?.filterType) {
    const def = columnTypeRegistry.get(col.filterType);
    const result = def.matchesFilter(value, target as any, operator);
    if (result !== null) return result;
  }

  // Fallback string-based
  const str = value == null ? "" : String(value).toLowerCase();
  const targetStr = target == null ? "" : String(target).toLowerCase();
  switch (operator) {
    case "contains":   return str.includes(targetStr);
    case "equals":     return str === targetStr;
    case "neq":        return str !== targetStr;
    case "startsWith": return str.startsWith(targetStr);
    case "endsWith":   return str.endsWith(targetStr);
    case "isAnyOf":    return Array.isArray(target) && (target as any[]).some((t) => String(t).toLowerCase() === str);
    case "isNoneOf":   return !Array.isArray(target) || !(target as any[]).some((t) => String(t).toLowerCase() === str);
    case "gt":         return Number(value) > Number(target);
    case "lt":         return Number(value) < Number(target);
    case "gte":        return Number(value) >= Number(target);
    case "lte":        return Number(value) <= Number(target);
    default:           return true;
  }
}

/**
 * Agrupa filtros por (field + operator) — items do mesmo grupo combinam por OR
 * (ex: status=A + status=B vira "status ∈ {A,B}"). Grupos diferentes combinam
 * por AND (ex: status ∈ {...} AND city = X).
 *
 * Pra operadores agregados (isAnyOf, isNoneOf) com array, o grupo eh trivial.
 * Pra operadores escalares (equals, contains), reagrupa items repetidos.
 */
/** Item está "ativo" (deve filtrar) quando tem valor real OU operator nao
 *  precisa de valor (isEmpty/isNotEmpty). Filtros com value vazio/null/array
 *  vazio são ignorados — usuario abriu modal e adicionou linha mas ainda nao
 *  preencheu, não deve impactar a tabela. */
function isFilterItemActive(item: FilterItem): boolean {
  if (item.operator === "isEmpty" || item.operator === "isNotEmpty") return true;
  const v = item.value;
  if (v == null) return false;
  if (typeof v === "string") return v.length > 0;
  if (Array.isArray(v)) {
    return v.some((x) => x != null && (typeof x === "string" ? x.length > 0 : true));
  }
  return true;
}

function applyFilters<T>(rows: T[], filterModel: FilterModel, columns: DataTableColumnDef<T>[]): T[] {
  // Pula items "em construção" (sem valor preenchido) — eles entram no estado
  // quando user clica "+ Adicionar" no modal mas não devem afetar resultado.
  const activeItems = filterModel.items.filter(isFilterItemActive);
  if (activeItems.length === 0) return rows;
  const colsByField = new Map(columns.map((c) => [String(c.field), c]));

  // Agrupa itens por (field|operator)
  const groups = new Map<string, FilterItem[]>();
  for (const item of activeItems) {
    const key = `${item.field}|${item.operator}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return rows.filter((row) => {
    // AND entre grupos
    for (const items of groups.values()) {
      const col = colsByField.get(items[0].field);
      const value = col ? applyValueGetter(row, col) : getFieldValue(row, items[0].field);
      // OR dentro do grupo: row passa se QUALQUER item do grupo bate
      const passes = items.some((it) => matchesFilter(value, it, col));
      if (!passes) return false;
    }
    return true;
  });
}

/* ── Search ──────────────────────────────────────────────────────── */

function applySearch<T>(rows: T[], search: string, columns: DataTableColumnDef<T>[], searchField: string): T[] {
  if (!search.trim()) return rows;
  const needle = search.trim().toLowerCase();
  const searchableCols =
    searchField === "all" || !searchField
      ? columns.filter((c) => c.type !== "actions")
      : columns.filter((c) => String(c.field) === searchField);

  return rows.filter((row) =>
    searchableCols.some((col) => applyFormatter(row, col).toLowerCase().includes(needle)),
  );
}

/* ── Sort ────────────────────────────────────────────────────────── */

/** Compara 2 rows num criterio especifico. */
function compareByField<T>(
  a: T,
  b: T,
  field: string,
  direction: "asc" | "desc",
  columns: DataTableColumnDef<T>[],
): number {
  const col = columns.find((c) => String(c.field) === field);
  if (!col) return 0;
  const sign = direction === "asc" ? 1 : -1;
  const va = applyValueGetter(a, col);
  const vb = applyValueGetter(b, col);
  if (va == null && vb == null) return 0;
  if (va == null) return 1 * sign;
  if (vb == null) return -1 * sign;
  if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
  return String(va).localeCompare(String(vb)) * sign;
}

/** Multi-sort: aplica criterios em cascata — quebra de empate via proximo criterio. */
function applySort<T>(rows: T[], sortModel: SortModel[], columns: DataTableColumnDef<T>[]): T[] {
  if (!sortModel || sortModel.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const s of sortModel) {
      const cmp = compareByField(a, b, s.field, s.direction, columns);
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}

/* ── Pipeline cascateado ─────────────────────────────────────────── */

export function useDataTableProcessor<T>({
  rows,
  columns,
  filterModel,
  search,
  searchField = "all",
  sortModel,
  paginationModel,
  paginate = true,
}: UseDataTableProcessorParams<T>): UseDataTableProcessorResult<T> {
  // 1. Filter
  const filtered = useMemo(
    () => applyFilters(rows, filterModel, columns),
    [rows, filterModel, columns],
  );

  // 2. Search
  const searched = useMemo(
    () => applySearch(filtered, search, columns, searchField),
    [filtered, search, columns, searchField],
  );

  // 3. Sort
  const sorted = useMemo(
    () => applySort(searched, sortModel, columns),
    [searched, sortModel, columns],
  );

  // 4. Paginate (skip quando paginate=false → retorna todas as rows filtradas)
  const paginated = useMemo(() => {
    if (!paginate) return sorted;
    const { page, pageSize } = paginationModel;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, paginationModel, paginate]);

  return {
    rowsToRender: paginated,
    rowsAllPagesProcessed: sorted,
    totalAfterFilter: sorted.length,
  };
}
