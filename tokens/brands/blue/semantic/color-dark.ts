/**
 * color-dark.ts — Semantic color tokens (dark) — BRAND "blue" (teste multi-tema)
 * Tier 2 de 3: intenção. API pública.
 *
 * Cópia self-contained da default. Dark usa brandContrast (azul brilhante)
 * em vez de brand. Import relativo dentro da marca → puxa o brandContrast AZUL.
 */

import {
  brandContrast, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

/**
 * Overlay tingido de azul (substitui o branco puro dos overlays de opacidade).
 * No dark, superfícies como muted/emphasis/accent, bordas subtle/input e o
 * card ring vêm de um branco-alpha. Branco sobre a surface navy DESSATURA e vira
 * mancha cinza que salta (bug reportado). Usar um near-white AZUL mantém o overlay
 * na família da marca → funde igual ao green (que é neutro sobre neutro).
 */
const tint = (alpha: number) => `oklch(0.92 0.035 264 / ${alpha})`;

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces dark tingidas de azul (blue-black) — profundidade do default + tint sutil
  canvas:           gray[900],                   // tinted via primitive (L 0.205)
  surface:          "oklch(0.225 0.014 264)",    // cards, drawer — mesma profundidade do default
  "surface-elevated": "oklch(0.225 0.014 264)",
  "surface-panels": gray[900],
  sidebar:          "oklch(0.225 0.014 264)",

  subtle:   tint(0.01),
  muted:    tint(0.03),
  emphasis: tint(0.12),
  input:    tint(0.04),
  accent:   tint(0.12),

  // Brand (dark usa brandContrast — AZUL brilhante nesta marca)
  brand:            brandContrast[400],
  "brand-subtle":   `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  "brand-hover":    `color-mix(in oklch, ${brandContrast[400]} 90%, black)`,
  "brand-subtle-hover": `color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,

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

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 14%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, white)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 22%, transparent)`,

  "muted-hover":  tint(0.08),
  "input-hover":  tint(0.08),
  "accent-hover": tint(0.16),

  "sidebar-accent":       tint(0.08),
  "sidebar-accent-hover": tint(0.12),

  "table":            "oklch(0.225 0.014 264)",
  "table-head":       "oklch(0.252 0.016 264)",
  "table-row-hover":  "oklch(0.252 0.016 264)",
  "table-row-selected":       `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  "table-row-selected-solid":       `color-mix(in srgb, ${brandContrast[400]} 10%, oklch(0.225 0.014 264))`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brandContrast[400]} 14%, oklch(0.225 0.014 264))`,

  "dropdown":         "color-mix(in oklab, var(--color-bg-canvas) 70%, transparent)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  strong:  white,
  default: "oklch(0.98 0.004 264)",   // texto near-white com tom azul mínimo
  muted:   gray[400],
  subtle:  `color-mix(in oklch, ${gray[400]} 70%, transparent)`,
  disabled: gray[600],

  brand: brandContrast[400],

  danger:  danger[500],
  success: success[500],
  warning: warning[500],
  info:    info[500],

  "on-brand":   black,          // preto sobre azul brilhante
  "on-danger":  white,
  "on-success": black,
  "on-warning": black,
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
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  table: gray[800],
} as const;

// ─── Ring (focus rings) ────────────────────────────────────────────────────────

export const ring = {
  brand:     `color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,
  danger:    `color-mix(in oklch, ${danger[500]} 22%, transparent)`,
  success:   `color-mix(in oklch, ${success[500]} 22%, transparent)`,
  warning:   `color-mix(in oklch, ${warning[500]} 22%, transparent)`,
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
  "1": brandContrast[400],     // azul da marca (dark)
  "2": "oklch(0.72 0.13 195)", // teal
  "3": "oklch(0.68 0.15 250)", // azul
  "4": "oklch(0.80 0.15 80)",  // âmbar
  "5": "oklch(0.70 0.17 300)", // violeta
  grid: tint(0.12),
} as const;

export const colorDark = { bg, fg, border, ring, overlay, chart };
