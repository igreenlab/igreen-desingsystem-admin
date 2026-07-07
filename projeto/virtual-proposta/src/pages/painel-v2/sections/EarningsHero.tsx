import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Chip } from "@/components/ui/Chip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { SectionCard, LegendDot, MiniStat } from "../_ui";
import { leader, growthSeries, brl } from "../../painel/painel-mock";

const chartConfig = {
  gp: { label: "GP", color: "var(--color-chart-1)" },
  gi: { label: "GI", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

export function EarningsHero({ className }: { className?: string }) {
  return (
    <SectionCard
      title="Ganhos do mês"
      subtitle="Prévia de bônus e evolução da rede"
      className={className}
      action={
        <span className="flex items-center gap-gp-md">
          <LegendDot colorClass="bg-chart-1">GP</LegendDot>
          <LegendDot colorClass="bg-chart-4">GI</LegendDot>
        </span>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-gp-lg">
        <div className="flex items-baseline gap-gp-md">
          <span className="text-heading-sm font-bold tabular-nums text-fg-default">
            {brl(leader.bonusPreview)}
          </span>
          <Chip color="success" variant="soft" size="sm">
            prévia de bônus
          </Chip>
        </div>
        <div className="flex flex-wrap gap-gp-4xl">
          <MiniStat
            label="Bonif. GP"
            value={leader.volumes.gpBonificavel.toLocaleString("pt-BR")}
          />
          <MiniStat
            label="Qualificável"
            value={leader.volumes.qualificavel.toLocaleString("pt-BR")}
          />
          <MiniStat
            label="Bonif. GI"
            value={leader.volumes.giBonificavel.toLocaleString("pt-BR")}
          />
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <AreaChart
          data={growthSeries}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="v2FillGp" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-gp)"
                stopOpacity={0.28}
              />
              <stop offset="100%" stopColor="var(--color-gp)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="v2FillGi" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-gi)"
                stopOpacity={0.28}
              />
              <stop offset="100%" stopColor="var(--color-gi)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="gi"
            type="monotone"
            stroke="var(--color-gi)"
            fill="url(#v2FillGi)"
            strokeWidth={2}
          />
          <Area
            dataKey="gp"
            type="monotone"
            stroke="var(--color-gp)"
            fill="url(#v2FillGp)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </SectionCard>
  );
}
