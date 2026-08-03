/**
 * color-dark.ts — Semantic color tokens (dark) — BRAND "vibrant" (iGreen Vibrant)
 * Tier 2 de 3: intenção. API pública.
 *
 * Mesmo contrato de nomes que color-light.ts.
 *
 * Escopo: brand + STATUS re-medidos + neutra própria "graphite".
 *
 * ⚠️ A neutra NÃO é mais a Zinc do handoff — é desenhada pra esta marca (hue 250,
 * croma redistribuído por área de tela). Os shades vêm todos da rampa; os hex
 * ficam SÓ em `primitives/color-palette.ts`, que é a fonte única. Não duplicar hex
 * aqui: eles dessincronizam calado quando a rampa muda (já aconteceu).
 *
 * `brandContrast` aqui é ALIAS do próprio `brand` (ver primitives): o neon já
 * está em L 0.867, no teto do gamut sRGB, então não existe variante mais clara
 * pra usar no dark — ao contrário da default, cujo brand (L 0.52) precisa do
 * ramp alternativo. O import mantém a estrutura idêntica à da default.
 *
 * ⚠️ Desvios da mecânica da default:
 *   1. `bg.brand-hover` = brandContrast[500] em vez de color-mix(brand, black) —
 *      estado desce a luminosidade pelo ramp, nunca sobe croma (§3.2 do handoff:
 *      o 400 está no teto do gamut, saturar mais clipa pra #00ff00).
 *   2. `border.brand` = brandContrast[500] (um shade acima do fundo 400) — regra de
 *      pareamento §3.3, igual ao light.
 *   3. `fg.danger`/`fg.info` NÃO usam o [500] — ver o bloco `fg` (como texto sobre
 *      surface escura o [500] reprovava AA; foi medido no badge real).
 *   4. `fg.on-brand`/`on-success` = `black`, não brand[950] como o §3.1 pede — ver
 *      o bloco `on-*` (irradiação sobre o neon; black é o que a iGreen default usa).
 */

