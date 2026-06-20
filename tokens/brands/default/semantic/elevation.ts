/**
 * elevation.ts — Elevation tokens (shadows + opacity + blur + z-index) — V3
 *
 * REGRAS:
 * - Shadows ficam juntos com opacity porque definem "elevação".
 * - Shadows usam string literal pra parsing em build time.
 * - Múltiplas shadows por camada (ambient + key light).
 * - Dark mode: opacidade ~2-3x maior (sombras precisam ser mais fortes em fundo escuro).
 *
 * NOTA: Shadows usam OKLCH com slash alpha — formato moderno, suporte amplo.
 *
 * HIERARQUIA DE ELEVAÇÃO (V3):
 *   none    → sem elevação
 *   sm      → controles, botões em repouso
 *   md      → cards em repouso, tooltips
 *   lg      → popovers, dropdowns ancorados
 *   xl      → dropdowns grandes
 *   2xl     → modais, dialogs
 *   aside   → drawer slide-in lateral (direção horizontal)
 *
 * Outros composites:
 *   ring    → focus de input/textarea/select (3px brand-tinted box-shadow)
 */

import { brand, brandContrast, danger, success, warning, info } from "../primitives/color-palette";

// ─── Shadow tokens ─────────────────────────────────────────────────────────────

export const shadow = {
  // ── Light mode ───────────────────────────────────────────────────────────────
  light: {
    none:  "none",
    sm:    "0 1px 2px oklch(0 0 0 / 0.04)",
    md:    "rgba(145, 158, 171, 0.18) 0 0 2px 0, rgba(145, 158, 171, 0.12) 0 12px 24px -4px",
    lg:    "0 8px 24px oklch(0 0 0 / 0.08)",
    xl:    "0 12px 32px oklch(0 0 0 / 0.08)",
    "2xl": "0 24px 56px oklch(0 0 0 / 0.16)",
    aside: "-8px 0 24px oklch(0 0 0 / 0.12)",

    // Focus ring brand-tinted (composite — usado direto em box-shadow)
    ring:         `0 0 0 3px color-mix(in oklch, ${brand[600]} 22%, transparent)`,
    "ring-danger":  `0 0 0 3px color-mix(in oklch, ${danger[500]} 22%, transparent)`,
    "ring-warning": `0 0 0 3px color-mix(in oklch, ${warning[500]} 22%, transparent)`,
    "ring-success": `0 0 0 3px color-mix(in oklch, ${success[500]} 22%, transparent)`,
    "ring-info":    `0 0 0 3px color-mix(in oklch, ${info[500]} 22%, transparent)`,
  },

  // ── Dark mode ────────────────────────────────────────────────────────────────
  dark: {
    none:  "none",
    // Drop shadows reais no dark (antes: sm=none, md=hairline cinza claro → parecia
    // "mais claro" no hover). Agora sm = sombra sutil, md = elevação mais profunda
    // (sempre mais escura que sm). L-011: dark ≥ 2× a opacidade do light.
    sm:    "0 1px 2px oklch(0 0 0 / 0.15)",
    md:    "0 1px 2px oklch(0 0 0 / 0.30), 0 8px 18px -4px oklch(0 0 0 / 0.42)",
    lg:    "0 8px 24px oklch(0 0 0 / 0.30)",
    xl:    "0 12px 32px oklch(0 0 0 / 0.40)",
    "2xl": "0 24px 56px oklch(0 0 0 / 0.45)",
    aside: "-8px 0 24px oklch(0 0 0 / 0.40)",

    // Focus ring brand-contrast-tinted (dark usa brandContrast)
    ring:         `0 0 0 3px color-mix(in oklch, ${brandContrast[400]} 22%, transparent)`,
    "ring-danger":  `0 0 0 3px color-mix(in oklch, ${danger[500]} 22%, transparent)`,
    "ring-warning": `0 0 0 3px color-mix(in oklch, ${warning[500]} 22%, transparent)`,
    "ring-success": `0 0 0 3px color-mix(in oklch, ${success[500]} 22%, transparent)`,
    "ring-info":    `0 0 0 3px color-mix(in oklch, ${info[500]} 22%, transparent)`,
  },
} as const;

// ─── Opacity ───────────────────────────────────────────────────────────────────
export const opacity = {
  // Estados interativos
  disabled:    0.38,
  hover:       0.08,
  focus:       0.12,
  pressed:     0.12,
  dragged:     0.16,

  // Visibilidade
  invisible:   0,
  muted:       0.5,
  subtle:      0.7,
  full:        1,

  // Overlay de background (scrims de modal)
  "scrim-light": 0.32,
  "scrim-dark":  0.64,
} as const;

// ─── Blur (backdrop-filter) ────────────────────────────────────────────────────
export const blur = {
  sm: "blur(4px)",
  md: "blur(8px)",
  lg: "blur(16px)",
  xl: "blur(24px)",
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────
export const zIndex = {
  hide:     -1,
  base:      0,
  dropdown: 100,
  sticky:   200,
  overlay:  300,
  modal:    400,
  popover:  500,
  toast:    600,
  tooltip:  700,
} as const;

export const elevation = { shadow, opacity, blur, zIndex } as const;
export type ElevationToken = typeof elevation;
