#!/usr/bin/env node
/**
 * igreen-update.mjs — atualiza componentes @igreen instalados, COM SEGURANÇA.
 *
 * Uso:
 *   npm run igreen:update -- button card     # atualiza esses
 *   npm run igreen:update -- --all           # atualiza todos os defasados
 *   npm run igreen:update -- --all --force   # inclui os editados localmente (sobrescreve)
 *
 * Pra cada alvo (lido do .igreen-ds/manifest.json):
 *   1. EDITADO localmente? (hash atual ≠ baseline do manifesto) → PULA e avisa
 *      (atualizar sobrescreveria tua edição). Use --force pra incluir mesmo assim.
 *   2. DEFASADO? (rev do registry ≠ rev do manifesto) → roda `shadcn add --overwrite`
 *      e re-baseline (rev + hash) no manifesto.
 *   3. Já atualizado → não faz nada.
 *
 * 💡 Commite antes de atualizar — se algo quebrar, `git restore` volta a versão antiga.
 * Requer IGREEN_TOKEN (env ou .env.local).
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const REGISTRY = "https://igreen-registry.vercel.app/r";
const MANIFEST = ".igreen-ds/manifest.json";

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const all = argv.includes("--all");
const names = argv.filter((a) => !a.startsWith("--")).map((n) => n.replace(/^@igreen\//, ""));

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
} catch {
  console.error(`✗ ${MANIFEST} não encontrado. Instale componentes com 'npm run igreen:add' primeiro.`);
  process.exit(1);
}

const targets = all ? Object.keys(manifest.items || {}) : names;
if (!targets.length) {
  console.error("uso: npm run igreen:update -- <componente...>  |  --all  [--force]");
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
if (!token) {
  console.error("✗ IGREEN_TOKEN ausente (env ou .env.local).");
  process.exit(1);
}

const norm = (s) => s.replace(/\r/g, "");
const localPath = (t) => (t.startsWith("src/") ? t : "src/" + t);
const hashFiles = (files) => {
  const h = createHash("sha256");
  for (const t of [...files].sort()) {
    const p = localPath(t);
    if (existsSync(p)) h.update(t + "\n" + norm(readFileSync(p, "utf8")));
  }
  return h.digest("hex");
};

function shadcnOverwrite(name) {
  const a = ["shadcn@latest", "add", `@igreen/${name}`, "--yes", "--overwrite"];
  return process.platform === "win32"
    ? spawnSync("cmd.exe", ["/c", "npx", ...a], { stdio: "inherit" })
    : spawnSync("npx", a, { stdio: "inherit" });
}

let updated = 0;
let skippedEdited = 0;
let upToDate = 0;

for (const name of targets) {
  const rec = manifest.items?.[name];
  if (!rec) {
    console.error(`⚠ ${name}: não está no manifesto (não instalado via igreen:add) — pulado.`);
    continue;
  }
  // 1. editado localmente?
  const localHash = hashFiles(rec.files || []);
  const edited = localHash !== rec.hash;
  if (edited && !force) {
    console.warn(`✗ ${name}: EDITADO localmente — pulado (atualizar sobrescreveria). Commite/descarte, ou use --force.`);
    skippedEdited++;
    continue;
  }
  // 2. defasado?
  let liveRev = null;
  try {
    const res = await fetch(`${REGISTRY}/${name}.json`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) liveRev = (await res.json())?.meta?.stamp ?? null;
  } catch {
    /* sem rede → trata como defasado pra forçar tentativa abaixo? não: avisa */
  }
  if (liveRev && liveRev === rec.rev && !force) {
    console.log(`✓ ${name}: já atualizado (${rec.rev})`);
    upToDate++;
    continue;
  }
  // 3. atualiza
  console.log(`\n→ atualizando ${name}${edited ? " (--force: sobrescreve edição local)" : ""}…`);
  const r = shadcnOverwrite(name);
  if (r.status !== 0) {
    console.error(`✗ ${name}: shadcn add --overwrite falhou.`);
    continue;
  }
  // re-baseline no manifesto
  rec.hash = hashFiles(rec.files || []);
  rec.rev = liveRev ?? rec.rev;
  rec.updatedAt = new Date().toISOString();
  updated++;
  console.log(`✓ ${name}: atualizado → ${rec.rev}`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`\n${updated} atualizado(s) · ${upToDate} já em dia · ${skippedEdited} pulado(s) por edição local`);
if (skippedEdited) console.log("  (edição local protegida — commite/descarte e rode de novo, ou use --force)");
