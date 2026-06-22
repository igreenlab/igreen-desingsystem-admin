"use client";

import { useEffect, useMemo, useState } from "react";
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
import { SingleMenuCommand } from "./command";
import { SingleMenuCategory } from "./category";
import { SingleMenuFooter } from "./footer";
import type {
  SingleMenuModule,
  SingleMenuSidebarProps,
} from "./single-menu-sidebar.types";

/* ══════════════════════════════════════════════════════════════════════════
   SingleMenuSidebar — Container (view only, sem business logic)

   Sidebar de navegação de nível único: categoria → sub-itens em accordion.
   Recebe `categories` + `activeItemId` + callbacks via props. Zero fetch,
   zero store. Alternativa enxuta ao MenuSidebar (sem variantes).

   Comportamentos:
   - Toggle trava/destrava o expandido; recolhida, hover expande temporariamente
   - 1 categoria aberta por vez (accordion); seleção única
   - `modules`: cada módulo tem seu próprio menu — trocar atualiza tudo
   - Busca abre uma paleta (Command) com os itens do menu (⌘K)
   - Mobile (< md): expandida = 100% width; recolhida = some
   ══════════════════════════════════════════════════════════════════════════ */

export function SingleMenuSidebar({
  logo,
  title,
  module,
  modules,
  activeModuleId,
  defaultModuleId,
  onModuleChange,
  showSearch = true,
  searchPlaceholder,
  searchCommand,
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

  // ── Módulos (opcional): cada um com seu próprio menu ──
  const hasModules = !!modules && modules.length > 0;
  const [internalModuleId, setInternalModuleId] = useState(
    defaultModuleId ?? modules?.[0]?.id,
  );
  const currentModuleId = activeModuleId ?? internalModuleId;
  const activeModule = hasModules
    ? (modules!.find((m) => m.id === currentModuleId) ?? modules![0])
    : undefined;

  const handleModuleChange = (id: string) => {
    if (activeModuleId === undefined) setInternalModuleId(id);
    onModuleChange?.(id);
  };

  // Display do seletor + categorias efetivas dependem do modo (modules vs simples)
  const moduleDisplay: SingleMenuModule | undefined = hasModules
    ? {
        icon: activeModule!.icon,
        title: activeModule!.title,
        subtitle: activeModule!.subtitle ?? "",
        options: modules!.map((m) => ({
          id: m.id,
          label: m.title,
          icon: m.icon,
        })),
        onModuleChange: handleModuleChange,
      }
    : module;

  const effectiveCategories = hasModules
    ? activeModule!.categories
    : (categories ?? []);

  // ── Busca (Command palette) ──
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (!showSearch) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showSearch]);

  const selectFromSearch = (id: string, parentId?: string) => {
    onItemClick?.(id);
    setOpenCategoryId(parentId ?? null);
  };

  // Categoria aberta — do accordion ou derivada do activeItemId
  const resolvedOpenCategoryId =
    openCategoryId ??
    effectiveCategories.find((cat) =>
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

          {expanded && (moduleDisplay || showSearch) && (
            <div className={cn(styles.sectionPadding, styles.textFadeIn)}>
              {moduleDisplay && <SingleMenuModuleSelector {...moduleDisplay} />}
              {showSearch && (
                <SingleMenuSearch
                  placeholder={searchPlaceholder}
                  onOpen={() => setCommandOpen(true)}
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
              {effectiveCategories.map((cat) => (
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

      {showSearch && (
        <SingleMenuCommand
          open={commandOpen}
          onOpenChange={setCommandOpen}
          categories={effectiveCategories}
          placeholder={searchPlaceholder}
          onSelect={selectFromSearch}
          custom={searchCommand}
        />
      )}
    </SingleMenuSidebarContext.Provider>
  );
}

SingleMenuSidebar.displayName = "SingleMenuSidebar";
