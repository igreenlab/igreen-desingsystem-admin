import { useMemo, useState, type ReactNode } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import {
  Area,
  AreaChart,
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
import { BRAZIL_PATHS, BRAZIL_VIEWBOX } from "../analise-rede/brazil-map-paths";
import { ResumoGeralOperacao } from "./blocks/ResumoGeralOperacao";
import { ResumoMes } from "./blocks/ResumoMes";
import {
  energiaKpis,
  economiaEstimadaMes,
  clientesGrowth,
  clientesPorUf,
  clientesPorDistribuidora,
  funilCadastros,
  totalCadastrosMes,
  totalMwhMes,
  resumoExtras,
  cadastrosPorDia,
  melhorDiaCadastros,
  mediaDiaCadastros,
  impactoAmbiental,
  resumoGeral,
  PERIODOS,
  num,
  dec1,
} from "./energia-dashboard-mock";

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-bg-muted)",
];

const MAP_RAMP = [
  "var(--color-chart-1)",
  "color-mix(in oklch, var(--color-chart-1) 80%, black)",
  "color-mix(in oklch, var(--color-chart-1) 62%, black)",
  "color-mix(in oklch, var(--color-chart-1) 46%, black)",
  "color-mix(in oklch, var(--color-chart-1) 34%, black)",
];

