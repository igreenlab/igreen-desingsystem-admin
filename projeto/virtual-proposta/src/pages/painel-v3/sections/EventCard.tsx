import { Ticket, ArrowRight } from "lucide-react";
import { Pie, PieChart, Cell, Label } from "recharts";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { SectionCard } from "../../painel-v2/_ui";
import { events, brl, fmt } from "../../painel/painel-mock";

const comIngresso = events.ingressosVendidos - events.confirmados;

// Donut de adesão (ref: Budget Breakdown do DS). Soma das fatias = convidados.
const DONUT = [
  {
    key: "confirmados",
    value: events.confirmados,
    fill: "var(--color-chart-1)",
  },
  { key: "ingresso", value: comIngresso, fill: "var(--color-chart-4)" },
  { key: "sem", value: events.semIngresso, fill: "var(--color-bg-muted)" },
];
const stackConfig = {
  confirmados: { label: "Confirmados", color: "var(--color-chart-1)" },
  ingresso: { label: "Com ingresso", color: "var(--color-chart-4)" },
  sem: { label: "Sem ingresso", color: "var(--color-bg-muted)" },
} satisfies ChartConfig;

const pct = (n: number) =>
  `${Math.round((n / (events.convidados || 1)) * 100)}%`;

const ROWS = [
  {
    label: "Confirmados",
    value: fmt(events.confirmados),
    share: pct(events.confirmados),
    color: "var(--color-chart-1)",
  },
  {
    label: "Ingressos vendidos",
    value: brl(events.valorIngressos),
    share: `${events.ingressosVendidos}`,
    color: "var(--color-chart-4)",
  },
  {
    label: "Check-ins",
    value: fmt(events.checkins),
    share: pct(events.checkins),
    color: "var(--color-fg-subtle)",
  },
  {
    label: "Sem ingresso",
    value: fmt(events.semIngresso),
    share: pct(events.semIngresso),
    color: "var(--color-bg-muted)",
  },
];

/** Label central do donut — total de convidados. */
function CenterLabel() {
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
                y={cy - 6}
                fontSize={26}
                className="fill-fg-default font-bold [font-variant-numeric:tabular-nums]"
              >
                {fmt(events.convidados)}
              </tspan>
              <tspan x={cx} y={cy + 16} fontSize={12} className="fill-fg-muted">
                convidados
              </tspan>
            </text>
          );
        }
        return null;
      }}
    />
  );
}

export function EventCard({ className }: { className?: string }) {
  return (
    <SectionCard
      title={events.nome}
      subtitle="evento ativo · resultados em tempo real"
      className={className}
      action={
        <Chip color="success" variant="soft" size="sm">
          termina em {events.terminaEmDias}d
        </Chip>
      }
    >
      {/* Donut de adesão (centro = total de convidados). */}
      <ChartContainer
        config={stackConfig}
        className="mx-auto h-[200px] w-full max-w-[260px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="key" />}
          />
          <Pie
            data={DONUT}
            dataKey="value"
            nameKey="key"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="var(--color-bg-surface)"
            strokeWidth={2}
          >
            {DONUT.map((d) => (
              <Cell key={d.key} fill={d.fill} />
            ))}
            <CenterLabel />
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Lista de resultados — cresce pra preencher a altura do card */}
      <div className="flex flex-1 flex-col justify-center">
        {ROWS.map((r) => (
          <div
            key={r.label}
            className="flex items-center gap-gp-md border-b border-border-subtle py-pad-md last:border-0"
          >
            <span
              className="h-[16px] w-[3px] shrink-0 rounded-radius-full"
              style={{ background: r.color }}
            />
            <span className="flex-1 text-body-sm font-medium text-fg-default">
              {r.label}
            </span>
            <span className="text-body-sm font-semibold tabular-nums text-fg-default">
              {r.value}
            </span>
            <Chip color="neutral" variant="soft" size="sm" shape="pill">
              {r.share}
            </Chip>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-radius-base bg-bg-danger-muted px-pad-lg py-pad-md">
        <span className="text-body-sm font-medium text-fg-danger">
          {fmt(events.semIngresso)} ainda sem ingresso
        </span>
        <span className="text-caption-sm text-fg-danger/80">
          mobilize a rede
        </span>
      </div>

      <Button
        variant="soft"
        color="primary"
        size="sm"
        iconLeft={<Ticket />}
        iconRight={<ArrowRight />}
        className="w-full"
      >
        Ver detalhes e promover
      </Button>
    </SectionCard>
  );
}
