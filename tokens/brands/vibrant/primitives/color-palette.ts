/**
 * color-palette.ts — Primitive color tokens — BRAND "vibrant" (iGreen Vibrant)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Marca = verde FLUORESCENTE #0fff00, âncora no shade 400 (não no 600 como a
 * default). Escala gerada em uicolors.app/generate/0fff00 e entregue via
 * handoff em `theme/` (BRIEF.md + tokens.json).
 *
 * ⚠️ OKLCH é a fonte canônica; o hex do comentário é o equivalente sRGB
 * derivado, só pra conferência. NÃO re-arredondar: a precisão de cada valor é a
 * mínima que faz round-trip exato. Com 3 casas na croma os shades 400–800 erram
 * até 3/255 por canal (medido no handoff).
 *
 * Escopo desta marca = SÓ a família brand. `gray` e os status são cópia
 * verbatim da default de propósito → geram diff ZERO no overlay, então nenhum
 * neutro/status muda quando o tema é ativado.
 */

// ─── Brand — verde fluorescente, base oklch(0.866993 0.294055 142.3546) em 400 ─
// Hue travado em ~142.4 na escala inteira (141.03 → 143.47, só 2.5° de deriva);
// a croma faz o trabalho: 0.043 no 50, pico de 0.294 no 400, cai a 0.093 no 950.
// Sem shade 150: a escala tem 11 posições por decisão da ferramenta e o handoff
// proíbe inventar intermediários (nenhum arquivo semantic referencia brand[150]).
export const brand = {
  50:  "oklch(0.9761 0.0429 141.03)",         // #e8ffe4
  100: "oklch(0.9493 0.0945 141.72)",         // #cbffc4
  200: "oklch(0.9125 0.1746 142.08)",         // #9aff90
  300: "oklch(0.8818 0.2530 142.13)",         // #5cff50
  400: "oklch(0.866993 0.294055 142.3546)",   // #0fff00 — BASE (âncora, light E dark)
  500: "oklch(0.8018 0.2721 142.38)",         // #0ae600 — hover
  600: "oklch(0.6783 0.2304 142.42)",         // #04b800 — active / chart no light
  700: "oklch(0.5518 0.1876 142.46)",         // #018b00 — 4.47:1 no branco, REPROVA AA
  800: "oklch(0.4645 0.1539 142.59)",         // #076d07 — 6.56:1, 1º shade com AA folgado
  900: "oklch(0.4138 0.1317 142.94)",         // #0b5c0d
  950: "oklch(0.2820 0.0929 143.47)",         // #003403 — texto sobre superfície de marca
} as const;

// ─── Brand Contrast — aponta pro MESMO ramp, e isso é deliberado ───────────────
// A default precisa de um ramp mais claro no dark porque o brand dela (L 0.52)
// não contrasta com near-black. Aqui o brand JÁ está em L 0.867, no teto do
// gamut sRGB: fixando L e H e subindo a croma, 0.294 → #0fff00 mas 0.32/0.36/0.40
// → todos #00ff00 (clipam). Não existe variante mais clara ou mais saturada pra
// derivar — então o dark usa o próprio brand. O objeto existe pra manter o
// contrato dos primitives idêntico ao das outras 4 marcas.
export const brandContrast = brand;

// ─── Gray — cópia verbatim da default (chroma 0) → diff zero no overlay ────────
// ⚠️ NÃO trocar pela neutra do handoff (`color.neutral.*`): ela carrega croma
// 0.004–0.015 em hue ~286 (viés azul-violeta) e mudaria a temperatura da UI
// inteira. Decisão registrada no BRIEF §4.1 e confirmada no gate.
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

// ─── Danger — verbatim da default (hue 25) ────────────────────────────────────
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

// ─── Success — verbatim da default (hue 161) ──────────────────────────────────
// Fica 19° de hue distante do brand (142) e bem mais escuro/menos saturado, então
// "verde de sucesso" e "verde neon da marca" não se confundem. Não foi tingido.
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

// ─── Warning — verbatim da default (hue 81) ───────────────────────────────────
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

// ─── Info — verbatim da default (hue 280) ─────────────────────────────────────
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
