import { useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  MapPin,
  MoreVertical,
  TrendingUp,
  Users,
  Signal,
  Database,
  CalendarDays,
  BadgeCheck,
  Clock,
  XCircle,
  GraduationCap,
  Hash,
  CircleDot,
} from "lucide-react";
import { Bar, BarChart, Cell } from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import { ChartContainer, type ChartConfig } from "@/components/ui/Chart";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTableViewMode,
  type DataTableListConfig,
  type DataTablePresetView,
} from "@/components/ui/DataTable";
import {
  licenciados,
  totalLicenciados,
  kpis,
  PERIODOS,
  GRADUACOES,
  STATUS_LABEL,
  num,
  gb,
  fmtDate,
  type LicenciadoRow,
  type LicencaStatus,
  type KpiCard,
} from "./telecom-licenciados-mock";

const sparkCfg = {
  v: { label: "Licenciados", color: "var(--color-chart-3)" },
} satisfies ChartConfig;

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:a-vencer",
    name: "A vencer / vencidas",
    filters: [{ field: "status", operator: "isAnyOf", value: ["a-vencer", "vencida"] }],
    sort: [{ field: "diasRestantes", direction: "asc" }],
  }),
];

/* ── status → cor/ícone/chip ─────────────────────────────────────────── */
const STATUS_META: Record<
  LicencaStatus,
  { chip: "success" | "warning" | "danger"; icon: typeof BadgeCheck; iconClass: string }
> = {
  ativa: { chip: "success", icon: BadgeCheck, iconClass: "bg-bg-success-muted text-fg-success" },
  "a-vencer": { chip: "warning", icon: Clock, iconClass: "bg-bg-warning-muted text-fg-warning" },
  vencida: { chip: "danger", icon: XCircle, iconClass: "bg-bg-danger-muted text-fg-danger" },
};

