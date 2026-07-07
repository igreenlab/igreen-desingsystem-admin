import { CircleCheck, Users, Rocket, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { Kpi, KpiGroup } from "@/components/ui/Kpi";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { Card } from "../_ui";
import { leader, growthSeries, fmt, brl } from "../painel-mock";

const chartConfig = {
  gp: { label: "GP", color: "var(--color-chart-1)" },
  gi: { label: "GI", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

function Volume({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-caption-md uppercase tracking-wide text-fg-muted">
        {label}
      </span>
      <span className="text-title-md font-semibold text-fg-default">
        {fmt(value)}
      </span>
    </div>
  );
}

export function IdentityHeader() {
  const k = leader.kpis;
  return (
    <Card className="flex flex-col gap-gp-2xl">
      {/* Identidade + prévia de bônus */}
      <div className="flex flex-wrap items-start justify-between gap-gp-lg">
        <div className="flex items-center gap-gp-md">
          <Avatar color="brand" size="xl" aria-label={leader.name}>
            {leader.initials}
          </Avatar>
          <div>
            <h1 className="text-heading-xs font-semibold text-fg-default">
              {leader.name}
            </h1>
            <Chip
              color="success"
              variant="soft"
              size="sm"
              className="mt-gp-2xs"
            >
              {leader.graduation}
            </Chip>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-heading-xs font-bold text-fg-success">
            {brl(leader.bonusPreview)}
          </span>
          <span className="text-caption-md uppercase tracking-wide text-fg-muted">
            Prévia de bônus
          </span>
        </div>
      </div>

      {/* Volumes + tendência */}
      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-gp-5xl">
          <Volume label="Bonif. GP" value={leader.volumes.gpBonificavel} />
          <Volume label="Qualificável" value={leader.volumes.qualificavel} />
          <Volume label="Bonif. GI" value={leader.volumes.giBonificavel} />
        </div>

        <div className="min-w-0 lg:w-[280px]">
          <div className="mb-gp-2xs flex items-center justify-between">
            <span className="text-caption-md uppercase tracking-wide text-fg-muted">
              Evolução (6 meses)
            </span>
            <span className="flex items-center gap-gp-sm text-caption-sm text-fg-muted">
              <span className="flex items-center gap-gp-2xs">
                <span className="size-2 rounded-full bg-chart-1" /> GP
              </span>
              <span className="flex items-center gap-gp-2xs">
                <span className="size-2 rounded-full bg-chart-4" /> GI
              </span>
            </span>
          </div>
          <ChartContainer config={chartConfig} className="h-[72px] w-full">
            <AreaChart
              data={growthSeries}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="fillGp" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-gp)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-gp)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="fillGi" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-gi)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-gi)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                hide
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="gi"
                type="monotone"
                stroke="var(--color-gi)"
                fill="url(#fillGi)"
                strokeWidth={2}
              />
              <Area
                dataKey="gp"
                type="monotone"
                stroke="var(--color-gp)"
                fill="url(#fillGp)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      {/* KPIs */}
      <KpiGroup columns={5} divided>
        <Kpi
          label="Clientes Ativos"
          value={fmt(k.clientesAtivos.total)}
          icon={<CircleCheck />}
          tone="success"
          hint={`Green ${k.clientesAtivos.green} · Tel ${k.clientesAtivos.tel} · Seg ${k.clientesAtivos.seg}`}
        />
        <Kpi
          label="Lic. Green"
          value={`${k.licGreen.atual}/${k.licGreen.meta}`}
          icon={<Users />}
          tone="neutral"
        />
        <Kpi
          label="Diretos PRO (mês)"
          value={fmt(k.diretosProMes)}
          icon={<Rocket />}
          tone="neutral"
        />
        <Kpi
          label="GP Mês"
          value={k.gpMes}
          icon={<TrendingUp />}
          tone="success"
        />
        <Kpi
          label="GI Mês"
          value={k.giMes}
          icon={<TrendingUp />}
          tone="success"
        />
      </KpiGroup>
    </Card>
  );
}
