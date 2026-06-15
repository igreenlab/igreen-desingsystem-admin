import type { ReactNode, MouseEvent } from "react";
import type { LucideIcon } from "@/lib/lucide-types";

/* ── Breadcrumb ────────────────────────────────────────────────────────────── */

export type HeaderBreadcrumbItem = {
  label: string;
  /** Quando presente, vira link clicável. Último item da array nunca é link (página atual). */
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
};

/* ── Command palette (search) ─────────────────────────────────────────────── */

export type HeaderCommandItem = {
  /** Identificador único pra busca/filtro */
  id?: string;
  label: string;
  icon?: LucideIcon;
  /** Atalho exibido à direita do item (ex: "⌘N") */
  shortcut?: string;
  /** Keywords adicionais pra filtro fuzzy (não exibidas) */
  keywords?: string[];
  /** Variante destrutiva (texto/ícone vermelho) */
  destructive?: boolean;
  onSelect: () => void;
};

export type HeaderCommandGroup = {
  heading: string;
  items: HeaderCommandItem[];
};

/* ── Notifications ────────────────────────────────────────────────────────── */

export type HeaderNotification = {
  id: string;
  icon: LucideIcon;
  /** Cor do ícone (qualquer cor CSS válida) */
  color: string;
  title: string;
  body: string;
  /** Time string formatado (ex: "2 min", "1h", "ontem") */
  time: string;
  unread?: boolean;
  /** Tipo da notificação — usado pelos filtros (default: "mention", "alert", etc) */
  kind?: string;
  onClick?: () => void;
};

export type HeaderNotificationFilter = {
  id: string;
  label: string;
  /** Predicate pra filtrar notifications. Default filters usam "kind" pra match. */
  predicate?: (n: HeaderNotification) => boolean;
};

export type HeaderNotificationsConfig = {
  items: HeaderNotification[];
  /** Filtros customizados. Default: Todas / Não lidas / Menções (kind === "mention"). */
  filters?: HeaderNotificationFilter[];
  /** Texto exibido quando lista vazia */
  emptyMessage?: string;
  onMarkAllRead?: () => void;
  onMoreActions?: () => void;
  /** Link "Ver todas" no footer */
  onViewAll?: () => void;
  /** Label do link footer. Default: "Ver todas as notificações" */
  viewAllLabel?: string;
};

/* ── Messages ─────────────────────────────────────────────────────────────── */

export type HeaderMessage = {
  id: string;
  name: string;
  initials: string;
  /** Cor de fundo do avatar fallback */
  color: string;
  /** Preview da última mensagem */
  preview: string;
  time: string;
  unread?: boolean;
  /** Marca chat de grupo (usado pelos filtros) */
  group?: boolean;
  /** URL da imagem (sobrescreve initials) */
  avatarUrl?: string;
  onClick?: () => void;
};

export type HeaderMessageFilter = {
  id: string;
  label: string;
  predicate?: (m: HeaderMessage) => boolean;
};

export type HeaderMessagesConfig = {
  items: HeaderMessage[];
  /** Filtros customizados. Default: Tudo / Não lidas / Grupos. */
  filters?: HeaderMessageFilter[];
  /** Habilita campo de busca interna no dropdown. Default: true. */
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onNewMessage?: () => void;
  onExpand?: () => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
};

/* ── Theme switcher ───────────────────────────────────────────────────────── */

export type HeaderThemeOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

/* ── Header (props principais) ────────────────────────────────────────────── */

export type HeaderProps = {
  /** Título/breadcrumb da página */
  breadcrumb: HeaderBreadcrumbItem[];

  /** Collapse menu (integração com MenuSidebar) */
  onCollapseMenu?: () => void;
  /** Controla o ícone (PanelLeftClose vs PanelLeftOpen) */
  menuCollapsed?: boolean;

  /** Mostra fake-input de busca que abre o Command palette. Default: true. */
  showSearch?: boolean;
  searchPlaceholder?: string;
  /** Atalho exibido no fake-input. Default: "⌘K". */
  searchShortcut?: string;
  /** Grupos de comandos no Command palette. Sem isso, o palette abre vazio (ou consumer renderiza children custom). */
  commandGroups?: HeaderCommandGroup[];
  /** Placeholder do input do Command. Default: "Digite um comando ou busque...". */
  commandPlaceholder?: string;
  /** Texto quando nenhum comando casa. Default: "Nenhum resultado encontrado." */
  commandEmptyMessage?: string;

  /** Notifications dropdown — omitir esconde o ícone */
  notifications?: HeaderNotificationsConfig;

  /** Messages dropdown — omitir esconde o ícone */
  messages?: HeaderMessagesConfig;

  /** Theme switcher — omitir esconde o ícone */
  theme?: string;
  onThemeChange?: (id: string) => void;
  themeOptions?: HeaderThemeOption[];

  /** Slot livre à direita (custom buttons antes dos ícones default) */
  rightSlot?: ReactNode;

  className?: string;
};
