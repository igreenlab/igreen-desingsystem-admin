"use client";

import { PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSingleMenuSidebar } from "./use-single-menu-sidebar";
import { styles } from "./single-menu-sidebar.styles";
import type { SingleMenuHeaderProps } from "./single-menu-sidebar.types";

export function SingleMenuHeader({
  logo,
  title,
  showToggleIndicator = false,
}: SingleMenuHeaderProps) {
  const { expanded, isHoverExpand, toggle } = useSingleMenuSidebar();

  // Ícone invertido = sidebar foi recolhida manualmente (toggle).
  // Permanece invertido mesmo quando o hover expande temporariamente.
  const isFlipped = isHoverExpand || !expanded;

  return (
    <div
      className={cn(
        styles.header.wrapper,
        !expanded && styles.header.wrapperCollapsed,
      )}
    >
      <div className={styles.header.inner}>
        <div className={styles.header.logo}>{logo}</div>
        {expanded && (
          <span className={cn(styles.header.title, styles.textFadeIn)}>
            {title}
          </span>
        )}
      </div>

      {expanded ? (
        <button
          type="button"
          onClick={toggle}
          className={styles.header.collapseBtn}
          aria-label={isFlipped ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <PanelLeftClose
            className={cn(
              "size-icon-sm transition-transform duration-300",
              isFlipped && "rotate-180",
            )}
          />
        </button>
      ) : showToggleIndicator ? (
        <button
          type="button"
          onClick={toggle}
          className={styles.header.expandBtn}
          aria-label="Expandir sidebar"
        >
          <PanelLeftClose
            className={cn(
              styles.header.expandBtnIcon,
              "transition-transform duration-300 rotate-180",
            )}
          />
        </button>
      ) : null}
    </div>
  );
}

SingleMenuHeader.displayName = "SingleMenuHeader";
