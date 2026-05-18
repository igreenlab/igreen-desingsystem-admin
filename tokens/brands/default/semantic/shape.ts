/**
 * shape.ts — Shape tokens (border-radius + border-width)
 *
 * REGRAS:
 * - border-radius e border-width ficam juntos porque definem a "forma" visual.
 *   Quando um muda, o outro costuma mudar — são co-dependentes de tema.
 * - Nomenclatura: base (default), none, xs, sm, md, lg, xl, 2xl, 3xl, 4xl, full.
 *
 * FILOSOFIA DE FORMA:
 *   O sistema usa um "knob" central (RADIUS_BASE = 0.625rem = 10px).
 *   Todos os steps são derivados por multiplicador.
 *   Mudar RADIUS_BASE escala toda a personalidade do sistema.
 *
 *   `base` = radius padrão de componentes interativos (buttons, cards, inputs, dialogs).
 *   Escala numérica (xs→4xl) existe para casos onde se precisa de um radius específico.
 *
 * RELAÇÃO form height → radius:
 *   xl (44px)  → base (10px)
 *   lg (40px)  → base (10px)
 *   md (36px)  → base (10px)
 *   sm (32px)  → md  (8px)
 *   xs (28px)  → md  (8px)
 */

// ─── Radius ───────────────────────────────────────────────────────────────────
/**
 * Knob central do sistema — controla a "personalidade de forma" (sharp → pill).
 * Alterar este valor escala toda a curva de radius proporcionalmente.
 * O transform to-tailwind-v4 gera calc(RADIUS_BASE * N) para cada step.
 */
export const RADIUS_BASE = "0.625rem"; // 10px — mesma ref do shadcn

export const radius = {
  base: RADIUS_BASE,               // 10px — DEFAULT componentes interativos (= lg)
  none: "0px",                      //  0px — sharp corners
  xs:   `${RADIUS_BASE} * 0.4`,   //  4px — sutil
  sm:   `${RADIUS_BASE} * 0.6`,   //  6px — tabs indicator
  md:   `${RADIUS_BASE} * 0.8`,   //  8px — inputs menores
  lg:   RADIUS_BASE,               // 10px — igual ao knob (alias de base)
  xl:   `${RADIUS_BASE} * 1.4`,   // 14px — modais, painéis
  "2xl": `${RADIUS_BASE} * 1.8`,  // 18px — textarea, select content
  "3xl": `${RADIUS_BASE} * 2.2`,  // 22px — badges, componentes menores
  "4xl": `${RADIUS_BASE} * 2.6`,  // 26px — antigo valor de base (retido pra casos específicos)
  full: "9999px",                   // pill — avatars, chips
} as const;

// ─── Border Width ──────────────────────────────────────────────────────────────
export const borderWidth = {
  none:   "0px",
  xs:     "1px",  // padrão — separadores, inputs, cards
  sm:     "2px",  // ênfase — foco, hover de botão outline
  md:     "4px",  // forte — accent, progress indicator
} as const;

// ─── Outline (focus ring) ──────────────────────────────────────────────────────
// Separado de border porque tem semântica de acessibilidade própria
export const outline = {
  width:  "2px",   // largura do outline de foco
  offset: "2px",   // espaço entre elemento e outline
  style:  "solid",
} as const;

// ─── Divider ───────────────────────────────────────────────────────────────────
export const divider = {
  width:  "1px",
  style:  "solid",
} as const;

export const shape = { radius, RADIUS_BASE, borderWidth, outline, divider } as const;
export type ShapeToken = typeof shape;
