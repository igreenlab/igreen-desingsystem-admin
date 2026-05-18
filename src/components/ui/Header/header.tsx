import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  headerRoot,
  headerLeft,
  headerRight,
  headerDivider,
  headerIconBtn,
} from "./header.styles";
import { HeaderBreadcrumb } from "./header-breadcrumb";
import { HeaderSearch } from "./header-search";
import { HeaderNotifications } from "./header-notifications";
import { HeaderMessages } from "./header-messages";
import { HeaderThemeSwitcher } from "./header-theme-switcher";
import type { HeaderProps } from "./header.types";

/**
 * Header — top bar template (rail-friendly).
 *
 * Layout:
 *   left:  [collapse btn] [divider] [breadcrumb]
 *   right: [rightSlot] [search] [theme] [messages] [notifications]
 *
 * Posicionamento (sticky/fixed) é responsabilidade do template consumer.
 * Componente só define altura/layout/cores (60px, border-bottom).
 *
 * Todos os blocos do `right` são opcionais:
 *   - search desliga via `showSearch={false}`
 *   - notifications/messages/theme escondem o ícone se config não passada
 *   - onCollapseMenu omitido esconde o botão de collapse
 */
export function Header({
  breadcrumb,
  onCollapseMenu,
  menuCollapsed,
  showSearch = true,
  searchPlaceholder = "Buscar...",
  searchShortcut = "⌘K",
  commandGroups,
  commandPlaceholder,
  commandEmptyMessage,
  notifications,
  messages,
  theme,
  onThemeChange,
  themeOptions,
  rightSlot,
  className,
}: HeaderProps) {
  return (
    <header className={cn(headerRoot(), className)}>
      <div className={headerLeft()}>
        {onCollapseMenu && (
          <>
            {/* Desktop: collapse panel (toggle sidebar) */}
            <button
              type="button"
              className={cn(
                headerIconBtn({ variant: "ghost" }),
                "hidden md:inline-flex text-fg-muted hover:text-fg-default",
              )}
              onClick={onCollapseMenu}
              aria-label={menuCollapsed ? "Expandir menu" : "Colapsar menu"}
              title={menuCollapsed ? "Expandir menu" : "Colapsar menu"}
            >
              {menuCollapsed ? (
                <PanelLeftOpen size={20} strokeWidth={1.7} />
              ) : (
                <PanelLeftClose size={20} strokeWidth={1.7} />
              )}
            </button>
            {/* Mobile: hamburger */}
            <button
              type="button"
              className={cn(
                headerIconBtn({ variant: "ghost" }),
                "md:hidden text-fg-muted hover:text-fg-default",
              )}
              onClick={onCollapseMenu}
              aria-label="Abrir menu"
              title="Menu"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            {/* Divider só em desktop */}
            <span
              className={cn(headerDivider(), "hidden md:block")}
              aria-hidden="true"
            />
          </>
        )}

        {/* Breadcrumb mostra todos os items em desktop;
            em mobile só o último (título da seção). */}
        <HeaderBreadcrumb
          items={breadcrumb}
          mobileShowLastOnly
        />
      </div>

      <div className={headerRight()}>
        {rightSlot}

        {showSearch && (
          <HeaderSearch
            placeholder={searchPlaceholder}
            shortcut={searchShortcut}
            commandGroups={commandGroups}
            commandPlaceholder={commandPlaceholder}
            commandEmptyMessage={commandEmptyMessage}
          />
        )}

        {/* Theme switcher: desktop only */}
        {theme !== undefined && onThemeChange && (
          <div className="hidden md:contents">
            <HeaderThemeSwitcher
              theme={theme}
              onThemeChange={onThemeChange}
              options={themeOptions}
            />
          </div>
        )}

        {messages && <HeaderMessages config={messages} />}

        {notifications && <HeaderNotifications config={notifications} />}
      </div>
    </header>
  );
}
