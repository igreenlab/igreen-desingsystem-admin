import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/ui/Header";
import { MenuSidebar } from "@/components/ui/MenuSidebar";
import { useMediaQuery } from "@/components/ui/MenuSidebar/use-media-query";
import { UserMenu } from "./user-menu";
import * as s from "./app-shell.styles";
import type { AppShellProps } from "./app-shell.types";

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
 * - `defaultMenuCollapsed` → uncontrolled initial value
 * - Sem nenhum dos dois → uncontrolled, default `false`
 *
 * Todas as outras props são **passthrough 1:1** pros sub-componentes.
 * AppShell não impõe styling ao body além de gap/padding fixos — consumer
 * controla 100% do conteúdo (cards, tabelas, qualquer coisa).
 *
 * Pra uso real: declare um `MOCK_CONTEXTS`, `MOCK_COMMANDS`, etc compartilhados
 * num arquivo da app (ex: `src/config/app-shell-mocks.ts`) e passe nas pages.
 */
export function AppShell({
  // Sidebar
  contexts,
  defaultActiveContextId,
  activeContextId,
  onContextChange,
  defaultActiveItemHref,
  activeItemHref,
  onItemClick,
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
  defaultMenuCollapsed = false,
  onMenuCollapseChange,
  // Body
  children,
  bodyClassName,
  mobileEdgeToEdge,
  className,
}: AppShellProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(defaultMenuCollapsed);
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

  return (
    <div className={cn(s.root(), className)}>
      <MenuSidebar
        contexts={contexts}
        activeContextId={activeContextId}
        defaultActiveContextId={defaultActiveContextId}
        onContextChange={onContextChange}
        activeItemHref={activeItemHref}
        defaultActiveItemHref={defaultActiveItemHref}
        onItemClick={onItemClick}
        user={userNode}
        panelCollapsed={menuCollapsed}
        onPanelCollapseChange={(next) => {
          if (controlledCollapsed === undefined) setInternalCollapsed(next);
          onMenuCollapseChange?.(next);
        }}
        mobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
      />

      <div className={s.main()}>
        <Header
          breadcrumb={breadcrumb}
          onCollapseMenu={handleToggleMenu}
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
