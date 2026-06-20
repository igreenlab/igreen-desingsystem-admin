import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FilterModel } from "@/components/ui/DataTable/data-table.types";
import type { ListItemData } from "@/components/ui/List";
import type {
  DataListMode,
  DataListQuery,
  DataListView,
  FilterableField,
} from "../data-list.types";
import { applyFilterModel } from "../utils/apply-filter-model";

const EMPTY_MODEL: FilterModel = { items: [], logicOperator: "AND" };
const EMPTY_QUERY: DataListQuery = { search: "", filterModel: EMPTY_MODEL };

function asText(v: unknown): string {
  return typeof v === "string" || typeof v === "number" ? String(v) : "";
}

function loadPersisted(key?: string): DataListQuery | null {
  if (!key || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(`ds-datalist:${key}`);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      search: p.search ?? "",
      filterModel: p.filterModel?.items
        ? { items: p.filterModel.items, logicOperator: p.filterModel.logicOperator ?? "AND" }
        : EMPTY_MODEL,
    };
  } catch {
    return null;
  }
}

type Options = {
  items: ListItemData[];
  mode: DataListMode;
  filterFields?: FilterableField[];
  views?: DataListView[];
  persistKey?: string;
  defaultExpandedIds?: Set<string>;
  onQueryChange?: (q: DataListQuery) => void;
  onSelectionChange?: (ids: Set<string>) => void;
};

/**
 * Controller do DataList — query (search + filterModel), views, seleção,
 * expansão, persistência. Client filtra/busca localmente; server só serializa
 * a query via onQueryChange. Usa o FilterModel da TableToolbar (drawer idêntico).
 */
export function useDataList({
  items,
  mode,
  filterFields,
  views,
  persistKey,
  defaultExpandedIds,
  onQueryChange,
  onSelectionChange,
}: Options) {
  const [query, setQuery] = useState<DataListQuery>(
    () => loadPersisted(persistKey) ?? EMPTY_QUERY,
  );
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(
    () => defaultExpandedIds ?? new Set(),
  );

  useEffect(() => {
    if (!persistKey || typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(`ds-datalist:${persistKey}`, JSON.stringify(query));
    } catch {
      /* quota */
    }
  }, [persistKey, query]);

  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;
  useEffect(() => {
    if (mode !== "server") return;
    const t = setTimeout(() => onQueryChangeRef.current?.(query), 250);
    return () => clearTimeout(t);
  }, [mode, query]);

  const setSearch = useCallback((search: string) => {
    setActiveViewId(null);
    setQuery((q) => ({ ...q, search }));
  }, []);

  const setFilterModel = useCallback((filterModel: FilterModel) => {
    setActiveViewId(null);
    setQuery((q) => ({ ...q, filterModel }));
  }, []);

  const applyView = useCallback((view: DataListView | null) => {
    setActiveViewId(view?.id ?? null);
    setQuery(view ? view.query : EMPTY_QUERY);
  }, []);

  const toggleSelect = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange],
  );

  const clearSelection = useCallback(() => {
    setSelected(() => {
      const next = new Set<string>();
      onSelectionChange?.(next);
      return next;
    });
  }, [onSelectionChange]);

  const replaceSelection = useCallback(
    (next: Set<string>) => {
      setSelected(next);
      onSelectionChange?.(next);
    },
    [onSelectionChange],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const fieldsById = useMemo(() => {
    const m = new Map<string, FilterableField>();
    for (const f of filterFields ?? []) m.set(f.id, f);
    return m;
  }, [filterFields]);

  const matchesSearch = useCallback(
    (item: ListItemData) => {
      const s = query.search.trim().toLowerCase();
      if (!s) return true;
      const hay = [
        asText(item.title),
        asText(item.subtitle),
        asText(item.description),
        ...(filterFields ?? []).map((f) => asText(f.accessor(item))),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    },
    [query.search, filterFields],
  );

  const processedItems = useMemo(() => {
    if (mode === "server") return items;
    const searched = query.search
      ? items.filter(matchesSearch)
      : items;
    return applyFilterModel(searched, query.filterModel, fieldsById);
  }, [mode, items, query.search, query.filterModel, matchesSearch, fieldsById]);

  return {
    query,
    activeViewId,
    setSearch,
    setFilterModel,
    applyView,
    views: views ?? [],
    selected,
    toggleSelect,
    clearSelection,
    replaceSelection,
    expanded,
    toggleExpand,
    setExpanded,
    processedItems,
  };
}
