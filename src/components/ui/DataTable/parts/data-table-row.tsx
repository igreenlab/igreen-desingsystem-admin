import { memo, type ReactNode, type MutableRefObject } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableRow, TableCell, SELECTION_COLUMN_WIDTH } from "../../Table";
import { Checkbox } from "@/components/shadcn/checkbox";
import { columnTypeRegistry } from "../column-types";
import { applyValueGetter } from "../utils/resolve-value";
import type {
  DataTableColumnDef,
  FilterValue,
  GridRowId,
} from "../data-table.types";
import { DataTableEditCell } from "./data-table-edit-cell";
import { DataTableActionsCell } from "./data-table-actions-cell";

/**
 * Estado de edição inline da row (só não-null pra row com célula em edição).
 * Bundled num objeto pra que `isLoading`/`error` não vazem pras outras rows:
 * só a row em edição recebe um objeto novo → só ela re-renderiza.
 */
export type DataTableRowEditState = {
  field: string;
  isLoading: boolean;
  error: string | null;
};

/**
 * Handlers da row — passados via REF estável (atualizado a cada render do pai).
 * Evita re-render por mudança de identidade de handler (o ref nunca muda) e
 * evita stale closures (lê sempre o `.current` mais recente no event time).
 */
export type DataTableRowHandlers<T> = {
  getRowId: (row: T) => GridRowId;
  onRowClick: (row: T, index: number) => void;
  onRowKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, index: number, row: T) => void;
  onRowFocus: (index: number) => void;
  toggleRowSelection: (row: T) => void;
  toggleRowExpansion: (rowId: GridRowId) => void;
  startEditingCell: (rowId: GridRowId, field: string) => void;
  onCellEditCommit: (params: {
    row: T;
    field: string;
    value: unknown;
    oldValue: unknown;
  }) => void;
  onCellEditCancel: () => void;
  registerRef: (index: number, el: HTMLDivElement | null) => void;
};

export type DataTableRowProps<T> = {
  row: T;
  index: number;
  rowId: GridRowId;
  /* ── Estado reativo da row (comparado pelo memo) ─────────────── */
  selected: boolean;
  focused: boolean;
  expanded: boolean;
  /** null quando a row não está em edição; objeto novo só pra row editando. */
  editState: DataTableRowEditState | null;
  /** Classe da row — computada no pai (getRowClassName) pra o memo comparar. */
  rowClassName?: string;
  virtualStyle?: React.CSSProperties;
  /* ── Dados de render (comparados — mudam → row re-renderiza) ──── */
  columns: DataTableColumnDef<T>[];
  columnWidths: Record<string, number>;
  stickyOffsets: Record<string, number>;
  selectionEnabled: boolean;
  clickable: boolean;
  useRowExpansion: boolean;
  expandableColField: string | null;
  /* ── Handlers (ref estável — NÃO comparado) ──────────────────── */
  handlers: MutableRefObject<DataTableRowHandlers<T>>;
};

