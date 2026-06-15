import { useMemo, useState } from "react";
import { TrendingUp, Sun, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/shadcn/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../components/ui/Chart";
import { DocLayout, DocHeader, DocSeparator } from "../components";

/* ── Mock (domínio iGreen: energia kWh por mês) ─────────────────────── */
const DATA = [
  { month: "Jan", gerada: 186, consumida: 80 },
  { month: "Fev", gerada: 205, consumida: 120 },
  { month: "Mar", gerada: 237, consumida: 150 },
  { month: "Abr", gerada: 173, consumida: 190 },
  { month: "Mai", gerada: 209, consumida: 170 },
  { month: "Jun", gerada: 264, consumida: 210 },
];

const config = {
  gerada: { label: "Gerada", color: "var(--color-chart-1)" },
  consumida: { label: "Consumida", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

const configIcons = {
  gerada: { label: "Gerada", color: "var(--color-chart-1)", icon: Sun },
  consumida: { label: "Consumida", color: "var(--color-chart-2)", icon: Zap },
} satisfies ChartConfig;

const CHART_CLASS = "h-[250px] w-full";

const TOC = [
  { id: "default", label: "Default" },
  { id: "linear", label: "Linear" },
  { id: "step", label: "Step" },
  { id: "stacked", label: "Stacked" },
  { id: "expanded", label: "Stacked Expanded" },
  { id: "legend", label: "Legend" },
  { id: "icons", label: "Icons" },
  { id: "gradient", label: "Gradient" },
  { id: "axes", label: "Axes" },
  { id: "interactive", label: "Interactive" },
];

function TrendFooter() {
  return (
    <CardFooter className="flex-col items-start gap-gp-2xs text-caption-sm">
      <div className="flex items-center gap-gp-sm font-medium text-fg-default">
        Alta de 5,2% neste mês <TrendingUp className="size-icon-xs" />
      </div>
      <div className="text-fg-muted">Janeiro – Junho 2024</div>
    </CardFooter>
  );
}

export function AreaChartDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Area Chart"
        description="Gráficos de área construídos sobre o Recharts, com a paleta e o tooltip/legenda do iGreen DS."
        dependency="recharts"
      />
      <DocSeparator />

      <div className="grid gap-gp-2xl md:grid-cols-2">
        {/* Default */}
        <Card id="default">
          <CardHeader>
            <CardTitle>Area Chart</CardTitle>
            <CardDescription>Energia gerada por mês (kWh)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="gerada"
                  type="natural"
                  fill="var(--color-gerada)"
                  fillOpacity={0.4}
                  stroke="var(--color-gerada)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Linear */}
        <Card id="linear">
          <CardHeader>
            <CardTitle>Area Chart — Linear</CardTitle>
            <CardDescription>Interpolação linear</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="gerada"
                  type="linear"
                  fill="var(--color-gerada)"
                  fillOpacity={0.4}
                  stroke="var(--color-gerada)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Step */}
        <Card id="step">
          <CardHeader>
            <CardTitle>Area Chart — Step</CardTitle>
            <CardDescription>Interpolação em degraus</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="gerada"
                  type="step"
                  fill="var(--color-gerada)"
                  fillOpacity={0.4}
                  stroke="var(--color-gerada)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Stacked */}
        <Card id="stacked">
          <CardHeader>
            <CardTitle>Area Chart — Stacked</CardTitle>
            <CardDescription>Gerada + consumida empilhadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  dataKey="consumida"
                  type="natural"
                  fill="var(--color-consumida)"
                  fillOpacity={0.4}
                  stroke="var(--color-consumida)"
                  stackId="a"
                />
                <Area
                  dataKey="gerada"
                  type="natural"
                  fill="var(--color-gerada)"
                  fillOpacity={0.4}
                  stroke="var(--color-gerada)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Stacked Expanded */}
        <Card id="expanded">
          <CardHeader>
            <CardTitle>Area Chart — Stacked Expanded</CardTitle>
            <CardDescription>Proporção (100%) por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }} stackOffset="expand">
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="consumida"
                  type="natural"
                  fill="var(--color-consumida)"
                  fillOpacity={0.5}
                  stroke="var(--color-consumida)"
                  stackId="a"
                />
                <Area
                  dataKey="gerada"
                  type="natural"
                  fill="var(--color-gerada)"
                  fillOpacity={0.5}
                  stroke="var(--color-gerada)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Legend */}
        <Card id="legend">
          <CardHeader>
            <CardTitle>Area Chart — Legend</CardTitle>
            <CardDescription>Com legenda</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="consumida"
                  type="natural"
                  fill="var(--color-consumida)"
                  fillOpacity={0.4}
                  stroke="var(--color-consumida)"
                  stackId="a"
                />
                <Area
                  dataKey="gerada"
                  type="natural"
                  fill="var(--color-gerada)"
                  fillOpacity={0.4}
                  stroke="var(--color-gerada)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Icons */}
        <Card id="icons">
          <CardHeader>
            <CardTitle>Area Chart — Icons</CardTitle>
            <CardDescription>Legenda com ícones</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configIcons} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="consumida"
                  type="natural"
                  fill="var(--color-consumida)"
                  fillOpacity={0.4}
                  stroke="var(--color-consumida)"
                  stackId="a"
                />
                <Area
                  dataKey="gerada"
                  type="natural"
                  fill="var(--color-gerada)"
                  fillOpacity={0.4}
                  stroke="var(--color-gerada)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gradient */}
        <Card id="gradient">
          <CardHeader>
            <CardTitle>Area Chart — Gradient</CardTitle>
            <CardDescription>Preenchimento com degradê</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <defs>
                  <linearGradient id="fillGerada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-gerada)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-gerada)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillConsumida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-consumida)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-consumida)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="consumida"
                  type="natural"
                  fill="url(#fillConsumida)"
                  stroke="var(--color-consumida)"
                  stackId="a"
                />
                <Area
                  dataKey="gerada"
                  type="natural"
                  fill="url(#fillGerada)"
                  stroke="var(--color-gerada)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Axes */}
        <Card id="axes">
          <CardHeader>
            <CardTitle>Area Chart — Axes</CardTitle>
            <CardDescription>Com eixo Y</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <AreaChart data={DATA} margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="gerada"
                  type="natural"
                  fill="var(--color-gerada)"
                  fillOpacity={0.4}
                  stroke="var(--color-gerada)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Interactive */}
        <Card id="interactive" className="md:col-span-2">
          <InteractiveAreaChart />
        </Card>
      </div>
    </DocLayout>
  );
}

