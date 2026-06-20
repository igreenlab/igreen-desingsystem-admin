import { useCallback, useMemo } from "react";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { listStyles } from "./list.styles";
import { ListItem } from "./list-item";
import { StandardLayout } from "./layouts/standard-layout";
import { GroupedLayout } from "./layouts/grouped-layout";
import { HierarchicalLayout } from "./layouts/hierarchical-layout";
import { useSelectionSet } from "./hooks/use-selection-set";
import { useDisclosureSet } from "./hooks/use-disclosure-set";
import { useListDnD } from "./hooks/use-list-dnd";
import { groupItems } from "./utils/group-items";
import type { ListItemData, ListProps } from "./list.types";

const STANDARD_GROUP_ID = "__list__";

/**
 * <List> — primitivo de listagem em cards (como `Table` é o primitivo de tabela).
 * Burro: recebe dados + estado de UI (controlado/não-controlado) e emite callbacks.
 * Sem busca/filtro/sort/server/toolbar — isso é o `DataList` (passo 2).
 *
 * Layouts: `standard` (lista plana) · `grouped` (seções + DnD) · `hierarchical`
 * (árvore-como-lista colapsável com conectores). Card via slots ou `renderItem`.
 */
export function List({
  layout = "standard",
  items,
  groups,
  renderItem,
  getMenuItems,
  onItemClick,
  openId,
  selectable,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  showConnectors = true,
  indentSize = 24,
  enableDnD = false,
  onReorder,
  onMove,
  loading,
  skeletonCount = 4,
  emptyState,
  density = "comfortable",
  className,
}: ListProps) {
  const s = listStyles({ density });

  const { selected, toggle: toggleSelect } = useSelectionSet({
    controlled: selectedIds,
    defaultValue: defaultSelectedIds,
    onChange: onSelectionChange,
  });

  // Grupos abrem por padrão; hierarquia colapsa por padrão (seed via defaults).
  const groupedDefaultOpen = useMemo(
    () =>
      layout === "grouped" && groups
        ? new Set(groups.map((g) => g.id))
        : undefined,
    [layout, groups],
  );
  const { expanded, toggle: toggleExpand } = useDisclosureSet({
    controlled: expandedIds,
    defaultValue: defaultExpandedIds ?? groupedDefaultOpen,
    onChange: onExpandedChange,
  });

  const dndEnabled = enableDnD && layout !== "hierarchical";

  const { itemsByGroup, itemGroupLookup, canReceive } = useMemo(() => {
    const byGroup = new Map<string, string[]>();
    const lookup = new Map<string, string>();
    const recv = new Map<string, boolean>();
    if (layout === "grouped" && groups) {
      for (const g of groups) {
        byGroup.set(g.id, []);
        recv.set(g.id, g.canReceiveDrop !== false);
      }
      for (const it of items) {
        if (it.groupId && byGroup.has(it.groupId)) {
          byGroup.get(it.groupId)!.push(it.id);
          lookup.set(it.id, it.groupId);
        }
      }
    } else {
      byGroup.set(STANDARD_GROUP_ID, items.map((i) => i.id));
      for (const it of items) lookup.set(it.id, STANDARD_GROUP_ID);
      recv.set(STANDARD_GROUP_ID, true);
    }
    return { itemsByGroup: byGroup, itemGroupLookup: lookup, canReceive: recv };
  }, [layout, groups, items]);

  const handleDrop = useCallback(
    (id: string, from: string, to: string, toIndex: number) => {
      if (layout === "grouped") onMove?.(id, from, to, toIndex);
      else onReorder?.(id, toIndex);
    },
    [layout, onMove, onReorder],
  );

  const dnd = useListDnD({
    enabled: dndEnabled,
    itemsByGroup,
    itemGroupLookup,
    canReceive,
    onDrop: handleDrop,
  });

  const itemById = useMemo(() => {
    const m = new Map<string, ListItemData>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);
  const activeItem = dnd.activeItemId ? itemById.get(dnd.activeItemId) ?? null : null;

  /* ── estados ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={cn(s.root({ density }), className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={s.skeleton()}>
            <div className={cn(s.skeletonBar(), "w-1/3 mb-gp-md")} />
            <div className={cn(s.skeletonBar(), "w-2/3")} />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={cn(s.root({ density }), className)}>
        {emptyState ?? (
          <div className={s.emptyState()}>
            <Inbox className="size-icon-md opacity-70" aria-hidden />
            <span>Nada por aqui ainda.</span>
          </div>
        )}
      </div>
    );
  }

  /* ── layout ────────────────────────────────────────────────── */
  const layoutEl =
    layout === "grouped" ? (
      <GroupedLayout
        buckets={groupItems(items, groups ?? [])}
        density={density}
        enableDnD={dndEnabled}
        activeItemId={dnd.activeItemId}
        overGroupId={dnd.overGroupId}
        overItemId={dnd.overItemId}
        openGroups={expanded}
        onToggleGroup={toggleExpand}
        selectable={selectable}
        selectedIds={selected}
        openId={openId}
        onToggleSelect={toggleSelect}
        onItemClick={onItemClick}
        renderItem={renderItem}
        getMenuItems={getMenuItems}
      />
    ) : layout === "hierarchical" ? (
      <HierarchicalLayout
        items={items}
        density={density}
        expanded={expanded}
        onToggleExpand={toggleExpand}
        showConnectors={showConnectors}
        indentSize={indentSize}
        selectable={selectable}
        selectedIds={selected}
        openId={openId}
        onToggleSelect={toggleSelect}
        onItemClick={onItemClick}
        renderItem={renderItem}
        getMenuItems={getMenuItems}
      />
    ) : (
      <StandardLayout
        items={items}
        groupId={STANDARD_GROUP_ID}
        density={density}
        enableDnD={dndEnabled}
        activeItemId={dnd.activeItemId}
        overGroupId={dnd.overGroupId}
        overItemId={dnd.overItemId}
        selectable={selectable}
        selectedIds={selected}
        openId={openId}
        onToggleSelect={toggleSelect}
        onItemClick={onItemClick}
        renderItem={renderItem}
        getMenuItems={getMenuItems}
      />
    );

  if (!dndEnabled) {
    return <div className={cn("w-full", className)}>{layoutEl}</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      <DndContext
        sensors={dnd.sensors}
        collisionDetection={closestCorners}
        onDragStart={dnd.handleDragStart}
        onDragOver={dnd.handleDragOver}
        onDragEnd={dnd.handleDragEnd}
        onDragCancel={dnd.handleDragCancel}
      >
        {layoutEl}
        <DragOverlay dropAnimation={null}>
          {activeItem && (
            <ListItem
              item={activeItem}
              state={{ selected: false, open: false, dragging: false, depth: 0 }}
              density={density}
              renderItem={renderItem}
              getMenuItems={getMenuItems}
              className="rotate-1 shadow-sh-lg"
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
