/**
 * color-palette.ts — Primitive color tokens — BRAND "green" (multi-tema)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Irmã da brand "blue": mesma receita, mas TODA a UI puxa VERDE. Diferente da
 * default (verde só na marca, neutros cinza) E diferente do verde iGreen —
 * aqui é um GRASS/SPRING GREEN mais quente e vivo (hue ~142, vs iGreen 151/162),
 * com neutros/surfaces claramente esverdeados (chroma alto — verde pesa menos que
 * azul no olho, precisa mais chroma pra ler igual). "Todo verde", tom próprio.
 *
 * Formato: OKLCH. Hue verde-grama ~142 (light) / ~145 (dark, mais brilhante).
 */

// ─── Brand — base oklch(0.58 0.17 142) em 600 (verde-grama vivo — light) ───────
export const brand = {
  50:  "oklch(0.97 0.030 142)",
  100: "oklch(0.94 0.058 142)",
  150: "oklch(0.91 0.080 142)",
  200: "oklch(0.87 0.110 142)",
  300: "oklch(0.78 0.145 142)",
  400: "oklch(0.68 0.165 142)",
  500: "oklch(0.62 0.170 142)",
  600: "oklch(0.58 0.170 142)",   // BASE — identidade light (verde-grama vivo)
  700: "oklch(0.49 0.155 142)",
  800: "oklch(0.39 0.130 142)",
  900: "oklch(0.28 0.095 142)",
  950: "oklch(0.19 0.065 142)",
} as const;

// ─── Brand Contrast — base oklch(0.81 0.19 145) em 400 (verde brilhante — dark) ─
// Bem mais claro/vivo que o emerald da iGreen (0.7289/0.1571/162) → dark distinto.
export const brandContrast = {
  50:  "oklch(0.97 0.032 145)",
  100: "oklch(0.94 0.062 145)",
  150: "oklch(0.91 0.088 145)",
  200: "oklch(0.87 0.120 145)",
  300: "oklch(0.84 0.155 145)",
  400: "oklch(0.81 0.190 145)",   // BASE — identidade dark (verde-grama brilhante)
  500: "oklch(0.73 0.180 145)",
  600: "oklch(0.63 0.160 145)",
  700: "oklch(0.51 0.130 145)",
  800: "oklch(0.39 0.100 145)",
  900: "oklch(0.28 0.070 145)",
  950: "oklch(0.19 0.048 145)",
} as const;

// ─── Gray — neutro VERDE (chroma ALTO) — puxa o verde forte pros neutros ───────
// Mesma lightness da default (preserva contraste/surfaces dark), chroma ~2× o do
// blue (hue 142) pra que backgrounds, borders e texto leiam claramente VERDE.
export const gray = {
  // Light-end (50–300, 950): chroma BAIXO → neutros/borda/texto quase cinza no light
  50:  "oklch(0.973 0.004 142)",
  100: "oklch(0.94 0.006 142)",
  150: "oklch(0.931 0.007 142)",
  200: "oklch(0.9076 0.009 142)",
  300: "oklch(0.8761 0.012 142)",
  400: "oklch(0.7025 0.022 142)",
  500: "oklch(0.4997 0.028 142)",
  // Dark-end (600–900): chroma ALTO → surfaces/borda dark claramente verdes
  600: "oklch(0.36 0.036 142)",
  700: "oklch(0.30 0.030 142)",
  800: "oklch(0.2645 0.026 142)", // border-default dark — verde nítido, sem "glow"
  900: "oklch(0.205 0.026 142)",  // canvas dark — page claramente verde
  950: "oklch(0.15 0.010 142)",   // fg light — quase cinza
} as const;

// ─── Danger — idêntico à default (vermelho hue 25) ────────────────────────────
export const danger = {
  50:  "oklch(0.97 0.025 25)",
  100: "oklch(0.94 0.050 25)",
  150: "oklch(0.91 0.080 25)",
  200: "oklch(0.86 0.110 25)",
  300: "oklch(0.76 0.165 25)",
  400: "oklch(0.69 0.195 25)",
  500: "oklch(0.6368 0.2078 25.33)",
  600: "oklch(0.56 0.200 25)",
  700: "oklch(0.46 0.180 25)",
  800: "oklch(0.36 0.140 25)",
  900: "oklch(0.26 0.100 25)",
  950: "oklch(0.18 0.070 25)",
} as const;

