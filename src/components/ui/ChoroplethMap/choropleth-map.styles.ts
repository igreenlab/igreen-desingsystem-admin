import { tv, type VariantProps } from "@/utils/tv";

/**
 * ChoroplethMap — primitiva genérica de mapa coroplético (regiões coloridas por
 * valor). O SHELL (container, svg, traço das divisas, legenda, tooltip) é 100%
 * token DS aqui; a COR de preenchimento por região é data-driven e vai inline
 * (derivada de tokens via `color-mix` — ver `choropleth-map.tsx`), análogo ao
 * `Avatar.colorHex` (L-027): valor externo/contínuo não vira classe utilitária.
 */
export const choroplethStyles = tv({
  slots: {
    root: "relative w-full",
    svg: "block h-auto w-full",
    // Traço das divisas — token de borda; hover reforça no próprio path (inline).
    path: [
      "stroke-border-default",
      "transition-[fill,stroke] duration-150",
      "hover:stroke-fg-brand",
    ],
    // Camada de ancoragem do tooltip (não intercepta o mouse).
    tooltipLayer: "pointer-events-none absolute inset-0",
    tooltipAnchor: "absolute",
    tooltipName: "font-semibold text-fg-default",
    tooltipValue: "text-fg-muted",
    legend: "mt-gp-md flex flex-col gap-gp-xs",
    legendTitle: "text-caption-sm font-semibold text-fg-muted",
    legendBar: "h-gp-md w-full rounded-radius-full",
    legendScale: "flex items-center justify-between text-caption-xs text-fg-muted tabular-nums",
  },
});

export type ChoroplethStylesProps = VariantProps<typeof choroplethStyles>;
