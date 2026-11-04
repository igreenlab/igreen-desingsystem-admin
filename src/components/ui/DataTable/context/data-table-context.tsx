import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type {
  TableDensity,
  ColumnPinned,
} from "../../Table";
import type {
  DataTableColumnDef,
  PaginationModel,
  GridSelectionState,
  GridRowId,
  FilterModel,
  SortModel,
} from "../data-table.types";

/* ── Tipo do value do Context — readonly snapshot do estado ─────── */

export type DataTableContextValue<T = any> = {
  /** Dados originais sem processar (filter/sort/paginate ficam no processor). */
  rows: T[];
  /** Colunas efetivas (já filtradas por visibility e ordenadas por columnOrder). */
  effectiveColumns: DataTableColumnDef<T>[];
  /** Widths em px por field. */
  columnWidths: Record<string, number>;
  /** Sticky offsets por field. */
  stickyOffsets: Record<string, number>;
  /** Order atual dos fields (filtrada por visibilidade). */
  columnOrder: string[];
  /** Set de fields hidden. */
  hiddenColumns: Set<string>;
  /** Map de pinned por field. */
  pinnedColumns: Record<string, ColumnPinned>;

  /** Multi-sort: array de criterios (primeiro = prioridade maior). */
  sortModel: SortModel[];
  /** Pagination state. */
  paginationModel: PaginationModel;
  /** Selection state. */
  selection: {
    state: GridSelectionState;
    isRowSelected: (row: T) => boolean;
    selectedCount: number;
  };
  /** Density state. */
  density: TableDensity;
  /** Search state. */
  search: string;
  /** Filter model. */
  filterModel: FilterModel;

  /**
   * `loadingMode: "keep"` em vôo COM resultado anterior na tela — as linhas
   * que estão sendo exibidas são do lote ANTERIOR. Fora desse caso é `false`,
   * inclusive na primeira carga (que degrada pro esqueleto) e em todo refetch
   * do modo default.
   *
   * O DS já desenha um sinal próprio (régua de marca no topo do cartão, ver
   * `dataTableStyles.staleRows`). Esta flag é a rota de CUSTOMIZAÇÃO em React
   * — até a P8 só existia a rota CSS (`className` + `aria-busy` caem no mesmo
   * elemento da raiz). Com ela, quem quiser outro sinal — um banner, um
   * overlay, um esmaecimento próprio assumindo o custo de contraste — compõe
   * de dentro, sem tocar no DS nem reimplementar o componente.
   */
  isKeepingPreviousRows: boolean;

  /** getRowId utility. */
  getRowId: (row: T) => GridRowId;
};

const DataTableContext = createContext<DataTableContextValue | null>(null);

export function DataTableProvider({
  value,
  children,
}: {
  value: DataTableContextValue;
  children: ReactNode;
}) {
  return (
    <DataTableContext.Provider value={value}>
      {children}
    </DataTableContext.Provider>
  );
}

export function useDataTableContext<T = any>(): DataTableContextValue<T> {
  const ctx = useContext(DataTableContext);
  if (!ctx) {
    throw new Error("useDataTableContext must be used inside <DataTable>");
  }
  return ctx as DataTableContextValue<T>;
}
