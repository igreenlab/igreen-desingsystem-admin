#!/usr/bin/env node
/**
 * check-foundationals.mjs — gate de sync CLI↔DS dos foundationals "baked".
 *
 * O template do CLI (cli/templates/default/**) embute cópias dos foundationals do
 * DS (utils, tv, lucide-types, theme.css) + um overlay por marca. Eles são gerados
 * via `npm run cli:rebake`. Se a fonte do DS mudar sem re-bake, o consumidor recebe
 * um baked DEFASADO — justamente o que a L-016/L-037 alertam.
 *
 * Este script compara fonte ↔ baked (normalizando CRLF→LF) e sai 1 se divergirem,
 * pra CI/release pegarem baked atrasado antes de distribuir.
 *
 * A lista de pares vem de `lib/foundational-pairs.mjs`, o MESMO módulo que o
 * `cli-rebake-foundationals.mjs` usa pra copiar. Enquanto cada lado enumerava a sua,
 * este gate dizia "4 foundationals em sync" enquanto o rebake copiava 8 — afirmação
 * de garantia que não cobria o que estava sendo distribuído (L-060).
 *
 * Uso:
 *   node scripts/check-foundationals.mjs   # ✓/✗ por par; exit 1 se algum difere
 */
import { readFileSync, existsSync } from "node:fs";
import { foundationalPairs, orphanBakedOverlays } from "./lib/foundational-pairs.mjs";

// fonte (DS) ↔ baked (template do CLI) — fixos + overlays de marca descobertos
const PAIRS = foundationalPairs();

const norm = (p) => readFileSync(p, "utf8").replace(/\r/g, "");

let diverged = 0;
let missing = 0;
for (const [source, baked] of PAIRS) {
  if (!existsSync(source) || !existsSync(baked)) {
    console.log(`✗ ${source} ↔ ${baked} — arquivo ausente`);
    missing++;
    continue;
  }
  if (norm(source) === norm(baked)) {
    console.log(`✓ ${source}`);
  } else {
    console.log(`✗ ${source} ↔ ${baked} — DEFASADO (conteúdo difere)`);
    diverged++;
  }
}

// Overlay no baked sem fonte no DS: `cli:rebake` não remove (só copia), então o
// prompt "Tema de cor?" seguiria oferecendo um tema que o DS não tem mais. Não
// reprova — remover é decisão de quem tirou a marca —, mas não pode passar calado.
const orfaos = orphanBakedOverlays();
if (orfaos.length) {
  console.log(
    `\n⚠ overlay(s) no template SEM fonte no DS: ${orfaos.join(", ")} — ` +
      `o prompt do CLI ainda os oferece. Remova à mão se a marca saiu do DS.`,
  );
}

if (diverged || missing) {
  console.log(
    `\n⚠ ${diverged + missing} foundational(s) fora de sync. ` +
      `Rode \`npm run cli:rebake\` pra re-bakar o template + bump do CLI.`,
  );
  process.exit(1);
}

console.log(`\n✓ ${PAIRS.length} foundationals em sync (DS ↔ CLI baked).`);
