import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-gp-xs rounded-radius-md border border-transparent text-body-sm font-semibold transition-colors hover:bg-bg-muted hover:text-fg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-bg-brand-subtle data-[state=on]:text-fg-brand [&_svg]:pointer-events-none [&_svg]:size-icon-sm [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border-border-default bg-transparent hover:bg-bg-muted hover:text-fg-default",
      },
      size: {
        default: "min-h-form-lg px-pad-xl min-w-form-lg",
        sm: "min-h-form-md px-pad-lg min-w-form-md",
        lg: "min-h-form-xl px-sp-3xl min-w-form-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
