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

const columns = useMemo<DataTableColumnDef<Client>[]>(
  () => [
    textColumn<Client>("id", "ID", { width: 80 }),
    textColumn<Client>("name", "Nome", { width: 240, sortable: true }),
    { field: "email", headerName: "Email", type: "email", width: 280 },
    currencyColumn<Client>("value", "Valor", { width: 140, currency: "BRL" }),
    dateColumn<Client>("createdAt", "Criado em", { width: 140 }),
    statusColumn<Client>(
      "status",
      "Status",
      [
        { value: "active", label: "Ativo", color: "success" },
        { value: "inactive", label: "Inativo", color: "muted" },
      ],
      { width: 140 },
    ),
    actionColumn<Client>({
      getActions: ({ row }) => [
        { label: "Editar", onClick: () => editClient(row) },
        {
          label: "Excluir",
          onClick: () => removeClient(row),
          destructive: true,
        },
      ],
    }),
  ],
  [editClient, removeClient],
);

<DataTable<Client>
  rows={clients}
  columns={columns}
  toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
  selectionConfig={{ enabled: true, enableGlobal: true }}
  onRowClick={(row) => router.push(`/clients/${row.id}`)}
/>;
```

> `columns` **deve** ser memoizado — o processor reage à identidade do array, não ao conteúdo.

---

## Capacidades

| Capability                      | Como ativar                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sort multi**                  | `sortable: true` na coluna; toolbar Sort popover surge automaticamente                                                                                                                                                                                                                                                                                               |
| **Filter chip rápido**          | `enableColumnFilter: true` + `filterType: "text"\|"number"\|"date"\|"select"\|"multiSelect"\|"boolean"`                                                                                                                                                                                                                                                              |
| **Filter avançado (AND/OR)**    | Habilitado por default se houver coluna com `enableColumnFilter`                                                                                                                                                                                                                                                                                                     |
| **Filter chips placeholder**    | `showEmptyFilterChips={["status", "categoria"]}` — chips nativos visíveis desde o load inicial, mesmo sem valor preenchido (user clica e preenche)                                                                                                                                                                                                                   |
| **Search global**               | `toolbar.enableSearch: true` (default). Client mode busca em todos os fields; server mode recebe `search` (debounced) + `searchField?` no `GridFetchParams`                                                                                                                                                                                                          |
| **Pagination**                  | `paginationConfig.enabled: true` (default)                                                                                                                                                                                                                                                                                                                           |
| **Selection (bulk)**            | `selectionConfig.enabled: true`                                                                                                                                                                                                                                                                                                                                      |
| **Visibility / pin / reorder**  | `toolbar.enableColumns: true` (default)                                                                                                                                                                                                                                                                                                                              |
| **Density toggle**              | `toolbar.enableDensity: true` (default). Override items via `densityItems` prop                                                                                                                                                                                                                                                                                      |
| **Column types registry**       | `type: "currency"` etc — renderiza display + filter input via registry                                                                                                                                                                                                                                                                                               |
| **Inline edit**                 | `editable: true` na coluna + `onCellEditCommit`                                                                                                                                                                                                                                                                                                                      |
| **Read-more (Ler mais)**        | `readMore: true` na coluna (ou `{ lines?, label? }`) — trunca + popover com texto completo                                                                                                                                                                                                                                                                           |
| **Copy célula**                 | `copyable: true` na coluna (ou `{ value?, label? }`) — ícone copiar no hover + feedback "Copiado!" (~2s)                                                                                                                                                                                                                                                             |
| **Grab-to-scroll horizontal**   | **nativo (default `true`)** — arrastar o corpo (mouse/pen) rola lateralmente; `grabToScroll={false}` desliga                                                                                                                                                                                                                                                          |
| **Tela cheia (fullscreen)**     | `toolbar.enableFullscreen: true` — botão ⤢ na toolbar expande a tabela pra viewport inteira (Esc volta)                                                                                                                                                                                                                                                              |
| **Ações custom no toolbar**     | `toolbar.actions: ToolbarAction[]` — `button`/`dropdown`/`input` (ex.: seletor de período). Inline no desktop (entre Filtros e ⋯); no mobile colapsam num ⋯ próprio. Ver `<ToolbarActions>` no TableToolbar                                                                                                                                                          |
| **Server mode**                 | passe `fetchData` em vez de `rows`                                                                                                                                                                                                                                                                                                                                   |
| **Card responsivo (mobile)**    | `cardBreakpoint` (default 768). Abaixo desse valor o **default é tabela** (densidade > cards pra power user); o usuário alterna pra cards via toggle **"Exibição" (Linhas/Cards)** que aparece na ToolbarSettingsMenu (`mobileDisplayToggle`). `cardBreakpoint={false}` desabilita o card mode por completo.                                                         |
| **Toolbar responsiva (mobile)** | Em viewports `<md` (768px), controles secundários (sort / cols / density / refresh / view toggle / saved views / export / more menu) colapsam automaticamente num icon-button dropdown `...` via `ToolbarMobileDialog`. Search e Filter continuam sempre visíveis na linha principal. Comportamento built-in — sem prop necessária.                                  |
| **Virtualização**               | `virtualize: true` (+ `estimateRowHeight` / `overscan` opcionais)                                                                                                                                                                                                                                                                                                    |
| **Row grouping**                | `groupBy: "status"` (1 field na V1) + opcionais `renderGroupHeader`/`renderGroupContent` pra free-form                                                                                                                                                                                                                                                               |
| **Row expansion**               | `expandable: true` na coluna + `renderRowExpansion: ({ row }) => <Detail row={row} />`                                                                                                                                                                                                                                                                               |
| **Tree-data (hierarquia)**      | `getTreeDataPath: (row) => [...]` + `treeColumn: true` na coluna primária. Rows continuam FLAT; o path define a árvore. Pagination desliga automaticamente.                                                                                                                                                                                                          |
| **Saved views**                 | `savedViewsService` (use `savedViewsMockService` em dev)                                                                                                                                                                                                                                                                                                             |
| **State persistence**           | `persistId: "clients-table"` — workspace "Default" completo persiste em localStorage (sort, filter, search, page, density, column widths/pin/hide/order, viewMode, groupBy, expanded rows). Quando view custom está ativa, o snapshot da Default fica congelado — voltar para Default restaura tudo intacto. Limpeza manual via `ref.current.resetPersistedState()`. |
| **Auto-fit das colunas**        | `autoFit: true` (default) — observa container via ResizeObserver, mede conteúdo das primeiras N rows (canvas) e distribui espaço sobrando. Override com `col.width` mantém largura fixa. `autoFit={false}` desliga (comportamento legacy).                                                                                                                           |
| **Resize manual de colunas**    | Default ativo em todas as colunas exceto `type: "actions"` ou `purpose: "selection"`. Drag handle aparece no edge direito do header. Limites hard `60–800px`; respeita `col.minWidth/maxWidth` quando definidos. Para desabilitar em uma coluna específica: `resizable: false`.                                                                                      |
| **Export**                      | `toolbar.enableExport: true` (CSV default com escopos all/filtered/selected) — formatos custom via `enableExport: { formats: [{ id, label, onSelect }] }`                                                                                                                                                                                                            |
| **View Kanban (board)**         | `viewMode="kanban"` (controlled) ou `defaultViewMode` (uncontrolled) + `kanbanConfig={{ groupByField, renderCard }}` — toggle table/kanban auto na toolbar                                                                                                                                                                                                           |
| **View Lista (cards)**          | `viewMode="list"` + `listConfig={{ renderItem(row) }}` — toggle Tabela/Lista auto na toolbar; mesma toolbar, corpo vira `<List>`. `hierarchical: true` + `getTreeDataPath` = lista em árvore. Showcase `#/clients-list-view`                                                                                                                                            |
| **Totalizer row**               | `showTotalizers` na DataTable + `aggregate: "sum"` (+ `aggregateFormatter`) na coluna; server mode pode sobrescrever via `aggregateRow`                                                                                                                                                                                                                              |
| **Keyboard navigation**         | Auto — setas, Home/End, PgUp/PgDn no body                                                                                                                                                                                                                                                                                                                            |