const donutConfig = { value: { label: "Total" } } satisfies ChartConfig;
const growthConfig = {
  total: { label: "Clientes", color: "var(--color-chart-1)" },
} satisfies ChartConfig;
const cadDiaConfig = {
  n: { label: "Cadastros", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

function buildUfColor(list: { uf: string; total: number }[]): Record<string, string> {
  const ranked = list.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
  const m: Record<string, string> = {};
  ranked.forEach((r, i) => {
    m[r.uf] = MAP_RAMP[Math.min(i, MAP_RAMP.length - 1)];
  });
  return m;
}

/** KPI padrão — título / valor / subtítulo (ref showcase #/kpi "Faixa de métricas"). */
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
      <p className="mt-gp-2xs text-[22px] font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
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

/** Card de donut com centro + legenda embaixo (layout único p/ status e distribuidora). */
function DonutCard({
  title,
  subtitle,
  items,
  centerValue,
  centerLabel,
}: {
  title: string;
  subtitle: string;
  items: { name: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = items.reduce((a, i) => a + i.value, 0) || 1;
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="relative">
          <ChartContainer config={donutConfig} className="aspect-square w-[160px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={3}
                cornerRadius={5}
                strokeWidth={0}
              >
                {items.map((it) => (
                  <Cell key={it.name} fill={it.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold leading-none tabular-nums text-fg-default">
              {centerValue}
            </span>
            <span className="text-caption-sm text-fg-muted">{centerLabel}</span>
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-gp-xs">
        {items.map((it) => (
          <li key={it.name} className="flex items-center gap-gp-sm">
            <span className="size-[10px] shrink-0 rounded-radius-full" style={{ background: it.color }} aria-hidden />
            <span className="flex-1 truncate text-body-sm text-fg-default">{it.name}</span>
            <span className="text-body-sm font-semibold tabular-nums text-fg-default">
              {Math.round((it.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function BrazilMap({ fillByUf }: { fillByUf: Record<string, string> }) {
  return (
    <svg
      viewBox={BRAZIL_VIEWBOX}
      className="h-full max-h-[300px] w-full"
      role="img"
      aria-label="Mapa do Brasil — clientes de energia por estado"
    >
      {BRAZIL_PATHS.map((p) => (
        <path
          key={p.uf}
          d={p.d}
          fill={fillByUf[p.uf] ?? "var(--color-bg-muted)"}
          stroke="var(--color-bg-surface)"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function EnergiaDashboardPage() {
  const [periodo, setPeriodo] = useState("Julho de 2026");

  const consumoMwh = Math.round(energiaKpis.consumoTotalKwh / 1000);
  const consumoMedio = Math.round(energiaKpis.consumoTotalKwh / energiaKpis.clientesAtivos);
  const economiaMil = economiaEstimadaMes / 1000;

  const fillByUf = useMemo(() => buildUfColor(clientesPorUf), []);
  const topUfs = useMemo(
    () => [...clientesPorUf].sort((a, b) => b.total - a.total).slice(0, 5),
    [],
  );
  const ufTotal = useMemo(() => clientesPorUf.reduce((a, r) => a + r.total, 0), []);
  const distTotal = useMemo(
    () => clientesPorDistribuidora.reduce((a, d) => a + d.total, 0),
    [],
  );

  const statusItems = useMemo(
    () => funilCadastros.map((f) => ({ name: f.label, value: f.n, color: f.color })),
    [],
  );
  const distItems = useMemo(
    () =>
      clientesPorDistribuidora.map((d, i) => ({
        name: d.name,
        value: d.total,
        color: PIE_COLORS[i % PIE_COLORS.length],
      })),
    [],
  );

  const periodSelector = (
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
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Resumo"
        description="Clientes Green — funil de cadastros, carteira e impacto do mês."
        actions={periodSelector}
      />

      {/* 1 — Resumo Geral da Operação (acumulado) */}
      <ResumoGeralOperacao
        totalCadastros={resumoGeral.totalCadastros}
        mwhContratados={resumoGeral.mwhContratados}
        status={resumoGeral.status}
        licenciadosComCadastro={resumoGeral.licenciadosComCadastro}
        aguardandoInjecao={resumoGeral.aguardandoInjecao}
      />

      {/* 2 — Clientes por UF + Por distribuidora + Distribuição de status (3 na row) */}
      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3">
        <SectionCard
          title="Clientes por UF"
          subtitle={`${clientesPorUf.length} estados · ${num(ufTotal)} ativos`}
        >
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <BrazilMap fillByUf={fillByUf} />
          </div>
          <ul className="grid grid-cols-2 gap-x-gp-xl gap-y-gp-xs">
            {topUfs.map((u, i) => (
              <li key={u.uf} className="flex items-center gap-gp-sm">
                <span
                  className="size-[10px] shrink-0 rounded-radius-full"
                  style={{ background: MAP_RAMP[Math.min(i, MAP_RAMP.length - 1)] }}
                  aria-hidden
                />
                <span className="flex-1 text-body-sm text-fg-default">{u.uf}</span>
                <span className="text-body-sm font-semibold tabular-nums text-fg-default">
                  {num(u.total)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <DonutCard
          title="Por distribuidora"
          subtitle="Participação de clientes"
          items={distItems}
          centerValue={num(distTotal)}
          centerLabel="clientes"
        />

        <DonutCard
          title="Distribuição de status"
          subtitle="Participação por etapa"
          items={statusItems}
          centerValue={num(totalCadastrosMes)}
          centerLabel="cadastros"
        />
      </div>

      {/* 3 — Crescimento da carteira */}
      <SectionCard
        title="Crescimento da carteira"
        subtitle="Clientes ativos do segmento ao longo do tempo"
      >
        <div>
          <p className="text-caption-md text-fg-muted">Clientes ativos no segmento</p>
          <p className="text-[34px] font-bold leading-none tabular-nums text-fg-default">
            {num(energiaKpis.clientesAtivos)}
          </p>
          <p className="mt-gp-2xs text-body-sm font-medium text-fg-success">
            ↑ +{num(energiaKpis.novosNoMes)} clientes ({dec1(energiaKpis.novosDeltaPct)}%){" "}
            <span className="font-normal text-fg-muted">no último mês</span>
          </p>
        </div>
        <ChartContainer config={growthConfig} className="h-[220px] w-full">
          <AreaChart data={clientesGrowth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillEnergia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} className="text-caption-sm" />
            <YAxis tickLine={false} axisLine={false} width={36} tickMargin={2} allowDecimals={false} className="text-caption-sm" />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#fillEnergia)"
              dot={{ r: 3, fill: "var(--color-chart-1)" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
        <div className="grid grid-cols-1 gap-gp-lg sm:grid-cols-3">
          <div className="rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
            <MetricKpi label="Consumo total" value={`${num(consumoMwh)} MWh`} sub="por mês" />
          </div>
          <div className="rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
            <MetricKpi label="Economia estimada" value={`R$ ${dec1(economiaMil)} mil`} sub="gerada/mês" tone="warn" />
          </div>
          <div className="rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
            <MetricKpi label="Consumo médio" value={`${num(consumoMedio)} kWh`} sub="por cliente" />
          </div>
        </div>
      </SectionCard>

      {/* 4 — Resumo do mês + Cadastros por dia (mesma row) */}
      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-2">
        <ResumoMes
          impacto={{
            mwhValidados: impactoAmbiental.mwh,
            co2Toneladas: impactoAmbiental.co2Toneladas,
            arvores: impactoAmbiental.arvores,
            placas: impactoAmbiental.placas,
          }}
          operacao={{
            comEnergiaAtiva: {
              valor: resumoExtras.comEnergiaN,
              percentual: resumoExtras.comEnergiaPct,
            },
            licenciadosComCadastro: resumoExtras.licenciadosComCadastro,
            aniversariantes: resumoExtras.aniversariantesHoje,
          }}
        />

        <SectionCard
          title="Cadastros por dia"
          subtitle={`Melhor dia: ${num(melhorDiaCadastros)} · média ${num(mediaDiaCadastros)}/dia`}
        >
          <ChartContainer config={cadDiaConfig} className="h-[240px] w-full">
            <BarChart data={cadastrosPorDia} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} interval={2} className="text-caption-sm" />
              <YAxis tickLine={false} axisLine={false} width={28} tickMargin={2} allowDecimals={false} className="text-caption-sm" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
              <Bar dataKey="n" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </SectionCard>
      </div>

      {/* 5 — Funil de cadastros do mês (hero + barra + tabela) */}
      <SectionCard title="Funil de cadastros do mês" subtitle="Status dos cadastros do segmento">
        <div className="flex flex-wrap items-end justify-between gap-gp-md">
          <span className="text-[34px] font-medium leading-none tabular-nums text-fg-default">
            {num(totalCadastrosMes)}
          </span>
          <span className="text-body-sm text-fg-muted">
            cadastros · {num(totalMwhMes)} MWh contratados
          </span>
        </div>

        <div
          role="img"
          aria-label={`Composição: ${funilCadastros.map((f) => `${f.label} ${num(f.n)}`).join(", ")}`}
          className="flex h-[10px] w-full gap-[2px] overflow-hidden rounded-radius-md"
        >
          {funilCadastros.map((f) => (
            <div
              key={f.key}
              style={{ width: `${(f.n / totalCadastrosMes) * 100}%`, background: f.color }}
              title={`${f.label}: ${num(f.n)}`}
            />
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle text-caption-md text-fg-muted">
                <th className="py-pad-md text-left font-medium">Etapa</th>
                <th className="py-pad-md text-right font-medium">Cadastros</th>
                <th className="py-pad-md text-right font-medium">MWh</th>
                <th className="py-pad-md text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody className="[font-variant-numeric:tabular-nums]">
              {funilCadastros.map((f) => (
                <tr key={f.key} className="border-b border-border-subtle last:border-0">
                  <td className="py-pad-lg">
                    <span className="flex items-center gap-gp-md font-medium text-fg-default">
                      <span className="h-[16px] w-[3px] rounded-radius-full" style={{ background: f.color }} />
                      {f.label}
                    </span>
                  </td>
                  <td className="py-pad-lg text-right">{num(f.n)}</td>
                  <td className="py-pad-lg text-right">{num(f.mwh)}</td>
                  <td className="py-pad-lg text-right text-fg-muted">
                    {Math.round((f.n / totalCadastrosMes) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Respiro no rodapé */}
      <div aria-hidden className="h-pad-3xl shrink-0" />
    </div>
  );
}
