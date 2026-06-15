/**
 * color-light.ts — Semantic color tokens (light mode) — V3
 * Tier 2 de 3: intenção. API pública.
 *
 * NOMENCLATURA V3:
 *   brand          → cor da marca (NÃO "primary")
 *   danger         → feedback destrutivo (NÃO "critical")
 *   fg.default     → texto padrão (NÃO "fg.foreground")
 *   on-*           → texto sobre cor sólida
 *   subtle/muted   → variantes alpha-tinted (color-mix da cor base)
 *   hover          → escurece cor sólida (mix com black) ou sobe alpha
 *
 * NAMESPACES:
 *   bg      → fundos de superfícies, brand, status, neutros
 *   fg      → texto + ícones
 *   border  → bordas, dividers
 *   ring    → focus rings (acessibilidade)
 *   overlay → scrims de modal/drawer
 */

import {
  brand, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces (sólidos)
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

  // Brand (derivam do brand[600])
  brand:            brand[600],
  "brand-subtle":   `color-mix(in oklch, ${brand[600]} 14%, transparent)`,
  "brand-hover":    `color-mix(in oklch, ${brand[600]} 90%, black)`,
  "brand-subtle-hover": `color-mix(in oklch, ${brand[600]} 22%, transparent)`,

  // Status (sólido + muted alpha — ×4 cores)
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
  // Hover sutil: gray[50] (~2.7% diff de white) em vez de gray[100] (6% — forte demais).
  // Mesmo tom do table-head, mantém hierarquia visual sem competir com cells selected.
  "table-row-hover":  gray[50],
  // Linha selecionada — alpha brand discreto (6%); hover sobe pra 10%
  // (não usar `bg-brand-subtle` 14% — forte demais como bg de row)
  "table-row-selected":       `color-mix(in oklch, ${brand[600]} 6%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brand[600]} 10%, transparent)`,
  // Versões OPACAS dos selected — pra sticky/pinned cells não vazarem o conteúdo
  // de trás (color-mix com `transparent` deixa o conteúdo scrollado aparecer
  // sob a coluna fixa). Mix em SRGB (não oklch): misturar em oklch com um bg
  // achromático (hue 0) contamina o hue → tinge de vermelho. Em srgb o resultado
  // é o mesmo alpha-over do token transparente sobre o bg da tabela (white).
  "table-row-selected-solid":       `color-mix(in srgb, ${brand[600]} 6%, ${white})`,
  "table-row-selected-hover-solid": `color-mix(in srgb, ${brand[600]} 10%, ${white})`,

  // Dropdown/Popover — referencia bg-canvas (white no light)
  "dropdown":         "var(--color-bg-canvas)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  // Hierarquia
  strong:  gray[950],
  default: gray[950],
  muted:   gray[500],          // labels, helpers (light)
  subtle:  gray[400],          // placeholders, hints
  disabled: gray[400],

  // Brand
  brand: brand[600],

  // Status
  danger:  danger[500],
  success: success[500],
  warning: warning[500],
  info:    info[500],

  // Sobre fundos sólidos (on-*)
  "on-brand":   white,
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

  brand:           brand[600],
  "brand-subtle":  `color-mix(in oklch, ${brand[600]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[500]} 36%, transparent)`,
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  // Tabela
  table: gray[150],
} as const;

// ─── Ring (focus rings — cor pura usada com ring-* do Tailwind) ───────────────

export const ring = {
  brand:     `color-mix(in oklch, ${brand[600]} 22%, transparent)`,
  danger:    `color-mix(in oklch, ${danger[500]} 22%, transparent)`,
  success:   `color-mix(in oklch, ${success[500]} 22%, transparent)`,
  warning:   `color-mix(in oklch, ${warning[500]} 22%, transparent)`,
  info:      `color-mix(in oklch, ${info[500]} 22%, transparent)`,
  secondary: `color-mix(in oklch, ${gray[500]} 22%, transparent)`,
} as const;

// ─── Overlay / Scrim ──────────────────────────────────────────────────────────

export const overlay = {
  // Scrim de backdrop (modais, drawers)
  scrim: "oklch(0 0 0 / 0.55)",
  // Outline de 6px pra elementos flutuantes (panels, dropdowns, command, modais)
  // — consumido pela utility `outline-float`. Light: cinza medium 12%.
  // Valor anterior (6%) era visualmente imperceptível em backgrounds claros;
  // 12% mantém o efeito "halo sutil" mas com presença visual real.
  float: "oklch(0.55 0 0 / 0.12)",
} as const;

// ─── Chart (paleta categórica — verde da marca + harmônicas) ──────────────────
// Série de cores pra gráficos (Recharts via componente Chart). chart-1 ancora no
// verde da marca; as demais são harmônicas (teal → azul → âmbar → violeta).
// Light: levemente mais escuras pra contraste sobre superfícies claras.
export const chart = {
  "1": brand[500],             // verde da marca (primitive — acompanha a brand)
  "2": "oklch(0.66 0.12 195)", // teal
  "3": "oklch(0.55 0.15 250)", // azul
  "4": "oklch(0.76 0.15 80)",  // âmbar
  "5": "oklch(0.56 0.18 300)", // violeta
} as const;

export const colorLight = { bg, fg, border, ring, overlay, chart };
