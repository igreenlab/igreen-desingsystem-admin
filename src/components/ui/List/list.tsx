import { useCallback, useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { listStyles } from "./list.styles";
import { StandardLayout } from "./layouts/standard-layout";
import { GroupedLayout } from "./layouts/grouped-layout";
import { HierarchicalLayout } from "./layouts/hierarchical-layout";
import { useSelectionSet } from "./hooks/use-selection-set";
import { useDisclosureSet } from "./hooks/use-disclosure-set";
import { groupItems } from "./utils/group-items";
import type { ListProps } from "./list.types";

const STANDARD_DROPPABLE_ID = "list-standard";

/**
 * <List> — primitivo de listagem em cards (como `Table` é o primitivo de tabela).
 * Burro: recebe dados + estado de UI (controlado/não-controlado) e emite callbacks.
 * Sem busca/filtro/sort/server/toolbar — isso é o `DataList` (passo 2).
 *
 * Layouts: `standard` (lista plana) · `grouped` (seções + DnD) · `hierarchical`
 * (árvore-como-lista colapsável com conectores). Card via slots ou `renderItem`.
 *
 * DnD via @hello-pangea/dnd (física natural de lista: displacement suave dos
 * irmãos + placeholder que abre espaço). Burro: emite `onMove`/`onReorder`,
 * o consumer commita o estado.
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
  groupSurface,
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

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }
      if (layout === "grouped") {
        onMove?.(draggableId, source.droppableId, destination.droppableId, destination.index);
      } else {
        onReorder?.(draggableId, destination.index);
      }
    },
    [layout, onMove, onReorder],
  );

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
        groupSurface={groupSurface}
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
        droppableId={STANDARD_DROPPABLE_ID}
        density={density}
        enableDnD={dndEnabled}
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
      <DragDropContext onDragEnd={handleDragEnd}>{layoutEl}</DragDropContext>
    </div>
  );
}
