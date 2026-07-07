import { useState, type ComponentType, type ReactNode } from "react";
import { ChevronLeft, GripVertical, Pin, PinOff } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Checkbox } from "@/components/shadcn/checkbox";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */
export type ColsPopoverColumn = {
  key: string;
  label: ReactNode;
  /** Ícone do tipo (lucide component) */
  icon?: ComponentType<{ className?: string }>;
};

/* ── Panel (miolo reutilizável) ──────────────────────────────────────
 * Extraído do PopoverContent pra reuso no `ColsPopover` (standalone) e no
 * `ToolbarSettingsMenu` (drill-down). Mantém o drag state interno (UI state).
 * `onBack` opcional → chevron de voltar no header. */
export type ColsPanelProps = {
  columns: ColsPopoverColumn[];
  visibleCols: Set<string>;
  onVisibleChange: (next: Set<string>) => void;
  pinnedCols: Set<string>;
  onPinnedChange: (next: Set<string>) => void;
  /**
   * Callback de reordenação. Quando passado, ativa o grip drag handle
   * e as linhas se tornam arrastáveis (HTML5 drag).
   */
  onColumnsReorder?: (next: ColsPopoverColumn[]) => void;
  title?: ReactNode;
  hideShowAll?: boolean;
  hideOnlyPinned?: boolean;
  showAllLabel?: ReactNode;
  onlyPinnedLabel?: ReactNode;
  /** Quando passado, renderiza o botão "voltar" no header (drill-down). */
  onBack?: () => void;
};