---

## Receitas comuns

### Server mode (refetch async + paginação remota)

```tsx
const fetchData = useCallback(
  async ({ pagination, sort, filters, search }: GridFetchParams) => {
    const res = await api.get("/clients", {
      params: serialize({ pagination, sort, filters, search }),
    });
    return { data: res.data.items, total: res.data.total }; // GridFetchResult<T>
  },
  [],
);

<DataTable<Client>
  fetchData={fetchData}
  columns={columns}
  toolbar={{ enableSearch: true, enableFilters: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
/>;
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
/>;
```

Double-click numa cell `editable` → input inline; Enter commita; Esc cancela; loading bloqueia outras edições.

### Mobile auto-switch para card

Por default, viewports `< 768px` rendem cada row como `<TableCardRow>` no lugar de `<TableRow>`. O toolbar (search/filter/sort) e o footer (paginação) continuam intactos — só o body que troca.

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  cardBreakpoint={768} // default — abaixo deste pixel, vira card
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
  estimateRowHeight={56} // opcional — default deriva da density (40/56/64)
  overscan={10} // opcional — rows extras fora da viewport
  paginationConfig={{ enabled: false }} // virtualização geralmente exclui paginação
/>
```

Usa `@tanstack/react-virtual`. Sticky header e seleção mantêm-se. Performance fica linear até ~100k rows. Requer container com altura definida (`flex-1 min-h-0` ou height fixa).

### Row grouping

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  groupBy="status" // controlled (string, 1 field na V1) — ou defaultGroupBy uncontrolled
  onGroupByChange={setGroupBy}
  // Default (sem overrides): header column-aligned com chevron + label + count + subtotals.
  // Free-form: passe os 2 overrides abaixo.
  renderGroupHeader={({ group, toggle }) => (
    <span onClick={toggle}>
      {group.label} ({group.count})
    </span>
  )}
  renderGroupContent={({ group }) => <CardsGrid rows={group.rows} />}
/>
```

