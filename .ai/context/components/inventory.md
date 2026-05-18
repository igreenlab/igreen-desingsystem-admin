# Component inventory — iGreen DS

> Fonte de verdade sobre o que existe.
> Atualizar sempre que criar ou remover componente.
> Verificar aqui ANTES de criar qualquer componente novo.
> Última atualização: 2026-05-12

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

## Componentes — ui/ (iGreen puro) (4 componentes)

| Componente | Styles | Pasta | Status |
|------------|--------|-------|--------|
| Avatar | `ui/Avatar/avatar.styles.ts` | `src/components/ui/Avatar/` | ✅ implementado |
| Button | `ui/Button/button.styles.ts` | `src/components/ui/Button/` | ✅ implementado |
| Table | `ui/Table/table.styles.ts` | `src/components/ui/Table/` | ✅ implementado |
| DataTable | `ui/DataTable/data-table.styles.ts` | `src/components/ui/DataTable/` | ✅ implementado: client+server, persist localStorage, Saved Views + presets, Column Menu, ColumnTypeRegistry com 6 tipos extensiveis, Chips agrupados (OR implicito), modal Filtros Visual+Avancado com parser SQL |

**Nota**: `ViewFormModal` (modes create/edit) e `TableToolbarViews` (compound com Default tab + Tabs visiveis + Popover overflow + modal) ficam em `ui/TableToolbar/`. Saved Views eh UI do toolbar — DataTable so passa props/handlers.

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
| FormField | Composto | `ui/` | 🔴 alta — Input + Label + HelperText |
| Toast / Sonner | Shadcn | `shadcn/` | 🟡 média |
| Tooltip | Shadcn | `shadcn/` | 🟡 média |
| Popover | Shadcn | `shadcn/` | 🟡 média |
| Skeleton | iGreen | `ui/` | 🟢 baixa |
| Command/Combobox | Shadcn | `shadcn/` | 🟡 média |

---

## Regras de adição

1. Verificar esta lista antes de criar — não duplicar
2. Componentes Shadcn com lógica Radix → sempre `shadcn/`
3. Após criar: atualizar este arquivo + exportar em `src/components/index.ts`
4. Consultar `lessons.md` para armadilhas conhecidas (Radix state, Slider thumbs, etc.)