function DataTableRowInner<T>({
  row,
  index,
  rowId,
  selected,
  focused,
  expanded,
  editState,
  rowClassName,
  virtualStyle,
  columns,
  columnWidths,
  stickyOffsets,
  selectionEnabled,
  clickable,
  useRowExpansion,
  expandableColField,
  handlers,
}: DataTableRowProps<T>) {
  return (
    <TableRow
      ref={(el) => handlers.current.registerRef(index, el)}
      selected={selected}
      focused={focused}
      clickable={clickable}
      onClick={() => handlers.current.onRowClick(row, index)}
      rootProps={{
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
          handlers.current.onRowKeyDown(e, index, row),
        onFocus: () => handlers.current.onRowFocus(index),
        style: virtualStyle,
      }}
      className={rowClassName}
    >
      {selectionEnabled && (
        <TableCell width={SELECTION_COLUMN_WIDTH} align="center" purpose="selection">
          <Checkbox
            checked={selected}
            onCheckedChange={() => handlers.current.toggleRowSelection(row)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Selecionar linha"
          />
        </TableCell>
      )}
      {columns.map((col) => {
        const field = String(col.field);
        const isActionsCol = col.type === "actions";
        const value = isActionsCol ? undefined : applyValueGetter(row, col);
        const isEditingThisCell = editState?.field === field;
        const isEditable = !isActionsCol && col.editable === true;
        const isExpandableCol =
          useRowExpansion && col.expandable === true && field === expandableColField;

        // Fallback chain de render:
        //   1. edit cell  2. actions  3. col.render  4. registry.renderCell
        //   5. col.valueFormatter  6. registry.formatValue  7. raw value
        const typeDef = col.type ? columnTypeRegistry.get(col.type) : undefined;
        const baseContent = isEditingThisCell
          ? (
              <DataTableEditCell
                column={col}
                row={row}
                initialValue={value}
                isLoading={editState!.isLoading}
                error={editState!.error}
                onCommit={(newValue) =>
                  handlers.current.onCellEditCommit({ row, field, value: newValue, oldValue: value })
                }
                onCancel={handlers.current.onCellEditCancel}
              />
            )
          : isActionsCol && col.getActions && !col.render
            ? <DataTableActionsCell row={row} actions={col.getActions({ row })} />
            : col.render
              ? col.render({ row, value })
              : typeDef?.renderCell
                ? typeDef.renderCell({
                    value,
                    row,
                    options: col.filterOptions,
                    column: {
                      field: String(col.field),
                      headerName: col.headerName,
                      valueFormatter: col.valueFormatter,
                      typeOptions: col.typeOptions,
                    },
                  })
                : col.valueFormatter
                  ? col.valueFormatter(value)
                  : typeDef?.formatValue
                    ? typeDef.formatValue(value)
                    : value;
        const content = isExpandableCol ? (
          <span className="flex items-center gap-gp-md w-full">
            <ChevronRight
              className={cn(
                "shrink-0 size-icon-sm text-fg-muted transition-transform duration-150",
                expanded && "rotate-90",
              )}
              aria-hidden
            />
            <span className="flex-1 min-w-0">{baseContent as ReactNode}</span>
          </span>
        ) : (
          baseContent
        );
        const tooltipText =
          isActionsCol || isEditingThisCell
            ? undefined
            : col.ellipsis || !col.render
              ? col.valueFormatter
                ? col.valueFormatter(value)
                : value != null
                  ? String(value)
                  : undefined
              : undefined;
        const cellRootProps: React.HTMLAttributes<HTMLDivElement> | undefined =
          isEditable || isExpandableCol
            ? {
                ...(isEditable && {
                  onDoubleClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handlers.current.startEditingCell(rowId, field);
                  },
                  "data-editable": "true",
                }),
                ...(isExpandableCol && {
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handlers.current.toggleRowExpansion(rowId);
                  },
                  "data-expandable": "true",
                  "aria-expanded": expanded,
                  style: { cursor: "pointer" },
                }),
              }
            : undefined;
        const effectiveAlign = col.align ?? typeDef?.defaultAlign;
        const effectiveEllipsis = col.ellipsis ?? typeDef?.defaultEllipsis;
        return (
          <TableCell
            key={field}
            field={field}
            width={columnWidths[field]}
            pinned={col.pinned}
            pinOffset={stickyOffsets[field]}
            align={effectiveAlign}
            ellipsis={effectiveEllipsis}
            purpose={isActionsCol ? "actions" : undefined}
            label={col.headerName}
            tooltip={tooltipText}
            rootProps={cellRootProps}
            className={isEditingThisCell ? "!px-pad-xs !py-0" : undefined}
          >
            {content as ReactNode}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

/**
 * `DataTableRow` — row memoizada. Barreira de re-render: só re-renderiza quando
 * suas props reativas mudam (selected/focused/expanded/editState) ou os dados de
 * render (columns/widths). Mudanças globais de estado do DataTable (foco em outra
 * row, abrir popover, refresh) NÃO repintam rows não-afetadas.
 *
 * Generics preservados via cast (React.memo perde o param de tipo).
 */
export const DataTableRow = memo(DataTableRowInner) as typeof DataTableRowInner;
