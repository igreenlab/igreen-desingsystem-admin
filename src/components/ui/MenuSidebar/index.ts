/* All-in-one */
export { MenuSidebar } from "./menu-sidebar";

/* Composição manual */
export { SidebarRail } from "./sidebar-rail";
export type { SidebarRailProps } from "./sidebar-rail";

export { SidebarPanel } from "./sidebar-panel";
export type { SidebarPanelProps } from "./sidebar-panel";

export { SidebarItem, SidebarPill } from "./sidebar-item";
export type { SidebarItemProps } from "./sidebar-item";

export { SidebarSubgroup } from "./sidebar-subgroup";
export type { SidebarSubgroupProps } from "./sidebar-subgroup";

export { SidebarSection } from "./sidebar-section";
export type { SidebarSectionProps } from "./sidebar-section";

export { SidebarBrandIcon } from "./sidebar-brand";

/* Hooks utilitários */
export { useControllable } from "./use-sidebar-state";
export { useMediaQuery } from "./use-media-query";

/* Integração com router — a regra de quando cancelar a navegação nativa.
 * Exportado porque quem compõe o sidebar na mão (SidebarItem avulso) precisa da
 * MESMA decisão; reimplementar na unha é como o bug nasce de novo. */
export {
  shouldPreventNavigation,
  isExternalHref,
  isHashHref,
  isModifiedClick,
} from "./nav-link";
export type { PreventNavigationInput } from "./nav-link";

/* Tipos do data model */
export type {
  SidebarProps,
  SidebarContext,
  SidebarMenuItem,
  SidebarSection as SidebarSectionData,
  SidebarBookmarkItem,
  SidebarChatItem,
  SidebarBadgeKind,
  SidebarLinkRenderer,
  SidebarLinkRenderProps,
} from "./sidebar.types";
