# DataTable — Guia de uso

Wrapper smart sobre `<TableToolbar>` + `<Table>` + `<FooterTable>` que orquestra **17 hooks SRP** (sort, filter, search, pagination, selection, visibility, density, processor, query, export, saved views, persistence, etc) e renderiza body com suporte a virtualização, agrupamento e expansão.

> **Princípio**: o DataTable é smart, mas cada primitive (Table, TableToolbar, FooterTable) é dumb e standalone. Veja `Table/USAGE.md` e `TableToolbar/USAGE.md` se quiser montar uma tabela custom fora do DataTable.

---

## Imports

```tsx
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableRef,
  // builders pra reduzir boilerplate:
  textColumn,
  currencyColumn,
  dateColumn,
  statusColumn,
  actionColumn,
  // registry pra tipos custom:
  columnTypeRegistry,
  type ColumnTypeDefinition,
} from "@/components/ui/DataTable";
```

---

## Quick start — client mode (CRUD)

```tsx
interface Client {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  value: number;
  createdAt: string;
}

const columns = useMemo<DataTableColumnDef<Client>[]>(() => [
  textColumn<Client>("id", "ID", { width: 80 }),
  textColumn<Client>("name", "Nome", { width: 240, sortable: true }),
  { field: "email", headerName: "Email", type: "email", width: 280 },
  currencyColumn<Client>("value", "Valor", { width: 140, currency: "BRL" }),
  dateColumn<Client>("createdAt", "Criado em", { width: 140 }),
  statusColumn<Client>("status", "Status", [
    { value: "active",   label: "Ativo",   color: "success" },
    { value: "inactive", label: "Inativo", color: "muted" },
  ], { width: 140 }),
  actionColumn<Client>({
    getActions: ({ row }) => [
      { label: "Editar",  onClick: () => editClient(row) },
      { label: "Excluir", onClick: () => removeClient(row), destructive: true },
    ],
  }),
], [editClient, removeClient]);

<DataTable<Client>
  rows={clients}
  columns={columns}
  toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
  selectionConfig={{ enabled: true, enableGlobal: true }}
  onRowClick={(row) => router.push(`/clients/${row.id}`)}
/>
```

> `columns` **deve** ser memoizado — o processor reage à identidade do array, não ao conteúdo.

---

## Capacidades

| Capability | Como ativar |
|------------|-------------|
| **Sort multi** | `sortable: true` na coluna; toolbar Sort popover surge automaticamente |
| **Filter chip rápido** | `enableColumnFilter: true` + `filterType: "text"\|"number"\|"date"\|"select"\|"multiSelect"\|"boolean"` |
| **Filter avançado (AND/OR)** | Habilitado por default se houver coluna com `enableColumnFilter` |
| **Search global** | `toolbar.enableSearch: true` (default) + `searchableFields` opcional |
| **Pagination** | `paginationConfig.enabled: true` (default) |
| **Selection (bulk)** | `selectionConfig.enabled: true` |
| **Visibility / pin / reorder** | `toolbar.enableColumns: true` (default) |
| **Density toggle** | `toolbar.enableDensity: true` (default). Override items via `densityItems` prop |
| **Column types registry** | `type: "currency"` etc — renderiza display + filter input via registry |
| **Inline edit** | `editable: true` na coluna + `onCellEditCommit` |
| **Server mode** | passe `fetchData` em vez de `rows` |
| **Card responsivo (mobile)** | `cardBreakpoint` (default 768). Abaixo desse valor, rows viram `<TableCardRow>` automaticamente — toolbar e footer continuam intactos. `cardBreakpoint={false}` desabilita. |
| **Toolbar responsiva (mobile)** | Em viewports `<md` (768px), controles secundários (sort / cols / density / refresh / view toggle / saved views / export / more menu) colapsam automaticamente num icon-button dropdown `...` via `ToolbarMobileDialog`. Search e Filter continuam sempre visíveis na linha principal. Comportamento built-in — sem prop necessária. |
| **Virtualização** | `virtualize: true` (+ `estimateRowHeight` / `overscan` opcionais) |
| **Row grouping** | `groupBy: "status"` (1 field na V1) + opcionais `renderGroupHeader`/`renderGroupContent` pra free-form |
| **Row expansion** | `expandable: true` na coluna + `renderRowExpansion: ({ row }) => <Detail row={row} />` |
| **Saved views** | `savedViewsService` (use `savedViewsMockService` em dev) |
| **State persistence** | `persistId: "clients-table"` — workspace "Default" completo persiste em localStorage (sort, filter, search, page, density, column widths/pin/hide/order, viewMode, groupBy, expanded rows). Quando view custom está ativa, o snapshot da Default fica congelado — voltar para Default restaura tudo intacto. Limpeza manual via `ref.current.resetPersistedState()`. |
| **Auto-fit das colunas** | `autoFit: true` (default) — observa container via ResizeObserver, mede conteúdo das primeiras N rows (canvas) e distribui espaço sobrando. Override com `col.width` mantém largura fixa. `autoFit={false}` desliga (comportamento legacy). |
| **Resize manual de colunas** | Default ativo em todas as colunas exceto `type: "actions"` ou `purpose: "selection"`. Drag handle aparece no edge direito do header. Limites hard `60–800px`; respeita `col.minWidth/maxWidth` quando definidos. Para desabilitar em uma coluna específica: `resizable: false`. |
| **Export** | `toolbar.enableExport: true` + handlers em `onExport` |
| **Totalizer row** | `showTotalizers` na DataTable + `aggregate: "sum"` (+ `aggregateFormatter`) na coluna; server mode pode sobrescrever via `aggregateRow` |
| **Keyboard navigation** | Auto — setas, Home/End, PgUp/PgDn no body |

