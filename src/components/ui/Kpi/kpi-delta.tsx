"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/Chip";
import type { KpiDeltaProps } from "./kpi.types";

/**
 * KpiDelta — pílula de variação (sobre o Chip). Tom semântico explícito
 * (success/danger/neutral) + seta opcional. O tom é decisão do consumidor —
 * "subir" nem sempre é positivo (ex.: tempo de espera).
 *
 * `signed` deriva tom+seta do sinal do `value` ("-" → danger/down; senão
 * success/up). `tone`/`direction` explícitos sempre vencem.
 */
export function KpiDelta({
  value,
  tone,
  direction,
  signed = false,
  className,
}: KpiDeltaProps) {
  const isNegative =
    signed && typeof value === "string" && value.trim().startsWith("-");
  const resolvedTone = tone ?? (signed ? (isNegative ? "danger" : "success") : "success");
  const resolvedDirection = direction ?? (signed ? (isNegative ? "down" : "up") : undefined);

  return (
    <Chip
      color={resolvedTone}
      variant="soft"
      size="sm"
      shape="pill"
      className={className}
    >
      {resolvedDirection && (
        <TrendingUp
          className={cn("size-[12px]", resolvedDirection === "down" && "rotate-180")}
          aria-hidden
        />
      )}
      {value}
    </Chip>
  );
}

KpiDelta.displayName = "KpiDelta";
