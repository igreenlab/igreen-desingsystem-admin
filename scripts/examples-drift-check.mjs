#!/usr/bin/env node
/**
 * examples-drift-check.mjs — detecta defasagem entre os exemplos distribuíveis
 * (src/examples/*) e os showcases-fonte do preview (src/preview/pages/*).
 *
 * Os `src/examples/*` são EXTRAÇÕES 1:1 dos showcases (conteúdo da página, sem
 * AppShell). A extração é manual (strip de shell + inline de TableDoc → _table-data
 * + rewrite de imports), então NÃO há geração automática. Este check guarda um
 * hash da FONTE no momento da última sincronização; se o showcase mudar depois,
 * avisa que o exemplo precisa ser re-extraído — eliminando o risco de o exemplo
 * (que o consumidor baixa) atrasar silenciosamente vs o showcase.
 *
 * Uso:
 *   node scripts/examples-drift-check.mjs            # checa e avisa (exit 0)
 *   node scripts/examples-drift-check.mjs --baseline # regrava o lock (após re-sync)
 *   node scripts/examples-drift-check.mjs --ci       # exit 1 se houver drift (CI)
 */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

// exemplo → showcase-fonte (dir ou arquivo único)
const MAP = {
  finance: "src/preview/pages/ClientesFinanceiroShowcase",
  clientes: "src/preview/pages/ClientesShowcase",
  dashboard: "src/preview/pages/DashboardShowcase.tsx",
  "order-detail": "src/preview/pages/OrderDetailShowcase",
  "edit-page": "src/preview/pages/OrderEditShowcase",
  chat: "src/preview/pages/ChatV2",
};

const LOCK = "scripts/examples-sources.lock.json";
const args = process.argv.slice(2);
const isBaseline = args.includes("--baseline");
const isCi = args.includes("--ci");

function walk(p) {
  if (!existsSync(p)) return [];
  return statSync(p).isDirectory()
    ? readdirSync(p).flatMap((e) => walk(join(p, e)))
    : [p];
}
function hashSource(src) {
  const files = walk(src).sort();
  if (!files.length) return null;
  const h = createHash("sha256");
  for (const f of files) h.update(f.replace(/\\/g, "/") + "\n" + readFileSync(f, "utf8").replace(/\r/g, ""));
  return h.digest("hex");
}

const current = {};
for (const [ex, src] of Object.entries(MAP)) current[ex] = { source: src, hash: hashSource(src) };

if (isBaseline) {
  writeFileSync(LOCK, JSON.stringify(current, null, 2) + "\n", "utf8");
  console.log(`📌 baseline gravado em ${LOCK} (${Object.keys(current).length} exemplos).`);
  process.exit(0);
}

let lock = {};
try {
  lock = JSON.parse(readFileSync(LOCK, "utf8"));
} catch {
  console.log(`⚠ ${LOCK} ausente — rode: node scripts/examples-drift-check.mjs --baseline`);
  process.exit(0);
}

const drift = [];
const missing = [];
for (const [ex, { source, hash }] of Object.entries(current)) {
  if (hash === null) { missing.push({ ex, source }); continue; }
  if (!lock[ex]) { drift.push({ ex, source, why: "sem baseline" }); continue; }
  if (lock[ex].hash !== hash) drift.push({ ex, source, why: "fonte mudou" });
}

if (missing.length) for (const m of missing) console.log(`⚠ example-${m.ex}: fonte não encontrada (${m.source}).`);

if (!drift.length) {
  console.log(`✓ examples em sync com os showcases (${Object.keys(current).length} verificados).`);
  process.exit(0);
}

console.log("\n⚠ DRIFT examples ↔ showcase — exemplos possivelmente DEFASADOS:");
for (const d of drift) {
  console.log(`  • example-${d.ex} (${d.why}) — fonte: ${d.source}`);
}
console.log("\n  Os src/examples/* são extração 1:1 dos showcases. A fonte mudou desde a última");
console.log("  sincronização → re-extraia o exemplo afetado (ver src/examples/README.md) e rode");
console.log("  `node scripts/examples-drift-check.mjs --baseline` pra re-baselinar.\n");
process.exit(isCi ? 1 : 0);
