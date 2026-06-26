import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Ref, ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCardRow,
  TableHead,
  TableHeadCell,
  SELECTION_COLUMN_WIDTH,
} from "../Table";
import { useMediaQuery } from "../MenuSidebar/use-media-query";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Button } from "@/components/ui/Button/button";
import {
  MoreHorizontal,
  Rows2,
  Rows3,
  Rows4,
  RefreshCw,
  FileText,
  Filter as FilterIcon,
  LayoutGrid,
  Table as TableIcon,
  List as ListIcon,
  Settings2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  TableToolbar,
  ToolbarSearch,
  ToolbarToolButton,
  ToolbarSegmented,
  ToolbarApplied,
  ToolbarActions,
  ToolbarFilterButton,
  BulkActionsBar,
  isFilterEntryActive,
  TableToolbarViews,
  MoreMenu,
  MoreMenuItem as MoreMenuItemEl,
  MoreMenuSeparator,
} from "../TableToolbar";
import type { ToolbarSegmentedItem } from "../TableToolbar";
import { FooterTable, FooterTableSkeleton } from "../FooterTable";
import { Kanban } from "../Kanban";
import { List } from "../List";
import type { ListItemData } from "../List";
import type {
  DataTableProps,
  DataTableColumnDef,
  DataTableRef,
  DataTableViewMode,
  FilterItem,
  FilterValue,
  DataTableExportFormat,
  DataTableMoreMenuItem,
  GridRowId,
} from "./data-table.types";
import type { TableDensity } from "../Table";
import { dataTableStyles } from "./data-table.styles";
import {
  DEFAULT_CARD_BREAKPOINT,
  DEFAULT_OVERSCAN,
  MIN_REFRESH_SPINNER_MS,
  DENSITY_ROW_HEIGHT,
} from "./data-table.constants";
import { defaultOperatorForFilterType } from "./utils/filter-ops";
import { DataTableProvider } from "./context/data-table-context";
import { useDataTableController } from "./hooks/use-data-table-controller";
import { useGrabToScroll } from "./hooks/use-grab-to-scroll";
import { DataTableEmpty } from "./parts/data-table-empty";
import { DataTableLoading } from "./parts/data-table-loading";
import { DataTableNoResults } from "./parts/data-table-no-results";
import { DataTableColumnMenu } from "./parts/data-table-column-menu";
import { DataTableActionsCell } from "./parts/data-table-actions-cell";
import { DataTableSortableHeadCell } from "./parts/sortable-head-cell";
import { DataTableTotalizerRow } from "./parts/data-table-totalizer-row";
import {
  DataTableRow,
  type DataTableRowHandlers,
} from "./parts/data-table-row";
import { DataTableGroupHeaderRow } from "./parts/data-table-group-header-row";
import { DataTableGroupContentRow } from "./parts/data-table-group-content-row";
import { groupRows, isGroupRow, isGroupContent } from "./utils/group-rows";
import { DataTableRowExpansion } from "./parts/data-table-row-expansion";
import { expandRows, isExpansionRow } from "./utils/expand-rows";
import { buildTreeRows, isTreeRow } from "./utils/tree-rows";
import type { DataTableTreeMeta } from "./parts/data-table-tree-toggle";
import { useSortPopoverAdapter } from "./hooks/use-sort-popover-adapter";
import { useColsPopoverAdapter } from "./hooks/use-cols-popover-adapter";
import { useFilterPopoverAdapter } from "./hooks/use-filter-popover-adapter";
import { useDataTableViewMode } from "./hooks/use-data-table-view-mode";
import { applyValueGetter } from "./utils/resolve-value";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/shadcn/popover";
import { columnTypeRegistry } from "./column-types";
// Settings drill-down + panels do layout canônico (default). Já importados
// do barrel `../TableToolbar` (TableToolbar/ToolbarSearch/etc acima).
import {
  ToolbarSettingsMenu,
  SortPanel,
  ColsPanel,
  FilterPanel,
  ToolbarSimpleFilterDrawer as SimpleFilterDrawer,
} from "../TableToolbar";
// DataTableFloatingBulkBar still exported from barrel for opt-in use;
// default DataTable now uses inline BulkActionsBar via TableToolbar.bulkBar.

const styles = dataTableStyles();

/* ── Density toggle items (stable ref) ────────────────────────────── */

const DENSITY_ITEMS: ToolbarSegmentedItem<TableDensity>[] = [
  { value: "compact", children: <Rows4 />, label: "Compacto" },
  { value: "standard", children: <Rows3 />, label: "Padrão" },
  { value: "comfortable", children: <Rows2 />, label: "Confortável" },
];

/* View mode toggle items: montados dinamicamente no componente (table +
   list? + kanban?) conforme listConfig/kanbanConfig — ver resolvedViewToggle. */

/**
 * Resolve o valor de uma cell — delega pro shared `applyValueGetter`
 * (utils/resolve-value.ts) pra evitar duplicação com processor + group-rows.
 */
function resolveCellValue<T>(row: T, col: DataTableColumnDef<T>): unknown {
  return applyValueGetter(row, col);
}

