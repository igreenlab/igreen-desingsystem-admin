import { tv } from "@/utils/tv";

/**
 * Slots tv() pro <Kanban>.
 *
 * Réplica visual do TblKanban do sandbox `/design-and-table-v2`, agora consumindo
 * tokens DS de forma estrita. Header da coluna "solto" (mesma bg do col body),
 * cards com shadow-sm permanente flutuando sobre bg-muted da coluna.
 *
 * Valores fora da escala DS (296px width, line-clamp values, offsets posicionais
 * dos slots absolute) permanecem como arbitrary literal — calibração visual exata.
 */

/* ── Board (container externo) ───────────────────────────────── */

export const root = tv({
  base: [
    "flex flex-1 min-h-0 overflow-hidden",
    // Sem moldura outer — kanban assume a área disponível
  ],
});

export const board = tv({
  base: [
    "flex flex-1 gap-gp-2xl p-0",
    "overflow-x-auto overflow-y-hidden scrollbar-thin",
  ],
});

/* ── Column ──────────────────────────────────────────────────── */

export const column = tv({
  base: [
    "flex flex-col w-[296px] shrink-0 max-h-full",
    "bg-bg-muted rounded-radius-xl",
    "overflow-hidden",
  ],
});

/** Header da coluna — solto sobre o bg-muted, sem divider. */
export const columnHead = tv({
  base: [
    "flex items-center gap-gp-md",
    "px-pad-xl pt-pad-xl pb-pad-sm",
    "bg-transparent",
  ],
});

export const columnDot = tv({
  base: "size-[8px] rounded-radius-full shrink-0",
});

export const columnTitle = tv({
  base: [
    "m-0 text-body-md font-medium text-fg-default",
    // Não expande (badge fica grudado à direita do título)
    "shrink min-w-0",
    "whitespace-nowrap overflow-hidden text-ellipsis",
  ],
});

export const columnCount = tv({
  base: [
    "inline-flex items-center justify-center shrink-0",
    "min-w-[20px] h-[20px] px-pad-sm",
    "bg-bg-muted-hover rounded-radius-full",
    "text-caption-sm text-fg-muted",
    "[font-variant-numeric:tabular-nums]",
  ],
});

/** Wrapper que empurra os botões de ação pro canto direito. */
export const columnActionsSpacer = tv({
  base: "ml-auto inline-flex items-center gap-gp-2xs",
});

/* ── Column body (lista de cards) ────────────────────────────── */

export const columnBody = tv({
  base: [
    "flex flex-1 flex-col gap-gp-md min-h-0",
    "px-pad-md pt-sp-xs pb-pad-md",
    "overflow-y-auto overflow-x-hidden scrollbar-thin",
  ],
});

/**
 * Empty state — flex-1 ocupa o resto do col-body e centraliza vertical.
 * Sem bg/border (transparente sobre col bg). Ícone + texto sutis pra não
 * competir com cards de colunas vizinhas.
 */
export const columnEmpty = tv({
  base: [
    "flex flex-1 flex-col items-center justify-center gap-gp-sm",
    "py-pad-3xl px-pad-xl",
    "text-center text-body-sm font-normal text-fg-subtle",
  ],
});

/** Ícone do empty state — discreto, mesma cor do texto. */
export const columnEmptyIcon = tv({
  base: "size-icon-md text-fg-subtle opacity-70",
});

/**
 * Botão "+ Adicionar" no rodapé da coluna — dashed centered.
 *
 * Mantido como `<button>` raw porque o variant dashed-ghost não existe no
 * `<Button>` DS. Estilos migrados pra tokens; min-h alinhado com size sm.
 */
