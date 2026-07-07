/**
 * copy-registry.mjs — gera app/registry-data.ts a partir do public/r do DS.
 * Embute os JSON num módulo (em vez de fs no runtime) pra funcionar igual no
 * Vercel (serverless não traça leitura dinâmica de arquivo fora do root dir).
 *
 * Pré-requisito: o DS já rodou `npx shadcn build` (gerou ../public/r/*.json).
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("..", "public", "r"); // cwd = registry-app/ → ../public/r do DS
const OUT = path.resolve("app", "registry-data.ts");

// Sem ../public/r (ex.: build no Vercel sem "include outside root") → mantém o
// registry-data.ts commitado. Só regenera quando o public/r do DS está presente.
if (!fs.existsSync(SRC)) {
  console.log("../public/r ausente — mantém app/registry-data.ts commitado.");
  process.exit(0);
}

const map = {};
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith(".json") || f === "registry.json") continue; // só os items
  map[f.replace(/\.json$/, "")] = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  "// AUTO-GERADO por scripts/copy-registry.mjs — não editar.\n" +
    "export const registry: Record<string, unknown> = " +
    JSON.stringify(map, null, 2) +
    ";\n",
);
console.log("registry-data.ts:", Object.keys(map).length, "items →", Object.keys(map).join(", "));
