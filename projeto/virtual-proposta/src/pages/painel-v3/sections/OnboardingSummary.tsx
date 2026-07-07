import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  MapPin,
  Users,
  CircleCheck,
  Check,
  Gauge,
  Wallet,
  MessageCircle,
  Network,
  TrendingUp,
  Gift,
  Link2,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "@/lib/lucide-types";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SectionCard } from "../../painel-v2/_ui";
import { StepBar } from "../_ui";
import {
  onboardingV3,
  statusOf,
  pendingMissions,
  concluiramCount,
  progressoMedio,
  comissaoTotal,
  type OnbStatus,
  type OnbStatusId,
} from "../v3-mock";
import { brl, type OnboardingPerson } from "../../painel/painel-mock";

/** Pill arredondada (mesmo tamanho do status), estilo `list-rich`. */
function Pill({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-radius-full px-pad-md py-[2px] text-caption-sm font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Cor do status por id — "Em andamento" em verde (≠ painel, que usa âmbar). */
const STATUS_PILL: Record<OnbStatusId, string> = {
  "nao-iniciado": "bg-bg-muted text-fg-muted",
  "em-andamento": "bg-bg-success-muted text-fg-success",
  concluido: "bg-bg-success text-fg-on-success",
};
function StatusPill({ st }: { st: OnbStatus }) {
  return <Pill className={STATUS_PILL[st.id]}>{st.label}</Pill>;
}

function TipoPill({ tipo }: { tipo: OnboardingPerson["tipo"] }) {
  return (
    <Pill
      className={
        tipo === "Direto"
          ? "bg-bg-brand-subtle text-fg-brand"
          : "bg-bg-info-muted text-fg-info"
      }
    >
      {tipo}
    </Pill>
  );
}

/** Meta inline (ícone + texto) — fonte menor que o list-rich. */
function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-caption-sm text-fg-muted [&>svg]:size-icon-xs [&>svg]:text-fg-subtle">
      {icon}
      {children}
    </span>
  );
}

/** Top 3 que mais precisam de atenção (menos etapas concluídas). */
const preview = onboardingV3.slice(0, 3);

/** Badge circular de ícone — neutro (bg-muted + fg-default), menor que o kpi/row. */
function IconCircle({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-comp-lg shrink-0 place-items-center rounded-radius-full bg-bg-muted text-fg-default",
        className,
      )}
    >
      <Icon className="size-icon-xs" aria-hidden />
    </span>
  );
}

/** Bloco de textos da métrica (label / valor 22px / sub verde). */
function MetricText({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-caption-md text-fg-muted">{label}</p>
      <p className="mt-gp-xs text-[22px] font-bold leading-tight tabular-nums text-fg-default">
        {value}
      </p>
      <p className="mt-gp-2xs text-caption-sm font-medium text-fg-success">
        {sub}
      </p>
    </div>
  );
}

/** Métrica da faixa — ícone flutuante (não afeta a altura). `iconPos`: end | start. */
function StripMetric({
  icon,
  label,
  value,
  sub,
  iconPos,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: ReactNode;
  iconPos: "end" | "start";
}) {
  if (iconPos === "start") {
    return (
      <div className="flex items-start gap-gp-md py-pad-md lg:px-pad-2xl lg:first:pl-0 lg:last:pr-0">
        <IconCircle icon={icon} className="mt-[2px]" />
        <MetricText label={label} value={value} sub={sub} />
      </div>
    );
  }
  // end: ícone flutuante (absolute) → não empurra a altura do título
  return (
    <div className="relative py-pad-md lg:px-pad-2xl lg:first:pl-0 lg:last:pr-0">
      <IconCircle
        icon={icon}
        className="absolute right-0 top-pad-md lg:right-pad-2xl lg:last:right-0"
      />
      <div className="pr-[40px]">
        <MetricText label={label} value={value} sub={sub} />
      </div>
    </div>
  );
}

/** Métricas do resumo de onboarding. */
const STRIP = [
  {
    icon: Users,
    label: "Em onboarding",
    value: String(onboardingV3.length),
    sub: "licenciados",
  },
  {
    icon: CircleCheck,
    label: "Concluíram",
    value: `${concluiramCount}/${onboardingV3.length}`,
    sub: "todas as etapas",
  },
  {
    icon: Gauge,
    label: "Progresso médio",
    value: `${progressoMedio}%`,
    sub: `${pendingMissions} missões pendentes`,
  },
  {
    icon: Wallet,
    label: "Comissão total",
    value: brl(comissaoTotal),
    sub: "acumulada na linha",
  },
];

