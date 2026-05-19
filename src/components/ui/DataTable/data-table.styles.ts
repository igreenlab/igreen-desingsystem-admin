import { tv } from "@/utils/tv";

/**
 * DataTable wrapper externo — agrupa toolbar + table + footer.
 * Visual: card com border + radius. O <Table> interno tem o próprio wrapper
 * com bg-bg-table; aqui o <div> raiz só posiciona toolbar e footer.
 */
export const dataTableStyles = tv({
  slots: {
    root: [
      // 16px (gp-2xl) entre toolbar e tabela
      "flex flex-col w-full gap-gp-2xl",
    ],
    toolbarWrap: [
      // Sem gap: chips ficam justapostos a toolbar header (sem separator)
      "flex flex-col",
    ],
    footerWrap: [
      "flex-shrink-0",
    ],
    overlay: [
      "absolute inset-0 z-50 flex items-center justify-center",
      "bg-bg-canvas/80 backdrop-blur-sm",
    ],
    emptyWrap: [
      "flex flex-col items-center justify-center gap-gp-md",
      "min-h-[240px] p-pad-3xl",
      "text-fg-muted",
    ],
    emptyTitle: [
      "text-title-md text-fg-default",
    ],
    emptyDescription: [
      "text-body-md text-fg-muted text-center max-w-[360px]",
    ],
    bulkBar: [
      "fixed bottom-pad-3xl left-1/2 -translate-x-1/2 z-[var(--z-index-toast,600)]",
      "flex items-center gap-gp-lg",
      "py-pad-md px-pad-2xl rounded-radius-xl",
      "bg-bg-brand-subtle border border-border-brand text-fg-brand",
      "shadow-sh-lg",
    ],
  },
});
