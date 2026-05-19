import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  TableCell,
  TableCardRow,
  TableHead,
  TableHeadCell,
  TableRow,
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
  SlidersHorizontal,
  ArrowUpDown,
  Columns,
  Download,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Filter as FilterIcon,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  TableToolbar,
  ToolbarSearch,
  ToolbarToolButton,
  ToolbarSegmented,
  ToolbarDivider,
  ToolbarApplied,
  ToolbarMobileDialog,
  ToolbarMobileSection,
  BulkActionsBar,
  FilterPopover,
  SortPopover,
  ColsPopover,
  TableToolbarViews,
  MoreMenu,
  MoreMenuItem as MoreMenuItemEl,
  MoreMenuSeparator,
} from "../TableToolbar";
import type {
  FilterPopoverColumn,
  FilterPopoverEntry,
  SortPopoverColumn,
  SortPopoverCriterion,
  ColsPopoverColumn,
  ToolbarSegmentedItem,
  AppliedFilter,
} from "../TableToolbar";
import { FooterTable, FooterTableSkeleton } from "../FooterTable";
import { Kanban } from "../Kanban";
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
import { DataTableProvider } from "./context/data-table-context";
import { useDataTableController } from "./hooks/use-data-table-controller";
import { DataTableEmpty } from "./parts/data-table-empty";
import { DataTableLoading } from "./parts/data-table-loading";
import { DataTableNoResults } from "./parts/data-table-no-results";
import { DataTableColumnMenu } from "./parts/data-table-column-menu";
import { DataTableActionsCell } from "./parts/data-table-actions-cell";
import { DataTableSortableHeadCell } from "./parts/sortable-head-cell";
import { DataTableEditCell } from "./parts/data-table-edit-cell";
import { DataTableTotalizerRow } from "./parts/data-table-totalizer-row";
import { DataTableGroupHeaderRow } from "./parts/data-table-group-header-row";
import { DataTableGroupContentRow } from "./parts/data-table-group-content-row";
import { groupRows, isGroupRow, isGroupContent } from "./utils/group-rows";
import { DataTableRowExpansion } from "./parts/data-table-row-expansion";
import { expandRows, isExpansionRow } from "./utils/expand-rows";
import {
  POPOVER_OP_TO_FILTER_OP,
  FILTER_OP_TO_POPOVER_OP,
} from "./utils/operator-mapping";
import { useSortPopoverAdapter } from "./hooks/use-sort-popover-adapter";
import { useColsPopoverAdapter } from "./hooks/use-cols-popover-adapter";
import { useFilterPopoverAdapter } from "./hooks/use-filter-popover-adapter";
import { useDataTableViewMode } from "./hooks/use-data-table-view-mode";
import { applyValueGetter } from "./utils/resolve-value";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../shadcn/popover";
import { columnTypeRegistry } from "./column-types";
import type { ColumnOption } from "./column-types";
// DataTableFloatingBulkBar still exported from barrel for opt-in use;
// default DataTable now uses inline BulkActionsBar via TableToolbar.bulkBar.

const styles = dataTableStyles();

/* ── Density toggle items (stable ref) ────────────────────────────── */

const DENSITY_ITEMS: ToolbarSegmentedItem<TableDensity>[] = [
  { value: "compact",     children: <Rows4 />, label: "Compacto" },
  { value: "standard",    children: <Rows3 />, label: "Padrão" },
  { value: "comfortable", children: <Rows2 />, label: "Confortável" },
];

/* ── View mode toggle items (stable ref) ───────────────────────────── */

const DEFAULT_VIEW_MODE_ITEMS: ToolbarSegmentedItem<"table" | "kanban">[] = [
  { value: "table",  children: <TableIcon />,  label: "Tabela" },
  { value: "kanban", children: <LayoutGrid />, label: "Kanban" },
];

/* ── View mode items pro mobile dialog (icon + label fluid) ──────────
 * No mobile, os triggers viram fluid (full-width) e ganham texto ao lado
 * do ícone — fica óbvio o que cada opção faz num touch target maior. */
const MOBILE_VIEW_MODE_ITEMS: ToolbarSegmentedItem<"table" | "kanban">[] = [
  {
    value: "table",
    label: "Tabela",
    children: (
      <span className="inline-flex items-center gap-gp-sm">
        <TableIcon /> Tabela
      </span>
    ),
  },
  {
    value: "kanban",
    label: "Kanban",
    children: (
      <span className="inline-flex items-center gap-gp-sm">
        <LayoutGrid /> Kanban
      </span>
    ),
  },
];

