import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  MapPin,
  Hash,
  User,
  GraduationCap,
  CalendarDays,
  CircleDot,
  ShieldCheck,
  Wallet,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/avatar-ig";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTablePresetView,
  type DataTableViewMode,
  type DataTableKanbanConfig,
} from "@/components/ui/DataTable";
import {
  pendencias,
  totalPendencias,
  totalAndamento,
  totalRecusadas,
  RAMOS,
  PERIODOS,
  STATUS_LABEL,
  num,
  brl,
  fmtDate,
  type PendenciaRow,
  type PendenciaStatus,
} from "./seguros-pendencias-mock";

const STATUS_CHIP: Record<PendenciaStatus, "warning" | "danger"> = {
  andamento: "warning",
  recusada: "danger",
};

const initials = (n: string) =>
  n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** Cor do dot de cada coluna do Kanban (por ramo). */
const RAMO_DOT: Record<string, string> = {
  Auto: "var(--color-chart-1)",
  Vida: "var(--color-chart-2)",
  Residencial: "var(--color-chart-3)",
  Saúde: "var(--color-chart-4)",
  Empresarial: "var(--color-chart-5)",
};

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:andamento",
    name: `Em andamento (${totalAndamento})`,
    filters: [{ field: "status", value: "andamento" }],
  }),
  presetView({
    id: "preset:recusadas",
    name: `Recusadas (${totalRecusadas})`,
    filters: [{ field: "status", value: "recusada" }],
  }),
];

export function SegurosPendenciasPage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");

  const kanbanConfig = useMemo<DataTableKanbanConfig<PendenciaRow>>(
    () => ({
      groupByField: "ramo",
      columns: RAMOS.map((r) => ({ id: r, label: r, dotColor: RAMO_DOT[r] })),
      renderCard: ({ row }) => ({
        avatar: (
          <Avatar size="md" color="muted">
            {initials(row.cliente)}
          </Avatar>
        ),
        title: row.cliente,
        subtitle: `${row.cidade}/${row.uf}`,
        // Sem descrição textual — reserva o espaço pra manter o respiro do card.
        description: <span className="block h-[34px]" aria-hidden />,
        chip: (
          <Chip color={STATUS_CHIP[row.status]} variant="soft" size="sm" shape="pill">
            {STATUS_LABEL[row.status]}
          </Chip>
        ),
        value: brl(row.mensal),
        footerLeft: (
          <span className="flex min-w-0 items-center gap-gp-2xs">
            <Avatar size="xs" color="muted">
              {initials(row.corretor)}
            </Avatar>
            <span className="truncate text-caption-sm text-fg-muted">{row.corretor}</span>
          </span>
        ),
        footerRight: (
          <span className="flex shrink-0 items-center gap-gp-2xs text-caption-sm text-fg-muted">
            <Clock className="size-icon-xs" aria-hidden />
            {fmtDate(row.abertura)}
          </span>
        ),
      }),
    }),
    [],
  );

  const periodSelector = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button color="secondary" variant="outline" size="sm" iconLeft={<Calendar />} iconRight={<ChevronDown />}>
          {periodo}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {PERIODOS.map((p) => (
          <DropdownMenuItem
            key={p}
            onSelect={() => setPeriodo(p)}
            className={cn(periodo === p && "bg-bg-brand-subtle text-fg-brand")}
          >
            <Check className={periodo === p ? "opacity-100" : "opacity-0"} />
            {p}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns = useMemo<DataTableColumnDef<PendenciaRow>[]>(
    () => [
      {
        field: "cliente",
        headerName: "Cliente",
        minWidth: 200,
        icon: User,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="truncate font-medium text-fg-default">{value as string}</span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        icon: CircleDot,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: (Object.keys(STATUS_LABEL) as PendenciaStatus[]).map((s) => ({
          value: s,
          label: STATUS_LABEL[s],
        })),
        render: ({ value }) => (
          <Chip color={STATUS_CHIP[value as PendenciaStatus]} variant="soft" size="sm" shape="rounded">
            {STATUS_LABEL[value as PendenciaStatus]}
          </Chip>
        ),
      },
      {
        field: "ramo",
        headerName: "Ramo",
        width: 150,
        icon: ShieldCheck,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: RAMOS.map((r) => ({ value: r, label: r })),
      },
      {
        field: "documento",
        headerName: "Documento",
        width: 170,
        icon: Hash,
        type: "text",
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => <span className="tabular-nums text-fg-muted">{value as string}</span>,
      },
      {
        field: "cidade",
        headerName: "Cidade",
        minWidth: 140,
        icon: MapPin,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
      },
      {
        field: "uf",
        headerName: "UF",
        width: 80,
        align: "center",
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [...new Set(pendencias.map((p) => p.uf))].map((u) => ({ value: u, label: u })),
      },
      {
        field: "corretor",
        headerName: "Corretor",
        minWidth: 170,
        icon: GraduationCap,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => <span className="truncate text-fg-muted">{value as string}</span>,
      },
      {
        field: "mensal",
        headerName: "Prêmio/mês",
        width: 140,
        icon: Wallet,
        align: "right",
        sortable: true,
        type: "currency",
        aggregate: "sum",
        aggregateFormatter: (v) => brl(v),
        valueFormatter: (v) => brl(v as number),
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">{brl(value as number)}</span>
        ),
      },
      {
        field: "abertura",
        headerName: "Aberta em",
        width: 120,
        icon: CalendarDays,
        align: "right",
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{fmtDate(value as string)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Pendências"
        description="Cotações e apólices em andamento ou recusadas — tudo que ainda não vigora."
        actions={periodSelector}
      />

      <DataTable<PendenciaRow>
        rows={pendencias}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="seguros-pendencias"
        allowCreateView={false}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        kanbanConfig={kanbanConfig}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        toolbar={{
          title: `${totalPendencias} pendências`,
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
        }}
        paginationConfig={{
          enabled: true,
          initialPageSize: 25,
          pageSizeOptions: [10, 25, 50],
        }}
        className="mt-gp-xl max-h-[80vh]"
      />

      <div aria-hidden className="h-pad-3xl shrink-0" />
    </div>
  );
}
