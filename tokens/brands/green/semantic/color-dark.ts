/**
 * color-dark.ts — Semantic color tokens (dark) — BRAND "green" (multi-tema)
 * Tier 2 de 3: intenção. API pública.
 *
 * Irmã da brand "blue" — hue VERDE-GRAMA (~142), chroma alto → dark claramente
 * VERDE (green-black), com marca verde brilhante distinta do emerald da iGreen.
 */

import {
  brandContrast, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

/**
 * Overlay tingido de verde (substitui o branco puro dos overlays de opacidade).
 * Chroma alto (verde pesa menos que azul) pra que muted/emphasis/accent, bordas
 * subtle/input e o card ring leiam VERDE sobre a surface green-black.
 */
const tint = (alpha: number) => `oklch(0.90 0.08 142 / ${alpha})`;

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces dark claramente verdes (green-black) — profundidade do default
  canvas:           gray[900],                   // tinted via primitive (L 0.205)
  surface:          "oklch(0.225 0.030 142)",    // cards, drawer — dark verde nítido
  "surface-elevated": "oklch(0.225 0.030 142)",
  "surface-panels": gray[900],
  sidebar:          "oklch(0.225 0.030 142)",

  subtle:   tint(0.01),
  muted:    tint(0.03),
  emphasis: tint(0.12),
  input:    tint(0.04),
  accent:   tint(0.12),

  // Brand (dark usa brandContrast — VERDE brilhante nesta marca)
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

  "table":            "oklch(0.225 0.030 142)",
  "table-head":       "oklch(0.252 0.034 142)",
  "table-row-hover":  "oklch(0.252 0.034 142)",
  "table-row-selected":       `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  "table-row-selected-solid":       `color-mix(in srgb, ${brandContrast[400]} 10%, oklch(0.225 0.030 142))`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brandContrast[400]} 14%, oklch(0.225 0.030 142))`,

  "dropdown":         "color-mix(in oklab, var(--color-bg-canvas) 70%, transparent)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  strong:  white,
  default: "oklch(0.98 0.012 142)",   // texto near-white com tom verde
  muted:   gray[400],
  subtle:  `color-mix(in oklch, ${gray[400]} 70%, transparent)`,
  disabled: gray[600],

  brand: brandContrast[400],

  danger:  danger[500],
  success: success[500],
  warning: warning[500],
  info:    info[500],

  "on-brand":   black,          // preto sobre verde brilhante
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

// ─── Chart (chart-1 ancora na brand VERDE) ────────────────────────────────────
export const chart = {
  "1": brandContrast[400],     // verde-grama da marca (dark)
  "2": "oklch(0.72 0.13 195)", // teal
  "3": "oklch(0.68 0.15 250)", // azul
  "4": "oklch(0.80 0.15 80)",  // âmbar
  "5": "oklch(0.70 0.17 300)", // violeta
  grid: tint(0.12),
} as const;

export const colorDark = { bg, fg, border, ring, overlay, chart };
