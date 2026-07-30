import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Input — alinhado com `.tbl-form-input` do design-and-table-v2.
 *
 * Specs base (md, default):
 *   - h: 40px (form-lg), px: 12px (pad-xl), radius: 10px (radius-lg)
 *   - bg-input (light) / dark:bg-bg-muted
 *   - border: 1px solid border-input
 *   - font: 13px, color fg-default, placeholder fg-muted
 *   - focus: border + shadow-sh-ring por state
 *
 * Pra inputs com prefixo/sufixo/ícone/botão dentro → use `<InputGroup>`.
 * Este componente é puro (só o <input>) — sem wrapper, sem adornments inline.
 */

export type InputState = "default" | "error" | "warning" | "success";

const inputVariants = cva(
  [
    "flex w-full",
    "bg-bg-input dark:bg-bg-muted",
    "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover",
    "border border-border-input rounded-radius-lg",
    "px-pad-xl",
    "text-body-sm font-normal text-fg-default placeholder:text-fg-muted placeholder:opacity-70",
    "transition-[border-color,box-shadow,background-color] outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-input dark:disabled:hover:bg-bg-muted",
    "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg-default",
    // type=file — escopado no atributo de propósito, pra não mexer em nenhum
    // outro input (este é primitivo compartilhado).
    //
    //  · `block` + `align-content:center`: o conteúdo do file input (botão +
    //    nome do arquivo) vive no SHADOW DOM, então `align-items` NÃO o move —
    //    medido: com `items-center` o computed vira `center` e o pixel não sai
    //    do lugar. O que centra é `align-content` num container de BLOCO
    //    (CSS Align L3), que aplica ao conteúdo em fluxo. Testados e reprovados:
    //    `items-center`, `align-content` sobre flex (com e sem wrap), `grid` +
    //    `place-content`, e `::file-selector-button { margin-block: auto }`.
    //    Preferido a `line-height` = altura da caixa, que centraria também mas
    //    exigiria um px mágico por size (28/32/36/40) desacoplado dos tokens de
    //    `form-*`. Piso: Chrome 123+ / Safari 17.6+ / Firefox 125+; abaixo disso
    //    degrada pro alinhamento antigo, sem quebrar nada.
    //  · `text-fg-muted`: o "Nenhum arquivo escolhido" vinha em fg-default
    //    (0.98), destoando de `placeholder:text-fg-muted` de todo input do DS.
    //    O CSS não distingue vazio de preenchido num file input, então o nome do
    //    arquivo escolhido também fica muted — trade-off registrado no gotcha de
    //    `shadcn/USAGE.md`; pra UX de upload de verdade use `FileUploadField`.
    "[&[type=file]]:block [&[type=file]]:[align-content:center] [&[type=file]]:text-fg-muted",
  ],
  {
    variants: {
      size: {
        xxs: "min-h-form-xs rounded-radius-md",
        xs:  "min-h-form-sm rounded-radius-md",
        sm:  "min-h-form-md",
        md:  "min-h-form-lg",
      },
      state: {
        default: "focus-visible:border-border-brand          focus-visible:shadow-sh-ring",
        error:   "border-border-danger-muted  focus-visible:border-border-danger-muted  focus-visible:shadow-sh-ring-danger",
        warning: "border-border-warning-muted focus-visible:border-border-warning-muted focus-visible:shadow-sh-ring-warning",
        success: "border-border-success-muted focus-visible:border-border-success-muted focus-visible:shadow-sh-ring-success",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  },
);

export type InputVariantProps = VariantProps<typeof inputVariants>;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    InputVariantProps {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, state, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(inputVariants({ size, state }), className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
