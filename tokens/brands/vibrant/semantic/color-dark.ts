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
  // Surfaces sólidas — Zinc. canvas = zinc-900 (#18181b); as surfaces ficam entre
  // zinc-900 e zinc-800, retunadas pro hue frio (a default usa croma 0 aqui).
  // Hierarquia L-008 preservada: canvas 0.2103 < surface 0.225.
  canvas:           gray[900],                     // #18181b
  surface:          "oklch(0.225 0.0058 286)",     // #1b1b1e — cards, drawer
  "surface-elevated": "oklch(0.225 0.0058 286)",
  "surface-panels": gray[900],
  sidebar:          "oklch(0.225 0.0058 286)",

  // Backgrounds neutros (alpha overlay — adapta ao surface debaixo)
  subtle:   "oklch(1 0 0 / 0.01)",
  muted:    "oklch(1 0 0 / 0.03)",
  emphasis: `color-mix(in oklch, ${white} 12%, transparent)`,  // mesmo visual do bg-accent (sem semântica de "active")
  input:    "oklch(1 0 0 / 0.04)",
  accent:   "oklch(1 0 0 / 0.12)",

  // Brand — o neon é a identidade nos DOIS modos (não há variante mais clara)
  brand:            brandContrast[400],
  "brand-subtle":   `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  "brand-hover":    brandContrast[500],
  "brand-subtle-hover": `color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,

  // Status (sólido + muted alpha — ×4 cores) — verbatim da default
  danger:                danger[500],
  "danger-muted":        `color-mix(in oklch, ${danger[500]} 14%, transparent)`,
  "danger-hover":        `color-mix(in oklch, ${danger[500]} 90%, white)`,
  "danger-muted-hover":  `color-mix(in oklch, ${danger[500]} 22%, transparent)`,

  // success É a marca (alias no primitives) → espelha a família brand
  success:                success[400],
  "success-muted":        `color-mix(in oklch, ${success[400]} 14%, transparent)`,
  "success-hover":        success[500],
  "success-muted-hover":  `color-mix(in oklch, ${success[400]} 22%, transparent)`,

  warning:                warning[500],
  "warning-muted":        `color-mix(in oklch, ${warning[500]} 14%, transparent)`,
  "warning-hover":        `color-mix(in oklch, ${warning[500]} 90%, white)`,
  "warning-muted-hover":  `color-mix(in oklch, ${warning[500]} 22%, transparent)`,

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 14%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, white)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 22%, transparent)`,

  // Hover dos neutros — alphas sobem 1 tier
  "muted-hover":  "oklch(1 0 0 / 0.08)",
  "input-hover":  "oklch(1 0 0 / 0.08)",
  "accent-hover": "oklch(1 0 0 / 0.16)",

  // Sidebar item states — alphas
  "sidebar-accent":       "oklch(1 0 0 / 0.08)",
  "sidebar-accent-hover": "oklch(1 0 0 / 0.12)",

  // Tabela — sólidos pra suportar sticky columns sem vazamento (Zinc)
  "table":            "oklch(0.225 0.0058 286)",   // #1b1b1e — mesmo bg-surface
  "table-head":       "oklch(0.252 0.0058 286)",   // #222225 — head sticky
  "table-row-hover":  "oklch(0.252 0.0058 286)",
  // Linha selecionada — alpha 10%; hover sobe pra 14%
  // (no dark precisa de alpha levemente maior pra ficar visível sobre surface escuro)
  "table-row-selected":       `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  // Versões OPACAS dos selected — pra sticky/pinned cells não vazarem o conteúdo
  // de trás. Mix em SRGB (não oklch): misturar em oklch com o bg achromático
  // (hue 0) contamina o hue → tinge de vermelho.
  "table-row-selected-solid":       `color-mix(in srgb, ${brandContrast[400]} 10%, oklch(0.225 0.0058 286))`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brandContrast[400]} 14%, oklch(0.225 0.0058 286))`,

  // Dropdown/Popover — frosted-glass: bg-canvas com 70% opacidade
  "dropdown":         "color-mix(in oklab, var(--color-bg-canvas) 70%, transparent)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  // Hierarquia — verbatim da default
  strong:  white,                                // 100% — títulos
  default: "oklch(0.98 0 0)",                    // texto padrão (sem primitive equiv exato)
  muted:   gray[400],                            // labels, helpers
  subtle:  `color-mix(in oklch, ${gray[400]} 70%, transparent)`,  // placeholders
  disabled: gray[600],

  // Brand — o neon puro; sobre surface escuro o contraste é altíssimo
  brand: brandContrast[400],

  // Status
  danger:  danger[500],
  success: success[400],       // = brand[400] — o neón, igual ao fg.brand
  warning: warning[500],
  info:    info[500],

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

// ⚠️ `default`/`sidebar`/`table` NÃO usam gray[800] (zinc-800, L 0.2739). A L-009
// exige borda no dark com L ≥ surface + 6%; com surface em 0.225 o zinc-800 dá só
// +0.0489 e a borda começa a desaparecer. L 0.29 (#2b2b2e) dá +0.065 e satisfaz a
// regra — mesmo hue/croma da Zinc, só um shade que a rampa não tem (como o 150).
// Nota: a default do DS usa gray[800] sobre a mesma surface, dando +0.0395 — ou
// seja, viola a L-009 mais que isto. Não corrigido aqui: é escopo de outra tarefa.
export const border = {
  default: "oklch(0.29 0.0055 286)",
  subtle:  "oklch(1 0 0 / 0.04)",
  input:   "oklch(1 0 0 / 0.08)",
  sidebar: "oklch(0.29 0.0055 286)",

  // Um shade acima do fundo brand[400] — regra de pareamento §3.3, igual ao light
  brand:           brandContrast[500],
  "brand-subtle":  `color-mix(in oklch, ${brandContrast[400]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[400]} 36%, transparent)`,  // ancora no 400 (= brand)
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  // Tabela — mesma L da border.default (L-009)
  table: "oklch(0.29 0.0055 286)",
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
