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

/* ── Segmented (cópia da gramática do `toolbarSegmented`) ──────────── */

export const schedulerSegmented = tv({
  base: [
    "inline-flex shrink-0 items-center gap-gp-2xs p-sp-2xs",
    "h-form-lg rounded-radius-lg bg-bg-muted",
  ],
});

export const schedulerSegmentedButton = tv({
  base: [
    "grid place-items-center",
    "h-comp-lg min-w-comp-lg px-pad-md",
    "cursor-pointer rounded-radius-md border-0 bg-transparent outline-none",
    "text-body-sm font-normal text-fg-muted",
    "transition-[background-color,color,box-shadow] duration-150",
    "hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
  variants: {
    isActive: {
      true: "bg-bg-accent font-semibold text-fg-default shadow-sh-sm",
      false: "",
    },
    disabled: {
      true: "pointer-events-none opacity-50",
      false: "",
    },
  },
  defaultVariants: { isActive: false, disabled: false },
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
 * Borda **tracejada** quando o filtro está disponível mas vazio, **sólida**
 * quando tem valor aplicado. É o que faz "tem filtro ligado" ser legível sem
 * ler o texto — mesma convenção do `TableToolbar`.
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

/* ── Popover de opções de um filtro ────────────────────────────────── */

export const schedulerFilterPanel = tv({
  base: "flex max-h-[280px] min-w-[200px] flex-col gap-gp-2xs overflow-y-auto p-sp-xs",
});

export const schedulerFilterOption = tv({
  base: [
    "flex w-full cursor-pointer items-center gap-gp-md",
    "min-h-form-md rounded-radius-sm px-pad-lg py-pad-md",
    "border-0 bg-transparent text-left outline-none",
    "text-body-sm text-fg-muted",
    "transition-colors duration-150",
    "hover:bg-bg-muted hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
  variants: {
    selected: { true: "bg-bg-brand-subtle text-fg-brand", false: "" },
  },
  defaultVariants: { selected: false },
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
