import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Label, LabelList, Pie, PieChart, Sector } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/shadcn/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/shadcn/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../components/ui/Chart";
import { DocLayout, DocHeader, DocSeparator } from "../components";

/* ── Mock (domínio iGreen: geração por fonte, kWh) ──────────────────── */
// Paleta monocromática da brand: tons do verde (claro → escuro) derivados do
// chart-1 (= primitive da brand) via color-mix. Acompanha mudanças da marca e
// evita o visual "carnaval" de 5 hues distintos.
const BRAND_SHADES = [
  "var(--color-chart-1)", // brand
  "color-mix(in oklch, var(--color-chart-1) 90%, black)",
  "color-mix(in oklch, var(--color-chart-1) 80%, black)",
  "color-mix(in oklch, var(--color-chart-1) 70%, black)",
  "color-mix(in oklch, var(--color-chart-1) 60%, black)", // escuro
];

const FONTES = [
  { fonte: "solar", kwh: 275, fill: BRAND_SHADES[0] },
  { fonte: "eolica", kwh: 200, fill: BRAND_SHADES[1] },
  { fonte: "hidrica", kwh: 287, fill: BRAND_SHADES[2] },
  { fonte: "biomassa", kwh: 173, fill: BRAND_SHADES[3] },
  { fonte: "outros", kwh: 190, fill: BRAND_SHADES[4] },
];

const TOTAL = FONTES.reduce((s, f) => s + f.kwh, 0);

const config = {
  kwh: { label: "kWh" },
  solar: { label: "Solar", color: BRAND_SHADES[0] },
  eolica: { label: "Eólica", color: BRAND_SHADES[1] },
  hidrica: { label: "Hídrica", color: BRAND_SHADES[2] },
  biomassa: { label: "Biomassa", color: BRAND_SHADES[3] },
  outros: { label: "Outros", color: BRAND_SHADES[4] },
} satisfies ChartConfig;

// Ring secundária (ano anterior) — usada no Stacked
const FONTES_2023 = [
  { fonte: "solar", kwh: 240, fill: BRAND_SHADES[0] },
  { fonte: "eolica", kwh: 180, fill: BRAND_SHADES[1] },
  { fonte: "hidrica", kwh: 260, fill: BRAND_SHADES[2] },
  { fonte: "biomassa", kwh: 150, fill: BRAND_SHADES[3] },
  { fonte: "outros", kwh: 165, fill: BRAND_SHADES[4] },
];

const PIE_CLASS = "mx-auto aspect-square max-h-[250px] [&_.recharts-pie-label-text]:fill-fg-default";

// recharts 3 não exporta publicamente o tipo do setor; as props são repassadas
// direto ao <Sector>, então tipamos de forma frouxa.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PieSectorShape = any;

