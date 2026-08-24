import { tv } from "@/utils/tv";

/**
 * FileUploadField styles — slots do widget renderizado dentro do FormField.
 *
 * - `dropzone`: estado VAZIO (value == null) — botão full-width clicável.
 * - `dropIcon` / `dropText` / `dropHint`: conteúdo do dropzone.
 * - `fileRow`: estado COM-ARQUIVO — preview + ação de remover.
 * - `thumb`: preview de imagem.
 * - `fileName`: nome do arquivo (truncate) no Chip de fallback.
 *
 * Focus do dropzone = Padrão 1 (botão estático): outline-none + ring-4.
 * `disabled` é o último variant declarado (L-006) — vence na cascata de slots.
 */
export const fileUploadFieldStyles = tv({
  slots: {
    dropzone: [
      "flex w-full flex-col items-center justify-center text-center",
      // Vertical MAIOR que o horizontal de propósito: é uma área de soltar, não uma linha de
      // form. Estava `py-pad-lg` (10px) contra `px-pad-2xl` (16px) — apertado justamente no
      // eixo que dá a leitura de "zona", e o conteúdo ficava colado na borda tracejada.
      "min-h-form-xl gap-gp-xs px-pad-2xl py-pad-4xl",
      "rounded-radius-xl bg-bg-muted",
      "border border-dashed border-border-default",
      "transition-[color,box-shadow,background-color,border-color] duration-200 ease-out",
      "cursor-pointer hover:border-border-brand",
      // Padrão 1 — focus estático
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
    ],
    dropIcon: "text-fg-subtle",
    /**
     * Título e hint num bloco próprio, com gap de 2px.
     *
     * Antes os três (ícone, título, hint) eram irmãos sob o `gap-gp-xs` (4px) do dropzone —
     * um gap só governando duas relações diferentes. Título↔hint são a MESMA informação em
     * dois níveis e querem ficar juntos; o ícone é outro elemento e quer respiro. Agrupar é o
     * que permite os dois valores.
     */
    dropTexts: "flex flex-col items-center gap-gp-2xs",
    dropText: "text-body-sm text-fg-muted",
    dropHint: "text-caption-md text-fg-subtle",
    fileRow: [
      "flex w-full items-center gap-gp-sm",
      "min-h-form-xl px-pad-xl py-pad-md",
      "rounded-radius-xl bg-bg-muted border border-border-subtle",
    ],
    thumb: [
      "size-icon-2xl shrink-0 rounded-radius-md object-cover",
      "border border-border-subtle",
    ],
    fileChipWrap: "flex min-w-0 flex-1 items-center",
    fileName: "min-w-0 truncate",
    removeWrap: "ml-auto shrink-0",
  },
  variants: {
    disabled: {
      // DS v3 não tem token bg-disabled/border-disabled → padrão Button = opacity-50 (L-006)
      true: {
        dropzone: "pointer-events-none opacity-50",
        fileRow: "opacity-50",
      },
    },
  },
  defaultVariants: { disabled: false },
});

export type FileUploadFieldVariantProps = Parameters<typeof fileUploadFieldStyles>[0];
