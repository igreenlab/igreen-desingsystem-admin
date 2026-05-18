/**
 * typography.ts — Semantic typography tokens (composite)
 *
 * REGRAS:
 * - Presets compostos: combinam fontSize + fontWeight + lineHeight + letterSpacing.
 * - Nomenclatura: {role}-{scale}-{weight?}
 * - Valores em rem (acessibilidade: respeita preferência de fonte do usuário).
 * - display/heading (≥32px desktop) usam clamp() para fluid typography responsiva.
 * - Presets menores usam rem estático (fluid não faz diferença abaixo de 32px).
 * - Line heights de presets fluidos: unitless (escala com o font-size).
 * - Line heights de presets estáticos: rem.
 *
 * HIERARQUIA:
 *   display    → hero sections, marketing (muito grande, fluid)
 *   heading    → títulos de página, modais (grande, fluid a partir de sm)
 *   title      → títulos de card, seção (médio, estático)
 *   label      → labels de UI, botões, tabs (peso 500, estático)
 *   paragraph  → texto corrido, parágrafos (peso 400, estático)
 *   caption    → texto auxiliar, metadados (estático)
 *   subheading → categoria acima de conteúdo (uppercase, estático)
 *   overline   → decorativo (legacy alias para subheading)
 *   code       → código inline e blocos (estático)
 */

import { fontWeight, fontFamily, letterSpacing } from "../primitives/fonts";

// Tipo base para um preset tipográfico
interface TypographyPreset {
  fontSize:      string;
  lineHeight:    string;
  fontWeight:    string;
  letterSpacing: string;
  fontFamily:    string;
}