export function ColsPanel({
  columns,
  visibleCols,
  onVisibleChange,
  pinnedCols,
  onPinnedChange,
  onColumnsReorder,
  title = "Colunas visíveis",
  hideShowAll,
  hideOnlyPinned,
  showAllLabel = "Mostrar todas",
  onlyPinnedLabel = "Só fixadas",
  onBack,
}: ColsPanelProps) {
  const reorderable = Boolean(onColumnsReorder);

  /* ── Drag state ──────────────────────────────────────────────── */
  // `grippedIndex` = row que recebeu mousedown no grip → permite drag dessa row
  const [grippedIndex, setGrippedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const toggleVisible = (key: string) => {
    const next = new Set(visibleCols);
    next.has(key) ? next.delete(key) : next.add(key);
    onVisibleChange(next);
  };
  const togglePin = (key: string) => {
    const next = new Set(pinnedCols);
    next.has(key) ? next.delete(key) : next.add(key);
    onPinnedChange(next);
  };

  const showAll = () => onVisibleChange(new Set(columns.map((c) => c.key)));
  const onlyPinned = () => onVisibleChange(new Set([...pinnedCols]));

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (grippedIndex !== index) {
      e.preventDefault();
      return;
    }
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropIndex !== index) setDropIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    if (dragIndex === null) return;
    e.preventDefault();
    if (dragIndex !== index) {
      const next = [...columns];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      onColumnsReorder?.(next);
    }
    setDragIndex(null);
    setDropIndex(null);
    setGrippedIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
    setGrippedIndex(null);
  };

  return (
    <>
      {/* Header — opcional botão voltar (drill-down) */}
      <div className="flex-none flex items-center gap-gp-md px-pad-xl py-pad-2xl border-b border-border-default">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="grid place-items-center size-[20px] -ml-[2px] shrink-0 rounded-radius-sm bg-transparent text-fg-muted cursor-pointer outline-none hover:bg-bg-muted hover:text-fg-default focus-visible:bg-bg-muted [&_svg]:size-[16px]"
          >
            <ChevronLeft strokeWidth={2.2} />
          </button>
        )}
        <h3 className="text-caption-sm font-semibold text-fg-muted uppercase tracking-wide leading-none m-0">
          {title}
        </h3>
      </div>

      {/* List */}
      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto p-[6px] flex flex-col gap-[2px]",
          "[scrollbar-width:thin] [scrollbar-color:var(--color-border-default)_transparent]",
          "[&::-webkit-scrollbar]:w-[6px]",
          "[&::-webkit-scrollbar-thumb]:bg-border-default [&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-track]:bg-transparent",
        )}
      >
        {columns.map((col, index) => {
          const Icon = col.icon;
          const checked = visibleCols.has(col.key);
          const isPinned = pinnedCols.has(col.key);
          const isDragging = dragIndex === index;
          const isDropTarget =
            dragIndex !== null && dropIndex === index && dragIndex !== index;
          const dropAbove = isDropTarget && dragIndex! > index;
          const dropBelow = isDropTarget && dragIndex! < index;

          return (
            <div
              key={col.key}
              draggable={reorderable && grippedIndex === index}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group/row flex items-center gap-gp-lg px-pad-md py-[4px] rounded-radius-md",
                "transition-[opacity,box-shadow] duration-150",
                "hover:bg-bg-muted",
                isDragging && "opacity-40",
                dropAbove && "shadow-[inset_0_2px_0_0_var(--color-border-brand)]",
                dropBelow && "shadow-[inset_0_-2px_0_0_var(--color-border-brand)]",
              )}
            >
              {reorderable && (
                <span
                  onMouseDown={() => setGrippedIndex(index)}
                  onMouseUp={() => {
                    // Se soltou sem iniciar drag, limpa
                    if (dragIndex === null) setGrippedIndex(null);
                  }}
                  className="grid place-items-center size-[16px] shrink-0 text-fg-subtle cursor-grab active:cursor-grabbing select-none [&_svg]:size-[14px]"
                  aria-label="Arrastar pra reordenar"
                >
                  <GripVertical strokeWidth={1.8} />
                </span>
              )}
              <Checkbox
                id={`col-vis-${col.key}`}
                checked={checked}
                onCheckedChange={() => toggleVisible(col.key)}
                aria-label={
                  typeof col.label === "string"
                    ? `Mostrar ${col.label}`
                    : undefined
                }
              />
              {Icon && (
                <Icon className="size-[14px] shrink-0 text-fg-muted" />
              )}
              <label
                htmlFor={`col-vis-${col.key}`}
                className="flex-1 text-body-sm font-medium text-fg-default cursor-pointer truncate"
              >
                {col.label}
              </label>
              <button
                type="button"
                onClick={() => togglePin(col.key)}
                aria-pressed={isPinned}
                aria-label={
                  typeof col.label === "string"
                    ? isPinned
                      ? `Desfixar ${col.label}`
                      : `Fixar ${col.label}`
                    : undefined
                }
                title={isPinned ? "Desfixar coluna" : "Fixar coluna"}
                className={cn(
                  "grid place-items-center size-[28px] shrink-0",
                  "rounded-radius-md bg-transparent text-fg-muted",
                  "transition-[opacity,background-color,color] duration-150",
                  "outline-none focus-visible:opacity-100 focus-visible:bg-bg-muted",
                  "hover:bg-bg-muted hover:text-fg-default",
                  "[&_svg]:size-[14px]",
                  isPinned
                    ? "opacity-100 text-fg-brand bg-bg-brand-subtle hover:bg-bg-brand-subtle-hover hover:text-fg-brand"
                    : "opacity-0 group-hover/row:opacity-100",
                )}
              >
                {isPinned ? (
                  <Pin strokeWidth={2.2} />
                ) : (
                  <PinOff strokeWidth={1.8} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer split */}
      {(!hideShowAll || !hideOnlyPinned) && (
        <div className="flex-none flex items-center justify-between gap-gp-md px-pad-2xl min-h-[44px] border-t border-border-default">
          {!hideShowAll ? (
            <button
              type="button"
              onClick={showAll}
              className="text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none hover:underline focus-visible:underline underline-offset-2"
            >
              {showAllLabel}
            </button>
          ) : (
            <span />
          )}
          {!hideOnlyPinned && (
            <button
              type="button"
              onClick={onlyPinned}
              className="text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none hover:underline focus-visible:underline underline-offset-2"
            >
              {onlyPinnedLabel}
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* ── Popover wrapper ─────────────────────────────────────────────── */
export type ColsPopoverProps = ColsPanelProps & {
  trigger: ReactNode;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/**
 * ColsPopover — popover de gerenciamento de colunas da tabela.
 * Wrapper fino: renderiza o `<ColsPanel>` dentro do PopoverContent.
 *
 * NOTA: usa HTML5 drag nativo em vez de dnd-kit pra evitar conflito com o
 * `transform` aplicado pelo Radix Popover (Floating UI).
 */
export function ColsPopover({
  trigger,
  align = "end",
  open,
  onOpenChange,
  className,
  ...panel
}: ColsPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "w-[320px] max-w-[calc(100vw-32px)] max-h-[min(480px,calc(100vh-80px))] p-0 flex flex-col min-h-0 overflow-hidden",
          className,
        )}
      >
        <ColsPanel {...panel} />
      </PopoverContent>
    </Popover>
  );
}
