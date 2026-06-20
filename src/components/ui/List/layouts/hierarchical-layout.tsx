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
  // gap entre cards (+4px vs densidade base) — o bridge dos conectores usa o
  // MESMO valor pra estender cada guia vertical e manter as linhas contínuas.
  const gap = density === "compact" ? 10 : 12;

  return (
    <div className="flex flex-col" style={{ gap }}>
      {rows.map((row) => (
        <div key={row.item.id} className="flex items-stretch">
          {showConnectors && row.depth > 0 && (
            <Connector row={row} indentSize={indentSize} gap={gap} styles={s} />
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
              row.hasChildren ? (
                <button
                  type="button"
                  className={s.groupToggle()}
                  aria-expanded={row.expanded}
                  aria-label={row.expanded ? "Recolher" : "Expandir"}
                  onClick={() => onToggleExpand(row.item.id)}
                >
                  <ChevronRight
                    className={cn("size-[16px] transition-transform", row.expanded && "rotate-90")}
                  />
                </button>
              ) : undefined
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
  gap,
  styles: s,
}: {
  row: FlatRow;
  indentSize: number;
  gap: number;
  styles: ReturnType<typeof listStyles>;
}) {
  const cols = Array.from({ length: row.depth });
  const vLine = { left: "50%", width: 1, transform: "translateX(-50%)" } as const;
  return (
    <div className="flex shrink-0" aria-hidden>
      {cols.map((_, i) => {
        const isElbow = i === row.depth - 1;
        if (isElbow) {
          return (
            <span key={i} style={{ width: indentSize }} className={s.indent()}>
              {/* vertical: (gap acima) → centro do card */}
              <span
                className={s.connector()}
                style={{ ...vLine, top: -gap, height: `calc(50% + ${gap}px)` }}
              />
              {/* vertical: centro → base (só se tem irmão depois) */}
              {!row.isLast && (
                <span className={s.connector()} style={{ ...vLine, top: "50%", bottom: 0 }} />
              )}
              {/* horizontal: centro → card */}
              <span
                className={s.connector()}
                style={{ left: "50%", right: 0, top: "50%", height: 1, transform: "translateY(-50%)" }}
              />
            </span>
          );
        }
        // pass-through dos ancestrais — estende pra cima pelo gap (linha contínua).
        // Coluna i (x = i*indent) hospeda o elbow de nós em depth i+1, então a
        // continuação vertical depende do ancestral em depth i+1 ter irmão —
        // ancestorHasNext[i+1], NÃO [i]. Com [i] (off-by-one) a guia sumia no
        // último root (ancestorHasNext[0]=false); nos demais o root tinha next
        // e mascarava o bug.
        const continues = row.ancestorHasNext[i + 1];
        return (
          <span key={i} style={{ width: indentSize }} className={s.indent()}>
            {continues && (
              <span className={s.connector()} style={{ ...vLine, top: -gap, bottom: 0 }} />
            )}
          </span>
        );
      })}
    </div>
  );
}
