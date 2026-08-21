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
    // Wrapper do svg + camada de tooltip: garante que o inset-0 da camada
    // cubra EXATAMENTE a área do mapa (sem ele, a camada cobria root inteiro
    // — incluindo a legenda — e as % de posição saíam deslocadas).
    canvas: "relative",
    svg: "block h-auto w-full",
    // Traço das divisas — `fg-muted` (mid-gray VISÍVEL nos DOIS temas: L≈0.50
    // no light, L≈0.70 no dark). `border-default` era L≈0.91 no light → as
    // divisas sumiam no fundo branco e só estados de alta penetração apareciam
    // ("só 2 pontos"). hover reforça no próprio path (inline).
    path: [
      "stroke-fg-muted",
      "transition-[fill,stroke] duration-150",
    ],
    // Realce da região sob hover — uma CÓPIA do path desenhada por cima de
    // todas as outras. Necessário porque stroke de path SVG é coberto pelos
    // vizinhos desenhados depois: no próprio path, o contorno nunca fecha a
    // região inteira ("mal delimitada"). Não intercepta o mouse (o fill de
    // tinta vai inline, derivado do scaleToken via color-mix).
    pathHighlight: "pointer-events-none stroke-fg-brand",
    // Seleção persistente (selectedId) — mesma técnica do hover (cópia por
    // cima), tinta mais forte pra diferenciar do transitório.
    pathSelected: "pointer-events-none stroke-fg-brand",
    // Camada do tooltip (não intercepta o mouse — nem ela nem o filho).
    tooltipLayer: "pointer-events-none absolute inset-0",
    // Tooltip PRÓPRIO, não Radix: renderizado dentro da camada acima, segue o
    // cursor e só troca o conteúdo. O Tooltip do DS portala o conteúdo num
    // wrapper do popper que captura o mouse — cursor movendo NA DIREÇÃO do
    // tooltip o alcançava → mouseleave do svg → fecha/reabre em loop (flicker
    // dependente de direção). Superfície = mesma receita sólida de antes.
    tooltip: [
      "pointer-events-none absolute z-10 w-max max-w-[16rem] select-none",
      "rounded-radius-md border border-border-default bg-bg-surface-elevated",
      "px-pad-lg py-pad-xs text-caption-sm shadow-sh-lg",
    ],
    tooltipName: "font-semibold text-fg-default",
    tooltipValue: "text-fg-muted",
    legend: "mt-gp-md flex flex-col gap-gp-xs",
    legendTitle: "text-caption-sm font-semibold text-fg-muted",
    legendBar: "h-gp-md w-full rounded-radius-full",
    legendScale: "flex items-center justify-between text-caption-xs text-fg-muted tabular-nums",
  },
});

export type ChoroplethStylesProps = VariantProps<typeof choroplethStyles>;
