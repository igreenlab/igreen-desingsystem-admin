import { useMemo, useState, type ReactNode } from "react";
import { GraduationCap, ChevronDown, Check, Calendar } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { SectionCard } from "../painel-v2/_ui";
import {
  monthlyGrowth,
  growthSeries,
  recurrence,
  graduationDistribution,
  businessTimeAnalysis,
  GRADUACOES,
  RANKING_ALL,
  titleCase,
  num,
} from "./estatisticas-mock";

const ACTIVE_BTN =
  "!bg-bg-brand-subtle !border-border-brand !text-fg-brand hover:!bg-bg-brand-subtle";

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const dec1 = (n: number) => n.toFixed(1).replace(".", ",");

const PERIODOS = [
  "Janeiro de 2026",
  "Fevereiro de 2026",
  "Março de 2026",
  "Abril de 2026",
  "Maio de 2026",
  "Junho de 2026",
  "Julho de 2026",
];

/**
 * KPI padrão da tela — ref showcase #/kpi → "Faixa de métricas".
 * Título em cima (caption-md muted) · valor (22px bold) · subtítulo
 * complementar (caption-sm font-medium), com seta + cor quando é delta.
 */
function MetricKpi({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "up" | "down" | "warn" | "neutral";
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-caption-md text-fg-muted">{label}</p>
      <p className="mt-gp-2xs text-stat-sm font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            "mt-gp-2xs text-caption-sm font-medium",
            tone === "up" && "text-fg-success",
            tone === "down" && "text-fg-danger",
            tone === "warn" && "text-fg-warning",
            tone === "neutral" && "text-fg-muted",
          )}
        >
          {tone === "up" ? "↑ " : tone === "down" ? "↓ " : ""}
          {sub}
        </p>
      )}
    </div>
  );
}

