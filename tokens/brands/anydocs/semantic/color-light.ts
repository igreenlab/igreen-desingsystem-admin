/**
 * color-light.ts — Semantic color tokens (light) — BRAND "anydocs" (Anydocs)
 * Tier 2 de 3: intenção. API pública.
 *
 * ⚠️ NÃO VALIDADO EM PRODUTO. A Anydocs é dark-only hoje: todo valor medido em
 * produção veio do tema escuro. Este arquivo existe porque o DS exige os dois
 * modos, e foi derivado por medição de contraste — não copiado de uma tela real.
 * O modo oficial é o `color-dark.ts`. Antes de lançar qualquer superfície clara,
 * valide no browser (Fase 5 do brand-builder).
 *
 * Cópia self-contained da default: MESMO contrato de nomes.
 * Light usa `brand[600]` = #9353D3 exato (4.75:1 com texto branco).
 */

import {
  brand, gray, success, warning, caution, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces tingidas de violeta — "casam" com a marca em vez de branco puro
  canvas:           "oklch(0.982 0.008 290)",   // página — violeta bem claro
  surface:          "oklch(0.995 0.004 290)",   // cards, drawer — quase branco violáceo
  "surface-elevated": "oklch(0.998 0.003 290)", // popovers, modais
  "surface-panels": "oklch(0.982 0.008 290)",   // = canvas
  sidebar:          "oklch(0.948 0.016 290)",   // sidebar violácea (era mineral quente)

  subtle:   gray[50],
  muted:    gray[50],
  emphasis: gray[100],
  input:    "oklch(0.995 0.004 290)",
  accent:   "oklch(0.995 0.004 290)",

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

  caution:                caution[500],
  "caution-muted":        `color-mix(in oklch, ${caution[500]} 14%, transparent)`,
  "caution-hover":        `color-mix(in oklch, ${caution[500]} 90%, black)`,
  "caution-muted-hover":  `color-mix(in oklch, ${caution[500]} 22%, transparent)`,

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 14%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, black)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 22%, transparent)`,

  "muted-hover":  "oklch(0.95 0.012 290)",
  // Scrollbar: contraste PRÓPRIO, independente da cor de superfície da marca — por isso
  // alpha neutro, não um token de bg. O @utility usava bg.muted-hover, que no light é
  // cinza OPACO sobre branco: a barra sumia no consumidor (o showcase mascarava com um
  // override hardcoded no globals.css). Medido e corrigido em 2026-08-08.
  "scrollbar-thumb":       "oklch(0 0 0 / 0.24)",
  "scrollbar-thumb-hover": "oklch(0 0 0 / 0.32)",
  "input-hover":  gray[50],
  "accent-hover": "oklch(0.84 0.024 290)",

  "sidebar-accent":       "oklch(0.999 0.002 290)",
  "sidebar-accent-hover": "oklch(0.92 0.018 290)",

  "table":            "oklch(0.995 0.004 290)",
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
  caution: caution[500],
  info:    info[500],

  "on-brand":   white,
  "on-danger":  white,
  "on-success": white,
  "on-warning": black,
  "on-caution": black,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

export const border = {
  default: gray[200],
  subtle:  gray[150],
  input:   gray[300],
  sidebar: "oklch(0.9076 0.016 290)",

  brand:           brand[600],
  "brand-subtle":  `color-mix(in oklch, ${brand[600]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[500]} 36%, transparent)`,
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "caution-muted": `color-mix(in oklch, ${caution[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  table: gray[150],
} as const;

// ─── Ring (focus rings) ────────────────────────────────────────────────────────

export const ring = {
  brand:     `color-mix(in oklch, ${brand[600]} 22%, transparent)`,
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
  float: "oklch(0.55 0.05 290 / 0.12)",
} as const;

// ─── Chart (paleta categórica — chart-1 ancora na brand AZUL) ─────────────────
export const chart = {
  "1": brand[500],             // roxo da marca (acompanha o brand)
  "2": "oklch(0.66 0.12 195)", // teal
  "3": "oklch(0.55 0.15 250)", // azul (harmônica da paleta categórica)
  "4": "oklch(0.76 0.15 80)",  // âmbar
  "5": "oklch(0.56 0.18 300)", // violeta
  grid: gray[200],
} as const;

export const colorLight = { bg, fg, border, ring, overlay, chart };
