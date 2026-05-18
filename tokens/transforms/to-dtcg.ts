/**
 * to-dtcg.ts — Transform adapter: tokens → DTCG 2025.10 JSON
 *
 * Gera .tokens.json compatível com:
 *   - Figma Variables (via Tokens Studio)
 *   - Penpot, Supernova, Style Dictionary v4+
 *
 * Uso:
 *   npx tsx tokens/transforms/to-dtcg.ts > tokens.tokens.json
 */

import { colorLight } from "../brands/default/semantic/color-light";
import { colorDark }  from "../brands/default/semantic/color-dark";
import { spacing }    from "../brands/default/semantic/spacing";
import { sizing }     from "../brands/default/semantic/sizing";
import { shape }      from "../brands/default/semantic/shape";
import { elevation }  from "../brands/default/semantic/elevation";
import { typography } from "../brands/default/semantic/typography";
import { duration, easing } from "../brands/default/primitives/motion";

// ── Types DTCG ────────────────────────────────────────────────────────────────

type DtcgToken = {
  $value: string | number | Record<string, unknown> | number[];
  $type: string;
  $description?: string;
};

type DtcgGroup = {
  [key: string]: DtcgToken | DtcgGroup;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function colorToken(value: string): DtcgToken {
  return { $value: value, $type: "color" };
}

function dimensionToken(value: string): DtcgToken {
  return { $value: value, $type: "dimension" };
}

function shadowToken(value: string): DtcgToken {
  return { $value: value, $type: "shadow" };
}

function durationToken(value: string): DtcgToken {
  return { $value: value, $type: "duration" };
}

function cubicBezierToken(value: string): DtcgToken {
  const match = value.match(/cubic-bezier\((.+)\)/);
  const coords = match ? match[1].split(",").map(Number) : [0, 0, 1, 1];
  return { $value: coords, $type: "cubicBezier" };
}

function typographyToken(preset: Record<string, string>): DtcgToken {
  return {
    $type: "typography",
    $value: {
      fontSize:      preset.fontSize,
      fontWeight:    preset.fontWeight,
      lineHeight:    preset.lineHeight,
      ...(preset.letterSpacing ? { letterSpacing: preset.letterSpacing } : {}),
    },
  };
}

function flatColorGroup(obj: Record<string, string>): DtcgGroup {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, colorToken(v)])
  );
}

function flatDimensionGroup(obj: Record<string, string>): DtcgGroup {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => typeof v === "string")
      .map(([k, v]) => [k, dimensionToken(v)])
  );
}

// ── Build DTCG tree ───────────────────────────────────────────────────────────

function buildDtcg(): DtcgGroup {
  return {
    "color": {
      "light": {
        "bg":      flatColorGroup(colorLight.bg as unknown as Record<string, string>),
        "fg":      flatColorGroup(colorLight.fg as unknown as Record<string, string>),
        "border":  flatColorGroup(colorLight.border as unknown as Record<string, string>),
        "ring":    flatColorGroup(colorLight.ring as unknown as Record<string, string>),
        "overlay": flatColorGroup(colorLight.overlay as unknown as Record<string, string>),
      },
      "dark": {
        "bg":      flatColorGroup(colorDark.bg as unknown as Record<string, string>),
        "fg":      flatColorGroup(colorDark.fg as unknown as Record<string, string>),
        "border":  flatColorGroup(colorDark.border as unknown as Record<string, string>),
        "ring":    flatColorGroup(colorDark.ring as unknown as Record<string, string>),
        "overlay": flatColorGroup(colorDark.overlay as unknown as Record<string, string>),
      },
    },

    "spacing": {
      "space":  flatDimensionGroup(spacing.space as unknown as Record<string, string>),
      "gap":    flatDimensionGroup(spacing.gap as unknown as Record<string, string>),
      "pad":    Object.fromEntries(
        Object.entries(spacing.pad).flatMap(([k, v]) => {
          const pad = v as { x: string; y: string };
          return [
            [`${k}-x`, dimensionToken(pad.x)],
            [`${k}-y`, dimensionToken(pad.y)],
          ];
        })
      ),
      "inset":  flatDimensionGroup(spacing.inset as unknown as Record<string, string>),
      "stack":  flatDimensionGroup(spacing.stack as unknown as Record<string, string>),
      "inline": flatDimensionGroup(spacing.inline as unknown as Record<string, string>),
    },

    "sizing": {
      "component-height": flatDimensionGroup(sizing.componentHeight as unknown as Record<string, string>),
      "form-height":      flatDimensionGroup(sizing.formHeight as unknown as Record<string, string>),
      "content-gap":      flatDimensionGroup(sizing.contentGap as unknown as Record<string, string>),
      "icon":             flatDimensionGroup(sizing.iconSize as unknown as Record<string, string>),
      "avatar":           flatDimensionGroup(sizing.avatarSize as unknown as Record<string, string>),
      "layout-height":    flatDimensionGroup(sizing.layoutHeight as unknown as Record<string, string>),
      "component-width":  flatDimensionGroup(sizing.componentWidth as unknown as Record<string, string>),
    },

    "shape": {
      "radius":       flatDimensionGroup(shape.radius as unknown as Record<string, string>),
      "border-width": flatDimensionGroup(shape.borderWidth as unknown as Record<string, string>),
    },

    "elevation": {
      "shadow": {
        "light": Object.fromEntries(
          Object.entries(elevation.shadow.light).map(([k, v]) => [k, shadowToken(v)])
        ),
        "dark": Object.fromEntries(
          Object.entries(elevation.shadow.dark).map(([k, v]) => [k, shadowToken(v)])
        ),
      },
    },

    "typography": Object.fromEntries(
      Object.entries(typography).map(([key, preset]) => [
        key,
        typographyToken(preset as unknown as Record<string, string>),
      ])
    ),

    "motion": {
      "duration": Object.fromEntries(
        Object.entries(duration).map(([k, v]) => [k, durationToken(v)])
      ),
      "easing": Object.fromEntries(
        Object.entries(easing)
          .filter(([, v]) => v.startsWith("cubic-bezier"))
          .map(([k, v]) => [k, cubicBezierToken(v)])
      ),
    },
  };
}

export function generateDtcg(): string {
  return JSON.stringify(buildDtcg(), null, 2);
}

const isMain =
  (typeof require !== "undefined" && require.main === module) ||
  (process.argv[1]?.includes("to-dtcg"));

if (isMain) {
  process.stdout.write(generateDtcg());
}
