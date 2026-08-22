import type { ReactNode, MouseEvent } from "react";
import type { LucideIcon } from "@/lib/lucide-types";
import type {
  SingleMenuCategory,
  SingleMenuModuleConfig,
} from "@/components/ui/SingleMenuSidebar";
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
type AppShellBaseProps = {
  /* ── Sidebar (MenuSidebar passthrough) ─────────────────── */
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

  /* ── Qual sidebar ───────────────────────────────────────── */

  /**
   * Qual menu lateral o shell monta.
   *
   *   "menu"   (default) `MenuSidebar` — rail de MÓDULOS + painel. Para apps com áreas
   *                      distintas (Comercial, Financeiro…), cada uma com menu próprio.
   *   "single"           `SingleMenuSidebar` — nível único, sem módulos. Para sistema
   *                      único, com busca opcional.
   *
   * Default preservado em `menu` de propósito: não muda nada de quem já usa.
   *
   * O shell coordena o colapso e o hamburger do Header nos DOIS casos. O mapeamento é
   * diferente porque os componentes modelam o estado de formas diferentes:
   *
   *   MenuSidebar   desktop → panelCollapsed · mobile → drawer (mobileOpen + backdrop)
   *   Single        desktop → expanded (invertido) · mobile → expanded É a visibilidade
   *                 (< md: expandida ocupa 100% da largura; recolhida some)
   */

  /* ── Root ──────────────────────────────────────────────── */

  /**
   * O shell obedece a altura do CONTAINER PAI em vez de ocupar 100vh.
   *
   * Default `false` = comportamento histórico (`h-screen`), preservado.
   *
   * Ligue quando o AppShell estiver embutido em algo com altura definida — um layout
   * com footer próprio, um painel de aba, um preview. Sem isso o shell mede 100vh,
   * transborda o container e o `overflow-hidden` corta o rodapé do body junto com o
   * padding — o sintoma é "conteúdo colado na borda", e não é falta de padding.
   *
   * ⚠️ Exige que o pai tenha altura. `h-full` sem pai medido colapsa pra zero.
   */
  fillHeight?: boolean;

  /** ClassName extra no root da AppShell (afeta toda a tela). */
  className?: string;
};

/**
 * Qual menu lateral o shell monta — e **o que cada escolha exige**.
 *
 *   "menu"   (default) `MenuSidebar` — rail de MÓDULOS + painel. Para apps com áreas
 *                      distintas (Comercial, Financeiro…), cada uma com menu próprio.
 *   "single"           `SingleMenuSidebar` — nível único, sem módulos. Para sistema
 *                      único, com busca opcional.
 *
 * Default preservado em `menu`: quem já usa não muda nada, e continua obrigado a passar
 * `contexts` como antes.
 *
 * ## Por que UNIÃO DISCRIMINADA e não props opcionais
 *
 * A alternativa era deixar `contexts` opcional e documentar "obrigatório quando
 * sidebar='menu'". Isso trocaria um erro de compilação por uma **falha silenciosa**:
 * `contexts` ausente com a sidebar de menu renderiza um rail vazio, sem erro nenhum. Com a
 * união, o TS exige exatamente o conjunto certo pra cada escolha — e o consumidor descobre
 * no editor, não olhando a tela.
 *
 * ## O que o shell coordena nos dois casos
 *
 * O toggle do Header funciona igual pras duas, sem o consumidor cabear nada. O mapeamento
 * interno difere porque os componentes modelam o estado de formas diferentes:
 *
 *   MenuSidebar   desktop → panelCollapsed · mobile → drawer (mobileOpen + backdrop)
 *   Single        desktop → expanded (invertido) · mobile → expanded É a visibilidade
 *                 (< md: expandida ocupa 100% da largura; recolhida some)
 */
type AppShellMenuSidebarProps = {
  sidebar?: "menu";
  /** Contextos do MenuSidebar (rail + panel data-driven). Obrigatório nesta variante. */
  contexts: SidebarContext[];
};

type AppShellSingleSidebarProps = {
  sidebar: "single";
  /** Categorias do menu de nível único. */
  categories: SingleMenuCategory[];
  /**
   * Logo no header da sidebar. **Omita pra ficar com a marca iGreen** (default da
   * `SingleMenuSidebar`). Era obrigatória até 2026-08-22, e por isso trocar pra sidebar
   * única forçava quem montava a inventar uma logo — a da iGreen sumia na troca.
   */
  sidebarLogo?: ReactNode;
  /**
   * **Nome do projeto**, exibido à direita da logo. Segue obrigatório de propósito: é a
   * única coisa aqui que o DS não tem como adivinhar, e o TS cobrando força a pergunta.
   */
  sidebarTitle: string;
  /** Item ativo (a variante `menu` usa `activeItemHref`). */
  activeItemId?: string;
  /**
   * Clique em item. Prop SEPARADA do `onItemClick` de propósito: os dois modelos de dados
   * são diferentes — o MenuSidebar entrega o ITEM (`SidebarMenuItem`), a single entrega o
   * `id`. Reaproveitar o mesmo nome faria o consumidor receber um tipo e escrever pro outro.
   */
  onSidebarItemClick?: (id: string) => void;
  /** Módulos com menu próprio — o seletor troca o conjunto de categorias. */
  sidebarModules?: SingleMenuModuleConfig[];
  /** Mostra a busca no topo da sidebar. */
  sidebarShowSearch?: boolean;
  /**
   * Placeholder da busca DA SIDEBAR — separado do `searchPlaceholder`, que é do Header.
   * Nomes distintos de propósito: são dois campos de busca diferentes na mesma tela.
   */
  sidebarSearchPlaceholder?: string;
};

export type AppShellProps = AppShellBaseProps &
  (AppShellMenuSidebarProps | AppShellSingleSidebarProps);

/**
 * Uso **interno** do `app-shell.tsx`, não da API pública.
 *
 * Destruturar uma união não dá acesso a membro que existe em só um dos ramos (TS2339), e
 * fazer `if (props.sidebar === "single")` antes de cada acesso espalharia narrowing por
 * todo o componente. Então a fronteira pública é a união — é ela que guia o consumidor no
 * editor — e a implementação lê deste shape relaxado, onde tudo é opcional.
 *
 * A correção de verdade fica no render: o ramo `sidebar === "single"` só usa as props da
 * single, e o outro só as de menu. O `as` abaixo não esconde nada que a união já não
 * garanta na entrada.
 */
export type AppShellInternalProps = AppShellBaseProps &
  Partial<AppShellMenuSidebarProps> &
  Partial<AppShellSingleSidebarProps>;
