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
     * ⚠️ Default `true` = o comportamento que o PageHeader SEMPRE teve. O título nunca
     * teve truncate (só a descrição tinha), então um título longo quebrava. A primeira
     * versão desta prop veio com default `false` e teria truncado todo título longo já
     * existente — mudança de default que ninguém pediu, num PR que já carrega uma quebra
     * deliberada. Quem quer uma linha só pede `titleWrap={false}`.
     *
     * O caso que originou a prop era o inverso: um consumidor recriou o header por fora
     * porque nome longo de projeto virava "Relatório de atendimento por…". Com o default
     * certo, esse caso já estava atendido — o que faltava era poder DESLIGAR.
     */
    titleWrap: {
      true: { titleRow: "flex-wrap", title: "[overflow-wrap:anywhere]" },
      false: { title: "truncate" },
    },
    /**
     * Quantas linhas a descrição ocupa antes de cortar.
     *
     * O degrau 1 mantém as classes ORIGINAIS (`whitespace-nowrap` + ellipsis) em vez do
     * `line-clamp-1` equivalente: o line-clamp troca o `display` pra `-webkit-box`, e
     * trocar o display de um filho de flex por uma equivalência "visualmente igual" é o
     * tipo de detalhe que só aparece numa tela específica.
     */
    descriptionLines: {
      1: { description: "whitespace-nowrap overflow-hidden text-ellipsis" },
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
    titleWrap: true,
    descriptionLines: 1,
    hideTextOnMobile: true,
    mobileFluid: true,
  },
});
