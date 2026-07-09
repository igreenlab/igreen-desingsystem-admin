import { useState } from "react";
import type { LucideIcon } from "@/lib/lucide-types";
import { UserPlus, UserMinus, UserCheck } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { Chip } from "@/components/ui/Chip";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { cn } from "@/lib/utils";
import { SectionCard } from "../../painel-v2/_ui";
import { redeEvolucaoMeses, mesAtualIndex, redePerformance } from "../v3-mock";
import { fmt } from "../../painel/painel-mock";

const evolucaoConfig = {
  ganho: { label: "Ganho no mês", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const performanceConfig = {
  taxa: { label: "Ativação", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

/** Linha de legenda estilo "Saúde da rede" — ícone colorido + label/sub + valor. */
function LegendRow({
  icon: Icon,
  label,
  sub,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  value: string;
  tone: "success" | "danger";
}) {
  const box =
    tone === "success"
      ? "bg-bg-success-muted text-fg-success"
      : "bg-bg-danger-muted text-fg-danger";
  const valueColor = tone === "success" ? "text-fg-success" : "text-fg-danger";
  return (
    <div className="flex items-center gap-gp-md py-pad-md">
      <span
        className={cn(
          "grid size-comp-xl shrink-0 place-items-center rounded-radius-base",
          box,
        )}
      >
        <Icon className="size-icon-sm" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium text-fg-default">
          {label}
        </span>
        <span className="block text-caption-sm text-fg-muted">{sub}</span>
      </span>
      <span
        className={cn("text-body-md font-semibold tabular-nums", valueColor)}
      >
        {value}
      </span>
    </div>
  );
}

/** Aba Evolução — total acumulado por mês; clicar na barra seleciona o mês. */
function EvolucaoView() {
  const [sel, setSel] = useState(mesAtualIndex);
  const m = redeEvolucaoMeses[sel];
  const net = m.entradas - m.saidas;

  return (
    <>
      <div>
        <span className="text-caption-md text-fg-muted">
          No mês de {m.nome}
        </span>
        <div className="flex items-baseline gap-gp-sm">
          <span className="text-stat-lg font-bold leading-none tabular-nums text-fg-default">
            {fmt(m.total)}
          </span>
          <span className="text-title-md font-semibold text-fg-default">
            Licenciados
          </span>
        </div>
        <span className="mt-gp-2xs block text-caption-sm font-medium text-fg-success">
          +{net} licenciados a mais neste mês
        </span>
      </div>

      <ChartContainer config={evolucaoConfig} className="h-[160px] w-full">
        <BarChart
          data={redeEvolucaoMeses}
          margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <Bar
            dataKey="ganho"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
            onClick={(_, index) => setSel(index)}
          >
            {redeEvolucaoMeses.map((_, i) => (
              <Cell
                key={i}
                cursor="pointer"
                fill={
                  i === sel ? "var(--color-chart-1)" : "var(--color-bg-muted)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="flex flex-col border-t border-border-subtle pt-gp-sm">
        <LegendRow
          icon={UserPlus}
          label="Entradas"
          sub="novos no mês"
          value={`+${fmt(m.entradas)}`}
          tone="success"
        />
        <LegendRow
          icon={UserMinus}
          label="Saídas"
          sub="cancelaram no mês"
          value={`-${fmt(m.saidas)}`}
          tone="danger"
        />
      </div>
    </>
  );
}

/** Aba Performance — taxa de ativação (% ativos) por mês. Mesma altura. */
function PerformanceView() {
  const p = redePerformance;
  return (
    <>
      <div>
        <span className="text-caption-md text-fg-muted">Taxa de ativação</span>
        <div className="flex items-baseline gap-gp-sm">
          <span className="text-stat-lg font-bold leading-none tabular-nums text-fg-default">
            {p.taxaAtual}%
          </span>
          <Chip color="success" variant="soft" size="sm">
            +{p.deltaPts} pts
          </Chip>
        </div>
        <span className="mt-gp-2xs block text-caption-sm text-fg-muted">
          licenciados ativos · vs mês anterior
        </span>
      </div>

      <ChartContainer config={performanceConfig} className="h-[160px] w-full">
        <AreaChart
          data={p.serie}
          margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <defs>
            <linearGradient id="fillTaxa" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-chart-1)"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="var(--color-chart-1)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <YAxis hide domain={["dataMin - 6", 100]} />
          <Area
            dataKey="taxa"
            type="monotone"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#fillTaxa)"
          />
        </AreaChart>
      </ChartContainer>

      <div className="flex flex-col border-t border-border-subtle pt-gp-sm">
        <LegendRow
          icon={UserCheck}
          label="Ativos"
          sub="na rede"
          value={fmt(p.ativos)}
          tone="success"
        />
        <LegendRow
          icon={UserMinus}
          label="Inativos"
          sub="+90 dias parados"
          value={fmt(p.inativos)}
          tone="danger"
        />
      </div>
    </>
  );
}

/** Evolução da rede — abas Evolução (barras por mês, seleção) e Performance. */
export function NetworkGrowth({ className }: { className?: string }) {
  const [tab, setTab] = useState<"evolucao" | "performance">("evolucao");
  return (
    <SectionCard
      title="Evolução da rede"
      subtitle="crescimento de licenciados ativos"
      className={className}
    >
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "evolucao" | "performance")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="evolucao" className="flex-1">
            Evolução
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex-1">
            Performance
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "evolucao" ? <EvolucaoView /> : <PerformanceView />}
    </SectionCard>
  );
}
