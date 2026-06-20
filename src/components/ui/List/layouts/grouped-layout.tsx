import type { ReactNode } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { listStyles, type ListStyleVariants } from "../list.styles";
import { SortableListItem } from "./_sortable-item";
import type { GroupedBucket } from "../utils/group-items";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "../list.types";

type GroupedLayoutProps = {
  buckets: GroupedBucket[];
  density: NonNullable<ListStyleVariants["density"]>;
  enableDnD: boolean;
  /** Painel sutil por grupo ("card fino" que diferencia da superfície). */
  groupSurface?: boolean;
  /** Set de grupos ABERTOS (expandido). */
  openGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  selectable?: boolean;
  selectedIds: Set<string>;
  openId?: string;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
};

export function GroupedLayout(props: GroupedLayoutProps) {
  const { buckets, density } = props;
  const s = listStyles({ density });
  return (
    <div className="flex flex-col gap-gp-2xl">
      {buckets.map((bucket) => (
        <GroupSection key={bucket.group.id} bucket={bucket} styles={s} {...props} />
      ))}
    </div>
  );
}

function GroupSection({
  bucket,
  styles: s,
  density,
  enableDnD,
  groupSurface,
  openGroups,
  onToggleGroup,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
}: GroupedLayoutProps & {
  bucket: GroupedBucket;
  styles: ReturnType<typeof listStyles>;
}) {
  const { group, items, count } = bucket;
  const open = openGroups.has(group.id);

  const rows = items.map((item, index) => (
    <SortableListItem
      key={item.id}
      item={item}
      index={index}
      density={density}
      enableDnD={enableDnD && group.canReceiveDrop !== false}
      open={openId === item.id}
      selectable={selectable}
      selected={selectedIds.has(item.id)}
      onToggleSelect={onToggleSelect}
      onClick={onItemClick}
      renderItem={renderItem}
      getMenuItems={getMenuItems}
    />
  ));

  return (
    <section className={cn(s.group(), groupSurface && s.groupPanel())}>
      <header className={s.groupHeader()}>
        <button
          type="button"
          className={s.groupToggle()}
          aria-expanded={open}
          aria-label={open ? "Recolher grupo" : "Expandir grupo"}
          onClick={() => onToggleGroup(group.id)}
        >
          <ChevronDown
            className={cn("size-[16px] transition-transform", !open && "-rotate-90")}
          />
        </button>
        {group.color && (
          <span className={s.groupDot()} style={{ background: group.color }} aria-hidden />
        )}
        <span className={s.groupTitle()}>{group.label}</span>
        <span className={s.groupCount()}>{count}</span>
      </header>

      {open &&
        (enableDnD ? (
          <Droppable droppableId={group.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  s.groupBody({ density }),
                  "min-h-[44px]",
                  snapshot.isDraggingOver && s.dropZoneActive(),
                )}
              >
                {rows}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : (
          <div className={s.groupBody({ density })}>{rows}</div>
        ))}
    </section>
  );
}
