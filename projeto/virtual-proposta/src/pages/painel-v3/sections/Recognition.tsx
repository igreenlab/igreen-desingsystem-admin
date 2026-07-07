import { useState } from "react";
import {
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  UserPlus,
  Users,
  MessageCircle,
  Cake,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import { SectionCard } from "../../painel-v2/_ui";
import { rankingMes, rankingTudo, type RankRow } from "../v3-mock";
import { fmt } from "../../painel/painel-mock";

function MoveIndicator({ row }: { row: RankRow }) {
  if (row.move === "up") {
    return (
      <span className="inline-flex w-[34px] shrink-0 items-center gap-[2px] text-caption-sm font-medium text-fg-success">
        <ArrowUp className="size-icon-xs" />
        {row.delta}
      </span>
    );
  }
  if (row.move === "down") {
    return (
      <span className="inline-flex w-[34px] shrink-0 items-center gap-[2px] text-caption-sm font-medium text-fg-danger">
        <ArrowDown className="size-icon-xs" />
        {row.delta}
      </span>
    );
  }
  return (
    <span className="inline-flex w-[34px] shrink-0 items-center text-fg-subtle">
      <Minus className="size-icon-xs" />
    </span>
  );
}

function RankRowItem({
  row,
  pos,
  mode,
}: {
  row: RankRow;
  pos: number;
  mode: "mes" | "tudo";
}) {
  const Icon = mode === "mes" ? UserPlus : Users;
  return (
    <div className="flex items-center gap-gp-md py-[10px]">
      <span
        className={cn(
          "grid size-comp-md shrink-0 place-items-center rounded-radius-full",
          pos === 1
            ? "bg-bg-warning-muted text-fg-warning"
            : "bg-bg-muted text-fg-muted",
        )}
      >
        {pos === 1 ? (
          <Award className="size-icon-xs" />
        ) : (
          <span className="text-caption-sm font-bold">{pos}</span>
        )}
      </span>

      <Avatar color="brand" size="md" aria-label={row.name}>
        {row.initials}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-gp-xs">
          <p className="truncate text-body-sm font-semibold text-fg-default">
            {row.name}
          </p>
          {row.aniversariante && (
            <span
              title="Aniversariante"
              aria-label="Aniversariante"
              className="grid size-[18px] shrink-0 place-items-center rounded-radius-full bg-bg-warning text-fg-on-warning shadow-sh-sm"
            >
              <Cake className="size-[11px]" />
            </span>
          )}
        </div>
        <p className="text-caption-sm text-fg-muted">{row.cidade}</p>
      </div>

      {mode === "mes" && <MoveIndicator row={row} />}

      <span className="inline-flex shrink-0 items-center gap-[4px] rounded-radius-full bg-bg-muted px-pad-md py-[2px] text-caption-sm font-semibold tabular-nums text-fg-default">
        <Icon className="size-icon-xs text-fg-muted" />
        {mode === "mes" ? `+${fmt(row.value)}` : fmt(row.value)}
      </span>

      <Button
        variant="ghost"
        color="success"
        size="icon-sm"
        aria-label={`WhatsApp ${row.name}`}
        onClick={() => window.open("https://wa.me/", "_blank")}
      >
        <MessageCircle />
      </Button>
    </div>
  );
}

export function Recognition({ className }: { className?: string }) {
  const [tab, setTab] = useState<"mes" | "tudo">("mes");
  const rows = tab === "mes" ? rankingMes : rankingTudo;

  return (
    <SectionCard
      title="Reconhecimento"
      subtitle="ranking de expansão da rede"
      className={className}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "mes" | "tudo")}>
        <TabsList className="w-full">
          <TabsTrigger value="mes" className="flex-1">
            Este mês
          </TabsTrigger>
          <TabsTrigger value="tudo" className="flex-1">
            Todos os tempos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="-mr-pad-sm flex min-h-0 flex-1 flex-col divide-y divide-border-subtle overflow-y-auto pr-pad-sm">
        {rows.map((r, i) => (
          <RankRowItem key={r.id} row={r} pos={i + 1} mode={tab} />
        ))}
      </div>
    </SectionCard>
  );
}
