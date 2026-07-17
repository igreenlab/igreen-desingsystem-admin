/**
 * color-dark.ts — Semantic color tokens (dark) — BRAND "pay" (iGreen Pay)
 * Tier 2 de 3: intenção. API pública.
 *
 * Valores HEX/RGBA extraídos 1:1 do Design Kit oficial (tema escuro = padrão).
 * bg #050608 · surface #0b0d10 · surface-2 #0f1116 · surface-3 #13161c ·
 * sidebar = surface · brand #00a859 · brand-text #3bc882.
 */

import { white, black } from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  canvas:           "#050608",   // --bg
  surface:          "#0b0d10",   // --surface
  "surface-elevated": "#0f1116", // --surface-2
  "surface-panels": "#0b0d10",
  sidebar:          "#0b0d10",   // --sidebar (= surface)

  subtle:   "#0f1116",           // --surface-2
  muted:    "#0f1116",
  emphasis: "#13161c",           // --surface-3
  input:    "#0b0d10",
  accent:   "#0f1116",

  // Brand (verde iGreen Pay)
  brand:            "#00a859",   // --brand (fill de botão)
  "brand-subtle":   "rgba(0,168,89,.14)",   // --brand-soft
  "brand-hover":    "#12b869",
  "brand-subtle-hover": "rgba(0,168,89,.22)",

  danger:                "#ff6b6b",
  "danger-muted":        "rgba(255,107,107,.14)",
  "danger-hover":        "#ff8585",
  "danger-muted-hover":  "rgba(255,107,107,.22)",

  success:                "#3bc882",
  "success-muted":        "rgba(59,200,130,.14)",
  "success-hover":        "#57d195",
  "success-muted-hover":  "rgba(59,200,130,.22)",

  warning:                "#ffb620",
  "warning-muted":        "rgba(255,182,32,.14)",
  "warning-hover":        "#ffc748",
  "warning-muted-hover":  "rgba(255,182,32,.22)",

  info:                "#3580ff",
  "info-muted":        "rgba(53,128,255,.15)",
  "info-hover":        "#5a99ff",
  "info-muted-hover":  "rgba(53,128,255,.24)",

  "muted-hover":  "#13161c",     // --surface-3
  "input-hover":  "#13161c",
  "accent-hover": "#13161c",

  "sidebar-accent":       "rgba(0,168,89,.14)",   // item de menu ATIVO = --brand-soft (kit)
  "sidebar-accent-hover": "#13161c",               // hover (item inativo) = surface-3 neutro

  "table":            "#0b0d10",
  "table-head":       "#13161c",
  "table-row-hover":  "#13161c",
  "table-row-selected":       "rgba(0,168,89,.14)",
  "table-row-selected-hover": "rgba(0,168,89,.20)",
  "table-row-selected-solid":       "color-mix(in srgb, #00a859 12%, #0b0d10)",
  "table-row-selected-hover-solid": "color-mix(in srgb, #00a859 18%, #0b0d10)",

  "dropdown":         "#0b0d10",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  strong:  white,
  default: "#f5f7fa",   // --text
  muted:   "#aeb4bd",   // --text-2
  subtle:  "#7c8591",   // --text-3
  disabled: "#5b636b",

  brand: "#3bc882",     // --brand-text (dark)

  danger:  "#ff6b6b",
  success: "#3bc882",
  warning: "#ffb620",
  info:    "#3580ff",

  "on-brand":   white,   // botão #00a859 + texto branco
  "on-danger":  white,
  "on-success": black,
  "on-warning": black,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

export const border = {
  default: "rgba(255,255,255,.08)",   // --border
  subtle:  "rgba(255,255,255,.06)",
  input:   "rgba(255,255,255,.08)",
  sidebar: "rgba(255,255,255,.08)",

  brand:           "#00a859",
  "brand-subtle":  "rgba(0,168,89,.36)",

  "danger-muted":  "rgba(255,107,107,.36)",
  "success-muted": "rgba(59,200,130,.36)",
  "warning-muted": "rgba(255,182,32,.36)",
  "info-muted":    "rgba(53,128,255,.36)",

  table: "rgba(255,255,255,.08)",
} as const;

// ─── Ring (focus rings) ────────────────────────────────────────────────────────

export const ring = {
  brand:     "rgba(0,168,89,.35)",
  danger:    "rgba(255,107,107,.35)",
  success:   "rgba(59,200,130,.35)",
  warning:   "rgba(255,182,32,.35)",
  info:      "rgba(53,128,255,.35)",
  secondary: "rgba(255,255,255,.16)",   // --border-2
} as const;

// ─── Overlay / Scrim ──────────────────────────────────────────────────────────

export const overlay = {
  scrim: "rgba(0,0,0,.6)",
  float: "rgba(255,255,255,.08)",
} as const;

// ─── Chart (métodos / séries do kit) ──────────────────────────────────────────
export const chart = {
  "1": "#00a859",   // --c-pix / brand
  "2": "#3580ff",   // --c-boleto
  "3": "#a3e635",   // --c-link
  "4": "#ffb620",   // warning
  "5": "#a78bfa",   // extra
  grid: "rgba(255,255,255,.08)",
} as const;

export const colorDark = { bg, fg, border, ring, overlay, chart };
