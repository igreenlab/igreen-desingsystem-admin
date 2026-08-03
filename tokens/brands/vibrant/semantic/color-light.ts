/**
 * color-light.ts — Semantic color tokens (light) — BRAND "vibrant" (iGreen Vibrant)
 * Tier 2 de 3: intenção. API pública.
 *
 * Cópia self-contained da default: MESMO contrato de nomes. Todo token que não é
 * da família brand é verbatim da default → diff ZERO no overlay. Só a marca muda.
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
  // Surfaces (sólidos) — verbatim da default: esta marca NÃO tinge superfície
  canvas:           white,        // body, página
  surface:          white,        // cards, drawer
  "surface-elevated": white,      // popovers, modais
  "surface-panels": white,        // página de fundo
  sidebar:          "oklch(0.9516 0.0027 106.45)", // mineral-100 — calidez sidebar (sem primitive equiv)

  // Backgrounds neutros (sólidos cinza no light)
  subtle:   gray[50],
  muted:    gray[50],
  emphasis: gray[100],           // neutro mais visível que muted (sem semântica de "active")
  input:    white,
  accent:   white,               // light: bg-accent = branco (item ativo destaca por contraste)

  // Brand (âncora no brand[400] — o neon; hover DESCE a luminosidade, ver §3.2)
  brand:            brand[400],
  "brand-subtle":   `color-mix(in oklch, ${brand[400]} 14%, transparent)`,
  "brand-hover":    brand[500],
  "brand-subtle-hover": `color-mix(in oklch, ${brand[400]} 22%, transparent)`,

  // Status (sólido + muted alpha — ×4 cores) — verbatim da default
  danger:                danger[500],
  "danger-muted":        `color-mix(in oklch, ${danger[500]} 14%, transparent)`,
  "danger-hover":        `color-mix(in oklch, ${danger[500]} 90%, black)`,
  "danger-muted-hover":  `color-mix(in oklch, ${danger[500]} 22%, transparent)`,

  success:                success[500],
  "success-muted":        `color-mix(in oklch, ${success[500]} 14%, transparent)`,
  "success-hover":        `color-mix(in oklch, ${success[500]} 90%, black)`,
  "success-muted-hover":  `color-mix(in oklch, ${success[500]} 22%, transparent)`,

  warning:                warning[500],
  "warning-muted":        `color-mix(in oklch, ${warning[500]} 14%, transparent)`,
  "warning-hover":        `color-mix(in oklch, ${warning[500]} 90%, black)`,
  "warning-muted-hover":  `color-mix(in oklch, ${warning[500]} 22%, transparent)`,

  info:                info[500],
  "info-muted":        `color-mix(in oklch, ${info[500]} 14%, transparent)`,
  "info-hover":        `color-mix(in oklch, ${info[500]} 90%, black)`,
  "info-muted-hover":  `color-mix(in oklch, ${info[500]} 22%, transparent)`,

  // Hover dos neutros — sólidos cinza no light
  "muted-hover":  "oklch(0.95 0 0)",
  "input-hover":  gray[50],           // 0.973 — sutil sobre input=white
  "accent-hover": "oklch(0.84 0 0)",

  // Sidebar item states — active = branco (contrasta com sidebar mineral-100), hover = mineral subtle
  "sidebar-accent":       white,
  "sidebar-accent-hover": "oklch(0.92 0.0068 115.72)",

  // Tabela — sólidos
  "table":            white,
  "table-head":       gray[50],
  "table-row-hover":  gray[50],
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
  // Hierarquia — verbatim da default
  strong:  gray[950],
  default: gray[950],
  muted:   gray[500],          // labels, helpers (light)
  subtle:  gray[400],          // placeholders, hints
  disabled: gray[400],

  // Brand — 800 é o 1º shade com AA folgado contra branco (6.56:1); ver §3.4
  brand: brand[800],

  // Status
  danger:  danger[500],
  success: success[500],
  warning: warning[500],
  info:    info[500],

  // Sobre fundos sólidos (on-*)
  // ⚠️ on-brand NÃO pode ser white: brand[400] dá 1.37:1. brand[950] → 10.27:1 (§3.1).
  "on-brand":   brand[950],
  "on-danger":  white,
  "on-success": white,
  "on-warning": black,         // amarelo claro → preto pra contraste
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

export const border = {
  default: gray[200],          // borda padrão
  subtle:  gray[150],          // dividers, controles
  input:   gray[300],          // inputs / fields
  sidebar: "oklch(0.9076 0.0068 115.72)", // mineral-200

  // ⚠️ DESVIO MEDIDO do §3.3 ("borda = um shade acima do fundo", que daria 500).
  // No DS `border-border-brand` tem 2 papéis, e o dominante NÃO é delinear
  // superfície de marca: é ser a ÚNICA fronteira sobre fundo claro — sublinhado da
  // aba ativa (tabs), borda de foco de input/textarea/select/combobox/datepicker,
  // contorno de badge/chip variant outline. Medido contra branco: 400 = 1.37:1,
  // 500 = 1.70:1, 600 = 2.67:1 — todos abaixo do 3:1 de SC 1.4.11; a aba ativa
  // ficava invisível. O 700 é o shade mais claro que passa (4.47:1) e ainda
  // delineia o preenchimento neon (3.26:1) — o 500 dava só 1.24:1 contra o 400,
  // ou seja falhava nos DOIS papéis. No dark o 500 fica (8.31:1 na surface escura).
  brand:           brand[700],
  "brand-subtle":  `color-mix(in oklch, ${brand[400]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[500]} 36%, transparent)`,
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  // Tabela
  table: gray[150],
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
  float: "oklch(0.55 0 0 / 0.12)",
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
