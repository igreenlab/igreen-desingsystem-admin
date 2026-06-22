"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/shadcn/tooltip";
import {
  SingleMenuSidebarContext,
  useSingleMenuSidebarState,
} from "./use-single-menu-sidebar";
import { sidebarRoot, styles } from "./single-menu-sidebar.styles";
import { SingleMenuHeader } from "./header";
import { SingleMenuModuleSelector } from "./module-selector";
import { SingleMenuSearch } from "./search";
import { SingleMenuCategory } from "./category";
import { SingleMenuFooter } from "./footer";
import type { SingleMenuSidebarProps } from "./single-menu-sidebar.types";

/* ══════════════════════════════════════════════════════════════════════════
   SingleMenuSidebar — Container (view only, sem business logic)

   Sidebar de navegação de nível único: categoria → sub-itens em accordion.
   Recebe `categories` + `activeItemId` + callbacks via props. Zero fetch,
   zero store. Alternativa enxuta ao MenuSidebar (sem variantes).

   Comportamentos:
   - Botão de toggle trava/destrava o estado expandido
   - Recolhida, hover sobre a sidebar a expande temporariamente
   - Apenas 1 categoria aberta por vez (accordion)
   ══════════════════════════════════════════════════════════════════════════ */

export function SingleMenuSidebar({
  logo,
  title,
  module,
  showSearch = true,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchRef,
  categories,
  activeItemId,
  onItemClick,
  user,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  showToggleIndicator = false,
  className,
  ...props
}: SingleMenuSidebarProps) {
  const {
    expanded,
    isHoverExpand,
    toggle,
    onMouseEnter,
    onMouseLeave,
    openCategoryId,
    setOpenCategoryId,
  } = useSingleMenuSidebarState(
    defaultExpanded,
    controlledExpanded,
    onExpandedChange,
  );

  // Categoria aberta — do accordion ou derivada do activeItemId
  const resolvedOpenCategoryId =
    openCategoryId ??
    categories.find((cat) =>
      cat.items?.some((item) => item.id === activeItemId),
    )?.id ??
    null;

  const contextValue = useMemo(
    () => ({
      expanded,
      isHoverExpand,
      toggle,
      openCategoryId: resolvedOpenCategoryId,
      setOpenCategoryId,
    }),
    [
      expanded,
      isHoverExpand,
      toggle,
      resolvedOpenCategoryId,
      setOpenCategoryId,
    ],
  );

  return (
    <SingleMenuSidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <aside
          aria-label="Navegação lateral"
          className={cn(sidebarRoot({ expanded }), className)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          {...props}
        >
          <SingleMenuHeader
            logo={logo}
            title={title}
            showToggleIndicator={showToggleIndicator}
          />

          <div className={styles.divider} />

          {expanded && (module || showSearch) && (
            <div className={cn(styles.sectionPadding, styles.textFadeIn)}>
              {module && <SingleMenuModuleSelector {...module} />}
              {showSearch && (
                <SingleMenuSearch
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={onSearchChange}
                  inputRef={searchRef}
                />
              )}
            </div>
          )}

          {expanded && <div className={styles.divider} />}

          <nav
            className={cn(
              styles.navContainer,
              expanded
                ? styles.navContainerExpanded
                : styles.navContainerCollapsed,
            )}
          >
            <div className={styles.navList}>
              {categories.map((cat) => (
                <SingleMenuCategory
                  key={cat.id}
                  {...cat}
                  activeItemId={activeItemId}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          </nav>

          <SingleMenuFooter {...user} />
        </aside>
      </TooltipProvider>
    </SingleMenuSidebarContext.Provider>
  );
}

SingleMenuSidebar.displayName = "SingleMenuSidebar";
