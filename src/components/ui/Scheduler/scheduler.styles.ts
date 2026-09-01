import { tv, type VariantProps } from "@/utils/tv";

/**
 * Fonte única do visual do `Scheduler`. Nenhum componente da pasta escreve
 * classe de estilo inline — quem quiser mudar a pele muda AQUI (regra de ouro
 * do DS).
 *
 * ⛔ Nada aqui importa de `../TableToolbar`. A gramática visual da toolbar
 * (segmented, busca, chip aplicado) é **copiada** de
 * `TableToolbar/table-toolbar.styles.ts`, não importada — cross-import entre
 * pastas de `ui/` é o que gerou o `registryDependency` dangling da L-049 no
 * `DataList`: `@igreen/table-toolbar` não existe como item de registry, então
 * `igreen:add scheduler` estrearia quebrado no consumidor de copy-in enquanto
 * `tsc` e showcase ficam verdes. O custo aceito é manter as duas cópias em
 * sync na mão; a alternativa era um defeito invisível justamente onde a gente
 * não olha (spec §4.1).
 */

/* ────────────────────────────────────────────────────────────────────────
 * Root
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * `h-full` (não só `min-h-0`) é o que impede o painel de filtro de esticar a
 * altura da linha inteira.
 *
 * Sem ele o root dimensionava por CONTEÚDO: a coluna do painel, que é uma pilha
 * de mini-calendário + grupos, ficava mais alta que a grade e passava a mandar
 * na altura das duas — no exemplo do showcase isso vazava pra fora do
 * `h-[720px]` e cortava. Com `h-full`, o root ocupa o pai, `schedulerBody` é
 * `flex-1 min-h-0`, e o painel rola por dentro em vez de crescer.
 *
 * Em pai de altura automática, `height: 100%` resolve contra `auto` e se
 * comporta como `auto` — ou seja, não piora o caso "esqueci de dar altura", que
 * segue documentado como gotcha nº 1 do USAGE.
 */
export const schedulerRoot = tv({
  base: [
    "flex h-full min-h-0 w-full flex-col gap-gp-2xl",
    "text-fg-default",
  ],
});

/* ────────────────────────────────────────────────────────────────────────
 * Toolbar — spec §4
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Uma linha em desktop, quebra em duas abaixo de ~1024px. `flex-wrap` +
 * `justify-between` em vez de grid de 2 colunas: os dois lados têm largura de
 * conteúdo (o título muda de tamanho por mês e por view), e grid obrigaria a
 * fixar uma fração que sobra ou falta.
 */
export const schedulerToolbar = tv({
  base: [
    "flex flex-wrap items-center justify-between gap-gp-xl",
  ],
});

export const schedulerToolbarSide = tv({
  base: "flex min-w-0 flex-wrap items-center gap-gp-md",
});

/**
 * Título do período ("setembro 2026"). `text-title-sm` e não `heading`: o
 * calendário mora dentro de uma página que já tem `PageHeader` com o H1 — um
 * heading aqui competiria com ele.
 *
 * `first-letter:uppercase` porque o date-fns com locale ptBR devolve o mês em
 * minúscula ("setembro"), e no topo de um bloco isso lê como texto cortado.
 * Capitalizar no CSS e não no JS mantém a string original acessível a quem
 * usa `title` como override.
 */
export const schedulerTitle = tv({
  base: [
    "min-w-0 truncate text-title-sm font-semibold text-fg-default",
    "first-letter:uppercase",
  ],
});

/* ── Grupo de navegação: ‹ | Hoje | › ──────────────────────────────── */

/**
 * Três segmentos colados num controle só. Não usa o `ButtonGroup` do DS de
 * propósito: ele resolve o **split button** (2 slots, `Primary` + `Chevron`,
 * com os cantos já decididos em `!rounded-r-none` / `!rounded-l-none`) e não
 * tem como expressar um segmento do MEIO sem canto nenhum. Forçá-lo aqui
 * exigiria brigar com os `!` dele.
 *
 * O que este grupo faz é só a junta: os três filhos continuam sendo `Button`
 * do DS, então cor, foco, altura e estados vêm de lá.
 *
 * `-ml-px` no 2º em diante colapsa a borda dupla entre segmentos vizinhos.
 */
export const schedulerNavGroup = tv({
  base: [
    "inline-flex shrink-0 items-center",
    "[&>*:not(:first-child)]:-ml-px",
    // O segmento com foco sobe pra que o anel não seja cortado pelo vizinho.
    "[&>*:focus-visible]:relative [&>*:focus-visible]:z-[1]",
    "[&>*:first-child]:!rounded-r-none",
    "[&>*:last-child]:!rounded-l-none",
    "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
  ],
});

