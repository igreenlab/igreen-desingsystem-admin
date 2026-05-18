"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Checkbox — alinhado com `.tbl-checkbox` do design-and-table-v2.
 *
 * Specs:
 *   - 16x16, border 1.5px border-input, radius 4px (radius-xs)
 *   - bg-input (light) / dark:bg-bg-muted
 *   - hover: border-default (mais visível)
 *   - checked/indeterminate: bg-brand + border-brand
 *   - check icon: branco (fg-on-brand)
 *   - focus: shadow-sh-ring (brand glow)
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer relative flex size-4 shrink-0 items-center justify-center cursor-pointer",
      "rounded-radius-xs",
      "bg-bg-input dark:bg-bg-muted",
      "border-[1.5px] border-border-input",
      "transition-[background-color,border-color,box-shadow] outline-none",
      "hover:border-border-default",
      "focus-visible:shadow-sh-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-bg-brand data-[state=checked]:border-border-brand",
      "data-[state=indeterminate]:bg-bg-brand data-[state=indeterminate]:border-border-brand",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-fg-on-brand")}
    >
      {props.checked === "indeterminate" ? (
        <Minus className="size-3" strokeWidth={3} />
      ) : (
        <Check className="size-3" strokeWidth={3} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
