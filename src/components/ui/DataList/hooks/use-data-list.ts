import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListItemData } from "@/components/ui/List";
import type {
  ActiveFilter,
  DataListMode,
  DataListQuery,
  DataListView,
  FilterableField,
} from "../data-list.types";

const EMPTY_QUERY: DataListQuery = { search: "", filters: [] };

function asText(v: unknown): string {
  return typeof v === "string" || typeof v === "number" ? String(v) : "";
}

/** Carrega a query persistida (best-effort). */
function loadPersisted(key?: string): DataListQuery | null {
  if (!key || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(`ds-datalist:${key}`);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return { search: p.search ?? "", filters: Array.isArray(p.filters) ? p.filters : [] };
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
  onQueryChange?: (q: DataListQuery) => void;
  onSelectionChange?: (ids: Set<string>) => void;
};

/**
 * Controller do DataList — orquestra query (search + filtros), views, seleção,
 * expansão e persistência. No modo client filtra/busca localmente; no server
 * só serializa a query via onQueryChange (consumer faz o fetch).
 */
export function useDataList({
  items,
  mode,
  filterFields,
  views,
  persistKey,
  onQueryChange,
  onSelectionChange,
}: Options) {
  const [query, setQuery] = useState<DataListQuery>(
    () => loadPersisted(persistKey) ?? EMPTY_QUERY,
  );
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /* persistência */
  useEffect(() => {
    if (!persistKey || typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(`ds-datalist:${persistKey}`, JSON.stringify(query));
    } catch {
      /* ignore quota */
    }
  }, [persistKey, query]);

  /* server: emite query (debounce no search) */
  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;
  useEffect(() => {
    if (mode !== "server") return;
    const t = setTimeout(() => onQueryChangeRef.current?.(query), 250);
    return () => clearTimeout(t);
  }, [mode, query]);

  /* mutadores */
  const setSearch = useCallback((search: string) => {
    setActiveViewId(null);
    setQuery((q) => ({ ...q, search }));
  }, []);

  const setFilters = useCallback((filters: ActiveFilter[]) => {
    setActiveViewId(null);
    setQuery((q) => ({ ...q, filters }));
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

  /** Substitui o set inteiro (a List controla seleção pelo set completo). */
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

  /* client: aplica busca + filtros (flat; em grouped/hierarchical filtra no nível raiz) */
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

  const matchesFilters = useCallback(
    (item: ListItemData) => {
      for (const f of query.filters) {
        const field = fieldsById.get(f.fieldId);
        if (!field) continue;
        const val = field.accessor(item);
        if (field.type === "boolean") {
          if (Boolean(val) !== Boolean(f.value)) return false;
        } else if (field.type === "number") {
          if (Number(val) !== Number(f.value)) return false;
        } else {
          // text / select / date → comparação por substring/igualdade textual
          const a = asText(val).toLowerCase();
          const b = String(f.value).toLowerCase();
          if (field.type === "select" || field.type === "date") {
            if (a !== b) return false;
          } else if (!a.includes(b)) return false;
        }
      }
      return true;
    },
    [query.filters, fieldsById],
  );

  const processedItems = useMemo(() => {
    if (mode === "server") return items; // server já manda filtrado
    if (!query.search && query.filters.length === 0) return items;
    return items.filter((it) => matchesSearch(it) && matchesFilters(it));
  }, [mode, items, query.search, query.filters, matchesSearch, matchesFilters]);

  return {
    query,
    activeViewId,
    setSearch,
    setFilters,
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
