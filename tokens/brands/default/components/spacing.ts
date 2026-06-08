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

/**
 * ─── Form Gap (gap padrão entre fields de formulário) ───────────────────────
 *
 * REGRA DS: todo formulário deve usar `gap-form-gap` (20px) entre fields
 * (label+input units). Não usar `gap-gp-*` semânticos avulsos em form layout.
 *
 * Por quê 20px: equilibra densidade (12px era apertado) vs respiro (24px ficou
 * solto demais quando temos 5+ fields num drawer). Bench: NovoClienteDrawer,
 * SacarDialog → 20px tem leitura confortável sem desperdiçar viewport.
 *
 * Uso:
 *   <div className="flex flex-col gap-form-gap"> ← entre FormField units
 *     <FormFieldInput ... />
 *     <FormFieldSelect ... />
 *     <FormFieldCheckbox ... />
 *   </div>
 *
 * Pra grids 2-col dentro do form (ex: agência + conta lado a lado): também
 * usar gap-form-gap pra manter consistência horizontal × vertical.
 */
export const formGap = scale[5];   // 20px — gap entre fields de formulário

export const componentSpacing = { padCard, padPage, formGap } as const;
export type ComponentSpacingToken = typeof componentSpacing;