/** Pill de recompensa — neutra por padrão; verde quando a etapa está feita. */
function RewardPill({ reward, done }: { reward: string; done: boolean }) {
  const isPts = /pts|pontos/i.test(reward);
  const Icon = isPts ? Sparkles : Link2;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-[4px] rounded-radius-full px-pad-md py-[2px] text-caption-sm font-medium",
        done
          ? "bg-bg-success-muted text-fg-success"
          : "bg-bg-canvas text-fg-muted",
      )}
    >
      <Icon className="size-icon-xs" />
      {reward}
    </span>
  );
}

/**
 * Badge da quantidade (ex.: 0/5). Completo (2/2) → badge inteiro verde (fundo+texto);
 * em progresso → numerador âmbar; zero → tudo cinza.
 */
function ProgressBadge({ value }: { value: string }) {
  const [cur, tot] = value.split("/");
  const c = Number(cur);
  const t = Number(tot);
  if (c > 0 && c >= t) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-radius-full bg-bg-success-muted px-pad-sm py-[1px] text-caption-sm font-semibold tabular-nums text-fg-success">
        {cur}/{tot}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-radius-full bg-bg-canvas px-pad-sm py-[1px] text-caption-sm font-semibold tabular-nums text-fg-muted">
      <span className={cn(c > 0 && "text-fg-warning")}>{cur}</span>
      <span>/{tot}</span>
    </span>
  );
}

