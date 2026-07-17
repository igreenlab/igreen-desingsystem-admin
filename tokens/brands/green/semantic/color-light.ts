/**
 * color-light.ts — Semantic color tokens (light) — BRAND "green" (multi-tema)
 * Tier 2 de 3: intenção. API pública.
 *
 * Irmã da brand "blue" — mesmo contrato/derivações, hue VERDE-GRAMA (~142) e
 * chroma alto nos neutros → surfaces/sidebar claramente esverdeados (não o
 * cinza da default). Tom próprio, distinto do verde iGreen.
 */

import {
  brand, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Light: verde bem sutil nas surfaces + sidebar cinza neutro (dark é que puxa verde forte)
  canvas:           "oklch(0.986 0.005 142)",   // página — quase branco, whisper verde
  surface:          "oklch(0.996 0.003 142)",   // cards, drawer
  "surface-elevated": "oklch(0.998 0.002 142)", // popovers, modais
  "surface-panels": "oklch(0.986 0.005 142)",   // = canvas
  sidebar:          "oklch(0.950 0.005 142)",   // sidebar cinza neutro (quase sem verde)

  subtle:   gray[50],
  muted:    gray[50],
  emphasis: gray[100],
  input:    "oklch(0.996 0.003 142)",
  accent:   "oklch(0.996 0.003 142)",

  // Brand (derivam do brand[600] — VERDE-GRAMA nesta marca)
  brand:            brand[600],
  "brand-subtle":   `color-mix(in oklch, ${brand[600]} 14%, transparent)`,
  "brand-hover":    `color-mix(in oklch, ${brand[600]} 90%, black)`,
  "brand-subtle-hover": `color-mix(in oklch, ${brand[600]} 22%, transparent)`,

  danger:                danger[500],
  "danger-muted":        `color-mix(in oklch, ${danger[500]} 14%, transparent)`,
  "danger-hover":        `color-mix(in oklch, ${danger[500]} 90%, black)`,
  "danger-muted-hover":  `color-mix(in oklch, ${danger[500]} 22%, transparent)`,

  success:                success[500],
  "success-muted":        `color-mix(in oklch, ${success[500]} 14%, transparent)`,
  "success-hover":        `color-mix(in oklch, ${success[500]} 90%, black)`,
  "success-muted-hover":  `color-mix(in oklch, ${success[500]} 22%, transparent)`,

  warning:                warning[500],
  "warning-muted":        `color-mix(in oklch, ${warning[500]} 14%, transparent)`,
  "warning-hover":        `color-mix(in oklch, ${warning[500]} 90%, black)`,
  "warning-muted-hover":  `color-mix(in oklch, ${warning[500]} 22%, transparent)`,

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 14%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, black)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 22%, transparent)`,

  "muted-hover":  "oklch(0.95 0.010 142)",
  "input-hover":  gray[50],
  "accent-hover": "oklch(0.84 0.022 142)",

  "sidebar-accent":       "oklch(0.999 0.002 142)",
  "sidebar-accent-hover": "oklch(0.93 0.008 142)",

  "table":            "oklch(0.996 0.003 142)",
  "table-head":       gray[50],
  "table-row-hover":  gray[50],
  "table-row-selected":       `color-mix(in oklch, ${brand[600]} 6%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brand[600]} 10%, transparent)`,
  "table-row-selected-solid":       `color-mix(in srgb, ${brand[600]} 6%, ${white})`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brand[600]} 10%, ${white})`,

  "dropdown":         "var(--color-bg-canvas)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  strong:  gray[950],
  default: gray[950],
  muted:   gray[500],
  subtle:  gray[400],
  disabled: gray[400],

  brand: brand[600],

  danger:  danger[500],
  success: success[500],
  warning: warning[500],
  info:    info[500],

  "on-brand":   white,
  "on-danger":  white,
  "on-success": white,
  "on-warning": black,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

export const border = {
  default: gray[200],
  subtle:  gray[150],
  input:   gray[300],
  sidebar: "oklch(0.9076 0.008 142)",

  brand:           brand[600],
  "brand-subtle":  `color-mix(in oklch, ${brand[600]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[500]} 36%, transparent)`,
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  table: gray[150],
} as const;

// ─── Ring (focus rings) ────────────────────────────────────────────────────────

export const ring = {
  brand:     `color-mix(in oklch, ${brand[600]} 22%, transparent)`,
  danger:    `color-mix(in oklch, ${danger[500]} 22%, transparent)`,
  success:   `color-mix(in oklch, ${success[500]} 22%, transparent)`,
  warning:   `color-mix(in oklch, ${warning[500]} 22%, transparent)`,
  info:      `color-mix(in oklch, ${info[500]} 22%, transparent)`,
  secondary: `color-mix(in oklch, ${gray[500]} 22%, transparent)`,
} as const;

// ─── Overlay / Scrim ──────────────────────────────────────────────────────────

export const overlay = {
  scrim: "oklch(0 0 0 / 0.55)",
  float: "oklch(0.55 0.05 142 / 0.12)",
} as const;

// ─── Chart (paleta categórica — chart-1 ancora na brand VERDE) ────────────────
export const chart = {
  "1": brand[500],             // verde-grama da marca
  "2": "oklch(0.66 0.12 195)", // teal
  "3": "oklch(0.55 0.15 250)", // azul
  "4": "oklch(0.76 0.15 80)",  // âmbar
  "5": "oklch(0.56 0.18 300)", // violeta
  grid: gray[200],
} as const;

export const colorLight = { bg, fg, border, ring, overlay, chart };
