/**
 * color-light.ts — Semantic color tokens (light) — BRAND "vibrant" (iGreen Vibrant)
 * Tier 2 de 3: intenção. API pública.
 *
 * Cópia self-contained da default: MESMO contrato de nomes.
 *
 * Escopo: brand + STATUS re-medidos + neutra própria "graphite".
 * Os valores acromáticos/minerais cravados seguem o hue frio da neutra própria
 * (250) — sem isso a sidebar quente da default ficava ao lado de neutros frios.
 *
 * ⚠️ Hex ficam SÓ em `primitives/color-palette.ts` (fonte única). Não duplicar aqui:
 * dessincronizam calado quando a rampa muda (já aconteceu).
 * Ver `primitives/color-palette.ts` pra medição de gamut de cada status.
 *
 * ⚠️ 3 desvios da mecânica da default, todos exigidos pelo handoff (`theme/BRIEF.md`):
 *
 *   1. `fg.on-brand` = brand[950], NÃO white. brand[400] (#0fff00) tem 1.37:1
 *      contra branco — reprova qualquer critério. brand[950] dá 10.27:1 (§3.1).
 *   2. `bg.brand-hover` = brand[500] em vez de color-mix(brand, black). O 400 está
 *      no TETO do gamut sRGB (croma 0.32+ clipa pra #00ff00), então estado não pode
 *      ser derivado subindo croma/saturação — só descendo luminosidade (§3.2).
 *   3. `fg.brand` = brand[800] (6.56:1), não brand[600]. O 700 dá 4.47:1 e reprova
 *      AA por 0.03; o 600 é ainda mais claro (§3.4).
 *
 * Pareamento de superfície de marca (§3.3): fundo brand[400] · borda brand[500] ·
 * texto brand[950].
 */

