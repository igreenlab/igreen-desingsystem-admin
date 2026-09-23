import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-overlay-scrim data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

// `overflow-y-auto` na base: conteúdo mais alto que o painel rola dentro dele em vez de
// sumir. Laterais já têm teto (`h-full`); top/bottom ganham `max-h-dvh`.
const sheetVariants = cva(
  "fixed z-50 overflow-y-auto bg-bg-surface dark:bg-bg-canvas text-fg-default shadow-sh-2xl ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-[220ms] data-[state=open]:duration-[220ms] data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 max-h-dvh border-b border-border-default data-[state=closed]:slide-out-to-top-12 data-[state=open]:slide-in-from-top-12",
        bottom:
          "inset-x-0 bottom-0 max-h-dvh border-t border-border-default data-[state=closed]:slide-out-to-bottom-12 data-[state=open]:slide-in-from-bottom-12",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-border-default data-[state=closed]:slide-out-to-left-12 data-[state=open]:slide-in-from-left-12 sm:max-w-page-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l border-border-default data-[state=closed]:slide-out-to-right-12 data-[state=open]:slide-in-from-right-12 sm:max-w-page-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /** Esconde o botão "X" (Close) no canto superior direito. Default: false. */
  hideClose?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, hideClose, onPointerDownOutside, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      onPointerDownOutside={(event) => {
        // Mesma proteção do DialogContent: overlay Radix portalado que não é filho React
        // deste conteúdo não pode fechar o sheet. Regressão: dialog-sheet-popper.test.tsx.
        if (
          event.target instanceof Element &&
          event.target.closest("[data-radix-popper-content-wrapper]")
        ) {
          event.preventDefault();
          return;
        }
        onPointerDownOutside?.(event);
      }}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      {!hideClose && (
        <SheetPrimitive.Close className="absolute right-pad-2xl top-pad-2xl rounded-radius-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary disabled:pointer-events-none data-[state=open]:bg-bg-muted text-fg-muted">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-gp-sm text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-gp-md sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-body-lg font-medium font-semibold text-fg-default", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-body-md text-fg-muted", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
