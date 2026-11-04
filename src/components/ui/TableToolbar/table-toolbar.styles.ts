import { tv } from "@/utils/tv";

/**
 * Styles compartilhados das partes do TableToolbar.
 * Cada `tv()` corresponde a um sub-componente em `parts/`.
 *
 * Specs alinhadas com `.tbl-toolbar` do design-and-table-v2.
 */

/* ── Root ──────────────────────────────────────────────────────────── */
/**
 * Gaps responsivos:
 *   - Mobile (< md): gap menor pra search + 2 botões caberem na mesma linha
 *   - Desktop (≥ md): gap mais respirado (16px root, 10px left, 8px actions)
 */
export const toolbarRoot = tv({
  base: [
    "flex items-center justify-between flex-wrap",
    "gap-gp-md md:gap-gp-2xl",  // 8px → 16px
  ],
});

export const toolbarLeft = tv({
  base: [
    "flex flex-1 items-center flex-wrap min-w-0",
    "gap-gp-sm md:gap-[10px]",  // 6px → 10px
    "[&>*]:shrink-0",            // items hug, sem squeeze interno
    // Mobile (<md): toggle Kanban/Lista + abas + adicionar colapsam pro menu
    // de Configurações; a barra fica só com busca + ações à direita.
    "max-md:hidden",
  ],
});

export const toolbarActions = tv({
  base: [
    "flex items-center flex-wrap shrink-0",
    "gap-gp-sm md:gap-gp-md",  // 6px → 8px
    "[&>*]:shrink-0",          // items hug, sem squeeze interno
    // Mobile: ocupa a linha toda pra a busca ficar fluida (flex-1 no search).
    "max-md:w-full max-md:flex-1",
  ],
});

/* ── Divider vertical ─────────────────────────────────────────────── */
export const toolbarDivider = tv({
  base: "w-[1px] h-[24px] bg-border-default shrink-0 mx-[6px] self-center",
});

/* ── Search input expansível ──────────────────────────────────────── */
/**
 * Mobile (< md): fluido (`flex-1`) — ocupa o espaço restante, sem aumentar/diminuir width no foco.
 * Desktop (≥ md): width fixo 200px rest → 300px no focus-within OU quando tem valor.
 *
 * O `focus-within:` desktop expande automaticamente quando o input está focado.
 * A variant `expanded: true` mantém expandido mesmo sem foco (quando há valor).
 */
export const toolbarSearch = tv({
  base: [
    "relative flex items-center gap-gp-md cursor-text",
    "h-form-lg px-[14px] rounded-radius-lg",
    "bg-bg-surface dark:bg-bg-muted",
    "border border-border-subtle dark:border-border-input",
    "shadow-sh-sm dark:shadow-sh-none",
    "text-fg-default",
    // Mobile fluido / desktop width fixo + animação no focus
    "flex-1 min-w-0 md:flex-initial",
    "md:w-[200px] md:focus-within:w-[300px]",
    "transition-[width,border-color,background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
    "focus-within:border-border-brand focus-within:shadow-sh-ring",
    "[&_svg]:size-[14px] [&_svg]:text-fg-muted [&_svg]:shrink-0",
  ],
  variants: {
    /** Quando true, mantém expandido (300px) mesmo sem foco — útil quando tem valor (desktop only) */
    expanded: {
      true:  "md:w-[300px]",
      false: "",
    },
  },
  defaultVariants: { expanded: false },
});

export const toolbarSearchInput = tv({
  base: [
    "flex-1 min-w-0 bg-transparent border-0 outline-none",
    "text-body-sm font-normal text-fg-default",
    "placeholder:text-fg-muted",
  ],
});

/**
 * Dot indicator (filtros aplicados) — pequeno círculo brand no canto superior direito.
 *
 * NOTA: `ToolbarToolButton` agora compõe o `Button` do DS — seu estilo vem do
 * Button (color/variant/size). Esse helper só pinta o ponto de "tem aplicado".
 */
