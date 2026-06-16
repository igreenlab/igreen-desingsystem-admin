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
