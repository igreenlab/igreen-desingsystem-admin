import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Ref } from "react";
import type {
  DataTableProps,
  DataTablePresetView,
  DataTableRef,
  DataTableState,
  DataTableViewMode,
  GridFetchParams,
  GridFetchResult,
  GridRowId,
} from "../data-table.types";
import type { DataTableContextValue } from "../context/data-table-context";
import { useDataTableColumns } from "./use-data-table-columns";
import { useDataTableSort } from "./use-data-table-sort";
import { useDataTablePagination } from "./use-data-table-pagination";
import { useDataTableSelection } from "./use-data-table-selection";
import { useDataTableDensity } from "./use-data-table-density";
import { useDataTableSearch } from "./use-data-table-search";
import { useDataTableFilters } from "./use-data-table-filters";
import { useDataTableProcessor } from "./use-data-table-processor";
import { useDataTableQuery } from "./use-data-table-query";
import { useDataTableExport } from "./use-data-table-export";
import { useDataTableStatePersistence } from "./use-data-table-state-persistence";
import { loadPersistedState, clearPersistedState } from "./state-persistence-utils";
import { useDataTableSavedViews } from "./use-data-table-saved-views";
import type { SavedView, SavedViewsService } from "../services/saved-views.types";
// Side-effect: registra os tipos default no ColumnTypeRegistry
import "../column-types";

/** No-op fetch usado quando estamos em client mode — referência estável evita re-renders. */
const NOOP_FETCH = async (_params: GridFetchParams): Promise<GridFetchResult<never>> => ({ data: [], total: 0 });

const DEFAULT_GET_ROW_ID = (row: any): GridRowId => row.id;

