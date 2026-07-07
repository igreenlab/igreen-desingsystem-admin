import { Rocket, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SectionCard } from "../_ui";
import { proMaker, fmt } from "../../painel/painel-mock";

export function ProBuilding({ className }: { className?: string }) {
  return (
    <SectionCard
      title="Construção PRO"
      subtitle={`${fmt(proMaker.totalPro)} PRO de ${fmt(proMaker.redeTotal)} na rede`}
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
      <div className="grid grid-cols-2 gap-gp-md sm:grid-cols-3 lg:grid-cols-5">
        {proMaker.tiers.map((t) => {
          const Icon = t.tone === "warning" ? Target : Rocket;
          return (
            <div
              key={t.id}
              className="flex flex-col items-center gap-gp-2xs rounded-radius-lg border border-border-subtle bg-bg-canvas p-pad-lg text-center"
            >
              <Icon
                className={cn(
                  "size-icon-sm",
                  t.tone === "warning" ? "text-fg-warning" : "text-fg-brand",
                )}
              />
              <span className="text-title-lg font-bold tabular-nums text-fg-default">
                {fmt(t.value)}
              </span>
              <span className="text-caption-sm text-fg-muted">{t.label}</span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
