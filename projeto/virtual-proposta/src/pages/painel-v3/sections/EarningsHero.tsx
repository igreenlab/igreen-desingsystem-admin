import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Chip } from "@/components/ui/Chip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { cn } from "@/lib/utils";
import { SectionCard, LegendDot } from "../../painel-v2/_ui";
import { leader, growthSeries, brl } from "../../painel/painel-mock";

const chartConfig = {
  gp: { label: "GP", color: "var(--color-chart-1)" },
  gi: { label: "GI", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

const volumes = [
  { label: "Bonif. GP", value: leader.volumes.gpBonificavel },
  { label: "Qualificável", value: leader.volumes.qualificavel },
  { label: "Bonif. GI", value: leader.volumes.giBonificavel },
];

export function EarningsHero({ className }: { className?: string }) {
  return (
    <SectionCard
      title="Ganhos do mês"
      subtitle="Prévia de bônus e evolução da rede"
      className={cn("h-full", className)}
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

        {/* Volumes com divisor entre eles */}
        <div className="flex divide-x divide-border-subtle">
          {volumes.map((v) => (
            <div
              key={v.label}
              className="flex flex-col px-pad-3xl first:pl-0 last:pr-0"
            >
              <span className="text-caption-md text-fg-muted">{v.label}</span>
              <span className="text-title-md font-semibold tabular-nums text-fg-default">
                {v.value.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico preenche só o espaço que sobra. A altura da linha é ditada pelo
          card "Saúde da rede" (conteúdo natural). O ChartContainer tem `aspect-video`
          embutido (impõe altura pela largura) — por isso o gráfico vai ABSOLUTO num
          wrapper flex-1, saindo do fluxo: não estica o card, só preenche o vazio.
          Piso de 180px pro mobile (empilhado, sem stretch). */}
      <div className="relative min-h-[180px] flex-1">
        <div className="absolute inset-0">
          <ChartContainer
            config={chartConfig}
            className="!aspect-auto h-full w-full"
          >
            <AreaChart
              data={growthSeries}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="v3FillGp" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-gp)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-gp)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="v3FillGi" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-gi)"
                    stopOpacity={0.28}
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
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="gi"
                type="monotone"
                stroke="var(--color-gi)"
                fill="url(#v3FillGi)"
                strokeWidth={2}
              />
              <Area
                dataKey="gp"
                type="monotone"
                stroke="var(--color-gp)"
                fill="url(#v3FillGp)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </SectionCard>
  );
}
