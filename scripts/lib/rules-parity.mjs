/**
 * rules-parity.mjs — as duas listas de regras dizem a MESMA coisa?
 *
 * ## O furo que isto fecha
 *
 * As regras de comportamento existem em dois arquivos, e os **dois são project
 * instruction** (entram na sessão sem ação do agente):
 *
 *   CLAUDE.md                      `### Regra N — <título>`
 *   .claude/rules/ds-standards.md  `N. **<título>** — …`
 *
 * Até 2026-08-08 elas divergiam de três formas ao mesmo tempo:
 *
 *   1. **Contagem** — `CLAUDE.md` tinha 7, `ds-standards` tinha 8.
 *   2. **Significado do MESMO número** — "Regra 7" era *branch/push/release* num e
 *      *gate de pre-commit* no outro.
 *   3. **Conteúdo contraditório** — `CLAUDE.md` dizia "NUNCA dê `git push` sozinho";
 *      a Regra 8 da `ds-standards`, o `orchestrator.md` e a skill `handoff-pr.md`
 *      mandavam a IA executar push + PR e parar no merge.
 *
 * O agente recebia as duas e não tinha como decidir. Pior: 12 arquivos citam regras
 * **por número** (`orchestrator.md:68` — "Regra 8 / L-041"; `brand-builder/SKILL.md:32`
 * — "Regra 4 do CLAUDE.md"), então uma referência podia resolver pra regra errada.
 *
 * ## Escopo deliberado: números e títulos, não o corpo
 *
 * Comparar o TEXTO das regras seria julgamento de intenção (L-059) — os dois arquivos
 * têm formatos diferentes de propósito (`CLAUDE.md` é didático, `ds-standards` é
 * denso). O que dá pra afirmar mecanicamente é: **mesmo conjunto de números** e
 * **títulos equivalentes**. Contradição de conteúdo continua sendo trabalho do
 * revisor — mas a colisão de numeração, que é a que quebra referência cruzada, não.
 */
import { readFileSync, existsSync } from "node:fs";

const CLAUDE = "CLAUDE.md";
const STANDARDS = ".claude/rules/ds-standards.md";

/** Normaliza título pra comparação: minúsculas, sem acento, sem pontuação/ênfase. */
export const slug = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** `### Regra N — Título` → Map(N → título) */
export function rulesFromClaude(texto) {
  const out = new Map();
  for (const m of String(texto ?? "").matchAll(/^###\s*Regra\s+(\d+)\s*[—-]\s*(.+?)\s*$/gm)) {
    out.set(Number(m[1]), m[2]);
  }
  return out;
}

/**
 * `N. <título> — …` dentro da seção "Regras de comportamento" → Map(N → título).
 *
 * Recorta a seção primeiro: o arquivo tem outras listas numeradas (as 10 superfícies
 * de marca, os passos do brand-builder) que casariam o mesmo padrão.
 *
 * ⚠️ O negrito é OPCIONAL de propósito. A primeira versão deste parser exigia
 * `N. **Título**` e reprovou as regras **3, 5 e 6** — que existem, estão corretas, e
 * simplesmente não abrem com `**`. Exigir formatação uniforme faria o gate reprovar
 * conteúdo certo por causa de estilo, que é ruído (L-059). O que importa é o par
 * (número, do que a regra trata).
 */
export function rulesFromStandards(texto) {
  const t = String(texto ?? "");
  const ini = t.search(/^##\s*⛔?\s*Regras de comportamento/im);
  if (ini < 0) return new Map();
  const resto = t.slice(ini);
  const fim = resto.search(/^---\s*$/m);
  const secao = fim > 0 ? resto.slice(0, fim) : resto;

  const out = new Map();
  for (const m of secao.matchAll(/^(\d+)\.\s+(.+?)\s*$/gm)) {
    const titulo = m[2]
      .split(/\s+—\s+/)[0] // corta no travessão: o resto é explicação
      .replace(/\*\*/g, "") // negrito é estilo, não conteúdo
      .replace(/\s*\(L-\d+\)\s*$/, "") // sufixo de lição
      .trim();
    if (titulo) out.set(Number(m[1]), titulo);
  }
  return out;
}

/**
 * @returns {{ soNoClaude:number[], soNoStandards:number[], tituloDivergente:object[], total:number }}
 */
export function checkRulesParity({ claude = CLAUDE, standards = STANDARDS } = {}) {
  const a = rulesFromClaude(existsSync(claude) ? readFileSync(claude, "utf8") : "");
  const b = rulesFromStandards(existsSync(standards) ? readFileSync(standards, "utf8") : "");

  const soNoClaude = [...a.keys()].filter((n) => !b.has(n)).sort((x, y) => x - y);
  const soNoStandards = [...b.keys()].filter((n) => !a.has(n)).sort((x, y) => x - y);

  // Título "equivalente" = um contém as palavras-chave do outro. Frouxo de propósito:
  // o objetivo é pegar "Regra 7 significa outra coisa", não uniformizar redação.
  const tituloDivergente = [];
  for (const [n, ta] of a) {
    if (!b.has(n)) continue;
    const sa = slug(ta);
    const sb = slug(b.get(n));
    const chaveA = sa.split(" ").filter((w) => w.length > 4);
    const bate = chaveA.length === 0 || chaveA.some((w) => sb.includes(w));
    if (!bate) tituloDivergente.push({ n, claude: ta, standards: b.get(n) });
  }

  return { soNoClaude, soNoStandards, tituloDivergente, total: a.size };
}

export { CLAUDE, STANDARDS };
