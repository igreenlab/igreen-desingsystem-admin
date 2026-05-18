# Design Spec — `<Table>` + `<DataTable>`

**Data:** 2026-05-12
**Status:** Draft — aprovação pendente
**Pipeline:** brainstorming → spec → writing-plans → fases F1…F8

---

## 1. Objetivo

Construir dois componentes complementares no iGreen DS:

- **`<Table>`** — primitivo de render em divs (não `<table>` semântico). Apresentação + comportamento visual puro. Usável standalone.
- **`<DataTable>`** — composição completa pra telas de CRUD: `<TableToolbar>` + `<Table>` + `<FooterTable>` + estado (sort, filtros, busca, paginação, seleção, persistência, saved views, export).

O `<DataTable>` é o componente que vai sustentar ~90% das telas de listagem do CRM.

## 2. Referências consultadas

- **Visual:** dialeto dos componentes irmãos já no DS (`Button`, `Chip`, `TableToolbar`, `FooterTable`) + tokens já mapeados em `tokens/brands/default/semantic/color-light.ts:80-83` (`bg.table`, `bg.table-head`, `bg.table-row-hover`, `border.table`).
- **Lógica/arquitetura:** `design-tabela/src/components/data-grid/` (referência funcional, NÃO copiar features). Padrão "Maestro" com hooks SRP + Context híbrido + Strategy Pattern pra Column Types.
- **`design-and-table-v2/page.js`** referenciado pelo usuário só contém Shell + PageHead + Toolbar (a grade visual em si nunca foi codificada lá — vai ser desenhada do zero).

## 3. Decisões fechadas no brainstorming

### 3.1 Fronteira `<Table>` vs `<DataTable>`

| Comportamento | `<Table>` | `<DataTable>` |
|---|---|---|
| Render de divs + densidade + sticky head + hover/selected visual | ✅ | — |
| Pin left/right (sticky com offsets) | ✅ controlado por props | orquestra |
| Resize de coluna (drag handle) | ✅ controlado por props | orquestra |
| Sort indicator visual + clique | ✅ controlado por props | orquestra |
| Cell align, ellipsis, label (card mode) | ✅ | — |
| Responsive card mode | ✅ via `cardBreakpoint` prop | passa adiante |
| Sort de dados / filtros / busca / paginação | ❌ | ✅ |
| Selection state | ❌ (visual via prop) | ✅ |
| Hide/show + reorder de colunas | ❌ | ✅ |
| Persistência localStorage / saved views | ❌ | ✅ |
| Column Types Registry | ❌ | ✅ |
| Export CSV | ❌ | ✅ |

### 3.2 Card mode (responsive)

- **Trigger:** container query `@container (max-width: <cardBreakpoint>px)` (não viewport) — vira card também em sidebars/drawers estreitos. O root do `<Table>` declara `container-type: inline-size`. Prop `cardBreakpoint?: number | false` (default `768`, `false` desativa o modo card).
- **Anatomia do card:**
  - Header: `[checkbox]` à esq · `[primary column]` em destaque (peso 500) · `[actions]` à dir
  - Body: demais colunas visíveis viram `Label: valor` empilhado na ordem do `columnOrder`
- **Coluna primary:** marcada com `isPrimary: true` no `ColumnDef`. Default: primeira não-checkbox/actions.
- **No card mode são ignorados:** width, resize, pin (não fazem sentido vertical).
- **Sort indicator** desaparece no card mode (sort passa a ser feito via popover do toolbar).

### 3.3 Motor do `<DataTable>`