function DataTableInternal<T>(
  props: DataTableProps<T>,
  ref: Ref<DataTableRef>,
) {
  const controller = useDataTableController(props, ref);
  const {
    contextValue,
    isLoading,
    isDataEmpty,
    isNoResults,
    scrollContainerRef,
    rowsToRender,
    rowsAllPagesProcessed,
    totalAfterFilter,
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
    applyViewById,
    applyDefault,
    saveCurrentAsView,
    query,
    // States novos centralizados (viewMode/groupBy/expandedRowIds + setters)
    viewMode,
    setViewMode,
    groupBy,
    expandedRowIds: controllerExpandedRowIds,
    setExpandedRowIds: controllerSetExpandedRowIds,
    toggleRowExpansion: controllerToggleRowExpansion,
  } = controller;

  const toolbarConfig = props.toolbar ?? {};
  const paginationConfig = props.paginationConfig ?? { enabled: true };
  const selectionConfig = props.selectionConfig ?? { enabled: false };

  const isKanban = viewMode === "kanban" && Boolean(props.kanbanConfig);
  const isList = viewMode === "list" && Boolean(props.listConfig);

  /* ── Grab-to-scroll horizontal (opt-in) ───────────────────────────
   * Arrastar o corpo pra rolar lateralmente. Anexa pointer listeners ao
   * mesmo `scrollContainerRef` que o `<Table>` usa. No-op em touch e abaixo
   * do threshold (clique/seleção preservados). */
  useGrabToScroll(scrollContainerRef, props.grabToScroll === true);

  /* ── Fullscreen toggle (opt-in) ───────────────────────────────────
   * Expande o container raiz pra ocupar a viewport inteira. Esc fecha. */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const enableFullscreen = toolbarConfig.enableFullscreen === true;
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  const handleViewModeChange = useCallback(
    (mode: DataTableViewMode) => {
      setViewMode(mode);
    },
    [setViewMode],
  );

  /**
   * Resolved view toggle: consumer-provided OR auto-rendered.
   * Auto-render quando `kanbanConfig` está definido E `toolbar.viewToggle`
   * NÃO foi explicitamente passado (undefined = "use default"; null = "esconder").
   */
  const resolvedViewToggle = useMemo<ReactNode>(() => {
    if (props.toolbar?.viewToggle !== undefined)
      return props.toolbar.viewToggle;
    // Auto-render quando há ao menos uma view alternativa (kanban e/ou lista).
    if (!props.kanbanConfig && !props.listConfig) return null;
    const items: ToolbarSegmentedItem<DataTableViewMode>[] = [
      { value: "table", children: <TableIcon />, label: "Tabela" },
    ];
    if (props.listConfig)
      items.push({ value: "list", children: <ListIcon />, label: "Lista" });
    if (props.kanbanConfig)
      items.push({ value: "kanban", children: <LayoutGrid />, label: "Kanban" });
    return (
      <ToolbarSegmented
        value={viewMode}
        onValueChange={handleViewModeChange}
        items={items}
        aria-label="Modo de visualização"
      />
    );
  }, [
    props.toolbar?.viewToggle,
    props.kanbanConfig,
    props.listConfig,
    viewMode,
    handleViewModeChange,
  ]);

  /* ── List view — items processados (filter+search+sort), aninhados se
       hierarchical (mesmo path do tree-data). Só quando viewMode=list. ── */
  const listItems = useMemo<ListItemData[]>(() => {
    const cfg = props.listConfig;
    if (!isList || !cfg) return [];
    const getRowId = contextValue.getRowId;
    const rows = rowsAllPagesProcessed;
    const pathFn = cfg.getPath ?? props.getTreeDataPath;
    if (cfg.hierarchical && pathFn) {
      const pathOf = pathFn;
      const shells = new Map<string, ListItemData & { children?: ListItemData[] }>();
      for (const r of rows) {
        const id = String(getRowId(r));
        shells.set(id, { id, title: "", data: r, children: [] });
      }
      const out: ListItemData[] = [];
      for (const r of rows) {
        const path = pathOf(r).map(String);
        const id = path[path.length - 1];
        const parentId = path.length > 1 ? path[path.length - 2] : null;
        const item = shells.get(id);
        if (!item) continue;
        const parent = parentId ? shells.get(parentId) : undefined;
        if (parent) (parent.children as ListItemData[]).push(item);
        else out.push(item);
      }
      for (const it of shells.values())
        if (it.children && it.children.length === 0) delete it.children;
      return out;
    }
    return rows.map((r) => ({ id: String(getRowId(r)), title: "", data: r }));
  }, [
    isList,
    props.listConfig,
    props.getTreeDataPath,
    rowsAllPagesProcessed,
    contextValue.getRowId,
  ]);

  const listDefaultExpandedIds = useMemo<Set<string> | undefined>(() => {
    const cfg = props.listConfig;
    if (!isList || !cfg?.hierarchical || cfg.defaultExpanded === false)
      return undefined;
    return new Set(rowsAllPagesProcessed.map((r) => String(contextValue.getRowId(r))));
  }, [isList, props.listConfig, rowsAllPagesProcessed, contextValue.getRowId]);

  /* ── View mode items do mobile (icon + label fluid), dinâmico ─────── */
  const mobileViewItems = useMemo<ToolbarSegmentedItem<DataTableViewMode>[]>(() => {
    const mk = (
      value: DataTableViewMode,
      icon: ReactNode,
      label: string,
    ): ToolbarSegmentedItem<DataTableViewMode> => ({
      value,
      label,
      children: (
        <span className="inline-flex items-center gap-gp-sm">
          {icon} {label}
        </span>
      ),
    });
    const items = [mk("table", <TableIcon />, "Tabela")];
    if (props.listConfig) items.push(mk("list", <ListIcon />, "Lista"));
    if (props.kanbanConfig) items.push(mk("kanban", <LayoutGrid />, "Kanban"));
    return items;
  }, [props.listConfig, props.kanbanConfig]);

  /* ── Kanban transformer (somente quando viewMode=kanban) ──────── */
  const kanbanView = useDataTableViewMode({
    // Em kanban, paginação não se aplica — usamos `rowsAllPagesProcessed`
    // (filter+search+sort completos, sem paginação) pra alimentar o board.
    rows: isKanban ? rowsAllPagesProcessed : ([] as T[]),
    config: isKanban ? props.kanbanConfig : undefined,
    getRowId: contextValue.getRowId,
  });

  /* ── Bridge selection (GridSelectionState ↔ Set<string>) ──────── */
  const kanbanSelectedIds = useMemo<Set<string> | undefined>(() => {
    if (!isKanban || !selectionConfig.enabled) return undefined;
    if (selection.state.type !== "include") return undefined; // exclude-mode N/A em kanban
    return new Set(Array.from(selection.state.ids).map(String));
  }, [isKanban, selectionConfig.enabled, selection.state]);

  /**
   * Lookup `cardId → row` memoizado pra bridges que precisam resolver row
   * original a partir do cardId (renderCardContent, getCardMenuItems,
   * toggleSelect, onOpenCard). Evita N find() lineares por render.
   */
  const kanbanCardIdToRow = useMemo<Map<string, T>>(() => {
    if (!isKanban) return new Map();
    const map = new Map<string, T>();
    for (const row of rowsAllPagesProcessed) {
      map.set(String(contextValue.getRowId(row)), row);
    }
    return map;
  }, [isKanban, rowsAllPagesProcessed, contextValue.getRowId]);

  const kanbanToggleSelect = useCallback(
    (cardId: string) => {
      if (!isKanban || !selectionConfig.enabled) return;
      const row = kanbanCardIdToRow.get(cardId);
      if (row) selection.toggleRow(row);
    },
    [isKanban, selectionConfig.enabled, kanbanCardIdToRow, selection],
  );

  /* ── Bridge getCardMenuItems (cardId → row → consumer fn) ─────── */
  const kanbanGetCardMenuItems = useMemo(() => {
    if (!isKanban || !props.kanbanConfig?.getCardMenuItems) return undefined;
    const userFn = props.kanbanConfig.getCardMenuItems;
    return (card: { id: string }) => {
      const row = kanbanCardIdToRow.get(card.id);
      return row ? userFn(row) : [];
    };
  }, [isKanban, props.kanbanConfig, kanbanCardIdToRow]);

  /* ── Bridge onOpenCard (delega ao onRowClick existente) ───────── */
  const kanbanOnOpenCard = useMemo(() => {
    if (!isKanban || !props.onRowClick) return undefined;
    const userFn = props.onRowClick;
    return (cardId: string) => {
      const row = kanbanCardIdToRow.get(cardId);
      if (row) userFn(row);
    };
  }, [isKanban, props.onRowClick, kanbanCardIdToRow]);

  /* ── Bridge renderCardContent (resolve row + delega) ──────────── */
  const kanbanRenderCardContent = useMemo(() => {
    if (!isKanban || !props.kanbanConfig?.renderCardContent) return undefined;
    const userFn = props.kanbanConfig.renderCardContent;
    return (params: {
      card: { id: string };
      selected: boolean;
      open: boolean;
    }) => {
      const row = kanbanCardIdToRow.get(params.card.id);
      if (!row) return null;
      return userFn({
        // KanbanRenderCardParams (do primitive) já entrega { card, selected, open }
        // mas o consumer do DataTable espera receber também a `row` original
        card: params.card as never,
        row,
        selected: params.selected,
        open: params.open,
      });
    };
  }, [isKanban, props.kanbanConfig, kanbanCardIdToRow]);

  /* ── Adapters: ColumnDef → FilterPopover props (extraído em hook) ── */

  /** Filter shortcut state — chip a abrir auto após click no header icon.
   *  Mora aqui porque várias funções fora do adapter usam (handleFilterShortcut,
   *  renderChip onOpenChange, isFilterValueEmpty cleanup). O adapter consome via prop. */
  const [pendingOpenChipKey, setPendingOpenChipKey] = useState<string | null>(
    null,
  );

  /** Chip de filtro aplicado aberto via clique (controlado). Necessário pra
   *  `onClose` do renderFastFilterInput funcionar — selects/boolean usam
   *  `<Select open>` forçado, que trava o dismiss por clique-fora; sem open
   *  controlado o popover não fecha ao escolher o valor (item 8). */
  const [openChipKey, setOpenChipKey] = useState<string | null>(null);

  /** Column label lookup for applied filter chips. */
  const colLabelMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        cols.effectiveColumns.map((c) => [String(c.field), c.headerName]),
      ),
    [cols.effectiveColumns],
  );

  /** Column lookup map for option label resolution. */
  const colsByField = useMemo(
    () => new Map(cols.effectiveColumns.map((c) => [String(c.field), c])),
    [cols.effectiveColumns],
  );

  const {
    filterPopoverColumns,
    filterPopoverEntries,
    appliedGroups,
    appliedFilters,
    removeGroup,
    updateGroupValue,
    getGroupOptions,
    handleFiltersChange,
    isFilterValueEmpty,
  } = useFilterPopoverAdapter({
    effectiveColumns: cols.effectiveColumns,
    allColumns: props.columns,
    rows: props.rows,
    filterModel: filters.filterModel,
    setFilterModel: filters.setFilterModel,
    colsByField,
    colLabelMap,
    pendingOpenChipKey,
  });

  // Há filtro REAL ativo? Ignora linhas em branco do query builder (entry sem
  // valor) — senão o botão Filtros fica "verde" indicando filtro que não existe.
  const hasActiveFilter = filterPopoverEntries.some(isFilterEntryActive);

  /* ── Empty filter chips placeholders (prop `showEmptyFilterChips`) ───
   *  Lista de fields que aparecem como chips placeholder na toolbar mesmo
   *  sem filtro com valor. Chips são CALCULADOS — não vivem em filterModel.
   *  Quando user clica num placeholder: cria item vazio no filterModel +
   *  abre popover via pendingOpenChipKey (mecanismo já existente).
   *  Quando user remove (X): adiciona ao set local `dismissedPlaceholders`.
   *  Cleanup automático em outros lugares fica intacto. */
  const [dismissedPlaceholders, setDismissedPlaceholders] = useState<
    Set<string>
  >(() => new Set());

  /** Fields que JÁ TÊM item COM VALOR no filterModel — placeholders desses fields
   *  são suprimidos. Items vazios (sem valor preenchido) NÃO contam — assim quando
   *  user adiciona condição via popover Filtros e seleciona o field, o chip
   *  placeholder permanece visível até receber valor. Sem essa checagem o
   *  placeholder sumia da toolbar no momento que o user escolhia o field e só
   *  voltava se ele tirasse o item via cleanup automático. */
  const fieldsWithFilter = useMemo(
    () =>
      new Set(
        filters.filterModel.items
          .filter((i) => !isFilterValueEmpty(i.value))
          .map((i) => i.field),
      ),
    [filters.filterModel, isFilterValueEmpty],
  );

  /** Lista efetiva de placeholders a renderizar. */
  const effectivePlaceholderFields = useMemo(() => {
    if (!props.showEmptyFilterChips?.length) return [] as string[];
    return props.showEmptyFilterChips.filter(
      (field) =>
        !fieldsWithFilter.has(field) && !dismissedPlaceholders.has(field),
    );
  }, [props.showEmptyFilterChips, fieldsWithFilter, dismissedPlaceholders]);

  /** Placeholders renderizados como AppliedFilter "virtuais" — id prefixado pra detectar. */
  const PLACEHOLDER_ID_PREFIX = "__placeholder__";
  const placeholderFilters = useMemo<typeof appliedFilters>(() => {
    return effectivePlaceholderFields.map((field) => ({
      id: `${PLACEHOLDER_ID_PREFIX}${field}`,
      columnLabel: colLabelMap[field] ?? field,
      op: "",
      value: [],
      isEmpty: true,
    }));
  }, [effectivePlaceholderFields, colLabelMap]);

  /** Lista final de chips na toolbar — **ordenada pela ordem dos fields em
   *  showEmptyFilterChips**. Quando user preenche um placeholder, ele vira
   *  filtro real mas mantém a posição original (não "pula" pro fim).
   *  Filtros reais de fields NÃO listados em showEmptyFilterChips aparecem
   *  após os "nativos" (na ordem do filterModel). */
  const enhancedAppliedFilters = useMemo(() => {
    const showFields = props.showEmptyFilterChips ?? [];
    if (showFields.length === 0) return appliedFilters;

    // Map id (group.key) -> field via appliedGroups
    const fieldByGroupKey = new Map<string, string>();
    for (const g of appliedGroups) {
      fieldByGroupKey.set(g.key, g.field);
    }

    // Map field -> chip (placeholder OU real)
    const placeholderByField = new Map(
      placeholderFilters.map((f) => [
        f.id.slice(PLACEHOLDER_ID_PREFIX.length),
        f,
      ]),
    );
    // ⚠️ Um field pode ter MÚLTIPLOS chips reais (ex: 2 filtros de Email com
    //    operators diferentes — `contém` e `=`). Por isso armazenamos array,
    //    não 1 chip único. Renderizamos todos preservando a ordem do filterModel.
    const realChipsByField = new Map<string, typeof appliedFilters>();
    for (const f of appliedFilters) {
      const field = fieldByGroupKey.get(String(f.id));
      if (!field) continue;
      if (!realChipsByField.has(field)) realChipsByField.set(field, []);
      realChipsByField.get(field)!.push(f);
    }

    // Chips "nativos" — ordem do array showEmptyFilterChips.
    // Se há filtros reais → renderiza TODOS (1+) na posição do field.
    // Se não há filtros reais e o placeholder não foi descartado → renderiza placeholder.
    const orderedNativeChips: typeof appliedFilters = [];
    for (const field of showFields) {
      const realChips = realChipsByField.get(field);
      if (realChips && realChips.length > 0) {
        orderedNativeChips.push(...realChips);
      } else {
        const placeholder = placeholderByField.get(field);
        if (placeholder) orderedNativeChips.push(placeholder);
      }
    }

    // Filtros reais de fields NÃO listados em showEmptyFilterChips (aparecem depois)
    const showFieldsSet = new Set(showFields);
    const otherChips = appliedFilters.filter((f) => {
      const field = fieldByGroupKey.get(String(f.id));
      return !field || !showFieldsSet.has(field);
    });

    return [...orderedNativeChips, ...otherChips];
  }, [
    placeholderFilters,
    appliedFilters,
    appliedGroups,
    props.showEmptyFilterChips,
  ]);

  /** Handler de remove que intercepta placeholders. */
  const handleRemoveFilter = useCallback(
    (id: string) => {
      if (id.startsWith(PLACEHOLDER_ID_PREFIX)) {
        const field = id.slice(PLACEHOLDER_ID_PREFIX.length);
        setDismissedPlaceholders((prev) => {
          const next = new Set(prev);
          next.add(field);
          return next;
        });
        return;
      }
      removeGroup(id);
    },
    [removeGroup],
  );

  /** Click num placeholder: cria item vazio + abre popover via pendingOpenChipKey. */
  const handleActivatePlaceholder = useCallback(
    (field: string) => {
      const col = colsByField.get(field);
      if (!col) return;
      const operator = defaultOperatorForFilterType(col.filterType);
      const newId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `f_${field}_${Date.now()}`;
      filters.setFilterModel({
        ...filters.filterModel,
        items: [
          ...filters.filterModel.items,
          { id: newId, field, operator, value: undefined },
        ],
      });
      setPendingOpenChipKey(`${field}|${operator}`);
    },
    [colsByField, filters],
  );

  /* ── Adapters: ColumnDef → SortPopover props (extraído em hook) ── */

  const { sortPopoverColumns, sortPopoverCriteria, handleSortChange } =
    useSortPopoverAdapter({
      effectiveColumns: cols.effectiveColumns,
      sortModels: sort.sortModels,
      setSortModels: sort.setSortModels,
    });

  /* ── Adapters: ColumnDef → ColsPopover props (extraído em hook) ── */

  // Colunas na ORDEM ATUAL (columnOrder), incl. ocultas — pro popover refletir
  // o estado real. Passar props.columns (ordem original) fazia o popover ignorar
  // reorders anteriores e embaralhar ao arrastar.
  const orderedAllColumns = useMemo(() => {
    const byField = new Map(
      props.columns.map((c) => [String(c.field), c] as const),
    );
    const inOrder = new Set(cols.columnOrder);
    const ordered = cols.columnOrder
      .map((f) => byField.get(f))
      .filter((c): c is (typeof props.columns)[number] => Boolean(c));
    const rest = props.columns.filter((c) => !inOrder.has(String(c.field)));
    return [...ordered, ...rest];
  }, [props.columns, cols.columnOrder]);

  const {
    colsPopoverColumns,
    visibleColsSet,
    pinnedColsSet,
    handleVisibleChange,
    handlePinnedChange,
    handleColumnsReorder,
  } = useColsPopoverAdapter({
    columns: orderedAllColumns,
    hiddenColumns: cols.hiddenColumns,
    pinnedColumns: cols.pinnedColumns,
    handleShow: cols.handleShow,
    handleHide: cols.handleHide,
    handlePin: cols.handlePin,
    handleReorder: cols.handleReorder,
  });

  /* ── Saved Views: shape adapter pro TableToolbarViews ──────────── */
  // Mock sem multi-user: TODAS as views salvas localmente sao "minhas"
  // (eu sou o criador, posso deletar todas — publica ou privada).
  // Backend real depois vai mapear owner ao usuario que criou; views publicas
  // de OUTROS chegam com `owner: <id>` + `ownerName: "Nome"`.

  /**
   * Views pro toolbar: presets (read-only, owner='preset') primeiro,
   * depois as criadas pelo user (owner='me').
   */
  const viewsForToolbar = useMemo(
    () => [
      ...(props.defaultViews ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        owner: "preset",
      })),
      ...savedViews.views.map((v) => ({
        id: v.id,
        name: v.name,
        owner: "me",
      })),
    ],
    [props.defaultViews, savedViews.views],
  );

  const handleViewApply = (id: string) => {
    applyViewById(id);
  };

  /* ── Refresh: server dispara refetch; client pisca spinner ────── */

  // `v2FilterOpen` controla o drawer do funil simples (o filtro avançado vive
  // no menu de Configurações, não no split button).
  const [v2FilterOpen, setV2FilterOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (isServerMode) {
      query.refresh();
    }
    // Mantem o spinner visivel por 400ms minimo (UX feedback)
    setTimeout(() => setIsRefreshing(false), MIN_REFRESH_SPINNER_MS);
  };

  /* ── Export config tipada ─────────────────────────────────────── */

  const exportConfig = useMemo(() => {
    const raw = toolbarConfig.enableExport;
    if (!raw) return null;
    const defaultCsv: DataTableExportFormat[] = [
      { id: "csv", label: "CSV", icon: <FileText /> },
    ];
    if (raw === true) {
      return { formats: defaultCsv, items: [] as DataTableMoreMenuItem[] };
    }
    return {
      formats: raw.formats?.length ? raw.formats : defaultCsv,
      items: raw.items ?? [],
    };
  }, [toolbarConfig.enableExport]);

  /* ── Column DnD (Fase C) ──────────────────────────────────────────
   * Sensors: PointerSensor com `distance: 5` exige 5px de drag antes de ativar —
   * preserva click-to-sort no header (click puro nao dispara dnd).
   * KeyboardSensor permite reordenar via teclado (Space/Enter pra "pegar",
   * Setas pra mover, Space/Enter pra soltar, Esc pra cancelar).
   */
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // active.id e over.id sao os fields (sortableId == field)
    const order = cols.columnOrder;
    const fromIdx = order.indexOf(String(active.id));
    const toIdx = order.indexOf(String(over.id));
    if (fromIdx < 0 || toIdx < 0) return;
    cols.handleReorder(arrayMove(order, fromIdx, toIdx));
  };

  // IDs dos itens sortable — usa columnOrder (que respeita visibilidade nao,
  // mas effectiveColumns sim). Usar effectiveColumns garante que itens hidden
  // nao entram no contexto (evita ID stale).
  const sortableIds = useMemo(
    () => cols.effectiveColumns.map((c) => String(c.field)),
    [cols.effectiveColumns],
  );

  /* ── Inline edit state (Fase D) ────────────────────────────────────
   * Uma celula editavel por vez. Identificada por { rowId, field }.
   * Double-click numa cell com `column.editable: true` entra em edit mode.
   * Commit (Enter/blur) chama `onCellEditCommit({id,field,value,oldValue,row})`.
   * Esc cancela sem chamar callback. */
  const [editingCell, setEditingCell] = useState<{
    rowId: GridRowId;
    field: string;
  } | null>(null);
  // Fase F.1 — async commit. Quando onCellEditCommit retorna Promise:
  // editLoading=true mostra spinner overlay + bloqueia input; editError guarda
  // mensagem se promise rejeitar (mantem edit aberto pra retry).
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  /** Adiciona filtro vazio pra coluna (ou abre o existente) + sinaliza pra abrir
   *  o popover do chip correspondente. Operador default deriva do filterType:
   *  - select/multiSelect → equals
   *  - date → between (range — preset mais útil pra datas)
   *  - demais (text/number) → contains */
  const handleFilterShortcut = (col: DataTableColumnDef<T>) => {
    const field = String(col.field);
    // Fonte única: mesma inferência usada no resto do DataTable. Evita a
    // divergência anterior (number/currency caíam em "contains", que esses
    // tipos nem suportam → filtro inerte).
    const operator = defaultOperatorForFilterType(col.filterType);
    const chipKey = `${field}|${operator}`;
    const initialValue: FilterValue =
      operator === "between" ? [null, null] : "";

    // Se ja existe grupo pra essa coluna+operator, so abre. Senao, adiciona vazio + abre.
    const existing = filters.filterModel.items.find(
      (it) => it.field === field && it.operator === operator,
    );
    if (!existing) {
      filters.setFilterModel({
        ...filters.filterModel,
        items: [
          ...filters.filterModel.items,
          {
            id: `shortcut-${field}-${operator}-${Date.now()}`,
            field,
            operator,
            value: initialValue,
          },
        ],
      });
    }
    // setTimeout 0 garante que o chip ja foi renderizado quando setamos o pending
    setTimeout(() => setPendingOpenChipKey(chipKey), 0);
  };

  /* ── Keyboard nav state (Fase E.1) ────────────────────────────────
   * focusedRowIndex eh o indice (0-based) da row focada na pagina atual.
   * null = nenhuma. Setado pelo handler de keyDown abaixo e pelo click.
   * Row focada recebe tabIndex=0 + visual outline brand. Restante tabIndex=-1.
   * Auto-scroll via ref.scrollIntoView({block:"nearest"}). */
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Reset focus quando a pagina muda (pagination, filter, sort, page size).
  // Sem isso, indice stale aponta pra row que nao existe mais.
  useEffect(() => {
    setFocusedRowIndex(null);
  }, [
    pagination.paginationModel.page,
    pagination.paginationModel.pageSize,
    filters.filterModel,
    search.debouncedValue,
    sort.sortModels,
  ]);

  const handleRowKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    rowIndex: number,
    row: T,
  ) => {
    const lastIdx = rowsToRender.length - 1;
    let nextIdx: number | null = null;

    if (e.key === "ArrowDown") {
      nextIdx = Math.min(rowIndex + 1, lastIdx);
    } else if (e.key === "ArrowUp") {
      nextIdx = Math.max(rowIndex - 1, 0);
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = lastIdx;
    } else if (e.key === "PageDown") {
      nextIdx = Math.min(rowIndex + 10, lastIdx);
    } else if (e.key === "PageUp") {
      nextIdx = Math.max(rowIndex - 10, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      props.onRowClick?.(row);
      return;
    } else if (e.key === " " && selectionConfig.enabled) {
      e.preventDefault();
      selection.toggleRow(row);
      return;
    } else {
      return;
    }

    e.preventDefault();
    setFocusedRowIndex(nextIdx);
    // Foco programatico + scroll.
    // - Modo normal: setTimeout 0 (espera React reconciliar tabIndex) → focus + scrollIntoView.
    // - Modo virtualizado: scrollToIndex primeiro pra row entrar no DOM;
    //   depois setTimeout maior (50ms) pra virtualizer renderizar; depois focus.
    if (virtualize) {
      rowVirtualizer.scrollToIndex(nextIdx, { align: "auto" });
      setTimeout(() => {
        const el = rowRefs.current.get(nextIdx!);
        el?.focus();
      }, 50);
    } else {
      setTimeout(() => {
        const el = rowRefs.current.get(nextIdx!);
        el?.focus();
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 0);
    }
  };

  const handleCellEditCommit = async (params: {
    row: T;
    field: string;
    value: any;
    oldValue: any;
  }) => {
    const id = contextValue.getRowId(params.row);
    const result = props.onCellEditCommit?.({
      id,
      field: params.field,
      value: params.value,
      oldValue: params.oldValue,
      row: params.row,
    });
    // Sincrono ou sem callback → fecha imediato
    if (!(result instanceof Promise)) {
      setEditingCell(null);
      setEditError(null);
      return;
    }
    // Async: loading overlay + await + tratamento de erro.
    setEditLoading(true);
    setEditError(null);
    try {
      await result;
      setEditingCell(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : String(err));
      // NAO fecha — user pode corrigir e tentar de novo, ou Esc pra cancelar
    } finally {
      setEditLoading(false);
    }
  };

  /** Cancelamento manual (Esc) — limpa tudo. */
  const handleCellEditCancel = () => {
    setEditingCell(null);
    setEditLoading(false);
    setEditError(null);
  };

  /* ── Agrupamento — Fase F.4 ────────────────────────────────────────
   * `groupBy` vem do controller (controlled/uncontrolled). Quando definido,
   * rows são reshape em (GroupRow | T)[] alternados. expandedGroupKeys guarda
   * toggles DIFERENTES do default — if defaultGroupExpanded=true: keys no set
   * são collapsed; vice-versa. Permite "expandir tudo" sem precisar setar N
   * keys explicitamente. */
  const groupByField = groupBy;
  const defaultGroupExpanded = props.defaultGroupExpanded !== false; // default true
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const groupColumn = useMemo(
    () =>
      groupByField
        ? props.columns.find((c) => String(c.field) === groupByField)
        : undefined,
    [props.columns, groupByField],
  );
  const useCustomGroupContent = !!props.renderGroupContent;
  const groupedRows = useMemo(() => {
    if (!groupByField) return rowsToRender;
    return groupRows(
      rowsToRender,
      groupByField,
      expandedGroupKeys,
      defaultGroupExpanded,
      groupColumn,
      useCustomGroupContent,
    );
  }, [
    rowsToRender,
    groupByField,
    expandedGroupKeys,
    defaultGroupExpanded,
    groupColumn,
    useCustomGroupContent,
  ]);

  const toggleGroup = (key: string) => {
    setExpandedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /* ── Row expansion — Fase F.4b ──────────────────────────────────────
   * State `expandedRowIds: GridRowId[]` vem do controller (controlled/
   * uncontrolled). Aliasing local com Set pra preservar API interna usada
   * por `isRowExpanded` lookups O(1) + iteração. */
  const expandedRowIds = useMemo(
    () => new Set(controllerExpandedRowIds),
    [controllerExpandedRowIds],
  );
  const useRowExpansion = !!props.renderRowExpansion && !groupByField;

  const toggleRowExpansion = controllerToggleRowExpansion;

  // Pre-compute expandable column field pra usar no cell render
  const expandableColField = useMemo(() => {
    if (!useRowExpansion) return null;
    const col = props.columns.find((c) => c.expandable === true);
    return col ? String(col.field) : null;
  }, [props.columns, useRowExpansion]);

  /* ── Tree-data — Fase F.4c ──────────────────────────────────────────
   * Hierarquia multi-nível derivada de `getTreeDataPath`. Reconstrói a árvore
   * a partir das rows (já filtradas/ordenadas) e produz TreeRows ordenadas com
   * level/hasChildren/descendantCount. Reusa `expandedRowIds` como estado de
   * expansão de nós. Mutuamente exclusivo com groupBy (groupBy tem precedência)
   * e com row-expansion (tree tem precedência sobre row-expansion). */
  const useTreeData = !!props.getTreeDataPath && !groupByField;
  const treeDefaultExpanded = props.treeData?.defaultExpanded !== false; // default true
  const treeShowDescendantCount = props.treeData?.showDescendantCount === true;

  // Coluna primária da árvore: a que marca `treeColumn: true`, senão a primeira
  // coluna não-actions.
  const treeColField = useMemo(() => {
    if (!useTreeData) return null;
    const marked = props.columns.find((c) => c.treeColumn === true);
    if (marked) return String(marked.field);
    const firstData = props.columns.find((c) => c.type !== "actions");
    return firstData ? String(firstData.field) : null;
  }, [props.columns, useTreeData]);

  const treeRows = useMemo(() => {
    if (!useTreeData || !props.getTreeDataPath) return null;
    return buildTreeRows(
      rowsToRender,
      props.getTreeDataPath,
      contextValue.getRowId,
      expandedRowIds,
      treeDefaultExpanded,
    );
  }, [
    useTreeData,
    props.getTreeDataPath,
    rowsToRender,
    contextValue,
    expandedRowIds,
    treeDefaultExpanded,
  ]);

  /**
   * Toggle de um nó da árvore = toggle de `expandedRowIds` (mesma máquina de
   * row-expansion: o Set guarda ids que DIFEREM do default de expansão).
   *
   * NÃO reusa `toggleRowExpansion` do controller: aquele respeita `singleExpand`
   * (abrir um colapsa os demais), o que CORROMPE a árvore — colapsar/expandir um
   * ramo apagaria a divergência de ramos não relacionados. Em tree-data cada nó
   * diverge do default de forma independente, então togglamos só a membership do
   * id no Set via `controllerSetExpandedRowIds` (preserva controlled/
   * uncontrolled + persistência).
   */
  const toggleTreeNode = useCallback(
    (id: GridRowId) => {
      const next = expandedRowIds.has(id)
        ? Array.from(expandedRowIds).filter((x) => x !== id)
        : [...Array.from(expandedRowIds), id];
      controllerSetExpandedRowIds(next);
    },
    [expandedRowIds, controllerSetExpandedRowIds],
  );

  // Expand-all / collapse-all programático da árvore vive no controller
  // (`expandAllTree`/`collapseAllTree`), exposto via imperative handle
  // (`DataTableRef`). Usa `collectExpandableTreeIds` (tree-rows.ts) sobre todas
  // as rows pós-filtro/sort pra montar o Set de divergência, respeitando
  // `treeData.defaultExpanded`. O app dispara via `ref.current.expandAllTree()` /
  // `ref.current.collapseAllTree()`; a toolbar do DS não embute botões (slice
  // mantido só nos métodos do ref).

  // Array de items renderizados — quando há expansion/tree, intercala markers.
  // Precedência: groupBy > tree-data > row-expansion.
  const finalItems = useMemo(() => {
    if (groupByField) return groupedRows;
    if (useTreeData && treeRows) return treeRows;
    if (useRowExpansion && expandedRowIds.size > 0) {
      return expandRows(rowsToRender, expandedRowIds, contextValue.getRowId);
    }
    return rowsToRender;
  }, [
    groupByField,
    groupedRows,
    useTreeData,
    treeRows,
    useRowExpansion,
    expandedRowIds,
    rowsToRender,
    contextValue,
  ]);

  // Handlers da row via REF estável (latest-ref pattern): o objeto ref nunca
  // muda → não invalida o memo do <DataTableRow>; o `.current` é atualizado a
  // cada render → sem stale closure no event time. Permite memoizar rows sem
  // precisar useCallback em todos os handlers (que teriam dep-hell).
  const rowHandlersRef = useRef<DataTableRowHandlers<T>>(null as never);
  rowHandlersRef.current = {
    getRowId: contextValue.getRowId,
    onRowClick: (row, index) => {
      setFocusedRowIndex(index);
      props.onRowClick?.(row);
    },
    onRowKeyDown: (e, index, row) => handleRowKeyDown(e, index, row),
    onRowFocus: (index) => {
      if (focusedRowIndex !== index) setFocusedRowIndex(index);
    },
    toggleRowSelection: (row) => selection.toggleRow(row),
    toggleRowExpansion,
    toggleTreeNode,
    startEditingCell: (rowId, field) => setEditingCell({ rowId, field }),
    onCellEditCommit: handleCellEditCommit,
    onCellEditCancel: handleCellEditCancel,
    registerRef: (index, el) => {
      if (el) rowRefs.current.set(index, el);
      else rowRefs.current.delete(index);
    },
  };

  /* ── Virtualização — Fase F.3 ──────────────────────────────────────
   * Quando props.virtualize, renderiza apenas rows visíveis. Estimate de
   * row height deriva de density (compact=40, standard=56, comfortable=64).
   * Consumer pode override via props.estimateRowHeight.
   * scrollContainerRef vem do controller (compartilhado com useColumnAutoWidth). */
  const estimateRowHeight =
    props.estimateRowHeight ?? DENSITY_ROW_HEIGHT[density.density];
  const virtualize = props.virtualize === true;

  const rowVirtualizer = useVirtualizer({
    // count cobre todos os casos: rows simples, agrupadas, ou com expansion intercalada
    count: virtualize ? finalItems.length : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: props.overscan ?? DEFAULT_OVERSCAN,
  });

  /* ── Body content (Table primitivo) ───────────────────────────── */

  const tableBody = (
    <DndContext
      sensors={dndSensors}
      collisionDetection={closestCenter}
      onDragEnd={handleColumnDragEnd}
    >
      <Table
        density={density.density}
        cardBreakpoint={props.cardBreakpoint ?? DEFAULT_CARD_BREAKPOINT}
        className="min-h-0 max-h-full"
        scrollRef={scrollContainerRef}
      >
        <TableHead>
          {selectionConfig.enabled && (
            <TableHeadCell
              width={SELECTION_COLUMN_WIDTH}
              align="center"
              purpose="selection"
            >
              <Checkbox
                checked={
                  selection.isPageSelected(rowsToRender)
                    ? true
                    : selection.isPageIndeterminate(rowsToRender)
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={() => selection.togglePage(rowsToRender)}
                aria-label="Selecionar página"
              />
            </TableHeadCell>
          )}
          <SortableContext
            items={sortableIds}
            strategy={horizontalListSortingStrategy}
          >
            {cols.effectiveColumns.map((col) => {
              const field = String(col.field);
              const isActions = col.type === "actions";
              return (
                <DataTableSortableHeadCell
                  key={field}
                  sortableId={field}
                  disableDrag={isActions}
                  field={field}
                  width={cols.columnWidths[field]}
                  pinned={col.pinned}
                  pinOffset={cols.stickyOffsets[field]}
                  align={col.align}
                  purpose={isActions ? "actions" : undefined}
                  sortable={!isActions && col.sortable !== false}
                  sortDirection={
                    sort.sortModels.find((s) => s.field === field)?.direction ??
                    null
                  }
                  sortIndex={(() => {
                    // Mostra badge 1/2/3... apenas quando ha multi-sort (>= 2 criterios).
                    if (sort.sortModels.length < 2) return undefined;
                    const idx = sort.sortModels.findIndex(
                      (s) => s.field === field,
                    );
                    return idx >= 0 ? idx + 1 : undefined;
                  })()}
                  onSortClick={() => sort.handleSort(field)}
                  resizable={!isActions && col.resizable !== false}
                  // Comita no state APENAS no mouseup — durante o drag a largura
                  // é atualizada via DOM direto pelo TableHeadCell (sem re-render
                  // do DataTable a cada mousemove, que parecia "atualizando").
                  onResizeEnd={(w) => cols.handleResize(field, w)}
                  icon={
                    isActions
                      ? undefined
                      : (col.icon ??
                        (col.type
                          ? columnTypeRegistry.get(col.type).defaultIcon
                          : undefined))
                  }
                  headMenu={
                    !isActions ? (
                      <>
                        {/* Filter shortcut — abre popover do chip da coluna pra digitar valor.
                        Se ja existe filtro, reabre. Visivel apenas em colunas enableColumnFilter. */}
                        {col.enableColumnFilter && (
                          <Button
                            size="icon-2xs"
                            variant="ghost"
                            color="secondary"
                            aria-label={`Filtrar ${col.headerName}`}
                            title={`Filtrar ${col.headerName}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFilterShortcut(col);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <FilterIcon />
                          </Button>
                        )}
                        {col.enableColumnMenu !== false && (
                          <DataTableColumnMenu
                            columnName={col.headerName}
                            sortDirection={
                              sort.sortModels.find((s) => s.field === field)
                                ?.direction ?? null
                            }
                            pinned={
                              cols.pinnedColumns[field] === "left"
                                ? "left"
                                : cols.pinnedColumns[field] === "right"
                                  ? "right"
                                  : null
                            }
                            canHide={col.hideable !== false}
                            onSortAsc={() =>
                              sort.setSortModels([{ field, direction: "asc" }])
                            }
                            onSortDesc={() =>
                              sort.setSortModels([{ field, direction: "desc" }])
                            }
                            onSortClear={() => sort.setSortModels([])}
                            onPinLeft={() => cols.handlePin(field, "left")}
                            onPinRight={() => cols.handlePin(field, "right")}
                            onUnpin={() => cols.handlePin(field, undefined)}
                            onHide={() => cols.handleHide(field)}
                            extraItems={col.columnMenuItems}
                          />
                        )}
                      </>
                    ) : undefined
                  }
                >
                  {/* Header da coluna actions é sempre vazio — independe do `headerName`
                  passado pelo consumer (uniformiza padrão de UX). */}
                  {isActions ? null : col.headerName}
                </DataTableSortableHeadCell>
              );
            })}
          </SortableContext>
        </TableHead>
        <TableBody
          // Modo virtualizado é prop do TableBody primitive — aplica
          // height/position/block internamente. Sem hardcode no DataTable.
          virtualized={
            virtualize
              ? { totalHeight: rowVirtualizer.getTotalSize() }
              : undefined
          }
        >
          {(() => {
            // Branching: GroupHeader / GroupContent / DataRow.
            //  - GroupHeader: column-aligned default, ou free-form via renderGroupHeader.
            //  - GroupContent: slot custom (só aparece quando renderGroupContent definido) —
            //    substitui as N child rows por 1 row full-width com conteudo livre.
            //  - DataRow: fluxo normal (TableRow + cells).
            const renderItem = (
              item: T | ((typeof groupedRows)[number] & { __type?: symbol }),
              index: number,
              virtualStyle?: React.CSSProperties,
            ) => {
              if (isGroupRow<T>(item)) {
                return (
                  <DataTableGroupHeaderRow
                    key={item.key}
                    group={item}
                    columns={cols.effectiveColumns}
                    columnWidths={cols.columnWidths}
                    stickyOffsets={cols.stickyOffsets}
                    hasSelection={selectionConfig.enabled === true}
                    onToggle={() => toggleGroup(item.key)}
                    style={virtualStyle}
                    renderHeader={props.renderGroupHeader}
                  />
                );
              }
              if (isGroupContent<T>(item) && props.renderGroupContent) {
                return (
                  <DataTableGroupContentRow
                    key={`${item.key}-content`}
                    group={item.group}
                    render={props.renderGroupContent}
                    style={virtualStyle}
                  />
                );
              }
              if (isExpansionRow<T>(item) && props.renderRowExpansion) {
                return (
                  <DataTableRowExpansion
                    key={`exp-${String(item.id)}`}
                    row={item.row}
                    render={props.renderRowExpansion}
                    style={virtualStyle}
                  />
                );
              }
              // Tree-data: desembrulha o TreeRow (mantém a row real intacta) e
              // calcula a meta de hierarquia pra a coluna primária renderizar
              // indentação + chevron.
              const treeNode = isTreeRow<T>(item) ? item : null;
              const row = (treeNode ? treeNode.row : item) as T;
              const rowId = contextValue.getRowId(row);
              const treeMeta: DataTableTreeMeta | null = treeNode
                ? {
                    level: treeNode.level,
                    hasChildren: treeNode.hasChildren,
                    isExpanded: treeNode.isExpanded,
                    descendantCount: treeNode.descendantCount,
                    childCount: treeNode.childCount,
                  }
                : null;
              const editState =
                editingCell?.rowId === rowId
                  ? {
                      field: editingCell.field,
                      isLoading: editLoading,
                      error: editError,
                    }
                  : null;
              return (
                <DataTableRow<T>
                  key={String(rowId)}
                  row={row}
                  index={index}
                  rowId={rowId}
                  selected={selection.isRowSelected(row)}
                  focused={focusedRowIndex === index}
                  expanded={expandedRowIds.has(rowId)}
                  editState={editState}
                  rowClassName={props.getRowClassName?.({ row, index })}
                  virtualStyle={virtualStyle}
                  columns={cols.effectiveColumns}
                  columnWidths={cols.columnWidths}
                  stickyOffsets={cols.stickyOffsets}
                  selectionEnabled={selectionConfig.enabled === true}
                  clickable={!!props.onRowClick}
                  useRowExpansion={useRowExpansion}
                  expandableColField={expandableColField}
                  treeColField={treeColField}
                  treeMeta={treeMeta}
                  treeShowDescendantCount={treeShowDescendantCount}
                  handlers={rowHandlersRef}
                />
              );
            };

            // Render: virtualizado vs todos as rows. `finalItems` cobre rows
            // simples + agrupadas + com expansion intercalada.
            if (virtualize) {
              return rowVirtualizer.getVirtualItems().map((vi) =>
                renderItem(finalItems[vi.index], vi.index, {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${vi.size}px`,
                  transform: `translateY(${vi.start}px)`,
                }),
              );
            }
            return finalItems.map((item, i) => renderItem(item, i));
          })()}
          {/* Totalizer footer row (Fase E.2) — sticky no bottom do body */}
          {props.showTotalizers && (
            <DataTableTotalizerRow
              columns={cols.effectiveColumns}
              rows={rowsAllPagesProcessed}
              overrides={props.aggregateRow}
              columnWidths={cols.columnWidths}
              stickyOffsets={cols.stickyOffsets}
              hasSelection={selectionConfig.enabled === true}
            />
          )}
        </TableBody>
      </Table>
    </DndContext>
  );

  /* ── Card mode (responsivo mobile) ────────────────────────────────
   * Quando `cardBreakpoint` está habilitado e o viewport é menor que ele,
   * renderiza cada row como `<TableCardRow>` em vez de `<TableRow>`. O
   * toolbar e footer continuam idênticos — só o body que troca de view.
   *
   * Mapeamento das colunas → card:
   *   - selection (checkbox)         → header do card (esquerda)
   *   - col.isPrimary OU 1ª não-actions → header do card (label primário)
   *   - col.type === "actions"       → headerActions (canto sup. direito)
   *   - resto das colunas visíveis   → items label/value no body
   *
   * Não suportado em card mode (degradam silenciosamente):
   *   - Virtualização (renderiza todas as rows)
   *   - Row expansion (toggle escondido)
   *   - Inline editing (double-click pra editar)
   *   - Column reordering / pinning / resize (sem sentido num card vertical)
   */
  const cardBp = props.cardBreakpoint ?? DEFAULT_CARD_BREAKPOINT;
  const cardModeQuery =
    cardBp === false ? "(max-width: 0px)" : `(max-width: ${cardBp - 1}px)`;
  const isMobileViewport = useMediaQuery(cardModeQuery);
  // Preferência de exibição no mobile: TABELA por default (antes era card forçado).
  // O user troca pra "card" via toggle no Configurações da tabela (só mobile).
  // Live (sem reload). cardBreakpoint={false} desabilita o card de vez.
  const cardPossible = isMobileViewport && cardBp !== false && !isKanban;
  const [mobileDisplay, setMobileDisplay] = useState<"table" | "card">("table");
  const isCardMode = cardPossible && mobileDisplay === "card";

  /** Render do conteúdo de uma cell — versão simplificada (sem edit/expansion). */
  const getCardCellContent = (
    col: (typeof cols.effectiveColumns)[number],
    row: T,
  ): ReactNode => {
    const isActionsCol = col.type === "actions";
    const value = isActionsCol ? undefined : resolveCellValue(row, col);
    const typeDef = col.type ? columnTypeRegistry.get(col.type) : undefined;

    if (isActionsCol && col.getActions && !col.render) {
      return (
        <DataTableActionsCell row={row} actions={col.getActions({ row })} />
      );
    }
    if (col.render) {
      return col.render({ row, value });
    }
    if (typeDef?.renderCell) {
      return typeDef.renderCell({
        value,
        row,
        options: col.filterOptions,
        column: {
          field: String(col.field),
          headerName: col.headerName,
          valueFormatter: col.valueFormatter,
          typeOptions: col.typeOptions,
        },
      });
    }
    if (col.valueFormatter) return col.valueFormatter(value) as ReactNode;
    if (typeDef?.formatValue) return typeDef.formatValue(value) as ReactNode;
    return value as ReactNode;
  };

  // Resolve colunas especiais uma vez fora do map (evita re-cálculo por row)
  const cardPrimaryCol = isCardMode
    ? (cols.effectiveColumns.find((c) => c.isPrimary) ??
      cols.effectiveColumns.find((c) => c.type !== "actions"))
    : undefined;
  const cardActionsCol = isCardMode
    ? cols.effectiveColumns.find((c) => c.type === "actions")
    : undefined;
  const cardItemCols = isCardMode
    ? cols.effectiveColumns.filter(
        (c) => c !== cardPrimaryCol && c !== cardActionsCol,
      )
    : [];

  const cardBody = (
    <div className="flex flex-col gap-gp-md p-pad-2xl overflow-auto scrollbar-thin min-h-0 flex-1">
      {rowsToRender.map((row) => {
        const isSel = selection.isRowSelected(row);
        const rowId = contextValue.getRowId(row);
        return (
          <TableCardRow
            key={String(rowId)}
            selected={isSel}
            clickable={!!props.onRowClick}
            onClick={
              props.onRowClick ? () => props.onRowClick?.(row) : undefined
            }
            header={
              <>
                {selectionConfig.enabled && (
                  <Checkbox
                    checked={isSel}
                    onCheckedChange={() => selection.toggleRow(row)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Selecionar linha"
                  />
                )}
                {cardPrimaryCol && (
                  <div className="font-medium text-fg-default truncate flex-1 min-w-0">
                    {getCardCellContent(cardPrimaryCol, row)}
                  </div>
                )}
              </>
            }
            headerActions={
              cardActionsCol
                ? getCardCellContent(cardActionsCol, row)
                : undefined
            }
            items={cardItemCols.map((col) => ({
              key: String(col.field),
              label: col.headerName ?? String(col.field),
              value: getCardCellContent(col, row),
            }))}
          />
        );
      })}
    </div>
  );

  /* ── Render principal ─────────────────────────────────────────── */

  return (
    <DataTableProvider value={contextValue}>
      <div
        className={cn(
          dataTableStyles({ fullscreen: isFullscreen }).root(),
          props.className,
        )}
      >
        {/* Toolbar */}
        <div className={styles.toolbarWrap()}>
          <>
            <TableToolbar
              viewToggle={resolvedViewToggle}
              savedViews={
                props.persistId ? (
                  <TableToolbarViews
                    views={viewsForToolbar}
                    activeViewId={savedViews.currentViewId ?? undefined}
                    onApply={handleViewApply}
                    onApplyDefault={applyDefault}
                    onDelete={savedViews.deleteView}
                    onSave={async (data) => {
                      await saveCurrentAsView(data.name, {
                        isPublic: data.isPublic,
                      });
                    }}
                    soloLabel={toolbarConfig.title}
                    hideDivider
                  />
                ) : undefined
              }
              refresh={
                toolbarConfig.enableRefresh !== false ? (
                  <ToolbarToolButton
                    icon={
                      <RefreshCw
                        className={isRefreshing ? "animate-spin" : ""}
                      />
                    }
                    aria-label="Atualizar"
                    onClick={handleRefresh}
                  />
                ) : undefined
              }
              search={
                toolbarConfig.enableSearch !== false ? (
                  <ToolbarSearch
                    value={search.inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      search.setInputValue(e.target.value)
                    }
                    // Enter/Escape tiram o foco → no mobile o teclado fecha
                    // (busca é live, não precisa de submit; o "ir" do teclado
                    // não tinha efeito e o teclado ficava preso).
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter" || e.key === "Escape") {
                        e.currentTarget.blur();
                      }
                    }}
                    placeholder="Buscar..."
                  />
                ) : undefined
              }
              filter={
                toolbarConfig.enableFilters !== false &&
                filterPopoverColumns.length > 0 ? (
                  // Conta só entries com valor real — uma linha recém-adicionada
                  // no query builder e ainda vazia NÃO ativa o indicador. O
                  // unmount-purge do FilterPanel remove a linha em branco ao fechar.
                  <ToolbarFilterButton
                    isActive={hasActiveFilter}
                    hasIndicator={hasActiveFilter}
                    onClick={() => setV2FilterOpen(true)}
                  />
                ) : undefined
              }
              actions={
                toolbarConfig.actions && toolbarConfig.actions.length > 0 ? (
                  <ToolbarActions actions={toolbarConfig.actions} />
                ) : undefined
              }
              fullscreen={
                enableFullscreen ? (
                  <ToolbarToolButton
                    icon={isFullscreen ? <Minimize2 /> : <Maximize2 />}
                    aria-label={
                      isFullscreen ? "Sair da tela cheia" : "Tela cheia"
                    }
                    isActive={isFullscreen}
                    onClick={toggleFullscreen}
                  />
                ) : undefined
              }
              settings={
                <ToolbarSettingsMenu
                  trigger={
                    <ToolbarToolButton
                      icon={<Settings2 />}
                      aria-label="Configurações da tabela"
                    />
                  }
                  sortPanel={(onBack) => (
                    <SortPanel
                      onBack={onBack}
                      columns={sortPopoverColumns}
                      sortBy={sortPopoverCriteria}
                      onSortByChange={handleSortChange}
                    />
                  )}
                  colsPanel={
                    toolbarConfig.enableColumns !== false
                      ? (onBack) => (
                          <ColsPanel
                            onBack={onBack}
                            columns={colsPopoverColumns}
                            visibleCols={visibleColsSet}
                            onVisibleChange={handleVisibleChange}
                            pinnedCols={pinnedColsSet}
                            onPinnedChange={handlePinnedChange}
                            onColumnsReorder={handleColumnsReorder}
                          />
                        )
                      : undefined
                  }
                  filterPanel={
                    toolbarConfig.enableFilters !== false &&
                    filterPopoverColumns.length > 0
                      ? (onBack) => (
                          <FilterPanel
                            onBack={onBack}
                            columns={filterPopoverColumns}
                            filters={filterPopoverEntries}
                            onFiltersChange={handleFiltersChange}
                            enableAdvanced
                            renderValueInput={({
                              column,
                              operator,
                              value,
                              onChange,
                            }) => {
                              const typeId =
                                column.filterType ?? column.type ?? "text";
                              const def = columnTypeRegistry.get(typeId);
                              // op já em id longo do FilterModel — sem remap.
                              const filterOp =
                                operator as FilterItem["operator"];
                              return def.renderFilterInput({
                                value: value as FilterValue,
                                onChange: (v) => onChange(v),
                                operator: filterOp,
                                options: column.options,
                              });
                            }}
                            getOperatorsForColumn={(column) => {
                              const typeId =
                                column.filterType ?? column.type ?? "text";
                              const def = columnTypeRegistry.get(typeId);
                              return def.operators?.map((o) => ({
                                id: o.id,
                                label: o.label,
                              }));
                            }}
                          />
                        )
                      : undefined
                  }
                  density={
                    toolbarConfig.enableDensity !== false ? (
                      <ToolbarSegmented
                        fluid
                        value={density.density}
                        onValueChange={(v) =>
                          density.setDensity(v as TableDensity)
                        }
                        items={props.densityItems ?? DENSITY_ITEMS}
                        ariaLabel="Densidade da tabela"
                      />
                    ) : undefined
                  }
                  mobileViewToggle={
                    resolvedViewToggle ? (
                      (props.kanbanConfig || props.listConfig) &&
                      props.toolbar?.viewToggle === undefined ? (
                        <ToolbarSegmented
                          fluid
                          value={viewMode}
                          onValueChange={handleViewModeChange}
                          items={mobileViewItems}
                          ariaLabel="Modo de visualização"
                        />
                      ) : (
                        resolvedViewToggle
                      )
                    ) : undefined
                  }
                  mobileDisplayToggle={
                    // Linhas vs Cards — só faz sentido quando o card é possível
                    // (viewport mobile + cardBreakpoint != false + não-kanban).
                    cardPossible ? (
                      <ToolbarSegmented
                        fluid
                        value={mobileDisplay}
                        onValueChange={(v) =>
                          setMobileDisplay(v as "table" | "card")
                        }
                        items={[
                          {
                            value: "table",
                            label: "Linhas",
                            children: (
                              <span className="inline-flex items-center gap-gp-sm">
                                <Rows3 /> Linhas
                              </span>
                            ),
                          },
                          {
                            value: "card",
                            label: "Cards",
                            children: (
                              <span className="inline-flex items-center gap-gp-sm">
                                <LayoutGrid /> Cards
                              </span>
                            ),
                          },
                        ]}
                        ariaLabel="Exibição da tabela"
                      />
                    ) : undefined
                  }
                  mobileViews={
                    props.persistId && (props.defaultViews?.length ?? 0) > 0
                      ? {
                          items: viewsForToolbar
                            .filter((v) => v.owner === "preset")
                            .map((v) => ({ id: v.id, name: v.name })),
                          activeId: savedViews.currentViewId ?? undefined,
                          onSelect: handleViewApply,
                        }
                      : undefined
                  }
                />
              }
              more={
                exportConfig || toolbarConfig.moreMenu?.items?.length ? (
                  <MoreMenu
                    trigger={
                      <ToolbarToolButton
                        icon={<MoreHorizontal />}
                        aria-label="Opções"
                      />
                    }
                  >
                    {exportConfig &&
                      exportConfig.formats.map((fmt) => {
                        const isCsvDefault = fmt.id === "csv" && !fmt.onSelect;
                        if (!isCsvDefault) {
                          return (
                            <MoreMenuItemEl
                              key={fmt.id}
                              onSelect={fmt.onSelect}
                            >
                              {fmt.icon}
                              {fmt.label}
                            </MoreMenuItemEl>
                          );
                        }
                        return isServerMode ? (
                          <MoreMenuItemEl
                            key={fmt.id}
                            onSelect={() => exporter.exportCsv("all")}
                          >
                            {fmt.icon}
                            {fmt.label} — Página atual
                          </MoreMenuItemEl>
                        ) : (
                          <span key={fmt.id} className="contents">
                            <MoreMenuItemEl
                              onSelect={() => exporter.exportCsv("all")}
                            >
                              {fmt.icon}
                              {fmt.label} — Todos
                            </MoreMenuItemEl>
                            <MoreMenuItemEl
                              onSelect={() => exporter.exportCsv("filtered")}
                            >
                              {fmt.icon}
                              {fmt.label} — Filtrados
                            </MoreMenuItemEl>
                            <MoreMenuItemEl
                              onSelect={() => exporter.exportCsv("selected")}
                              disabled={selection.selectedCount === 0}
                            >
                              {fmt.icon}
                              {fmt.label} — Selecionados (
                              {selection.selectedCount})
                            </MoreMenuItemEl>
                          </span>
                        );
                      })}
                    {exportConfig && toolbarConfig.moreMenu?.items?.length ? (
                      <MoreMenuSeparator />
                    ) : null}
                    {toolbarConfig.moreMenu?.items?.map((it) => (
                      <MoreMenuItemEl
                        key={it.id}
                        onSelect={it.onSelect}
                        disabled={it.disabled}
                        variant={it.destructive ? "destructive" : "default"}
                      >
                        {it.icon}
                        {it.label}
                      </MoreMenuItemEl>
                    ))}
                  </MoreMenu>
                ) : undefined
              }
              bulkBar={
                selectionConfig.enabled && selection.selectedCount > 0 ? (
                  <BulkActionsBar
                    count={selection.selectedCount}
                    onClear={selection.clear}
                  >
                    {selectionConfig.actions?.(
                      selection.selectedIds,
                      selection.clear,
                    )}
                  </BulkActionsBar>
                ) : undefined
              }
            />
            {/* Drawer do filtro simples (funil) — só v2 */}
            {toolbarConfig.enableFilters !== false &&
              filterPopoverColumns.length > 0 && (
                <SimpleFilterDrawer
                  open={v2FilterOpen}
                  onOpenChange={setV2FilterOpen}
                  columns={filterPopoverColumns}
                  filterModel={filters.filterModel}
                  onFilterModelChange={filters.setFilterModel}
                  hiddenFields={props.simpleFilter?.hiddenFields}
                  title={props.simpleFilter?.title}
                  size={props.simpleFilter?.size}
                />
              )}
          </>

          {/* Applied filter chips — agrupados por field+operator, clicaveis via renderChip → Popover.
              `pendingOpenId` deixa ToolbarApplied controlar visual de "abrir auto" sem
              o DataTable precisar saber qual chip está pendente (state mora no toolbar). */}
          <ToolbarApplied
            filters={enhancedAppliedFilters}
            onRemove={handleRemoveFilter}
            onClearAll={filters.clearFilters}
            pendingOpenId={pendingOpenChipKey}
            onPendingOpenIdChange={setPendingOpenChipKey}
            renderChip={(f, defaultChip, isPendingOpen) => {
              // Chip placeholder (showEmptyFilterChips array). Não tem group no
              // appliedGroups — clica → ativa o filtro (cria item vazio + abre popover).
              if (f.id.startsWith(PLACEHOLDER_ID_PREFIX)) {
                const field = f.id.slice(PLACEHOLDER_ID_PREFIX.length);
                return (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleActivatePlaceholder(field)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleActivatePlaceholder(field);
                      }
                    }}
                    className="contents cursor-pointer"
                  >
                    {defaultChip}
                  </div>
                );
              }
              const group = appliedGroups.find((g) => g.key === f.id);
              if (!group) return defaultChip;
              const col = colsByField.get(group.field);
              const items = group.items;
              // `between` (date/number range) é um caso especial — operador tupla.
              // Não spread, não promove pra multiSelect, usa o column-type direto
              // e passa value como tupla pro renderFastFilterInput.
              const isTupleOperator = group.operator === "between";
              const aggregateValues = isTupleOperator
                ? []
                : items.flatMap((it) =>
                    Array.isArray(it.value)
                      ? (it.value as unknown[])
                      : it.value != null
                        ? [it.value]
                        : [],
                  );
              const useMulti =
                !isTupleOperator &&
                (aggregateValues.length > 1 ||
                  group.operator === "isAnyOf" ||
                  group.operator === "isNoneOf" ||
                  col?.filterType === "multiSelect" ||
                  (col?.filterType === "select" &&
                    (col?.filterOptions?.length ?? 0) > 0));
              const def = columnTypeRegistry.get(
                isTupleOperator
                  ? (col?.filterType ?? "text")
                  : useMulti
                    ? "multiSelect"
                    : (col?.filterType ?? "text"),
              );
              // currentValue:
              //  - tuple (between): pega o value do primeiro item (já é tupla)
              //  - multi: array agregado
              //  - single: primeiro valor agregado
              const currentValue = isTupleOperator
                ? (items[0]?.value as unknown)
                : useMulti
                  ? aggregateValues
                  : aggregateValues[0];
              const options = getGroupOptions(group.key);
              // Controlled open: `isPendingOpen` vem do ToolbarApplied via
              // `pendingOpenId` prop — state mora no toolbar, DataTable só
              // controla quando setar via `setPendingOpenChipKey`.
              // Ao fechar, se o grupo só tem itens com valor vazio (caso do
              // shortcut que abriu mas user nao digitou nada), remove do filterModel.
              // Open controlado: pending (shortcut do header) OU clique no chip.
              // Controlar o open é o que permite o `onClose` fechar o popover
              // mesmo quando o `<Select open>` interno trava o clique-fora.
              const closeChip = () => {
                setOpenChipKey(null);
                if (isPendingOpen) setPendingOpenChipKey(null);
                // Cleanup: remove itens vazios deste grupo do filterModel
                const groupItems = group.items;
                const allEmpty = groupItems.every((it) =>
                  isFilterValueEmpty(it.value),
                );
                if (allEmpty) {
                  const ids = new Set(groupItems.map((it) => it.id));
                  filters.setFilterModel({
                    ...filters.filterModel,
                    items: filters.filterModel.items.filter(
                      (it) => !ids.has(it.id),
                    ),
                  });
                }
              };
              return (
                <Popover
                  open={isPendingOpen || openChipKey === f.id}
                  onOpenChange={(o) => {
                    if (o) {
                      setOpenChipKey(f.id);
                      return;
                    }
                    closeChip();
                  }}
                >
                  <PopoverTrigger asChild>{defaultChip}</PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    {def.renderFastFilterInput({
                      value: currentValue as FilterValue,
                      onChange: (v) => updateGroupValue(group.key, v),
                      options,
                      onClose: closeChip,
                    })}
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          (props.renderLoading ?? <DataTableLoading />)
        ) : isKanban ? (
          // Kanban gerencia seu próprio empty state interno (coluna sem cards).
          // Filter/search/sort/selection já estão aplicados via rowsAllPagesProcessed.
          <Kanban
            columns={kanbanView.columns}
            cards={kanbanView.cards}
            // Selection (bridge)
            selectedIds={kanbanSelectedIds}
            onToggleSelect={kanbanSelectedIds ? kanbanToggleSelect : undefined}
            // Detail panel (controlled) + click
            openCardId={props.kanbanConfig?.openCardId}
            onOpenCard={kanbanOnOpenCard}
            // Add card (botões "+" header + footer)
            onAddCard={props.kanbanConfig?.onAddCard}
            onAddInFooter={props.kanbanConfig?.onAddInFooter}
            hideFooterAdd={props.kanbanConfig?.hideFooterAdd}
            // Menus (auto via items OU manual via callback — items ganham se ambos definidos)
            getCardMenuItems={kanbanGetCardMenuItems}
            onCardMenu={
              kanbanGetCardMenuItems
                ? undefined
                : props.kanbanConfig?.onCardMenu
            }
            getColumnMenuItems={props.kanbanConfig?.getColumnMenuItems}
            onColumnMenu={
              props.kanbanConfig?.getColumnMenuItems
                ? undefined
                : props.kanbanConfig?.onColumnMenu
            }
            // Card content custom (override total do miolo)
            renderCard={kanbanRenderCardContent}
            // DnD
            enableDnD={props.kanbanConfig?.enableDnD}
            onCardMove={props.kanbanConfig?.onCardMove}
            // Textos
            emptyLabel={props.kanbanConfig?.emptyLabel}
            addLabel={props.kanbanConfig?.addLabel}
          />
        ) : isList && props.listConfig ? (
          // Lista: corpo trocado por <List> (mesma toolbar do DataTable).
          // Rows já filtradas/buscadas/ordenadas via rowsAllPagesProcessed.
          <div className="min-h-0 flex-1 overflow-auto scrollbar-thin">
            <List
              items={listItems}
              layout={props.listConfig.hierarchical ? "hierarchical" : "standard"}
              branchHighlight="none"
              defaultExpandedIds={listDefaultExpandedIds}
              renderItem={(item, state) =>
                props.listConfig!.renderItem(item.data as T, {
                  depth: state.depth,
                  open: state.open,
                })
              }
              onItemClick={
                props.onRowClick
                  ? (id) => {
                      const row = rowsAllPagesProcessed.find(
                        (r) => String(contextValue.getRowId(r)) === id,
                      );
                      if (row) props.onRowClick!(row);
                    }
                  : undefined
              }
              getMenuItems={
                props.listConfig.getMenuItems
                  ? (item) => props.listConfig!.getMenuItems!(item.data as T)
                  : undefined
              }
            />
          </div>
        ) : isDataEmpty ? (
          (props.renderEmpty ?? <DataTableEmpty />)
        ) : isNoResults ? (
          (props.renderNoResults ?? (
            <DataTableNoResults
              onClearFilters={() => {
                filters.setFilterModel({ items: [], logicOperator: "AND" });
                search.setInputValue("");
              }}
            />
          ))
        ) : isCardMode ? (
          cardBody
        ) : (
          tableBody
        )}

        {/* Footer (paginação) — só na view table.
           Durante loading mostra skeleton no lugar (mesma silhueta) pra
           evitar paginação "1 página" enquanto fetchData responde. */}
        {!isKanban &&
          !isList &&
          !useTreeData &&
          paginationConfig.enabled !== false &&
          (isLoading ? (
            <div className={styles.footerWrap()}>
              <FooterTableSkeleton />
            </div>
          ) : (
            !isDataEmpty && (
              <div className={styles.footerWrap()}>
                <FooterTable
                  totalCount={totalAfterFilter}
                  page={pagination.paginationModel.page}
                  pageSize={pagination.paginationModel.pageSize}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                  pageSizeOptions={paginationConfig.pageSizeOptions}
                  selectionCount={selection.selectedCount}
                />
              </div>
            )
          ))}
      </div>
    </DataTableProvider>
  );
}

type DataTableComponent = <T>(
  props: DataTableProps<T> & { ref?: Ref<DataTableRef> },
) => React.ReactElement;

export const DataTable = forwardRef(DataTableInternal) as DataTableComponent;
