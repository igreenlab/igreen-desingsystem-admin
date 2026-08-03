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

// ─── Gray — neutra ZINC do handoff (fria, croma 0.001–0.015 em hue ~286) ──────
// Vem de `theme/tokens.json` → `color.neutral.*`, convertida do hex realmente
// aplicado no preview do uicolors.
//
// O §4.1 do BRIEF recomendava NÃO importar, com o argumento de que "muda a
// temperatura da UI inteira, em todas as brands". Esse argumento assume DS de
// marca única: aqui `gray` é POR MARCA, então a Zinc entra escopada no
// [data-theme="vibrant"] e as outras 4 marcas continuam em croma zero. Decisão
// do mantenedor no gate — o near-black frio (#0e0e11) sob o verde neón é a
// linguagem do próprio handoff.
//
// ⚠️ A Zinc tem 11 posições e o nosso contrato usa `gray[150]` (border.subtle e
// border.table). O 150 é INTERPOLADO entre 100 e 200 — é o único valor deste
// arquivo que não vem do handoff.
// ⚠️ CROMA CORTADO À METADE do Zinc original (ajuste do mantenedor: "os tons de azul
// ficaram bons porém no geral as cores ficaram mais cansativas, não tão suavizadas
// como na brand atual"). O L e o hue de cada shade seguem intactos — só a saturação
// cai 50%. Comparando o 700, que é onde o Zinc satura mais:
//   Zinc cru   #3f3f46   (croma 0.0119)
//   aqui       #3f3f43   (croma 0.0060)
//   iGreen     #404040   (croma 0)
// Por que NÃO puxar a neutra pro verde da brand (hue 142) pra "combinar": azul-violeta
// é COMPLEMENTAR ao verde neon, e é isso que faz a marca saltar contra o fundo. Neutra
// esverdeada achataria o contraste de matiz e o neon perderia presença. O que cansa a
// vista não é a direção do hue, é a quantidade de croma — então cortamos a quantidade
// e preservamos a direção. Fica um meio-termo: ainda lê frio, mas perto do repouso da
// escala cinza da iGreen padrão.
export const gray = {
  50:  "oklch(0.9851 0 0)",            // #fafafa (já era acromático no handoff)
  100: "oklch(0.9674 0.0007 286.38)",  // #f4f4f5
  150: "oklch(0.9436 0.0014 286.35)",  // INTERPOLADO (100↔200), não é do handoff
  200: "oklch(0.9197 0.0020 286.32)",
  300: "oklch(0.8711 0.0028 286.29)",
  400: "oklch(0.7118 0.0065 286.07)",  // #a1a1a6 — fg.muted no dark
  500: "oklch(0.5517 0.0069 285.94)",  // #717176 — fg.muted no light, 4.83:1 no branco
  600: "oklch(0.4419 0.0073 285.79)",
  700: "oklch(0.3703 0.0060 285.81)",  // #3f3f43
  800: "oklch(0.2739 0.0028 286.03)",
  900: "oklch(0.2103 0.0030 285.89)",  // bg.surface no dark
  950: "oklch(0.1652 0.0031 285.70)",  // bg.canvas no dark (near-black do handoff)
} as const;

/* ── STATUS ────────────────────────────────────────────────────────────────────
 *
 * Os status desta marca foram re-medidos, não copiados da default. Motivo: a
 * default já vive perto do teto de gamut (danger 84% do teto do próprio hue,
 * success 92%, warning 96%, info 100%), então "deixar mais vibrante subindo a
 * saturação" rende de +4% a +20% — e ZERO no roxo. A alavanca real é a mesma que
 * o BRIEF §3.2 identificou pro brand: LUMINOSIDADE, porque o teto de croma do
 * sRGB depende do hue E do L.
 *
 * Onde cada hue pica (varredura de L com hue fixo, precisão 0.0005):
 *   verde 142 → L 0.865, C 0.293   (pica CLARO — daí o neón)
 *   amarelo 81 → L 0.825, C 0.170  (pica claro; já nascia "neón")
 *   vermelho 25 → L 0.630, C 0.255 (pica no meio)
 *   roxo 300 → L 0.550, C 0.293    (pica ESCURO — a primária azul do sRGB é escura)
 *
 * Consequência que não é escolha, é física: NÃO existe roxo simultaneamente
 * claro e saturado em sRGB. Verde/amarelo ficam neón com texto escuro; vermelho
 * e roxo ficam saturados-escuros com texto branco.
 *
 * Forma das rampas: a curva de croma da default foi preservada e escalada pelo
 * ratio necessário no 500, com CLAMP no teto de cada shade — por isso vários
 * shades ficam exatamente no teto do próprio (L, hue). Nenhum valor fora do gamut.
 *
 * ⚠️ Só o `[500]` é consumido pela camada semântica (medido: os 4 arquivos
 * semantic de todas as 5 marcas referenciam apenas `<status>[500]`). Os outros
 * 11 shades existem por paridade de contrato.
 */

