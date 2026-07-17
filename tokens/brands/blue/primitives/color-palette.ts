/**
 * color-palette.ts — Primitive color tokens — BRAND "blue" (teste multi-tema)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Marca de TESTE pra validar a hipótese "tokens/brands/ aceita novos temas".
 * Estrutura idêntica à brand default — só mudam as escalas `brand` e
 * `brandContrast` (verde → azul). Neutros e status permanecem iguais: a
 * identidade de uma marca vive no par brand/brandContrast (+ chart-1).
 *
 * Formato: OKLCH. Hue azul ~264 (light) / ~256 (dark, mais brilhante).
 */

// ─── Brand — base oklch(0.52 0.18 264) em 600 (azul — light theme) ────────────
export const brand = {
  50:  "oklch(0.97 0.020 264)",
  100: "oklch(0.93 0.045 264)",
  150: "oklch(0.90 0.065 264)",
  200: "oklch(0.85 0.095 264)",
  300: "oklch(0.75 0.135 264)",
  400: "oklch(0.64 0.165 264)",
  500: "oklch(0.58 0.175 264)",
  600: "oklch(0.52 0.180 264)",   // BASE — identidade light (azul ~#2f5de0)
  700: "oklch(0.44 0.165 264)",
  800: "oklch(0.35 0.135 264)",
  900: "oklch(0.25 0.095 264)",
  950: "oklch(0.17 0.065 264)",
} as const;

// ─── Brand Contrast — base oklch(0.72 0.15 256) em 400 (azul brilhante — dark) ─
// Usado no dark theme como cor primária. Hue 256 (ligeiramente diferente do brand 264).
export const brandContrast = {
  50:  "oklch(0.97 0.020 256)",
  100: "oklch(0.94 0.045 256)",
  150: "oklch(0.91 0.070 256)",
  200: "oklch(0.86 0.095 256)",
  300: "oklch(0.79 0.120 256)",
  400: "oklch(0.72 0.150 256)",   // BASE — identidade dark (azul brilhante)
  500: "oklch(0.65 0.155 256)",
  600: "oklch(0.56 0.150 256)",
  700: "oklch(0.46 0.130 256)",
  800: "oklch(0.35 0.100 256)",
  900: "oklch(0.25 0.070 256)",
  950: "oklch(0.17 0.050 256)",
} as const;

// ─── Gray — neutro COOL (blue-tinted / slate) — puxa o azul pros neutros ──────
// Mesma lightness da default (preserva a hierarquia de contraste e as surfaces
// dark), só adiciona chroma no hue 264. É o que faz backgrounds, borders e texto
// "casarem" com a marca azul em vez de cinza neutro.
export const gray = {
  50:  "oklch(0.973 0.004 264)",
  100: "oklch(0.94 0.007 264)",
  150: "oklch(0.931 0.008 264)",
  200: "oklch(0.9076 0.011 264)",
  300: "oklch(0.8761 0.015 264)",
  400: "oklch(0.7025 0.024 264)",
  500: "oklch(0.4997 0.028 264)",
  600: "oklch(0.36 0.022 264)",
  700: "oklch(0.30 0.018 264)",   // ↓ chroma no fundo escuro (era 0.038) — borda/superfície sem azul "carregado"
  800: "oklch(0.2645 0.016 264)", // border-default dark — L da default, chroma sutil
  900: "oklch(0.205 0.014 264)",
  950: "oklch(0.15 0.012 264)",
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
