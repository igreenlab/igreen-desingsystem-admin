import { tv, type VariantProps } from "@/utils/tv";

/**
 * TabsNavigation styles — iGreen DS
 *
 * Tira de abas de NAVEGAÇÃO (estilo navegador): cada aba é uma sessão aberta, não um filtro
 * de conteúdo dentro da tela. A diferença pro `Tabs` do shadcn não é estética — é que aqui a
 * aba ativa **se une fisicamente** ao conteúdo, e é esse detalhe que carrega o componente.
 *
 * ## Os dois mecanismos de união, e por que são dois
 *
 * - **`fill: false` (aba pousada).** A tira tem uma régua de 1px embaixo; a aba ativa desce
 *   1px (`-mb-px`) e pinta essa régua com a própria cor de fundo. Sem o truque ela vira um
 *   botão pousado sobre uma linha — que é exatamente o `Tabs` variante `line` que já existe.
 * - **`fill: true` (altura total).** A aba ocupa a faixa inteira e a tira **não tem régua**:
 *   a união vira continuidade de cor. O truque do `-mb-px` foi medido aqui e não serve — a
 *   aba parava 2px antes da régua (1px do `pb-px` do trilho + 1px da borda da faixa), e
 *   fresta é pior que linha nenhuma.
 *
 * ## A superfície é prop, não constante
 *
 * A aba ativa TEM que ser a mesma cor do conteúdo abaixo dela. Num card é `bg-surface`; se o
 * conteúdo for a página, é `bg-canvas`. Errar isso quebra a união, que é o componente inteiro.
 *
 * ## O fundo recuado usa DOIS tokens, um por modo — e isso é deliberado
 *
 * `bg-subtle` no claro, `bg-canvas` no escuro. Medido: no claro `canvas` é branco IGUAL a
 * `surface` (recuo zero) e quem recua é `subtle` (0.973); no escuro `subtle` é branco a 1%
 * sobre o card (invisível) e quem recua é `canvas` (0.205 contra 0.225). Cada modo tem o seu
 * token de recuo, e o par existente cobre o papel — não há token novo aqui.
 */

export const tabsNavigationRoot = tv({
  base: "flex gap-gp-2xs px-pad-lg",

  variants: {
    /**
     * O RESPIRO DO TOPO É DO COMPONENTE, não do consumidor — e isso é o que torna a peça
     * independente da superfície onde ela cai.
     *
     * Enquanto o padding vinha de um wrapper por fora, aquela faixa de 8px acima das abas
     * ficava com a cor do container (a superfície do card) enquanto a tira ficava com o
     * recuo: duas cores na mesma banda, e a aba inativa parecia "um botão de outra cor
     * pousado num fundo diferente". Trazendo o padding pra cá, o recuo cobre a banda inteira
     * e a ÚNICA coisa com fundo próprio passa a ser a aba ativa.
     */
    respiro: {
      comfortable: "pt-pad-md",
      compact: "pt-pad-sm",
      nenhum: "",
    },
    /**
     * `items-stretch` é o que faz a aba de altura total valer: com `items-end` ela encolheria
     * pro próprio conteúdo e o `h-full` não teria contra o que medir. A régua some junto.
     */
    fill: {
      true: "items-stretch",
      false: "items-end border-b border-border-default",
    },
    /** Fundo recuado da tira — o par por modo explicado no cabeçalho deste arquivo. */
    chrome: {
      true: "bg-bg-subtle dark:bg-bg-canvas",
      false: "",
    },
  },

  defaultVariants: { fill: false, chrome: true, respiro: "comfortable" },
});

export const tabsNavigationTrilho = tv({
  /**
   * `scrollbar-none` não é preferência: a barra ocupa 11px DENTRO do trilho e empurra as abas
   * pra cima da régua, matando a união. A affordance de navegação são as setas + a lista.
   */
  base: "flex min-w-0 flex-1 gap-gp-2xs overflow-x-auto scrollbar-none",

  variants: {
    /** o `pb-px` só existe pra o `-mb-px` da aba não ser cortado pelo overflow. */
    fill: {
      true: "items-stretch",
      false: "items-end pb-px",
    },
  },

  defaultVariants: { fill: false },
});

