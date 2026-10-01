/**
 * color-palette.ts — Primitive color tokens — BRAND "anydocs" (Anydocs)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Marca = roxo #9353D3, medido no produto em produção (anydocsai.com.br, login e
 * landing, 2026-10-01) e não derivado de briefing.
 *
 * ── PROCEDÊNCIA, e por que ela importa ───────────────────────────────────────
 * O #9353D3 é literalmente o `secondary-500` DEFAULT do NextUI. Todas as cores da
 * Anydocs em produção são defaults da biblioteca: canvas #000000, surface #18181B,
 * texto #ECEDEE, success #17C964, warning #F5A524, danger #F31260. A única decisão
 * de marca que existe é usar `secondary` (roxo) em vez de `primary` nos elementos
 * de marca — e o `--nextui-primary` continua azul (#0072F5), governando o anel de
 * foco. Isto é, a identidade visual atual é meio escolha, meio resquício.
 *
 * Esta marca existe pra CONGELAR o que está no ar antes de o NextUI sair (os dois
 * caminhos de migração o removem). É retrato, não proposta. Quando houver manual
 * de marca, troque os valores aqui e rode `npm run tokens:brand:anydocs`.
 *
 * ── Duas âncoras, de propósito ───────────────────────────────────────────────
 * O #9353D3 entra EXATO nas duas rampas, em posições diferentes:
 *   brand[600]          → identidade light
 *   brandContrast[500]  → preenchimento no dark (o botão real da produção)
 *   brandContrast[400]  → texto/link/foco no dark
 *
 * O 400 mais claro existe porque o roxo falha como TEXTO sobre fundo escuro:
 *   #9353D3 sobre canvas  = 4.12:1  REPROVA AA
 *   #9353D3 sobre surface = 3.73:1  REPROVA AA
 *   #A56AE4 sobre canvas  = 5.39:1  passa
 *   #A56AE4 sobre surface = 4.87:1  passa
 * Em produção os links "Esqueceu sua senha?" e "Criar conta" são o #9353D3 sobre
 * escuro — ou seja, estão fora da AA hoje. Não é escolha de design: o NextUI
 * conflaciona `bg` e `fg` num token só, e o DS separa os dois papéis. A correção
 * sai de graça, sem mudar a cor que o olho reconhece (o preenchimento do botão
 * continua #9353D3 exato, 4.75:1 com texto branco).
 *
 * ⚠️ OKLCH é a fonte canônica; o hex do comentário é o equivalente sRGB derivado,
 * só pra conferência.
 *
 * Formato: OKLCH. Hue travado em 304.03 nas duas rampas de marca (o hue medido do
 * #9353D3) — diferente da `blue`, que desloca o hue do dark. Aqui não há motivo
 * pra deslocar: a fidelidade exige o mesmo roxo nos dois modos.
 */

// ─── Brand — base oklch(0.5767 0.1916 304.03) em 600 (#9353D3 — light) ────────
export const brand = {
  50:  "oklch(0.9710 0.0220 304.03)",   // #f8f2ff
  100: "oklch(0.9400 0.0480 304.03)",   // #f2e4ff
  150: "oklch(0.9120 0.0680 304.03)",   // #ecd7ff
  200: "oklch(0.8680 0.0980 304.03)",   // #e1c4ff
  300: "oklch(0.7880 0.1420 304.03)",   // #cea2ff
  400: "oklch(0.6900 0.1800 304.03)",   // #b47af4
  500: "oklch(0.6280 0.1900 304.03)",   // #a264e4
  600: "oklch(0.5767 0.1916 304.03)",   // #9353d3 — BASE, identidade light (medido em produção)
  700: "oklch(0.4920 0.1780 304.03)",   // #783db1
  800: "oklch(0.4020 0.1480 304.03)",   // #5a2b87
  900: "oklch(0.3000 0.1080 304.03)",   // #3a1a59
  950: "oklch(0.2120 0.0740 304.03)",   // #200d34
} as const;