/** KPI estilo kpi/leads — título + valor + delta + sparkbars + nota. */
function LeadKpiCard({ kpi }: { kpi: KpiCard }) {
  const accent = kpi.down ? "var(--color-fg-danger)" : "var(--color-chart-1)";
  const bars = kpi.bars.map((v, x) => ({ x, v }));
  return (
    <div className="flex flex-col rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">
      <div className="flex items-center justify-between">
        <p className="text-title-md font-semibold text-fg-default">{kpi.title}</p>
        <MoreVertical className="size-icon-sm text-fg-muted" />
      </div>
      <div className="mt-pad-3xl flex items-end justify-between gap-gp-lg">
        <div>
          <div className="flex items-center gap-gp-md">
            <span className="text-[30px] font-bold leading-tight tabular-nums text-fg-default">
              {kpi.value}
            </span>
            <Chip color={kpi.down ? "danger" : "success"} variant="soft" size="sm">
              <TrendingUp className={cn("size-[12px]", kpi.down && "rotate-180")} aria-hidden />
              {kpi.delta}
            </Chip>
          </div>
          <p className="mt-gp-xs text-body-sm text-fg-muted">Comparado ao mês anterior</p>
        </div>
        <ChartContainer config={sparkCfg} className="h-[64px] w-[150px]">
          <BarChart data={bars}>
            <Bar dataKey="v" radius={4}>
              {bars.map((b, i) => (
                <Cell key={b.x} fill={i === kpi.hl ? accent : "var(--color-bg-muted)"} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <div className="mt-pad-3xl border-t border-border-subtle pt-pad-lg">
        <p className="text-caption-md text-fg-muted">{kpi.note}</p>
      </div>
    </div>
  );
}

/** Badge de status da licença — quadrado colorido com ícone. */
function StatusBadge({ status }: { status: LicencaStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "grid size-comp-lg shrink-0 place-items-center rounded-radius-base [&>svg]:size-icon-sm",
        m.iconClass,
      )}
    >
      <m.icon />
    </span>
  );
}

/** Mini-stat da lista — ícone em quadrado colorido + valor/label. */
function MiniStat({
  icon,
  value,
  label,
  iconClass = "bg-bg-muted text-fg-muted",
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  iconClass?: string;
}) {
  return (
    <div className="flex w-[124px] shrink-0 items-center gap-gp-sm">
      <span
        className={cn(
          "grid size-comp-lg shrink-0 place-items-center rounded-radius-base [&>svg]:size-icon-sm",
          iconClass,
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-body-md font-semibold tabular-nums text-fg-default">
          {value}
        </span>
        <span className="text-caption-sm text-fg-muted">{label}</span>
      </div>
    </div>
  );
}

export function TelecomLicenciadosPage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");

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

  const columns = useMemo<DataTableColumnDef<LicenciadoRow>[]>(
    () => [
      {
        field: "nome",
        headerName: "Licenciado",
        minWidth: 200,
        icon: Users,
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
        width: 140,
        icon: CircleDot,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: (Object.keys(STATUS_LABEL) as LicencaStatus[]).map((s) => ({
          value: s,
          label: STATUS_LABEL[s],
        })),
        render: ({ value }) => (
          <Chip color={STATUS_META[value as LicencaStatus].chip} variant="soft" size="sm" shape="rounded">
            {STATUS_LABEL[value as LicencaStatus]}
          </Chip>
        ),
      },
      {
        field: "codigo",
        headerName: "Código",
        width: 110,
        icon: Hash,
        type: "text",
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => <span className="tabular-nums text-fg-muted">#{value as string}</span>,
      },
      {
        field: "cidade",
        headerName: "Cidade",
        minWidth: 150,
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
        filterOptions: [...new Set(licenciados.map((l) => l.uf))].map((u) => ({ value: u, label: u })),
      },
      {
        field: "graduacao",
        headerName: "Graduação",
        width: 140,
        icon: GraduationCap,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: GRADUACOES.map((g) => ({ value: g, label: g })),
      },
      {
        field: "linhas",
        headerName: "Linhas",
        width: 110,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        render: ({ value }) => (
          <span className="tabular-nums font-semibold text-fg-default">{num(value as number)}</span>
        ),
      },
      {
        field: "volumeGb",
        headerName: "Volume",
        width: 140,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => gb(v),
        valueFormatter: (v) => gb(v as number),
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">{gb(value as number)}</span>
        ),
      },
      {
        field: "ativacao",
        headerName: "Ativação",
        width: 120,
        align: "right",
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{fmtDate(value as string)}</span>
        ),
      },
      {
        field: "vencimento",
        headerName: "Vencimento",
        width: 130,
        align: "right",
        sortable: true,
        render: ({ row }) => (
          <span
            className={cn(
              "tabular-nums",
              row.status === "vencida"
                ? "text-fg-danger"
                : row.status === "a-vencer"
                  ? "text-fg-warning"
                  : "text-fg-default",
            )}
          >
            {fmtDate(row.vencimento)}
          </span>
        ),
      },
    ],
    [],
  );

  const listConfig = useMemo<DataTableListConfig<LicenciadoRow>>(
    () => ({
      paginated: true,
      // Mesmo padrão da Cidades: badge + identificação + mini-stats + bloco
      // destacado à direita (divisor) — aqui o destaque é o status da licença.
      renderItem: (row) => {
        const m = STATUS_META[row.status];
        const vencInfo =
          row.status === "vencida"
            ? `Venceu ${fmtDate(row.vencimento)}`
            : `Vence ${fmtDate(row.vencimento)}`;
        return (
          <div className="flex w-full items-center gap-gp-xl">
            {/* Status + identificação */}
            <div className="flex w-[240px] shrink-0 items-center gap-gp-md">
              <StatusBadge status={row.status} />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-body-md font-semibold text-fg-default">
                  {row.nome}
                </span>
                <span className="truncate text-caption-md text-fg-muted">
                  #{row.codigo} · {row.cidade}/{row.uf}
                </span>
              </div>
            </div>

            {/* Mini-stats */}
            <div className="hidden items-center gap-gp-6xl sm:flex">
              <MiniStat
                icon={<Signal />}
                value={num(row.linhas)}
                label="Linhas"
                iconClass="bg-bg-success-muted text-fg-success"
              />
              <MiniStat
                icon={<Database />}
                value={gb(row.volumeGb)}
                label="Volume"
                iconClass="bg-bg-info-muted text-fg-info"
              />
              <MiniStat
                icon={<CalendarDays />}
                value={fmtDate(row.ativacao)}
                label="Ativação"
                iconClass="bg-bg-brand-subtle text-fg-brand"
              />
            </div>

            {/* Status da licença em destaque — empurrado pra direita, com folga */}
            <div className="ml-auto shrink-0 border-l border-border-subtle pl-gp-3xl text-right">
              <Chip color={m.chip} variant="soft" size="sm" shape="rounded">
                {STATUS_LABEL[row.status]}
              </Chip>
              <span className="mt-gp-2xs block text-caption-sm uppercase tracking-[0.04em] text-fg-muted">
                {vencInfo}
              </span>
            </div>
          </div>
        );
      },
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Licenciados"
        description="Base de licenciados Telecom por status de licença, validade e base de linhas."
        actions={periodSelector}
      />

      {/* KPIs — design kpi/leads */}
      <div className="grid grid-cols-1 gap-gp-2xl md:grid-cols-3">
        {kpis.map((k) => (
          <LeadKpiCard key={k.title} kpi={k} />
        ))}
      </div>

      {/* Licenciados — tabela ↔ lista, views Default / A vencer */}
      <DataTable<LicenciadoRow>
        rows={licenciados}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="telecom-licenciados"
        allowCreateView={false}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listConfig={listConfig}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        toolbar={{
          title: `${totalLicenciados} licenciados`,
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
