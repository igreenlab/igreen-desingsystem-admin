import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * Tooltip — hint flutuante de hover/focus pra icon-buttons e controles densos.
 *
 * Visual unificado com Popover/DropdownMenu: bg-bg-dropdown (frosted-glass no
 * dark via `before:backdrop-blur-2xl`) + border-default. Menor que os menus:
 * radius 8px (radius-md), tipografia body-xs, sem seta (menus do DS não usam).
 *
 * Conteúdo não é interativo — sem focus ring próprio; o ring é do trigger.
 * Provider único no app define o delay (300ms) — consumidor não configura.
 */

const TooltipProvider = ({
  delayDuration = 300,
  skipDelayDuration = 150,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
);

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 select-none",
        "bg-bg-dropdown",
        "border border-border-default rounded-radius-md shadow-sh-md",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150",
        "px-pad-lg py-pad-sm text-body-xs text-fg-default",
        "data-[state=delayed-open]:animate-in data-[state=instant-open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 fade-in-0",
        "data-[state=closed]:zoom-out-95 zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
