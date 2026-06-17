/**
 * Exemplo distribuível — Dashboard (KPIs + gráfico).
 * Puxe: npm run igreen:add -- example-dashboard  (traz chart + card + page-header + badge)
 * Renderize <DashboardScreen />. Referência pra dashboards (KPI + chart).
 */
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/Chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { PageHeader } from "@/components/ui/PageHeader";

const SERIES = [
  { month: "Jan", receita: 32000, meta: 30000 },
  { month: "Fev", receita: 41000, meta: 35000 },
  { month: "Mar", receita: 38500, meta: 38000 },
  { month: "Abr", receita: 52000, meta: 42000 },
  { month: "Mai", receita: 61000, meta: 48000 },
  { month: "Jun", receita: 58000, meta: 52000 },
];

const config = {
  receita: { label: "Receita", color: "var(--color-chart-1)" },
  meta: { label: "Meta", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

const KPIS = [
  { label: "Receita (mês)", value: "R$ 58.000", trend: "+12%", color: "success" as const },
  { label: "Novos clientes", value: "184", trend: "+8%", color: "success" as const },
  { label: "Churn", value: "2,1%", trend: "-0,3%", color: "warning" as const },
];

export function DashboardScreen() {
  return (
    <div className="min-h-screen bg-bg-canvas p-sp-xl flex flex-col gap-gp-lg">
      <PageHeader title="Dashboard" description="Exemplo @igreen/example-dashboard — KPIs + gráfico (Chart)." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gp-md">
        {KPIS.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-caption-md text-fg-muted uppercase tracking-wider">{k.label}</CardTitle>
              <Badge color={k.color} variant="soft">{k.trend}</Badge>
            </CardHeader>
            <CardContent className="text-display-md font-semibold text-fg-default">{k.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Receita vs Meta</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-[280px] w-full">
            <AreaChart data={SERIES} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="meta" type="monotone" fill="var(--color-meta)" fillOpacity={0.15} stroke="var(--color-meta)" />
              <Area dataKey="receita" type="monotone" fill="var(--color-receita)" fillOpacity={0.25} stroke="var(--color-receita)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardScreen;
