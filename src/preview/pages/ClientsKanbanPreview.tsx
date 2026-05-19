import { useMemo, useRef, useState } from "react";
import {
  CLIENTS_MOCK,
  STATUSES,
  CATEGORIES,
  AGENTS,
  type ClientRow,
} from "./TableDoc";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableRef,
  type DataTableViewMode,
  type DataTableKanbanConfig,
} from "@/components/ui/DataTable";
import type { KanbanColumn } from "@/components/ui/Kanban";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Dataset 30 linhas (suficiente pra demonstrar 4 colunas no board) ──── */

const CLIENTS_30: ClientRow[] = Array.from({ length: 3 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${7000 + batch * 10 + i}`,
  })),
).flat();

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "success",
  pending: "warning",
  paused: "info",
  inactive: "neutral",
};

const STATUS_OPTIONS = Object.entries(STATUSES).map(([v, m]) => ({
  value: v,
  label: m.label,
  color: STATUS_COLOR_MAP[v] ?? "neutral",
}));

const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([v, m]) => ({
  value: v,
  label: m.label,
  color: m.kind,
}));

/* ── Colunas da DataTable (view tabela) ────────────────────────────────── */

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  { field: "id", headerName: "ID", type: "text", width: 130 },
  { field: "name", headerName: "Nome", type: "user", sortable: true, width: 220 },
  { field: "email", headerName: "Email", type: "email", enableColumnFilter: true },
  {
    field: "statusId",
    headerName: "Status",
    type: "status",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: STATUS_OPTIONS,
  },
  {
    field: "categoryId",
    headerName: "Categoria",
    type: "badge",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: CATEGORY_OPTIONS,
  },
  {
    field: "value",
    headerName: "Valor",
    type: "currency",
    sortable: true,
    enableColumnFilter: true,
    filterType: "number",
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    type: "date",
    sortable: true,
    enableColumnFilter: true,
    filterType: "date",
  },
];

/* ── Colunas do Kanban — explícitas pra controlar ordem + cores ───────── */

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "active",   label: "Ativo",    dotColor: "var(--color-fg-success)" },
  { id: "pending",  label: "Pendente", dotColor: "var(--color-fg-warning)" },
  { id: "paused",   label: "Pausado",  dotColor: "var(--color-fg-info)" },
  { id: "inactive", label: "Inativo",  dotColor: "var(--color-fg-muted)", canReceiveDrop: false },
];

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * Demo de integração `DataTable × Kanban` (caminho D — primitive dumb +
 * smart orchestrator). Mesma fonte de dados; toggle alterna a renderização.
 *
 * Filter/search/sort/selection aplicam transparente em ambas as views —
 * a Kanban consome `rowsAllPagesProcessed` (filter+search+sort já aplicados).
 * Coluna "Inativo" tem `canReceiveDrop: false` (terminal).
 */
export default function ClientsKanbanPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows, setRows] = useState<ClientRow[]>(() => CLIENTS_30);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
  const tableRef = useRef<DataTableRef>(null);

  const kanbanConfig = useMemo<DataTableKanbanConfig<ClientRow>>(() => ({
    groupByField: "statusId",
    columns: KANBAN_COLUMNS,
    renderCard: ({ row }) => {
      const status = STATUSES[row.statusId];
      const category = CATEGORIES[row.categoryId];
      const agent = AGENTS[row.agentId];
      return {
        title: row.name,
        subtitle: row.id,
        avatar: <Avatar size="sm" colorHex={row.avatarColor}>{row.initials}</Avatar>,
        chip: category ? (
          <Chip
            color={category.kind}
            variant="soft"
            size="sm"
            shape="pill"
          >
            {category.label}
          </Chip>
        ) : undefined,
        value: formatCurrency(row.value),
        footerLeft: agent ? (
          <span className="inline-flex items-center gap-gp-sm min-w-0 flex-1">
            <Avatar size="xs" colorHex={agent.color}>
              {agent.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
            </Avatar>
            <span className="text-body-sm font-normal text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis">
              {agent.name}
            </span>
          </span>
        ) : undefined,
        footerRight: (
          <span className="text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums] shrink-0">
            {formatDate(row.createdAt)}
          </span>
        ),
        // status redundante? Não — útil pra UI futura (cor lateral, etc).
        description: status ? undefined : "Sem status definido",
      };
    },
    enableDnD: true,
    onCardMove: (cardId, _from, to) => {
      // Optimistic update: muda statusId da row pra coluna destino
      setRows((prev) =>
        prev.map((r) =>
          r.id === cardId ? { ...r, statusId: to as ClientRow["statusId"] } : r,
        ),
      );
    },
  }), []);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Kanban view"
      description="Toggle entre Tabela e Kanban com mesma fonte de dados. Filter/search/sort aplicam transparente em ambas as views. DnD entre colunas com optimistic update; coluna 'Inativo' tem canReceiveDrop: false (terminal)."
      code={CODE}
    >
      <DataTable<ClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        kanbanConfig={kanbanConfig}
        toolbar={{
          title: "Clientes",
          enableSearch: true,
          enableFilters: true,
          // Density e columns popover ocultos em kanban (não fazem sentido em board).
          // ViewToggle (table/kanban) é renderizado automaticamente pelo DataTable
          // quando `viewMode` + `kanbanConfig` estão presentes.
          enableColumns: viewMode === "table",
          enableDensity: viewMode === "table",
        }}
        paginationConfig={{
          enabled: viewMode === "table",
          initialPageSize: 25,
        }}
        selectionConfig={{ enabled: true }}
        onRowClick={(row) => console.log("Row click:", row.name, row.id)}
        className="max-h-full"
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable } from "@/components/ui/DataTable";

const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
const [rows, setRows] = useState<ClientRow[]>(MOCK);

const kanbanConfig: DataTableKanbanConfig<ClientRow> = {
  groupByField: "statusId",
  columns: [
    { id: "active",   label: "Ativo",    dotColor: "var(--color-fg-success)" },
    { id: "pending",  label: "Pendente", dotColor: "var(--color-fg-warning)" },
    { id: "paused",   label: "Pausado",  dotColor: "var(--color-fg-info)" },
    { id: "inactive", label: "Inativo",  canReceiveDrop: false },
  ],
  renderCard: ({ row }) => ({
    title: row.name,
    subtitle: row.id,
    avatar: <Avatar size="sm" colorHex={row.avatarColor}>{row.initials}</Avatar>,
    chip: <Chip variant="soft" size="sm">{row.categoryLabel}</Chip>,
    value: formatCurrency(row.value),
  }),
  enableDnD: true,
  onCardMove: (cardId, _from, to) =>
    setRows(prev => prev.map(r => r.id === cardId ? { ...r, statusId: to } : r)),
};

<DataTable<ClientRow>
  rows={rows}
  columns={tableColumns}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  kanbanConfig={kanbanConfig}
  toolbar={{
    enableSearch: true,
    enableFilters: true,
    enableColumns: viewMode === "table",
    enableDensity: viewMode === "table",
  }}
  paginationConfig={{ enabled: viewMode === "table" }}
  selectionConfig={{ enabled: true }}
/>`;
