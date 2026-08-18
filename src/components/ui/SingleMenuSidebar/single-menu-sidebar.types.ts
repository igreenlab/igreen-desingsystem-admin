// `MouseEvent` PRECISA vir do react: o global do DOM tem o mesmo nome e **não é
// genérico**, então `MouseEvent<HTMLAnchorElement>` resolve pro global e falha com
// TS2315 ("Type 'MouseEvent' is not generic") — mensagem que não diz que o problema é
// import faltando.
import type { ReactNode, HTMLAttributes, Ref, MouseEvent } from "react";

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

/**
 * Módulo com menu próprio. Quando `modules` é passado à sidebar, trocar de
 * módulo no seletor atualiza o módulo ativo E o conjunto de categorias exibido.
 */
export interface SingleMenuModuleConfig {
  /** Identificador único */
  id: string;
  /** Ícone do módulo */
  icon: ReactNode;
  /** Nome do módulo (vira o título do seletor) */
  title: string;
  /** Subtítulo / descrição */
  subtitle?: string;
  /** Categorias deste módulo (o menu exibido quando ele está ativo) */
  categories: SingleMenuCategory[];
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

/**
 * Props que o sidebar entrega pra quem vai renderizar o link. Mesmo contrato do
 * `SidebarLinkRenderProps` do `MenuSidebar` — a **lógica** de quando cancelar a
 * navegação é compartilhada de fato (`@/utils/nav-link`); só este alias estrutural é
 * declarado nos dois, pra o `single-menu-sidebar` não passar a depender do item de
 * registry do `menu-sidebar` inteiro.
 */
export type SingleMenuLinkRenderProps = {
  href: string;
  target?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  "aria-current"?: "page";
  children?: ReactNode;
};

/**
 * Substitui o `<a>` nativo pelo link do router do consumidor.
 *
 * **Render-prop, não `linkComponent`** — um componente escrito inline remonta a
 * subárvore a cada render do pai (L-068).
 *
 * @example
 * renderLink={({ href, ...rest }) => <Link to={href} {...rest} />}
 */
export type SingleMenuLinkRenderer = (props: SingleMenuLinkRenderProps) => ReactNode;

export interface SingleMenuCategoryProps extends SingleMenuCategory {
  /** Sub-item atualmente selecionado */
  activeItemId?: string;
  /** Callback ao clicar num sub-item */
  onItemClick?: (id: string) => void;
  /** Callback ao clicar no cabeçalho da categoria */
  onCategoryClick?: () => void;
  /** Link do router do consumidor — repassado aos sub-itens e à categoria-folha. */
  renderLink?: SingleMenuLinkRenderer;
}

export interface SingleMenuItemProps {
  label: string;
  selected?: boolean;
  /**
   * Destino. Com `href` o item vira `<a>` (ctrl+clique, nova aba, "copiar link",
   * leitor de tela anunciando "link"); sem, continua `<button>`.
   *
   * Até 2026-08-18 esta prop existia no tipo `SingleMenuSubItem` e no `USAGE.md` — e
   * **nada a lia**: o item era sempre `<button>`. Declarar o destino não fazia nada.
   */
  href?: string;
  /** `_blank` etc. Desliga o cancelamento da navegação nativa. */
  target?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  renderLink?: SingleMenuLinkRenderer;
  /**
   * O consumidor trata a navegação? Decide se o clique cancela o `<a>` nativo.
   *
   * O `SingleMenuCategory` SEMPRE passa um `onClick` (é como o sidebar mantém o item
   * marcado), então inferir por "tem onClick" cancelaria a navegação até de quem não
   * passou handler nenhum — trocando "recarrega" por "não navega". É o mesmo motivo
   * pelo qual o `MenuSidebar` tem esta prop.
   *
   * `undefined` → infere de `onClick`. `boolean` → o container decide.
   */
  interceptNavigation?: boolean;
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
  /** Config do seletor de módulo (com dropdown opcional). Ignorado se `modules`. */
  module?: SingleMenuModule;
  /**
   * Módulos com menu próprio. Quando presente, o seletor lista os módulos e
   * trocar atualiza o módulo ativo + as categorias exibidas (sobrepõe `categories`).
   */
  modules?: SingleMenuModuleConfig[];
  /** Módulo ativo (controlado) */
  activeModuleId?: string;
  /** Módulo ativo inicial (não-controlado). Default: 1º de `modules` */
  defaultModuleId?: string;
  /** Callback ao trocar de módulo */
  onModuleChange?: (id: string) => void;
  /** Exibe o campo de busca */
  showSearch?: boolean;
  /**
   * Conteúdo customizado do CommandDialog da busca (dentro do `<CommandList>`).
   * Default: lista os itens do menu (categorias + sub-itens).
   */
  searchCommand?: ReactNode;
  /** Placeholder do campo de busca / da paleta Command */
  searchPlaceholder?: string;
  /** Array de categorias de navegação. Opcional se `modules` for usado. */
  categories?: SingleMenuCategory[];
  /** Sub-item selecionado (global, entre todas as categorias) */
  activeItemId?: string;
  /** Callback ao clicar em qualquer sub-item */
  onItemClick?: (id: string) => void;

  /**
   * Substitui o `<a>` nativo pelo link do router do consumidor, em TODOS os itens e
   * nas categorias-folha com `href`. Sem isso o sidebar emite `<a href>` puro e
   * cancela a navegação nativa quando há handler — ver `@/utils/nav-link`.
   */
  renderLink?: SingleMenuLinkRenderer;
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
