import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  MapPin,
  UserRound,
  CalendarDays,
  Wallet,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
import { SectionCard } from "~/pages/painel-v2/_ui";
import {
  carteira,
  carteiraValor,
  valorTotal,
  emProducao,
  pctAdimplencia,
  pctInadimplencia,
  vencimentos,
  tipoConta,
  evolucao,
  topInadimplentes,
  boletos,
  totalBoletos,
  PERIODOS,
  num,
  dec1,
  brl,
  dateBR,
  type BoletoRow,
  type BoletoStatus,
} from "./telecom-financeiro-mock";

const evolucaoConfig = {
  pagos: { label: "Pagos", color: "var(--color-chart-1)" },
  vencidos: { label: "Vencidos", color: "var(--color-fg-danger)" },
} satisfies ChartConfig;
const tipoConfig = { value: { label: "Boletos" } } satisfies ChartConfig;

const STATUS_CHIP: Record<BoletoStatus, { color: "success" | "info" | "danger"; label: string }> = {
  pago: { color: "success", label: "Pago" },
  disponivel: { color: "info", label: "Disponível" },
  vencido: { color: "danger", label: "Vencido" },
};

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({ id: "preset:pagas", name: "Pagas", filters: [{ field: "status", value: "pago" }] }),
  presetView({ id: "preset:a-vencer", name: "A vencer", filters: [{ field: "status", value: "disponivel" }] }),
  presetView({ id: "preset:vencidas", name: "Vencidas", filters: [{ field: "status", value: "vencido" }] }),
];

/**
 * Célula de KPI — design idêntico ao Painel do Líder (NetworkAlertsKpis):
 * card único com divisores, label + ícone em círculo, valor 24px, hint muted.
 * Destaque (ícone + valor vermelhos) só no KPI de alerta (danger).
 */
function KpiCell({
  icon: Icon,
  value,
  label,
  hint,
  highlight,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint: string;
  highlight?: boolean;
}) {
  const iconBox = highlight ? "bg-bg-danger-muted text-fg-danger" : "bg-bg-muted text-fg-default";
  const valueColor = highlight ? "text-fg-danger" : "text-fg-default";
  return (
    <div className="flex flex-col gap-[2px] p-pad-3xl first:rounded-l-radius-xl last:rounded-r-radius-xl">
      <div className="flex items-start justify-between gap-gp-md">
        <p className="text-title-sm font-semibold text-fg-default">{label}</p>
        <span className={cn("grid size-form-lg shrink-0 place-items-center rounded-radius-full", iconBox)}>
          <Icon className="size-icon-sm" aria-hidden />
        </span>
      </div>
      <p className={cn("text-[24px] font-bold leading-tight tabular-nums", valueColor)}>{value}</p>
      <p className="text-caption-md text-fg-muted">{hint}</p>
    </div>
  );
}

