import { tv, type VariantProps } from "@/utils/tv";

/**
 * DateSeparatorChip — separador centralizado na thread do chat.
 *
 * Compõe Chip (pílula neutra) + Icon (opcional, boundary) + Separator (réguas
 * finas, boundary). Só o WRAPPER é estilizado aqui — Chip/Icon/Separator trazem
 * os próprios estilos.
 *
 * Anatomia:
 *   root  = linha flex centralizada (mx-auto), full-width quando boundary pra
 *           que as réguas ocupem o espaço lateral.
 *   rule  = régua fina — só em variant=boundary; usa o Separator do shadcn (cor
 *           bg-border já vem dele), aqui só o flex-1 pra esticar.
 *   chip  = a pílula em si (estilos vêm do <Chip>). Slot existe pra ajustes de
 *           layout/typo do label quando necessário.
 *
 * `variant=date`   → só o chip pílula neutra centralizado.
 * `variant=boundary` → chip entre 2 réguas ("conversa encerrada/iniciada").
 *
 * Sem foco/disabled — é um marcador estático, não interativo (L-006 N/A).
 */
export const dateSeparatorChipStyles = tv({
  slots: {
    root: "flex w-full items-center justify-center",
    rule: "flex-1",
    chip: "mx-auto shrink-0",
  },
  variants: {
    variant: {
      date: {
        // sem réguas — só o chip centralizado
        root: "py-pad-2xs",
      },
      boundary: {
        // chip ladeado por 2 réguas finas, com respiro lateral
        root: "gap-gp-md py-pad-md",
      },
    },
  },
  defaultVariants: {
    variant: "date",
  },
});

export type DateSeparatorChipVariantProps = VariantProps<
  typeof dateSeparatorChipStyles
>;
