import { tv, type VariantProps } from "@/utils/tv";

/**
 * Gramática visual do chip de filtro APLICADO — a fileira que aparece abaixo de
 * uma toolbar dizendo o que está ligado, com o `⊗` pra desligar.
 *
 * ## Por que estes `tv()` saíram de dentro do `TableToolbar`
 *
 * Até 2026-11-04 esta mesma gramática existia **três vezes**, escrita à mão:
 * `toolbarAppliedChip*` (`TableToolbar`, a origem), `schedulerFilterChip*`
 * (`Scheduler`) e `ganttAppliedChip*` (`Gantt`). Os dois últimos documentavam a
 * cópia com razões — e mesmo assim já tinham divergido: `gap-gp-md` × `gap-gp-sm`
 * no chip, `pl-pad-sm pr-pad-lg` × `pl-pad-lg pr-pad-md` no padding, pílula de
 * valor em `h-[22px]` × `h-comp-2xs` (20px).
 *
 * A causa não era desleixo: `toolbarAppliedChip` **não era exportado** — nem do
 * `TableToolbar/index.ts`, nem do barrel. Quem precisava do chip não tinha como
 * importá-lo, então copiava. Enquanto a peça não for alcançável, a próxima tela
 * copia de novo; por isso ela mora aqui e é export público.
 *
 * ## Os valores são os do `TableToolbar`, não uma média dos três
 *
 * A origem é a régua, e ela tem um teste que a trava byte por byte contra o
 * pixel de antes do item 16 (`TableToolbar/chip-filtro-ativo.test.tsx` recria a
 * `tv()` de `21477d0^` verbatim). O `Gantt` já batia; o `Scheduler` é o que muda.
 *
 * ⛔ Não edite estes valores "pra ficar melhor em uma tela". São três telas.
 */

/**
 * A fileira. `separator` liga o divisor `16px → border-top → 16px` entre a
 * toolbar e os chips.
 *
 * ⚠️ O espaçamento mora AQUI (`mt`/`pt`) e não como `gap` do pai: a linha só
 * existe quando há filtro aplicado, e um `gap` no pai cobraria margem por uma
 * linha ausente na maior parte do tempo.
 *
 * Mobile rola na horizontal em vez de quebrar linha — 4 chips empilhados
 * empurrariam a grade pra fora da tela. Scrollbar oculta; `sm+` volta a `wrap`.
 */
export const filterChipRow = tv({
  base: [
    "flex items-center gap-gp-md",
    "flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-x-visible",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ],
  variants: {
    separator: {
      true: "mt-pad-2xl pt-pad-2xl border-t border-border-default",
      false: "",
    },
  },
  defaultVariants: {
    separator: true,
  },
});

/**
 * O chip. `active` é o **destaque OPT-IN** do chip aplicado (item 16 do Sólis):
 *
 *   `active: false` → tracejado neutro. É o **default** e o pixel de sempre
 *   `active: true`  → sólido de marca sobre `bg-brand-subtle` = filtro aplicado
 *                     numa barra que pediu o destaque
 *
 * ⚠️ `active` **não** é sinônimo de "tem valor": o destaque só **paga** quando
 * há chip VAZIO na mesma barra pra contrastar. Sem chip vazio ele não distingue
 * nada e pinta tudo de marca. Quem decide é o consumidor; o default é o pixel
 * de antes.
 *
 * ⚠️ `bg` e `border-style`/`border-color` saíram da `base` e vivem só dentro da
 * variante, e o `hover` só nos `compoundVariants`. Não é organização: com
 * prefixo DS o `tailwind-merge` **não** reconhece `bg-bg-surface` ×
 * `bg-bg-brand-subtle` como conflito, as duas sobreviveriam e quem decidiria
 * seria a ordem do CSS (L-072). Declarado uma vez por ramo, não há empate.
 *
 * `shrink-0` mora na base: no scroll horizontal do mobile (`flex-nowrap`) os
 * chips não podem comprimir. O `TableToolbar` já o aplicava no `<div>` externo
 * de cada chip; aqui ele vale pros três sem o wrapper precisar lembrar.
 */
