import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

/**
 * Popover — primitives baixo nível pra menus flutuantes (Cols, Sort, Filter, Views).
 *
 * Visual unificado com DropdownMenu/Select: bg-bg-dropdown (frosted-glass no
 * dark via `before:backdrop-blur-2xl`), border-default, radius 12px, shadow-lg
 * + outline-float (halo). Padronizado pra evitar inconsistência visual entre
 * menus de ação (DropdownMenu) e menus de configuração (Popover de Filtros,
 * Sort, Cols, Views).
 *
 * Não tem `Item` próprio — o consumer monta o conteúdo do popover livremente.
 * Pra menus de ação com items semânticos, prefira `DropdownMenu`.
 */

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

type PopoverContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> & {
  /**
   * Renderiza o conteúdo SEM `<Portal>`. Útil quando o conteúdo interno usa
   * libs como dnd-kit que conflitam com o transform do Floating UI do Portal.
   * Default `false` (usa portal — comportamento padrão).
   */
  disablePortal?: boolean;
};

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    { className, align = "center", sideOffset = 6, disablePortal, ...props },
    ref,
  ) => {
    const content = (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50",
          // Unificado com DropdownMenu/Select: bg-bg-dropdown (frosted no dark)
          // + border-border-default + outline-float. O `before` pseudo-element
          // aplica o blur backdrop (necessário pra bg-bg-dropdown semi-transparente
          // render correto no dark mode).
          "bg-bg-dropdown",
          "border border-border-default rounded-[12px] shadow-sh-lg outline-float",
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150",
          "text-fg-default",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    );

    if (disablePortal) return content;

    return <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>;
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent };
