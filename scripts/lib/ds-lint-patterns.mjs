/**
 * ds-lint-patterns — FONTE ÚNICA dos anti-patterns de estilo do DS.
 *
 * Consumido por DOIS clientes (nunca duplique a tabela):
 *   - .claude/hooks/ds-lint-styles.sh   → aviso local, nunca bloqueia
 *   - scripts/lint-styles.mjs --ratchet → check de CI, bloqueia violação nova
 *
 * ⚠️ Só entram aqui regras erradas INDEPENDENTE DE CONTEXTO (valor divergente
 * do token, classe que não existe). Regras que exigem contexto cross-elemento
 * ou julgamento de intenção — L-004 (afordância de foco pode estar no wrapper)
 * e L-007 (escolha de preset tipográfico) — pertencem ao revisor semântico,
 * NÃO a este arquivo. Ver `.ai/specs/pipeline-governance-ci.md` §1.1.
 *
 * Buracos de cobertura conhecidos (não fechados nesta rodada — cada um exige
 * medição/decisão de política própria; ver it.todo no teste):
 *   - `space-x-N` / `space-y-N` (utility legado, sem token DS direto) e
 *     `w-N`/`h-N` isolados fora das famílias `h|min-h|size` acima.
 *   - **Template literals**: o delimitador cobre aspas simples e duplas, mas
 *     NÃO crase — `` `flex gap-4` `` passa limpo (forma diferente, não
 *     coberta nesta rodada).
 *   - **Números fora do que foi medido no baseline**: as alternações listam
 *     só os valores encontrados na varredura de 2026-07-29, não a escala
 *     Tailwind inteira — `w-10`, `p-9`, `gap-11`, `h-20` passam limpo hoje.
 *     Ampliar a faixa numérica exige nova medição própria, fora desta correção.
 */

export const DS_LINT_PATTERNS = [
  {
    id: "L-001",
    re: /ring-ring-[a-z-]+\/[0-9]+/,
    msg: "ring-ring-*/N — o token de ring já tem alpha embutido. Remova o /N.",
  },
  // `0` fora da alternação de propósito: não existe token DS pra zero
  // (p-0/gap-0 são resets legítimos, comuns com `!` sobre base do shadcn).
  {
    id: "L-002",
    re: /['"][^'"]*\bgap(-[xy])?-(1|2|3|4|5|6|7|8|9|10|12|14|16|20|24)\b[^'"]*['"]/,
    msg: "gap-N literal → use gap-gp-{2xs,xs,sm,md,lg,xl,2xl}.",
  },
  {
    id: "L-002",
    re: /['"][^'"]*\b(px|py|pt|pb|pl|pr|p)-(1|2|3|4|5|6|7|8|10|12|16)\b[^'"]*['"]/,
    msg: "pad/space literal → use p-sp-* (space) ou px-pad-* (pad).",
  },
  {
    id: "L-002",
    re: /['"][^'"]*\b(h|min-h|size)-(7|8|9|10|11|12|13|14|16)\b[^'"]*['"]/,
    msg: "height/size fixo → use min-h-form-* (h-9=form-md, h-10=form-lg, h-11=form-xl). Se for quadrado, size-comp-*. Se for maior (~h-12 a h-16, 48-64px), não é form — use token de layout (ex.: h-layout-navbar); ver .ai/context/tokens/sizing-shape-elevation.md.",
  },
  // `none` e `full` fora da alternação: são numericamente IDÊNTICOS ao token DS
  // (--radius-radius-full: 9999px, --radius-radius-none: 0px) → não podem ser
  // defeito. Já sm..3xl DIVERGEM (nativo lg=0.5rem vs DS 0.625rem) → defeito
  // real. Side variants (rounded-t-lg) carregam o mesmo valor divergente.
  {
    id: "L-002",
    re: /['"][^'"]*\brounded(-(t|b|l|r|tl|tr|bl|br|s|e|ss|se|es|ee))?-(sm|md|lg|xl|2xl|3xl)\b[^'"]*['"]/,
    msg: "rounded-N nativo tem VALOR DIFERENTE do token DS (nativo lg=0.5rem vs DS 0.625rem) → use rounded-radius-*.",
  },
  {
    id: "L-002",
    re: /['"][^'"]*\bshadow-(2xs|xs|sm|md|lg|xl|2xl)\b[^'"]*['"]/,
    msg: "shadow-N nativo → use shadow-sh-*.",
  },
  {
    id: "L-003",
    re: /['"][^'"]*\bring-3\b[^'"]*['"]/,
    msg: "ring-3 não existe no Tailwind (vira no-op silencioso) → use ring-4.",
  },
  {
    id: "L-005",
    re: /['"][^'"]*\bbg-input\/[0-9]+[^'"]*['"]/,
    msg: "bg-input/N é var do shadcn → use o token DS bg-bg-surface (ou bg-bg-muted).",
  },
  {
    id: "IMPORT",
    re: /from\s+['"]tailwind-variants['"]/,
    msg: 'import errado: use `import { tv } from "@/utils/tv"` — o wrapper do DS carrega o twMergeConfig da L-016.',
  },
];

/** Linha de comentário não é código — citar uma classe proibida ao explicar a
 *  regra não pode reprovar o CI. */
const isComment = (text) => /^\s*(\/\/|\/\*|\*)/.test(text);

/**
 * Roda todos os patterns contra uma lista de linhas.
 * @param {Array<{n: number, text: string}>} lines
 * @returns {Array<{id: string, msg: string, n: number, text: string}>}
 */
export function scanLines(lines) {
  const out = [];
  for (const { n, text } of lines) {
    if (isComment(text)) continue;
    for (const p of DS_LINT_PATTERNS) {
      // `re` sem flag /g → .test() não mantém lastIndex, seguro reusar.
      if (p.re.test(text)) out.push({ id: p.id, msg: p.msg, n, text });
    }
  }
  return out;
}
