/**
 * color-dark.ts — Semantic color tokens (dark) — BRAND "vibrant" (iGreen Vibrant)
 * Tier 2 de 3: intenção. API pública.
 *
 * Mesmo contrato de nomes que color-light.ts.
 *
 * Escopo (2ª leva, decidida no gate): brand + STATUS re-medidos + neutra ZINC.
 * As surfaces do dark saíram do croma zero pro hue frio ~286 da Zinc; o canvas é
 * o near-black #18181b (zinc-900) e o handoff ancora em #0e0e11 (zinc-950).
 *
 * `brandContrast` aqui é ALIAS do próprio `brand` (ver primitives): o neon já
 * está em L 0.867, no teto do gamut sRGB, então não existe variante mais clara
 * pra usar no dark — ao contrário da default, cujo brand (L 0.52) precisa do
 * ramp alternativo. O import mantém a estrutura idêntica à da default.
 *
 * ⚠️ Desvios da default, exigidos pelo handoff (`theme/BRIEF.md`):
 *   1. `fg.on-brand` = brandContrast[950] em vez de `black` — o handoff fixa
 *      brand-950 como o texto de marca em QUALQUER superfície de marca (§3.1/§3.3),
 *      nos dois modos. 10.27:1 contra o brand[400].
 *   2. `bg.brand-hover` = brandContrast[500] em vez de color-mix(brand, black) —
 *      estado desce a luminosidade pelo ramp, nunca sobe croma (§3.2, teto de gamut).
 *   3. `border.brand` = brandContrast[500] (um shade acima do fundo 400) em vez do
 *      próprio 400 — regra de pareamento §3.3, igual ao light.
 */

import {
  brandContrast, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces sólidas — mapeamento MEDIDO do site de referência via DevTools
  // (uicolors.app/generate/0fff00), que bate com `semanticExample.dark` do
  // tokens.json: canvas = zinc-950, surface = zinc-900, elevated = zinc-800.
  //   html         rgb(14,14,17)  = #0e0e11 = zinc-950
  //   card (×60)   rgb(24,24,27)  = #18181b = zinc-900
  // Hierarquia L-008: canvas 0.1652 < surface 0.2103 < muted. Nenhum valor
  // custom aqui — todos vêm da rampa (era o erro anterior: surface #1b1b1e).
  canvas:           gray[950],   // #0e0e11
  surface:          gray[900],   // #18181b — cards, drawer
  "surface-elevated": gray[800], // #27272a — popovers, modais
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

  // Status (sólido + muted alpha — ×4 cores) — verbatim da default
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

  // Tabela — sólidos pra suportar sticky columns sem vazamento (rampa Zinc)
  "table":            gray[900],   // #18181b — mesmo bg-surface
  "table-head":       gray[800],   // #27272a — head sticky
  "table-row-hover":  gray[800],
  // Linha selecionada — alpha 10%; hover sobe pra 14%
  // (no dark precisa de alpha levemente maior pra ficar visível sobre surface escuro)
  "table-row-selected":       `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
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
  // a separação volta ao patamar da default e `muted` ainda dá 6.70:1 na surface.
  // `default`/`strong` seguem o mapeamento medido (#ffffff ×1747, zinc-100 ×319).
  strong:  white,      // 100% — títulos
  default: gray[100],  // #f4f4f5 — texto padrão
  muted:   gray[400],  // #a1a1aa — labels, helpers, subtítulo de célula
  subtle:  gray[500],  // #71717a — placeholders
  disabled: gray[600], // #52525b

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

  // Sobre fundos sólidos (on-*) — mesmos pares medidos do light: os fundos de
  // status são iguais nos 2 modos, então o texto em cima também.
  // ⚠️ on-brand/on-success = brand-950, não `black`: o handoff fixa brand-950 como
  // texto de marca em qualquer superfície de marca, nos dois modos (§3.1/§3.3).
  "on-brand":   brandContrast[950],
  "on-danger":  white,
  "on-success": success[950],
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
  default: "oklch(0.290 0.0050 285.81)",  // #2b2b31
  subtle:  "oklch(0.259 0.0028 286.03)",  // #232326 (era gray[800] #27272a)
  // Suavizada também (força 0.1600 → 0.1150, -28%). Segue mais forte que a
  // `default` (0.0797) porque é fronteira de campo e precisa ser achável — a
  // default do DS usa branco 8% aqui, que compõe ainda mais fraco que isto.
  input:   "oklch(0.325 0.0055 285.81)",  // #333339 (era gray[700] #3f3f46)
  sidebar: "oklch(0.259 0.0028 286.03)",

  // Um shade acima do fundo brand[400] — regra de pareamento §3.3, igual ao light
  brand:           brandContrast[500],
  "brand-subtle":  `color-mix(in oklch, ${brandContrast[400]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[400]} 36%, transparent)`,  // ancora no 400 (= brand)
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  // Tabela — mais sutil que a borda de card (suavizada junto, mesma queixa)
  table: "oklch(0.259 0.0028 286.03)",   // #232326
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
