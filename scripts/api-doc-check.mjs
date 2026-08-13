#!/usr/bin/env node
/**
 * api-doc-check.mjs — avisa quando uma PR AMPLIA a API de um componente existente e
 * não toca o `USAGE.md` dele.
 *
 * Fecha o ponto cego do `showcase-check`, que por design só olha componente **novo**:
 * mudança em componente existente não dispara nada, e é o cenário mais provável de um
 * contribuidor de fora. Caso real: a PR #60 adicionou `mode` ao DatePicker e ficou 11
 * dias sem doc, com o showcase ensinando o padrão que a prop tornou obsoleto.
 *
 * **INFORMATIVO de propósito** — sempre sai 0. O proxy ("o diff adicionou uma linha
 * `export`") é mecânico e de baixo ruído, mas não é perfeito: exportar um helper num
 * refactor é falso-positivo legítimo. Aviso que atrapalha vira aviso ignorado (L-059).
 *
 * Uso: node scripts/api-doc-check.mjs [baseRef]
 *   Sem baseRef, resolve o remote CANÔNICO por URL (`scripts/lib/canonical-base-ref.mjs`) —
 *   `origin` neste repo é o fork parado, e o default fixo diffava contra uma foto antiga.
 *
 * Lógica pura + testes: `scripts/lib/api-doc-surface.mjs`.
 */
import { execFileSync } from "node:child_process";
import { parseAddedLines } from "./lib/diff-added-lines.mjs";
import { checkApiDocs } from "./lib/api-doc-surface.mjs";
import { newComponentFolders } from "./lib/new-component-folders.mjs";
import { resolveBaseRefFromGit } from "./lib/canonical-base-ref.mjs";

const baseRef = process.argv[2] ?? resolveBaseRefFromGit().ref;
const IN_GHA = !!process.env.GITHUB_ACTIONS;
const esc = (s) => String(s).replace(/\r?\n/g, "%0A");
const annotate = (level, title, message) => {
  if (IN_GHA) console.log(`::${level} title=${esc(title)}::${esc(message)}`);
};

const git = (args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

let addedByFile, changedFiles, novos;
try {
  const mergeBase = git(["merge-base", baseRef, "HEAD"]).trim();

  // -U0: só as linhas adicionadas, sem contexto — mesmo insumo do ratchet de estilos.
  addedByFile = parseAddedLines(git(["diff", "-U0", `${baseRef}...HEAD`]));

  changedFiles = git(["diff", "--name-only", `${baseRef}...HEAD`])
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Componente novo é caso do showcase-check; sem isto os dois avisariam pelo mesmo
  // motivo. Reusa exatamente o predicado dele (merge-base, não tip da base).
  const existsAtBase = (nome) => {
    try {
      git(["cat-file", "-e", `${mergeBase}:src/components/ui/${nome}`]);
      return true;
    } catch {
      return false;
    }
  };
  novos = new Set(
    newComponentFolders(
      git([
        "diff",
        "--name-status",
        "--no-renames",
        "--diff-filter=A",
        `${mergeBase}`,
        "HEAD",
        "--",
        "src/components/ui",
      ]),
      existsAtBase,
    ),
  );
} catch (e) {
  // Informativo: git indisponível não vira ruído nem falha. O ratchet e o
  // showcase-check, que são bloqueantes, já falham alto se o git estiver quebrado.
  console.log(`api-doc-check: pulado (${String(e.message).split("\n")[0]})`);
  process.exit(0);
}

const findings = checkApiDocs({
  addedByFile,
  changedFiles,
  isNewComponent: (n) => novos.has(n),
});

if (!findings.length) {
  console.log("✓ api-doc-check: nenhum componente ampliou API sem tocar o USAGE.");
  process.exit(0);
}

for (const f of findings) {
  const amostra = f.exports.slice(0, 3).join(" · ");
  const msg =
    `${f.name}: a PR adiciona export(s) mas não toca ${f.doc}. ` +
    `Se a API pública mudou, documente junto — o showcase e o USAGE são as superfícies ` +
    `2 e 4 da L-042, e mudança em componente EXISTENTE não é coberta pelo showcase-check. ` +
    `Exports adicionados: ${amostra}${f.exports.length > 3 ? ` (+${f.exports.length - 3})` : ""}. ` +
    `Se for helper interno de refactor, ignore este aviso.`;
  console.log(`⚠ ${msg}`);
  annotate("warning", `api-doc-check: ${f.name}`, msg);
}
process.exit(0);
