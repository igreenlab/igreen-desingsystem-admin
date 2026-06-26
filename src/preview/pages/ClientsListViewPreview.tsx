import { useMemo, useState } from "react";
import { Hash, User, AtSign, CheckCircle2, Tag, DollarSign } from "lucide-react";
import {
  CLIENTS_MOCK,
  STATUSES,
  CATEGORIES,
  formatCurrency,
  PersonCell,
  StatusDot,
  CategoryChip,
  type ClientRow,
} from "./TableDoc";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableListConfig,
  type DataTableViewMode,
} from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { ExamplePageLayout } from "../components/example-page-layout";

const STATUS_CHIP: Record<string, "success" | "warning" | "info" | "neutral"> = {
  active: "success",
  pending: "warning",
  paused: "info",
  inactive: "neutral",
};

const CLIENTS_40: ClientRow[] = Array.from({ length: 4 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({ ...row, id: `CLI-${4200 + batch * 10 + i}` })),
).flat();

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  { field: "id", headerName: "ID", width: 120, icon: Hash, type: "text" },
  {
    field: "name",
    headerName: "Nome",
    minWidth: 220,
    icon: User,
    isPrimary: true,
    sortable: true,
    enableColumnFilter: true,
    filterType: "text",
    render: ({ row }) => <PersonCell row={row} />,
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 220,
    icon: AtSign,
    enableColumnFilter: true,
    filterType: "text",
  },
  {
    field: "statusId",
    headerName: "Status",
    width: 140,
    icon: CheckCircle2,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(STATUSES).map(([v, m]) => ({ value: v, label: m.label })),
    valueFormatter: (v) => STATUSES[v as keyof typeof STATUSES]?.label ?? String(v ?? ""),
    render: ({ value }) => <StatusDot statusId={value as keyof typeof STATUSES} />,
  },
  {
    field: "categoryId",
    headerName: "Categoria",
    width: 130,
    icon: Tag,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(CATEGORIES).map(([v, m]) => ({ value: v, label: m.label })),
    valueFormatter: (v) => CATEGORIES[v as keyof typeof CATEGORIES]?.label ?? String(v ?? ""),
    render: ({ value }) => <CategoryChip categoryId={value as keyof typeof CATEGORIES} />,
  },
  {
    field: "value",
    headerName: "Valor",
    width: 130,
    icon: DollarSign,
    align: "right",
    sortable: true,
    type: "number",
    enableColumnFilter: true,
    filterType: "number",
    aggregate: "sum",
    aggregateFormatter: (v) => formatCurrency(v),
    valueFormatter: (v) => (typeof v === "number" ? formatCurrency(v) : ""),
    render: ({ value }) => (
      <span className="font-semibold tabular-nums">{formatCurrency(value as number)}</span>
    ),
  },
];

/**
 * Página standalone — DataTable com viewMode **table ↔ list** (F.5).
 *
 * - `listConfig.renderItem(row)` renderiza cada row como card de lista; o
 *   DataTable mantém a MESMA toolbar (busca/filtros/views/ações) e só troca o
 *   corpo (igual ao kanban). O toggle Tabela/Lista aparece automático na toolbar.
 * - Rows da lista = `rowsAllPagesProcessed` (filter+search+sort aplicados).
 * - `hierarchical: true` + `getTreeDataPath` aninha (árvore) — aqui é flat.
 */
export default function ClientsListViewPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows] = useState<ClientRow[]>(() => CLIENTS_40);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("list");

  const listConfig = useMemo<DataTableListConfig<ClientRow>>(
    () => ({
      renderItem: (row) => (
        <div className="flex w-full items-center gap-gp-lg">
          <Avatar size="md" colorHex={row.avatarColor}>
            {row.initials}
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-gp-2xs">
            <span className="truncate text-body-md font-semibold text-fg-default">
              {row.name}
            </span>
            <span className="truncate text-caption-md text-fg-muted">{row.email}</span>
          </div>
          <Chip
            color={STATUS_CHIP[row.statusId]}
            variant="soft"
            size="sm"
            shape="pill"
          >
            {STATUSES[row.statusId].label}
          </Chip>
          <span className="hidden shrink-0 text-body-sm font-semibold tabular-nums text-fg-muted sm:block">
            {formatCurrency(row.value)}
          </span>
        </div>
      ),
    }),
    [],
  );

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="View toggle (Tabela ↔ Lista)"
      description="DataTable com viewMode list (F.5) — alterna entre Tabela e Lista pelo toggle nativo da toolbar (igual ao kanban), mas o corpo vira uma lista de cards via listConfig.renderItem. A toolbar (busca, filtros, views, totalizadores) é a mesma; só o corpo troca. Para árvore, use listConfig.hierarchical + getTreeDataPath."
      code={CODE}
    >
      <DataTable<ClientRow>
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="clients-list-view-demo"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listConfig={listConfig}
        showTotalizers
        toolbar={{
          title: "Clientes",
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
        }}
        paginationConfig={{ enabled: true, initialPageSize: 25 }}
        onRowClick={(row) => console.log("Row click:", row.name)}
        className="max-h-full"
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable, type DataTableListConfig } from "@snksergio/design-system";

const listConfig: DataTableListConfig<Row> = {
  renderItem: (row) => (
    <div className="flex w-full items-center gap-gp-lg">
      <Avatar size="md" colorHex={row.avatarColor}>{row.initials}</Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-md font-semibold">{row.name}</span>
        <span className="truncate text-caption-md text-fg-muted">{row.email}</span>
      </div>
      <Chip color="success" variant="soft" size="sm" shape="pill">Ativo</Chip>
    </div>
  ),
  // hierarchical: true,  // + getTreeDataPath → lista em árvore
};

<DataTable
  rows={rows}
  columns={columns}
  getRowId={(r) => r.id}
  viewMode={viewMode}              // "table" | "list" | "kanban"
  onViewModeChange={setViewMode}
  listConfig={listConfig}          // ⭐ habilita o toggle Tabela/Lista
  toolbar={{ enableSearch: true }} // a MESMA toolbar nos dois modos
/>`;
