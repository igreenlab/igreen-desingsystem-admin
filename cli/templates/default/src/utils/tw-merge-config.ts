// src/utils/tw-merge-config.ts
//
// FONTE ÚNICA da config do `tailwind-merge` no DS.
//
// Existia duplicada: `cn` (src/lib/utils.ts) e `tv` (src/utils/tv.ts) mantinham cada um a
// sua, com um comentário em `utils.ts` pedindo "manter sincronizado com src/utils/tv.ts".
// Não estavam: a de `tv` tinha só `font-size`, a de `cn` tinha também pad/gap/radius/
// shadow/form. Componente que fazia merge por `tv()` e componente que fazia por `cn()`
// resolviam conflito de formas diferentes — e ninguém tinha como saber qual.
//
// ⚠️ O que o tailwind-merge NÃO sabe sozinho ele deixa passar em SILÊNCIO: as duas classes
// sobrevivem no elemento e quem decide é a ordem do CSS, não a ordem do argumento. Nunca
// dá erro. É a L-016 (onde a classe some) pelo avesso, e a L-072 no caso do `tv()`.

import { type ClassValidator } from "tailwind-merge";

/** Padding/Margin spacing: pad-* (padding contexts), sp-* (geral) */
const isDsPad: ClassValidator = (v) => /^(pad|sp)-/.test(v);
/** Gap: gp-* */
const isDsGap: ClassValidator = (v) => /^gp-/.test(v);
/** Border-radius: radius-* */
const isDsRadius: ClassValidator = (v) => /^radius-/.test(v);
/** Shadow: sh-* */
const isDsShadow: ClassValidator = (v) => /^sh-/.test(v);
/** Form heights: form-* (min-h, h, w, size) */
const isDsForm: ClassValidator = (v) => /^form-/.test(v);

/**
 * Escala de container do DS — 1:1 com a chave `container` de
 * `tokens/brands/default/components/sizing.ts`, menos `full` e `prose`, que têm os MESMOS
 * nomes e valores do Tailwind nativo e já são reconhecidos.
 *
 * Entra por `theme.container` (e não por `classGroups`) porque no Tailwind v4 a mesma var
 * `--container-*` alimenta `max-w-*`, `min-w-*`, `w-*`, `basis-*` e as variantes de
 * container query: registrar no tema cobre os cinco de uma vez.
 *
 * Sem isto, `<DialogContent className="max-w-modal-sm">` NÃO vencia o `sm:max-w-[420px]`
 * da base — e nem `max-w-modal-sm` vencia `max-w-modal-lg`, token do DS contra token do
 * DS. O consumidor igreen-tickets precisou prefixar 51 overlays com `sm:` pra contornar,
 * sem saber por quê.
 *
 * Gate que impede drift com o token: `tw-merge-config.test.ts`.
 */
export const DS_CONTAINER_SCALE = [
  // Page containers
  "page-xs", "page-sm", "page-md", "page-lg", "page-xl", "page-2xl", "page-3xl",
  "main-content-max",
  // Component overlays
  "tooltip-sm", "tooltip-md", "tooltip-lg",
  "dropdown-sm", "dropdown-md", "dropdown-lg",
  "sidebar-sm", "sidebar-md", "sidebar-lg",
  "drawer-sm", "drawer-md", "drawer-lg",
  "modal-sm", "modal-md", "modal-lg",
] as const;

/**
 * Presets tipográficos — 1:1 com `tokens/brands/default/semantic/typography.ts`.
 * Sem isto o tailwind-merge lê `text-title-md` como text-COLOR, colide com
 * `text-fg-default` e remove uma das duas em silêncio (L-016).
 *
 * Gate: `dead-typography-presets` + `tw-merge-config.test.ts`.
 */
export const DS_TYPOGRAPHY_PRESETS = [
  // Displays (fluid clamp)
  "display-2xl", "display-xl", "display-lg", "display-md",
  // Headings (xs estático, sm-xl fluid clamp)
  "heading-xl", "heading-lg", "heading-md", "heading-sm", "heading-xs",
  // Titles (weight 600 default)
  "title-lg", "title-md", "title-sm",
  // Body (xs/sm = weight 500 interactive; md-2xl = 400 corrido)
  "body-2xl", "body-xl", "body-lg", "body-md", "body-sm", "body-xs",
  // Captions (weight 400)
  "caption-md", "caption-sm", "caption-xs",
  // Stat (número de métrica/KPI — estático, bold, leading tight)
  "stat-xl", "stat-lg", "stat-md", "stat-sm",
  // Code (mono regular)
  "code-md", "code-sm",
] as const;

