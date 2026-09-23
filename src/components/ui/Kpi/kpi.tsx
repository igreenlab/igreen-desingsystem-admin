"use client";

import { useContext, type MouseEvent } from "react";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { shouldPreventNavigation } from "@/utils/nav-link";
import { kpi } from "./kpi.styles";
import { KpiSurfaceContext } from "./kpi-group";
import type { KpiProps } from "./kpi.types";

/**
 * Kpi — card de KPI composável: header (label + ícone por tone), valor +
 * delta, hint, slot livre (sparkline/chart) e footnote. Use dentro de
 * `KpiGroup` pra rows/grids; dentro de `KpiGroup divided` ele vira "plain".
 *
 * Com `onClick`/`href` o card inteiro vira alvo de drill-down — ver `overlay` em
 * `kpi.styles.ts` pra por que a raiz continua `<article>`.
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

  const aoClicarNoLink = (e: MouseEvent<HTMLAnchorElement>) => {
    // Sem `renderLink`, o `<a>` nativo navega — a não ser que exista handler do
    // consumidor E o clique seja um clique simples, de rota interna. As exceções
    // (tecla modificada, target, href externo, href de hash) estão na L-068, medidas
    // uma a uma; não reimplemente aqui.
    if (
      shouldPreventNavigation({
        href,
        hasHandler: Boolean(onClick),
        target,
        event: e,
      })
    ) {
      e.preventDefault();
    }
    onClick?.(e);
  };

  const overlay = (() => {
    if (!interactive) return null;
    if (href) {
      const props = {
        href,
        className: s.overlay(),
        onClick: aoClicarNoLink,
        target,
        "aria-label": label,
      };
      // Com `renderLink` quem decide navegação é o `<Link>` do router — o DS não mexe
      // em preventDefault (mesma regra do AppShell).
      return renderLink ? (
        renderLink({ ...props, onClick: (e) => onClick?.(e) })
      ) : (
        <a {...props} />
      );
    }
    return (
      <button
        type="button"
        className={s.overlay()}
        onClick={onClick}
        aria-label={label}
      />
    );
  })();

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
      {overlay}
    </article>
  );
}

Kpi.displayName = "Kpi";
