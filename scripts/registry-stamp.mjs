/**
 * registry-stamp.mjs — injeta o carimbo do DS no registry.json (meta.stamp) e no
 * header de cada arquivo-fonte dos items.
 *
 * Carimbo: igreen-ds · <nome-do-item> · v<version> · <short-hash> · AAAA-MM-DD
 *   version   = package.json.version  (NAO usa tag — tags do repo estao furadas)
 *   short-hash = git rev-parse --short HEAD
 *   data      = data do build (UTC)
 *
 * ORDEM CRITICA: rode DEPOIS do bump da version (senao carimba a anterior).
 *   npm run registry:stamp   (e depois: npx shadcn build)
 *
 * Idempotente: substitui a linha de carimbo existente em vez de duplicar.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const MARK = "@igreen-stamp:";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;
const hash = execSync("git rev-parse --short HEAD").toString().trim();
const date = new Date().toISOString().slice(0, 10);

const stampFor = (name) => `igreen-ds · ${name} · v${version} · ${hash} · ${date}`;

function commentFor(path, text) {
  if (path.endsWith(".css")) return `/* ${MARK} ${text} */`;
  if (path.endsWith(".md")) return `<!-- ${MARK} ${text} -->`;
  return `// ${MARK} ${text}`; // .ts / .tsx / .js
}

function injectHeader(path, name) {
  if (!fs.existsSync(path)) return false;
  const src = fs.readFileSync(path, "utf8");
  const lines = src.split("\n");
  const idx = lines.findIndex((l) => l.includes(MARK)); // remove carimbo antigo
  if (idx !== -1) lines.splice(idx, 1);
  const out = commentFor(path, stampFor(name)) + "\n" + lines.join("\n");
  fs.writeFileSync(path, out);
  return true;
}

const reg = JSON.parse(fs.readFileSync("registry.json", "utf8"));
let files = 0;
for (const item of reg.items) {
  item.meta = { ...(item.meta || {}), stamp: stampFor(item.name) };
  for (const f of item.files || []) if (injectHeader(f.path, item.name)) files++;
}
fs.writeFileSync("registry.json", JSON.stringify(reg, null, 2) + "\n");

console.log(`carimbo v${version} · ${hash} · ${date} aplicado em ${reg.items.length} items / ${files} arquivos`);
