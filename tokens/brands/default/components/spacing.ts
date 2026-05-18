/**
 * components/spacing.ts — Tokens de espaçamento orientados a componente
 *
 * Paddings recorrentes que múltiplos componentes compartilham.
 * Componente usa: p-pad-card, px-pad-page, etc.
 */

import { scale } from "../primitives/scales";

// ─── Pad Card (padding interno de cards) ─────────────────────────────────────
export const padCard = {
  base: scale[6],   // 24px — DEFAULT: card padding
  sm: scale[4],     // 16px — card compact
} as const;

// ─── Pad Page (padding de body/page) ─────────────────────────────────────────
export const padPage = {
  base: scale[6],   // 24px — DEFAULT: page content padding
  sm: scale[4],     // 16px — mobile
  lg: scale[10],    // 40px — desktop wide
} as const;

export const componentSpacing = { padCard, padPage } as const;
export type ComponentSpacingToken = typeof componentSpacing;
