#!/usr/bin/env node
/**
 * doc-index — CLI. Sem flag, VERIFICA (exit 1 se algum índice está defasado).
 * Com `--write`, regenera.
 *
 * Lógica pura + lista de arquivos: scripts/lib/doc-index.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { INDEXADOS, aplicarIndice } from "./lib/doc-index.mjs";

const escrever = process.argv.includes("--write");
let defasados = 0;

for (const { arquivo, nivel } of INDEXADOS) {
  const original = readFileSync(arquivo, "utf8");
  // Preserva o EOL do arquivo — o repo é CRLF e misturar corrompe o diff inteiro.
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const { texto, mudou } = aplicarIndice(original, nivel, eol);

  if (!mudou) {
    console.log(`  ✓ ${arquivo}`);
    continue;
  }
  if (escrever) {
    writeFileSync(arquivo, texto);
    console.log(`  ↻ ${arquivo} — índice regenerado`);
  } else {
    defasados++;
    console.log(`  ✗ ${arquivo} — índice defasado dos headings`);
  }
}

if (defasados) {
  console.log(`\n✗ doc-index: ${defasados} arquivo(s) com índice defasado.`);
  console.log("   → node scripts/doc-index.mjs --write\n");
  process.exit(1);
}
console.log(`\n✓ doc-index: ${INDEXADOS.length} índice(s) em sync com os headings.\n`);
