import { useMemo } from "react";
import type { ColsPopoverColumn } from "../../TableToolbar";
import type { ColumnPinned } from "../../Table";
import type { DataTableColumnDef } from "../data-table.types";

export type UseColsPopoverAdapterParams<T> = {
  columns: DataTableColumnDef<T>[];
  hiddenColumns: Set<string>;
  pinnedColumns: Record<string, ColumnPinned>;
  handleShow: (field: string) => void;
  handleHide: (field: string) => void;
  handlePin: (field: string, side: ColumnPinned) => void;
  handleReorder: (order: string[]) => void;
};

export type UseColsPopoverAdapterResult = {
  /** Colunas no formato do ColsPopover (sem actions). */
  colsPopoverColumns: ColsPopoverColumn[];
  /** Set de fields visíveis (calculado de hiddenColumns). */
  visibleColsSet: Set<string>;
  /** Set de fields pinned (left ou right). */
  pinnedColsSet: Set<string>;
  /** Aplica toggle de visibilidade — converte Set → handleShow/handleHide. */
  handleVisibleChange: (next: Set<string>) => void;
  /** Aplica toggle de pin — converte Set → handlePin("left"/undefined). */
  handlePinnedChange: (next: Set<string>) => void;
  /** Reordena colunas via dnd interno do popover. */
  handleColumnsReorder: (reordered: ColsPopoverColumn[]) => void;
};

/**
 * Adapter: ColumnDef + visibility/pin state ↔ ColsPopover props.
 *
 * Extraído do data-table.tsx pra isolar a tradução entre o popover de colunas
 * (que trabalha com Sets de keys) e o estado interno do DataTable (que usa
 * `Set<hiddenColumns>` + `Record<field, "left"|"right">`).
 */
export function useColsPopoverAdapter<T>({
  columns,
  hiddenColumns,
  pinnedColumns,
  handleShow,
  handleHide,
  handlePin,
  handleReorder,
}: UseColsPopoverAdapterParams<T>): UseColsPopoverAdapterResult {
  const colsPopoverColumns = useMemo<ColsPopoverColumn[]>(
    () =>
      columns
        // Coluna actions é estrutural — não aparece no popover de visibilidade.
        .filter((c) => c.type !== "actions")
        .map((c) => ({
          key: String(c.field),
          label: c.headerName,
          icon: c.icon,
        })),
    [columns],
  );

  const visibleColsSet = useMemo<Set<string>>(
    () =>
      new Set(
        columns
          .map((c) => String(c.field))
          .filter((f) => !hiddenColumns.has(f)),
      ),
    [columns, hiddenColumns],
  );

  const pinnedColsSet = useMemo<Set<string>>(
    () =>
      new Set(
        Object.entries(pinnedColumns)
          .filter(([, pin]) => pin === "left" || pin === "right")
          .map(([field]) => field),
      ),
    [pinnedColumns],
  );

  const handleVisibleChange = (next: Set<string>) => {
    const allFields = columns.map((c) => String(c.field));
    for (const f of allFields) {
      if (next.has(f) && hiddenColumns.has(f)) {
        handleShow(f);
      } else if (!next.has(f) && !hiddenColumns.has(f)) {
        handleHide(f);
      }
    }
  };

  const handlePinnedChange = (next: Set<string>) => {
    const allFields = columns.map((c) => String(c.field));
    for (const f of allFields) {
      const isPinned =
        pinnedColumns[f] === "left" || pinnedColumns[f] === "right";
      if (next.has(f) && !isPinned) {
        handlePin(f, "left");
      } else if (!next.has(f) && isPinned) {
        handlePin(f, undefined);
      }
    }
  };

  const handleColumnsReorder = (reordered: ColsPopoverColumn[]) => {
    handleReorder(reordered.map((c) => c.key));
  };

  return {
    colsPopoverColumns,
    visibleColsSet,
    pinnedColsSet,
    handleVisibleChange,
    handlePinnedChange,
    handleColumnsReorder,
  };
}
