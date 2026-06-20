import { Fragment, type ReactNode } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { listStyles, type ListStyleVariants } from "../list.styles";
import { ListItem } from "../list-item";
import { droppableIdForItem } from "../hooks/use-list-dnd";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "../list.types";

type SortableListItemProps = {
  item: ListItemData;
  groupId: string;
  density: NonNullable<ListStyleVariants["density"]>;
  enableDnD: boolean;
  dragging: boolean;
  showIndicatorBefore: boolean;
  /* repasses pro ListItem */
  open: boolean;
  selectable?: boolean;
  selected: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
};

/**
 * Row arrastável — encapsula useDraggable+useDroppable do dnd-kit e renderiza
 * o indicador de drop (antes do item) + o <ListItem>. Compartilhado por
 * standard-layout e grouped-layout.
 */
export function SortableListItem({
  item,
  groupId,
  density,
  enableDnD,
  dragging,
  showIndicatorBefore,
  open,
  selectable,
  selected,
  onToggleSelect,
  onClick,
  renderItem,
  getMenuItems,
}: SortableListItemProps) {
  const canDrag = enableDnD && item.canDrag !== false;
  const canDrop = enableDnD && item.canDrop !== false;

  const { setNodeRef: setDragRef, attributes, listeners } = useDraggable({
    id: item.id,
    disabled: !canDrag,
    data: { itemId: item.id, fromGroupId: groupId },
  });
  const { setNodeRef: setDropRef } = useDroppable({
    id: droppableIdForItem(item.id),
    disabled: !canDrop,
  });
  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const s = listStyles({ density });
  const state: ListRenderState = { selected, open, dragging, depth: 0 };

  return (
    <Fragment>
      {showIndicatorBefore && <div className={s.dropIndicator()} aria-hidden />}
      <ListItem
        item={item}
        state={state}
        density={density}
        renderItem={renderItem}
        getMenuItems={getMenuItems}
        onClick={onClick}
        selectable={selectable}
        onToggleSelect={onToggleSelect}
        setNodeRef={enableDnD ? setNodeRef : undefined}
        attributes={canDrag ? attributes : undefined}
        handleListeners={canDrag ? listeners : undefined}
        showHandle={canDrag}
      />
    </Fragment>
  );
}
