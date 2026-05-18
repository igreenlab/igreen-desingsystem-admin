import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetTrigger,
  SheetOverlay,
} from "../../shadcn/sheet";
import { panelContainer } from "./panel.styles";
import { PanelHeader } from "./panel-header";
import { PanelBody } from "./panel-body";
import { PanelFooter } from "./panel-footer";
import type { PanelProps, PanelSide, PanelSize } from "./panel.types";

/**
 * Width pré-definida por size. `full` ocupa o viewport menos o gutter (24px each side).
 * Aceita também string CSS arbitrária (ex: "720px", "60vw").
 */
const SIZE_MAP: Record<PanelSize, string> = {
  sm: "w-[320px]",
  md: "w-[560px]",
  lg: "w-[720px]",
  xl: "w-[920px]",
  full: "w-[calc(100vw-48px)] max-md:w-[calc(100vw-16px)]",
};

function resolveSize(size?: PanelSize | string): string {
  if (!size) return SIZE_MAP.md;
  if (size in SIZE_MAP) return SIZE_MAP[size as PanelSize];
  return `w-[${size}]`;
}

/**
 * Slide-in animations por side. Distância 12 (= 48px ≈ 8% do panel md 560px) +
 * duration 220ms + easing custom (matching .tbl-form-drawer do sandbox).
 */
function slideAnimation(side: PanelSide): string {
  const anim = {
    right: "data-[state=closed]:slide-out-to-right-12 data-[state=open]:slide-in-from-right-12",
    left: "data-[state=closed]:slide-out-to-left-12 data-[state=open]:slide-in-from-left-12",
    top: "data-[state=closed]:slide-out-to-top-12 data-[state=open]:slide-in-from-top-12",
    bottom: "data-[state=closed]:slide-out-to-bottom-12 data-[state=open]:slide-in-from-bottom-12",
  }[side];
  return cn(
    "ease-[cubic-bezier(0.4,0,0.2,1)]",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:duration-[220ms] data-[state=open]:duration-[220ms]",
    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
    anim
  );
}

/**
 * Panel — drawer "card flutuante" estilo iGreen.
 *
 * Alinhado com `.tbl-form-drawer` do design-and-table-v2:
 *   - Slide-in lateral (default: right) com gutter de 24px do viewport
 *   - Radius 14px + halo outline + shadow-2xl
 *   - Header (title + close X) + Body scrollável + Footer (actions)
 *   - Mobile-adapt: gutter reduzido, full-width responsivo
 *
 * Construído direto sobre SheetPrimitive.Content pra controle total do
 * positioning (evita conflito com inset-y-0/right-0/h-full do SheetContent).
 */
export function Panel({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  side = "right",
  size = "md",
  title,
  description,
  titleIcon,
  hideClose,
  footer,
  children,
  className,
}: PanelProps) {
  const sizeClass = resolveSize(size);

  return (
    <Sheet open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetPrimitive.Portal>
        <SheetOverlay />
        <SheetPrimitive.Content
          className={cn(
            "fixed z-50 bg-bg-surface dark:bg-bg-canvas text-fg-default shadow-sh-2xl",
            sizeClass,
            panelContainer({ side }),
            slideAnimation(side),
            className
          )}
        >
          <PanelHeader
            title={title}
            description={description}
            titleIcon={titleIcon}
            hideClose={hideClose}
          />
          <PanelBody>{children}</PanelBody>
          {footer && <PanelFooter>{footer}</PanelFooter>}
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </Sheet>
  );
}
