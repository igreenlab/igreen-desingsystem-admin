import { tv, type VariantProps } from "@/utils/tv";

/**
 * MarkdownText — renderiza markdown estilo WhatsApp (*bold*, _italic_,
 * ~strike~, `mono`/```mono```, URLs autolinkadas) já SANITIZADO (parse manual
 * para React nodes, sem `dangerouslySetInnerHTML`).
 *
 * Anatomia visual (só os wrappers; o conteúdo é texto puro):
 *   root  = container do texto (text-body-sm). Em `inline=false` é `<p>` com
 *           `whitespace-pre-wrap` (preserva quebras de linha do WhatsApp);
 *           em `inline=true` é `<span>` com `whitespace-normal` (colapsa
 *           quebras → prévia de última mensagem truncável via line-clamp do
 *           consumer).
 *   strong/em/strike = marcas inline; só peso/estilo/decoração tokenizáveis.
 *   code  = trecho monoespaçado com fundo sutil (bg-bg-muted) e radius pequeno.
 *   link  = URL clicável em cor de marca + underline; abre em nova aba com
 *           rel=noopener noreferrer (segurança).
 *
 * Sem variantes de cor/foco (não é interativo além dos links, que herdam o
 * foco padrão do `<a>`). `inline` é a única variante e controla a quebra de
 * linha do root.
 */
export const markdownTextStyles = tv({
  slots: {
    root: "text-body-sm text-fg-default break-words",
    strong: "font-semibold",
    em: "italic",
    strike: "line-through",
    code: "font-mono bg-bg-muted rounded-radius-xs px-pad-md text-fg-default",
    link: "text-fg-brand underline underline-offset-2 break-all hover:opacity-80",
  },
  variants: {
    inline: {
      true: { root: "whitespace-normal" },
      false: { root: "whitespace-pre-wrap" },
    },
  },
  defaultVariants: {
    inline: false,
  },
});

export type MarkdownTextVariantProps = VariantProps<typeof markdownTextStyles>;
