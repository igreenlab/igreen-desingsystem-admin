import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sidebarRail,
  sidebarRailBrand,
  sidebarRailList,
  sidebarRailItem,
  sidebarRailActiveBar,
  sidebarRailTooltip,
  sidebarRailAdd,
  sidebarRailUser,
  sidebarRailUserDefault,
} from "./sidebar.styles";
import { SidebarBrandIcon } from "./sidebar-brand";
import type { SidebarContext } from "./sidebar.types";

export type SidebarRailProps = {
  contexts: SidebarContext[];
  activeContextId: string;
  onContextChange: (id: string) => void;
  brand?: ReactNode;
  user?: ReactNode;
  showAdd?: boolean;
  onAddClick?: () => void;
  className?: string;
};

export function SidebarRail({
  contexts,
  activeContextId,
  onContextChange,
  brand,
  user,
  showAdd = false,
  onAddClick,
  className,
}: SidebarRailProps) {
  return (
    <aside className={cn(sidebarRail(), className)}>
      <a href="/" className={sidebarRailBrand()} aria-label="Home">
        {brand ?? <SidebarBrandIcon />}
      </a>

      <div className={sidebarRailList()}>
        {contexts.map((ctx) => {
          const Icon = ctx.icon;
          const isActive = activeContextId === ctx.id;
          return (
            <button
              key={ctx.id}
              type="button"
              className={sidebarRailItem({ active: isActive })}
              onClick={() => onContextChange(ctx.id)}
              aria-label={ctx.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} />
              {isActive && <span className={sidebarRailActiveBar()} aria-hidden="true" />}
              <span className={sidebarRailTooltip()}>{ctx.label}</span>
            </button>
          );
        })}

        {showAdd && (
          <button
            type="button"
            className={sidebarRailAdd()}
            onClick={onAddClick}
            aria-label="Adicionar contexto"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {user !== null && (
        <div className={sidebarRailUser()}>
          {user ?? <div className={sidebarRailUserDefault()}>SV</div>}
        </div>
      )}
    </aside>
  );
}
