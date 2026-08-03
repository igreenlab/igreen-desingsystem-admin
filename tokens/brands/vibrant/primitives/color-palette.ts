/**
 * color-palette.ts — Primitive color tokens — BRAND "vibrant" (iGreen Vibrant)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Marca = verde FLUORESCENTE #0fff00, âncora no shade 400 (não no 600 como a
 * default). Escala gerada em uicolors.app/generate/0fff00.
 *
 * ⚠️ PROCEDÊNCIA: os 11 valores de brand vieram de um handoff externo (BRIEF.md +
 * tokens.json) que era material de referência e **não está versionado** — foi
 * descartado depois da implementação. Por isso este arquivo não cita seção dele:
 * citação que ninguém pode conferir faz o leitor parar de investigar num lugar
 * inalcançável. Toda medição que justifica um valor está inline, aqui e nos
 * arquivos semantic; o que dá pra reconferir de fato é o gerador (a URL acima) e
 * o round-trip OKLCH→sRGB dos hex nos comentários.
 *
 * ⚠️ OKLCH é a fonte canônica; o hex do comentário é o equivalente sRGB derivado,
 * só pra conferência. NÃO re-arredondar: a precisão de cada valor é a mínima que
 * faz round-trip exato — com 3 casas na croma os shades 400–800 erram até 3/255
 * por canal.
 *
 * ── Escopo da marca ──────────────────────────────────────────────────────────
 * Começou como "só a família brand" (gray e status verbatim da default, diff zero
 * no overlay). NÃO é mais o caso: em rodadas seguintes o mantenedor pediu neutra
 * própria e status re-medidos. Hoje divergem da default: `brand`/`brandContrast`,
 * `gray` (neutra "graphite"), e os 4 status — `success` virou alias do próprio
 * brand; `danger`/`warning`/`info` foram re-medidos por teto de gamut. O overlay
 * resultante tem ~65 vars no light e ~62 no dark.
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

/* ── Gray — neutra "graphite", desenhada pra esta marca ───────────────────────
 *
 * Histórico, porque a rampa mudou 3 vezes e o "por quê" de cada etapa importa:
 *   1. Zinc crua do handoff (`color.neutral.*` do tokens.json dele), croma
 *      0.0013–0.0146 em hue ~286. O handoff recomendava não importar
 *      ("muda a temperatura da UI inteira, em todas as brands") — argumento que
 *      assume DS de marca única e não se aplica aqui, porque `gray` é POR MARCA:
 *      a neutra entra escopada no [data-theme="vibrant"] e as outras 4 seguem em
 *      croma zero.
 *   2. Zinc com 50% do croma — o mantenedor achou "os tons de azul bons, mas as
 *      cores no geral mais cansativas, não tão suavizadas como na brand atual".
 *   3. Esta: sai da Zinc de vez. Duas decisões, nesta ordem de importância:
 *
 * 1. CROMA REDISTRIBUÍDO POR ÁREA DE TELA. Antes o croma era ~uniforme na rampa,
 *    então `canvas` e `surface` — que cobrem ~80% da tela — carregavam a mesma
 *    saturação que uma borda de 1px. Fadiga visual é função de ÁREA: cor fraca num
 *    campo enorme cansa mais que cor média num traço fino. Então o croma vai a
 *    quase zero nas superfícies profundas e fica preservado nos meios-tons:
 *      950 canvas    0.0031 → 0.0010   (-68%)
 *      900 surface   0.0030 → 0.0012   (-60%)
 *      800 elevated  0.0028 → 0.0018   (-36%)
 *      700 bordas    0.0060 → 0.0038   (-37%)
 *      500/400 texto 0.0069 → 0.0062   (quase intacto — área pequena, o matiz aqui
 *                                       lê como refino, não como cast)
 *    Resultado: o fundo descansa como um preto neutro (igual à iGreen padrão) e a
 *    frieza só aparece onde há informação.
 *
 * 2. HUE 286 → 250. Sai do violeta-acinzentado da Zinc pro azul-aço. Mesma família
 *    fria, mas 286 a baixa croma lê como "cinza arroxeado" — é esse cast que o olho
 *    identifica como sujo; 250 lê como cinza frio limpo.
 *
 * A escada de L está INTOCADA de propósito: foi calibrada em todas as rodadas de
 * borda, hierarquia de texto e contraste. Mexer nela desfaria aquele trabalho.
 *
 * Mantida a decisão de NÃO puxar a neutra pro verde da brand (hue 142): azul é
 * complementar ao verde neon e é isso que faz a marca saltar; neutra esverdeada
 * achataria o contraste de matiz.
 *
 * ── Degraus: a rampa reflete o USO, não uma escada Tailwind ───────────────────
 *
 * Esta rampa NÃO tenta ser uma progressão regular de 50 a 950. Cada degrau existe
 * porque a camada semântica o consome, e o consumidor está anotado ao lado. O
 * critério pra um valor virar degrau é ter **2+ consumidores semânticos** — valor
 * com 1 consumidor é one-off e fica como literal no arquivo semantic (senão a rampa
 * infla com degraus que descrevem um token, não uma escala).
 *
 * One-offs que ficaram deliberadamente FORA: light `bg.sidebar` (L 0.9516),
 * `bg.muted-hover` (0.95), `bg.accent-hover` (0.84), `bg.sidebar-accent-hover`
 * (0.92); dark `border.default` (0.290) e `border.input` (0.325). Todos com 1
 * consumidor, todos vindos da calibração visual de borda feita com o mantenedor.
 *
 * ⚠️ HEADROOM: `300` não tem consumidor hoje. Mantido porque é posição legítima de
 * escala (era o 300 da Zinc) e as outras 4 marcas têm 12 degraus — o contrato dos
 * primitives é o mesmo pra todas. Não confundir com degrau morto: se algum dia
 * ganhar consumidor, ele já está no lugar certo.
 */
