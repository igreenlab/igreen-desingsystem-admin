import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/ui/Header";
import { MenuSidebar } from "@/components/ui/MenuSidebar";
import { SingleMenuSidebar } from "@/components/ui/SingleMenuSidebar";
import { useMediaQuery } from "@/components/ui/MenuSidebar/use-media-query";
import { UserMenu } from "./user-menu";
import * as s from "./app-shell.styles";
import type { AppShellProps, AppShellInternalProps } from "./app-shell.types";

/**
 * `<AppShell>` — template de aplicação (rail + panel + header + body).
 *
 * Compõe os 3 primitives da família "app skeleton":
 * - `<MenuSidebar>` (rail + panel, full-height, à esquerda)
 * - `<Header>` (top bar com breadcrumb/search/notif/messages/theme)
 * - **Body slot** (children, `gap-gp-4xl p-pad-6xl`, scroll vertical interno)
 *
 * **Padrão controlled/uncontrolled** pra `menuCollapsed`:
 * - `menuCollapsed` prop → controlled (consumer gerencia state)
 * - `defaultMenuCollapsed` → uncontrolled initial value (vence a regra responsiva)
 * - Sem nenhum dos dois → uncontrolled com default **responsivo**: colapsado
 *   abaixo de 1536px, expandido acima (ver o `useState` do `internalCollapsed`)
 *
 * Todas as outras props são **passthrough 1:1** pros sub-componentes.
 * AppShell não impõe styling ao body além de gap/padding fixos — consumer
 * controla 100% do conteúdo (cards, tabelas, qualquer coisa).
 *
 * Pra uso real: declare um `MOCK_CONTEXTS`, `MOCK_COMMANDS`, etc compartilhados
 * num arquivo da app (ex: `src/config/app-shell-mocks.ts`) e passe nas pages.
 */