export function useDataTableController<T>(
  props: DataTableProps<T>,
  ref: Ref<DataTableRef>,
) {
  const getRowId = props.getRowId ?? (DEFAULT_GET_ROW_ID as (row: T) => GridRowId);

  /* ── Hidrata estado persistido (localStorage) ─────────────────── */

  // Lazy: roda uma vez via useMemo. persistId estavel entre renders.
  const persistedInitial = useMemo(
    () => loadPersistedState(props.persistId),
    [props.persistId],
  );

  /* ── Hooks SRP ────────────────────────────────────────────────── */

  const cols = useDataTableColumns({
    columns: props.columns,
    initialWidthOverrides: persistedInitial?.columnWidths,
    initialPinnedOverrides: persistedInitial?.pinnedColumns,
    initialHiddenColumns: persistedInitial?.hiddenColumns,
    initialColumnOrder: persistedInitial?.columnOrder,
  });

  const sort = useDataTableSort({
    sortModel: props.sortModel,
    onSortModelChange: props.onSortModelChange,
    initialSortModel: persistedInitial?.sortModel,
  });

  const filters = useDataTableFilters({
    filterModel: props.filterModel,
    onFilterModelChange: props.onFilterModelChange,
  });

  const search = useDataTableSearch({
    search: props.search,
    onSearchChange: props.onSearchChange,
  });

  // Pagination com auto-reset quando filtros/search mudam
  const pagination = useDataTablePagination({
    paginationModel: props.paginationModel,
    onPaginationModelChange: props.onPaginationModelChange,
    initialPageSize:
      persistedInitial?.pageSize ?? props.paginationConfig?.initialPageSize,
    resetTriggers: [filters.filterModel.items.length, search.debouncedValue],
  });

  const density = useDataTableDensity({
    density: props.density,
    onDensityChange: props.onDensityChange,
    initialDensity: persistedInitial?.density,
  });

  /* ── viewMode + groupBy + expandedRowIds — controlled/uncontrolled hybrid
   *
   *  Centralizados aqui (em vez de em `data-table.tsx`) pra que `applyView`
   *  possa restaurá-los junto com filter/sort/density/layout. Padrão:
   *  - Se prop controlled passada → usa prop (read-only); setter dispara callback
   *  - Senão → usa state interno + chama callback se fornecido
   *
   *  Saved views podem alternar esses 3 fields via `applyView` (sempre dispara
   *  o callback). Builder `presetView()` pode declarar `viewMode/groupBy/
   *  expandedRowIds` em presets read-only. */
  const [internalViewMode, setInternalViewMode] = useState<DataTableViewMode>(
    // Hidrata do localStorage (v3+) com fallback pra prop `defaultViewMode`
    persistedInitial?.viewMode ?? props.defaultViewMode ?? "table",
  );
  const viewMode: DataTableViewMode = props.viewMode ?? internalViewMode;
  const setViewMode = useCallback((mode: DataTableViewMode) => {
    if (props.viewMode === undefined) setInternalViewMode(mode);
    props.onViewModeChange?.(mode);
  }, [props.viewMode, props.onViewModeChange]);

  const [internalGroupBy, setInternalGroupBy] = useState<string | undefined>(
    persistedInitial?.groupBy ?? props.defaultGroupBy,
  );
  const groupBy: string | undefined = props.groupBy ?? internalGroupBy;
  const setGroupBy = useCallback((next: string | undefined) => {
    if (props.groupBy === undefined) setInternalGroupBy(next);
    props.onGroupByChange?.(next);
  }, [props.groupBy, props.onGroupByChange]);

  const [internalExpandedRowIds, setInternalExpandedRowIdsRaw] = useState<GridRowId[]>(
    () => persistedInitial?.expandedRowIds ?? props.defaultExpandedRowIds ?? [],
  );
  const expandedRowIds: GridRowId[] = props.expandedRowIds ?? internalExpandedRowIds;
  const setExpandedRowIds = useCallback((next: GridRowId[]) => {
    if (props.expandedRowIds === undefined) setInternalExpandedRowIdsRaw(next);
    props.onExpandedRowIdsChange?.(next);
  }, [props.expandedRowIds, props.onExpandedRowIdsChange]);

  /** Toggle de uma row específica. Respeita `singleExpand` (default false). */
  const toggleRowExpansion = useCallback((id: GridRowId) => {
    const current = props.expandedRowIds ?? internalExpandedRowIds;
    const has = current.includes(id);
    let next: GridRowId[];
    if (has) {
      next = current.filter((x) => x !== id);
    } else if (props.singleExpand) {
      next = [id];
    } else {
      next = [...current, id];
    }
    setExpandedRowIds(next);
  }, [props.expandedRowIds, internalExpandedRowIds, props.singleExpand, setExpandedRowIds]);

  /* ── Modo: client (rows) vs server (fetchData) ───────────────── */

  const isServerMode = !!props.fetchData;
  const clientRows = props.rows ?? [];

  /* ── Processor (client mode pipeline) ────────────────────────── */

  // Skip paginate quando:
  //   - paginationConfig.enabled === false (consumer não quer paginação)
  //   - props.virtualize (virtualizer cuida do "render só visível", precisa de
  //     todas as rows pra calcular scroll height total)
  //   - groupBy state (Fase F.4: agrupamento precisa de todas as rows pra montar
  //     grupos completos; paginar quebraria o conceito)
  const shouldPaginate =
    props.paginationConfig?.enabled !== false &&
    !props.virtualize &&
    !groupBy;

  const processed = useDataTableProcessor({
    rows: isServerMode ? [] : clientRows,
    columns: props.columns,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    sortModel: sort.sortModels,
    paginationModel: pagination.paginationModel,
    paginate: shouldPaginate,
  });

  /* ── Query (server mode) — só executa quando fetchData presente ── */

  const query = useDataTableQuery({
    // Quando fetchData é undefined, passamos uma função no-op estável
    // pra não quebrar a regra de hooks. A useEffect interna roda em ambos
    // os modos, mas em client mode o NOOP_FETCH não causa fetch real.
    fetchData: props.fetchData ?? NOOP_FETCH,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    searchField: undefined,
    sortModel: sort.sortModels,
    paginationModel: pagination.paginationModel,
    externalLoading: props.loading,
  });

  // Seleciona output baseado no modo
  const effectiveRows = isServerMode ? query.rowsToRender : processed.rowsToRender;
  const effectiveTotal = isServerMode
    ? (props.rowCount ?? query.totalAfterFilter)
    : processed.totalAfterFilter;
  const allPagesProcessed = isServerMode ? query.rowsToRender : processed.rowsAllPagesProcessed;

  const selection = useDataTableSelection({
    rows: allPagesProcessed,
    getRowId,
    selectionModel: props.selectionModel,
    onSelectionModelChange: props.onSelectionModelChange,
  });

  /* ── Export (CSV) ─────────────────────────────────────────────── */

  const exportHook = useDataTableExport({
    columns: props.columns,
    rowsCurrentPage: effectiveRows,
    rowsAfterFilter: allPagesProcessed,
    rowsAll: clientRows, // server mode = [] (usa pagina atual via scope fallback)
    selectedIds: selection.selectedIds,
    getRowId,
    filename: props.toolbar?.title?.toLowerCase().replace(/\s+/g, "-") ?? "export",
  });

  /* ── Estados de feedback ──────────────────────────────────────── */

  const isLoading = isServerMode ? query.isLoading : !!props.loading;
  const totalRowsForEmpty = isServerMode
    ? effectiveTotal
    : clientRows.length;
  const isDataEmpty = !isLoading && totalRowsForEmpty === 0 && effectiveRows.length === 0;
  const isNoResults =
    !isLoading &&
    !isDataEmpty &&
    effectiveTotal === 0 &&
    (filters.filterModel.items.length > 0 || search.debouncedValue.length > 0);

  /* ── Snapshot do estado pra getState() ───────────────────────── */

  const getState = useCallback((): DataTableState => ({
    density: density.density,
    sortModel: sort.sortModels,
    paginationModel: pagination.paginationModel,
    selectionModel: selection.state,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    columnWidths: cols.columnWidths,
    pinnedColumns: cols.pinnedColumns,
    hiddenColumns: cols.hiddenColumns,
    columnOrder: cols.columnOrder,
  }), [
    density.density,
    sort.sortModels,
    pagination.paginationModel,
    selection.state,
    filters.filterModel,
    search.debouncedValue,
    cols.columnWidths,
    cols.pinnedColumns,
    cols.hiddenColumns,
    cols.columnOrder,
  ]);

  /* ── Saved Views ──────────────────────────────────────────────── */

  const savedViews = useDataTableSavedViews({
    persistId: props.persistId,
    service: props.savedViewsService,
  });

  /* ── Persist (localStorage) — salva debounced quando state muda ──
   *
   * Estratégia "Default workspace":
   * - O `defaultSnapshotRef` rastreia o estado APENAS quando `currentViewId === null`
   *   (usuário está na tab Default). Quando uma view específica (preset/saved)
   *   está aplicada, o defaultSnapshot fica congelado.
   * - O `applyDefault` lê do defaultSnapshotRef → restaura o "workspace pessoal"
   *   do usuário, NÃO zera tudo.
   * - O persistedSnapshot completo continua sendo salvo (pra hidratação no
   *   próximo mount) — inclusive quando uma view está aplicada. O
   *   `lastActiveViewId` re-aplica a view, e o defaultSnapshot fica disponível
   *   pra quando o usuário clicar Default. */

  const persistedSnapshot = useMemo(() => ({
    density: density.density,
    sortModel: sort.sortModels,
    pageSize: pagination.paginationModel.pageSize,
    columnWidths: cols.columnWidths,
    pinnedColumns: cols.pinnedColumns,
    hiddenColumns: Array.from(cols.hiddenColumns),
    columnOrder: cols.columnOrder,
    // Fase v3 — features novas também persistem (workspace completo da Default)
    viewMode,
    groupBy,
    expandedRowIds,
    // Persistir ultima view ativa (preset id, saved view id, ou null pra Default)
    lastActiveViewId: savedViews.currentViewId,
  }), [
    density.density,
    sort.sortModels,
    pagination.paginationModel.pageSize,
    cols.columnWidths,
    cols.pinnedColumns,
    cols.hiddenColumns,
    cols.columnOrder,
    viewMode,
    groupBy,
    expandedRowIds,
    savedViews.currentViewId,
  ]);

  /**
   * Snapshot do workspace "Default" do usuário — atualizado APENAS quando
   * nenhuma view específica está aplicada. Usado pelo `applyDefault` pra
   * restaurar o estado que o usuário tinha antes de clicar numa view.
   *
   * Inicializado com persistedInitial (hidratação do mount). Atualizado em
   * useEffect sempre que persistedSnapshot muda E currentViewId === null.
   */
  const defaultSnapshotRef = useRef(persistedInitial);
  useEffect(() => {
    if (savedViews.currentViewId === null) {
      // Salva snapshot sem o lastActiveViewId (sempre null pra defaults)
      const { lastActiveViewId: _ignore, ...rest } = persistedSnapshot;
      defaultSnapshotRef.current = rest;
    }
  }, [persistedSnapshot, savedViews.currentViewId]);

  useDataTableStatePersistence({
    persistId: props.persistId,
    state: persistedSnapshot,
  });

  /**
   * Aplica TODOS os campos capturáveis de uma view (saved OR preset).
   * Campos ausentes na view → aplica defaults razoáveis:
   *  - layout (columnWidths/pinned/hidden/order) → `{}`/`[]`
   *  - viewMode → "table" (default histórico)
   *  - groupBy → undefined (sem agrupamento)
   *  - expandedRowIds → [] (todas colapsadas)
   *
   * Comportamento idêntico pra saved view e preset view (mesmo shape de state).
   */
  const applyViewState = useCallback(
    (id: string, state: import("../services/saved-views.types").DataTableSavedViewState) => {
      density.setDensity(state.density);
      sort.setSortModels(state.sortModel);
      filters.setFilterModel(state.filterModel);
      cols.applyColumnState({
        columnWidths: state.columnWidths,
        pinnedColumns: state.pinnedColumns,
        hiddenColumns: state.hiddenColumns,
        columnOrder: state.columnOrder,
      });
      // Features novas — fallback explícito quando campo ausente (views antigas)
      setViewMode(state.viewMode ?? "table");
      setGroupBy(state.groupBy);
      setExpandedRowIds(state.expandedRowIds ?? []);
      savedViews.setCurrentViewId(id);
    },
    [density, sort, filters, cols, setViewMode, setGroupBy, setExpandedRowIds, savedViews],
  );

  const applyView = useCallback(
    (view: SavedView) => applyViewState(view.id, view.state),
    [applyViewState],
  );

  /** Aplica preset view (read-only) — mesma lógica do applyView (state unificado). */
  const applyPresetView = useCallback(
    (preset: DataTablePresetView) => applyViewState(preset.id, preset.state),
    [applyViewState],
  );

  /**
   * Apply unificado por id — procura primeiro em defaultViews (presets), depois
   * em savedViews. Usado pelo TableToolbarViews via onApply(id).
   */
  const applyViewById = useCallback(
    (id: string) => {
      const preset = props.defaultViews?.find((v) => v.id === id);
      if (preset) {
        applyPresetView(preset);
        return;
      }
      const saved = savedViews.views.find((v) => v.id === id);
      if (saved) applyView(saved);
    },
    [props.defaultViews, savedViews.views, applyPresetView, applyView],
  );

  /* ── Restore lastActiveViewId no mount (depois de savedViews carregar) ── */

  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    if (!props.persistId) return;
    // Espera savedViews terminar de carregar pra ter a lista completa pra lookup
    if (savedViews.isLoading) return;
    restoredRef.current = true;

    const lastId = persistedInitial?.lastActiveViewId;
    if (!lastId) return;

    // Tenta preset primeiro, depois saved
    const preset = props.defaultViews?.find((v) => v.id === lastId);
    if (preset) {
      applyPresetView(preset);
      return;
    }
    const saved = savedViews.views.find((v) => v.id === lastId);
    if (saved) applyView(saved);
  }, [
    props.persistId,
    persistedInitial,
    savedViews.isLoading,
    savedViews.views,
    props.defaultViews,
    applyPresetView,
    applyView,
  ]);

  const saveCurrentAsView = useCallback(
    (name: string, opts?: { isPublic?: boolean }) => {
      return savedViews.saveView(
        name,
        {
          filterModel: filters.filterModel,
          sortModel: sort.sortModels,
          density: density.density,
          columnWidths: cols.columnWidths,
          pinnedColumns: cols.pinnedColumns,
          hiddenColumns: Array.from(cols.hiddenColumns),
          columnOrder: cols.columnOrder,
          // Features novas — capturadas no snapshot
          viewMode,
          groupBy,
          expandedRowIds,
        },
        opts,
      );
    },
    [
      savedViews,
      filters.filterModel,
      sort.sortModels,
      density.density,
      cols.columnWidths,
      cols.pinnedColumns,
      cols.hiddenColumns,
      cols.columnOrder,
      viewMode,
      groupBy,
      expandedRowIds,
    ],
  );

  /**
   * Tab "Default" — restaura o "workspace pessoal" do usuário (estado salvo
   * no localStorage), NÃO zera tudo.
   *
   * Quando `persistId` está presente:
   *  - Lê do `defaultSnapshotRef.current` (mantido em sincronia conforme o
   *    usuário mexia na Default antes de aplicar uma view).
   *  - Filters/search permanecem voláteis (sempre limpos na transição pra Default,
   *    porque não persistem no localStorage por design).
   *
   * Quando `persistId` ausente (sem persistence):
   *  - Comportamento legado: zera tudo (Default = empty state).
   */
  const applyDefault = useCallback(() => {
    const snapshot = props.persistId ? defaultSnapshotRef.current : null;

    if (snapshot) {
      density.setDensity(snapshot.density ?? "standard");
      sort.setSortModels(snapshot.sortModel ?? []);
      cols.applyColumnState({
        columnWidths: snapshot.columnWidths ?? {},
        pinnedColumns: snapshot.pinnedColumns ?? {},
        hiddenColumns: snapshot.hiddenColumns ?? [],
        columnOrder: snapshot.columnOrder ?? props.columns.map((c) => String(c.field)),
      });
      setViewMode(snapshot.viewMode ?? "table");
      setGroupBy(snapshot.groupBy);
      setExpandedRowIds(snapshot.expandedRowIds ?? []);
    } else {
      // Sem persistId: comportamento legado (empty state)
      density.setDensity("standard");
      sort.setSortModels([]);
      cols.applyColumnState({
        columnWidths: {},
        pinnedColumns: {},
        hiddenColumns: [],
        columnOrder: props.columns.map((c) => String(c.field)),
      });
      setViewMode("table");
      setGroupBy(undefined);
      setExpandedRowIds([]);
    }

    // Filters/search são voláteis (sessão) — sempre limpos na transição pra Default
    filters.setFilterModel({ items: [], logicOperator: "AND" });
    savedViews.setCurrentViewId(null);
  }, [props.persistId, props.columns, density, sort, filters, cols, setViewMode, setGroupBy, setExpandedRowIds, savedViews]);

  /* ── Imperative ref ──────────────────────────────────────────── */

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (isServerMode) query.refresh();
      // Client mode: refresh é no-op (rows já estão em memória).
    },
    getState,
    getSelectedIds: () => selection.selectedIds,
    getSelectedCount: () => selection.selectedCount,
    clearSelection: selection.clear,
    exportCsv: exportHook.exportCsv,
    resetPersistedState: () => {
      clearPersistedState(props.persistId);
    },
  }), [getState, selection, isServerMode, query, exportHook, props.persistId]);

  /* ── Context value memoizado ─────────────────────────────────── */

  const contextValue = useMemo<DataTableContextValue<T>>(() => ({
    rows: clientRows,
    effectiveColumns: cols.effectiveColumns,
    columnWidths: cols.columnWidths,
    stickyOffsets: cols.stickyOffsets,
    columnOrder: cols.columnOrder,
    hiddenColumns: cols.hiddenColumns,
    pinnedColumns: cols.pinnedColumns,
    sortModel: sort.sortModels,
    paginationModel: pagination.paginationModel,
    selection: {
      state: selection.state,
      isRowSelected: selection.isRowSelected,
      selectedCount: selection.selectedCount,
    },
    density: density.density,
    search: search.inputValue,
    filterModel: filters.filterModel,
    getRowId,
  }), [
    clientRows,
    cols.effectiveColumns,
    cols.columnWidths,
    cols.stickyOffsets,
    cols.columnOrder,
    cols.hiddenColumns,
    cols.pinnedColumns,
    sort.sortModels,
    pagination.paginationModel,
    selection.state,
    selection.isRowSelected,
    selection.selectedCount,
    density.density,
    search.inputValue,
    filters.filterModel,
    getRowId,
  ]);

  return {
    contextValue,
    isLoading,
    isDataEmpty,
    isNoResults,
    rowsToRender: effectiveRows,
    /** Todas as rows após filter/search/sort (sem paginate) — usado por totalizers
     *  pra agregar sobre tudo, nao só pagina atual. Em server mode = current page. */
    rowsAllPagesProcessed: allPagesProcessed,
    totalAfterFilter: effectiveTotal,
    cols,
    sort,
    pagination,
    selection,
    density,
    search,
    filters,
    exportHook,
    isServerMode,
    savedViews,
    applyView,
    applyViewById,
    applyDefault,
    saveCurrentAsView,
    query,
    // States novos centralizados (controlled/uncontrolled)
    viewMode,
    setViewMode,
    groupBy,
    setGroupBy,
    expandedRowIds,
    setExpandedRowIds,
    toggleRowExpansion,
  };
}