/**
 * Config passada a `extendTailwindMerge` (pelo `cn`) e a `tv()` (pelo wrapper do DS).
 * Os dois caminhos de merge do DS usam ESTE objeto — não há segunda cópia.
 */
export const twMergeConfig = {
  extend: {
    theme: {
      container: [...DS_CONTAINER_SCALE],
    },
    classGroups: {
      "font-size": [{ text: [...DS_TYPOGRAPHY_PRESETS] }],

      /* ── Padding ──────────────────────────────────────────────────────── */
      p:  [{ p:  [isDsPad] }],
      px: [{ px: [isDsPad] }],
      py: [{ py: [isDsPad] }],
      pt: [{ pt: [isDsPad] }],
      pr: [{ pr: [isDsPad] }],
      pb: [{ pb: [isDsPad] }],
      pl: [{ pl: [isDsPad] }],
      ps: [{ ps: [isDsPad] }],
      pe: [{ pe: [isDsPad] }],

      /* ── Margin (usa mesmo sp-*) ──────────────────────────────────────── */
      m:  [{ m:  [isDsPad] }],
      mx: [{ mx: [isDsPad] }],
      my: [{ my: [isDsPad] }],
      mt: [{ mt: [isDsPad] }],
      mr: [{ mr: [isDsPad] }],
      mb: [{ mb: [isDsPad] }],
      ml: [{ ml: [isDsPad] }],
      ms: [{ ms: [isDsPad] }],
      me: [{ me: [isDsPad] }],

      /* ── Inset / position (top/right/bottom/left) ─────────────────────── */
      inset:          [{ inset:          [isDsPad] }],
      "inset-x":      [{ "inset-x":      [isDsPad] }],
      "inset-y":      [{ "inset-y":      [isDsPad] }],
      "top":          [{ top:            [isDsPad] }],
      "right":        [{ right:          [isDsPad] }],
      "bottom":       [{ bottom:         [isDsPad] }],
      "left":         [{ left:           [isDsPad] }],
      "start":        [{ start:          [isDsPad] }],
      "end":          [{ end:            [isDsPad] }],

      /* ── Gap ──────────────────────────────────────────────────────────── */
      gap:     [{ gap:     [isDsGap] }],
      "gap-x": [{ "gap-x": [isDsGap] }],
      "gap-y": [{ "gap-y": [isDsGap] }],

      /* ── Rounded (todas as cantos) ────────────────────────────────────── */
      rounded:       [{ rounded:       [isDsRadius] }],
      "rounded-s":   [{ "rounded-s":   [isDsRadius] }],
      "rounded-e":   [{ "rounded-e":   [isDsRadius] }],
      "rounded-t":   [{ "rounded-t":   [isDsRadius] }],
      "rounded-r":   [{ "rounded-r":   [isDsRadius] }],
      "rounded-b":   [{ "rounded-b":   [isDsRadius] }],
      "rounded-l":   [{ "rounded-l":   [isDsRadius] }],
      "rounded-ss":  [{ "rounded-ss":  [isDsRadius] }],
      "rounded-se":  [{ "rounded-se":  [isDsRadius] }],
      "rounded-ee":  [{ "rounded-ee":  [isDsRadius] }],
      "rounded-es":  [{ "rounded-es":  [isDsRadius] }],
      "rounded-tl":  [{ "rounded-tl":  [isDsRadius] }],
      "rounded-tr":  [{ "rounded-tr":  [isDsRadius] }],
      "rounded-br":  [{ "rounded-br":  [isDsRadius] }],
      "rounded-bl":  [{ "rounded-bl":  [isDsRadius] }],

      /* ── Shadow ───────────────────────────────────────────────────────── */
      shadow: [{ shadow: [isDsShadow] }],

      /* ── Form sizes (min-h, h, w, size) ───────────────────────────────────
       * `w` e `size` recebem TAMBÉM a escala de container pelo `theme` acima;
       * as duas extensões convivem (validator + tema no mesmo grupo).            */
      "min-h": [{ "min-h": [isDsForm] }],
      h:       [{ h:       [isDsForm] }],
      w:       [{ w:       [isDsForm] }],
      size:    [{ size:    [isDsForm] }],
    },
  },
};