// ─── Success — idêntico à default (verde teal hue 161) ────────────────────────
export const success = {
  50:  "oklch(0.96 0.025 161)",
  100: "oklch(0.93 0.045 161)",
  150: "oklch(0.90 0.065 161)",
  200: "oklch(0.85 0.090 161)",
  300: "oklch(0.77 0.115 161)",
  400: "oklch(0.71 0.130 161)",
  500: "oklch(0.66 0.135 161)",
  600: "oklch(0.57 0.130 161)",
  700: "oklch(0.47 0.110 161)",
  800: "oklch(0.37 0.085 161)",
  900: "oklch(0.27 0.060 161)",
  950: "oklch(0.19 0.045 161)",
} as const;

// ─── Warning — idêntico à default (amarelo-laranja hue 81) ────────────────────
export const warning = {
  50:  "oklch(0.97 0.030 81)",
  100: "oklch(0.95 0.060 81)",
  150: "oklch(0.93 0.090 81)",
  200: "oklch(0.91 0.115 81)",
  300: "oklch(0.86 0.150 81)",
  400: "oklch(0.83 0.155 81)",
  500: "oklch(0.81 0.160 81)",
  600: "oklch(0.71 0.155 81)",
  700: "oklch(0.59 0.135 81)",
  800: "oklch(0.46 0.110 81)",
  900: "oklch(0.34 0.085 81)",
  950: "oklch(0.24 0.060 81)",
} as const;

// ─── Info — idêntico à default (roxo hue 280) ─────────────────────────────────
export const info = {
  50:  "oklch(0.97 0.025 280)",
  100: "oklch(0.93 0.050 280)",
  150: "oklch(0.89 0.085 280)",
  200: "oklch(0.85 0.110 280)",
  300: "oklch(0.76 0.155 280)",
  400: "oklch(0.69 0.190 280)",
  500: "oklch(0.62 0.210 280)",
  600: "oklch(0.55 0.200 280)",
  700: "oklch(0.46 0.170 280)",
  800: "oklch(0.37 0.135 280)",
  900: "oklch(0.27 0.095 280)",
  950: "oklch(0.19 0.070 280)",
} as const;

// ─── Universais puros ─────────────────────────────────────────────────────────
export const white = "oklch(1 0 0)";
export const black = "oklch(0 0 0)";

// ─── Alpha (overlays / scrim) — idêntico à default ────────────────────────────
export const alpha = {
  black: {
    4:  "oklch(0 0 0 / 0.04)",
    8:  "oklch(0 0 0 / 0.08)",
    12: "oklch(0 0 0 / 0.12)",
    16: "oklch(0 0 0 / 0.16)",
    24: "oklch(0 0 0 / 0.24)",
    32: "oklch(0 0 0 / 0.32)",
    40: "oklch(0 0 0 / 0.40)",
    45: "oklch(0 0 0 / 0.45)",
    48: "oklch(0 0 0 / 0.48)",
    55: "oklch(0 0 0 / 0.55)",
    64: "oklch(0 0 0 / 0.64)",
  },
  white: {
    1:  "oklch(1 0 0 / 0.01)",
    2:  "oklch(1 0 0 / 0.02)",
    3:  "oklch(1 0 0 / 0.03)",
    4:  "oklch(1 0 0 / 0.04)",
    8:  "oklch(1 0 0 / 0.08)",
    12: "oklch(1 0 0 / 0.12)",
    16: "oklch(1 0 0 / 0.16)",
    24: "oklch(1 0 0 / 0.24)",
    32: "oklch(1 0 0 / 0.32)",
  },
} as const;

export const colorPalette = {
  brand, brandContrast, gray,
  success, warning, danger, info,
  white, black,
  alpha,
};
