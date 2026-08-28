/**
 * to-tailwind-v4.ts — Transform adapter: tokens → Tailwind v4 @theme CSS
 *
 * Gera src/styles/theme/tailwind-theme.css com:
 *   - @theme { } — CSS vars para utility classes automáticas
 *   - .dark { } — overrides dark mode
 *   - @utility text-* { } — presets tipográficos compostos
 *
 * Uso:
 *   npm run tokens:tw4
 *
 * ⚠️ Este arquivo escreve em stdout — quem define o destino é o redirect. O `npm run`
 * acima é a forma canônica justamente pra não haver duas verdades sobre onde o CSS vai.
 * Até 2026-08-03 este header dizia `> dist/tailwind-theme.css`, e `dist/` EXISTE (é o
 * build do app): seguir a instrução escrevia o tema num diretório de build e deixava o
 * arquivo real sem regenerar, sem erro nenhum.
 *
 * Consumer:
 *   @import "tailwindcss";
 *   @import "@snksergio/design-system/theme.css";
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

export function flatten(
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

export function toBlock(vars: Record<string, string>, indent = "  "): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

// ── Color vars ────────────────────────────────────────────────────────────────

export function buildColorVars(
  colors: typeof colorLight,
  prefix = "--color",
): Record<string, string> {
  return {
    ...flatten(colors.bg, `${prefix}-bg`),
    ...flatten(colors.fg, `${prefix}-fg`),
    ...flatten(colors.border, `${prefix}-border`),
    ...flatten(colors.ring, `${prefix}-ring`),
    ...flatten(colors.overlay, `${prefix}-overlay`),
    ...flatten(colors.chart, `${prefix}-chart`),
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

  // ── Components: container → --container-* (max-w-*)
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
//
// IMPORTANTE (Tailwind v4): valores de shadow num `@theme` normal são INLINADOS
// na utility (`.shadow-sh-md { box-shadow: <valor literal> }`) — NÃO usam var().
// Logo, um override `.dark { --shadow-sh-md }` é código morto: a utility ignora.
// Resultado: no dark a shadow ficava com o valor LIGHT (cinza-claro → "halo").
//
// Fix: indireção. A utility (via `@theme inline`) aponta pra `var(--ds-sh-*)`,
// e `--ds-sh-*` é uma var comum definida em :root (light) e .dark (dark) — que
// o cascade FAZ flipar. Assim shadow-sh-* fica dark-aware em todo o DS.

/** `@theme inline` — utility shadow-sh-* referencia a var de indireção. */
function buildShadowThemeInline(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(elevation.shadow.light)) {
    result[`--shadow-sh-${key}`] = `var(--ds-sh-${key})`;
  }
  return result;
}

/** Vars de indireção com os valores reais por modo (vão em :root / .dark). */
function buildShadowIndirection(mode: "light" | "dark"): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(elevation.shadow[mode])) {
    result[`--ds-sh-${key}`] = value;
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

// ── Blur ──────────────────────────────────────────────────────────────────────
//
// NÃO há `buildBlurVars()`. A escala de blur do Tailwind é numericamente idêntica à
// de `elevation.blur` (4/8/16px), então emitir `--blur-*` só criaria um segundo nome
// pro mesmo valor — use `blur-sm`/`blur-md`/`blur-lg` nativos, e `backdrop-blur-2xl`
// na receita de flutuante (L-040).
//
// A função existia aqui, marcada `// unused`, e **nunca era chamada** — removida em
// 2026-08-08. `elevation.blur` **continua** exportado em `tokens/index.ts` (é API
// pública do entry `./tokens`, e um consumidor pode legitimamente ler os valores);
// o que saiu foi só o gerador de CSS var que ninguém consumia.

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
  scrollbar-color: var(--color-bg-scrollbar-thumb) transparent;

  &::-webkit-scrollbar {
    width: var(--scrollbar-width-thin);
    height: var(--scrollbar-width-thin);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-bg-scrollbar-thumb);
    border-radius: var(--radius-radius-full);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-bg-scrollbar-thumb-hover);
  }
}

