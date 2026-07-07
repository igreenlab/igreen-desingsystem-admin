import { tv, type VariantProps } from "@/utils/tv";

/**
 * MessageVariablesPicker — só os slots do CONTEÚDO do popover.
 * O trigger usa o componente Button do DS (estilo via variants do próprio Button),
 * por isso não tem slot de estilo aqui.
 */
export const messageVariablesPickerStyles = tv({
  slots: {
    /** Container interno do PopoverContent. */
    content: "flex flex-col gap-gp-md p-sp-sm min-w-[200px]",
    /** Header opcional ("Variáveis disponíveis"). */
    header: "text-caption-md text-fg-muted px-pad-md",
    /** Lista de chips. */
    list: "flex flex-wrap gap-gp-xs",
    /** Estado vazio. */
    empty: "text-caption-md text-fg-subtle px-pad-md",
  },
  variants: {
    size: {
      sm: {},
      md: { content: "min-w-[240px]" },
    },
  },
  defaultVariants: { size: "sm" },
});

export type MessageVariablesPickerVariantProps = VariantProps<
  typeof messageVariablesPickerStyles
>;
