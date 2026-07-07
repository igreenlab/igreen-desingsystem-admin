import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card de seção — espelha o padrão do DashboardShowcase do DS:
 * superfície sutil, head discreto (título body-md/medium + subtítulo body-xs/muted),
 * slot de ação à direita. A hierarquia vem do spacing/PageHeader, não de heads gritantes.
 */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-gp-2xl rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-gp-md">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <h3 className="m-0 text-body-md font-medium text-fg-default">
            {title}
          </h3>
          {subtitle && (
            <p className="m-0 text-body-xs text-fg-muted">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}

/** Ponto de legenda + rótulo. `colorClass` = classe bg de token (ex.: "bg-chart-1"). */
export function LegendDot({
  colorClass,
  children,
}: {
  colorClass: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-[5px] text-caption-sm text-fg-muted">
      <span
        className={cn("size-[8px] rounded-radius-full", colorClass)}
        aria-hidden
      />
      {children}
    </span>
  );
}

export type StackSegment = { label: string; value: number; colorClass: string };

/** Barra empilhada (split por dimensão) + legenda — padrão "Key Insights" do DS. */
export function StackBar({ segments }: { segments: StackSegment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex flex-col gap-gp-md">
      <div className="flex h-[8px] gap-[2px] overflow-hidden rounded-radius-full bg-bg-muted">
        {segments.map((s) => (
          <span
            key={s.label}
            className={s.colorClass}
            style={{ flex: s.value }}
            aria-hidden
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-gp-lg">
        {segments.map((s) => (
          <LegendDot key={s.label} colorClass={s.colorClass}>
            {s.label}{" "}
            <span className="font-medium text-fg-default">
              {s.value.toLocaleString("pt-BR")}
            </span>
            <span className="text-fg-subtle">
              {" "}
              · {Math.round((s.value / total) * 100)}%
            </span>
          </LegendDot>
        ))}
      </div>
    </div>
  );
}

/** Métrica inline rotulada (label em cima, valor embaixo). */
export function MiniStat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-caption-md text-fg-muted">{label}</span>
      <span
        className={cn(
          "text-title-md font-semibold tabular-nums text-fg-default",
          valueClass,
        )}
      >
        {value}
      </span>
    </div>
  );
}
