import { useCallback, useMemo, useRef } from "react";
import {
  Hash, User, AtSign, Phone, CheckCircle2, Tag, Users as UsersIcon,
  DollarSign, Calendar, Type, Download, Trash2, RefreshCw,
  Pencil, Eye, Copy, MoreHorizontal,
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
import { ExamplePageLayout } from "../components/example-page-layout";

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

  // Sort (multi)
  if (params.sort.length > 0) {
    result.sort((a, b) => {
      for (const s of params.sort) {
        const field = s.field as keyof ClientRow;
        const sign = s.direction === "asc" ? 1 : -1;
        const va = a[field];
        const vb = b[field];
        const cmp =
          typeof va === "number" && typeof vb === "number"
            ? (va - vb) * sign
            : String(va).localeCompare(String(vb)) * sign;
        if (cmp !== 0) return cmp;
      }
      return 0;
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
    valueFormatter: (v) => STATUSES[v as keyof typeof STATUSES]?.label ?? String(v ?? ""),
    render: ({ value }) => <StatusDot statusId={value as keyof typeof STATUSES} /> },
  { field: "categoryId",  headerName: "Categoria",     width: 130, icon: Tag,
    enableColumnFilter: true, filterType: "select",
    filterOptions: Object.entries(CATEGORIES).map(([v, m]) => ({ value: v, label: m.label })),
    valueFormatter: (v) => CATEGORIES[v as keyof typeof CATEGORIES]?.label ?? String(v ?? ""),
    render: ({ value }) => <CategoryChip categoryId={value as keyof typeof CATEGORIES} /> },
  { field: "agentId",     headerName: "Atribuído",     width: 170, icon: UsersIcon,
    enableColumnFilter: true, filterType: "select",
    filterOptions: Object.entries(AGENTS).map(([v, a]) => ({ value: v, label: a.name })),
    valueFormatter: (v) => AGENTS[v as keyof typeof AGENTS]?.name ?? String(v ?? ""),
    render: ({ value }) => <AgentCell agentId={value as keyof typeof AGENTS} /> },
  { field: "value",       headerName: "Valor",         width: 130, icon: DollarSign, align: "right", sortable: true,
    valueFormatter: (v) => (typeof v === "number" ? formatCurrency(v) : ""),
    render: ({ value }) => (
      <span className="font-semibold tabular-nums">
        {formatCurrency(value as number)}
      </span>
    ) },
  { field: "createdAt",   headerName: "Criado em",     width: 130, icon: Calendar, sortable: true,
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ) },
  { field: "lastContact", headerName: "Último contato", width: 150, icon: Calendar, sortable: true,
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ) },
  { field: "location",    headerName: "Localização",   width: 150, icon: Type,
    enableColumnFilter: true, filterType: "text" },
  // Coluna Actions — getActions retorna lista por row.
  // Items sem showInMenu renderizam inline (icones); com showInMenu vão pro dropdown 3-pontos.
  // `disabled` e `hidden` aceitam fn(row) pra logica condicional.
  {
    field: "_actions",
    headerName: "",
    type: "actions",
    width: 120,
    pinned: "right",
    getActions: ({ row }) => [
      {
        id: "view",
        label: "Visualizar",
        icon: <Eye />,
        onClick: (r) => console.log("Visualizar", r.id),
      },
      {
        id: "edit",
        label: "Editar",
        icon: <Pencil />,
        onClick: (r) => console.log("Editar", r.id),
      },
      {
        id: "duplicate",
        label: "Duplicar",
        icon: <Copy />,
        showInMenu: true,
        onClick: (r) => console.log("Duplicar", r.id),
      },
      {
        id: "delete",
        label: "Excluir",
        icon: <Trash2 />,
        destructive: true,
        showInMenu: true,
        onClick: (r) => console.log("Excluir", r.id),
      },
    ],
  },
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
    <ExamplePageLayout
      category="Data Table Examples"
      title="CRUD Server"
      description="DataTable em server mode — passa fetchData em vez de rows. Sort/filter/search/pagination disparam refetch (latência 500ms simulada). Spinner default durante loading. Botão Refresh externo dispara ref.current.refresh()."
      code={CODE}
    >
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
            enableExport: true,
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
                  onClick={() => tableRef.current?.exportCsv("selected")}
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
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable, type GridFetchParams, type GridFetchResult } from "@/components/ui/DataTable";

async function fetchClients(params: GridFetchParams): Promise<GridFetchResult<ClientRow>> {
  const res = await api.get("/clients", { params: serialize(params) });
  return { data: res.data.items, total: res.data.total };
}

const tableRef = useRef<DataTableRef>(null);

<DataTable<ClientRow>
  ref={tableRef}
  fetchData={fetchClients}  // server mode — sem prop "rows"
  columns={columns}
  getRowId={(r) => r.id}
  toolbar={{
    title: "Clientes",
    enableSearch: true,
    enableFilters: true,
    enableColumns: true,
    enableDensity: true,
    enableExport: true,
  }}
  paginationConfig={{ initialPageSize: 25, pageSizeOptions: [10, 25, 50, 100] }}
  selectionConfig={{ enabled: true, enableGlobal: true }}
/>

// Trigger refetch manualmente:
<Button onClick={() => tableRef.current?.refresh()}>Refresh</Button>`;
