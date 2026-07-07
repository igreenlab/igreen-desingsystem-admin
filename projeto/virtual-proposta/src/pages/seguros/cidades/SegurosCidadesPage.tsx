import { useMemo, useState, type ComponentType } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  MapPin,
  MoreVertical,
  TrendingUp,
  ShieldCheck,
  FileSignature,
  RefreshCcw,
  PauseCircle,
  XCircle,
  AlertTriangle,
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
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/Chart";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTableViewMode,
  type DataTableListConfig,
  type DataTablePresetView,
} from "@/components/ui/DataTable";
import {
  cidadesSeguros,
  totalCidades,
  kpis,
  PERIODOS,
  num,
  type SegurosCidadeRow,
  type KpiCard,
} from "./seguros-cidades-mock";

const sparkCfg = { v: { label: "Apólices", color: "var(--color-chart-3)" } } satisfies ChartConfig;

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:este-mes",
    name: "Este mês",
    sort: [{ field: "total", direction: "desc" }],
  }),
];

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

/** Badge de posição — 1º destacado (fundo fraco + texto forte), demais neutros. */
function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "grid size-comp-sm shrink-0 place-items-center rounded-radius-full text-caption-md font-bold tabular-nums",
        rank === 1 ? "bg-bg-warning-muted text-fg-warning" : "bg-bg-muted text-fg-muted",
      )}
    >
      {rank}
    </span>
  );
}

/** Mini-KPIs por status na lista — ícone em quadrado colorido + valor/label
 *  (mesmo padrão de mini-stat da Visão da Rede). */