Pagination é desligada **automaticamente** quando `groupBy` está ativo. Sem os overrides, o default é column-aligned (mantém grid layout); com `renderGroupHeader`/`renderGroupContent`, o grupo vira free-form (full-width, ideal pra hierarquias complexas). Referência: `src/preview/pages/ClientsGroupedPreview.tsx` (2 modos).

### Row expansion (painel detalhe)

```tsx
const columns = [
  { field: "id", headerName: "ID", expandable: true }, // ← chevron + click trigger
  // ...
];

<DataTable<Client>
  rows={clients}
  columns={columns}
  renderRowExpansion={({ row }) => <ClientDetailPanel client={row} />}
  singleExpand // opcional — default false (múltiplas rows abertas)
/>;
```

O chevron aparece na coluna marcada `expandable: true`. Controlled opcional via `expandedRowIds` + `onExpandedRowIdsChange` (ou `defaultExpandedRowIds` uncontrolled). Mutuamente exclusivo com `groupBy` (groupBy tem precedência). Referência: `src/preview/pages/ClientsExpandablePreview.tsx`.

### Tree-data (hierarquia multi-nível)

Hierarquia tipo AG Grid: cada linha continua **FLAT** em `rows` e o **caminho** (`getTreeDataPath`) define a árvore. O DataTable reconstrói os níveis a partir dos caminhos e renderiza indentação + chevron na coluna primária.

```tsx
const columns = [
  { field: "name", headerName: "Licenciado", treeColumn: true }, // ← coluna primária da árvore
  // ...
];

// O path sobe a cadeia de patrocinador até a raiz: ["L-001", "L-010", "L-100"]
const byId = new Map(rows.map((r) => [r.id, r]));
const getTreeDataPath = (row: NetworkRow): string[] => {
  const path: string[] = [];
  let cur: NetworkRow | undefined = row;
  while (cur) {
    path.unshift(cur.id);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return path;
};

<DataTable<NetworkRow>
  rows={rows} // ← FLAT (não aninhadas)
  columns={columns}
  getRowId={(r) => r.id}
  getTreeDataPath={getTreeDataPath}
  treeData={{
    defaultExpanded: true, // árvore começa aberta (default true)
    showDescendantCount: true, // mostra "(N)" descendentes ao lado do nome
  }}
/>;
```

