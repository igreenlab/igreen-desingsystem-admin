/**
 * to-js-theme.ts — Transform adapter: tokens → JS theme object
 *
 * Uso: styled-components, Emotion, Stitches, vanilla-extract, ou qualquer
 * CSS-in-JS que aceite um tema como objeto JavaScript.
 *
 * Exporta dois objetos: lightTheme e darkTheme.
 */

import { colorLight } from "../brands/default/semantic/color-light";
import { colorDark }  from "../brands/default/semantic/color-dark";
import { spacing }    from "../brands/default/semantic/spacing";
import { sizing }     from "../brands/default/semantic/sizing";
import { shape }      from "../brands/default/semantic/shape";
import { elevation }  from "../brands/default/semantic/elevation";
import { typography } from "../brands/default/semantic/typography";
import { motionPresets, duration, easing } from "../brands/default/primitives/motion";

// ── Tokens agnósticos de modo (não mudam light/dark) ────────────────────────

const staticTokens = {
  spacing: {
    space:   spacing.space,
    gap:     spacing.gap,
    pad:     spacing.pad,
    inset:   spacing.inset,
    stack:   spacing.stack,
    inline:  spacing.inline,
  },
  sizing: {
    componentHeight: sizing.componentHeight,
    layoutHeight:    sizing.layoutHeight,
    iconSize:        sizing.iconSize,
    avatarSize:      sizing.avatarSize,
    containerWidth:  sizing.containerWidth,
    componentWidth:  sizing.componentWidth,
  },
  shape: {
    radius:      shape.radius,
    borderWidth: shape.borderWidth,
    outline:     shape.outline,
    divider:     shape.divider,
  },
  opacity:    elevation.opacity,
  blur:       elevation.blur,
  typography: typography,
  motion: {
    duration:  duration,
    easing:    easing,
    presets:   motionPresets,
  },
};

// ── Light theme ──────────────────────────────────────────────────────────────

export const lightTheme = {
  ...staticTokens,
  color: {
    bg:      colorLight.bg,
    fg:      colorLight.fg,
    border:  colorLight.border,
    ring:    colorLight.ring,
    overlay: colorLight.overlay,
  },
  shadow: elevation.shadow.light,
  mode: "light" as const,
};

// ── Dark theme ───────────────────────────────────────────────────────────────

export const darkTheme = {
  ...staticTokens,
  color: {
    bg:      colorDark.bg,
    fg:      colorDark.fg,
    border:  colorDark.border,
    ring:    colorDark.ring,
    overlay: colorDark.overlay,
  },
  shadow: elevation.shadow.dark,
  mode: "dark" as const,
};

// ── Type exports ─────────────────────────────────────────────────────────────

export type Theme = typeof lightTheme;
export type ThemeMode = Theme["mode"];
