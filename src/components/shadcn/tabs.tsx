import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Tabs — 2 variantes (set via `variant` no <Tabs>, propagado por contexto):
 *
 *  - "segmented" (default): pill group sobre bg-muted. Container h-form-lg (40px),
 *    p-[3px], radius-lg; tab h-[34px] px-[14px] radius-md; ativo = bg-accent +
 *    font-semibold + shadow-sm.
 *  - "line": underline. List sem chrome, só border-b (border-subtle); tab sem bg,
 *    border-b-2 transparente na base; ativo = border-border-brand + fg-default +
 *    font-semibold (a borda de 2px sobrepõe a da list via -mb-px).
 */
type TabsVariant = "segmented" | "line"
const TabsVariantContext = React.createContext<TabsVariant>("segmented")

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & { variant?: TabsVariant }
>(({ variant = "segmented", ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.Root ref={ref} {...props} />
  </TabsVariantContext.Provider>
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        variant === "line"
          ? "inline-flex w-fit items-center gap-gp-xl border-b border-border-subtle"
          : "inline-flex h-form-lg w-fit items-center bg-bg-muted p-[3px] gap-gp-2xs rounded-radius-lg",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-gp-sm whitespace-nowrap text-body-sm font-medium text-fg-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
        "hover:text-fg-default",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "line"
          ? "-mb-px h-[38px] px-[2px] pb-[8px] rounded-radius-sm border-b-2 border-transparent data-[state=active]:border-border-brand data-[state=active]:text-fg-default data-[state=active]:font-semibold"
          : "h-[34px] px-[14px] rounded-radius-md data-[state=active]:bg-bg-accent data-[state=active]:text-fg-default data-[state=active]:font-semibold data-[state=active]:shadow-sh-sm",
        className
      )}
      {...props}
    />
  )
})
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
