# `<DataTable>` Server Mode (F5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar suporte a server mode no `<DataTable>` — quando o consumer passa `fetchData` em vez de `rows`, o DataTable delega filter/sort/pagination/search ao servidor via callback assíncrono, exibe loading state, e suporta refetch imperativo.

**Architecture:** Hook novo `useDataTableQuery` espelha a API do `useDataTableProcessor` (client mode) mas chama `fetchData(params)` toda vez que filterModel/sortModel/paginationModel/search mudam. Debounce 500ms na search já está no `useDataTableSearch` existente. Controller auto-detecta server mode via presença de `fetchData` e troca o processor pelo query. `refresh()` da imperative ref bumpa um `refreshKey` interno que força refetch.

**Tech Stack:** React 19, TypeScript 5.6. Sem dependências novas — usa só useState/useEffect/useRef nativos.

**Notas operacionais:**
- ❌ Sem framework de testes unit (validação via showcase visual + DS Reviewer)
- ❌ Não é repo git (sem `git commit` — "checkpoints" lógicos)
- ✅ Working dir: `c:\Users\sergi\OneDrive\Área de Trabalho\igreen-crm-design\Modelo\`
- ✅ Spec de origem: `docs/superpowers/specs/2026-05-12-data-table-design.md` (seção F5 e §9.4, §9.6)

---

## Escopo

**INCLUI:**
- Types `GridFetchParams` e `GridFetchResult<T>` em `data-table.types.ts`
- Prop `fetchData?: (params: GridFetchParams) => Promise<GridFetchResult<T>>` em `DataTableProps`
- Prop `rowCount?: number` (total externo, opcional — server pode reportar via fetchData.total)
- Hook `useDataTableQuery<T>` em `hooks/use-data-table-query.ts`
- Controller: auto-detecta server mode via `fetchData` truthy → usa Query em vez de Processor
- Loading state alimenta DataTableLoading default
- `refresh()` na imperative ref bumpa refreshKey → força refetch
- Showcase em `/clients-crud-server` simulando latência via `setTimeout` + mock filter/sort/pagination

**NÃO INCLUI (planos seguintes):**
- Fast filter chips inline (F6)
- localStorage persistence + saved views (F7)
- Column Types registry (F7)
- Export CSV (F8)
- Retry/cancel de requests (out of scope — consumer faz no fetchData)

---

## Pré-requisito

```bash
npm run tokens:check
```

Verificar estado limpo antes de começar.

---

## File structure

```
src/components/ui/DataTable/
├── data-table.types.ts                 # MODIFY: adicionar GridFetchParams, GridFetchResult, fetchData prop
├── hooks/
│   ├── use-data-table-query.ts         # CREATE: server mode fetcher
│   └── use-data-table-controller.ts    # MODIFY: auto-detect server vs client
└── (resto inalterado)

src/preview/pages/
└── ClientsCRUDServerPreview.tsx        # CREATE: showcase server mode

src/preview/components/doc-nav-data.ts  # MODIFY: entry "Clientes (CRUD Server)" em Examples
src/App.tsx                             # MODIFY: import + route
.ai/context/components/inventory.md     # MODIFY: atualizar API do DataTable
.ai/status/pipeline-state.md            # APPEND: entrada F5 CONCLUÍDO
```

---

## Task 1: Adicionar types do server mode em `data-table.types.ts`

**Files:** Modify `src/components/ui/DataTable/data-table.types.ts`

- [ ] **Step 1.1: Adicionar tipos `GridFetchParams` e `GridFetchResult` após `FilterModel`**

Localizar a definição de `FilterModel`:

```ts
export type FilterModel = {
  items: FilterItem[];
  logicOperator: "AND" | "OR";
};
```

Adicionar **logo abaixo dela** (antes da próxima seção):

```ts
/* ── Server mode (F5) ────────────────────────────────────────────── */

/** Parâmetros enviados ao `fetchData` em cada refetch. */
export type GridFetchParams = {
  pagination: PaginationModel;
  sort: SortModel | null;
  filters: FilterModel;
  /** Search debounced (já após o delay de 500ms). */
  search: string;
  /** Field específico de busca, ou undefined pra "todos os campos". */
  searchField?: string;
};

/** Retorno esperado do `fetchData`. */
export type GridFetchResult<T> = {
  /** Linhas da página atual. */
  data: T[];
  /** Total global (todas as páginas) — necessário pra paginação calcular última página. */
  total: number;
};
```

- [ ] **Step 1.2: Adicionar props `fetchData` e `rowCount` em `DataTableProps`**

Localizar:

```ts
export type DataTableProps<T> = {
  /** Dados client mode. */
  rows: T[];
  columns: DataTableColumnDef<T>[];
```

Substituir por:

```ts
export type DataTableProps<T> = {
  /** Dados client mode. NÃO passar junto com `fetchData` — quando ambos presentes, `fetchData` ganha. */
  rows?: T[];
  /** Server mode — quando definido, o DataTable delega filter/sort/pagination ao servidor.
   *  A função deve ser estável (`useCallback`) pra evitar refetch em loop. */
  fetchData?: (params: GridFetchParams) => Promise<GridFetchResult<T>>;
  /** Total externo (server mode opcional). Quando undefined, usa o `total` retornado por `fetchData`. */
  rowCount?: number;
  columns: DataTableColumnDef<T>[];
```

- [ ] **Step 1.3: Validar typecheck**

```bash
npm run tokens:check
```

Pode reclamar de `props.rows` agora ser opcional em outros lugares (controller, processor). Esses fixes vêm nas próximas tasks. Por enquanto, ignorar erros relacionados a `rows` undefined.

- [ ] **Step 1.4: Checkpoint**

Estado: types prontos. Os hooks ainda esperam `rows` obrigatório — vai compilar com erros temporários até a Task 3.

---

## Task 2: Criar hook `use-data-table-query.ts`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-query.ts`

- [ ] **Step 2.1: Criar arquivo com hook completo**

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GridFetchParams,
  GridFetchResult,
  PaginationModel,
  SortModel,
  FilterModel,
} from "../data-table.types";

export type UseDataTableQueryParams<T> = {
  fetchData: (params: GridFetchParams) => Promise<GridFetchResult<T>>;
  filterModel: FilterModel;
  search: string;
  searchField?: string;
  sortModel: SortModel | null;
  paginationModel: PaginationModel;
  /** Loading externo (forçado pelo consumer via prop). */
  externalLoading?: boolean;
};

export type UseDataTableQueryResult<T> = {
  /** Linhas retornadas pelo servidor pra página atual. */
  rowsToRender: T[];
  /** Total global do servidor (pra footer "1-10 de N"). */
  totalAfterFilter: number;
  /** True enquanto a request está em andamento. */
  isLoading: boolean;
  /** Última error string (ou null). */
  error: string | null;
  /** Dispara refetch imediato (usado por DataTableRef.refresh). */
  refresh: () => void;
};

/**
 * Server mode fetcher. Chama `fetchData(params)` quando filter/sort/pagination/search mudam.
 *
 * - Em-vôo: `isLoading=true`. Resultado anterior continua visível.
 * - Race condition guard: requests fora de ordem são descartadas via `requestIdRef`.
 * - Refresh imperativo: bump em `refreshKey` força refetch sem mudar params.
 */
export function useDataTableQuery<T>({
  fetchData,
  filterModel,
  search,
  searchField,
  sortModel,
  paginationModel,
  externalLoading,
}: UseDataTableQueryParams<T>): UseDataTableQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Guard contra race condition — só aplica o resultado se for da request mais recente
  const requestIdRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const currentId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    fetchData({
      pagination: paginationModel,
      sort: sortModel,
      filters: filterModel,
      search,
      searchField,
    })
      .then((result) => {
        // Ignora se outra request mais recente foi disparada
        if (currentId !== requestIdRef.current) return;
        setData(result.data);
        setTotal(result.total);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (currentId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, filterModel, search, searchField, sortModel, paginationModel, refreshKey]);

  return {
    rowsToRender: data,
    totalAfterFilter: total,
    isLoading: isLoading || !!externalLoading,
    error,
    refresh,
  };
}
```

- [ ] **Step 2.2: Validar typecheck**

```bash
npm run tokens:check
```

Esperado: o arquivo isolado compila. Pode ainda ter erros do Task 1 em outros lugares — ignorar até Task 3.

- [ ] **Step 2.3: Checkpoint**

Estado: hook query pronto, isolado. Próximo: integrar no controller.

---

## Task 3: Integrar Query no `useDataTableController`

**Files:** Modify `src/components/ui/DataTable/hooks/use-data-table-controller.ts`

- [ ] **Step 3.1: Adicionar import**

No topo do arquivo, adicionar:

```ts
import { useDataTableQuery } from "./use-data-table-query";
```

- [ ] **Step 3.2: Definir `isServerMode` e dividir processor vs query**

Localizar o bloco:

```ts
  /* ── Processor (client mode pipeline) ────────────────────────── */

  const processed = useDataTableProcessor({
    rows: props.rows,
    columns: props.columns,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    sortModel: sort.sortModel,
    paginationModel: pagination.paginationModel,
  });
```

Substituir por:

```ts
  /* ── Modo: client (rows) vs server (fetchData) ───────────────── */

  const isServerMode = !!props.fetchData;
  const clientRows = props.rows ?? [];

  /* ── Processor (client mode pipeline) ────────────────────────── */

  const processed = useDataTableProcessor({
    rows: isServerMode ? [] : clientRows,
    columns: props.columns,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    sortModel: sort.sortModel,
    paginationModel: pagination.paginationModel,
  });

  /* ── Query (server mode) — só executa quando fetchData presente ── */

  const query = useDataTableQuery({
    // Quando fetchData é undefined, passamos uma função no-op estável
    // pra não quebrar a regra de hooks. A useEffect interna só roda quando
    // isServerMode for true (controlled abaixo).
    fetchData: props.fetchData ?? NOOP_FETCH,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    searchField: undefined,
    sortModel: sort.sortModel,
    paginationModel: pagination.paginationModel,
    externalLoading: props.loading,
  });

  // Seleciona output baseado no modo
  const effectiveRows = isServerMode ? query.rowsToRender : processed.rowsToRender;
  const effectiveTotal = isServerMode
    ? (props.rowCount ?? query.totalAfterFilter)
    : processed.totalAfterFilter;
  const allPagesProcessed = isServerMode ? query.rowsToRender : processed.rowsAllPagesProcessed;
```

- [ ] **Step 3.3: Adicionar `NOOP_FETCH` constante acima da função `useDataTableController`**

Localizar a declaração:

```ts
const DEFAULT_GET_ROW_ID = (row: any): GridRowId => row.id;
```

Adicionar **logo acima dela**:

```ts
import type { GridFetchResult } from "../data-table.types";

/** No-op fetch usado quando estamos em client mode — referência estável evita re-renders. */
const NOOP_FETCH = async <T,>(): Promise<GridFetchResult<T>> => ({ data: [], total: 0 });
```

(Se já houver import de `data-table.types`, adicionar `GridFetchResult` ao bloco existente.)

- [ ] **Step 3.4: Atualizar `useDataTableSelection` pra usar `allPagesProcessed`**

Localizar:

```ts
  const selection = useDataTableSelection({
    rows: processed.rowsAllPagesProcessed,
    getRowId,
    selectionModel: props.selectionModel,
    onSelectionModelChange: props.onSelectionModelChange,
  });
```

Substituir por:

```ts
  const selection = useDataTableSelection({
    rows: allPagesProcessed,
    getRowId,
    selectionModel: props.selectionModel,
    onSelectionModelChange: props.onSelectionModelChange,
  });
```

- [ ] **Step 3.5: Atualizar estados de feedback (isLoading/isDataEmpty/isNoResults)**

Localizar:

```ts
  /* ── Estados de feedback ──────────────────────────────────────── */

  const isLoading = !!props.loading;
  const isDataEmpty = !isLoading && props.rows.length === 0;
  const isNoResults =
    !isLoading &&
    props.rows.length > 0 &&
    processed.totalAfterFilter === 0;
```

Substituir por:

```ts
  /* ── Estados de feedback ──────────────────────────────────────── */

  const isLoading = isServerMode ? query.isLoading : !!props.loading;
  const totalRowsForEmpty = isServerMode
    ? effectiveTotal
    : clientRows.length;
  const isDataEmpty = !isLoading && totalRowsForEmpty === 0 && effectiveRows.length === 0;
  const isNoResults =
    !isLoading &&
    !isDataEmpty &&
    effectiveTotal === 0 &&
    (filters.filterModel.items.length > 0 || search.debouncedValue.length > 0);
```

- [ ] **Step 3.6: Conectar `refresh()` da imperative ref ao query.refresh**

Localizar:

```ts
  useImperativeHandle(ref, () => ({
    refresh: () => {
      // No-op em client mode (F5 server mode vai sobrescrever).
    },
    getState,
    getSelectedIds: () => selection.selectedIds,
    getSelectedCount: () => selection.selectedCount,
    clearSelection: selection.clear,
  }), [getState, selection]);
```

Substituir por:

```ts
  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (isServerMode) query.refresh();
      // Client mode: refresh é no-op (rows já estão em memória).
    },
    getState,
    getSelectedIds: () => selection.selectedIds,
    getSelectedCount: () => selection.selectedCount,
    clearSelection: selection.clear,
  }), [getState, selection, isServerMode, query]);
```

- [ ] **Step 3.7: Atualizar return do controller pra usar `effectiveRows` e `effectiveTotal`**

Localizar o return:

```ts
  return {
    contextValue,
    isLoading,
    isDataEmpty,
    isNoResults,
    rowsToRender: processed.rowsToRender,
    totalAfterFilter: processed.totalAfterFilter,
    cols, sort, pagination, selection, density, search, filters,
  };
```

Substituir por:

```ts
  return {
    contextValue,
    isLoading,
    isDataEmpty,
    isNoResults,
    rowsToRender: effectiveRows,
    totalAfterFilter: effectiveTotal,
    cols, sort, pagination, selection, density, search, filters,
  };
```

- [ ] **Step 3.8: Atualizar `contextValue.rows` pra usar `clientRows`**

Localizar no `useMemo<DataTableContextValue<T>>`:

```ts
    rows: props.rows,
```

Substituir por:

```ts
    rows: clientRows,
```

E nas deps do useMemo, trocar `props.rows` por `clientRows`:

```ts
    clientRows,
```

- [ ] **Step 3.9: Validar typecheck**

```bash
npm run tokens:check
```

Expected: zero erros. Se ainda houver erros de `props.rows` em outros lugares (parts/, etc), reportar como BLOCKED.

- [ ] **Step 3.10: Checkpoint**

Estado: controller suporta client + server. Próximo: showcase server.

---

## Task 4: Showcase ClientsCRUDServerPreview

**Files:** Create `src/preview/pages/ClientsCRUDServerPreview.tsx`

- [ ] **Step 4.1: Criar arquivo**

```tsx
import { useCallback, useMemo, useRef } from "react";
import {
  Hash, User, AtSign, Phone, CheckCircle2, Tag, Users as UsersIcon,
  DollarSign, Calendar, Type, Download, Trash2, RefreshCw,
} from "lucide-react";
import {
  CLIENTS_MOCK,
  STATUSES,
  CATEGORIES,
  AGENTS,
  formatCurrency,
  formatDateShort,
  PersonCell,
  AgentCell,
  StatusDot,
  CategoryChip,
  type ClientRow,
} from "./TableDoc";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableRef,
  type GridFetchParams,
  type GridFetchResult,
} from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button/button";
import { BulkActionButton } from "@/components/ui/TableToolbar";

