import { CircleCheck, Circle, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/shadcn/progress";
import { cn } from "@/lib/utils";
import { SectionCard } from "../_ui";
import {
  onboarding,
  brl,
  type OnboardingPerson,
} from "../../painel/painel-mock";

function PersonRow({ person }: { person: OnboardingPerson }) {
  const pct = Math.round((person.etapasDone / person.etapasTotal) * 100);
  const next = person.steps.find((s) => !s.done);

  return (
    <div className="flex flex-col gap-gp-md rounded-radius-lg border border-border-subtle bg-bg-canvas p-pad-2xl">
      <div className="flex flex-wrap items-center justify-between gap-gp-md">
        <div className="flex items-center gap-gp-sm">
          <Avatar color="brand" size="lg" aria-label={person.name}>
            {person.initials}
          </Avatar>
          <div>
            <div className="flex items-center gap-gp-sm">
              <span className="text-body-md font-semibold text-fg-default">
                {person.name}
              </span>
              <Chip color="primary" variant="soft" size="sm">
                {person.tipo}
              </Chip>
            </div>
            <p className="text-body-xs text-fg-muted">
              {person.cidade} · Linha: {person.linha}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-gp-lg">
          <div className="w-[120px]">
            <div className="mb-[3px] flex justify-between text-caption-sm text-fg-muted">
              <span>Etapas</span>
              <span className="tabular-nums text-fg-default">
                {person.etapasDone}/{person.etapasTotal}
              </span>
            </div>
            <Progress value={pct} className="h-[6px]" />
          </div>
          <Button
            variant="soft"
            color="success"
            size="sm"
            iconLeft={<MessageCircle />}
          >
            WhatsApp
          </Button>
        </div>
      </div>

      {next && (
        <div className="flex items-center gap-gp-sm rounded-radius-base bg-bg-brand-subtle px-pad-lg py-pad-md">
          <span className="text-caption-md font-semibold uppercase tracking-wide text-fg-brand">
            Próximo
          </span>
          <span className="text-body-sm text-fg-default">
            {next.label}
            {next.progress && (
              <span className="text-fg-muted"> ({next.progress})</span>
            )}
          </span>
          <Chip color="success" variant="soft" size="sm" className="ml-auto">
            {next.reward}
          </Chip>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-gp-2xl gap-y-[6px] sm:grid-cols-2">
        {person.steps.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-gp-sm text-body-xs"
          >
            {s.done ? (
              <CircleCheck className="size-icon-sm shrink-0 text-fg-success" />
            ) : (
              <Circle className="size-icon-sm shrink-0 text-fg-subtle" />
            )}
            <span
              className={cn(
                s.done ? "text-fg-muted line-through" : "text-fg-default",
              )}
            >
              {s.label}
              {s.progress && ` (${s.progress})`}
            </span>
            <span className="ml-auto text-caption-sm text-fg-subtle">
              {s.reward}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-gp-sm border-t border-border-subtle pt-gp-sm">
        <span className="text-body-xs text-fg-muted">
          Comissão acumulada:{" "}
          <span className="font-semibold text-fg-default">
            {brl(person.comissaoAcumulada)}
          </span>
        </span>
        <span className="text-caption-sm text-fg-subtle">
          Top-up até {brl(person.topUp)} ao virar Pré-Sênior
        </span>
      </div>
    </div>
  );
}

export function ActionQueue({ className }: { className?: string }) {
  return (
    <SectionCard
      title="Precisa de você"
      subtitle={`Onboarding de ${onboarding.length} licenciados (últimos 45 dias)`}
      className={className}
    >
      <div className="flex flex-col gap-gp-lg">
        {onboarding.map((p) => (
          <PersonRow key={p.id} person={p} />
        ))}
      </div>
    </SectionCard>
  );
}
