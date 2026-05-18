/**
 * spacing.ts — Semantic spacing tokens
 *
 * REGRAS:
 * - Todos os valores derivam de scales.ts.
 * - 3 conceitos: space (genérico), gap (entre items), pad (padding).
 * - Os 3 compartilham a MESMA escala de valores.
 * - O prefixo (sp-, gp-, pad-) diferencia o papel no CSS.
 *
 * ESCALA UNIFICADA:
 *   2xs=2  xs=4  sm=6  md=8  lg=10  xl=12  2xl=16  3xl=20  4xl=24  5xl=28  6xl=32  7xl=48
 *
 * CONVENÇÃO DE PAPÉIS:
 *   space → genérico (margin, padding simétrico, offsets)
 *   gap   → entre filhos flex/grid, icon-to-label, section spacing
 *   pad   → padding interno de componente
 */

import { scale } from "../primitives/scales";

// Escala unificada: 2 4 6 8 10 12 16 20 24 28 32 48
const unified = {
  "2xs": scale[0.5],  //  2px — hairline, border-like gaps
  xs:    scale[1],    //  4px — icon-to-text tight, checkbox gap, tag gap
  sm:    scale[1.5],  //  6px — button icon gap (xxs/xs), badge gap, tabs
  md:    scale[2],    //  8px — button icon gap (sm/md), form field gap, input padding
  lg:    scale[2.5],  // 10px — compact card padding
  xl:    scale[3],    // 12px — button padding (xs), info box gap, card row gap
  "2xl": scale[4],    // 16px — card padding (sm), section gap, info box padding
  "3xl": scale[5],    // 20px — spacer médio
  "4xl": scale[6],    // 24px — card gap padrão, card padding (default), section gap
  "5xl": scale[7],    // 28px — spacer grande
  "6xl": scale[8],    // 32px — section major gap
  "7xl": scale[12],   // 48px — page-level gap
} as const;

// ─── Space (escala genérica) ─────────────────────────────────────────────────
export const space = {
  base: scale[4],      // 16px — DEFAULT: uma unidade espacial do sistema
  0:    scale[0],
  px:   { px: "1px", raw: 1 },
  ...unified,
} as const;

// ─── Gap (entre items) ──────────────────────────────────────────────────────
export const gap = {
  base: scale[6],     // 24px — DEFAULT: card/section internal gap
  ...unified,
} as const;

// ─── Pad (padding de componente) ─────────────────────────────────────────────
export const pad = {
  base: scale[3],     // 12px — DEFAULT: button/input padding horizontal
  ...unified,
} as const;

// Export agrupado
export const spacing = { space, gap, pad } as const;
export type SpacingToken = typeof spacing;
