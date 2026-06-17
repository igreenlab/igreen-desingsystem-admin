import { tv } from "@/utils/tv";

export const conversationColumnStyles = tv({
  slots: {
    root: "flex flex-col flex-1 min-w-0 bg-bg-surface border border-border-subtle rounded-radius-xl overflow-hidden",
    header:
      "flex items-center gap-gp-lg px-pad-2xl py-pad-md border-b border-border-subtle shrink-0",
    headerInfo: "flex-1 min-w-0 flex flex-col gap-[2px]",
    headerTitleRow: "flex items-center gap-gp-sm",
    headerName:
      "text-title-md text-fg-default whitespace-nowrap overflow-hidden text-ellipsis",
    headerMetaRow:
      "flex flex-wrap items-center gap-x-gp-sm gap-y-[2px] text-caption-sm text-fg-muted min-w-0",
    headerActions: "flex items-center gap-gp-sm shrink-0",
    statusInner: "inline-flex items-center gap-[4px]",
    statusDot: "size-[6px] rounded-radius-full shrink-0",
    thread:
      "flex-1 min-h-0 overflow-y-auto bg-bg-muted dark:bg-bg-canvas px-pad-3xl py-pad-2xl flex flex-col gap-gp-md",
    composer:
      "flex items-center gap-gp-sm px-pad-2xl py-pad-md border-t border-border-subtle shrink-0 bg-bg-surface",
  },
});
