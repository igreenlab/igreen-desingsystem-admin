import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder de carregamento (pulse). Tokenizado iGreen:
 * `bg-bg-muted` + `rounded-radius-md`. Componha vários pra desenhar a
 * silhueta do conteúdo (linha de texto, avatar, card) enquanto carrega.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-radius-md bg-bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
