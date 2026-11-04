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

/** Item com o que comparar. Operador nulário (`isEmpty`/`isNotEmpty`) dispensa valor. */
function itemComOQueComparar(item: FilterModel["items"][number]): boolean {
  if (item.operator === "isEmpty" || item.operator === "isNotEmpty") return true;
  const v = item.value;
  if (v == null) return false;
  if (typeof v === "string") return v.length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
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

  /**
   * A query que vai PRO SERVIDOR — só os filtros que têm o que comparar.
   *
   * "Filtro incompleto não dispara nada" é regra do sistema, não do `DataTable`:
   * o `useDataTableQuery` já filtra assim antes de chamar o `fetchData`
   * (`isActiveFilterItem`), espelhando o gate de payload e o guard do motor da
   * API. Aqui nunca tinha efeito porque nada produzia item sem valor no
   * `DataList` — o drawer remove o item quando o valor esvazia.
   *
   * Passou a ter: o chip agora **mantém** um item vazio enquanto o popover está
   * aberto, pra não desmontar a própria âncora. Esse item é interno à interação;
   * emiti-lo faria o backend de quem usa `mode="server"` receber um `equals` sem
   * valor que ele nunca recebeu antes. Filtrado aqui, o que sai é byte por byte
   * o de antes.
   */
  const queryParaServidor = useMemo<DataListQuery>(
    () => ({
      ...query,
      filterModel: {
        ...query.filterModel,
        items: query.filterModel.items.filter(itemComOQueComparar),
      },
    }),
    [query],
  );
  /* A assinatura do que o servidor VÊ é o gatilho — assim pôr e tirar o item
     vazio do chip não vira duas requests idênticas. Mesmo papel do
     `activeFilterKey` do `useDataTableQuery`. */
  const chaveDoServidor = useMemo(
    () => JSON.stringify(queryParaServidor),
    [queryParaServidor],
  );
  const queryParaServidorRef = useRef(queryParaServidor);
  queryParaServidorRef.current = queryParaServidor;

  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;
  useEffect(() => {
    if (mode !== "server") return;
    const t = setTimeout(
      () => onQueryChangeRef.current?.(queryParaServidorRef.current),
      250,
    );
    return () => clearTimeout(t);
  }, [mode, chaveDoServidor]);

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
