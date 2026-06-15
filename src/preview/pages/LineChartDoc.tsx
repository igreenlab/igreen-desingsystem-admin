import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Dot, LabelList, Line, LineChart, XAxis } from "recharts";
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
  { month: "Fev", gerada: 305, consumida: 200 },
  { month: "Mar", gerada: 237, consumida: 120 },
  { month: "Abr", gerada: 73, consumida: 190 },
  { month: "Mai", gerada: 209, consumida: 130 },
  { month: "Jun", gerada: 214, consumida: 140 },
];

const config = {
  gerada: { label: "Gerada", color: "var(--color-chart-1)" },
  consumida: { label: "Consumida", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

// Geração por fonte (categórico — uma cor por ponto, p/ Dots Colors)
const FONTES = [
  { fonte: "solar", total: 275, fill: "var(--color-chart-1)" },
  { fonte: "eolica", total: 200, fill: "var(--color-chart-2)" },
  { fonte: "hidrica", total: 187, fill: "var(--color-chart-3)" },
  { fonte: "biomassa", total: 173, fill: "var(--color-chart-4)" },
  { fonte: "outros", total: 90, fill: "var(--color-chart-5)" },
];

const configFontes = {
  total: { label: "Geração (kWh)", color: "var(--color-chart-1)" },
  solar: { label: "Solar", color: "var(--color-chart-1)" },
  eolica: { label: "Eólica", color: "var(--color-chart-2)" },
  hidrica: { label: "Hídrica", color: "var(--color-chart-3)" },
  biomassa: { label: "Biomassa", color: "var(--color-chart-4)" },
  outros: { label: "Outros", color: "var(--color-chart-5)" },
} satisfies ChartConfig;

const CHART_CLASS = "h-[250px] w-full";

const TOC = [
  { id: "default", label: "Default" },
  { id: "linear", label: "Linear" },
  { id: "step", label: "Step" },
  { id: "multiple", label: "Multiple" },
  { id: "dots", label: "Dots" },
  { id: "custom-dots", label: "Custom Dots" },
  { id: "dots-colors", label: "Dots Colors" },
  { id: "label", label: "Label" },
  { id: "custom-label", label: "Custom Label" },
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

export function LineChartDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Line Chart"
        description="Gráficos de linha sobre o Recharts, com a paleta e o tooltip/legenda do iGreen DS."
        dependency="recharts"
      />
      <DocSeparator />

      {/* Interactive em destaque no topo (igual ao shadcn) */}
      <Card id="interactive" className="mb-gp-2xl gap-0 overflow-hidden py-0">
        <InteractiveLineChart />
      </Card>

      <div className="grid gap-gp-2xl md:grid-cols-2">
        {/* Default */}
        <Card id="default">
          <CardHeader>
            <CardTitle>Line Chart</CardTitle>
            <CardDescription>Energia gerada por mês (kWh)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="gerada"
                  type="natural"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Linear */}
        <Card id="linear">
          <CardHeader>
            <CardTitle>Line Chart — Linear</CardTitle>
            <CardDescription>Interpolação linear</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="gerada"
                  type="linear"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Step */}
        <Card id="step">
          <CardHeader>
            <CardTitle>Line Chart — Step</CardTitle>
            <CardDescription>Interpolação em degraus</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="gerada"
                  type="step"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Multiple */}
        <Card id="multiple">
          <CardHeader>
            <CardTitle>Line Chart — Multiple</CardTitle>
            <CardDescription>Gerada vs. consumida</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  dataKey="gerada"
                  type="monotone"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="consumida"
                  type="monotone"
                  stroke="var(--color-consumida)"
                  strokeWidth={2}
                  dot={false}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Dots */}
        <Card id="dots">
          <CardHeader>
            <CardTitle>Line Chart — Dots</CardTitle>
            <CardDescription>Pontos visíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="gerada"
                  type="natural"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-gerada)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Custom Dots */}
        <Card id="custom-dots">
          <CardHeader>
            <CardTitle>Line Chart — Custom Dots</CardTitle>
            <CardDescription>Ponto com anel da superfície</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="gerada"
                  type="natural"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={({ cx, cy, payload }) => (
                    <Dot
                      key={payload.month}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="var(--color-gerada)"
                      stroke="var(--color-bg-surface)"
                      strokeWidth={2}
                    />
                  )}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Dots Colors (uma cor por ponto) */}
        <Card id="dots-colors">
          <CardHeader>
            <CardTitle>Line Chart — Dots Colors</CardTitle>
            <CardDescription>Uma cor por fonte</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configFontes} className={CHART_CLASS}>
              <LineChart data={FONTES} margin={{ left: 24, right: 24, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="fonte"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v: string) =>
                    (configFontes[v as keyof typeof configFontes]?.label as string) ?? v
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="total" hideLabel />}
                />
                <Line
                  dataKey="total"
                  type="natural"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={({ cx, cy, payload }) => (
                    <Dot
                      key={payload.fonte}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={payload.fill}
                      stroke={payload.fill}
                    />
                  )}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Label */}
        <Card id="label">
          <CardHeader>
            <CardTitle>Line Chart — Label</CardTitle>
            <CardDescription>Rótulo acima do ponto</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ top: 20, left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="gerada"
                  type="natural"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-gerada)" }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-fg-default"
                    fontSize={11}
                  />
                </Line>
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Custom Label */}
        <Card id="custom-label">
          <CardHeader>
            <CardTitle>Line Chart — Custom Label</CardTitle>
            <CardDescription>Mês + valor por ponto</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <LineChart data={DATA} margin={{ top: 24, left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Line
                  dataKey="gerada"
                  type="natural"
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-gerada)" }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey="month"
                    position="top"
                    offset={12}
                    className="fill-fg-muted"
                    fontSize={11}
                  />
                  <LabelList
                    dataKey="gerada"
                    position="bottom"
                    offset={10}
                    className="fill-fg-default"
                    fontSize={11}
                  />
                </Line>
              </LineChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>
      </div>
    </DocLayout>
  );
}