export const tabsNavigationTab = tv({
  base: [
    "group/aba relative flex shrink-0 cursor-pointer select-none",
    "items-center gap-gp-sm border border-transparent px-pad-xl",
    "text-fg-muted transition-colors",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  ],

  variants: {
    density: {
      comfortable: "w-[228px]",
      compact: "w-[196px]",
    },
    fill: {
      true: "h-full self-stretch",
      false: "-mb-px rounded-t-radius-lg",
    },
    /**
     * A superfície da aba ATIVA — tem que casar com o conteúdo de baixo. No modo pousado a
     * borda de baixo recebe a mesma cor, e é ela que apaga a régua.
     */
    surface: {
      surface: "",
      canvas: "",
    },
    ativa: {
      true: "border-border-default",
      false: "hover:bg-bg-subtle",
    },
  },

  compoundVariants: [
    { fill: false, density: "comfortable", class: "min-h-comp-3xl" },
    { fill: false, density: "compact", class: "min-h-comp-xl" },
    { ativa: true, surface: "surface", class: "bg-bg-surface border-b-bg-surface" },
    { ativa: true, surface: "canvas", class: "bg-bg-canvas border-b-bg-canvas" },
  ],

  defaultVariants: { density: "comfortable", fill: false, surface: "surface", ativa: false },
});

/**
 * Divisória curta entre abas — 20px, não altura cheia: altura cheia transformaria a tira num
 * toolbar segmentado, que é outra leitura. Centrar depende do modo, porque o eixo do flex
 * muda: `items-end` no pousado (daí a margem), `items-stretch` no cheio (daí `self-center`).
 */
export const tabsNavigationDivisoria = tv({
  base: "w-px shrink-0 bg-border-default",

  variants: {
    fill: {
      true: "h-[20px] self-center",
      false: "h-[20px] mb-[14px]",
    },
    /** Ao lado da aba ativa some: encostada na borda dela vira uma sombra falsa. */
    oculta: {
      true: "bg-transparent",
      false: "",
    },
  },

  defaultVariants: { fill: false, oculta: false },
});

/**
 * A faixa dos controles (setas, `+`, lista, ações globais) tem a MESMA altura da aba e
 * centraliza — é isso que alinha a fileira. Medido: com 48px fixos ao lado de abas de 40px,
 * ou dentro de uma faixa de 56px no modo cheio, tudo descia 4px do eixo.
 */
export const tabsNavigationControles = tv({
  base: "flex shrink-0 items-center gap-gp-2xs",

  variants: {
    fill: { true: "h-full", false: "" },
    density: { comfortable: "h-comp-3xl", compact: "h-comp-xl" },
  },

  compoundVariants: [
    { fill: true, density: "comfortable", class: "h-full" },
    { fill: true, density: "compact", class: "h-full" },
  ],

  defaultVariants: { fill: false, density: "comfortable" },
});

/** Ação inline da aba (`⋯`, `×`, ✓/✗). 24px — o menor `icon-*` do Button é 32px e não cabe. */
export const tabsNavigationAcao = tv({
  base: [
    "inline-flex size-comp-xs items-center justify-center rounded-radius-sm",
    "transition-colors focus-visible:outline-none focus-visible:ring-4",
  ],

  variants: {
    tom: {
      neutro: "text-fg-muted hover:bg-bg-muted hover:text-fg-default focus-visible:ring-ring-brand",
      success: "text-fg-success hover:bg-bg-success-muted focus-visible:ring-ring-success",
      danger: "text-fg-danger hover:bg-bg-danger-muted focus-visible:ring-ring-danger",
    },
  },

  defaultVariants: { tom: "neutro" },
});

/**
 * A coluna de ações CRESCE de 0fr a 1fr em vez de ficar reservada com `opacity-0`.
 *
 * Com opacidade os botões ocupavam 48px invisíveis e o título truncava por causa de espaço
 * que ninguém usava (medido: um título que cabia em 149px vinha cortado). `0fr → 1fr` é
 * interpolável em qualquer engine — `interpolate-size`/`calc-size()` fariam isso direto, mas
 * ainda não são Baseline e o DS entrega pra navegador que não escolhemos.
 */
export const tabsNavigationAcoes = tv({
  base: "grid transition-[grid-template-columns,opacity] duration-150 ease-out",

  variants: {
    visivel: {
      true: "grid-cols-[1fr] opacity-100",
      false:
        "grid-cols-[0fr] opacity-0 group-hover/aba:grid-cols-[1fr] group-hover/aba:opacity-100 group-focus-within/aba:grid-cols-[1fr] group-focus-within/aba:opacity-100",
    },
  },

  defaultVariants: { visivel: false },
});

/** O ponto de status. Ponto, não Chip: 5 abas abertas = 5 chips brigando com os títulos. */
export const tabsNavigationStatus = tv({
  base: "size-icon-2xs shrink-0",

  variants: {
    status: {
      success: "fill-bg-success text-bg-success",
      warning: "fill-bg-warning text-bg-warning",
      danger: "fill-bg-danger text-bg-danger",
      info: "fill-bg-info text-bg-info",
      neutral: "fill-fg-subtle text-fg-subtle",
    },
  },

  defaultVariants: { status: "neutral" },
});

export type TabsNavigationVariantProps = VariantProps<typeof tabsNavigationTab>;
