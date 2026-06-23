"use client";

import { createContext } from "react";
import { cn } from "@/lib/utils";
import { kpiGroup } from "./kpi.styles";
import type { KpiGroupProps } from "./kpi.types";

/** Superfície herdada pelos `Kpi` filhos (card normal vs plain dentro de divided). */
export const KpiSurfaceContext = createContext<"card" | "plain">("card");

/**
 * KpiGroup — layout de composição pros `Kpi`. `columns` (responsivo) e
 * `divided` (vira 1 card único com divisórias entre os KPIs).
 */
export function KpiGroup({
  columns = 4,
  divided = false,
  children,
  className,
}: KpiGroupProps) {
  return (
    <KpiSurfaceContext.Provider value={divided ? "plain" : "card"}>
      <div className={cn(kpiGroup({ columns, divided }), className)}>
        {children}
      </div>
    </KpiSurfaceContext.Provider>
  );
}

KpiGroup.displayName = "KpiGroup";
