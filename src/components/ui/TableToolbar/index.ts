/* ── Root (v2 opinativo) ──────────────────────────────────────── */
export { TableToolbar } from "./table-toolbar";
export type { TableToolbarProps } from "./table-toolbar";

/* ── Parts ────────────────────────────────────────────────────── */
export { ToolbarSearch } from "./parts/toolbar-search";
export type { ToolbarSearchProps } from "./parts/toolbar-search";

export { ToolbarDivider } from "./parts/toolbar-divider";
export type { ToolbarDividerProps } from "./parts/toolbar-divider";

export { ToolbarSegmented } from "./parts/toolbar-segmented";
export type { ToolbarSegmentedProps } from "./parts/toolbar-segmented";

export { ToolbarTabs } from "./parts/toolbar-tabs";
export type { ToolbarTabsProps } from "./parts/toolbar-tabs";

export {
  ToolbarToolButton,
  ToolbarSaveButton,
} from "./parts/toolbar-tool-button";
export type {
  ToolbarToolButtonProps,
  ToolbarSaveButtonProps,
} from "./parts/toolbar-tool-button";

export { ToolbarApplied } from "./parts/toolbar-applied";
export type { ToolbarAppliedProps } from "./parts/toolbar-applied";

/**
 * Mobile collapse pattern — consumido pelo `<DataTable>` automaticamente
 * (controles secundários colapsam em viewports < md). Também disponível
 * pra `<TableToolbar>` custom: usar `ToolbarMobileDialog` como icon button
 * trigger e `ToolbarMobileSection` pra agrupar items dentro do dialog.
 *
 * `ToolbarMobileSheet` é alias legado de `ToolbarMobileDialog` (mesmo componente).
 */
export {
  ToolbarMobileDialog,
  ToolbarMobileSheet,
  ToolbarMobileSection,
} from "./parts/toolbar-mobile-sheet";
export type {
  ToolbarMobileDialogProps,
  ToolbarMobileSheetProps,
  ToolbarMobileSectionProps,
} from "./parts/toolbar-mobile-sheet";

export { BulkActionsBar, BulkActionButton } from "./parts/bulk-actions-bar";
export type {
  BulkActionsBarProps,
  BulkActionButtonProps,
} from "./parts/bulk-actions-bar";

/* ── Types compartilhados ────────────────────────────────────── */
export type {
  ToolbarSegmentedItem,
  ToolbarTab,
  AppliedFilter,
  AppliedFilterOp,
  SortDirection,
} from "./table-toolbar.types";

/* ── Popovers (Fase 2) ───────────────────────────────────────── */
export {
  MoreMenu,
  MoreMenuItem,
  MoreMenuCheckboxItem,
  MoreMenuRadioGroup,
  MoreMenuRadioItem,
  MoreMenuSeparator,
  MoreMenuLabel,
} from "./popovers/more-menu";
export type { MoreMenuProps } from "./popovers/more-menu";

export { ColsPopover, ColsPanel } from "./popovers/cols-popover";
export type {
  ColsPopoverProps,
  ColsPanelProps,
  ColsPopoverColumn,
} from "./popovers/cols-popover";

export { SortPopover, SortPanel } from "./popovers/sort-popover";
export type {
  SortPopoverProps,
  SortPanelProps,
  SortPopoverColumn,
  SortPopoverCriterion,
} from "./popovers/sort-popover";

export { ViewsPopover } from "./popovers/views-popover";
export type {
  ViewsPopoverProps,
  ViewsPopoverView,
} from "./popovers/views-popover";

export { AddViewModal } from "./popovers/add-view-modal";
export type {
  AddViewModalProps,
  AddViewModalSubmit,
} from "./popovers/add-view-modal";

export { TableToolbarViews } from "./parts/table-toolbar-views";
export type {
  TableToolbarViewsProps,
  TableToolbarViewsItem,
} from "./parts/table-toolbar-views";

export {
  FilterPopover,
  FilterPanel,
  isFilterEntryActive,
  DEFAULT_FILTER_OPERATORS,
} from "./popovers/filter-popover";
export type {
  FilterPopoverProps,
  FilterPanelProps,
  FilterPopoverColumn,
  FilterPopoverOperator,
  FilterPopoverEntry,
} from "./popovers/filter-popover";

/* ── Settings menu (drill-down v2) ──────────────────────────────
 * Menu "Configurações da tabela" com navegação em níveis. Reaproveita
 * SortPanel/ColsPanel/FilterPanel via render-prop (recebe onBack).
 */
export { ToolbarSettingsMenu } from "./parts/toolbar-settings-menu";
export type {
  ToolbarSettingsMenuProps,
  ToolbarSettingsMenuView,
} from "./parts/toolbar-settings-menu";

/* ── Hooks opcionais ──────────────────────────────────────────── */
export { useToolbarFilters } from "./hooks/use-toolbar-filters";
export type {
  ToolbarFilterEntry,
  UseToolbarFiltersOptions,
  UseToolbarFiltersResult,
} from "./hooks/use-toolbar-filters";

export { useToolbarSort } from "./hooks/use-toolbar-sort";
export type {
  ToolbarSortEntry,
  UseToolbarSortOptions,
  UseToolbarSortResult,
} from "./hooks/use-toolbar-sort";

export { useToolbarFilterControl } from "./hooks/use-toolbar-filter-control";
export type { UseToolbarFilterControlResult } from "./hooks/use-toolbar-filter-control";

/* ── Filter Control built-in (v0.7.0+) ──────────────────────────
 * Orquestrador completo de filtros (split button + drawer + advanced popover).
 * DataTable usa internamente; consumers de TableToolbar standalone podem
 * instanciar diretamente passando columns + filterModel + handlers.
 */
export { ToolbarFilterControl } from "./parts/toolbar-filter-control";
export type { ToolbarFilterControlProps } from "./parts/toolbar-filter-control";

export { ToolbarSimpleFilterDrawer } from "./parts/toolbar-simple-filter-drawer";
export type { ToolbarSimpleFilterDrawerProps } from "./parts/toolbar-simple-filter-drawer";