import {
  brand, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces (sólidos)
  // Mapeamento de `semanticExample.light` do tokens.json (canvas/surface = white,
  // elevated = neutral-50, muted = neutral-100)
  canvas:           white,        // body, página
  surface:          white,        // cards, drawer
  "surface-elevated": gray[50],   // popovers, modais
  "surface-panels": white,        // página de fundo
  // ⚠️ Sidebar RETUNADA pro hue frio da neutra própria. A default usa mineral-100
  // (hue 106, quente) — mesmo L, croma equivalente, só a temperatura muda. Manter o
  // mineral quente ao lado de neutros Zinc frios criava dois cinzas de
  // temperatura diferente lado a lado.
  sidebar:          "oklch(0.9516 0.0012 250)", // (era mineral #efefed na default)

  // Backgrounds neutros (sólidos cinza no light)
  subtle:   gray[50],
  muted:    gray[100],           // era gray[50], igual ao subtle (sem hierarquia)
  emphasis: gray[200],           // neutro mais visível que muted
  input:    white,
  accent:   white,               // light: bg-accent = branco (item ativo destaca por contraste)

  // Brand no LIGHT = brand[800], o MESMO shade do `fg.brand` (ajuste do mantenedor).
  // Antes era brand[400] (#0fff00): o preenchimento do botão ficava muito mais claro
  // que o texto de marca ao lado dele (#076d07) e destoava. Agora bg/fg/border de
  // marca são o mesmo verde no light, e `fg.on-brand` volta a ser BRANCO (6.56:1).
  // ⚠️ Só no light — o dark segue com o neon brand[400], que é a identidade.
  // O neon continua vivo no light via `brand-subtle` (tint de 14% do 400) e no chart.
  brand:            brand[800],
  "brand-subtle":   `color-mix(in oklch, ${brand[400]} 14%, transparent)`,
  "brand-hover":    brand[900],
  "brand-subtle-hover": `color-mix(in oklch, ${brand[400]} 22%, transparent)`,

  // Status (sólido + muted alpha — ×4 cores) — verbatim da default
  danger:                danger[500],
  "danger-muted":        `color-mix(in oklch, ${danger[500]} 14%, transparent)`,
  "danger-hover":        `color-mix(in oklch, ${danger[500]} 90%, black)`,
  "danger-muted-hover":  `color-mix(in oklch, ${danger[500]} 22%, transparent)`,

  // success É a marca (alias no primitives) → espelha a família brand shade por
  // shade, inclusive o 800 no light e o hover descendo no ramp
  success:                success[800],
  "success-muted":        `color-mix(in oklch, ${success[400]} 14%, transparent)`,
  "success-hover":        success[900],
  "success-muted-hover":  `color-mix(in oklch, ${success[400]} 22%, transparent)`,

  warning:                warning[500],
  "warning-muted":        `color-mix(in oklch, ${warning[500]} 14%, transparent)`,
  "warning-hover":        `color-mix(in oklch, ${warning[500]} 90%, black)`,
  "warning-muted-hover":  `color-mix(in oklch, ${warning[500]} 22%, transparent)`,

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 14%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, black)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 22%, transparent)`,

  // Hover dos neutros — retunados pro hue frio 250 (a default usa croma 0)
  "muted-hover":  "oklch(0.95 0.0012 250)",   // #eeeef0
  "input-hover":  gray[50],                   // neutra-50 — sutil sobre input=white
  "accent-hover": "oklch(0.84 0.0032 250)",   // #cacace

  // Sidebar item states — active = branco (contrasta com a sidebar), hover = zinc subtle
  "sidebar-accent":       white,
  "sidebar-accent-hover": "oklch(0.92 0.0020 250)",  // #e4e4e7

  // Tabela — sólidos
  "table":            white,
  "table-head":       gray[100],
  "table-row-hover":  gray[50],    // mais sutil que o head
  // Linha selecionada — alpha brand discreto (6%); hover sobe pra 10%
  "table-row-selected":       `color-mix(in oklch, ${brand[400]} 6%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brand[400]} 10%, transparent)`,
  // Versões OPACAS dos selected — pra sticky/pinned cells não vazarem o conteúdo
  // de trás. Mix em SRGB (não oklch): misturar em oklch com um bg achromático
  // (hue 0) contamina o hue → tinge de vermelho.
  "table-row-selected-solid":       `color-mix(in srgb, ${brand[400]} 6%, ${white})`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brand[400]} 10%, ${white})`,

  // Dropdown/Popover — referencia bg-canvas (white no light)
  "dropdown":         "var(--color-bg-canvas)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  // ⚠️ REVERTIDO pro shade que o DS usa, NÃO o do `semanticExample.light` do handoff
  // (que pede fgMuted: neutral-700, fgSubtle: neutral-600). Medido no par
  // título/subtítulo da coluna Licenciado do DataTable (`text-fg-default` 13/500 +
  // `text-fg-muted` 12/400):
  //   com o 700 do handoff → separação default↔muted = 1.85:1
  //   iGreen default (gray[500])                     = 3.28:1
  // Ou seja o mapeamento do handoff comprime a hierarquia em ~44%: o subtítulo fica
  // quase do mesmo peso do título e o par deixa de ter leitura. Faz sentido — o
  // handoff é showcase de CARDS, que não tem par título/subtítulo; a nossa UI é
  // tabela densa, onde essa separação é a informação. gray[500] ainda dá 4.83:1 no
  // branco (4.83:1), então passa AA folgado como label/helper.
  strong:  gray[950],
  default: gray[950],
  muted:   gray[500],          // labels, helpers, subtítulo de célula
  subtle:  gray[400],          // placeholders, hints
  disabled: gray[400],         // (a default do DS também iguala subtle/disabled)

  // Brand — 800 é o 1º shade com AA folgado contra branco (6.56:1); ver §3.4
  brand: brand[800],

  // Status
  danger:  danger[500],
  success: success[800],       // = brand[800] — mesmo shade do fg.brand (6.56:1)
  warning: warning[500],
  info:    info[500],

  // Sobre fundos sólidos (on-*) — cada um MEDIDO contra o próprio fundo:
  //   on-brand   white sobre #076d07       6.56:1   (bg.brand no light é o 800)
  //   on-success idem — success É a marca
  //   on-danger  white sobre #e40126       4.82:1   (a default entrega 3.76:1)
  //   on-warning black sobre #fdb803      12.03:1
  //   on-info    white sobre #9202fd       5.75:1   (roxo pica escuro em sRGB)
  // ⚠️ No DARK o bg.brand é o neon brand[400] e aí o texto TEM de ser brand[950]
  // (white daria 1.37:1) — ver color-dark.ts. É o único par que difere entre modos.
  "on-brand":   white,
  "on-danger":  white,
  "on-success": white,
  "on-warning": black,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

