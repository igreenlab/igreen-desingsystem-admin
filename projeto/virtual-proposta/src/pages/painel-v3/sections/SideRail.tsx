import { cn } from "@/lib/utils";
import { QuadStats } from "./QuadStats";
import { EventCard } from "./EventCard";

/**
 * Rail do v3 — Quad 2×2 (alertas, p/ validação) + EventCard (evento ativo).
 * Os alertas viraram a faixa de KPIs no topo (NetworkAlertsKpis) + notificações no header.
 */
export function SideRail({
  onInativos,
  onDrill,
  className,
}: {
  onInativos: () => void;
  onDrill: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-gp-2xl", className)}>
      <QuadStats onInativos={onInativos} onDrill={onDrill} />
      <EventCard />
    </div>
  );
}
