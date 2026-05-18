/**
 * color-palette.ts — Primitive color tokens (v3)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Nunca referenciar diretamente em componentes.
 * Componentes usam semantic tokens (color-light / color-dark).
 *
 * Formato: OKLCH (perceptualmente uniforme, suporte P3, ideal para color-mix())
 *
 * Escala 50–950 (12 níveis com 150 extra):
 *   50  → quase branco
 *   500/600 → tom médio (referência de identidade — varia por cor)
 *   950 → quase preto
 *
 * NAMING V3:
 *   brand          → cor da marca (verde escuro #00803c — light theme)
 *   brandContrast  → variante brilhante (verde #0fc589 — dark theme)
 *   gray           → neutro puro (chroma 0)
 *   danger         → feedback destrutivo/erro (vermelho)
 *   success / warning / info → feedback positivo / atenção / informação
 */

// ─── Brand — base oklch(0.5248 0.1415 150.9) em 600 (verde escuro #00803c) ────
export const brand = {
  50:  "oklch(0.97 0.022 151)",
  100: "oklch(0.93 0.045 151)",
  150: "oklch(0.90 0.060 151)",
  200: "oklch(0.85 0.085 151)",
  300: "oklch(0.76 0.115 151)",
  400: "oklch(0.65 0.135 151)",
  500: "oklch(0.58 0.140 151)",
  600: "oklch(0.5248 0.1415 150.9)",   // BASE — identidade light
  700: "oklch(0.43 0.130 151)",
  800: "oklch(0.34 0.110 151)",
  900: "oklch(0.24 0.080 151)",
  950: "oklch(0.16 0.055 151)",
} as const;

// ─── Brand Contrast — base oklch(0.7289 0.1571 162.3) em 400 (verde brilhante #0fc589) ──
// Usado no dark theme como cor primária. Hue 162 (ligeiramente diferente do brand 151).
export const brandContrast = {
  50:  "oklch(0.97 0.025 162)",
  100: "oklch(0.94 0.050 162)",
  150: "oklch(0.91 0.075 162)",
  200: "oklch(0.86 0.100 162)",
  300: "oklch(0.79 0.130 162)",
  400: "oklch(0.7289 0.1571 162.3)",   // BASE — identidade dark
  500: "oklch(0.65 0.155 162)",
  600: "oklch(0.55 0.140 162)",
  700: "oklch(0.45 0.115 162)",
  800: "oklch(0.34 0.085 162)",
  900: "oklch(0.24 0.060 162)",
  950: "oklch(0.16 0.040 162)",
} as const;

// ─── Gray — neutro puro (chroma 0) ────────────────────────────────────────────
export const gray = {
  50:  "oklch(0.973 0 0)",
  100: "oklch(0.94 0 0)",
  150: "oklch(0.931 0 0)",
  200: "oklch(0.9076 0 0)",
  300: "oklch(0.8761 0 0)",
  400: "oklch(0.7025 0 0)",
  500: "oklch(0.4997 0 0)",
  600: "oklch(0.36 0 0)",
  700: "oklch(0.30 0 0)",
  800: "oklch(0.2645 0 0)",
  900: "oklch(0.205 0 0)",
  950: "oklch(0.15 0 0)",
} as const;

// ─── Danger — base oklch(0.6368 0.2078 25.33) em 500 (vermelho hue 25) ────────
export const danger = {
  50:  "oklch(0.97 0.025 25)",
  100: "oklch(0.94 0.050 25)",
  150: "oklch(0.91 0.080 25)",
  200: "oklch(0.86 0.110 25)",
  300: "oklch(0.76 0.165 25)",
  400: "oklch(0.69 0.195 25)",
  500: "oklch(0.6368 0.2078 25.33)",   // BASE
  600: "oklch(0.56 0.200 25)",
  700: "oklch(0.46 0.180 25)",
  800: "oklch(0.36 0.140 25)",
  900: "oklch(0.26 0.100 25)",
  950: "oklch(0.18 0.070 25)",
} as const;

// ─── Success — base oklch(0.66 0.135 161) em 500 (verde teal hue 161) ─────────
export const success = {
  50:  "oklch(0.96 0.025 161)",
  100: "oklch(0.93 0.045 161)",
  150: "oklch(0.90 0.065 161)",
  200: "oklch(0.85 0.090 161)",
  300: "oklch(0.77 0.115 161)",
  400: "oklch(0.71 0.130 161)",
  500: "oklch(0.66 0.135 161)",   // BASE
  600: "oklch(0.57 0.130 161)",
  700: "oklch(0.47 0.110 161)",
  800: "oklch(0.37 0.085 161)",
  900: "oklch(0.27 0.060 161)",
  950: "oklch(0.19 0.045 161)",
} as const;

// ─── Warning — base oklch(0.81 0.160 81) em 500 (amarelo-laranja hue 81) ──────
export const warning = {
  50:  "oklch(0.97 0.030 81)",
  100: "oklch(0.95 0.060 81)",
  150: "oklch(0.93 0.090 81)",
  200: "oklch(0.91 0.115 81)",
  300: "oklch(0.86 0.150 81)",
  400: "oklch(0.83 0.155 81)",
  500: "oklch(0.81 0.160 81)",   // BASE
  600: "oklch(0.71 0.155 81)",
  700: "oklch(0.59 0.135 81)",
  800: "oklch(0.46 0.110 81)",
  900: "oklch(0.34 0.085 81)",
  950: "oklch(0.24 0.060 81)",
} as const;

// ─── Info — base oklch(0.62 0.210 280) em 500 (roxo hue 280) ──────────────────
export const info = {
  50:  "oklch(0.97 0.025 280)",
  100: "oklch(0.93 0.050 280)",
  150: "oklch(0.89 0.085 280)",
  200: "oklch(0.85 0.110 280)",
  300: "oklch(0.76 0.155 280)",
  400: "oklch(0.69 0.190 280)",
  500: "oklch(0.62 0.210 280)",   // BASE
  600: "oklch(0.55 0.200 280)",
  700: "oklch(0.46 0.170 280)",
  800: "oklch(0.37 0.135 280)",
  900: "oklch(0.27 0.095 280)",
  950: "oklch(0.19 0.070 280)",
} as const;

// ─── Universais puros ─────────────────────────────────────────────────────────
export const white = "oklch(1 0 0)";
export const black = "oklch(0 0 0)";

// ─── Alpha (overlays / scrim — só black e white com OKLCH slash alpha) ────────
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
