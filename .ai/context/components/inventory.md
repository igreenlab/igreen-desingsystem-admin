# Component inventory — iGreen DS

> Fonte de verdade sobre o que existe.
> Atualizar sempre que criar ou remover componente.
> Verificar aqui ANTES de criar qualquer componente novo.
> Última atualização: 2026-06-09 (v0.7.1 — CardCheckbox + token formGap)

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
| Componente existe no Shadcn | `shadcn/` | `/add-shadcn-component` |
| Componente novo sem base no Shadcn | `ui/` | `/create-component` |
| Composição de existentes (FormField, etc.) | `ui/` | `/create-composite` |

---

## Componentes — shadcn/ (20 componentes)

| Componente | Arquivo | Subcomponentes exportados | Status |
|------------|---------|--------------------------|--------|
| Accordion | `shadcn/accordion.tsx` | Accordion, AccordionItem, AccordionTrigger, AccordionContent | ✅ implementado |
| Alert | `shadcn/alert.tsx` | Alert, AlertTitle, AlertDescription | ✅ implementado |
| Avatar | `shadcn/avatar.tsx` | Avatar, AvatarImage, AvatarFallback | ✅ implementado |
| Badge | `shadcn/badge.tsx` | Badge | ✅ implementado |
| Breadcrumb | `shadcn/breadcrumb.tsx` | Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis | ✅ implementado |
| Calendar | `shadcn/calendar.tsx` | Calendar | ✅ implementado |
| Card | `shadcn/card.tsx` | Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent | ✅ implementado |
| Checkbox | `shadcn/checkbox.tsx` | Checkbox | ✅ implementado |
| Dialog | `shadcn/dialog.tsx` | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose | ✅ implementado |
| DropdownMenu | `shadcn/dropdown-menu.tsx` | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup | ✅ implementado |
| Input | `shadcn/input.tsx` | Input | ✅ implementado |
| Label | `shadcn/label.tsx` | Label | ✅ implementado |
| Progress | `shadcn/progress.tsx` | Progress | ✅ implementado |
| RadioGroup | `shadcn/radio-group.tsx` | RadioGroup, RadioGroupItem | ✅ implementado |
| Select | `shadcn/select.tsx` | Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectValue, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton | ✅ implementado |
| Separator | `shadcn/separator.tsx` | Separator | ✅ implementado |
| Slider | `shadcn/slider.tsx` | Slider | ✅ implementado |
| Switch | `shadcn/switch.tsx` | Switch | ✅ implementado |
| Tabs | `shadcn/tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent | ✅ implementado |
| Textarea | `shadcn/textarea.tsx` | Textarea | ✅ implementado |

---

## Componentes — ui/ (iGreen puro) (8 componentes principais + compostos)

| Componente | Styles | Pasta | Status |
|------------|--------|-------|--------|
| Avatar | `ui/Avatar/avatar.styles.ts` | `src/components/ui/Avatar/` | ✅ implementado |
| Button | `ui/Button/button.styles.ts` | `src/components/ui/Button/` | ✅ implementado |
| **ButtonGroup** | `ui/ButtonGroup/button-group.styles.ts` | `src/components/ui/ButtonGroup/` | ✅ **v0.7.0** — split button pattern (compound `<Primary>` + `<Chevron>`). Wrapper inline-flex com radius colapsado entre slots, Chevron quadrado (size-form-*) alinhando com altura do Primary. color/variant/size propagam via Context; override individual permitido. ChevronDown default; customizável via `icon` prop. `aria-label` obrigatório no Chevron. Uso atual: split do botão Filtros do DataTable (Primary=SimpleFilter / Chevron=advanced query builder) |
| **CardCheckbox** | `ui/CardCheckbox/card-checkbox.styles.ts` | `src/components/ui/CardCheckbox/` | ✅ **v0.7.1** — checkbox apresentado como card clicável (área grande, label + description visíveis). Mesma estética dos radio cards (bg-success-muted + border-brand no selected). Diferente de `FormFieldCheckbox` (compact horizontal). Props: `label` + `description` + opcional `icon` à esquerda. Toggle via clique no card inteiro (label htmlFor). Uso atual: SacarDialog aba "Outra conta" — opção "Salvar essa conta pra usar depois" |
| Table | `ui/Table/table.styles.ts` | `src/components/ui/Table/` | ✅ implementado |
| DataTable | `ui/DataTable/data-table.styles.ts` | `src/components/ui/DataTable/` | ✅ implementado: client+server, persist localStorage, Saved Views + presets, Column Menu, ColumnTypeRegistry com 6 tipos extensiveis, Chips agrupados (OR implicito), modal Filtros Visual+Avancado com parser SQL. **v0.3.0**: auto-card mode em mobile (`cardBreakpoint`), toolbar responsiva (controles secundários colapsam em <xl via `ToolbarMobileDialog`), `FooterTableSkeleton` durante `isLoading`, coluna `actions` polish (sem ícone/border). **v0.6.0**: harden filters (auto-promote operator escalar→multi, normalize legacy, 5 operators novos), `showEmptyFilterChips` opt-in pra chips placeholder pré-ativos. **v0.7.0**: prop `simpleFilter` opt-IN — split button via `<ToolbarFilterControl>` (TableToolbar nativo) com drawer simple lateral (Primary) + advanced popover (Chevron). Default OFF mantém botão único legado. **branch feat/table-toolbar-v2**: a `<TableToolbar>` opinativa virou o **default**; prop `deprecatedToolbar?: boolean` (default false) renderiza a `<TableToolbarDeprecated>` legada pra consumers que ainda dependem do visual antigo (não quebra) |
| **TableToolbar** | `ui/TableToolbar/table-toolbar.styles.ts` | `src/components/ui/TableToolbar/` | ✅ **toolbar padrão (opinativa)** — slots semânticos em ordem fixa (viewToggle · savedViews · refresh · search · filter · settings · more · bulkBar). Lado direito: Busca + Filtros (drawer simple) + **Configurações** (`<ToolbarSettingsMenu>`, drill-down via Popover espelhando o DropdownMenu: Ordenação/Colunas/Filtros avançados + Densidade inline) + Opções ⋯. Mobile = visualização-only (esconde left+refresh; search fluido; Visualização+Visões inline no settings). Consumida automaticamente pelo DataTable. Superset do barrel antigo (exporta todos os parts/popovers/types + ToolbarFilterControl). USAGE.md + DocPage (`TableToolbarDoc`) |
| **TableToolbarDeprecated** | `ui/TableToolbarDeprecated/table-toolbar.styles.ts` | `src/components/ui/TableToolbarDeprecated/` | ⚠️ **DEPRECADA** — layout dumb legado (slots livres `left`/`actions` + chips). Acessível só via `<DataTable deprecatedToolbar>`. Será removida numa versão futura; novos usos consomem a `TableToolbar` canônica. DocPage `TableToolbarDeprecatedDoc` |
| **FloatingPanel** | `ui/FloatingPanel/floating-panel.styles.ts` | `src/components/ui/FloatingPanel/` | ✅ **v0.3.0** — drawer non-modal (sem backdrop, sem foco trap), resize horizontal opcional, maximize toggle, sheet bottom-up em max-md. Suporta `titleSlot` ReactNode pra header rico, `headerActions` à direita |
| **PageHeader** | `ui/PageHeader/page-header.styles.ts` | `src/components/ui/PageHeader/` | ✅ **v0.3.0** (Templates) — title + description + badge + actions + slot `children` (tabs/filtros). Mobile-ready built-in (`hideTextOnMobile` default true, `fluidPrimaryOnMobile` default true) |

**Nota**: `ViewFormModal` (modes create/edit) e `TableToolbarViews` (compound com Default tab + Tabs visiveis + Popover overflow + modal) ficam em `ui/TableToolbar/`. Saved Views eh UI do toolbar — DataTable so passa props/handlers. `ToolbarMobileDialog` + `ToolbarMobileSection` (em `ui/TableToolbar/parts/`) foram promovidos a uso oficial pelo DataTable em v0.3.0 (não-deprecated mais).

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

Hooks SRP internos (13):
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

Parts default:
  DataTableEmpty           → Inbox + texto
  DataTableLoading         → Loader2 spinner
  DataTableNoResults       → SearchX + texto
  DataTableFloatingBulkBar → bulk bar floating (alternativa ao bulkBar do TableToolbar)
  (Saved Views UI delegada ao TableToolbarViews compound do TableToolbar, que agrega Tabs + ViewsPopover + AddViewModal)

Services (F7):
  SavedViewsService (interface)  → list/save/delete (async) — trocável
  savedViewsMockService          → impl default usando localStorage (key prefix `igreen-datatable-views:`)

State persistence utils (F7):
  loadPersistedState(persistId)   → schema versionado (v1), retorna null se vazio/corrompido/version-mismatch
  savePersistedState(persistId, state) → JSON com version + try/catch silencioso
  clearPersistedState(persistId)  → remove entry

Adapters internos pros popovers existentes:
  FilterPopover  → POPOVER_OP_TO_FILTER_OP / FILTER_OP_TO_POPOVER_OP (mapeia eq↔equals etc)
  SortPopover    → SortPopoverCriterion[] ↔ SortModel (single sort)
  ColsPopover    → visibleCols Set + pinnedCols Set + onColumnsReorder
  ToolbarApplied → AppliedFilter[] com lookup label das filterOptions

Out of scope (planos seguintes):
  - Fast filters chips inline + applied bar (F6 — deprioritizado)
  - ColumnTypes registry com 8 tipos (deferido — column.type já existe no def)
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

## Regras de adição

1. Verificar esta lista antes de criar — não duplicar
2. Componentes Shadcn com lógica Radix → sempre `shadcn/`
3. Após criar: atualizar este arquivo + exportar em `src/components/index.ts`
4. Consultar `lessons.md` para armadilhas conhecidas (Radix state, Slider thumbs, etc.)
