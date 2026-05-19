import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

/**
 * Progress — barra de progresso linear.
 *
 * Specs:
 *   - Track: h:12px (h-3), bg-emphasis (light, gray[100]) / bg-accent (dark, alpha 16%), radius-full
 *   - Indicator: bg-bg-brand (verde brand)
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-3 w-full items-center overflow-hidden rounded-radius-full",
      "bg-bg-emphasis dark:bg-bg-accent",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="size-full flex-1 bg-bg-brand transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
