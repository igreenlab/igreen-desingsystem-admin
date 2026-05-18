import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHeadCell } from "../../Table";
import type { TableHeadCellProps } from "../../Table";

export type DataTableSortableHeadCellProps = TableHeadCellProps & {
  /** ID unico do item no SortableContext (== field). Obrigatorio pra dnd. */
  sortableId: string;
  /** Quando true, desabilita drag (usado pra coluna actions). */
  disableDrag?: boolean;
  children?: ReactNode;
};

/**
 * Wrapper do TableHeadCell que adiciona drag-and-drop via @dnd-kit/sortable.
 *
 * - Activation constraint de 5px no PointerSensor (DndContext) preserva click-to-sort.
 * - Aplica `transform` + `transition` durante drag (CSS smooth movement).
 * - Reduz opacidade do item em drag pra dar feedback visual.
 * - Spread `attributes` + `listeners` via `rootProps` — listeners ficam na cell
 *   inteira (drag activator) mas mousedown/click do resize handle + column menu
 *   button já tem stopPropagation, então não conflitam.
 *
 * Quando `disableDrag=true`, o item participa do SortableContext (mantem layout)
 * mas não pode ser arrastado nem ser drop target.
 */
export function DataTableSortableHeadCell({
  sortableId,
  disableDrag = false,
  children,
  ...headCellProps
}: DataTableSortableHeadCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled: disableDrag,
  });

  // Cursor strategy:
  // - drag desabilitado → cursor default do TableHeadCell (pointer se sortable, default se não)
  // - durante drag ativo → grabbing (feedback visual de "está sendo movido")
  // - sortable + draggable → pointer (sort = ação primária ao click; drag é secundário)
  // - apenas draggable (não sortable) → grab (drag é a única ação interativa)
  const cursor: React.CSSProperties["cursor"] = disableDrag
    ? undefined
    : isDragging
      ? "grabbing"
      : headCellProps.sortable
        ? "pointer"
        : "grab";

  const dragStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    cursor,
    zIndex: isDragging ? 30 : undefined,
    // Override do sticky positioning durante drag pra cell flutuar acompanhando o cursor
    position: isDragging ? "relative" : undefined,
  };

  return (
    <TableHeadCell
      {...headCellProps}
      ref={setNodeRef}
      style={dragStyle}
      rootProps={{
        ...attributes,
        ...listeners,
      }}
    >
      {children}
    </TableHeadCell>
  );
}
