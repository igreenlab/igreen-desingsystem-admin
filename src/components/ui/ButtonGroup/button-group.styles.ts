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
 * Width compacta do Chevron por size — não usa a `size` quadrada (icon-*) do Button
 * porque queremos um chevron MAIS ESTREITO que um icon button normal. Pad reduzido.
 *
 * Heights mantém min-h-form-* da size correspondente do Button pra alinhar visualmente.
 */
export const buttonGroupChevronSize = tv({
  variants: {
    size: {
      "2xs": "min-w-[20px] px-pad-sm",
      xs:    "min-w-[24px] px-pad-sm",
      sm:    "min-w-[28px] px-pad-md",
      md:    "min-w-[32px] px-pad-md",
      lg:    "min-w-[36px] px-pad-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
