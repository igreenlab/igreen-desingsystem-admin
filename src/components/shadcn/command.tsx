"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/shadcn/dialog"

/**
 * Command — alinhado com o views-popover do design-and-table-v2.
 *
 * Estrutura:
 *   - <Command> raiz (flex column)
 *   - <CommandInput> = input "real" boxed (bg-input + border + radius-lg + shadow)
 *   - <CommandList> com padding 4px
 *   - <CommandGroup> heading uppercase + items
 *   - <CommandItem> radius-lg (10px), px 12, py 8, font 13px, ícones 18px
 *
 * Pattern do input replica `.tbl-views-pop-search` exatamente.
 */

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden p-pad-xl bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent
        hideClose
        className={cn(
          "overflow-hidden p-0 gap-0 sm:max-w-[384px]",
          "rounded-[12px] border border-border-default",
          // Outline padrão de elementos flutuantes
          "outline-float"
        )}
      >
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

/* ── Input boxed (igual views-popover search) ─────────────────────────────── */
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    cmdk-input-wrapper=""
    className={cn(
      "flex items-center gap-gp-md h-form-md px-pad-xl rounded-radius-lg",
      "bg-bg-input border border-border-subtle shadow-sh-sm",
      "transition-[border-color,box-shadow,background-color] duration-150",
      "focus-within:border-border-brand focus-within:shadow-sh-ring",
      "dark:bg-bg-muted dark:border-border-input dark:shadow-sh-none"
    )}
  >
    <Search className="size-[14px] text-fg-muted shrink-0" strokeWidth={1.8} />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex-1 min-w-0 bg-transparent border-0 outline-none",
        "text-body-sm font-normal text-fg-default placeholder:text-fg-muted",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

/* ── List ─────────────────────────────────────────────────────────────────── */
const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[300px] overflow-y-auto overflow-x-hidden mt-pad-md scrollbar-thin",
      className
    )}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-pad-5xl text-center text-body-md text-fg-muted"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

/* ── Group (heading uppercase 28px, sem padding extra no group) ──────────── */
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden text-fg-default",
      "[&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center",
      "[&_[cmdk-group-heading]]:h-[28px] [&_[cmdk-group-heading]]:px-pad-xl",
      "[&_[cmdk-group-heading]]:text-caption-xs [&_[cmdk-group-heading]]:font-bold",
      "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider",
      "[&_[cmdk-group-heading]]:text-fg-subtle",
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("mx-pad-xs my-pad-xs h-px bg-border-default", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

/* ── Item: px-12 py-8, radius-lg (10px), font 13px, ícones 18px ───────────── */
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-gp-md",
      "rounded-radius-lg px-pad-xl py-pad-md",
      "text-body-sm font-medium text-fg-muted",
      "outline-none transition-colors",
      "data-[selected='true']:bg-bg-muted data-[selected='true']:text-fg-default data-[selected='true']:[&_svg]:text-fg-default",
      "data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:text-fg-muted",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-caption-sm tracking-wider text-fg-subtle",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
