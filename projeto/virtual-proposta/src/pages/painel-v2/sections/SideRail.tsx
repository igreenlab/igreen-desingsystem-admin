import type { LucideIcon } from "@/lib/lucide-types";
import {
  UserX,
  TriangleAlert,
  TrendingDown,
  ChevronRight,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SectionCard } from "../_ui";
import { alerts, events, fmt, brl } from "../../painel/painel-mock";

function AlertRow({
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
  tone: "danger" | "warning";
  onClick?: () => void;
}) {
  const active = count > 0;
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
      className="group flex w-full items-center gap-gp-md rounded-radius-base px-pad-md py-pad-md text-left transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
    >
      <span
        className={cn(
          "grid size-comp-md place-items-center rounded-radius-base",
          iconBox,
        )}
      >
        <Icon className="size-icon-sm" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-sm font-medium text-fg-default">
          {label}
        </span>
        <span className="block text-caption-sm text-fg-muted">{hint}</span>
      </span>
      <span className={cn("text-title-md font-bold tabular-nums", countColor)}>
        {fmt(count)}
      </span>
      <ChevronRight className="size-icon-sm shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export function SideRail({
  onInativos,
  className,
}: {
  onInativos: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-gp-2xl", className)}>
      <SectionCard title="Alertas" subtitle="o que precisa da sua atenção">
        <div className="-mx-pad-md flex flex-col">
          <AlertRow
            icon={UserX}
            count={alerts.inativos.count}
            label="Inativos"
            hint={alerts.inativos.hint}
            tone="danger"
            onClick={onInativos}
          />
          <AlertRow
            icon={TriangleAlert}
            count={alerts.licencas.count}
            label="Licenças"
            hint={alerts.licencas.hint}
            tone="warning"
          />
          <AlertRow
            icon={TrendingDown}
            count={alerts.quedasRanking.count}
            label="Quedas de ranking"
            hint={alerts.quedasRanking.hint}
            tone="danger"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Próximo evento"
        subtitle={events.nome}
        action={
          <span className="grid size-comp-md place-items-center rounded-radius-base bg-bg-brand-subtle text-fg-brand">
            <Ticket className="size-icon-sm" />
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-gp-md">
          <div className="flex flex-col">
            <span className="text-caption-md text-fg-muted">Confirmados</span>
            <span className="text-title-md font-semibold tabular-nums text-fg-default">
              {fmt(events.confirmados)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-caption-md text-fg-muted">Ingressos</span>
            <span className="text-title-md font-semibold tabular-nums text-fg-default">
              {brl(events.ingressosVendidos)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-radius-base bg-bg-danger-muted px-pad-lg py-pad-md">
          <span className="text-body-sm font-medium text-fg-danger">
            {fmt(events.semIngresso)} sem ingresso
          </span>
          <span className="text-caption-sm text-fg-danger/80">
            mobilize a rede
          </span>
        </div>
        <Button
          variant="soft"
          color="primary"
          size="sm"
          iconRight={<ArrowRight />}
          className="w-full"
        >
          Ver detalhes e promover
        </Button>
      </SectionCard>
    </div>
  );
}
