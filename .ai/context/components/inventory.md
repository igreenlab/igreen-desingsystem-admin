# Component inventory — iGreen DS

> Fonte de verdade sobre o que existe.
> Atualizar sempre que criar ou remover componente.
> Verificar aqui ANTES de criar qualquer componente novo.
> Última atualização: 2026-06-10 (v0.8.0 — auditoria docs/showcase)

---

## Estrutura de pastas

```
src/components/
├── shadcn/    ← Cenário 1: componentes Shadcn adaptados para tokens iGreen
├── ui/        ← Cenário 2: componentes iGreen (tv() + *.styles.ts)
│              ← Cenário 3: compostos (combinam shadcn + ui)
└── index.ts   ← barrel export de tudo
```

| Situação | Pasta | Command |
|----------|-------|---------|
| Componente existe no Shadcn | `shadcn/` | `/ds-add-shadcn` |
| Componente novo sem base no Shadcn | `ui/` | `/ds-create-component` |
| Composição de existentes (FormField, etc.) | `ui/` | `/ds-create-composite` |

---

## Componentes — shadcn/ (26 componentes)

| Componente | Arquivo | Subcomponentes exportados | Status |
|------------|---------|--------------------------|--------|
| Accordion | `shadcn/accordion.tsx` | Accordion, AccordionItem, AccordionTrigger, AccordionContent | ✅ implementado |
| Alert | `shadcn/alert.tsx` | Alert, AlertTitle, AlertDescription | ✅ implementado |
| AlertDialog | `shadcn/alert-dialog.tsx` | AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel | ✅ implementado |
| Avatar | `shadcn/avatar.tsx` | Avatar, AvatarImage, AvatarFallback | ✅ implementado |
| Badge | `shadcn/badge.tsx` | Badge | ✅ implementado |
| Breadcrumb | `shadcn/breadcrumb.tsx` | Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis | ✅ implementado |
| Calendar | `shadcn/calendar.tsx` | Calendar | ✅ implementado |
| Card | `shadcn/card.tsx` | Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent | ✅ implementado |
| Checkbox | `shadcn/checkbox.tsx` | Checkbox | ✅ implementado |
| Command | `shadcn/command.tsx` | Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator | ✅ implementado |
| Dialog | `shadcn/dialog.tsx` | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose | ✅ implementado |
| DropdownMenu | `shadcn/dropdown-menu.tsx` | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup | ✅ implementado |
| Input | `shadcn/input.tsx` | Input | ✅ implementado |
| InputGroup | `shadcn/input-group.tsx` | InputGroup, InputGroupInput, InputGroupTextarea, InputGroupAddon, InputGroupText, InputGroupButton | ✅ implementado |
| Label | `shadcn/label.tsx` | Label | ✅ implementado |
| Pagination | `shadcn/pagination.tsx` | Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationFirst, PaginationLast, PaginationEllipsis | ✅ implementado |
| Popover | `shadcn/popover.tsx` | Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent | ✅ implementado |
| Progress | `shadcn/progress.tsx` | Progress | ✅ implementado |
| RadioGroup | `shadcn/radio-group.tsx` | RadioGroup, RadioGroupItem | ✅ implementado |
| Select | `shadcn/select.tsx` | Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectValue, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton | ✅ implementado |
| Separator | `shadcn/separator.tsx` | Separator | ✅ implementado |
| Sheet | `shadcn/sheet.tsx` | Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription | ✅ implementado |
| Slider | `shadcn/slider.tsx` | Slider | ✅ implementado |
| Switch | `shadcn/switch.tsx` | Switch | ✅ implementado |
| Tabs | `shadcn/tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent | ✅ implementado |
| Textarea | `shadcn/textarea.tsx` | Textarea | ✅ implementado |

---

## Componentes — ui/ (iGreen puro) (20 componentes)

| Componente | Styles | Pasta | Status |
|------------|--------|-------|--------|
| AlertModal | `ui/AlertModal/alert-modal.styles.ts` | `src/components/ui/AlertModal/` | ✅ implementado — modal de confirmação destrutiva com tone semântico (danger/warning/success/neutral) |
| AppShell | `ui/AppShell/app-shell.styles.ts` | `src/components/ui/AppShell/` | ✅ implementado — template de aplicação completo: MenuSidebar (rail + panel) + Header sticky + body com slot livre |
| Avatar | `ui/Avatar/avatar.styles.ts` | `src/components/ui/Avatar/` | ✅ implementado |
| Button | `ui/Button/button.styles.ts` | `src/components/ui/Button/` | ✅ implementado |
| **ButtonGroup** | `ui/ButtonGroup/button-group.styles.ts` | `src/components/ui/ButtonGroup/` | ✅ **v0.7.0** — split button pattern (compound `<Primary>` + `<Chevron>`). Wrapper inline-flex com radius colapsado entre slots, Chevron quadrado (size-form-*) alinhando com altura do Primary. color/variant/size propagam via Context; override individual permitido. ChevronDown default; customizável via `icon` prop. `aria-label` obrigatório no Chevron. Uso atual: split do botão Filtros do DataTable (Primary=SimpleFilter / Chevron=advanced query builder) |
| **CardCheckbox** | `ui/CardCheckbox/card-checkbox.styles.ts` | `src/components/ui/CardCheckbox/` | ✅ **v0.7.1** — checkbox apresentado como card clicável (área grande, label + description visíveis). Mesma estética dos radio cards (bg-success-muted + border-brand no selected). Diferente de `FormFieldCheckbox` (compact horizontal). Props: `label` + `description` + opcional `icon` à esquerda. Toggle via clique no card inteiro (label htmlFor). Uso atual: SacarDialog aba "Outra conta" — opção "Salvar essa conta pra usar depois" |
| Chip | `ui/Chip/chip.styles.ts` | `src/components/ui/Chip/` | ✅ implementado — pílula compacta para status, tags e filtros, dual-mode (span estático ou button interativo); inclui `ChipGroup`/`ChipGroupItem` |
| FooterTable | — (classes inline em `footer-table.tsx`, sem `.styles.ts`) | `src/components/ui/FooterTable/` | ✅ implementado — footer de tabela com paginação + page-size select + range display + selection count (embutido no DataTable) |
| FormField | `ui/FormField/form-field.styles.ts` | `src/components/ui/FormField/` | ✅ implementado — container de form com label + input/select/textarea + mensagem de validação (error/warning/success). **Obrigatório em forms (L-023)** |
| Header | `ui/Header/header.styles.ts` | `src/components/ui/Header/` | ✅ implementado — barra superior fixa (60px) com breadcrumb à esquerda + search/theme/notifications/messages/user à direita |
| Kanban | `ui/Kanban/kanban.styles.ts` | `src/components/ui/Kanban/` | ✅ implementado — primitive dumb (recebe `columns` + `cards` via props) que renderiza board horizontal de estágios; state de domínio controlado externamente |
| Chart | `ui/Chart/chart.tsx` | `src/components/ui/Chart/` | ✅ implementado — wrapper sobre Recharts 3: `ChartContainer` (injeta paleta `--color-chart-1..5` via CSS vars escopadas) + `ChartTooltip`/`ChartTooltipContent` + `ChartLegend`/`ChartLegendContent`, estilizados com tokens iGreen. Sem `.styles.ts` (CSS vars + classes utilitárias). Doc: `chart-area` (demais tipos em breve) |
| MenuSidebar | `ui/MenuSidebar/sidebar.styles.ts` | `src/components/ui/MenuSidebar/` | ✅ implementado — sidebar composto: rail 64px (ícones de contexts) + panel 264px (items do context ativo, colapsável) |
| Modal | `ui/Modal/modal.styles.ts` | `src/components/ui/Modal/` | ✅ implementado — dialog modal centrado com header (icon + title + description), body livre e footer com actions |
| Panel | `ui/Panel/panel.styles.ts` | `src/components/ui/Panel/` | ✅ implementado — drawer flutuante lateral (right/left/top/bottom), 560px com header + body scrollável + footer sticky |
| Table | `ui/Table/table.styles.ts` | `src/components/ui/Table/` | ✅ implementado |
| DataTable | `ui/DataTable/data-table.styles.ts` | `src/components/ui/DataTable/` | ✅ implementado: client+server, persist localStorage, Saved Views + presets, Column Menu, ColumnTypeRegistry com 15 tipos extensiveis, Chips agrupados (OR implicito), modal Filtros Visual+Avancado com parser SQL. **v0.3.0**: auto-card mode em mobile (`cardBreakpoint`), toolbar responsiva (controles secundários colapsam em <xl via `ToolbarMobileDialog`), `FooterTableSkeleton` durante `isLoading`, coluna `actions` polish (sem ícone/border). **v0.6.0**: harden filters (auto-promote operator escalar→multi, normalize legacy, 5 operators novos), `showEmptyFilterChips` opt-in pra chips placeholder pré-ativos. **v0.7.0**: prop `simpleFilter` opt-IN — split button via `<ToolbarFilterControl>` (TableToolbar nativo) com drawer simple lateral (Primary) + advanced popover (Chevron). Default OFF mantém botão único legado. **Toolbar**: usa a `<TableToolbar>` opinativa (única — a `TableToolbarDeprecated` dumb legada foi removida) |
| **TableToolbar** | `ui/TableToolbar/table-toolbar.styles.ts` | `src/components/ui/TableToolbar/` | ✅ **toolbar padrão (opinativa)** — slots semânticos em ordem fixa (viewToggle · savedViews · refresh · search · filter · settings · more · bulkBar). Lado direito: Busca + Filtros (drawer simple) + **Configurações** (`<ToolbarSettingsMenu>`, drill-down via Popover espelhando o DropdownMenu: Ordenação/Colunas/Filtros avançados + Densidade inline) + Opções ⋯. Mobile = visualização-only (esconde left+refresh; search fluido; Visualização+Visões inline no settings). Consumida automaticamente pelo DataTable. Superset do barrel antigo (exporta todos os parts/popovers/types + ToolbarFilterControl). USAGE.md + DocPage (`TableToolbarDoc`) |
| **FloatingPanel** | `ui/FloatingPanel/floating-panel.styles.ts` | `src/components/ui/FloatingPanel/` | ✅ **v0.3.0** — drawer non-modal (sem backdrop, sem foco trap), resize horizontal opcional, maximize toggle, sheet bottom-up em max-md. Suporta `titleSlot` ReactNode pra header rico, `headerActions` à direita. **v0.8.1**: `bodyPadded` (default `true` — padding interno padrão) + compounds `FloatingPanelSection` (colapsável) / `FloatingPanelField` (label:valor) = pattern canônico de detail panel; use `bodyPadded={false}` com sections |
| **PageHeader** | `ui/PageHeader/page-header.styles.ts` | `src/components/ui/PageHeader/` | ✅ **v0.3.0** (Templates) — title + description + badge + actions + slot `children` (tabs/filtros). Mobile-ready built-in (`hideTextOnMobile` default true, `fluidPrimaryOnMobile` default true) |
| TabelaTeste | `ui/TabelaTeste/tabela-teste.styles.ts` | `src/components/ui/TabelaTeste/` | ⚠️ demo interno (exportado no barrel por compat — não usar em apps) — réplica visual hardcoded do sandbox `/design-and-table-v2`; em produção usar `<Table>` ou `<DataTable>` |

**Nota**: `AddViewModal` (modes create/edit) e `TableToolbarViews` (compound com Default tab + Tabs visiveis + Popover overflow + modal) ficam em `ui/TableToolbar/`. Saved Views eh UI do toolbar — DataTable so passa props/handlers. `ToolbarMobileDialog` + `ToolbarMobileSection` (em `ui/TableToolbar/parts/`) foram promovidos a uso oficial pelo DataTable em v0.3.0 (não-deprecated mais).

**v0.7.0 — TableToolbar dono dos filtros**: novo `<ToolbarFilterControl>` em `ui/TableToolbar/parts/toolbar-filter-control.tsx` é o orquestrador único de filtros (split button + drawer simple + advanced popover). Composto por `<ToolbarSimpleFilterDrawer>` (parts/) + `<ButtonGroup>` (ui/) + `<FilterPopover>` (popovers/). Hook isolado `useToolbarFilterControl` (hooks/) gerencia state. DataTable consome via uma única instanciação — não monta mais ButtonGroup/Drawer/Popover manualmente. Coupling aceita TableToolbar → DataTable (`columnTypeRegistry`, `FilterModel` types) — mesmo pattern do `<FilterPopover>` que já importava `ColumnOption`. Coupling reverso (DataTable → TableToolbar) **continua proibido**.

---

## Variantes e API por componente

### Avatar (ui/)
```
size:     xs (20px) | sm (24px) | md (28px) | lg (32px) | xl (40px)
color:    brand | success | warning | critical | info | muted
colorHex: string (hex override — bg via inline style, text-white)
```
- Non-interactive (no focus, no disabled).
- Accessibility: `aria-label` present → `role="img"`, absent → `aria-hidden="true"`.
- Fonte de verdade: `src/components/ui/Avatar/avatar.styles.ts`

### Button (ui/)
```
color:     primary | secondary | critical | success | warning
variant:   filled | outline | soft | ghost
size:      xxs (28px) | xs (32px) | sm (36px) | md (40px)
fullWidth: boolean
disabled:  boolean
```
- Focus: Padrão 1 estático — `focus-visible:ring-4 ring-ring-{color}`
- Fonte de verdade: `src/components/ui/Button/button.styles.ts`

### Badge (shadcn/)
```
color:   primary | secondary | critical | success | warning
variant: filled | outline | soft | ghost
size:    sm (20px) | md (24px) | lg (28px)
```
- Fonte de verdade: `src/components/shadcn/badge.tsx`

### Input (shadcn/)
```
size: xxs (28px) | xs (32px) | sm (36px) | md (40px)
```
- Focus: Padrão 2 animado — `ring-0 ring-ring-primary` base + `focus-visible:ring-4`
- Fonte de verdade: `src/components/shadcn/input.tsx`

### Tabs (shadcn/)
```
Radix Root/List/Trigger/Content
```
- TabsList: `h-9 rounded-full bg-bg-muted`
- Fonte de verdade: `src/components/shadcn/tabs.tsx`

### Dialog (shadcn/)
```
Radix Root/Trigger/Content/Header/Footer/Title/Description/Close
```
- Overlay: `bg-overlay-scrim`
- Fonte de verdade: `src/components/shadcn/dialog.tsx`

### Select (shadcn/)
```
Radix Root/Trigger/Content/Item/Group/Label/Value/Separator
```
- Fonte de verdade: `src/components/shadcn/select.tsx`

### Accordion (shadcn/)
```
Radix Root/Item/Trigger/Content
type: single | multiple
collapsible: boolean
```
- Fonte de verdade: `src/components/shadcn/accordion.tsx`

### DropdownMenu (shadcn/)
```
Radix Root/Trigger/Content/Item/Label/Separator
Suporte: CheckboxItem, RadioItem, Sub menus
```
- Fonte de verdade: `src/components/shadcn/dropdown-menu.tsx`

### Checkbox (shadcn/)
```
Radix Root — checked | unchecked | indeterminate
```
- Fonte de verdade: `src/components/shadcn/checkbox.tsx`

### Switch (shadcn/)
```
Radix Root — checked | unchecked
```
- Thumb: `bg-white` fixo (exceção L-014)
- Fonte de verdade: `src/components/shadcn/switch.tsx`

### Slider (shadcn/)
```
Radix Root
value/defaultValue: number[] (1 ou 2 valores para range)
min, max, step
```
- Thumb: `bg-white` fixo (exceção L-014)
- Multi-thumb: render dinâmico (L-013)
- Fonte de verdade: `src/components/shadcn/slider.tsx`

### RadioGroup (shadcn/)
```
Radix Root/Item
```
- State via `data-state=checked` (não `:checked` nativo — L-012)
- Fonte de verdade: `src/components/shadcn/radio-group.tsx`

### Progress (shadcn/)
```
Radix Root — value: number (0-100)
```
- Fonte de verdade: `src/components/shadcn/progress.tsx`

### Textarea (shadcn/)
```
HTML textarea nativo
```
- Focus: Padrão 2 animado (mesma lógica do Input)
- Fonte de verdade: `src/components/shadcn/textarea.tsx`

### Card (shadcn/)
```
Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent
```
- Fonte de verdade: `src/components/shadcn/card.tsx`

### Avatar (shadcn/)
```
Radix Root/Image/Fallback
```
- Fonte de verdade: `src/components/shadcn/avatar.tsx`

### Label (shadcn/)
```
Radix Root — htmlFor obrigatório para acessibilidade
```
- Fonte de verdade: `src/components/shadcn/label.tsx`

### Separator (shadcn/)
```
Radix Root — orientation: horizontal | vertical
```
- Fonte de verdade: `src/components/shadcn/separator.tsx`

### Breadcrumb (shadcn/)
```
Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis
```
- Fonte de verdade: `src/components/shadcn/breadcrumb.tsx`

### Calendar (shadcn/)
```
react-day-picker — selected, onSelect, mode (single | range | multiple)
```
- Fonte de verdade: `src/components/shadcn/calendar.tsx`

### Table (ui/)
```
Componentes:
  Table          → root grid container (role="grid")
  TableHead      → sticky header rowgroup
  TableHeadCell  → columnheader com sort + resize
  TableBody      → rowgroup
  TableRow       → row com selected/clickable
  TableCell      → gridcell com width/pin/align/ellipsis
  TableCardRow   → card mode (consumer escolhe renderizar)

