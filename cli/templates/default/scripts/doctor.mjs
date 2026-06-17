#!/usr/bin/env node
/**
 * doctor.mjs — valida a integridade do cn (src/lib/utils.ts) e tv (src/utils/tv.ts)
 * CONTRA O REGISTRY (não contra um hash congelado). Eles configuram
 * tailwind-merge/tailwind-variants pros prefixos DS (pad/sp/gp/radius/sh/form) +
 * presets tipográficos (L-016). Se forem editados localmente OU ficarem defasados
 * em relação ao DS, a resolução de classe quebra EM SILÊNCIO.
 *
 * Detecta os dois drifts:
 *   - edição local  → hash local ≠ conteúdo do registry
 *   - DS atualizou  → hash local (cópia antiga) ≠ conteúdo novo do registry
 * Resync em qualquer caso: `npx shadcn@latest add @igreen/utils @igreen/tv --overwrite`
 *
 * Requer IGREEN_TOKEN (env ou .env.local). Sem token/sem rede → NÃO dá falso-OK:
 * sai 1 avisando que não foi possível verificar.
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const REGISTRY = "https://igreen-registry.vercel.app/r";
const CHECKS = [
  { local: "src/lib/utils.ts", item: "utils" },
  { local: "src/utils/tv.ts", item: "tv" },
];

const norm = (s) => s.replace(/\r/g, ""); // CRLF/LF agnóstico
const hash = (s) => createHash("sha256").update(norm(s)).digest("hex");

function readToken() {
  if (process.env.IGREEN_TOKEN) return process.env.IGREEN_TOKEN.trim();
  try {
    const m = readFileSync(".env.local", "utf8").match(/^IGREEN_TOKEN=(.*)$/m);
    if (m) return m[1].trim().replace(/^"|"$/g, "");
  } catch {
    /* sem .env.local */
  }
  return null;
}

const token = readToken();
if (!token) {
  console.error("⚠ IGREEN_TOKEN ausente (env ou .env.local) — doctor não consegue validar contra o registry.");
  console.error("  Defina o token e rode de novo: npm run doctor");
  process.exit(1);
}

let ok = true;
for (const { local, item } of CHECKS) {
  if (!existsSync(local)) {
    console.error(`✗ ${local} AUSENTE — npx shadcn@latest add @igreen/${item} --overwrite`);
    ok = false;
    continue;
  }
  const localHash = hash(readFileSync(local, "utf8"));
  try {
    const res = await fetch(`${REGISTRY}/${item}.json`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      console.error("✗ IGREEN_TOKEN inválido — não foi possível verificar contra o registry.");
      ok = false;
      break;
    }
    if (!res.ok) {
      console.error(`⚠ ${item}.json: registry respondeu HTTP ${res.status} — não verificado.`);
      ok = false;
      continue;
    }
    const json = await res.json();
    const remote = json?.files?.[0]?.content ?? "";
    if (hash(remote) === localHash) {
      console.log(`✓ ${local} == @igreen/${item} (registry)`);
    } else {
      console.error(`✗ ${local} DIVERGE de @igreen/${item} no registry (editado localmente OU o DS atualizou).`);
      console.error(`  Resync: npx shadcn@latest add @igreen/${item} --overwrite`);
      ok = false;
    }
  } catch (e) {
    console.error(`⚠ não foi possível alcançar o registry (${e.message}) — verificação de ${item} pulada.`);
    ok = false;
  }
}

// process.exitCode (não process.exit) — process.exit() com fetch keep-alive pendente
// crasha o libuv no Windows (assertion UV_HANDLE_CLOSING). Deixa o Node drenar.
process.exitCode = ok ? 0 : 1;
