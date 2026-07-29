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
 * Componentes que de propósito NÃO vão pro registry/catálogo estão em scripts/lib/ds-exceptions.mjs.
 *
 * Uso:
 *   node scripts/distribution-debt.mjs        # tabela + exit 0 (advisory)
 *   node scripts/distribution-debt.mjs --ci   # exit 1 se houver débito (CI)
 *
 * Por que a forma SEM --ci roda no ci.yml (e não a bloqueante): a Regra 8
 * (`.claude/rules/ds-standards.md:26`) manda distribuição consolidar no
 * `/ds-release`, não por-PR-de-componente. Bloquear na PR reprovaria o próximo
 * PR de componente por seguir a regra do projeto. A forma bloqueante vive no
 * `release:check`.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { isException } from "./lib/ds-exceptions.mjs";

const isCi = process.argv.includes("--ci");
const UI = "src/components/ui";
const CATALOG = "cli/templates/default/CLAUDE.md";

// No GitHub Actions, um step que sempre sai 0 tem o log COLAPSADO — ninguém
// abre. Emitir workflow commands faz o débito aparecer na lista de anotações
// da run, visível sem clicar em nada. É o que torna o modo "informativo"
// realmente informativo.
const IN_GHA = process.env.GITHUB_ACTIONS === "true";
const esc = (s) =>
  String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

/** @param {"warning"|"notice"} level */
function annotate(level, title, message) {
  if (!IN_GHA) return;
  console.log(`::${level} title=${esc(title)}::${esc(message)}`);
}

// PascalCase/dir → kebab (DataList → data-list, DatePicker → date-picker).
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const regNames = new Set((registry.items ?? []).map((i) => i.name));
const catalog = existsSync(CATALOG) ? readFileSync(CATALOG, "utf8") : "";

const comps = readdirSync(UI, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((d) => !isException(kebab(d)))
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

  const falta = [!r.inReg && "registry.json", !r.inCat && `catálogo do CLI`]
    .filter(Boolean)
    .join(" + ");
  annotate(
    // Sem --ci é advisory (warning). Com --ci o step reprova, então error.
    isCi ? "warning" : "notice",
    `Débito de distribuição: ${r.dir}`,
    `${r.dir} (${r.name}) falta em: ${falta}. Não bloqueia esta PR — ` +
      `distribuição consolida no /ds-release (Regra 8). Anote no corpo da PR ` +
      `que falta registrar.`,
  );
}
console.log(
  `\n  ${debt.length} com débito. Adicione ao registry (node scripts/registry-add-item.mjs <Nome>` +
    ` → registry:build) e/ou ao catálogo (${CATALOG}). Se for intencional, inclua em scripts/lib/ds-exceptions.mjs (com o motivo).\n`,
);
process.exit(isCi ? 1 : 0);
