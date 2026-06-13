import type { ReactNode } from "react";
import type { LucideIcon } from "@/lib/lucide-types";

/** Lado de entrada do panel — default: "right" */
export type PanelSide = "left" | "right" | "top" | "bottom";

/** Sizes pré-definidos. `full` ocupa quase 100% do viewport (com gutter de 24px). */
export type PanelSize = "sm" | "md" | "lg" | "xl" | "full";

export type PanelProps = {
  /** Controlled open state */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Trigger element (typed) — use `<PanelTrigger asChild>` pra composição manual */
  trigger?: ReactNode;

  /** Side de entrada. Default: "right" */
  side?: PanelSide;

  /** Tamanho. Default: "md" (560px). Aceita também string CSS arbitrária. */
  size?: PanelSize | string;

  /** Título exibido no header */
  title?: string;
  /** Descrição abaixo do título (opcional, mas recomendado pra acessibilidade) */
  description?: string;
  /** Ícone à esquerda do título (cor brand por default) */
  titleIcon?: LucideIcon;

  /** Esconde o botão X de fechar no header. Default: false */
  hideClose?: boolean;

  /** Footer — geralmente botões de ação (Cancelar / Salvar) */
  footer?: ReactNode;

  /** Conteúdo do body (scrollable) */
  children: ReactNode;

  /** className do <SheetContent> (override de width/position) */
  className?: string;
};
