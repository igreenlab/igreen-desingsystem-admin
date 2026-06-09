import { useMemo, useRef, useState } from "react";
import {
  Hash,
  User,
  AtSign,
  Phone,
  CheckCircle2,
  Tag,
  Users as UsersIcon,
  DollarSign,
  Calendar,
  Type,
  Download,
  Trash2,
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
  type DataTablePresetView,
  presetView,
  type DataTableRef,
} from "@/components/ui/DataTable";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Dataset 5x: 50 clientes com IDs únicos ────────────────────── */

const CLIENTS_50: ClientRow[] = Array.from({ length: 5 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${2500 + batch * 10 + i}`,
  })),
).flat();

/* ── Columns no formato DataTableColumnDef ────────────────────── */

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 120,
    icon: Hash,
    type: "text",
    // Totalizer (Fase E.2): count com label
    aggregate: (rows) => (
      <span className="text-fg-muted">{rows.length} registros</span>
    ),
  },
  {
    field: "name",
    headerName: "Nome",
    width: 220,
    icon: User,
    sortable: true,
    render: ({ row }) => <PersonCell row={row} />,
  },
  {
    field: "email",
    headerName: "Email",
    width: 240,
    icon: AtSign,
    enableColumnFilter: true,
    filterType: "text",
    render: ({ value }) => (
      <a
        href={`mailto:${value}`}
        className="text-fg-brand hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value as string}
      </a>
    ),
  },
  {
    field: "phone",
    headerName: "Telefone",
    width: 170,
    icon: Phone,
    editable: true,
    render: ({ value }) => (
      <a
        href={`tel:${String(value).replace(/\D/g, "")}`}
        className="text-fg-brand hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value as string}
      </a>
    ),
  },
  {
    field: "statusId",
    headerName: "Status",
    width: 140,
    icon: CheckCircle2,
    editable: true,
    editType: "select",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(STATUSES).map(([v, m]) => ({
      value: v,
      label: m.label,
    })),
    valueFormatter: (v) => STATUSES[v as keyof typeof STATUSES]?.label ?? String(v ?? ""),
    render: ({ value }) => (
      <StatusDot statusId={value as keyof typeof STATUSES} />
    ),
  },
  {
    field: "categoryId",
    headerName: "Categoria",
    width: 130,
    icon: Tag,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(CATEGORIES).map(([v, m]) => ({
      value: v,
      label: m.label,
    })),
    valueFormatter: (v) => CATEGORIES[v as keyof typeof CATEGORIES]?.label ?? String(v ?? ""),
    render: ({ value }) => (
      <CategoryChip categoryId={value as keyof typeof CATEGORIES} />
    ),
  },
  {
    field: "agentId",
    headerName: "Atribuído",
    width: 170,
    icon: UsersIcon,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(AGENTS).map(([v, a]) => ({
      value: v,
      label: a.name,
    })),
    valueFormatter: (v) => AGENTS[v as keyof typeof AGENTS]?.name ?? String(v ?? ""),
    render: ({ value }) => (
      <AgentCell agentId={value as keyof typeof AGENTS} />
    ),
  },
  {
    field: "value",
    headerName: "Valor",
    width: 130,
    icon: DollarSign,
    align: "right",
    sortable: true,
    editable: true,
    editType: "number",
    enableColumnFilter: true,
    filterType: "number",
    // Totalizer (Fase E.2): soma agregada de todas as rows filtradas
    aggregate: "sum",
    aggregateFormatter: (v) => formatCurrency(v),
    valueFormatter: (v) => (typeof v === "number" ? formatCurrency(v) : ""),
    render: ({ value }) => (
      <span className="font-semibold tabular-nums">
        {formatCurrency(value as number)}
      </span>
    ),
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    width: 130,
    icon: Calendar,
    sortable: true,
    // Fase F.2 — date filter (between default via shortcut do header)
    enableColumnFilter: true,
    filterType: "date",
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">
        {formatDateShort(value as number)}
      </span>
    ),
  },
  {
    field: "lastContact",
    headerName: "Último contato",
    width: 150,
    icon: Calendar,
    sortable: true,
    enableColumnFilter: true,
    filterType: "date",
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">
        {formatDateShort(value as number)}
      </span>
    ),
  },
  {
    field: "location",
    headerName: "Localização",
    width: 150,
    icon: Type,
    editable: true,
    enableColumnFilter: true,
    filterType: "text",
  },
];

/**
 * Página standalone de teste — DataTable feature-completo com 50 clientes mock,
 * altura limitada à viewport (scroll interno da tabela, não do body), toolbar
 * com search/filter/sort/cols/density, seleção com bulk bar + global, paginação
 * configurável. Use pra testar comportamento real-world end-to-end.
 */
/* ── Default views (presets read-only, sempre aparecem antes das criadas) ─ */

const DEFAULT_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:ativos",
    name: "Ativos",
    filters: [{ field: "statusId", value: "active" }],
  }),
  presetView({
    id: "preset:alto-valor",
    name: "Alto valor",
    sort: [{ field: "value", direction: "desc" }],
  }),
];

export default function ClientsCRUDPreview() {
  const columns = useMemo(() => COLUMNS, []);
  // useState pra inline edit (Fase D) — onCellEditCommit muta a row no array.
  const [rows, setRows] = useState<ClientRow[]>(() => CLIENTS_50);
  const tableRef = useRef<DataTableRef>(null);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="CRUD"
      description="DataTable feature-completo (client mode) — search, filtros, sort, columns popover, density, select-all global, paginação 10/25/50/100, inline edit async com latência simulada (800ms + 15% chance de erro), totalizers no footer, saved views via persistId."
      code={CODE}
    >
      <DataTable<ClientRow>
          ref={tableRef}
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          persistId="clients-crud-demo"
          defaultViews={DEFAULT_VIEWS}
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
          // Inline edit (Fase D + F.1 async) — duplo click numa coluna `editable: true`
          // abre editor (text/number/select). Aqui simula latencia de API (800ms) +
          // reject ocasional pra demonstrar:
          //   - Spinner overlay enquanto await
          //   - Edit mode mantido aberto em caso de erro (icone vermelho + tooltip)
          //   - Cell fecha automatico no resolve
          onCellEditCommit={async ({ id, field, value }) => {
            await new Promise((res) => setTimeout(res, 800));
            // Simula erro em 15% dos commits pra mostrar fluxo de retry
            if (Math.random() < 0.15) {
              throw new Error("Falha ao salvar — tente novamente");
            }
            setRows((prev) =>
              prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
            );
            console.log("Edit commit:", { id, field, value });
          }}
          // Totalizers (Fase E.2) — footer agregando sum(value) + count(id).
          // Em server mode, troque por `aggregateRow={{ value: serverTotal }}`.
          showTotalizers
          className="max-h-full"
        />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable } from "@/components/ui/DataTable";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { Download, Trash2 } from "lucide-react";

const tableRef = useRef<DataTableRef>(null);
const [rows, setRows] = useState<ClientRow[]>(MOCK_50);

<DataTable<ClientRow>
  ref={tableRef}
  rows={rows}
  columns={columns}
  getRowId={(r) => r.id}
  persistId="clients-crud-demo"
  defaultViews={DEFAULT_VIEWS}
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
        <BulkActionButton icon={<Download />}
          onClick={() => tableRef.current?.exportCsv("selected")}>
          Exportar
        </BulkActionButton>
        <BulkActionButton icon={<Trash2 />} variant="danger"
          onClick={() => { remove(selectedIds); clearSelection(); }}>
          Excluir
        </BulkActionButton>
      </>
    ),
  }}
  onCellEditCommit={async ({ id, field, value }) => {
    await api.patch(\`/clients/\${id}\`, { [field]: value });
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }}
  showTotalizers
/>`;