Variants:
  density:  compact (32px) | standard (40px) | comfortable (44px)
  sticky:   true (default) | false
  selected: true | false
  pinned:   left | right
  align:    left | center | right
  sortable: true | false
  sortDirection: asc | desc | null

Hooks expostos:
  useColumnWidths(columns)  → { widths, offsets, totalPinLeft, totalPinRight }
  useColumnResize(params)    → { onMouseDown, isDragging }
```
- Fonte de verdade: `src/components/ui/Table/table.styles.ts`

### DataTable (ui/)
```
Props principais:
  rows: T[]
  columns: DataTableColumnDef<T>[]
  toolbar:           { enableSearch, enableFilters, enableColumns, enableDensity, enableExport, customLeft, customActions }
  paginationConfig:  { enabled, initialPageSize, pageSizeOptions }
  selectionConfig:   { enabled, enableGlobal, actions }
  density:           controlled prop (TableDensity)
  sortModel/onSortModelChange:           controlled
  paginationModel/onPaginationModelChange: controlled
  selectionModel/onSelectionModelChange:   controlled
  filterModel/onFilterModelChange:         controlled
  search/onSearchChange:                   controlled
  onRowClick, onRowChange, getRowClassName
  renderEmpty/Loading/NoResults (slots default existem em parts/)
  className                                (pra max-h ativar scroll vertical interno)
  persistId?: string                        → opt-in localStorage persist (density/sort/cols/pageSize)
  savedViewsService?: SavedViewsService     → service trocavel (default: mock localStorage)

