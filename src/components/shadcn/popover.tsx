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

/* ── Mobile sheet (<md) ───────────────────────────────────────────────
 * Em telas <md o conteúdo vira sheet bottom-up colado nas bordas: full-width,
 * só cantos superiores arredondados, flush, sem outline/shadow, cap 92vh.
 * O wrapper do Radix Popper é reposicionado no globals.css via a regra
 * `[data-radix-popper-content-wrapper]:has([data-mobile-sheet])` (mesma usada
 * pelo DropdownMenu). Animação: neutraliza o zoom e desliza de baixo. */
const POPOVER_MOBILE_SHEET = [
  "max-md:w-full max-md:min-w-0 max-md:max-w-none",
  "max-md:!max-h-[92vh]",
  "max-md:rounded-b-none max-md:rounded-t-[12px]",
  "max-md:border-x-0 max-md:border-b-0",
  "max-md:outline-none max-md:shadow-none",
  // Respiro de 20px (pad-3xl) no rodapé pra o conteúdo (footer/última seção)
  // não colar na borda inferior do device quando vira sheet.
  "max-md:pb-pad-3xl",
  "max-md:data-[state=open]:zoom-in-100 max-md:data-[state=closed]:zoom-out-100",
  "max-md:data-[state=open]:slide-in-from-bottom-12 max-md:data-[state=closed]:slide-out-to-bottom-12",
].join(" ");

/** Backdrop suave — só mobile (md:hidden). Toque fecha via dismiss do Radix. */
const PopoverSheetBackdrop = () => (
  <div
    aria-hidden="true"
    className="fixed inset-0 z-40 bg-overlay-scrim pointer-events-auto md:hidden animate-in fade-in-0 duration-150"
  />
);

type PopoverContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> & {
  /**
   * Renderiza o conteúdo SEM `<Portal>`. Útil quando o conteúdo interno usa
   * libs como dnd-kit que conflitam com o transform do Floating UI do Portal.
   * Default `false` (usa portal — comportamento padrão).
   */
  disablePortal?: boolean;
  /**
   * Em telas <md, transforma o popover em **sheet bottom-up** colado nas bordas,
   * com backdrop suave (toque fora fecha). No desktop não muda nada. Default `true`.
   * Passe `false` pra manter o popover ancorado no trigger também em mobile.
   * (Mesmo nome da prop do `DropdownMenu` — comportamento consistente.)
   */
  mobileSheet?: boolean;
};

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    { className, align = "center", sideOffset = 6, disablePortal, mobileSheet = true, ...props },
    ref,
  ) => {
    const content = (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        data-mobile-sheet={mobileSheet ? "" : undefined}
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
          mobileSheet && POPOVER_MOBILE_SHEET,
          className,
        )}
        {...props}
      />
    );

    if (disablePortal) {
      // Sem portal: backdrop inline (fixed escapa do flow mesmo assim).
      return mobileSheet ? (
        <>
          <PopoverSheetBackdrop />
          {content}
        </>
      ) : (
        content
      );
    }

    // Com portal: backdrop em Portal próprio (cada Portal Radix aceita 1 filho
    // e é montado/desmontado junto com o popover via Presence).
    return (
      <>
        {mobileSheet && (
          <PopoverPrimitive.Portal>
            <PopoverSheetBackdrop />
          </PopoverPrimitive.Portal>
        )}
        <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>
      </>
    );
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent };
