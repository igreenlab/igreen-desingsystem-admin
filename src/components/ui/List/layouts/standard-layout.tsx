import type { ReactNode } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { listStyles, type ListStyleVariants } from "../list.styles";
import { SortableListItem } from "./_sortable-item";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "../list.types";

type StandardLayoutProps = {
  items: ListItemData[];
  droppableId: string;
  density: NonNullable<ListStyleVariants["density"]>;
  enableDnD: boolean;
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
  droppableId,
  density,
  enableDnD,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
}: StandardLayoutProps) {
  const s = listStyles({ density });

  const rows = items.map((item, index) => (
    <SortableListItem
      key={item.id}
      item={item}
      index={index}
      density={density}
      enableDnD={enableDnD}
      open={openId === item.id}
      selectable={selectable}
      selected={selectedIds.has(item.id)}
      onToggleSelect={onToggleSelect}
      onClick={onItemClick}
      renderItem={renderItem}
      getMenuItems={getMenuItems}
    />
  ));

  if (!enableDnD) {
    return <div className={s.root({ density })}>{rows}</div>;
  }

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(s.root({ density }), snapshot.isDraggingOver && s.dropZoneActive())}
        >
          {rows}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
