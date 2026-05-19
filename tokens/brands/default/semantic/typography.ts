/**
 * typography.ts — Semantic typography tokens (composite)
 *
 * 6 roles: display | heading | title | body | caption | code
 * 23 presets totais
 *
 * REGRAS:
 * - Presets compostos: combinam fontSize + lineHeight + fontWeight + letterSpacing + fontFamily.
 * - Nomenclatura: {role}-{tier}
 * - Valores em rem (acessibilidade: respeita preferência de fonte do usuário).
 * - display/heading (≥ 32px desktop) usam clamp() para fluid typography.
 * - Presets menores usam rem estático (fluid não faz diferença abaixo de 32px).
 *
 * WEIGHT DEFAULT POR ROLE:
 *   - display:  varia por tier (semibold → bold)
 *   - heading:  500 (medium) para fluid; 500 para heading-xs estático
 *   - title:    600 (semibold) — mais usado no projeto
 *   - body-xs/sm: 500 (medium) — interactive (button, dropdown, input, table cell)
 *   - body-md/lg/xl/2xl: 400 (regular) — body corrido
 *   - caption:  400 (regular)
 *   - code:     400 (regular, mono)
 *
 * OVERRIDE CONVENCIONAL via Tailwind nativo:
 *   - font-bold/semibold/medium/normal — peso diferente
 *   - leading-X — line-height
 *   - tracking-X — letter-spacing
 *
 * HIERARQUIA:
 *   display    → hero sections, marketing (muito grande, fluid)
 *   heading    → títulos de página, modais (grande, fluid a partir de sm)
 *   title      → títulos de card, seção (médio, estático, weight 600)
 *   body       → texto corrido + interactive (estático)
 *   caption    → texto auxiliar, metadados, microlabels (estático)
 *   code       → código inline e blocos (estático, mono)
 *
 * Migration log:
 *   - 2026-05-19: rewrite enxuto. Removidos paragraph-*, label-*, subheading-* (32→23 presets).
 *                 Decimais e órfãos (10.5/11.5/12.5/13.5/14.5/15/17/22/26) já eliminados nas Ondas 1-4.
 */

import { fontWeight, fontFamily } from "../primitives/fonts";

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

// ─── Heading (fluid sm→xl, estático xs) ───────────────────────────────────────
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
} as const;

// ─── Title (estático — weight 600 default) ────────────────────────────────────
// Títulos de card, seção, modal, panel. Weight 600 (semibold).
export const title: Record<string, TypographyPreset> = {
  "title-lg": {
    fontSize:      "1.25rem",      // 20px
    lineHeight:    "1.75rem",      // 28px
    fontWeight:    fontWeight.semibold,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
  "title-md": {
    fontSize:      "1rem",         // 16px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.semibold,
    letterSpacing: "-0.011em",
    fontFamily:    fontFamily.sans,
  },
  "title-sm": {
    fontSize:      "0.875rem",     // 14px
    lineHeight:    "1.25rem",      // 20px
    fontWeight:    fontWeight.semibold,
    letterSpacing: "-0.006em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// ─── Body (estático — interactive xs/sm = 500; corrido md/lg/xl/2xl = 400) ────
// Texto corrido, body de leitura, labels interativos (button, dropdown, input).
export const body: Record<string, TypographyPreset> = {
  "body-2xl": {
    fontSize:      "1.5rem",       // 24px
    lineHeight:    "2rem",         // 32px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.015em",
    fontFamily:    fontFamily.sans,
  },
  "body-xl": {
    fontSize:      "1.125rem",     // 18px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.015em",
    fontFamily:    fontFamily.sans,
  },
  "body-lg": {
    fontSize:      "1rem",         // 16px
    lineHeight:    "1.5rem",       // 24px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.011em",
    fontFamily:    fontFamily.sans,
  },
  "body-md": {
    fontSize:      "0.875rem",     // 14px
    lineHeight:    "1.25rem",      // 20px
    fontWeight:    fontWeight.regular,
    letterSpacing: "-0.006em",
    fontFamily:    fontFamily.sans,
  },
  // body-sm — 13px — body default do projeto (button, dropdown, input, table cell)
  "body-sm": {
    fontSize:      "0.8125rem",    // 13px
    lineHeight:    "1.125rem",     // 18px
    fontWeight:    fontWeight.medium,
    letterSpacing: "-0.003em",
    fontFamily:    fontFamily.sans,
  },
  // body-xs — 12px — interactive small (chip, sub-item)
  "body-xs": {
    fontSize:      "0.75rem",      // 12px
    lineHeight:    "1rem",         // 16px
    fontWeight:    fontWeight.medium,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// ─── Caption (estático — peso 400) ────────────────────────────────────────────
// Texto auxiliar, timestamps, metadados, helpers, microlabels.
export const caption: Record<string, TypographyPreset> = {
  "caption-md": {
    fontSize:      "0.75rem",      // 12px
    lineHeight:    "1rem",         // 16px
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
  "caption-xs": {
    fontSize:      "0.625rem",     // 10px
    lineHeight:    "0.75rem",      // 12px
    fontWeight:    fontWeight.regular,
    letterSpacing: "0em",
    fontFamily:    fontFamily.sans,
  },
} as const;

// ─── Code (estático — mono regular) ──────────────────────────────────────────
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

// ─── Export agrupado ──────────────────────────────────────────────────────────
export const typography = {
  ...display,
  ...heading,
  ...title,
  ...body,
  ...caption,
  ...code,
} as const;

export type TypographyToken = typeof typography;
export type TypographyKey   = keyof typeof typography;
