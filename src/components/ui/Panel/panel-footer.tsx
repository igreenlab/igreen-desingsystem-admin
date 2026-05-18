import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { panelFooter } from "./panel.styles";

export type PanelFooterProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Footer do panel — geralmente botões de ação alinhados à direita
 * (Cancelar / Salvar). Padding e border-top já aplicados.
 */
export function PanelFooter({ children, className }: PanelFooterProps) {
  return <footer className={cn(panelFooter(), className)}>{children}</footer>;
}
