/**
 * sizing.ts — Escala genérica de dimensões de componente
 *
 * REGRAS:
 * - Escala única `comp` para h-*, w-*, size-* (height, width, square).
 * - Baseada em scales.ts (base-4 system).
 * - Heights são min-height (componentes crescem com conteúdo).
 * - WCAG 2.1 AA: mínimo 44px de touch target para interativos.
 *
 * Tokens orientados a componente específico (form, layout, icon, container)
 * ficam em components/sizing.ts.
 */

import { scale } from "../primitives/scales";

// ─── Comp (escala genérica de dimensão) ──────────────────────────────────────
// Gera: h-comp-*, w-comp-*, size-comp-*, min-h-comp-*
export const comp = {
  base: scale[10],   // 40px — DEFAULT: button md, input md (desktop)
  "3xs": scale[4],   // 16px — badge micro
  "2xs": scale[5],   // 20px — badge md, switch
  xs: scale[6],      // 24px — compact chip, small tag
  sm: scale[7],      // 28px — tabs item
  md: scale[8],      // 32px — button xs, input xs
  lg: scale[9],      // 36px — button sm, input sm
  xl: scale[10],     // 40px — mesmo valor que base
  "2xl": scale[11],  // 44px — WCAG touch target
  "3xl": scale[12],  // 48px — confortável
  "4xl": scale[14],  // 56px — hero CTA
} as const;

export const sizing = { comp } as const;
export type SizingToken = typeof sizing;
