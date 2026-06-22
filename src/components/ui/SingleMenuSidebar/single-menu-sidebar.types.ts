import type { ReactNode, HTMLAttributes, Ref } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   SingleMenuSidebar — interfaces e tipos

   Sidebar de navegação de nível único (categoria → sub-itens em accordion).
   Componente apresentacional: recebe os dados via props, renderiza a UI.
   Sem variantes de aparência — é uma alternativa enxuta ao MenuSidebar.
   ══════════════════════════════════════════════════════════════════════════ */

/** Sub-item dentro de uma categoria (ex.: "Contratos Instalação"). */
export interface SingleMenuSubItem {
  /** Identificador único */
  id: string;
  /** Rótulo exibido */
  label: string;
  /** Href opcional de navegação */
  href?: string;
}

/**
 * Categoria de navegação (ex.: "Instalações", "Faturamento").
 * Link simples (sem `items`) ou grupo accordion (com `items`).
 */
export interface SingleMenuCategory {
  /** Identificador único */
  id: string;
  /** Ícone da categoria (qualquer ReactNode/ícone) */
  icon: ReactNode;
  /** Rótulo exibido */
  label: string;
  /** Href opcional (categorias sem sub-itens) */
  href?: string;
  /** Sub-itens exibidos quando a categoria está aberta */
  items?: SingleMenuSubItem[];
  /** Marca a categoria como visualmente ativa (link sem sub-itens) */
  active?: boolean;
}

/** Opção do dropdown do seletor de módulo. */
export interface SingleMenuModuleOption {
  /** Identificador único */
  id: string;
  /** Rótulo exibido */
  label: string;
  /** Ícone do módulo */
  icon: ReactNode;
}

/**
 * Configuração do seletor de módulo.
 * Com `options`, o clique abre um dropdown para trocar de módulo.
 * Sem `options`, é apenas display (sem dropdown).
 */
export interface SingleMenuModule {
  /** Ícone do módulo selecionado */
  icon: ReactNode;
  /** Nome do módulo selecionado */
  title: string;
  /** Subtítulo / descrição */
  subtitle: string;
  /** Módulos disponíveis para troca (renderiza dropdown quando presente) */
  options?: SingleMenuModuleOption[];
  /** Callback ao selecionar um módulo no dropdown */
  onModuleChange?: (id: string) => void;
}

/** Ação no dropdown do usuário (ex.: "Perfil", "Sair"). */
export interface SingleMenuUserAction {
  /** Identificador único */
  id: string;
  /** Rótulo exibido */
  label: string;
  /** Ícone opcional */
  icon?: ReactNode;
  /** Variante visual — `destructive` renderiza em danger (ex.: Sair) */
  variant?: "default" | "destructive";
}

/** Informações do usuário no rodapé. */
export interface SingleMenuUser {
  /** Nome exibido */
  name: string;
  /** E-mail */
  email: string;
  /** Avatar customizado (default: ícone genérico de usuário) */
  avatar?: ReactNode;
  /** Ações do dropdown (renderiza dropdown quando presente) */
  actions?: SingleMenuUserAction[];
  /** Callback ao clicar numa ação */
  onAction?: (id: string) => void;
}

/* ── Props das sub-partes (internas) ── */

export interface SingleMenuSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}

export interface SingleMenuHeaderProps {
  logo: ReactNode;
  title: string;
  showToggleIndicator?: boolean;
}

export interface SingleMenuCategoryProps extends SingleMenuCategory {
  /** Sub-item atualmente selecionado */
  activeItemId?: string;
  /** Callback ao clicar num sub-item */
  onItemClick?: (id: string) => void;
  /** Callback ao clicar no cabeçalho da categoria */
  onCategoryClick?: () => void;
}

export interface SingleMenuItemProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export interface SingleMenuFooterProps extends SingleMenuUser {}

export interface SingleMenuModuleSelectorProps extends SingleMenuModule {}

/**
 * SingleMenuSidebar — props do container.
 *
 * @example
 * <SingleMenuSidebar
 *   logo={<IgreenLogo />}
 *   title="Sólis iGreen"
 *   categories={categories}
 *   user={{ name: "Sérgio", email: "sergio@igreen.com", actions: userActions }}
 *   module={{ icon, title: "Créditos", subtitle: "Módulo", options: modules }}
 *   activeItemId="central"
 *   onItemClick={(id) => setActiveItem(id)}
 * />
 */
export interface SingleMenuSidebarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** Ícone/logo do header */
  logo: ReactNode;
  /** Título do app exibido quando expandido */
  title: string;
  /** Config do seletor de módulo (com dropdown opcional) */
  module?: SingleMenuModule;
  /** Exibe o campo de busca */
  showSearch?: boolean;
  /** Placeholder do campo de busca */
  searchPlaceholder?: string;
  /** Valor controlado da busca */
  searchValue?: string;
  /** Callback de mudança da busca */
  onSearchChange?: (value: string) => void;
  /** Ref encaminhada ao `<input>` da busca */
  searchRef?: Ref<HTMLInputElement>;
  /** Array de categorias de navegação */
  categories: SingleMenuCategory[];
  /** Sub-item selecionado (global, entre todas as categorias) */
  activeItemId?: string;
  /** Callback ao clicar em qualquer sub-item */
  onItemClick?: (id: string) => void;
  /** Informações do usuário no rodapé (com dropdown opcional) */
  user: SingleMenuUser;
  /** Estado expandido inicial */
  defaultExpanded?: boolean;
  /** Estado expandido controlado */
  expanded?: boolean;
  /** Callback na mudança de expandido */
  onExpandedChange?: (expanded: boolean) => void;
  /** Exibe o indicador flutuante de toggle quando recolhido (default: false) */
  showToggleIndicator?: boolean;
}
