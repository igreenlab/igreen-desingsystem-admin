/**
 * Barrel raiz dos componentes — entry point do pacote @snksergio/design-system
 *
 * Cada componente UI iGreen é re-exportado por wildcard a partir do barrel
 * local em ui/<Nome>/index.ts. Mudanças nos barrels locais propagam aqui sem
 * intervenção manual.
 *
 * Shadcn adapted: re-exportado seletivamente abaixo.
 */

/* ── iGreen UI components (custom, tv()) ────────────────────────── */
export * from "./ui/AlertModal";
export * from "./ui/AppShell";
export * from "./ui/Avatar";
export * from "./ui/Button";
export * from "./ui/ButtonGroup";
export * from "./ui/CardCheckbox";
export * from "./ui/Chip";
export * from "./ui/ColorPicker";
export * from "./ui/Combobox";
export * from "./ui/DataTable";
export * from "./ui/FileUploadField";
export * from "./ui/FloatingPanel";
export * from "./ui/FooterTable";
export * from "./ui/FormField";
export * from "./ui/Header";
export * from "./ui/Icon";
export * from "./ui/Kanban";
export * from "./ui/MenuSidebar";
export * from "./ui/MessageVariablesPicker";
export * from "./ui/Modal";
export * from "./ui/PageHeader";
export * from "./ui/Panel";
export * from "./ui/Table";
export * from "./ui/TabelaTeste";

/**
 * TableToolbar: re-exporta tudo, mas renomeia SortDirection para evitar
 * colisão com Table (Table.SortDirection = "asc" | "desc" | null vs.
 * TableToolbar.SortDirection = "asc" | "desc").
 */
export {
  TableToolbar,
  ToolbarSearch,
  ToolbarDivider,
  ToolbarSegmented,
  ToolbarTabs,
  ToolbarToolButton,
  ToolbarSaveButton,
  ToolbarApplied,
  ToolbarMobileDialog,
  ToolbarMobileSheet,
  ToolbarMobileSection,
  BulkActionsBar,
  BulkActionButton,
  MoreMenu,
  MoreMenuItem,
  MoreMenuCheckboxItem,
  MoreMenuRadioGroup,
  MoreMenuRadioItem,
  MoreMenuSeparator,
  MoreMenuLabel,
  ColsPopover,
  ColsPanel,
  SortPopover,
  SortPanel,
  ViewsPopover,
  AddViewModal,
  TableToolbarViews,
  FilterPopover,
  FilterPanel,
  isFilterEntryActive,
  DEFAULT_FILTER_OPERATORS,
  ToolbarFilterControl,
  ToolbarSettingsMenu,
  ToolbarSimpleFilterDrawer,
  useToolbarFilters,
  useToolbarSort,
  useToolbarFilterControl,
} from "./ui/TableToolbar";
export type {
  TableToolbarProps,
  ToolbarSearchProps,
  ToolbarDividerProps,
  ToolbarSegmentedProps,
  ToolbarSegmentedItem,
  ToolbarTabsProps,
  ToolbarTab,
  ToolbarToolButtonProps,
  ToolbarSaveButtonProps,
  ToolbarAppliedProps,
  ToolbarMobileDialogProps,
  ToolbarMobileSheetProps,
  ToolbarMobileSectionProps,
  BulkActionsBarProps,
  BulkActionButtonProps,
  AppliedFilter,
  AppliedFilterOp,
  SortDirection as ToolbarSortDirection,
  MoreMenuProps,
  ColsPopoverProps,
  ColsPopoverColumn,
  SortPopoverProps,
  SortPopoverColumn,
  SortPopoverCriterion,
  ViewsPopoverProps,
  ViewsPopoverView,
  AddViewModalProps,
  AddViewModalSubmit,
  TableToolbarViewsProps,
  TableToolbarViewsItem,
  FilterPopoverProps,
  FilterPanelProps,
  FilterPopoverColumn,
  FilterPopoverOperator,
  FilterPopoverEntry,
  ToolbarFilterEntry,
  ColsPanelProps,
  SortPanelProps,
  ToolbarFilterControlProps,
  ToolbarSettingsMenuProps,
  ToolbarSettingsMenuView,
  ToolbarSimpleFilterDrawerProps,
  UseToolbarFilterControlResult,
  UseToolbarFiltersOptions,
  UseToolbarFiltersResult,
  ToolbarSortEntry,
  UseToolbarSortOptions,
  UseToolbarSortResult,
} from "./ui/TableToolbar";

/* ── Shadcn adapted (DS tokens) ─────────────────────────────────── */
export { Badge, badgeVariants } from "./shadcn";
export type { BadgeProps, BadgeVariantProps } from "./shadcn";
export { Input, inputVariants } from "./shadcn";
export type { InputProps, InputVariantProps, InputState } from "./shadcn";

export {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from "./shadcn";
export { inputGroupVariants } from "./shadcn";
export type {
  InputGroupProps,
  InputGroupVariantProps,
  InputGroupInputProps,
  InputGroupTextareaProps,
  InputGroupAddonProps,
  InputGroupAddonAlign,
  InputGroupTextProps,
  InputGroupButtonProps,
  InputGroupState,
} from "./shadcn";
