import {
  CircleCheck,
  CalendarCheck,
  Ticket,
  UserX,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Card, CardHead, SectionLabel } from "../_ui";
import { events, brl, fmt } from "../painel-mock";

function Tile({
  icon: Icon,
  value,
  label,
  highlight,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-gp-2xs rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-lg text-center">
      <Icon
        className={cn(
          "size-icon-md",
          highlight ? "text-fg-danger" : "text-fg-muted",
        )}
      />
      <span
        className={cn(
          "text-heading-xs font-bold tabular-nums",
          highlight ? "text-fg-danger" : "text-fg-default",
        )}
      >
        {value}
      </span>
      <span className="text-caption-md text-fg-muted">{label}</span>
    </div>
  );
}

export function EventsSection() {
  return (
    <div className="flex flex-col gap-gp-md">
      <SectionLabel
        title="Promoção de eventos"
        hint="mobilize a rede pro próximo evento"
      />
      <Card className="flex flex-col gap-gp-lg">
        <CardHead
          title={events.nome}
          subtitle="próximo evento da rede"
          right={
            <Button
              variant="ghost"
              color="primary"
              size="sm"
              iconRight={<ArrowRight />}
            >
              Ver detalhes e promover
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-gp-md lg:grid-cols-4">
          <Tile
            icon={CircleCheck}
            value={fmt(events.confirmados)}
            label="Confirmados"
          />
          <Tile
            icon={CalendarCheck}
            value={fmt(events.checkins)}
            label="Check-ins"
          />
          <Tile
            icon={Ticket}
            value={brl(events.ingressosVendidos)}
            label="Ingressos vendidos"
          />
          <Tile
            icon={UserX}
            value={fmt(events.semIngresso)}
            label="Sem ingresso"
            highlight
          />
        </div>
      </Card>
    </div>
  );
}