Hooks SRP internos (15 + 3 adapters):
  useDataTableQuery          → server mode fetcher (useEffect, request-id guard, refresh imperativo)
  useDataTableController     → agrega tudo + useImperativeHandle (refresh, getState, getSelectedIds, getSelectedCount, clearSelection, exportCsv, resetPersistedState)
                               → auto-detecta server mode via presença de `fetchData`
                               → hidrata persistedInitial via loadPersistedState(persistId)
                               → applyView(view) + saveCurrentAsView(name)
  useDataTableColumns        → widths/pin/hidden/order (composição de useColumnWidths) + applyColumnState batch + initial* props pra hidratação
  useDataTableSort           → ciclo asc/desc/null + initialSortModel
  useDataTablePagination     → {page, pageSize} + reset em filter/search + initialPageSize
  useDataTableSelection      → include/exclude model + togglePage + selectAll + indeterminate
  useDataTableDensity        → controlled/uncontrolled + initialDensity
  useDataTableSearch         → debounce 500ms via setTimeout
  useDataTableFilters        → FilterModel {items, logic}
  useDataTableProcessor      → client pipeline: filter→search→sort→paginate (useMemo cascateado)
  useDataTableExport         → CSV export via Blob (3 escopos: all, filtered, selected)
  useDataTableStatePersistence → save debounced (400ms) em localStorage; skip first render
  useDataTableSavedViews     → list no mount + saveView/deleteView via SavedViewsService + currentViewId + dev-warning em prod com mock
  useDataTableViewMode       → table/kanban controlled/uncontrolled
  useColumnAutoWidth         → ResizeObserver + rAF + bail-out de igualdade (auto-fit)
  + 3 adapters de popover (filter/sort/cols — ver "Adapters internos")