const growthConfig = {
  total: { label: "PROs", color: "var(--color-chart-1)" },
} satisfies ChartConfig;
const recurrenceConfig = {
  consultantCount: { label: "Consultores", color: "var(--color-chart-4)" },
} satisfies ChartConfig;
const pieConfig = { total: { label: "PROs" } } satisfies ChartConfig;
const successConfig = {
  percentage: { label: "Taxa de sucesso", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

export function EstatisticasPage() {
  const [graduacaoMin, setGraduacaoMin] = useState<string>(RANKING_ALL);
  const graduacaoAtiva = graduacaoMin !== RANKING_ALL;
  const [periodo, setPeriodo] = useState("Julho de 2026");

  const currentMonth = monthlyGrowth[monthlyGrowth.length - 1];
  const prevMonth = monthlyGrowth[monthlyGrowth.length - 2];
  const proDelta = currentMonth.total - prevMonth.total;

  const recur = useMemo(
    () => recurrence.map((r) => ({ ...r, label: `${r.consecutiveMonths}m` })),
    [],
  );
  const avgRecurrence = useMemo(() => {
    const denom = recurrence.reduce((a, r) => a + r.consultantCount, 0) || 1;
    return recurrence.reduce((a, r) => a + r.consecutiveMonths * r.consultantCount, 0) / denom;
  }, []);
  const highRetentionPct = useMemo(
    () => recurrence.filter((r) => r.consecutiveMonths >= 6).reduce((a, r) => a + r.percentage, 0),
    [],
  );

  const gradDist = useMemo(() => {
    if (graduacaoMin === RANKING_ALL) return graduationDistribution;
    const min = GRADUACOES.indexOf(graduacaoMin as never);
    return graduationDistribution.filter((g) => GRADUACOES.indexOf(g.graduation) >= min);
  }, [graduacaoMin]);
  const gradTotal = useMemo(() => gradDist.reduce((a, g) => a + g.total, 0), [gradDist]);
  const bestGraduation = useMemo(
    () => [...gradDist].sort((a, b) => b.percentage - a.percentage)[0],
    [gradDist],
  );
  const gradLegend = useMemo(
    () =>
      gradDist.map((g, i) => ({
        ...g,
        color: PIE_COLORS[i % PIE_COLORS.length],
        share: gradTotal > 0 ? Math.round((g.total / gradTotal) * 100) : 0,
      })),
    [gradDist, gradTotal],
  );

  const retained6 = useMemo(
    () =>
      recurrence
        .filter((r) => r.consecutiveMonths >= 6)
        .reduce((a, r) => a + r.consultantCount, 0),
    [],
  );

  const totalEvaluated = useMemo(
    () => businessTimeAnalysis.reduce((a, b) => a + b.total, 0),
    [],
  );
  const successWeighted = useMemo(() => {
    const denom = businessTimeAnalysis.reduce((a, b) => a + b.total, 0) || 1;
    return businessTimeAnalysis.reduce((a, b) => a + b.percentage * b.total, 0) / denom;
  }, []);

  const avgBusinessMonths = useMemo(() => {
    const denom = businessTimeAnalysis.reduce((a, b) => a + b.total, 0) || 1;
    return businessTimeAnalysis.reduce((a, b) => a + b.averageProMonths * b.total, 0) / denom;
  }, []);

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          color="secondary"
          variant="outline"
          size="md"
          iconLeft={<GraduationCap />}
          iconRight={<ChevronDown />}
          className={cn(graduacaoAtiva && ACTIVE_BTN)}
        >
          {graduacaoAtiva ? titleCase(graduacaoMin) : "Graduação"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem
          onSelect={() => setGraduacaoMin(RANKING_ALL)}
          className={cn(graduacaoMin === RANKING_ALL && "bg-bg-brand-subtle text-fg-brand")}
        >
          <Check className={graduacaoMin === RANKING_ALL ? "opacity-100" : "opacity-0"} />
          Todas as graduações
        </DropdownMenuItem>
        {GRADUACOES.map((g) => (
          <DropdownMenuItem
            key={g}
            onSelect={() => setGraduacaoMin(g)}
            className={cn(graduacaoMin === g && "bg-bg-brand-subtle text-fg-brand")}
          >
            <Check className={graduacaoMin === g ? "opacity-100" : "opacity-0"} />
            {titleCase(g)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Estatísticas"
        description="Visão geral PRO da sua rede — crescimento, retenção, graduação e tempo de casa."
        actions={headerActions}
      />

      {/* Hero — Visão Geral da Rede */}
      <SectionCard
        title="Visão Geral da Rede"
        subtitle="Evolução mensal de PROs ativos na rede"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                color="secondary"
                variant="outline"
                size="sm"
                iconLeft={<Calendar />}
                iconRight={<ChevronDown />}
              >
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
        }
      >
        {/* Valor de destaque + delta do mês */}
        <div>
          <p className="text-caption-md text-fg-muted">PROs ativos na rede</p>
          <p className="text-stat-xl font-bold leading-none tabular-nums text-fg-default">
            {num(currentMonth.total)}
          </p>
          <p className="mt-gp-2xs text-body-sm font-medium text-fg-success">
            ↑ +{num(proDelta)} PROs ({dec1(currentMonth.growthPercentage)}%){" "}
            <span className="font-normal text-fg-muted">no último mês</span>
          </p>
        </div>
        <ChartContainer config={growthConfig} className="h-[240px] w-full">
          <AreaChart data={growthSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="label" interval={1} tickLine={false} axisLine={false} tickMargin={8} className="text-caption-sm" />
            <YAxis tickLine={false} axisLine={false} width={26} tickMargin={2} allowDecimals={false} className="text-caption-sm" />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#fillGrowth)"
              dot={{ r: 3, fill: "var(--color-chart-1)" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
        {/* KPIs em blocos */}
        <div className="grid grid-cols-1 gap-gp-lg sm:grid-cols-3">
          <div className="rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
            <MetricKpi label="Total na rede" value={num(gradTotal)} sub="licenciados" />
          </div>
          <div className="rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
            <MetricKpi
              label="Alta retenção"
              value={`${dec1(highRetentionPct)}%`}
              sub="6+ meses"
              tone="warn"
            />
          </div>
          <div className="rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
            <MetricKpi
              label="Tempo médio"
              value={`${dec1(avgBusinessMonths)} meses`}
              sub="de casa"
            />
          </div>
        </div>
      </SectionCard>

      {/* Linha de 3 cards */}
      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3">
        {/* Retenção PRO — área âmbar */}
        <SectionCard
          title="Retenção PRO"
          subtitle="Consultores ativos por tempo"
          className="h-[460px]"
        >
          <div className="flex w-fit divide-x divide-border-subtle">
            <div className="pr-pad-2xl">
              <MetricKpi label="Média retida" value={dec1(avgRecurrence)} sub="meses" />
            </div>
            <div className="pl-pad-2xl">
              <MetricKpi
                label="Retidos 6+ meses"
                value={num(retained6)}
                sub={`${dec1(highRetentionPct)}% retenção`}
                tone="warn"
              />
            </div>
          </div>
          <ChartContainer config={recurrenceConfig} className="min-h-0 w-full flex-1">
            <AreaChart data={recur} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} className="text-caption-sm" />
              <YAxis tickLine={false} axisLine={false} width={26} tickMargin={2} allowDecimals={false} className="text-caption-sm" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
              <Area
                type="monotone"
                dataKey="consultantCount"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                fill="url(#fillRet)"
                dot={{ r: 3, fill: "var(--color-chart-4)" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        </SectionCard>

        {/* Distribuição por Graduação — donut + legenda % */}
        <SectionCard
          title="Distribuição por Graduação"
          subtitle={
            bestGraduation
              ? `Maior conversão · ${titleCase(bestGraduation.graduation).split(" ")[0]} ${bestGraduation.percentage}%`
              : undefined
          }
          className="h-[460px]"
        >
          {/* Área fluida — donut sempre centralizado no espaço restante */}
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="relative">
              <ChartContainer config={pieConfig} className="aspect-square w-[170px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="graduation" hideLabel />} />
                  <Pie
                    data={gradDist}
                    dataKey="total"
                    nameKey="graduation"
                    innerRadius={58}
                    outerRadius={81}
                    paddingAngle={3}
                    cornerRadius={5}
                    strokeWidth={0}
                  >
                    {gradDist.map((g, i) => (
                      <Cell key={g.graduation} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-stat-md font-bold leading-none tabular-nums text-fg-default">
                  {num(gradTotal)}
                </span>
                <span className="text-caption-md text-fg-muted">PROs</span>
              </div>
            </div>
          </div>
          <ul className="flex flex-col gap-gp-sm">
            {gradLegend.map((g) => (
              <li key={g.graduation} className="flex items-center gap-gp-md">
                <span className="size-[10px] shrink-0 rounded-radius-full" style={{ background: g.color }} aria-hidden />
                <span className="flex-1 truncate text-body-sm text-fg-default">
                  {titleCase(g.graduation)}
                </span>
                <span className="text-body-sm font-semibold tabular-nums text-fg-default">
                  {g.share}%
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Tempo de Negócio — barras âmbar (% no topo + contagem embaixo) */}
        <SectionCard
          title="Tempo de Negócio"
          subtitle="Taxa de sucesso por faixa"
          className="h-[460px]"
        >
          <div className="flex w-fit divide-x divide-border-subtle">
            <div className="pr-pad-2xl">
              <MetricKpi label="Total avaliado" value={num(totalEvaluated)} sub="consultores" />
            </div>
            <div className="pl-pad-2xl">
              <MetricKpi
                label="Taxa de sucesso geral"
                value={`${Math.round(successWeighted)}%`}
                sub="ponderada"
                tone="warn"
              />
            </div>
          </div>
          <ChartContainer config={successConfig} className="min-h-0 w-full flex-1">
            <BarChart data={businessTimeAnalysis} margin={{ top: 24, right: 8, left: 8, bottom: 28 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="short"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval={0}
                tick={(props) => {
                  const cx = Number(props.x);
                  const cy = Number(props.y);
                  const item = businessTimeAnalysis[props.payload.index];
                  return (
                    <g>
                      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-fg-muted text-caption-sm">
                        {props.payload.value}
                      </text>
                      <text x={cx} y={cy + 28} textAnchor="middle" className="fill-fg-subtle text-caption-sm">
                        {item.total}
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis hide domain={[0, 100]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
              <Bar dataKey="percentage" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="percentage"
                  position="top"
                  formatter={(v) => `${Math.round(Number(v))}%`}
                  className="fill-fg-default text-caption-md font-semibold"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </SectionCard>
      </div>

      {/* Respiro no rodapé */}
      <div aria-hidden className="h-pad-3xl shrink-0" />
    </div>
  );
}