const TOC = [
  { id: "default", label: "Default" },
  { id: "separator-none", label: "Separator None" },
  { id: "label", label: "Label" },
  { id: "custom-label", label: "Custom Label" },
  { id: "label-list", label: "Label List" },
  { id: "legend", label: "Legend" },
  { id: "donut", label: "Donut" },
  { id: "donut-active", label: "Donut Active" },
  { id: "donut-text", label: "Donut with Text" },
  { id: "stacked", label: "Stacked" },
  { id: "interactive", label: "Interactive" },
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

// Texto central reutilizável (Donut with Text / Interactive)
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

export function PieChartDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Pie Chart"
        description="Gráficos de pizza sobre o Recharts, com a paleta e o tooltip/legenda do iGreen DS."
        dependency="recharts"
      />
      <DocSeparator />

      {/* Interactive em destaque no topo */}
      <Card id="interactive" className="mb-gp-2xl">
        <InteractivePieChart />
      </Card>

      <div className="grid gap-gp-2xl md:grid-cols-2">
        {/* Default */}
        <Card id="default" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart</CardTitle>
            <CardDescription>Geração por fonte (kWh)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={PIE_CLASS}>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={FONTES} dataKey="kwh" nameKey="fonte" />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Separator None */}
        <Card id="separator-none" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Separator None</CardTitle>
            <CardDescription>Sem separador entre fatias</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={PIE_CLASS}>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={FONTES} dataKey="kwh" nameKey="fonte" stroke="0" />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Label */}
        <Card id="label" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Label</CardTitle>
            <CardDescription>Valor por fatia</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={PIE_CLASS}>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={FONTES} dataKey="kwh" nameKey="fonte" label />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Custom Label */}
        <Card id="custom-label" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Custom Label</CardTitle>
            <CardDescription>Rótulo dentro da fatia</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={config}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-fg-on-brand"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="kwh" hideLabel />}
                />
                <Pie
                  data={FONTES}
                  dataKey="kwh"
                  nameKey="fonte"
                  labelLine={false}
                  label={(props: PieSectorShape) => {
                    const RADIAN = Math.PI / 180;
                    const r =
                      props.innerRadius + (props.outerRadius - props.innerRadius) * 0.5;
                    const x = props.cx + r * Math.cos(-props.midAngle * RADIAN);
                    const y = props.cy + r * Math.sin(-props.midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                      >
                        {props.payload.kwh}
                      </text>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Label List */}
        <Card id="label-list" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Label List</CardTitle>
            <CardDescription>Nome + valor por fatia</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={config}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-fg-on-brand"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="fonte" hideLabel />}
                />
                <Pie data={FONTES} dataKey="kwh" nameKey="fonte">
                  <LabelList
                    dataKey="fonte"
                    className="fill-fg-on-brand"
                    stroke="none"
                    fontSize={11}
                    formatter={(v) => config[v as keyof typeof config]?.label as string}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Legend */}
        <Card id="legend" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Legend</CardTitle>
            <CardDescription>Com legenda</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={config}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <Pie data={FONTES} dataKey="kwh" nameKey="fonte" />
                <ChartLegend
                  content={<ChartLegendContent nameKey="fonte" />}
                  className="-translate-y-2 flex-wrap gap-gp-sm *:basis-1/4 *:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut */}
        <Card id="donut" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Donut</CardTitle>
            <CardDescription>Com raio interno</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={PIE_CLASS}>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={FONTES} dataKey="kwh" nameKey="fonte" innerRadius={60} />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Donut Active */}
        <Card id="donut-active" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Donut Active</CardTitle>
            <CardDescription>Fatia de destaque</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={PIE_CLASS}>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={FONTES}
                  dataKey="kwh"
                  nameKey="fonte"
                  innerRadius={60}
                  strokeWidth={5}
                  shape={(props: PieSectorShape, index: number) => (
                    <Sector
                      {...props}
                      outerRadius={props.outerRadius + (index === 2 ? 10 : 0)}
                    />
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Donut with Text */}
        <Card id="donut-text" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Donut with Text</CardTitle>
            <CardDescription>Total no centro</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={PIE_CLASS}>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={FONTES}
                  dataKey="kwh"
                  nameKey="fonte"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {centerLabel(TOTAL.toLocaleString("pt-BR"), "kWh gerados")}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>

        {/* Stacked */}
        <Card id="stacked" className="flex flex-col">
          <CardHeader className="items-center pb-0 text-center">
            <CardTitle>Pie Chart — Stacked</CardTitle>
            <CardDescription>2024 (interno) vs. 2023 (externo)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={config} className={PIE_CLASS}>
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="fonte" />}
                />
                <Pie data={FONTES} dataKey="kwh" nameKey="fonte" outerRadius={60} />
                <Pie
                  data={FONTES_2023}
                  dataKey="kwh"
                  nameKey="fonte"
                  innerRadius={70}
                  outerRadius={90}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <TrendFooter />
        </Card>
      </div>
    </DocLayout>
  );
}

/* ── Interactive (Select de fonte → fatia ativa + texto central) ────── */
function InteractivePieChart() {
  const [active, setActive] = useState(FONTES[0].fonte);
  const activeIndex = useMemo(
    () => FONTES.findIndex((f) => f.fonte === active),
    [active],
  );

  return (
    <>
      <CardHeader className="flex flex-row items-start gap-gp-md space-y-0 pb-0">
        <div className="grid gap-gp-2xs">
          <CardTitle>Pie Chart — Interativo</CardTitle>
          <CardDescription>Geração por fonte (kWh)</CardDescription>
        </div>
        <Select value={active} onValueChange={setActive}>
          <SelectTrigger className="ml-auto h-min-form-md w-[150px] rounded-radius-lg pl-pad-2xl">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-radius-lg">
            {FONTES.map((f) => (
              <SelectItem key={f.fonte} value={f.fonte} className="rounded-radius-sm [&_span]:flex">
                <div className="flex items-center gap-gp-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: f.fill }}
                  />
                  {config[f.fonte as keyof typeof config]?.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={FONTES}
              dataKey="kwh"
              nameKey="fonte"
              innerRadius={60}
              strokeWidth={5}
              shape={(props: PieSectorShape, index: number) => {
                if (index !== activeIndex) return <Sector {...props} />;
                const { outerRadius } = props;
                return (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                );
              }}
            >
              {centerLabel(
                FONTES[activeIndex].kwh.toLocaleString("pt-BR"),
                "kWh",
              )}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}
