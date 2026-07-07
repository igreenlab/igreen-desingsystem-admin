import { Rocket, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Card, CardHead, SectionLabel } from "../_ui";
import { proMaker, fmt } from "../painel-mock";

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "neutral";
}) {
  const Icon = tone === "warning" ? Target : Rocket;
  return (
    <div className="flex flex-col items-center gap-gp-2xs rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-lg text-center">
      <Icon
        className={cn(
          "size-icon-md",
          tone === "warning" ? "text-fg-warning" : "text-fg-brand",
        )}
      />
      <span className="text-heading-xs font-bold tabular-nums text-fg-default">
        {fmt(value)}
      </span>
      <span className="text-caption-md text-fg-muted">{label}</span>
    </div>
  );
}

export function ProMakerSection() {
  return (
    <div className="flex flex-col gap-gp-md">
      <SectionLabel title="Pro Maker" hint="construção de licenciados PRO" />
      <Card className="flex flex-col gap-gp-lg">
        <CardHead
          title="Construção PRO"
          subtitle={`${fmt(proMaker.totalPro)} PRO de ${fmt(proMaker.redeTotal)} na rede`}
          right={
            <Button
              variant="ghost"
              color="primary"
              size="sm"
              iconRight={<ArrowRight />}
            >
              Abrir Pro Maker
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-gp-md sm:grid-cols-3 lg:grid-cols-5">
          {proMaker.tiers.map((t) => (
            <Tile key={t.id} label={t.label} value={t.value} tone={t.tone} />
          ))}
        </div>
      </Card>
    </div>
  );
}
