#!/usr/bin/env node
/**
 * registry-check.mjs — valida a consistência do registry SEM precisar buildar
 * (não requer IGREEN_TOKEN). Roda local e no CI.
 *
 * Checa:
 *   1. Todo files[].path de cada item do registry.json existe no disco.
 *   2. O embed (registry-app/app/registry-data.ts) contém todos os itens do registry.json.
 *
 * Exit 1 se houver qualquer inconsistência (falha o CI); 0 se tudo ok.
 */
import { readFileSync, existsSync } from "node:fs";

let fail = 0;
const r = JSON.parse(readFileSync("registry.json", "utf8"));

// 1. paths existem
let missing = 0;
for (const it of r.items) {
  for (const f of it.files || []) {
    if (!existsSync(f.path)) {
      console.error(`✗ ${it.name}: arquivo ausente → ${f.path}`);
      missing++;
    }
  }
}
if (missing) { console.error(`✗ ${missing} path(s) de registry.json não existem no disco.`); fail = 1; }
else console.log(`✓ registry.json: ${r.items.length} itens, todos os files[].path existem.`);

// 2. embed em sync
const EMBED = "registry-app/app/registry-data.ts";
if (existsSync(EMBED)) {
  const t = readFileSync(EMBED, "utf8");
  const absent = r.items.map((i) => i.name).filter((n) => !t.includes(`"${n}"`));
  if (absent.length) { console.error(`✗ embed (${EMBED}) não contém: ${absent.join(", ")} — rode copy-registry.mjs.`); fail = 1; }
  else console.log(`✓ embed em sync (${r.items.length} itens).`);
} else {
  console.error(`✗ embed ausente: ${EMBED}`); fail = 1;
}

process.exit(fail);
