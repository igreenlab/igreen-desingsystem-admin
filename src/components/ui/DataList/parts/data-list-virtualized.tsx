import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ListItem, type ListItemData, type ListMenuItem, type ListRenderState } from "@/components/ui/List";

type Props = {
  items: ListItemData[];
  density: "comfortable" | "compact";
  estimateItemSize: number;
  selectable?: boolean;
  selectedIds: Set<string>;
  openId?: string;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
  /** altura do viewport de scroll (px). Default 480. */
  height?: number;
};

/**
 * Lista virtualizada (só layout standard, sem DnD) — renderiza apenas os cards
 * visíveis via @tanstack/react-virtual. Pra listas grandes (10k+).
 */
export function DataListVirtualized({
  items,
  density,
  estimateItemSize,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
  height = 480,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  // mesmo gap do List não-virtualizado (root: comfortable=gap-gp-lg 10px / compact=gap-gp-md 8px)
  const gap = density === "compact" ? 8 : 10;
  const v = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateItemSize,
    // mede a altura REAL de cada card — sem isso o estimateItemSize (76) reservava
    // mais espaço que o card renderizado e o excedente aparecia como "gap" grande.
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 8,
    gap,
  });

  return (
    <div ref={parentRef} className="overflow-auto scrollbar-thin" style={{ height }}>
      <div style={{ height: v.getTotalSize(), position: "relative", width: "100%" }}>
        {v.getVirtualItems().map((row) => {
          const item = items[row.index];
          return (
            <div
              key={item.id}
              data-index={row.index}
              ref={v.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${row.start}px)`,
              }}
            >
              <ListItem
                item={item}
                state={{
                  selected: selectedIds.has(item.id),
                  open: openId === item.id,
                  dragging: false,
                  depth: 0,
                }}
                density={density}
                renderItem={renderItem}
                getMenuItems={getMenuItems}
                onClick={onItemClick}
                selectable={selectable}
                onToggleSelect={onToggleSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
