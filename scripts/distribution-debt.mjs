#!/usr/bin/env node
/**
 * distribution-debt.mjs — visão GERAL pré-release do que ainda não está
 * distribuído. Varre src/components/ui/* e reporta quais componentes faltam
 * em registry.json e/ou no catálogo do CLI (cli/templates/default/CLAUDE.md).
 *
 * Complementa o hook `ds-inventory-check` (que alerta POR componente no Edit)
 * com uma sweep única — pega "débito acumulado" antes do /ds-release. Foi escrito
 * porque o DataList ficou fora do registry por uma sessão inteira sem ninguém ver.
 *
 * Componentes que de propósito NÃO vão pro registry/catálogo entram no IGNORE.
 *
 * Uso:
 *   node scripts/distribution-debt.mjs        # tabela + exit 0 (advisory)
 *   node scripts/distribution-debt.mjs --ci   # exit 1 se houver débito (CI)
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";

const isCi = process.argv.includes("--ci");
const UI = "src/components/ui";
const CATALOG = "cli/templates/default/CLAUDE.md";

// PascalCase/dir → kebab (DataList → data-list, DatePicker → date-picker).
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// Componentes ui/ que NÃO são distribuídos como item standalone do registry
// (internos/dev ou bundlados em outro item). Ajuste conforme a política evoluir.
//   - tabela-teste: página de teste interna (não é componente distribuível).
//   - table-toolbar: bundlado no item `data-table` (acoplamento circular), não tem
//     item próprio no registry — chega no consumidor via `igreen:add data-table`.
const IGNORE = new Set([
  "tabela-teste",
  "table-toolbar",
  // Internos do example-chat — distribuídos junto do exemplo, não como itens avulsos.
  "conversation-list-item",
  "date-separator-chip",
  "message-ack",
  "message-bubble",
  "message-composer",
  "message-variables-picker",
]);

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const regNames = new Set((registry.items ?? []).map((i) => i.name));
const catalog = existsSync(CATALOG) ? readFileSync(CATALOG, "utf8") : "";

const comps = readdirSync(UI, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((d) => !IGNORE.has(kebab(d)))
  .sort();

const rows = comps.map((dir) => {
  const name = kebab(dir);
  return {
    dir,
    name,
    inReg: regNames.has(name),
    inCat: new RegExp(`(^|[^a-z0-9-])${name}([^a-z0-9-]|$)`).test(catalog),
  };
});

const debt = rows.filter((r) => !r.inReg || !r.inCat);

console.log(`\nDébito de distribuição — ${comps.length} componentes em ${UI}/`);
if (!debt.length) {
  console.log("  ✓ todos no registry.json e no catálogo do CLI.\n");
  process.exit(0);
}
console.log("");
for (const r of debt) {
  const reg = r.inReg ? "registry ✓" : "registry ✗ FALTA";
  const cat = r.inCat ? "catálogo ✓" : "catálogo ✗ FALTA";
  console.log(`  • ${r.dir.padEnd(18)} (${r.name}) — ${reg} · ${cat}`);
}
console.log(
  `\n  ${debt.length} com débito. Adicione ao registry (node scripts/registry-add-item.mjs <Nome>` +
    ` → registry:build) e/ou ao catálogo (${CATALOG}). Se for intencional, inclua no IGNORE deste script.\n`,
);
process.exit(isCi ? 1 : 0);
