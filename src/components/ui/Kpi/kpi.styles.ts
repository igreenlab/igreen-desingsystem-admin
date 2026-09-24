import { tv } from "@/utils/tv";

/* ══════════════════════════════════════════════════════════════════════════
   Kpi — estilos (tv). 100% sobre tokens do DS, theme-aware.
   ══════════════════════════════════════════════════════════════════════════ */

export const kpi = tv({
  slots: {
    // `min-w-0` + `relative`: o primeiro deixa o conteúdo encolher dentro do grid (sem
    // ele um item de grid tem largura mínima = conteúdo, e o card ESTOURA a coluna em
    // vez de truncar); o segundo ancora o overlay de clique.
    root: "relative flex min-w-0 flex-col gap-gp-lg",
    header: "flex items-start justify-between gap-gp-md",
    // `line-clamp-2`: rótulo longo em coluna estreita parava em 4 linhas e empurrava o
    // valor pra fora do card.
    label: "m-0 line-clamp-2 min-w-0 text-body-md font-semibold text-fg-default",
    iconBox:
      "grid size-form-lg shrink-0 place-items-center rounded-radius-lg [&>svg]:size-icon-md",
    /** Botão de ajuda ao lado do rótulo (z-10 pra ficar acima do overlay de clique). */
    helpButton:
      "relative z-10 grid size-icon-md shrink-0 place-items-center rounded-radius-full text-fg-subtle transition-colors hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand [&>svg]:size-icon-xs",
    main: "flex min-w-0 flex-col gap-gp-xs",
    valueRow: "flex flex-wrap items-center gap-gp-md",
    value:
      "min-w-0 truncate leading-none text-fg-default [font-variant-numeric:tabular-nums]",
    hint: "text-caption-sm text-fg-subtle",
    chart: "mt-gp-xs",
    footnote:
      "mt-pad-md border-t border-border-subtle pt-pad-lg text-caption-md text-fg-muted",
  },
  variants: {
    // Tamanho do valor de destaque — presets `stat-*` (número de métrica).
    // Default `md` (24px) = idêntico ao antigo `body-2xl`. Weight/leading tight
    // vêm do preset + slot; pareado com tabular-nums.
    size: {
      sm: { value: "text-stat-sm" },
      md: { value: "text-stat-md" },
      lg: { value: "text-stat-lg" },
      xl: { value: "text-stat-xl" },
    },
    surface: {
      card: {
        root: "rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm",
      },
      plain: { root: "p-pad-3xl" },
    },
    /** Ligado por `onClick`/`href` — feedback de que o card inteiro é alvo. */
    interactive: {
      true: { root: "transition-colors hover:bg-bg-subtle" },
      false: {},
    },
    tone: {
      brand: { iconBox: "bg-bg-brand-subtle text-fg-brand" },
      success: { iconBox: "bg-bg-success-muted text-fg-success" },
      warning: { iconBox: "bg-bg-warning-muted text-fg-warning" },
      info: { iconBox: "bg-bg-info-muted text-fg-info" },
      danger: { iconBox: "bg-bg-danger-muted text-fg-danger" },
      neutral: { iconBox: "bg-bg-muted text-fg-muted" },
    },
  },
  defaultVariants: {
    size: "md",
    surface: "card",
    tone: "neutral",
    interactive: false,
  },
});

/**
 * Grid do KpiGroup — quebra por CONTAINER QUERY, não por viewport.
 *
 * O `sm:`/`lg:` de antes lia a JANELA, e o grupo quase nunca ocupa a janela: ao lado de
 * uma sidebar de 280px, oito KPIs num viewport de 1280 recebiam `lg:grid-cols-6` num
 * espaço de ~700px — o número passava da borda e o rótulo quebrava em quatro linhas. A
 * largura que importa é a do PAI, e só o container query enxerga.
 *
 * Teto de 4 por linha até o container ficar largo (@5xl = 1024px): oito colunas em 768px
 * dão 96px por KPI, que não cabe um valor com separador de milhar.
 *
 * ⚠️ O `@container` fica no WRAPPER, não aqui — elemento não consulta a si mesmo.
 */
/**
 * Grid do KpiGroup — quebra por CONTAINER QUERY, não por viewport.
 *
 * O `sm:`/`lg:` de antes lia a JANELA, e o grupo quase nunca ocupa a janela: ao lado de
 * uma sidebar de 280px, oito KPIs num viewport de 1280 recebiam `lg:grid-cols-6` num
 * espaço de ~700px — o número passava da borda e o rótulo quebrava em quatro linhas.
 *
 * Teto de 4 por linha até o container ficar largo (@5xl = 1024px): oito colunas em 768px
 * dão 96px por KPI, que não cabe um valor com separador de milhar.
 *
 * Dois slots porque o `@container` precisa ficar no PAI do grid — elemento não consulta
 * o próprio tamanho.
 */
export const kpiGroup = tv({
  slots: {
    /** Estabelece o contexto de container query e, com `divided`, carrega o chrome. */
    wrapper: "@container w-full",
    // Sem `w-full`: o grid precisa de largura AUTO pra que o `-mr-px`/`-mb-px` do
    // `divided` o alarguem 1px e joguem a borda da última coluna/fileira pra fora do
    // recorte. Com `w-full` ele fica travado em 100% e a margem negativa vira no-op —
    // medido: grid 698px dentro de um wrapper de 700. Block-level grid já preenche.
    grid: "grid",
  },
  variants: {
    columns: {
      2: { grid: "grid-cols-1 @md:grid-cols-2" },
      3: { grid: "grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3" },
      4: { grid: "grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4" },
      5: { grid: "grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4 @5xl:grid-cols-5" },
      6: { grid: "grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-6" },
      7: { grid: "grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4 @5xl:grid-cols-7" },
      8: { grid: "grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4 @5xl:grid-cols-8" },
    },
    /**
     * 1 card único, com divisória entre os KPIs.
     *
     * ⚠️ NÃO usa `divide-x`/`divide-y`. Os utilitários `divide-*` do Tailwind aplicam
     * borda por ORDEM DO DOM (`& > :not(:last-child)`), e não sabem nada de grid: num
     * grid de 2 colunas × 3 linhas o `divide-x` desenha só as verticais e as fileiras
     * ficam sem separação nenhuma. Foi o que aconteceu — e a versão anterior disto
     * ainda trocava divide-y/divide-x por breakpoint de VIEWPORT, então ao lado de uma
     * sidebar a pilha de 1 coluna recebia divisória vertical (invisível).
     *
     * A técnica aqui é grid-aware e independe de quantas colunas e fileiras existam:
     * cada filho desenha borda à direita e embaixo, e o grid é puxado 1px pra fora
     * (`-mr-px -mb-px`) pra que a última coluna e a última fileira tenham as suas
     * cortadas pelo `overflow-hidden` do wrapper. Fileira incompleta não vira bloco
     * pintado: a célula que falta mostra o `bg-bg-surface` do wrapper.
     */
    divided: {
      true: {
        wrapper:
          "overflow-hidden rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm",
        grid: "-mr-px -mb-px [&>*]:border-r [&>*]:border-b [&>*]:border-border-subtle",
      },
      false: { grid: "gap-gp-2xl" },
    },
  },
  defaultVariants: {
    columns: 4,
    divided: false,
  },
});
