/**
 * color-dark.ts — Semantic color tokens (dark mode) — V3
 * Tier 2 de 3: intenção. API pública.
 *
 * Mesmo contrato de nomes que color-light.ts. Só muda os valores.
 * Dark mode usa brandContrast (verde brilhante #0fc589) em vez de brand.
 *
 * MECÂNICA V3:
 *   - Surfaces sólidas (gray-900 e variantes)
 *   - Backgrounds neutros como alpha-overlay (oklch(1 0 0 / X)) que se adaptam à surface
 *   - Brand/status muted via color-mix da cor base com transparent
 *   - Hover de sólidos: clareiam (mix com white)
 *   - Hover de alphas: sobem 1 tier
 */

import {
  brandContrast, gray, success, warning, danger, info,
  white, black,
} from "../primitives/color-palette";

// ─── Background ───────────────────────────────────────────────────────────────

export const bg = {
  // Surfaces sólidas
  canvas:           gray[900],                  // body
  surface:          "oklch(0.225 0 0)",         // cards, drawer (entre gray-900 e gray-800)
  "surface-elevated": "oklch(0.225 0 0)",
  "surface-panels": gray[900],
  sidebar:          "oklch(0.225 0 0)",

  // Backgrounds neutros (alpha overlay — adapta ao surface debaixo)
  subtle:   "oklch(1 0 0 / 0.01)",
  muted:    "oklch(1 0 0 / 0.03)",
  emphasis: `color-mix(in oklch, ${white} 12%, transparent)`,  // mesmo visual do bg-accent (sem semântica de "active")
  input:    "oklch(1 0 0 / 0.04)",
  accent:   "oklch(1 0 0 / 0.12)",

  // Brand (dark usa brandContrast — verde brilhante)
  brand:            brandContrast[400],
  "brand-subtle":   `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  "brand-hover":    `color-mix(in oklch, ${brandContrast[400]} 90%, black)`,
  "brand-subtle-hover": `color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,

  // Status (sólido + muted alpha — ×4 cores)
  danger:                danger[500],
  "danger-muted":        `color-mix(in oklch, ${danger[500]} 14%, transparent)`,
  "danger-hover":        `color-mix(in oklch, ${danger[500]} 90%, white)`,
  "danger-muted-hover":  `color-mix(in oklch, ${danger[500]} 22%, transparent)`,

  success:                success[500],
  "success-muted":        `color-mix(in oklch, ${success[500]} 14%, transparent)`,
  "success-hover":        `color-mix(in oklch, ${success[500]} 90%, white)`,
  "success-muted-hover":  `color-mix(in oklch, ${success[500]} 22%, transparent)`,

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

  // Tabela — sólidos pra suportar sticky columns sem vazamento
  "table":            "oklch(0.225 0 0)",       // mesmo bg-surface
  "table-head":       "oklch(0.252 0 0)",       // gray-850 — head sticky
  "table-row-hover":  "oklch(0.252 0 0)",
  // Linha selecionada — alpha brandContrast 10%; hover sobe pra 14%
  // (no dark precisa de alpha levemente maior pra ficar visível sobre surface escuro)
  "table-row-selected":       `color-mix(in oklch, ${brandContrast[400]} 10%, transparent)`,
  "table-row-selected-hover": `color-mix(in oklch, ${brandContrast[400]} 14%, transparent)`,
  // Versões OPACAS dos selected — pra sticky/pinned cells não vazarem o conteúdo
  // de trás. Mesmo mix, mas sobre o bg sólido da tabela (surface escuro).
  "table-row-selected-solid":       `color-mix(in oklch, ${brandContrast[400]} 10%, oklch(0.225 0 0))`,
  "table-row-selected-hover-solid": `color-mix(in oklch, ${brandContrast[400]} 14%, oklch(0.225 0 0))`,

  // Dropdown/Popover — frosted-glass: bg-canvas com 70% opacidade
  // (combina com backdrop-blur no componente pra efeito vidro fosco)
  "dropdown":         "color-mix(in oklab, var(--color-bg-canvas) 70%, transparent)",
} as const;

// ─── Foreground (texto + ícones) ──────────────────────────────────────────────

export const fg = {
  // Hierarquia
  strong:  white,                                // 100% — títulos
  default: "oklch(0.98 0 0)",                    // texto padrão (sem primitive equiv exato)
  muted:   gray[400],                            // labels, helpers
  subtle:  `color-mix(in oklch, ${gray[400]} 70%, transparent)`,  // placeholders
  disabled: gray[600],

  // Brand
  brand: brandContrast[400],

  // Status
  danger:  danger[500],
  success: success[500],
  warning: warning[500],
  info:    info[500],

  // Sobre fundos sólidos (on-*) — dark inverte: verde brilhante, vermelho saturado, etc
  "on-brand":   black,                           // preto sobre verde brilhante
  "on-danger":  white,
  "on-success": black,
  "on-warning": black,
  "on-info":    white,
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────

export const border = {
  default: gray[800],
  subtle:  "oklch(1 0 0 / 0.04)",
  input:   "oklch(1 0 0 / 0.08)",
  sidebar: gray[800],

  brand:           brandContrast[400],
  "brand-subtle":  `color-mix(in oklch, ${brandContrast[400]} 36%, transparent)`,

  "danger-muted":  `color-mix(in oklch, ${danger[500]} 36%, transparent)`,
  "success-muted": `color-mix(in oklch, ${success[500]} 36%, transparent)`,
  "warning-muted": `color-mix(in oklch, ${warning[500]} 36%, transparent)`,
  "info-muted":    `color-mix(in oklch, ${info[500]} 36%, transparent)`,

  // Tabela
  table: gray[800],
} as const;

// ─── Ring (focus rings — cor pura usada com ring-* do Tailwind) ───────────────

export const ring = {
  brand:     `color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,
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
  // — consumido pela utility `outline-float`. Dark: branco 8%.
  // Valor anterior (4%) era visualmente imperceptível em surfaces escuras;
  // 8% mantém o efeito "halo sutil" mas com presença visual real.
  float: "oklch(1 0 0 / 0.08)",
} as const;

export const colorDark = { bg, fg, border, ring, overlay };