export const filterChip = tv({
  base: [
    "inline-flex shrink-0 items-center gap-gp-md",
    "h-form-md pl-pad-sm pr-pad-lg",
    "border rounded-radius-lg",
    "text-body-xs font-normal text-fg-default",
    "transition-[background-color,border-color] duration-150",
  ],
  variants: {
    interactive: {
      true: [
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
      ],
      false: "",
    },
    active: {
      true: "bg-bg-brand-subtle border-solid border-border-brand",
      false: "bg-bg-surface dark:bg-bg-muted border-dashed border-border-input",
    },
  },
  compoundVariants: [
    {
      interactive: true,
      active: false,
      class: "hover:bg-bg-muted-hover hover:border-border-default dark:hover:bg-bg-accent",
    },
    {
      interactive: true,
      active: true,
      class: "hover:bg-bg-brand-subtle-hover hover:border-border-brand",
    },
  ],
  defaultVariants: {
    interactive: false,
    active: false,
  },
});

/**
 * O `⊗` de remover — à **ESQUERDA** do chip.
 *
 * ⚠️ A posição tem razão de ser: à direita o alvo fica depois de um valor de
 * largura variável e "dança" de posição entre chips; à esquerda todos ficam
 * alinhados numa coluna, e limpar três filtros são três cliques sem
 * reposicionar a mira.
 */
export const filterChipRemove = tv({
  base: [
    "grid place-items-center size-[18px] shrink-0",
    "rounded-radius-full border-0 bg-transparent text-fg-subtle cursor-pointer outline-none",
    "transition-colors duration-150",
    "hover:text-fg-default",
    "focus-visible:shadow-sh-ring",
    "[&_svg]:size-[14px]",
  ],
});

/** O nome do campo — "Status", "Frente", "Responsável". */
export const filterChipName = tv({
  base: "font-semibold text-fg-default",
});

/**
 * O operador — "é", "contém", "entre".
 *
 * ⚠️ Sem ele o chip lê "Status Ativo", uma justaposição ambígua; com ele lê
 * "Status é Ativo", que é a frase que o filtro de fato executa.
 */
export const filterChipOp = tv({
  base: "text-fg-muted text-caption-sm",
});

/**
 * A pílula do VALOR. `active` muda SÓ a cor do texto.
 *
 * ⚠️ O fundo continua `bg-muted` / `bg-accent` **de propósito**, e isso foi
 * medido: tingir também a pílula (22% de marca sobre os 14% do chip) derrubava
 * o texto para **3,14:1** no claro — reprovando o AA de 4,5:1 para 12px. A cor
 * de marca mora na BORDA e no fundo do chip, não embaixo do texto.
 *
 * ⚠️ E no ESCURO o verde volta a ser `fg-default`, pelo mesmo motivo medido: o
 * `brandContrast` sobre superfície escura dá **4,36:1** — reprova o AA por
 * 0,14. No escuro quem carrega o estado é a borda do chip (**7,99:1** contra a
 * barra, onde o chip vazio mede 1,24).
 */
export const filterChipValue = tv({
  base: [
    "inline-flex items-center h-[22px] px-pad-md",
    "rounded-radius-sm",
    "bg-bg-muted dark:bg-bg-accent",
    "text-body-xs font-medium",
  ],
  variants: {
    active: {
      true: "text-fg-brand dark:text-fg-default",
      false: "text-fg-default",
    },
  },
  defaultVariants: {
    active: false,
  },
});

/**
 * "Limpar todos" no fim da fileira.
 *
 * Link e não `Button`: é a saída de um estado, não ação de primeira ordem — um
 * botão de 40px ali competiria com os próprios chips.
 */
export const filterChipClearLink = tv({
  base: [
    "ml-pad-sm shrink-0 text-body-xs font-medium text-fg-brand cursor-pointer outline-none",
    "bg-transparent border-0 p-0",
    "transition-opacity duration-150",
    "hover:underline underline-offset-2",
    "focus-visible:underline",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
});

export type FilterChipVariants = VariantProps<typeof filterChip>;
