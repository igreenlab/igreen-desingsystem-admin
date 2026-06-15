import { tv } from "@/utils/tv";

/**
 * Estilos das add-ons de célula do DataTable (read-more + copy-cell).
 * Visual isolado aqui — `data-table-cell-addons.tsx` não carrega classe crua.
 */
export const cellAddonsStyles = tv({
  slots: {
    /** Wrapper raiz da célula com add-ons — `group` habilita reveal no hover. */
    root: "group/cell-addon flex items-center gap-gp-xs w-full min-w-0",
    /** Texto truncado (1 linha) com reticências. */
    truncate: "min-w-0 flex-1 truncate",
    /** Texto truncado multi-linha (line-clamp via style inline). */
    clamp: "min-w-0 flex-1 overflow-hidden",
    /** Botão "Ler mais" inline. */
    readMoreBtn:
      "shrink-0 text-fg-brand text-body-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand rounded-radius-sm",
    /** Botão de copiar — revelado no hover/focus da célula. */
    copyBtn: [
      "shrink-0 inline-flex items-center justify-center size-icon-md rounded-radius-md",
      "text-fg-muted hover:text-fg-default hover:bg-bg-muted",
      "opacity-0 group-hover/cell-addon:opacity-100 focus-visible:opacity-100",
      "transition-opacity duration-150",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    ],
    /** Conteúdo do popover do "Ler mais". Largura via token semântico
     *  (tooltip-lg = 320px) — reveal de texto é conceitualmente um tooltip. */
    readMorePopover:
      "flex flex-col gap-gp-md p-pad-lg max-w-container-tooltip-lg text-body-sm text-fg-default whitespace-pre-wrap break-words",
  },
});
