"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/Chip";
import type { KpiDeltaProps } from "./kpi.types";

/**
 * KpiDelta — pílula de variação (sobre o Chip). Tom semântico explícito
 * (success/danger/neutral) + seta opcional. O tom é decisão do consumidor —
 * "subir" nem sempre é positivo (ex.: tempo de espera).
 */
export function KpiDelta({
  value,
  tone = "success",
  direction,
  className,
}: KpiDeltaProps) {
  return (
    <Chip
      color={tone}
      variant="soft"
      size="sm"
      shape="pill"
      className={className}
    >
      {direction && (
        <TrendingUp
          className={cn("size-[12px]", direction === "down" && "rotate-180")}
          aria-hidden
        />
      )}
      {value}
    </Chip>
  );
}

KpiDelta.displayName = "KpiDelta";
