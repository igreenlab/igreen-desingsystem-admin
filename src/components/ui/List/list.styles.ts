import { tv, type VariantProps } from "@/utils/tv";

/**
 * Slots tv() do <List>. Card reusa a "receita" do TableCardRow/Kanban
 * (bg-surface + border + estados selected/open com strip lateral brand).
 * Só tokens DS. Connectors via border-default.
 */
export const listStyles = tv({
  slots: {
    root: "flex flex-col",
    /* grupos */
    group: "flex flex-col gap-gp-md",
    groupHeader: "flex items-center gap-gp-md px-pad-xs py-pad-2xs select-none",
    groupToggle:
      "inline-flex items-center justify-center size-[20px] shrink-0 rounded-radius-sm text-fg-muted transition-transform duration-150 hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    groupDot: "size-[8px] rounded-radius-full shrink-0",
    groupTitle: "text-body-md font-semibold text-fg-default",
    groupCount:
      "inline-flex items-center justify-center min-w-[20px] h-[20px] px-pad-sm bg-bg-muted rounded-radius-full text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums]",
    groupAdd:
      "ml-auto inline-flex items-center gap-gp-xs text-body-sm font-medium text-fg-muted hover:text-fg-default transition-colors",
    groupBody: "flex flex-col",

    /* card (item) */
    item:
      "group/list-item relative flex items-center gap-gp-lg w-full p-pad-xl bg-bg-surface border border-border-subtle dark:border-border-default rounded-radius-lg shadow-sh-sm text-left transition-[background-color,border-color,box-shadow,padding] duration-150 ease-out",
    handle:
      "inline-flex items-center justify-center shrink-0 -ml-pad-xs size-[20px] text-fg-subtle hover:text-fg-muted cursor-grab active:cursor-grabbing transition-colors [&>svg]:size-[16px]",
    checkbox: "shrink-0",
    leading: "shrink-0 flex items-center",
    content: "flex min-w-0 flex-1 flex-col gap-gp-2xs",
    title: "text-body-md font-medium text-fg-default leading-[1.3] truncate",
    subtitle: "text-caption-sm text-fg-muted truncate",
    description:
      "text-body-sm text-fg-muted [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden",
    /* meta em colunas (ROLE/STATUS/LAST SEEN) */
    metaRow: "hidden md:flex items-center gap-gp-3xl shrink-0",
    metaCol: "flex flex-col gap-gp-2xs min-w-[88px]",
    metaLabel:
      "text-caption-sm font-semibold uppercase tracking-wider text-fg-subtle",
    metaValue: "text-body-sm text-fg-default",
    trailing: "shrink-0 flex items-center gap-gp-md",
    actions: "shrink-0 flex items-center",

    /* hierarquia */
    indent: "shrink-0 self-stretch relative",
    connector: "absolute bg-fg-subtle/55",

    /* dnd / estados */
    /** Painel sutil por grupo (prop groupSurface) — "card fino" que diferencia da superfície.
     *  Padding uniforme (top == bottom); header tem só pb (gap pro 1º card). */
    groupPanel: "rounded-radius-xl border border-border-subtle bg-bg-muted/50 p-pad-lg",
    /** Realce da área de destino durante drag (isDraggingOver). */
    dropZoneActive:
      "rounded-radius-lg bg-bg-brand-subtle/40 outline outline-1 outline-border-brand-subtle transition-colors",
    emptyState:
      "flex flex-col items-center justify-center gap-gp-sm py-pad-4xl px-pad-xl text-center text-body-sm text-fg-subtle",
    skeleton:
      "w-full p-pad-xl bg-bg-surface border border-border-subtle rounded-radius-lg",
    skeletonBar: "h-[12px] rounded-radius-full bg-bg-muted animate-pulse",
  },

  variants: {
    density: {
      // root = standard (+2px vs groupBody, a pedido); groupBody (grouped) e o
      // gap inline do hierárquico não mudam.
      comfortable: { groupBody: "gap-gp-md", root: "gap-gp-lg" },
      compact: { groupBody: "gap-gp-sm", root: "gap-gp-md" },
    },
    clickable: {
      true: {
        item: "cursor-pointer hover:border-border-default hover:shadow-sh-md dark:hover:bg-bg-canvas",
      },
    },
    selected: {
      true: {
        item: [
          "bg-bg-brand-subtle border-border-brand-subtle",
          "before:content-[''] before:absolute before:left-0 before:top-[8px] before:bottom-[8px]",
          "before:w-[3px] before:bg-bg-brand before:rounded-r-[2px] before:pointer-events-none",
        ].join(" "),
      },
    },
    open: {
      true: { item: "!border-border-brand shadow-sh-ring" },
    },
    /** Card em arrasto (hello-pangea move o próprio elemento): elevar, não esmaecer. */
    dragging: {
      true: { item: "shadow-sh-lg !border-border-brand-subtle" },
    },
  },

  defaultVariants: {
    density: "comfortable",
  },
});

export type ListStyleVariants = VariantProps<typeof listStyles>;