export const toolbarToolDot = tv({
  base: [
    "absolute -top-[4px] -right-[4px] z-[2] pointer-events-none",
    "size-[13px] rounded-radius-full",
    "bg-bg-brand border-2 border-bg-canvas",
  ],
});

/* ── Segmented (density-toggle, view-mode-toggle) ───────────────── */
export const toolbarSegmented = tv({
  base: [
    "items-center gap-[2px] p-[3px]",
    "bg-bg-muted rounded-radius-lg",
    "h-form-lg",
  ],
  variants: {
    fluid: {
      true:  "flex w-full",
      false: "inline-flex shrink-0",
    },
  },
  defaultVariants: { fluid: false },
});

export const toolbarSegmentedButton = tv({
  base: [
    "grid place-items-center",
    "h-[34px] min-w-[36px] px-pad-md",
    "rounded-radius-md border-0 bg-transparent cursor-pointer outline-none",
    "text-body-sm font-normal text-fg-muted",
    "transition-[background-color,color,box-shadow] duration-150",
    "hover:text-fg-default",
    "focus-visible:shadow-sh-ring",
    "[&_svg]:size-[14px]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  variants: {
    isActive: {
      true:  "bg-bg-accent text-fg-default font-semibold shadow-sh-sm",
      false: "",
    },
    fluid: {
      true:  "flex-1",
      false: "shrink-0",
    },
  },
  defaultVariants: { isActive: false, fluid: false },
});

/* ── View tabs group (Todos/Meus/Ativos…) ───────────────────────── */
export const toolbarTabs = tv({
  base: [
    "items-center gap-[2px] p-[3px]",
    "bg-bg-muted rounded-radius-lg",
    "h-form-lg max-w-full overflow-x-auto",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ],
  variants: {
    fluid: {
      true:  "flex w-full",
      false: "inline-flex",
    },
  },
  defaultVariants: { fluid: false },
});

export const toolbarTabWrap = tv({
  base: [
    "relative inline-flex items-center",
    "rounded-radius-md",
    "transition-[background-color,box-shadow,padding-right] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
  ],
  variants: {
    isActive: {
      true:  "bg-bg-accent shadow-sh-sm",
      false: "",
    },
    fluid: {
      true:  "flex-1 justify-center",
      false: "shrink-0",
    },
  },
  defaultVariants: { isActive: false, fluid: false },
});

export const toolbarTabButton = tv({
  base: [
    "inline-flex items-center gap-gp-sm h-[34px] px-[14px]",
    "rounded-radius-md border-0 bg-transparent cursor-pointer outline-none",
    "text-body-sm font-medium text-fg-muted whitespace-nowrap",
    "transition-[color,padding-right] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
    "hover:text-fg-default",
    "focus-visible:shadow-sh-ring",
  ],
  variants: {
    isActive: {
      true:  "text-fg-default font-semibold",
      false: "",
    },
    fluid: {
      true:  "flex-1 justify-center",
      false: "",
    },
  },
  defaultVariants: { isActive: false, fluid: false },
});

/**
 * Botão "X" pra fechar tab custom — escondido por trás do tab (margin -18px),
 * desliza pra fora ao hover do wrap.
 */
export const toolbarTabClose = tv({
  base: [
    "grid place-items-center size-[18px] -ml-[18px]",
    "rounded-radius-full border-0 bg-transparent text-fg-muted cursor-pointer",
    "opacity-0 scale-[0.6] origin-center pointer-events-none",
    "transition-[margin-left,opacity,transform,background-color,color] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
    "group-hover/wrap:ml-0 group-hover/wrap:opacity-100 group-hover/wrap:scale-100 group-hover/wrap:pointer-events-auto",
    "hover:bg-bg-accent hover:text-fg-default",
    "[&_svg]:size-[11px]",
  ],
});