---

## Receitas comuns

### Server mode (refetch async + paginação remota)

```tsx
const fetchData = useCallback(async ({ pagination, sort, filters, search }: GridFetchParams) => {
  const res = await api.get("/clients", { params: serialize({ pagination, sort, filters, search }) });
  return { data: res.data.items, total: res.data.total };  // GridFetchResult<T>
}, []);

<DataTable<Client>
  fetchData={fetchData}
  columns={columns}
  toolbar={{ enableSearch: true, enableFilters: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
/>
```

`fetchData` é re-disparado quando muda `pagination | sort | filter | search`. Use ref/AbortController interno se precisar cancelar. Loading state é managed pelo controller (skeleton no body).

### Inline edit (commit no submit / Enter)

```tsx
const columns: DataTableColumnDef<Client>[] = [
  { field: "name", headerName: "Nome", editable: true, sortable: true },
  // ...
];

<DataTable<Client>
  rows={clients}
  columns={columns}
  onCellEditCommit={async ({ id, field, value, oldValue, row }) => {
    await api.patch(`/clients/${id}`, { [field]: value });
    refreshClients();
  }}
/>
```

Double-click numa cell `editable` → input inline; Enter commita; Esc cancela; loading bloqueia outras edições.

### Mobile auto-switch para card

Por default, viewports `< 768px` rendem cada row como `<TableCardRow>` no lugar de `<TableRow>`. O toolbar (search/filter/sort) e o footer (paginação) continuam intactos — só o body que troca.

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  cardBreakpoint={768}     // default — abaixo deste pixel, vira card
  // cardBreakpoint={false} // desabilita o auto-switch (mantém table sempre)
  // cardBreakpoint={640}   // breakpoint custom
/>
```

**Mapeamento automático das colunas → card:**
- Coluna `isPrimary: true` (ou primeira coluna não-actions) → vai pro **header** do card como título
- Coluna `type="actions"` → vai pro **headerActions** (canto sup. direito)
- Checkbox de selection → vai pro header (esquerda do título)
- Demais colunas visíveis → viram `items` label/value no body do card

**Pra eleger qual coluna é o título do card:**
```tsx
const columns = [
  { field: "id", headerName: "ID", ... },
  { field: "name", headerName: "Nome", isPrimary: true, ... }, // ← vira título do card
  // ...
];
```

**Degradações intencionais no card mode** (silenciosas — não quebram):
- Virtualização desligada (renderiza `rowsToRender` integral, paginação ainda limita)
- Row expansion / Inline editing / Column resize → desativados (sem sentido em card vertical)
- Group rows → ainda não suportadas (TODO futuro)

### Virtualização (10k+ linhas)

```tsx
<DataTable<Client>
  rows={tenThousandClients}
  columns={columns}
  virtualize
  estimateRowHeight={56}      // opcional — default deriva da density (40/56/64)
  overscan={10}               // opcional — rows extras fora da viewport
  paginationConfig={{ enabled: false }} // virtualização geralmente exclui paginação
