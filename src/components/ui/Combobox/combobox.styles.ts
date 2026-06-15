import { tv } from "@/utils/tv";

/**
 * Combobox — select de escolha única com busca (autocomplete) + lista rolável.
 *
 * O `trigger` espelha 1:1 o `SelectTrigger` do shadcn (mesma altura, borda,
 * radius, hover e foco) pra que um Combobox e um Select fiquem visualmente
 * idênticos lado a lado (ex.: os 3 campos do filter-popover: Campo/Operador/Valor).
 * A lista, o input de busca e os items são do `Command` (cmdk) — já tokenizados.
 *
 * Foco: padrão "input" do DS (mesmo do SelectTrigger) — `shadow-sh-ring` no
 * focus-visible e no `data-[state=open]`, NÃO `ring-4` (que é o padrão de botão).
 * Assim o anel de foco bate com os Selects irmãos.
 */
export const comboboxStyles = tv({
  slots: {
    trigger: [
      "flex min-h-form-lg w-full items-center justify-between gap-gp-md",
      "rounded-radius-lg px-pad-xl",
      "bg-bg-input dark:bg-bg-muted",
      "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover",
      "border border-border-input",
      "text-body-sm font-normal text-fg-default text-left",
      "transition-[color,box-shadow,background-color,border-color]",
      "focus-visible:outline-none",
      "data-[placeholder]:text-fg-muted data-[placeholder]:opacity-70",
      "focus-visible:border-border-brand data-[state=open]:border-border-brand",
      "focus-visible:shadow-sh-ring data-[state=open]:shadow-sh-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "disabled:hover:bg-bg-input dark:disabled:hover:bg-bg-muted",
    ],
    value: "min-w-0 flex-1 truncate text-left",
    icon: "size-4 shrink-0 text-fg-muted",
    // Dropdown alinhado à largura do trigger (mesmo pattern do Select via
    // `--radix-*-trigger-width`). `p-0`/overflow: o Command interno já provê o
    // padding e o scroll da lista.
    content: "w-[var(--radix-popover-trigger-width)] overflow-hidden p-0",
    // Item da lista: ocupa a largura e trunca rótulos longos.
    itemLabel: "min-w-0 flex-1 truncate",
  },
});
