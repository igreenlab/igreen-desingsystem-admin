import { useState } from "react";
import { Award, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";
import { SectionCard } from "../_ui";
import { recognition } from "../../painel/painel-mock";

export function Recognition({ className }: { className?: string }) {
  const [periodo, setPeriodo] = useState("mes");
  const ranking =
    periodo === "mes"
      ? recognition.topExpansao.mesAtual
      : recognition.topExpansao.todosOsTempos;

  return (
    <SectionCard
      title="Reconhecimento"
      subtitle="quem brilhou este mês"
      className={className}
      action={
        <ToggleGroup
          type="single"
          value={periodo}
          onValueChange={(v) => v && setPeriodo(v)}
        >
          <ToggleGroupItem value="mes">Mês</ToggleGroupItem>
          <ToggleGroupItem value="todos">Tudo</ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div className="flex flex-col gap-gp-sm">
        {ranking.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-gp-md rounded-radius-lg border border-border-subtle bg-bg-canvas p-pad-lg"
          >
            <span className="grid size-comp-md place-items-center rounded-radius-full bg-bg-warning-muted text-fg-warning">
              {i === 0 ? (
                <Award className="size-icon-sm" />
              ) : (
                <span className="text-body-sm font-bold">{i + 1}</span>
              )}
            </span>
            <Avatar color="brand" size="md" aria-label={p.name}>
              {p.initials}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold text-fg-default">
                {p.name}
              </p>
              <p className="text-caption-sm text-fg-muted">{p.cidade}</p>
            </div>
            <Chip color="success" variant="soft" size="sm">
              +{p.novos}
            </Chip>
            <Button
              variant="ghost"
              color="success"
              size="icon-sm"
              aria-label={`WhatsApp ${p.name}`}
            >
              <MessageCircle />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-gp-md border-t border-border-subtle pt-gp-lg text-center">
        <div className="flex flex-col">
          <span className="text-title-md font-semibold tabular-nums text-fg-default">
            {recognition.novosDoDia}
          </span>
          <span className="text-caption-sm text-fg-muted">Novos hoje</span>
        </div>
        <div className="flex flex-col">
          <span className="text-title-md font-semibold tabular-nums text-fg-default">
            {recognition.aniversariantes}
          </span>
          <span className="text-caption-sm text-fg-muted">Aniversários</span>
        </div>
        <div className="flex flex-col">
          <span className="text-title-md font-semibold tabular-nums text-fg-default">
            {recognition.avancosRanking}
          </span>
          <span className="text-caption-sm text-fg-muted">Avanços</span>
        </div>
      </div>
    </SectionCard>
  );
}