@utility scrollbar-default {
  scrollbar-width: auto;
  scrollbar-color: var(--color-bg-scrollbar-thumb) transparent;

  &::-webkit-scrollbar {
    width: var(--scrollbar-width-default);
    height: var(--scrollbar-width-default);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-bg-scrollbar-thumb);
    border-radius: var(--radius-radius-full);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-bg-scrollbar-thumb-hover);
  }
}

/* Rola, mas sem barra visível. Existe pro caso em que a barra QUEBRA o layout, não por
   estética: na tira do TabsNavigation ela ocupa 11px DENTRO do trilho e empurra as abas 11px pra
   cima da régua — a união da aba ativa com o conteúdo, que é o componente inteiro, some.
   Medido antes de existir esta utility; a alternativa era \`[scrollbar-width:none]\` +
   \`[&::-webkit-scrollbar]:hidden\` na unha, em componente distribuído.
   ⚠️ Só use quando houver outra affordance de navegação (setas, arrastar, teclado): barra
   escondida sem substituto é conteúdo inalcançável pra quem só tem mouse. */
@utility scrollbar-none {
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}`;
}

// ── Utilities de superfície flutuante ────────────────────────────────────────
//
// ⚠️ Estas MORAVAM no `src/styles/globals.css`, que é o CSS do SHOWCASE e não
// viaja pra canal nenhum. Resultado medido em 2026-08-07: 14 componentes
// distribuídos (Modal, Panel, FloatingPanel, Header, dialog, popover, select,
// dropdown-menu, command, context-menu, menubar, hover-card, alert-dialog,
// navigation-menu) referenciavam `outline-float`, e a classe não existia em npm,
// copy-in nem scaffold — o outline de 6px simplesmente não renderizava no
// consumidor. O token (`--color-overlay-float`) viajava; a utility que o consome,
// não. Falha silenciosa clássica: sem erro, sem aviso, só diferente do showcase.
//
// Quem achou foi o mantenedor comparando um print do projeto dele com o showcase.
//
// REGRA: utility custom que COMPONENTE DISTRIBUÍDO usa pertence AQUI, no tema
// gerado — nunca ao `globals.css`. O `scrollbar-thin` acima já seguia isso e é o
// precedente. Ao criar uma nova, pergunte "algum componente de src/components/
// referencia isso?" — se sim, é daqui.
function buildFloatingUtilities(): string {
  return `@utility outline-float {
  outline: 6px solid var(--color-overlay-float);
  outline-offset: 0;
}

/* Bottom-sheet mobile de DropdownMenu/Popover (L-030/L-031).
 *
 * O Radix Popper envolve o Content num wrapper posicionado por \`transform\`
 * inline, fora do alcance do className do Content — só dá pra alcançá-lo por
 * seletor global. Sem este bloco, um menu marcado \`mobileSheet\` abre flutuando
 * na posição calculada pelo Popper em vez de colar no rodapé.
 *
 * z-60 é load-bearing: acima de qualquer surface z-50 (drawer do sidebar mobile,
 * dialog, sheet). Sem isso, um sheet aberto DE DENTRO do drawer empata em z-50 e
 * renderiza atrás de forma intermitente, e o backdrop não captura o clique-fora. */
