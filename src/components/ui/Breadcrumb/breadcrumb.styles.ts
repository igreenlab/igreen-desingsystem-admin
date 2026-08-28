import { tv } from "@/utils/tv";

/**
 * Estilos do caminho montado por dados (`<Breadcrumb items={…} />`).
 *
 * ## Os dois tamanhos existem porque o DS já tinha dois — medidos, não escolhidos
 *
 * Até esta versão havia DUAS implementações de breadcrumb no repo, com aparências
 * diferentes: o primitivo shadcn (`text-body-md`, 14px) e o do `Header`, que tinha estilo
 * próprio em `header.styles.ts` — 13px na cadeia e 16px/600 quando havia um item só. O mesmo
 * elemento, dois tamanhos, dependendo de onde nascia.
 *
 * Unificar num tamanho só mudaria o visual de 15 telas, e o pedido foi explícito: nada muda de
 * aparência. Então os dois viraram variante — `sm` reproduz o Header (é o que o
 * `HeaderBreadcrumb` usa agora, no lugar do estilo duplicado) e `md` é o do primitivo.
 * Medido antes da troca: gap 6px · cadeia 13px/400 com `fg-muted` e o último em `fg-default`
 * · item único 16px/600.
 */
export const breadcrumbCaminho = tv({
  slots: {
    lista: "gap-gp-sm sm:gap-gp-sm",
    separador: "shrink-0 text-fg-subtle [&>svg]:size-[14px]",
    item: "truncate transition-colors leading-none",
  },

  variants: {
    size: {
      sm: { item: "text-body-sm font-normal" },
      md: { item: "text-body-md font-normal" },
    },
    /**
     * Item único = título da página. O `HeaderBreadcrumb` fazia isso e é o que mantém o Header
     * pixel a pixel: 16px/600 em vez do 13px da cadeia.
     */
    sozinho: {
      true: { item: "text-body-lg font-semibold" },
      false: {},
    },
    atual: {
      true: { item: "text-fg-default" },
      false: { item: "text-fg-muted hover:text-fg-default" },
    },
  },

  defaultVariants: { size: "md", sozinho: false, atual: false },
});
