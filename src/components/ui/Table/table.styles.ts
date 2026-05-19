import { tv } from "@/utils/tv";

/**
 * Table styles — slots tv pra Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell.
 *
 * Densidade afeta: altura mínima de row + padding vertical de cell.
 * Modo card: aplicado via container query (@container) — root declara container-type.
 */
export const tableStyles = tv({
  slots: {
    /* Root grid container. Aplica container-type pra container queries.
       flex flex-col: scroll child usa flex-1 min-h-0 pra esticar quando há altura forçada
       (consumer aplica `max-h-[Npx]` no Table) ou pegar altura natural quando não há. */
    root: [
      "relative flex flex-col w-full",
      "bg-bg-table border border-border-table rounded-radius-xl shadow-sh-sm",
      "overflow-hidden",
      "[container-type:inline-size]",
    ],
    /* Container que faz o scroll (envolve head + body).
       flex-1 + min-h-0: estica até preencher o root quando há altura forçada;
       caso contrário, altura natural do conteúdo (flex-1 sem espaço extra = no-op).
       overflow-auto: scroll-X sempre disponível (colunas largas); scroll-Y só ativa
       quando o conteúdo excede a altura (que só acontece com max-h externo).
       scrollbar-thin: classe global do projeto (globals.css) — alpha responsivo light/dark. */
    scroll: [
      "flex-1 min-h-0 overflow-auto relative",
      "scrollbar-thin",
    ],
    /* Header row (flex de TableHeadCell). Sticky default. */
    head: [
      "flex w-max min-w-full",
      "bg-bg-table-head border-b border-border-table",
      "z-20",
    ],
    /* Cell do header — type, padding, alinhamento. */
    headCell: [
      "relative flex items-center gap-gp-md shrink-0",
      "h-[42px] px-pad-2xl",
      "text-body-sm font-semibold leading-none",
      "text-fg-muted",
      "select-none",
      "hover:text-fg-default",
    ],
    /* Body container — contém as rows. */
    body: [
      "flex flex-col w-max min-w-full",
    ],
    /* Row (flex de TableCell). */
    row: [
      "group/row relative flex w-full",
      "border-b border-border-table last:border-b-0",
      "bg-bg-table",
      "transition-colors duration-150",
    ],
    /* Cell — content cell padrão. */
    cell: [
      "flex items-center shrink-0",
      "px-pad-2xl",
      "text-body-sm font-normal text-fg-default",
      "whitespace-nowrap overflow-hidden",
    ],
    /* Drag handle do resize — barrinha invisível no edge direito.
       Apenas a linha dentro do header (after:). Sem projeção pra baixo (before:)
       porque pseudo-elements absolute COM h-screen ainda contam pro scrollHeight
       do ancestral com overflow-auto, esticando o body verticalmente. */
    resizeHandle: [
      "absolute right-0 top-0 bottom-0 w-[6px] cursor-col-resize z-10",
      // Linha 1px vertical dentro do header — aparece no hover do TH
      "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2",
      "after:top-[8px] after:bottom-[8px] after:w-px after:bg-transparent",
      "after:transition-all after:duration-150",
      "group-hover/headcell:after:bg-border-default",
      // Hover direto no handle → linha brand 2px full-height
      "hover:after:bg-bg-brand hover:after:w-[2px] hover:after:top-0 hover:after:bottom-0",
      // DRAG ATIVO → mantém linha brand visível independente do :hover
      "data-[dragging=true]:after:bg-bg-brand data-[dragging=true]:after:w-[2px] data-[dragging=true]:after:top-0 data-[dragging=true]:after:bottom-0",
    ],
    /* Ícone de sort no head cell. */
    sortIcon: [
      "shrink-0 size-icon-xs",
      "transition-opacity duration-150",
    ],
    /* Ícone de tipo de coluna no head (Hash, User, AtSign…). */
    typeIcon: [
      "shrink-0 size-[13px] text-fg-muted opacity-70",
      "group-hover/headcell:opacity-100",
    ],
    /* Badge brand com índice de sort (1, 2, 3). */
    sortBadge: [
      "inline-flex items-center justify-center shrink-0",
      "min-w-[18px] h-[18px] px-[5px]",
      "rounded-radius-xs bg-bg-brand text-fg-on-brand",
      "text-caption-xs font-bold leading-none tabular-nums",
    ],
    /* Stack absolute na borda direita do head cell — agrupa sort e headMenu.
       Largura dinâmica: encolhe quando itens estão "hidden", cresce quando aparecem no hover. */
    headRightStack: [
      "absolute right-pad-md top-1/2 -translate-y-1/2 z-[1]",  // 8px de respiro da borda direita
      "inline-flex items-center gap-gp-xs",
      "bg-bg-table-head pl-pad-xs",
      "pointer-events-none",
    ],
    /* Sort ativo (asc/desc) — sempre visível quando isSorted=true. */
    headSortActive: [
      "inline-flex items-center gap-gp-xs shrink-0",
      "text-fg-default",
    ],
    /* Sort hint (sortable mas inativo) — display:none default, inline-flex no hover.
       Como é display:none, NÃO ocupa espaço no stack até aparecer. */
    headSortHint: [
      "hidden group-hover/headcell:inline-flex items-center shrink-0",
      "text-fg-muted opacity-60",
    ],
    /* Head menu wrapper — display:none default, inline-flex no hover.
       Tem pointer-events:auto pra restaurar interatividade (parent stack tem pointer-events:none). */
    headMenuItem: [
      // Esconde por padrao; revela quando:
      //   1. hover no header (group-hover) — UX padrao
      //   2. focus interno (focus-within) — keyboard navigation
      //   3. dropdown interno aberto (:has data-state=open) — mantem visivel
      //      enquanto user move cursor pra dentro do menu portal
      //   4. data-menu-active=true no botao — mantem visivel durante a janela
      //      de close animation (~200ms) pra portal nao perder a ancora
      "hidden items-center shrink-0",
      "group-hover/headcell:inline-flex",
      "focus-within:inline-flex",
      "has-[[data-state=open]]:inline-flex",
      "has-[[data-menu-active=true]]:inline-flex",
      "pointer-events-auto",
    ],
    /* Card mode — wrapper de cada row no modo card. */
    cardWrap: [
      "flex flex-col w-full p-pad-card-sm gap-gp-md",
      "border-b border-border-table last:border-b-0",
      "bg-bg-table",
    ],
    /* Card mode — header do card (primary + checkbox + actions). */
    cardHeader: [
      "flex items-center justify-between gap-gp-md",
    ],
    /* Card mode — body items (label/value). */
    cardItem: [
      "flex flex-col gap-gp-2xs",
    ],
    /* Card mode — label da coluna acima do valor. */
    cardLabel: [
      "text-body-xs uppercase tracking-wider text-fg-muted",
    ],
    /* Card mode — valor abaixo do label. */
    cardValue: [
      "text-body-md text-fg-default",
    ],
  },
  variants: {
    density: {
      compact:     { row: "h-[40px]", cell: "py-0", headCell: "" },
      standard:    { row: "h-[56px]", cell: "py-0", headCell: "" },
      comfortable: { row: "h-[64px]", cell: "py-0", headCell: "" },
    },
    sticky: {
      true:  { head: "sticky top-0" },
      false: {},
    },
    selected: {
      true: {
        row: [
          "bg-bg-table-row-selected hover:bg-bg-table-row-selected-hover",
          "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-bg-brand before:z-[5] before:pointer-events-none",
        ].join(" "),
        cardWrap: "bg-bg-table-row-selected hover:bg-bg-table-row-selected-hover",
      },
      false: {
        row: "hover:bg-bg-table-row-hover",
        cardWrap: "hover:bg-bg-table-row-hover",
      },
    },
    clickable: {
      true:  { row: "cursor-pointer", cardWrap: "cursor-pointer" },
      false: {},
    },
    pinned: {
      left:  { headCell: "sticky z-10 bg-bg-table-head", cell: "sticky z-[5] bg-inherit" },
      right: { headCell: "sticky z-10 bg-bg-table-head", cell: "sticky z-[5] bg-inherit" },
    },
    align: {
      left:   { cell: "justify-start text-left",     headCell: "justify-start text-left" },
      center: { cell: "justify-center text-center", headCell: "justify-center text-center" },
      right:  { cell: "justify-end text-right",     headCell: "justify-end text-right" },
    },
    sortable: {
      true:  { headCell: "cursor-pointer hover:text-fg-default" },
      false: {},
    },
    ellipsis: {
      true:  { cell: "overflow-hidden [&>*]:truncate" },
      false: {},
    },
    cellBorders: {
      true: {
        // `:has(+ [data-purpose='actions'])`: a cell ANTES da coluna actions
        // perde border-right — evita o divider visual encostado na actions.
        headCell:
          "border-r border-border-table last:border-r-0 has-[+_[data-purpose='actions']]:border-r-0",
        cell:
          "border-r border-border-table last:border-r-0 has-[+_[data-purpose='actions']]:border-r-0",
      },
      false: {},
    },
    /** Variant pra cells de coluna especial (selection / actions).
     *
     *  - `selection`: remove padding pra checkbox 28px caber em 56px e centralizar.
     *  - `actions`: header em branco (sem texto/menu), sem border-right, padding
     *    horizontal mínimo. Usado quando `type: "actions"` no DataTableColumnDef.
     *    Border-right removida via `!border-r-0` (override do cellBorders=true). */
    purpose: {
      default: {},
      selection: {
        headCell: "px-0 py-0",
        cell: "px-0 py-0",
      },
      actions: {
        headCell: "!border-r-0 px-pad-md",
        cell: "!border-r-0 px-pad-md",
      },
    },
  },
  defaultVariants: {
    density: "standard",
    sticky: true,
    selected: false,
    clickable: false,
    align: "left",
    sortable: false,
    ellipsis: false,
    cellBorders: true,
    purpose: "default",
  },
});