Regras:

- `getTreeDataPath(row)` retorna o array do caminho (`[raiz, ..., self]`). Linhas com path vazio são ignoradas da árvore.
- Se **nenhuma** coluna marcar `treeColumn: true`, o DataTable usa a primeira coluna não-`actions`.
- Estado de expansão reusa a máquina de row-expansion (`expandedRowIds` / `defaultExpandedRowIds` / `onExpandedRowIdsChange`). O Set guarda os ids que **divergem** do `defaultExpanded`.
- **Pagination desliga automaticamente** (paginar cortaria ramos). Não suportado em server mode — passe todas as rows do escopo + `virtualize` se necessário.
- Precedência quando mais de um modo é passado: `groupBy` > `getTreeDataPath` > `renderRowExpansion`.
- Search/sort operam sobre as rows; a árvore é reconstruída do resultado.
- **Expand-all / collapse-all** programático via imperative ref: `ref.current.expandAllTree()` / `ref.current.collapseAllTree()` (ver seção [Imperative ref](#imperative-ref)). No-op fora do modo tree-data. Respeita `treeData.defaultExpanded` e opera sobre todas as rows pós-filtro/sort. O DS não embute botões na toolbar — o consumer fia os botões e chama via ref.

```tsx
const tableRef = useRef<DataTableRef>(null);

<button onClick={() => tableRef.current?.expandAllTree()}>Expandir tudo</button>
<button onClick={() => tableRef.current?.collapseAllTree()}>Recolher tudo</button>

<DataTable<NetworkRow> ref={tableRef} getTreeDataPath={getTreeDataPath} /* ... */ />
```

Referência: `src/preview/pages/ClientsTreePreview.tsx`.

### Polish de célula — Read-more (Ler mais)

Trunca conteúdo longo e abre o texto completo num popover ao clicar em "Ler mais". Equivalente DS do `ReadMoreCell` legado (que usava tooltip).

```tsx
const columns = [
  // 1 linha + reticências + gatilho "Ler mais" (default)
  { field: "obs", headerName: "Observação", readMore: true },
  // N linhas antes de truncar + label custom
  {
    field: "bio",
    headerName: "Bio",
    readMore: { lines: 2, label: "Ver tudo" },
  },
];
```

- `readMore: true` → 1 linha, label "Ler mais". `readMore: { lines?, label? }` customiza.
- Desativa o `ellipsis` da cell automaticamente (a add-on gerencia o próprio truncate).
- Aplica-se ao render default **ou** ao `render` custom (o nó é envolvido). Ignorado em `type: "actions"`, células em edição e na coluna primária de tree-data.
- O texto do popover deriva do `valueFormatter`/`formatValue`/value (string) — pra HTML rico, passe um `render` que retorna o nó; ele é exibido no popover.

### Polish de célula — Copy (copiar valor)

Ícone de copiar revelado no hover/foco da célula, com feedback "Copiado!" por ~2s. Usa `navigator.clipboard` — **sem dependência nova**.

```tsx
const columns = [
  // copia o texto renderizado da célula
  { field: "email", headerName: "E-mail", copyable: true },
  // copia um valor derivado da row (ex: id puro) + aria-label custom
  {
    field: "doc",
    headerName: "CPF",
    copyable: { value: (row) => row.cpfRaw, label: "Copiar CPF" },
  },
];
```

- `copyable: true` → copia o texto da célula. `copyable: { value?, label? }` customiza: `value` aceita string ou `(row) => string`; `label` é o aria-label/title do botão.
- O ícone só aparece no hover/foco (não polui a célula). O click não dispara `onRowClick`/seleção.
- `readMore` tem precedência: se ambos forem definidos na mesma coluna, vale `readMore`.

### Grab-to-scroll horizontal

Arrastar o corpo da tabela (mouse/pen) pra rolar lateralmente — equivalente ao `useGrabToScroll` legado.

```tsx
{/* nativo — nada a fazer; pra desligar: */}
<DataTable<Client> rows={clients} columns={columns} grabToScroll={false} />
```

- Prop raiz `grabToScroll: boolean` — **nativo, default `true`** (todas as tabelas já vêm com ele; passe `false` pra desabilitar).
- Um arrasto só inicia após ~6px de movimento → clique/seleção de célula preservados; o clique pós-arrasto é suprimido.
- **Scroll por roda do mouse permanece intacto.** Pulado em touch (scroll nativo já funciona) e em alvos interativos (botões, inputs, células editáveis/expansíveis/de seleção/ações).

### Tela cheia (fullscreen)

Toggle ⤢ na toolbar expande a DataTable pra ocupar a viewport inteira; segundo clique ou **Esc** volta.

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  toolbar={{ enableFullscreen: true }}
/>
```

- `toolbar.enableFullscreen: true` (default `false`) renderiza o tool button entre Filtros e Configurações.
- O container raiz vira overlay `fixed inset-0` (z-index `--z-index-modal`) com bg do canvas. Estado interno uncontrolled.

### View Kanban (table ⇄ board)

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  defaultViewMode="kanban" // uncontrolled — ou viewMode + onViewModeChange (controlled)
  kanbanConfig={{
    groupByField: "status", // valor do field define a coluna do board
    renderCard: ({ row }) => ({
      // slots do card — id/columnId são derivados automaticamente
      title: row.name,
      subtitle: row.email,
      value: formatBRL(row.value),
    }),
    enableDnD: true,
    onCardMove: (cardId, from, to) => patchStatus(cardId, to),
  }}
/>
```

Quando `viewMode`/`defaultViewMode` + `kanbanConfig` estão definidos, a toolbar auto-renderiza o segmented table/kanban (override/esconda via `toolbar.viewToggle`). Filter/search/sort/selection continuam aplicados às rows; paginação, density toggle e columns popover são desligados automaticamente no board. `kanbanConfig.columns` (opcional, `KanbanColumn[]`) fixa ordem/label/dotColor das colunas — sem ele, as colunas derivam dos valores únicos de `groupByField`. Outras opções do `kanbanConfig`: `renderCardContent` (override total do miolo do card), `getCardMenuItems`/`getColumnMenuItems` (menus "⋯"), `onAddCard`/`onAddInFooter`, `emptyLabel`/`addLabel`.

### View Lista (table ⇄ list)

```tsx
<DataTable<Client>
  rows={clients}
  columns={columns}
  viewMode={viewMode}            // "table" | "list" | "kanban"
  onViewModeChange={setViewMode} // ou defaultViewMode (uncontrolled)
  listConfig={{
    renderItem: (row, { depth }) => (
      <div className="flex w-full items-center gap-gp-lg">
        <Avatar size="md" colorHex={row.avatarColor}>{row.initials}</Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-md font-semibold">{row.name}</span>
          <span className="truncate text-caption-md text-fg-muted">{row.email}</span>
        </div>
        <Chip color="success" variant="soft" size="sm" shape="pill">Ativo</Chip>
      </div>
    ),
    // hierarchical: true,  // + getTreeDataPath → lista em ÁRVORE (conectores)
    // getMenuItems: (row) => [...],  // menu "⋯" por item
  }}
/>
```

`listConfig` habilita a 3ª view: o toggle vira **Tabela / Lista** (+ Kanban se `kanbanConfig`). O DataTable mantém a **MESMA toolbar** (busca/filtros/views/ações/totalizadores) e só troca o corpo por um `<List>` do DS, alimentado pelas rows processadas (`filter+search+sort`; por padrão **sem paginação** — mostra todas, igual ao kanban). Passe `listConfig.paginated: true` pra **paginar a lista flat** (usa a mesma paginação da tabela + mostra o footer; ignorado em `hierarchical`). `listConfig.renderItem(row, { depth, open })` desenha o card de cada item. Com `hierarchical: true`, a lista aninha em árvore com indentação/conectores e `depth` por nível, usando `listConfig.getPath` (caminho raiz→self) — ou, se ausente, o `getTreeDataPath` do DataTable. **Use `listConfig.getPath` quando quiser tabela FLAT (paginada) + lista em ÁRVORE** no mesmo DataTable (o `getTreeDataPath` ligaria o tree-data na tabela e desligaria a paginação). Showcase: `#/clients-list-view`.

### Saved views

```tsx
import { savedViewsMockService } from "@/components/ui/DataTable";

<DataTable<Client>
  rows={clients}
  columns={columns}
  savedViewsService={savedViewsMockService} // troque pelo seu service em prod
/>;
```

Service contract em `services/saved-views.types.ts` — `list / save / delete` (todos recebem `persistId` como primeiro arg). Persiste o `DataTableSavedViewState` (filterModel, sortModel, density, layout de colunas, viewMode, groupBy, expandedRowIds) como JSON — `search` e paginação são voláteis e NÃO entram na view.

**`allowCreateView` (v0.23.0)** — `allowCreateView={false}` esconde o botão "+" das visões (exibe SÓ os `defaultViews` + Default, read-only; o usuário não cria/salva visões). Default `true`.

**viewMode "sticky" ao trocar de visão (v0.23.0)** — aplicar uma visão (preset/Default) só troca o `viewMode` se a visão **definir um explicitamente** (ex.: preset salvo em Lista/Kanban). Presets sem `viewMode` (o caso comum) **mantêm** o que o usuário está vendo — alternar de visão não flipa Tabela↔Lista↔Kanban. Pra um preset abrir numa view específica, passe `viewMode` no `presetView({ ... })`.

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
  // obrigatório (sem `?` no type) — input do popover do chip rápido.
  // Pode reusar o mesmo widget do renderFilterInput.
  renderFastFilterInput: ({ value, onChange }) =>
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

| Prop                        | Tipo                           | Default        | Quando usar                                                                            |
| --------------------------- | ------------------------------ | -------------- | -------------------------------------------------------------------------------------- |
| `simpleFilter.hiddenFields` | `string[]`                     | `[]`           | Fields que NÃO aparecem no drawer do funil (só no avançado). Útil pra filtros técnicos |
| `simpleFilter.title`        | `string`                       | `"Filtros"`    | Override do título do header do drawer                                                 |
| `simpleFilter.size`         | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` (400px) | Use `"lg"` (560px) se há muitos campos com widgets largos (dates/multi-select)         |

---

## ⚠️ filterModel controlado — operator correto por filterType

**Quando passar `filterModel` como prop controlada (em vez de uncontrolled), use o operator
correto pro `filterType` da coluna.** Operator errado = popover Filtros mostra o Select de
operador **vazio** porque o operator não está nos `operators` do column-type.

| `filterType` da coluna | Operators válidos                                                                             | Default sugerido |
| ---------------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| `multiSelect`          | `isAnyOf`, `isNoneOf`, `isEmpty`, `isNotEmpty`                                                | `isAnyOf`        |
| `select`               | `equals`, `neq`, `isEmpty`, `isNotEmpty`                                                      | `equals`         |
| `text` (default)       | `contains`, `notContains`, `equals`, `neq`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty` | `contains`       |
| `number`               | `equals`, `neq`, `gt`, `lt`, `gte`, `lte`                                                     | `equals`         |
| `date`                 | `between`, `equals`, `gt`, `lt`, `gte`, `lte`                                                 | `between`        |
| `boolean`              | `equals`                                                                                      | `equals`         |

```tsx
// ❌ ERRADO — Status é multiSelect mas operator é "equals"
// → Popover Filtros mostra Select operador VAZIO
const INITIAL_FILTERS: FilterModel = {
  items: [{ id: "f1", field: "statusId", operator: "equals", value: "active" }],
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
tableRef.current?.exportCsv("filtered");  // download CSV — escopo "all" | "filtered" | "selected"
tableRef.current?.resetPersistedState();  // limpa o localStorage (no-op sem persistId)
tableRef.current?.expandAllTree();        // tree-data: expande todos os nós (no-op fora de tree-data)
tableRef.current?.collapseAllTree();      // tree-data: recolhe todos os nós (no-op fora de tree-data)
```

`expandAllTree` / `collapseAllTree` só fazem efeito em modo tree-data (`getTreeDataPath`). Operam sobre todas as rows pós-filtro/sort (tree-data desliga paginação) via `collectExpandableTreeIds` e respeitam `treeData.defaultExpanded` — escrevem o Set de divergência correto (`[]` ou todos os ids expansíveis).

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
- `enableFullscreen?` (false) — botão ⤢ na toolbar (entre Filtros e Configurações) que expande a tabela pra viewport inteira; Esc volta
- `moreMenu?` — `{ items: DataTableMoreMenuItem[] }` — MoreMenu (⋯) no canto direito
- `customLeft?` — ReactNode livre após search/refresh (controls custom)
- `viewToggle?` — override/esconde o segmented table/kanban auto-renderizado

> Bulk actions vão em `selectionConfig.actions` (não no toolbar). Preset views vão na prop
> `defaultViews` da DataTable (não no toolbar).

### `paginationConfig`

- `enabled` (true)
- `initialPageSize` (25)
- `pageSizeOptions` ([10, 25, 50, 100])

> O modo client/server **não é prop** — é derivado automaticamente de `rows` vs `fetchData`.

### `selectionConfig`

- `enabled` (false)
- `enableGlobal` (false) — "selecionar todos" com modo include/exclude
- `actions?: (selectedIds: GridRowId[], clearSelection: () => void) => ReactNode` — render-prop chamada dentro do BulkActionsBar (NÃO é ReactNode direto)

### `getRowId?: (row: T) => GridRowId` (prop raiz)

Extrai o id da row — default `row.id`. É prop top-level da DataTable, **não** vai dentro de `selectionConfig`.

### `densityItems?: ToolbarSegmentedItem<TableDensity>[]`

Customiza os 3 botões do segmented. Default: compact / standard / comfortable.

### `cardBreakpoint?: number | false`

- `number` (default `768`) — viewport `< N px` ativa o card mode (rows viram `<TableCardRow>`)
- `false` — desabilita o auto-switch (mantém table view em qualquer viewport)

Use `false` em telas onde o card mode não faz sentido (ex: tabela dentro de modal pequeno que já é mobile-friendly de outra forma).

### `autoFit?: boolean` (default `true`)

Auto-distribui as colunas para ocupar todo o container, em 3 camadas:

1. **Type Heuristics** — cada `column.type` tem `defaultWidth` do registry. Se a coluna define `width`, esse vira a **base/mínimo** da coluna (ver Flex Distribution).
2. **Smart Content Sampling** — mede o texto do header + primeiras 20 rows via canvas (`measureText`) e ajusta width pra caber o conteúdo. Respeita `col.minWidth` e `col.maxWidth`.
3. **Flex Distribution (proporcional)** — sobrando espaço no container, distribui **proporcionalmente** entre as colunas (peso = largura-base de cada uma), como uma tabela flex faz naturalmente. Colunas pequenas crescem pouco, largas crescem mais — sem "coluna gigante" puxando 100% do espaço. Funciona pra qualquer nº de colunas.

**Header nunca trunca (`...`):** toda coluna tem como piso a largura necessária pra mostrar o `headerName` inteiro (texto + ícone de tipo + reserva de sort/menu). Isso vale **inclusive** pra colunas com `width` explícito menor que o header — a width do consumer não pode esconder o título (só `maxWidth` menor que o header trunca, e aí é decisão explícita do consumer).

**`col.width` é base, não trava fixa (v0.19.2+):** colunas com `width` explícito entram na distribuição proporcional usando a width como piso (crescem pra preencher, nunca encolhem abaixo dela). Antes a width era 100% fixa, o que jogava todo o espaço sobrando na única coluna sem width (virava "coluna gigante"). Pra travar uma coluna de fato, use `width` + `maxWidth` iguais (ou um `type` fixo como `actions`/`checkbox`, que ficam fora do flex). Se **todas** as colunas têm `width` explícito, o layout fixo do consumer é respeitado e o espaço sobrando fica vazio à direita.

Observado via `ResizeObserver` no container — recalcula quando viewport muda. Re-mede e re-aplica de forma consistente ao alternar **Tabela ↔ Lista** (o corpo da tabela desmonta na view Lista; ao voltar, o autoFit reata o observer no node novo — mesma distribuição da 1ª carga).

**Precedência de width:** resize manual (drag pelo user) > autoFit > `col.width` > `typeDef.defaultWidth`.

**Para desligar:** `autoFit={false}` mantém comportamento legacy (cada coluna usa `col.width` ou default fixo; espaço sobrando vira vazio à direita). Resize manual continua disponível em ambos os modos.

```tsx
// Default — fluid automático
<DataTable rows={rows} columns={cols} />

// Opt-out
<DataTable rows={rows} columns={cols} autoFit={false} />

// width = BASE/mínimo (cresce proporcional p/ preencher). Pra TRAVAR de fato,
// use width + maxWidth iguais, ou um type fixo (actions/checkbox).
const cols = [
  { field: "id", width: 80, maxWidth: 80 }, // travada em 80px
  { field: "code", width: 120 },             // base 120, cresce no flex
  { field: "name" },                          // sem width — flui pelo autoFit
  { field: "actions", type: "actions", width: 60 }, // fixa (fora do flex)
];
```

> Nota: o melhor padrão é **não** setar `width` nas colunas de dados e deixar o autoFit
> distribuir (as skills `crud-builder`/`list-builder` geram assim). Setar `width` em
> todas as colunas trava o layout e deixa espaço vazio à direita.

### `grabToScroll?: boolean` (**nativo — default `true`**)

Grab-to-scroll horizontal: arrastar o corpo da tabela (mouse/pen) rola lateralmente. **Já vem ligado em todas as tabelas** — não precisa configurar. Threshold de ~6px separa arrasto de clique (seleção/click de célula preservados; o clique pós-arrasto é suprimido). Scroll por roda intacto; pulado em touch e alvos interativos. Passe `grabToScroll={false}` só se quiser desabilitar.

```tsx
{/* nativo — nada a fazer. Pra desligar: */}
<DataTable rows={rows} columns={cols} grabToScroll={false} />
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
ref.current?.resetPersistedState(); // remove entry inteira do localStorage
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

| Sintoma                                  | Causa provável                               | Fix                                                                              |
| ---------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| Tabela re-renderiza inteira a cada digit | `columns` não memoizado                      | `useMemo(() => [...], [deps])`                                                   |
| Filter chip não aparece                  | Coluna sem `enableColumnFilter: true`        | Adicionar flag                                                                   |
| Filter popover vazio                     | Nenhuma coluna com `enableColumnFilter`      | Adicionar a pelo menos 1 coluna                                                  |
| Sort não funciona                        | Coluna sem `sortable: true`                  | Adicionar flag                                                                   |
| Density não persiste                     | `persistId` ausente                          | Adicionar `persistId="meu-table"`                                                |
| Server mode loop infinito                | `fetchData` não memoizado                    | `useCallback(fetchData, [deps])`                                                 |
| Virtualização "pula"                     | `estimateRowHeight` muito diferente do real  | Ajustar pro height médio observado                                               |
| Inline edit não salva                    | `onCellEditCommit` retorna sem await         | Retornar Promise; controller aguarda                                             |
| Saved views não persiste                 | `savedViewsMockService` em prod              | Implementar `SavedViewsService` real                                             |
| Group header sem totalizer               | Coluna sem `aggregate` declarado             | Definir `aggregate: "sum" \| "avg" \| "count" \| "min" \| "max" \| fn` na coluna |
| Coluna actions com filter chip           | `type: "actions"` deveria desabilitar filter | Reportar — esse type bloqueia sort/filter por design                             |

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
