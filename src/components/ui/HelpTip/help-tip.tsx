"use client";

import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { helpTipStyles } from "./help-tip.styles";
import type { HelpTipProps } from "./help-tip.types";

/**
 * HelpTip — o "?" que explica um rótulo.
 *
 * Botão de ícone discreto que revela um tooltip com o texto de ajuda. Nasceu
 * dentro do `Kpi` (prop `helperText`) e saiu de lá para poder acompanhar
 * qualquer rótulo: título de seção, label de formulário, cabeçalho de coluna.
 *
 * ## Por que é um `<button>`, e não um ícone com `title`
 *
 * O `title` nativo não abre por teclado, não abre no toque e some depois de uns
 * segundos. Um botão real entra na ordem de tabulação, abre no foco e tem nome
 * acessível próprio (`"Ajuda sobre {about}"`). Ele não tem `onClick`: o clique
 * existe só para abrir a dica no toque — por isso a peça se chama HelpTip e não
 * HelpButton, e por isso não aceita handler.
 *
 * @example
 * <h2 className="flex items-center gap-gp-xs">
 *   Margem de contribuição
 *   <HelpTip about="Margem de contribuição">
 *     Receita menos custos variáveis, antes dos custos fixos.
 *   </HelpTip>
 * </h2>
 */
export function HelpTip({
  about,
  children,
  side = "top",
  contentClassName,
  className,
}: HelpTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(helpTipStyles(), className)}
        aria-label={`Ajuda sobre ${about}`}
      >
        <HelpCircle aria-hidden />
      </TooltipTrigger>
      <TooltipContent side={side} className={contentClassName}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

HelpTip.displayName = "HelpTip";
