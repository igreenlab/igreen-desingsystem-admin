import type { ReactNode } from "react";

export interface HelpTipProps {
  /**
   * O que está sendo explicado — compõe o nome acessível do botão,
   * `"Ajuda sobre {about}"`.
   *
   * É o rótulo que o botão acompanha ("SLA", "Taxa de conversão", "CPF"), não
   * uma frase. Obrigatório: um ícone sozinho não tem nome acessível, e o leitor
   * de tela anunciaria só "botão".
   *
   * Não há prop para sobrescrever o nome inteiro, de propósito — o DS fica dono
   * da fórmula para que a mesma coisa seja anunciada do mesmo jeito em toda
   * tela. Se algum dia um caso real não couber em "Ajuda sobre X", a prop entra
   * então, sem quebrar ninguém.
   */
  about: string;
  /**
   * Texto da dica. Aceita nó (um `<strong>`, uma lista curta) — mas é tooltip:
   * conteúdo que precisa de foco ou de link não cabe aqui, use `Popover`.
   */
  children: ReactNode;
  /** Lado em que a dica abre. Default `"top"`. */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * className do CONTEÚDO da dica — na prática, a largura.
   *
   * O `TooltipContent` do DS tem teto próprio (256px), e texto de ajuda longo
   * num tooltip estreito vira uma coluna alta e difícil de ler. Passe
   * `max-w-tooltip-lg` (320px) ou `max-w-page-xs` para soltar.
   */
  contentClassName?: string;
  /** className do botão. */
  className?: string;
}
