#!/usr/bin/env node
/**
 * check-foundationals.mjs — gate de sync CLI↔DS dos 4 foundationals "baked".
 *
 * O template do CLI (cli/templates/default/**) embute cópias dos foundationals do
 * DS (utils, tv, lucide-types, theme.css). Eles são gerados via `npm run cli:rebake`.
 * Se a fonte do DS mudar sem re-bake, o consumidor recebe um baked DEFASADO —
 * justamente o que a L-016/L-037 alertam.
 *
 * Este script compara fonte ↔ baked (normalizando CRLF→LF) e sai 1 se divergirem,
 * pra CI/release pegarem baked atrasado antes de distribuir.
 *
 * Uso:
 *   node scripts/check-foundationals.mjs   # ✓/✗ por par; exit 1 se algum difere
 */
import { readFileSync, existsSync } from "node:fs";

// fonte (DS) ↔ baked (template do CLI)
const PAIRS = [
  ["src/lib/utils.ts", "cli/templates/default/src/lib/utils.ts"],
  ["src/utils/tv.ts", "cli/templates/default/src/utils/tv.ts"],
  ["src/lib/lucide-types.ts", "cli/templates/default/src/lib/lucide-types.ts"],
  ["src/styles/theme/tailwind-theme.css", "cli/templates/default/src/styles/theme/tailwind-theme.css"],
];

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

if (diverged || missing) {
  console.log(
    `\n⚠ ${diverged + missing} foundational(s) fora de sync. ` +
      `Rode \`npm run cli:rebake\` pra re-bakar o template + bump do CLI.`,
  );
  process.exit(1);
}

console.log(`\n✓ ${PAIRS.length} foundationals em sync (DS ↔ CLI baked).`);