/>
```

Usa `@tanstack/react-virtual`. Sticky header e seleção mantêm-se. Performance fica linear até ~100k rows. Requer container com altura definida (`flex-1 min-h-0` ou height fixa).

### Row grouping

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  groupBy="status"                // controlled (string, 1 field na V1) — ou defaultGroupBy uncontrolled
  onGroupByChange={setGroupBy}
  // Default (sem overrides): header column-aligned com chevron + label + count + subtotals.
  // Free-form: passe os 2 overrides abaixo.
  renderGroupHeader={({ group, toggle }) => (
    <span onClick={toggle}>{group.label} ({group.count})</span>
  )}
  renderGroupContent={({ group }) => <CardsGrid rows={group.rows} />}
/>
```

Pagination é desligada **automaticamente** quando `groupBy` está ativo. Sem os overrides, o default é column-aligned (mantém grid layout); com `renderGroupHeader`/`renderGroupContent`, o grupo vira free-form (full-width, ideal pra hierarquias complexas). Referência: `src/preview/pages/ClientsGroupedPreview.tsx` (2 modos).

### Row expansion (painel detalhe)

```tsx
const columns = [
  { field: "id", headerName: "ID", expandable: true },  // ← chevron + click trigger
  // ...
];

<DataTable<Client>
  rows={clients}
  columns={columns}
  renderRowExpansion={({ row }) => <ClientDetailPanel client={row} />}
  singleExpand   // opcional — default false (múltiplas rows abertas)
/>
```

O chevron aparece na coluna marcada `expandable: true`. Controlled opcional via `expandedRowIds` + `onExpandedRowIdsChange` (ou `defaultExpandedRowIds` uncontrolled). Mutuamente exclusivo com `groupBy` (groupBy tem precedência). Referência: `src/preview/pages/ClientsExpandablePreview.tsx`.

### Saved views

```tsx
import { savedViewsMockService } from "@/components/ui/DataTable";

<DataTable<Client>
  rows={clients}
  columns={columns}
  savedViewsService={savedViewsMockService}   // troque pelo seu service em prod
/>
```

Service contract em `services/saved-views.types.ts` — `listViews / saveView / deleteView`. Persiste sort+filter+search+visibility+density+pinned como JSON.

### Tipo de coluna custom (registry)

```tsx
const RatingColumnType: ColumnTypeDefinition = {
  type: "rating",
  // operators: array de { id, label } — id usa nomes canônicos do FilterOperator
  // (equals, neq, contains, notContains, startsWith, endsWith, gt, lt, gte, lte,
  // isAnyOf, isNoneOf, between, isEmpty, isNotEmpty). Label aparece no dropdown
  // de operadores do popover Filtros + chip toolbar (via DEFAULT_OP_LABELS).
  operators: [
    { id: "equals", label: "é" },
    { id: "gt",     label: "maior que" },
    { id: "lt",     label: "menor que" },
  ],
  renderCell: ({ value }) => <Stars n={Number(value) || 0} />,
  renderFilterInput: ({ value, onChange }) =>
    <NumberInput min={0} max={5} value={value} onChange={onChange} />,
  matchesFilter: (cellValue, filterValue, operator) => {
    const n = Number(cellValue) || 0;
    const f = Number(filterValue) || 0;
    if (operator === "equals") return n === f;
    if (operator === "gt") return n > f;
    if (operator === "lt") return n < f;
    return null;
  },
};

// Registro feito uma vez na boot:
columnTypeRegistry.register(RatingColumnType);

// Uso:
{ field: "rating", headerName: "Rating", type: "rating" as any }
```

---

## Filtros — funil (drawer simple) + avançado (Configurações)

