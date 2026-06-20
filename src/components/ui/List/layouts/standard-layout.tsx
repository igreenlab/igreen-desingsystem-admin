import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { listStyles, type ListStyleVariants } from "../list.styles";
import { SortableListItem } from "./_sortable-item";
import { droppableIdForGroup } from "../hooks/use-list-dnd";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "../list.types";

type StandardLayoutProps = {
  items: ListItemData[];
  groupId: string;
  density: NonNullable<ListStyleVariants["density"]>;
  enableDnD: boolean;
  activeItemId: string | null;
  overGroupId: string | null;
  overItemId: string | null;
  selectable?: boolean;
  selectedIds: Set<string>;
  openId?: string;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
};

export function StandardLayout({
  items,
  groupId,
  density,
  enableDnD,
  activeItemId,
  overGroupId,
  overItemId,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
}: StandardLayoutProps) {
  const s = listStyles({ density });
  const { setNodeRef } = useDroppable({
    id: droppableIdForGroup(groupId),
    disabled: !enableDnD,
  });

  const showEndIndicator =
    enableDnD && activeItemId !== null && overGroupId === groupId && !overItemId;

  return (
    <div ref={enableDnD ? setNodeRef : undefined} className={s.root({ density })}>
      {items.map((item) => (
        <SortableListItem
          key={item.id}
          item={item}
          groupId={groupId}
          density={density}
          enableDnD={enableDnD}
          dragging={activeItemId === item.id}
          showIndicatorBefore={
            enableDnD &&
            overItemId === item.id &&
            activeItemId !== null &&
            activeItemId !== item.id
          }
          open={openId === item.id}
          selectable={selectable}
          selected={selectedIds.has(item.id)}
          onToggleSelect={onToggleSelect}
          onClick={onItemClick}
          renderItem={renderItem}
          getMenuItems={getMenuItems}
        />
      ))}
      {showEndIndicator && <div className={s.dropIndicator()} aria-hidden />}
    </div>
  );
}
