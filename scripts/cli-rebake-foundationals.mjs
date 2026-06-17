/**
 * cli-rebake-foundationals.mjs — re-bakeia os foundational do DS no template do CLI.
 *
 * O template (`cli/templates/default/`) carrega cn/tv/theme COPIADOS (baked) pra dar
 * zero-config + matar a pegadinha do cn-overwrite. Esse baked CONGELA o conteúdo —
 * quando o DS muda os foundational (novo token, twMergeConfig, preset tipográfico),
 * o baked fica defasado e o `shadcn add @igreen/utils` para de "pular idêntico".
 *
 * REGRA: rode este script SEMPRE que mexer em cn/tv/theme (ou um novo preset L-016),
 * e BUMP a versão do CLI (`cli/package.json`) na mesma rodada. Está no checklist do
 * `/ds-release`. O `doctor.mjs` do consumidor valida contra o registry (pega drift),
 * mas o re-bake evita que projetos NOVOS já nasçam defasados.
 *
 *   node scripts/cli-rebake-foundationals.mjs      (ou: npm run cli:rebake)
 */
import { copyFileSync } from "node:fs";

const PAIRS = [
  ["src/lib/utils.ts", "cli/templates/default/src/lib/utils.ts"],
  ["src/utils/tv.ts", "cli/templates/default/src/utils/tv.ts"],
  ["src/lib/lucide-types.ts", "cli/templates/default/src/lib/lucide-types.ts"],
  ["src/styles/theme/tailwind-theme.css", "cli/templates/default/src/styles/theme/tailwind-theme.css"],
];

for (const [src, dst] of PAIRS) {
  copyFileSync(src, dst);
  console.log("re-baked →", dst);
}
console.log(`\n${PAIRS.length} foundational re-bakeados. Lembre de bumpar cli/package.json e republicar o CLI.`);
