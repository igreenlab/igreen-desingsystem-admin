/**
 * lessons-index.mjs — o resumo auto-carregado cobre TODAS as lições?
 *
 * ## O furo que isto fecha
 *
 * As lições vivem em dois lugares com papéis diferentes:
 *
 *   .ai/status/lessons.md          formato completo — SOB DEMANDA (o agente só lê se abrir)
 *   .ai/status/lessons-archive.md  as absorvidas em gate automático — idem
 *   .claude/rules/ds-standards.md  resumo 1-linha — PROJECT INSTRUCTION, sempre em contexto
 *
 * O resumo é o único que chega à sessão sem ação do agente. Ele se apresenta como
 * *"o atalho 1-linha de TODAS, ativas e arquivadas"* — e em 2026-08-08 **6 lições
 * não estavam lá**: L-044, L-045, L-046, L-048, L-049 e L-050.
 *
 * A mais grave a ter ficado invisível foi a **L-044** — "hooks bash dependem de jq e
 * de path forward-slash; no Windows ficam CEGOS" — num repo que roda em Windows. Se
 * ela vale, metade da tabela de hooks do `CLAUDE.md` é ficção nesta máquina, e o
 * agente não tinha como saber.
 *
 * É a L-060 na forma canônica: uma frase que **afirma garantia** ("TODAS") sem que
 * nada verificasse a garantia. Aqui ela passa a ser verificável.
 *
 * ## Por que gate mecânico serve neste caso (L-059)
 *
 * A regra é independente de contexto: ou o id `L-NNN` aparece no resumo, ou não
 * aparece. Não exige julgamento sobre a QUALIDADE do resumo — só sobre existência.
 */
import { readFileSync, existsSync } from "node:fs";

const FONTES = [".ai/status/lessons.md", ".ai/status/lessons-archive.md"];
const RESUMO = ".claude/rules/ds-standards.md";

/**
 * Ids de lição declarados num arquivo-fonte, pelos headers `## [L-NNN] ...`.
 * O template (`## [L-NNN] Título curto`) é ignorado — `NNN` não é dígito.
 */
export function lessonIds(texto) {
  return [...String(texto ?? "").matchAll(/^##\s*\[(L-\d{3})\]/gm)].map((m) => m[1]);
}

/** Ids citados em qualquer lugar de um texto (o resumo cita como `**L-042**`, `(L-058)`…). */
export function citedIds(texto) {
  return new Set([...String(texto ?? "").matchAll(/\bL-(\d{3})\b/g)].map((m) => `L-${m[1]}`));
}

/**
 * @returns {{ ausentes:string[], duplicadas:string[], total:number, ativas:number, arquivadas:number }}
 *   `ausentes` = lição que existe na fonte e NÃO é citada no resumo auto-carregado.
 *   `duplicadas` = mesmo id declarado 2× nas fontes (numeração colidiu).
 */
export function checkLessonsIndex({ fontes = FONTES, resumo = RESUMO } = {}) {
  const porArquivo = fontes.map((f) => (existsSync(f) ? lessonIds(readFileSync(f, "utf8")) : []));
  const todas = porArquivo.flat();

  const vistos = new Set();
  const duplicadas = [];
  for (const id of todas) {
    if (vistos.has(id)) duplicadas.push(id);
    vistos.add(id);
  }

  const citadas = citedIds(existsSync(resumo) ? readFileSync(resumo, "utf8") : "");
  const ausentes = [...vistos].filter((id) => !citadas.has(id)).sort();

  return {
    ausentes,
    duplicadas,
    total: vistos.size,
    ativas: porArquivo[0]?.length ?? 0,
    arquivadas: porArquivo[1]?.length ?? 0,
  };
}

export { FONTES, RESUMO };
