import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * Tooltip — dica flutuante curta (Radix Tooltip) remapeada para tokens DS.
 *
 * Visual: bolha neutra de ênfase (`bg-bg-emphasis` — theme-aware, mais visível
 * que `muted` e diferente das superfícies brancas de Popover/Dropdown), texto
 * `caption-sm`, `rounded-radius-md`, `shadow-sh-md`. A seta reaproveita o mesmo
 * fundo via `fill-bg-emphasis`.
 *
 * O DS **não tem** superfície escura invertida (`surface-inverted`), então a
 * tooltip é uma bolha neutra clara (light) / clara-sobre-escuro (dark) — em vez
 * do bubble preto clássico. É a escolha token-nativa: nenhum token novo.
 *
 * `<Tooltip>` já embrulha um `<TooltipProvider>` internamente, então uma tooltip
 * avulsa funciona sem provider no topo da app. Provider aninhado é seguro no
 * Radix (o mais interno vence) — se quiser um `delayDuration` global, monte um
 * `<TooltipProvider>` você mesmo em volta de vários `<Tooltip>`.
 */

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipTrigger = TooltipPrimitive.Trigger;

type TooltipProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;

/**
 * Sem espera, por default.
 *
 * ⚠️ Até 2026-08-24 este componente **não passava `delayDuration`**, então valia o default do
 * Radix — `DEFAULT_DELAY_DURATION = 700` (conferido no pacote instalado, não de memória).
 * Três arquivos de doc afirmavam "delayDuration default = 200ms", incluindo o
 * `shadcn-gotchas.md` que é distribuído: a afirmação nunca foi verdade pro Tooltip. O que
 * tinha 200 de fato era o `HoverCard`, que passa `openDelay={200}` explícito.
 *
 * 700ms numa dica curta é tempo de a pessoa desistir e ir clicar pra descobrir. `0` deixa a
 * dica instantânea, que é o comportamento esperado de tooltip de ícone.
 *
 * O `delayDuration` vai no Provider **e** no Root porque cada um governa uma coisa: o Provider
 * define o padrão do grupo (e o `skipDelayDuration` entre triggers vizinhos), o Root vence pra
 * esta tooltip. Continua sobrescritível — `<Tooltip delayDuration={400}>`.
 *
 * A animação de entrada não regride: com delay 0 o Radix emite `data-state="instant-open"` em
 * vez de `delayed-open`, e as classes já cobrem os dois estados (ver `TooltipContent`).
 */
const Tooltip = ({ children, delayDuration = 0, ...props }: TooltipProps) => (
  <TooltipProvider delayDuration={delayDuration}>
    <TooltipPrimitive.Root delayDuration={delayDuration} {...props}>
      {children}
    </TooltipPrimitive.Root>
  </TooltipProvider>
);
Tooltip.displayName = "Tooltip";

type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  /** Renderiza a seta apontando pro trigger. Default `true`. */
  showArrow?: boolean;
};

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, showArrow = true, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-w-[16rem] select-none",
        "bg-bg-emphasis text-fg-default",
        "rounded-radius-md px-pad-lg py-pad-xs",
        "text-caption-sm",
        "shadow-sh-md",
        "origin-[--radix-tooltip-content-transform-origin]",
        "data-[state=delayed-open]:animate-in data-[state=instant-open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <TooltipPrimitive.Arrow
          width={11}
          height={5}
          className="fill-bg-emphasis"
        />
      )}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
