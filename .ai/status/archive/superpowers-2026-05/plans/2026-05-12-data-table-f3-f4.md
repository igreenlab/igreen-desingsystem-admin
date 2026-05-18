# `<DataTable>` Client-Side + Toolbar Plugada (F3+F4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o `<DataTable>` composto client-side com toolbar plugada — primeiro deliverable end-to-end de uma tela de CRUD funcional. Cobre fases F3 (esqueleto + client mode mínimo) e F4 (search + filter/sort/cols popovers + density) do design spec.

**Architecture:** Padrão "Maestro híbrido" do `design-tabela/` — `data-table.tsx` é só orquestrador chamando `useDataTableController`, que agrega 10 hooks SRP. Context memoizado distribui estado. `Table` primitivo já existente é desacoplado (recebe widths/offsets/sort/selection via props). Toolbar e Footer já existentes (`TableToolbar`, `FooterTable`) são compostos sem reescrita.

**Tech Stack:** React 19, TypeScript 5.6, Tailwind v4, `tailwind-variants` via `@/utils/tv`, tokens iGreen DS V3. Componentes existentes consumidos: `<Table>`, `<TableToolbar>`, `<FooterTable>`, popovers (`FilterPopover`, `SortPopover`, `ColsPopover`), `<ToolbarSearch>`, `<ToolbarSegmented>`, `<Chip>`, `<Button>`, `<Checkbox>`, `<Badge>`.

**Notas operacionais deste projeto:**
- ❌ **Sem framework de testes unit** — validação via showcase no `/data-table` + tokens:check
- ❌ **Não é repo git** — "commits" são checkpoints lógicos sem comando git
- ✅ Imports: `tv` de `@/utils/tv`, `cn` de `@/lib/utils`
- ✅ Tokens DS V3 (brand/danger/default — sem confusão com docs V2 desatualizadas)
- ✅ Working dir: `c:\Users\sergi\OneDrive\Área de Trabalho\igreen-crm-design\Modelo\`

**Spec de origem:** [docs/superpowers/specs/2026-05-12-data-table-design.md](../specs/2026-05-12-data-table-design.md)
**Plano anterior:** [docs/superpowers/plans/2026-05-12-table-primitive.md](2026-05-12-table-primitive.md) (F1+F2 — APROVADO)

---

## Escopo deste plano

**INCLUI:**
- Provider de Context memoizado
- 10 hooks SRP: controller, columns, sort, pagination, selection, density, search, filters, processor (client), + density
- Maestro `<DataTable>` orquestrando Toolbar + Table + Footer
- Toolbar plugada: search, filter popover, sort popover, cols popover, density toggle
- Paginação com `<FooterTable>` existente
- Selection model include/exclude com floating bulk bar (visual, ações via prop)
- Estados de feedback: empty, loading, no-results (com defaults)
- Imperative ref: `refresh()`, `getState()`, `getSelectedIds()`, `getSelectedCount()`, `clearSelection()`
- Showcase com 4 exemplos no preview

**NÃO INCLUI (planos seguintes):**
- Server mode (`fetchData` + `useDataTableQuery`) — F5
- Fast filters chips inline + applied bar abaixo da toolbar — F6
- Persistência localStorage via `persistId` — F7
- Saved views service (mock) + ViewsPopover plugado — F7
- Column Types Registry com 8 tipos especializados — F7
- Export CSV — F8

---

## Pré-requisito

```bash
npm run tokens:check
```

Verificar que o estado atual está limpo (F1+F2 finalizado). Se reclamar de erros TS, parar e investigar antes de começar.

---

## File structure (locked-in)

```
src/components/ui/DataTable/
├── data-table.types.ts                 # Public types — DataTableProps, ColumnDef, refs, models
├── data-table.styles.ts                # tv() wrapper externo (rounded + border + shadow)
├── data-table.tsx                      # Maestro — chama useDataTableController, renderiza composição
├── context/
│   └── data-table-context.tsx          # Provider memoizado + useDataTableContext
├── hooks/
│   ├── use-data-table-controller.ts    # Orquestra todos os outros, agrega em objeto único
│   ├── use-data-table-columns.ts       # widths, pin, hidden, order — composição de useColumnWidths
│   ├── use-data-table-sort.ts          # Controlled/uncontrolled, ciclo asc/desc/null
│   ├── use-data-table-pagination.ts    # {page, pageSize}, auto-reset
│   ├── use-data-table-selection.ts     # include/exclude model + select page/global/clear
│   ├── use-data-table-density.ts       # Controlled/uncontrolled density
│   ├── use-data-table-search.ts        # Debounce 500ms via setTimeout
│   ├── use-data-table-filters.ts       # FilterModel {items: FilterItem[], logic}
│   └── use-data-table-processor.ts     # Client pipeline cascateado em useMemo
├── parts/
│   ├── data-table-empty.tsx            # Estado vazio default
│   ├── data-table-loading.tsx          # Estado loading default
│   ├── data-table-no-results.tsx       # Estado filter/search sem match
│   └── data-table-floating-bulk-bar.tsx # Bulk bar com selection count + actions
├── USAGE.md
└── index.ts                            # Barrel

src/preview/pages/
└── DataTableDoc.tsx                    # Showcase 4 sections

src/components/index.ts                 # Adicionar export DataTable
.ai/context/components/inventory.md     # Adicionar entry "DataTable | ui/ | implementado"
.ai/status/pipeline-state.md            # Append CONCLUÍDO entry
```

---

## Task 1: Setup — types

**Files:** Create `src/components/ui/DataTable/data-table.types.ts`

- [ ] **Step 1.1: Criar pasta e arquivo de types**

Conteúdo exato:

```ts
import type { ReactNode } from "react";
import type { TableDensity, SortDirection, ColumnPinned, CellAlign } from "../Table";

/* ── Modelos de estado ───────────────────────────────────────────── */

export type SortModel = {
  field: string;
  direction: Exclude<SortDirection, null>;
};

export type PaginationModel = {
  page: number;       // 1-based
  pageSize: number;
};

export type GridRowId = string | number;

export type GridSelectionState = {
  type: "include" | "exclude";
  ids: Set<GridRowId>;
};

export type FilterValue = string | number | boolean | string[] | number[] | Date | null | undefined;

export type FilterOperator =
  | "contains" | "equals" | "startsWith" | "endsWith"
  | "isEmpty" | "isNotEmpty" | "isAnyOf"
  | "gt" | "lt" | "gte" | "lte";

export type FilterItem = {
  id: string;
  field: string;
  operator: FilterOperator;
  value?: FilterValue;
};

export type FilterModel = {
  items: FilterItem[];
  logicOperator: "AND" | "OR";
};

/* ── ColumnDef estendido (superset do que Table primitivo precisa) ── */

export type DataTableColumnDef<T> = {
  /** Caminho do dado. Suporta dot-path: 'user.name'. */
  field: keyof T | string;
  headerName: string;
  type?: "text" | "number" | "currency" | "date" | "status" | "boolean" | "user" | "actions";

  /** Layout */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  pinned?: ColumnPinned;
  align?: CellAlign;
  ellipsis?: boolean;

  /** Comportamento */
  resizable?: boolean;     // default true (exceto type=actions ou checkbox)
  sortable?: boolean;      // default true
  hideable?: boolean;      // default true
  isPrimary?: boolean;     // título no card mode

  /** Filtros (F4 + F6) */
  enableColumnFilter?: boolean;
  filterType?: "text" | "select" | "multiSelect" | "date" | "boolean" | "number";
  filterOptions?: Array<{ label: string; value: any; color?: string }>;
  defaultFilterValue?: FilterValue;

  /** Render customizado */
  render?: (params: { row: T; value: any }) => ReactNode;
  valueGetter?: (row: T) => any;
  valueFormatter?: (value: any) => string;

  /** Ícone do tipo no header (lucide). */
  icon?: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
};

/* ── Configs da DataTableProps ───────────────────────────────────── */

export type DataTableToolbarConfig = {
  title?: string;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableColumns?: boolean;
  enableDensity?: boolean;
  customLeft?: ReactNode;
  customActions?: ReactNode;
};

export type DataTablePaginationConfig = {
  enabled?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

export type DataTableSelectionConfig = {
  enabled?: boolean;
  enableGlobal?: boolean;
  actions?: (selectedIds: GridRowId[], clearSelection: () => void) => ReactNode;
};

/* ── DataTableProps principal ───────────────────────────────────── */

export type DataTableProps<T> = {
  /** Dados client mode. */
  rows: T[];
  columns: DataTableColumnDef<T>[];
  /** Função pra extrair id da row. Default: row.id */
  getRowId?: (row: T) => GridRowId;

  /** Toolbar config (default: tudo enabled) */
  toolbar?: DataTableToolbarConfig;

  /** Paginação config */
  paginationConfig?: DataTablePaginationConfig;

  /** Selection config */
  selectionConfig?: DataTableSelectionConfig;

  /** Visual */
  density?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  cardBreakpoint?: number | false;
  className?: string;

  /** Sort controlado (opcional — se não passar, gerenciado internamente) */
  sortModel?: SortModel | null;
  onSortModelChange?: (model: SortModel | null) => void;

  /** Paginação controlada */
  paginationModel?: PaginationModel;
  onPaginationModelChange?: (model: PaginationModel) => void;

  /** Selection controlada */
  selectionModel?: GridSelectionState;
  onSelectionModelChange?: (model: GridSelectionState) => void;

  /** Filters controlados */
  filterModel?: FilterModel;
  onFilterModelChange?: (model: FilterModel) => void;

  /** Search controlado */
  search?: string;
  onSearchChange?: (search: string) => void;

  /** Row callbacks */
  onRowClick?: (row: T) => void;
  onRowChange?: (row: T) => void;
  getRowClassName?: (params: { row: T; index: number }) => string;

  /** Slots de feedback custom */
  renderEmpty?: ReactNode;
  renderLoading?: ReactNode;
  renderNoResults?: ReactNode;
  /** Loading externo (sem fetchData ainda — útil pra estados iniciais). */
  loading?: boolean;
};

/* ── Snapshot completo do estado (pra DataTableRef.getState) ────── */

export type DataTableState = {
  density: TableDensity;
  sortModel: SortModel | null;
  paginationModel: PaginationModel;
  selectionModel: GridSelectionState;
  filterModel: FilterModel;
  search: string;
  columnWidths: Record<string, number>;
  pinnedColumns: Record<string, ColumnPinned>;
  hiddenColumns: Set<string>;
  columnOrder: string[];
};

export type DataTableRef = {
  /** No-op em client mode (futuro server mode vai re-fetchar). */
  refresh: () => void;
  getState: () => DataTableState;
  getSelectedIds: () => GridRowId[];
  getSelectedCount: () => number;
  clearSelection: () => void;
};
```

- [ ] **Step 1.2: Validar typecheck**

```bash
npm run tokens:check
```
Expected: zero erros.

- [ ] **Step 1.3: Checkpoint**

Estado: types públicos definidos. Próximas tasks consomem esses types.

---

## Task 2: Setup — styles externos

**Files:** Create `src/components/ui/DataTable/data-table.styles.ts`

- [ ] **Step 2.1: Criar styles do wrapper externo**

```ts
import { tv } from "@/utils/tv";

/**
 * DataTable wrapper externo — agrupa toolbar + table + footer.
 * Visual: card com border + radius. O <Table> interno tem o próprio wrapper
 * com bg-bg-table; aqui o <div> raiz só posiciona toolbar e footer.
 */
export const dataTableStyles = tv({
  slots: {
    root: [
      "relative flex flex-col w-full gap-gp-md",
    ],
    toolbarWrap: [
      "flex flex-col gap-gp-md",
    ],
    footerWrap: [
      "flex-shrink-0",
    ],
    overlay: [
      "absolute inset-0 z-50 flex items-center justify-center",
      "bg-bg-canvas/80 backdrop-blur-sm",
    ],
    emptyWrap: [
      "flex flex-col items-center justify-center gap-gp-md",
      "min-h-[240px] p-pad-3xl",
      "text-fg-muted",
    ],
    emptyTitle: [
      "text-title-md text-fg-default",
    ],
    emptyDescription: [
      "text-paragraph-sm text-fg-muted text-center max-w-[360px]",
    ],
    bulkBar: [
      "fixed bottom-pad-3xl left-1/2 -translate-x-1/2 z-[var(--z-index-toast,600)]",
      "flex items-center gap-gp-lg",
      "py-pad-md px-pad-2xl rounded-radius-xl",
      "bg-bg-brand-subtle border border-border-brand text-fg-brand",
      "shadow-sh-lg",
    ],
  },
});
```

- [ ] **Step 2.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 2.3: Checkpoint**

Estado: styles externos prontos. Hooks vêm a seguir.

---

## Task 3: Context provider

**Files:** Create `src/components/ui/DataTable/context/data-table-context.tsx`

- [ ] **Step 3.1: Criar context com tipo de value e provider memoizado**

```tsx
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type {
  TableDensity,
  SortDirection,
  ColumnPinned,
} from "../../Table";
import type {
  DataTableColumnDef,
  PaginationModel,
  GridSelectionState,
  GridRowId,
  FilterModel,
  SortModel,
} from "../data-table.types";

/* ── Tipo do value do Context — readonly snapshot do estado ─────── */

export type DataTableContextValue<T = any> = {
  /** Dados originais sem processar (filter/sort/paginate ficam no processor). */
  rows: T[];
  /** Colunas efetivas (já filtradas por visibility e ordenadas por columnOrder). */
  effectiveColumns: DataTableColumnDef<T>[];
  /** Widths em px por field. */
  columnWidths: Record<string, number>;
  /** Sticky offsets por field. */
  stickyOffsets: Record<string, number>;
  /** Order atual dos fields (filtrada por visibilidade). */
  columnOrder: string[];
  /** Set de fields hidden. */
  hiddenColumns: Set<string>;
  /** Map de pinned por field. */
  pinnedColumns: Record<string, ColumnPinned>;

  /** Sort state. */
  sortModel: SortModel | null;
  /** Pagination state. */
  paginationModel: PaginationModel;
  /** Selection state. */
  selection: {
    state: GridSelectionState;
    isRowSelected: (row: T) => boolean;
    selectedCount: number;
  };
  /** Density state. */
  density: TableDensity;
  /** Search state. */
  search: string;
  /** Filter model. */
  filterModel: FilterModel;

  /** getRowId utility. */
  getRowId: (row: T) => GridRowId;
};

const DataTableContext = createContext<DataTableContextValue | null>(null);

export function DataTableProvider({
  value,
  children,
}: {
  value: DataTableContextValue;
  children: ReactNode;
}) {
  return (
    <DataTableContext.Provider value={value}>
      {children}
    </DataTableContext.Provider>
  );
}

export function useDataTableContext<T = any>(): DataTableContextValue<T> {
  const ctx = useContext(DataTableContext);
  if (!ctx) {
    throw new Error("useDataTableContext must be used inside <DataTable>");
  }
  return ctx as DataTableContextValue<T>;
}
```

- [ ] **Step 3.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 3.3: Checkpoint**

Estado: Provider pronto. Sub-componentes podem consumir o context via `useDataTableContext()`.

---

## Task 4: Hook `use-data-table-columns`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-columns.ts`

Hook que gerencia: columnWidths, pinnedColumns, hiddenColumns, columnOrder. Cada um pode ser controlled ou uncontrolled. Internamente reusa `useColumnWidths` do Table primitivo pra calcular offsets.

- [ ] **Step 4.1: Criar hook**

```ts
import { useCallback, useMemo, useState } from "react";
import { useColumnWidths } from "../../Table";
import type { ColumnPinned } from "../../Table";
import type { DataTableColumnDef } from "../data-table.types";

export type UseDataTableColumnsParams<T> = {
  columns: DataTableColumnDef<T>[];
};

export type UseDataTableColumnsResult<T> = {
  /** Colunas após aplicar hiddenColumns e columnOrder. */
  effectiveColumns: DataTableColumnDef<T>[];
  /** Widths em px por field. */
  columnWidths: Record<string, number>;
  /** Sticky offsets por field. */
  stickyOffsets: Record<string, number>;
  /** Hidden columns state. */
  hiddenColumns: Set<string>;
  /** Pinned columns state. */
  pinnedColumns: Record<string, ColumnPinned>;
  /** Column order state. */
  columnOrder: string[];

  /** Handlers. */
  handleResize: (field: string, widthPx: number) => void;
  handlePin: (field: string, side: ColumnPinned) => void;
  handleHide: (field: string) => void;
  handleShow: (field: string) => void;
  handleReorder: (newOrder: string[]) => void;
};

/**
 * Gerencia estado de colunas (widths, pin, hide, order) e calcula offsets sticky.
 * Tudo uncontrolled na v1 — controle via props vem em F7 (persistência).
 */
export function useDataTableColumns<T>({
  columns,
}: UseDataTableColumnsParams<T>): UseDataTableColumnsResult<T> {
  // Width override por field (uncontrolled). Default vem do columnDef.
  const [widthOverrides, setWidthOverrides] = useState<Record<string, number>>({});
  // Pinned override (default vem do columnDef.pinned).
  const [pinnedOverrides, setPinnedOverrides] = useState<Record<string, ColumnPinned>>({});
  // Hidden state (uncontrolled).
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  // Order state (uncontrolled). Default: order do array de columns.
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => String(c.field)),
  );

  // Efetivo: filtra hidden, aplica order, mescla overrides
  const effectiveColumns = useMemo<DataTableColumnDef<T>[]>(() => {
    const byField = new Map(columns.map((c) => [String(c.field), c]));
    const ordered: DataTableColumnDef<T>[] = [];
    for (const field of columnOrder) {
      const col = byField.get(field);
      if (!col || hiddenColumns.has(field)) continue;
      ordered.push({
        ...col,
        width: widthOverrides[field] ?? col.width,
        pinned: field in pinnedOverrides ? pinnedOverrides[field] : col.pinned,
      });
    }
    return ordered;
  }, [columns, columnOrder, hiddenColumns, widthOverrides, pinnedOverrides]);

  // Calcula offsets sticky via hook do Table primitivo
  const widthsInput = useMemo(
    () =>
      effectiveColumns.map((c) => ({
        field: String(c.field),
        width: c.width,
        defaultWidth: c.width,
        pinned: c.pinned,
      })),
    [effectiveColumns],
  );
  const { widths, offsets } = useColumnWidths(widthsInput);

  const handleResize = useCallback((field: string, widthPx: number) => {
    setWidthOverrides((prev) => ({ ...prev, [field]: widthPx }));
  }, []);

  const handlePin = useCallback((field: string, side: ColumnPinned) => {
    setPinnedOverrides((prev) => ({ ...prev, [field]: side }));
  }, []);

  const handleHide = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  const handleShow = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const handleReorder = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  // pinnedColumns combinado (overrides + defaults)
  const pinnedColumns = useMemo<Record<string, ColumnPinned>>(() => {
    const result: Record<string, ColumnPinned> = {};
    for (const c of columns) {
      const field = String(c.field);
      result[field] = field in pinnedOverrides ? pinnedOverrides[field] : c.pinned;
    }
    return result;
  }, [columns, pinnedOverrides]);

  return {
    effectiveColumns,
    columnWidths: widths,
    stickyOffsets: offsets,
    hiddenColumns,
    pinnedColumns,
    columnOrder,
    handleResize,
    handlePin,
    handleHide,
    handleShow,
    handleReorder,
  };
}
```

- [ ] **Step 4.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 4.3: Checkpoint**

Estado: hook de colunas pronto. Aceita columns iniciais, gerencia overrides internos, retorna effectiveColumns + widths/offsets.

---

## Task 5: Hook `use-data-table-sort`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-sort.ts`

- [ ] **Step 5.1: Criar hook controlled/uncontrolled com ciclo asc/desc/null**

```ts
import { useCallback, useState } from "react";
import type { SortModel } from "../data-table.types";

export type UseDataTableSortParams = {
  /** Controlled sort. */
  sortModel?: SortModel | null;
  /** Callback quando sort muda. */
  onSortModelChange?: (model: SortModel | null) => void;
};

export type UseDataTableSortResult = {
  sortModel: SortModel | null;
  /** Ciclo asc → desc → null. */
  handleSort: (field: string) => void;
  /** Setter direto (bypassa ciclo). */
  setSortModel: (model: SortModel | null) => void;
};

/**
 * Sort state com ciclo asc → desc → null no clique no header.
 * Controlled quando `sortModel` é prop; uncontrolled caso contrário.
 */
export function useDataTableSort({
  sortModel: controlledSort,
  onSortModelChange,
}: UseDataTableSortParams = {}): UseDataTableSortResult {
  const [uncontrolledSort, setUncontrolledSort] = useState<SortModel | null>(null);
  const isControlled = controlledSort !== undefined;
  const sortModel = isControlled ? controlledSort : uncontrolledSort;

  const setSortModel = useCallback(
    (model: SortModel | null) => {
      if (!isControlled) setUncontrolledSort(model);
      onSortModelChange?.(model);
    },
    [isControlled, onSortModelChange],
  );

  const handleSort = useCallback(
    (field: string) => {
      if (sortModel?.field === field) {
        if (sortModel.direction === "asc") {
          setSortModel({ field, direction: "desc" });
        } else {
          setSortModel(null);
        }
      } else {
        setSortModel({ field, direction: "asc" });
      }
    },
    [sortModel, setSortModel],
  );

  return { sortModel, handleSort, setSortModel };
}
```

- [ ] **Step 5.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 5.3: Checkpoint**

Estado: hook de sort pronto com ciclo padrão e suporte controlled.

---

## Task 6: Hook `use-data-table-pagination`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-pagination.ts`

- [ ] **Step 6.1: Criar hook com reset automático**

```ts
import { useCallback, useEffect, useState } from "react";
import type { PaginationModel } from "../data-table.types";

export type UseDataTablePaginationParams = {
  paginationModel?: PaginationModel;
  onPaginationModelChange?: (model: PaginationModel) => void;
  initialPageSize?: number;
  /** Reset page→1 quando esses valores mudarem (ex: filtro, search). */
  resetTriggers?: unknown[];
};

export type UseDataTablePaginationResult = {
  paginationModel: PaginationModel;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPaginationModel: (model: PaginationModel) => void;
};

const DEFAULT_PAGE_SIZE = 25;

/**
 * Pagination state. Auto-reseta para page 1 quando triggers mudam (filter/search).
 */
export function useDataTablePagination({
  paginationModel: controlledModel,
  onPaginationModelChange,
  initialPageSize = DEFAULT_PAGE_SIZE,
  resetTriggers = [],
}: UseDataTablePaginationParams = {}): UseDataTablePaginationResult {
  const [uncontrolled, setUncontrolled] = useState<PaginationModel>({
    page: 1,
    pageSize: initialPageSize,
  });
  const isControlled = controlledModel !== undefined;
  const paginationModel = isControlled ? controlledModel : uncontrolled;

  const setPaginationModel = useCallback(
    (model: PaginationModel) => {
      if (!isControlled) setUncontrolled(model);
      onPaginationModelChange?.(model);
    },
    [isControlled, onPaginationModelChange],
  );

  const setPage = useCallback(
    (page: number) => {
      setPaginationModel({ ...paginationModel, page });
    },
    [paginationModel, setPaginationModel],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      setPaginationModel({ page: 1, pageSize });
    },
    [setPaginationModel],
  );

  // Reset page→1 quando triggers mudam (ex: filtros aplicados, search digitado)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (paginationModel.page !== 1) {
      setPaginationModel({ ...paginationModel, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetTriggers);

  return { paginationModel, setPage, setPageSize, setPaginationModel };
}
```

- [ ] **Step 6.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 6.3: Checkpoint**

Estado: hook de pagination pronto com reset automático ao mudar filtros/search.

---

## Task 7: Hook `use-data-table-selection`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-selection.ts`

- [ ] **Step 7.1: Criar hook com include/exclude model**

```ts
import { useCallback, useMemo, useState } from "react";
import type { GridRowId, GridSelectionState } from "../data-table.types";

export type UseDataTableSelectionParams<T> = {
  rows: T[];
  getRowId: (row: T) => GridRowId;
  /** Controlled selection. */
  selectionModel?: GridSelectionState;
  onSelectionModelChange?: (model: GridSelectionState) => void;
};

export type UseDataTableSelectionResult<T> = {
  /** Estado bruto. */
  state: GridSelectionState;
  /** True se a row está selecionada. */
  isRowSelected: (row: T) => boolean;
  /** Toggle uma row. */
  toggleRow: (row: T) => void;
  /** Seleciona/deseleciona todas as rows da página atual. */
  togglePage: (rowsOnPage: T[]) => void;
  /** Vira "exclude all": seleciona TUDO (incluindo dados não carregados). */
  selectAll: () => void;
  /** Limpa. */
  clear: () => void;
  /** Quantidade selecionada (rows visíveis). */
  selectedCount: number;
  /** IDs como array (utility). */
  selectedIds: GridRowId[];
  /** True quando todas as rows visíveis estão selecionadas. */
  isPageSelected: (rowsOnPage: T[]) => boolean;
  /** True quando ALGUMA (mas não todas) estão selecionadas. Pra indeterminate. */
  isPageIndeterminate: (rowsOnPage: T[]) => boolean;
};

const EMPTY_STATE: GridSelectionState = { type: "include", ids: new Set() };

/**
 * Selection com modelo include/exclude. Permite "select all global" sem materializar IDs.
 */
export function useDataTableSelection<T>({
  rows,
  getRowId,
  selectionModel: controlledState,
  onSelectionModelChange,
}: UseDataTableSelectionParams<T>): UseDataTableSelectionResult<T> {
  const [uncontrolled, setUncontrolled] = useState<GridSelectionState>(EMPTY_STATE);
  const isControlled = controlledState !== undefined;
  const state = isControlled ? controlledState : uncontrolled;

  const setState = useCallback(
    (next: GridSelectionState) => {
      if (!isControlled) setUncontrolled(next);
      onSelectionModelChange?.(next);
    },
    [isControlled, onSelectionModelChange],
  );

  const isRowSelected = useCallback(
    (row: T) => {
      const id = getRowId(row);
      const hasInIds = state.ids.has(id);
      return state.type === "include" ? hasInIds : !hasInIds;
    },
    [state, getRowId],
  );

  const toggleRow = useCallback(
    (row: T) => {
      const id = getRowId(row);
      const nextIds = new Set(state.ids);
      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);
      setState({ type: state.type, ids: nextIds });
    },
    [state, getRowId, setState],
  );

  const togglePage = useCallback(
    (rowsOnPage: T[]) => {
      const allSelected = rowsOnPage.every(isRowSelected);
      const nextIds = new Set(state.ids);
      if (allSelected) {
        for (const r of rowsOnPage) {
          const id = getRowId(r);
          if (state.type === "include") nextIds.delete(id);
          else nextIds.add(id);
        }
      } else {
        for (const r of rowsOnPage) {
          const id = getRowId(r);
          if (state.type === "include") nextIds.add(id);
          else nextIds.delete(id);
        }
      }
      setState({ type: state.type, ids: nextIds });
    },
    [state, isRowSelected, getRowId, setState],
  );

  const selectAll = useCallback(() => {
    setState({ type: "exclude", ids: new Set() });
  }, [setState]);

  const clear = useCallback(() => {
    setState({ type: "include", ids: new Set() });
  }, [setState]);

  const selectedCount = useMemo(() => {
    if (state.type === "include") return state.ids.size;
    return rows.length - state.ids.size;
  }, [state, rows.length]);

  const selectedIds = useMemo<GridRowId[]>(() => {
    if (state.type === "include") return Array.from(state.ids);
    // exclude: visíveis menos os excluídos
    return rows
      .map(getRowId)
      .filter((id) => !state.ids.has(id));
  }, [state, rows, getRowId]);

  const isPageSelected = useCallback(
    (rowsOnPage: T[]) => rowsOnPage.length > 0 && rowsOnPage.every(isRowSelected),
    [isRowSelected],
  );

  const isPageIndeterminate = useCallback(
    (rowsOnPage: T[]) => {
      const sel = rowsOnPage.filter(isRowSelected).length;
      return sel > 0 && sel < rowsOnPage.length;
    },
    [isRowSelected],
  );

  return {
    state,
    isRowSelected,
    toggleRow,
    togglePage,
    selectAll,
    clear,
    selectedCount,
    selectedIds,
    isPageSelected,
    isPageIndeterminate,
  };
}
```

- [ ] **Step 7.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 7.3: Checkpoint**

Estado: selection com include/exclude pronto. `selectedCount` calcula corretamente nos 2 modos.

---

## Task 8: Hook `use-data-table-density`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-density.ts`

- [ ] **Step 8.1: Criar hook simples controlled/uncontrolled**

```ts
import { useCallback, useState } from "react";
import type { TableDensity } from "../../Table";

export type UseDataTableDensityParams = {
  density?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  defaultDensity?: TableDensity;
};

export type UseDataTableDensityResult = {
  density: TableDensity;
  setDensity: (density: TableDensity) => void;
};

export function useDataTableDensity({
  density: controlled,
  onDensityChange,
  defaultDensity = "standard",
}: UseDataTableDensityParams = {}): UseDataTableDensityResult {
  const [uncontrolled, setUncontrolled] = useState<TableDensity>(defaultDensity);
  const isControlled = controlled !== undefined;
  const density = isControlled ? controlled : uncontrolled;

  const setDensity = useCallback(
    (next: TableDensity) => {
      if (!isControlled) setUncontrolled(next);
      onDensityChange?.(next);
    },
    [isControlled, onDensityChange],
  );

  return { density, setDensity };
}
```

- [ ] **Step 8.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 8.3: Checkpoint**

Estado: density pronto.

---

## Task 9: Hook `use-data-table-search`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-search.ts`

- [ ] **Step 9.1: Criar hook search com debounce 500ms**

```ts
import { useCallback, useEffect, useRef, useState } from "react";

export type UseDataTableSearchParams = {
  /** Controlled search. */
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Tempo de debounce em ms. Default 500. */
  debounceMs?: number;
};

export type UseDataTableSearchResult = {
  /** Valor em tempo real (sem debounce) — pra binding do input. */
  inputValue: string;
  /** Valor debounced — usado pelo processor/query. */
  debouncedValue: string;
  /** Update — atualiza input + agenda update do debounced. */
  setInputValue: (value: string) => void;
  /** Force apply imediato (pra Enter, blur). */
  flush: () => void;
};

const DEFAULT_DEBOUNCE = 500;

/**
 * Search com debounce — separa o input (rápido) do valor "comprometido" (lento).
 * Em client mode: debouncedValue alimenta o processor. Server mode (futuro):
 * mesma assinatura, mas aciona refetch.
 */
export function useDataTableSearch({
  search: controlledSearch,
  onSearchChange,
  debounceMs = DEFAULT_DEBOUNCE,
}: UseDataTableSearchParams = {}): UseDataTableSearchResult {
  const [uncontrolled, setUncontrolled] = useState<string>("");
  const isControlled = controlledSearch !== undefined;
  const inputValue = isControlled ? controlledSearch : uncontrolled;

  const [debouncedValue, setDebouncedValue] = useState<string>(inputValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quando inputValue muda, agenda update do debounced
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, debounceMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [inputValue, debounceMs]);

  const setInputValue = useCallback(
    (value: string) => {
      if (!isControlled) setUncontrolled(value);
      onSearchChange?.(value);
    },
    [isControlled, onSearchChange],
  );

  const flush = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDebouncedValue(inputValue);
  }, [inputValue]);

  return { inputValue, debouncedValue, setInputValue, flush };
}
```

- [ ] **Step 9.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 9.3: Checkpoint**

Estado: search com debounce pronto.

---

## Task 10: Hook `use-data-table-filters`

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-filters.ts`

- [ ] **Step 10.1: Criar hook controlled/uncontrolled de FilterModel**

```ts
import { useCallback, useState } from "react";
import type { FilterModel } from "../data-table.types";

export type UseDataTableFiltersParams = {
  filterModel?: FilterModel;
  onFilterModelChange?: (model: FilterModel) => void;
  initialFilterModel?: FilterModel;
};

export type UseDataTableFiltersResult = {
  filterModel: FilterModel;
  setFilterModel: (model: FilterModel) => void;
  clearFilters: () => void;
};

const EMPTY_MODEL: FilterModel = { items: [], logicOperator: "AND" };

export function useDataTableFilters({
  filterModel: controlled,
  onFilterModelChange,
  initialFilterModel,
}: UseDataTableFiltersParams = {}): UseDataTableFiltersResult {
  const [uncontrolled, setUncontrolled] = useState<FilterModel>(
    initialFilterModel ?? EMPTY_MODEL,
  );
  const isControlled = controlled !== undefined;
  const filterModel = isControlled ? controlled : uncontrolled;

  const setFilterModel = useCallback(
    (model: FilterModel) => {
      if (!isControlled) setUncontrolled(model);
      onFilterModelChange?.(model);
    },
    [isControlled, onFilterModelChange],
  );

  const clearFilters = useCallback(() => {
    setFilterModel(EMPTY_MODEL);
  }, [setFilterModel]);

  return { filterModel, setFilterModel, clearFilters };
}
```

- [ ] **Step 10.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 10.3: Checkpoint**

Estado: filters pronto.

---

## Task 11: Hook `use-data-table-processor` (client pipeline)

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-processor.ts`

Pipeline cascateado em useMemo: `filter → search → sort → paginate`. Mudar só a página NÃO re-roda filter/sort.

- [ ] **Step 11.1: Criar processor com 4 etapas memoizadas**

```ts
import { useMemo } from "react";
import type {
  DataTableColumnDef,
  FilterItem,
  FilterModel,
  PaginationModel,
  SortModel,
} from "../data-table.types";

export type UseDataTableProcessorParams<T> = {
  rows: T[];
  columns: DataTableColumnDef<T>[];
  filterModel: FilterModel;
  search: string;
  searchField?: string; // 'all' (default) ou field específico
  sortModel: SortModel | null;
  paginationModel: PaginationModel;
};

export type UseDataTableProcessorResult<T> = {
  /** Rows visíveis depois de filter+search+sort+paginate. */
  rowsToRender: T[];
  /** Rows depois de filter+search+sort (sem paginate) — pra "togglePage" considerar página atual completa. */
  rowsAllPagesProcessed: T[];
  /** Total após filter+search (sem paginate) — pra footer mostrar "1-10 de N". */
  totalAfterFilter: number;
};

/* ── Utilities de acesso ─────────────────────────────────────────── */

function getFieldValue<T>(row: T, field: string): any {
  if (!field.includes(".")) return (row as any)[field];
  return field.split(".").reduce<any>((acc, key) => acc?.[key], row);
}

function applyValueGetter<T>(row: T, col: DataTableColumnDef<T>): any {
  if (col.valueGetter) return col.valueGetter(row);
  return getFieldValue(row, String(col.field));
}

function applyFormatter<T>(row: T, col: DataTableColumnDef<T>): string {
  const value = applyValueGetter(row, col);
  if (col.valueFormatter) return col.valueFormatter(value);
  return value == null ? "" : String(value);
}

/* ── Filter ──────────────────────────────────────────────────────── */

function matchesFilter(value: any, item: FilterItem): boolean {
  const { operator } = item;
  const target = item.value;
  if (operator === "isEmpty") return value == null || value === "";
  if (operator === "isNotEmpty") return value != null && value !== "";

  const str = value == null ? "" : String(value).toLowerCase();
  const targetStr = target == null ? "" : String(target).toLowerCase();

  switch (operator) {
    case "contains":   return str.includes(targetStr);
    case "equals":     return str === targetStr;
    case "startsWith": return str.startsWith(targetStr);
    case "endsWith":   return str.endsWith(targetStr);
    case "isAnyOf":    return Array.isArray(target) && (target as any[]).some((t) => String(t).toLowerCase() === str);
    case "gt":         return Number(value) > Number(target);
    case "lt":         return Number(value) < Number(target);
    case "gte":        return Number(value) >= Number(target);
    case "lte":        return Number(value) <= Number(target);
    default:           return true;
  }
}

function applyFilters<T>(rows: T[], filterModel: FilterModel, columns: DataTableColumnDef<T>[]): T[] {
  if (filterModel.items.length === 0) return rows;
  const colsByField = new Map(columns.map((c) => [String(c.field), c]));
  return rows.filter((row) => {
    const results = filterModel.items.map((item) => {
      const col = colsByField.get(item.field);
      const value = col ? applyValueGetter(row, col) : getFieldValue(row, item.field);
      return matchesFilter(value, item);
    });
    if (filterModel.logicOperator === "OR") return results.some(Boolean);
    return results.every(Boolean);
  });
}

/* ── Search ──────────────────────────────────────────────────────── */

function applySearch<T>(rows: T[], search: string, columns: DataTableColumnDef<T>[], searchField: string): T[] {
  if (!search.trim()) return rows;
  const needle = search.trim().toLowerCase();
  const searchableCols =
    searchField === "all" || !searchField
      ? columns.filter((c) => c.type !== "actions")
      : columns.filter((c) => String(c.field) === searchField);

  return rows.filter((row) =>
    searchableCols.some((col) => applyFormatter(row, col).toLowerCase().includes(needle)),
  );
}

/* ── Sort ────────────────────────────────────────────────────────── */

function applySort<T>(rows: T[], sortModel: SortModel | null, columns: DataTableColumnDef<T>[]): T[] {
  if (!sortModel) return rows;
  const col = columns.find((c) => String(c.field) === sortModel.field);
  if (!col) return rows;

  const sign = sortModel.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = applyValueGetter(a, col);
    const vb = applyValueGetter(b, col);
    if (va == null && vb == null) return 0;
    if (va == null) return 1 * sign;
    if (vb == null) return -1 * sign;
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
    return String(va).localeCompare(String(vb)) * sign;
  });
}

/* ── Pipeline cascateado ─────────────────────────────────────────── */

export function useDataTableProcessor<T>({
  rows,
  columns,
  filterModel,
  search,
  searchField = "all",
  sortModel,
  paginationModel,
}: UseDataTableProcessorParams<T>): UseDataTableProcessorResult<T> {
  // 1. Filter
  const filtered = useMemo(
    () => applyFilters(rows, filterModel, columns),
    [rows, filterModel, columns],
  );

  // 2. Search
  const searched = useMemo(
    () => applySearch(filtered, search, columns, searchField),
    [filtered, search, columns, searchField],
  );

  // 3. Sort
  const sorted = useMemo(
    () => applySort(searched, sortModel, columns),
    [searched, sortModel, columns],
  );

  // 4. Paginate
  const paginated = useMemo(() => {
    const { page, pageSize } = paginationModel;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, paginationModel]);

  return {
    rowsToRender: paginated,
    rowsAllPagesProcessed: sorted,
    totalAfterFilter: sorted.length,
  };
}
```

- [ ] **Step 11.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 11.3: Checkpoint**

Estado: processor pronto. Mudanças de pagina não re-rodam filter/search/sort por causa do useMemo em cascata.

---

## Task 12: Hook `use-data-table-controller` (agrega tudo)

**Files:** Create `src/components/ui/DataTable/hooks/use-data-table-controller.ts`

- [ ] **Step 12.1: Criar controller que invoca todos os outros hooks**

```ts
import { useCallback, useImperativeHandle, useMemo } from "react";
import type { Ref } from "react";
import type {
  DataTableProps,
  DataTableRef,
  DataTableState,
  GridRowId,
} from "../data-table.types";
import type { DataTableContextValue } from "../context/data-table-context";
import { useDataTableColumns } from "./use-data-table-columns";
import { useDataTableSort } from "./use-data-table-sort";
import { useDataTablePagination } from "./use-data-table-pagination";
import { useDataTableSelection } from "./use-data-table-selection";
import { useDataTableDensity } from "./use-data-table-density";
import { useDataTableSearch } from "./use-data-table-search";
import { useDataTableFilters } from "./use-data-table-filters";
import { useDataTableProcessor } from "./use-data-table-processor";

const DEFAULT_GET_ROW_ID = (row: any): GridRowId => row.id;

export function useDataTableController<T>(
  props: DataTableProps<T>,
  ref: Ref<DataTableRef>,
) {
  const getRowId = props.getRowId ?? (DEFAULT_GET_ROW_ID as (row: T) => GridRowId);

  /* ── Hooks SRP ────────────────────────────────────────────────── */

  const cols = useDataTableColumns({ columns: props.columns });

  const sort = useDataTableSort({
    sortModel: props.sortModel,
    onSortModelChange: props.onSortModelChange,
  });

  const filters = useDataTableFilters({
    filterModel: props.filterModel,
    onFilterModelChange: props.onFilterModelChange,
  });

  const search = useDataTableSearch({
    search: props.search,
    onSearchChange: props.onSearchChange,
  });

  // Pagination com auto-reset quando filtros/search mudam
  const pagination = useDataTablePagination({
    paginationModel: props.paginationModel,
    onPaginationModelChange: props.onPaginationModelChange,
    initialPageSize: props.paginationConfig?.initialPageSize,
    resetTriggers: [filters.filterModel.items.length, search.debouncedValue],
  });

  const density = useDataTableDensity({
    density: props.density,
    onDensityChange: props.onDensityChange,
  });

  /* ── Processor (client mode pipeline) ────────────────────────── */

  const processed = useDataTableProcessor({
    rows: props.rows,
    columns: props.columns,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    sortModel: sort.sortModel,
    paginationModel: pagination.paginationModel,
  });

  const selection = useDataTableSelection({
    rows: processed.rowsAllPagesProcessed,
    getRowId,
    selectionModel: props.selectionModel,
    onSelectionModelChange: props.onSelectionModelChange,
  });

  /* ── Estados de feedback ──────────────────────────────────────── */

  const isLoading = !!props.loading;
  const isDataEmpty = !isLoading && props.rows.length === 0;
  const isNoResults =
    !isLoading &&
    props.rows.length > 0 &&
    processed.totalAfterFilter === 0;

  /* ── Snapshot do estado pra getState() ───────────────────────── */

  const getState = useCallback((): DataTableState => ({
    density: density.density,
    sortModel: sort.sortModel,
    paginationModel: pagination.paginationModel,
    selectionModel: selection.state,
    filterModel: filters.filterModel,
    search: search.debouncedValue,
    columnWidths: cols.columnWidths,
    pinnedColumns: cols.pinnedColumns,
    hiddenColumns: cols.hiddenColumns,
    columnOrder: cols.columnOrder,
  }), [
    density.density,
    sort.sortModel,
    pagination.paginationModel,
    selection.state,
    filters.filterModel,
    search.debouncedValue,
    cols.columnWidths,
    cols.pinnedColumns,
    cols.hiddenColumns,
    cols.columnOrder,
  ]);

  /* ── Imperative ref ──────────────────────────────────────────── */

  useImperativeHandle(ref, () => ({
    refresh: () => {
      // No-op em client mode (F5 server mode vai sobrescrever).
    },
    getState,
    getSelectedIds: () => selection.selectedIds,
    getSelectedCount: () => selection.selectedCount,
    clearSelection: selection.clear,
  }), [getState, selection]);

  /* ── Context value memoizado ─────────────────────────────────── */

  const contextValue = useMemo<DataTableContextValue<T>>(() => ({
    rows: props.rows,
    effectiveColumns: cols.effectiveColumns,
    columnWidths: cols.columnWidths,
    stickyOffsets: cols.stickyOffsets,
    columnOrder: cols.columnOrder,
    hiddenColumns: cols.hiddenColumns,
    pinnedColumns: cols.pinnedColumns,
    sortModel: sort.sortModel,
    paginationModel: pagination.paginationModel,
    selection: {
      state: selection.state,
      isRowSelected: selection.isRowSelected,
      selectedCount: selection.selectedCount,
    },
    density: density.density,
    search: search.inputValue,
    filterModel: filters.filterModel,
    getRowId,
  }), [
    props.rows,
    cols.effectiveColumns,
    cols.columnWidths,
    cols.stickyOffsets,
    cols.columnOrder,
    cols.hiddenColumns,
    cols.pinnedColumns,
    sort.sortModel,
    pagination.paginationModel,
    selection.state,
    selection.isRowSelected,
    selection.selectedCount,
    density.density,
    search.inputValue,
    filters.filterModel,
    getRowId,
  ]);

  return {
    contextValue,
    isLoading,
    isDataEmpty,
    isNoResults,
    rowsToRender: processed.rowsToRender,
    totalAfterFilter: processed.totalAfterFilter,
    cols,
    sort,
    pagination,
    selection,
    density,
    search,
    filters,
  };
}
```

- [ ] **Step 12.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 12.3: Checkpoint**

Estado: controller agrega tudo. Próximo: maestro renderiza.

---

## Task 13: parts/ — empty, loading, no-results defaults

**Files:**
- Create `src/components/ui/DataTable/parts/data-table-empty.tsx`
- Create `src/components/ui/DataTable/parts/data-table-loading.tsx`
- Create `src/components/ui/DataTable/parts/data-table-no-results.tsx`

- [ ] **Step 13.1: Criar default empty**

```tsx
// data-table-empty.tsx
import { Inbox } from "lucide-react";

export function DataTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-gp-md min-h-[240px] p-pad-3xl">
      <Inbox className="size-icon-2xl text-fg-subtle" aria-hidden />
      <p className="text-title-md text-fg-default">Nenhum dado cadastrado</p>
      <p className="text-paragraph-sm text-fg-muted text-center max-w-[360px]">
        Comece adicionando novos itens para visualizar aqui.
      </p>
    </div>
  );
}
```

- [ ] **Step 13.2: Criar default loading**

```tsx
// data-table-loading.tsx
import { Loader2 } from "lucide-react";

export function DataTableLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-gp-md min-h-[240px] p-pad-3xl">
      <Loader2 className="size-icon-xl text-fg-brand animate-spin" aria-hidden />
      <p className="text-paragraph-md text-fg-muted">Carregando dados...</p>
    </div>
  );
}
```

- [ ] **Step 13.3: Criar default no-results**

```tsx
// data-table-no-results.tsx
import { SearchX } from "lucide-react";

export function DataTableNoResults() {
  return (
    <div className="flex flex-col items-center justify-center gap-gp-md min-h-[240px] p-pad-3xl">
      <SearchX className="size-icon-2xl text-fg-subtle" aria-hidden />
      <p className="text-title-md text-fg-default">Nenhum dado encontrado</p>
      <p className="text-paragraph-sm text-fg-muted text-center max-w-[360px]">
        Não encontramos nada com os critérios pesquisados. Tente ajustar os filtros.
      </p>
    </div>
  );
}
```

- [ ] **Step 13.4: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 13.5: Checkpoint**

Estado: 3 estados default prontos.

---

## Task 14: parts/data-table-floating-bulk-bar.tsx

**Files:** Create `src/components/ui/DataTable/parts/data-table-floating-bulk-bar.tsx`

- [ ] **Step 14.1: Criar bulk bar floating**

```tsx
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { dataTableStyles } from "../data-table.styles";

const styles = dataTableStyles();

export type DataTableFloatingBulkBarProps = {
  count: number;
  onClear: () => void;
  /** Render custom de actions à direita do count. */
  actions?: ReactNode;
};

export function DataTableFloatingBulkBar({
  count,
  onClear,
  actions,
}: DataTableFloatingBulkBarProps) {
  if (count === 0) return null;
  return (
    <div className={styles.bulkBar()} role="region" aria-label="Ações em massa">
      <span className="text-label-sm font-semibold whitespace-nowrap">
        {count} selecionado{count > 1 ? "s" : ""}
      </span>
      {actions && <div className="flex items-center gap-gp-sm">{actions}</div>}
      <Button
        size="icon-xs"
        variant="ghost"
        color="secondary"
        aria-label="Limpar seleção"
        onClick={onClear}
      >
        <X />
      </Button>
    </div>
  );
}
```

- [ ] **Step 14.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 14.3: Checkpoint**

Estado: bulk bar pronto.

---

## Task 15: Maestro `data-table.tsx`

**Files:** Create `src/components/ui/DataTable/data-table.tsx`

Maestro que orquestra Toolbar (ToolbarSearch + popovers + density) + Table + Footer + bulk bar.

- [ ] **Step 15.1: Criar maestro**

```tsx
import { forwardRef, useMemo } from "react";
import type { Ref, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "../Table";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Button } from "@/components/ui/Button/button";
import { MoreHorizontal, Rows2, Rows3, Rows4 } from "lucide-react";
import {
  TableToolbar,
  ToolbarSearch,
  ToolbarToolButton,
  ToolbarSegmented,
  ToolbarDivider,
  FilterPopover,
  SortPopover,
  ColsPopover,
  type FilterPopoverColumn,
  type FilterPopoverEntry,
  type SortPopoverCriterion,
  type ColsPopoverColumn,
} from "../TableToolbar";
import { FooterTable } from "../FooterTable";
import { SlidersHorizontal, ArrowUpDown, Columns } from "lucide-react";
import type {
  DataTableProps,
  DataTableRef,
  GridRowId,
  SortModel,
  FilterModel,
  FilterItem,
} from "./data-table.types";
import { dataTableStyles } from "./data-table.styles";
import { DataTableProvider } from "./context/data-table-context";
import { useDataTableController } from "./hooks/use-data-table-controller";
import { DataTableEmpty } from "./parts/data-table-empty";
import { DataTableLoading } from "./parts/data-table-loading";
import { DataTableNoResults } from "./parts/data-table-no-results";
import { DataTableFloatingBulkBar } from "./parts/data-table-floating-bulk-bar";

const styles = dataTableStyles();

function DataTableInternal<T>(
  props: DataTableProps<T>,
  ref: Ref<DataTableRef>,
) {
  const controller = useDataTableController(props, ref);
  const {
    contextValue,
    isLoading,
    isDataEmpty,
    isNoResults,
    rowsToRender,
    totalAfterFilter,
    cols,
    sort,
    pagination,
    selection,
    density,
    search,
    filters,
  } = controller;

  const toolbarConfig = props.toolbar ?? {};
  const paginationConfig = props.paginationConfig ?? { enabled: true };
  const selectionConfig = props.selectionConfig ?? { enabled: false };

  /* ── Adapters: ColumnDef → popover types ──────────────────────── */

  const filterPopoverColumns: FilterPopoverColumn[] = useMemo(
    () =>
      cols.effectiveColumns
        .filter((c) => c.enableColumnFilter)
        .map((c) => ({
          key: String(c.field),
          label: c.headerName,
          type: (c.filterType ?? "text") as FilterPopoverColumn["type"],
          options: c.filterOptions?.map((o) => ({ value: o.value, label: o.label })),
        })),
    [cols.effectiveColumns],
  );

  const filterPopoverEntries: FilterPopoverEntry[] = useMemo(
    () =>
      filters.filterModel.items.map((item) => ({
        id: item.id,
        columnKey: item.field,
        op: item.operator as FilterPopoverEntry["op"],
        value: item.value,
      })),
    [filters.filterModel],
  );

  const handleFiltersChange = (entries: FilterPopoverEntry[]) => {
    const items: FilterItem[] = entries.map((e) => ({
      id: e.id,
      field: e.columnKey,
      operator: e.op as FilterItem["operator"],
      value: e.value,
    }));
    filters.setFilterModel({ ...filters.filterModel, items });
  };

  const sortPopoverCriteria: SortPopoverCriterion[] = useMemo(
    () =>
      sort.sortModel
        ? [{ key: sort.sortModel.field, dir: sort.sortModel.direction }]
        : [],
    [sort.sortModel],
  );

  const handleSortChange = (criteria: SortPopoverCriterion[]) => {
    if (criteria.length === 0) sort.setSortModel(null);
    else sort.setSortModel({ field: criteria[0].key, direction: criteria[0].dir });
  };

  const colsPopoverColumns: ColsPopoverColumn[] = useMemo(
    () =>
      props.columns.map((c) => ({
        key: String(c.field),
        label: c.headerName,
        icon: c.icon,
      })),
    [props.columns],
  );

  const visibleColsSet = useMemo(
    () =>
      new Set(
        props.columns
          .map((c) => String(c.field))
          .filter((f) => !cols.hiddenColumns.has(f)),
      ),
    [props.columns, cols.hiddenColumns],
  );

  const pinnedColsSet = useMemo(
    () =>
      new Set(
        Object.entries(cols.pinnedColumns)
          .filter(([, pin]) => pin === "left" || pin === "right")
          .map(([field]) => field),
      ),
    [cols.pinnedColumns],
  );

  /* ── Body content (Table primitivo) ───────────────────────────── */

  const tableBody = (
    <Table density={density.density} cardBreakpoint={props.cardBreakpoint ?? 768}>
      <TableHead>
        {selectionConfig.enabled && (
          <TableHeadCell width={56} align="center">
            <Checkbox
              checked={
                selection.isPageSelected(rowsToRender)
                  ? true
                  : selection.isPageIndeterminate(rowsToRender)
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={() => selection.togglePage(rowsToRender)}
              aria-label="Selecionar página"
            />
          </TableHeadCell>
        )}
        {cols.effectiveColumns.map((col) => {
          const field = String(col.field);
          const isActions = col.type === "actions";
          return (
            <TableHeadCell
              key={field}
              width={cols.columnWidths[field]}
              pinned={col.pinned}
              pinOffset={cols.stickyOffsets[field]}
              align={col.align}
              sortable={!isActions && col.sortable !== false}
              sortDirection={
                sort.sortModel?.field === field ? sort.sortModel.direction : null
              }
              onSortClick={() => sort.handleSort(field)}
              resizable={!isActions && col.resizable !== false}
              onResize={(w) => cols.handleResize(field, w)}
              icon={col.icon}
              headMenu={
                !isActions ? (
                  <Button
                    size="icon-2xs"
                    variant="ghost"
                    color="secondary"
                    aria-label={`Menu da coluna ${col.headerName}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal />
                  </Button>
                ) : undefined
              }
            >
              {col.headerName}
            </TableHeadCell>
          );
        })}
      </TableHead>
      <TableBody>
        {rowsToRender.map((row, index) => {
          const isSel = selection.isRowSelected(row);
          const rowClass = props.getRowClassName?.({ row, index });
          return (
            <TableRow
              key={String(contextValue.getRowId(row))}
              selected={isSel}
              clickable={!!props.onRowClick}
              onClick={() => props.onRowClick?.(row)}
              className={rowClass}
            >
              {selectionConfig.enabled && (
                <TableCell width={56} align="center" className="!px-0">
                  <Checkbox
                    checked={isSel}
                    onCheckedChange={() => selection.toggleRow(row)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Selecionar linha"
                  />
                </TableCell>
              )}
              {cols.effectiveColumns.map((col) => {
                const field = String(col.field);
                const value = col.valueGetter
                  ? col.valueGetter(row)
                  : (row as any)[field];
                const content = col.render
                  ? col.render({ row, value })
                  : col.valueFormatter
                    ? col.valueFormatter(value)
                    : value;
                return (
                  <TableCell
                    key={field}
                    width={cols.columnWidths[field]}
                    pinned={col.pinned}
                    pinOffset={cols.stickyOffsets[field]}
                    align={col.align}
                    ellipsis={col.ellipsis}
                    label={col.headerName}
                  >
                    {content as ReactNode}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  /* ── Render principal ─────────────────────────────────────────── */

  return (
    <DataTableProvider value={contextValue}>
      <div className={cn(styles.root(), props.className)}>
        {/* Toolbar */}
        <div className={styles.toolbarWrap()}>
          <TableToolbar
            left={
              <>
                {toolbarConfig.enableSearch !== false && (
                  <ToolbarSearch
                    value={search.inputValue}
                    onChange={(e) => search.setInputValue(e.target.value)}
                    placeholder="Buscar..."
                  />
                )}
                {toolbarConfig.customLeft}
              </>
            }
            actions={
              <>
                {toolbarConfig.customActions}
                {toolbarConfig.enableFilters !== false && filterPopoverColumns.length > 0 && (
                  <FilterPopover
                    columns={filterPopoverColumns}
                    entries={filterPopoverEntries}
                    onChange={handleFiltersChange}
                    trigger={
                      <ToolbarToolButton
                        icon={<SlidersHorizontal />}
                        label="Filtrar"
                        hasIndicator={filterPopoverEntries.length > 0}
                      />
                    }
                  />
                )}
                {!isActions(toolbarConfig.enableFilters) /* placeholder bool guard */ && null}
                <SortPopover
                  columns={filterPopoverColumns}
                  criteria={sortPopoverCriteria}
                  onChange={handleSortChange}
                  trigger={
                    <ToolbarToolButton
                      icon={<ArrowUpDown />}
                      aria-label="Ordenar"
                    />
                  }
                />
                {toolbarConfig.enableColumns !== false && (
                  <ColsPopover
                    columns={colsPopoverColumns}
                    visible={visibleColsSet}
                    pinned={pinnedColsSet}
                    onVisibleChange={(field, isVisible) => {
                      if (isVisible) cols.handleShow(field);
                      else cols.handleHide(field);
                    }}
                    onPinnedChange={(field, isPinned) => {
                      cols.handlePin(field, isPinned ? "left" : undefined);
                    }}
                    onReorder={(newOrder) => cols.handleReorder(newOrder.map((c) => c.key))}
                    trigger={
                      <ToolbarToolButton
                        icon={<Columns />}
                        aria-label="Colunas"
                      />
                    }
                  />
                )}
                {toolbarConfig.enableDensity !== false && (
                  <>
                    <ToolbarDivider />
                    <ToolbarSegmented
                      value={density.density}
                      onValueChange={(v) => density.setDensity(v as any)}
                      options={[
                        { value: "compact",     icon: <Rows4 />, ariaLabel: "Compacto" },
                        { value: "standard",    icon: <Rows3 />, ariaLabel: "Padrão" },
                        { value: "comfortable", icon: <Rows2 />, ariaLabel: "Confortável" },
                      ]}
                    />
                  </>
                )}
              </>
            }
          />
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          props.renderLoading ?? <DataTableLoading />
        ) : isDataEmpty ? (
          props.renderEmpty ?? <DataTableEmpty />
        ) : isNoResults ? (
          props.renderNoResults ?? <DataTableNoResults />
        ) : (
          tableBody
        )}

        {/* Footer (paginação) */}
        {paginationConfig.enabled !== false && !isDataEmpty && (
          <div className={styles.footerWrap()}>
            <FooterTable
              totalCount={totalAfterFilter}
              page={pagination.paginationModel.page}
              pageSize={pagination.paginationModel.pageSize}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              pageSizeOptions={paginationConfig.pageSizeOptions}
              selectionCount={selection.selectedCount}
            />
          </div>
        )}
      </div>

      {/* Floating bulk bar */}
      {selectionConfig.enabled && selection.selectedCount > 0 && (
        <DataTableFloatingBulkBar
          count={selection.selectedCount}
          onClear={selection.clear}
          actions={selectionConfig.actions?.(selection.selectedIds, selection.clear)}
        />
      )}
    </DataTableProvider>
  );
}

// helper interno — remove na revisão se TS reclamar (placeholder)
function isActions(_x: unknown): boolean {
  return false;
}

type DataTableComponent = <T>(
  props: DataTableProps<T> & { ref?: Ref<DataTableRef> },
) => React.ReactElement;

export const DataTable = forwardRef(DataTableInternal) as DataTableComponent;
```

> **NOTA do plano:** as APIs exatas dos popovers (`FilterPopover`, `SortPopover`, `ColsPopover`) podem variar. Antes de implementar a Task 15, **ler os arquivos** `src/components/ui/TableToolbar/popovers/{filter,sort,cols}-popover.tsx` e ajustar as props dos adapters (`filterPopoverColumns`, `handleFiltersChange`, etc.) pra bater com a API real. O esquema acima é uma proposta; corrija nomes de props (ex: `entries` pode ser `value`, `onChange` pode ser `onApply`, etc.) conforme o que existe.

- [ ] **Step 15.2: Verificar APIs dos popovers e ajustar adapters**

Ler:
- `src/components/ui/TableToolbar/popovers/filter-popover.tsx`
- `src/components/ui/TableToolbar/popovers/sort-popover.tsx`
- `src/components/ui/TableToolbar/popovers/cols-popover.tsx`

E adaptar os 3 adapters (filter, sort, cols) no maestro pra bater com as props reais. Se algum prop não bater, ajuste apenas o `data-table.tsx` (NÃO mexa nos popovers).

- [ ] **Step 15.3: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 15.4: Checkpoint**

Estado: maestro renderiza Table + Toolbar + Footer + Bulk bar. Falta showcase e housekeeping.

---

## Task 16: index.ts barrel + reexport raiz

**Files:**
- Create `src/components/ui/DataTable/index.ts`
- Modify `src/components/index.ts`

- [ ] **Step 16.1: Criar barrel**

```ts
// src/components/ui/DataTable/index.ts
export { DataTable } from "./data-table";
export { useDataTableContext } from "./context/data-table-context";

export { DataTableEmpty } from "./parts/data-table-empty";
export { DataTableLoading } from "./parts/data-table-loading";
export { DataTableNoResults } from "./parts/data-table-no-results";
export { DataTableFloatingBulkBar } from "./parts/data-table-floating-bulk-bar";

export type {
  DataTableProps,
  DataTableColumnDef,
  DataTableRef,
  DataTableState,
  DataTableToolbarConfig,
  DataTablePaginationConfig,
  DataTableSelectionConfig,
  SortModel,
  PaginationModel,
  GridRowId,
  GridSelectionState,
  FilterModel,
  FilterItem,
  FilterOperator,
  FilterValue,
} from "./data-table.types";

export type { DataTableContextValue } from "./context/data-table-context";
export type { DataTableFloatingBulkBarProps } from "./parts/data-table-floating-bulk-bar";
```

- [ ] **Step 16.2: Adicionar reexport em `src/components/index.ts`**

Ler o arquivo. Adicionar logo após `export * from "./ui/Table";`:

```ts
export * from "./ui/DataTable";
```

Não duplicar.

- [ ] **Step 16.3: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 16.4: Checkpoint**

Estado: API pública exposta. Próximo: USAGE.md.

---

## Task 17: USAGE.md

**Files:** Create `src/components/ui/DataTable/USAGE.md`

- [ ] **Step 17.1: Criar doc de uso**

```markdown
# DataTable

Tabela feature-completa pra telas de CRUD. Compõe `<TableToolbar>` + `<Table>` + `<FooterTable>` com hooks SRP gerenciando sort, filter, search, paginação, seleção e visibilidade de colunas.

## Imports

\`\`\`tsx
import { DataTable, type DataTableColumnDef, type DataTableRef } from "@/components/ui/DataTable";
\`\`\`

## Uso básico (client mode)

\`\`\`tsx
interface Client {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}

const columns: DataTableColumnDef<Client>[] = [
  { field: "id",     headerName: "ID",     width: 80,  type: "text" },
  { field: "name",   headerName: "Nome",   width: 240, sortable: true },
  { field: "email",  headerName: "Email",  width: 280, sortable: true,
    enableColumnFilter: true, filterType: "text" },
  { field: "status", headerName: "Status", width: 140,
    enableColumnFilter: true, filterType: "select",
    filterOptions: [
      { label: "Ativo",   value: "active" },
      { label: "Inativo", value: "inactive" },
    ],
    render: ({ value }) => value === "active" ? "🟢 Ativo" : "⚪ Inativo",
  },
];

<DataTable<Client>
  rows={clients}
  columns={columns}
  toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
  selectionConfig={{ enabled: true, enableGlobal: true }}
  onRowClick={(row) => router.push(\`/clients/\${row.id}\`)}
/>
\`\`\`

## Imperative ref

\`\`\`tsx
const tableRef = useRef<DataTableRef>(null);

<DataTable ref={tableRef} ... />

// Em qualquer handler:
tableRef.current?.getSelectedIds();  // → number[] | string[]
tableRef.current?.getSelectedCount(); // → number
tableRef.current?.clearSelection();
tableRef.current?.getState();         // → snapshot completo
\`\`\`

## Configs

### toolbar
- \`enableSearch\` (default true) — ToolbarSearch à esquerda
- \`enableFilters\` (default true) — FilterPopover (só aparece se houver coluna com \`enableColumnFilter\`)
- \`enableColumns\` (default true) — ColsPopover (show/hide, pin, reorder)
- \`enableDensity\` (default true) — ToolbarSegmented compact/standard/comfortable

### paginationConfig
- \`enabled\` (default true)
- \`initialPageSize\` (default 25)
- \`pageSizeOptions\` (default [10, 25, 50, 100])

### selectionConfig
- \`enabled\` (default false)
- \`enableGlobal\` (default false) — permite "select all" em modo exclude
- \`actions\` — render custom de botões no floating bulk bar

## Performance

- \`columns\` deve ser memoizado com \`useMemo\` no componente pai (evita re-criar o array a cada render)
- O processor (filter→search→sort→paginate) usa useMemo cascateado — mudar só a página NÃO re-roda filter/search/sort
- Provider value memoizado — re-render do pai não dispara re-render em cascata nas linhas

## ARIA

Tudo proveniente do \`<Table>\` primitivo: \`role="grid"\`, \`role="row"\`, \`role="columnheader"\` (com \`aria-sort\`), \`role="gridcell"\`. Floating bulk bar tem \`role="region"\` com aria-label.

## Server mode

Em desenvolvimento (F5 do plano). API: passar \`fetchData\` em vez de \`rows\` e o controller delega ao \`useDataTableQuery\`.
```

(Cuidado com as crases — escreva crases normais no arquivo final, sem escape.)

- [ ] **Step 17.2: Validar typecheck**

```bash
npm run tokens:check
```

- [ ] **Step 17.3: Checkpoint**

Estado: USAGE.md pronto.

---

## Task 18: Showcase `DataTableDoc.tsx`

**Files:**
- Create `src/preview/pages/DataTableDoc.tsx`
- Modify routing (App.tsx + doc-nav-data.ts) — descobrir padrão como na F1

- [ ] **Step 18.1: Descobrir padrão de registro**

Procurar onde `TableDoc` é importado/registrado:

```bash
grep -r "TableDoc" "c:/Users/sergi/OneDrive/Área de Trabalho/igreen-crm-design/Modelo/src" --include="*.tsx" -l
grep -r "TableDoc" "c:/Users/sergi/OneDrive/Área de Trabalho/igreen-crm-design/Modelo/src/preview" --include="*.ts" -l
```

Replicar para `DataTableDoc`.

- [ ] **Step 18.2: Criar DataTableDoc.tsx**

```tsx
import { useMemo } from "react";
import {
  Hash, User, AtSign, Phone, CheckCircle2, Tag,
  Users as UsersIcon, DollarSign, Calendar,
} from "lucide-react";
import { DataTable, type DataTableColumnDef } from "@/components/ui/DataTable";
import { Badge } from "@/components/shadcn/badge";
import {
  DocLayout, DocHeader, DocSeparator,
  SectionH2, ExampleSection,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-basic", label: "Client mode básico" },
  { id: "ex-filters", label: "Com filtros e busca" },
  { id: "ex-selection", label: "Seleção + bulk bar" },
  { id: "ex-empty", label: "Estados (empty / no-results)" },
];

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  category: "royal" | "lead" | "licenciado";
  value: number;
  createdAt: number;
};

const STATUS_MAP: Record<Client["status"], { label: string; color: "success" | "warning" | "secondary" }> = {
  active:   { label: "Ativo",    color: "success" },
  pending:  { label: "Pendente", color: "warning" },
  inactive: { label: "Inativo",  color: "secondary" },
};

const CATEGORY_MAP: Record<Client["category"], { label: string; color: "warning" | "info" | "success" }> = {
  royal:      { label: "Royal",      color: "warning" },
  lead:       { label: "Lead",       color: "success" },
  licenciado: { label: "Licenciado", color: "info" },
};

const BASE = new Date("2026-04-15T12:00:00Z").getTime();
const D = 86400000;

const SEED: Client[] = [
  { id: "CLI-2401", name: "Maria Silva",     email: "maria.silva@example.com",     phone: "+55 11 91234-5678", status: "active",   category: "royal",      value: 4800,  createdAt: BASE - 65 * D },
  { id: "CLI-2402", name: "João Santos",     email: "joao.santos@example.com",     phone: "+55 11 92345-6789", status: "pending",  category: "licenciado", value: 12300, createdAt: BASE - 58 * D },
  { id: "CLI-2403", name: "Carlos Oliveira", email: "carlos.oliveira@example.com", phone: "+55 11 93456-7890", status: "active",   category: "lead",       value: 2150,  createdAt: BASE - 51 * D },
  { id: "CLI-2404", name: "Ana Costa",       email: "ana.costa@example.com",       phone: "+55 11 94567-8901", status: "inactive", category: "royal",      value: 8900,  createdAt: BASE - 44 * D },
  { id: "CLI-2405", name: "Pedro Pereira",   email: "pedro.pereira@example.com",   phone: "+55 11 95678-9012", status: "inactive", category: "lead",       value: 1100,  createdAt: BASE - 37 * D },
  { id: "CLI-2406", name: "Lúcia Almeida",   email: "lucia.almeida@example.com",   phone: "+55 11 96789-0123", status: "active",   category: "licenciado", value: 6750,  createdAt: BASE - 30 * D },
  { id: "CLI-2407", name: "Roberto Souza",   email: "roberto.souza@example.com",   phone: "+55 11 97890-1234", status: "pending",  category: "royal",      value: 15200, createdAt: BASE - 23 * D },
  { id: "CLI-2408", name: "Fernanda Lima",   email: "fernanda.lima@example.com",   phone: "+55 11 98901-2345", status: "active",   category: "lead",       value: 3400,  createdAt: BASE - 16 * D },
  { id: "CLI-2409", name: "Bruno Rodrigues", email: "bruno.rodrigues@example.com", phone: "+55 11 99012-3456", status: "inactive", category: "licenciado", value: 5600,  createdAt: BASE - 9 * D  },
  { id: "CLI-2410", name: "Camila Ribeiro",  email: "camila.ribeiro@example.com",  phone: "+55 11 90123-4567", status: "active",   category: "royal",      value: 9800,  createdAt: BASE - 2 * D  },
];

const MONTHS = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const fmtDate = (n: number) => {
  const d = new Date(n);
  return `${String(d.getDate()).padStart(2, "0")} de ${MONTHS[d.getMonth()]}`;
};
const fmtCurrency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function DataTableDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Tables"
        title="DataTable"
        description="Tabela feature-completa: Table + TableToolbar + FooterTable + hooks SRP. Client mode com sort, filter, search, paginação e seleção. (Server mode em F5.)"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Client mode básico"
        description="Passa rows + columns. Sort, paginação e density funcionam de cara."
      >
        <div className="w-full">
          <BasicExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-filters"
        title="Com filtros + busca"
        description="Colunas com `enableColumnFilter: true` aparecem no FilterPopover. Search debounced 500ms."
      >
        <div className="w-full">
          <FiltersExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-selection"
        title="Seleção + bulk bar"
        description="`selectionConfig.enabled` ativa checkbox na primeira coluna e floating bulk bar."
      >
        <div className="w-full">
          <SelectionExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-empty"
        title="Estados: empty / loading / no-results"
        description="`rows` vazio → empty. `loading=true` → loading. Filtro sem match → no-results."
      >
        <div className="w-full">
          <EmptyStatesExample />
        </div>
      </ExampleSection>
    </DocLayout>
  );
}

/* ── Examples ────────────────────────────────────────────────────── */

const columns: DataTableColumnDef<Client>[] = [
  { field: "id",        headerName: "ID",         width: 100, icon: Hash, type: "text" },
  { field: "name",      headerName: "Nome",       width: 200, icon: User, sortable: true },
  { field: "email",     headerName: "Email",      width: 240, icon: AtSign,
    enableColumnFilter: true, filterType: "text" },
  { field: "phone",     headerName: "Telefone",   width: 160, icon: Phone },
  { field: "status",    headerName: "Status",     width: 130, icon: CheckCircle2,
    enableColumnFilter: true, filterType: "select",
    filterOptions: Object.entries(STATUS_MAP).map(([v, m]) => ({ value: v, label: m.label })),
    render: ({ value }: { value: Client["status"] }) => {
      const m = STATUS_MAP[value];
      return <Badge color={m.color} variant="soft" size="md">{m.label}</Badge>;
    },
  },
  { field: "category",  headerName: "Categoria",  width: 130, icon: Tag,
    enableColumnFilter: true, filterType: "multiSelect",
    filterOptions: Object.entries(CATEGORY_MAP).map(([v, m]) => ({ value: v, label: m.label })),
    render: ({ value }: { value: Client["category"] }) => {
      const m = CATEGORY_MAP[value];
      return <Badge color={m.color} variant="soft" size="md">{m.label}</Badge>;
    },
  },
  { field: "value",     headerName: "Valor",      width: 130, icon: DollarSign, align: "right",
    render: ({ value }: { value: number }) => fmtCurrency(value),
  },
  { field: "createdAt", headerName: "Criado em",  width: 130, icon: Calendar,
    render: ({ value }: { value: number }) => fmtDate(value),
  },
];

function BasicExample() {
  return (
    <DataTable<Client>
      rows={SEED}
      columns={columns}
      toolbar={{ enableSearch: false, enableFilters: false }}
      paginationConfig={{ enabled: true, initialPageSize: 10 }}
    />
  );
}

function FiltersExample() {
  return (
    <DataTable<Client>
      rows={SEED}
      columns={columns}
      toolbar={{ enableSearch: true, enableFilters: true, enableColumns: true, enableDensity: true }}
      paginationConfig={{ enabled: true, initialPageSize: 10 }}
    />
  );
}

function SelectionExample() {
  return (
    <DataTable<Client>
      rows={SEED}
      columns={columns}
      toolbar={{ enableSearch: true, enableFilters: true }}
      paginationConfig={{ enabled: true, initialPageSize: 10 }}
      selectionConfig={{ enabled: true, enableGlobal: false }}
      onRowClick={(row) => alert(`Detail: ${row.name}`)}
    />
  );
}

function EmptyStatesExample() {
  return (
    <DataTable<Client>
      rows={[]}
      columns={columns}
      toolbar={{ enableSearch: false, enableFilters: false }}
      paginationConfig={{ enabled: false }}
    />
  );
}
```

- [ ] **Step 18.3: Registrar no router + menu**

Replicar o padrão de `TableDoc` em `src/App.tsx` e `src/preview/components/doc-nav-data.ts`. Adicionar:

- Import default no App.tsx
- Entry "data-table" em DOC_PAGES
- Render condicional
- Entry "DataTable" em doc-nav-data.ts seção Components

- [ ] **Step 18.4: Validar visualmente**

```bash
npm run dev
```

Abrir `/data-table` no preview. Checklist visual:

- [ ] Section "Basic": tabela renderiza com 10 rows, paginação footer presente, sort no header funciona
- [ ] Section "Filtros": ToolbarSearch funciona com debounce, FilterPopover lista colunas com filtro, aplicar filtro reduz rows e reseta página pra 1
- [ ] Section "Seleção": checkbox aparece na 1ª coluna, click toggle row, header checkbox seleciona página atual com indeterminate, bulk bar flutuante aparece quando count > 0 com "X selecionado" e botão X de limpar
- [ ] Section "Estados": rows=[] mostra DataTableEmpty (ícone Inbox + texto)

Anote falhas em `STATUS: DONE_WITH_CONCERNS` se houver.

- [ ] **Step 18.5: Checkpoint**

Estado: showcase rodando. Próximo: housekeeping.

---

## Task 19: Housekeeping — inventory + pipeline-state

**Files:**
- Modify `.ai/context/components/inventory.md`
- Modify `.ai/status/pipeline-state.md`

- [ ] **Step 19.1: Atualizar inventory.md**

Na seção `## Componentes — ui/ (iGreen puro)`, atualizar contador pra `(3 componentes)` e adicionar linha após Table:

```markdown
| DataTable | `ui/DataTable/data-table.styles.ts` | `src/components/ui/DataTable/` | ✅ implementado (F3+F4 client-side) |
```

Adicionar bloco em "Variantes e API por componente":

```markdown
### DataTable (ui/)
\`\`\`
Props principais:
  rows: T[]
  columns: DataTableColumnDef<T>[]
  toolbar:           { enableSearch, enableFilters, enableColumns, enableDensity, ... }
  paginationConfig:  { enabled, initialPageSize, pageSizeOptions }
  selectionConfig:   { enabled, enableGlobal, actions }
  density:           controlled prop
  sortModel:         controlled prop
  paginationModel:   controlled prop
  selectionModel:    controlled prop
  filterModel:       controlled prop
  search:            controlled prop
  onRowClick, onRowChange, getRowClassName
  renderEmpty/Loading/NoResults

Hooks SRP internos:
  useDataTableController     → agrega tudo
  useDataTableColumns        → widths/pin/hidden/order (composição de useColumnWidths)
  useDataTableSort           → ciclo asc/desc/null
  useDataTablePagination     → {page, pageSize} + reset automático
  useDataTableSelection      → include/exclude model + select page/global
  useDataTableDensity        → controlled/uncontrolled
  useDataTableSearch         → debounce 500ms (setTimeout interno)
  useDataTableFilters        → FilterModel {items, logic}
  useDataTableProcessor      → client pipeline: filter→search→sort→paginate

Out of scope F3+F4 (planos seguintes):
  - Server mode + useDataTableQuery (F5)
  - Fast filters chips + applied bar (F6)
  - localStorage persistence + saved views + ColumnTypes registry (F7)
  - Export CSV (F8)
\`\`\`
- Fonte de verdade: `src/components/ui/DataTable/data-table.tsx` (Maestro)
```

- [ ] **Step 19.2: Adicionar entrada CONCLUÍDO em pipeline-state.md**

No topo, após `<!-- NOVA ENTRADA AQUI -->`:

```markdown
### [2026-05-12] | DS DEV | DataTable (F3+F4 client-side) | CONCLUÍDO
- Input: spec `docs/superpowers/specs/2026-05-12-data-table-design.md` (F3 + F4) + plano `docs/superpowers/plans/2026-05-12-data-table-f3-f4.md` (19 tasks)
- Output:
  - 9 hooks SRP em `src/components/ui/DataTable/hooks/`: controller, columns, sort, pagination, selection, density, search, filters, processor
  - Maestro `data-table.tsx` orquestrando Table + TableToolbar + FooterTable + FloatingBulkBar
  - Context provider memoizado
  - 3 defaults de feedback (empty, loading, no-results)
  - Adapters pra plugar nos popovers existentes (FilterPopover, SortPopover, ColsPopover)
  - Selection include/exclude com togglePage + selectAll + indeterminate
  - Search debounced 500ms
  - Pagination com auto-reset ao mudar filter/search
  - Imperative ref: refresh (no-op em client), getState, getSelectedIds, getSelectedCount, clearSelection
  - Showcase em `/data-table` com 4 sections (basic, filtros, seleção, estados)
- Decisões:
  - Pipeline cascateado em useMemo (mudar página não re-roda filter/search/sort)
  - Provider value memoizado evita re-render em cascata
  - Selection model include/exclude permite "select all" global sem materializar IDs (preparação F8)
  - useDataTableColumns reusa o useColumnWidths existente (Table primitivo)
  - Filter sem modal próprio — usa FilterPopover do TableToolbar existente
- Assumption: APIs dos 3 popovers (filter/sort/cols) são estáveis o suficiente pra adapters no maestro funcionarem sem alterar os popovers
- Lições novas: nenhuma (a confirmar durante execução)
- Pendente: DS Reviewer holistic
```

- [ ] **Step 19.3: Checkpoint**

Estado: docs atualizadas. Próximo: handoff DS Reviewer.

---

## Task 20: Handoff DS Reviewer

**Files:** nenhum (apenas sinalização)

- [ ] **Step 20.1: Sinalizar IMPL_PRONTA**

Comunicar ao usuário:

> DataTable F3+F4 client-side implementado. Showcase em `/data-table` com 4 sections funcionais. IMPL_PRONTA. Próximo passo é revisão holística pelo DS Reviewer (skill `ds-reviewer`) — invoco agora ou prefere revisar visualmente antes?

- [ ] **Step 20.2: Se aprovado, marcar APROVADO no pipeline-state.md**

Substituir a entrada CONCLUÍDO da Task 19.2 por APROVADO (ou adicionar nova entrada).

- [ ] **Step 20.3: Plano F3+F4 encerrado**

Próximo plano: F5 (server mode) será escrito separadamente. F6/F7/F8 também.

---

## Self-Review do plano

### Spec coverage (do design spec)

| Spec requisito | Coberto em |
|---|---|
| `<DataTable>` API props (§5.2 do spec) | Task 1 (types) |
| ColumnDef extended (§5.3 do spec) | Task 1 (DataTableColumnDef) |
| DataTableRef (§5.4 do spec) | Task 1 + Task 12 (useImperativeHandle) |
| Provider memoizado + DataTableRow desacoplado (§9.1, §9.2) | Task 3 (Provider) + Task 15 (Table primitivo já tem row desacoplada) |
| Pipeline cascateado client mode (§9.3) | Task 11 |
| Selection include/exclude (§3.3 #2) | Task 7 |
| Search debounced 500ms (§9.4) | Task 9 |
| Lazy mount popovers (§9.5) | Task 15 (popovers já são Radix Popover) |
| ✅ Modo client com auto-detecção (§3.3 #1) | Task 12 (server vem em F5) |
| ❌ Persistência localStorage (§3.3 #3) | F7 (não inclui aqui) |
| ❌ Saved views (§3.3 #4) | F7 |
| ❌ Column types registry (§3.3 #5) | F7 |
| Filter advanced via popover (§3.3 #6) | Task 15 (FilterPopover existente) |
| ❌ Server mode (§9.6) | F5 |
| Imperative ref (§9.7) | Task 12 |
| Composição visual (§7 do spec) | Task 15 (TableToolbar + Table + FooterTable + bulkBar) |
| Estados empty/loading/no-results | Task 13 + Task 15 |

**Gaps identificados durante self-review:**

- Toolbar do spec menciona `enableExport` (F8) e `enableSavedViews` (F7) — NÃO incluí no `DataTableToolbarConfig` desta versão. Adicionar quando vier o plano F7/F8.
- Spec menciona `customLeft` e `customActions` slots da toolbar — incluí no Task 15.

### Placeholder scan

Procurei TBD/TODO/etc. **1 problema encontrado:** o helper `isActions` no Task 15 step 1 é placeholder TS-guard sem uso real. Vou marcar pra ser removido na revisão.

Fix inline (já anotado no step): instrução "remove na revisão se TS reclamar" — implementer remove.

### Type consistency

- `SortModel` definido Task 1 (direction non-null), usado consistente em Tasks 5, 11, 12, 15
- `GridRowId = string | number` consistente em Tasks 1, 7, 12, 14
- `DataTableColumnDef<T>` superset do `TableColumnDef` (do Table) — consistent via reusing `ColumnPinned`, `CellAlign` do Table primitivo
- `FilterModel` items + logicOperator — usado igual em Tasks 1, 10, 11, 15
- `DataTableContextValue<T>` genérico mas downcast com `any` no createContext default — pattern aceitável (Task 3)

### Escopo

Plano cobre F3 + F4 exclusivamente. F5-F8 ficam pra planos futuros. ✓

### Ordem de execução

Tasks 1-2 (types + styles): sem dependências internas
Tasks 3 (Context): depende de Task 1
Tasks 4-11 (hooks): cada um isolado, podem ser ordem qualquer entre si
Task 12 (controller): depende de Tasks 4-11
Tasks 13-14 (parts): sem dependências
Task 15 (maestro): depende de Tasks 3, 12, 13, 14
Tasks 16-17 (barrel + USAGE): depende de Task 15
Task 18 (showcase): depende de Task 16
Tasks 19-20 (housekeeping + handoff): depende de Task 18

Subagent-driven: dispatch em sequência. Cada task isolada.