/* ── Dataset 100 linhas pra simular um endpoint real ───────────── */

const CLIENTS_100: ClientRow[] = Array.from({ length: 10 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${3000 + batch * 10 + i}`,
  })),
).flat();

/** Mock fetchData — simula latência 500ms + filter/sort/pagination server-side. */
async function mockFetchClients(params: GridFetchParams): Promise<GridFetchResult<ClientRow>> {
  await new Promise((r) => setTimeout(r, 500));

  let result = [...CLIENTS_100];

  // Filter por items
  if (params.filters.items.length > 0) {
    result = result.filter((row) => {
      const checks = params.filters.items.map((item) => {
        const value = (row as Record<string, unknown>)[item.field];
        const target = item.value;
        const op = item.operator;
        const str = value == null ? "" : String(value).toLowerCase();
        const targetStr = target == null ? "" : String(target).toLowerCase();
        if (op === "equals") return str === targetStr;
        if (op === "contains") return str.includes(targetStr);
        return true;
      });
      return params.filters.logicOperator === "OR"
        ? checks.some(Boolean)
        : checks.every(Boolean);
    });
  }

  // Search (global, case-insensitive)
  if (params.search.trim()) {
    const needle = params.search.trim().toLowerCase();
    result = result.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(needle)),
    );
  }

  // Sort
  if (params.sort) {
    const field = params.sort.field as keyof ClientRow;
    const sign = params.sort.direction === "asc" ? 1 : -1;
    result.sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
      return String(va).localeCompare(String(vb)) * sign;
    });
  }

  const total = result.length;

  // Paginate
  const start = (params.pagination.page - 1) * params.pagination.pageSize;
  const data = result.slice(start, start + params.pagination.pageSize);

  return { data, total };
}

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  { field: "id",          headerName: "ID",            width: 120, icon: Hash,         type: "text" },
  { field: "name",        headerName: "Nome",          width: 220, icon: User,         sortable: true,
    render: ({ row }) => <PersonCell row={row} /> },
  { field: "email",       headerName: "Email",         width: 240, icon: AtSign,
    enableColumnFilter: true, filterType: "text",
    render: ({ value }) => (
      <a
        href={`mailto:${value}`}
        className="text-fg-brand hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value as string}
      </a>
    ) },
  { field: "phone",       headerName: "Telefone",      width: 170, icon: Phone,
    render: ({ value }) => (
      <a
        href={`tel:${String(value).replace(/\D/g, "")}`}
        className="text-fg-brand hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value as string}
      </a>
    ) },
  { field: "statusId",    headerName: "Status",        width: 140, icon: CheckCircle2,
    enableColumnFilter: true, filterType: "select",
    filterOptions: Object.entries(STATUSES).map(([v, m]) => ({ value: v, label: m.label })),
    render: ({ value }) => <StatusDot statusId={value as keyof typeof STATUSES} /> },
  { field: "categoryId",  headerName: "Categoria",     width: 130, icon: Tag,
    enableColumnFilter: true, filterType: "select",
    filterOptions: Object.entries(CATEGORIES).map(([v, m]) => ({ value: v, label: m.label })),
    render: ({ value }) => <CategoryChip categoryId={value as keyof typeof CATEGORIES} /> },
  { field: "agentId",     headerName: "Atribuído",     width: 170, icon: UsersIcon,
    enableColumnFilter: true, filterType: "select",
    filterOptions: Object.entries(AGENTS).map(([v, a]) => ({ value: v, label: a.name })),
    render: ({ value }) => <AgentCell agentId={value as keyof typeof AGENTS} /> },
  { field: "value",       headerName: "Valor",         width: 130, icon: DollarSign, align: "right", sortable: true,
    render: ({ value }) => (
      <span className="font-semibold tabular-nums">
        {formatCurrency(value as number)}
      </span>
    ) },
  { field: "createdAt",   headerName: "Criado em",     width: 130, icon: Calendar, sortable: true,
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ) },
  { field: "lastContact", headerName: "Último contato", width: 150, icon: Calendar, sortable: true,
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ) },
  { field: "location",    headerName: "Localização",   width: 150, icon: Type,
    enableColumnFilter: true, filterType: "text" },
];

/**
 * Página standalone de teste — DataTable em SERVER MODE.
 * `fetchData` mockado com setTimeout 500ms simula latência real de uma API REST.
 * Sort/filter/search/pagination acontecem no "server" (mock), não no client.
 */
export default function ClientsCRUDServerPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const tableRef = useRef<DataTableRef>(null);

  // useCallback estável (necessário pro server mode não fazer refetch em loop)
  const fetchData = useCallback(mockFetchClients, []);

  return (
    <div className="flex flex-col h-screen bg-bg-canvas">
      <header className="shrink-0 flex flex-col gap-gp-md px-pad-page-base py-pad-3xl border-b border-border-subtle">
        <p className="text-label-sm text-fg-brand">Examples</p>
        <div className="flex items-center justify-between gap-gp-md">
          <h1 className="text-heading-md text-fg-strong">Clientes — CRUD demo (server mode)</h1>
          <Button
            size="xs"
            variant="outline"
            color="secondary"
            iconLeft={<RefreshCw />}
            onClick={() => tableRef.current?.refresh()}
          >
            Refresh
          </Button>
        </div>
        <p className="text-paragraph-md text-fg-muted max-w-[720px]">
          DataTable em <strong>server mode</strong> — passa <code>fetchData</code> em vez de <code>rows</code>. Cada
          interação (sort, filter, search, página) chama o mock com 500ms de latência, exibindo o spinner default.
          Botão "Refresh" usa <code>ref.current.refresh()</code> pra forçar refetch sem mudar params.
        </p>
      </header>

      <main className="flex-1 min-h-0 flex flex-col px-pad-page-base py-pad-3xl">
        <DataTable<ClientRow>
          ref={tableRef}
          fetchData={fetchData}
          columns={columns}
          getRowId={(r) => r.id}
          toolbar={{
            title: "Clientes",
            enableSearch: true,
            enableFilters: true,
            enableColumns: true,
            enableDensity: true,
          }}
          paginationConfig={{
            enabled: true,
            initialPageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
          }}
          selectionConfig={{
            enabled: true,
            enableGlobal: true,
            actions: (selectedIds, clearSelection) => (
              <>
                <BulkActionButton
                  icon={<Download />}
                  onClick={() => console.log("Exportar", selectedIds)}
                >
                  Exportar
                </BulkActionButton>
                <BulkActionButton
                  icon={<Trash2 />}
                  variant="danger"
                  onClick={() => {
                    console.log("Excluir", selectedIds);
                    clearSelection();
                  }}
                >
                  Excluir
                </BulkActionButton>
              </>
            ),
          }}
          onRowClick={(row) => console.log("Row click:", row.name, row.id)}
          className="max-h-full"
        />
      </main>
    </div>
  );
}
```

- [ ] **Step 4.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 4.3: Checkpoint**

Estado: showcase criado. Falta registrar no router/menu.

---

## Task 5: Registrar no router e menu

**Files:**
- Modify `src/preview/components/doc-nav-data.ts`
- Modify `src/App.tsx`

- [ ] **Step 5.1: Adicionar entry no menu**

Em `src/preview/components/doc-nav-data.ts`, localizar a seção Examples:

```ts
  {
    title: "Examples",
    items: [
      { label: "Showcase", href: "components-preview" },
      { label: "Clientes (CRUD)", href: "clients-crud" },
    ],
  },
```

Substituir por:

```ts
  {
    title: "Examples",
    items: [
      { label: "Showcase", href: "components-preview" },
      { label: "Clientes (CRUD)", href: "clients-crud" },
      { label: "Clientes (CRUD Server)", href: "clients-crud-server" },
    ],
  },
```

- [ ] **Step 5.2: Adicionar import no App.tsx**

Localizar:

```ts
import ClientsCRUDPreview from "./preview/pages/ClientsCRUDPreview";
```

Adicionar logo abaixo:

```ts
import ClientsCRUDServerPreview from "./preview/pages/ClientsCRUDServerPreview";
```

- [ ] **Step 5.3: Adicionar `clients-crud-server` no DOC_PAGES**

Localizar:

```ts
    "avatar", "breadcrumb", "calendar", "command", "panel", "textarea", "label", "separator", "select", "menu-sidebar", "header", "form-field", "input-group", "alert-modal", "pagination", "footer-table", "table-toolbar", "table", "data-table", "tabela-teste", "clients-crud",
```

Substituir por:

```ts
    "avatar", "breadcrumb", "calendar", "command", "panel", "textarea", "label", "separator", "select", "menu-sidebar", "header", "form-field", "input-group", "alert-modal", "pagination", "footer-table", "table-toolbar", "table", "data-table", "tabela-teste", "clients-crud", "clients-crud-server",
```

- [ ] **Step 5.4: Adicionar render condicional**

Localizar:

```ts
          {activePage === "clients-crud" && <ClientsCRUDPreview />}
```

Adicionar logo abaixo:

```ts
          {activePage === "clients-crud-server" && <ClientsCRUDServerPreview />}
```

- [ ] **Step 5.5: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 5.6: Checkpoint**

Estado: rota e menu registrados. Tudo deve ser visualizável agora.

---

## Task 6: Validação visual no preview

- [ ] **Step 6.1: Rodar dev server**

Já deve estar rodando (`npm run dev`). Se não, iniciar.

- [ ] **Step 6.2: Navegar pra `/clients-crud-server` e validar**

Checklist:

- [ ] Página carrega com spinner por ~500ms ANTES da primeira batch de rows aparecer
- [ ] Footer mostra "1-25 de 100 rows" (total reportado pelo mock)
- [ ] Mudar pageSize pra 50 → spinner aparece de novo → 50 rows carregadas
- [ ] Digitar "Maria" na busca → spinner aparece após 500ms (debounce) → resultado filtrado
- [ ] Clicar no header de uma coluna sortable → spinner → ordem aplicada
- [ ] Aplicar filtro (Status=Ativo) → spinner → resultado filtrado
- [ ] Clicar "Refresh" no header da página → spinner aparece → mesmos dados recarregam
- [ ] Selecionar linha → toolbar troca pra bulk (sem refetch — selection é client-side)
- [ ] Console mostra `Row click: <name>` ao clicar em row (não dispara refetch)
- [ ] Dark mode: spinner e scroll com cores corretas

- [ ] **Step 6.3: Checkpoint visual**

Se algum item falhar, registrar STATUS: DONE_WITH_CONCERNS e listar.

---

## Task 7: Housekeeping — inventory + pipeline-state

**Files:**
- Modify `.ai/context/components/inventory.md`
- Modify `.ai/status/pipeline-state.md`

- [ ] **Step 7.1: Atualizar inventory.md (linha de status do DataTable)**

Localizar:

```markdown
| DataTable | `ui/DataTable/data-table.styles.ts` | `src/components/ui/DataTable/` | ✅ implementado (F3+F4 client-side) |
```

Substituir por:

```markdown
| DataTable | `ui/DataTable/data-table.styles.ts` | `src/components/ui/DataTable/` | ✅ implementado (F3+F4 client + F5 server) |
```

- [ ] **Step 7.2: Atualizar bloco de hooks no inventory**

Localizar:

```markdown
Hooks SRP internos (9):
  useDataTableController     → agrega tudo + useImperativeHandle (refresh, getState, getSelectedIds, getSelectedCount, clearSelection)
```

Substituir por:

```markdown
Hooks SRP internos (10):
  useDataTableController     → agrega tudo + useImperativeHandle (refresh, getState, getSelectedIds, getSelectedCount, clearSelection)
                               → auto-detecta server mode via presença de `fetchData`
```

E adicionar no fim da lista de hooks (antes do "Out of scope"):

```markdown
  useDataTableQuery          → server mode fetcher (request-id guard + refresh imperativo)
```

E mudar "Out of scope F3+F4" pra "Out of scope F3+F4+F5":

```markdown
Out of scope (planos seguintes):
  - Fast filters chips inline + applied bar (F6)
  - localStorage persistence + saved views + ColumnTypes registry (F7)
  - Export CSV (F8)
```

- [ ] **Step 7.3: Append entry em pipeline-state.md**

No topo, após `<!-- NOVA ENTRADA AQUI -->`:

```markdown
### [2026-05-12] | DS DEV | DataTable (F5 server mode) | CONCLUÍDO
- Input: spec `docs/superpowers/specs/2026-05-12-data-table-design.md` (F5) + plano `docs/superpowers/plans/2026-05-12-data-table-f5-server-mode.md` (7 tasks)
- Output:
  - Types `GridFetchParams` e `GridFetchResult<T>` em `data-table.types.ts`
  - Props `fetchData` (opcional) e `rowCount` (opcional) em `DataTableProps`
  - Hook novo `use-data-table-query.ts`:
    - Chama `fetchData` em useEffect quando filter/sort/pagination/search mudam
    - Request-id guard previne race conditions (resposta fora de ordem é descartada)
    - `refresh()` bumpa refreshKey interno pra forçar refetch sem mudar params
    - isLoading state durante request em andamento
    - error state pra falhas
  - Controller auto-detecta server mode via `!!props.fetchData`:
    - Server: usa `useDataTableQuery`
    - Client: usa `useDataTableProcessor` (default)
    - Hooks rodam SEMPRE (rules of hooks) — query usa NOOP_FETCH estável quando inativo
  - Imperative ref `refresh()` conectado: chama `query.refresh()` em server mode, no-op em client
  - Showcase em `/clients-crud-server` com mock fetchData simulando latência 500ms
- Decisões:
  - `rows` virou opcional (era obrigatório) — não passa quando server mode
  - Search já usa debounce 500ms (do hook search existente) — request só sai depois do delay
  - Selection.rows em server mode = `query.rowsToRender` (página atual) — global select em F8
  - Request-id guard via useRef counter — simples e suficiente sem AbortController
  - useDataTableQuery executa o effect mesmo em client mode (com NOOP), porque hooks devem rodar sempre. Custo desprezível.
- Assumption: `fetchData` é memoizada via `useCallback` pelo consumer. Sem isso, refetch em loop. Documentado no USAGE.md (atualizar em task separada se necessário).
- Lições novas: nenhuma — race condition guard é pattern conhecido
- Pendente: DS Reviewer holistic
```

- [ ] **Step 7.4: Checkpoint**

Estado: docs atualizadas. Próximo: DS Reviewer.

---

## Task 8: DS Reviewer final pass

**Files:** Nenhum

- [ ] **Step 8.1: Sinalizar IMPL_PRONTA**

Despachar `ds-reviewer` com prompt revisando:
- `hooks/use-data-table-query.ts` (criado)
- `hooks/use-data-table-controller.ts` (modificado — server detection)
- `data-table.types.ts` (modificado — server types)
- `preview/pages/ClientsCRUDServerPreview.tsx` (showcase)

Focos:
1. L-001 a L-014: regressões
2. Race condition guard funciona? (request-id ref)
3. NOOP_FETCH estabilidade não causa re-render
4. Hooks executam sempre (regras de hooks)
5. Imperative ref bate com o que está exportado nos types
6. Critique genuína: server mode tem edge case não coberto?

- [ ] **Step 8.2: Aplicar fixes se reviewer reprovar**

Se REPROVADO, despachar `ds-dev` com fixes específicos. Re-review até APROVADO.

- [ ] **Step 8.3: Atualizar pipeline-state.md pra APROVADO**

Quando aprovado, adicionar entrada `[DATA] | DS REVIEWER | DataTable (F5 — holistic) | APROVADO`.

- [ ] **Step 8.4: Plano F5 encerrado**

Próximo plano: F6 (fast filters chips inline).

---

## Self-Review do plano

### Spec coverage

| Spec requirement | Coberto em |
|---|---|
| `fetchData(params) => Promise<{data, total}>` (§5.2) | Task 1 + Task 2 + Task 3 |
| Auto-detecção server mode via `fetchData` presença (§3.3 #1) | Task 3.2 |
| Debounce 500ms na search (§9.4) | Reusa `useDataTableSearch` existente (do F3) |
| Race condition guard (§9.7) | Task 2 (requestIdRef) |
| Loading state durante request | Task 2 + Task 3.5 |
| `refresh()` imperativo (§9.7) | Task 2 (refreshKey) + Task 3.6 |
| Warning sobre `fetchData` precisar `useCallback` | Documentado nos comentários + assumption no pipeline-state |

### Placeholder scan

Sem TODO/TBD. Cada step tem código completo. Sem `as any` desnecessário (usei `as Record<string, unknown>` no mock).

### Type consistency

- `GridFetchParams.pagination` é `PaginationModel` (consistente com hook pagination)
- `GridFetchParams.sort` é `SortModel | null` (consistente)
- `GridFetchParams.filters` é `FilterModel` (consistente)
- `GridFetchResult<T>` tem `{data, total}` (consistente em todos os usos)
- `fetchData` signature idêntica em types, hook, controller, showcase

### Escopo

Apenas F5. F6 (fast filters), F7 (persist + saved views + columnTypes), F8 (export CSV) ficam fora.

### Ordem de execução

1 → 2 → 3 (depende de 1 e 2) → 4 → 5 (depende de 4) → 6 (visual) → 7 → 8.
Tasks 1, 2 são independentes mas pequenas — podem ir em série ou paralelo. Subagent-driven com sequência simples.
