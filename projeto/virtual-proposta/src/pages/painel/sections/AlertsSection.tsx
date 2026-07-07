import type { LucideIcon } from "@/lib/lucide-types";
import { UserX, TriangleAlert, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionLabel } from "../_ui";
import { alerts, fmt } from "../painel-mock";

type AlertTone = "danger" | "warning";

function AlertCard({
  icon: Icon,
  count,
  title,
  hint,
  tone,
  onClick,
}: {
  icon: LucideIcon;
  count: number;
  title: string;
  hint: string;
  tone: AlertTone;
  onClick?: () => void;
}) {
  const active = count > 0;
  // Estado calmo quando 0; destacado (cor semântica) quando há o que resolver.
  const iconBox = !active
    ? "bg-bg-muted text-fg-muted"
    : tone === "danger"
      ? "bg-bg-danger-muted text-fg-danger"
      : "bg-bg-warning-muted text-fg-warning";
  const countColor = !active
    ? "text-fg-muted"
    : tone === "danger"
      ? "text-fg-danger"
      : "text-fg-warning";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-gp-md rounded-radius-lg border border-border-default bg-bg-surface p-pad-card-base text-left shadow-sh-sm",
        "transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
      )}
    >
      <span
        className={cn(
          "grid size-comp-xl place-items-center rounded-radius-base",
          iconBox,
        )}
      >
        <Icon className="size-icon-md" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-gp-sm">
          <span
            className={cn("text-heading-xs font-bold tabular-nums", countColor)}
          >
            {fmt(count)}
          </span>
          <span className="text-title-md font-semibold text-fg-default">
            {title}
          </span>
        </div>
        <p className="text-body-sm text-fg-muted">{hint}</p>
      </div>
      <ChevronRight className="size-icon-md shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg-muted" />
    </button>
  );
}

export function AlertsSection({ onInativos }: { onInativos: () => void }) {
  return (
    <div className="flex flex-col gap-gp-md">
      <SectionLabel
        title="Ação necessária"
        hint="o que precisa da sua atenção"
      />
      <div className="grid grid-cols-1 gap-gp-md md:grid-cols-3">
        <AlertCard
          icon={UserX}
          count={alerts.inativos.count}
          title="Inativos"
          hint={alerts.inativos.hint}
          tone="danger"
          onClick={onInativos}
        />
        <AlertCard
          icon={TriangleAlert}
          count={alerts.licencas.count}
          title="Licenças"
          hint={alerts.licencas.hint}
          tone="warning"
        />
        <AlertCard
          icon={TrendingDown}
          count={alerts.quedasRanking.count}
          title="Quedas de ranking"
          hint={alerts.quedasRanking.hint}
          tone="danger"
        />
      </div>
    </div>
  );
}