Parts default (parts/ — 13 arquivos):
  DataTableEmpty            → Inbox + texto
  DataTableLoading          → Loader2 spinner
  DataTableNoResults        → SearchX + texto
  DataTableRow              → row memoizada (React.memo) — barreira de re-render; props reativas por-row (selected/focused/expanded/editState) + handlers via latest-ref
  DataTableFloatingBulkBar  → bulk bar floating (alternativa ao bulkBar do TableToolbar)
  DataTableActionsCell      → célula da coluna `type: "actions"` — icon-buttons inline e/ou dropdown 3-pontos (showInMenu)
  DataTableColumnMenu       → menu 3-pontos no header da coluna: sort asc/desc/clear, pin left/right, hide
  DataTableEditCell         → editor inline pra células `editable: true` (default por editType ou `renderEdit` custom) — v0.8.0
  DataTableGroupHeaderRow   → header row de grupo: chevron + label + count badge + subtotais inline (grouping v0.8.0)
  DataTableGroupContentRow  → slot de conteúdo livre do grupo via `renderGroupContent` (grouping v0.8.0)
  DataTableRowExpansion     → painel de expansão por-row (v0.8.0)
  DataTableTotalizerRow     → footer row sticky com agregações por coluna (sum/avg/count/min/max ou fn custom) — v0.8.0
  DataTableSortableHeadCell → wrapper do TableHeadCell com drag-and-drop de colunas via @dnd-kit/sortable (column reorder; sortable-head-cell.tsx)
  (Saved Views UI delegada ao TableToolbarViews compound do TableToolbar, que agrega Tabs + ViewsPopover + AddViewModal)

