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
    /**
     * Sinal visual das LINHAS DEFASADAS — `loadingMode="keep"` em vôo com
     * resultado anterior na tela (P8). Régua de 3px em `bg-bg-brand` presa no
     * topo do cartão, desenhada em `::before`.
     *
     * ⚠️ **Por que não é esmaecer as linhas**, que é o primeiro reflexo (a
     * pendência sugeria `opacity: .6` no `role="rowgroup"`): `opacity` é a
     * única opção que mexe no contraste de texto que o DS NÃO escreve — a
     * célula vem do `render` do consumidor. Medido sobre os tokens gerados,
     * tema claro, `text-fg-muted` sobre `bg-bg-table` — e `fg-muted` é o
     * VALOR da célula no `type: "date"`, não um subtítulo decorativo:
     *
     *     opacidade 1.00 → 6.01:1 AA   ·   0.90 → 4.77:1 AA
     *               0.88 → 4.56:1 AA   ·   0.85 → 4.27:1 ✗
     *               0.80 → 3.83:1 ✗    ·   0.60 → 2.57:1 ✗
     *
     * O piso pra continuar AA (4.5:1) é **0.88**. Esmaecer 12% não é sinal, e
     * qualquer esmaecimento que SEJA sinal rebaixa texto legível — inclusive
     * pares que o DS não pode medir porque são do consumidor.
     *
     * Fundo também não serve: `bg-bg-muted` resolve pro MESMO hex de
     * `bg-bg-table-row-hover` nos dois temas (#f6f6f6 claro, #222222 escuro).
     * Linha defasada ficaria idêntica a linha sob o mouse.
     *
     * A régua não toca em texto nenhum e mede 5.06:1 (claro) / 7.63:1 (escuro)
     * contra `bg-bg-table` — acima do piso de 3:1 de objeto gráfico
     * (WCAG 1.4.11). Sem animação de propósito: `animate-pulse` desce a 50% de
     * opacidade no vale do ciclo, e aí a régua mede 2.12:1 no claro — abaixo
     * do piso. O que se move é ela aparecer e sumir.
     *
     * E não compete com `disabled` (`opacity-50` + `pointer-events-none` +
     * `cursor-not-allowed`, a gramática do DS): a linha defasada continua
     * clicável e selecionável — é velha, não inerte. Nem com `selected`, que
     * é `bg` da row e segue intacto.
     *
     * `absolute` é o que garante zero deslocamento: o `keep` existe pra que
     * nada se mexa durante o vôo, e uma régua em fluxo empurraria a tabela 3px.
     * Os 3px são a exceção de hardcode já praticada no DS pra pseudo-element
     * posicional fino (`before:w-[3px]`) — não há token de espessura de régua.
     */
    staleRows: [
      "relative",
      "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-30",
      "before:h-[3px] before:bg-bg-brand before:content-['']",
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
  variants: {
    /**
     * Tela cheia — container raiz vira overlay fixo ocupando a viewport, com
     * bg do canvas + padding pra respiro. A tabela interna preenche o resto
     * (min-h-0 já no `<Table className>`).
     */
    fullscreen: {
      true: {
        root: [
          "fixed inset-0 z-[var(--z-index-modal,500)]",
          "bg-bg-canvas p-pad-2xl overflow-auto",
        ],
      },
    },
  },
  defaultVariants: {
    fullscreen: false,
  },
});
