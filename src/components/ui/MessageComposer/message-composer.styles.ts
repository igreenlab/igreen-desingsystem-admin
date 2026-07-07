import { tv, type VariantProps } from "@/utils/tv";

/**
 * MessageComposer — shell DUMB do input de mensagem (Atendimento + Chat interno).
 *
 * Anatomia visual (só a moldura; Textarea/Button/Icon/Chip/Separator trazem os
 * próprios estilos):
 *   root        = coluna [replyPreview] + [banner] + [field]
 *   replyPreview= slot acima da textarea (barra de citação) — só padding/gap
 *   banner      = slot de aviso ('janela 24h' / read-only) — neutro, só padding
 *   field       = linha [toolbarStart] + [textarea | recording] + [toolbarEnd] + [send]
 *   textarea    = wrapper flex-1 que cresce; o <Textarea> do DS vai dentro com
 *                 classes de moldura (sem borda própria, transparente, auto-grow)
 *   recording   = slot que SUBSTITUI a textarea quando gravando
 *
 * Foco:
 *   - send → herda o Button do DS (Padrão 1, estático, ring brand)
 *   - textarea → herda o Textarea do DS (Padrão 2, animado) — aqui só removemos
 *     borda/ring/bg para a textarea se fundir na moldura externa
 *
 * `state` controla a aparência da moldura (open = editável, disabled = apagado,
 * read-only = sem campo, mostra banner). `disabled` é o ÚLTIMO compoundVariant
 * (L-006). `size` ajusta padding/min-height do field e da textarea.
 */
export const messageComposerStyles = tv({
  slots: {
    root: [
      "flex w-full flex-col",
      "rounded-radius-lg border border-border-subtle",
      "bg-bg-surface dark:bg-bg-muted",
      "shadow-sh-sm",
      "transition-[border-color,box-shadow,background-color]",
      "focus-within:border-border-brand focus-within:shadow-sh-ring",
    ],
    replyPreview: "border-b border-border-subtle px-pad-2xl py-pad-lg",
    banner: [
      "border-b border-border-subtle px-pad-2xl py-pad-lg",
      "text-body-sm text-fg-muted",
    ],
    field: "flex w-full items-end gap-gp-md",
    toolbarStart: "flex shrink-0 items-center gap-gp-xs",
    toolbarEnd: "flex shrink-0 items-center gap-gp-xs",
    inputArea: "flex min-w-0 flex-1 items-end",
    recording: "flex min-w-0 flex-1 items-center",
    textarea: [
      // funde a textarea na moldura externa: sem borda/ring/bg/shadow próprios
      "min-h-form-lg w-full resize-none",
      "border-none bg-transparent shadow-none",
      "px-pad-md py-pad-md",
      "focus-visible:shadow-none focus-visible:border-none",
      "hover:bg-transparent dark:hover:bg-transparent",
      "disabled:hover:bg-transparent dark:disabled:hover:bg-transparent",
    ],
    send: "shrink-0",
  },
  variants: {
    size: {
      sm: {
        field: "px-pad-md py-pad-sm",
        textarea: "min-h-form-md max-h-[160px] text-body-sm",
      },
      md: {
        field: "px-pad-lg py-pad-md",
        textarea: "min-h-form-lg max-h-[200px] text-body-sm",
      },
    },
    state: {
      open: {},
      disabled: { root: "opacity-60" },
      "read-only": {},
    },
  },
  compoundVariants: [
    // disabled SEMPRE por último (L-006)
    {
      state: "disabled",
      class: { root: "pointer-events-none" },
    },
  ],
  defaultVariants: {
    size: "md",
    state: "open",
  },
});

export type MessageComposerVariantProps = VariantProps<
  typeof messageComposerStyles
>;
