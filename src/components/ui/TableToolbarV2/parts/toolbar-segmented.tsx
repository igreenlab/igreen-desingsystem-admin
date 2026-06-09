import { cn } from "@/lib/utils";
import {
  toolbarSegmented,
  toolbarSegmentedButton,
} from "../table-toolbar.styles";
import type { ToolbarSegmentedItem } from "../table-toolbar.types";

export type ToolbarSegmentedProps<TValue extends string = string> = {
  /** Valor atualmente selecionado */
  value: TValue;
  onValueChange: (value: TValue) => void;
  items: ToolbarSegmentedItem<TValue>[];
  /** Aria-label do radiogroup */
  ariaLabel?: string;
  /** Quando `true`, ocupa toda a largura disponível e cada item vira flex-1. */
  fluid?: boolean;
  className?: string;
};

/**
 * ToolbarSegmented — grupo de botões segmentado (track bg-muted, item ativo bg-accent).
 * Padrão usado por: density-toggle (3 níveis), view-mode-toggle (table/kanban).
 *
 * `fluid` faz o grupo ocupar 100% do pai e cada item dividir o espaço igualmente
 * (útil em sheet/drawer mobile).
 */
export function ToolbarSegmented<TValue extends string = string>({
  value,
  onValueChange,
  items,
  ariaLabel,
  fluid,
  className,
}: ToolbarSegmentedProps<TValue>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(toolbarSegmented({ fluid }), className)}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-pressed={isActive}
            aria-label={item.label}
            title={item.label}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            className={toolbarSegmentedButton({ isActive, fluid })}
          >
            {item.children}
          </button>
        );
      })}
    </div>
  );
}