/** Card de missão — pendente (borda) / em andamento (anel âmbar) / concluído (check verde). */
function MissionCard({ step }: { step: OnboardingPerson["steps"][number] }) {
  const [curStr, totStr] = (step.progress ?? "").split("/");
  const cur = Number(curStr || 0);
  const tot = Number(totStr || 0);
  const inProgress = !step.done && cur > 0;
  const pct = tot ? Math.round((cur / tot) * 100) : 0;

  const statusText = step.done
    ? "Concluído"
    : inProgress
      ? "Em andamento"
      : "Pendente";
  const statusClass = step.done
    ? "text-fg-success"
    : inProgress
      ? "text-fg-warning"
      : "text-fg-subtle";

  return (
    <div
      className={cn(
        "flex items-center gap-gp-md rounded-radius-base border px-pad-2xl py-pad-lg",
        step.done
          ? "border-border-default bg-bg-muted"
          : "border-border-subtle bg-bg-subtle",
      )}
    >
      {step.done ? (
        <span className="grid size-[18px] shrink-0 place-items-center rounded-radius-full bg-bg-success text-fg-on-success">
          <Check className="size-[12px]" strokeWidth={3} />
        </span>
      ) : inProgress ? (
        // anel de progresso âmbar (proporcional às etapas feitas)
        <span
          className="grid size-[18px] shrink-0 place-items-center rounded-radius-full"
          style={{
            background: `conic-gradient(var(--color-bg-warning) ${pct}%, var(--color-bg-muted) ${pct}%)`,
          }}
        >
          <span className="size-[10px] rounded-radius-full bg-bg-subtle" />
        </span>
      ) : (
        <span className="size-[18px] shrink-0 rounded-radius-full border-2 border-border-default" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
        <div className="flex items-center gap-gp-sm">
          <span className="text-body-sm font-medium leading-tight text-fg-default">
            {step.label}
          </span>
          {step.progress && <ProgressBadge value={step.progress} />}
        </div>
        <span className={cn("text-caption-sm leading-tight", statusClass)}>
          {statusText}
        </span>
      </div>

      <RewardPill reward={step.reward} done={step.done} />
    </div>
  );
}

/** Grade de missões (2 colunas). */
function MissionSteps({ person }: { person: OnboardingPerson }) {
  return (
    <div className="grid grid-cols-1 gap-gp-md sm:grid-cols-2">
      {person.steps.map((s) => (
        <MissionCard key={s.label} step={s} />
      ))}
    </div>
  );
}

/** Item da lista de prioridade — expande mostrando as missões (feito/pendente). */
function PreviewRow({ person }: { person: OnboardingPerson }) {
  const [open, setOpen] = useState(false);
  const st = statusOf(person);

  return (
    <div className="rounded-radius-lg border border-border-subtle bg-bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-gp-md rounded-radius-lg p-pad-2xl text-left transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
      >
        <Avatar color="brand" size="md" aria-label={person.name}>
          {person.initials}
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-gp-xs">
          <div className="flex items-center gap-gp-sm">
            <span className="truncate text-body-md font-semibold text-fg-default">
              {person.name}
            </span>
            <TipoPill tipo={person.tipo} />
          </div>
          <div className="flex flex-wrap items-center gap-x-gp-lg gap-y-[2px]">
            <Meta icon={<MapPin />}>{person.cidade}</Meta>
            {person.diasNaRede != null && (
              <Meta icon={<Clock />}>há {person.diasNaRede} dias</Meta>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-gp-lg">
          <StatusPill st={st} />
          <StepBar
            total={person.etapasTotal}
            done={person.etapasDone}
            className="w-[104px]"
          />
          <span className="text-caption-sm font-bold tabular-nums text-fg-default">
            {person.etapasDone}/{person.etapasTotal}
          </span>
          <div className="ml-gp-lg flex flex-col items-end">
            <span className="text-caption-sm text-fg-muted">comissão</span>
            <span className="text-body-sm font-semibold tabular-nums text-fg-default">
              {brl(person.comissaoAcumulada)}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "size-icon-sm shrink-0 text-fg-subtle transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-gp-xl rounded-b-radius-lg border-t border-border-subtle bg-bg-canvas p-pad-2xl">
          {/* Meta: linha + comissão acumulada */}
          <div className="flex flex-wrap items-center gap-x-gp-xl gap-y-gp-2xs text-caption-md text-fg-muted">
            <span className="inline-flex items-center gap-[4px]">
              <Network className="size-icon-xs text-fg-subtle" />
              Linha:{" "}
              <span className="font-medium text-fg-default">
                {person.linha}
              </span>
            </span>
            <span className="inline-flex items-center gap-[4px]">
              <TrendingUp className="size-icon-xs text-fg-subtle" />
              Comissão acumulada:{" "}
              <span className="font-medium text-fg-default">
                {brl(person.comissaoAcumulada)}
              </span>
            </span>
          </div>

          <MissionSteps person={person} />

          {/* Top-up como card — WhatsApp no final da mesma row */}
          <div className="flex flex-wrap items-center gap-gp-md rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-lg">
            <span className="grid size-comp-md shrink-0 place-items-center rounded-radius-base bg-bg-muted text-fg-muted">
              <Gift className="size-icon-sm" />
            </span>
            <span className="min-w-0 flex-1 text-caption-md text-fg-muted">
              Top-up de até{" "}
              <span className="font-semibold text-fg-default">
                {brl(person.topUp)}
              </span>{" "}
              ao concluir todas as etapas e virar Pré-Sênior
            </span>
            <Button
              variant="soft"
              color="success"
              size="sm"
              iconLeft={<MessageCircle />}
              className="shrink-0"
            >
              WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function OnboardingSummary({
  onOpen,
  className,
}: {
  onOpen: () => void;
  className?: string;
}) {
  return (
    <SectionCard
      title="Missão Pré-Sênior"
      subtitle="onboarding dos novos licenciados — últimos 45 dias"
      className={className}
      action={
        <Button
          variant="ghost"
          color="primary"
          size="sm"
          iconRight={<ArrowRight />}
          onClick={onOpen}
        >
          Abrir onboarding
        </Button>
      }
    >
      {/* Faixa de métricas (kpi/perf) — painel escuro, ícone neutro flutuante no final */}
      <div className="grid grid-cols-2 gap-x-gp-2xl gap-y-pad-3xl rounded-radius-lg border border-border-subtle bg-bg-canvas p-pad-2xl sm:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-border-subtle">
        {STRIP.map((m) => (
          <StripMetric
            key={m.label}
            icon={m.icon}
            label={m.label}
            value={m.value}
            sub={m.sub}
            iconPos="end"
          />
        ))}
      </div>

      {/* Lista de prioridade — cada item expande (colapse) mostrando as missões */}
      <div className="flex flex-col gap-gp-md">
        <div className="flex items-baseline justify-between gap-gp-sm">
          <span className="text-title-sm font-semibold text-fg-default">
            Acompanhamento de onboarding
          </span>
          <span className="text-caption-sm text-fg-muted">
            {preview.length} de {onboardingV3.length} licenciados
          </span>
        </div>
        {preview.map((p) => (
          <PreviewRow key={p.id} person={p} />
        ))}
      </div>

      <Button
        variant="soft"
        color="secondary"
        size="sm"
        className="w-full"
        onClick={onOpen}
      >
        Ver todos ({onboardingV3.length})
      </Button>
    </SectionCard>
  );
}
