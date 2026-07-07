import { SectionCard, StackBar, MiniStat } from "../_ui";
import { leader, fmt } from "../../painel/painel-mock";

export function NetworkHealth({ className }: { className?: string }) {
  const c = leader.kpis.clientesAtivos;
  return (
    <SectionCard
      title="Saúde da rede"
      subtitle="clientes e licenciados ativos"
      className={className}
    >
      <div className="flex flex-col gap-gp-xs">
        <span className="text-caption-md text-fg-muted">Clientes ativos</span>
        <span className="text-heading-sm font-bold tabular-nums text-fg-default">
          {fmt(c.total)}
        </span>
      </div>

      <StackBar
        segments={[
          { label: "Energia", value: c.green, colorClass: "bg-chart-1" },
          { label: "Telecom", value: c.tel, colorClass: "bg-chart-4" },
          { label: "Seguros", value: c.seg, colorClass: "bg-chart-2" },
        ]}
      />

      <div className="mt-auto grid grid-cols-2 gap-gp-md border-t border-border-subtle pt-gp-lg">
        <MiniStat
          label="Licenciados Green"
          value={`${leader.kpis.licGreen.atual}/${leader.kpis.licGreen.meta}`}
        />
        <MiniStat
          label="Diretos PRO (mês)"
          value={fmt(leader.kpis.diretosProMes)}
        />
      </div>
    </SectionCard>
  );
}
