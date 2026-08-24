import { tv, type VariantProps } from "@/utils/tv";

/**
 * ScreenLoader — estado de carregamento de página/área. Preenche o PAI (que
 * precisa ter altura), nunca o viewport — irmão do EmptyState (mesma família
 * de "estado de área": um pro vazio, um pro carregando).
 *
 * Anatomia (só o wrapper; Spinner/Skeleton trazem os próprios estilos):
 *   root        = preenche o container (h-full w-full flex-1); a variante
 *                 decide o arranjo (centrado vs coluna de silhueta)
 *   title       = título forte (text-title-sm/md, fg-strong) — só `spinner`
 *   description = texto auxiliar (body-sm, fg-muted) — só `spinner`
 *   skeleton*   = silhueta genérica de página (header + bloco de conteúdo),
 *                 deliberadamente SEM prever o layout final — quando o layout
 *                 é conhecido, componha `Skeleton` na mão
 *
 * Sem color variants nem foco próprio: componente declarativo de display, sem
 * nada interativo — por isso não há ring nem compoundVariant de disabled.
 */
export const screenLoaderStyles = tv({
  slots: {
    root: "flex h-full min-h-0 w-full flex-1 flex-col",
    // título + descrição colados (gp-2xs = 2px); o respiro maior (gp-md do
    // root) fica entre o Spinner e o bloco de texto
    text: "flex flex-col items-center gap-gp-2xs",
    title: "text-fg-strong",
    description: "text-body-sm text-fg-muted max-w-[360px]",
    skeletonHeader: "flex w-full items-start justify-between gap-gp-2xl",
    skeletonHeaderText: "flex w-full flex-col gap-gp-md",
    skeletonBody: "min-h-[240px] w-full flex-1",
  },
  variants: {
    variant: {
      spinner: {
        root: "items-center justify-center gap-gp-md text-center",
      },
      skeleton: {
        root: "gap-gp-2xl",
      },
    },
    size: {
      sm: { title: "text-title-sm" },
      md: { title: "text-title-sm" },
      lg: { title: "text-title-md" },
    },
  },
  defaultVariants: {
    variant: "spinner",
    size: "md",
  },
});

export type ScreenLoaderVariantProps = VariantProps<typeof screenLoaderStyles>;
