import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sidebarItem,
  sidebarItemIcon,
  sidebarItemText,
  sidebarSubgroupRoot,
  sidebarSubgroupChev,
  sidebarSubgroupList,
} from "./sidebar.styles";
import { SidebarItem } from "./sidebar-item";
import type { SidebarMenuItem } from "./sidebar.types";

export type SidebarSubgroupProps = {
  item: SidebarMenuItem;
  activeItemHref?: string;
  onItemClick?: (item: SidebarMenuItem) => void;
  /** Estado controlado de collapse — se omitido, gerencia internamente */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function SidebarSubgroup({
  item,
  activeItemHref,
  onItemClick,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: SidebarSubgroupProps) {
  const hasActiveChild = item.subitems?.some(
    (s) => s.href !== undefined && s.href === activeItemHref
  );

  const [internalOpen, setInternalOpen] = useState<boolean>(
    defaultOpen ?? item.defaultOpen ?? hasActiveChild ?? false
  );
  const isOpen = open ?? internalOpen;
  const collapsed = !isOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const Icon = item.icon;

  return (
    <div className={cn(sidebarSubgroupRoot(), className)}>
      <button
        type="button"
        className={cn(sidebarItem(), "select-none")}
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`subgroup-${item.name}`}
      >
        {Icon && (
          <Icon
            size={17}
            strokeWidth={1.7}
            className={sidebarItemIcon({ parentActive: hasActiveChild })}
          />
        )}
        <span className={sidebarItemText()}>{item.name}</span>
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={sidebarSubgroupChev({ collapsed })}
        />
      </button>

      <div id={`subgroup-${item.name}`} className={sidebarSubgroupList({ collapsed })}>
        {item.subitems?.map((sub) => (
          <SidebarItem
            key={sub.href ?? sub.name}
            item={sub}
            subitem
            active={sub.href !== undefined && sub.href === activeItemHref}
            onClick={() => onItemClick?.(sub)}
          />
        ))}
      </div>
    </div>
  );
}
