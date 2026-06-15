import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
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

/* ── Mock (domínio iGreen) ──────────────────────────────────────────── */
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
  consumida: { label: "Consumida", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

// Verde + âmbar (mais contraste que verde+teal) — usado em Multiple/Stacked.
const configContrast = {
  gerada: { label: "Gerada", color: "var(--color-chart-1)" },
  consumida: { label: "Consumida", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

// Geração por fonte (categórico — uma cor por fonte)
const FONTES = [
  { fonte: "solar", total: 275, fill: "var(--color-solar)" },
  { fonte: "eolica", total: 200, fill: "var(--color-eolica)" },
  { fonte: "hidrica", total: 187, fill: "var(--color-hidrica)" },
  { fonte: "biomassa", total: 173, fill: "var(--color-biomassa)" },
  { fonte: "outros", total: 90, fill: "var(--color-outros)" },
];

const configFontes = {
  total: { label: "Geração (kWh)" },
  solar: { label: "Solar", color: "var(--color-chart-1)" },
  eolica: { label: "Eólica", color: "var(--color-chart-2)" },
  hidrica: { label: "Hídrica", color: "var(--color-chart-3)" },
  biomassa: { label: "Biomassa", color: "var(--color-chart-4)" },
  outros: { label: "Outros", color: "var(--color-chart-5)" },
} satisfies ChartConfig;

// Saldo mensal (valores +/-)
const SALDO = [
  { month: "Jan", saldo: 106 },
  { month: "Fev", saldo: 85 },
  { month: "Mar", saldo: -42 },
  { month: "Abr", saldo: -57 },
  { month: "Mai", saldo: 79 },
  { month: "Jun", saldo: 54 },
];
const configSaldo = { saldo: { label: "Saldo (kWh)" } } satisfies ChartConfig;

const CHART_CLASS = "h-[250px] w-full";

const TOC = [
  { id: "default", label: "Default" },
  { id: "horizontal", label: "Horizontal" },
  { id: "multiple", label: "Multiple" },
  { id: "stacked", label: "Stacked + Legend" },
  { id: "label", label: "Label" },
  { id: "custom-label", label: "Custom Label" },
  { id: "mixed", label: "Mixed" },
  { id: "active", label: "Active" },
  { id: "negative", label: "Negative" },
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

export function BarChartDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Bar Chart"
        description="Gráficos de barra sobre o Recharts, com a paleta e o tooltip/legenda do iGreen DS."
        dependency="recharts"
      />
      <DocSeparator />

      {/* Interactive em destaque no topo (igual ao shadcn) */}
      <Card id="interactive" className="mb-gp-2xl gap-0 overflow-hidden py-0">
        <InteractiveBarChart />
      </Card>

      <div className="grid gap-gp-2xl md:grid-cols-2">
        {/* Default */}
        <Card id="default">
          <CardHeader>
            <CardTitle>Bar Chart</CardTitle>
            <CardDescription>Energia gerada por mês (kWh)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <BarChart data={DATA}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="gerada" fill="var(--color-gerada)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Horizontal (meses, cor única) */}
        <Card id="horizontal">
          <CardHeader>
            <CardTitle>Bar Chart — Horizontal</CardTitle>
            <CardDescription>Energia gerada por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <BarChart data={DATA} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="month"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                />
                <XAxis dataKey="gerada" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="gerada" fill="var(--color-gerada)" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Multiple (verde + âmbar) */}
        <Card id="multiple">
          <CardHeader>
            <CardTitle>Bar Chart — Multiple</CardTitle>
            <CardDescription>Gerada vs. consumida</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configContrast} className={CHART_CLASS}>
              <BarChart data={DATA}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="gerada" fill="var(--color-gerada)" radius={4} />
                <Bar dataKey="consumida" fill="var(--color-consumida)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Stacked + Legend (verde + âmbar) */}
        <Card id="stacked">
          <CardHeader>
            <CardTitle>Bar Chart — Stacked + Legend</CardTitle>
            <CardDescription>Empilhado com legenda</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configContrast} className={CHART_CLASS}>
              <BarChart data={DATA}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="gerada" stackId="a" fill="var(--color-gerada)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="consumida" stackId="a" fill="var(--color-consumida)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Label (valor acima) */}
        <Card id="label">
          <CardHeader>
            <CardTitle>Bar Chart — Label</CardTitle>
            <CardDescription>Rótulo acima da barra</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <BarChart data={DATA} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="gerada" fill="var(--color-gerada)" radius={6}>
                  <LabelList position="top" offset={8} className="fill-fg-default" fontSize={11} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Custom Label (meses horizontal, rótulo dentro + valor) */}
        <Card id="custom-label">
          <CardHeader>
            <CardTitle>Bar Chart — Custom Label</CardTitle>
            <CardDescription>Rótulo dentro da barra</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <BarChart data={DATA} layout="vertical" margin={{ right: 24, left: 0 }}>
                <YAxis dataKey="month" type="category" hide />
                <XAxis dataKey="gerada" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="gerada" fill="var(--color-gerada)" radius={5}>
                  <LabelList
                    dataKey="month"
                    position="insideLeft"
                    offset={10}
                    className="fill-fg-on-brand"
                    fontSize={11}
                  />
                  <LabelList
                    dataKey="gerada"
                    position="right"
                    offset={8}
                    className="fill-fg-default"
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Mixed (cor por fonte) */}
        <Card id="mixed">
          <CardHeader>
            <CardTitle>Bar Chart — Mixed</CardTitle>
            <CardDescription>Uma cor por fonte</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configFontes} className={CHART_CLASS}>
              <BarChart data={FONTES} layout="vertical" margin={{ left: 8 }}>
                <YAxis
                  dataKey="fonte"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={72}
                  tickFormatter={(v: string) =>
                    configFontes[v as keyof typeof configFontes]?.label as string
                  }
                />
                <XAxis dataKey="total" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="total" radius={5}>
                  {FONTES.map((f) => (
                    <Cell key={f.fonte} fill={f.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Active (mês de pico destacado com borda tracejada) */}
        <Card id="active">
          <CardHeader>
            <CardTitle>Bar Chart — Active</CardTitle>
            <CardDescription>Mês de pico destacado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className={CHART_CLASS}>
              <BarChart data={DATA}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                <Bar dataKey="gerada" radius={6}>
                  {DATA.map((d, i) => {
                    const isPeak = i === 1; // Fev = pico
                    return (
                      <Cell
                        key={d.month}
                        fill="var(--color-gerada)"
                        fillOpacity={isPeak ? 1 : 0.45}
                        stroke={isPeak ? "var(--color-gerada)" : undefined}
                        strokeWidth={isPeak ? 2 : 0}
                        strokeDasharray={isPeak ? "4 4" : undefined}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Negative (cor por sinal) */}
        <Card id="negative">
          <CardHeader>
            <CardTitle>Bar Chart — Negative</CardTitle>
            <CardDescription>Saldo mensal (gerada − consumida)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={configSaldo} className={CHART_CLASS}>
              <BarChart data={SALDO}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                <Bar dataKey="saldo" radius={5}>
                  <LabelList position="top" offset={8} className="fill-fg-muted" fontSize={11} />
                  {SALDO.map((d) => (
                    <Cell
                      key={d.month}
                      fill={d.saldo >= 0 ? "var(--color-chart-1)" : "var(--color-chart-4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>
      </div>
    </DocLayout>
  );
}

/* ── Interactive (diário, toggle por métrica com totais) ────────────── */
// Pseudo-random determinístico (LCG) — varia barra-a-barra sem o padrão de
// "montanhas" da senoide. 63 dias (~30% menos barras, visual mais harmônico).
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

function InteractiveBarChart() {
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
        <div className="flex flex-1 flex-col justify-center gap-gp-2xs px-pad-4xl py-pad-3xl">
          <CardTitle>Bar Chart — Interativo</CardTitle>
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
          <BarChart data={DAILY} margin={{ left: 12, right: 12 }}>
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
                  labelFormatter={(v) =>
                    new Date(v as string).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
              }
            />
            <Bar dataKey={metric} fill={`var(--color-${metric})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}
