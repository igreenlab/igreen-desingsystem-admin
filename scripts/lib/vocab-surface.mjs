/**
 * vocab-surface — valida o vocabulário de componentes do consumidor
 * (`cli/templates/default/_claude/rules/ds-components.md`) contra o `registry.json`,
 * nas DUAS direções. Puro, zero I/O (ler arquivo é do CLI).
 *
 * Por que duas direções, e por que este check existe separado do
 * `distribution-debt.mjs`:
 *
 * 1. COMPLETUDE — item distribuído que o vocabulário não cita é **mentira por
 *    omissão**: a IA do consumidor conclui que o que não está listado não existe e
 *    compõe na unha. O `distribution-debt.mjs` já cobre esse eixo, mas só pra
 *    `src/components/ui/*` (34 pastas). Os **41 primitivos** do registry
 *    (`tabs`, `select`, `popover`…) não têm pasta em `ui/` e ficavam **sem gate
 *    nenhum** ligando registry → vocabulário. Aqui a fonte é o registry inteiro.
 *
 * 2. VERACIDADE — nome citado que não existe no registry manda a IA usar
 *    componente inexistente. É a classe do `PeriodSelector`: o kit falava de um
 *    componente que nunca foi implementado, e a IA "usava" ele. Nenhum gate do
 *    repo cobria essa direção.
 *
 * Fronteira de palavra sem `\b`: um heredoc de shell já colapsou `\b` em
 * caractere backspace nesta base, e a regex passou a nunca casar — todo `false`
 * era artefato do instrumento, não do texto. Delimitador explícito é imune.
 */

/** Itens do registry que não são componente (exemplos de tela e utilitários). */
const NAO_COMPONENTE = /^example-|^(tv|utils|theme)$/;

/**
 * Termos em backtick que são classe/prop/token/valor — não nome de componente.
 * Sem isso, `variant`, `single`, `gap-form-gap` etc. viram "nome inventado".
 */
const NAO_NOME =
  /^(gap-|p-|px-|py-|min-h-|max-w-|size-|shadow-|rounded-|text-|bg-|border-|chart-|stat-|tabular-|listconfig|viewmode|variant|mode|single|range|multiple|segmented|line|color|npm|igreen)/i;

/** Deps npm citadas legitimamente (aparecem como "traz `d3-geo`"). */
const DEPS_NPM = new Set(["d3-geo", "topojson-client", "recharts", "lucide-react"]);

/** `texto` contém `nome` cercado por não-[a-z0-9-]? (fronteira explícita) */
function citado(texto, nome) {
  let i = -1;
  while ((i = texto.indexOf(nome, i + 1)) !== -1) {
    const antes = texto[i - 1] ?? " ";
    const depois = texto[i + nome.length] ?? " ";
    if (!/[A-Za-z0-9-]/.test(antes) && !/[A-Za-z0-9-]/.test(depois)) return true;
  }
  return false;
}

/**
 * @param {string} vocabText     conteúdo de `_claude/rules/ds-components.md`
 * @param {{items?: Array<{name: string}>}} registry  `registry.json` parseado
 * @returns {{total: number, faltando: string[], inventados: string[]}}
 *   `faltando` = distribuído mas não citado · `inventados` = citado mas inexistente
 */
export function checkVocab(vocabText, registry) {
  const nomes = (registry.items ?? []).map((i) => i.name);
  const componentes = nomes.filter((n) => !NAO_COMPONENTE.test(n));
  const noRegistry = new Set(nomes);

  const faltando = componentes.filter((n) => !citado(vocabText, n)).sort();

  const emBacktick = [
    ...new Set([...vocabText.matchAll(/`([a-z][a-z0-9-]{2,})`/g)].map((m) => m[1])),
  ];
  const inventados = emBacktick
    .filter(
      (n) =>
        !noRegistry.has(n) &&
        !DEPS_NPM.has(n) &&
        !NAO_NOME.test(n) &&
        !n.includes(".") &&
        !n.includes("/"),
    )
    .sort();

  return { total: componentes.length, faltando, inventados };
}
