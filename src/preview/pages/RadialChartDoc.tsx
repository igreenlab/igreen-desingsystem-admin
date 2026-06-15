import { TrendingUp } from "lucide-react";
import {
  Label,
  LabelList,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
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
  type ChartConfig,
} from "../../components/ui/Chart";
import { DocLayout, DocHeader, DocSeparator } from "../components";

/* ── Paleta monocromática da brand (verde claro → escuro) ───────────── */
const BRAND_SHADES = [
  "var(--color-chart-1)",
  "color-mix(in oklch, var(--color-chart-1) 90%, black)",
  "color-mix(in oklch, var(--color-chart-1) 80%, black)",
  "color-mix(in oklch, var(--color-chart-1) 70%, black)",
  "color-mix(in oklch, var(--color-chart-1) 60%, black)",
];

/* ── Mock (domínio iGreen: geração por fonte, kWh) ──────────────────── */
const FONTES = [
  { fonte: "solar", kwh: 275, fill: BRAND_SHADES[0] },
  { fonte: "eolica", kwh: 200, fill: BRAND_SHADES[1] },
  { fonte: "hidrica", kwh: 187, fill: BRAND_SHADES[2] },
  { fonte: "biomassa", kwh: 173, fill: BRAND_SHADES[3] },
  { fonte: "outros", kwh: 90, fill: BRAND_SHADES[4] },
];

const config = {
  kwh: { label: "kWh" },
  solar: { label: "Solar", color: BRAND_SHADES[0] },
  eolica: { label: "Eólica", color: BRAND_SHADES[1] },
  hidrica: { label: "Hídrica", color: BRAND_SHADES[2] },
  biomassa: { label: "Biomassa", color: BRAND_SHADES[3] },
  outros: { label: "Outros", color: BRAND_SHADES[4] },
} satisfies ChartConfig;

// Valor único (Text / Shape)
const SINGLE = [{ fonte: "solar", kwh: 1260, fill: "var(--color-chart-1)" }];

// Stacked (gerada + consumida num período)
const STACK = [{ periodo: "Junho", gerada: 1260, consumida: 570 }];
const configStack = {
  gerada: { label: "Gerada", color: "var(--color-chart-1)" },
  consumida: { label: "Consumida", color: "var(--color-chart-4)" },
} satisfies ChartConfig;
const STACK_TOTAL = STACK[0].gerada + STACK[0].consumida;

const CHART_CLASS = "mx-auto aspect-square max-h-[250px]";

const TOC = [
  { id: "default", label: "Default" },
  { id: "label", label: "Label" },
  { id: "grid", label: "Grid" },
  { id: "text", label: "Text" },
  { id: "shape", label: "Shape" },
  { id: "stacked", label: "Stacked" },
];

function TrendFooter() {
  return (
    <CardFooter className="flex-col gap-gp-2xs text-caption-sm">
      <div className="flex items-center gap-gp-sm font-medium text-fg-default">
        Alta de 5,2% neste mês <TrendingUp className="size-icon-xs" />
      </div>
      <div className="text-fg-muted">Geração por fonte — Junho 2024</div>
    </CardFooter>
  );
}

// Texto central reutilizável (Text / Shape / Stacked)
function centerLabel(primary: string, secondary: string) {
  return (
    <Label
      content={({ viewBox }) => {
        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
          const cx = viewBox.cx ?? 0;
          const cy = viewBox.cy ?? 0;
          return (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
              <tspan
                x={cx}
                y={cy - 4}
                fontSize={22}
                className="fill-fg-default font-bold [font-variant-numeric:tabular-nums]"
              >
                {primary}
              </tspan>
              <tspan x={cx} y={cy + 16} fontSize={12} className="fill-fg-muted">
                {secondary}
              </tspan>
            </text>
          );
        }
        return null;
      }}
    />
  );
}

export function RadialChartDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Radial Chart"
        description="Gráficos radiais sobre o Recharts, com a paleta e o tooltip/legenda do iGreen DS."
        dependency="recharts"
      />
      <DocSeparator />

      <div className="grid gap-gp-2xl md:grid-cols-2">
        {/* Default */}
        <Card id="default" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Radial Chart</CardTitle>
            <CardDescription>Geração por fonte (kWh)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadialBarChart data={FONTES} innerRadius={30} outerRadius={110}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="fonte" />}
                />
                <RadialBar dataKey="kwh" background />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Label */}
        <Card id="label" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Radial Chart — Label</CardTitle>
            <CardDescription>Nome + valor por anel</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
              <RadialBarChart
                data={FONTES}
                startAngle={-90}
                endAngle={380}
                innerRadius={30}
                outerRadius={110}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="fonte" />}
                />
                <RadialBar dataKey="kwh" background>
                  <LabelList
                    position="insideStart"
                    dataKey="fonte"
                    className="fill-fg-on-brand capitalize mix-blend-luminosity"
                    fontSize={11}
                    formatter={(v) => config[v as keyof typeof config]?.label as string}
                  />
                </RadialBar>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Grid */}
        <Card id="grid" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Radial Chart — Grid</CardTitle>
            <CardDescription>Com grade circular</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadialBarChart data={FONTES} innerRadius={30} outerRadius={100}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="fonte" />}
                />
                <PolarGrid gridType="circle" />
                <RadialBar dataKey="kwh" />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Text */}
        <Card id="text" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Radial Chart — Text</CardTitle>
            <CardDescription>Total no centro</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadialBarChart
                data={SINGLE}
                startAngle={0}
                endAngle={250}
                innerRadius={80}
                outerRadius={110}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-bg-muted last:fill-bg-surface"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="kwh" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  {centerLabel(SINGLE[0].kwh.toLocaleString("pt-BR"), "kWh")}
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Shape */}
        <Card id="shape" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Radial Chart — Shape</CardTitle>
            <CardDescription>Medidor (gauge)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadialBarChart
                data={SINGLE}
                endAngle={100}
                innerRadius={80}
                outerRadius={140}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-bg-muted last:fill-bg-surface"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="kwh" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  {centerLabel(SINGLE[0].kwh.toLocaleString("pt-BR"), "kWh")}
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Stacked */}
        <Card id="stacked" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Radial Chart — Stacked</CardTitle>
            <CardDescription>Gerada + consumida</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 items-center pb-0">
            <ChartContainer
              config={configStack}
              className="mx-auto aspect-square w-full max-w-[250px]"
            >
              <RadialBarChart
                data={STACK}
                endAngle={180}
                innerRadius={80}
                outerRadius={130}
              >
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  {centerLabel(STACK_TOTAL.toLocaleString("pt-BR"), "kWh totais")}
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="gerada"
                  stackId="a"
                  cornerRadius={5}
                  fill="var(--color-gerada)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="consumida"
                  stackId="a"
                  cornerRadius={5}
                  fill="var(--color-consumida)"
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-gp-2xs text-caption-sm">
            <div className="flex items-center gap-gp-sm font-medium text-fg-default">
              Alta de 5,2% neste mês <TrendingUp className="size-icon-xs" />
            </div>
            <div className="text-fg-muted">Junho 2024</div>
          </CardFooter>
        </Card>
      </div>
    </DocLayout>
  );
}
