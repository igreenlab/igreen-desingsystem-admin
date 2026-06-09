import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toolbarTabButton,
  toolbarTabClose,
  toolbarTabs,
  toolbarTabWrap,
} from "../table-toolbar.styles";
import type { ToolbarTab } from "../table-toolbar.types";

export type ToolbarTabsProps = {
  tabs: ToolbarTab[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Callback do X em tabs custom. Se omitido, X não dispara nada (só visual). */
  onClose?: (id: string) => void;
  ariaLabel?: string;
  /** Quando `true`, ocupa toda a largura disponível e cada tab vira flex-1. */
  fluid?: boolean;
  className?: string;
};

/**
 * ToolbarTabs — grupo de view tabs salvas (Todos / Meus / Ativos / Royals…).
 * Tabs com `custom: true` exibem botão X (escondido no rest, visível no hover do wrap).
 *
 * `fluid` faz cada tab dividir o espaço igualmente (útil em sheet/drawer mobile).
 */
export function ToolbarTabs({
  tabs,
  activeId,
  onSelect,
  onClose,
  ariaLabel = "Views salvas",
  fluid,
  className,
}: ToolbarTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(toolbarTabs({ fluid }), className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={cn("group/wrap", toolbarTabWrap({ isActive, fluid }))}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(tab.id)}
              className={toolbarTabButton({ isActive, fluid })}
            >
              <span>{tab.name}</span>
            </button>
            {tab.custom && (
              <button
                type="button"
                aria-label="Fechar view"
                className={toolbarTabClose()}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.(tab.id);
                }}
              >
                <X strokeWidth={2.4} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
