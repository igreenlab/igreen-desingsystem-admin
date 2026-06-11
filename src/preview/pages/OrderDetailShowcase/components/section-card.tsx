import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card de seção flat — bg-surface + borda sutil, sem elevação pesada.
 * Espelha o visual dos blocos da referência (Products ordered, Customer, etc).
 * Composição local do showcase consumindo tokens DS via classes.
 */
export function SectionCard({
  title,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const hasHeader = !!(title || action);
  const header = hasHeader && (
    // Header: padding 16px (pad-2xl) + divider full-bleed embaixo.
    <header className="flex items-center justify-between gap-gp-md border-b border-border-subtle p-pad-2xl">
      {/* gap ícone↔título = 12px (gap-gp-md) */}
      <div className="flex items-center gap-gp-md">
        {icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-radius-md bg-bg-muted text-fg-muted">
            {icon}
          </span>
        )}
        {title && (
          <h2 className="text-title-md font-semibold text-fg-default">
            {title}
          </h2>
        )}
      </div>
      {action}
    </header>
  );

  return (
    <section className={cn("rounded-radius-lg border border-border-subtle bg-bg-surface", className)}>
      {header}
      {/* body: padding 16px (pad-2xl) — uniforme; abaixo do divider quando há header */}
      <div className={cn("p-pad-2xl", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Divisória sutil de seção. `my` controla o respiro vertical (default md). */
export function SectionDivider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border-subtle", className)} />;
}

/** Par label-uppercase + valor (grid de Customer/Shipping/Billing Information). */
export function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  /** Destaca o valor com a cor de marca (links, ids de transação, etc). */
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-gp-2xs">
      <span className="text-caption-sm font-medium uppercase tracking-wider text-fg-muted">
        {label}
      </span>
      <span
        className={cn(
          "text-body-md",
          accent ? "text-fg-brand" : "text-fg-default",
        )}
      >
        {value}
      </span>
    </div>
  );
}