// Operator mapping consolidado em utils/operator-mapping.ts.

/**
 * Resolve o valor de uma cell — delega pro shared `applyValueGetter`
 * (utils/resolve-value.ts) pra evitar duplicação com processor + group-rows.
 */
function resolveCellValue<T>(
  row: T,
  col: DataTableColumnDef<T>,
): unknown {
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
    exportHook,
    isServerMode,
    savedViews,
    applyView,
    applyViewById,
    applyDefault,
    saveCurrentAsView,
    query,
    // States novos centralizados (viewMode/groupBy/expandedRowIds + setters)
    viewMode,
    setViewMode,
    groupBy,
    expandedRowIds: controllerExpandedRowIds,
    toggleRowExpansion: controllerToggleRowExpansion,
  } = controller;

  const toolbarConfig = props.toolbar ?? {};
  const paginationConfig = props.paginationConfig ?? { enabled: true };
  const selectionConfig = props.selectionConfig ?? { enabled: false };

  const isKanban = viewMode === "kanban" && Boolean(props.kanbanConfig);

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
    if (props.toolbar?.viewToggle !== undefined) return props.toolbar.viewToggle;
    if (!props.kanbanConfig) return null;
    return (
      <ToolbarSegmented
        value={viewMode}
        onValueChange={handleViewModeChange}
        items={DEFAULT_VIEW_MODE_ITEMS}
        aria-label="Modo de visualização"
      />
    );
  }, [props.toolbar?.viewToggle, props.kanbanConfig, viewMode, handleViewModeChange]);

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
    return (params: { card: { id: string }; selected: boolean; open: boolean }) => {
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
  const [pendingOpenChipKey, setPendingOpenChipKey] = useState<string | null>(null);

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

  /* ── Adapters: ColumnDef → SortPopover props (extraído em hook) ── */

  const {
    sortPopoverColumns,
    sortPopoverCriteria,
    handleSortChange,
  } = useSortPopoverAdapter({
    effectiveColumns: cols.effectiveColumns,
    sortModels: sort.sortModels,
    setSortModels: sort.setSortModels,
  });

  /* ── Adapters: ColumnDef → ColsPopover props (extraído em hook) ── */

  const {
    colsPopoverColumns,
    visibleColsSet,
    pinnedColsSet,
    handleVisibleChange,
    handlePinnedChange,
    handleColumnsReorder,
  } = useColsPopoverAdapter({
    columns: props.columns,
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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (isServerMode) {
      query.refresh();
    }
    // Mantem o spinner visivel por 400ms minimo (UX feedback)
    setTimeout(() => setIsRefreshing(false), 400);
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
    const isSelectish = col.filterType === "select" || col.filterType === "multiSelect";
    const isDate = col.filterType === "date";
    const operator: FilterItem["operator"] = isSelectish
      ? "equals"
      : isDate
        ? "between"
        : "contains";
    const chipKey = `${field}|${operator}`;
    const initialValue: FilterValue = isDate ? [null, null] : "";

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

  // Array de items renderizados — quando há expansion, intercala markers.
  // Mutuamente exclusivo com groupBy (que tem precedência).
  const finalItems = useMemo(() => {
    if (groupByField) return groupedRows;
    if (useRowExpansion && expandedRowIds.size > 0) {
      return expandRows(rowsToRender, expandedRowIds, contextValue.getRowId);
    }
    return rowsToRender;
  }, [
    groupByField,
    groupedRows,
    useRowExpansion,
    expandedRowIds,
    rowsToRender,
    contextValue,
  ]);

  /* ── Virtualização — Fase F.3 ──────────────────────────────────────
   * Quando props.virtualize, renderiza apenas rows visíveis. Estimate de
   * row height deriva de density (compact=40, standard=56, comfortable=64).
   * Consumer pode override via props.estimateRowHeight. */
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const defaultRowHeight =
    density.density === "compact"
      ? 40
      : density.density === "comfortable"
        ? 64
        : 56;
  const estimateRowHeight = props.estimateRowHeight ?? defaultRowHeight;
  const virtualize = props.virtualize === true;

  const rowVirtualizer = useVirtualizer({
    // count cobre todos os casos: rows simples, agrupadas, ou com expansion intercalada
    count: virtualize ? finalItems.length : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: props.overscan ?? 10,
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
      cardBreakpoint={props.cardBreakpoint ?? 768}
      className="min-h-0 max-h-full"
      scrollRef={scrollContainerRef}
    >
      <TableHead>
        {selectionConfig.enabled && (
          <TableHeadCell width={SELECTION_COLUMN_WIDTH} align="center" purpose="selection">
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
        <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
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
                sort.sortModels.find((s) => s.field === field)?.direction ?? null
              }
              sortIndex={(() => {
                // Mostra badge 1/2/3... apenas quando ha multi-sort (>= 2 criterios).
                if (sort.sortModels.length < 2) return undefined;
                const idx = sort.sortModels.findIndex((s) => s.field === field);
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
                  : col.icon ??
                    (col.type ? columnTypeRegistry.get(col.type).defaultIcon : undefined)
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
                          sort.sortModels.find((s) => s.field === field)?.direction ?? null
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
          virtualize ? { totalHeight: rowVirtualizer.getTotalSize() } : undefined
        }
      >
        {(() => {
          // Branching: GroupHeader / GroupContent / DataRow.
          //  - GroupHeader: column-aligned default, ou free-form via renderGroupHeader.
          //  - GroupContent: slot custom (só aparece quando renderGroupContent definido) —
          //    substitui as N child rows por 1 row full-width com conteudo livre.
          //  - DataRow: fluxo normal (TableRow + cells).
          const renderItem = (
            item: T | (typeof groupedRows[number] & { __type?: symbol }),
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
            const row = item as T;
            return renderRow(row, index, virtualStyle);
          };

          const renderRow = (
            row: T,
            index: number,
            virtualStyle?: React.CSSProperties,
          ) => {
          const isSel = selection.isRowSelected(row);
          const rowClass = props.getRowClassName?.({ row, index });
          const isRowFocused = focusedRowIndex === index;
          return (
            <TableRow
              key={String(contextValue.getRowId(row))}
              ref={(el) => {
                if (el) rowRefs.current.set(index, el);
                else rowRefs.current.delete(index);
              }}
              selected={isSel}
              focused={isRowFocused}
              clickable={!!props.onRowClick}
              onClick={() => {
                setFocusedRowIndex(index);
                props.onRowClick?.(row);
              }}
              rootProps={{
                onKeyDown: (e) => handleRowKeyDown(e, index, row),
                onFocus: () => {
                  // Atualiza focused quando Tab traz foco direto (sem keyDown anterior)
                  if (focusedRowIndex !== index) setFocusedRowIndex(index);
                },
                style: virtualStyle,
              }}
              className={rowClass}
            >
              {selectionConfig.enabled && (
                <TableCell width={SELECTION_COLUMN_WIDTH} align="center" purpose="selection">
                  <Checkbox
                    checked={isSel}
                    onCheckedChange={() => selection.toggleRow(row)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Selecionar linha"
                  />
                </TableCell>
              )}
              {cols.effectiveColumns.map((col) => {
                const field = String(col.field);
                const isActionsCol = col.type === "actions";
                const value = isActionsCol ? undefined : resolveCellValue(row, col);
                const rowId = contextValue.getRowId(row);
                const isEditingThisCell =
                  editingCell?.rowId === rowId && editingCell.field === field;
                const isEditable = !isActionsCol && col.editable === true;
                // Fase F.4b — coluna marcada como expand trigger.
                // Mostra chevron + cursor pointer; click toggla expansão da row.
                const isExpandableCol =
                  useRowExpansion && col.expandable === true && field === expandableColField;
                const isRowExpanded = expandedRowIds.has(rowId);

                // Actions column com getActions → auto-renderiza DataTableActionsCell.
                // Se consumer passar `render` numa coluna actions, render ganha (escape hatch).
                // Inline edit (isEditingThisCell) → DataTableEditCell substitui o content.
                // Expandable col → prefixa chevron antes do content.
                // Fase G.2 — fallback chain:
                //   1. col.render (consumer custom)
                //   2. registry.renderCell (tipo prebuilt)
                //   3. col.valueFormatter
                //   4. registry.formatValue
                //   5. raw value
                const typeDef = col.type
                  ? columnTypeRegistry.get(col.type)
                  : undefined;
                const baseContent = isEditingThisCell
                  ? (
                      <DataTableEditCell
                        column={col}
                        row={row}
                        initialValue={value}
                        isLoading={editLoading}
                        error={editError}
                        onCommit={(newValue) =>
                          handleCellEditCommit({
                            row,
                            field,
                            value: newValue,
                            oldValue: value,
                          })
                        }
                        onCancel={handleCellEditCancel}
                      />
                    )
                  : isActionsCol && col.getActions && !col.render
                    ? (
                        <DataTableActionsCell
                          row={row}
                          actions={col.getActions({ row })}
                        />
                      )
                    : col.render
                      ? col.render({ row, value })
                      : typeDef?.renderCell
                        ? typeDef.renderCell({
                            value,
                            row,
                            options: col.filterOptions,
                            column: {
                              field: String(col.field),
                              headerName: col.headerName,
                              valueFormatter: col.valueFormatter,
                              typeOptions: col.typeOptions,
                            },
                          })
                        : col.valueFormatter
                          ? col.valueFormatter(value)
                          : typeDef?.formatValue
                            ? typeDef.formatValue(value)
                            : value;
                const content = isExpandableCol ? (
                  <span className="flex items-center gap-gp-md w-full">
                    <ChevronRight
                      className={cn(
                        "shrink-0 size-icon-sm text-fg-muted transition-transform duration-150",
                        isRowExpanded && "rotate-90",
                      )}
                      aria-hidden
                    />
                    <span className="flex-1 min-w-0">{baseContent as ReactNode}</span>
                  </span>
                ) : (
                  baseContent
                );
                // Tooltip nativo: string formatada quando ellipsis ou texto plano (sem custom render)
                // Nao aplica em colunas actions (icones tem proprio title) ou em cell em edicao.
                const tooltipText =
                  isActionsCol || isEditingThisCell
                    ? undefined
                    : col.ellipsis || !col.render
                      ? col.valueFormatter
                        ? col.valueFormatter(value)
                        : value != null
                          ? String(value)
                          : undefined
                      : undefined;
                // onDoubleClick em celulas editaveis entra em edit mode.
                // onClick em cells expandable toggla expansão da row.
                // stopPropagation em ambos evita disparar onRowClick.
                const cellRootProps: React.HTMLAttributes<HTMLDivElement> | undefined =
                  isEditable || isExpandableCol
                    ? {
                        ...(isEditable && {
                          onDoubleClick: (e: React.MouseEvent) => {
                            e.stopPropagation();
                            setEditingCell({ rowId, field });
                          },
                          "data-editable": "true",
                        }),
                        ...(isExpandableCol && {
                          onClick: (e: React.MouseEvent) => {
                            e.stopPropagation();
                            toggleRowExpansion(rowId);
                          },
                          "data-expandable": "true",
                          "aria-expanded": isRowExpanded,
                          style: { cursor: "pointer" },
                        }),
                      }
                    : undefined;
                // Fase G.2 — defaults vindos do registry quando consumer não override
                const effectiveAlign = col.align ?? typeDef?.defaultAlign;
                const effectiveEllipsis = col.ellipsis ?? typeDef?.defaultEllipsis;
                return (
                  <TableCell
                    key={field}
                    field={field}
                    width={cols.columnWidths[field]}
                    pinned={col.pinned}
                    pinOffset={cols.stickyOffsets[field]}
                    align={effectiveAlign}
                    ellipsis={effectiveEllipsis}
                    purpose={isActionsCol ? "actions" : undefined}
                    label={col.headerName}
                    tooltip={tooltipText}
                    rootProps={cellRootProps}
                    // Celula em edicao remove padding pra editor ocupar 100% sem margem
                    className={isEditingThisCell ? "!px-pad-xs !py-0" : undefined}
                  >
                    {content as ReactNode}
                  </TableCell>
                );
              })}
            </TableRow>
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
  const cardBp = props.cardBreakpoint ?? 768;
  const cardModeQuery =
    cardBp === false ? "(max-width: 0px)" : `(max-width: ${cardBp - 1}px)`;
  const isCardMode =
    useMediaQuery(cardModeQuery) && cardBp !== false && !isKanban;

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
    ? cols.effectiveColumns.find((c) => c.isPrimary) ??
      cols.effectiveColumns.find((c) => c.type !== "actions")
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
      {rowsToRender.map((row, index) => {
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
      <div className={cn(styles.root(), props.className)}>
        {/* Toolbar */}
        <div className={styles.toolbarWrap()}>
          <TableToolbar
            left={
              <>
                {/* Search — fluid no mobile, fixo 200px no desktop. Sempre visível. */}
                {toolbarConfig.enableSearch !== false && (
                  <ToolbarSearch
                    value={search.inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      search.setInputValue(e.target.value)
                    }
                    placeholder="Buscar..."
                  />
                )}

                {/* Visível a partir de ≥md — refresh + view toggle + saved views
                   + customLeft. Em <md (mobile real), esses controles vão pro
                   ToolbarMobileDialog. `display:contents` preserva o flex layout
                   do parent sem criar wrapper visual extra. */}
                <div className="hidden md:contents">
                  {toolbarConfig.enableRefresh !== false && (
                    <ToolbarToolButton
                      icon={
                        <RefreshCw
                          className={isRefreshing ? "animate-spin" : ""}
                        />
                      }
                      aria-label="Atualizar"
                      onClick={handleRefresh}
                    />
                  )}

                  {/* Divider — só aparece se há algo do lado direito */}
                  {(resolvedViewToggle || props.persistId || toolbarConfig.customLeft) && (
                    <ToolbarDivider />
                  )}

                  {/* View toggle (table/kanban) — slot dedicado, auto OU consumer-provided */}
                  {resolvedViewToggle}

                  {/* Saved Views — opt-in via persistId */}
                  {props.persistId && (
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
                      // Divider já foi colocado acima; views ficam coladas
                      hideDivider
                    />
                  )}

                  {/* Slot livre (mantém retrocompat) */}
                  {toolbarConfig.customLeft}
                </div>
              </>
            }
            actions={
              <>
                {/* FilterPopover — Filtrar (sempre visível, mobile + desktop) */}
                {toolbarConfig.enableFilters !== false && filterPopoverColumns.length > 0 && (
                  <FilterPopover
                    columns={filterPopoverColumns}
                    filters={filterPopoverEntries}
                    onFiltersChange={handleFiltersChange}
                    enableAdvanced
                    // Fase G.1 — delega input de valor pro registry, eliminando
                    // o text input genérico pra date/multiSelect/boolean/etc.
                    // FilterPopoverEntry.value agora é `unknown` — passa direto
                    // sem stringify (preserva arrays/tuplas pra multiSelect/between).
                    renderValueInput={({ column, operator, value, onChange }) => {
                      const typeId = column.filterType ?? column.type ?? "text";
                      const def = columnTypeRegistry.get(typeId);
                      const filterOp =
                        POPOVER_OP_TO_FILTER_OP[operator] ??
                        (operator as FilterItem["operator"]);
                      return def.renderFilterInput({
                        value: value as never,
                        onChange: (v) => onChange(v),
                        operator: filterOp,
                        options: column.options,
                      });
                    }}
                    trigger={
                      <ToolbarToolButton
                        icon={<SlidersHorizontal />}
                        label="Filtrar"
                        isActive={filterPopoverEntries.length > 0}
                        hasIndicator={filterPopoverEntries.length > 0}
                      />
                    }
                  />
                )}

                {/* Desktop-only — controles secundários (sort/cols/density/export/more).
                   `display:contents` preserva o flex layout sem wrapper visual. */}
                <div className="hidden xl:contents">
                  {/* SortPopover — Ordenar */}
                  <SortPopover
                    columns={sortPopoverColumns}
                    sortBy={sortPopoverCriteria}
                    onSortByChange={handleSortChange}
                    trigger={
                      <ToolbarToolButton
                        icon={<ArrowUpDown />}
                        aria-label="Ordenar"
                        hasIndicator={sortPopoverCriteria.length > 0}
                      />
                    }
                  />
                  {/* ColsPopover — Colunas */}
                  {toolbarConfig.enableColumns !== false && (
                    <ColsPopover
                      columns={colsPopoverColumns}
                      visibleCols={visibleColsSet}
                      onVisibleChange={handleVisibleChange}
                      pinnedCols={pinnedColsSet}
                      onPinnedChange={handlePinnedChange}
                      onColumnsReorder={handleColumnsReorder}
                      trigger={
                        <ToolbarToolButton
                          icon={<Columns />}
                          aria-label="Colunas"
                        />
                      }
                    />
                  )}

                  {/* Divider antes do Density */}
                  {toolbarConfig.enableDensity !== false && <ToolbarDivider />}

                  {/* Density toggle */}
                  {toolbarConfig.enableDensity !== false && (
                    <ToolbarSegmented
                      value={density.density}
                      onValueChange={(v) => density.setDensity(v as TableDensity)}
                      items={props.densityItems ?? DENSITY_ITEMS}
                      ariaLabel="Densidade da tabela"
                    />
                  )}

                  {/* Divider antes da area de actions (Export/MoreMenu) */}
                  {(exportConfig || toolbarConfig.moreMenu?.items?.length) && (
                    <ToolbarDivider />
                  )}

                  {/* Export dropdown — formatos + items append */}
                  {exportConfig && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ToolbarToolButton
                          icon={<Download />}
                          label="Exportar"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {exportConfig.formats.map((fmt) => {
                          const isCsvDefault = fmt.id === "csv" && !fmt.onSelect;
                          if (!isCsvDefault) {
                            return (
                              <DropdownMenuItem
                                key={fmt.id}
                                onClick={fmt.onSelect}
                              >
                                {fmt.icon}
                                {fmt.label}
                              </DropdownMenuItem>
                            );
                          }
                          // CSV default: usa escopos internos
                          return (
                            <div key={fmt.id}>
                              {isServerMode ? (
                                <DropdownMenuItem onClick={() => exportHook.exportCsv("all")}>
                                  {fmt.icon}
                                  {fmt.label} — Página atual
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem onClick={() => exportHook.exportCsv("all")}>
                                    {fmt.icon}
                                    {fmt.label} — Todos
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => exportHook.exportCsv("filtered")}>
                                    {fmt.icon}
                                    {fmt.label} — Filtrados
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => exportHook.exportCsv("selected")}
                                disabled={selection.selectedCount === 0}
                              >
                                {fmt.icon}
                                {fmt.label} — Selecionados ({selection.selectedCount})
                              </DropdownMenuItem>
                            </div>
                          );
                        })}
                        {exportConfig.items.length > 0 && (
                          <>
                            <DropdownMenuItem disabled className="opacity-50">
                              ───
                            </DropdownMenuItem>
                            {exportConfig.items.map((it) => (
                              <DropdownMenuItem
                                key={it.id}
                                onClick={it.onSelect}
                                disabled={it.disabled}
                              >
                                {it.icon}
                                {it.label}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* MoreMenu — ⋯ padrao com items custom */}
                  {toolbarConfig.moreMenu?.items?.length ? (
                    <MoreMenu
                      trigger={
                        <ToolbarToolButton
                          icon={<MoreHorizontal />}
                          aria-label="Mais opções"
                        />
                      }
                    >
                      {toolbarConfig.moreMenu.items.map((it) => (
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
                  ) : null}

                  {/* Legacy slot — deprecated, mantem pra compat */}
                  {toolbarConfig.customActions}
                </div>

                {/* Mobile/laptop pequeno — dropdown único agrupando os controles
                   secundários colapsados. Ativo em viewports <xl (1280px), pq a
                   partir dali a toolbar começa a quebrar em multi-linha. Sections
                   (Visualização / Organizar / Mais ações) usam ToolbarMobileSection
                   do DS. Popovers (Sort/Cols) abrem via portal sobre o dialog —
                   Radix gerencia stacking. */}
                <ToolbarMobileDialog desktopBreakpoint="xl">
                  {/* Visualização — density (sempre <xl) + view toggle (só em <md
                     pq em md-xl o view toggle já aparece no toolbar via slot left). */}
                  {(toolbarConfig.enableDensity !== false || resolvedViewToggle) && (
                    <ToolbarMobileSection title="Visualização">
                      {toolbarConfig.enableDensity !== false && (
                        <ToolbarSegmented
                          fluid
                          value={density.density}
                          onValueChange={(v) =>
                            density.setDensity(v as TableDensity)
                          }
                          items={props.densityItems ?? DENSITY_ITEMS}
                          ariaLabel="Densidade da tabela"
                        />
                      )}
                      {/* View mode toggle — só em <md (em md-xl aparece no toolbar `left`).
                         Default (kanban auto): items custom com icon + texto e fluid.
                         Consumer-provided override usa resolvedViewToggle direto. */}
                      {resolvedViewToggle && (
                        <div className="md:hidden">
                          {props.kanbanConfig && props.toolbar?.viewToggle === undefined ? (
                            <ToolbarSegmented
                              fluid
                              value={viewMode}
                              onValueChange={handleViewModeChange}
                              items={MOBILE_VIEW_MODE_ITEMS}
                              ariaLabel="Modo de visualização"
                            />
                          ) : (
                            resolvedViewToggle
                          )}
                        </div>
                      )}
                    </ToolbarMobileSection>
                  )}

                  {/* Organizar — sort + cols (triggers fullWidth, popover abre via portal) */}
                  <ToolbarMobileSection title="Organizar">
                    <SortPopover
                      columns={sortPopoverColumns}
                      sortBy={sortPopoverCriteria}
                      onSortByChange={handleSortChange}
                      trigger={
                        <Button
                          color="secondary"
                          variant="outline"
                          size="md"
                          fullWidth
                          iconLeft={<ArrowUpDown />}
                          className="justify-start"
                        >
                          Ordenar
                          {sortPopoverCriteria.length > 0 && (
                            <span className="ml-auto text-fg-muted">
                              {sortPopoverCriteria.length}
                            </span>
                          )}
                        </Button>
                      }
                    />
                    {toolbarConfig.enableColumns !== false && (
                      <ColsPopover
                        columns={colsPopoverColumns}
                        visibleCols={visibleColsSet}
                        onVisibleChange={handleVisibleChange}
                        pinnedCols={pinnedColsSet}
                        onPinnedChange={handlePinnedChange}
                        onColumnsReorder={handleColumnsReorder}
                        trigger={
                          <Button
                            color="secondary"
                            variant="outline"
                            size="md"
                            fullWidth
                            iconLeft={<Columns />}
                            className="justify-start"
                          >
                            Colunas
                          </Button>
                        }
                      />
                    )}
                  </ToolbarMobileSection>

                  {/* Mais ações — refresh (só <md) + export + moreMenu agrupado */}
                  {(toolbarConfig.enableRefresh !== false ||
                    exportConfig ||
                    toolbarConfig.moreMenu?.items?.length) && (
                    <ToolbarMobileSection title="Mais ações">
                      {toolbarConfig.enableRefresh !== false && (
                        <Button
                          color="secondary"
                          variant="outline"
                          size="md"
                          fullWidth
                          iconLeft={
                            <RefreshCw
                              className={isRefreshing ? "animate-spin" : ""}
                            />
                          }
                          onClick={handleRefresh}
                          className="md:hidden justify-start"
                        >
                          Atualizar
                        </Button>
                      )}
                      {exportConfig && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              color="secondary"
                              variant="outline"
                              size="md"
                              fullWidth
                              iconLeft={<Download />}
                              className="justify-start"
                            >
                              Exportar
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {exportConfig.formats.map((fmt) => {
                              const isCsvDefault = fmt.id === "csv" && !fmt.onSelect;
                              if (!isCsvDefault) {
                                return (
                                  <DropdownMenuItem
                                    key={fmt.id}
                                    onClick={fmt.onSelect}
                                  >
                                    {fmt.icon}
                                    {fmt.label}
                                  </DropdownMenuItem>
                                );
                              }
                              return (
                                <div key={fmt.id}>
                                  {isServerMode ? (
                                    <DropdownMenuItem onClick={() => exportHook.exportCsv("all")}>
                                      {fmt.icon}
                                      {fmt.label} — Página atual
                                    </DropdownMenuItem>
                                  ) : (
                                    <>
                                      <DropdownMenuItem onClick={() => exportHook.exportCsv("all")}>
                                        {fmt.icon}
                                        {fmt.label} — Todos
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => exportHook.exportCsv("filtered")}>
                                        {fmt.icon}
                                        {fmt.label} — Filtrados
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => exportHook.exportCsv("selected")}
                                    disabled={selection.selectedCount === 0}
                                  >
                                    {fmt.icon}
                                    {fmt.label} — Selecionados ({selection.selectedCount})
                                  </DropdownMenuItem>
                                </div>
                              );
                            })}
                            {exportConfig.items.length > 0 && (
                              <>
                                <DropdownMenuItem disabled className="opacity-50">
                                  ───
                                </DropdownMenuItem>
                                {exportConfig.items.map((it) => (
                                  <DropdownMenuItem
                                    key={it.id}
                                    onClick={it.onSelect}
                                    disabled={it.disabled}
                                  >
                                    {it.icon}
                                    {it.label}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {/* MoreMenu — items reagrupados num único trigger "..." fullWidth.
                         Dropdown abre via portal sobre o dialog (Radix gerencia stacking)
                         em vez de explodir cada item como Button (pode crescer demais). */}
                      {toolbarConfig.moreMenu?.items?.length ? (
                        <MoreMenu
                          trigger={
                            <Button
                              color="secondary"
                              variant="outline"
                              size="md"
                              fullWidth
                              iconLeft={<MoreHorizontal />}
                              className="justify-start"
                            >
                              Mais ações
                            </Button>
                          }
                        >
                          {toolbarConfig.moreMenu.items.map((it) => (
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
                      ) : null}
                    </ToolbarMobileSection>
                  )}
                </ToolbarMobileDialog>
              </>
            }
            bulkBar={
              selectionConfig.enabled && selection.selectedCount > 0 ? (
                <BulkActionsBar
                  count={selection.selectedCount}
                  onClear={selection.clear}
                >
                  {selectionConfig.actions?.(selection.selectedIds, selection.clear)}
                </BulkActionsBar>
              ) : undefined
            }
          />
          {/* Applied filter chips — agrupados por field+operator, clicaveis via renderChip → Popover.
              `pendingOpenId` deixa ToolbarApplied controlar visual de "abrir auto" sem
              o DataTable precisar saber qual chip está pendente (state mora no toolbar). */}
          <ToolbarApplied
            filters={appliedFilters}
            onRemove={removeGroup}
            onClearAll={filters.clearFilters}
            pendingOpenId={pendingOpenChipKey}
            onPendingOpenIdChange={setPendingOpenChipKey}
            renderChip={(f, defaultChip, isPendingOpen) => {
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
                  (col?.filterType === "select" && (col?.filterOptions?.length ?? 0) > 0));
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
              return (
                <Popover
                  open={isPendingOpen || undefined}
                  onOpenChange={(o) => {
                    if (o) return;
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
                        items: filters.filterModel.items.filter((it) => !ids.has(it.id)),
                      });
                    }
                  }}
                >
                  <PopoverTrigger asChild>{defaultChip}</PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    {def.renderFastFilterInput({
                      value: currentValue as never,
                      onChange: (v) => updateGroupValue(group.key, v),
                      options,
                    })}
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          props.renderLoading ?? <DataTableLoading />
        ) : isKanban ? (
          // Kanban gerencia seu próprio empty state interno (coluna sem cards).
          // Filter/search/sort/selection já estão aplicados via rowsAllPagesProcessed.
          <Kanban
            columns={kanbanView.columns}
            cards={kanbanView.cards}
            // Selection (bridge)
            selectedIds={kanbanSelectedIds}
            onToggleSelect={
              kanbanSelectedIds ? kanbanToggleSelect : undefined
            }
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
              kanbanGetCardMenuItems ? undefined : props.kanbanConfig?.onCardMenu
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
        ) : isDataEmpty ? (
          props.renderEmpty ?? <DataTableEmpty />
        ) : isNoResults ? (
          props.renderNoResults ?? (
            <DataTableNoResults
              onClearFilters={() => {
                filters.setFilterModel({ items: [], logicOperator: "AND" });
                search.setInputValue("");
              }}
            />
          )
        ) : isCardMode ? (
          cardBody
        ) : (
          tableBody
        )}

        {/* Footer (paginação) — só na view table.
           Durante loading mostra skeleton no lugar (mesma silhueta) pra
           evitar paginação "1 página" enquanto fetchData responde. */}
        {!isKanban && paginationConfig.enabled !== false && (
          isLoading ? (
            <div className={styles.footerWrap()}>
              <FooterTableSkeleton />
            </div>
          ) : !isDataEmpty && (
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
        )}
      </div>
    </DataTableProvider>
  );
}

type DataTableComponent = <T>(
  props: DataTableProps<T> & { ref?: Ref<DataTableRef> },
) => React.ReactElement;

export const DataTable = forwardRef(DataTableInternal) as DataTableComponent;