Builders (builders/):
  column-builders.ts → textColumn/numberColumn/currencyColumn/emailColumn/phoneColumn/dateColumn/statusColumn/actionColumn/customColumn — factories de DataTableColumnDef
  preset-view.ts     → presetView() — factory de Saved View preset

Column types (column-types/):
  ColumnTypeRegistry + definitions/ com 15 tipos: badge, boolean, currency, date, datetime, email, multi-select, number, percentage, phone, select, tags, text, url, user

Context (context/):
  data-table-context.tsx → DataTableProvider + DataTableContextValue — readonly snapshot do estado (rows, effectiveColumns, widths/offsets/order/hidden/pinned, sortModel, paginationModel, selection, density, search, filterModel, getRowId)

Utils internos (utils/ — 7 arquivos):
  utils/filter-ops.ts        → genFilterId, filterValueIsEmpty, MULTI_VALUE_OPERATORS, promoteOperatorForColumn/ForFilterType (multiSelect⇒isAnyOf), defaultOperatorForFilterType (default vem do registry operators[0])
  utils/aggregate.ts         → computeAggregate + renderAggregate (sum/avg/count/min/max) — usado por totalizer + group header
  utils/resolve-value.ts     → getFieldValue/applyValueGetter/applyFormatter (dot-path) — fonte única
  utils/calculate-column-widths.ts → calculateColumnWidths + DEFAULT_COLUMN_WIDTH/CELL_PADDING_PX/DEFAULT_SAMPLE_SIZE (auto-fit por amostragem)
  utils/expand-rows.ts       → expandRows + isExpansionRow + ROW_EXPANSION_TYPE (row expansion)
  utils/group-rows.ts        → groupRows + isGroupRow/isGroupContent + GROUP_ROW_TYPE/GROUP_CONTENT_TYPE (grouping)
  utils/measure-text.ts      → measureTextWidth (canvas) — suporte ao auto-width
  data-table.constants.ts    → DEFAULT_CARD_BREAKPOINT, DENSITY_ROW_HEIGHT, DEFAULT_OVERSCAN, ACTIONS_COLUMN_WIDTH, MIN_REFRESH_SPINNER_MS

