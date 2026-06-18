#!/usr/bin/env node
/**
 * igreen-add.mjs — wrapper de `shadcn add @igreen/<nome>` que MANTÉM o manifesto.
 *
 * Uso: npm run igreen:add -- button form-field card
 *
 * Pra cada componente: roda o `shadcn add`, busca a rev (meta.stamp) + os arquivos
 * do item no registry, e grava no `.igreen-ds/manifest.json`:
 *   { items: { <nome>: { rev, hash, files: [...], addedAt } } }
 * O `hash` é dos arquivos COMO INSTALADOS (pós-transform do shadcn) — é a baseline
 * pro `igreen:drift` detectar edição local depois.
 *
 * Requer IGREEN_TOKEN (env ou .env.local). Use este wrapper no lugar de
 * `npx shadcn add @igreen/...` pra o manifesto não ficar desatualizado.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";

const REGISTRY = "https://igreen-registry.vercel.app/r";
const MANIFEST = ".igreen-ds/manifest.json";

const names = process.argv.slice(2).map((n) => n.replace(/^@igreen\//, ""));
if (!names.length) {
  console.error("uso: npm run igreen:add -- <componente> [<componente> ...]");
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
// target do registry → caminho local (alias @/components → src/components)
const localPath = (target) => (target.startsWith("src/") ? target : "src/" + target);

function loadManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch {
    return { schema: 1, items: {} };
  }
}
function hashFiles(targets) {
  const h = createHash("sha256");
  const present = [];
  for (const t of [...targets].sort()) {
    const p = localPath(t);
    if (existsSync(p)) {
      h.update(t + "\n" + norm(readFileSync(p, "utf8")));
      present.push(t);
    }
  }
  return { hash: h.digest("hex"), files: present };
}

const manifest = loadManifest();
const failed = [];

// Roda `npx shadcn add` cross-platform SEM shell:true (que dispara o DEP0190 e tem
// risco de injeção). No Windows o npx é `.cmd` e o spawn direto dá EINVAL, então
// vai via `cmd.exe /c`; no resto, chama o npx direto. Args fixos (sem interpolação
// de input não-confiável além do nome do componente, que é validado pelo registry).
function runShadcnAdd(name) {
  // --overwrite: sem ele, quando um item traz um arquivo já instalado por outro
  // (ex.: dropdown-menu compartilhado), o shadcn ABRE prompt interativo (y/N) e
  // TRAVA a automação. `--yes` só confirma "proceed", não o overwrite por-arquivo.
  // Em `add` (instalar), sobrescrever a dep compartilhada com a versão do registry é
  // o comportamento correto; edição local é protegida no `igreen:update`, não aqui.
  const a = ["shadcn@latest", "add", `@igreen/${name}`, "--yes", "--overwrite"];
  return process.platform === "win32"
    ? spawnSync("cmd.exe", ["/c", "npx", ...a], { stdio: "inherit" })
    : spawnSync("npx", a, { stdio: "inherit" });
}

for (const name of names) {
  console.log(`\n→ shadcn add @igreen/${name}`);
  const r = runShadcnAdd(name);
  if (r.status !== 0) {
    console.error(`✗ add @igreen/${name} falhou — não registrado no manifesto.`);
    failed.push(name);
    continue;
  }
  let item;
  try {
    const res = await fetch(`${REGISTRY}/${name}.json`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    item = await res.json();
  } catch (e) {
    console.error(`⚠ não consegui ler rev de @igreen/${name} (${e.message}) — instalado, mas fora do manifesto.`);
    failed.push(name);
    continue;
  }
  const targets = (item.files || []).map((f) => f.target);
  const { hash, files } = hashFiles(targets);
  manifest.items[name] = {
    rev: item.meta?.stamp ?? null,
    hash,
    files,
    addedAt: new Date().toISOString(),
  };
  console.log(`✓ ${name} registrado no manifesto (rev: ${item.meta?.stamp ?? "—"})`);
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`\n📋 ${MANIFEST} atualizado (${Object.keys(manifest.items).length} componentes).`);

// Falha parcial NÃO pode sair 0 (mascararia o erro em CI / no create). Sinaliza
// via exitCode (não process.exit() — evita o crash do libuv com fetch keep-alive pendente).
if (failed.length) {
  console.error(`\n✗ falharam: ${failed.join(", ")}`);
  process.exitCode = 1;
}
