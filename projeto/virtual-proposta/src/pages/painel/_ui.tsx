import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Superfície de card padrão do app (tokens DS, dark-aware). */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-radius-lg border border-border-default bg-bg-surface shadow-sh-sm",
        "p-pad-card-base",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Rótulo de região (uppercase + hint) — separa blocos da tela. */
export function SectionLabel({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline gap-gp-sm">
      <h2 className="text-caption-md font-semibold uppercase tracking-wide text-fg-muted">
        {title}
      </h2>
      {hint && <span className="text-body-sm text-fg-subtle">{hint}</span>}
    </div>
  );
}

/** Cabeçalho interno de card (título + subtítulo + slot à direita). */
export function CardHead({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-gp-md">
      <div className="min-w-0">
        <h3 className="text-title-md font-semibold text-fg-default">{title}</h3>
        {subtitle && <p className="text-body-sm text-fg-muted">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
