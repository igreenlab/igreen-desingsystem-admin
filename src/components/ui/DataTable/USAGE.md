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
| **Virtualização** | `enableVirtualization: true` + `estimatedRowHeight` |
| **Row grouping** | `groupBy: ["status", "region"]` + (opcional) `groupMode: "free"` |
| **Row expansion** | `rowExpansion: { renderExpanded: ({ row }) => <Detail row={row} /> }` |
| **Saved views** | `savedViewsService` (use `savedViewsMockService` em dev) |
| **State persistence** | `persistKey: "clients-table"` salva sort+filter+visibility+density em localStorage |
| **Export** | `toolbar.enableExport: true` + handlers em `onExport` |
| **Totalizer row** | `totalizers: [{ field: "value", agg: "sum", format: formatBRL }]` |
| **Keyboard navigation** | Auto — setas, Home/End, PgUp/PgDn no body |

---

## Receitas comuns

### Server mode (refetch async + paginação remota)

```tsx
const fetchData = useCallback(async ({ pagination, sort, filter, search }: GridFetchParams) => {
  const res = await api.get("/clients", { params: serialize({ pagination, sort, filter, search }) });
  return { rows: res.data.items, total: res.data.total };
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
  onCellEditCommit={async ({ row, field, newValue }) => {
    await api.patch(`/clients/${row.id}`, { [field]: newValue });
    refreshClients();
  }}
/>
```

Click numa cell `editable` → input inline; Enter commita; Esc cancela; loading bloqueia outras edições.

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
  enableVirtualization
  estimatedRowHeight={42}     // default 42 (matches TABLE_HEADER_HEIGHT)
  paginationConfig={{ enabled: false }} // virtualização geralmente exclui paginação
/>
```

Usa `@tanstack/react-virtual`. Sticky header e seleção mantêm-se. Performance fica linear até ~100k rows.

### Row grouping

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  groupBy={["status"]}            // multi-nível: ["region", "status"]
  groupMode="column-aligned"      // ou "free" para header customizado
  renderGroupHeader={({ group, level, count, isExpanded, onToggle }) =>
    <span>{group.label} ({count})</span>
  }
/>
```

`column-aligned`: header alinhado às colunas, mantém grid layout.
`free`: header full-width, ideal pra hierarquias complexas.

### Row expansion (painel detalhe)

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  rowExpansion={{
    renderExpanded: ({ row }) => <ClientDetailPanel client={row} />,
    expandIcon: "chevron",
  }}
/>
```

Chevron column injetada à esquerda; um row expandido por vez (ou multi-row, configurável).

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
  operators: ["eq", "gt", "lt"],
  renderCell: ({ value }) => <Stars n={Number(value) || 0} />,
  renderFilterInput: ({ value, onChange }) =>
    <NumberInput min={0} max={5} value={value} onChange={onChange} />,
  matchFilter: (cellValue, op, filterValue) => /* runtime check */ true,
};

// Registro feito uma vez na boot:
columnTypeRegistry.register(RatingColumnType);

// Uso:
{ field: "rating", headerName: "Rating", type: "rating" as any }
```

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
- `enableFilters?` (true) — FilterPopover (só aparece se ao menos uma coluna tem `enableColumnFilter`)
- `enableColumns?` (true) — ColsPopover (show/hide, pin, reorder via drag)
- `enableDensity?` (true) — ToolbarSegmented compact/standard/comfortable
- `enableExport?` (false) — botão Export + handlers via `onExport`
- `moreMenuItems?` — items extras no `<MoreMenu>`
- `bulkActions?` — ReactNode renderizado no `<BulkActionsBar>` quando há seleção
- `presetViews?` — DataTablePresetView[] (tabs no topo da toolbar)

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

---

## Performance

- `columns` **deve** ser memoizado com `useMemo` no pai
- O processor (filter → search → sort → paginate) usa useMemo cascateado — mudar só de página NÃO re-roda filter/search/sort
- Provider value é memoizado — re-render do pai não dispara cascade em rows
- Use `enableVirtualization` para > ~500 rows visíveis (ou desde sempre se UX permite)
- Saved views + persistKey: ambos consomem o mesmo `DataTableState`, podem coexistir

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
| Density não persiste | `persistKey` ausente | Adicionar `persistKey="meu-table"` |
| Server mode loop infinito | `fetchData` não memoizado | `useCallback(fetchData, [deps])` |
| Virtualização "pula" | `estimatedRowHeight` muito diferente do real | Ajustar pro height médio observado |
| Inline edit não salva | `onCellEditCommit` retorna sem await | Retornar Promise; controller aguarda |
| Saved views não persiste | `savedViewsMockService` em prod | Implementar `SavedViewsService` real |
| Group header sem totalizer | `totalizers` declara field não-aggregável | Garantir `agg: "sum" \| "avg" \| "count"` |
| Coluna actions com filter chip | `type: "actions"` deveria desabilitar filter | Reportar — esse type bloqueia sort/filter por design |

---

## Padrões internos (referência rápida)

- **God component evitado** — DataTable orquestra; lógica pesada em hooks (`use-filter-popover-adapter`, `use-sort-popover-adapter`, `use-cols-popover-adapter`, `use-data-table-processor`, etc)
- **Operator mapping centralizado** — `utils/operator-mapping.ts` é fonte única dos mapas POPOVER ↔ FILTER
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
