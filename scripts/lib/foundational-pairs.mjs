/**
 * foundational-pairs.mjs — fonte ÚNICA dos pares fonte(DS) ↔ baked(template do CLI).
 *
 * Consumido por `cli-rebake-foundationals.mjs` (que COPIA) e por
 * `check-foundationals.mjs` (que VERIFICA). Existir como módulo não é organização:
 * as duas pontas enumeravam a lista separadamente, e ao acrescentar os overlays de
 * marca só no lado que copia eu criaria um gate que afirma sync e não verifica os
 * overlays — mecanismo cuja garantia não vale, que é o defeito da L-060.
 *
 * Os overlays de marca entram por DESCOBERTA de diretório, não enumerados, porque o
 * `detectBrandThemes()` do `cli/src/create.js` também descobre pelo diretório pra
 * montar o prompt "Tema de cor?". Lista fixa aqui divergiria dele na primeira marca
 * nova (e o sintoma seria a marca não aparecer na criação de projeto — silencioso).
 */
import { readdirSync, existsSync } from "node:fs";

/** Foundationals fixos: cn, tv, lucide-types e o tema-base. */
const FIXOS = [
  ["src/lib/utils.ts", "cli/templates/default/src/lib/utils.ts"],
  ["src/utils/tv.ts", "cli/templates/default/src/utils/tv.ts"],
  ["src/lib/lucide-types.ts", "cli/templates/default/src/lib/lucide-types.ts"],
  ["src/styles/theme/tailwind-theme.css", "cli/templates/default/src/styles/theme/tailwind-theme.css"],
];

const THEME_DIR = "src/styles/theme";
const TEMPLATE_THEME_DIR = "cli/templates/default/src/styles/theme";

/** Overlays `brand-<id>.css` presentes na fonte, em ordem estável. */
export function brandOverlays() {
  if (!existsSync(THEME_DIR)) return [];
  return readdirSync(THEME_DIR)
    .filter((f) => /^brand-.+\.css$/.test(f))
    .sort();
}

/**
 * Overlays que existem no BAKED mas não na fonte — marca removida do DS cuja cópia
 * ficou órfã no template. O prompt do CLI continuaria oferecendo um tema que o DS
 * não tem mais.
 */
export function orphanBakedOverlays() {
  if (!existsSync(TEMPLATE_THEME_DIR)) return [];
  const naFonte = new Set(brandOverlays());
  return readdirSync(TEMPLATE_THEME_DIR)
    .filter((f) => /^brand-.+\.css$/.test(f) && !naFonte.has(f))
    .sort();
}

/** Todos os pares [fonte, baked] — fixos + overlays de marca descobertos. */
export function foundationalPairs() {
  return [
    ...FIXOS,
    ...brandOverlays().map((f) => [`${THEME_DIR}/${f}`, `${TEMPLATE_THEME_DIR}/${f}`]),
  ];
}

export { FIXOS, THEME_DIR, TEMPLATE_THEME_DIR };
