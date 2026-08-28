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

/**
 * Itens do registry que não são componente (exemplos de tela, utilitários, temas).
 *
 * `theme` já estava aqui desde o começo — CSS de tema não é "componente a escolher pra
 * uma tarefa", então cobrá-lo no `ds-components.md` é erro de categoria. Mas a âncora
 * `$` do padrão antigo (`^(tv|utils|theme)$`) só casava o nome exato: quando os overlays
 * de marca entraram como `theme-blue`/`-green`/`-pay`/`-vibrant` (v0.32.0), os 4 caíram
 * na lista de "faltando no vocabulário" e reprovaram o `npm test`. É a L-063: regra
 * derivada de convenção tem que tratar o caso novo legítimo em vez de acusá-lo.
 *
 * ⚠️ Isto NÃO é isenção do princípio do gate ("item distribuído que a IA do consumidor
 * não conhece = item que ela conclui que não existe"). Tema tem superfície própria:
 * `cli/templates/default/_claude/rules/ds-themes.md`, também auto-carregada. Se um dia
 * aparecer item distribuído SEM nenhuma superfície de vocabulário, ele deve reprovar
 * aqui — não acrescente ao padrão sem ter onde a IA aprenda sobre ele.
 */
const NAO_COMPONENTE = /^example-|^theme(-|$)|^(tv|utils)$/;

/**
 * Termos em backtick que são classe/prop/token/valor — não nome de componente.
 * Sem isso, `variant`, `single`, `gap-form-gap` etc. viram "nome inventado".
 *
 * ⚠️ Ao citar uma prop ou um valor de variante no vocabulário, acrescente aqui. O gate
 * casa TODO token em backtick com 3+ caracteres, então `state` ou `outlined` numa linha
 * nova reprovam como "componente inexistente" — foi o que aconteceu ao documentar a API
 * nova do `input-otp` em 2026-08-18. O `size-` já estava na lista, mas só com hífen
 * (`size-form-lg`); o `size` sozinho, como nome de prop, não.
 *
 * Em 2026-08-21 entraram `w-` e `flex-`: a regra do `tabs` precisa dizer ⛔ *"nunca `w-full`
 * nem `flex-1` na mão"*, e citar a classe proibida em backtick é o jeito natural de escrever
 * isso. O gate leu as duas como nome de componente inventado.
 *
 * Em 2026-08-28 entraram `max`, `total`, `surface`, `ring`, `src` e `children` — as props do
 * `AvatarGroup`/`Avatar`, e a classe que a regra deles proíbe escrever na mão. E `value`, do
 * `TabsNavigation`, que é controlado.
 */
const NAO_NOME =
  /^(gap-|p-|px-|py-|min-h-|max-w-|size-|shadow-|rounded-|text-|bg-|border-|chart-|stat-|tabular-|w-|flex-|listconfig|viewmode|variant|mode|single|range|multiple|segmented|line|color|npm|igreen|size$|state$|xxs$|value$|switcher$|src$|children$|max$|total$|surface$|ring$|connected$|outlined$|filled$|underline$|href$|renderlink$|fillheight$|showsearch$|categories$|contexts$|sidebar$|sidebarlogo$|sidebartitle$|sidebarshowsearch$|activeitemid$|onsidebaritemclick$)/i;

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
  const itens = registry.items ?? [];
  const nomes = itens.map((i) => i.name);

  /**
   * `registry:block` sai da COMPLETUDE — e isto não é exceção ao princípio do gate, é o
   * princípio aplicado ao caso.
   *
   * O gate existe porque "item distribuído que o vocabulário não cita é mentira por omissão: a IA
   * conclui que não existe e compõe na unha". Pra componente isso vale: a IA escolhe componente
   * navegando o vocabulário. **Bloco não é escolhido — é citado por ID pelo humano**, e a lista
   * dele vive num índice GERADO (`skills/ds-kit/blocks-index.md`) que o Passo 0 carrega sob
   * demanda.
   *
   * Exigir linha por bloco aqui teria dois efeitos, os dois ruins: o `ds-components.md` é
   * `alwaysApply`, então cada bloco novo custaria contexto em 100% das sessões do consumidor pra
   * sempre; e o crescimento do catálogo (que é o plano — "vai crescer regularmente") passaria a
   * depender de uma edição manual num arquivo que ninguém lembra de tocar.
   *
   * O que continua coberto: o vocabulário **precisa** citar o mecanismo (a seção "Blocos" que
   * aponta pro índice). Se alguém apagar essa seção, os blocos ficam invisíveis — e é isso que o
   * teste `vocab-surface` guarda, em vez de contar nomes.
   */
  const blocos = new Set(itens.filter((i) => i.type === "registry:block").map((i) => i.name));
  const componentes = nomes.filter((n) => !NAO_COMPONENTE.test(n) && !blocos.has(n));
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
