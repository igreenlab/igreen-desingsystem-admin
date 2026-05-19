import { tv } from "@/utils/tv";

/**
 * Styles do DetailDrawer — apenas as partes internas (sections collapsibles
 * + DetailField). O shell flutuante (aside, header com avatar+meta, footer
 * com botões) é delegado ao `<FloatingPanel>` do DS.
 */
export const detailDrawerStyles = tv({
  slots: {
    section: "border-b border-border-default last:border-b-0",
    sectionHead: [
      "flex items-center justify-between w-full",
      "px-[18px] py-[14px]",
      "bg-transparent border-0 cursor-pointer text-left",
      "text-body-sm font-semibold text-fg-default",
      "transition-colors duration-150",
      "hover:bg-bg-muted",
      "focus-visible:outline-none focus-visible:bg-bg-muted",
    ],
    sectionChev: "size-[14px] text-fg-muted transition-transform duration-200",
    sectionChevOpen: "rotate-180",
    sectionBody: "flex flex-col gap-gp-md px-[18px] pb-pad-2xl",

    field: "flex items-baseline justify-between gap-gp-md text-body-sm font-normal",
    fieldLabel: "text-body-xs font-normal text-fg-muted shrink-0",
    fieldValue: "text-fg-default text-right break-words min-w-0",
  },
});
