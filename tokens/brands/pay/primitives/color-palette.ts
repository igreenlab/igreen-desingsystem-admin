/**
 * color-palette.ts — Primitive color tokens — BRAND "pay" (iGreen Pay)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Extraído 1:1 do Design Kit oficial do Portal do Parceiro (Claude Design).
 * Marca = verde iGreen Pay #00a859 (NÃO é o verde #00803c do DS default nem o
 * Tailwind #22c55e). Dark = near-black #050608/#0b0d10 (padrão do app).
 *
 * Os arquivos semantic usam os HEX/RGBA exatos do kit para casar pixel-perfect;
 * este arquivo mantém o ramp por coerência (só white/black são importados lá).
 */

// ─── Brand — verde iGreen Pay, base #00a859 em 600 ────────────────────────────
export const brand = {
  50:  "#e6f7ee",
  100: "#c2ebd5",
  150: "#9fdfbc",
  200: "#79d2a1",
  300: "#40c07d",
  400: "#18b268",
  500: "#00a859",   // brand-text/ok light
  600: "#00a859",   // BASE — --brand
  700: "#008a4b",   // --brand-2
  800: "#006e3c",
  900: "#00512c",
  950: "#00351d",
} as const;

// ─── Brand Contrast — verde claro p/ texto/acento no dark (#3bc882) ───────────
export const brandContrast = {
  50:  "#e6f7ee",
  100: "#c2ebd5",
  150: "#9fdfbc",
  200: "#79d2a1",
  300: "#5ad096",
  400: "#3bc882",   // BASE — --brand-text (dark)
  500: "#18b268",
  600: "#00a859",
  700: "#008a4b",
  800: "#006e3c",
  900: "#00512c",
  950: "#00351d",
} as const;

// ─── Gray — neutros near-black do kit (dark) ──────────────────────────────────
export const gray = {
  50:  "#f3f4f6",
  100: "#eceef1",
  150: "#e6e8ec",
  200: "#d7dbe0",
  300: "#c9ced4",
  400: "#7e8994",
  500: "#5f6b77",
  600: "#3a4048",
  700: "#23262c",
  800: "#13161c",
  900: "#0b0d10",
  950: "#050608",
} as const;

// ─── Status — cores próprias do kit (dark como referência) ────────────────────
export const success = { 500: "#3bc882" } as const;
export const warning = { 500: "#ffb620" } as const;
export const danger  = { 500: "#ff6b6b" } as const;
export const info    = { 500: "#3580ff" } as const;

// ─── Universais puros ─────────────────────────────────────────────────────────
export const white = "#ffffff";
export const black = "#000000";

export const alpha = {
  black: { 55: "rgba(0,0,0,.55)", 60: "rgba(0,0,0,.6)" },
  white: { 8: "rgba(255,255,255,.08)", 16: "rgba(255,255,255,.16)" },
} as const;

export const colorPalette = {
  brand, brandContrast, gray, success, warning, danger, info, white, black, alpha,
};
