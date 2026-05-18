import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { panelBody } from "./panel.styles";

export type PanelBodyProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Container do body do panel — scroll interno, gap padrão entre seções.
 */
export function PanelBody({ children, className }: PanelBodyProps) {
  return <div className={cn(panelBody(), className)}>{children}</div>;
}