Services (F7):
  SavedViewsService (interface)  → list/save/delete (async) — trocável
  savedViewsMockService          → impl default usando localStorage (key prefix `igreen-datatable-views:`)

State persistence utils (F7):
  loadPersistedState(persistId)   → schema versionado (v1), retorna null se vazio/corrompido/version-mismatch
  savePersistedState(persistId, state) → JSON com version + try/catch silencioso
  clearPersistedState(persistId)  → remove entry

Adapters internos pros popovers existentes:
  FilterPopover  → vocabulário ÚNICO de operador (ids longos ponta a ponta, sem mapa curto↔longo); promoteOperatorForColumn (filter-ops) garante multiSelect⇒isAnyOf; label do chip via registry (opLabel)
  SortPopover    → SortPopoverCriterion[] ↔ SortModel (single sort)
  ColsPopover    → visibleCols Set + pinnedCols Set + onColumnsReorder
  ToolbarApplied → AppliedFilter[] com lookup label das filterOptions

Out of scope (planos seguintes):
  - Fast filters chips inline + applied bar (F6 — deprioritizado)
  - Export server-side endpoint (F8 cobre apenas client)
  - Modal Dialog custom no onCreate de saved views (atualmente usa window.prompt — produto pode trocar depois)
```
- Fonte de verdade: `src/components/ui/DataTable/data-table.tsx` (Maestro)

---

## Componentes planejados (não implementados)

| Componente | Tipo | Pasta | Prioridade |
|------------|------|-------|------------|
| Toast / Sonner | Shadcn | `shadcn/` | 🟡 média |
| Tooltip | Shadcn | `shadcn/` | 🟡 média |
| Skeleton | iGreen | `ui/` | 🟢 baixa — `FooterTableSkeleton` já existe pra footer da tabela; pattern pode ser extraído |

---

## FloatingPanel API (resumo) — v0.3.0

```
Props essenciais:
  open: boolean (required)
  onOpenChange: (open: boolean) => void
  side: "left" | "right"             # default "right"
  size: "sm"|"md"|"lg"|"xl" | number # default "md" (400px); número = px arbitrário
  title?: string
  description?: string
  titleSlot?: ReactNode              # substitui o bloco padrão (ex: avatar + nome + status)
  titleIcon?: LucideIcon
  headerActions?: ReactNode          # canto sup. direito antes do close
  hideClose?: boolean
  footer?: ReactNode
  resizable?: boolean
  resizableMinWidth: number          # default 320
  resizableMaxWidth: number          # default 800
  resizableStorageKey?: string       # localStorage opcional
  maximizable?: boolean
  defaultMaximized?: boolean
  closeOnEscape: boolean             # default true
  className?: string
  children: ReactNode (body, required)

