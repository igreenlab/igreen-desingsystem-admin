import { useState } from "react";
import { Award, UserPlus, Cake, TrendingUp, MessageCircle } from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";
import { Card, CardHead, SectionLabel } from "../_ui";
import { recognition } from "../painel-mock";

function MiniStat({
  icon: Icon,
  value,
  title,
  hint,
}: {
  icon: LucideIcon;
  value: number;
  title: string;
  hint: string;
}) {
  return (
    <Card className="flex items-center gap-gp-md">
      <span className="grid size-comp-xl place-items-center rounded-radius-base bg-bg-muted text-fg-muted">
        <Icon className="size-icon-md" />
      </span>
      <div>
        <div className="flex items-baseline gap-gp-sm">
          <span className="text-heading-xs font-bold tabular-nums text-fg-default">
            {value}
          </span>
          <span className="text-title-md font-semibold text-fg-default">
            {title}
          </span>
        </div>
        <p className="text-body-sm text-fg-muted">{hint}</p>
      </div>
    </Card>
  );
}

export function RecognitionSection() {
  const [periodo, setPeriodo] = useState("mes");
  const ranking =
    periodo === "mes"
      ? recognition.topExpansao.mesAtual
      : recognition.topExpansao.todosOsTempos;

  return (
    <div className="flex flex-col gap-gp-md">
      <SectionLabel title="Reconheça seu time" hint="quem brilhou este mês" />

      <Card className="flex flex-col gap-gp-lg">
        <CardHead
          title="Top Expansão"
          subtitle="quem mais cresceu a rede"
          right={
            <ToggleGroup
              type="single"
              value={periodo}
              onValueChange={(v) => v && setPeriodo(v)}
            >
              <ToggleGroupItem value="mes">Mês atual</ToggleGroupItem>
              <ToggleGroupItem value="todos">Todos os tempos</ToggleGroupItem>
            </ToggleGroup>
          }
        />
        <div className="flex flex-col gap-gp-sm">
          {ranking.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-gp-md rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-lg"
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
                <p className="text-title-md font-semibold text-fg-default">
                  {p.name}
                </p>
                <p className="text-body-sm text-fg-muted">{p.cidade}</p>
              </div>
              <Chip color="success" variant="soft" size="sm">
                {p.novos} {p.novos === 1 ? "novo" : "novos"}
              </Chip>
              <Button
                variant="ghost"
                color="success"
                size="sm"
                iconLeft={<MessageCircle />}
              >
                WhatsApp
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-gp-md md:grid-cols-3">
        <MiniStat
          icon={TrendingUp}
          value={recognition.avancosRanking}
          title="Avanços de ranking"
          hint={
            recognition.avancosRanking === 0
              ? "nenhum avanço este mês"
              : "este mês"
          }
        />
        <MiniStat
          icon={UserPlus}
          value={recognition.novosDoDia}
          title="Novos do dia"
          hint={
            recognition.novosDoDia === 0
              ? "nenhum cadastro hoje"
              : "cadastros hoje"
          }
        />
        <MiniStat
          icon={Cake}
          value={recognition.aniversariantes}
          title="Aniversariantes"
          hint={recognition.aniversariantes === 0 ? "ninguém hoje" : "hoje"}
        />
      </div>
    </div>
  );
}
