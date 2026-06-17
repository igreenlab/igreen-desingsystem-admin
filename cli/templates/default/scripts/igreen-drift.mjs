#!/usr/bin/env node
/**
 * igreen-drift.mjs — checa drift dos componentes @igreen instalados (CI-friendly).
 *
 * Lê o `.igreen-ds/manifest.json` (gerado pelo `igreen:add`) e, pra cada componente:
 *   - EDIÇÃO LOCAL: re-hasheia os arquivos instalados e compara com o hash do
 *     manifesto (baseline do add). Diferente → editado fora do DS → FALHA (exit 1).
 *   - DEFASAGEM: busca a rev atual no registry e compara com a rev do manifesto.
 *     Diferente → há versão nova no DS → aviso (não falha).
 *
 * Roda em CI: `npm run igreen:drift`. Requer IGREEN_TOKEN só pra checar defasagem;
 * a checagem de edição local funciona offline.
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const REGISTRY = "https://igreen-registry.vercel.app/r";
const MANIFEST = ".igreen-ds/manifest.json";

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
} catch {
  console.error(`✗ ${MANIFEST} não encontrado. Use 'npm run igreen:add' pra instalar componentes (mantém o manifesto).`);
  process.exit(1);
}

function readToken() {
  if (process.env.IGREEN_TOKEN) return process.env.IGREEN_TOKEN.trim();
  try {
    const m = readFileSync(".env.local", "utf8").match(/^IGREEN_TOKEN=(.*)$/m);
    if (m) return m[1].trim().replace(/^"|"$/g, "");
  } catch {
    /* */
  }
  return null;
}
const token = readToken();
const norm = (s) => s.replace(/\r/g, "");
const localPath = (target) => (target.startsWith("src/") ? target : "src/" + target);

function hashFiles(targets) {
  const h = createHash("sha256");
  for (const t of [...targets].sort()) {
    const p = localPath(t);
    if (existsSync(p)) h.update(t + "\n" + norm(readFileSync(p, "utf8")));
  }
  return h.digest("hex");
}

const items = Object.entries(manifest.items || {});
if (!items.length) {
  console.log("manifesto vazio — nada pra checar.");
  process.exit(0);
}

let edited = 0;
let stale = 0;

for (const [name, rec] of items) {
  // 1. edição local (offline)
  const missing = (rec.files || []).filter((t) => !existsSync(localPath(t)));
  if (missing.length) {
    console.error(`✗ ${name}: arquivo(s) ausente(s) — ${missing.join(", ")}`);
    edited++;
    continue;
  }
  const current = hashFiles(rec.files || []);
  if (current !== rec.hash) {
    console.error(`✗ ${name}: EDITADO localmente (hash ≠ baseline do add). Reverta ou re-adicione: npm run igreen:add -- ${name}`);
    edited++;
    continue;
  }
  // 2. defasagem vs registry (precisa token)
  if (token) {
    try {
      const res = await fetch(`${REGISTRY}/${name}.json`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const live = (await res.json())?.meta?.stamp ?? null;
        if (live && rec.rev && live !== rec.rev) {
          console.warn(`⚠ ${name}: DEFASADO — manifesto ${rec.rev} · registry ${live}. Atualize: npm run igreen:add -- ${name}`);
          stale++;
        } else {
          console.log(`✓ ${name}: íntegro e atualizado`);
        }
      } else {
        console.log(`✓ ${name}: íntegro (defasagem não checada — HTTP ${res.status})`);
      }
    } catch {
      console.log(`✓ ${name}: íntegro (defasagem não checada — registry inacessível)`);
    }
  } else {
    console.log(`✓ ${name}: íntegro (defasagem não checada — sem IGREEN_TOKEN)`);
  }
}

console.log(`\n${items.length} componentes · ${edited} editado(s) · ${stale} defasado(s)`);
// process.exitCode (não process.exit) — chamar process.exit() com fetch keep-alive
// pendente crasha o libuv no Windows (assertion UV_HANDLE_CLOSING). Deixa o Node drenar.
process.exitCode = edited ? 1 : 0; // edição local falha CI; defasagem é só aviso
