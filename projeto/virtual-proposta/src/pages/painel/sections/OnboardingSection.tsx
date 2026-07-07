import { CircleCheck, Circle, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/shadcn/progress";
import { cn } from "@/lib/utils";
import { Card, CardHead, SectionLabel } from "../_ui";
import {
  onboarding,
  brl,
  type OnboardingPerson,
  type OnboardingStep,
} from "../painel-mock";

function Step({ step }: { step: OnboardingStep }) {
  const Icon = step.done ? CircleCheck : Circle;
  return (
    <div className="flex items-center gap-gp-sm">
      <Icon
        className={cn(
          "size-icon-sm shrink-0",
          step.done ? "text-fg-success" : "text-fg-subtle",
        )}
      />
      <span
        className={cn(
          "text-body-sm",
          step.done ? "text-fg-default" : "text-fg-muted",
        )}
      >
        {step.label}
        {step.progress && (
          <span className="text-fg-subtle"> ({step.progress})</span>
        )}
      </span>
      <Chip
        color={step.done ? "success" : "neutral"}
        variant="soft"
        size="sm"
        className="ml-auto shrink-0"
      >
        {step.reward}
      </Chip>
    </div>
  );
}

function PersonCard({ person }: { person: OnboardingPerson }) {
  const pct = Math.round((person.etapasDone / person.etapasTotal) * 100);
  return (
    <div className="flex flex-col gap-gp-md rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-card-sm">
      {/* topo: pessoa + progresso + ação */}
      <div className="flex flex-wrap items-start justify-between gap-gp-md">
        <div className="flex items-center gap-gp-sm">
          <Avatar color="brand" size="lg" aria-label={person.name}>
            {person.initials}
          </Avatar>
          <div>
            <div className="flex items-center gap-gp-sm">
              <span className="text-title-md font-semibold text-fg-default">
                {person.name}
              </span>
              <Chip color="primary" variant="soft" size="sm">
                {person.tipo}
              </Chip>
            </div>
            <p className="text-body-sm text-fg-muted">
              {person.cidade} · Linha:{" "}
              <span className="text-fg-default">{person.linha}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-gp-md">
          <div className="w-[140px]">
            <div className="mb-gp-2xs flex justify-between text-caption-md text-fg-muted">
              <span>Progresso</span>
              <span className="tabular-nums text-fg-default">
                {person.etapasDone}/{person.etapasTotal}
              </span>
            </div>
            <Progress value={pct} className="h-2" />
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

      {/* passos */}
      <div className="grid grid-cols-1 gap-x-gp-2xl gap-y-gp-sm md:grid-cols-2">
        {person.steps.map((s) => (
          <Step key={s.label} step={s} />
        ))}
      </div>

      {/* rodapé: comissão + top-up */}
      <div className="flex flex-wrap items-center justify-between gap-gp-sm border-t border-border-subtle pt-gp-sm">
        <span className="text-body-sm text-fg-muted">
          Comissão acumulada:{" "}
          <span className="font-semibold text-fg-default">
            {brl(person.comissaoAcumulada)}
          </span>
        </span>
        <span className="text-caption-md text-fg-subtle">
          Top-up até {brl(person.topUp)} ao virar Pré-Sênior
        </span>
      </div>
    </div>
  );
}

export function OnboardingSection() {
  return (
    <div className="flex flex-col gap-gp-md">
      <SectionLabel
        title="Missão Pré-Sênior"
        hint="onboarding dos novos licenciados (últimos 45 dias)"
      />
      <Card className="flex flex-col gap-gp-lg">
        <CardHead
          title="Acompanhamento de onboarding"
          subtitle={`${onboarding.length} licenciados em progresso`}
        />
        <div className="flex flex-col gap-gp-md">
          {onboarding.map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </div>
      </Card>
    </div>
  );
}
