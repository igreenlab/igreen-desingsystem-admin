import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tw-merge configurado pra reconhecer:
 *
 * 1) Presets tipográficos do iGreen DS como `font-size` (e não text-color).
 *    Sem isso, `text-title-md` e `text-fg-default` colidem e um é removido.
 *
 * 2) Prefixos DS (pad-*, sp-*, gp-*, radius-*, sh-*, form-*) como conflitantes
 *    com utilitários nativos do Tailwind. Sem isso, `p-pad-4xl` + `p-0` no cn()
 *    deixava AMBOS no className final (24px + 0 = 24px ganhava).
 */

/** Padding/Margin spacing: pad-* (padding contexts), sp-* (geral) */
const isDsPad = (v: string) => /^(pad|sp)-/.test(v);
/** Gap: gp-* */
const isDsGap = (v: string) => /^gp-/.test(v);
/** Border-radius: radius-* */
const isDsRadius = (v: string) => /^radius-/.test(v);
/** Shadow: sh-* */
const isDsShadow = (v: string) => /^sh-/.test(v);
/** Form heights: form-* (min-h, h, w, size) */
const isDsForm = (v: string) => /^form-/.test(v);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          // Lista 1:1 com tokens/brands/default/semantic/typography.ts.
          // Manter sincronizado com src/utils/tv.ts. Ver L-016.
          text: [
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
            // Code (mono regular)
            "code-md", "code-sm",
          ],
        },
      ],

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

      /* ── Form sizes (min-h, h, w, size) ───────────────────────────────── */
      "min-h": [{ "min-h": [isDsForm] }],
      h:       [{ h:       [isDsForm] }],
      w:       [{ w:       [isDsForm] }],
      size:    [{ size:    [isDsForm] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
