import type { ReactNode } from "react";

import type { LucideIcon } from "@/lib/lucide-types";
import type { ButtonProps } from "@/components/ui/Button";

import type { EmptyStateVariantProps } from "./empty-state.styles";

/** Tamanho do estado vazio (ícone + tipografia do título). */
export type EmptyStateSize = NonNullable<EmptyStateVariantProps["size"]>;

/**
 * Ação declarativa do EmptyState — vira um `<Button>` do DS. `color`/`variant`
 * são opcionais e repassados ao Button (default primary/filled).
 */
export interface EmptyStateAction {
  /** Texto do botão. */
  label: string;
  /** Handler do clique. */
  onClick: () => void;
  /** Cor do Button (repassada). Default: brand/primary. */
  color?: ButtonProps["color"];
  /** Variante do Button (repassada). Default: filled. */
  variant?: ButtonProps["variant"];
}

export interface EmptyStateProps {
  /**
   * Ícone do estado vazio. Aceita um componente lucide (`LucideIcon`, ex:
   * `Inbox`) ou qualquer `ReactNode` (Icon do DS, ilustração, etc.). Quando
   * componente, é renderizado com o tamanho do `size` aplicado; quando node,
   * herda o tamanho do wrapper via `[&_svg]:size-full`.
   */
  icon?: LucideIcon | ReactNode;
  /** Título principal (obrigatório). */
  title: string;
  /** Texto auxiliar opcional sob o título. */
  description?: string;
  /**
   * Ação opcional. Aceita o objeto `{ label, onClick }` (vira um `<Button>` do
   * DS) ou um `ReactNode` custom (ex: dois botões, link, etc.).
   */
  action?: EmptyStateAction | ReactNode;
  /** Tamanho. `sm` · `md` (default) · `lg`. */
  size?: EmptyStateSize;
  /** className do container (root). */
  className?: string;
}
