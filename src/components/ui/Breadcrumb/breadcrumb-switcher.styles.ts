import { tv } from "@/utils/tv";

/**
 * BreadcrumbSwitcher styles — iGreen DS
 *
 * ## O gatilho é o CAMINHO, não um campo
 *
 * A diferença pro `Combobox` mora aqui e é o motivo de o componente existir: o `Combobox`
 * desenha um campo de formulário (borda, altura `form-*`, fundo de input) porque ele coleta
 * um valor. Este gatilho é **o texto do breadcrumb** — mesma tipografia dos irmãos, sem borda
 * e sem fundo em repouso — e só ganha superfície no hover/aberto, pra dizer "isto é
 * clicável". Um campo de formulário no meio da trilha faria a página parecer um formulário.
 */
export const breadcrumbSwitcher = tv({
  slots: {
    trigger: [
      "inline-flex max-w-[240px] items-center gap-gp-xs rounded-radius-sm",
      "px-pad-xs py-pad-2xs -mx-pad-xs",
      "font-medium text-fg-default",
      "transition-colors hover:bg-bg-muted",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
      "disabled:pointer-events-none disabled:opacity-60",
      // aberto fica marcado: sem isso, com o dropdown na tela, o gatilho some do olhar
      "data-[state=open]:bg-bg-muted",
    ],
    /** O rótulo trunca; o chevron nunca — ele é o que anuncia que dá pra trocar. */
    label: "truncate",
    chevron: "size-icon-xs shrink-0 text-fg-muted",

    content: "w-[300px] p-0",
    title: "px-pad-xl pt-pad-lg pb-pad-sm text-caption-md font-semibold text-fg-subtle",
    /** O rodapé fica FORA da área que rola — “ver todos” não pode fugir com a lista. */
    footer: "border-t border-border-default p-pad-sm",

    item: "flex items-center gap-gp-md",
    itemTexto: "flex min-w-0 flex-1 flex-col",
    itemLabel: "truncate",
    itemDescricao: "truncate text-caption-md text-fg-subtle",
  },

  variants: {
    /**
     * Acompanha o tamanho do caminho. Sem isto o gatilho ficava 13px fixo no meio de irmãos de
     * 14px (medido na doc) — o item que troca é o MESMO item do caminho, não pode ter corpo
     * próprio.
     */
    size: {
      sm: { trigger: "text-body-sm" },
      md: { trigger: "text-body-md" },
    },
  },

  defaultVariants: { size: "md" },
});
