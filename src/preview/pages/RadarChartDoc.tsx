import { TrendingUp, Sun, Zap } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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

/* ── Mock (domínio iGreen: energia kWh por mês) ─────────────────────── */
const DATA = [
  { month: "Jan", gerada: 186, consumida: 80 },
  { month: "Fev", gerada: 305, consumida: 200 },
  { month: "Mar", gerada: 237, consumida: 120 },
  { month: "Abr", gerada: 273, consumida: 190 },
  { month: "Mai", gerada: 209, consumida: 130 },
  { month: "Jun", gerada: 214, consumida: 140 },
];

const config = {
  gerada: { label: "Gerada", color: "var(--color-chart-1)" },
  consumida: { label: "Consumida", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

const configIcons = {
  gerada: { label: "Gerada", color: "var(--color-chart-1)", icon: Sun },
  consumida: { label: "Consumida", color: "var(--color-chart-4)", icon: Zap },
} satisfies ChartConfig;

const CHART_CLASS = "mx-auto aspect-square max-h-[250px]";

const TOC = [
  { id: "default", label: "Default" },
  { id: "dots", label: "Dots" },
  { id: "multiple", label: "Multiple" },
  { id: "lines-only", label: "Lines Only" },
  { id: "custom-label", label: "Custom Label" },
  { id: "radius-axis", label: "Radius Axis" },
  { id: "grid-filled", label: "Grid Filled" },
  { id: "grid-none", label: "Grid None" },
  { id: "grid-circle", label: "Grid Circle" },
  { id: "grid-circle-no-lines", label: "Grid Circle — No Lines" },
  { id: "grid-circle-filled", label: "Grid Circle Filled" },
  { id: "legend", label: "Legend" },
  { id: "icons", label: "Icons" },
];

function TrendFooter() {
  return (
    <CardFooter className="flex-col gap-gp-2xs text-caption-sm">
      <div className="flex items-center gap-gp-sm font-medium text-fg-default">
        Alta de 5,2% neste mês <TrendingUp className="size-icon-xs" />
      </div>
      <div className="text-fg-muted">Janeiro – Junho 2024</div>
    </CardFooter>
  );
}

export function RadarChartDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Radar Chart"
        description="Gráficos de radar sobre o Recharts, com a paleta e o tooltip/legenda do iGreen DS."
        dependency="recharts"
      />
      <DocSeparator />

      <div className="grid gap-gp-2xl md:grid-cols-2">
        {/* Default */}
        <Card id="default" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart</CardTitle>
            <CardDescription>Energia gerada por mês (kWh)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarAngleAxis dataKey="month" />
                <PolarGrid />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Dots */}
        <Card id="dots" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Dots</CardTitle>
            <CardDescription>Vértices visíveis</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarAngleAxis dataKey="month" />
                <PolarGrid />
                <Radar
                  dataKey="gerada"
                  fill="var(--color-gerada)"
                  fillOpacity={0.6}
                  dot={{ r: 4, fillOpacity: 1 }}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Multiple */}
        <Card id="multiple" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Multiple</CardTitle>
            <CardDescription>Gerada vs. consumida</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <PolarAngleAxis dataKey="month" />
                <PolarGrid />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
                <Radar dataKey="consumida" fill="var(--color-consumida)" fillOpacity={0.5} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-gp-2xs text-caption-sm">
            <div className="flex items-center gap-gp-sm font-medium text-fg-default">
              Alta de 5,2% neste mês <TrendingUp className="size-icon-xs" />
            </div>
            <div className="text-fg-muted">Janeiro – Junho 2024</div>
          </CardFooter>
        </Card>

        {/* Lines Only */}
        <Card id="lines-only" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Lines Only</CardTitle>
            <CardDescription>Sem preenchimento</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <PolarAngleAxis dataKey="month" />
                <PolarGrid radialLines={false} />
                <Radar
                  dataKey="gerada"
                  fill="var(--color-gerada)"
                  fillOpacity={0}
                  stroke="var(--color-gerada)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="consumida"
                  fill="var(--color-consumida)"
                  fillOpacity={0}
                  stroke="var(--color-consumida)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Custom Label */}
        <Card id="custom-label" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Custom Label</CardTitle>
            <CardDescription>Mês + valor no eixo</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart
                data={DATA}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarAngleAxis
                  dataKey="month"
                  tick={({ x, y, textAnchor, index, ...props }: RadarTickProps) => {
                    const d = DATA[index];
                    return (
                      <text
                        x={x}
                        y={index === 0 ? y - 10 : y}
                        textAnchor={textAnchor}
                        fontSize={11}
                        {...props}
                      >
                        <tspan className="fill-fg-muted">{d.gerada}</tspan>
                        <tspan x={x} dy={"1rem"} className="fill-fg-default font-medium">
                          {d.month}
                        </tspan>
                      </text>
                    );
                  }}
                />
                <PolarGrid />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Radius Axis */}
        <Card id="radius-axis" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Radius Axis</CardTitle>
            <CardDescription>Com eixo radial</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarAngleAxis dataKey="month" />
                <PolarRadiusAxis angle={90} />
                <PolarGrid />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Grid Filled */}
        <Card id="grid-filled" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Grid Filled</CardTitle>
            <CardDescription>Grade preenchida</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarGrid className="fill-[var(--color-gerada)] opacity-20" />
                <PolarAngleAxis dataKey="month" />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.5} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Grid None */}
        <Card id="grid-none" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Grid None</CardTitle>
            <CardDescription>Sem grade</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarAngleAxis dataKey="month" />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Grid Circle */}
        <Card id="grid-circle" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Grid Circle</CardTitle>
            <CardDescription>Grade circular</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarGrid gridType="circle" />
                <PolarAngleAxis dataKey="month" />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Grid Circle — No Lines */}
        <Card id="grid-circle-no-lines" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Grid Circle, No Lines</CardTitle>
            <CardDescription>Círculo sem raios</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarGrid gridType="circle" radialLines={false} />
                <PolarAngleAxis dataKey="month" />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Grid Circle Filled */}
        <Card id="grid-circle-filled" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Grid Circle Filled</CardTitle>
            <CardDescription>Círculo preenchido</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={CHART_CLASS}>
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  className="fill-[var(--color-gerada)] opacity-20"
                />
                <PolarAngleAxis dataKey="month" />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.5} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Legend */}
        <Card id="legend" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Legend</CardTitle>
            <CardDescription>Com legenda</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px]">
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <PolarAngleAxis dataKey="month" />
                <PolarGrid />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
                <Radar dataKey="consumida" fill="var(--color-consumida)" fillOpacity={0.5} />
                <ChartLegend className="mt-gp-md" content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Icons */}
        <Card id="icons" className="flex flex-col">
          <CardHeader className="items-center pb-pad-2xl text-center">
            <CardTitle>Radar Chart — Icons</CardTitle>
            <CardDescription>Legenda com ícones</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={configIcons} className="mx-auto aspect-square max-h-[280px]">
              <RadarChart data={DATA}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <PolarAngleAxis dataKey="month" />
                <PolarGrid />
                <Radar dataKey="gerada" fill="var(--color-gerada)" fillOpacity={0.6} />
                <Radar dataKey="consumida" fill="var(--color-consumida)" fillOpacity={0.5} />
                <ChartLegend className="mt-gp-md" content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </DocLayout>
  );
}

/* tick custom do PolarAngleAxis — recharts não exporta o tipo publicamente */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RadarTickProps = any;