const STATUS_KPI = [
  { key: "ativas", label: "Ativas", icon: ShieldCheck, iconClass: "bg-bg-success-muted text-fg-success" },
  { key: "emissao", label: "Emissão", icon: FileSignature, iconClass: "bg-bg-info-muted text-fg-info" },
  { key: "renovacao", label: "Renovação", icon: RefreshCcw, iconClass: "bg-bg-warning-muted text-fg-warning" },
  { key: "suspensas", label: "Suspensas", icon: PauseCircle, iconClass: "bg-bg-warning-muted text-fg-warning" },
  { key: "canceladas", label: "Cancel.", icon: XCircle, iconClass: "bg-bg-danger-muted text-fg-danger" },
  { key: "sinistro", label: "Sinistros", icon: AlertTriangle, iconClass: "bg-bg-muted text-fg-muted" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<SegurosCidadeRow, "ativas" | "emissao" | "renovacao" | "suspensas" | "canceladas" | "sinistro">;
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
}>;

export function SegurosCidadesPage() {
  const [periodo, setPeriodo] = useState("Julho de 2026");
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

  const columns = useMemo<DataTableColumnDef<SegurosCidadeRow>[]>(
    () => [
      {
        field: "rank",
        headerName: "Ranking",
        width: 110,
        align: "center",
        sortable: true,
        render: ({ value }) => (
          <span className="flex justify-center">
            <RankBadge rank={value as number} />
          </span>
        ),
      },
      {
        field: "cidade",
        headerName: "Cidade",
        minWidth: 180,
        icon: MapPin,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => <span className="truncate font-medium text-fg-default">{value as string}</span>,
      },
      {
        field: "uf",
        headerName: "UF",
        width: 80,
        align: "center",
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [...new Set(cidadesSeguros.map((c) => c.uf))].map((u) => ({ value: u, label: u })),
      },
      {
        field: "total",
        headerName: "Apólices",
        width: 110,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        render: ({ value }) => (
          <span className="tabular-nums font-semibold text-fg-default">{num(value as number)}</span>
        ),
      },
      { field: "ativas", headerName: "Ativas", width: 100, align: "right", sortable: true, type: "number", aggregate: "sum", render: ({ value }) => <span className="tabular-nums text-fg-success">{num(value as number)}</span> },
      { field: "emissao", headerName: "Emissão", width: 100, align: "right", sortable: true, type: "number", aggregate: "sum", render: ({ value }) => <span className="tabular-nums text-fg-info">{num(value as number)}</span> },
      { field: "renovacao", headerName: "Renovação", width: 100, align: "right", sortable: true, type: "number", aggregate: "sum", render: ({ value }) => <span className="tabular-nums text-fg-warning">{num(value as number)}</span> },
      { field: "suspensas", headerName: "Suspensas", width: 100, align: "right", sortable: true, type: "number", aggregate: "sum", render: ({ value }) => <span className="tabular-nums text-fg-warning">{num(value as number)}</span> },
      { field: "canceladas", headerName: "Cancel.", width: 100, align: "right", sortable: true, type: "number", aggregate: "sum", render: ({ value }) => <span className="tabular-nums text-fg-danger">{num(value as number)}</span> },
      { field: "sinistro", headerName: "Sinistros", width: 100, align: "right", sortable: true, type: "number", aggregate: "sum", render: ({ value }) => <span className="tabular-nums text-fg-muted">{num(value as number)}</span> },
    ],
    [],
  );

  const listConfig = useMemo<DataTableListConfig<SegurosCidadeRow>>(
    () => ({
      paginated: true,
      // Mini-KPIs por status em colunas + Total destacado à direita (divisor).
      renderItem: (row) => {
        const delta = row.total - row.totalAnterior;
        const up = delta >= 0;
        return (
          <div className="flex w-full items-center gap-gp-xl">
            {/* Posição + cidade */}
            <div className="flex w-[180px] shrink-0 items-center gap-gp-md">
              <RankBadge rank={row.rank} />
              <div className="flex min-w-0 items-baseline gap-gp-xs">
                <span className="truncate text-body-md font-semibold text-fg-default">
                  {row.cidade}
                </span>
                <span className="shrink-0 text-caption-md tabular-nums text-fg-muted">
                  {row.uf}
                </span>
              </div>
            </div>

            {/* Mini-KPIs por status — ícone em quadrado colorido + valor/label */}
            <div className="hidden items-center gap-gp-6xl sm:flex">
              {STATUS_KPI.map((s) => (
                <div key={s.key} className="flex w-[96px] shrink-0 items-center gap-gp-sm">
                  <span
                    className={cn(
                      "grid size-comp-lg shrink-0 place-items-center rounded-radius-base [&>svg]:size-icon-sm",
                      s.iconClass,
                    )}
                  >
                    <s.icon />
                  </span>
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="text-body-md font-semibold tabular-nums text-fg-default">
                      {num(row[s.key])}
                    </span>
                    <span className="text-caption-sm text-fg-muted">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total em destaque + delta — empurrado pra direita, com folga do divisor */}
            <div className="ml-auto shrink-0 border-l border-border-subtle pl-gp-3xl">
              <div className="flex items-center gap-gp-sm">
                <span className="text-title-lg font-bold tabular-nums text-fg-default">
                  {num(row.total)}
                </span>
                <Chip color={up ? "success" : "danger"} variant="soft" size="sm" shape="rounded">
                  <TrendingUp className={cn("size-[12px]", !up && "rotate-180")} aria-hidden />
                  {up ? `+${num(delta)}` : num(delta)}
                </Chip>
              </div>
              <span className="mt-gp-2xs block text-caption-sm uppercase tracking-[0.04em] text-fg-muted">
                Total
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
        title="Cidades"
        description="Ranking de cidades por apólices ativas e status da carteira."
        actions={periodSelector}
      />

      {/* KPIs — design kpi/leads */}
      <div className="grid grid-cols-1 gap-gp-2xl md:grid-cols-3">
        {kpis.map((k) => (
          <LeadKpiCard key={k.title} kpi={k} />
        ))}
      </div>

      {/* Ranking — tabela ↔ lista, views Default / Este mês */}
      <DataTable<SegurosCidadeRow>
        rows={cidadesSeguros}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="seguros-cidades"
        allowCreateView={false}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listConfig={listConfig}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        toolbar={{
          title: `${totalCidades} cidades`,
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
