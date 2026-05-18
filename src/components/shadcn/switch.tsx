import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * Switch — alinhado com `.tbl-toggle` do design-and-table-v2.
 *
 * Specs:
 *   - Track: 42x24, radius-full
 *     - off light: bg-emphasis (gray[100] — visível em fundo branco)
 *     - off dark:  bg-accent (alpha branco 12% — visível em fundo escuro)
 *     - on:        bg-brand
 *   - Thumb: 20x20, white com shadow, transform 0.18s
 *   - Focus: shadow-sh-ring (brand glow)
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-[24px] w-[42px] shrink-0 cursor-pointer items-center",
      "rounded-radius-full",
      "transition-[background-color,box-shadow] duration-150 outline-none",
      "data-[state=unchecked]:bg-bg-emphasis dark:data-[state=unchecked]:bg-bg-accent",
      "data-[state=checked]:bg-bg-brand",
      "focus-visible:shadow-sh-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-[20px] rounded-radius-full bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.10)]",
        "transition-transform duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        "data-[state=unchecked]:translate-x-[2px]",
        "data-[state=checked]:translate-x-[20px]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
