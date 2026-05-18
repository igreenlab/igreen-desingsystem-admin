/**
 * to-tailwind.ts — Transform adapter: tokens → Tailwind config
 *
 * Uso: com Tailwind CSS v3 ou v4.
 * Importar no tailwind.config.ts do projeto consumidor.
 *
 * Exemplo (Tailwind v3):
 *   import { buildTailwindTheme } from "@igreen/design-system/transforms/to-tailwind";
 *   export default { theme: { extend: buildTailwindTheme() } }
 */

import { colorLight } from "../brands/default/semantic/color-light";
import { spacing }    from "../brands/default/semantic/spacing";
import { sizing }     from "../brands/default/semantic/sizing";
import { shape }      from "../brands/default/semantic/shape";
import { elevation }  from "../brands/default/semantic/elevation";
import { typography } from "../brands/default/semantic/typography";

export function buildTailwindTheme() {
  return {
    // ── Colors ─────────────────────────────────────────────────────────────
    colors: {
      // Backgrounds
      "bg-surface":            "var(--color-bg-surface)",
      "bg-surface-inverted":   "var(--color-bg-surface-inverted)",
      "bg-canvas":             "var(--color-bg-canvas)",
      "bg-muted":              "var(--color-bg-muted)",
      "bg-moderate":           "var(--color-bg-moderate)",
      "bg-strong":             "var(--color-bg-strong)",
      "bg-primary":            "var(--color-bg-primary)",
      "bg-primary-subtle":     "var(--color-bg-primary-subtle)",
      "bg-primary-muted":      "var(--color-bg-primary-muted)",
      "bg-primary-strong":     "var(--color-bg-primary-strong)",
      "bg-secondary":          "var(--color-bg-secondary)",
      "bg-disabled":           "var(--color-bg-disabled)",
      "bg-success":            "var(--color-bg-success)",
      "bg-success-subtle":     "var(--color-bg-success-subtle)",
      "bg-warning":            "var(--color-bg-warning)",
      "bg-warning-subtle":     "var(--color-bg-warning-subtle)",
      "bg-critical":           "var(--color-bg-critical)",
      "bg-critical-subtle":    "var(--color-bg-critical-subtle)",
      "bg-info":               "var(--color-bg-info)",
      "bg-info-subtle":        "var(--color-bg-info-subtle)",
      "bg-inverted":           "var(--color-bg-surface-inverted)",
      // Foregrounds
      "fg-foreground":         "var(--color-fg-foreground)",
      "fg-foreground-inverted":"var(--color-fg-foreground-inverted)",
      "fg-strong":             "var(--color-fg-strong)",
      "fg-moderate":           "var(--color-fg-moderate)",
      "fg-muted":              "var(--color-fg-muted)",
      "fg-subtle":             "var(--color-fg-subtle)",
      "fg-disabled":           "var(--color-fg-disabled)",
      "fg-primary":            "var(--color-fg-primary)",
      "fg-secondary":          "var(--color-fg-secondary)",
      "fg-on-primary":         "var(--color-fg-on-primary)",
      "fg-success":            "var(--color-fg-success)",
      "fg-warning":            "var(--color-fg-warning)",
      "fg-critical":           "var(--color-fg-critical)",
      "fg-info":               "var(--color-fg-info)",
      // Borders
      "border-main":           "var(--color-border-main)",
      "border-subtle":         "var(--color-border-subtle)",
      "border-strong":         "var(--color-border-strong)",
      "border-primary":        "var(--color-border-primary)",
      "border-secondary":      "var(--color-border-secondary)",
      "border-disabled":       "var(--color-border-disabled)",
      "border-success":        "var(--color-border-success)",
      "border-warning":        "var(--color-border-warning)",
      "border-critical":       "var(--color-border-critical)",
      "border-info":           "var(--color-border-info)",
      // Ring
      "ring-primary":          "var(--color-ring-primary)",
      "ring-success":          "var(--color-ring-success)",
      "ring-warning":          "var(--color-ring-warning)",
      "ring-critical":         "var(--color-ring-critical)",
      "ring-info":             "var(--color-ring-info)",
    },

    // ── Spacing ────────────────────────────────────────────────────────────
    spacing: {
      ...Object.fromEntries(
        Object.entries(spacing.space)
          .filter(([, v]) => typeof v === "string")
          .map(([k, v]) => [`space-${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(spacing.gap).map(([k, v]) => [`gap-${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(spacing.pad).flatMap(([k, v]) => {
          const pad = v as { x: string; y: string };
          return [
            [`pad-${k}-x`, pad.x],
            [`pad-${k}-y`, pad.y],
          ];
        })
      ),
      ...Object.fromEntries(
        Object.entries(spacing.inset).map(([k, v]) => [`inset-${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(spacing.stack).map(([k, v]) => [`stack-${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(spacing.inline).map(([k, v]) => [`inline-${k}`, v])
      ),
      // sizing: contentGap → spacing utilities
      ...Object.fromEntries(
        Object.entries(sizing.contentGap).map(([k, v]) => [`content-${k}`, v])
      ),
    },

    // ── Heights ────────────────────────────────────────────────────────────
    minHeight: {
      ...Object.fromEntries(
        Object.entries(sizing.componentHeight).map(([k, v]) => [`component-${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(sizing.formHeight).map(([k, v]) => [`form-${k}`, v])
      ),
    },
    height: Object.fromEntries(
      Object.entries(sizing.layoutHeight).map(([k, v]) => [`layout-${k}`, v])
    ),

    // ── Widths ─────────────────────────────────────────────────────────────
    maxWidth: sizing.containerWidth,
    width: {
      ...sizing.componentWidth,
      ...Object.fromEntries(
        Object.entries(sizing.avatarSize).map(([k, v]) => [`avatar-${k}`, v])
      ),
    },

    // ── Border radius ──────────────────────────────────────────────────────
    borderRadius: Object.fromEntries(
      Object.entries(shape.radius).map(([k, v]) => [k, v])
    ),

    // ── Border width ───────────────────────────────────────────────────────
    borderWidth: shape.borderWidth,

    // ── Shadows ────────────────────────────────────────────────────────────
    boxShadow: elevation.shadow.light,

    // ── Opacity ────────────────────────────────────────────────────────────
    opacity: Object.fromEntries(
      Object.entries(elevation.opacity).map(([k, v]) => [k, String(v)])
    ),
  };
}

/**
 * Config de tw-merge para evitar conflitos entre classes geradas.
 */
export function buildTwMergeConfig() {
  return {
    classGroups: {
      "bg-color": [
        { bg: Object.keys(colorLight.bg).map(k => `bg-${k}`) }
      ],
      "text-color": [
        { text: Object.keys(colorLight.fg).map(k => `fg-${k}`) }
      ],
      "border-color": [
        { border: Object.keys(colorLight.border).map(k => `border-${k}`) }
      ],
    },
  };
}
