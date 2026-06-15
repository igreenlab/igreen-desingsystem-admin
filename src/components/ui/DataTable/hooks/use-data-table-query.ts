import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  GridFetchParams,
  GridFetchResult,
  PaginationModel,
  SortModel,
  FilterModel,
  FilterItem,
} from "../data-table.types";
import { filterValueIsEmpty } from "../utils/filter-ops";

export type UseDataTableQueryParams<T> = {
  fetchData: (params: GridFetchParams) => Promise<GridFetchResult<T>>;
  filterModel: FilterModel;
  search: string;
  searchField?: string;
  sortModel: SortModel[];
  paginationModel: PaginationModel;
  /** Loading externo (forçado pelo consumer via prop). */
  externalLoading?: boolean;
  /** Debounce (ms) das mudanças de FILTRO. Default 350. Pagination/sort/search
   *  não passam por aqui (search já vem debounced do useDataTableSearch). */
  filterDebounceMs?: number;
};

export type UseDataTableQueryResult<T> = {
  /** Linhas retornadas pelo servidor pra página atual. */
  rowsToRender: T[];
  /** Total global do servidor (pra footer "1-10 de N"). */
  totalAfterFilter: number;
  /** True enquanto a request está em andamento. */
  isLoading: boolean;
  /** Última error string (ou null). */
  error: string | null;
  /** Dispara refetch imediato (usado por DataTableRef.refresh). */
  refresh: () => void;
};

/** Operadores que dispensam valor — a condição já está completa sem ele. */
const NULLARY_OPERATORS = new Set(["isEmpty", "isNotEmpty"]);

/**
 * Um FilterItem está ATIVO (vale buscar) quando tem o que comparar: operadores
 * nulários (isEmpty/isNotEmpty) sempre; os demais só com valor real. Espelha o
 * gate de payload (ui/lib/datatable.ts `isActiveFilterItem`) e o guard do motor
 * da API — fonte única de "filtro incompleto não dispara nada".
 */
function isActiveFilterItem(item: FilterItem): boolean {
  if (NULLARY_OPERATORS.has(item.operator)) return true;
  return !filterValueIsEmpty(item.value);
}

const DEFAULT_FILTER_DEBOUNCE = 350;

/**
 * Server mode fetcher. Chama `fetchData(params)` quando filter/sort/pagination/search mudam.
 *
 * - Em-vôo: `isLoading=true`. Resultado anterior continua visível.
 * - Race condition guard: requests fora de ordem são descartadas via `requestIdRef`.
 * - Refresh imperativo: bump em `refreshKey` força refetch sem mudar params.
 *
 * "Fino" (evita request boba):
 * - Só os filtros ATIVOS contam — escolher campo/operador (valor ainda vazio) NÃO
 *   muda o conjunto, então não refaz fetch nem manda filtro incompleto ao backend.
 * - Mudança de filtro é DEBOUNCED (digitar o valor = 1 request, não 1 por tecla).
 *   Pagination/sort/search continuam imediatos (search já vem debounced).
 */
export function useDataTableQuery<T>({
  fetchData,
  filterModel,
  search,
  searchField,
  sortModel,
  paginationModel,
  externalLoading,
  filterDebounceMs = DEFAULT_FILTER_DEBOUNCE,
}: UseDataTableQueryParams<T>): UseDataTableQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Guard contra race condition — só aplica o resultado se for da request mais recente
  const requestIdRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Conjunto de filtros ATIVOS — o que de fato vai ao servidor. Itens incompletos
  // (campo/operador escolhidos, valor vazio) ficam de fora.
  const activeFilterModel = useMemo<FilterModel>(
    () => ({
      ...filterModel,
      items: filterModel.items.filter(isActiveFilterItem),
    }),
    [filterModel],
  );

  // Assinatura estável do conjunto ATIVO — é o gatilho de refetch (debounced).
  // Como ignora itens inativos, escolher campo/operador não muda a chave.
  const activeFilterKey = useMemo(
    () => JSON.stringify(activeFilterModel),
    [activeFilterModel],
  );

  // Debounce só do filtro: digitar o valor não dispara 1 request por tecla.
  const [debouncedFilterKey, setDebouncedFilterKey] = useState(activeFilterKey);
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedFilterKey(activeFilterKey),
      filterDebounceMs,
    );
    return () => clearTimeout(t);
  }, [activeFilterKey, filterDebounceMs]);

  // Ref pro modelo ativo mais recente — o efeito lê no momento do fetch (evita
  // stale e dispensa o objeto nas deps; quem dispara o filtro é a key debounced).
  const activeFilterRef = useRef(activeFilterModel);
  activeFilterRef.current = activeFilterModel;

  useEffect(() => {
    const currentId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    fetchData({
      pagination: paginationModel,
      sort: sortModel,
      filters: activeFilterRef.current,
      search,
      searchField,
    })
      .then((result) => {
        // Ignora se outra request mais recente foi disparada
        if (currentId !== requestIdRef.current) return;
        setData(result.data);
        setTotal(result.total);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (currentId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchData,
    debouncedFilterKey,
    search,
    searchField,
    sortModel,
    paginationModel,
    refreshKey,
  ]);

  return {
    rowsToRender: data,
    totalAfterFilter: total,
    isLoading: isLoading || !!externalLoading,
    error,
    refresh,
  };
}
