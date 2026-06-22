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

  // Fonte única de "marcado" = activeItemId.
  // Folha (sem items): ativa quando activeItemId === id (fallback: prop `active`
  // p/ uso não-controlado). Pai (com items): nunca é "página" — só fica verde
  // (group) quando CONTÉM o item ativo. Abrir um pai sem selecionar não marca.
  const isLeafActive =
    !hasItems && (activeItemId !== undefined ? activeItemId === id : !!active);
  const containsActive =
    hasItems && items!.some((item) => item.id === activeItemId);

  // Rail (recolhido): card também no pai que contém o ativo (não dá pra expandir).
  // Expandido: folha ativa = card; pai com ativo dentro = verde sem card.
  const state = !expanded
    ? isLeafActive || containsActive
      ? "selected"
      : "default"
    : isLeafActive
      ? "selected"
      : containsActive
        ? "group"
        : "default";

  const s = category({ state, collapsed: !expanded });

  const handleToggle = () => {
    if (hasItems) {
      // Pai: só alterna o accordion (NÃO vira a seleção)
      setOpenCategoryId(isOpen ? null : id);
      onCategoryClick?.();
    } else {
      // Folha: É um item navegável → vira a seleção (desmarca os outros)
      onItemClick?.(id);
      onCategoryClick?.();
    }
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