/* ── Dropdown de view (Mês · Semana · Dia · Lista) ─────────────────── */

/**
 * Substituiu o segmented de 4 posições. O segmented mostrava as 4 opções de
 * uma vez, o que é bom, mas custava ~230px numa toolbar que agora também tem
 * botão de filtro — em 1280px ele empurrava a ação primária pra segunda linha.
 * O dropdown custa ~110px e diz qual view está ativa no próprio rótulo.
 */
export const schedulerViewTriggerLabel = tv({
  base: "tabular-nums",
});

export const schedulerViewMenuItem = tv({
  base: "flex items-center justify-between gap-gp-xl",
});

/* ── Botão de filtro ───────────────────────────────────────────────── */

/**
 * Ponto de "tem filtro aplicado" no canto do botão — mesma convenção do
 * `toolbarToolDot` do `TableToolbar`. `border-2 border-bg-canvas` recorta o
 * ponto do botão embaixo, senão ele parece um pixel sujo na borda.
 */
export const schedulerFilterDot = tv({
  base: [
    "pointer-events-none absolute -right-[4px] -top-[4px] z-[2]",
    "size-[13px] rounded-radius-full",
    "bg-bg-brand border-2 border-bg-canvas",
  ],
});

/* ── Busca (cópia da gramática do `toolbarSearch`) ─────────────────── */

export const schedulerSearch = tv({
  base: [
    "relative flex cursor-text items-center gap-gp-md",
    "h-form-lg rounded-radius-lg px-pad-lg",
    "bg-bg-surface dark:bg-bg-muted",
    "border border-border-subtle dark:border-border-input",
    "shadow-sh-sm dark:shadow-sh-none",
    "text-fg-default",
    "min-w-0 flex-1 md:flex-initial",
    "md:w-[200px] md:focus-within:w-[300px]",
    "transition-[width,border-color,background-color,box-shadow] duration-200",
    "focus-within:border-border-brand focus-within:shadow-sh-ring",
    "[&_svg]:size-icon-sm [&_svg]:shrink-0 [&_svg]:text-fg-muted",
  ],
  variants: {
    /** Mantém expandido mesmo sem foco quando já há termo digitado. */
    expanded: { true: "md:w-[300px]", false: "" },
  },
  defaultVariants: { expanded: false },
});

export const schedulerSearchInput = tv({
  base: [
    "min-w-0 flex-1 border-0 bg-transparent outline-none",
    "text-body-sm font-normal text-fg-default",
    "placeholder:text-fg-muted",
  ],
});

/* ── Chips de filtro (cópia da gramática do `toolbarAppliedChip`) ──── */

export const schedulerFilterRow = tv({
  base: [
    "flex items-center gap-gp-md",
    "flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-x-visible",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ],
});

/**
 * Chip de filtro **aplicado**. Desde que o painel lateral passou a ser o lugar
 * de escolher, esta linha não mostra mais chip vazio de borda tracejada: ela é
 * só o resumo do que está ligado, com o `×` pra desligar sem reabrir o painel
 * — que é o que a L-051 pede (o estado filtrado tem que ser visível e
 * desfazível sem procurar o controle que o produziu).
 *
 * A variante `applied` continua no tv() porque o `false` ainda serve pro caso
 * de um chip renderizado durante a animação de saída.
 */
export const schedulerFilterChip = tv({
  base: [
    "inline-flex shrink-0 cursor-pointer items-center gap-gp-sm",
    "h-form-md rounded-radius-lg pl-pad-lg pr-pad-md",
    "bg-bg-surface dark:bg-bg-muted",
    "border text-body-xs font-normal text-fg-default",
    "transition-[background-color,border-color] duration-150",
    "hover:bg-bg-muted-hover hover:border-border-default dark:hover:bg-bg-accent",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "[&_svg]:size-icon-xs [&_svg]:shrink-0 [&_svg]:text-fg-subtle",
  ],
  variants: {
    applied: {
      true: "border-solid border-border-brand bg-bg-brand-subtle dark:bg-bg-brand-subtle",
      false: "border-dashed border-border-input",
    },
  },
  defaultVariants: { applied: false },
});

export const schedulerFilterChipName = tv({
  base: "font-semibold text-fg-default",
});

export const schedulerFilterChipValue = tv({
  base: [
    "inline-flex h-comp-2xs items-center px-pad-md",
    "rounded-radius-sm bg-bg-muted dark:bg-bg-accent",
    "text-body-xs font-medium text-fg-default",
  ],
});

export const schedulerClearLink = tv({
  base: [
    "ml-pad-sm cursor-pointer border-0 bg-transparent p-0",
    "text-body-xs font-medium text-fg-brand outline-none",
    "underline-offset-2 transition-opacity duration-150",
    "hover:underline focus-visible:underline",
  ],
});

