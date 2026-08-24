import type { ComponentPropsWithoutRef } from "react";

import type { SpinnerProps } from "@/components/ui/Spinner";

import type { ScreenLoaderVariantProps } from "./screen-loader.styles";

/** Variação visual: spinner centrado com texto, ou silhueta skeleton genérica. */
export type ScreenLoaderVariant = NonNullable<ScreenLoaderVariantProps["variant"]>;

/** Tamanho (spinner + tipografia do título). Sem efeito na variante skeleton. */
export type ScreenLoaderSize = NonNullable<ScreenLoaderVariantProps["size"]>;

export interface ScreenLoaderProps
  extends Omit<ComponentPropsWithoutRef<"div">, "color" | "title">,
    ScreenLoaderVariantProps {
  /**
   * Título do estado de carregamento. Visível na variante `spinner`; na
   * `skeleton` vira texto sr-only (leitores de tela anunciam, a tela mostra
   * só a silhueta). Default `"Carregando…"`.
   */
  title?: string;
  /** Texto auxiliar opcional sob o título (só na variante `spinner`). */
  description?: string;
  /** Cor do Spinner (repassada). Default `"brand"`. Só na variante `spinner`. */
  color?: SpinnerProps["color"];
  /**
   * Blocos da silhueta (só na variante `skeleton`): `"page"` (header +
   * conteúdo, default), `"dashboard"` (header + linha de 4 KPIs + conteúdo)
   * ou `"kpis"` (linha de 4 KPIs + conteúdo, sem header).
   */
  skeletonLayout?: "page" | "dashboard" | "kpis";
}
