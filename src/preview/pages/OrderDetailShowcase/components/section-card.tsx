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
  dense,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Padding interno menor (20px em vez de 24px) — telas mais densas. */
  dense?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-radius-lg border border-border-subtle bg-bg-surface",
        dense ? "p-pad-3xl" : "p-pad-4xl",
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-gp-2xl flex items-center justify-between gap-gp-md">
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
      )}
      <div className={bodyClassName}>{children}</div>
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
