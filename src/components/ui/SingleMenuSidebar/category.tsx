"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/shadcn/collapsible";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/shadcn/tooltip";
import { useSingleMenuSidebar } from "./use-single-menu-sidebar";
import { category, styles } from "./single-menu-sidebar.styles";
import { SingleMenuItem } from "./menu-item";
import type { SingleMenuCategoryProps } from "./single-menu-sidebar.types";

export function SingleMenuCategory({
  id,
  icon,
  label,
  active = false,
  items,
  activeItemId,
  onItemClick,
  onCategoryClick,
}: SingleMenuCategoryProps) {
  const { expanded, openCategoryId, setOpenCategoryId } =
    useSingleMenuSidebar();
  const hasItems = !!items && items.length > 0;

  // Accordion: esta categoria abre só se for a selecionada
  const isOpen = hasItems ? openCategoryId === id : false;
  const isActive = hasItems ? isOpen : active;

  const s = category({ active: isActive, collapsed: !expanded });

  const handleToggle = () => {
    if (hasItems) {
      // Accordion: alterna esta, fecha as outras
      setOpenCategoryId(isOpen ? null : id);
    }
    onCategoryClick?.();
  };

  // Sidebar recolhida: só ícone com tooltip, centralizado
  if (!expanded) {
    return (
      <Tooltip>
        <TooltipTrigger
          role="button"
          tabIndex={0}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
          className={s.root()}
        >
          <span className={s.icon()}>{icon}</span>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Sem sub-itens: botão simples (sem chevron — nada a expandir)
  if (!hasItems) {
    return (
      <button type="button" onClick={handleToggle} className={s.root()}>
        <span className={s.icon()}>{icon}</span>
        <span className={cn(s.text(), styles.textFadeIn)}>{label}</span>
      </button>
    );
  }

  // Com sub-itens: collapsible controlado pelo accordion
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => {
        setOpenCategoryId(open ? id : null);
        onCategoryClick?.();
      }}
    >
      <CollapsibleTrigger className={s.root()}>
        <span className={s.icon()}>{icon}</span>
        <span className={cn(s.text(), styles.textFadeIn)}>{label}</span>
        <ChevronDown className={cn(s.chevron(), isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={styles.subItemList}>
          {items!.map((item) => (
            <SingleMenuItem
              key={item.id}
              label={item.label}
              selected={item.id === activeItemId}
              onClick={() => onItemClick?.(item.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

SingleMenuCategory.displayName = "SingleMenuCategory";
