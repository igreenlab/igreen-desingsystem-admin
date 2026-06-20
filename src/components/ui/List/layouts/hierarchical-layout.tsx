import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { listStyles, type ListStyleVariants } from "../list.styles";
import { ListItem } from "../list-item";
import { flattenTree, type FlatRow } from "../utils/flatten-tree";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "../list.types";

type HierarchicalLayoutProps = {
  items: ListItemData[];
  density: NonNullable<ListStyleVariants["density"]>;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  showConnectors: boolean;
  indentSize: number;
  selectable?: boolean;
  selectedIds: Set<string>;
  openId?: string;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
};

export function HierarchicalLayout({
  items,
  density,
  expanded,
  onToggleExpand,
  showConnectors,
  indentSize,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
}: HierarchicalLayoutProps) {
  const s = listStyles({ density });
  const rows = flattenTree(items, expanded);

  return (
    <div className={s.root({ density })}>
      {rows.map((row) => (
        <div key={row.item.id} className="flex items-stretch">
          {showConnectors && row.depth > 0 && (
            <Connector row={row} indentSize={indentSize} styles={s} />
          )}
          {!showConnectors && row.depth > 0 && (
            <span style={{ width: row.depth * indentSize }} className="shrink-0" aria-hidden />
          )}
          <ListItem
            item={row.item}
            state={{
              selected: selectedIds.has(row.item.id),
              open: openId === row.item.id,
              dragging: false,
              depth: row.depth,
            }}
            density={density}
            renderItem={renderItem}
            getMenuItems={getMenuItems}
            onClick={onItemClick}
            selectable={selectable}
            onToggleSelect={onToggleSelect}
            expandToggle={
              <button
                type="button"
                className={cn(s.groupToggle(), !row.hasChildren && "invisible")}
                aria-expanded={row.hasChildren ? row.expanded : undefined}
                aria-label={row.expanded ? "Recolher" : "Expandir"}
                disabled={!row.hasChildren}
                onClick={() => row.hasChildren && onToggleExpand(row.item.id)}
              >
                <ChevronRight
                  className={cn("size-[16px] transition-transform", row.expanded && "rotate-90")}
                />
              </button>
            }
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Gutter de conectores à esquerda do card. Uma coluna por nível de indent:
 * - colunas dos ancestrais → linha vertical full-height quando o ancestral
 *   ainda tem irmão depois (a guia "continua descendo").
 * - última coluna → elbow (∟): vertical até o centro + horizontal até o card;
 *   continua abaixo do centro só se o nó tiver irmão (não é o último).
 */
function Connector({
  row,
  indentSize,
  styles: s,
}: {
  row: FlatRow;
  indentSize: number;
  styles: ReturnType<typeof listStyles>;
}) {
  const cols = Array.from({ length: row.depth });
  return (
    <div className="flex shrink-0" aria-hidden>
      {cols.map((_, i) => {
        const isElbow = i === row.depth - 1;
        if (isElbow) {
          return (
            <span key={i} style={{ width: indentSize }} className={s.indent()}>
              {/* vertical: topo→centro */}
              <span className={cn(s.connector(), "left-1/2 top-0 h-1/2 w-px -translate-x-1/2")} />
              {/* vertical: centro→baixo (só se tem irmão) */}
              {!row.isLast && (
                <span className={cn(s.connector(), "left-1/2 top-1/2 bottom-0 w-px -translate-x-1/2")} />
              )}
              {/* horizontal: centro→card */}
              <span className={cn(s.connector(), "left-1/2 top-1/2 right-0 h-px -translate-y-1/2")} />
            </span>
          );
        }
        // pass-through dos ancestrais
        const continues = row.ancestorHasNext[i];
        return (
          <span key={i} style={{ width: indentSize }} className={s.indent()}>
            {continues && (
              <span className={cn(s.connector(), "left-1/2 top-0 bottom-0 w-px -translate-x-1/2")} />
            )}
          </span>
        );
      })}
    </div>
  );
}
