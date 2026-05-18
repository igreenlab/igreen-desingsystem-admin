/**
 * fonts.ts — Typographic scale
 * Tier 1 de 3: valores raw. API privada.
 *
 * Princípio: escala baseada em razão modular (1.25 — Major Third).
 *
 * BASE = 16px (1rem)
 * Razão = 1.25 (major third)
 *
 * Regra de line-height: proporcional ao font-size.
 *   - Displays e headings: ratio 1.2 (tight)
 *   - Body: ratio 1.5 (confortável para leitura)
 *   - Captions/labels: ratio 1.33
 *
 * Uso: importar nos arquivos semantic (typography.ts).
 * Nunca usar valores raw diretamente em componentes.
 */

const BASE = 16;       // px
const RATIO = 1.25;    // major third

/**
 * Calcula font-size na escala modular.
 * step > 0 = maior que base, step < 0 = menor que base
 */
export const typeSize = (step: number): string =>
  `${Math.round(BASE * Math.pow(RATIO, step))}px`;

/**
 * Calcula line-height proporcional ao font-size.
 * tight = displays/headings, normal = body, loose = captions
 */
export const lh = (
  size: number,
  mode: "tight" | "normal" | "loose" = "normal"
): string => {
  const ratio = { tight: 1.2, normal: 1.5, loose: 1.33 };
  return `${Math.round(size * ratio[mode])}px`;
};

/**
 * Font families (valores raw).
 * A decisão de qual fonte usa cada preset fica em typography.ts (semântico).
 */
export const fontFamily = {
  sans:  "var(--font-sans, 'Geist', system-ui, -apple-system, sans-serif)",
  mono:  "var(--font-mono, 'Geist Mono', 'Fira Code', monospace)",
  serif: "var(--font-serif, Georgia, 'Times New Roman', serif)",
} as const;

/**
 * Font weights.
 * Usando nomes semânticos, não números — portável entre fontes.
 */
export const fontWeight = {
  regular:  "400",
  medium:   "500",
  semibold: "600",
  bold:     "700",
} as const;

/**
 * Letter-spacing por contexto.
 */
export const letterSpacing = {
  tighter: "-0.02em",
  tight:   "-0.01em",  // displays e headlines grandes
  normal:  "0em",      // body
  wide:    "0.01em",   // labels, botões
  wider:   "0.03em",
  widest:  "0.05em",   // overlines, all-caps
} as const;

/** Escala com named keys — usada por typography.ts */
export const fontSize: Record<string, { size: string; lineHeight: string }> = {
  "2xs": { size: typeSize(-3), lineHeight: lh(Math.round(BASE * Math.pow(RATIO, -3)), "loose") },
  xs:    { size: typeSize(-2), lineHeight: lh(Math.round(BASE * Math.pow(RATIO, -2)), "normal") },
  sm:    { size: typeSize(-1), lineHeight: lh(Math.round(BASE * Math.pow(RATIO, -1)), "normal") },
  md:    { size: typeSize(0),  lineHeight: lh(BASE, "normal") },
  lg:    { size: typeSize(1),  lineHeight: lh(Math.round(BASE * RATIO), "tight") },
  xl:    { size: typeSize(2),  lineHeight: lh(Math.round(BASE * Math.pow(RATIO, 2)), "tight") },
  "2xl": { size: typeSize(3),  lineHeight: lh(Math.round(BASE * Math.pow(RATIO, 3)), "tight") },
  "3xl": { size: typeSize(4),  lineHeight: lh(Math.round(BASE * Math.pow(RATIO, 4)), "tight") },
  "4xl": { size: typeSize(5),  lineHeight: lh(Math.round(BASE * Math.pow(RATIO, 5)), "tight") },
  "5xl": { size: typeSize(6),  lineHeight: lh(Math.round(BASE * Math.pow(RATIO, 6)), "tight") },
};
