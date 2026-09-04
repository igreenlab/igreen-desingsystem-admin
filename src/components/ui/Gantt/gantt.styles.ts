import { tv } from "@/utils/tv";

/**
 * Estilos do `Gantt`.
 *
 * ## A pele é do DS, a estrutura é das referências
 *
 * As 13 referências visuais decidiram **estrutura**: grade à esquerda, eixo em
 * dois níveis, divisor arrastável, setas ortogonais, losango pro marco. Nenhuma
 * decidiu **pele** — fonte, cor, espaçamento, radius e foco vêm dos tokens,
 * conforme `.ai/context/referencia-visual.md`.
 *
 * ⛔ Nenhum hex saiu de pixel de print. Os prints trazem roxo, laranja e
 * azul-royal de outros produtos; o DS tem 5 chaves de chart e as famílias
 * semânticas, e é só isso que existe aqui.
 *
 * ## Por que a barra é TINGIDA e não sólida com texto branco
 *
 * As referências mostram barra saturada com texto branco. O DS não faz isso, e a
 * razão foi **medida** na v0.56.0 ao especificar o `Scheduler`: texto colorido
 * ou branco sobre pílula tingida dá contraste de **1.72–4.49 no light** e
 * 2.97–4.31 no dark — nenhuma família passa AA, e `warning` chega a 1.72:1.
 *
 * A receita do DS é: fundo tingido + `fg-default` no texto + a cor viva num
 * **acento** (aqui, a borda esquerda de 3px) e no preenchimento de progresso.
 * A cor segue dizendo qual frente é; ela só não carrega o texto.
 *
 * ⛔ Nada aqui é importado do `Scheduler` — só a gramática visual foi copiada,
 * pelo mesmo motivo que ele copiou a do `TableToolbar` em vez de importar
 * (L-049): cross-import entre pastas de `ui/` gera `registryDependency`
 * pendente e o `igreen:add` estreia quebrado.
 */

/* ═══════════════════════════════════════════════════ geometria ══ */

/**
 * Altura da linha, em px — **fonte ÚNICA, consumida pelos dois painéis**.
 *
 * ⚠️ É constante e não classe utilitária de propósito. A grade da esquerda e o
 * canvas da direita têm que concordar **ao pixel**: a barra é posicionada em
 * `top` absoluto calculado a partir do índice da linha, e a célula da esquerda é
 * um elemento de fluxo. Se as duas derivassem a altura de lugares diferentes —
 * uma de `min-h-comp-2xl`, outra de um `--var` — bastaria um `line-height`
 * herdado pra desalinhar, e o desalinho cresce linha a linha.
 *
 * É a classe de defeito da L-038: default resolvido em dois render-sites que
 * divergem. Aqui há um número só, e um teste compara os dois `getBoundingClientRect`.
 *
 * 48px: os 44 de `comp-2xl` (alvo de toque WCAG) + 2px de respiro em cima e
 * 2 embaixo. Em 44 exatos a linha ficava com o texto encostado nas divisórias.
 */
export const GANTT_ROW_HEIGHT_PX = 48;

/**
 * Altura da barra dentro da linha.
 *
 * 26 e não 18: em 44px de linha, 18px de barra deixava 13px de folga em cima e
 * embaixo, e o card parecia flutuar solto na faixa. A barra é CENTRADA
 * verticalmente — `(rowHeight - barHeight) / 2` —, não colada no topo.
 */
export const GANTT_BAR_HEIGHT_PX = 26;

/** Barra-resumo: mais fina de propósito, ela agrega e não é trabalho. */
export const GANTT_SUMMARY_BAR_HEIGHT_PX = 12;

/** Altura de uma lane dentro de uma linha com N barras (`lanePacking: "stack"`). */
export const GANTT_LANE_HEIGHT_PX = 30;

/**
 * Altura do cabeçalho — dois níveis empilhados.
 *
 * 68 e não 56: com 28+28 o rótulo do dia ficava colado na divisória, e o eixo
 * lia como uma faixa comprimida ao lado de linhas de 44px. 30 no grupo (mês) +
 * 38 na unidade (dia), que é onde mora o par `S 21`.
 */
export const GANTT_HEAD_HEIGHT_PX = 84;
/**
 * Faixa do mês/ano — **42px, igual à faixa da unidade**.
 *
 * Passou por 30 (o rótulo encostava na divisória) e 38 (melhor, mas a faixa
 * ainda lia como subordinada à de baixo). Em 42 as duas têm o mesmo peso, que é
 * o correto: são dois NÍVEIS do mesmo eixo, não um cabeçalho e um sub-cabeçalho.
 *
 * ⚠️ **Não há token de 42px, e isso é deliberado.** A escala `form` do DS pula
 * de 40 (`form-lg`) pra 44 (`form-xl`, alvo WCAG); nenhum tier cai em 42. Toda a
 * família `GANTT_HEAD_*`/`GANTT_ROW_HEIGHT_PX` é geometria DE COMPONENTE em px,
 * pela mesma razão: são medidas que os dois painéis têm que casar ao pixel, não
 * alturas de controle interativo. Criar token semântico pra a faixa de
 * cabeçalho de UM componente violaria a Regra 1 (só criar se nenhum servir E
 * for reutilizável).
 *
 * Se em algum momento isto tiver que virar token, o tier honesto é `form-xl`
 * (44) — e aí as duas faixas vão junto, não só esta.
 */
export const GANTT_HEAD_GROUP_PX = 42;
/** Faixa da unidade — empilha a abreviação do dia sobre o número (#10). */
export const GANTT_HEAD_UNIT_PX = 42;

/**
 * Largura mínima de rótulo de GRUPO, em px.
 *
 * 96px porque o pior caso real é "novembro 2026" em `caption-md`, que mede
 * ~85px de texto: em 92px ele encostava nas duas bordas.
 *
 * Abaixo disso o rótulo não é renderizado — a célula fica, pra o alinhamento
 * não quebrar, mas vazia. Medido no exemplo de tela cheia: a janela começava em
 * 31/ago e o grupo "agosto 2026" saía com **46px** (um dia só), com o texto
 * transbordando por cima do vizinho.
 *
 * Esconder é melhor que abreviar: "ago" em 46px ainda encosta nas duas bordas,
 * e o mês já está implícito no grupo seguinte, que é grande.
 */
export const GANTT_GROUP_LABEL_MIN_PX = 96;

/** Largura de coluna por granularidade, em px por dia. */
/**
 * Largura por dia, em px — derivada da largura-alvo da UNIDADE.
 *
 * ⚠️ A largura-alvo NÃO é "o que o rótulo precisa". Era, e foi o erro: "set"
 * cabe em 60px, então o mês nasceu com 150 e o trimestre com 190 — larguras
 * suficientes pro CABEÇALHO e insuficientes pro CONTEÚDO. Quem ocupa a coluna
 * é a barra, e ela mede em dias:
 *
 *   escala     antes            uma tarefa de 6 dias   uma de 12
 *   month      150px (4.93/d)   → 30px                 → 59px
 *   quarter    190px (2.09/d)   → 13px                 → 25px
 *
 * Em 30px não cabe rótulo nem o acento de 3px lê como acento; em 13px a barra
 * é um traço. O cronograma inteiro virava uma tira achatada, que é justamente
 * o que se vai olhar quando se escolhe uma escala grossa.
 *
 *   escala     agora            6 dias    12 dias
 *   month      240px (7.89/d)   → 47px    → 95px
 *   quarter    320px (3.52/d)   → 21px    → 42px
 *
 * O custo é largura total do trilho — com `GANTT_WINDOW_DAYS`, mês vai a
 * ~5.760px e trimestre a ~6.420px. É rolagem, e rolagem é o preço certo:
 * conteúdo ilegível não tem preço de troco.
 *
 * `day` fica em 46 porque lá a coluna carrega duas informações empilhadas (a
 * abreviação do dia e o número) e a barra já tem 46px por dia.
 */
export const GANTT_PX_PER_DAY = {
  day: 46,
  week: 100 / 7,
  month: 240 / 30.4,
  quarter: 320 / 91,
} as const;

/**
 * Quantos dias a janela cobre em cada escala, quando o consumidor NÃO controla.
 *
 * ⚠️ Sem isto, trocar pra trimestre mantinha a janela de ~60 dias e o
 * cronograma inteiro colapsava numa tira de **128px** — medido. Escolher uma
 * escala mais grossa é pedir pra ver MAIS TEMPO, não a mesma janela comprimida.
 */
export const GANTT_WINDOW_DAYS = {
  day: 60,
  week: 180,
  month: 730,
  quarter: 1825,
} as const;

/* ═══════════════════════════════════════════════════════ raiz ══ */

/**
 * A raiz — toolbar em cima, os dois painéis embaixo.
 *
 * ⚠️ `gap-gp-3xl` (20px) e não `gap-gp-xl` (12px): em 12px a toolbar encostava
 * na moldura do cronograma e as duas liam como uma caixa só, com os controles
 * parecendo parte do cabeçalho da grade. 20px é a distância que separa
 * "controles DA tela" de "a tela".
 */
