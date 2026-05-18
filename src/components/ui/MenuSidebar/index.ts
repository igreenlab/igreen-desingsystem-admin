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

/* Tipos do data model */
export type {
  SidebarProps,
  SidebarContext,
  SidebarMenuItem,
  SidebarSection as SidebarSectionData,
  SidebarBookmarkItem,
  SidebarChatItem,
  SidebarBadgeKind,
} from "./sidebar.types";