@media (width < 768px) {
  [data-radix-popper-content-wrapper]:has(> [data-mobile-sheet]) {
    position: fixed !important;
    inset: auto 0 0 0 !important;
    transform: none !important;
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    z-index: 60 !important;
  }
}`;
}

// ── Runtime base — o que TODO canal precisa e só o showcase tinha ────────────
//
// ⚠️ Estes blocos moravam em `src/styles/globals.css` (showcase) e em
// `cli/templates/default/src/index.css` (scaffold) — DOIS arquivos mantidos à mão
// que deveriam ser equivalentes e derivaram. O `tailwind-theme.css` é o único
// arquivo que os TRÊS canais leem (npm via `theme.css`, copy-in/scaffold via
// `styles/theme/`, submódulo via caminho relativo), então é aqui que isso pertence.
//
// Medido em 2026-08-07, seguindo a doc de cada canal:
//   - npm:       sem @custom-variant, sem @font-face, sem body → dark mode com
//                fundo branco, tipografia em system-ui, `dark:` preso ao SO
//   - submódulo: a doc manda importar SÓ o tailwind-theme.css → mesmos gaps
//   - scaffold:  ok, porque o index.css tem tudo — e é justamente essa cópia
//                paralela que faz os dois derivarem
//
// ⚠️ ORDEM É LOAD-BEARING no `@custom-variant`: declarar duas vezes faz o SEGUNDO
// vencer (medido no Tailwind 4.3). Como o `index.css` do scaffold declara o dele
// DEPOIS de importar o tema, projeto scaffold já existente mantém o comportamento
// atual (`:is(.dark *)`) e não muda. Scaffold novo passa a herdar o daqui.
//
// O seletor é o do showcase — `:where(.dark, .dark *)`, especificidade 0 — de
// propósito: com `:is(.dark *)` (0,2,0) o `dark:` vence `hover:` na mesma
// propriedade e o hover morre em silêncio. Provado com hover de mouse real.
function buildRuntimeBase(): string {
  return `@font-face {
  font-family: 'Geist';
  src: url('/fonts/Geist-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/GeistMono-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@theme inline {
  --font-sans: 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'Fira Code', monospace;
}

/* Dark por CLASSE, nunca por prefers-color-scheme: sem isto o tema do SO vaza
 * pro app nos dois sentidos (app claro com SO escuro dispara \`dark:\`). */
@custom-variant dark (&:where(.dark, .dark *));

html {
  font-family: var(--font-sans);
}

body {
  min-height: 100vh;
  background-color: var(--color-bg-canvas);
  color: var(--color-fg-default);
  transition: background-color 0.2s ease, color 0.2s ease;
}

@layer base {
  button {
    cursor: pointer;
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
    ...buildOpacityVars(),
    // blur removido — usa Tailwind nativo (blur-sm, blur-md, blur-lg, blur-xl)
    ...buildZIndexVars(),
    ...buildScrollbarVars(),
  };

  // Shadows: @theme inline aponta pras vars de indireção (dark-aware) — ver nota.
  const shadowThemeInline = buildShadowThemeInline();
  const shadowLight = buildShadowIndirection("light");

  // Dark mode overrides (cores + vars de indireção das shadows)
  const darkVars = {
    ...buildColorVars(colorDark),
    ...buildShadowIndirection("dark"),
  };

  // ⚠️ Este header é o mais distribuído do DS — TODO consumidor tem este arquivo (npm,
  // copy-in, scaffold e submódulo). Path do repo do DS aqui lê como instrução que o
  // consumidor não pode seguir, e o destino errado (`> dist/...`) era seguível DENTRO do
  // DS e silenciosamente errado. Ao mexer aqui, prefira o `npm run` (uma verdade só) e
  // marque o que só vale no repo do DS (L-060).
  return `/**
 * tailwind-theme.css — Auto-gerado. Não editar manualmente.
 * Source of truth (repo do DS): tokens/brands/default/semantic/*.ts
 * Regenerar (só no repo do DS): npm run tokens:tw4
 *
 * No seu projeto: este arquivo é gerenciado pelo DS — edição some no próximo update.
 * Customize na composição da tela (props/variantes + classes DS), não nos tokens.
 */

/* ── Runtime base (fonte, dark-variant, body) — ver buildRuntimeBase ──────── */

${buildRuntimeBase()}

@theme {
${toBlock(themeVars)}
}

/* ── Shadows: utilities apontam pra vars de indireção (dark-aware) ─────────── */

@theme inline {
${toBlock(shadowThemeInline)}
}

:root {
${toBlock(shadowLight)}
}

/* ── Dark mode overrides (via .dark class — toggle manual) ────────────────── */

.dark {
${toBlock(darkVars)}
}

/* ── Typography utilities (composite presets) ─────────────────────────────── */

${buildTypographyUtilities()}
/* ── Scrollbar utilities (token-driven) ───────────────────────────────────── */

${buildScrollbarUtilities()}

/* ── Superfície flutuante (usadas por 14 componentes distribuídos) ────────── */

${buildFloatingUtilities()}`;
}

// ── CLI ───────────────────────────────────────────────────────────────────────

// Works in both ESM and CJS
const isMain =
  (typeof require !== "undefined" && require.main === module) ||
  (typeof import.meta !== "undefined" && import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}`);

if (isMain || process.argv[1]?.includes("to-tailwind-v4")) {
  process.stdout.write(generateTailwindV4Css());
}
