import type { ReactNode } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { type ListStyleVariants } from "../list.styles";
import { ListItem } from "../list-item";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "../list.types";

type SortableListItemProps = {
  item: ListItemData;
  index: number;
  density: NonNullable<ListStyleVariants["density"]>;
  enableDnD: boolean;
  open: boolean;
  selectable?: boolean;
  selected: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
};

/**
 * Row da lista. Sem DnD → ListItem direto. Com DnD → envolve num `<Draggable>`
 * do @hello-pangea/dnd: o elemento real é movido (física natural de lista) e o
 * `snapshot.isDragging` dispara a elevação visual (sombra + border).
 */
export function SortableListItem({
  item,
  index,
  density,
  enableDnD,
  open,
  selectable,
  selected,
  onToggleSelect,
  onClick,
  renderItem,
  getMenuItems,
}: SortableListItemProps) {
  const base = {
    item,
    density,
    renderItem,
    getMenuItems,
    onClick,
    selectable,
    onToggleSelect,
  };

  if (!enableDnD) {
    return (
      <ListItem
        {...base}
        state={{ selected, open, dragging: false, depth: 0 }}
      />
    );
  }

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={item.canDrag === false}>
      {(provided, snapshot) => (
        <ListItem
          {...base}
          state={{ selected, open, dragging: snapshot.isDragging, depth: 0 }}
          innerRef={provided.innerRef}
          draggableProps={provided.draggableProps}
          dragHandleProps={provided.dragHandleProps}
          showHandle={item.canDrag !== false}
        />
      )}
    </Draggable>
  );
}
