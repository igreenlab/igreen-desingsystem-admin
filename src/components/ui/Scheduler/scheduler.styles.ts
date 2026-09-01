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

export const schedulerRoot = tv({
  base: [
    "flex min-h-0 w-full flex-col gap-gp-2xl",
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
    "flex w-[280px] shrink-0 flex-col gap-gp-2xl overflow-y-auto",
    "rounded-radius-xl border border-border-default bg-bg-surface p-sp-xl",
  ],
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

export const schedulerGroupHead = tv({
  base: [
    "flex w-full cursor-pointer items-center justify-between gap-gp-md",
    "min-h-form-sm rounded-radius-sm border-0 bg-transparent px-pad-sm outline-none",
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
    "min-h-form-sm rounded-radius-sm px-pad-sm",
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
    dragging: { true: "opacity-60 shadow-sh-lg", false: "" },
    disabled: { true: "pointer-events-none opacity-50", false: "" },
  },
  defaultVariants: {
    color: "brand",
    variant: "pill",
    truncateStart: false,
    truncateEnd: false,
    dragging: false,
    disabled: false,
  },
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