/* ── Applied filters (chips abaixo da toolbar) ──────────────────── */
/**
 * Espaçamento: toolbar → 16px → divider (border-top) → 16px → chips.
 * `mt-pad-3xl` afasta o border-top da toolbar; `pt-pad-3xl` afasta o
 * conteúdo interno (chips) do border.
 */
export const toolbarApplied = tv({
  // Mobile: scroll horizontal (flex-nowrap + overflow-x-auto) em vez de quebrar
  // os chips em várias linhas e empurrar a tabela pra baixo. Scrollbar oculta.
  // sm+: volta ao flex-wrap normal.
  base: [
    "flex items-center gap-gp-md",
    "flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-x-visible",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ],
  variants: {
    /**
     * Separator (margem topo 16px + border + padding 16px) entre toolbar
     * header e chips. Default `true`. Espaçamento total: 16px → divider → 16px → chips.
     */
    separator: {
      true: "mt-pad-2xl pt-pad-2xl border-t border-border-default",
      false: "",
    },
  },
  defaultVariants: {
    separator: true,
  },
});

/**
 * Chip de filtro. `active` é o **destaque OPT-IN** do chip aplicado (item 16 do
 * Sólis), ligado pela prop `highlightAppliedFilterChips` do `ToolbarApplied`:
 *
 *   `active: false` → tracejado neutro. É o **default** e o pixel de sempre:
 *                     vale pro chip `isEmpty` SEMPRE, e pro chip com valor
 *                     quando o consumidor não pediu o destaque
 *   `active: true`  → sólido de marca sobre `bg-brand-subtle` = filtro aplicado
 *                     numa barra que pediu o destaque
 *
 * ⚠️ `active` **não** é sinônimo de "tem valor", e esta linha é a correção de
 * uma afirmação que este mesmo bloco fazia: o destaque nasceu automático
 * (derivado só de `isEmpty`) e virou opt-in porque **só paga quando há chip
 * vazio na mesma barra pra contrastar**. Sem chip vazio ele não distingue nada
 * e pinta tudo de marca — que é o estado da maioria das telas, e o do `DataList`
 * em 100% dos casos (`toAppliedFilters` descarta item sem valor antes de chegar
 * aqui). Quem decide é o consumidor; o default é o pixel de antes.
 *
 * ⚠️ `bg` e `border-style`/`border-color` saíram da `base` e vivem só dentro da
 * variante, e o `hover` só nos `compoundVariants`. Não é organização: com
 * prefixo DS o `tailwind-merge` **não** reconhece `bg-bg-surface` × `bg-bg-brand-subtle`
 * como conflito, as duas sobreviveriam e quem decidiria seria a ordem do CSS
 * (L-072). Declarado uma vez por ramo, não há empate pra desempatar.
 */
export const toolbarAppliedChip = tv({
  base: [
    "inline-flex items-center gap-gp-md",
    "h-form-md pl-pad-sm pr-pad-lg",
    "border rounded-radius-lg",
    "text-body-xs font-normal text-fg-default",
    "transition-[background-color,border-color] duration-150",
  ],
  variants: {
    interactive: {
      true: [
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
      ],
      false: "",
    },
    active: {
      true: "bg-bg-brand-subtle border-solid border-border-brand",
      false: "bg-bg-surface dark:bg-bg-muted border-dashed border-border-input",
    },
  },
  compoundVariants: [
    {
      interactive: true,
      active: false,
      class: "hover:bg-bg-muted-hover hover:border-border-default dark:hover:bg-bg-accent",
    },
    {
      interactive: true,
      active: true,
      class: "hover:bg-bg-brand-subtle-hover hover:border-border-brand",
    },
  ],
  defaultVariants: {
    interactive: false,
    active: false,
  },
});