A toolbar separa dois níveis de filtro, sempre disponíveis (gated por
`toolbar.enableFilters !== false` + colunas filtráveis):

- **Funil** → abre um **drawer lateral** com TODOS os filtros em form vertical.
  Aplicação LIVE, operator inferido do `filterType` (multiSelect → isAnyOf,
  text → contains, date → between, etc). O caminho simples pro user típico.
- **Configurações → Filtros avançados** → query builder completo: modo **Visual**
  (AND/OR + operadores explícitos + Adicionar condição) e modo **Avançado** (SQL-like,
  round-trip-safe pra todos os operadores).

A prop `simpleFilter` é **opcional** — só customiza o drawer do funil:

```tsx
{/* Funil + avançado vêm de graça — sem configuração */}
<DataTable rows={...} columns={...} />

{/* Customizar o drawer do funil */}
<DataTable
  simpleFilter={{
    hiddenFields: ["internal"],   // não mostra no drawer (só no avançado)
    title: "Refinar busca",
    size: "lg",                   // 560px (default md = 400px)
  }}
/>
```

### `simpleFilter` (opcional)

| Prop | Tipo | Default | Quando usar |
|---|---|---|---|
| `simpleFilter.hiddenFields` | `string[]` | `[]` | Fields que NÃO aparecem no drawer do funil (só no avançado). Útil pra filtros técnicos |
| `simpleFilter.title` | `string` | `"Filtros"` | Override do título do header do drawer |
| `simpleFilter.size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` (400px) | Use `"lg"` (560px) se há muitos campos com widgets largos (dates/multi-select) |

---

## ⚠️ filterModel controlado — operator correto por filterType

**Quando passar `filterModel` como prop controlada (em vez de uncontrolled), use o operator
correto pro `filterType` da coluna.** Operator errado = popover Filtros mostra o Select de
operador **vazio** porque o operator não está nos `operators` do column-type.

| `filterType` da coluna | Operators válidos | Default sugerido |
|---|---|---|
| `multiSelect` | `isAnyOf`, `isNoneOf`, `isEmpty`, `isNotEmpty` | `isAnyOf` |
| `select` | `equals`, `neq`, `isEmpty`, `isNotEmpty` | `equals` |
| `text` (default) | `contains`, `notContains`, `equals`, `neq`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty` | `contains` |
| `number` | `equals`, `neq`, `gt`, `lt`, `gte`, `lte`, `between` | `equals` |
| `date` | `between`, `equals`, `gt`, `lt` | `between` |
| `boolean` | `equals` | `equals` |

```tsx
// ❌ ERRADO — Status é multiSelect mas operator é "equals"
// → Popover Filtros mostra Select operador VAZIO
const INITIAL_FILTERS: FilterModel = {
  items: [
    { id: "f1", field: "statusId", operator: "equals", value: "active" },
  ],
  logicOperator: "AND",
};

// ✅ CORRETO — operator bate com filterType=multiSelect
const INITIAL_FILTERS: FilterModel = {
  items: [
    { id: "f1", field: "statusId", operator: "isAnyOf", value: "active" },
  ],
  logicOperator: "AND",
};
```

**Defesa em profundidade:** `FilterRowEditor` detecta operator inválido e faz fallback pro
primeiro operator do column-type + auto-normaliza via `onChange`. Mas é melhor declarar
correto desde o início.

**Atalho pra presets uncontrolled:** se você usar `defaultViews={[presetView({...})]}` em
vez de filterModel controlled, o controller normaliza automaticamente via
`normalizeFilterModelForColumns` na hidratação. Só recomendado se você não precisa de
controle externo do filterModel.

---

## Imperative ref

```tsx
const tableRef = useRef<DataTableRef>(null);

<DataTable ref={tableRef} ... />

