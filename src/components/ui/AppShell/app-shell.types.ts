import type { ReactNode, MouseEvent } from "react";
import type { LucideIcon } from "@/lib/lucide-types";
import type {
  HeaderBreadcrumbItem,
  HeaderCommandGroup,
  HeaderMessagesConfig,
  HeaderNotificationsConfig,
  HeaderThemeOption,
} from "@/components/ui/Header";
import type {
  SidebarContext,
  SidebarMenuItem,
  SidebarLinkRenderer,
} from "@/components/ui/MenuSidebar";

/**
 * Identidade do usuário logado — exibida no avatar do rail (com DropdownMenu)
 * e no cabeçalho do user menu.
 */
export type AppShellUser = {
  /** Nome completo (linha 1 do header do user menu). */
  name: string;
  /** Email (linha 2 do header do user menu). */
  email?: string;
  /** URL da imagem do avatar. Fallback usa `initials`. */
  avatarSrc?: string;
  /** Iniciais (fallback do avatar). Default: 2 primeiras letras do `name`. */
  initials?: string;
  /** Cor de fundo do avatar (fallback). Default: token `bg-bg-brand`. */
  avatarColor?: string;
};

/** Opção do switcher de layout (Fluido / Compacto). Mesmo shape do tema. */
export type AppShellLayoutOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

/**
 * Props do `<AppShell>` — template de aplicação que compõe MenuSidebar + Header
 * + slot livre pro body. Pensado pra ser a "casca" reutilizável de todas as
 * telas do CRM iGreen.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │ rail │ panel │  Header (sticky no top do main area)     │
 *  │      │       ├────────────────────────────────────────────┤
 *  │      │       │                                            │
 *  │      │       │  body (children) — gap-gp-4xl p-pad-6xl    │
 *  │      │       │                                            │
 *  └──────┴───────┴────────────────────────────────────────────┘
 *
 * - Sidebar e Header são passthrough 1:1 das props do `<MenuSidebar>` e `<Header>`
 * - `menuCollapsed` é gerenciado internamente (uncontrolled) ou via prop (controlled)
 * - `theme` idem
 * - `children` é o body — gap 16px + padding 32px aplicados no slot
 */
export type AppShellProps = {
  /* ── Sidebar (MenuSidebar passthrough) ─────────────────── */
  /** Contextos do MenuSidebar (rail + panel data-driven). Obrigatório. */
  contexts: SidebarContext[];
  /** Contexto inicialmente ativo (uncontrolled). Default: primeiro do array. */
  defaultActiveContextId?: string;
  /** Contexto ativo (controlled). */
  activeContextId?: string;
  onContextChange?: (id: string) => void;
  /** Item inicialmente ativo (href, uncontrolled). */
  defaultActiveItemHref?: string;
  /** Item ativo (controlled). */
  activeItemHref?: string;
  /**
   * Clique num item do menu. O 2º argumento é o evento — use pra `preventDefault()`
   * quando você roteia na mão. Parâmetro opcional novo em 2026-08-08 (retrocompatível).
   */
  onItemClick?: (
    item: SidebarMenuItem,
    event?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;

  /**
   * ⭐ **Integração com router.** Substitui o `<a>` interno do menu pelo link do seu
   * router — é o que faz a navegação ser client-side em vez de recarregar a página.
   *
   * ```tsx
   * import { Link } from "react-router-dom";
   * <AppShell renderLink={(p) => <Link {...p} to={p.href} />} … />
   * ```
   *
   * Sem isto, o menu cancela a navegação nativa quando você passa `onItemClick` —
   * funciona, mas o `<Link>` do router é o caminho canônico. Ver MenuSidebar/USAGE.md.
   */
  renderLink?: SidebarLinkRenderer;

  /** Destino do brand no topo do rail. Default `"/"`; `""` torna não-navegável. */
  brandHref?: string;
  onBrandClick?: (e: MouseEvent<HTMLAnchorElement>) => void;

  /* ── Header (Header passthrough) ───────────────────────── */
  /** Breadcrumb do header (último item = página atual). Obrigatório. */
  breadcrumb: HeaderBreadcrumbItem[];
  /** Search/Command palette. Quando omitido, search é escondido. */
  commandGroups?: HeaderCommandGroup[];
  commandPlaceholder?: string;
  commandEmptyMessage?: string;
  searchPlaceholder?: string;
  /** Notificações (dropdown direito). */
  notifications?: HeaderNotificationsConfig;
  /** Mensagens (dropdown direito). */
  messages?: HeaderMessagesConfig;
  /** Theme switcher. Quando omitido, switcher é escondido. */
  theme?: string;
  onThemeChange?: (id: string) => void;
  themeOptions?: HeaderThemeOption[];
  /** Slot extra no canto direito do header. */
  headerRightSlot?: ReactNode;

  /* ── User menu (avatar do rail com DropdownMenu) ──────── */
  /**
   * Usuário logado. Quando passado, renderiza Avatar clicável no rail que
   * abre um DropdownMenu com nome/email + layout + tema + settings + logout.
   * Quando omitido, mantém o avatar default ("SV" estático).
   */
  user?: AppShellUser;
  /** Layout atual ("fluid" | "compact" | string custom). */
  layout?: string;
  onLayoutChange?: (id: string) => void;
  layoutOptions?: AppShellLayoutOption[];
  /** Callback "Configurações" no user menu. Item escondido se omitido. */
  onSettings?: () => void;
  /** Callback "Sair" no user menu. Item escondido se omitido. */
  onLogout?: () => void;

  /* ── Estado de collapse do sidebar ─────────────────────── */
  /**
   * Sidebar collapsed (controlled). Quando ausente, AppShell gerencia state
   * interno (uncontrolled) — toggle do header dispara setInternal.
   */
  menuCollapsed?: boolean;
  /**
   * Estado inicial do collapse (uncontrolled). **Omitido, o default é responsivo:**
   * colapsado abaixo de 1536px (mesma fronteira do padding do body), expandido
   * acima — notebook perde ~200px de largura útil com o painel aberto.
   *
   * Passar valor explícito **vence** a regra responsiva, inclusive `false`.
   * Aplicado só no mount: resize não re-colapsa, pra não brigar com quem abriu o
   * menu na mão.
   */
  defaultMenuCollapsed?: boolean;
  onMenuCollapseChange?: (collapsed: boolean) => void;

  /* ── Body ──────────────────────────────────────────────── */
  /** Conteúdo do body — o que muda entre telas. Aplicado dentro de slot com
   *  gap 24px (`gap-gp-4xl`) e padding responsivo em 3 patamares:
   *  **18px** < 768px · **24px** 768–1535px (notebook) · **32px** ≥ 1536px. */
  children: ReactNode;
  /** ClassName extra no body slot (raro — use só pra ajustes pontuais). */
  bodyClassName?: string;
  /**
   * Em mobile (<md), zera o padding interno do body — útil pra telas que
   * controlam o próprio padding (chat com overlays fullscreen, mapas, etc).
   * Default: false (18px mobile · 24px notebook · 32px desktop).
   */
  mobileEdgeToEdge?: boolean;

  /* ── Root ──────────────────────────────────────────────── */
  /** ClassName extra no root da AppShell (afeta toda a tela). */
  className?: string;
};
