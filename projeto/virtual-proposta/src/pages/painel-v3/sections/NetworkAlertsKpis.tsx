import type { LucideIcon } from "@/lib/lucide-types";
import {
  UserX,
  TriangleAlert,
  TrendingDown,
  Users,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { alerts, fmt } from "../../painel/painel-mock";
import { licenciadosNaRede, novosHoje } from "../v3-mock";

type Tone = "danger" | "warning" | "neutral";

function KpiCell({
  icon: Icon,
  count,
  label,
  hint,
  tone,
  onClick,
}: {
  icon: LucideIcon;
  count: number;
  label: string;
  hint: string;
  tone: Tone;
  onClick: () => void;
}) {
  // Destaque só pro Inativos (danger ativo): ícone + valor vermelhos. Resto neutro.
  const highlight = tone === "danger" && count > 0;
  const iconBox = highlight
    ? "bg-bg-danger-muted text-fg-danger"
    : "bg-bg-muted text-fg-default";
  const valueColor = highlight ? "text-fg-danger" : "text-fg-default";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-[2px] p-pad-3xl text-left transition-colors first:rounded-l-radius-xl last:rounded-r-radius-xl hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring-brand"
    >
      <div className="flex items-start justify-between gap-gp-md">
        <p className="text-title-sm font-semibold text-fg-default">{label}</p>
        <span
          className={cn(
            "grid size-form-lg shrink-0 place-items-center rounded-radius-full",
            iconBox,
          )}
        >
          <Icon className="size-icon-sm" aria-hidden />
        </span>
      </div>
      <p
        className={cn(
          "text-stat-md font-bold leading-tight tabular-nums",
          valueColor,
        )}
      >
        {fmt(count)}
      </p>
      <p className="text-caption-md text-fg-muted">{hint}</p>
    </button>
  );
}

/** Faixa de "ação necessária" — kpi/row (card único com divisores). */
export function NetworkAlertsKpis({
  onInativos,
  onDrill,
}: {
  onInativos: () => void;
  onDrill: (id: string) => void;
}) {
  return (
    <section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
      <div className="grid grid-cols-1 divide-y divide-border-subtle lg:grid-cols-5 lg:divide-y-0 [&>button]:border-border-subtle lg:[&>button]:border-l lg:[&>button:first-child]:border-l-0">
        <KpiCell
          icon={UserX}
          count={alerts.inativos.count}
          label="Inativos"
          hint={alerts.inativos.hint}
          tone="danger"
          onClick={onInativos}
        />
        <KpiCell
          icon={TriangleAlert}
          count={alerts.licencas.count}
          label="Licenças a vencer"
          hint={alerts.licencas.hint}
          tone="warning"
          onClick={() => onDrill("licencas")}
        />
        <KpiCell
          icon={TrendingDown}
          count={alerts.quedasRanking.count}
          label="Quedas de ranking"
          hint={alerts.quedasRanking.hint}
          tone="danger"
          onClick={() => onDrill("quedas")}
        />
        <KpiCell
          icon={Users}
          count={licenciadosNaRede}
          label="Licenciados na rede"
          hint="vinculados a você"
          tone="neutral"
          onClick={() => onDrill("rede-total")}
        />
        <KpiCell
          icon={UserPlus}
          count={novosHoje}
          label="Novos hoje"
          hint="cadastros na rede"
          tone="neutral"
          onClick={() => onDrill("novos")}
        />
      </div>
    </section>
  );
}