Mobile (<md): vira sheet bottom-up automaticamente (slide-in-from-bottom + h-[85dvh])
Render: createPortal em document.body (escapa overflow/transform de ancestrais)
Hook auxiliar: useFloatingPanelResize(side, min, max, storageKey?)
```
- Fonte de verdade: `src/components/ui/FloatingPanel/floating-panel.tsx` + USAGE.md

---

## PageHeader API (resumo) — v0.3.0

```
Props:
  title?: string                     # h1 renderizado com text-title-lg
  description?: string               # text-body-sm fg-subtle, truncate
  badge?: ReactNode                  # geralmente Chip ao lado do title
  actions?: ReactNode                # buttons à direita
  children?: ReactNode               # slot extra abaixo (tabs/filtros)
  hideTextOnMobile: boolean          # default true (AppShell header já mostra título)
  fluidPrimaryOnMobile: boolean      # default true (último filho de actions ganha flex-1)
  className?: string
```
- Fonte de verdade: `src/components/ui/PageHeader/page-header.tsx` + USAGE.md
- Categoria: **Templates** (renderizado dentro do body do AppShell)

---

## AppShell API expandida (v0.3.0)

Adições à API anterior (props novas):

```
user?: AppShellUser                  # { name, email?, avatarSrc?, initials?, avatarColor? }
                                      # quando passado, renderiza UserMenu no avatar do rail
