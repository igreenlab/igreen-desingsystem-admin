import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "../../painel-v2/_ui";
import { proFunnel } from "../v3-mock";
import { fmt } from "../../painel/painel-mock";

// Cor por estágio (construção em âmbar; tiers PRO numa rampa de chart).
const COLORS = [
  "var(--color-bg-warning)",
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-5)",
];

const STAGES = proFunnel.stages.map((s, i) => ({ ...s, color: COLORS[i] }));
const TOTAL = STAGES.reduce((sum, s) => sum + s.value, 0) || 1;

export function ProBuilding({ className }: { className?: string }) {
  return (
    <SectionCard
      title="Construção PRO"
      subtitle={`${fmt(proFunnel.totalPro)} PRO de ${fmt(proFunnel.redeTotal)} na rede`}
      className={className}
      action={
        <Button
          variant="ghost"
          color="primary"
          size="sm"
          iconRight={<ArrowRight />}
        >
          Abrir Pro Maker
        </Button>
      }
    >
      {/* Barra segmentada (distribuição da rede pelos estágios) */}
      <div className="flex h-[10px] gap-[2px] overflow-hidden rounded-radius-full bg-bg-subtle">
        {STAGES.filter((s) => s.value > 0).map((s) => (
          <span
            key={s.id}
            style={{ flex: s.value, background: s.color }}
            aria-hidden
          />
        ))}
      </div>

      {/* Lista com dot + label + contagem */}
      <div className="flex flex-col">
        {STAGES.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-gp-md border-b border-border-subtle py-pad-lg last:border-0"
          >
            <span
              className="size-[10px] shrink-0 rounded-radius-full"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-body-sm font-medium text-fg-default">
              {s.label}
            </span>
            <span className="text-caption-sm tabular-nums text-fg-muted">
              {Math.round((s.value / TOTAL) * 100)}%
            </span>
            <span className="w-[36px] text-right text-body-sm font-semibold tabular-nums text-fg-default">
              {fmt(s.value)}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