// Separadores e dividers SUAVIZADOS ~7% a pedido do mantenedor ("no geral estão
// muito fortes"). Medido em força (distância de L até a surface): default 0.1289 →
// 0.1080, subtle 0.0803 → 0.0675. São shades entre a rampa (o 150 já era assim), não
// da Zinc crua — o mapeamento da referência é pra showcase de cards, e a nossa UI é
// muito mais densa em divisórias (tabela, painel, sidebar), então a mesma borda pesa mais.
// ⚠️ `input` NÃO foi suavizado de propósito: é fronteira de campo de formulário, não
// separador — precisa ser achável (e já está em 2.3:1, abaixo do 3:1 de SC 1.4.11).
// 2ª rodada de ajuste (mantenedor, olhando o app finance): `default` estava forte
// ainda e `sidebar` fraco demais. Enfraquecendo um e reforçando o outro, os dois
// convergiram no MESMO valor — o que faz sentido: ambos são separador estrutural.
//   default  força 0.1080 → 0.0940   (-13%)
//   sidebar  força 0.0790 → 0.0940   (+19%)
// ⚠️ O pedido incluía "deixar a default na mesma intensidade da borda dos inputs",
// mas a medição contradiz: `input` está em 2.56:1 contra o branco e a `default` em
// 1.38:1 — o input já é ~85% MAIS forte, então igualar deixaria a default bem mais
// forte, o oposto do pedido. Provável efeito de comprimento de linha (1px num campo
// pequeno pesa menos que 1px atravessando a tabela). Mantido só o enfraquecimento.
export const border = {
  default: gray[250],  // #dfdfe3
  subtle:  gray[150], // #e8e8eb — dividers finos
  input:   gray[400],                    // fronteira de campo, intocada
  sidebar: gray[250],  // #dfdfe3 — mesmo peso da default

  // Mesmo shade do `bg.brand` e do `fg.brand` no light — um único verde de marca.
  // O papel dominante de `border-border-brand` aqui é ser a ÚNICA fronteira sobre
  // fundo claro (sublinhado da aba ativa em tabs, borda de foco de input/select/
  // combobox/datepicker, contorno de badge e chip outline — 20 usos medidos), e o
  // 800 dá 6.56:1 contra o branco. Contra o branco: 400 = 1.37:1, 500 = 1.70:1,
  // 600 = 2.67:1, 700 = 4.47:1 — os três primeiros abaixo do 3:1 de SC 1.4.11.
  brand:           brand[800],
  "brand-subtle":  `color-mix(in oklch, ${brand[400]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[400]} 36%, transparent)`,  // ancora no 400 (= brand)
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  // Tabela — mais sutil que a borda de card (suavizada junto, mesma queixa)
  table: gray[150],   // #e8e8eb
} as const;

// ─── Ring (focus rings — cor pura usada com ring-* do Tailwind) ───────────────
// Alpha embutido no token (L-001): o consumidor usa `ring-ring-brand` sem `/30`.
// Ancora no 500, não no 400: o neon puro num anel de 4px vibra demais.

export const ring = {
  brand:     `color-mix(in oklch, ${brand[500]} 22%, transparent)`,
  danger:    `color-mix(in oklch, ${danger[500]} 22%, transparent)`,
  success:   `color-mix(in oklch, ${success[500]} 22%, transparent)`,
  warning:   `color-mix(in oklch, ${warning[500]} 22%, transparent)`,
  info:      `color-mix(in oklch, ${info[500]} 22%, transparent)`,
  secondary: `color-mix(in oklch, ${gray[500]} 22%, transparent)`,
} as const;

// ─── Overlay / Scrim — verbatim da default (neutro, diff zero) ────────────────

export const overlay = {
  scrim: "oklch(0 0 0 / 0.55)",
  // Retunado: zinc-500 com alpha, em vez do cinza croma-zero da default
  float: "oklch(0.5517 0.0062 250 / 0.12)",
} as const;

// ─── Chart (paleta categórica — marca + harmônicas) ───────────────────────────
// Só chart-1 troca; 2–5 seguem verbatim da default (teal → azul → âmbar → violeta)
// pra manter 5 séries DISTINGUÍVEIS em linha/barra. Ancora no 600, não no 400: o
// neon em traço fino sobre branco fica ilegível (rampa mono segue viável em pizza).
export const chart = {
  "1": brand[600],             // #04b800 — marca, escurecida pro contraste no light
  "2": "oklch(0.66 0.12 195)", // teal
  "3": "oklch(0.55 0.15 250)", // azul
  "4": "oklch(0.76 0.15 80)",  // âmbar
  "5": "oklch(0.56 0.18 300)", // violeta
  grid: gray[200],             // linhas-guia dos gráficos (CartesianGrid/PolarGrid)
} as const;

export const colorLight = { bg, fg, border, ring, overlay, chart };
