import { forwardRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  sidebarItem,
  sidebarItemIcon,
  sidebarItemText,
  sidebarPill,
} from "./sidebar.styles";
import type { SidebarMenuItem, SidebarBadgeKind } from "./sidebar.types";

export type SidebarItemProps = {
  item: SidebarMenuItem;
  active?: boolean;
  subitem?: boolean;
  /** Quando true, o ícone usa cor de brand (usado em groups com filho ativo) */
  iconBrand?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  className?: string;
};

export const SidebarItem = forwardRef<HTMLAnchorElement | HTMLButtonElement, SidebarItemProps>(
  ({ item, active, subitem, iconBrand, onClick, className }, ref) => {
    const Icon = item.icon;
    const classes = cn(sidebarItem({ active, subitem }), className);

    const content: ReactNode = (
      <>
        {Icon && (
          <Icon
            size={subitem ? 15 : 17}
            strokeWidth={1.7}
            className={sidebarItemIcon({ active, parentActive: iconBrand })}
          />
        )}
        <span className={sidebarItemText()}>{item.name}</span>
        {item.badge && (
          <SidebarPill kind={item.badgeKind} active={active}>
            {item.badge}
          </SidebarPill>
        )}
      </>
    );

    const handleClick = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (item.onClick) item.onClick(e);
      onClick?.(e);
    };

    if (item.href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={item.href}
          className={classes}
          onClick={handleClick}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </button>
    );
  }
);
SidebarItem.displayName = "SidebarItem";

/* ── Pill (badge) ─────────────────────────────────────────────────────────── */
export function SidebarPill({
  kind,
  active,
  children,
  className,
}: {
  kind?: SidebarBadgeKind;
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(sidebarPill({ kind, active }), className)}>
      {children}
    </span>
  );
}
