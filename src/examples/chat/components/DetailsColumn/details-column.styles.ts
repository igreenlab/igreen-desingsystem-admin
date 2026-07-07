import { tv } from "@/utils/tv";

export const detailsColumnStyles = tv({
  slots: {
    root: "relative flex flex-col shrink-0 bg-bg-surface border border-border-subtle rounded-radius-xl overflow-hidden",
    /** Resize handle no left edge — 4px. */
    handle:
      "absolute left-0 top-0 bottom-0 w-[4px] z-[1] bg-transparent cursor-col-resize hover:bg-bg-brand active:bg-bg-brand transition-colors duration-150 focus-visible:outline-none focus-visible:bg-bg-brand",
    header:
      "flex items-center gap-gp-md px-pad-2xl py-pad-lg border-b border-border-subtle shrink-0",
    title: "m-0 text-title-md text-fg-default flex-1",
    body: "flex-1 min-h-0 overflow-y-auto px-pad-2xl py-pad-md flex flex-col gap-gp-2xl",
    contactHead: "flex flex-col items-center gap-gp-md pb-pad-md",
    contactName: "text-body-md font-semibold text-fg-default text-center",
    tagsRow: "flex flex-col gap-gp-sm pt-pad-xs",
    tagsLabel: "text-body-xs font-normal text-fg-muted",
    tagsChips: "flex items-center gap-gp-xs flex-wrap",
    tagAddBtn:
      "inline-flex items-center gap-[3px] px-pad-md h-[22px] rounded-radius-full border border-dashed border-border-input text-caption-sm font-medium text-fg-muted hover:bg-bg-muted hover:text-fg-default transition-colors",
    historyEmpty: "text-body-xs font-normal text-fg-subtle text-center py-pad-md",
    historyList: "m-0 p-0 list-none flex flex-col gap-gp-sm",
    historyItem:
      "flex gap-gp-md p-pad-md rounded-radius-md bg-bg-muted border border-border-subtle",
    historyId:
      "text-caption-sm text-fg-muted shrink-0 [font-variant-numeric:tabular-nums] pt-[1px]",
    historyBody: "flex-1 min-w-0 flex flex-col gap-[1px]",
    historySubject: "text-body-xs text-fg-default",
    historyMeta: "text-caption-sm text-fg-muted",
  },
});
