import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sidebarRoot,
  sidebarMobileBackdrop,
  sidebarMobileCloseBtn,
} from "./sidebar.styles";
import { SidebarRail } from "./sidebar-rail";
import { SidebarPanel } from "./sidebar-panel";
import { useControllable } from "./use-sidebar-state";
import { useMediaQuery } from "./use-media-query";
import type { SidebarProps, SidebarMenuItem } from "./sidebar.types";

/**
 * MenuSidebar — composição completa (rail + panel) data-driven.
 *
 * Modo all-in-one: passa `contexts` e o componente gerencia tudo.
 * Para composição manual, use os subcomponentes:
 *   `<SidebarRail>` + `<SidebarPanel>` + `<SidebarItem>` + `<SidebarSubgroup>` + `<SidebarSection>`.
 *
 * Estados controlled/uncontrolled:
 *   - activeContextId / defaultActiveContextId / onContextChange
 *   - activeItemHref  / defaultActiveItemHref  / onItemClick
 *   - panelCollapsed  / defaultPanelCollapsed  / onPanelCollapseChange
 *
 * Hover-to-expand (desktop):
 *   - `expandOnHover` (default true) + estado colapsado → panel vira overlay flutuante.
 *
 * Mobile responsive:
 *   - Detecta breakpoint (default `max-md` = 767px) via matchMedia.
 *   - Mobile: vira drawer fixed overlay; panel sempre aberto (sem rail-only);
 *     close button (X) no canto + backdrop scrim clicável pra fechar.
 *   - Estado: mobileOpen / defaultMobileOpen / onMobileOpenChange.
 *   - Trigger externo: qualquer botão que altere `mobileOpen` (hamburger no header da app).
 */
export function MenuSidebar({
  contexts,
  brand,
  user,
  showRailAdd,
  onRailAddClick,
  activeContextId,
  defaultActiveContextId,
  onContextChange,
  activeItemHref,
  defaultActiveItemHref,
  onItemClick,
  panelCollapsed,
  defaultPanelCollapsed,
  onPanelCollapseChange,
  expandOnHover = true,
  onPanelTitleClick,
  mobileOpen,
  defaultMobileOpen,
  onMobileOpenChange,
  mobileBreakpoint = "(max-width: 767px)",
  className,
}: SidebarProps) {
  const isMobile = useMediaQuery(mobileBreakpoint);

  const [ctxId, setCtxId] = useControllable<string>(
    activeContextId,
    defaultActiveContextId ?? contexts[0]?.id ?? "",
    onContextChange
  );

  const [itemHref, setItemHref] = useControllable<string>(
    activeItemHref,
    defaultActiveItemHref ?? "",
    () => {}
  );

  const [collapsed] = useControllable<boolean>(
    panelCollapsed,
    defaultPanelCollapsed ?? false,
    onPanelCollapseChange
  );

  const [openMobile, setOpenMobile] = useControllable<boolean>(
    mobileOpen,
    defaultMobileOpen ?? false,
    onMobileOpenChange
  );

  /**
   * Hover-to-expand: 2 states pra preservar overlay durante animação de saída.
   *
   * - `hoverExpanded` = true enquanto o cursor está sobre a sidebar
   * - `hoverExiting`  = true por 200ms após mouseleave (duração da transition
   *                     de width no panel — `transition-[width,opacity,...]
   *                     duration-200`)
   *
   * Bug original: ao mouseleave, hoverExpanded virava false instantâneo. O
   * panel perdia `position: absolute` (vira `relative`) com width ainda em
   * 264px e entrava no fluxo flex — empurrava o main area por 200ms até a
   * width animar de 264→0. Visual de "card empurrado e volta".
   *
   * Fix: durante `hoverExiting`, mantém `floating: true` (position absolute) +
   * passa `collapsed: true` pro panel — width anima 264→0 DENTRO do overlay,
   * sem afetar o fluxo. Depois de 200ms, hoverExiting=false e a sidebar volta
   * ao layout normal (já com width=0).
   */
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [hoverExiting, setHoverExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const shouldFloat =
    !isMobile && !!expandOnHover && collapsed && (hoverExpanded || hoverExiting);

  const activeContext = contexts.find((c) => c.id === ctxId) ?? contexts[0];

  const handleItemClick = (item: SidebarMenuItem) => {
    if (item.href && activeItemHref === undefined) {
      setItemHref(item.href);
    }
    onItemClick?.(item);
    // Mobile: fecha após selecionar (UX padrão de drawer)
    if (isMobile && item.href) setOpenMobile(false);
  };

  return (
    <>
      {/* Backdrop mobile — clicável pra fechar */}
      {isMobile && openMobile && (
        <div
          className={sidebarMobileBackdrop()}
          onClick={() => setOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          sidebarRoot({ mobile: isMobile, mobileOpen: isMobile && openMobile }),
          className
        )}
        onMouseEnter={() => {
          if (!isMobile && expandOnHover && collapsed) {
            // Cancela timer de saída se reentra antes de 200ms (evita flash)
            if (exitTimerRef.current) {
              clearTimeout(exitTimerRef.current);
              exitTimerRef.current = null;
            }
            setHoverExiting(false);
            setHoverExpanded(true);
          }
        }}
        onMouseLeave={() => {
          setHoverExpanded(false);
          // Mantém floating=true durante a animação 200ms da width voltando a 0,
          // pra panel encolher dentro do overlay (não empurrar o main area).
          if (!isMobile && expandOnHover && collapsed) {
            setHoverExiting(true);
            if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
            exitTimerRef.current = setTimeout(() => {
              setHoverExiting(false);
              exitTimerRef.current = null;
            }, 200);
          }
        }}
      >
        <SidebarRail
          contexts={contexts}
          activeContextId={ctxId}
          onContextChange={setCtxId}
          brand={brand}
          user={user}
          showAdd={showRailAdd}
          onAddClick={onRailAddClick}
        />
        {activeContext && (
          <SidebarPanel
            context={activeContext}
            // collapsed lógico:
            // - mobile: nunca colapsado (drawer overlay tem sua própria lógica)
            // - hover entering (hoverExpanded): expanded dentro do overlay
            // - hover exiting (hoverExiting): collapsed (width animando 264→0)
            //   mantendo floating=true pra animar DENTRO do overlay
            // - sem hover, estado base: respeita `collapsed` controlled
            collapsed={
              isMobile ? false : hoverExpanded ? false : collapsed
            }
            floating={shouldFloat}
            mobile={isMobile}
            activeItemHref={itemHref}
            onItemClick={handleItemClick}
            contexts={contexts}
            onContextChange={setCtxId}
            onTitleClick={onPanelTitleClick}
          />
        )}

        {/* Close button — só no mobile aberto */}
        {isMobile && openMobile && (
          <button
            type="button"
            className={sidebarMobileCloseBtn()}
            onClick={() => setOpenMobile(false)}
            aria-label="Fechar menu"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        )}
      </div>
    </>
  );
}