// ─── Display (fluid — clamp) ─────────────────────────────────────────────────
// Hero sections, landing pages. Viewport range: 375px → 1280px.
export const display: Record<string, TypographyPreset> = {
  "display-2xl": {
    fontSize:      "clamp(2.5rem, calc(1.568rem + 3.978vw), 4.75rem)",
    lineHeight:    "1.1",
    fontWeight:    fontWeight.bold,
    letterSpacing: "-0.02em",
    fontFamily:    fontFamily.sans,
  },
  "display-xl": {
    fontSize:      "clamp(2.25rem, calc(1.603rem + 2.762vw), 3.8125rem)",
    lineHeight:    "1.1",
    fontWeight:    fontWeight.bold,
    letterSpacing: "-0.02em",
    fontFamily:    fontFamily.sans,
  },
  "display-lg": {
    fontSize:      "clamp(2rem, calc(1.560rem + 1.878vw), 3.0625rem)",
    lineHeight:    "1.15",
    fontWeight:    fontWeight.semibold,
    letterSpacing: "-0.01em",
    fontFamily:    fontFamily.sans,
  },
  "display-md": {
    fontSize:      "clamp(1.75rem, calc(1.465rem + 1.215vw), 2.4375rem)",
    lineHeight:    "1.15",
    fontWeight:    fontWeight.semibold,
    letterSpacing: "-0.01em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// ─── Heading (fluid sm→xl, estático xs/2xs) ──────────────────────────────────
// Títulos de página, modais, dialogs.
export const heading: Record<string, TypographyPreset> = {
  "heading-xl": {
    fontSize:      "clamp(2.25rem, calc(1.732rem + 2.210vw), 3.5rem)",
    lineHeight:    "1.15",
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.01em",
    fontFamily:    fontFamily.sans,
  },
  "heading-lg": {
    fontSize:      "clamp(2rem, calc(1.586rem + 1.768vw), 3rem)",
    lineHeight:    "1.2",
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.01em",
    fontFamily:    fontFamily.sans,
  },
  "heading-md": {
    fontSize:      "clamp(1.75rem, calc(1.439rem + 1.326vw), 2.5rem)",
    lineHeight:    "1.2",
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.01em",
    fontFamily:    fontFamily.sans,
  },
  "heading-sm": {
    fontSize:      "clamp(1.5rem, calc(1.293rem + 0.884vw), 2rem)",
    lineHeight:    "1.25",
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.005em",
    fontFamily:    fontFamily.sans,
  },
  "heading-xs": {
    fontSize:      "1.5rem",       // 24px
    lineHeight:    "2rem",         // 32px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  // NOTE: heading-2xs removido — era duplicata pura de title-lg (ambos 20px/500/0em).
  // Consumidores migrados para text-title-lg.
} as const;

// ─── Title (estático — rem) ──────────────────────────────────────────────────
// Títulos de card, seção, sidebar item ativo.
export const title: Record<string, TypographyPreset> = {
  "title-lg": {
    fontSize:      "1.25rem",      // 20px
    lineHeight:    "1.75rem",      // 28px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  "title-md": {
    fontSize:      "1rem",         // 16px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  "title-sm": {
    fontSize:      "0.875rem",     // 14px
    lineHeight:    "1.25rem",      // 20px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// ─── Label (estático — rem) ──────────────────────────────────────────────────
// Labels de UI: botões, inputs, tabs, nav items (peso 500).
export const label: Record<string, TypographyPreset> = {
  "label-xl": {
    fontSize:      "1.5rem",       // 24px
    lineHeight:    "2rem",         // 32px
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.015em",
    fontFamily:    fontFamily.sans,
  },
  "label-lg": {
    fontSize:      "1.125rem",     // 18px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.015em",
    fontFamily:    fontFamily.sans,
  },
  "label-md": {
    fontSize:      "1rem",         // 16px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.011em",
    fontFamily:    fontFamily.sans,
  },
  "label-sm": {
    fontSize:      "0.875rem",     // 14px
    lineHeight:    "1.25rem",      // 20px
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.006em",
    fontFamily:    fontFamily.sans,
  },
  "label-xs": {
    fontSize:      "0.75rem",      // 12px
    lineHeight:    "1rem",         // 16px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  // ★ NOVO — preenche tier 11px no namespace label (interactive, weight 500).
  // Casos: micro label, hint count, rail tooltip.
  "label-2xs": {
    fontSize:      "0.6875rem",    // 11px
    lineHeight:    "0.875rem",     // 14px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  // ★ NOVO — preenche tier 13px no namespace label (body default interativo do projeto).
  // Casos: button sm, dropdown item, input value, tab default.
  "label-base": {
    fontSize:      "0.8125rem",    // 13px
    lineHeight:    "1.125rem",     // 18px
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.003em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// ─── Paragraph (estático — rem) ──────────────────────────────────────────────
// Texto corrido, parágrafos, descrições (peso 400).
export const paragraph: Record<string, TypographyPreset> = {
  "paragraph-xl": {
    fontSize:      "1.5rem",       // 24px
    lineHeight:    "2rem",         // 32px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.015em",
    fontFamily:    fontFamily.sans,
  },
  "paragraph-lg": {
    fontSize:      "1.125rem",     // 18px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.015em",
    fontFamily:    fontFamily.sans,
  },
  "paragraph-md": {
    fontSize:      "1rem",         // 16px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.011em",
    fontFamily:    fontFamily.sans,
  },
  "paragraph-sm": {
    fontSize:      "0.875rem",     // 14px
    lineHeight:    "1.25rem",      // 20px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.006em",
    fontFamily:    fontFamily.sans,
  },
  "paragraph-xs": {
    fontSize:      "0.75rem",      // 12px
    lineHeight:    "1rem",         // 16px
    fontWeight:    fontWeight.regular,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  // ★ NOVO — preenche tier 13px no namespace paragraph (body default do projeto).
  // Casos: body small, msg bubble, table cell, command item, dropdown item.
  "paragraph-base": {
    fontSize:      "0.8125rem",    // 13px
    lineHeight:    "1.125rem",     // 18px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.003em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// NOTE: body-* removido — eram aliases legacy de paragraph-*. Sem consumidores.

// ─── Caption (estático — rem) ────────────────────────────────────────────────
// Texto auxiliar, timestamps, metadados.
export const caption: Record<string, TypographyPreset> = {
  "caption-md": {
    fontSize:      "0.8125rem",    // 13px
    lineHeight:    "1.125rem",     // 18px
    fontWeight:    fontWeight.regular,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  "caption-sm": {
    fontSize:      "0.6875rem",    // 11px
    lineHeight:    "0.875rem",     // 14px
    fontWeight:    fontWeight.regular,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  // ★ NOVO — preenche tier 10px (faltava completamente no DS).
  // Casos: micro caption (bubble meta, conv ID, history meta).
  "caption-xs": {
    fontSize:      "0.625rem",     // 10px
    lineHeight:    "0.75rem",      // 12px
    fontWeight:    fontWeight.regular,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// ─── Subheading (estático — rem) ─────────────────────────────────────────────
// Texto acima de seções (ex: "CATEGORIAS", "NOVO") — uppercase.
export const subheading: Record<string, TypographyPreset> = {
  "subheading-md": {
    fontSize:      "1rem",         // 16px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0.06em",
    fontFamily:    fontFamily.sans,
  },
  "subheading-sm": {
    fontSize:      "0.875rem",     // 14px
    lineHeight:    "1.25rem",      // 20px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0.06em",
    fontFamily:    fontFamily.sans,
  },
  "subheading-xs": {
    fontSize:      "0.75rem",      // 12px
    lineHeight:    "1rem",         // 16px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0.04em",
    fontFamily:    fontFamily.sans,
  },
  "subheading-2xs": {
    fontSize:      "0.6875rem",    // 11px
    lineHeight:    "0.75rem",      // 12px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0.02em",
    fontFamily:    fontFamily.sans,
  },
  // ★ NOVO — variante "strong" weight 700 + tracking apertado (+0.06em).
  // Substitui o pattern literal `text-[Npx] font-bold tracking-[0.06em] uppercase`.
  // Casos: FILTERS/CATEGORIAS section title, table thead, MenuSidebar section header.
  "subheading-strong-md": {
    fontSize:      "0.6875rem",    // 11px
    lineHeight:    "0.875rem",     // 14px
    fontWeight:    fontWeight.bold,
    letterSpacing: "0.06em",
    fontFamily:    fontFamily.sans,
  },
  // ★ NOVO — versão 10px do strong subheading.
  // Casos: chip counter, unread badge, header tab count, agent rank.
  "subheading-strong-sm": {
    fontSize:      "0.625rem",     // 10px
    lineHeight:    "0.75rem",      // 12px
    fontWeight:    fontWeight.bold,
    letterSpacing: "0.06em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// NOTE: overline-* removido — eram aliases legacy de subheading. Sem consumidores.

// ─── Code (estático — rem) ───────────────────────────────────────────────────
export const code: Record<string, TypographyPreset> = {
  "code-md": {
    fontSize:      "1rem",         // 16px
    lineHeight:    "1.6",
    fontWeight:    fontWeight.regular,
    letterSpacing: "0em",
    fontFamily:    fontFamily.mono,
  },
  "code-sm": {
    fontSize:      "0.8125rem",    // 13px
    lineHeight:    "1.6",
    fontWeight:    fontWeight.regular,
    letterSpacing: "0em",
    fontFamily:    fontFamily.mono,
  },
} as const;

// ─── Export agrupado ───────────────────────────────────────────────────────────
export const typography = {
  ...display,
  ...heading,
  ...title,
  ...label,
  ...paragraph,
  ...caption,
  ...subheading,
  ...code,
} as const;

export type TypographyToken = typeof typography;
export type TypographyKey   = keyof typeof typography;
