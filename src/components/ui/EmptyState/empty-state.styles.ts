import { tv, type VariantProps } from "@/utils/tv";

/**
 * EmptyState — estado vazio genérico reusável (sem dados, busca sem resultado,
 * conversa não selecionada, lista vazia, etc.).
 *
 * Anatomia (só o wrapper; Button/Icon trazem os próprios estilos):
 *   root        = coluna centralizada vertical/horizontal, texto centralizado
 *   icon        = wrapper do ícone (size por `size`, cor fg-subtle); o ícone em si
 *                 (LucideIcon ou ReactNode) herda o size via `[&_svg]:size-full`
 *   title       = título forte (text-title-sm/md, fg-strong)
 *   description = texto auxiliar (body-sm, fg-muted, largura máx 360px)
 *   action      = slot do Button (margin-top de respiro)
 *
 * Sem color variants nem foco próprio: o único interativo é o `action` (Button do
 * DS, que já traz Padrão 1). `disabled` não se aplica a este componente
 * declarativo de display — por isso não há compoundVariant de disabled.
 */
export const emptyStateStyles = tv({
  slots: {
    root: "flex flex-col items-center justify-center gap-gp-md text-center",
    icon: "inline-flex shrink-0 items-center justify-center text-fg-subtle [&_svg]:size-full",
    title: "text-fg-strong",
    description: "text-body-sm text-fg-muted max-w-[360px]",
    action: "mt-gp-xs",
  },
  variants: {
    size: {
      sm: {
        icon: "size-icon-xl",
        title: "text-title-sm",
      },
      md: {
        icon: "size-icon-2xl",
        title: "text-title-sm",
      },
      lg: {
        icon: "size-icon-2xl",
        title: "text-title-md",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type EmptyStateVariantProps = VariantProps<typeof emptyStateStyles>;
