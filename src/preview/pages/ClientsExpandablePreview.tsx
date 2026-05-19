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
  Mail,
  MapPin,
  Activity,
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
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Dataset normal: 50 clientes ─────────────────────────────────── */

const CLIENTS_50: ClientRow[] = Array.from({ length: 5 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${5000 + batch * 10 + i}`,
  })),
).flat();

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  // Coluna ID marcada como expandable — chevron + click toggla detalhe abaixo
  {
    field: "id",
    headerName: "ID",
    width: 140,
    icon: Hash,
    type: "text",
    expandable: true,
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
    valueFormatter: (v) =>
      STATUSES[v as keyof typeof STATUSES]?.label ?? String(v ?? ""),
    render: ({ value }) => (
      <StatusDot statusId={value as keyof typeof STATUSES} />
    ),
  },
  {
    field: "categoryId",
    headerName: "Categoria",
    width: 130,
    icon: Tag,
    valueFormatter: (v) =>
      CATEGORIES[v as keyof typeof CATEGORIES]?.label ?? String(v ?? ""),
    render: ({ value }) => (
      <CategoryChip categoryId={value as keyof typeof CATEGORIES} />
    ),
  },
  {
    field: "agentId",
    headerName: "Atribuído",
    width: 170,
    icon: UsersIcon,
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
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">
        {formatDateShort(value as number)}
      </span>
    ),
  },
  { field: "location", headerName: "Localização", width: 150, icon: Type },
];

/**
 * Página standalone — DataTable normal + row expansion na coluna ID.
 *
 * Click no chevron (ou em qualquer lugar da cell de ID) toggla o painel
 * de detalhe expandido abaixo da row. Múltiplas rows podem estar abertas
 * simultaneamente (singleExpand=false default).
 */
export default function ClientsExpandablePreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows] = useState<ClientRow[]>(() => CLIENTS_50);
  const tableRef = useRef<DataTableRef>(null);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Expandable row"
      description="Coluna marcada com expandable: true ganha chevron clicável. Click abre painel de detalhe livre abaixo da row (grid 3 colunas com Contato/Comercial/Operacional). Múltiplas rows podem ficar abertas; singleExpand opcional força exclusividade."
      code={CODE}
    >
      <DataTable<ClientRow>
          ref={tableRef}
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          // Fase F.4b — row expansion
          renderRowExpansion={({ row }) => (
            <div className="w-full p-pad-3xl bg-bg-subtle">
              <div className="grid grid-cols-3 gap-gp-3xl max-w-[900px]">
                {/* Bloco de contato */}
                <div className="flex flex-col gap-gp-md">
                  <h4 className="text-body-md font-medium text-fg-muted uppercase tracking-wider">
                    Contato
                  </h4>
                  <div className="flex items-start gap-gp-sm">
                    <Mail className="size-icon-sm text-fg-muted mt-[2px] shrink-0" />
                    <div className="flex flex-col gap-gp-2xs">
                      <span className="text-body-md text-fg-strong break-all">
                        {row.email}
                      </span>
                      <span className="text-body-xs font-normal text-fg-muted">
                        Email principal
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-gp-sm">
                    <Phone className="size-icon-sm text-fg-muted mt-[2px] shrink-0" />
                    <div className="flex flex-col gap-gp-2xs">
                      <span className="text-body-md text-fg-strong">
                        {row.phone}
                      </span>
                      <span className="text-body-xs font-normal text-fg-muted">
                        Telefone
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-gp-sm">
                    <MapPin className="size-icon-sm text-fg-muted mt-[2px] shrink-0" />
                    <div className="flex flex-col gap-gp-2xs">
                      <span className="text-body-md text-fg-strong">
                        {row.location}
                      </span>
                      <span className="text-body-xs font-normal text-fg-muted">
                        Localização
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloco comercial */}
                <div className="flex flex-col gap-gp-md">
                  <h4 className="text-body-md font-medium text-fg-muted uppercase tracking-wider">
                    Comercial
                  </h4>
                  <div className="flex items-start gap-gp-sm">
                    <DollarSign className="size-icon-sm text-fg-muted mt-[2px] shrink-0" />
                    <div className="flex flex-col gap-gp-2xs">
                      <span className="text-title-sm text-fg-brand font-semibold tabular-nums">
                        {formatCurrency(row.value as number)}
                      </span>
                      <span className="text-body-xs font-normal text-fg-muted">
                        Valor anual
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-gp-sm">
                    <Calendar className="size-icon-sm text-fg-muted mt-[2px] shrink-0" />
                    <div className="flex flex-col gap-gp-2xs">
                      <span className="text-body-md text-fg-strong">
                        {formatDateShort(row.createdAt as number)}
                      </span>
                      <span className="text-body-xs font-normal text-fg-muted">
                        Cliente desde
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-gp-sm">
                    <Activity className="size-icon-sm text-fg-muted mt-[2px] shrink-0" />
                    <div className="flex flex-col gap-gp-2xs">
                      <span className="text-body-md text-fg-strong">
                        {formatDateShort(row.lastContact as number)}
                      </span>
                      <span className="text-body-xs font-normal text-fg-muted">
                        Último contato
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloco operacional */}
                <div className="flex flex-col gap-gp-md">
                  <h4 className="text-body-md font-medium text-fg-muted uppercase tracking-wider">
                    Operacional
                  </h4>
                  <div className="flex flex-col gap-gp-2xs">
                    <span className="text-body-xs font-normal text-fg-muted">
                      Atribuído a
                    </span>
                    <AgentCell agentId={row.agentId as keyof typeof AGENTS} />
                  </div>
                  <div className="flex flex-col gap-gp-2xs">
                    <span className="text-body-xs font-normal text-fg-muted">
                      Status
                    </span>
                    <StatusDot statusId={row.statusId as keyof typeof STATUSES} />
                  </div>
                  <div className="flex flex-col gap-gp-2xs">
                    <span className="text-body-xs font-normal text-fg-muted">
                      Categoria
                    </span>
                    <CategoryChip
                      categoryId={row.categoryId as keyof typeof CATEGORIES}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          toolbar={{
            title: "Clientes",
            enableSearch: true,
            enableFilters: true,
            enableColumns: true,
            enableDensity: true,
          }}
          selectionConfig={{ enabled: true }}
          paginationConfig={{
            enabled: true,
            initialPageSize: 25,
            pageSizeOptions: [10, 25, 50],
          }}
          onRowClick={(row) => console.log("Row click:", row.name, row.id)}
          className="max-h-full"
        />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable } from "@/components/ui/DataTable";

const columns: DataTableColumnDef<ClientRow>[] = [
  // Coluna marcada como trigger de expansão (chevron + click handler auto)
  { field: "id", headerName: "ID", expandable: true, width: 130 },
  { field: "name", headerName: "Nome", sortable: true },
  // ... outras colunas
];

<DataTable<ClientRow>
  rows={rows}
  columns={columns}

  // Painel de detalhe — renderiza abaixo da row quando expandida
  renderRowExpansion={({ row }) => (
    <div className="grid grid-cols-3 gap-gp-2xl p-pad-2xl bg-bg-canvas">
      <Section title="Contato">{row.email} / {row.phone}</Section>
      <Section title="Comercial">{formatCurrency(row.value)}</Section>
      <Section title="Operacional">{row.location}</Section>
    </div>
  )}

  // singleExpand: false (default) → múltiplas rows abertas. true → exclusiva
  singleExpand={false}
  defaultExpandedRowIds={[]}
  toolbar={{ enableSearch: true, enableFilters: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
/>`;
