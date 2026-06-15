import type { ReactNode, MouseEvent } from "react";
import type { LucideIcon } from "@/lib/lucide-types";

/* ── Badges ────────────────────────────────────────────────────────────────── */

export type SidebarBadgeKind = "default" | "counter" | "success";

/* ── Items (menu principal) ────────────────────────────────────────────────── */

export type SidebarMenuItem = {
  name: string;
  icon?: LucideIcon;
  /** Quando presente vira `<a>` — quando ausente vira `<button>` (action) */
  href?: string;
  badge?: string;
  badgeKind?: SidebarBadgeKind;
  /** Quando presente vira grupo colapsável com submenus (1 nível) */
  subitems?: SidebarMenuItem[];
  /** Estado inicial do grupo (apenas quando tem subitems) */
  defaultOpen?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
};

/* ── Sections (bookmarks / chats / listas genéricas) ───────────────────────── */

export type SidebarBookmarkItem = {
  name: string;
  /** Cor do dot indicador (qualquer cor CSS válida) */
  color: string;
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export type SidebarChatItem = {
  name: string;
  initials: string;
  /** Cor de fundo do avatar (qualquer cor CSS válida) */
  color: string;
  status?: "online" | "offline";
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export type SidebarSection =
  | {
      id: string;
      label: string;
      variant: "bookmark";
      items: SidebarBookmarkItem[];
      defaultOpen?: boolean;
      onAdd?: () => void;
    }
  | {
      id: string;
      label: string;
      variant: "chat";
      items: SidebarChatItem[];
      defaultOpen?: boolean;
      onAdd?: () => void;
    };

/* ── Context (categoria do rail) ───────────────────────────────────────────── */

export type SidebarContext = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: SidebarMenuItem[];
  sections?: SidebarSection[];
};

/* ── Props do componente principal ─────────────────────────────────────────── */

export type SidebarProps = {
  /** Array de contextos (categorias do rail) */
  contexts: SidebarContext[];

  /** Brand mark no topo do rail. Default = logo iGreen */
  brand?: ReactNode;
  /** Avatar de usuário no fim do rail. Default = "SV" com cor fixa */
  user?: ReactNode;
  /** Mostra botão "+" no fim do rail (entre contextos e user) */
  showRailAdd?: boolean;
  onRailAddClick?: () => void;

  /** Active context — controlled */
  activeContextId?: string;
  /** Active context — uncontrolled initial */
  defaultActiveContextId?: string;
  onContextChange?: (id: string) => void;

  /** Active item — controlled (matching by href) */
  activeItemHref?: string;
  /** Active item — uncontrolled initial */
  defaultActiveItemHref?: string;
  onItemClick?: (item: SidebarMenuItem) => void;

  /** Panel colapsado (rail-only) — controlled */
  panelCollapsed?: boolean;
  /** Panel colapsado — uncontrolled initial */
  defaultPanelCollapsed?: boolean;
  onPanelCollapseChange?: (collapsed: boolean) => void;

  /**
   * Comportamento de hover-to-expand quando panel está colapsado.
   * Default: true. Ao passar mouse sobre o sidebar, o panel abre como overlay
   * absoluto (não empurra o conteúdo). Sai o mouse, recolhe.
   * Passe `false` pra desabilitar.
   */
  expandOnHover?: boolean;

  /**
   * Mobile drawer — open/close (controlled).
   * No mobile, o sidebar vira drawer fixed overlay sobre o conteúdo.
   */
  mobileOpen?: boolean;
  /** Mobile drawer — estado inicial (uncontrolled). Default: false (hidden). */
  defaultMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;

  /**
   * Media query que ativa o modo mobile (drawer).
   * Default: `(max-width: 767px)` (= breakpoint `md` do Tailwind).
   */
  mobileBreakpoint?: string;

  /** Callback ao clicar no título do panel (ex: abrir context switcher) */
  onPanelTitleClick?: () => void;

  className?: string;
};
