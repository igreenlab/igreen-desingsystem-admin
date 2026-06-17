import { tv } from "@/utils/tv";

export const queueColumnStyles = tv({
  slots: {
    root: "flex flex-col w-[340px] shrink-0 bg-bg-surface border border-border-subtle rounded-radius-xl overflow-hidden",
    header: "flex items-center gap-gp-sm px-pad-md pt-pad-md pb-pad-md",
    title: "m-0 text-title-md text-fg-default flex-1 min-w-0",
    searchWrap: "px-pad-md pb-pad-lg",
    searchInner: "relative",
    searchIcon:
      "absolute left-pad-lg top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none",
    searchInput: "pl-[34px] pr-[30px]",
    searchClear:
      "absolute right-pad-md top-1/2 -translate-y-1/2 grid place-items-center size-[20px] rounded-radius-md text-fg-muted hover:bg-bg-muted hover:text-fg-default transition-colors",
    chipsWrap: "px-pad-md pb-pad-2xl",
    list: "flex-1 min-h-0 overflow-y-auto px-pad-md pb-pad-md flex flex-col gap-gp-xs",
    empty: "py-pad-4xl px-pad-xl text-center text-body-xs font-normal text-fg-subtle",
  },
});
