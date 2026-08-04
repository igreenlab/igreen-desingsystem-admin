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
import { foundationalPairs, brandOverlays, orphanBakedOverlays } from "./lib/foundational-pairs.mjs";

/**
 * Os overlays de marca (`brand-<id>.css`) chegavam no template por cópia MANUAL, e
 * isso tinha dois modos de falha que ninguém vê: (1) marca nova não bakeada → o
 * `detectBrandThemes()` do `cli/src/create.js` escaneia essa MESMA pasta pra montar
 * o prompt "Tema de cor?", então a marca não aparece na criação de projeto; (2) marca
 * editada no DS com o baked congelado → projeto novo nasce com o overlay velho.
 * Nenhum dos dois quebra build, teste ou tsc.
 *
 * A lista vem de `lib/foundational-pairs.mjs` porque o `check-foundationals.mjs`
 * verifica exatamente os mesmos pares — enumerar nos dois lugares é como o gate
 * passa a afirmar um sync que não checa.
 */
const PAIRS = foundationalPairs();
const overlays = brandOverlays();

for (const [src, dst] of PAIRS) {
  copyFileSync(src, dst);
  console.log("re-baked →", dst);
}

// Marca removida do DS deixa a cópia órfã no template, e o prompt do CLI segue
// oferecendo um tema que não existe mais. Copiar não resolve isso — só avisar.
const orfaos = orphanBakedOverlays();
if (orfaos.length) {
  console.log(
    `\n⚠ overlay(s) no template SEM fonte no DS: ${orfaos.join(", ")}. ` +
      `O prompt "Tema de cor?" do CLI ainda oferece esse(s) tema(s). Remova à mão se a marca saiu.`,
  );
}

console.log(
  `\n${PAIRS.length} foundational re-bakeados (${overlays.length} overlay(s) de marca). ` +
    `Lembre de bumpar cli/package.json e republicar o CLI.`,
);