export const toolbarAppliedChipRemove = tv({
  base: [
    "grid place-items-center size-[18px] shrink-0",
    "rounded-radius-full border-0 bg-transparent text-fg-subtle cursor-pointer outline-none",
    "transition-colors duration-150",
    "hover:text-fg-default",
    "focus-visible:shadow-sh-ring",
    "[&_svg]:size-[14px]",
  ],
});

export const toolbarAppliedChipName = tv({
  base: "font-semibold text-fg-default",
});

export const toolbarAppliedChipOp = tv({
  base: "text-fg-muted text-caption-sm",
});

/**
 * Pílula do VALOR dentro do chip. `active` muda SÓ a cor do texto: no chip
 * aplicado de uma barra **com o destaque ligado** (`highlightAppliedFilterChips`)
 * o valor é a informação que importa, e lê em `fg-brand`. Sem a prop fica em
 * `fg-default`, como sempre foi.
 *
 * ⚠️ O fundo da pílula continua `bg-muted` / `bg-accent` **de propósito**, e
 * isso foi medido: tingir também a pílula (22% de marca sobre os 14% do chip)
 * derrubava o texto para **3,14:1** no claro — reprovando o AA de 4,5:1 para
 * texto de 12px. O verde precisa de fundo claro-neutro para ser legível; a
 * cor de marca do chip mora na BORDA e no fundo do chip, não embaixo do texto.
 *
 * ⚠️ E no ESCURO o verde volta a ser `fg-default`, pelo mesmo motivo medido:
 * o `brandContrast` sobre superfície escura dá **4,36:1** — reprova o AA por
 * 0,14. Não é exceção inventada: o `bulkBarCount` logo abaixo já faz
 * `text-fg-brand dark:text-fg-default` por essa razão. No escuro quem carrega
 * o estado é a borda do chip, que mede **7,99:1** contra a barra (o chip vazio
 * mede 1,24) — sobra sinal sem pagar com legibilidade.
 */
export const toolbarAppliedChipValue = tv({
  base: [
    "inline-flex items-center h-[22px] px-pad-md",
    "rounded-radius-sm",
    "bg-bg-muted dark:bg-bg-accent",
    "text-body-xs font-medium",
  ],
  variants: {
    active: {
      true: "text-fg-brand dark:text-fg-default",
      false: "text-fg-default",
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const toolbarAppliedClearLink = tv({
  base: [
    "ml-pad-sm text-body-xs font-medium text-fg-brand cursor-pointer outline-none",
    "bg-transparent border-0 p-0",
    "transition-opacity duration-150",
    "hover:underline underline-offset-2",
    "focus-visible:underline",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
});

/* ── Bulk actions bar ─────────────────────────────────────────────── */
/**
 * Spec alinhada com `.tbl-bulk-bar` do design-and-table-v2:
 *   - padding 10px 14px, gap 12px, radius xl (12px)
 *   - bg-brand-subtle + border-brand + fg-brand
 *   - flex-wrap pra mobile cair em coluna naturalmente
 */
export const bulkBarRoot = tv({
  base: [
    "flex items-center flex-wrap gap-gp-xl",
    "py-[10px] px-[14px] rounded-radius-xl",
    "bg-bg-brand-subtle border border-border-brand text-fg-brand",
  ],
});

export const bulkBarCount = tv({
  base: [
    "inline-flex items-center gap-gp-md shrink-0",
    "text-body-sm font-semibold",
    "text-fg-brand dark:text-fg-default",
    "[&_svg]:size-[14px]",
  ],
});

export const bulkBarActions = tv({
  base: [
    "flex items-center flex-wrap gap-gp-sm flex-1 min-w-0",
    "[&>*]:shrink-0",
  ],
});

export const bulkBarClear = tv({
  base: [
    "shrink-0 ml-auto",
    "bg-transparent border-0 p-0 cursor-pointer outline-none",
    "text-body-xs font-semibold text-fg-brand",
    "transition-opacity duration-150",
    "hover:underline underline-offset-2",
    "focus-visible:underline",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
});
