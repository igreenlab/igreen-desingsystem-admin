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
      "min-h-form-xl gap-gp-xs px-pad-2xl py-pad-lg",
      "rounded-radius-xl bg-bg-muted",
      "border border-dashed border-border-default",
      "transition-[color,box-shadow,background-color,border-color] duration-200 ease-out",
      "cursor-pointer hover:border-border-brand",
      // Padrão 1 — focus estático
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
    ],
    dropIcon: "text-fg-subtle",
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
