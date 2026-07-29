#!/usr/bin/env node
/**
 * lint-styles — anti-patterns de estilo do DS, em 2 modos.
 *
 *   --file <path>      varre o arquivo inteiro. Usado pelo hook local
 *                      (aviso informativo). SEMPRE exit 0 — EM QUALQUER
 *                      caminho do modo, incluindo path faltando/arquivo
 *                      inexistente. O hook nunca pode passar a bloquear
 *                      o edit do dev por causa deste modo.
 *   --ratchet [base]   varre SÓ as linhas adicionadas vs <base> (default
 *                      origin/main). Usado no CI. exit 1 se houver violação nova.
 *
 * Erro de uso do CLI (nenhuma flag reconhecida) é diferente: sai 2 no
 * dispatch de argv abaixo — isso é fronteira do CLI, não do modo --file.
 *
 * Patterns: scripts/lib/ds-lint-patterns.mjs (fonte única, compartilhada com o
 * hook — nunca duplique a tabela aqui).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { scanLines } from "./lib/ds-lint-patterns.mjs";
import { parseAddedLines } from "./lib/diff-added-lines.mjs";

// Escopo: só styles de componente. `src/examples/**` e `src/preview/**` ficam
// FORA de propósito — são cópias/demos, não a fonte do DS. Se um dia o gate
// precisar cobrir `src/examples/` (que vai pro consumidor, L-034), é decisão
// de escopo própria, não ajuste silencioso aqui.
const GLOB = "src/components/**/*styles.ts";

function report(violations, { blocking }) {
  for (const v of violations) {
    console.log(`\n  ${blocking ? "✗" : "•"} ${v.file}:${v.n}  [${v.id}]`);
    console.log(`      ${v.text.trim().slice(0, 110)}`);
    console.log(`      → ${v.msg}`);
  }
}

function modeFile(path) {
  if (!path) {
    console.error("--file exige um caminho");
    return 0; // modo hook NUNCA bloqueia — nem em erro de uso deste modo
  }
  if (!existsSync(path)) return 0; // hook pode disparar em arquivo já removido
  const lines = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((text, i) => ({ n: i + 1, text }));
  const violations = scanLines(lines).map((v) => ({ ...v, file: path }));
  if (violations.length) {
    console.log(
      `\n⚠️  ds-lint-styles — ${violations.length} violação(ões) anti-DS em ${path}:`,
    );
    report(violations, { blocking: false });
    console.log(
      "\n   Referência: .claude/rules/ds-standards.md (Anti-patterns) · tokens em .ai/context/tokens/\n",
    );
  }
  return 0; // modo hook NUNCA bloqueia
}

function modeRatchet(base) {
  let diff = "";
  try {
    // --merge-base: compara com o ponto de divergência, não com o tip da base.
    // Sem isso, commit que entrou na base depois do fork aparece como `+`
    // e reprova quem não mexeu naquilo.
    diff = execFileSync("git", ["diff", "-U0", "--merge-base", base, "--", GLOB], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    console.error(
      `\n⚠️  lint-styles: não consegui diffar contra "${base}".` +
        ` No CI, garanta fetch-depth: 0 no actions/checkout.\n`,
    );
    return 1;
  }

  const added = parseAddedLines(diff);
  const violations = [];
  let files = 0;
  let lines = 0;
  for (const [file, ls] of added) {
    if (!ls.length) continue;
    files++;
    lines += ls.length;
    violations.push(...scanLines(ls).map((v) => ({ ...v, file })));
  }

  if (!violations.length) {
    console.log(
      `\n✓ lint-styles (ratchet vs ${base}): ${files} arquivo(s), ${lines} linha(s) adicionada(s), 0 violação nova.\n`,
    );
    return 0;
  }

  console.log(
    `\n✗ lint-styles (ratchet vs ${base}): ${violations.length} violação(ões) em linha ADICIONADA por esta PR:`,
  );
  report(violations, { blocking: true });
  console.log(
    "\n  Só linhas adicionadas contam — débito pré-existente no arquivo não reprova.\n" +
      "  Nota: código MOVIDO conta como adicionado; se você só reposicionou uma linha\n" +
      "  que já violava, corrija-a agora.\n" +
      "  Referência: .claude/rules/ds-standards.md (Anti-patterns).\n",
  );
  return 1;
}

const argv = process.argv.slice(2);
const fileIdx = argv.indexOf("--file");
const ratchetIdx = argv.indexOf("--ratchet");
if (fileIdx !== -1) {
  process.exit(modeFile(argv[fileIdx + 1]));
} else if (ratchetIdx !== -1) {
  process.exit(modeRatchet(argv[ratchetIdx + 1] ?? "origin/main"));
} else {
  console.error("uso: lint-styles.mjs --file <path> | --ratchet [base-ref]");
  process.exit(2);
}