/* ── Interactive (toggle de período) ────────────────────────────────── */
const DAILY = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(2024, 3, 1);
  d.setDate(d.getDate() + i);
  const base = 120 + Math.round(60 * Math.sin(i / 6));
  return {
    date: d.toISOString().slice(0, 10),
    gerada: base + ((i * 7) % 40),
    consumida: 80 + ((i * 5) % 60),
  };
});

function InteractiveAreaChart() {
  const [range, setRange] = useState<"90d" | "30d" | "7d">("30d");

  const filtered = useMemo(() => {
    const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
    return DAILY.slice(-days);
  }, [range]);

  const RANGES: { id: typeof range; label: string }[] = [
    { id: "90d", label: "3 meses" },
    { id: "30d", label: "30 dias" },
    { id: "7d", label: "7 dias" },
  ];

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between gap-gp-md space-y-0">
        <div className="grid gap-gp-2xs">
          <CardTitle>Area Chart — Interativo</CardTitle>
          <CardDescription>Energia gerada vs. consumida</CardDescription>
        </div>
        <div className="flex rounded-radius-md bg-bg-muted p-[3px]">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={
                "rounded-radius-sm px-pad-lg py-pad-xs text-caption-sm font-medium transition-colors " +
                (range === r.id
                  ? "bg-bg-accent text-fg-default shadow-sh-sm"
                  : "text-fg-muted hover:text-fg-default")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[280px] w-full">
          <AreaChart data={filtered} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillGeradaI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-gerada)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-gerada)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillConsumidaI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-consumida)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-consumida)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v: string) =>
                new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) =>
                    new Date(v as string).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="consumida"
              type="natural"
              fill="url(#fillConsumidaI)"
              stroke="var(--color-consumida)"
              stackId="a"
            />
            <Area
              dataKey="gerada"
              type="natural"
              fill="url(#fillGeradaI)"
              stroke="var(--color-gerada)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}
