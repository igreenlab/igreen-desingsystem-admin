/**
 * color-dark.ts — Semantic color tokens (dark) — BRAND "anydocs" (Anydocs)
 * Tier 2 de 3: intenção. API pública.
 *
 * ⚠️ ESTE É O MODO OFICIAL DA ANYDOCS. O produto em produção é dark-only; o light
 * existe pra cumprir o contrato do DS e está marcado como não-validado-em-produto
 * no `color-light.ts`.
 *
 * Cópia self-contained da default. Dark usa `brandContrast` em vez de `brand`.
 * Import relativo dentro da marca → puxa o brandContrast ROXO.
 *
 * Valores medidos no produto (anydocsai.com.br, 2026-10-01):
 *   canvas  #0B0B14 → gray[900]  (a landing; o app usa #000000 puro — ver nota)
 *   surface #18181B → literal abaixo
 *   texto   #ECEDEE → fg.default
 *
 * O app usa `#000000` puro no canvas e isso comprime a hierarquia obrigatória
 * `canvas < surface < subtle < muted` (L-008) de 4 degraus em 3 — não há espaço
 * abaixo do preto. O `#0B0B14` é o canvas que a própria landing da Anydocs já usa
 * e devolve o degrau. Decisão tomada no gate, não inferida.
 */

import {
  brandContrast, gray, success, warning, caution, danger, info,
  white, black,
} from "../primitives/color-palette";

/**
 * Overlay tingido de violeta (substitui o branco puro dos overlays de opacidade).
 * No dark, superfícies como muted/emphasis/accent, bordas subtle/input e o
 * card ring vêm de um branco-alpha. Branco sobre a surface navy DESSATURA e vira
 * mancha cinza que salta (bug reportado). Usar um near-white AZUL mantém o overlay
 * na família da marca → funde igual ao green (que é neutro sobre neutro).
 */
