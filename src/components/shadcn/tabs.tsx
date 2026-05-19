import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Tabs — segmented group pattern.
 * Alinhado com tbl-views-group / tbl-density-btn do design-and-table-v2.
 *
 * Container: h-form-lg (40px), bg-muted, p-[3px], gap-gp-2xs (2px), radius-lg (10px)
 * Tab:       h-[34px], px-[14px], gap-gp-sm (6px), radius-md (8px), 13px + medium
 * Active:    bg-accent + text-default + font-semibold + shadow-sm (auto-none em dark)
 */
const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-form-lg w-fit items-center bg-bg-muted p-[3px] gap-gp-2xs rounded-radius-lg",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-[34px] items-center justify-center gap-gp-sm whitespace-nowrap px-[14px] rounded-radius-md text-body-sm font-medium text-fg-muted transition-colors",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
      "hover:text-fg-default",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-bg-accent data-[state=active]:text-fg-default data-[state=active]:font-semibold data-[state=active]:shadow-sh-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-sp-md flex-1 text-body-md outline-none",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
