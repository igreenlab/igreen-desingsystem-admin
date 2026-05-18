import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GridFetchParams,
  GridFetchResult,
  PaginationModel,
  SortModel,
  FilterModel,
} from "../data-table.types";

export type UseDataTableQueryParams<T> = {
  fetchData: (params: GridFetchParams) => Promise<GridFetchResult<T>>;
  filterModel: FilterModel;
  search: string;
  searchField?: string;
  sortModel: SortModel[];
  paginationModel: PaginationModel;
  /** Loading externo (forçado pelo consumer via prop). */
  externalLoading?: boolean;
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

/**
 * Server mode fetcher. Chama `fetchData(params)` quando filter/sort/pagination/search mudam.
 *
 * - Em-vôo: `isLoading=true`. Resultado anterior continua visível.
 * - Race condition guard: requests fora de ordem são descartadas via `requestIdRef`.
 * - Refresh imperativo: bump em `refreshKey` força refetch sem mudar params.
 */
export function useDataTableQuery<T>({
  fetchData,
  filterModel,
  search,
  searchField,
  sortModel,
  paginationModel,
  externalLoading,
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

  useEffect(() => {
    const currentId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    fetchData({
      pagination: paginationModel,
      sort: sortModel,
      filters: filterModel,
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
  }, [fetchData, filterModel, search, searchField, sortModel, paginationModel, refreshKey]);

  return {
    rowsToRender: data,
    totalAfterFilter: total,
    isLoading: isLoading || !!externalLoading,
    error,
    refresh,
  };
}
