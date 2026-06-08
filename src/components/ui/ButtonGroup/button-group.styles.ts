import { tv } from "@/utils/tv";

/**
 * ButtonGroup wrapper styles — agrupa visualmente os slots Primary + Chevron.
 *
 * Comportamento:
 *   - inline-flex: 2 botões lado a lado
 *   - radius: aplicado no group via slots (Primary herda left, Chevron herda right)
 *   - divider: border interno emerge naturalmente do Button outline; pra filled/soft
 *     usamos collapse via `-ml-px` no Chevron + ring divider via `before:` no slot
 *
 * Não tem variants próprias — color/variant/size vêm via ButtonGroupContext.
 * O wrapper só agrupa visualmente; aparência sai dos filhos.
 */
export const buttonGroupVariants = tv({
  base: [
    "inline-flex items-stretch",
    // Permite focus ring de cada filho aparecer (z-index relativo no slot focused).
    "isolate",
  ],
});

/**
 * Override de radius nos slots — neutraliza o radius da `size` do Button no
 * lado interno do group (entre Primary e Chevron) e mantém apenas no lado
 * externo (left do Primary, right do Chevron).
 *
 * Usa `!` pra sobrescrever a regra do Button (size define rounded-radius-X).
 */
export const buttonGroupSlot = tv({
  variants: {
    position: {
      // Primary: arredondado só na esquerda; direita reta pra "encostar" no chevron
      primary: "!rounded-r-none",
      // Chevron: arredondado só na direita; esquerda reta. -ml-px colapsa o border
      // duplicado entre os 2 botões (cada um tem border de 1px → vira 2px no meio).
      chevron: "!rounded-l-none -ml-px",
    },
  },
});

/**
 * Dimensões do Chevron por size — QUADRADO (width = height), alinhado com
 * a `size` correspondente do Button no Primary. Pad reduzido pro chevron
 * preencher o espaço sem ficar acanhado.
 *
 * Tabela de equivalência (size do Button → dimensão chevron):
 *   2xs (28px) → 28x28 (size-form-xs)
 *   xs  (32px) → 32x32 (size-form-sm)
 *   sm  (36px) → 36x36 (size-form-md)
 *   md  (40px) → 40x40 (size-form-lg)
 *   lg  (44px) → 44x44 (size-form-xl)
 *
 * Visual coeso: o chevron parece um "espelho" quadrado do Primary, não um
 * appendice estreito. Pattern Shadcn/Linear/Notion segue essa proporção.
 */
export const buttonGroupChevronSize = tv({
  variants: {
    size: {
      "2xs": "size-form-xs px-0",
      xs:    "size-form-sm px-0",
      sm:    "size-form-md px-0",
      md:    "size-form-lg px-0",
      lg:    "size-form-xl px-0",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
