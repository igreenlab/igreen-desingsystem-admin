/**
 * to-brand-overlay.ts — Transform adapter: tokens de UMA marca → CSS overlay escopado.
 *
 * Diferente do to-tailwind-v4.ts (que emite o tema-base completo da marca default
 * em :root / .dark), este emite só o DIFF de cor da marca contra a default —
 * dentro de um seletor de escopo — para que múltiplas marcas COEXISTAM no mesmo
 * bundle e sejam trocadas em runtime, com CSS mínimo.
 *
 * O diff cobre TODA a paleta de cor (bg/fg/border/ring/overlay/chart), então uma
 * marca pode mudar não só a cor primária, mas também tingir neutros, superfícies,
 * sidebar, tabela etc. — tema "encorpado", não só a brand.
 *
 * Brand-aware: a marca vem por argv (import dinâmico de tokens/brands/<marca>/);
 * a default é a baseline estática do diff.
 *
 * Uso:
 *   npx tsx tokens/transforms/to-brand-overlay.ts blue > src/styles/theme/brand-blue.css
 *   npx tsx tokens/transforms/to-brand-overlay.ts <marca> [seletor]
 */

import { buildColorVars, toBlock } from "./to-tailwind-v4";
import { colorLight as defaultLight } from "../brands/default/semantic/color-light";
import { colorDark as defaultDark } from "../brands/default/semantic/color-dark";

type SemanticColors = typeof defaultLight;

/** Só as vars cujo valor difere da baseline default. */
function diffVars(
  brandColors: SemanticColors,
  baseColors: SemanticColors,
): Record<string, string> {
  const brandVars = buildColorVars(brandColors);
  const baseVars = buildColorVars(baseColors);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(brandVars)) {
    if (v !== baseVars[k]) out[k] = v;
  }
  return out;
}

export function generateBrandOverlayCss(
  brand: string,
  colorLight: SemanticColors,
  colorDark: SemanticColors,
  scope = `[data-theme="${brand}"]`,
): string {
  const light = diffVars(colorLight, defaultLight);
  const dark = diffVars(colorDark, defaultDark);

  return `/**
 * brand-${brand}.css — Auto-gerado. Não editar manualmente.
 * Overlay de marca escopado (só o DIFF de cor vs. default). Coexiste com o tema-base.
 * Source: tokens/brands/${brand}/semantic/*.ts
 * Regenerar: npx tsx tokens/transforms/to-brand-overlay.ts ${brand} > src/styles/theme/brand-${brand}.css
 *
 * Ative aplicando data-theme="${brand}" no <html> (ver src/hooks/useBrand.ts).
 */

/* ── Light (${Object.keys(light).length} vars divergem da default) ─────────────────────────── */
${scope} {
${toBlock(light)}
}

/* ── Dark (${Object.keys(dark).length} vars — .dark[data-theme] vence o .dark base) ────────── */
.dark${scope} {
${toBlock(dark)}
}
`;
}

// ── CLI ─────────────────────────────────────────────────────────────────────

const brand = process.argv[2] ?? "blue";
const scopeArg = process.argv[3];

const { colorLight } = (await import(`../brands/${brand}/semantic/color-light`)) as {
  colorLight: SemanticColors;
};
const { colorDark } = (await import(`../brands/${brand}/semantic/color-dark`)) as {
  colorDark: SemanticColors;
};

process.stdout.write(generateBrandOverlayCss(brand, colorLight, colorDark, scopeArg));