/* ── Interactive (diário, toggle por métrica com totais) ────────────── */
// Pseudo-random determinístico (LCG) — varia ponto-a-ponto sem padrão de
// senoide. 63 dias (~2 meses), visual harmônico.
function lcg(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const randG = lcg(42);
const randC = lcg(1337);
const DAILY = Array.from({ length: 63 }, (_, i) => {
  const d = new Date(2024, 3, 1);
  d.setDate(d.getDate() + i);
  return {
    date: d.toISOString().slice(0, 10),
    gerada: 140 + Math.round(randG() * 240),
    consumida: 120 + Math.round(randC() * 210),
  };
});

function InteractiveLineChart() {
  const [metric, setMetric] = useState<"gerada" | "consumida">("gerada");

  const totals = useMemo(
    () => ({
      gerada: DAILY.reduce((s, d) => s + d.gerada, 0),
      consumida: DAILY.reduce((s, d) => s + d.consumida, 0),
    }),
    [],
  );

  const METRICS: { id: typeof metric; label: string }[] = [
    { id: "gerada", label: "Gerada" },
    { id: "consumida", label: "Consumida" },
  ];

  return (
    <>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-border-subtle p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-gp-2xs px-pad-2xl py-pad-3xl">
          <CardTitle>Line Chart — Interativo</CardTitle>
          <CardDescription>Energia diária nos últimos 2 meses</CardDescription>
        </div>
        <div className="flex">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              data-active={metric === m.id}
              className="flex flex-1 flex-col justify-center gap-gp-2xs border-t border-border-subtle px-pad-2xl py-pad-3xl text-left even:border-l data-[active=true]:bg-bg-muted sm:min-w-[140px] sm:border-l sm:border-t-0"
            >
              <span className="text-caption-sm text-fg-muted">{m.label}</span>
              <span className="text-title-lg font-bold leading-none text-fg-default [font-variant-numeric:tabular-nums]">
                {totals[m.id].toLocaleString("pt-BR")}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-pad-2xl pb-pad-2xl pt-pad-2xl">
        <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
          <LineChart data={DAILY} margin={{ left: 12, right: 12 }}>
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
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={metric}
                  labelFormatter={(v) =>
                    new Date(v as string).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
              }
            />
            <Line
              dataKey={metric}
              type="monotone"
              stroke={`var(--color-${metric})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}
