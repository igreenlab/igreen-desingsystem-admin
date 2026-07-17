/**
 * color-light.ts — Semantic color tokens (light) — BRAND "pay" (iGreen Pay)
 * Tier 2 de 3: intenção. API pública.
 *
 * Valores HEX/RGBA extraídos 1:1 do Design Kit oficial (tema claro).
 */

import { white, black } from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  canvas:           "#f9fafb",   // --bg
  surface:          "#ffffff",   // --surface
  "surface-elevated": "#ffffff",
  "surface-panels": "#f9fafb",   // --surface-2
  sidebar:          "#ffffff",   // --sidebar

  subtle:   "#f9fafb",           // --surface-2
  muted:    "#f3f4f6",           // --surface-3
  emphasis: "#eceef1",
  input:    "#ffffff",
  accent:   "#f9fafb",

  // Brand (verde iGreen Pay)
  brand:            "#00a859",   // --brand
  "brand-subtle":   "rgba(0,168,89,.10)",   // --brand-soft
  "brand-hover":    "#008a4b",   // --brand-2
  "brand-subtle-hover": "rgba(0,168,89,.18)",

  danger:                "#f83b3b",
  "danger-muted":        "rgba(248,59,59,.10)",
  "danger-hover":        "#e02e2e",
  "danger-muted-hover":  "rgba(248,59,59,.18)",

  success:                "#00a859",
  "success-muted":        "rgba(0,168,89,.11)",
  "success-hover":        "#008a4b",
  "success-muted-hover":  "rgba(0,168,89,.18)",

  warning:                "#d97c02",
  "warning-muted":        "rgba(217,124,2,.12)",
  "warning-hover":        "#b96702",
  "warning-muted-hover":  "rgba(217,124,2,.20)",

  info:                "#0058e6",
  "info-muted":        "rgba(0,88,230,.10)",
  "info-hover":        "#0047bd",
  "info-muted-hover":  "rgba(0,88,230,.18)",

  "muted-hover":  "#f3f4f6",
  "input-hover":  "#f9fafb",
  "accent-hover": "#eceef1",

  "sidebar-accent":       "rgba(0,168,89,.10)",   // item de menu ATIVO = --brand-soft (kit)
  "sidebar-accent-hover": "#f3f4f6",               // hover (item inativo) = surface-3 neutro

  "table":            "#ffffff",
  "table-head":       "#f9fafb",
  "table-row-hover":  "#f9fafb",
  "table-row-selected":       "rgba(0,168,89,.08)",
  "table-row-selected-hover": "rgba(0,168,89,.13)",
  "table-row-selected-solid":       "color-mix(in srgb, #00a859 8%, #ffffff)",
  "table-row-selected-hover-solid": "color-mix(in srgb, #00a859 13%, #ffffff)",

  "dropdown":         "var(--color-bg-surface)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  strong:  "#0a0a0c",
  default: "#0a0a0c",   // --text
  muted:   "#5f6b77",   // --text-2
  subtle:  "#7e8994",   // --text-3
  disabled: "#a2acb6",

  brand: "#008a4b",     // --brand-text (light escurece p/ contraste)

  danger:  "#f83b3b",
  success: "#00a859",
  warning: "#d97c02",
  info:    "#0058e6",

  "on-brand":   white,
  "on-danger":  white,
  "on-success": white,
  "on-warning": white,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

export const border = {
  default: "rgba(17,17,17,.08)",   // --border
  subtle:  "rgba(17,17,17,.06)",
  input:   "rgba(17,17,17,.14)",   // --border-2
  sidebar: "rgba(17,17,17,.08)",

  brand:           "#00a859",
  "brand-subtle":  "rgba(0,168,89,.36)",

  "danger-muted":  "rgba(248,59,59,.36)",
  "success-muted": "rgba(0,168,89,.36)",
  "warning-muted": "rgba(217,124,2,.36)",
  "info-muted":    "rgba(0,88,230,.36)",

  table: "rgba(17,17,17,.08)",
} as const;

// ─── Ring (focus rings) ────────────────────────────────────────────────────────

export const ring = {
  brand:     "rgba(0,168,89,.30)",
  danger:    "rgba(248,59,59,.30)",
  success:   "rgba(0,168,89,.30)",
  warning:   "rgba(217,124,2,.30)",
  info:      "rgba(0,88,230,.30)",
  secondary: "rgba(17,17,17,.14)",
} as const;

// ─── Overlay / Scrim ──────────────────────────────────────────────────────────

export const overlay = {
  scrim: "rgba(0,0,0,.55)",
  float: "rgba(16,24,40,.12)",
} as const;

// ─── Chart (métodos / séries do kit) ──────────────────────────────────────────
export const chart = {
  "1": "#00a859",   // --c-pix / brand
  "2": "#0058e6",   // --c-boleto
  "3": "#65a30d",   // --c-link
  "4": "#d97c02",   // warning
  "5": "#7c3aed",   // extra
  grid: "rgba(17,17,17,.08)",
} as const;

export const colorLight = { bg, fg, border, ring, overlay, chart };
void black;
