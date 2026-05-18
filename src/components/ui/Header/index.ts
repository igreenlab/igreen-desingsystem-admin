/* All-in-one */
export { Header } from "./header";

/* Composição manual */
export { HeaderBreadcrumb } from "./header-breadcrumb";
export type { HeaderBreadcrumbProps } from "./header-breadcrumb";

export { HeaderSearch } from "./header-search";
export type { HeaderSearchProps } from "./header-search";

export { HeaderNotifications } from "./header-notifications";
export type { HeaderNotificationsProps } from "./header-notifications";

export { HeaderMessages } from "./header-messages";
export type { HeaderMessagesProps } from "./header-messages";

export { HeaderThemeSwitcher } from "./header-theme-switcher";
export type { HeaderThemeSwitcherProps } from "./header-theme-switcher";

/* Tipos do data model */
export type {
  HeaderProps,
  HeaderBreadcrumbItem,
  HeaderCommandItem,
  HeaderCommandGroup,
  HeaderNotification,
  HeaderNotificationFilter,
  HeaderNotificationsConfig,
  HeaderMessage,
  HeaderMessageFilter,
  HeaderMessagesConfig,
  HeaderThemeOption,
} from "./header.types";
