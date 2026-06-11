import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Lado de ancoragem do panel — default: "right". */
export type FloatingPanelSide = "left" | "right";

/**
 * Sizes pré-definidos (px).
 *   sm = 320 / md = 400 / lg = 560 / xl = 720
 * Pra casos avançados use `number` (px) ou override via `className`.
 */
export type FloatingPanelSize = "sm" | "md" | "lg" | "xl";

export type FloatingPanelProps = {
  /** Controlled open state */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Lado de ancoragem. Default: "right" */
  side?: FloatingPanelSide;

  /** Tamanho default. Se `resizable`, vira a largura inicial. Default: "md" (400px). */
  size?: FloatingPanelSize | number;

  /** Header — título principal */
  title?: string;
  /** Header — descrição abaixo do título */
  description?: string;
  /** Header — ícone à esquerda do título */
  titleIcon?: LucideIcon;
  /**
   * Header — substitui o bloco padrão de title/description por JSX custom
   * (ex: avatar + nome + status dot). headerActions / close / maximize
   * continuam na posição à direita.
   */
  titleSlot?: ReactNode;
  /** Header — slot extra de ações entre titleSlot e close (ex: Edit/Delete) */
  headerActions?: ReactNode;

  /** Esconde o botão X de fechar. Default: false */
  hideClose?: boolean;

  /** Footer — geralmente botões de ação. */
  footer?: ReactNode;

  /** Conteúdo (body scrollable). */
  children: ReactNode;

  /** Ativa o drag-resize horizontal. Desabilitado em mobile (max-md). */
  resizable?: boolean;
  /** Bound mínimo do resize (px). Default: 320 */
  resizableMinWidth?: number;
  /** Bound máximo do resize (px). Default: 800 */
  resizableMaxWidth?: number;
  /** Chave do localStorage pra persistir width entre sessões. */
  resizableStorageKey?: string;

  /** Mostra botão maximize/restore no header. Default: false */
  maximizable?: boolean;
  /** Inicia maximizado. Default: false */
  defaultMaximized?: boolean;

  /** Fecha com ESC. Default: true */
  closeOnEscape?: boolean;

  /**
   * Padding interno padrão do body (gutter 18px lateral + vertical). Default:
   * `true` — conteúdo livre já respira sem o consumer adicionar padding.
   * Use `false` quando o conteúdo são `<FloatingPanelSection>` edge-to-edge
   * (sections gerenciam o próprio padding + divisórias full-width).
   */
  bodyPadded?: boolean;

  /** className extra no `<aside>` */
  className?: string;
};
