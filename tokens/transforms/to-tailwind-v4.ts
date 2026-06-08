/**
 * to-tailwind-v4.ts — Transform adapter: tokens → Tailwind v4 @theme CSS
 *
 * Gera dist/tailwind-theme.css com:
 *   - @theme { } — CSS vars para utility classes automáticas
 *   - .dark { } — overrides dark mode
 *   - @utility text-* { } — presets tipográficos compostos
 *
 * Uso:
 *   npx tsx tokens/transforms/to-tailwind-v4.ts > dist/tailwind-theme.css
 *
 * Consumer:
 *   @import "tailwindcss";
 *   @import "@igreen/design-system/theme.css";
 */

import { colorLight } from "../brands/default/semantic/color-light";
import { colorDark }  from "../brands/default/semantic/color-dark";
import { spacing }    from "../brands/default/semantic/spacing";
import { sizing }     from "../brands/default/semantic/sizing";
import { shape }      from "../brands/default/semantic/shape";
import { elevation }  from "../brands/default/semantic/elevation";
import { typography } from "../brands/default/semantic/typography";
import { componentSizing }  from "../brands/default/components/sizing";
import { componentSpacing } from "../brands/default/components/spacing";

// ── Helpers ───────────────────────────────────────────────────────────────────

function flatten(
  obj: Record<string, unknown>,
  prefix: string,
  result: Record<string, string> = {},
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const varName = `${prefix}-${key}`;
    if (typeof value === "string") {
      result[varName] = value;
    } else if (typeof value === "number") {
      result[varName] = String(value);
    } else if (typeof value === "object" && value !== null) {
      // Handle spacing.space.px = { px: "1px", raw: 1 } — extract .px
      if ("px" in value && typeof (value as Record<string, unknown>).px === "string") {
        result[varName] = (value as Record<string, string>).px;
      } else {
        flatten(value as Record<string, unknown>, varName, result);
      }
    }
  }
  return result;
}

function toBlock(vars: Record<string, string>, indent = "  "): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

// ── Color vars ────────────────────────────────────────────────────────────────

function buildColorVars(
  colors: typeof colorLight,
  prefix = "--color",
): Record<string, string> {
  return {
    ...flatten(colors.bg, `${prefix}-bg`),
    ...flatten(colors.fg, `${prefix}-fg`),
    ...flatten(colors.border, `${prefix}-border`),
    ...flatten(colors.ring, `${prefix}-ring`),
    ...flatten(colors.overlay, `${prefix}-overlay`),
  };
}

// ── Spacing vars ──────────────────────────────────────────────────────────────

function buildSpacingVars(): Record<string, string> {
  const result: Record<string, string> = {};

  // space.* → --spacing-sp-* (gera p-sp-md, m-sp-lg etc — sem colisão com Tailwind)
  for (const [key, value] of Object.entries(spacing.space)) {
    if (typeof value === "string") {
      result[`--spacing-sp-${key}`] = value;
    } else if (typeof value === "object" && value !== null && "px" in value) {
      result[`--spacing-sp-${key}`] = (value as { px: string }).px;
    }
  }

  // gap.* → --spacing-gp-* (gera gap-gp-md, gap-gp-xs etc — sem duplicação gap-gap-)
  flatten(spacing.gap, "--spacing-gp", result);

  // pad.* → --spacing-pad-*
  flatten(spacing.pad, "--spacing-pad", result);

  // Apenas 3 roles: sp (space), gp (gap), pad

  return result;
}

// ── Sizing vars ───────────────────────────────────────────────────────────────

function buildSizingVars(): Record<string, string> {
  const result: Record<string, string> = {};

  // ── Semantic: comp → --spacing-comp-* (h-comp-*, w-comp-*, size-comp-*)
  flatten(sizing.comp, "--spacing-comp", result);

  // ── Components: form → --spacing-form-* (min-h-form-*, h-form-*)
  flatten(componentSizing.form, "--spacing-form", result);

  // ── Components: layout → --spacing-layout-*
  flatten(componentSizing.layout, "--spacing-layout", result);

  // ── Components: icon → --spacing-icon-* (size-icon-*)
  flatten(componentSizing.icon, "--spacing-icon", result);

  // ── Components: container → --container-* (max-w-container-*)
  for (const [key, value] of Object.entries(componentSizing.container)) {
    result[`--container-${key}`] = value;
  }

  // ── Components: pad-card, pad-page → --spacing-pad-card-*, --spacing-pad-page-*
  flatten(componentSpacing.padCard, "--spacing-pad-card", result);
  flatten(componentSpacing.padPage, "--spacing-pad-page", result);

  // ── Components: form-gap → --spacing-form-gap (gap padrão entre fields)
  result["--spacing-form-gap"] = componentSpacing.formGap;

  return result;
}

// ── Shape vars ────────────────────────────────────────────────────────────────

function buildShapeVars(): Record<string, string> {
  const result: Record<string, string> = {};

  // radius knob → --radius (mantém --radius para compatibilidade Shadcn via globals.css)
  result["--radius"] = shape.RADIUS_BASE;

  // radius → --radius-radius-* (gera rounded-radius-sm, rounded-radius-base etc)
  // Prefixo duplo evita sobrescrever rounded-sm, rounded-md, rounded-lg do Tailwind nativo.
  for (const [key, value] of Object.entries(shape.radius)) {
    if (value.includes("*")) {
      result[`--radius-radius-${key}`] = `calc(${value})`;
    } else {
      result[`--radius-radius-${key}`] = value;
    }
  }

  // borderWidth → --border-width-*
  for (const [key, value] of Object.entries(shape.borderWidth)) {
    result[`--border-width-${key}`] = value;
  }

  return result;
}

