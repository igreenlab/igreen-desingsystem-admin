import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * InputGroup — composição rica pra inputs com addons (prefixo, sufixo, ícone, botão).
 *
 * Estrutura:
 *   <InputGroup>
 *     <InputGroupAddon align="inline-start"><Icon /></InputGroupAddon>
 *     <InputGroupInput placeholder="..." />
 *     <InputGroupAddon align="inline-end">
 *       <InputGroupButton><X /></InputGroupButton>
 *     </InputGroupAddon>
 *   </InputGroup>
 *
 * Visual alinhado com `.tbl-form-input` (mesmo bg/border/radius do <Input>).
 * State (default/error/warning/success) afeta borda + focus ring (shadow-sh-ring-*).
 */

export type InputGroupState = "default" | "error" | "warning" | "success";

/* ── Wrapper ─────────────────────────────────────────────────────────────── */
const inputGroupVariants = cva(
  [
    "group/input-group relative flex w-full items-center",
    "bg-bg-input dark:bg-bg-muted",
    "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover",
    "border border-border-input rounded-radius-lg",
    "transition-[border-color,box-shadow,background-color] outline-none",
    "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input:disabled]:hover:bg-bg-input dark:has-[input:disabled]:hover:bg-bg-muted",
  ],
  {
    variants: {
      size: {
        xxs: "min-h-form-xs px-pad-md gap-gp-xs rounded-radius-md text-body-sm font-normal",
        xs:  "min-h-form-sm px-pad-xl gap-gp-md rounded-radius-md text-body-sm font-normal",
        sm:  "min-h-form-md px-pad-xl gap-gp-md rounded-radius-lg text-body-sm font-normal",
        md:  "min-h-form-lg px-pad-xl gap-gp-md rounded-radius-lg text-body-sm font-normal",
      },
      state: {
        default: "focus-within:border-border-brand          focus-within:shadow-sh-ring",
        error:   "border-border-danger-muted  focus-within:border-border-danger-muted  focus-within:shadow-sh-ring-danger",
        warning: "border-border-warning-muted focus-within:border-border-warning-muted focus-within:shadow-sh-ring-warning",
        success: "border-border-success-muted focus-within:border-border-success-muted focus-within:shadow-sh-ring-success",
      },
    },
    defaultVariants: { size: "md", state: "default" },
  },
);

export type InputGroupVariantProps = VariantProps<typeof inputGroupVariants>;

export interface InputGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    InputGroupVariantProps {}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, size, state, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-slot="input-group"
      className={cn(inputGroupVariants({ size, state }), className)}
      {...props}
    />
  ),
);
InputGroup.displayName = "InputGroup";

/* ── Input (sem bg/border — herda do wrapper) ─────────────────────────── */
const inputGroupInputVariants = cva([
  "flex-1 min-w-0 bg-transparent border-0 outline-none",
  "text-body-sm font-normal text-fg-default placeholder:text-fg-muted placeholder:opacity-70",
  "disabled:cursor-not-allowed",
  "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg-default",
]);

export interface InputGroupInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  InputGroupInputProps
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    data-slot="input-group-input"
    className={cn(inputGroupInputVariants(), className)}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";

/* ── Textarea ──────────────────────────────────────────────────────────── */
const inputGroupTextareaVariants = cva([
  "flex-1 min-w-0 bg-transparent border-0 outline-none resize-y",
  "py-pad-md",
  "text-body-sm font-normal leading-[1.5] text-fg-default placeholder:text-fg-muted placeholder:opacity-70",
  "disabled:cursor-not-allowed",
]);

export interface InputGroupTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  InputGroupTextareaProps
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="input-group-textarea"
    className={cn(inputGroupTextareaVariants(), className)}
    {...props}
  />
));
InputGroupTextarea.displayName = "InputGroupTextarea";

/* ── Addon (prefix/suffix slot) ───────────────────────────────────────── */
const inputGroupAddonVariants = cva(
  "flex items-center text-fg-muted shrink-0 select-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      align: {
        // Inline = horizontal (start/end do eixo do texto)
        "inline-start": "",
        "inline-end":   "",
        // Block = vertical (top/bottom — multi-linha em textarea)
        "block-start":  "",
        "block-end":    "",
      },
    },
    defaultVariants: { align: "inline-start" },
  },
);

export type InputGroupAddonAlign =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end";

export interface InputGroupAddonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: InputGroupAddonAlign;
}

export const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  InputGroupAddonProps
>(({ className, align = "inline-start", onClick, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    data-slot="input-group-addon"
    data-align={align}
    className={cn(inputGroupAddonVariants({ align }), className)}
    onClick={(e) => {
      // Click no addon (ícone, texto, espaço vazio) → foca o input do grupo.
      // Botões dentro do addon (`InputGroupButton`) continuam funcionando.
      if ((e.target as HTMLElement).closest("button")) {
        onClick?.(e);
        return;
      }
      e.currentTarget.parentElement
        ?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          "input, textarea",
        )
        ?.focus();
      onClick?.(e);
    }}
    {...props}
  />
));
InputGroupAddon.displayName = "InputGroupAddon";

/* ── Text (texto formatado dentro do addon) ───────────────────────────── */
export interface InputGroupTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  InputGroupTextProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="input-group-text"
    className={cn(
      "text-body-xs text-fg-muted whitespace-nowrap",
      className,
    )}
    {...props}
  />
));
InputGroupText.displayName = "InputGroupText";

/* ── Button (botão dentro do addon — ex copy/clear) ───────────────────── */
const inputGroupButtonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0",
    "rounded-radius-md transition-colors outline-none cursor-pointer",
    "focus-visible:ring-4 focus-visible:ring-ring-brand",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        xs:        "h-form-xs px-pad-md gap-gp-xs text-body-xs font-normal",
        "icon-xs": "size-form-xs",
        sm:        "h-form-sm px-pad-lg gap-gp-md text-body-xs font-normal",
        "icon-sm": "size-form-sm",
      },
      variant: {
        default:     "bg-bg-muted text-fg-default hover:bg-bg-muted-hover",
        destructive: "bg-bg-danger text-fg-on-danger hover:bg-bg-danger-hover",
        outline:     "border border-border-input bg-transparent text-fg-default hover:bg-bg-muted",
        secondary:   "bg-bg-emphasis text-fg-default hover:bg-bg-muted-hover",
        ghost:       "bg-transparent text-fg-muted hover:bg-bg-muted hover:text-fg-default",
        link:        "bg-transparent text-fg-brand underline-offset-4 hover:underline",
      },
    },
    defaultVariants: { size: "xs", variant: "ghost" },
  },
);

export interface InputGroupButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    VariantProps<typeof inputGroupButtonVariants> {}

export const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  InputGroupButtonProps
>(({ className, size, variant, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    data-slot="input-group-button"
    className={cn(inputGroupButtonVariants({ size, variant }), className)}
    {...props}
  />
));
InputGroupButton.displayName = "InputGroupButton";

export {
  inputGroupVariants,
  inputGroupInputVariants,
  inputGroupTextareaVariants,
  inputGroupAddonVariants,
  inputGroupButtonVariants,
};
