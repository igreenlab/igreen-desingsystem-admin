/**
 * components/sizing.ts — Tokens de dimensão orientados a componente
 *
 * Tokens específicos para tipos de componente:
 *   form      → heights de controles interativos (button, input, select)
 *   layout    → heights de seções fixas (navbar, toolbar, header)
 *   icon      → tamanhos de ícone (square)
 *   container → larguras de containers e componentes overlay
 */

import { scale } from "../primitives/scales";
import { comp } from "../semantic/sizing";

// ─── Form (heights de controles interativos) ─────────────────────────────────
// Garante alinhamento: Button sm = Input sm = Select sm = mesmo height.
export const form = {
  base: comp.base,      // 40px — DEFAULT: button md, input md
  "3xs": comp["2xs"],   // 20px
  "2xs": comp.xs,       // 24px
  xs: comp.sm,          // 28px — button xxs
  sm: comp.md,          // 32px — button xs, input xs
  md: comp.lg,          // 36px — button sm, input sm
  lg: comp.xl,          // 40px — mesmo valor que base
  xl: comp["2xl"],      // 44px — WCAG touch
} as const;

// ─── Layout (heights de seções fixas) ────────────────────────────────────────
export const layout = {
  navbar: scale[16],     // 64px
  toolbar: scale[12],    // 48px
  "tab-bar": scale[14],  // 56px — mobile bottom tabs
  "header-sm": scale[20], // 80px
  "header-md": scale[24], // 96px
  "header-lg": scale[32], // 128px — hero section
} as const;

// ─── Icon (tamanhos de ícone — square) ───────────────────────────────────────
export const icon = {
  base: scale[5],    // 20px — DEFAULT: button/input icon
  "2xs": scale[2],   //  8px — decorativo
  xs: scale[3],      // 12px — inline com texto xs
  sm: scale[4],      // 16px — icon svg body
  md: scale[5],      // 20px — mesmo valor que base
  lg: scale[6],      // 24px — ênfase, nav items
  xl: scale[8],      // 32px — feature icons
  "2xl": scale[10],  // 40px — hero icons
  "3xl": scale[12],  // 48px — ilustrativo
} as const;

// ─── Container (larguras de containers e overlays) ───────────────────────────
export const container = {
  // Page containers
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
  "3xl": "1920px",
  full: "100%",
  prose: "65ch",
  // Max-width do body do AppShell em modo `layout=compact`. Centraliza o
  // conteúdo numa coluna confortável de leitura sem ocupar 100% em telas
  // ultrawide. Fluid mode ignora este token.
  "main-content-max": "1368px",
  // Component overlays
  "tooltip-sm": "160px",
  "tooltip-md": "240px",
  "tooltip-lg": "320px",
  "dropdown-sm": "160px",
  "dropdown-md": "240px",
  "dropdown-lg": "320px",
  "sidebar-sm": "240px",
  "sidebar-md": "280px",
  "sidebar-lg": "320px",
  "drawer-sm": "320px",
  "drawer-md": "480px",
  "drawer-lg": "640px",
  "modal-sm": "480px",
  "modal-md": "640px",
  "modal-lg": "800px",
} as const;

// ─── Scrollbar (larguras de scrollbar custom) ───────────────────────────────
export const scrollbar = {
  width: {
    thin: "6px",      // Kanban, listas compactas
    default: "8px",   // Tabelas, containers maiores
  },
} as const;

export const componentSizing = { form, layout, icon, container, scrollbar } as const;
export type ComponentSizingToken = typeof componentSizing;
