"use client";

import { useContext } from "react";
import { cn } from "@/lib/utils";
import { kpi } from "./kpi.styles";
import { KpiSurfaceContext } from "./kpi-group";
import type { KpiProps } from "./kpi.types";

/**
 * Kpi — card de KPI composável: header (label + ícone por tone), valor +
 * delta, hint, slot livre (sparkline/chart) e footnote. Use dentro de
 * `KpiGroup` pra rows/grids; dentro de `KpiGroup divided` ele vira "plain".
 */
export function Kpi({
  label,
  value,
  delta,
  hint,
  icon,
  tone = "neutral",
  size = "md",
  footnote,
  children,
  surface,
  className,
}: KpiProps) {
  const inherited = useContext(KpiSurfaceContext);
  const s = kpi({ size, surface: surface ?? inherited, tone });

  return (
    <article className={cn(s.root(), className)}>
      <header className={s.header()}>
        <h3 className={s.label()}>{label}</h3>
        {icon && (
          <span className={s.iconBox()} aria-hidden>
            {icon}
          </span>
        )}
      </header>
      <div className={s.main()}>
        <div className={s.valueRow()}>
          <span className={s.value()}>{value}</span>
          {delta}
        </div>
        {hint && <span className={s.hint()}>{hint}</span>}
      </div>
      {children && <div className={s.chart()}>{children}</div>}
      {footnote && <div className={s.footnote()}>{footnote}</div>}
    </article>
  );
}

Kpi.displayName = "Kpi";
