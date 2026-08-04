#!/usr/bin/env node
/**
 * brand-check.mjs — gate: toda marca do catálogo está nas 10 superfícies?
 *
 * Roda local e no CI. Não precisa de build nem de token.
 *
 *   node scripts/brand-check.mjs        (ou: npm run brand:check)
 *
 * Detalhe do porquê cada superfície importa: `lib/brand-surfaces.mjs`.
 */
import { checkBrandSurfaces, SUPERFICIES } from "./lib/brand-surfaces.mjs";

const { marcas, faltando } = checkBrandSurfaces();

console.log(`brand-check — ${marcas.length} marca(s) no catálogo × ${SUPERFICIES.length} superfície(s)`);
console.log(`  catálogo: ${marcas.join(", ")}\n`);

if (faltando.length) {
  const porMarca = new Map();
  for (const f of faltando) {
    if (!porMarca.has(f.marca)) porMarca.set(f.marca, []);
    porMarca.get(f.marca).push(f.superficie);
  }
  for (const [marca, ss] of porMarca) {
    console.error(`✗ ${marca}: ${ss.length} superfície(s) aberta(s)`);
    for (const s of ss) console.error(`     ${s}`);
  }
  console.error(
    `\n✗ ${faltando.length} superfície(s) aberta(s). Marca incompleta não quebra build nem tsc — ` +
      `só não chega em algum canal. Passo a passo: .claude/skills/brand-builder/generate.md`,
  );
  process.exit(1);
}

console.log(`✓ todas as ${marcas.length} marcas fechadas nas ${SUPERFICIES.length} superfícies.`);
