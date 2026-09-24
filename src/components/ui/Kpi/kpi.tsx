"use client";

import { useContext } from "react";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { ClickableSurface } from "@/components/shadcn/clickable-surface";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { kpi } from "./kpi.styles";
import { KpiSurfaceContext } from "./kpi-group";
import type { KpiProps } from "./kpi.types";

/**
 * Kpi — card de KPI composável: header (label + ícone por tone), valor +
 * delta, hint, slot livre (sparkline/chart) e footnote. Use dentro de
 * `KpiGroup` pra rows/grids; dentro de `KpiGroup divided` ele vira "plain".
 *
 * Com `onClick`/`href` o card inteiro vira alvo de drill-down — ver `ClickableSurface`
 * pra por que a raiz continua `<article>`.
 */
export function Kpi({
  label,
  value,
  delta,
  hint,
  helperText,
  icon,
  tone = "neutral",
  size = "md",
  footnote,
  children,
  surface,
  onClick,
  href,
  target,
  renderLink,
  className,
}: KpiProps) {
  const inherited = useContext(KpiSurfaceContext);
  const interactive = Boolean(onClick || href);
  const s = kpi({ size, surface: surface ?? inherited, tone, interactive });

  return (
    <article className={cn(s.root(), className)}>
      <header className={s.header()}>
        <div className="flex min-w-0 items-start gap-gp-xs">
          <h3 className={s.label()}>{label}</h3>
          {helperText && (
            <Tooltip>
              <TooltipTrigger
                type="button"
                className={s.helpButton()}
                aria-label={`Ajuda sobre ${label}`}
              >
                <HelpCircle aria-hidden />
              </TooltipTrigger>
              <TooltipContent>{helperText}</TooltipContent>
            </Tooltip>
          )}
        </div>
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
      <ClickableSurface
        label={label}
        onClick={onClick}
        href={href}
        target={target}
        renderLink={renderLink}
      />
    </article>
  );
}

Kpi.displayName = "Kpi";
