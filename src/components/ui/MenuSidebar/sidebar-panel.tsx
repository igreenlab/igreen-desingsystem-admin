import type { ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  sidebarPanel,
  sidebarPanelHeader,
  sidebarPanelTitle,
  sidebarPanelBody,
  sidebarPanelGroup,
} from "./sidebar.styles";
import { SidebarItem } from "./sidebar-item";
import { SidebarSubgroup } from "./sidebar-subgroup";
import { SidebarSection } from "./sidebar-section";
import type { SidebarContext, SidebarMenuItem } from "./sidebar.types";

export type SidebarPanelProps = {
  context: SidebarContext;
  collapsed?: boolean;
  /** Quando true: panel renderiza como overlay absoluto (hover-to-expand) */
  floating?: boolean;
  /** Quando true (mobile): panel preenche o drawer full-screen (flex-1). */
  mobile?: boolean;
  activeItemHref?: string;
  onItemClick?: (item: SidebarMenuItem) => void;
  /** Quando passados, o título vira um dropdown switcher de contextos */
  contexts?: SidebarContext[];
  onContextChange?: (id: string) => void;
  /** Fallback: callback ao clicar no título (usado quando contexts não passado) */
  onTitleClick?: () => void;
  /** Conteúdo custom no body (substitui items/sections quando passado) */
  children?: ReactNode;
  className?: string;
};

export function SidebarPanel({
  context,
  collapsed,
  floating,
  mobile,
  activeItemHref,
  onItemClick,
  contexts,
  onContextChange,
  onTitleClick,
  children,
  className,
}: SidebarPanelProps) {
  const hasSwitcher = contexts && contexts.length > 1 && onContextChange;

  return (
    <aside
      className={cn(sidebarPanel({ collapsed, floating, mobile }), className)}
      aria-hidden={collapsed}
    >
      <div className={sidebarPanelHeader()}>
        {hasSwitcher ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={sidebarPanelTitle()}>
                <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
                  {context.label}
                </span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  className="flex-none w-[14px] h-[14px] text-fg-muted"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={6} className="min-w-[220px]">
              {contexts.map((ctx) => {
                const Icon = ctx.icon;
                const isActive = ctx.id === context.id;
                return (
                  <DropdownMenuItem
                    key={ctx.id}
                    onSelect={() => onContextChange?.(ctx.id)}
                  >
                    <Icon className="size-4 text-fg-muted" strokeWidth={1.7} />
                    <span className="flex-1 truncate">{ctx.label}</span>
                    {isActive && <Check className="size-4 text-fg-brand" strokeWidth={2} />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button type="button" className={sidebarPanelTitle()} onClick={onTitleClick}>
            <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {context.label}
            </span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className="flex-none w-[14px] h-[14px] text-fg-muted"
            />
          </button>
        )}
      </div>

      <div className={sidebarPanelBody()}>
        {children ?? (
          <>
            <div className={sidebarPanelGroup()}>
              {context.items.map((item) => {
                if (item.subitems && item.subitems.length > 0) {
                  return (
                    <SidebarSubgroup
                      key={item.name}
                      item={item}
                      activeItemHref={activeItemHref}
                      onItemClick={onItemClick}
                    />
                  );
                }
                return (
                  <SidebarItem
                    key={item.href ?? item.name}
                    item={item}
                    active={item.href !== undefined && item.href === activeItemHref}
                    onClick={() => onItemClick?.(item)}
                  />
                );
              })}
            </div>

            {context.sections?.map((section) => (
              <SidebarSection key={section.id} section={section} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
