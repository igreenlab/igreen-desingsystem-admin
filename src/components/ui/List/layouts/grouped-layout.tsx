import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { listStyles, type ListStyleVariants } from "../list.styles";
import { SortableListItem } from "./_sortable-item";
import { droppableIdForGroup } from "../hooks/use-list-dnd";
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
  activeItemId: string | null;
  overGroupId: string | null;
  overItemId: string | null;
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
  activeItemId,
  overGroupId,
  overItemId,
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
  const { setNodeRef } = useDroppable({
    id: droppableIdForGroup(group.id),
    disabled: !enableDnD,
  });

  const showEndIndicator =
    enableDnD && activeItemId !== null && overGroupId === group.id && !overItemId;

  return (
    <section className={s.group()}>
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

      {open && (
        <div ref={enableDnD ? setNodeRef : undefined} className={s.groupBody({ density })}>
          {items.map((item) => (
            <SortableListItem
              key={item.id}
              item={item}
              groupId={group.id}
              density={density}
              enableDnD={enableDnD && group.canReceiveDrop !== false}
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
      )}
    </section>
  );
}
