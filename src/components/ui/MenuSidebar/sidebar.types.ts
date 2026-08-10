import type { ReactNode, MouseEvent, Ref } from "react";
import type { LucideIcon } from "@/lib/lucide-types";

/* ── Badges ────────────────────────────────────────────────────────────────── */

export type SidebarBadgeKind = "default" | "counter" | "success";

/* ── Items (menu principal) ────────────────────────────────────────────────── */

export type SidebarMenuItem = {
  name: string;
  icon?: LucideIcon;
  /** Quando presente vira `<a>` — quando ausente vira `<button>` (action) */
  href?: string;
  /** `target` do anchor. `"_blank"` desliga o cancelamento de navegação (ver `renderLink`). */
  target?: string;
  badge?: string;
  badgeKind?: SidebarBadgeKind;
  /** Quando presente vira grupo colapsável com submenus (1 nível) */
  subitems?: SidebarMenuItem[];
  /** Estado inicial do grupo (apenas quando tem subitems) */
  defaultOpen?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
};

/* ── Integração com router (renderLink) ────────────────────────────────────── */

/**
 * Props que o sidebar entrega pro seu renderizador de link. São exatamente as de um
 * `<a>` — repasse todas pro componente do seu router.
 */
export type SidebarLinkRenderProps = {
  href: string;
  className: string;
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  title?: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  ref?: Ref<HTMLAnchorElement>;
};

/**
 * Render-prop que substitui o `<a>` interno pelo link do SEU router.
 *
 * ```tsx
 * import { Link } from "react-router-dom";
 * <AppShell renderLink={(p) => <Link {...p} to={p.href} />} />
 * ```
 *
 * ⚠️ **É render-prop, não `linkComponent`, de propósito.** Um prop que recebe *tipo de
 * componente* e é escrito inline (`linkComponent={(p) => <Link .../>}`) cria um tipo
 * NOVO a cada render, e o React desmonta/remonta a subárvore inteira — perde foco,
 * reinicia animação, e o bug parece "aleatório". Render-prop é chamada durante o
 * render, então inline é seguro.
 *
 * Quando presente, o sidebar **não** mexe em `preventDefault`: quem decide é o `<Link>`.
 */
export type SidebarLinkRenderer = (props: SidebarLinkRenderProps) => ReactNode;

/* ── Sections (bookmarks / chats / listas genéricas) ───────────────────────── */

export type SidebarBookmarkItem = {
  name: string;
  /** Cor do dot indicador / caixa de ícone (qualquer cor CSS válida) */
  color: string;
  /**
   * Ícone opcional. Quando presente, renderiza uma caixinha colorida com o
   * ícone (estilo "atalho/app") no lugar do dot. Útil pra atalhos de
   * ferramentas/integrações. Ausente → dot redondo (default).
   */
  icon?: LucideIcon;
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
  /**
   * Clique num item. O 2º argumento é o evento — use pra `preventDefault()` quando
   * você faz o roteamento na mão. Era `(item) => void` até 2026-08-08: sem o evento,
   * o consumidor não tinha como cancelar a navegação do `<a>` nem sabendo do problema.
   * Adicionar parâmetro opcional é retrocompatível.
   */
  onItemClick?: (
    item: SidebarMenuItem,
    event?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;

  /**
   * Substitui o `<a>` interno pelo link do seu router (react-router, Next, TanStack…).
   * **É o caminho recomendado** — ver `SidebarLinkRenderer`.
   */
  renderLink?: SidebarLinkRenderer;

  /**
   * Destino do brand mark no topo do rail. Default `"/"`.
   * Era `href="/"` **fixo no JSX** até 2026-08-08 — recarregava pra raiz em qualquer
   * app, sem forma de configurar. Passe `""` (ou `undefined` + `onBrandClick`) pra
   * torná-lo não-navegável.
   */
  brandHref?: string;
  /** Clique no brand mark. Recebe o evento — útil com `brandHref` vazio. */
  onBrandClick?: (e: MouseEvent<HTMLAnchorElement>) => void;

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