export function TelecomFinanceiroPage() {
  const [periodo, setPeriodo] = useState("Julho de 2026");
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");

  const vencidosTotal = carteira.vencidos;
  const vencMax = useMemo(() => Math.max(...vencimentos.map((v) => v.n)), []);
  const tipoTotal = useMemo(() => tipoConta.reduce((a, t) => a + t.n, 0), []);
  const tipoItems = useMemo(
    () => tipoConta.map((t) => ({ name: t.name, value: t.n, color: t.color })),
    [],
  );
  const inadMax = useMemo(
    () => Math.max(...topInadimplentes.map((t) => t.pctCarteira)),
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

  const columns = useMemo<DataTableColumnDef<BoletoRow>[]>(
    () => [
      {
        field: "nome",
        headerName: "Cliente",
        minWidth: 200,
        icon: UserRound,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="truncate font-medium text-fg-default">{value as string}</span>
        ),
      },
      {
        field: "numero",
        headerName: "Número",
        width: 150,
        icon: Phone,
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
        filterOptions: [...new Set(boletos.map((b) => b.uf))].map((u) => ({ value: u, label: u })),
      },
      {
        field: "licenciado",
        headerName: "Licenciado",
        minWidth: 180,
        icon: UserRound,
        render: ({ value }) => <span className="truncate text-fg-muted">{value as string}</span>,
      },
      {
        field: "vencimento",
        headerName: "Vencimento",
        width: 130,
        icon: CalendarDays,
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{dateBR(value as string)}</span>
        ),
      },
      {
        field: "valor",
        headerName: "Valor",
        width: 130,
        icon: Wallet,
        align: "right",
        sortable: true,
        type: "currency",
        aggregate: "sum",
        aggregateFormatter: (v) => brl(v),
        valueFormatter: (v) => brl(v as number),
        render: ({ value }) => (
          <span className="tabular-nums font-medium text-fg-default">{brl(value as number)}</span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "pago", label: "Pago" },
          { value: "disponivel", label: "Disponível" },
          { value: "vencido", label: "Vencido" },
        ],
        render: ({ row }) => {
          const s = STATUS_CHIP[row.status];
          return (
            <Chip color={s.color} variant="soft" size="sm" shape="pill">
              {s.label}
              {row.status === "vencido" ? ` · ${row.diasAtraso}d` : ""}
            </Chip>
          );
        },
      },
    ],
    [],
  );

  const listConfig = useMemo<DataTableListConfig<BoletoRow>>(
    () => ({
      renderItem: (row) => {
        const s = STATUS_CHIP[row.status];
        return (
          <div className="flex w-full items-center gap-gp-lg">
            <div className="flex min-w-0 flex-1 flex-col gap-gp-2xs">
              <span className="flex items-center gap-gp-sm">
                <span className="truncate text-body-md font-semibold text-fg-default">{row.nome}</span>
                <span className="shrink-0 text-caption-md tabular-nums text-fg-muted">· {row.numero}</span>
              </span>
              <span className="truncate text-caption-md text-fg-muted">
                {row.cidade}/{row.uf} · {row.licenciado} · {dateBR(row.vencimento)}
              </span>
            </div>
            <Chip color={s.color} variant="soft" size="sm" shape="pill">
              {s.label}
              {row.status === "vencido" ? ` · ${row.diasAtraso}d` : ""}
            </Chip>
            <span className="w-[96px] shrink-0 text-right text-body-sm font-semibold tabular-nums text-fg-default">
              {brl(row.valor)}
            </span>
          </div>
        );
      },
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Financeiro"
        description="Carteira de boletos — adimplência, vencimentos e inadimplência."
        actions={periodSelector}
      />

      {/* Status da carteira — KPIs idênticos ao Painel do Líder */}
      <section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
        <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 [&>*]:border-border-subtle sm:[&>*]:border-l sm:[&>*:first-child]:border-l-0 lg:[&>*:nth-child(3)]:border-l">
          <KpiCell icon={Receipt} label="Com boleto gerado" value={num(emProducao)} hint={`${brl(valorTotal)} · carteira`} />
          <KpiCell icon={CheckCircle2} label="Boletos pagos" value={num(carteira.pagos)} hint={`${brl(carteiraValor.pagos)} · ${dec1(pctAdimplencia)}% adimpl.`} />
          <KpiCell icon={Clock} label="Disponível (a vencer)" value={num(carteira.disponivel)} hint={`${brl(carteiraValor.disponivel)} · em aberto`} />
          <KpiCell icon={AlertTriangle} label="Vencidos" value={num(carteira.vencidos)} hint={`${brl(carteiraValor.vencidos)} · ${dec1(pctInadimplencia)}% inadimpl.`} highlight />
        </div>
      </section>

      {/* 3 gráficos numa row: Evolução · Tipo de conta · Cobrança (abas) */}
      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3">
        <SectionCard
          title="Evolução mensal"
          subtitle="Cohort · pagos x vencidos"
          className="h-[400px]"
          action={
            <div className="flex items-center gap-gp-md">
              <span className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
                <span className="size-[8px] rounded-radius-full bg-chart-1" /> Pagos
              </span>
              <span className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
                <span className="size-[8px] rounded-radius-full bg-fg-danger" /> Vencidos
              </span>
            </div>
          }
        >
          <ChartContainer config={evolucaoConfig} className="min-h-0 w-full flex-1">
            <BarChart data={evolucao} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} className="text-caption-sm" />
              <YAxis tickLine={false} axisLine={false} width={36} tickMargin={2} allowDecimals={false} className="text-caption-sm" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="pagos" stackId="a" fill="var(--color-pagos)" />
              <Bar dataKey="vencidos" stackId="a" fill="var(--color-vencidos)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="Tipo de conta" subtitle="Distribuição da carteira" className="h-[400px]">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="relative">
              <ChartContainer config={tipoConfig} className="aspect-square w-[150px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={tipoItems} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} cornerRadius={5} strokeWidth={0}>
                    {tipoItems.map((it) => (
                      <Cell key={it.name} fill={it.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[20px] font-bold leading-none tabular-nums text-fg-default">{num(tipoTotal)}</span>
                <span className="text-caption-sm text-fg-muted">boletos</span>
              </div>
            </div>
          </div>
          <ul className="flex flex-col gap-gp-xs">
            {tipoConta.map((t) => (
              <li key={t.name} className="flex items-center gap-gp-sm">
                <span className="size-[10px] shrink-0 rounded-radius-full" style={{ background: t.color }} aria-hidden />
                <span className="flex-1 truncate text-body-sm text-fg-default">{t.name}</span>
                <span className="text-body-sm font-semibold tabular-nums text-fg-default">
                  {Math.round((t.n / tipoTotal) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Inadimplência + Vencimentos em 1 card com abas */}
        <SectionCard title="Cobrança" subtitle="Inadimplência e vencimentos" className="h-[400px]">
          <Tabs defaultValue="inadimplencia" className="flex flex-col gap-gp-lg">
            <TabsList className="w-full">
              <TabsTrigger value="inadimplencia" className="flex-1">Inadimplência</TabsTrigger>
              <TabsTrigger value="vencimentos" className="flex-1">Vencimentos</TabsTrigger>
            </TabsList>

            <TabsContent value="vencimentos" className="min-h-[260px]">
              <ul className="flex flex-col gap-gp-lg">
                {vencimentos.map((v) => (
                  <li key={v.key} className="flex flex-col gap-gp-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-fg-default">{v.label}</span>
                      <span className="text-body-sm font-semibold tabular-nums text-fg-default">
                        {num(v.n)}{" "}
                        <span className="text-caption-sm font-normal text-fg-muted">
                          ({Math.round((v.n / vencidosTotal) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-[8px] w-full overflow-hidden rounded-radius-full bg-bg-muted">
                      <div
                        className={cn("h-full rounded-radius-full", v.tone === "danger" ? "bg-fg-danger" : "bg-fg-warning")}
                        style={{ width: `${(v.n / vencMax) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="inadimplencia" className="min-h-[260px]">
              <ul className="flex flex-col gap-gp-xl">
                {topInadimplentes.map((t, i) => (
                  <li key={t.id} className="flex flex-col gap-gp-sm">
                    <div className="flex items-center gap-gp-sm">
                      <span
                        className={cn(
                          "flex size-comp-sm shrink-0 items-center justify-center rounded-radius-full text-caption-md font-bold tabular-nums",
                          i < 3 ? "bg-bg-danger-muted text-fg-danger" : "bg-bg-muted text-fg-muted",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-fg-default">
                        {t.nome}
                      </span>
                      <span className="shrink-0 text-caption-md font-semibold tabular-nums text-fg-danger">
                        {num(t.vencidos)} venc.
                      </span>
                    </div>
                    <div className="h-[6px] w-full overflow-hidden rounded-radius-full bg-bg-muted">
                      <div
                        className="h-full rounded-radius-full bg-fg-danger"
                        style={{ width: `${(t.pctCarteira / inadMax) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </SectionCard>
      </div>

      {/* Boletos — tabela standalone com toggle Tabela ↔ Lista */}
      <DataTable<BoletoRow>
        rows={boletos}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="telecom-financeiro-boletos-v2"
        allowCreateView={false}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listConfig={listConfig}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        showEmptyFilterChips={["status"]}
        toolbar={{
          title: `${totalBoletos} boletos`,
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

      {/* Respiro no rodapé */}
      <div aria-hidden className="h-pad-3xl shrink-0" />
    </div>
  );
}