const tint = (alpha: number) => `oklch(0.92 0.030 290 / ${alpha})`;

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces dark tingidas de violeta — valores medidos em produção (ver cabeçalho)
  canvas:           gray[900],                   // #0b0b14 medido — ver cabeçalho
  surface:          "oklch(0.2103 0.006 290)",    // #18181b medido em produção
  "surface-elevated": "oklch(0.2103 0.006 290)",
  "surface-panels": gray[900],
  sidebar:          "oklch(0.2103 0.006 290)",

  subtle:   tint(0.01),
  muted:    tint(0.03),
  emphasis: tint(0.12),
  input:    tint(0.04),
  accent:   tint(0.12),

  // Brand (dark usa brandContrast — AZUL brilhante nesta marca)
  brand:            brandContrast[500],
  "brand-subtle":   `color-mix(in oklch, ${brandContrast[500]} 14%, transparent)`,
  "brand-hover":    `color-mix(in oklch, ${brandContrast[500]} 90%, black)`,
  "brand-subtle-hover": `color-mix(in oklch, ${brandContrast[500]} 22%, transparent)`,

  danger:                danger[500],
  "danger-muted":        `color-mix(in oklch, ${danger[500]} 14%, transparent)`,
  "danger-hover":        `color-mix(in oklch, ${danger[500]} 90%, white)`,
  "danger-muted-hover":  `color-mix(in oklch, ${danger[500]} 22%, transparent)`,

  success:                success[500],
  "success-muted":        `color-mix(in oklch, ${success[500]} 14%, transparent)`,
  "success-hover":        `color-mix(in oklch, ${success[500]} 90%, white)`,
  "success-muted-hover":  `color-mix(in oklch, ${success[500]} 22%, transparent)`,

  warning:                warning[500],
  "warning-muted":        `color-mix(in oklch, ${warning[500]} 14%, transparent)`,
  "warning-hover":        `color-mix(in oklch, ${warning[500]} 90%, white)`,
  "warning-muted-hover":  `color-mix(in oklch, ${warning[500]} 22%, transparent)`,

  caution:                caution[500],
  "caution-muted":        `color-mix(in oklch, ${caution[500]} 14%, transparent)`,
  "caution-hover":        `color-mix(in oklch, ${caution[500]} 90%, white)`,
  "caution-muted-hover":  `color-mix(in oklch, ${caution[500]} 22%, transparent)`,

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 14%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, white)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 22%, transparent)`,

  "muted-hover":  tint(0.08),
  // Scrollbar: contraste PRÓPRIO, independente da cor de superfície da marca — por isso
  // alpha neutro, não um token de bg. O @utility usava bg.muted-hover, que no light é
  // cinza OPACO sobre branco: a barra sumia no consumidor (o showcase mascarava com um
  // override hardcoded no globals.css). Medido e corrigido em 2026-08-08.
  "scrollbar-thumb":       "oklch(1 0 0 / 0.24)",
  "scrollbar-thumb-hover": "oklch(1 0 0 / 0.32)",
  "input-hover":  tint(0.08),
  "accent-hover": tint(0.16),

  "sidebar-accent":       tint(0.08),
  "sidebar-accent-hover": tint(0.12),

  "table":            "oklch(0.2103 0.006 290)",
  "table-head":       "oklch(0.252 0.008 290)",
  "table-row-hover":  "oklch(0.252 0.008 290)",
  "table-row-selected":       `color-mix(in oklch, ${brandContrast[500]} 10%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brandContrast[500]} 14%, transparent)`,
  "table-row-selected-solid":       `color-mix(in srgb, ${brandContrast[500]} 10%, oklch(0.2103 0.006 290))`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brandContrast[500]} 14%, oklch(0.2103 0.006 290))`,

  "dropdown":         "color-mix(in oklab, var(--color-bg-canvas) 70%, transparent)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  strong:  white,
  default: "oklch(0.9456 0.002 290)",   // #ecedee medido em produção
  muted:   gray[400],
  subtle:  `color-mix(in oklch, ${gray[400]} 70%, transparent)`,
  disabled: gray[600],

  brand: brandContrast[400],

  danger:  danger[500],
  success: success[500],
  warning: warning[500],
  caution: caution[500],
  info:    info[500],

  "on-brand":   white,          // 4.75:1 sobre o #9353D3; `black` daria 4.42:1 e reprova AA
  "on-danger":  white,
  "on-success": black,
  "on-warning": black,
  "on-caution": black,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

export const border = {
  default: gray[800],
  subtle:  tint(0.04),
  input:   tint(0.08),
  sidebar: gray[800],

  brand:           brandContrast[400],
  "brand-subtle":  `color-mix(in oklch, ${brandContrast[400]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[500]} 36%, transparent)`,
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "caution-muted": `color-mix(in oklch, ${caution[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  table: gray[800],
} as const;

// ─── Ring (focus rings) ────────────────────────────────────────────────────────

export const ring = {
  brand:     `color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,
  danger:    `color-mix(in oklch, ${danger[500]} 22%, transparent)`,
  success:   `color-mix(in oklch, ${success[500]} 22%, transparent)`,
  warning:   `color-mix(in oklch, ${warning[500]} 22%, transparent)`,
  caution:   `color-mix(in oklch, ${caution[500]} 22%, transparent)`,
  info:      `color-mix(in oklch, ${info[500]} 22%, transparent)`,
  secondary: `color-mix(in oklch, ${gray[500]} 22%, transparent)`,
} as const;

// ─── Overlay / Scrim ──────────────────────────────────────────────────────────

export const overlay = {
  scrim: "oklch(0 0 0 / 0.55)",
  float: tint(0.08),
} as const;

// ─── Chart (chart-1 ancora na brand AZUL) ─────────────────────────────────────
export const chart = {
  "1": brandContrast[500],     // roxo da marca (dark) — o preenchimento fiel #9353d3
  "2": "oklch(0.72 0.13 195)", // teal
  "3": "oklch(0.68 0.15 250)", // azul (harmônica da paleta categórica)
  "4": "oklch(0.80 0.15 80)",  // âmbar
  "5": "oklch(0.70 0.17 300)", // violeta
  grid: tint(0.12),
} as const;

export const colorDark = { bg, fg, border, ring, overlay, chart };
