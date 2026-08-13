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

  // ⚠️ `:not(.dark)` no seletor do light é LOAD-BEARING, não estilo.
  //
  // `[data-theme="x"]` e `.dark` têm a MESMA especificidade (0,1,0). Como este
  // arquivo é importado DEPOIS do tailwind-theme.css, o bloco light vencia o
  // `.dark` do tema-base por ordem de fonte — e todo token que a marca muda no
  // light mas cujo dark é IGUAL ao da default (logo, ausente do diff dark) tinha
  // o valor CLARO aplicado no dark mode.
  //
  // Medido em 2026-08-03: `vibrant` vazava 13 tokens (bg-subtle e bg-muted
  // renderizando #fafafa no dark, fg-default #0e0e11, border-input #d4d4d8 —
  // "tudo extremamente ruim", reportado pelo mantenedor); `blue` e `green`
  // vazavam 1 cada (`fg-strong`: título com `text-fg-strong` saía escuro sobre
  // fundo escuro, bug vivo em marca já publicada); `pay` vazava 0 só porque
  // diverge da default nos 2 modos em todo token que toca.
  //
  // Com `:not(.dark)` o bloco light simplesmente não se aplica no dark, e cada
  // token cai em: `.dark[data-theme]` (0,2,0) quando a marca diverge, senão no
  // `.dark` do tema-base — que é exatamente o valor que a marca escolheu, já que
  // o diff só omite o que é idêntico à default.
  const lightSel = `${scope}:not(.dark)`;
  const darkSel = `.dark${scope}`;

  // ⚠️ Este header viaja pro CONSUMIDOR — o arquivo é copiado pro template do CLI e
  // publicado em dist-lib/theme/. Path do repo do DS aqui lê como instrução que o
  // consumidor não tem como seguir: a versão anterior mandava "ver
  // src/hooks/useBrand.ts", pasta que não existe em projeto de consumidor, nos 4
  // overlays distribuídos. Ao escrever aqui, diga o que FAZER — e marque o que só
  // vale dentro do DS (L-060).
  return `/**
 * brand-${brand}.css — Auto-gerado. Não editar manualmente.
 * Overlay de marca escopado (só o DIFF de cor vs. default). Coexiste com o tema-base.
 * Source (repo do DS): tokens/brands/${brand}/semantic/*.ts
 * Regenerar (só no repo do DS): npm run tokens:brand:${brand}
 *
 * ATIVAR: importe este arquivo DEPOIS do tailwind-theme.css e ponha
 * data-theme="${brand}" no <html>. Sem o atributo nada casa — e não dá erro.
 * Seletor de marca em runtime: hook \`useBrand\` do pacote (≥ 0.33.0), ou
 * setAttribute/removeAttribute na mão ("default" = remover o atributo).
 *
 * Os 2 blocos são MUTUAMENTE EXCLUSIVOS por construção (\`:not(.dark)\`). No dark,
 * token ausente do bloco dark cai no \`.dark\` do tema-base de propósito: o diff só
 * omite o que já é idêntico à default.
 */

/* ── Light (${Object.keys(light).length} vars divergem da default) ─────────────────────────── */
${lightSel} {
${toBlock(light)}
}

/* ── Dark (${Object.keys(dark).length} vars — .dark[data-theme] vence o .dark base) ────────── */
${darkSel} {
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