// ─── Brand Contrast — base oklch(0.5767 0.1916 304.03) em 500 (#9353D3 — dark) ─
// Mesmo hue da `brand`. O 500 é o preenchimento (fiel ao produto); o 400 é o
// papel de TEXTO, que o 500 não cumpre sobre fundo escuro (ver cabeçalho).
export const brandContrast = {
  50:  "oklch(0.9750 0.0200 304.03)",   // #faf4ff
  100: "oklch(0.9480 0.0440 304.03)",   // #f4e7ff
  150: "oklch(0.9200 0.0650 304.03)",   // #eed9ff
  200: "oklch(0.8860 0.0900 304.03)",   // #e6cbff
  300: "oklch(0.7600 0.1480 304.03)",   // #c698fd
  400: "oklch(0.6400 0.1810 304.03)",   // #a56ae4 — texto/link/ring no dark (5.39:1 no canvas)
  500: "oklch(0.5767 0.1916 304.03)",   // #9353d3 — BASE, preenchimento no dark (4.75:1 com branco)
  600: "oklch(0.5200 0.1860 304.03)",   // #8143bd
  700: "oklch(0.4400 0.1640 304.03)",   // #67319a
  800: "oklch(0.3560 0.1340 304.03)",   // #4c2273
  900: "oklch(0.2680 0.0980 304.03)",   // #31154c
  950: "oklch(0.1900 0.0660 304.03)",   // #1a092b
} as const;

// ─── Gray — neutro tingido de violeta (hue 290) ───────────────────────────────
// Mesma lightness da default em 50–800 (preserva hierarquia de contraste e as
// superfícies do light), só adiciona croma no hue 290 — entre o canvas medido
// (283.94) e o brand (304.03).
//
// ⚠️ 900 e 950 DIVERGEM em lightness, não só em croma: o 900 carrega o canvas
// dark da Anydocs (#0B0B14, L 0.1545) contra os 0.205 da default. Foi decisão do
// gate — o app usa #000000 puro, que comprime a hierarquia obrigatória
// `canvas < surface < subtle < muted` (L-008) de 4 degraus em 3. O #0B0B14 é o
// canvas que a própria landing da Anydocs já usa, e abre o espaço de volta.
// O 950 desceu junto pra não colidir com o 900 (0.1545 vs 0.15 na default).
export const gray = {
  50:  "oklch(0.973 0.004 290)",
  100: "oklch(0.94 0.007 290)",
  150: "oklch(0.931 0.008 290)",
  200: "oklch(0.9076 0.011 290)",
  300: "oklch(0.8761 0.015 290)",
  400: "oklch(0.7025 0.022 290)",
  500: "oklch(0.4997 0.026 290)",
  600: "oklch(0.36 0.020 290)",
  700: "oklch(0.30 0.017 290)",   // ↓ croma no fundo escuro — borda/superfície sem roxo "carregado"
  800: "oklch(0.2645 0.015 290)", // border-default dark
  900: "oklch(0.1545 0.019 290)", // #0b0b14 — canvas dark da Anydocs (medido na landing)
  950: "oklch(0.1100 0.016 290)", // abaixo do 900, que desceu
} as const;

// ─── Status — verbatim da `default` ───────────────────────────────────────────
// Decisão do gate: NÃO importar os status do NextUI que estão em produção
// (#17C964 / #F5A524 / #F31260). O #F5A524 é exatamente o âmbar que um
// desenvolvedor da Anydocs já mediu em 2.04:1 e recusou à mão, escrevendo
// `--nextui-warning-700` inline no VistoriadorTable. Importá-lo seria importar o
// defeito junto com a cor.
//
// Valores idênticos aos da `default` → o `diffVars` do transform não emite var
// nenhuma pra eles no overlay. Estão aqui porque o contrato do arquivo exige o
// objeto completo, não porque divergem.
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

export const caution = {
  50:  "oklch(0.97 0.016 55)",
  100: "oklch(0.95 0.027 55)",
  150: "oklch(0.93 0.038 55)",
  200: "oklch(0.90 0.056 55)",
  300: "oklch(0.83 0.102 55)",
  400: "oklch(0.78 0.138 55)",
  500: "oklch(0.74 0.170 55)",   // BASE
  600: "oklch(0.65 0.149 55)",
  700: "oklch(0.55 0.126 55)",
  800: "oklch(0.44 0.101 55)",
  900: "oklch(0.33 0.076 55)",
  950: "oklch(0.23 0.053 55)",
} as const;

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

export const white = "oklch(1 0 0)";
export const black = "oklch(0 0 0)";

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
  success, warning, caution, danger, info,
  white, black,
  alpha,
};
