import { ArrowRight, Hammer, Rocket, Medal, Award, Crown } from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "../../painel-v2/_ui";
import { proFunnel } from "../v3-mock";
import { fmt } from "../../painel/painel-mock";

const COLORS = [
  "var(--color-bg-warning)",
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-5)",
];
const ICONS: LucideIcon[] = [Hammer, Rocket, Medal, Award, Crown];
const STAGES = proFunnel.stages.map((s, i) => ({
  ...s,
  color: COLORS[i],
  icon: ICONS[i],
}));
const TOTAL = STAGES.reduce((sum, s) => sum + s.value, 0) || 1;

// Subtítulo padrão (lidera pelo valor total da rede).
const SUBTITLE = `${fmt(proFunnel.redeTotal)} na rede · ${fmt(proFunnel.totalPro)} já são PRO`;

function ProAction() {
  return (
    <Button
      variant="ghost"
      color="primary"
      size="sm"
      iconRight={<ArrowRight />}
    >
      Abrir Pro Maker
    </Button>
  );
}

/** Variação A — lista (sem gráfico). */
export function ProBuildingList({ className }: { className?: string }) {
  return (
    <SectionCard
      title="Construção PRO"
      subtitle={SUBTITLE}
      className={className}
      action={<ProAction />}
    >
      <div className="flex flex-1 flex-col gap-gp-md">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const pct = Math.round((s.value / TOTAL) * 100);
          return (
            <div
              key={s.id}
              className="flex flex-1 items-center gap-gp-lg rounded-radius-lg border border-border-subtle bg-bg-canvas px-pad-2xl py-pad-lg"
            >
              <span className="grid size-comp-xl shrink-0 place-items-center rounded-radius-base bg-bg-muted">
                <Icon className="size-icon-sm" style={{ color: s.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-gp-sm">
                  <span className="text-body-md font-semibold text-fg-default">
                    {s.label}
                  </span>
                  <span className="text-title-md font-bold tabular-nums text-fg-default">
                    {fmt(s.value)}
                  </span>
                </div>
                <div className="mt-gp-xs flex items-center gap-gp-sm">
                  <div className="h-[6px] flex-1 overflow-hidden rounded-radius-full bg-bg-muted">
                    <div
                      className="h-full rounded-radius-full"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                  <span className="w-[34px] text-right text-caption-sm tabular-nums text-fg-muted">
                    {pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="soft"
        color="secondary"
        size="sm"
        className="w-full"
        iconRight={<ArrowRight />}
      >
        Ir para o Pro Maker
      </Button>
    </SectionCard>
  );
}

/** Variação B — mini-cards por estágio (ref: "Currently Using / Solar Gen"). */
export function ProBuildingCards({ className }: { className?: string }) {
  return (
    <SectionCard
      title="Construção PRO"
      subtitle={SUBTITLE}
      className={className}
      action={<ProAction />}
    >
      <div className="grid grid-cols-2 gap-gp-md">
        {STAGES.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-gp-2xs rounded-radius-base border border-border-subtle bg-bg-canvas p-pad-md"
          >
            <span className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
              <span
                className="size-[8px] shrink-0 rounded-radius-full"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
            <div className="flex items-baseline justify-between gap-gp-sm">
              <span className="text-title-md font-bold tabular-nums text-fg-default">
                {fmt(s.value)}
              </span>
              <span className="text-caption-sm tabular-nums text-fg-subtle">
                {Math.round((s.value / TOTAL) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