// ── Shadow vars ───────────────────────────────────────────────────────────────

function buildShadowVars(mode: "light" | "dark"): Record<string, string> {
  const result: Record<string, string> = {};
  const shadows = elevation.shadow[mode];
  for (const [key, value] of Object.entries(shadows)) {
    // --shadow-sh-* gera shadow-sh-sm, shadow-sh-md etc
    // Evita sobrescrever shadow-sm, shadow-md, shadow-lg do Tailwind nativo.
    result[`--shadow-sh-${key}`] = value;
  }
  return result;
}

// ── Opacity vars ──────────────────────────────────────────────────────────────

function buildOpacityVars(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(elevation.opacity)) {
    result[`--opacity-${key}`] = String(value);
  }
  return result;
}

// ── Blur vars ─────────────────────────────────────────────────────────────────
// unused — Tailwind nativo usado diretamente (blur-sm, blur-md, blur-lg, blur-xl)

function buildBlurVars(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(elevation.blur)) {
    result[`--blur-${key}`] = value;
  }
  return result;
}

// ── Z-Index vars ──────────────────────────────────────────────────────────────

function buildZIndexVars(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(elevation.zIndex)) {
    result[`--z-index-${key}`] = String(value);
  }
  return result;
}

// ── Scrollbar vars ───────────────────────────────────────────────────────────

function buildScrollbarVars(): Record<string, string> {
  const result: Record<string, string> = {};
  // scrollbar.width → --scrollbar-width-* (sem prefixo --spacing- — não é spacing)
  for (const [key, value] of Object.entries(componentSizing.scrollbar.width)) {
    result[`--scrollbar-width-${key}`] = value;
  }
  return result;
}

// ── Scrollbar @utility blocks ────────────────────────────────────────────────

function buildScrollbarUtilities(): string {
  return `@utility scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: var(--color-bg-muted-hover) transparent;

  &::-webkit-scrollbar {
    width: var(--scrollbar-width-thin);
    height: var(--scrollbar-width-thin);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-bg-muted-hover);
    border-radius: var(--radius-radius-full);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-fg-muted);
  }
}

@utility scrollbar-default {
  scrollbar-width: auto;
  scrollbar-color: var(--color-bg-muted-hover) transparent;

  &::-webkit-scrollbar {
    width: var(--scrollbar-width-default);
    height: var(--scrollbar-width-default);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-bg-muted-hover);
    border-radius: var(--radius-radius-full);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-fg-muted);
  }
}`;
}

// ── Typography @utility blocks ────────────────────────────────────────────────

function buildTypographyUtilities(): string {
  const lines: string[] = [];

  for (const [key, preset] of Object.entries(typography)) {
    const p = preset as {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      letterSpacing: string;
      fontFamily: string;
    };

    lines.push(`@utility text-${key} {`);
    lines.push(`  font-size: ${p.fontSize};`);
    lines.push(`  line-height: ${p.lineHeight};`);
    lines.push(`  font-weight: ${p.fontWeight};`);
    lines.push(`  letter-spacing: ${p.letterSpacing};`);
    lines.push(`  font-family: ${p.fontFamily};`);
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join("\n");
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateTailwindV4Css(): string {
  // @theme vars (light mode defaults + non-color tokens)
  const themeVars = {
    ...buildColorVars(colorLight),
    ...buildSpacingVars(),
    ...buildSizingVars(),
    ...buildShapeVars(),
    ...buildShadowVars("light"),
    ...buildOpacityVars(),
    // blur removido — usa Tailwind nativo (blur-sm, blur-md, blur-lg, blur-xl)
    ...buildZIndexVars(),
    ...buildScrollbarVars(),
  };

  // Dark mode overrides (only colors + shadows change)
  const darkVars = {
    ...buildColorVars(colorDark),
    ...buildShadowVars("dark"),
  };

  return `/**
 * tailwind-theme.css — Auto-gerado. Não editar manualmente.
 * Source of truth: tokens/brands/default/semantic/*.ts
 * Regenerar: npx tsx tokens/transforms/to-tailwind-v4.ts > dist/tailwind-theme.css
 */

@theme {
${toBlock(themeVars)}
}

/* ── Dark mode overrides (via .dark class — toggle manual) ────────────────── */

.dark {
${toBlock(darkVars)}
}

/* ── Typography utilities (composite presets) ─────────────────────────────── */

${buildTypographyUtilities()}
/* ── Scrollbar utilities (token-driven) ───────────────────────────────────── */

${buildScrollbarUtilities()}`;
}

// ── CLI ───────────────────────────────────────────────────────────────────────

// Works in both ESM and CJS
const isMain =
  (typeof require !== "undefined" && require.main === module) ||
  (typeof import.meta !== "undefined" && import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}`);

if (isMain || process.argv[1]?.includes("to-tailwind-v4")) {
  process.stdout.write(generateTailwindV4Css());
}
