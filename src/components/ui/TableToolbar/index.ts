/* ── Root ─────────────────────────────────────────────────────── */
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

export { ColsPopover } from "./popovers/cols-popover";
export type {
  ColsPopoverProps,
  ColsPopoverColumn,
} from "./popovers/cols-popover";

export { SortPopover } from "./popovers/sort-popover";
export type {
  SortPopoverProps,
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
  DEFAULT_FILTER_OPERATORS,
} from "./popovers/filter-popover";
export type {
  FilterPopoverProps,
  FilterPopoverColumn,
  FilterPopoverOperator,
  FilterPopoverEntry,
} from "./popovers/filter-popover";

/* ── Hooks opcionais ──────────────────────────────────────────── */
export { useToolbarFilters } from "./hooks/use-toolbar-filters";
export type {
  ToolbarFilterEntry,
  UseToolbarFiltersOptions,
} from "./hooks/use-toolbar-filters";

export { useToolbarSort } from "./hooks/use-toolbar-sort";
export type {
  ToolbarSortEntry,
  UseToolbarSortOptions,
} from "./hooks/use-toolbar-sort";