tableRef.current?.getSelectedIds();   // (string | number)[]
tableRef.current?.getSelectedCount(); // number
tableRef.current?.clearSelection();
tableRef.current?.getState();         // DataTableState snapshot
tableRef.current?.refresh();          // server mode: re-disparar fetchData
```

---

## Configs detalhadas

### `toolbar` (DataTableToolbarConfig)

- `title?` — string no canto esquerdo
- `enableSearch?` (true) — ToolbarSearch slot
- `enableRefresh?` (true) — botão Refresh após o search (server mode refetch; client mode spinner)
- `enableFilters?` (true) — controle de filtros (só aparece se ao menos uma coluna tem `enableColumnFilter`)
- `enableColumns?` (true) — ColsPopover (show/hide, pin, reorder via drag)
- `enableDensity?` (true) — ToolbarSegmented compact/standard/comfortable
- `enableExport?` (false) — `true` = dropdown Exportar com CSV default; objeto `{ formats?, items? }` pra formatos custom
- `moreMenu?` — `{ items: DataTableMoreMenuItem[] }` — MoreMenu (⋯) no canto direito
- `customLeft?` — ReactNode livre após search/refresh (controls custom)
- `viewToggle?` — override/esconde o segmented table/kanban auto-renderizado

> Bulk actions vão em `selectionConfig.actions` (não no toolbar). Preset views vão na prop
> `defaultViews` da DataTable (não no toolbar).

### `paginationConfig`
- `enabled` (true)
- `initialPageSize` (25)
- `pageSizeOptions` ([10, 25, 50, 100])
- `mode?: "client" | "server"` — derivado automaticamente de `rows` vs `fetchData`

### `selectionConfig`
- `enabled` (false)
- `enableGlobal` (false) — "selecionar todos" com modo include/exclude
- `actions?: ReactNode` — slot direto no BulkActionsBar
- `getRowId?: (row) => string | number` — default `row.id`

### `densityItems?: ToolbarSegmentedItem<TableDensity>[]`
Customiza os 3 botões do segmented. Default: compact / standard / comfortable.

### `cardBreakpoint?: number | false`
- `number` (default `768`) — viewport `< N px` ativa o card mode (rows viram `<TableCardRow>`)
- `false` — desabilita o auto-switch (mantém table view em qualquer viewport)

Use `false` em telas onde o card mode não faz sentido (ex: tabela dentro de modal pequeno que já é mobile-friendly de outra forma).

### `autoFit?: boolean` (default `true`)

Auto-distribui as colunas para ocupar todo o container, em 3 camadas:

1. **Type Heuristics** — cada `column.type` tem `defaultWidth` do registry. Se a coluna define `width`, esse vence.
2. **Smart Content Sampling** — mede o texto do header + primeiras 20 rows via canvas (`measureText`) e ajusta width pra caber o conteúdo. Respeita `col.minWidth` e `col.maxWidth`.
3. **Flex Distribution** — sobrando espaço no container, distribui entre colunas sem `width` explícito.

Observado via `ResizeObserver` no container — recalcula quando viewport muda.

**Precedência de width:** resize manual (drag pelo user) > autoFit > `col.width` > `typeDef.defaultWidth`.

**Para desligar:** `autoFit={false}` mantém comportamento legacy (cada coluna usa `col.width` ou default fixo; espaço sobrando vira vazio à direita). Resize manual continua disponível em ambos os modos.

```tsx
// Default — fluid automático
<DataTable rows={rows} columns={cols} />

// Opt-out
<DataTable rows={rows} columns={cols} autoFit={false} />