export const columnAdd = tv({
  base: [
    "inline-flex items-center justify-center gap-gp-sm",
    "mx-pad-md mb-pad-md mt-sp-2xs",
    "px-pad-lg min-h-form-sm",
    "bg-transparent border border-dashed border-border-input rounded-radius-md",
    "text-body-sm font-medium text-fg-muted",
    "cursor-pointer",
    "transition-[background-color,color,border-color] duration-150",
    "hover:bg-bg-surface hover:text-fg-default hover:border-border-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
});

/* ── Card ────────────────────────────────────────────────────── */

export const card = tv({
  base: [
    "group/kanban-card",
    "relative flex flex-col gap-gp-md",
    "p-pad-xl",
    "bg-bg-surface border border-border-subtle rounded-radius-lg",
    "shadow-sh-sm",
    "cursor-pointer text-left",
    "transition-[padding-left,background-color,border-color,box-shadow] duration-150 ease-out",
    "hover:border-border-default hover:shadow-sh-md",
    // No light, hover mantém bg-surface (branco) — só border/shadow mudam.
    // No dark, escurece o card pra dar profundidade (em vez de "ficar mais claro"
    // que era o efeito padrão por causa da shadow sobre bg-surface dark).
    "dark:hover:bg-bg-canvas",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],
  variants: {
    /** Card selecionado (checkbox marcado) — bg brand-subtle + strip lateral. */
    selected: {
      true: [
        "bg-bg-brand-subtle border-border-brand-subtle",
        "before:content-[''] before:absolute before:left-0 before:top-[8px] before:bottom-[8px]",
        "before:w-[3px] before:bg-bg-brand before:rounded-r-[2px]",
        "before:pointer-events-none",
      ].join(" "),
    },
    /** Card "aberto" no detail panel — destaque com border-brand e ring shadow. */
    open: {
      true: "!border-border-brand shadow-sh-ring",
    },
    /**
     * Reserva 24px à esquerda pro checkbox aparecer sem sobrepor o avatar.
     * Aplicado APENAS quando o board tem `onToggleSelect` (showCheckbox=true) —
     * caso contrário, hover não desloca o conteúdo (visual mais estável).
     */
    reserveCheck: {
      true: "hover:pl-[36px] focus-visible:pl-[36px]",
    },
  },
  compoundVariants: [
    // Card selected + reserveCheck → força sempre o pl reservado (mantém strip lateral visível)
    { selected: true, reserveCheck: true, class: "!pl-[36px]" },
  ],
});

/**
 * Checkbox absolute top-left — alinhado vertical com o avatar do head.
 *
 * Visibility: aparece em hover do card OU foco por teclado (focus-visible).
 * `focus-visible` (em vez de `focus-within`) evita que o checkbox permaneça
 * visível ao desmarcar via clique — o foco fica retido no input mas
 * `focus-visible` só ativa em navegação por teclado.
 */
export const cardCheck = tv({
  base: [
    "absolute top-[18px] left-[12px] z-[1]",
    "opacity-0 transition-opacity duration-150",
    "group-hover/kanban-card:opacity-100",
    "group-focus-visible/kanban-card:opacity-100",
  ],
  variants: {
    selected: { true: "!opacity-100" },
  },
});

/**
 * Wrapper de posicionamento do menu "⋯" no card.
 *
 * Apenas absolute positioning + opacity transitions. O visual do botão
 * (size, focus ring, hover bg) vem do `<Button>` DS.
 */
export const cardMenuSlot = tv({
  base: [
    "absolute top-[6px] right-[6px] z-[2]",
    "opacity-0",
    "transition-opacity duration-150",
    "group-hover/kanban-card:opacity-100",
    "group-focus-visible/kanban-card:opacity-100",
  ],
});

/** Head do card — avatar + título/subtítulo. Reserva 28px à direita pro menu. */
export const cardHead = tv({
  base: "flex items-center gap-gp-md pr-[28px]",
});

export const cardTitleWrap = tv({
  base: "flex-1 min-w-0 flex flex-col gap-gp-2xs",
});

export const cardTitle = tv({
  base: [
    "text-body-md font-medium text-fg-default leading-[1.3]",
    "whitespace-nowrap overflow-hidden text-ellipsis",
  ],
});

export const cardSubtitle = tv({
  base: "text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums]",
});

/** Descrição — line-clamp 2, fg-muted. */
export const cardDesc = tv({
  base: [
    "m-0 text-body-sm font-normal leading-[1.45] text-fg-muted",
    "[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]",
    "overflow-hidden",
  ],
});

/** Meta (chip + valor) — flex space-between. */
export const cardMeta = tv({
  base: "flex items-center justify-between gap-gp-md",
});

export const cardValue = tv({
  base: "text-body-sm font-semibold text-fg-default [font-variant-numeric:tabular-nums]",
});

/** Footer (agent + data) — separador solid no top. */
export const cardFoot = tv({
  base: [
    "flex items-center justify-between gap-gp-md",
    "pt-pad-md border-t border-border-subtle",
  ],
});

/* ── DnD slots ─────────────────────────────────────────────── */

/** Card sendo arrastado — opacity baixa + cursor grabbing. */
export const cardDragging = tv({
  base: "opacity-40 cursor-grabbing",
});

/**
 * Coluna candidata válida durante drag (over + canReceiveDrop !== false).
 * Outline brand + bg subtle pra indicar drop zone aceita.
 */
export const columnDropTarget = tv({
  base: "outline outline-2 outline-offset-[-2px] outline-border-brand bg-bg-brand-subtle/30 transition-[outline,background-color] duration-150",
});

/**
 * Coluna que não aceita drop (canReceiveDrop === false).
 * Atenuada SEMPRE durante drag (não só when over) — feedback visual que ela
 * está "fora do jogo". Cursor not-allowed quando o usuário insiste em over.
 */
export const columnDropInvalidDimmed = tv({
  base: "opacity-50 transition-opacity duration-200",
});

export const columnDropInvalidOver = tv({
  base: "cursor-not-allowed",
});

/**
 * Drop placeholder — slot fino com ícone "+" renderizado na posição exata
 * onde o card vai aterrissar (antes/depois do card hovered, ou no fim da
 * coluna quando hover em área vazia). Visual sutil — uma "linha" indicando
 * inserção, não um card fantasma grande.
 */
export const dropPlaceholder = tv({
  base: [
    "h-[36px] flex items-center justify-center shrink-0",
    "rounded-radius-md border border-dashed border-border-brand",
    "bg-bg-brand-subtle/40",
    "text-fg-brand",
    "transition-opacity duration-150",
    "[&>svg]:size-[14px]",
  ],
});