export function AppShell(props: AppShellProps) {
  // Ver AppShellInternalProps: a união vale na fronteira pública; aqui destruturo tudo.
  const {
  // Sidebar
  contexts,
  defaultActiveContextId,
  activeContextId,
  onContextChange,
  defaultActiveItemHref,
  activeItemHref,
  onItemClick,
  renderLink,
  brandHref,
  onBrandClick,
  // Header
  breadcrumb,
  commandGroups,
  commandPlaceholder,
  commandEmptyMessage,
  searchPlaceholder,
  notifications,
  messages,
  theme,
  onThemeChange,
  themeOptions,
  headerRightSlot,
  // User menu
  user,
  layout,
  onLayoutChange,
  layoutOptions,
  onSettings,
  onLogout,
  // Menu collapse (controlled/uncontrolled)
  menuCollapsed: controlledCollapsed,
  defaultMenuCollapsed,
  onMenuCollapseChange,
  // Body
  children,
  bodyClassName,
  mobileEdgeToEdge,
  fillHeight,
  // Escolha da sidebar. SEM default aqui: um default literal estreitaria o tipo pra
  // "menu" e o TS marcaria a comparação com "single" como morta (TS2367).
  sidebar,
  categories,
  sidebarLogo,
  sidebarTitle,
  activeItemId,
  onSidebarItemClick,
  sidebarModules,
  sidebarShowSearch,
  sidebarSearchPlaceholder,
  className,
  } = props as AppShellInternalProps;
  /**
   * Default do collapse é RESPONSIVO: abaixo de 1536px o menu nasce colapsado.
   *
   * Mesma fronteira do padding do body (`max-2xl`) — uma história de breakpoint só.
   * Notebook 1366/1440/1536 é onde o painel expandido custa caro: some ~200px de
   * largura útil numa tela que já é estreita.
   *
   * Três decisões que valem estar escritas:
   *
   * 1. **Só no mount, não reativo.** Colapsar de novo a cada resize brigaria com o
   *    usuário: depois que ele abre o menu na mão, não dá pra distinguir "estado
   *    inicial" de "ele quis assim". `useMediaQuery` (reativo) é usado logo abaixo
   *    pro `isMobile`, que decide COMPORTAMENTO do toggle — outra coisa.
   * 2. **`defaultMenuCollapsed` explícito vence.** Por isso a prop perdeu o
   *    `= false` na desestruturação: com valor default eu não conseguiria
   *    distinguir "consumer passou false" de "consumer não passou". Só o `undefined`
   *    cai na regra responsiva.
   * 3. **Não precisa excluir mobile.** Abaixo de 768px o `MenuSidebar` força
   *    `collapsed = false` internamente (o menu vira drawer overlay), então o valor
   *    daqui é ignorado — verificado no browser, não deduzido da leitura.
   *
   * Lê síncrono no initializer pra não haver flash de menu expandido no 1º paint.
   */
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (defaultMenuCollapsed !== undefined) return defaultMenuCollapsed;
    if (typeof window === "undefined") return false; // SSR: expandido, sem viewport
    return window.matchMedia("(max-width: 1535px)").matches;
  });
  const menuCollapsed: boolean = controlledCollapsed ?? internalCollapsed;

  // Mobile: o hamburger abre/fecha o drawer overlay (mobileOpen do MenuSidebar),
  // NÃO o collapse de desktop (panelCollapsed). Antes o toggle só mexia no
  // panelCollapsed → no mobile o menu nunca abria.
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenuCollapsed = useCallback(() => {
    const next = !menuCollapsed;
    if (controlledCollapsed === undefined) setInternalCollapsed(next);
    onMenuCollapseChange?.(next);
  }, [menuCollapsed, controlledCollapsed, onMenuCollapseChange]);

  const handleToggleMenu = useCallback(() => {
    if (isMobile) setMobileMenuOpen((o) => !o);
    else toggleMenuCollapsed();
  }, [isMobile, toggleMenuCollapsed]);

  const userNode = user ? (
    <UserMenu
      user={user}
      layout={layout}
      onLayoutChange={onLayoutChange}
      layoutOptions={layoutOptions}
      theme={theme}
      onThemeChange={onThemeChange}
      themeOptions={themeOptions}
      onSettings={onSettings}
      onLogout={onLogout}
    />
  ) : undefined;

  /**
   * A sidebar single modela o estado como `expanded`, não `collapsed` — e no mobile o
   * `expanded` É a visibilidade (< md: expandida ocupa 100% da largura, recolhida some).
   * Então o hamburger do Header mapeia assim:
   *
   *   desktop  expanded = !menuCollapsed
   *   mobile   expanded = mobileMenuOpen   (o mesmo state que abre o drawer do MenuSidebar)
   *
   * Com isso o mesmo `handleToggleMenu` serve pras duas, e quem consome não precisa saber
   * qual das duas está montada pra o botão funcionar.
   */
  const sidebarNode =
    sidebar === "single" ? (
      <SingleMenuSidebar
        logo={sidebarLogo}
        title={sidebarTitle ?? ""}
        categories={categories}
        modules={sidebarModules}
        activeItemId={activeItemId}
        onItemClick={onSidebarItemClick}
        renderLink={renderLink as never}
        /**
         * ⚠️ `?? false` não é redundante: o `SingleMenuSidebar` tem `showSearch = true` como
         * DEFAULT dele (faz sentido em uso standalone, onde não há Header). Dentro do shell
         * há Header com `commandGroups`, então herdar esse default entrega **duas buscas na
         * mesma tela** — pego na verificação visual, não na leitura.
         *
         * Aqui o default se inverte: desligada, e quem quiser uma busca de escopo próprio
         * na sidebar liga com `sidebarShowSearch`.
         */
        showSearch={sidebarShowSearch ?? false}
        searchPlaceholder={sidebarSearchPlaceholder}
        /**
         * `showToggleIndicator` fica FALSE (o default dela) de propósito.
         *
         * Ele desenha um botãozinho flutuante grudado na borda externa da sidebar recolhida
         * (`absolute right-0 translate-x-1/2`, 26×26) — ruído visual num rail que já responde
         * a **hover**: passar o mouse expande, e aí o toggle interno aparece pra travar.
         *
         * ⚠️ Eu havia forçado esta prop, argumentando que sem ela "não haveria como expandir
         * de novo". Errado: ignorei o hover-expand, que é o mecanismo primário de abertura
         * no desktop. No mobile, onde não há hover, quem abre é o botão do Header — que é
         * exatamente por isso que ele NÃO é removido lá (ver `onCollapseMenu`).
         */
        expanded={isMobile ? mobileMenuOpen : !menuCollapsed}
        onExpandedChange={(next) => {
          if (isMobile) {
            setMobileMenuOpen(next);
            return;
          }
          const nextCollapsed = !next;
          if (controlledCollapsed === undefined) setInternalCollapsed(nextCollapsed);
          onMenuCollapseChange?.(nextCollapsed);
        }}
        // O Single exige `user`; o AppShell o tem opcional e com outro shape. As ações do
        // rodapé reaproveitam os callbacks que o shell já recebe pro user menu, pra não
        // haver duas fontes de "Configurações"/"Sair" na mesma tela.
        user={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          actions: [
            ...(onSettings ? [{ id: "settings", label: "Configurações" }] : []),
            ...(onLogout
              ? [{ id: "logout", label: "Sair", variant: "destructive" as const }]
              : []),
          ],
          onAction: (id) => {
            if (id === "settings") onSettings?.();
            if (id === "logout") onLogout?.();
          },
        }}
      />
    ) : (
      <MenuSidebar
        // A união pública EXIGE `contexts` quando a sidebar não é "single" — o shape
        // interno é que relaxa. Um consumidor JS que burle os tipos quebra no
        // MenuSidebar, alto e visível, em vez de renderizar um rail vazio em silêncio.
        contexts={contexts as NonNullable<typeof contexts>}
        activeContextId={activeContextId}
        defaultActiveContextId={defaultActiveContextId}
        onContextChange={onContextChange}
        activeItemHref={activeItemHref}
        defaultActiveItemHref={defaultActiveItemHref}
        onItemClick={onItemClick}
        renderLink={renderLink}
        brandHref={brandHref}
        onBrandClick={onBrandClick}
        user={userNode}
        panelCollapsed={menuCollapsed}
        onPanelCollapseChange={(next) => {
          if (controlledCollapsed === undefined) setInternalCollapsed(next);
          onMenuCollapseChange?.(next);
        }}
        mobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
      />
    );

  return (
    <div className={cn(s.root({ fillHeight: fillHeight ?? false }), className)}>
      {sidebarNode}

      <div className={s.main()}>
        <Header
          breadcrumb={breadcrumb}
          /**
           * A sidebar single tem o próprio botão de recolher, no header dela (é o desenho
           * dela — logo + título + toggle). Manter também o do Header dá DOIS controles
           * pra mesma coisa, lado a lado. O Header esconde o botão quando `onCollapseMenu`
           * é omitido, então basta não passar.
           *
           * ⚠️ **Menos no mobile.** Abaixo de 768px a single fica `hidden` quando recolhida
           * — o toggle dela desaparece junto, e não haveria como abrir o menu. Ali o botão
           * do Header é a única entrada, então ele fica.
           */
          onCollapseMenu={sidebar === "single" && !isMobile ? undefined : handleToggleMenu}
          menuCollapsed={menuCollapsed}
          commandGroups={commandGroups}
          commandPlaceholder={commandPlaceholder}
          commandEmptyMessage={commandEmptyMessage}
          searchPlaceholder={searchPlaceholder}
          notifications={notifications}
          messages={messages}
          theme={theme}
          onThemeChange={onThemeChange}
          themeOptions={themeOptions}
          rightSlot={headerRightSlot}
        />

        <main className={cn(s.body(), bodyClassName)}>
          <div
            className={s.bodyInner({
              layout: layout === "compact" ? "compact" : "fluid",
              mobileEdgeToEdge: mobileEdgeToEdge ?? false,
            })}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

AppShell.displayName = "AppShell";
