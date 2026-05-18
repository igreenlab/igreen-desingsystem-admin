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
  type DataTableRef,
} from "@/components/ui/DataTable";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Dataset gigante: 10k linhas pra demonstrar virtualização ────────────
 *
 * Sem virtualização, renderizar 10k rows derruba o browser (scroll
 * travado, layout shift visível, memória alta). Com virtualize=true,
 * só ~30-40 rows ficam no DOM por vez — scroll é fluido. */

const CLIENTS_10K: ClientRow[] = Array.from({ length: 1000 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${10000 + batch * 10 + i}`,
  })),
).flat();

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  { field: "id", headerName: "ID", width: 130, icon: Hash, type: "text" },
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
  { field: "phone", headerName: "Telefone", width: 170, icon: Phone },
  {
    field: "statusId",
    headerName: "Status",
    width: 140,
    icon: CheckCircle2,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(STATUSES).map(([v, m]) => ({
      value: v,
      label: m.label,
    })),
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
    filterOptions: Object.entries(CATEGORIES).map(([v, m]) => ({
      value: v,
      label: m.label,
    })),
    valueFormatter: (v) => CATEGORIES[v as keyof typeof CATEGORIES]?.label ?? String(v ?? ""),
    render: ({ value }) => <CategoryChip categoryId={value as keyof typeof CATEGORIES} />,
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
    render: ({ value }) => <AgentCell agentId={value as keyof typeof AGENTS} />,
  },
  {
    field: "value",
    headerName: "Valor",
    width: 130,
    icon: DollarSign,
    align: "right",
    sortable: true,
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
    enableColumnFilter: true,
    filterType: "date",
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ),
  },
  { field: "location", headerName: "Localização", width: 150, icon: Type },
];

/**
 * Página standalone — DataTable virtualizado com 10k linhas.
 *
 * Compare scroll, busca, filtro e ordenação com o exemplo CRUD normal
 * (50 linhas, sem virtualize). Esta página com paginação DESABILITADA pra
 * mostrar que dá pra ter scroll de tudo de uma vez (Notion/Linear-like).
 */
export default function ClientsVirtualizedPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows] = useState<ClientRow[]>(() => CLIENTS_10K);
  const tableRef = useRef<DataTableRef>(null);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Virtualized (10k)"
      description="DataTable com virtualize ligado e paginação desabilitada. As 10k rows ficam no dataset, mas só ~30-40 são renderizadas no DOM por vez. Scroll, busca, filtro e ordenação operam em tempo real. Setas ↑↓ navegam o foco com scroll auto."
      code={CODE}
    >
      <DataTable<ClientRow>
          ref={tableRef}
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          // Fase F.3 — virtualização ativa.
          // Sem isso, renderizar 10k rows trava o browser por 3-5s na inicialização.
          virtualize
          // Paginação desligada pra demonstrar scroll de tudo de uma vez.
          paginationConfig={{ enabled: false }}
          toolbar={{
            title: "Clientes",
            enableSearch: true,
            enableFilters: true,
            enableColumns: true,
            enableDensity: true,
            enableExport: true,
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

const CODE = `import { DataTable } from "@/components/ui/DataTable";

const [rows] = useState<ClientRow[]>(() => CLIENTS_10K); // 10.000 rows

<DataTable<ClientRow>
  rows={rows}
  columns={columns}
  getRowId={(r) => r.id}
  virtualize                          // ← liga @tanstack/react-virtual
  paginationConfig={{ enabled: false }} // virtualização geralmente exclui paginação
  toolbar={{
    enableSearch: true,
    enableFilters: true,
    enableColumns: true,
    enableDensity: true,
  }}
  selectionConfig={{
    enabled: true,
    enableGlobal: true,
  }}
/>`;