import {
  brandContrast, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // A ATRIBUIÇÃO de shade por papel (950 canvas / 900 surface / 800 elevated) veio
  // do site de referência, medida via DevTools (`getComputedStyle` em todos os
  // elementos, por frequência): html rgb(14,14,17) e card rgb(24,24,27) ×60. Essa
  // escada de L continua valendo — o que mudou depois foi a rampa por baixo, que
  // saiu da Zinc pra neutra própria. Hierarquia L-008: 0.1652 < 0.2103 < muted.
  // Nenhum valor custom aqui: todos vêm da rampa.
  canvas:           gray[950],
  surface:          gray[900],   // cards, drawer
  "surface-elevated": gray[800], // popovers, modais
  "surface-panels": gray[950],   // = canvas
  sidebar:          gray[900],

  // Backgrounds neutros (alpha overlay — adapta ao surface debaixo)
  subtle:   "oklch(1 0 0 / 0.01)",
  // ⚠️ `muted` subiu de 3% pra 5% de branco a pedido do mantenedor: é o TRACK das
  // abas de visão do DataTable (`bg-bg-muted` no container em table-toolbar.styles),
  // e em 3% ficava "quase da cor do fundo" — não se lia como trilha. Mudança só no
  // DARK; no light `bg.muted` = gray[100] e as abas foram aprovadas como estão.
  muted:    "oklch(1 0 0 / 0.05)",
  emphasis: `color-mix(in oklch, ${white} 12%, transparent)`,  // mesmo visual do bg-accent (sem semântica de "active")
  input:    "oklch(1 0 0 / 0.04)",
  accent:   "oklch(1 0 0 / 0.12)",

  // Brand — o neon é a identidade nos DOIS modos (não há variante mais clara)
  brand:            brandContrast[400],
  "brand-subtle":   `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
  "brand-hover":    brandContrast[500],
  "brand-subtle-hover": `color-mix(in oklch, ${brandContrast[400]} 16%, transparent)`,

  // Status (sólido + tint alpha — ×4 cores). Os VALORES não são da default: as
  // rampas foram re-medidas por teto de gamut (ver primitives). O tint caiu de 14%
  // pra 10% (e o hover de 22% pra 16%) a pedido do mantenedor — "o background podia
  // ser mais leve, as subtle mais transparentes". Só no dark.
  danger:                danger[500],
  "danger-muted":        `color-mix(in oklch, ${danger[500]} 10%, transparent)`,
  "danger-hover":        `color-mix(in oklch, ${danger[500]} 90%, white)`,
  "danger-muted-hover":  `color-mix(in oklch, ${danger[500]} 16%, transparent)`,

  // success É a marca (alias no primitives) → espelha a família brand
  success:                success[400],
  "success-muted":        `color-mix(in oklch, ${success[400]} 10%, transparent)`,
  "success-hover":        success[500],
  "success-muted-hover":  `color-mix(in oklch, ${success[400]} 16%, transparent)`,

  warning:                warning[500],
  "warning-muted":        `color-mix(in oklch, ${warning[500]} 10%, transparent)`,
  "warning-hover":        `color-mix(in oklch, ${warning[500]} 90%, white)`,
  "warning-muted-hover":  `color-mix(in oklch, ${warning[500]} 16%, transparent)`,

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 10%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, white)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 16%, transparent)`,

  // Hover dos neutros — alphas sobem 1 tier
  "muted-hover":  "oklch(1 0 0 / 0.08)",
  "input-hover":  "oklch(1 0 0 / 0.08)",
  "accent-hover": "oklch(1 0 0 / 0.16)",

  // Sidebar item states — alphas
  "sidebar-accent":       "oklch(1 0 0 / 0.08)",
  "sidebar-accent-hover": "oklch(1 0 0 / 0.12)",

  // Tabela — sólidos pra suportar sticky columns sem vazamento (todos da rampa)
  "table":            gray[900],   // mesmo bg-surface
  "table-head":       gray[800],   // head sticky
  "table-row-hover":  gray[800],
  // Linha selecionada — alpha 10%; hover sobe pra 14%
  // ⚠️ NÃO baixar o hover pra 10% junto com os tints de status: aqui o 14% é o que
  // diferencia hover de repouso. Um replace em massa de "14% → 10%" já igualou os
  // dois uma vez, matando o feedback de hover da linha selecionada (e deixando a
  // versão -solid em 14%, incoerente com a transparente).
  "table-row-selected":       `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  // Versões OPACAS dos selected — pra sticky/pinned cells não vazarem o conteúdo
  // de trás. Mix em SRGB (não oklch): misturar em oklch com o bg achromático
  // (hue 0) contamina o hue → tinge de vermelho.
  "table-row-selected-solid":       `color-mix(in srgb, ${brandContrast[400]} 10%, ${gray[900]})`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brandContrast[400]} 14%, ${gray[900]})`,

  // Dropdown/Popover — frosted-glass: bg-canvas com 70% opacidade
  "dropdown":         "color-mix(in oklab, var(--color-bg-canvas) 70%, transparent)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  // ⚠️ `muted`/`subtle` NÃO seguem o `semanticExample.dark` do handoff (que pede 300
  // e 400). Medido no par título/subtítulo da coluna Licenciado do DataTable:
  //   com o 300 do handoff → separação default↔muted = 1.34:1
  //   iGreen default                                 = 2.49:1
  // 1.34:1 é praticamente nenhuma diferença de peso — o subtítulo lê igual ao título.
  // O handoff é showcase de cards (sem par título/subtítulo); a nossa UI é tabela
  // densa, onde a hierarquia de peso É a informação. Descendo um shade em cada,
  // a separação volta ao patamar da default e `muted` ainda dá 6.92:1 na surface.
  // `default`/`strong` seguem o mapeamento medido (#ffffff ×1747, zinc-100 ×319).
  strong:  white,      // 100% — títulos
  default: gray[100],  // texto padrão
  muted:   gray[400],  // labels, helpers, subtítulo de célula
  subtle:  gray[500],  // placeholders
  disabled: gray[600],

  // Brand — o neon puro; sobre surface escuro o contraste é altíssimo
  brand: brandContrast[400],

  // Status como TEXTO — ⚠️ NÃO usam o [500] como a default do DS usa, e a razão é
  // consequência direta da 2ª leva: pra maximizar croma eu DESCI o L do danger
  // (0.6368 → 0.58) e do info (0.62 → 0.55). Isso funciona pro fundo sólido, mas
  // como TEXTO sobre surface escura os dois ficaram escuros demais. Medido no
  // badge real da tabela (texto sobre o próprio tint):
  //   danger[500] #e50026 → 3.68:1 na surface / 3.42:1 no tint  ✗ AA
  //   info[500]   #9202fd → 3.08:1 na surface / 2.88:1 no tint  ✗ AA
  //   danger[400] #ff5352 → 5.58:1 na surface / 5.35:1 no tint  ✓
  //   info[400]   #a35bff → 4.64:1 na surface / 4.44:1 no tint  ✗ por 0.06
  //   info[300]   #b688ff → 6.71:1 na surface / 6.35:1 no tint  ✓
  // O roxo precisou de 2 shades porque é o hue que pica mais ESCURO no sRGB — o
  // mesmo motivo pelo qual ele é o único status com texto branco no fundo sólido.
  // É o mesmo mecanismo que a default resolve pro brand com `brandContrast`: no
  // dark, cor de texto precisa de shade mais claro. warning[500] (L 0.825) e
  // success[400] (o neón) já eram claros e ficam como estão.
  danger:  danger[400],        // #ff5352
  success: success[400],       // = brand[400] — o neón, igual ao fg.brand
  warning: warning[500],       // #fdb803 — já é claro (L 0.825)
  info:    info[300],          // #b688ff

  // Sobre fundos sólidos (on-*)
  //
  // ⚠️ `on-brand`/`on-success` = `black`, NÃO brand[950] como o handoff §3.1 pede.
  // Motivo medido + perceptual: sobre o neon (L 0.867, croma no teto do gamut) o
  // texto escuro sofre IRRADIAÇÃO — o fundo brilhante "invade" as hastes da fonte e
  // o texto aparenta menos peso do que tem. O mantenedor leu isso como "o texto
  // ficou fraco" no botão primário e perguntou se dava pra engrossar a fonte só
  // nesta marca; não dá (marca é eixo de COR, ver o transform), então o peso
  // aparente se compra na cor:
  //     brand[950] #003403  10.27:1
  //     black               15.32:1   ← escolhido
  // O §3.1 do handoff exige "não pode ser branco" (brand[400] daria 1.37:1) — black
  // satisfaz isso com folga; o que ele perde é só o "texto de marca é sempre
  // brand-950", que era preferência estética dele, não requisito de contraste. E
  // black é justamente o que a iGreen default usa em `fg.on-brand` no dark, então
  // isto ALINHA com a casa em vez de divergir.
  // No LIGHT o par é outro (bg.brand = brand[800] escuro) e o texto segue branco.
  "on-brand":   black,
  "on-danger":  white,
  "on-success": black,   // success É a marca — mesmo par
  "on-warning": black,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

// Base = mapeamento medido da referência (borderDefault zinc-700 #3f3f46 ×30,
// borderSubtle zinc-800 #27272a ×14), depois SUAVIZADO ~7% no L a pedido do
// mantenedor ("no geral estão muito fortes"). Força medida como distância de L até a
// surface (0.2103): default 0.1600 → 0.1347, subtle 0.0636 → 0.0487. L-009 (borda ≥
// surface + 0.06) segue satisfeita com folga no `default`.
// Por que divergir da referência aqui: ela é um showcase de cards espaçados; a nossa
// UI é muito mais densa em divisória (linhas de tabela, painéis, sidebar), então a
// MESMA borda soma muito mais peso na tela.
// ⚠️ `input` NÃO foi suavizado: é fronteira de campo, não separador.
export const border = {
  // 3ª rodada. Histórico de força (distância de L até a surface 0.2103), porque duas
  // reduções de ~7% no L não resolveram e a 3ª foi deliberadamente maior:
  //   gray[700] #3f3f46 → 0.1600   (mapeamento cru da referência)
  //   #38383f           → 0.1347   (-16%)
  //   #323238           → 0.1097   (-19%)
  //   #2b2b31           → 0.0797   (-27%)  ← atual, "estava agressiva demais"
  // Piso da L-009 (borda dark ≥ surface + 0.06) = L 0.2703 / #26262c. Ainda sobra
  // margem se precisar de mais uma volta; abaixo disso a borda some no escuro.
  // Referência de baixo: `subtle` está em 0.0487, então a hierarquia se mantém.
  default: "oklch(0.290 0.0024 250)",  // #2b2b31
  subtle:  gray[850],  // #232326 (era gray[800] #27272a)
  // Suavizada também (força 0.1600 → 0.1150, -28%). Segue mais forte que a
  // `default` (0.0797) porque é fronteira de campo e precisa ser achável — a
  // default do DS usa branco 8% aqui, que compõe ainda mais fraco que isto.
  input:   "oklch(0.325 0.0030 250)",  // #333339 (era gray[700] #3f3f46)
  sidebar: gray[850],

  // Um shade acima do fundo brand[400] — regra de pareamento §3.3, igual ao light
  brand:           brandContrast[500],
  "brand-subtle":  `color-mix(in oklch, ${brandContrast[400]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[400]} 36%, transparent)`,  // ancora no 400 (= brand)
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  // Tabela — mais sutil que a borda de card (suavizada junto, mesma queixa)
  table: gray[850],   // #232326
} as const;

// ─── Ring (focus rings — cor pura usada com ring-* do Tailwind) ───────────────
// Ancora no 400 (não no 500 do light): mesma mecânica da default, que no dark
// troca pro ramp mais claro mantendo o alpha em 22% — o brilho compensa.

export const ring = {
  brand:     `color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,
  danger:    `color-mix(in oklch, ${danger[500]} 22%, transparent)`,
  success:   `color-mix(in oklch, ${success[400]} 22%, transparent)`,  // espelha o brand
  warning:   `color-mix(in oklch, ${warning[500]} 22%, transparent)`,
  info:      `color-mix(in oklch, ${info[500]} 22%, transparent)`,
  secondary: `color-mix(in oklch, ${gray[500]} 22%, transparent)`,
} as const;

// ─── Overlay / Scrim — verbatim da default (neutro, diff zero) ────────────────

export const overlay = {
  scrim: "oklch(0 0 0 / 0.55)",
  float: "oklch(1 0 0 / 0.08)",
} as const;

// ─── Chart (paleta categórica — marca + harmônicas) ───────────────────────────
// Só chart-1 troca; 2–5 verbatim da default pra manter as séries distinguíveis.
// No dark ancora no 400: o neon puro brilha sobre surface escuro sem perder traço.
export const chart = {
  "1": brandContrast[400],     // #0fff00 — marca
  "2": "oklch(0.72 0.13 195)", // teal
  "3": "oklch(0.68 0.15 250)", // azul
  "4": "oklch(0.80 0.15 80)",  // âmbar
  "5": "oklch(0.70 0.17 300)", // violeta
  grid: "oklch(1 0 0 / 0.12)", // linhas-guia — branco 12% (visível na surface escura)
} as const;

export const colorDark = { bg, fg, border, ring, overlay, chart };
