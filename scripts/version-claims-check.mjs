#!/usr/bin/env node
/**
 * version-claims-check.mjs — a versão que a doc cita existe?
 *
 * Dois modos, e a diferença entre eles é o ponto do mecanismo:
 *
 *   node scripts/version-claims-check.mjs             # citação de versão inexistente → exit 1
 *   node scripts/version-claims-check.mjs --release   # o acima E `vNEXT` → exit 1
 *
 * O modo default é o que roda no `npm test` (via `version-claims.test.mjs`): numa feature PR o
 * número da próxima release é DESCONHECIDO, então documentar com `vNEXT` é o estado correto.
 * O `--release` entra no `release:check`, quando o bump já aconteceu e o número existe — aí o
 * placeholder é débito, e a release não sai com ele.
 *
 * Lógica em `scripts/lib/version-claims.mjs` (puro, com testes). Aqui é só I/O.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  RAIZES,
  RAIZES_PLACEHOLDER,
  versoesLancadas,
  checkVersionClaims,
  checkPlaceholders,
  formatar,
} from "./lib/version-claims.mjs";

const isRelease = process.argv.slice(2).includes("--release");

function arquivos(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) arquivos(p, out);
    else if (/\.(md|ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

const ler = (raizes) =>
  [...new Set(raizes.flatMap((r) => arquivos(r)))].map((arquivo) => ({
    arquivo,
    fonte: readFileSync(arquivo, "utf8"),
  }));

const fontes = ler(RAIZES);
const lancadas = versoesLancadas(readFileSync("src/preview/pages/updates-data.ts", "utf8"));
const claims = checkVersionClaims(fontes, lancadas);

// A varredura de placeholder é mais larga — inclui o showcase. Ver RAIZES_PLACEHOLDER.
const fontesPlaceholder = isRelease ? ler(RAIZES_PLACEHOLDER) : [];
const placeholders = isRelease ? checkPlaceholders(fontesPlaceholder).achados : [];

console.log(
  `version-claims: ${fontes.length} arquivos · ${claims.citacoesConferidas} citações · ` +
    `${lancadas.size} versões lançadas` +
    (isRelease ? ` · modo release (vNEXT em ${fontesPlaceholder.length} arquivos)` : ""),
);

const falhas = [...claims.achados, ...placeholders];
if (falhas.length === 0) {
  console.log("✔ nenhuma doc cita versão que não existe.");
  process.exit(0);
}

console.error(`\n✖ ${falhas.length} citação(ões) de versão inválida(s):\n`);
for (const m of formatar(falhas)) console.error(`  ${m}\n`);
process.exit(1);