| # | Decisão | Detalhe |
|---|---|---|
| 1 | Modos client/server com auto-detecção | Presença de `fetchData` → server |
| 2 | Selection model include/exclude | `{type: 'include'\|'exclude', ids: Set}` + select all global |
| 3 | Persistência localStorage opt-in | Via `persistId`. **Salva:** density, columnWidths, pinnedColumns, hiddenColumns, columnOrder, sortModel, pageSize. **Não salva:** filters, search, page |
| 4 | Saved views | Mock service via interface trocável (`SavedViewsService`) |
| 5 | Column types | 8 essenciais via Registry extensível: `text`, `number`, `currency`, `date`, `status`, `boolean`, `user`, `actions` |
| 6 | Filtros avançados | **Sem modal próprio.** Usar [`filter-popover`](../../../src/components/ui/TableToolbar/popovers/filter-popover.tsx) existente do `TableToolbar` |
| 7 | Virtualização | **Não na v1.** Page sizes 10/25/50/100. Datasets grandes → server mode |
| 8 | Export CSV | Opt-in via `toolbar.enableExport`. 3 escopos: todos / filtrados / selecionados |
| 9 | Ref imperativa | `refresh()`, `getState()`, `getSelectedIds()`, `getSelectedCount()`, `clearSelection()` |

### 3.4 Tokens novos (já aprovados e implementados)

Adicionados em `color-light.ts` + `color-dark.ts` antes deste spec:

- `bg.table-row-selected` · light: `color-mix(in oklch, brand[600] 6%, transparent)` · dark: `color-mix(in oklch, brandContrast[400] 10%, transparent)`
- `bg.table-row-selected-hover` · light: `color-mix(in oklch, brand[600] 10%, transparent)` · dark: `color-mix(in oklch, brandContrast[400] 14%, transparent)`

**Pendente:** `npm run tokens:tw4` (usuário roda).

### 3.5 Abordagem arquitetural escolhida

**Maestro híbrido** (igual `design-tabela/`):

- `data-table.tsx` é maestro — só conecta hooks a componentes
- Lógica em hooks SRP (1 arquivo por responsabilidade)
- Context provider memoizado distribui estado
- `DataTableRow` desacoplado do contexto (recebe props) + `React.memo` → "Proteção na Ponta" pra evitar re-render em cascata
- Reducer único (alternativa B) descartado: acopla demais
- Zustand (alternativa C) descartado: dependência externa só pra ganhar selectors que `React.memo` resolve

## 4. Estrutura de arquivos

```
src/components/ui/
├── Table/                          # passo 1
│   ├── table.tsx
│   ├── table-card-row.tsx
│   ├── table.styles.ts
│   ├── table.types.ts
│   ├── use-column-widths.ts        # hook INTERNO do <Table> — calcula widths efetivos + pinOffsets a partir de props
│   ├── use-column-resize.ts        # hook INTERNO do <Table> — drag handle (mousedown/move/up) reportando delta via onResize
│   └── index.ts
│
└── DataTable/                      # passo 2
    ├── data-table.tsx              # Maestro
    ├── data-table.styles.ts
    ├── data-table.types.ts
    ├── context/
    │   └── data-table-context.tsx
    ├── hooks/                      # 14 hooks SRP
    │   ├── use-data-table-controller.ts
    │   ├── use-data-table-columns.ts
    │   ├── use-data-table-sort.ts
    │   ├── use-data-table-filters.ts
    │   ├── use-data-table-fast-filters.ts
    │   ├── use-data-table-search.ts
    │   ├── use-data-table-pagination.ts
    │   ├── use-data-table-selection.ts
    │   ├── use-data-table-processor.ts
    │   ├── use-data-table-query.ts
    │   ├── use-data-table-state-persistence.ts
    │   ├── use-data-table-saved-views.ts
    │   ├── use-data-table-export.ts
    │   └── use-data-table-density.ts
    ├── column-types/
    │   ├── registry.ts
    │   ├── column-type.types.ts
    │   ├── definitions/
    │   │   ├── text.tsx
    │   │   ├── number.tsx
    │   │   ├── currency.tsx
    │   │   ├── date.tsx
    │   │   ├── status.tsx
    │   │   ├── boolean.tsx
    │   │   ├── user.tsx
    │   │   └── actions.tsx
    │   └── index.ts
    ├── services/
    │   ├── saved-views.types.ts
    │   └── saved-views-mock-service.ts
    ├── parts/
    │   ├── data-table-empty.tsx
    │   ├── data-table-loading.tsx
    │   ├── data-table-no-results.tsx
    │   └── data-table-floating-bulk-bar.tsx
    └── index.ts
```