export const ganttRoot = tv({
  base: [
    "flex h-full min-h-0 w-full flex-col gap-gp-3xl",
    "text-fg-default",
  ],
});

/* ════════════════════════════════════════════════════ toolbar ══ */

/**
 * Duas linhas abaixo de `lg`, uma a partir dele — mesma decisão que a toolbar do
 * `Scheduler` tomou na v0.58.0, e pelo mesmo motivo medido: `flex-wrap` puro
 * deixa a quebra a cargo do espaço que sobrar, e em 375px os controles disputam
 * largura com a busca.
 */
export const ganttToolbar = tv({
  base: [
    "flex flex-col gap-gp-xl",
    "lg:flex-row lg:flex-wrap lg:items-center lg:justify-between",
  ],
});

/**
 * Os dois lados da toolbar.
 *
 * `gap-gp-2xl` (16px) no lado esquerdo, `gap-gp-md` (8px) no direito: à esquerda
 * convivem duas coisas de NATUREZA diferente — um rótulo de período e um grupo
 * de 3 botões. Em 8px o `‹ Hoje ›` encostava no texto "31 ago – 2 nov 2026" e os
 * dois liam como um controle só. À direita o gap menor está certo: lá é tudo
 * controle, e agrupar é o que se quer.
 *
 * ⚠️ O `gap` está NAS VARIANTES e não na base, e isso não é estilo — é
 * necessidade. MEDIDO: `tailwind-merge` **não colapsa** `gap-gp-*`. Um elemento
 * com `gap-gp-md gap-gp-2xl` mantém as DUAS classes e quem decide é a ordem no
 * CSS gerado — que entregou 8px, o valor da base. Sozinha, `gap-gp-2xl` dá 16.
 *
 * O motivo: o grupo `gap` do tailwind-merge valida o sufixo como número ou
 * valor arbitrário, e `gp-md` não é nem um nem outro — então ele nem reconhece
 * as duas como conflitantes. É a mesma armadilha da L-016 (preset tipográfico
 * invisível pro merge), na família de espaçamento: falha em silêncio, com `tsc`
 * e testes verdes.
 *
 * ⛔ Regra prática: com prefixo DS (`gp-`, `sp-`, `pad-`, `form-`, `icon-`),
 * NÃO conte com variante sobrescrevendo a base. Declare o valor em UM lugar só.
 */
export const ganttToolbarSide = tv({
  base: "flex min-w-0 items-center",
  variants: {
    slot: {
      leading: [
        "w-full justify-between gap-gp-2xl",
        "lg:w-auto lg:flex-wrap lg:justify-start",
      ],
      trailing: "w-full gap-gp-md lg:w-auto lg:flex-wrap",
    },
  },
  defaultVariants: { slot: "trailing" },
});

/**
 * Título do período. `<span>` e não heading — ele rotula a toolbar, não abre
 * seção de documento; como `h2` entraria no índice da página no mesmo nível das
 * seções (medido na doc page do `Scheduler`).
 */
export const ganttTitle = tv({
  base: [
    // O ícone e o texto são um par; o `gap` aqui é DENTRO do par.
    "flex min-w-0 items-center gap-gp-md",
    "text-title-sm font-semibold text-fg-default",
    "[&>svg]:size-icon-md [&>svg]:shrink-0 [&>svg]:text-fg-muted",
  ],
});

/**
 * O texto do período. `truncate` mora AQUI e não na raiz do título.
 *
 * Na raiz, o `truncate` (que é `overflow:hidden` + `text-overflow`) se aplicava
 * ao flex container e cortava o ícone junto quando o espaço apertava — o ícone
 * é o primeiro filho, então sumia primeiro. No texto, quem encurta é só o texto.
 */
export const ganttTitleText = tv({
  base: "min-w-0 truncate first-letter:uppercase",
});

/** `‹ Hoje ›` — três segmentos colados num controle só. */
export const ganttNavGroup = tv({
  base: [
    "inline-flex shrink-0 items-center",
    "[&>*:not(:first-child)]:-ml-px",
    "[&>*:focus-visible]:relative [&>*:focus-visible]:z-[1]",
    "[&>*:first-child]:!rounded-r-none",
    "[&>*:last-child]:!rounded-l-none",
    "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
  ],
});

export const ganttSearch = tv({
  base: [
    "relative flex cursor-text items-center gap-gp-md",
    "h-form-lg rounded-radius-lg px-pad-lg",
    "bg-bg-surface dark:bg-bg-muted",
    "border border-border-subtle dark:border-border-input",
    "shadow-sh-sm dark:shadow-sh-none",
    // #8 — expande no foco, igual à busca do `TableToolbar`: 200 → 300px.
    // A animação usa a mesma curva e duração de lá (220ms).
    "min-w-0 flex-1 lg:flex-initial lg:w-[200px] lg:focus-within:w-[300px]",
    "transition-[width,border-color,background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
    "focus-within:border-border-brand focus-within:ring-4 focus-within:ring-ring-brand",
    "[&_svg]:size-icon-sm [&_svg]:shrink-0 [&_svg]:text-fg-subtle",
  ],
});

export const ganttSearchInput = tv({
  base: [
    "min-w-0 flex-1 border-0 bg-transparent outline-none",
    "text-body-sm font-normal text-fg-default",
    "placeholder:text-fg-muted",
  ],
});

/**
 * Linha dos filtros APLICADOS, abaixo da toolbar.
 *
 * ⚠️ Estes estilos são uma reprodução do `toolbarApplied*` do `TableToolbar`,
 * token por token. A anatomia do chip da tabela não é preferência estética —
 * é a experiência que o usuário já aprendeu em outra tela do mesmo produto.
 * A minha primeira versão divergia em três pontos (× à direita, borda sólida
 * brand, sem operador) e cada divergência era uma coisa a reaprender.
 *
 * O que documenta CADA decisão é o JSDoc de `gantt-applied-filters.tsx`.
 *
 * ## O divisor
 *
 * `16px → border-top → 16px → chips`, igual ao `toolbarApplied`. A linha
 * importa porque a fileira de chips não é um controle da toolbar — é o resumo
 * de um estado que ela produziu. Sem o divisor os chips liam como uma segunda
 * fileira de botões.
 *
 * ⚠️ O espaçamento mora AQUI (`mt`/`pt`) e não como `gap` do pai: a linha só
 * existe quando há filtro aplicado, e um `gap` no pai cobraria margem por uma
 * linha ausente na maior parte do tempo.
 *
 * Rola na horizontal no mobile em vez de quebrar linha: no celular, 4 chips
 * empilhados empurrariam a grade pra fora da tela.
 *
 * ⛔ Gramática copiada, não importada — cross-import entre pastas de `ui/` gera
 * `registryDependency` pendente (L-049).
 */
export const ganttAppliedRow = tv({
  base: [
    "flex items-center gap-gp-md",
    "mt-pad-2xl pt-pad-2xl border-t border-border-default",
    "flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-x-visible",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ],
});

/**
 * O chip. Borda **tracejada e neutra**, como na tabela.
 *
 * ⚠️ Era `border-solid border-border-brand bg-bg-brand-subtle` na minha versão,
 * e estava errado: chip aplicado não precisa gritar — ele já É a prova de que
 * algo está ligado. Sólido em brand fazia a linha competir com a grade, que é o
 * conteúdo, e ainda colidia com o verde que aqui significa "hoje"/"selecionado".
 *
 * `shrink-0` porque no scroll horizontal do mobile (`flex-nowrap`) os chips não
 * podem comprimir.
 */
