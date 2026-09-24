"use client";

import { createContext } from "react";
import { cn } from "@/lib/utils";
import { kpiGroup } from "./kpi.styles";
import type { KpiGroupProps } from "./kpi.types";

/** Superfície herdada pelos `Kpi` filhos (card normal vs plain dentro de divided). */
export const KpiSurfaceContext = createContext<"card" | "plain">("card");

/**
 * KpiGroup — layout de composição pros `Kpi`. `columns` (responsivo por CONTAINER
 * QUERY) e `divided` (vira 1 card único com divisórias entre os KPIs).
 *
 * ⚠️ O `@container` vive num wrapper em volta do grid, e não no próprio grid: em CSS
 * um elemento NÃO consulta o próprio tamanho — `@container` marca o contexto pros
 * DESCENDENTES. Grid e wrapper no mesmo nó fariam as variantes `@md:`/`@3xl:` lerem o
 * container de fora (ou nenhum), e o layout voltaria a quebrar pelo motivo errado.
 *
 * O `className` continua indo pro GRID, como antes — ninguém precisa mudar chamada.
 */
export function KpiGroup({
  columns = 4,
  divided = false,
  children,
  className,
}: KpiGroupProps) {
  const s = kpiGroup({ columns, divided });

  return (
    <KpiSurfaceContext.Provider value={divided ? "plain" : "card"}>
      <div className={s.wrapper()}>
        <div className={cn(s.grid(), className)}>
          {children}
        </div>
      </div>
    </KpiSurfaceContext.Provider>
  );
}

KpiGroup.displayName = "KpiGroup";
