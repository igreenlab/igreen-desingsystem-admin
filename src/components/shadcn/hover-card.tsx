import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

/** Default snappy (openDelay 200 / closeDelay 100) — o default do Radix (700) é lento. */
const HoverCard = ({
  openDelay = 200,
  closeDelay = 100,
  ...props
}: React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>) => (
  <HoverCardPrimitive.Root openDelay={openDelay} closeDelay={closeDelay} {...props} />
)

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 relative rounded-[12px] border border-border-default bg-bg-dropdown p-pad-card-base text-fg-default shadow-sh-lg outline-float outline-none before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
