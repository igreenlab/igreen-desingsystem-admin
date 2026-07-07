import type { LucideIcon } from "@/lib/lucide-types";
import { Users, Rocket, Network, ChevronRight } from "lucide-react";
import { SectionCard, LegendDot } from "../../painel-v2/_ui";
import { leader, fmt } from "../../painel/painel-mock";

type Seg = { id: string; label: string; value: number; colorClass: string };

/** Linha clicável estilo "Total earning" (ícone + label + sub + valor → drill). */
function MetricRow({
  icon: Icon,
  label,
  sub,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group -mx-pad-md flex items-center gap-gp-md rounded-radius-base px-pad-md py-pad-md text-left transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
    >
      <span className="grid size-comp-xl place-items-center rounded-radius-base bg-bg-muted text-fg-muted">
        <Icon className="size-icon-sm" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium text-fg-default">
          {label}
        </span>
        <span className="block text-caption-sm text-fg-muted">{sub}</span>
      </span>
      <span className="text-body-xs font-semibold tabular-nums text-fg-default">
        {value}
      </span>
      <ChevronRight className="size-icon-sm shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export function NetworkHealth({
  onDrill,
  className,
}: {
  onDrill: (id: string) => void;
  className?: string;
}) {
  const c = leader.kpis.clientesAtivos;
  const total = c.green + c.tel + c.seg || 1;
  const segs: Seg[] = [
    {
      id: "seg-energia",
      label: "Energia",
      value: c.green,
      colorClass: "bg-chart-1",
    },
    {
      id: "seg-telecom",
      label: "Telecom",
      value: c.tel,
      colorClass: "bg-chart-4",
    },
    {
      id: "seg-seguros",
      label: "Seguros",
      value: c.seg,
      colorClass: "bg-chart-2",
    },
  ];

  return (
    <SectionCard
      title="Saúde da rede"
      subtitle="clientes e licenciados ativos"
      className={className}
    >
      {/* Herói: clientes ativos + barra de segmentos clicável */}
      <div className="flex flex-col gap-gp-md">
        <div className="flex items-baseline gap-gp-sm">
          <span className="text-heading-sm font-bold tabular-nums text-fg-default">
            {fmt(c.total)}
          </span>
          <span className="text-caption-md text-fg-muted">clientes ativos</span>
        </div>
        <div className="flex h-[8px] gap-[2px] overflow-hidden rounded-radius-full bg-bg-muted">
          {segs.map((s) => (
            <span
              key={s.id}
              className={s.colorClass}
              style={{ flex: s.value }}
              aria-hidden
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-gp-lg">
          {segs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onDrill(s.id)}
              className="rounded-radius-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
            >
              <LegendDot colorClass={s.colorClass}>
                {s.label}{" "}
                <span className="font-medium text-fg-default">
                  {fmt(s.value)}
                </span>
                <span className="text-fg-subtle">
                  {" "}
                  · {Math.round((s.value / total) * 100)}%
                </span>
              </LegendDot>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de métricas clicáveis (estilo Total earning) */}
      <div className="flex flex-col border-t border-border-subtle pt-gp-sm">
        <MetricRow
          icon={Users}
          label="Licenciados Green"
          sub="ativos na meta"
          value={`${leader.kpis.licGreen.atual}/${leader.kpis.licGreen.meta}`}
          onClick={() => onDrill("lic-green")}
        />
        <MetricRow
          icon={Rocket}
          label="Diretos PRO"
          sub="viraram PRO este mês"
          value={fmt(leader.kpis.diretosProMes)}
          onClick={() => onDrill("diretos-pro")}
        />
        <MetricRow
          icon={Network}
          label="Rede total"
          sub="142 ativos · 14 inativos"
          value="156"
          onClick={() => onDrill("rede-total")}
        />
      </div>
    </SectionCard>
  );
}
