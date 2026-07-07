import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import {
  ATIVIDADES,
  atividadesIniciadas,
  type ProMakerConsultor,
} from "./pro-maker-mock";

/* ════════════════════════════════════════════════════════════════════
   UI compartilhada do Pro Maker (página + detail panel) — espelha a
   "Missão Pré-Sênior" (painel-v3 / OnboardingSummary).
   ════════════════════════════════════════════════════════════════════ */

export type StatusId = "pro" | "construindo" | "parado";

export function statusOf(c: ProMakerConsultor): { id: StatusId; label: string } {
  if (c.isPro) return { id: "pro", label: "É PRO" };
  if (atividadesIniciadas(c) > 0)
    return { id: "construindo", label: "Em construção" };
  return { id: "parado", label: "Não iniciado" };
}

/* Badge de status via <Chip> (consistente com o exemplo finance): soft · pill · sm. */
const STATUS_CHIP: Record<StatusId, "success" | "warning" | "neutral"> = {
  parado: "neutral",
  construindo: "warning",
  pro: "success",
};

export function initialsOf(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/* ── pills / meta ────────────────────────────────────────────────────── */
export function Pill({
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

export function StatusPill({ c }: { c: ProMakerConsultor }) {
  const st = statusOf(c);
  return (
    <Chip color={STATUS_CHIP[st.id]} variant="soft" size="sm" shape="pill">
      {st.label}
    </Chip>
  );
}

export function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-caption-sm text-fg-muted [&>svg]:size-icon-xs [&>svg]:text-fg-subtle">
      {icon}
      {children}
    </span>
  );
}

/* ── StepBar (N segmentos; preenchido = concluído) ───────────────────── */
export function StepBar({
  total,
  done,
  className,
}: {
  total: number;
  done: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex gap-[3px]", className)}
      role="img"
      aria-label={`${done} de ${total} etapas concluídas`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "h-[6px] flex-1 rounded-radius-full",
            i < done ? "bg-bg-brand" : "bg-bg-muted",
          )}
        />
      ))}
    </div>
  );
}

/* ── badge de quantidade (0/5) — espelha ProgressBadge da OnboardingSummary ── */
export function ProgressBadge({ atual, meta }: { atual: number; meta: number }) {
  if (atual > 0 && atual >= meta) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-radius-full bg-bg-success-muted px-pad-sm py-[1px] text-caption-sm font-semibold tabular-nums text-fg-success">
        {atual}/{meta}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-radius-full bg-bg-canvas px-pad-sm py-[1px] text-caption-sm font-semibold tabular-nums text-fg-muted">
      <span className={cn(atual > 0 && "text-fg-warning")}>{atual}</span>
      <span>/{meta}</span>
    </span>
  );
}

/* ── card de missão — pendente / em andamento (anel âmbar) / concluído ── */
export function MissionCard({
  atividade,
  atual,
}: {
  atividade: (typeof ATIVIDADES)[number];
  atual: number;
}) {
  const done = atual >= atividade.meta;
  const inProgress = !done && atual > 0;
  const pct = atividade.meta ? Math.round((atual / atividade.meta) * 100) : 0;

  const statusText = done ? "Concluído" : inProgress ? "Em andamento" : "Pendente";
  const statusClass = done
    ? "text-fg-success"
    : inProgress
      ? "text-fg-warning"
      : "text-fg-subtle";

  return (
    <div
      className={cn(
        "flex items-center gap-gp-md rounded-radius-base border px-pad-2xl py-pad-lg",
        done
          ? "border-border-default bg-bg-muted"
          : "border-border-subtle bg-bg-subtle",
      )}
    >
      {done ? (
        <span className="grid size-[18px] shrink-0 place-items-center rounded-radius-full bg-bg-success text-fg-on-success">
          <Check className="size-[12px]" strokeWidth={3} />
        </span>
      ) : inProgress ? (
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
            {atividade.label}
          </span>
          <ProgressBadge atual={atual} meta={atividade.meta} />
        </div>
        <span className={cn("text-caption-sm leading-tight", statusClass)}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
