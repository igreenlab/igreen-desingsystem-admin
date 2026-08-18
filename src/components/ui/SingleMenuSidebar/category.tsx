"use client";

import type { MouseEvent } from "react";
import { ChevronDown } from "lucide-react";
import { shouldPreventNavigation } from "@/utils/nav-link";
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
  href,
  renderLink,
}: SingleMenuCategoryProps) {
  const { expanded, openCategoryId, setOpenCategoryId } =
    useSingleMenuSidebar();
  const hasItems = !!items && items.length > 0;

  // Accordion: esta categoria abre só se for a selecionada
  const isOpen = hasItems ? openCategoryId === id : false;

  // Marcação com fonte única — sempre 1 item marcado:
  // • Pai aberto É o marcado (abrir = marcar; suprime a folha enquanto aberto).
  // • Folha marcada quando é a ativa E nenhum pai está aberto.
  // No rail (recolhido) não há expansão → o pai marca quando CONTÉM o ativo.
  const isLeafActive =
    !hasItems && (activeItemId !== undefined ? activeItemId === id : !!active);
  const containsActive =
    hasItems && items!.some((item) => item.id === activeItemId);

  const selected = !expanded
    ? hasItems
      ? isOpen || containsActive
      : isLeafActive
    : hasItems
      ? isOpen
      : isLeafActive && openCategoryId == null;

  const state = selected ? "selected" : "default";

  const s = category({ state, collapsed: !expanded });

  const handleToggle = () => {
    if (hasItems) {
      // Pai: alterna o accordion — abrir vira o marcado (suprime a folha)
      setOpenCategoryId(isOpen ? null : id);
      onCategoryClick?.();
    } else {
      // Folha: vira a seleção e fecha qualquer pai aberto (assume a marca)
      onItemClick?.(id);
      setOpenCategoryId(null);
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

  // Sem sub-itens: é link simples (o que o USAGE.md sempre prometeu) quando tem `href`,
  // e botão quando não tem. Até 2026-08-18 era SEMPRE botão, e o `href` da categoria era
  // prop morta igual à do sub-item.
  if (!hasItems) {
    const conteudo = (
      <>
        <span className={s.icon()}>{icon}</span>
        <span className={cn(s.text(), styles.textFadeIn)}>{label}</span>
      </>
    );

    if (href) {
      const linkProps = {
        href,
        className: s.root(),
        onClick: (e: MouseEvent<HTMLAnchorElement>) => {
          // `hasHandler: true` porque o `handleToggle` abaixo SEMPRE trata o clique
          // (é como a categoria assume a marcação). As 5 exceções seguem valendo:
          // clique modificado, target, href externo e href de hash não são cancelados.
          if (!renderLink) {
            const prevent = shouldPreventNavigation({ href, hasHandler: true, event: e });
            if (prevent) e.preventDefault();
          }
          handleToggle();
        },
        "aria-current": selected ? ("page" as const) : undefined,
        children: conteudo,
      };
      if (renderLink) return <>{renderLink(linkProps)}</>;
      return <a {...linkProps} />;
    }

    return (
      <button type="button" onClick={handleToggle} className={s.root()}>
        {conteudo}
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
              href={item.href}
              renderLink={renderLink}
              // O container SEMPRE passa onClick (mantém a marcação), então inferir
              // por "tem handler" cancelaria a navegação de quem não passou nada.
              interceptNavigation={!!onItemClick}
              onClick={() => onItemClick?.(item.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

SingleMenuCategory.displayName = "SingleMenuCategory";
