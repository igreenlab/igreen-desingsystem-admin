/**
 * diff-added-lines — parser puro de saída de `git diff -U0`.
 *
 * Existe pro ratchet: permite rodar checks SÓ no que a PR adicionou, deixando
 * débito pré-existente congelado (sem ele, 35% dos *.styles.ts do repo
 * reprovariam qualquer PR que os tocasse — ver spec §1.1).
 *
 * Agnóstico de DS — qualquer check futuro que precise de "só o que mudou" pode
 * reusar (o de staleness de token da Fase 2b vai precisar).
 */

/**
 * @param {string} diffText saída de `git diff -U0 --merge-base <base> -- <paths>`
 * @returns {Map<string, Array<{n: number, text: string}>>} arquivo → linhas adicionadas
 */
export function parseAddedLines(diffText) {
  const out = new Map();
  let file = null;
  let lineNo = 0;

  for (const line of diffText.split(/\r?\n/)) {
    // Header do arquivo novo. Precisa vir ANTES do teste de `+`, senão
    // `+++ b/foo` é lido como conteúdo adicionado.
    if (line.startsWith("+++ ")) {
      const path = line.slice(4).trim();
      file = path === "/dev/null" ? null : path.replace(/^b\//, "");
      if (file && !out.has(file)) out.set(file, []);
      continue;
    }

    // @@ -oldStart[,oldCount] +newStart[,newCount] @@ [contexto de função]
    // Regex não ancorada no fim: o git costuma anexar o contexto após o @@.
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      lineNo = parseInt(hunk[1], 10);
      continue;
    }

    if (file && line.startsWith("+")) {
      out.get(file).push({ n: lineNo, text: line.slice(1) });
      lineNo++;
    }
    // Linhas `-` não avançam lineNo (a numeração é do arquivo NOVO).
  }

  return out;
}