export const ganttAppliedChip = tv({
  base: [
    "inline-flex shrink-0 items-center gap-gp-md",
    "h-form-md pl-pad-sm pr-pad-lg rounded-radius-lg",
    "bg-bg-surface dark:bg-bg-muted",
    "border border-dashed border-border-input",
    "text-body-xs font-normal text-fg-default",
    "transition-[background-color,border-color] duration-150",
  ],
  variants: {
    /** Clicável (abre as opções do campo). Sempre `true` hoje; ver o part. */
    interactive: {
      true: [
        "cursor-pointer",
        "hover:bg-bg-muted-hover hover:border-border-default",
        "dark:hover:bg-bg-accent",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
      ],
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

/**
 * O `⊗` de remover — à ESQUERDA do chip.
 *
 * ⚠️ Posição copiada da tabela, e ela tem razão de ser: à direita o alvo fica
 * depois de um valor de largura variável e "dança" de posição entre chips; à
 * esquerda todos ficam alinhados numa coluna, e limpar três filtros são três
 * cliques sem reposicionar a mira.
 */
export const ganttAppliedChipRemove = tv({
  base: [
    "grid size-[18px] shrink-0 place-items-center rounded-radius-full",
    "cursor-pointer border-0 bg-transparent p-0 text-fg-subtle outline-none",
    "transition-colors duration-150 hover:text-fg-default",
    "focus-visible:shadow-sh-ring",
    "[&_svg]:size-[14px]",
  ],
});

/** O nome do campo — "Frente", "Responsável". */
export const ganttAppliedChipName = tv({
  base: "font-semibold text-fg-default",
});

/**
 * O operador — "é".
 *
 * ⚠️ Minha versão não tinha. Sem ele o chip lê "Status Ativo", uma justaposição
 * ambígua; com ele lê "Status é Ativo", que é a frase que o filtro executa.
 */
export const ganttAppliedChipOp = tv({
  base: "text-caption-sm text-fg-muted",
});

/** Cada valor, em pílula própria. Um por valor até o limite do part. */
export const ganttAppliedChipValue = tv({
  base: [
    "inline-flex h-[22px] items-center px-pad-md",
    "rounded-radius-sm bg-bg-muted dark:bg-bg-accent",
    "text-body-xs font-medium text-fg-default",
  ],
});

/**
 * "Limpar todos" no fim da linha.
 *
 * Link e não `Button`: é a saída de um estado, não ação de primeira ordem — um
 * botão de 40px ali competiria com os próprios chips.
 */
export const ganttClearLink = tv({
  base: [
    "ml-pad-sm shrink-0 cursor-pointer border-0 bg-transparent p-0",
    "text-body-xs font-medium text-fg-brand outline-none",
    "underline-offset-2 transition-opacity duration-150",
    "hover:underline focus-visible:underline",
  ],
});
/** Ponto no canto do botão de filtro — portador NÃO-cromático de "tem filtro". */
export const ganttFilterDot = tv({
  base: [
    "pointer-events-none absolute -right-px -top-px",
    "size-[7px] rounded-radius-full",
    "bg-bg-brand ring-2 ring-bg-canvas",
  ],
});

/* ═══════════════════════════════════ opções do filtro (dropdown) ══ */

/**
 * Grupo de opções — um por campo, COLAPSÁVEL.
 *
 * Seção inteiriça com padding próprio e divisória de ponta a ponta: o painel
 * não tem padding, quem paga o respiro é o grupo. É o que faz a linha chegar
 * até as bordas, do jeito que se espera de uma lista de categorias — mesma
 * anatomia do `schedulerAsideSection`.
 */
export const ganttFilterGroup = tv({
  base: [
    "flex flex-col py-pad-lg",
    "border-b border-border-subtle last:border-b-0",
  ],
});

/** Cabeçalho clicável do grupo — o alvo é a linha inteira, não só o chevron. */
export const ganttFilterGroupHead = tv({
  base: [
    "flex w-full items-center justify-between gap-gp-md",
    "px-pad-xl py-pad-md text-left",
    "transition-colors duration-150 hover:bg-bg-muted",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
});

export const ganttFilterGroupTitle = tv({
  base: [
    "flex min-w-0 items-baseline gap-gp-sm",
    "text-caption-md font-semibold text-fg-default",
  ],
});

/**
 * Chevron do grupo. Rotação e não dois ícones: com dois, o nó troca no DOM e a
 * transição não acontece — o chevron pisca em vez de girar.
 */
export const ganttFilterGroupChevron = tv({
  base: "size-icon-sm shrink-0 text-fg-subtle transition-transform duration-200",
  variants: {
    open: { true: "rotate-0", false: "-rotate-90" },
  },
  defaultVariants: { open: true },
});

/**
 * "Selecionar todas" / "Limpar" do grupo.
 *
 * Link e não `Button`: são ações de ajuste fino dentro de um grupo, e dois
 * botões de 32px empilhados sobre a lista competiriam com as próprias opções
 * pela atenção. Mesma decisão do `schedulerClearLink`.
 */
export const ganttFilterGroupActions = tv({
  base: [
    "flex items-center gap-gp-lg px-pad-xl pb-pad-sm pt-pad-2xs",
    "[&>button]:text-caption-sm [&>button]:font-medium [&>button]:text-fg-brand",
    "[&>button]:transition-colors [&>button]:duration-150",
    "[&>button:hover]:text-fg-default",
    "[&>button:disabled]:cursor-not-allowed [&>button:disabled]:text-fg-subtle",
    "[&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-4",
    "[&>button:focus-visible]:ring-ring-brand [&>button:focus-visible]:rounded-radius-xs",
  ],
});

/** Busca dentro do grupo — mesma gramática da busca da toolbar, menor. */
export const ganttFilterSearch = tv({
  base: [
    "mx-pad-xl mb-pad-sm flex cursor-text items-center gap-gp-sm",
    "h-form-md rounded-radius-md px-pad-md",
    "bg-bg-surface dark:bg-bg-muted",
    "border border-border-subtle dark:border-border-input",
    "transition-[border-color,box-shadow] duration-150",
    "focus-within:border-border-brand focus-within:ring-4 focus-within:ring-ring-brand",
    "[&_svg]:size-icon-sm [&_svg]:shrink-0 [&_svg]:text-fg-subtle",
  ],
});

export const ganttFilterSearchInput = tv({
  base: [
    "min-w-0 flex-1 border-0 bg-transparent outline-none",
    "text-body-sm font-normal text-fg-default",
    "placeholder:text-fg-muted",
  ],
});

/**
 * Input de filtro de VALOR — `text`, `number`, `date`.
 *
 * Mesma gramática de campo do `ganttFilterSearch` (altura `form-md`, borda
 * `border-subtle`/`border-input` no dark, anel de foco do DS), mas sem o ícone
 * de lupa: aqui não se busca na lista, se declara um valor.
 *
 * ⛔ Não é `<Input>` do DS importado: `ui/Input` é outra pasta de `ui/`, e
 * cross-import entre elas gera `registryDependency` pendente (L-049). O
 * `FormField`/`Input` do DS entrariam se este fosse um formulário — é um
 * controle de filtro dentro do próprio componente.
 */
export const ganttFilterInput = tv({
  base: [
    "min-w-0 flex-1 h-form-md rounded-radius-md px-pad-md",
    "bg-bg-surface dark:bg-bg-muted",
    "border border-border-subtle dark:border-border-input",
    "text-body-sm font-normal text-fg-default outline-none",
    "placeholder:text-fg-muted",
    "transition-[border-color,box-shadow] duration-150",
    "focus-visible:border-border-brand focus-visible:ring-4 focus-visible:ring-ring-brand",
    // O seletor nativo de data vem escuro no dark sem isto.
    "dark:[color-scheme:dark]",
  ],
});

/**
 * A dupla de campos de uma FAIXA (`number`, `date`).
 *
 * Dois campos e não um só com máscara: "entre 3 e 10" tem dois valores
 * independentes, e um deles pode ficar vazio (">= 3", "até 10"). Máscara única
 * obrigaria a preencher os dois pra o filtro valer.
 */
export const ganttFilterRange = tv({
  base: "flex items-center gap-gp-sm px-pad-xl pb-pad-sm",
});

/** O "e" entre os dois campos da faixa. */
export const ganttFilterRangeSep = tv({
  base: "shrink-0 text-caption-sm text-fg-muted",
});

/** Nenhuma opção casou com a busca do grupo. */
export const ganttFilterEmpty = tv({
  base: "px-pad-xl py-pad-md text-body-sm text-fg-muted",
});

/**
 * Linha de opção do painel.
 *
 * `<label htmlFor>` nativo (L-025) — o alvo é o rótulo inteiro, e o clique
 * propaga pro `Checkbox` real sem `onClick` intermediário.
 */
export const ganttFilterOption = tv({
  base: [
    "flex w-full min-w-0 cursor-pointer items-center gap-gp-md",
    "px-pad-xl py-pad-md",
    "transition-colors duration-150 hover:bg-bg-muted",
  ],
});

/**
 * `className` aplicada no `Checkbox` REAL do DS — não uma caixa desenhada.
 *
 * ⚠️ A primeira versão pintava um `<span>` com um ícone de check dentro. Saía
 * fora do padrão: sem o anel de foco do DS, sem os `data-state` do Radix, sem
 * indeterminate, e com a marcação num tom que não era o do componente real.
 *
 * Aqui a cor da opção entra só na BORDA e no fundo do estado marcado, e o
 * comportamento continua sendo o do `Checkbox`. É o mesmo recurso que o
 * `schedulerOptionBox` usa, e a razão de o `Checkbox` aceitar `className`.
 *
 * A cor da caixa é a cor com que a barra aparece na grade — dispensa legenda.
 */
export const ganttFilterOptionBox = tv({
  base: "shrink-0 transition-colors duration-150",
  variants: {
    colorKey: {
      "chart-1": "border-chart-1/60 data-[state=checked]:!bg-chart-1 data-[state=checked]:!border-chart-1",
      "chart-2": "border-chart-2/60 data-[state=checked]:!bg-chart-2 data-[state=checked]:!border-chart-2",
      "chart-3": "border-chart-3/60 data-[state=checked]:!bg-chart-3 data-[state=checked]:!border-chart-3",
      "chart-4": "border-chart-4/60 data-[state=checked]:!bg-chart-4 data-[state=checked]:!border-chart-4",
      "chart-5": "border-chart-5/60 data-[state=checked]:!bg-chart-5 data-[state=checked]:!border-chart-5",
      brand: "border-border-brand data-[state=checked]:!bg-bg-brand",
      success: "border-border-success-muted data-[state=checked]:!bg-bg-success data-[state=checked]:!border-bg-success",
      warning: "border-border-warning-muted data-[state=checked]:!bg-bg-warning data-[state=checked]:!border-bg-warning",
      danger: "border-border-danger-muted data-[state=checked]:!bg-bg-danger data-[state=checked]:!border-bg-danger",
      info: "border-border-info-muted data-[state=checked]:!bg-bg-info data-[state=checked]:!border-bg-info",
      neutral: "border-border-default",
    },
  },
  defaultVariants: { colorKey: "neutral" },
});

export const ganttFilterOptionLabel = tv({
  base: "min-w-0 flex-1 truncate text-body-sm text-fg-default",
});

/** Contagem por opção, e o "Todas" do título do grupo. */
export const ganttFilterOptionCount = tv({
  base: "shrink-0 text-caption-sm tabular-nums text-fg-subtle",
});

/* ═══════════════════════════════════════════════ dois painéis ══ */

export const ganttBody = tv({
  base: [
    "flex min-h-0 flex-1 overflow-hidden",
    "rounded-radius-xl border border-border-default bg-bg-surface",
  ],
});

/** Painel esquerdo: a grade de linhas. */
export const ganttGridPane = tv({
  base: [
    "flex min-h-0 shrink-0 flex-col",
    /**
     * ⛔ SEM borda direita — e isso é a correção de um defeito que eu criei.
     *
     * A grade precisa de uma linha grossa separando os dois painéis (é a âncora
     * de leitura: o olho volta pra ela a cada linha). Mas essa linha JÁ EXISTE:
     * é o `ganttSplitter`, que é `w-[3px] bg-bg-scrollbar-thumb/70` e vive logo depois
     * deste painel, sem vão nenhum. Pra mudar a espessura da separação, mexa
     * NELE — não acrescente borda aqui.
     *
     * Pôr `border-r-[3px] border-r-border-default` aqui somava **6px contíguos
     * da cor idêntica** — medido: borda de 478→481 e divisor de 481→484, ambos
     * `oklch(0.2645 0 0)`, vão de 0. Lia como uma borda com um segundo tracinho
     * grudado nela.
     *
     * A lição: antes de adicionar uma divisória, procure a que já está ali. O
     * divisor não é decoração — é o alvo de arraste, e ele vira verde no hover.
     * Duplicá-lo não engrossa a linha, cria duas.
     */
    // ⚠️ `overflow-hidden` e NÃO `overflow-y-auto`: o scroll vertical é do
    // painel direito, e os dois rolam juntos por `scrollTop` espelhado. Dois
    // scrollbars independentes dessincronizam as linhas na primeira rolagem.
    "overflow-hidden",
    /**
     * #6 — sombra pra a direita e `z-[2]`: o painel passa POR CIMA do canvas.
     *
     * Sem isso, a barra que começa no primeiro dia da janela encostava na
     * divisória e parecia continuar por baixo da grade. Com a sombra, a grade
     * lê como uma camada acima — e o corte da barra na borda fica intencional.
     *
     * ## Por que `10px 0 36px -18px` e não `4px 0 12px -4px`
     *
     * O que decide se a sombra lê como GRADIENTE ou como uma segunda linha é a
     * posição da borda do retângulo dela, que é `offsetX + spread` relativo à
     * borda do elemento — não o blur.
     *
     *   antes:  4 + (-4)  =  0   → retângulo termina EXATO na borda do painel.
     *                            No blur, a borda do retângulo é o ponto de ~50%
     *                            da opacidade: a sombra nascia forte encostada na
     *                            divisória e morria em 6px. É a faixa escura que
     *                            se lia como "tem mais um pixel depois da borda".
     *   agora: 10 + (-18) = -8   → retângulo termina 8px DENTRO do painel, onde
     *                            ninguém vê. O que escapa pra fora é só a cauda
     *                            do blur: começa em ~28% na divisória e decai por
     *                            10px (era 6).
     *
     * Mais larga e mais suave ao mesmo tempo, que era o pedido — e são coisas
     * independentes: aumentar o blur sozinho alarga a faixa forte junto.
     *
     * Dark em 0.55 contra 0.14 do light = 3.9×, acima do mínimo de 2× da L-011.
     */
    "relative z-[2] shadow-[10px_0_36px_-18px_oklch(0_0_0_/_0.14)]",
    "dark:shadow-[10px_0_36px_-18px_oklch(0_0_0_/_0.55)]",
  ],
});

/**
 * Divisor arrastável entre os painéis.
 *
 * ## `w-[3px]`, e o alvo do ponteiro é maior que a linha
 *
 * Esta é a ÚNICA linha entre os dois painéis — o `ganttGridPane` não tem borda
 * direita de propósito (ver a nota lá). Então a espessura dela é a espessura da
 * separação.
 *
 * ⚠️ 3px, e a ordem em que chegamos aqui importa: passamos por 5px enquanto a
 * cor ainda era `border-default`. Com a cor certa, 5px viraram excesso — era
 * **contraste** que faltava, e espessura tinha sido usada como substituto. Se
 * alguém for engrossar esta linha de novo, cheque primeiro se o problema não é
 * a cor: foi duas vezes.
 *
 * O `after` estende o alvo do ponteiro 4px pra cada lado — 11px de área contra
 * 3px de linha. Alvo do tamanho da linha é frustrante mesmo com mouse, e aqui a
 * linha é fina por decisão visual, não por ser pequena de propósito.
 *
 * ## `bg-scrollbar-thumb` e não `border-default`
 *
 * Este componente tem TRÊS degraus de linha, e eles precisam ser distinguíveis
 * por cor, não só por espessura. ΔL contra a superfície onde cada uma vive:
 *
 *   papel                    token                  dark    light
 *   coluna do dia (1px)      border-subtle          0.031   0.069
 *   virada de mês (2px)      border-input           0.062   0.124
 *   os dois painéis (3px)    bg-scrollbar-thumb/70  0.132   0.171
 *
 * ⚠️ O `/70` é diluição DELIBERADA, não descuido. Em 24% cheios (0.186/0.240) a
 * linha ficou forte demais — ela é estrutura de fundo, e competia com a barra,
 * que é conteúdo. E não há degrau intermediário no vocabulário neutro: entre
 * `scrollbar-thumb` (24%) e `border-input` (8%) só existe `bg-accent-hover`
 * (16%), cujo nome é de ESTADO — usar um token `-hover` como preenchimento em
 * repouso engana quem lê depois.
 *
 * Diluir o token certo é mais honesto que apropriar o token errado, e o DS já
 * faz isso em `bg-bg-subtle/50` e `bg-bg-brand/30` neste mesmo arquivo. ⛔ Não
 * confundir com a L-001, que proíbe alpha em token de **ring** (lá o alpha já
 * vem embutido).
 *
 * Era `border-default`, que dá **0.040 no dark** — praticamente a linha de
 * coluna (0.031). Um separador de painel que some é pior que uma linha de 1px
 * que se vê: a espessura promete estrutura e a cor não entrega.
 *
 * ⚠️ `bg-scrollbar-thumb` NÃO é oportunismo de valor — é o token cujo papel
 * casa: "barra neutra fina que o usuário agarra". É literalmente o que este
 * divisor é. Descartei `border-input` (viraria a MESMA cor da virada de mês,
 * achatando o sistema em dois degraus) e `bg-accent-hover` (número bom, mas
 * usar um token `-hover` como preenchimento em repouso engana quem lê depois).
 *
 * ⚠️ Não existe degrau neutro mais forte que sirva nos dois modos: os tokens de
 * `bg-emphasis`/`bg-accent` sobem no dark e DESCEM no light (0.060 contra os
 * 0.092 de hoje). Se precisar de mais, o próximo passo é `fg-disabled`
 * (0.135/0.298) — e aí já é uma barra cinza, não uma divisória.
 */
export const ganttSplitter = tv({
  base: [
    "group/split relative w-[3px] shrink-0 cursor-col-resize",
    "bg-bg-scrollbar-thumb/70 transition-colors duration-150",
    "hover:bg-border-brand",
    "after:absolute after:inset-y-0 after:-left-1 after:-right-1 after:content-['']",
    "focus-visible:outline-none focus-visible:bg-border-brand",
  ],
  variants: {
    active: { true: "bg-border-brand", false: "" },
  },
  defaultVariants: { active: false },
});

/** Painel direito: cabeçalho fixo + canvas rolável. */
export const ganttTimelinePane = tv({
  base: "flex min-w-0 min-h-0 flex-1 flex-col",
});

/* ════════════════════════════════════════════ cabeçalho do eixo ══ */

/**
 * Cabeçalho do eixo.
 *
 * ⚠️ **Vive DENTRO do scroller horizontal**, não fora dele.
 *
 * Fora, ele ficava imóvel enquanto o canvas rolava para o lado — as colunas do
 * eixo desalinhavam das colunas da grade, e o rótulo "12" passava a ficar em
 * cima do dia 20. Foi o defeito #5 reportado.
 *
 * `sticky top-0` prende só na VERTICAL: rolando pra baixo o cabeçalho fica,
 * rolando pra o lado ele acompanha. É o comportamento que as 13 referências
 * têm, e ele só é possível com o cabeçalho e o canvas no mesmo contêiner
 * rolável.
 */
export const ganttHead = tv({
  base: [
    /**
     * ⚠️ `z-[5]`, e o número não é folga — é a correção de um defeito.
     *
     * Era `z-[3]`, **o MESMO** do `ganttLinksLayer`. Empate de z-index no mesmo
     * contexto de empilhamento é resolvido por ORDEM NO DOM, e o canvas vem
     * depois do cabeçalho: ao rolar na vertical, as setas de vínculo passavam
     * POR CIMA dos rótulos do eixo.
     *
     * 5 e não 4 porque a barra arrastada é `z-[4]` (`ganttBar` variante
     * `dragging`) e o conector de vínculo é `z-[3]`: o cabeçalho tem que vencer
     * TODO o conteúdo do canvas, não só as setas.
     *
     * ⛔ Não baixe o `ganttLinksLayer` em vez disto: ele precisa ficar acima das
     * barras (`z-[1]` do rótulo) pra a seta não desaparecer atrás delas.
     */
    "sticky top-0 z-[5] shrink-0",
    "border-b border-border-default bg-bg-table-head",
  ],
});

/**
 * Faixa do cabeçalho — `relative`, e as células dentro são ABSOLUTAS.
 *
 * ⚠️ Era `flex`, e é o defeito #5b: com `pxPerDay` fracionário (trimestre =
 * 190/91 ≈ 2.088px/dia) o fluxo do flex acumula a largura item a item e o
 * navegador arredonda cada caixa ao pixel do dispositivo, enquanto as colunas
 * do canvas são posicionadas por `left` absoluto. As duas contas dão o mesmo
 * número em ponto flutuante e pixels DIFERENTES na tela — as divisórias do
 * grupo, da unidade e do conteúdo saíam desalinhadas ao longo do eixo.
 *
 * Em `day` o efeito não aparecia porque 46px/dia é inteiro. É a L-038 outra
 * vez: a mesma posição derivada em dois lugares. Agora as TRÊS camadas leem
 * `dateToX`.
 */
export const ganttHeadRow = tv({
  base: "relative",
  variants: {
    level: {
      /** Nível de cima: mês/ano. Divisória mais forte entre grupos. */
      group: "border-b border-border-subtle",
      /** Nível de baixo: a unidade da grade. */
      unit: "",
    },
  },
  defaultVariants: { level: "unit" },
});

export const ganttHeadCell = tv({
  base: [
    // `absolute top-0` — a posição vem de `dateToX`, ver `ganttHeadRow`.
    "absolute top-0 flex items-center justify-center overflow-hidden",
    "border-r border-border-subtle last:border-r-0",
    "px-pad-xs text-center",
  ],
  variants: {
    level: {
      group: "h-[42px] text-caption-md font-semibold text-fg-default first-letter:uppercase",
      /**
       * #10 — a unidade EMPILHA: abreviação do dia em cima, número embaixo e
       * maior. Lado a lado (`S 21`), o par competia por largura com a
       * divisória; empilhado, a data ganha peso e a abreviação vira legenda.
       */
      unit: "h-[42px] flex-col justify-center gap-0 font-normal text-fg-muted",
    },
    /** Fim de semana: coluna sombreada, e o rótulo desce um tom. */
    weekend: { true: "bg-bg-subtle text-fg-subtle", false: "" },
    today: { true: "bg-bg-brand-subtle font-semibold text-fg-brand", false: "" },
    /** #2 — coluna selecionada por clique: cabeçalho no verde da marca. */
    selected: { true: "bg-bg-brand-subtle", false: "" },
    /**
     * #1 — última unidade de um grupo (o último dia do mês, em `day`).
     *
     * Divisória mais grossa e mais clara, atravessando o cabeçalho inteiro e o
     * conteúdo: é o que faz o mês ler como um BLOCO em vez de uma fileira
     * contínua de dias. O limite vem de `axis.groups`, então acompanha a escala
     * — vira mês em `day`/`week` e ano em `month`/`quarter`.
     *
     * ⚠️ `border-input` foi ESCOLHIDO por medição, não por nome. ΔL de cada
     * candidato contra a superfície onde a linha vive:
     *
     *   token                  dark (bg 0.225)   light (bg 1.0)   × a linha comum
     *   border-subtle (comum)      0.031             0.069            1.0×
     *   border-default             0.040             0.092            1.3× / 1.3×
     *   border-input               0.062             0.124            2.0× / 1.8×
     *   chart-grid                 0.093             0.092            3.0× / 1.3×
     *
     * Três voltas até aqui, e cada uma ensinou algo:
     *
     * 1. `border-default` a 2px ficou **invisível** — 0.040 contra 0.031 é a MESMA
     *    linha. Eu tinha medido que o valor do token mudou, não que a mudança se
     *    vê; espessura não compra o que falta em contraste.
     * 2. `chart-grid` a 3px resolveu o contraste e passou do ponto nos dois
     *    eixos: 3px vira moldura, e 3× a linha comum vira estrutura competindo
     *    com a barra.
     * 3. `border-input` a 2px é o degrau do meio, e é o único candidato que fica
     *    em ~2× nos DOIS modos — por isso não precisa de par `dark:`. Menos
     *    classe e sem risco de os dois modos divergirem na próxima edição.
     *
     * ⛔ Não meça isto durante a transição: a coluna tem `transition-colors`, e
     * ler no meio dela devolve o valor interpolado (serializado em `oklab`, que é
     * a pista). Já me enganou uma vez nesta mesma linha.
     *
     * ⛔ Não troque por um token de marca: o verde já significa "hoje" e
     * "selecionado" aqui, e a virada de mês não é nem uma nem outra.
     */
    boundary: { true: "border-r-[2px] border-r-border-input", false: "" },
  },
  defaultVariants: {
    level: "unit",
    weekend: false,
    today: false,
    selected: false,
    boundary: false,
  },
});

/**
 * Abreviação do dia da semana — a linha de cima da célula.
 *
 * `caption-xs` e cor `subtle`: é legenda da data, não a informação. Com o mesmo
 * peso do número, os dois competiam e a coluna virava um bloco de texto.
 */
export const ganttHeadWeekday = tv({
  base: "text-caption-xs leading-none text-fg-subtle",
  variants: {
    weekend: { true: "text-fg-subtle/70", false: "" },
  },
  defaultVariants: { weekend: false },
});

/** O número do dia. `tabular-nums` pra a coluna não dançar entre 9 e 10. */
export const ganttHeadDayNumber = tv({
  base: "mt-[2px] text-body-sm leading-none tabular-nums",
  variants: {
    today: { true: "font-semibold text-fg-brand", false: "text-fg-default" },
  },
  defaultVariants: { today: false },
});

/** Cabeçalho da grade esquerda — alinha com os dois níveis da direita. */
/**
 * Cabeçalho da grade esquerda.
 *
 * ⚠️ `items-center` e não `items-end`.
 *
 * O cabeçalho tem a altura dos DOIS níveis do eixo da direita (68px), mas do
 * lado esquerdo existe um nível só. Alinhado embaixo, ele deixava ~38px de área
 * branca acima dos rótulos, e a grade parecia começar torta em relação ao eixo.
 * Centrado, o espaço se distribui e os dois lados leem como o mesmo cabeçalho.
 */
export const ganttGridHead = tv({
  base: [
    "flex shrink-0 items-center",
    "border-b border-border-default bg-bg-table-head",
  ],
});

export const ganttGridHeadCell = tv({
  base: [
    "flex shrink-0 items-center gap-gp-2xs overflow-hidden",
    // #6: `px-pad-xl` (14px) e não `pad-lg` — o conteúdo encostava nas duas
    // bordas da coluna, e a primeira célula ainda soma o recuo da hierarquia.
    "px-pad-2xl text-caption-sm font-semibold text-fg-muted",
    // Mesmo respiro da célula, senão o rótulo da coluna e o dado dela ficam com
    // margens diferentes na borda do painel.
    "last:pr-pad-4xl",
  ],
  variants: {
    align: {
      left: "justify-start text-left",
      center: "justify-center text-center",
      right: "justify-end text-right",
    },
  },
  defaultVariants: { align: "left" },
});

/* ═══════════════════════════════════════════════════ a linha ══ */

/** Linha da grade esquerda. */
export const ganttGridRow = tv({
  base: [
    "group/row flex shrink-0 items-center",
    "border-b border-border-subtle",
    "transition-colors duration-150",
    "hover:bg-bg-subtle",
  ],
  variants: {
    type: {
      task: "",
      /** `summary` é agrupador: peso maior e fundo levemente destacado. */
      summary: "bg-bg-subtle/60 font-semibold",
      milestone: "",
    },
    /**
     * #7 — linha selecionada, no verde da marca.
     *
     * Mesma leitura da linha selecionada do `DataTable`: a cor da marca diz "é
     * esta que estou olhando". Vence o hover no `compoundVariant` abaixo —
     * senão passar o mouse sobre a linha selecionada a apagava.
     */
    selected: { true: "", false: "" },
    /**
     * #3 — hover CRUZADO, controlado por estado e não por `:hover` do CSS.
     *
     * `:hover` só acende o elemento sob o cursor, e aqui a linha vive em DOIS
     * painéis irmãos: passar o mouse no nome tem que acender a faixa da barra e
     * vice-versa. Nenhum seletor CSS alcança um irmão de outro contêiner, então
     * o índice da linha sob o cursor é estado do React.
     *
     * ⚠️ `bg-bg-muted` e não `bg-bg-subtle`: no dark, `subtle` é
     * `oklch(1 0 0 / 0.01)` — 1% de branco, que é **invisível** na prática.
     * Medi o hover e o antes/depois diferiam em 1 centésimo de alfa. `muted` é
     * 3%, e ainda foi preciso somar a borda pra o realce se ler.
     */
    hovered: { true: "bg-bg-muted", false: "" },
  },
  compoundVariants: [
    // Selecionada vence hover — passar o mouse não pode apagar a seleção.
    { selected: true, class: "bg-bg-brand-subtle" },
    { selected: true, hovered: true, class: "bg-bg-brand-subtle-hover" },
  ],
  defaultVariants: { type: "task", selected: false, hovered: false },
});

/**
 * Célula da grade.
 *
 * ⚠️ `text-body-sm` na base NÃO é redundante com o `ganttGridLabelText`.
 *
 * Só a PRIMEIRA célula usa aquele estilo; as outras (data, duração, %) não
 * tinham preset nenhum e herdavam os **16px do body** — medido: numa linha de
 * 44px a data renderizava em 16px, quase o dobro do vizinho, e a coluna parecia
 * outro componente. É a L-007 na prática: tipografia avulsa por omissão.
 */
export const ganttGridCell = tv({
  base: [
    /**
     * `relative` é a origem dos conectores de árvore; `self-stretch` é o que os
     * faz FUNCIONAR.
     *
     * ⚠️ Sem `self-stretch`, a célula encolhe pro conteúdo: medido, **32px numa
     * linha de 48**, porque a linha é `flex items-center`. O conector vivia num
     * `inset-y-0` de 32px, sobrava 8px em cima e 8 embaixo, e as verticais de
     * linhas consecutivas NÃO SE TOCAVAM — a árvore virava uma fileira de
     * tracinhos soltos em vez de um eixo contínuo.
     *
     * O `items-center` interno continua centrando o conteúdo; só a caixa cresce.
     */
    "relative self-stretch flex min-w-0 shrink-0 items-center gap-gp-sm overflow-hidden px-pad-2xl",
    /**
     * A ÚLTIMA célula respira 24px à direita, não 16.
     *
     * Medido: o conteúdo da última coluna terminava a ~16px do divisor de 3px, e
     * as duas linhas verticais (a borda da célula e o divisor) somadas ao texto
     * apertado ali faziam a coluna parecer cortada. 24px separa "fim do dado" de
     * "fim do painel".
     */
    "last:pr-pad-4xl",
    // ⚠️ Sem cor na base: quem decide é a variante `tone`. Com `text-fg-default`
    // aqui, as duas classes empatavam e a ordem no CSS gerado decidia.
    "text-body-sm",
  ],
  variants: {
    align: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    /** Coluna de número/data: `tabular-nums` pra alinhar dígito com dígito. */
    numeric: { true: "tabular-nums", false: "" },
    /**
     * #6 — hierarquia dentro da linha.
     *
     * O nome da tarefa é a informação; data, duração e responsável são apoio.
     * Com todos em `fg-default` e o mesmo peso, as quatro colunas disputavam a
     * atenção e a grade lia como um bloco de texto. `muted` + `font-normal`
     * recua o apoio sem escondê-lo.
     */
    tone: {
      default: "text-fg-default",
      muted: "font-normal text-fg-muted",
    },
  },
  defaultVariants: { align: "left", numeric: false, tone: "default" },
});

/**
 * #1 — a linha `summary` é um CABEÇALHO de grupo, não uma linha de dados.
 *
 * Ela atravessa a grade inteira em vez de caber na primeira coluna. Confinada,
 * "1. Descoberta e escopo" truncava em "1. Desco…" com as colunas de Duração e
 * Resp. vazias ao lado — texto cortado por causa de espaço que estava logo ali,
 * sem uso. É o mesmo tratamento que linha de grupo recebe em data grid.
 */
export const ganttGridGroupCell = tv({
  base: [
    // `self-stretch` pelo mesmo motivo da célula — ver a nota do `ganttGridCell`.
    "relative self-stretch flex min-w-0 flex-1 items-center gap-gp-sm overflow-hidden",
    // `pr-pad-4xl` porque é ele que carrega o `trailing` (o chip de status) — e
    // era o chip que encostava no divisor.
    "pl-pad-2xl pr-pad-4xl text-body-sm font-semibold text-fg-default",
  ],
});

/**
 * Conectores de árvore — o "├" e o "└" que ligam a linha ao pai.
 *
 * ## Por que virou conector e não guia
 *
 * A primeira versão desenhava só a vertical por nível ("guia"), e ficou ruim:
 * a linha passava ao lado do nome sem tocá-lo, então lia como divisória de
 * coluna, não como vínculo. O que diz "sou filho DESTE" é o **cotovelo** — a
 * vertical que desce do pai e vira à direita na altura do meu texto.
 *
 * ## Anatomia de uma coluna de recuo
 *
 * Cada nível de profundidade tem uma coluna de 16px. Numa linha em `depth d`:
 *
 *   colunas 0 .. d-2   →  PASS-THROUGH: só a vertical, e só se o ancestral
 *                          daquele nível ainda tiver irmão abaixo
 *   coluna  d-1        →  o COTOVELO desta linha:
 *                          vertical do topo até o meio (sempre)
 *                          + vertical do meio até a base (só se NÃO for o último)
 *                          + horizontal do meio até a direita (sempre)
 *
 * Anatomia copiada do `hierarchicalLayout` do `List`, que é a implementação
 * que já pagou o preço de acertar o índice (L-045).
 */
export const ganttTreeRail = tv({
  base: "pointer-events-none absolute inset-y-0 left-pad-2xl",
});

/**
 * Uma coluna de recuo. `relative` porque os segmentos se posicionam dentro dela.
 *
 * ⚠️ A largura tem que ser a MESMA do `paddingLeft: depth * 16` do rótulo. As
 * duas medidas são a mesma coisa em lugares diferentes — se divergirem, o
 * cotovelo aponta pro vazio ao lado do texto (L-038).
 */
export const ganttTreeColumn = tv({
  base: "absolute inset-y-0 w-[16px]",
});

/**
 * Um segmento de linha do conector.
 *
 * ⚠️ `border-input`, e cheguei nele **errando duas vezes o mesmo raciocínio**.
 * ΔL sobre a superfície da grade, no dark:
 *
 *   border-subtle    0.031   = a divisória de linha. O conector se dissolvia
 *                              DENTRO da grade — virava mais uma linha da malha.
 *   border-default   0.040   1ª tentativa. Escrevi aqui que "a linha é curta e o
 *                              olho segue o desenho, o degrau basta" — afirmação
 *                              que eu NÃO verifiquei. Na tela não se via nada.
 *   border-input     0.062   2× a divisória. O conector é um GRAFO deliberado,
 *                              não fundo: tem que ganhar da malha que atravessa.
 *
 * A lição é a mesma que já me pegou na virada de mês e no divisor dos painéis:
 * trocar de token e conferir que o VALOR mudou não é conferir que a mudança se
 * VÊ. Aqui eu ainda por cima escrevi a garantia no comentário (L-060).
 */
export const ganttTreeSegment = tv({
  base: "absolute bg-border-input",
});
export const ganttGridLabel = tv({
  base: "flex min-w-0 flex-col justify-center",
});

export const ganttGridLabelText = tv({
  base: "truncate text-body-sm text-fg-default",
});

export const ganttGridSublabel = tv({
  base: "truncate text-caption-sm font-normal text-fg-muted",
});

/**
 * Chevron do collapse.
 *
 * Rotação e não dois ícones: com dois ícones o nó troca no DOM e a transição
 * não acontece — o chevron "pisca" em vez de girar.
 */
export const ganttChevron = tv({
  base: [
    "grid size-icon-md shrink-0 place-items-center rounded-radius-sm",
    "text-fg-subtle transition-transform duration-200",
    "hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "[&_svg]:size-icon-sm",
  ],
  variants: {
    open: { true: "rotate-0", false: "-rotate-90" },
    /** Folha: reserva o espaço sem desenhar o chevron, pra o rótulo alinhar. */
    hidden: { true: "invisible", false: "" },
  },
  defaultVariants: { open: true, hidden: false },
});

/* ═══════════════════════════════════════════════════ o canvas ══ */

export const ganttCanvasScroll = tv({
  base: [
    // `overflow-auto` nos dois eixos: é ele que rola o cabeçalho junto (#5).
    "min-h-0 flex-1 overflow-auto",
    // `scrollbar-thin` é a barra do DS — `@utility` do tema GERADO, existe nos
    // 4 canais (não é do globals.css).
    "scrollbar-thin",
  ],
});

/** Camada de posicionamento — `relative`, e é a origem de todo `top`/`left`. */
export const ganttCanvas = tv({
  base: "relative",
});

/** Linha de fundo do canvas — o par visual da linha da grade esquerda. */
export const ganttCanvasRow = tv({
  base: [
    "absolute inset-x-0 border-b border-border-subtle",
    "transition-colors duration-150",
  ],
  variants: {
    type: {
      task: "",
      summary: "bg-bg-subtle/60",
      milestone: "",
    },
    hovered: { true: "bg-bg-muted", false: "" },
    selected: { true: "", false: "" },
  },
  compoundVariants: [
    { selected: true, class: "bg-bg-brand-subtle" },
    { selected: true, hovered: true, class: "bg-bg-brand-subtle-hover" },
  ],
  defaultVariants: { type: "task", hovered: false, selected: false },
});

/** Coluna vertical de grade, sombreando fim de semana. */
export const ganttGridColumn = tv({
  base: [
    /**
     * #1 — `border-border-subtle`, a MESMA cor das divisórias de linha.
     *
     * Era `border-chart-grid`, que é o token da grade de GRÁFICO e vem mais
     * claro de propósito (num chart a grade é fundo, não estrutura). Aqui as
     * duas famílias de linha formam uma malha: com tons diferentes, a vertical
     * lia como sombra da horizontal.
     */
    "absolute inset-y-0 border-r border-border-subtle",
    "transition-colors duration-150",
  ],
  variants: {
    weekend: { true: "bg-bg-subtle/50", false: "" },
    /** Coluna sob o cursor — a outra metade da mira. */
    hovered: { true: "bg-bg-muted", false: "" },
    /** #7 — coluna da linha selecionada, no verde da marca. */
    selected: { true: "bg-bg-brand-subtle", false: "" },
    /**
     * #1 — virada de mês/ano: o par da divisória do cabeçalho, MESMAS classes.
     * A tabela de ΔL que justifica a escolha do token está no `ganttHeadCell`.
     */
    boundary: { true: "border-r-[2px] border-r-border-input", false: "" },
  },
  defaultVariants: {
    weekend: false,
    hovered: false,
    selected: false,
    boundary: false,
  },
});

/* ═══════════════════════════════════════════════════ a barra ══ */

/**
 * A barra.
 *
 * `absolute` porque a posição vem de `left`/`width` calculados em px a partir da
 * data — não de grid nem de flex. Grid de N colunas parece mais limpo até a
 * primeira barra que começa às 14h de um dia: ela não cai em limite de coluna.
 */
export const ganttBar = tv({
  slots: {
    root: [
      "group/bar absolute flex min-w-0 items-center gap-gp-2xs",
      "overflow-hidden border text-left outline-none",
      "rounded-radius-sm",
      "transition-[background-color,border-color,box-shadow] duration-150",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    ],
    /** Acento sólido na borda esquerda — é AQUI que a cor viva mora. */
    accent: "pointer-events-none absolute inset-y-0 left-0 w-[3px]",
    /** Preenchimento de progresso, sobre o tingido. */
    progress: "pointer-events-none absolute inset-y-0 left-0",
    label: "relative z-[1] min-w-0 truncate pl-pad-md pr-pad-md text-caption-sm text-fg-default",
  },
  variants: {
    /**
     * ⚠️ A cor entra no fundo TINGIDO e no acento, nunca no texto — ver a nota
     * do topo. As chaves de chart usam `/14`, que é a mesma proporção do
     * `color-mix(… 14%, transparent)` com que o DS deriva os `-subtle`.
     */
    colorKey: {
      "chart-1": {
        root: "border-chart-1/40 bg-chart-1/14 hover:bg-chart-1/20",
        accent: "bg-chart-1",
        progress: "bg-chart-1/35",
      },
      "chart-2": {
        root: "border-chart-2/40 bg-chart-2/14 hover:bg-chart-2/20",
        accent: "bg-chart-2",
        progress: "bg-chart-2/35",
      },
      "chart-3": {
        root: "border-chart-3/40 bg-chart-3/14 hover:bg-chart-3/20",
        accent: "bg-chart-3",
        progress: "bg-chart-3/35",
      },
      "chart-4": {
        root: "border-chart-4/40 bg-chart-4/14 hover:bg-chart-4/20",
        accent: "bg-chart-4",
        progress: "bg-chart-4/35",
      },
      "chart-5": {
        root: "border-chart-5/40 bg-chart-5/14 hover:bg-chart-5/20",
        accent: "bg-chart-5",
        progress: "bg-chart-5/35",
      },
      brand: {
        root: "border-border-brand-subtle bg-bg-brand-subtle hover:bg-bg-brand-subtle-hover",
        accent: "bg-bg-brand",
        progress: "bg-bg-brand/30",
      },
      success: {
        root: "border-border-success-muted bg-bg-success-muted hover:bg-bg-success-muted-hover",
        accent: "bg-bg-success",
        progress: "bg-bg-success/30",
      },
      warning: {
        root: "border-border-warning-muted bg-bg-warning-muted hover:bg-bg-warning-muted-hover",
        accent: "bg-bg-warning",
        progress: "bg-bg-warning/30",
      },
      danger: {
        root: "border-border-danger-muted bg-bg-danger-muted hover:bg-bg-danger-muted-hover",
        accent: "bg-bg-danger",
        progress: "bg-bg-danger/30",
      },
      info: {
        root: "border-border-info-muted bg-bg-info-muted hover:bg-bg-info-muted-hover",
        accent: "bg-bg-info",
        progress: "bg-bg-info/30",
      },
      neutral: {
        root: "border-border-default bg-bg-muted hover:bg-bg-subtle",
        accent: "bg-fg-subtle",
        progress: "bg-fg-subtle/25",
      },
    },
    /**
     * `summary` é mais baixa e sem acento: ela agrega, não é trabalho. As
     * referências desenham as pontas viradas pra baixo; aqui o sinal é a altura
     * reduzida e o radius menor, que sobrevive em 4px de largura por dia.
     */
    type: {
      task: { root: "" },
      summary: { root: "rounded-radius-xs", accent: "hidden" },
      milestone: { root: "!border-0 !bg-transparent", accent: "hidden", label: "hidden" },
    },
    /** Barra que atravessa a janela: perde o canto e a borda daquele lado. */
    continuesBefore: { true: { root: "rounded-l-none border-l-0" }, false: {} },
    continuesAfter: { true: { root: "rounded-r-none border-r-0" }, false: {} },
    /** Vínculo violado — marcação não-cromática somada à cor. */
    conflict: {
      true: { root: "!border-border-danger-muted border-dashed" },
      false: {},
    },
    /** No caminho crítico: anel externo, sem trocar a cor da categoria. */
    critical: {
      true: { root: "ring-2 ring-bg-danger/50 ring-offset-0" },
      false: {},
    },
    dragging: {
      // ⚠️ Sem `transition`: o transform do dnd-kit muda a cada movimento do
      // ponteiro, e transição em cima disso faz a barra perseguir o cursor com
      // atraso. A transição vive no estado em repouso.
      true: { root: "z-[4] cursor-grabbing opacity-90 shadow-sh-lg transition-none" },
      false: {},
    },
    movable: { true: { root: "cursor-grab" }, false: { root: "cursor-pointer" } },
  },
  defaultVariants: {
    colorKey: "chart-1",
    type: "task",
    continuesBefore: false,
    continuesAfter: false,
    conflict: false,
    critical: false,
    dragging: false,
    movable: false,
  },
});

/** Losango do marco. Ponto no tempo, não intervalo — duração é ignorada. */
export const ganttMilestone = tv({
  base: [
    "absolute grid place-items-center outline-none",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "[&>span]:block [&>span]:size-[12px] [&>span]:rotate-45 [&>span]:rounded-[2px]",
  ],
  variants: {
    colorKey: {
      "chart-1": "[&>span]:bg-chart-1",
      "chart-2": "[&>span]:bg-chart-2",
      "chart-3": "[&>span]:bg-chart-3",
      "chart-4": "[&>span]:bg-chart-4",
      "chart-5": "[&>span]:bg-chart-5",
      brand: "[&>span]:bg-bg-brand",
      success: "[&>span]:bg-bg-success",
      warning: "[&>span]:bg-bg-warning",
      danger: "[&>span]:bg-bg-danger",
      info: "[&>span]:bg-bg-info",
      neutral: "[&>span]:bg-fg-subtle",
    },
  },
  defaultVariants: { colorKey: "brand" },
});

/** Punho de resize nas pontas. Revelado no hover da barra. */
export const ganttResizeHandle = tv({
  base: [
    "absolute inset-y-0 z-[2] w-[8px] cursor-col-resize",
    "opacity-0 transition-opacity duration-150",
    "group-hover/bar:opacity-100 focus-visible:opacity-100",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "before:absolute before:inset-y-[6px] before:left-1/2 before:w-[2px]",
    "before:-translate-x-1/2 before:rounded-radius-full before:bg-fg-default/40",
    "before:content-['']",
  ],
  variants: {
    side: { start: "left-0", end: "right-0" },
  },
});

/**
 * Conector de vínculo — o pontinho de onde se arrasta pra criar a seta.
 *
 * Fora da barra (`-left-*`/`-right-*`) e não dentro: dentro, ele competiria com
 * o punho de resize pelo mesmo pixel, e o usuário acertaria o errado.
 */
export const ganttLinkPort = tv({
  base: [
    "absolute top-1/2 z-[3] size-[9px] -translate-y-1/2 cursor-crosshair",
    "rounded-radius-full border-2 border-bg-surface bg-fg-subtle",
    "opacity-0 transition-opacity duration-150",
    "group-hover/bar:opacity-100 focus-visible:opacity-100",
    "hover:bg-bg-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
  variants: {
    side: { start: "-left-[13px]", end: "-right-[13px]" },
  },
});

/* ══════════════════════════════════════════════════ as setas ══ */

/**
 * Camada SVG dos vínculos.
 *
 * ⚠️ **Irmã do canvas, não filha da célula** — e `pointer-events-none` na
 * camada, reativado só nos paths.
 *
 * Filha da célula, ela seria recortada pelo `overflow` de qualquer ancestral, e
 * a seta desapareceria ao sair da linha de origem. É o mesmo defeito que o
 * `DragOverlay` resolveu no `Scheduler` — lá o bloco arrastado sumia atrás das
 * grades, por clipping de 3 ancestrais.
 */
export const ganttLinksLayer = tv({
  base: "pointer-events-none absolute inset-0 z-[3] overflow-visible",
});

/**
 * A linha-fantasma enquanto o usuário arrasta pra criar um vínculo.
 *
 * Tracejada e na cor da marca: tracejado diz "ainda não existe" (vínculo real
 * é sólido) e a marca diz "isto é o seu gesto", separando-a das setas já
 * desenhadas. Sem ela o usuário arrasta no vazio e não sabe se o gesto pegou.
 */
export const ganttLinkGhost = tv({
  base: [
    "pointer-events-none fill-none",
    "stroke-bg-brand stroke-2 [stroke-dasharray:5_4]",
  ],
});

export const ganttLinkPath = tv({
  base: [
    "pointer-events-auto fill-none cursor-pointer",
    "transition-[stroke,stroke-width] duration-150",
  ],
  variants: {
    state: {
      default: "stroke-fg-subtle stroke-[1.5] hover:stroke-fg-default hover:stroke-2",
      /** Violado: tracejado + cor de perigo. Duplo canal, não só cor. */
      conflict: "stroke-bg-danger stroke-2 [stroke-dasharray:4_3]",
      critical: "stroke-bg-danger stroke-2",
    },
  },
  defaultVariants: { state: "default" },
});

/** Ponta de seta. `context-stroke` herda a cor do path sem duplicar variante. */
export const ganttLinkArrow = tv({
  base: "fill-[context-stroke]",
});

/* ════════════════════════════════════════════════ linha do hoje ══ */

export const ganttNowLine = tv({
  base: "pointer-events-none absolute inset-y-0 z-[2] w-0",
});

export const ganttNowStroke = tv({
  base: "absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-bg-danger",
});

/**
 * Ponta da linha do "hoje".
 *
 * ⚠️ Sem `-translate-y-1/2`. A primeira versão tinha, e a bolinha saía
 * **cortada pela metade**: a metade de cima caía fora do contêiner, que tem
 * `overflow`. Não era z-index — era recorte, o mesmo diagnóstico que eu errei
 * primeiro no `DragOverlay` do Scheduler.
 *
 * ⛔ Houve aqui uma etiqueta com a data ("17 set") ancorada no cabeçalho.
 * REMOVIDA a pedido (#2): no cabeçalho ela cobria justamente o par
 * abreviação+número da coluna de hoje — trocava uma informação por outra em
 * cima da mesma. A linha vermelha basta pra localizar o dia, e a data já está
 * na própria coluna do eixo, embaixo dela.
 */
export const ganttNowDot = tv({
  base: [
    "absolute left-0 top-0 size-[7px] -translate-x-1/2",
    "rounded-radius-full bg-bg-danger",
  ],
});

/* ════════════════════════════════════════════ visão calendário ══ */

/**
 * ⚠️ Grade de mês PRÓPRIA do `Gantt`, não a do `Scheduler`.
 *
 * A spec §5 registra a decisão e o preço: delegar criaria acoplamento por
 * herança de propósito — necessidade nova do Gantt viraria mudança numa API
 * publicada que serve outros consumidores. O preço é haver duas grades no repo,
 * com consistência garantida por revisão e não por construção.
 */
export const ganttMonthFrame = tv({
  base: [
    "flex min-h-0 flex-1 flex-col overflow-hidden",
    "rounded-radius-xl border border-border-default bg-bg-surface",
  ],
});

export const ganttWeekdayRow = tv({
  base: "grid shrink-0 grid-cols-7 border-b border-border-default bg-bg-table-head",
});

export const ganttWeekdayCell = tv({
  base: [
    "px-pad-md py-pad-md text-center",
    "text-caption-sm font-semibold uppercase text-fg-muted",
  ],
});

export const ganttMonthGrid = tv({
  base: "grid min-h-0 flex-1 grid-cols-7 grid-rows-6",
});

export const ganttMonthCell = tv({
  base: [
    "flex min-h-0 min-w-0 flex-col gap-gp-2xs overflow-hidden",
    "border-b border-r border-border-subtle p-pad-sm",
    "[&:nth-child(7n)]:border-r-0",
    "transition-colors duration-150",
  ],
  variants: {
    /** Dia de fora do mês âncora: presente, mas recuado. */
    outside: { true: "bg-bg-subtle/40 text-fg-subtle", false: "" },
    today: { true: "bg-bg-brand-subtle", false: "" },
    weekend: { true: "bg-bg-subtle/30", false: "" },
  },
  defaultVariants: { outside: false, today: false, weekend: false },
});

export const ganttDayNumber = tv({
  base: "text-caption-sm tabular-nums text-fg-muted",
  variants: {
    today: {
      true: [
        "grid size-icon-lg place-items-center rounded-radius-full",
        "bg-bg-brand font-semibold text-fg-on-brand",
      ],
      false: "",
    },
  },
  defaultVariants: { today: false },
});

/** Chip de barra dentro da célula do mês. */
export const ganttDayChip = tv({
  slots: {
    root: [
      "flex w-full min-w-0 items-center gap-gp-2xs",
      "min-h-comp-2xs rounded-radius-sm border px-pad-sm",
      "text-left outline-none transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    ],
    dot: "size-[7px] shrink-0 rounded-radius-full",
    label: "min-w-0 flex-1 truncate text-caption-sm text-fg-default",
  },
  variants: {
    colorKey: {
      "chart-1": { root: "border-chart-1/40 bg-chart-1/14", dot: "bg-chart-1" },
      "chart-2": { root: "border-chart-2/40 bg-chart-2/14", dot: "bg-chart-2" },
      "chart-3": { root: "border-chart-3/40 bg-chart-3/14", dot: "bg-chart-3" },
      "chart-4": { root: "border-chart-4/40 bg-chart-4/14", dot: "bg-chart-4" },
      "chart-5": { root: "border-chart-5/40 bg-chart-5/14", dot: "bg-chart-5" },
      brand: { root: "border-border-brand-subtle bg-bg-brand-subtle", dot: "bg-bg-brand" },
      success: { root: "border-border-success-muted bg-bg-success-muted", dot: "bg-bg-success" },
      warning: { root: "border-border-warning-muted bg-bg-warning-muted", dot: "bg-bg-warning" },
      danger: { root: "border-border-danger-muted bg-bg-danger-muted", dot: "bg-bg-danger" },
      info: { root: "border-border-info-muted bg-bg-info-muted", dot: "bg-bg-info" },
      neutral: { root: "border-border-default bg-bg-muted", dot: "bg-fg-subtle" },
    },
  },
  defaultVariants: { colorKey: "chart-1" },
});

export const ganttOverflowButton = tv({
  base: [
    "w-full truncate rounded-radius-sm px-pad-sm py-[2px] text-left",
    "text-caption-sm font-medium text-fg-muted",
    "transition-colors duration-150",
    "hover:bg-bg-muted hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
});

/* ══════════════════════════════════════════════════ auxiliares ══ */

export const ganttEmpty = tv({
  base: [
    "flex min-h-[200px] flex-1 flex-col items-center justify-center gap-gp-md",
    "px-pad-3xl py-pad-3xl text-center",
  ],
});

export const ganttEmptyText = tv({
  base: "text-body-sm text-fg-muted",
});

/** Aviso de largura insuficiente — declarado, não escondido. */
export const ganttNarrowNotice = tv({
  base: [
    "flex flex-col items-center justify-center gap-gp-md",
    "rounded-radius-xl border border-border-default bg-bg-subtle",
    "px-pad-3xl py-pad-3xl text-center",
  ],
});
