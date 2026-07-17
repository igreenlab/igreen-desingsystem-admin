/**
 * color-light.ts — Semantic color tokens (light) — BRAND "blue" (teste multi-tema)
 * Tier 2 de 3: intenção. API pública.
 *
 * Cópia self-contained da default: MESMO contrato de nomes e MESMAS derivações
 * (color-mix da cor base). O import de primitives é relativo dentro da própria
 * marca (../primitives/color-palette) → puxa o brand AZUL. Prova que a pasta
 * brands/<x>/ compila isolada.
 */

import {
  brand, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces tingidas de azul (cool) — "casam" com a marca em vez de branco puro
  canvas:           "oklch(0.982 0.008 264)",   // página — azul bem claro
  surface:          "oklch(0.995 0.004 264)",   // cards, drawer — quase branco azulado
  "surface-elevated": "oklch(0.998 0.003 264)", // popovers, modais
  "surface-panels": "oklch(0.982 0.008 264)",   // = canvas
  sidebar:          "oklch(0.948 0.016 264)",   // sidebar cool blue (era mineral quente)

  subtle:   gray[50],
  muted:    gray[50],
  emphasis: gray[100],
  input:    "oklch(0.995 0.004 264)",
  accent:   "oklch(0.995 0.004 264)",

  // Brand (derivam do brand[600] — AZUL nesta marca)
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

  "muted-hover":  "oklch(0.95 0.012 264)",
  "input-hover":  gray[50],
  "accent-hover": "oklch(0.84 0.024 264)",

  "sidebar-accent":       "oklch(0.999 0.002 264)",
  "sidebar-accent-hover": "oklch(0.92 0.018 264)",

  "table":            "oklch(0.995 0.004 264)",
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
  sidebar: "oklch(0.9076 0.016 264)",

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
  float: "oklch(0.55 0.05 264 / 0.12)",
} as const;

// ─── Chart (paleta categórica — chart-1 ancora na brand AZUL) ─────────────────
export const chart = {
  "1": brand[500],             // azul da marca (acompanha o brand)
  "2": "oklch(0.66 0.12 195)", // teal
  "3": "oklch(0.55 0.15 250)", // azul
  "4": "oklch(0.76 0.15 80)",  // âmbar
  "5": "oklch(0.56 0.18 300)", // violeta
  grid: gray[200],
} as const;

export const colorLight = { bg, fg, border, ring, overlay, chart };
