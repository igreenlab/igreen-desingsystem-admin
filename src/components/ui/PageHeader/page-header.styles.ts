import { tv } from "@/utils/tv";

/**
 * PageHeader styles — bloco de título de página colocado dentro do body
 * do `<AppShell>`.
 *
 * Layout desktop:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ [title] [badge]              [action1] [action2] [CTA]   │
 *   │ description                                              │
 *   ├──────────────────────────────────────────────────────────┤
 *   │ {children — ex: <Tabs />}                                │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Mobile:
 *   - Text section sai (hideTextOnMobile, default true)
 *   - Actions ocupam toda a largura; último botão vira fluid (CTA primary)
 */
export const pageHeaderStyles = tv({
  slots: {
    root: "shrink-0 flex flex-col gap-gp-md",
    topRow: "flex items-center justify-between gap-gp-2xl",
    textCol: "flex flex-col gap-gp-xs min-w-0 flex-1",
    titleRow: "flex items-center gap-gp-md min-w-0",
    title: "m-0 text-title-lg font-bold tracking-[-0.01em] text-fg-default",
    description: "m-0 text-body-md text-fg-subtle leading-[1.5]",
    actionsRow: "flex items-center gap-gp-sm shrink-0",
    // mt-gp-xl: +20px somados ao gap-gp-md (12px) do root = ~32px de respiro
    // entre o título/descrição e o slot de conteúdo (tabs/filtros).
    extraRow: "w-full mt-gp-xl",
  },
  variants: {
    /**
     * Título em uma linha (default, `false`) ou quebrando em várias.
     *
     * O default segue sendo uma linha: header de página é âncora de leitura, e título
     * que cresce empurra o conteúdo. Mas truncar SEM alternativa é o que levou um
     * consumidor a recriar o header por fora pra duas telas — nome longo de projeto
     * virava "Relatório de atendimento por…" e a página perdia a identificação.
     */
    titleWrap: {
      true: { titleRow: "flex-wrap", title: "[overflow-wrap:anywhere]" },
      false: { title: "truncate" },
    },
    /**
     * Quantas linhas a descrição ocupa antes de cortar. Default 1 = o comportamento
     * anterior (`whitespace-nowrap` + reticências), agora expresso como `line-clamp-1`,
     * que corta igual e aceita crescer.
     */
    descriptionLines: {
      1: { description: "line-clamp-1" },
      2: { description: "line-clamp-2" },
      3: { description: "line-clamp-3" },
    },
    hideTextOnMobile: {
      true: { textCol: "max-md:hidden" },
      false: {},
    },
    /**
     * Mobile: actions ocupa o espaço (text hidden) + último filho vira fluid.
     * Off = mantém actions square e shrink-0 (mesmo comportamento desktop).
     */
    mobileFluid: {
      true: {
        actionsRow: [
          "max-md:shrink max-md:flex-1 max-md:justify-end",
          "max-md:[&>:last-child]:flex-1",
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    titleWrap: false,
    descriptionLines: 1,
    hideTextOnMobile: true,
    mobileFluid: true,
  },
});
