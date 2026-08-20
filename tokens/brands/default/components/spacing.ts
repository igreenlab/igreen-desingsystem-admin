/**
 * components/spacing.ts — Tokens de espaçamento orientados a componente
 *
 * Paddings recorrentes que múltiplos componentes compartilham.
 * Componente usa: p-pad-card, px-pad-page, etc.
 */

import { scale } from "../primitives/scales";

/**
 * ─── Pad Card (padding interno de cards) ────────────────────────────────────
 *
 * A escala de densidade do `Card`, consumida pela prop `size`:
 *
 *     size="sm"  →  pad-card-sm    16px
 *     size="md"  →  pad-card-md    20px   ← DEFAULT do componente
 *     size="lg"  →  pad-card-lg    24px
 *
 * ## `base` = `md` = 20px — e por que não foi removido nem virou 24
 *
 * Até 2026-08-19 a família era só `{ base: 24, sm: 16 }`, e `base` era o padding de
 * card do DS. Ao ganhar a escala de 3, `base` virou um nome ruim: ele deveria
 * significar "o default", e o default passou a ser 20.
 *
 * Três saídas foram medidas, e a escolha do mantenedor foi a terceira:
 *
 *   (a) deixar `base` = 24 e mapear `size="lg"` → `base`  → nome assimétrico pra sempre
 *   (b) remover `base` e migrar tudo pra `lg`             → **quebra consumidor**: 2 usos
 *       vivem no embed do registry, ou seja, quem rodou `igreen:add hover-card` tem
 *       `p-pad-card-base` no código DELE. Remover faz a classe parar de emitir CSS —
 *       falha silenciosa, sem erro de build nem de `tsc` (L-019)
 *   (c) **`base` = `md` = 20px** → a classe continua existindo (nada quebra), e quem já
 *       consumia `base` recebe o novo default. Só muda pixel, nunca quebra.
 *
 * Alcance medido de `pad-card-base` antes da decisão: 20 em `src/`, 5 em
 * `cli/templates/`, 4 em `.claude/`, 5 em `.ai/`, **2 no embed do registry**.
 *
 * ⚠️ Consequência aceita: tudo que usava `base` foi de 24 → **20px**. Novo código usa
 * `sm`/`md`/`lg`; `base` fica como compatibilidade e não deve ser usado em código novo.
 *
 * `sm` é 16 e não 18 porque a escala não tem 18 (vai 16 → 20 → 24).
 */
export const padCard = {
  sm: scale[4],     // 16px — Card size="sm" (compact)
  md: scale[5],     // 20px — Card size="md" (DEFAULT do componente)
  lg: scale[6],     // 24px — Card size="lg"
  /** @deprecated Alias de `md` (20px). Existe só pra não quebrar quem já consome. */
  base: scale[5],   // 20px — era 24 até 2026-08-19
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
