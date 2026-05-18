import { useMemo, useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
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
} from "@/components/ui/DataTable";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Dataset 50 linhas ─────────────────────────────────────────── */

const CLIENTS_50: ClientRow[] = Array.from({ length: 5 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${6000 + batch * 10 + i}`,
  })),
).flat();

/* ── Lookup tables pra user type (Fase G.3) ───────────────────── */

const AGENTS_LOOKUP = Object.fromEntries(
  Object.entries(AGENTS).map(([id, a]) => [
    id,
    { name: a.name, initials: a.name.split(" ").map((s) => s[0]).join("").slice(0, 2), color: a.color },
  ]),
);

// Map status → semantic color names que o BadgeColumnType entende.
// O mock original usa CSS vars (var(--color-fg-success)) que não são parseáveis;
// aqui passamos nomes semanticos pro Chip pintar correto.
const STATUS_COLOR_MAP: Record<string, string> = {
  active: "success",
  pending: "warning",
  paused: "info",
  inactive: "neutral",
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  royal: "warning",
  licensed: "primary",
  lead: "success",
};

const STATUS_OPTIONS = Object.entries(STATUSES).map(([v, m]) => ({
  value: v,
  label: m.label,
  color: STATUS_COLOR_MAP[v] ?? "neutral",
}));

const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([v, m]) => ({
  value: v,
  label: m.label,
  color: CATEGORY_COLOR_MAP[v] ?? "neutral",
}));

const AGENT_OPTIONS = Object.entries(AGENTS).map(([v, a]) => ({
  value: v,
  label: a.name,
}));

/* ── Colunas declarativas via `type` ──────────────────────────── */

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  // text: render default = raw value
  { field: "id", headerName: "ID", type: "text", width: 130 },

  // user: avatar + nome via lookup
  {
    field: "name",
    headerName: "Nome",
    type: "user",
    sortable: true,
    width: 220,
    typeOptions: {
      // name + initials direto da row (não precisa de lookup separado)
      // mas pra demo passamos o registry de users:
      users: Object.fromEntries(
        CLIENTS_50.map((c) => [
          c.name,
          { name: c.name, initials: c.name.split(" ").map((s) => s[0]).join("").slice(0, 2) },
        ]),
      ),
    },
    valueGetter: (row) => row.name,
  },

  // email: mailto link automático
  { field: "email", headerName: "Email", type: "email", enableColumnFilter: true },

  // phone: tel link automático
  { field: "phone", headerName: "Telefone", type: "phone" },

  // status: chip colorido via filterOptions.color
  {
    field: "statusId",
    headerName: "Status",
    type: "status",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: STATUS_OPTIONS,
  },

  // badge: igual status (alias)
  {
    field: "categoryId",
    headerName: "Categoria",
    type: "badge",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: CATEGORY_OPTIONS,
  },

  // user: avatar via typeOptions.users
  {
    field: "agentId",
    headerName: "Atribuído",
    type: "user",
    enableColumnFilter: true,
    filterType: "select",
    filterOptions: AGENT_OPTIONS,
    typeOptions: { users: AGENTS_LOOKUP },
  },

  // currency: R$ formatado + tabular + alinhado direita (defaults do tipo)
  {
    field: "value",
    headerName: "Valor",
    type: "currency",
    sortable: true,
    enableColumnFilter: true,
    filterType: "number",
    aggregate: "sum",
    aggregateFormatter: (v) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v),
  },

  // date: "15 fev" + DatePicker no filter
  {
    field: "createdAt",
    headerName: "Criado em",
    type: "date",
    sortable: true,
    enableColumnFilter: true,
    filterType: "date",
  },

  // datetime: data + hora
  {
    field: "lastContact",
    headerName: "Último contato",
    type: "datetime",
    sortable: true,
  },

  // text com filterType custom
  {
    field: "location",
    headerName: "Localização",
    type: "text",
    width: 150,
    enableColumnFilter: true,
    filterType: "text",
  },
];

/**
 * Página standalone — DataTable usando APENAS `type: "..."` declarativo.
 *
 * Sem `render` custom em nenhuma coluna — cada tipo do registry traz:
 *  - Render da célula (link mailto/tel pra email/phone, chip colorido pra
 *    status/badge, avatar pra user, "R$ X" pra currency, etc)
 *  - Input de filtro adequado (DatePicker pra date, Select pra status, etc)
 *  - Align/width/sortable defaults
 *  - Chip do filtro formatado
 *
 * Compare com `ClientsCRUDPreview` (que usa `render` manual). Mesma UI, sem
 * boilerplate.
 */
export default function ClientsTypedPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows] = useState<ClientRow[]>(() => CLIENTS_50);
  const tableRef = useRef<DataTableRef>(null);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Column types"
      description="DataTable declarativo — cada coluna declara apenas type: '...' e o registry resolve cell render, filter input (advanced + chip), formatação, alinhamento e largura. Tipos: text, email, phone, status, badge, user, currency, date, datetime."
      code={CODE}
    >
      <DataTable<ClientRow>
          ref={tableRef}
          rows={rows}
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
            pageSizeOptions: [10, 25, 50],
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
          showTotalizers
          onRowClick={(row) => console.log("Row click:", row.name, row.id)}
          className="max-h-full"
        />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable, type DataTableColumnDef } from "@/components/ui/DataTable";

const columns: DataTableColumnDef<ClientRow>[] = [
  // Cada coluna declara apenas \`type\` — registry resolve tudo
  { field: "id",         headerName: "ID",         type: "text",     width: 130 },
  { field: "name",       headerName: "Nome",       type: "user",     sortable: true,
    typeOptions: { users: USERS_LOOKUP } },
  { field: "email",      headerName: "Email",      type: "email" },
  { field: "phone",      headerName: "Telefone",   type: "phone" },
  { field: "statusId",   headerName: "Status",     type: "status",
    enableColumnFilter: true, filterType: "multiSelect",
    filterOptions: STATUS_OPTIONS },
  { field: "categoryId", headerName: "Categoria",  type: "badge",
    enableColumnFilter: true, filterOptions: CATEGORY_OPTIONS },
  { field: "value",      headerName: "Valor",      type: "currency",
    sortable: true, aggregate: "sum" },
  { field: "createdAt",  headerName: "Criado em",  type: "date",
    sortable: true, enableColumnFilter: true, filterType: "date" },
  { field: "lastContact", headerName: "Último contato", type: "datetime" },
];

<DataTable<ClientRow>
  rows={rows}
  columns={columns}                  // ← sem render custom; registry resolve tudo
  toolbar={{ enableSearch: true, enableFilters: true, enableExport: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
  selectionConfig={{ enabled: true, enableGlobal: true }}
  showTotalizers
/>`;