## 5. API pública

### 5.1 `<Table>` — primitivo

API "lego" controlada (não recebe `columns`/`rows` agregados — usável fora do `<DataTable>`):

```tsx
<Table density="standard" cardBreakpoint={768} ariaLabel="Clientes">
  <TableHead sticky>
    {columns.map(col => (
      <TableHeadCell
        key={col.field}
        width={widths[col.field]}
        pinned={col.pinned}
        pinOffset={offsets[col.field]}
        align={col.align}
        sortDirection={sortBy === col.field ? sortDir : null}
        onSortClick={() => onSort(col.field)}
        onResize={(delta) => onResize(col.field, delta)}
        resizable={col.resizable !== false}
      >
        {col.headerName}
      </TableHeadCell>
    ))}
  </TableHead>
  <TableBody>
    {rows.map(row => (
      <TableRow key={row.id} selected={isSelected(row.id)} onClick={() => onRowClick?.(row)}>
        {columns.map(col => (
          <TableCell
            key={col.field}
            width={widths[col.field]}
            pinned={col.pinned}
            pinOffset={offsets[col.field]}
            align={col.align}
            ellipsis={col.ellipsis}
            label={col.headerName}   // usado no card mode
          >
            {col.render ? col.render({row, value: get(row, col.field)}) : get(row, col.field)}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Props do `<Table>` root:** `density` ('compact'|'standard'|'comfortable', default 'standard'), `cardBreakpoint` (number|false, default 768), `ariaLabel` (string).

**Props do `<TableHead>`:** `sticky` (boolean, default `true` — header sticky no topo do scroll).

**Variants (`table.styles.ts` slots tv):** `density: compact|standard|comfortable`, `mode: table|card`, `selected: bool`, `pinned: left|right|null`, `align: left|center|right`, `sortable: bool`, `sortDirection: asc|desc|null`, `sticky: bool`.

**ARIA:** `role="grid"`, `role="rowgroup"`, `role="row"`, `role="columnheader"` (com `aria-sort`), `role="gridcell"`.

### 5.2 `<DataTable>` — composto

```tsx
<DataTable<Client>
  rows={rows}
  fetchData={fetchClients}              // presença → server
  columns={columns}
  getRowId={(r) => r.id}
  rowCount={total}                      // obrigatório server mode

  persistId="clients-table"             // opt-in localStorage

  toolbar={{
    title: "Clientes",
    enableSearch: true,
    enableFilters: true,
    enableColumns: true,
    enableExport: true,
    enableDensity: true,
    enableViewMode: true,
    enableSavedViews: true,
    customLeft: <CustomLeftSlot />,
    customActions: <CustomActions />,
  }}

  paginationConfig={{
    enabled: true,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  }}

  selectionConfig={{
    enabled: true,
    enableGlobal: true,
    actions: (ids, clear) => <BulkActions ids={ids} onDone={clear} />,
  }}

  density="standard"
  cardBreakpoint={768}
  className="..."

  // Controlado opcional
  sortModel={sortModel}
  onSortModelChange={setSortModel}
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
  selectionModel={selectionModel}
  onSelectionModelChange={setSelectionModel}

  // Callbacks de linha
  onRowClick={(row) => router.push(`/clients/${row.id}`)}
  onRowChange={(row) => updateClient(row)}
  getRowClassName={({row}) => row.status === 'overdue' ? 'opacity-60' : ''}

  // Slots de feedback
  renderLoading={<MyLoader />}
  renderEmpty={<MyEmpty />}
  renderNoResults={<MyNoResults />}

  ref={tableRef}