export const gray = {
  50:  "oklch(0.9851 0 0)",            // acromático  → light bg.subtle, input-hover, table-row-hover
  100: "oklch(0.9674 0.0007 250)",     //              → light bg.muted/table-head · dark fg.default
  150: "oklch(0.9325 0.0016 250)",     //              → light border.subtle + border.table  (2 usos)
  200: "oklch(0.9197 0.0020 250)",     //              → light bg.emphasis
  250: "oklch(0.906 0.0024 250)",      //              → light border.default + border.sidebar (2 usos)
  300: "oklch(0.8711 0.0028 250)",     //              → HEADROOM (sem consumidor — ver nota acima)
  400: "oklch(0.7118 0.0060 250)",     //              → light border.input/fg.subtle/fg.disabled · dark fg.muted
  500: "oklch(0.5517 0.0062 250)",     //              → light fg.muted (4.83:1 no branco) · dark fg.subtle · ring.secondary
  600: "oklch(0.4419 0.0055 250)",     //              → dark fg.disabled
  700: "oklch(0.3703 0.0038 250)",     //              → dark border.input base
  800: "oklch(0.2739 0.0018 250)",     //              → dark bg.surface-elevated, table-head, table-row-hover
  850: "oklch(0.259 0.0016 250)",      //              → dark border.subtle + sidebar + table  (3 usos)
  900: "oklch(0.2103 0.0012 250)",     //              → dark bg.surface/sidebar/table  (ÁREA GRANDE)
  950: "oklch(0.1652 0.0010 250)",     //              → dark bg.canvas/surface-panels  (ÁREA MAIOR)
} as const;

/* ── STATUS ────────────────────────────────────────────────────────────────────
 *
 * Os status desta marca foram re-medidos, não copiados da default. Motivo: a
 * default já vive perto do teto de gamut (danger 84% do teto do próprio hue,
 * success 92%, warning 96%, info 100%), então "deixar mais vibrante subindo a
 * saturação" rende de +4% a +20% — e ZERO no roxo. A alavanca real é a mesma que
 * o handoff identificou pro brand: LUMINOSIDADE, porque o teto de croma do
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

/* ── grayDark — neutra ACROMÁTICA do dark, ancorada em #242424 ─────────────────
 *
 * Rampa separada da `gray` de propósito, e é a única marca com essa divisão. Razão:
 * o LIGHT foi fechado e aprovado com a neutra fria (`gray`, hue 250); o mantenedor
 * pediu o dark "mais cinza mesmo, no estilo da iGreen default", com `#242424` como
 * âncora. Uma rampa só não atende os dois — daí `gray` (light, fria) + `grayDark`
 * (dark, croma 0). O `color-light.ts` importa `gray`, o `color-dark.ts` importa esta.
 *
 * Valores vêm do handoff (§1.1), croma EXATAMENTE 0 — por isso todo hex é par
 * repetido (R=G=B). Se algum valor sair com R≠G≠B, houve erro de transcrição; é o
 * autoteste que o próprio handoff sugere.
 *
 * ⚠️ MAPEAMENTO — o §4.1 do handoff avisa de uma regressão silenciosa aqui, e eu já
 * caí nela na 1ª leva desta marca: o `semanticExample.dark` mapeia `bgCanvas → 950`,
 * mas o `--background` do DS equivale ao **900**. Seguir o exemplo ao pé da letra
 * deixa a UI um degrau mais escura do que o resto do DS. "O mapeamento do DS manda":
 *   canvas → 900 (#171717) · surface → 800 (#242424, a âncora) · 950 fica DISPONÍVEL
 * O 950 (#0d0d0d) não tem consumidor de propósito — é reserva pra superfície mais
 * profunda, se algum dia existir. Não é degrau morto.
 *
 * ⚠️ 4 valores do dark NÃO estão nesta rampa e vivem como literal no `color-dark.ts`:
 * `surface-elevated`/`table-head`, `border.subtle`, `border.default` e `border.input`.
 * São as forças que o mantenedor calibrou visualmente em 3 rodadas (0.027 / 0.0487 /
 * 0.0797 / 0.1147 de distância até a surface) e caem entre degraus. É a opção (b) do
 * §4.1 — "manter como valores semânticos fora da escala, zero risco" — preferida
 * porque arredondar pro degrau desfaria a calibração aprovada.
 */
export const grayDark = {
  50:  "oklch(0.9850 0 0)",   // #fafafa
  100: "oklch(0.9670 0 0)",   // #f4f4f4  → fg.default
  200: "oklch(0.9200 0 0)",   // #e4e4e4
  300: "oklch(0.8710 0 0)",   // #d4d4d4
  400: "oklch(0.7120 0 0)",   // #a2a2a2  → fg.muted
  500: "oklch(0.5520 0 0)",   // #727272  → fg.subtle
  600: "oklch(0.4420 0 0)",   // #535353  → fg.disabled
  700: "oklch(0.3510 0 0)",   // #3b3b3b
  800: "oklch(0.2603 0 0)",   // #242424  → bg.surface · sidebar · table  ← ÂNCORA
  900: "oklch(0.2050 0 0)",   // #171717  → bg.canvas · surface-panels
  950: "oklch(0.1600 0 0)",   // #0d0d0d  → RESERVA (sem consumidor, ver nota acima)
} as const;

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
  brand, brandContrast, gray, grayDark,
  success, warning, danger, info,
  white, black,
  alpha,
};
