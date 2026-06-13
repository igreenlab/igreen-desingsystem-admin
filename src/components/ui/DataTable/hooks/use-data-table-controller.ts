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
import { useColumnAutoWidth } from "./use-column-auto-width";
import { SELECTION_COLUMN_WIDTH } from "../../Table";
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
import { promoteOperatorForColumn } from "../utils/filter-ops";
// Side-effect: registra os tipos default no ColumnTypeRegistry
import "../column-types";

/** No-op fetch usado quando estamos em client mode — referência estável evita re-renders. */
const NOOP_FETCH = async (_params: GridFetchParams): Promise<GridFetchResult<never>> => ({ data: [], total: 0 });

const DEFAULT_GET_ROW_ID = (row: any): GridRowId => row.id;

/**
 * Normaliza filterModel ao hidratar de presetView/savedView — promove operator
 * escalar (`equals`/`neq`) pra multi (`isAnyOf`/`isNoneOf`) quando a column
 * declarada tem `filterType: "multiSelect"`. Sem isso, presets declarados via
 * `presetView({ filters: [{ field, value }] })` ficam com operator default
 * "equals" e quebram o widget MultiSelectFieldDropdown (que sempre toggla com
 * array, gerando inconsistência entre operator e shape do value).
 */
function normalizeFilterModelForColumns<T>(
  filterModel: import("../data-table.types").FilterModel,
  columns: readonly import("../data-table.types").DataTableColumnDef<T>[],
): import("../data-table.types").FilterModel {
  const colByField = new Map(columns.map((c) => [String(c.field), c]));
  let touched = false;
  const items = filterModel.items.map((item) => {
    const col = colByField.get(item.field);
    const operator = promoteOperatorForColumn(item.operator, col);
    if (operator === item.operator) return item;
    touched = true;
    return { ...item, operator };
  });
  return touched ? { ...filterModel, items } : filterModel;
}

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

  // Ref ao container que será observado pelo ResizeObserver do auto-fit.
  // Compartilhado entre `Table.scrollRef` (scroll y/x) e `useColumnAutoWidth`
  // (medição do contentRect.width). data-table.tsx consome via controller.
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // AutoFit: calcula widths fluidas em 3 layers (type heuristic / canvas measure / flex distribution).
  // Default true — opt-out via `autoFit: false` em DataTableProps.
  const autoFitEnabled = props.autoFit !== false;
  // Selection column (checkbox) é injetada pelo DataTable e não está em props.columns,
  // mas ocupa 56px no container — desconta do auto-fit pra evitar overflow.
  const selectionReservedWidth = props.selectionConfig?.enabled
    ? SELECTION_COLUMN_WIDTH
    : 0;
  const { autoWidths } = useColumnAutoWidth(
    scrollContainerRef,
    props.columns,
    props.rows ?? [],
    { enabled: autoFitEnabled, reservedWidth: selectionReservedWidth },
  );

  const cols = useDataTableColumns({
    columns: props.columns,
    initialWidthOverrides: persistedInitial?.columnWidths,
    initialPinnedOverrides: persistedInitial?.pinnedColumns,
    initialHiddenColumns: persistedInitial?.hiddenColumns,
    initialColumnOrder: persistedInitial?.columnOrder,
    autoWidths,
  });

  const sort = useDataTableSort({
    sortModel: props.sortModel,
    onSortModelChange: props.onSortModelChange,
    initialSortModel: persistedInitial?.sortModel,
  });

  const filters = useDataTableFilters({
    filterModel: props.filterModel,
    onFilterModelChange: props.onFilterModelChange,
    // Hidrata filtros do workspace Default (v4+). Quando uma view custom estava
    // ativa no último mount, o effect de restore (linha ~410) aplica a view depois.
    //
    // Normaliza ANTES de hidratar — filterModels persistidos antes do fix #10
    // (preset hydration) podem ter operator="equals" pra colunas multiSelect.
    // Sem normalizar aqui, o operator dropdown do popover ficava vazio (porque
    // "equals" não está em MultiSelectColumnType.operators).
    initialFilterModel: persistedInitial?.filterModel
      ? normalizeFilterModelForColumns(persistedInitial.filterModel, props.columns)
      : undefined,
  });

  const search = useDataTableSearch({
    search: props.search,
    onSearchChange: props.onSearchChange,
    // Hidrata texto de busca do workspace Default (v4+).
    initialSearch: persistedInitial?.search,
  });

  // Pagination com auto-reset quando filtros/search mudam
  const pagination = useDataTablePagination({
    paginationModel: props.paginationModel,
    onPaginationModelChange: props.onPaginationModelChange,
    initialPageSize:
      persistedInitial?.pageSize ?? props.paginationConfig?.initialPageSize,
    // Hidrata página atual do workspace Default (v4+).
    initialPage: persistedInitial?.currentPage,
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
  //   - getTreeDataPath (Fase F.4c: tree-data precisa de todas as rows pra
  //     reconstruir a hierarquia completa; paginar cortaria ramos)
  const shouldPaginate =
    props.paginationConfig?.enabled !== false &&
    !props.virtualize &&
    !groupBy &&
    !props.getTreeDataPath;

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

  // Clamp de página fora de range: quando o total encolhe (ex: filtro reduz
  // resultados em server/controlled mode) e a página atual passou a ser maior
  // que a última válida, corrige o STATE — não só o render do footer. Sem isso,
  // em server/controlled o fetch podia rodar com page inválida até o user clicar.
  useEffect(() => {
    if (props.paginationConfig?.enabled === false) return;
    const { page, pageSize } = pagination.paginationModel;
    if (pageSize <= 0) return;
    const lastPage = Math.max(1, Math.ceil(effectiveTotal / pageSize));
    if (page > lastPage) pagination.setPage(lastPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTotal, pagination.paginationModel.page, pagination.paginationModel.pageSize]);

  const selection = useDataTableSelection({
    rows: allPagesProcessed,
    getRowId,
    selectionModel: props.selectionModel,
    onSelectionModelChange: props.onSelectionModelChange,
  });

  /* ── Export (CSV) ─────────────────────────────────────────────── */

  const exporter = useDataTableExport({
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
    // v4 — currentPage/filterModel/search persistem como parte do workspace Default.
    // O defaultSnapshotRef abaixo só atualiza quando currentViewId === null, ou seja
    // só "captura" esses valores quando a Default está ativa. Aplicar uma view custom
    // não polui o Default (o save sempre usa defaultSnapshotRef, não persistedSnapshot).
    currentPage: pagination.paginationModel.page,
    columnWidths: cols.columnWidths,
    pinnedColumns: cols.pinnedColumns,
    hiddenColumns: Array.from(cols.hiddenColumns),
    columnOrder: cols.columnOrder,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
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
    pagination.paginationModel.page,
    cols.columnWidths,
    cols.pinnedColumns,
    cols.hiddenColumns,
    cols.columnOrder,
    filters.filterModel,
    search.debouncedValue,
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

  // v4 — o que vai pro localStorage é o snapshot Default (sempre intacto, mesmo
  // quando view custom está ativa) + lastActiveViewId atual. Assim:
  //  - User filtra → Default snapshot atualiza → save reflete filtros aplicados
  //  - User aplica view custom → lastActiveViewId muda, mas Default fica congelado
  //  - User volta pra Default → applyDefault restaura tudo do snapshot
  // Triggers do useMemo abaixo cobrem o que dispara save: defaultSnapshotRef
  // atualiza via effect acima, então usamos persistedSnapshot como trigger via
  // currentViewId (quando muda, queremos salvar imediatamente o novo state).
  const persistedSnapshotForSave = useMemo(() => {
    const base = savedViews.currentViewId === null
      ? persistedSnapshot
      : { ...defaultSnapshotRef.current, lastActiveViewId: savedViews.currentViewId };
    return base;
    // persistedSnapshot já contém todos os campos relevantes; quando view custom
    // está ativa, usamos o defaultSnapshotRef preservado + view id atual.
  }, [persistedSnapshot, savedViews.currentViewId]);

  useDataTableStatePersistence({
    persistId: props.persistId,
    state: persistedSnapshotForSave,
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
      // Normaliza filterModel ANTES de aplicar — promove operator escalar pra
      // multi quando coluna é multiSelect (ver helper acima). Fix raiz pro
      // problema do preset com `{field, value}` sem operator.
      filters.setFilterModel(
        normalizeFilterModelForColumns(state.filterModel, props.columns),
      );
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
   *  - **v4**: filters/search/currentPage também são restaurados (parte do workspace).
   *    Pra limpar manualmente, user clica "Limpar filtros" / "Limpar busca" / etc.
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
      // v4 — restaura filters/search/page do workspace Default
      filters.setFilterModel(snapshot.filterModel ?? { items: [], logicOperator: "AND" });
      search.setInputValue(snapshot.search ?? "");
      pagination.setPaginationModel({
        page: snapshot.currentPage ?? 1,
        pageSize: snapshot.pageSize ?? pagination.paginationModel.pageSize,
      });
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
      filters.setFilterModel({ items: [], logicOperator: "AND" });
      search.setInputValue("");
    }

    savedViews.setCurrentViewId(null);
  }, [props.persistId, props.columns, density, sort, filters, search, pagination, cols, setViewMode, setGroupBy, setExpandedRowIds, savedViews]);

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
    exportCsv: exporter.exportCsv,
    resetPersistedState: () => {
      clearPersistedState(props.persistId);
    },
  }), [getState, selection, isServerMode, query, exporter, props.persistId]);

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
    /** Ref ao scroll container (compartilhado entre Table.scrollRef + useColumnAutoWidth). */
    scrollContainerRef,
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
    exporter,
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
