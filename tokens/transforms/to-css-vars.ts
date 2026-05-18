/**
 * to-css-vars.ts — Transform adapter: tokens → CSS Custom Properties
 *
 * Uso: sem Tailwind. Gera globals.css com todas as vars do sistema.
 * Output: arquivo CSS consumível por qualquer framework.
 *
 * Como usar:
 *   npx tsx tokens/transforms/to-css-vars.ts > src/styles/tokens.css
 */

import { colorLight } from "../brands/default/semantic/color-light";
import { colorDark }  from "../brands/default/semantic/color-dark";
import { spacing }    from "../brands/default/semantic/spacing";
import { sizing }     from "../brands/default/semantic/sizing";
import { shape }      from "../brands/default/semantic/shape";
import { elevation }  from "../brands/default/semantic/elevation";

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenToCssVars(
  obj: Record<string, unknown>,
  prefix: string,
  result: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const varName = `${prefix}-${key}`;
    if (typeof value === "string" || typeof value === "number") {
      result[varName] = String(value);
    } else if (typeof value === "object" && value !== null) {
      flattenToCssVars(value as Record<string, unknown>, varName, result);
    }
  }
  return result;
}

function toCssBlock(vars: Record<string, string>, indent = "  "): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

// ── Geração ───────────────────────────────────────────────────────────────────

export function generateCssVars(): string {
  const lightVars = {
    ...flattenToCssVars(colorLight.bg,      "--color-bg"),
    ...flattenToCssVars(colorLight.fg,      "--color-fg"),
    ...flattenToCssVars(colorLight.border,  "--color-border"),
    ...flattenToCssVars(colorLight.ring,    "--color-ring"),
    ...flattenToCssVars(colorLight.overlay, "--color-overlay"),
    ...flattenToCssVars(spacing.space,      "--space"),
    ...flattenToCssVars(spacing.gap,       "--spacing-gap"),
    // pad.*.x/y → --spacing-pad-{size}-x, --spacing-pad-{size}-y
    ...Object.fromEntries(
      Object.entries(spacing.pad).flatMap(([k, v]) => {
        const pad = v as { x: string; y: string };
        return [
          [`--spacing-pad-${k}-x`, pad.x],
          [`--spacing-pad-${k}-y`, pad.y],
        ];
      })
    ),
    ...flattenToCssVars(spacing.inset,      "--inset"),
    ...flattenToCssVars(spacing.stack,      "--stack"),
    ...flattenToCssVars(spacing.inline,     "--inline"),
    ...flattenToCssVars(sizing.componentHeight, "--height-component"),
    ...flattenToCssVars(sizing.formHeight,  "--spacing-form"),
    ...flattenToCssVars(sizing.contentGap,  "--spacing-content"),
    ...flattenToCssVars(sizing.iconSize,    "--size-icon"),
    ...flattenToCssVars(sizing.avatarSize,  "--spacing-avatar"),
    ...flattenToCssVars(sizing.containerWidth, "--width-container"),
    ...flattenToCssVars(sizing.componentWidth, "--spacing-cw"),
    ...flattenToCssVars(sizing.layoutHeight, "--spacing-layout"),
    ...flattenToCssVars(shape.radius,       "--radius"),
    ...flattenToCssVars(shape.borderWidth,  "--border-width"),
    ...flattenToCssVars(elevation.shadow.light, "--shadow"),
    ...flattenToCssVars(
      Object.fromEntries(
        Object.entries(elevation.opacity).map(([k, v]) => [k, String(v)])
      ),
      "--opacity"
    ),
  };

  const darkVars = {
    ...flattenToCssVars(colorDark.bg,      "--color-bg"),
    ...flattenToCssVars(colorDark.fg,      "--color-fg"),
    ...flattenToCssVars(colorDark.border,  "--color-border"),
    ...flattenToCssVars(colorDark.ring,    "--color-ring"),
    ...flattenToCssVars(colorDark.overlay, "--color-overlay"),
    ...flattenToCssVars(elevation.shadow.dark, "--shadow"),
  };

  return `/**
 * tokens.css — Auto-gerado. Não editar manualmente.
 * Editar: tokens/brands/default/semantic/*.ts
 * Regenerar: npx tsx tokens/transforms/to-css-vars.ts > src/styles/tokens.css
 */

:root {
${toCssBlock(lightVars)}
}

@media (prefers-color-scheme: dark) {
  :root {
${toCssBlock(darkVars, "    ")}
  }
}

/* Dark mode via classe (para toggle manual) */
.dark {
${toCssBlock(darkVars)}
}
`;
}

// ── Uso direto via CLI ────────────────────────────────────────────────────────
const isMain =
  (typeof require !== "undefined" && require.main === module) ||
  (process.argv[1]?.includes("to-css-vars"));

if (isMain) {
  process.stdout.write(generateCssVars());
}