layout?: string                       # "fluid" (default) | "compact"
onLayoutChange?: (id: string) => void
layoutOptions?: AppShellLayoutOption[] # { id, label, icon: LucideIcon }
onSettings?: () => void               # callback "Configurações" no UserMenu
onLogout?: () => void                 # callback "Sair" no UserMenu
mobileEdgeToEdge?: boolean            # default false — zera padding mobile do body
```

Tipos exportados via `@/components/ui/AppShell`: `AppShellUser`, `AppShellLayoutOption`.

UserMenu (componente interno do AppShell) renderiza Avatar clicável → `DropdownMenu` com sections (header info + layout + tema + settings + logout). Submenus pra Layout e Tema usam `DropdownMenuSub`. Item selecionado nos radio groups usa `data-[state=checked]:bg-bg-brand-subtle + Check icon` (mudança aplicada no shadcn `DropdownMenuRadioItem`).

`layout="compact"` aplica `max-w-[var(--container-main-content-max)] mx-auto` no body. Layout=fluid mantém comportamento anterior (100% da largura).

---

## Hooks e utils transversais

| Item | Arquivo | O que é |
|------|---------|---------|
| `useTheme` | `src/hooks/useTheme.ts` | Hook do preview app — tema `"light" \| "dark" \| "system"`, persiste em localStorage e aplica `.dark` no `<html>`. **NÃO exportado na lib** |
| `cn` | `src/lib/utils.ts` | Compositor de className (clsx + tailwind-merge estendido pros prefixos DS pad/sp/gp/radius/sh/form + presets tipográficos) — usado nos showcases |
| `getContrastTextColor` | `src/utils/color-contrast.ts` | Escolhe `white`/`black` via contraste WCAG pra bg arbitrário (L-027 — usado pelo Avatar `colorHex`) |
| `tv` | `src/utils/tv.ts` | Wrapper obrigatório do tailwind-variants com `twMergeConfig` do DS — **nunca importar de `tailwind-variants` direto** |

---

## Regras de adição

1. Verificar esta lista antes de criar — não duplicar
2. Componentes Shadcn com lógica Radix → sempre `shadcn/`
3. Após criar: atualizar este arquivo + exportar em `src/components/index.ts`
4. Consultar `lessons.md` para armadilhas conhecidas (Radix state, Slider thumbs, etc.)
