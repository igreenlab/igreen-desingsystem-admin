import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataTableColumnDef } from "../data-table.types";
import type { DataTableGroupRow } from "../utils/group-rows";

export type DataTableGroupHeaderRowProps<T> = {
  group: DataTableGroupRow<T>;
  /** Colunas efetivas (visíveis) — usado pra renderizar subtotalizers inline. */
  columns: DataTableColumnDef<T>[];
  columnWidths: Record<string, number>;
  stickyOffsets: Record<string, number>;
  hasSelection?: boolean;
  /** Click no chevron — toggle expand/collapse. */
  onToggle: () => void;
  /** Style inline pra virtualização (position absolute + transform). */
  style?: React.CSSProperties;
  /** Override do conteúdo — quando passado, substitui o layout default
   *  (chevron + label + count + subtotalizers nas cells) por ReactNode livre
   *  ocupando a row inteira. Mantém o click handler do toggle no wrapper. */
  renderHeader?: (params: {
    group: {
      key: string;
      field: string;
      value: unknown;
      label: string;
      count: number;
      isExpanded: boolean;
    };
    toggle: () => void;
  }) => React.ReactNode;
};

/**
 * Header row de um grupo. Span full-width, mostra:
 *   - Chevron clicável (▶/▼)
 *   - Label do grupo (valor formatado via column.valueFormatter)
 *   - Count badge "(N)"
 *   - Subtotalizers inline para colunas com `aggregate` (alinhados às cells)
 *
 * Sticky lateral é preservado pra colunas pinned (o chevron + label moram na
 * primeira cell não-pinned, demais cells renderizam aggregate se houver).
 */
export function DataTableGroupHeaderRow<T>({
  group,
  columns,
  columnWidths,
  stickyOffsets,
  hasSelection = false,
  onToggle,
  style,
  renderHeader,
}: DataTableGroupHeaderRowProps<T>) {
  const ChevronIcon = group.isExpanded ? ChevronDown : ChevronRight;

  // Override: free-form render ocupando full row, sem alinhamento de colunas.
  if (renderHeader) {
    return (
      <div
        role="row"
        data-group-header="true"
        data-group-key={group.key}
        aria-expanded={group.isExpanded}
        style={style}
        className={cn(
          "flex w-full min-w-full",
          "bg-bg-subtle",
          "border-b border-border-table",
          "transition-colors duration-150",
          // Sticky horizontal: free-form header gruda no left=0 e ocupa
          // viewport width pra não ser cortado por scroll horizontal.
          "sticky left-0",
        )}
      >
        {renderHeader({
          group: {
            key: group.key,
            field: group.field,
            value: group.value,
            label: group.label,
            count: group.count,
            isExpanded: group.isExpanded,
          },
          toggle: onToggle,
        })}
      </div>
    );
  }

  return (
    <div
      role="row"
      data-group-header="true"
      data-group-key={group.key}
      aria-expanded={group.isExpanded}
      style={style}
      className={cn(
        "flex w-max min-w-full h-[42px]",
        "bg-bg-subtle hover:bg-bg-muted",
        "border-b border-border-table",
        "cursor-pointer select-none",
        "transition-colors duration-150",
      )}
      onClick={onToggle}
    >
      {hasSelection && (
        <div className="shrink-0 w-[56px] h-[42px]" />
      )}
      {columns.map((col, idx) => {
        const field = String(col.field);
        const width = columnWidths[field];
        const isPinned = col.pinned === "left" || col.pinned === "right";
        // Cell style (width + sticky offsets quando pinned)
        const cellStyle: React.CSSProperties = {
          width,
          minWidth: width,
          maxWidth: width,
        };
        if (isPinned && stickyOffsets[field] !== undefined) {
          if (col.pinned === "left") cellStyle.left = stickyOffsets[field];
          if (col.pinned === "right") cellStyle.right = stickyOffsets[field];
        }
        // Primeira cell não-pinned (ou primeira cell se nenhuma pinned-left)
        // recebe chevron + label + count. Demais recebem aggregate se definido.
        const isFirstNonPinnedLeft =
          idx === columns.findIndex((c) => c.pinned !== "left");

        return (
          <div
            key={field}
            data-field={field}
            className={cn(
              "shrink-0 flex items-center px-pad-2xl gap-gp-md",
              "text-body-md font-medium text-fg-strong",
              isPinned && "sticky z-[5] bg-bg-subtle",
            )}
            style={cellStyle}
          >
            {isFirstNonPinnedLeft ? (
              <>
                <ChevronIcon
                  className="shrink-0 size-icon-sm text-fg-muted transition-transform"
                  aria-hidden
                />
                <span className="truncate">{group.label}</span>
                <span className="text-fg-muted tabular-nums">
                  ({group.count})
                </span>
              </>
            ) : col.aggregate ? (
              <GroupAggregate column={col} rows={group.rows} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ── Subtotalizer inline — reusa logica do TotalizerRow ──────────── */

function GroupAggregate<T>({
  column,
  rows,
}: {
  column: DataTableColumnDef<T>;
  rows: T[];
}) {
  const content = resolveAggregate(column, rows);
  if (content == null || content === "") return null;
  return <span className="text-fg-muted">{content}</span>;
}

function resolveAggregate<T>(
  col: DataTableColumnDef<T>,
  rows: T[],
): React.ReactNode {
  if (col.aggregate === undefined) return null;
  if (typeof col.aggregate === "function") return col.aggregate(rows);

  const field = String(col.field);
  const values = rows
    .map((r) => {
      if (col.valueGetter) return col.valueGetter(r);
      if (!field.includes(".")) return (r as Record<string, unknown>)[field];
      return field
        .split(".")
        .reduce<unknown>(
          (acc, key) => (acc as Record<string, unknown> | null | undefined)?.[key],
          r,
        );
    })
    .filter((v): v is number => typeof v === "number" && !isNaN(v));

  let result: number;
  switch (col.aggregate) {
    case "sum":
      result = values.reduce((acc, v) => acc + v, 0);
      break;
    case "avg":
      result = values.length === 0 ? 0 : values.reduce((acc, v) => acc + v, 0) / values.length;
      break;
    case "count":
      result = rows.length;
      break;
    case "min":
      result = values.length === 0 ? 0 : Math.min(...values);
      break;
    case "max":
      result = values.length === 0 ? 0 : Math.max(...values);
      break;
    default:
      return null;
  }

  const formatter = col.aggregateFormatter ?? col.valueFormatter;
  return formatter ? formatter(result) : String(result);
}
