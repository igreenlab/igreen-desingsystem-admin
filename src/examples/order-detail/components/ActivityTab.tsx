import { Fragment } from "react";
import { Chip } from "@/components/ui/Chip";
import { SectionCard } from "./section-card";
import type { Order, OrderActivity } from "../order.types";

export function ActivityTab({ order }: { order: Order }) {
  // Agrupa eventos por dateGroup preservando a ordem do mock.
  const groups: { date: string; items: OrderActivity[] }[] = [];
  for (const ev of order.activity) {
    const last = groups[groups.length - 1];
    if (last && last.date === ev.dateGroup) last.items.push(ev);
    else groups.push({ date: ev.dateGroup, items: [ev] });
  }

  return (
    <SectionCard
      title="Atividade"
      action={
        <Chip color="info" variant="soft" size="sm" shape="pill">
          Enviado
        </Chip>
      }
    >
      <div className="flex flex-col gap-gp-5xl">
        {groups.map((g) => (
          <div key={g.date}>
            <p className="mb-gp-lg text-caption-sm font-semibold uppercase tracking-wider text-fg-muted">
              {g.date}
            </p>
            <ol className="relative flex flex-col">
              {g.items.map((ev, i) => (
                <Fragment key={ev.id}>
                  <li className="relative flex gap-gp-lg pb-pad-3xl last:pb-0">
                    {/* trilha + dot */}
                    <div className="relative flex w-3 shrink-0 justify-center">
                      {i < g.items.length - 1 && (
                        <span
                          className="absolute top-3 h-full w-px bg-border-default"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={
                          "relative z-10 mt-1 size-2.5 rounded-full " +
                          (ev.done ? "bg-bg-success" : "bg-bg-brand")
                        }
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          "text-body-sm font-semibold " +
                          (ev.done ? "text-fg-success" : "text-fg-default")
                        }
                      >
                        {ev.title}
                      </p>
                      {ev.description && (
                        <p className="text-caption-sm text-fg-muted">
                          {ev.description}
                        </p>
                      )}
                      <p className="mt-gp-2xs text-caption-sm text-fg-subtle [font-variant-numeric:tabular-nums]">
                        {ev.time}
                      </p>
                    </div>
                  </li>
                </Fragment>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
