import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Textarea — alinhado com `.tbl-form-textarea` do design-and-table-v2.
 *
 * Specs:
 *   - min-h: 100px, padding: 10px 12px, radius: 10px
 *   - bg-input (light) / dark:bg-bg-muted, border-input 1px
 *   - font: 13px, line-height: 1.5, resize vertical
 *   - focus: border-brand + shadow-sh-ring
 *
 * Features: state prop (default | error | warning | success) pra feedback visual.
 */

export type TextareaState = "default" | "error" | "warning" | "success";

const textareaVariants = cva(
  [
    "flex min-h-[100px] w-full resize-y",
    "bg-bg-input dark:bg-bg-muted",
    "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover",
    "border border-border-input rounded-radius-lg",
    "px-pad-xl py-pad-lg",
    "text-body-sm font-normal leading-[1.5] text-fg-default",
    "placeholder:text-fg-muted placeholder:opacity-70",
    "transition-[color,box-shadow,background-color,border-color] outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-input dark:disabled:hover:bg-bg-muted",
  ],
  {
    variants: {
      state: {
        default: "focus-visible:border-border-brand          focus-visible:shadow-sh-ring",
        error:   "border-border-danger-muted  focus-visible:border-border-danger-muted  focus-visible:shadow-sh-ring-danger",
        warning: "border-border-warning-muted focus-visible:border-border-warning-muted focus-visible:shadow-sh-ring-warning",
        success: "border-border-success-muted focus-visible:border-border-success-muted focus-visible:shadow-sh-ring-success",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ state }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
