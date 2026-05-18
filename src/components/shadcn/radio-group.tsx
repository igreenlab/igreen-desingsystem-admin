import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "@/lib/utils"

/**
 * RadioGroup — alinhado com o pattern do Checkbox/Input do design-and-table-v2.
 *
 * Specs:
 *   - 16x16, border 1.5px border-input, radius-full
 *   - bg-input (light) / dark:bg-bg-muted
 *   - hover: border-default
 *   - checked: bg-brand + border-brand + inner dot white
 *   - focus: shadow-sh-ring
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid w-full gap-gp-xl", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "peer relative flex aspect-square size-4 shrink-0 cursor-pointer",
        "rounded-radius-full",
        "bg-bg-input dark:bg-bg-muted",
        "border-[1.5px] border-border-input",
        "transition-[background-color,border-color,box-shadow] outline-none",
        "hover:border-border-default",
        "focus-visible:shadow-sh-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-bg-brand data-[state=checked]:border-border-brand",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex size-full items-center justify-center">
        <span className="size-[6px] rounded-radius-full bg-fg-on-brand" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