// ─── Danger — hue 25, base L 0.58 / C 0.235 ───────────────────────────────────
// Escolhido L 0.58 em vez do pico 0.630 (C 0.255) pra PRESERVAR texto branco:
// no pico o branco cai a 3.96:1. Em 0.58 dá 4.82:1 — AA de verdade, e melhor que
// os 3.76:1 que a default entrega hoje com #ef4444 (violação pré-existente dela).
export const danger = {
  50:  "oklch(0.97 0.015 25)",    // #fff2f0
  100: "oklch(0.94 0.030 25)",    // #ffe4e1
  150: "oklch(0.91 0.046 25)",    // #ffd6d2
  200: "oklch(0.86 0.075 25)",    // #ffbeb8
  300: "oklch(0.76 0.143 25)",    // #ff8a82
  400: "oklch(0.68 0.208 25)",    // #ff5352
  500: "oklch(0.58 0.235 25)",    // #e40126 — BASE (+13% de croma vs default)
  600: "oklch(0.52 0.210 25)",    // #c6011f
  700: "oklch(0.44 0.178 25)",    // #9e0017
  800: "oklch(0.35 0.142 25)",    // #73000e
  900: "oklch(0.26 0.100 25)",    // #490308
  950: "oklch(0.18 0.070 25)",    // #290102
} as const;

// ─── Success — É A PRÓPRIA MARCA (decisão do gate) ────────────────────────────
// "O success pode deixar igual a brand." Alias do ramp do brand, então o verde de
// sucesso é o mesmo neón — mesmo precedente da marca `pay`, cujo success é o
// próprio #00a859 dela. Consequência obrigatória: `fg.on-success` deixa de ser
// branco (1.37:1) e passa a success[950], igual ao on-brand.
export const success = brand;

// ─── Warning — hue 81, base no PICO (L 0.825 / C 0.170) ───────────────────────
// O amarelo é o outro hue que pica claro, então já pertencia à família neón: 12:1
// contra preto. A default estava a 96% do teto, daí o ganho pequeno (+6%) — não há
// mais amarelo disponível em sRGB nesse L.
export const warning = {
  50:  "oklch(0.97 0.028 81)",    // #fff4e1
  100: "oklch(0.95 0.047 81)",    // #ffeccc
  150: "oklch(0.93 0.066 81)",    // #ffe4b6
  200: "oklch(0.91 0.086 81)",    // #ffdca0
  300: "oklch(0.87 0.127 81)",    // #ffcb6c
  400: "oklch(0.845 0.153 81)",   // #ffc042
  500: "oklch(0.825 0.170 81)",   // #fdb803 — BASE (pico do hue)
  600: "oklch(0.72 0.148 81)",    // #d39902
  700: "oklch(0.60 0.124 81)",    // #a57702
  800: "oklch(0.46 0.095 81)",    // #735101
  900: "oklch(0.34 0.070 81)",    // #4a3301
  950: "oklch(0.24 0.049 81)",    // #2b1c00
} as const;

// ─── Info — hue 300 (era 280), base no PICO (L 0.55 / C 0.293) ────────────────
// O maior ganho da leva. Em hue 280 o roxo já estava a 100% do teto (C 0.210):
// impossível deixar mais vibrante SEM mover o hue. Deslocando 280 → 300 o teto
// sobe pra C 0.293 — praticamente o 0.294 do brand, ou seja a MESMA energia — e
// de quebra passa a ler roxo de verdade (#9202fd) em vez do azul-periwinkle
// #736eff. +39% de croma. Texto branco: 5.75:1.
export const info = {
  50:  "oklch(0.97 0.016 300)",   // #f7f3ff
  100: "oklch(0.93 0.039 300)",   // #ebe3ff
  150: "oklch(0.89 0.063 300)",   // #e1d2ff
  200: "oklch(0.84 0.093 300)",   // #d4bdff
  300: "oklch(0.72 0.172 300)",   // #b688ff
  400: "oklch(0.635 0.232 300)",  // #a35bff
  500: "oklch(0.55 0.293 300)",   // #9202fd — BASE (pico do hue)
  600: "oklch(0.48 0.256 300)",   // #7901d4
  700: "oklch(0.40 0.213 300)",   // #5d00a6
  800: "oklch(0.32 0.170 300)",   // #43007a
  900: "oklch(0.24 0.128 300)",   // #2b0051
  950: "oklch(0.17 0.091 300)",   // #170030
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
