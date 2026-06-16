/**
 * registry-stamp.mjs — carimba o registry.json (meta.stamp de cada item).
 *
 * Carimbo: igreen-ds · <nome-do-item> · v<version> · <short-hash> · AAAA-MM-DD
 *   version    = package.json.version  (NAO usa tag — tags do repo estao furadas)
 *   short-hash = git rev-parse --short HEAD
 *   data       = data do build (UTC)
 *
 * O carimbo vive SO no meta.stamp do JSON (+ no manifesto). NAO injeta header nos
 * arquivos-fonte — decisao de 2026-06-16:
 *   - evita churn falso (arquivo "muda" a cada build so pela data/hash → re-prompt
 *     de overwrite a toa entre versoes no consumidor);
 *   - drift check fica robusto: o hash de referencia e do CODIGO PURO, sem ruido
 *     do carimbo → o doctor acusa so edicao real de cn/tv (salvaguarda L-016);
 *   - consistencia: registry:ui ja perdem o header no transform do shadcn, entao
 *     todos os items passam a ter a rev so no meta.stamp + manifesto.
 *
 * Por seguranca, este script tambem REMOVE qualquer header @igreen-stamp residual
 * dos arquivos dos items (limpeza idempotente de versoes anteriores do pipeline).
 *
 * ORDEM CRITICA: rode DEPOIS do bump da version (senao carimba a anterior).
 *   npm run registry:stamp   (e depois: npx shadcn build)
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const MARK = "@igreen-stamp:";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;
const hash = execSync("git rev-parse --short HEAD").toString().trim();
const date = new Date().toISOString().slice(0, 10);

const stampFor = (name) => `igreen-ds · ${name} · v${version} · ${hash} · ${date}`;

// Remove um header @igreen-stamp residual (1a linha) — limpeza de builds antigos.
function stripHeader(path) {
  if (!fs.existsSync(path)) return false;
  const src = fs.readFileSync(path, "utf8");
  const lines = src.split("\n");
  const idx = lines.findIndex((l) => l.includes(MARK));
  if (idx === -1) return false;
  lines.splice(idx, 1);
  fs.writeFileSync(path, lines.join("\n"));
  return true;
}

const reg = JSON.parse(fs.readFileSync("registry.json", "utf8"));
let stripped = 0;
for (const item of reg.items) {
  item.meta = { ...(item.meta || {}), stamp: stampFor(item.name) };
  for (const f of item.files || []) if (stripHeader(f.path)) stripped++;
}
fs.writeFileSync("registry.json", JSON.stringify(reg, null, 2) + "\n");

console.log(
  `carimbo v${version} · ${hash} · ${date} → meta.stamp de ${reg.items.length} items` +
    (stripped ? ` · ${stripped} header(s) residual(is) removido(s)` : ""),
);