/* ────────────────────────────────────────────────────────────────────────
 * Layout de duas colunas — grade + painel de filtro
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * A área abaixo da toolbar. O painel de filtro é uma **coluna de verdade**, não
 * um overlay: ele empurra a grade em vez de cobri-la.
 *
 * É a diferença que importa aqui. Um `Popover`/`Sheet` por cima obriga a
 * fechar pra ver o efeito do filtro — e filtro é exatamente o controle cujo
 * resultado você quer olhar enquanto mexe. Como coluna, marcar uma caixa e ver
 * a grade reagir acontece no mesmo gesto.
 *
 * O custo é largura: a grade encolhe ~296px. Por isso o painel é fechado por
 * default e some abaixo de `lg` (ver `schedulerFilterAside`).
 */
export const schedulerBody = tv({
  base: "flex min-h-0 flex-1 gap-gp-2xl",
});

export const schedulerMain = tv({
  base: "flex min-h-0 min-w-0 flex-1 flex-col",
});

/**
 * `w-[280px] shrink-0` — largura fixa, não fração: o mini-calendário tem 7
 * colunas de largura mínima e uma fração de viewport o quebraria em telas
 * médias.
 *
 * ⚠️ **Não há media query aqui, de propósito.** A primeira versão tinha
 * `hidden lg:flex`, e o `scheduler.tsx` gateava o botão de filtro com um
 * `matchMedia("(min-width: 1024px)")` — o MESMO breakpoint escrito em dois
 * lugares, com dois mecanismos diferentes. Medido no browser: dá pra chegar num
 * estado em que o botão se diz aberto e o painel está `display: none`, ou seja
 * um controle que não faz nada visível.
 *
 * Agora o breakpoint vive **só** no `useMediaQuery` do `scheduler.tsx`, que
 * decide se o painel é montado. Uma fonte de verdade: painel no DOM ⟺ botão
 * diz aberto. Se o hook estiver defasado, os dois estão defasados juntos —
 * consistente, em vez de contraditório.
 */
export const schedulerFilterAside = tv({
  base: [
    "flex w-[280px] min-h-0 shrink-0 flex-col overflow-y-auto",
    // `scrollbar-thin` é a barra do DS (26 usos no repo contra 2 do
    // `scrollbar-default`) — trilho transparente + thumb tokenizado.
    // ⚠️ É `@utility` do tema GERADO, não do globals.css: existe nos 4 canais.
    "scrollbar-thin",
    "rounded-radius-xl border border-border-default bg-bg-surface",
  ],
});

/**
 * Seção do painel — **inteiriça**, com padding próprio, e a divisória de ponta
 * a ponta entre uma e outra.
 *
 * O painel não tem padding nem gap: quem paga o respiro é a seção. É o que faz
 * a linha divisória chegar até as bordas do card, do jeito que se espera de uma
 * pilha de blocos. Com padding no container e `gap`, a divisória ficaria
 * recuada dos dois lados e leria como sublinhado de um item, não como separação
 * entre blocos.
 *
 * `last:border-b-0` fecha a última: a borda do card já encerra a pilha, e uma
 * divisória imediatamente antes dela vira duas linhas paralelas a 1px.
 */
export const schedulerAsideSection = tv({
  base: [
    "flex shrink-0 flex-col gap-gp-md",
    "border-b border-border-default p-sp-xl last:border-b-0",
  ],
  variants: {
    /** O cabeçalho é mais raso: só uma linha de título + ações. */
    compact: { true: "py-pad-lg", false: "" },
    /**
     * Cabeçalho fixo no topo enquanto o resto rola.
     *
     * `bg-bg-surface` é **obrigatório** e não decoração: `sticky` não cria
     * fundo, então sem ele o mini-calendário passaria por baixo do título. E
     * `z-[1]` porque as caixas e o `Checkbox` do Radix criam contexto próprio
     * de empilhamento — sem o z, o conteúdo que rola sobrepõe o cabeçalho.
     */
    sticky: { true: "sticky top-0 z-[1] bg-bg-surface", false: "" },
  },
  defaultVariants: { compact: false, sticky: false },
});

export const schedulerAsideHead = tv({
  base: "flex items-center justify-between gap-gp-md",
});

export const schedulerAsideTitle = tv({
  base: "text-body-sm font-semibold text-fg-default",
});

/* ── Mini-calendário do painel ─────────────────────────────────────── */

export const schedulerMiniHead = tv({
  base: "flex items-center justify-between gap-gp-sm",
});

export const schedulerMiniTitle = tv({
  base: "min-w-0 truncate text-body-sm font-semibold text-fg-default first-letter:uppercase",
});

export const schedulerMiniGrid = tv({
  base: "grid grid-cols-7 gap-gp-2xs",
});

