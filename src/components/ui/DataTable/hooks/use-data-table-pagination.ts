import { useCallback, useEffect, useState } from "react";
import type { PaginationModel } from "../data-table.types";

export type UseDataTablePaginationParams = {
  paginationModel?: PaginationModel;
  onPaginationModelChange?: (model: PaginationModel) => void;
  initialPageSize?: number;
  /** Reset page→1 quando esses valores mudarem (ex: filtro, search). */
  resetTriggers?: unknown[];
};

export type UseDataTablePaginationResult = {
  paginationModel: PaginationModel;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPaginationModel: (model: PaginationModel) => void;
};

const DEFAULT_PAGE_SIZE = 25;

/**
 * Pagination state. Auto-reseta para page 1 quando triggers mudam (filter/search).
 */
export function useDataTablePagination({
  paginationModel: controlledModel,
  onPaginationModelChange,
  initialPageSize = DEFAULT_PAGE_SIZE,
  resetTriggers = [],
}: UseDataTablePaginationParams = {}): UseDataTablePaginationResult {
  const [uncontrolled, setUncontrolled] = useState<PaginationModel>({
    page: 1,
    pageSize: initialPageSize,
  });
  const isControlled = controlledModel !== undefined;
  const paginationModel = isControlled ? controlledModel : uncontrolled;

  const setPaginationModel = useCallback(
    (model: PaginationModel) => {
      if (!isControlled) setUncontrolled(model);
      onPaginationModelChange?.(model);
    },
    [isControlled, onPaginationModelChange],
  );

  const setPage = useCallback(
    (page: number) => {
      // Functional update pra evitar stale closure quando setPage é chamado
      // logo após setPageSize no mesmo render tick (ex: FooterTable.onValueChange
      // chama setPageSize(N) seguido de setPage(1)).
      if (!isControlled) {
        setUncontrolled((prev) => ({ ...prev, page }));
      }
      onPaginationModelChange?.({ ...paginationModel, page });
    },
    [paginationModel, isControlled, onPaginationModelChange],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      if (!isControlled) {
        setUncontrolled((prev) => ({ ...prev, pageSize, page: 1 }));
      }
      onPaginationModelChange?.({ page: 1, pageSize });
    },
    [isControlled, onPaginationModelChange],
  );

  // Reset page→1 quando triggers mudam (ex: filtros aplicados, search digitado)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (paginationModel.page !== 1) {
      setPaginationModel({ ...paginationModel, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetTriggers);

  return { paginationModel, setPage, setPageSize, setPaginationModel };
}
