import { useMemo, useState } from "react";
import {
  CircleCheck,
  Circle,
  MessageCircle,
  Users,
  ChevronDown,
  Search,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/shadcn/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import { StepBar } from "../_ui";
import {
  onboardingV3,
  statusOf,
  campaign,
  pendingMissions,
  concluiramCount,
  progressoMedio,
  comissaoTotal,
  type OnbStatusId,
} from "../v3-mock";
import { brl, type OnboardingPerson } from "../../painel/painel-mock";

const STATUS_DOT: Record<OnbStatusId, string> = {
  "nao-iniciado": "bg-fg-subtle",
  "em-andamento": "bg-bg-warning",
  concluido: "bg-bg-success",
};

const FILTERS: { id: OnbStatusId | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "nao-iniciado", label: "Não iniciado" },
  { id: "em-andamento", label: "Em andamento" },
  { id: "concluido", label: "Concluído" },
];

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col rounded-radius-lg border border-border-subtle bg-bg-subtle p-pad-lg">
      <span className="text-caption-md text-fg-muted">{label}</span>
      <span className="text-title-lg font-bold tabular-nums text-fg-default">{value}</span>
      <span className="text-caption-sm text-fg-subtle">{hint}</span>
    </div>
  );
}

function StepItem({ step, isNext }: { step: OnboardingPerson["steps"][number]; isNext: boolean }) {
  const Icon = step.done ? CircleCheck : Circle;
  const sub = step.done ? "Concluído" : isNext ? "Próximo" : "Pendente";
  return (
    <div className="flex items-start gap-gp-sm">
      <Icon className={cn("mt-[1px] size-icon-sm shrink-0", step.done ? "text-fg-success" : isNext ? "text-fg-brand" : "text-fg-subtle")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-gp-sm">
          <span className={cn("text-body-sm", step.done ? "text-fg-muted line-through" : "text-fg-default")}>
            {step.label}{step.progress && <span className="text-fg-subtle"> ({step.progress})</span>}
          </span>
          <Chip color={step.done ? "success" : "neutral"} variant="soft" size="sm" className="shrink-0">{step.reward}</Chip>
        </div>
        <span className={cn("text-caption-sm", isNext && !step.done ? "text-fg-brand" : "text-fg-subtle")}>{sub}</span>
      </div>
    </div>
  );
}

function PersonCard({ person }: { person: OnboardingPerson }) {
  const [open, setOpen] = useState(false);
  const st = statusOf(person);
  const nextIdx = person.steps.findIndex((s) => !s.done);

  return (
    <div className="rounded-radius-lg border border-border-subtle bg-bg-subtle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-col gap-gp-md p-pad-2xl text-left transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand rounded-radius-lg"
      >
        <div className="flex w-full items-center gap-gp-md">
          <span className="relative shrink-0">
            <Avatar color="brand" size="lg" aria-label={person.name}>{person.initials}</Avatar>
            <span className={cn("absolute bottom-0 right-0 size-[10px] rounded-radius-full ring-2 ring-bg-surface", STATUS_DOT[st.id])} aria-hidden />
          </span>

          <div className="min-w-0 flex-[1.6]">
            <div className="flex items-center gap-gp-sm">
              <span className="truncate text-body-md font-semibold text-fg-default">{person.name}</span>
              <Chip color={person.tipo === "Direto" ? "primary" : "info"} variant="soft" size="sm" className="shrink-0">{person.tipo}</Chip>
            </div>
            <div className="flex flex-wrap items-center gap-x-gp-md gap-y-[2px] text-caption-sm text-fg-muted">
              <span className="inline-flex items-center gap-[3px]"><MapPin className="size-icon-xs" />{person.cidade}</span>
              {person.diasNaRede != null && (
                <span className="inline-flex items-center gap-[3px]"><Clock className="size-icon-xs" />há {person.diasNaRede} dias</span>
              )}
            </div>
          </div>

          <div className="hidden w-[150px] shrink-0 flex-col gap-[5px] sm:flex">
            <div className="flex items-center justify-between">
              <Chip color={st.chip} variant="soft" size="sm">{st.label}</Chip>
              <span className="text-caption-sm tabular-nums text-fg-muted">{person.etapasDone}/{person.etapasTotal}</span>
            </div>
            <StepBar total={person.etapasTotal} done={person.etapasDone} />
          </div>

          <div className="hidden shrink-0 flex-col items-end md:flex">
            <span className="text-caption-sm text-fg-muted">comissão</span>
            <span className="text-body-md font-semibold tabular-nums text-fg-default">{brl(person.comissaoAcumulada)}</span>
          </div>

          <ChevronDown className={cn("size-icon-md shrink-0 text-fg-subtle transition-transform", open && "rotate-180")} />
        </div>

        {/* Linha mobile — status, progresso e comissão (escondidos no header em telas pequenas) */}
        <div className="flex w-full flex-col gap-gp-xs border-t border-border-subtle pt-pad-md sm:hidden">
          <div className="flex items-center justify-between gap-gp-sm">
            <Chip color={st.chip} variant="soft" size="sm">{st.label}</Chip>
            <span className="text-caption-sm tabular-nums text-fg-muted">{person.etapasDone}/{person.etapasTotal} etapas</span>
          </div>
          <StepBar total={person.etapasTotal} done={person.etapasDone} />
          <div className="flex items-center justify-between">
            <span className="text-caption-sm text-fg-muted">comissão</span>
            <span className="text-body-sm font-semibold tabular-nums text-fg-default">{brl(person.comissaoAcumulada)}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-gp-lg border-t border-border-subtle p-pad-2xl">
          <div className="grid grid-cols-1 gap-x-gp-2xl gap-y-gp-md sm:grid-cols-2">
            {person.steps.map((s, i) => (
              <StepItem key={s.label} step={s} isNext={i === nextIdx} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-gp-sm rounded-radius-base bg-bg-muted px-pad-lg py-pad-md">
            <span className="text-caption-md text-fg-muted">
              Top-up até <span className="font-semibold text-fg-default">{brl(person.topUp)}</span> ao virar Pré-Sênior
            </span>
            <span className="text-caption-sm text-fg-subtle">Linha: {person.linha}</span>
          </div>
          <div className="flex flex-col gap-gp-sm sm:flex-row sm:justify-end">
            <Button variant="soft" color="success" size="sm" iconLeft={<MessageCircle />} className="w-full sm:w-auto">WhatsApp</Button>
            <Button variant="ghost" color="primary" size="sm" iconRight={<ArrowRight />} className="w-full sm:w-auto">Ver detalhes técnicos</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function OnboardingPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [filter, setFilter] = useState<OnbStatusId | "todos">("todos");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...onboardingV3]
      .sort((a, b) => a.etapasDone - b.etapasDone)
      .filter((p) => (filter === "todos" ? true : statusOf(p).id === filter))
      .filter((p) =>
        q ? p.name.toLowerCase().includes(q) || p.cidade.toLowerCase().includes(q) : true,
      );
  }, [filter, query]);

  return (
    <Panel
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      size="lg"
      title="Missão Pré-Sênior"
      description={`Onboarding dos novos licenciados — últimos ${campaign.janelaDias} dias`}
      titleIcon={Users}
    >
      <div className="flex flex-col gap-gp-2xl">
        {/* Moldura de campanha */}
        <div className="flex flex-wrap items-center justify-between gap-gp-md rounded-radius-lg bg-bg-brand-subtle p-pad-2xl">
          <div className="flex items-center gap-gp-sm">
            <Chip color="success" variant="soft" size="sm">Campanha ativa</Chip>
            <span className="text-body-sm text-fg-muted">termina em {campaign.terminaEmDias} dias</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-title-lg font-bold tabular-nums text-fg-brand">{brl(campaign.totalRecompensas)}</span>
            <span className="text-caption-sm text-fg-muted">total em recompensas</span>
          </div>
        </div>

        {/* Resumo (4) */}
        <div className="grid grid-cols-2 gap-gp-md sm:grid-cols-4">
          <StatTile label="Licenciados" value={String(onboardingV3.length)} hint="em onboarding" />
          <StatTile label="Concluíram" value={`${concluiramCount}/${onboardingV3.length}`} hint="todas as etapas" />
          <StatTile label="Progresso médio" value={`${progressoMedio}%`} hint={`${pendingMissions} missões pendentes`} />
          <StatTile label="Comissão total" value={brl(comissaoTotal)} hint="acumulada na linha" />
        </div>

        {/* Busca + filtros */}
        <div className="flex flex-col gap-gp-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-pad-lg top-1/2 size-icon-sm -translate-y-1/2 text-fg-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou cidade…"
              className="pl-[40px]"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as OnbStatusId | "todos")}>
            <TabsList>
              {FILTERS.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>{f.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-gp-md">
          {list.length > 0 ? (
            list.map((p) => <PersonCard key={p.id} person={p} />)
          ) : (
            <div className="grid place-items-center py-pad-6xl text-center">
              <p className="text-body-sm text-fg-muted">Ninguém encontrado com esse filtro.</p>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