export const schedulerMiniWeekday = tv({
  base: [
    "grid size-comp-xs place-items-center",
    "text-caption-xs font-medium uppercase text-fg-subtle",
  ],
});

/**
 * Célula do mini-calendário. `today` é o anel; `selected` é o preenchido — os
 * dois podem coexistir, e é por isso que são variantes separadas em vez de um
 * único `state`. Quando coincidem, o preenchido vence e o anel some (senão
 * viram dois círculos concêntricos de 24px, ilegíveis).
 */
export const schedulerMiniDay = tv({
  base: [
    "grid size-comp-xs cursor-pointer place-items-center rounded-radius-full",
    "border-0 bg-transparent outline-none",
    "text-caption-md tabular-nums",
    "transition-[background-color,color,box-shadow] duration-150",
    "hover:bg-bg-muted",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
  variants: {
    outside: { true: "text-fg-subtle", false: "text-fg-default" },
    hasEvents: { true: "font-semibold", false: "" },
    today: { true: "ring-1 ring-border-brand", false: "" },
    selected: {
      true: "bg-bg-brand font-semibold text-fg-on-brand hover:bg-bg-brand-hover",
      false: "",
    },
  },
  compoundVariants: [
    // Selecionado vence "hoje": um anel em volta do disco cheio não informa
    // nada e adiciona 2px de ruído.
    { selected: true, today: true, class: "ring-0" },
    { selected: true, outside: true, class: "text-fg-on-brand" },
  ],
  defaultVariants: {
    outside: false,
    hasEvents: false,
    today: false,
    selected: false,
  },
});

/* ── Grupos de filtro do painel (caixas coloridas, como no print) ──── */

export const schedulerGroup = tv({
  base: "flex flex-col gap-gp-sm",
});

/**
 * `-mx-pad-sm px-pad-sm`: o fundo do hover sangra 6px pra fora, mas o TEXTO
 * fica alinhado com o padding da seção. Sem o `-mx`, o rótulo do grupo ficaria
 * 6px mais dentro que o título "Filtros" do cabeçalho — desalinho visível numa
 * coluna estreita.
 */
export const schedulerGroupHead = tv({
  base: [
    "flex w-full cursor-pointer items-center justify-between gap-gp-md",
    "min-h-form-sm rounded-radius-sm border-0 bg-transparent -mx-pad-sm px-pad-sm outline-none",
    "text-body-sm font-semibold text-fg-default",
    "transition-colors duration-150",
    "hover:bg-bg-muted",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "[&_svg]:size-icon-sm [&_svg]:shrink-0 [&_svg]:text-fg-subtle",
  ],
});

export const schedulerGroupChevron = tv({
  base: "transition-transform duration-150",
  variants: { open: { true: "", false: "-rotate-90" } },
  defaultVariants: { open: true },
});

/**
 * Linha de opção: `<label>` nativo embrulhando o `Checkbox`, **não**
 * `<button>`. O label propaga o clique pro checkbox real, mantém a semântica
 * de checkbox no leitor de tela e faz a linha inteira ser alvo de clique —
 * é a mesma lição do `CardCheckbox` (L-025).
 */
export const schedulerOption = tv({
  base: [
    "flex cursor-pointer items-center gap-gp-md",
    "min-h-form-sm rounded-radius-sm -mx-pad-sm px-pad-sm",
    "text-body-sm text-fg-default",
    "transition-colors duration-150",
    "hover:bg-bg-muted",
    "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring-brand",
  ],
});

export const schedulerOptionLabel = tv({
  base: "min-w-0 flex-1 truncate",
});

export const schedulerOptionCount = tv({
  base: "shrink-0 text-caption-sm tabular-nums text-fg-subtle",
});

/**
 * Cor da caixa quando marcada. Sobrescreve o `data-[state=checked]:bg-bg-brand`
 * do `Checkbox` via `className` — `tailwind-merge` resolve o par (mesmo
 * modificador, mesmo grupo de utilitário) mantendo o último.
 *
 * O `[&_svg]` é necessário porque o tique mora no `Indicator`, que é filho e
 * não alcançável por className na raiz.
 */
export const schedulerOptionBox = tv({
  base: "shrink-0",
  variants: {
    color: {
      brand:
        "data-[state=checked]:bg-bg-brand data-[state=checked]:border-border-brand [&_svg]:text-fg-on-brand",
      info: "data-[state=checked]:bg-bg-info data-[state=checked]:border-bg-info [&_svg]:text-fg-on-info",
      success:
        "data-[state=checked]:bg-bg-success data-[state=checked]:border-bg-success [&_svg]:text-fg-on-success",
      warning:
        "data-[state=checked]:bg-bg-warning data-[state=checked]:border-bg-warning [&_svg]:text-fg-on-warning",
      danger:
        "data-[state=checked]:bg-bg-danger data-[state=checked]:border-bg-danger [&_svg]:text-fg-on-danger",
      neutral:
        "data-[state=checked]:bg-fg-subtle data-[state=checked]:border-fg-subtle [&_svg]:text-bg-surface",
    },
  },
  defaultVariants: { color: "brand" },
});

/* ────────────────────────────────────────────────────────────────────────
 * Grade do mês — spec §5.1
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * `overflow-hidden` + `rounded` no wrapper, e as células desenham só borda
 * direita/inferior: é o que produz a régua interna sem borda dupla e sem
 * precisar de `:last-child` em 42 células.
 */
export const schedulerMonthFrame = tv({
  base: [
    "flex min-h-0 flex-1 flex-col overflow-hidden",
    "rounded-radius-xl border border-border-default bg-bg-surface",
  ],
});

export const schedulerWeekdayRow = tv({
  base: [
    "grid grid-cols-7 border-b border-border-default bg-bg-subtle dark:bg-bg-canvas",
  ],
});

export const schedulerWeekdayCell = tv({
  base: [
    "flex min-h-form-md items-center justify-center",
    "text-caption-md font-medium text-fg-muted",
    "first-letter:uppercase",
  ],
});

export const schedulerMonthGrid = tv({
  base: "grid min-h-0 flex-1 grid-cols-7 grid-rows-6",
});

/**
 * `[&:nth-child(7n)]:border-r-0` zera a borda direita da última coluna sem
 * precisar passar índice pro componente da célula.
 */
export const schedulerMonthCell = tv({
  base: [
    "group/cell relative flex min-h-comp-4xl min-w-0 flex-col gap-gp-2xs",
    "border-b border-r border-border-subtle p-sp-2xs",
    "[&:nth-child(7n)]:border-r-0",
    "transition-colors duration-150",
  ],
  variants: {
    /** Dia de mês vizinho — recuado, não escondido: a grade é sempre 6×7. */
    outside: {
      true: "bg-bg-subtle/40 dark:bg-bg-canvas",
      false: "bg-bg-surface",
    },
    /** Última linha da grade não desenha borda inferior (o frame já fecha). */
    lastRow: { true: "border-b-0", false: "" },
    interactive: { true: "hover:bg-bg-table-row-hover", false: "" },
  },
  defaultVariants: { outside: false, lastRow: false, interactive: false },
});

export const schedulerDayHead = tv({
  base: "flex shrink-0 items-center justify-between gap-gp-sm",
});

/**
 * Número do dia. `tabular-nums` pra 1 e 11 ocuparem a mesma largura — sem
 * isso a coluna de números "dança" entre as linhas.
 */
export const schedulerDayNumber = tv({
  base: [
    "grid size-comp-xs shrink-0 place-items-center rounded-radius-full",
    "text-body-xs font-medium tabular-nums",
    "transition-colors duration-150",
  ],
  variants: {
    today: {
      true: "bg-bg-brand font-semibold text-fg-on-brand",
      false: "text-fg-default",
    },
    outside: { true: "text-fg-subtle", false: "" },
  },
  compoundVariants: [
    // `today` vence `outside`: o dia de hoje continua marcado mesmo quando
    // aparece como dia vizinho na grade de outro mês.
    { today: true, outside: true, class: "text-fg-on-brand" },
  ],
  defaultVariants: { today: false, outside: false },
});

/**
 * O `+` de criar evento, revelado no hover ou no foco da célula. Fica em
 * `opacity-0` e não em `hidden` pra manter o alvo de foco no fluxo do
 * teclado — `hidden` o tiraria da ordem de tabulação (spec §6.2).
 */
export const schedulerSlotAdd = tv({
  base: [
    "grid size-comp-3xs shrink-0 place-items-center rounded-radius-sm",
    "cursor-pointer border-0 bg-transparent text-fg-subtle outline-none",
    "opacity-0 transition-[opacity,background-color,color] duration-150",
    "group-hover/cell:opacity-100 focus-visible:opacity-100",
    "hover:bg-bg-muted hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "[&_svg]:size-icon-xs",
  ],
});

export const schedulerCellEvents = tv({
  base: "flex min-h-0 flex-col gap-gp-2xs overflow-hidden",
});

export const schedulerOverflowButton = tv({
  base: [
    "flex min-h-comp-2xs w-full cursor-pointer items-center",
    "rounded-radius-sm border-0 bg-transparent px-pad-md",
    "text-caption-sm font-medium text-fg-muted outline-none",
    "transition-colors duration-150",
    "hover:bg-bg-muted hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
});

export const schedulerOverflowPanel = tv({
  base: "flex max-h-[320px] min-w-[240px] flex-col gap-gp-2xs overflow-y-auto p-sp-xs",
});

export const schedulerOverflowPanelTitle = tv({
  base: "px-pad-md pb-pad-sm text-caption-sm font-semibold text-fg-muted first-letter:uppercase",
});

/* ────────────────────────────────────────────────────────────────────────
 * Grade de horas — week e day (a MESMA view, 7 ou 1 coluna) — spec §5.2
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ **`HOUR_HEIGHT_PX` em `views/time-grid.tsx` espelha `h-comp-3xl` (48px).**
 * A altura da hora precisa existir como número em JS porque
 * `minutesToOffset()` posiciona os eventos em px. Se este valor mudar aqui,
 * mude lá — é o acoplamento inevitável de posicionamento absoluto sobre grade
 * tokenizada, e está declarado dos dois lados.
 */
export const schedulerTimeFrame = tv({
  base: [
    "flex min-h-0 flex-1 flex-col overflow-hidden",
    "rounded-radius-xl border border-border-default bg-bg-surface",
  ],
});

/** Cabeçalho de dias: o vão da esquerda alinha com o gutter de horas. */
export const schedulerTimeHead = tv({
  base: "flex shrink-0 border-b border-border-default bg-bg-subtle dark:bg-bg-canvas",
});

/**
 * Largura do gutter de horas. `w-comp-4xl` (56px) cabe "12:00 AM" no formato
 * 12h — o 24h caberia em menos, mas variar a largura por formato faria a grade
 * "pular" ao trocar de idioma.
 */
export const schedulerTimeGutter = tv({
  base: "w-comp-4xl shrink-0",
});

export const schedulerTimeHeadDay = tv({
  base: [
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-gp-2xs",
    "border-l border-border-subtle py-pad-md",
  ],
  variants: {
    /** Sábado/domingo recuados — mesma leitura da grade do mês. */
    weekend: { true: "bg-bg-subtle/40 dark:bg-bg-canvas", false: "" },
  },
  defaultVariants: { weekend: false },
});

export const schedulerTimeHeadWeekday = tv({
  base: "text-caption-md font-medium uppercase text-fg-muted",
});

/** Banda de dia inteiro, entre o cabeçalho e a grade rolável. */
export const schedulerAllDayRow = tv({
  base: "flex shrink-0 border-b border-border-default",
});

export const schedulerAllDayLabel = tv({
  base: [
    "flex w-comp-4xl shrink-0 items-start justify-end",
    "px-pad-md py-pad-sm text-caption-sm text-fg-subtle",
  ],
});

export const schedulerAllDayCell = tv({
  base: [
    "flex min-w-0 flex-1 flex-col gap-gp-2xs",
    "border-l border-border-subtle p-sp-2xs",
  ],
});

/**
 * O corpo rolável. `scrollbar-thin` é a barra do DS; `overscroll-contain` evita
 * que rolar até o fim da grade continue rolando a página atrás.
 */
export const schedulerTimeBody = tv({
  base: "min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin",
});

export const schedulerTimeCanvas = tv({
  base: "relative flex",
});

/**
 * Rótulo da hora. Fica no TOPO da própria faixa, deslocado meia-linha pra cima
 * (`-translate-y-1/2`), que é a convenção de calendário: o rótulo marca a linha,
 * não a faixa. Sem o deslocamento, "09:00" aparece centralizado no bloco das 9h
 * e o usuário lê a linha errada.
 *
 * O primeiro rótulo é ocultado (`first:opacity-0`) porque metade dele sairia
 * acima da área visível.
 */
export const schedulerHourLabel = tv({
  base: [
    "relative flex h-comp-3xl items-start justify-end pr-pad-md",
    "text-caption-sm tabular-nums text-fg-subtle",
    "first:opacity-0",
  ],
});

export const schedulerHourLabelText = tv({
  base: "-translate-y-1/2",
});

export const schedulerTimeColumn = tv({
  base: "relative min-w-0 flex-1 border-l border-border-subtle",
  variants: {
    weekend: { true: "bg-bg-subtle/40 dark:bg-bg-canvas", false: "" },
  },
  defaultVariants: { weekend: false },
});

/**
 * Uma faixa de hora dentro da coluna. É `button` porque é alvo de clique
 * (criar evento naquela hora) — um `div` com `onClick` não é alcançável por
 * teclado nem anunciado como acionável.
 */
export const schedulerHourSlot = tv({
  base: [
    "block h-comp-3xl w-full cursor-pointer",
    "border-b border-border-subtle bg-transparent p-0 outline-none",
    "transition-colors duration-150",
    "hover:bg-bg-table-row-hover",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    "last:border-b-0",
  ],
});

/** Linha do "agora". `pointer-events-none` pra não roubar clique da faixa. */
export const schedulerNowLine = tv({
  base: "pointer-events-none absolute left-0 right-0 z-[2] flex items-center",
});

export const schedulerNowDot = tv({
  base: "-ml-[4px] size-[8px] shrink-0 rounded-radius-full bg-bg-brand",
});

export const schedulerNowStroke = tv({
  base: "h-px flex-1 bg-bg-brand",
});

/** Rótulo "agora" no gutter, alinhado com a linha. */
export const schedulerNowLabel = tv({
  base: [
    "pointer-events-none absolute right-pad-md z-[2] -translate-y-1/2",
    "rounded-radius-xs bg-bg-brand px-pad-sm",
    "text-caption-xs font-semibold tabular-nums text-fg-on-brand",
  ],
});

/* ────────────────────────────────────────────────────────────────────────
 * Agenda (view `list`) — spec §5.3
 * ──────────────────────────────────────────────────────────────────────── */

export const schedulerListFrame = tv({
  base: [
    "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-thin",
    "rounded-radius-xl border border-border-default bg-bg-surface",
  ],
});

export const schedulerListDay = tv({
  base: "flex flex-col gap-gp-md border-b border-border-subtle p-sp-xl last:border-b-0",
});

/**
 * Cabeçalho do dia. `sticky` com fundo opaco: numa agenda longa, saber "que dia
 * é este que estou lendo" é justamente o que se perde ao rolar.
 */
export const schedulerListDayHead = tv({
  base: [
    "sticky top-0 z-[1] -mx-sp-xl -mt-sp-xl px-sp-xl pb-pad-md pt-sp-xl",
    "flex items-baseline gap-gp-md bg-bg-surface",
  ],
});

export const schedulerListDayNumber = tv({
  base: "text-title-sm font-semibold tabular-nums",
  variants: {
    today: { true: "text-fg-brand", false: "text-fg-default" },
  },
  defaultVariants: { today: false },
});

export const schedulerListDayName = tv({
  base: "text-body-sm text-fg-muted first-letter:uppercase",
});

export const schedulerListEvents = tv({
  base: "flex flex-col gap-gp-sm",
});

/* ────────────────────────────────────────────────────────────────────────
 * Evento — spec §2.4 e §5
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ **A cor NUNCA vai no texto.** Medido em WCAG antes de decidir (spec
 * §2.1): `text-fg-{cor}` sobre a pílula tingida dá 1.72–4.49 no claro e
 * 2.97–4.31 no escuro — nenhuma das 6 famílias passa AA, e `warning` chega a
 * 1.72:1. O texto é sempre `fg-default` (17.46–18.42 / 7.45–10.95, AAA nos
 * dois modos) e a cor mora no **tint de fundo, na borda e no dot/barra de
 * acento**. Hierarquia dentro do pill se faz por peso e tamanho, não por cor.
 *
 * Corolário de acessibilidade: cor é reforço, nunca o único portador da
 * informação — o título sempre diz o que o evento é.
 */
export const schedulerEvent = tv({
  base: [
    "group/event relative flex min-w-0 cursor-pointer items-center gap-gp-sm",
    "border text-left outline-none",
    "transition-[background-color,border-color,box-shadow] duration-150",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
  variants: {
    color: {
      brand: "border-border-brand-subtle bg-bg-brand-subtle hover:bg-bg-brand-subtle-hover",
      info: "border-border-info-muted bg-bg-info-muted hover:bg-bg-info-muted-hover",
      success:
        "border-border-success-muted bg-bg-success-muted hover:bg-bg-success-muted-hover",
      warning:
        "border-border-warning-muted bg-bg-warning-muted hover:bg-bg-warning-muted-hover",
      danger:
        "border-border-danger-muted bg-bg-danger-muted hover:bg-bg-danger-muted-hover",
      neutral: "border-border-default bg-bg-muted hover:bg-bg-muted-hover",
    },
    variant: {
      /** Mês: linha de 20px, uma só, sem quebra. */
      pill: "min-h-comp-2xs rounded-radius-sm px-pad-md text-caption-sm",
      /** Week/day: bloco absoluto que ocupa a duração. */
      block:
        "absolute min-h-comp-3xs flex-col items-start gap-0 rounded-radius-md px-pad-md py-pad-sm text-caption-sm",
      /** List/agenda: linha larga com descrição. */
      row: "min-h-form-lg w-full rounded-radius-lg px-pad-xl py-pad-md text-body-sm",
    },
    /** Continuação de evento multi-dia: perde o canto do lado truncado. */
    truncateStart: { true: "rounded-l-none border-l-0", false: "" },
    truncateEnd: { true: "rounded-r-none border-r-0", false: "" },
    /**
     * Enquanto arrasta: sombra alta pra o bloco "sair da superfície", z acima
     * dos vizinhos, e `cursor-grabbing`.
     *
     * ⚠️ **Sem `transition` neste estado.** O `transform` do dnd-kit é atualizado
     * a cada movimento do ponteiro; uma transição em cima dele faz o bloco
     * perseguir o cursor com atraso — o gesto fica elástico e impreciso. A
     * transição vive no estado NÃO-arrastando (`movable`), que é onde ela serve:
     * o assentamento depois do soltar.
     */
    dragging: {
      true: "z-[3] cursor-grabbing shadow-sh-lg opacity-90 transition-none",
      false: "",
    },
    /** Arrastável e em repouso: mão aberta + transição de assentamento. */
    movable: {
      true: "cursor-grab transition-[top,left,height,width,background-color,border-color,box-shadow] duration-200 ease-out",
      false: "",
    },
    disabled: { true: "pointer-events-none opacity-50", false: "" },
  },
  defaultVariants: {
    color: "brand",
    variant: "pill",
    truncateStart: false,
    truncateEnd: false,
    dragging: false,
    movable: false,
    disabled: false,
  },
});

/**
 * Alça de resize — 6px na borda do bloco, revelada no hover/foco.
 *
 * `h-[6px]` e não um token: é área de AGARRE, não espaçamento. Não existe token
 * de "alvo de arraste" no DS, e reusar `sp-2xs` (2px) aqui seria emprestar um
 * nome de espaçamento pra dizer outra coisa — a L-060 avisa exatamente sobre
 * isso. 6px é o mesmo threshold do sensor, então o alvo nunca é menor que o
 * gesto que o ativa.
 *
 * `absolute inset-x-0` cobre a largura toda do bloco: alça estreita no meio
 * seria um alvo que o usuário precisa procurar.
 */
export const schedulerResizeHandle = tv({
  base: [
    "absolute inset-x-0 z-[1] h-[6px] cursor-ns-resize",
    "opacity-0 transition-opacity duration-150",
    "group-hover/event:opacity-100 focus-visible:opacity-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand",
    // A barrinha só aparece no hover; o alvo de 6px existe sempre.
    "after:absolute after:inset-x-[25%] after:top-[2px] after:h-[2px]",
    "after:rounded-radius-full after:bg-fg-default/40",
  ],
  variants: {
    edge: {
      start: "-top-[3px]",
      end: "-bottom-[3px]",
    },
  },
  defaultVariants: { edge: "end" },
});

/**
 * Célula/coluna sob o cursor durante o arraste. Fundo de marca sutil + borda
 * interna — é o "vai cair aqui" que o gesto precisa pra não ser adivinhação.
 *
 * `inset` em vez de `ring`: a célula do mês já tem borda de grade, e um ring por
 * fora vazaria pra célula vizinha.
 */
export const schedulerDropTarget = tv({
  base: "bg-bg-brand-subtle shadow-[inset_0_0_0_2px_var(--color-border-brand)]",
});

/** Dot/barra de acento — é aqui que a cor da categoria realmente aparece. */
export const schedulerEventDot = tv({
  base: "shrink-0 rounded-radius-full",
  variants: {
    color: {
      brand: "bg-bg-brand",
      info: "bg-bg-info",
      success: "bg-bg-success",
      warning: "bg-bg-warning",
      danger: "bg-bg-danger",
      neutral: "bg-fg-subtle",
    },
    size: {
      sm: "size-icon-2xs",
      md: "size-icon-xs",
    },
  },
  defaultVariants: { color: "brand", size: "sm" },
});

export const schedulerEventTitle = tv({
  base: "min-w-0 flex-1 truncate font-medium text-fg-default",
});

export const schedulerEventTime = tv({
  base: "shrink-0 tabular-nums text-fg-muted",
});

export const schedulerEventDescription = tv({
  base: "min-w-0 truncate text-caption-sm text-fg-muted",
});

/* ────────────────────────────────────────────────────────────────────────
 * Placeholder das views ainda não implementadas
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Existe de propósito e é temporário: `week`, `day` e `list` chegam nas
 * fatias seguintes. Mostrar um aviso honesto é melhor do que esconder a
 * opção no segmented (o usuário não descobriria que a view vai existir) ou
 * do que renderizar uma grade vazia que parece defeito.
 */
export const schedulerPlaceholder = tv({
  base: [
    "flex min-h-[320px] flex-1 flex-col items-center justify-center gap-gp-md",
    "rounded-radius-xl border border-dashed border-border-input bg-bg-subtle dark:bg-bg-canvas",
    "p-sp-3xl text-center",
  ],
});

export type SchedulerEventVariants = VariantProps<typeof schedulerEvent>;