/>
```

### 5.3 `ColumnDef<T>`

```ts
interface ColumnDef<T> {
  field: keyof T | string;             // dot-path: 'user.name'
  headerName: string;
  type?: ColumnType;                   // 'text' | 'number' | 'currency' | 'date' | 'status' | 'boolean' | 'user' | 'actions'
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  pinned?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  resizable?: boolean;                 // default true
  sortable?: boolean;                  // default true
  hideable?: boolean;                  // default true
  isPrimary?: boolean;                 // título no card mode
  enableColumnFilter?: boolean;
  filterType?: 'text' | 'select' | 'multiSelect' | 'date' | 'boolean' | 'number';
  filterOptions?: Array<{label: string; value: any; color?: string}>;
  defaultFilterValue?: FilterValue;
  render?: (params: {row: T; value: any}) => ReactNode;
  valueGetter?: (row: T) => any;
  valueFormatter?: (value: any) => string;
}
```

### 5.4 `DataTableRef`

```ts
interface DataTableRef {
  refresh: () => void;
  getState: () => DataTableState;
  getSelectedIds: () => (string | number)[];
  getSelectedCount: () => number;
  clearSelection: () => void;
}
```

## 6. Contrato dos hooks

| Hook | Responsabilidade | Output principal |
|------|------------------|------------------|
| `useDataTableController` | Maestro — chama todos, agrega em objeto único | `{styles, contextValue, rowsToRender, isLoading, handlers...}` |
| `useDataTableColumns` | Widths reais (px), pinOffsets, ordem efetiva, visíveis. `handleResize` aqui invoca persist quando `persistId` ativo | `{effectiveColumns, columnWidths, stickyOffsets, hiddenColumns, columnOrder, handleResize, handlePin, handleHide, handleReorder}` |

> Nota: os hooks **internos do `<Table>`** (`use-column-widths`, `use-column-resize` listados em §4) **não estão nesta tabela** — eles são puros, sem persist/state global, e só servem ao `<Table>` standalone. O `useDataTableColumns` aqui orquestra esses hooks via props.
| `useDataTableSort` | Sort controlado/não-controlado, ciclo asc/desc/null | `{sortModel, handleSort}` |
| `useDataTableFilters` | `{items, logic}` aplicado client ou enviado server | `{filterModel, setFilterModel}` |
| `useDataTableFastFilters` | Chips inline + applied. Merge com filterModel | `{fastFilters, setFastFilters, applied}` |
| `useDataTableSearch` | Global + por coluna. Debounce 500ms | `{search, searchField, setSearch}` |
| `useDataTablePagination` | `{page, pageSize}` + auto-reset ao mudar filtro/sort | `{paginationModel, setPage, setPageSize}` |
| `useDataTableSelection` | Include/exclude + isRowSelected + select page/global | `{selection, toggleRow, selectPage, selectGlobal, clear}` |
| `useDataTableProcessor` | **Client:** pipeline cascateado `filter → search → sort → paginate` em useMemo. Mudar página não roda filtro/sort. | `{processedRows, totalAfterFilter}` |
| `useDataTableQuery` | **Server:** chama `fetchData` quando deps mudam. Debounce 500ms na busca. Loading/error/refreshKey. | `{data, total, loading, error, refresh}` |
| `useDataTableStatePersistence` | Hidrata localStorage no mount; salva no unmount + onChange | hidratação automática (efeito) |
| `useDataTableSavedViews` | CRUD via interface `SavedViewsService`. Mock service na v1 | `{views, current, save, delete, apply}` |
| `useDataTableExport` | CSV em 3 escopos. Aplica `valueFormatter` por célula | `{exportCsv: (scope) => void}` |
| `useDataTableDensity` | Density controlado/não-controlado | `{density, setDensity}` |

## 7. Composição visual interna do `<DataTable>`

```
<div className="wrapper">                          // rounded-radius-xl + border + shadow-sh-sm + bg-bg-table
  <TableToolbar                                    // existente
    left={ <ToolbarSearch /> + <ToolbarTabs /> }
    actions={ ToolbarToolButtons baseados em toolbar.* }
    bulkBar={ selection.count > 0 ? <FloatingBulkBar/> : null }
  />

  <ToolbarApplied                                  // existente
    appliedFilters={ mergeFilters(filterModel, fastFilters) }
  />

  <FastFiltersRow                                  // parts/ — chips inline por coluna
    columns={columnsWithFastFilter}
    values={fastFilters}
  />

  <Table density={density} cardBreakpoint={768}>   // novo (passo 1)
    <TableHead sticky> ... </TableHead>
    <TableBody> ... </TableBody>
  </Table>

  {paginationConfig.enabled && (
    <FooterTable                                   // existente
      totalCount={effectiveTotal}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      selectionCount={selection.count}
    />
  )}
