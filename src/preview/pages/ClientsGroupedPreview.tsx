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
  ChevronDown,
  ChevronRight,
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
import { Button } from "@/components/ui/Button/button";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Dataset 50 linhas pra demonstrar agrupamento por status ────── */

const CLIENTS_50: ClientRow[] = Array.from({ length: 5 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${4000 + batch * 10 + i}`,
  })),
).flat();

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  { field: "id", headerName: "ID", width: 120, icon: Hash, type: "text" },
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
    // Subtotalizer inline no group header (sum por grupo) + grand total no footer
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
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">
        {formatDateShort(value as number)}
      </span>
    ),
  },
  { field: "location", headerName: "Localização", width: 150, icon: Type },
];

type GroupField = "statusId" | "categoryId" | "agentId" | "location";
const GROUP_OPTIONS: Array<{ value: GroupField; label: string }> = [
  { value: "statusId", label: "Status" },
  { value: "categoryId", label: "Categoria" },
  { value: "agentId", label: "Agente" },
  { value: "location", label: "Localização" },
];

type RenderMode = "column-aligned" | "freeform";
const RENDER_MODE_OPTIONS: Array<{ value: RenderMode; label: string }> = [
  { value: "column-aligned", label: "Coluna-alinhado" },
  { value: "freeform", label: "Livre" },
];

/**
 * Página standalone — DataTable com agrupamento por field configurável.
 *
 * - Header de grupo: chevron + label + count + subtotal de `value` (Fase E.2 reusado)
 * - Click no header → toggle expand/collapse
 * - Toggle via dropdown no toolbar (Status / Categoria / Agente / Localização)
 * - Sort/filter/search funcionam normalmente (dentro do grupo)
 * - Pagination automaticamente desligada quando groupBy ativo
 */
export default function ClientsGroupedPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows] = useState<ClientRow[]>(() => CLIENTS_50);
  const [groupBy, setGroupBy] = useState<GroupField>("statusId");
  const [renderMode, setRenderMode] = useState<RenderMode>("column-aligned");
  const tableRef = useRef<DataTableRef>(null);

  const controls = (
    <div className="flex flex-wrap items-center gap-gp-sm">
      <span className="text-body-xs text-fg-muted">Agrupar por:</span>
      {GROUP_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          size="2xs"
          variant={groupBy === opt.value ? "filled" : "outline"}
          color={groupBy === opt.value ? "primary" : "secondary"}
          onClick={() => setGroupBy(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
      <span className="text-body-xs text-fg-muted ml-pad-md">Modo:</span>
      {RENDER_MODE_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          size="2xs"
          variant={renderMode === opt.value ? "filled" : "outline"}
          color={renderMode === opt.value ? "primary" : "secondary"}
          onClick={() => setRenderMode(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Grouped"
      description="Row grouping com 2 modos de render: Coluna-alinhado (default — header com cells nas colunas + subtotal inline) ou Livre (consumer renderiza header e conteúdo via slots). Pagination desliga automaticamente quando groupBy ativo."
      code={CODE}
    >
      <DataTable<ClientRow>
          ref={tableRef}
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          // Fase F.4 — agrupamento por field. Default expanded.
          groupBy={groupBy}
          // Modo "Livre": passa renderGroupHeader + renderGroupContent.
          // Modo "Coluna-alinhado": ambos undefined → default column-aligned.
          renderGroupHeader={
            renderMode === "freeform"
              ? ({ group, toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className="flex items-center w-full px-pad-3xl py-pad-lg gap-gp-lg hover:bg-bg-muted transition-colors text-left"
                  >
                    {group.isExpanded ? (
                      <ChevronDown className="size-icon-md text-fg-muted shrink-0" />
                    ) : (
                      <ChevronRight className="size-icon-md text-fg-muted shrink-0" />
                    )}
                    <div className="flex flex-col gap-gp-2xs flex-1 min-w-0">
                      <span className="text-title-sm text-fg-strong">
                        {group.label}
                      </span>
                      <span className="text-body-xs font-normal text-fg-muted">
                        {group.count}{" "}
                        {group.count === 1 ? "cliente" : "clientes"} neste grupo
                      </span>
                    </div>
                  </button>
                )
              : undefined
          }
          renderGroupContent={
            renderMode === "freeform"
              ? ({ group }) => (
                  <div className="w-full p-pad-3xl bg-bg-canvas">
                    <p className="text-body-md font-medium text-fg-muted mb-pad-lg">
                      Vista compacta — layout livre, ignora colunas da tabela.
                    </p>
                    <div className="grid grid-cols-3 gap-gp-md">
                      {group.rows.map((row) => (
                        <div
                          key={row.id}
                          className="flex flex-col gap-gp-2xs p-pad-lg rounded-radius-md border border-border-subtle bg-bg-table hover:border-border-default transition-colors"
                        >
                          <span className="text-body-xs text-fg-muted">
                            {row.id}
                          </span>
                          <span className="text-body-md text-fg-strong font-medium">
                            {row.name}
                          </span>
                          <span className="text-body-xs font-normal text-fg-muted truncate">
                            {row.email}
                          </span>
                          <span className="text-body-md text-fg-brand font-semibold tabular-nums mt-pad-xs">
                            {formatCurrency(row.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              : undefined
          }
          toolbar={{
            title: "Clientes",
            enableSearch: true,
            enableFilters: true,
            enableColumns: true,
            enableDensity: true,
            customLeft: controls,
          }}
          // Pagination omitida — DataTable já desliga automaticamente quando groupBy ativo
          selectionConfig={{ enabled: renderMode === "column-aligned" }}
          showTotalizers={renderMode === "column-aligned"}
          onRowClick={(row) => console.log("Row click:", row.name, row.id)}
          className="max-h-full"
        />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable } from "@/components/ui/DataTable";

const [groupBy, setGroupBy] = useState<string>("statusId");
const [renderMode, setRenderMode] = useState<"column-aligned" | "freeform">("column-aligned");

<DataTable<ClientRow>
  rows={rows}
  columns={columns}
  groupBy={groupBy}                       // ← Field a agrupar

  // Modo "Livre": passa renderGroupHeader + renderGroupContent
  // Modo "Coluna-alinhado": ambos undefined → default
  renderGroupHeader={renderMode === "freeform"
    ? ({ group, toggle }) => (
        <button onClick={toggle}>
          <ChevronDown /> {group.label} ({group.count})
        </button>
      )
    : undefined
  }
  renderGroupContent={renderMode === "freeform"
    ? ({ group }) => (
        <div className="grid grid-cols-3 gap-gp-md p-pad-3xl">
          {group.rows.map((row) => <CardItem key={row.id} row={row} />)}
        </div>
      )
    : undefined
  }

  toolbar={{ enableSearch: true, enableFilters: true }}
  showTotalizers={renderMode === "column-aligned"}
/>`;
