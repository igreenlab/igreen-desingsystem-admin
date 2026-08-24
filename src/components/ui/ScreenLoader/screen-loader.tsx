import { forwardRef } from "react";

import { Skeleton } from "@/components/shadcn/skeleton";
import { Spinner } from "@/components/ui/Spinner";

import { screenLoaderStyles } from "./screen-loader.styles";
import type { ScreenLoaderProps } from "./screen-loader.types";

/** Mapeia o size do ScreenLoader para o size do Spinner interno. */
const SPINNER_SIZE = {
  sm: "lg",
  md: "xl",
  lg: "2xl",
} as const;

/**
 * ScreenLoader — estado de carregamento de página/área. Coloque DENTRO do
 * container que está carregando (slot de conteúdo do AppShell, card, section):
 * ele preenche o pai e centraliza o indicador — nunca `position: fixed`.
 *
 * Duas variações:
 *   - `spinner` (default): Spinner centrado + título + descrição — primeira
 *     carga genérica, quando o layout final não é conhecido.
 *   - `skeleton`: silhueta genérica de página, deliberadamente sem prever o
 *     layout final. `skeletonLayout` escolhe os blocos: "page" (header +
 *     conteúdo, default), "dashboard" (header + linha de KPIs + conteúdo) e
 *     "kpis" (linha de KPIs + conteúdo, sem header). Layout conhecido →
 *     componha `Skeleton` na mão em vez desta variante.
 *
 * A11y: o root anuncia via `role="status"`; o Spinner interno vai `aria-hidden`
 * (o título já anuncia — evita leitura duplicada) e a silhueta skeleton é
 * decorativa (o título vira sr-only).
 */
export const ScreenLoader = forwardRef<HTMLDivElement, ScreenLoaderProps>(
  function ScreenLoader(
    {
      variant = "spinner",
      size = "md",
      color = "brand",
      title = "Carregando…",
      description,
      skeletonLayout = "page",
      className,
      ...rest
    },
    ref,
  ) {
    const styles = screenLoaderStyles({ variant, size });

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={styles.root({ className })}
        {...rest}
      >
        {variant === "spinner" ? (
          <>
            <Spinner size={SPINNER_SIZE[size]} color={color} aria-hidden />
            <div className={styles.text()}>
              <h3 className={styles.title()}>{title}</h3>
              {description && (
                <p className={styles.description()}>{description}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="sr-only">{title}</span>
            {skeletonLayout !== "kpis" && (
              <div aria-hidden="true" className={styles.skeletonHeader()}>
                <div className={styles.skeletonHeaderText()}>
                  <Skeleton className="h-[20px] w-1/3 max-w-[240px]" />
                  <Skeleton className="h-[12px] w-1/2 max-w-[360px]" />
                </div>
                <Skeleton className="min-h-form-md w-[120px] shrink-0" />
              </div>
            )}
            {skeletonLayout !== "page" && (
              <div aria-hidden="true" className={styles.skeletonKpis()}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className={styles.skeletonKpiCard()} />
                ))}
              </div>
            )}
            <Skeleton aria-hidden="true" className={styles.skeletonBody()} />
          </>
        )}
      </div>
    );
  },
);
ScreenLoader.displayName = "ScreenLoader";