</div>

{selection.count > 0 && <FloatingBulkActionsBar />}  // portal, position fixed
```

**Popovers usados:** os 4 já existentes em `src/components/ui/TableToolbar/popovers/` — `filter-popover`, `sort-popover`, `cols-popover`, `views-popover`. **Não criar novos.**

## 8. Plano de fases (PRs)

| Fase | Escopo | PR # |
|------|--------|------|
| **F1** | `<Table>` primitivo: render + densidade + sticky head + selected/hover + pin sticky + responsive card | 1 |
| **F2** | `<Table>` resize + sort indicator | 1 |
| **F3** | `<DataTable>` esqueleto + client mode mínimo (Provider + Controller + processor + columns + sort + selection + pagination) | 1 |
| **F4** | `<DataTable>` toolbar plugada (search + filtrar/ordenar/cols popovers + density) | 1 |
| **F5** | `<DataTable>` server mode (`useDataTableQuery` + debounced search + auto-refetch) | 1 |
| **F6** | `<DataTable>` fast filters chips + applied bar | 1 |
| **F7** | `<DataTable>` persistência localStorage + saved views (mock) + ColumnTypes registry com 8 tipos | 1-2 |
| **F8** | `<DataTable>` export CSV + floating bulk bar + select global | 1 |

**Cada fase é revisada pelo DS Reviewer antes da próxima começar.**

**Tempo estimado total:** 8-10 PRs.

## 9. Performance — critérios obrigatórios da implementação

Performance é critério **bloqueante** desta v1, não opcional. As decisões abaixo são derivadas direto do `design-tabela/` (que comprovou escalar) e devem ser respeitadas:

### 9.1 Memoização do `contextValue`

```ts
// data-table.tsx
const contextValue = useMemo(() => ({
  styles, density, selection, filters, columnWidths, stickyOffsets,
  containerRef, bodyRef, /* ... */
}), [
  styles, density.value, selection.state, filters.model,
  columnWidths, stickyOffsets, /* deps mínimas */
]);
```
**Por que:** se o objeto de contexto for recriado a cada render, **toda a tabela** pisca a cada tecla na busca. As deps devem ser **valores primitivos ou refs estáveis**, nunca objetos recriados inline.

### 9.2 `<DataTableRow>` desacoplado do contexto

A linha **não** chama `useDataTableContext()`. Recebe via props o que precisa: `columns`, `columnWidths`, `stickyOffsets`, `isSelected`, `density`, `onToggleRow`. Envolvida em `React.memo` com comparador que checa **apenas as props que mudam frequentemente** (`row`, `isSelected`, `density`, `columnWidths`).

**Resultado garantido:** selecionar a linha 7 → só a linha 7 re-renderiza. Linhas 1-6 e 8-N ficam paradas.

### 9.3 Pipeline em cascata client mode

`useDataTableProcessor` encadeia `useMemo` por etapa:

```ts
const filtered = useMemo(() => applyFilters(rows, filterModel), [rows, filterModel]);
const searched = useMemo(() => applySearch(filtered, search), [filtered, search]);
const sorted = useMemo(() => applySort(searched, sortModel), [searched, sortModel]);
const paginated = useMemo(() => applyPagination(sorted, pagination), [sorted, pagination]);
```
**Por que:** mudar só a página não re-executa filter/search/sort. Mudar a ordenação aproveita o resultado do search.

### 9.4 Debounce 500ms no `useDataTableQuery` (server mode)

Busca digitada não bate no servidor a cada tecla. Implementar com `useDebouncedValue` interno (sem dependência externa — `setTimeout` + `useEffect` com cleanup).

### 9.5 Lazy mount dos popovers

Os 4 popovers (filter, sort, cols, views) **não** ficam montados o tempo todo. Só renderizam o conteúdo após `open=true`. Já é o padrão do Radix Popover usado pelos componentes existentes.

### 9.6 `fetchData` precisa ser estável (`useCallback`)

Documentado na USAGE.md do `<DataTable>`. Em modo dev (`process.env.NODE_ENV !== 'production'`), `useDataTableQuery` verifica se a referência do `fetchData` mudou entre renders e loga warning — evita loop infinito por descuido do consumer.

### 9.7 Imperative ref (`refresh()`)

Recarregar dados sem subir estado pro parent: `tableRef.current?.refresh()` chama o `fetchData` de novo via bump de `refreshKey` interno. Evita o anti-pattern de manter um `version` no state do parent só pra forçar refetch.

### 9.8 Sticky columns sem vazamento

`bg.table` em dark é **sólido** (`oklch(0.225 0 0)`), não alpha. Já garantido no token. **Não tornar alpha em hipótese alguma** — sticky col com bg transparente faz texto da linha vazar por baixo no scroll horizontal.

### 9.9 Limites práticos

- **Client mode:** até 1000 linhas no array de origem (sem virtualização). Acima → recomendar server mode.
- **Page sizes:** 10/25/50/100. Acima de 100 fica não-funcional sem virtualização.
- **fetchData:** target < 800ms p95. Não é responsabilidade do DataTable, mas do endpoint — documentar.

## 10. Acessibilidade

- Roles ARIA semânticos (já listados em §5.1).
- `aria-sort` em headers ordenáveis.
- `aria-rowcount`, `aria-colcount` no root.
- Keyboard nav básica na v1: `Tab` percorre headers e cells focáveis. Navegação 2D (setas) fica pra v2.
- Card mode: cada card é `role="article"` com `aria-labelledby` apontando pra primary column.

## 11. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Resize handle conflita com sticky pin | Resize handle só aparece em headers não-pinned, ou é renderizado **acima** do sticky shadow |
| Persist hidrata stale após mudança de columns schema | Validar schema no hidrate: descartar entradas com `field` que não existe mais |
| Saved views service mock vai pra produção sem trocar | Logar warning em dev se `enableSavedViews=true` com mock service e `NODE_ENV=production` |
| Export CSV trava UI em datasets grandes | Server mode: pode opcionalmente pedir endpoint `/export`; client mode com >5k rows → mostrar progress |
| Container query não suportado em browsers muito antigos | Container queries são GA desde Safari 16 / Chrome 105 (set/2022). Se aparecer demanda de Safari 15-, fallback `@media (max-width: <cardBreakpoint>px)` em vez de `@container` |

## 12. Out of scope (fora desta v1)

- Edição inline complexa (cell editors, validação)
- Master/detail rows (expandir linha)
- Multi-level grouping
- Row drag-and-drop (reordenar linhas pelo usuário)
- Sticky row totals / footer aggregations
- Excel-like clipboard (copiar range)
- Virtualização (fica em backlog se vier demanda)
- XLSX/PDF export (CSV resolve 80% dos casos)
