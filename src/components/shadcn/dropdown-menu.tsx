"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * DropdownMenu — alinhado com `.tbl-row-actions-menu` / `.tbl-more-menu`
 * do design-and-table-v2.
 *
 * Container:
 *   - bg-bg-dropdown (token frosted-glass — solid no light, 70% transparent + blur no dark)
 *   - border 1px + radius 12px + padding 6px + shadow-lg
 *   - min-w 180px, items separados por 1px (gap-px)
 *
 * Item:
 *   - h variavel, padding 8/10, radius 6px, gap 10, font 13px medium
 *   - rest: fg-muted (texto + ícone), hover/focus: bg-muted + fg-default
 *   - variant="destructive": fg-danger + hover bg-danger-muted
 *
 * Divider:
 *   - 1px bg-border-default com margin 4px (não estende além do padding)
 */

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

/* ── Container (Content + SubContent) ─────────────────────────────────────── */
const CONTAINER_CLASSES = [
  "relative z-50 min-w-[180px] overflow-hidden",
  "flex flex-col gap-px",
  "rounded-[12px] bg-bg-dropdown p-pad-sm",
  "border border-border-default shadow-sh-lg",
  // Outline padrão de elementos flutuantes
  "outline-float",
  "text-fg-muted",
  // Frosted-glass blur (necessário pra fazer o bg-dropdown semi-transparent render correto no dark)
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150",
  // Animações Radix
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  "origin-[--radix-dropdown-menu-content-transform-origin]",
].join(" ")

/* ── Mobile sheet (só Content, <md) ───────────────────────────────────────
 * Em telas <md o Content vira sheet bottom-up colado nas bordas: full-width,
 * só cantos superiores arredondados, flush, sem outline/shadow, cap 92vh.
 * O reposicionamento do wrapper Radix é feito no globals.css via [data-mobile-sheet].
 * Animação: neutraliza o zoom e desliza de baixo (sobrescreve os slides por side).
 */
const MOBILE_SHEET_CLASSES = [
  "max-md:w-full max-md:min-w-0 max-md:max-w-none",
  "max-md:!max-h-[92vh]",
  "max-md:rounded-b-none max-md:rounded-t-[12px]",
  "max-md:border-x-0 max-md:border-b-0",
  "max-md:outline-none max-md:shadow-none",
  "max-md:data-[state=open]:zoom-in-100 max-md:data-[state=closed]:zoom-out-100",
  "max-md:data-[state=open]:slide-in-from-bottom-12 max-md:data-[state=closed]:slide-out-to-bottom-12",
].join(" ")

/* ── Item base ────────────────────────────────────────────────────────────── */
const ITEM_BASE = [
  "relative flex cursor-default select-none items-center",
  "gap-pad-lg px-pad-lg py-pad-md rounded-radius-sm",
  "text-body-sm font-medium",
  "outline-none transition-colors",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
].join(" ")

const ITEM_VARIANT_DEFAULT = [
  "text-fg-muted [&_svg]:text-fg-muted",
  "focus:bg-bg-muted focus:text-fg-default focus:[&_svg]:text-fg-default",
].join(" ")

const ITEM_VARIANT_DESTRUCTIVE = [
  "text-fg-danger [&_svg]:text-fg-danger",
  "focus:bg-bg-danger-muted focus:text-fg-danger focus:[&_svg]:text-fg-danger",
].join(" ")

/* ── SubTrigger ───────────────────────────────────────────────────────────── */
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      ITEM_BASE,
      ITEM_VARIANT_DEFAULT,
      "data-[state=open]:bg-bg-muted data-[state=open]:text-fg-default",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

/* ── SubContent ───────────────────────────────────────────────────────────── */
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(CONTAINER_CLASSES, className)}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

/* ── Content ──────────────────────────────────────────────────────────────── */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    /**
     * Em telas <md, transforma o menu em sheet bottom-up colado nas bordas,
     * com backdrop suave (toque fora fecha via dismiss do Radix). Default true.
     * Passe `false` pra manter o popover ancorado no trigger também em mobile.
     */
    mobileSheet?: boolean
  }
>(({ className, sideOffset = 8, mobileSheet = true, ...props }, ref) => (
  <>
    {/* Backdrop suave — só mobile (md:hidden), em Portal próprio (cada Portal
        Radix aceita 1 filho e é montado/desmontado junto com o menu via Presence).
        pointer-events-auto garante que o toque registre → Radix detecta interação
        fora do Content → fecha. */}
    {mobileSheet && (
      <DropdownMenuPrimitive.Portal>
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-overlay-scrim pointer-events-auto md:hidden animate-in fade-in-0 duration-150"
        />
      </DropdownMenuPrimitive.Portal>
    )}
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        data-mobile-sheet={mobileSheet ? "" : undefined}
        className={cn(
          CONTAINER_CLASSES,
          "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden",
          mobileSheet && MOBILE_SHEET_CLASSES,
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  </>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

/* ── Item ─────────────────────────────────────────────────────────────────── */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
    /** Variante semântica — "destructive" pinta fg-danger e usa bg-danger-muted no hover */
    variant?: "default" | "destructive"
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      ITEM_BASE,
      variant === "destructive" ? ITEM_VARIANT_DESTRUCTIVE : ITEM_VARIANT_DEFAULT,
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

/* ── CheckboxItem ─────────────────────────────────────────────────────────── */
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      ITEM_BASE,
      ITEM_VARIANT_DEFAULT,
      "pl-8 pr-pad-lg",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-pad-md flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

/* ── RadioItem ────────────────────────────────────────────────────────────── */
/**
 * RadioItem — item selecionado ganha tom brand:
 *   - rest:    fg-muted (igual default item)
 *   - hover:   bg-muted + fg-default (igual default item)
 *   - checked: bg-bg-brand-subtle + fg-fg-brand (estado ativo destacado)
 *
 * Indicator: `<Check />` consistente com `<DropdownMenuCheckboxItem>` (antes era `<Circle />`).
 */
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      ITEM_BASE,
      ITEM_VARIANT_DEFAULT,
      "pl-8 pr-pad-lg",
      // Selected state — brand tint (mantém no focus pra não voltar pra muted)
      "data-[state=checked]:bg-bg-brand-subtle data-[state=checked]:text-fg-brand",
      "data-[state=checked]:[&_svg]:text-fg-brand",
      "data-[state=checked]:focus:bg-bg-brand-subtle data-[state=checked]:focus:text-fg-brand",
      className
    )}
    {...props}
  >
    <span className="absolute left-pad-md flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="size-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

/* ── Label ────────────────────────────────────────────────────────────────── */
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-pad-lg py-pad-sm text-caption-sm font-semibold uppercase tracking-wider text-fg-subtle",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

/* ── Separator (divider) ──────────────────────────────────────────────────── */
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("mx-pad-xs my-pad-xs h-px bg-border-default", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

/* ── Shortcut (texto à direita do item) ───────────────────────────────────── */
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-caption-sm tracking-wider text-fg-subtle", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
