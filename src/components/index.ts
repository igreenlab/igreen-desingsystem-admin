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
export * from "./ui/avatar-ig";
export * from "./ui/Breadcrumb";
export * from "./ui/Button";
export * from "./ui/ButtonGroup";
export * from "./ui/CardCheckbox";
export * from "./ui/CardOption";
export * from "./ui/Chip";
export * from "./ui/ColorPicker";
export * from "./ui/Combobox";
export * from "./ui/ConversationListItem";
export * from "./ui/DataTable";
export * from "./ui/DatePicker";
export * from "./ui/DateSeparatorChip";
export * from "./ui/EmptyState";
export * from "./ui/FileUploadField";
export * from "./ui/FloatingPanel";
export * from "./ui/FooterTable";
export * from "./ui/FormField";
export * from "./ui/Header";
export * from "./ui/Icon";
export * from "./ui/Kanban";
export * from "./ui/Kpi";
export * from "./ui/MarkdownText";
export * from "./ui/MenuSidebar";
export * from "./ui/MessageAck";
export * from "./ui/MessageBubble";
export * from "./ui/MessageComposer";
export * from "./ui/MessageVariablesPicker";
export * from "./ui/Modal";
export * from "./ui/MonthYearPicker";
export * from "./ui/PageHeader";
export * from "./ui/Panel";
export * from "./ui/Scheduler";
export * from "./ui/Gantt";
export * from "./ui/ScreenLoader";
export * from "./ui/SingleMenuSidebar";
export * from "./ui/Spinner";
export * from "./ui/Table";
export * from "./ui/TabsNavigation";
export * from "./ui/ChoroplethMap";
/**
 * Entraram no barrel em 0.37.0. Existiam desde antes e simplesmente nunca foram
 * exportados — o consumidor npm que fizesse `import { ChartContainer }` recebia
 * "not exported", enquanto a doc do canal npm anunciava "os 42 componentes ui/".
 * Eram 37. Nenhum conflita com os 445 nomes já exportados (conferido nome a nome).
 */
export * from "./ui/Chart";
export * from "./ui/DataList";
export * from "./ui/List";
export * from "./ui/Toast";
// TabelaTeste: demo interno (só no preview) — NÃO exportado no barrel público
// pra não vazar na lib npm. Use via src/preview/pages/TabelaTesteDoc.

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

/* ── Hooks de tema ────────────────────────────────────────────────────────────
 * Os únicos hooks exportados na lib. Existem porque escolher marca/modo é decisão
 * de RUNTIME do app consumidor — e a alternativa era ele reimplementar persistência
 * e sincronia entre abas na unha.
 *
 * `useBrand` aceita catálogo injetável (`useBrand({ brands })`): passe só as marcas
 * cujo overlay você importou, senão o seletor lista opções que não fazem nada —
 * `data-theme` com id sem CSS no bundle é no-op silencioso.
 *
 * ⚠️ O CSS NÃO vem daqui. O hook só escreve `data-theme` no `<html>`; os overlays
 * chegam por `@import "@snksergio/design-system/theme/brand-<id>.css"`. Guia completo
 * na página "Temas de marca" do catálogo.
 */
export { useBrand, BRANDS } from "../hooks/useBrand";
export type { Brand, BrandOption, UseBrandOptions } from "../hooks/useBrand";
export { useTheme } from "../hooks/useTheme";
export type { Theme } from "../hooks/useTheme";