// Coluna fixa dentro de tabela fluid (ex: actions, status com width travado)
const cols = [
  { field: "id", width: 80 },          // sempre 80px
  { field: "name" },                    // expandida pelo autoFit
  { field: "actions", type: "actions", width: 60 },
];
```

### `persistId?: string` (workspace "Default" persistente — schema v4)

Quando definido, **todo** o workspace "Default" é salvo em localStorage:

- `density`, `sortModel`, `pageSize`, `currentPage`
- `columnWidths` (resize manual), `pinnedColumns`, `hiddenColumns`, `columnOrder`
- `filterModel`, `search` (texto debounced)
- `viewMode`, `groupBy`, `expandedRowIds`
- `lastActiveViewId` — qual view estava aplicada no último uso

**Como views custom interagem com Default:**
- User filtra/busca/etc → snapshot da Default é atualizado em tempo real
- User aplica view custom (preset ou saved) → snapshot da Default fica **congelado** (não polui)
- User volta para Default → `applyDefault` restaura tudo (filter, search, page, etc) do snapshot intacto
- User precisa **limpar manualmente** (clear search input, remover filtros via UI) para resetar

**Reset programático:**
```ts
ref.current?.resetPersistedState();   // remove entry inteira do localStorage
```

**Schema versionado:** entries antigos (v3 ou menor) são descartados silenciosamente — DataTable cai no comportamento default sem erro. Schema atual `v4`.

---

## Performance

- `columns` **deve** ser memoizado com `useMemo` no pai
- O processor (filter → search → sort → paginate) usa useMemo cascateado — mudar só de página NÃO re-roda filter/search/sort
- Provider value é memoizado — re-render do pai não dispara cascade em rows
- Use `virtualize` para > ~500 rows visíveis (ou desde sempre se UX permite)
- Saved views + persistId: ambos consomem o mesmo `DataTableState`, podem coexistir

---

## ARIA

Tudo proveniente do `<Table>` primitive: `role="grid"`, `role="row"`, `role="columnheader"` com `aria-sort`, `role="gridcell"`. Keyboard navigation segue WAI-ARIA grid pattern. Bulk bar tem `role="region"` com aria-label.

---

## Troubleshooting

| Sintoma | Causa provável | Fix |
|---------|---------------|-----|
| Tabela re-renderiza inteira a cada digit | `columns` não memoizado | `useMemo(() => [...], [deps])` |
| Filter chip não aparece | Coluna sem `enableColumnFilter: true` | Adicionar flag |
| Filter popover vazio | Nenhuma coluna com `enableColumnFilter` | Adicionar a pelo menos 1 coluna |
| Sort não funciona | Coluna sem `sortable: true` | Adicionar flag |
| Density não persiste | `persistId` ausente | Adicionar `persistId="meu-table"` |
| Server mode loop infinito | `fetchData` não memoizado | `useCallback(fetchData, [deps])` |
| Virtualização "pula" | `estimatedRowHeight` muito diferente do real | Ajustar pro height médio observado |
| Inline edit não salva | `onCellEditCommit` retorna sem await | Retornar Promise; controller aguarda |
| Saved views não persiste | `savedViewsMockService` em prod | Implementar `SavedViewsService` real |
| Group header sem totalizer | Coluna sem `aggregate` declarado | Definir `aggregate: "sum" \| "avg" \| "count" \| "min" \| "max" \| fn` na coluna |
| Coluna actions com filter chip | `type: "actions"` deveria desabilitar filter | Reportar — esse type bloqueia sort/filter por design |

---

## Padrões internos (referência rápida)

- **God component evitado** — DataTable orquestra; lógica pesada em hooks (`use-filter-popover-adapter`, `use-sort-popover-adapter`, `use-cols-popover-adapter`, `use-data-table-processor`, etc)
- **Vocabulário único de operador** — ids longos do `FilterModel` (`equals`, `neq`, `gt`, `gte`…) em todo o fluxo (popover, parser SQL, chips, adapter). Sem tradução curto↔longo. Label do chip vem do registry do column-type (`opLabel`), com `DEFAULT_OP_LABELS` como fallback
- **Value resolution shared** — `utils/resolve-value.ts` (`getFieldValue / applyValueGetter / applyFormatter`) usado por processor, group-rows e cell render
- **Column types via registry** — `column-types/column-type-registry.ts`; `console.warn` em duplicate (não throw, suporta hot reload)
- **Row variants discriminadas** — `groupRow / groupContentRow / expansionRow / dataRow` via Symbol-as-discriminator (type-safe)
- **Sortable head cell renomeado** — `DataTableSortableHeadCell` (consistência com prefixo)

---

## V2 (planejado, não V1)

- Extração final do `<DataTableBody>` para componente próprio
- Hooks dedicados pra inline-edit, keyboard-nav, grouping, expansion (atualmente inline no orquestrador)
- Migration helper auto-aplicado para saved views quando colunas removidas
- Unit tests cobertura ≥ 80% nos hooks críticos (`use-column-resize`, `group-rows`, `expand-rows`, `use-data-table-processor`)
- Mobile parts da toolbar (`ToolbarMobileDialog` etc) decidir mantém ou remove
