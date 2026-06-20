import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { List, type ListItemData } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { useDataList } from "./hooks/use-data-list";
import { DataListToolbar } from "./parts/data-list-toolbar";
import { DataListVirtualized } from "./parts/data-list-virtualized";
import { DataListInfinite } from "./parts/data-list-infinite";
import type { DataListProps } from "./data-list.types";

/** Injeta filhos carregados (lazy) nos nós correspondentes da árvore. */
function mergeLoaded(
  items: ListItemData[],
  loaded: Record<string, ListItemData[]>,
): ListItemData[] {
  if (Object.keys(loaded).length === 0) return items;
  return items.map((it) => {
    const children = loaded[it.id] ?? it.children;
    const mergedChildren = children ? mergeLoaded(children, loaded) : undefined;
    return mergedChildren ? { ...it, children: mergedChildren } : it;
  });
}

/**
 * <DataList> — componente inteligente sobre o `List` (como `DataTable` é sobre o
 * `Table`). Toolbar enxuta (views/título · refresh · search · filtro · ⋯),
 * busca + filtros por campos, saved-views, persistência, seleção/bulk, server/
 * async, virtualização (standard) e lazy-load de filhos.
 */
export function DataList(props: DataListProps) {
  const {
    items,
    layout = "standard",
    groups,
    renderItem,
    getMenuItems,
    onItemClick,
    openId,
    groupSurface,
    density = "comfortable",
    title,
    searchable,
    searchPlaceholder,
    filterFields,
    views,
    onRefresh,
    moreActions,
    mode = "client",
    loading,
    total,
    onQueryChange,
    onLoadMore,
    hasMore,
    loadingMore,
    virtualized,
    estimateItemSize = 76,
    onLoadChildren,
    selectable,
    onSelectionChange,
    bulkActions,
    enableDnD,
    onReorder,
    onMove,
    persistKey,
    className,
    emptyState,
  } = props;

  const [loaded, setLoaded] = useState<Record<string, ListItemData[]>>({});
  const baseItems = useMemo(() => mergeLoaded(items, loaded), [items, loaded]);

  const ctrl = useDataList({
    items: baseItems,
    mode,
    filterFields,
    views,
    persistKey,
    onQueryChange,
    onSelectionChange,
  });

  // lazy-load: ao expandir um nó novo, busca filhos (uma vez) e injeta
  const handleExpandedChange = useCallback(
    (next: Set<string>) => {
      const added = [...next].find((id) => !ctrl.expanded.has(id));
      ctrl.setExpanded(next);
      if (added && onLoadChildren && !loaded[added]) {
        onLoadChildren(added).then((children) =>
          setLoaded((p) => ({ ...p, [added]: children })),
        );
      }
    },
    [ctrl, onLoadChildren, loaded],
  );

  // virtualização e DnD são mutuamente exclusivos (rbd exige tudo montado)
  const useVirtual = Boolean(virtualized) && layout === "standard";
  const dndEnabled = Boolean(enableDnD) && !useVirtual;
  if (virtualized && enableDnD && import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn("[DataList] virtualized + enableDnD: DnD desligado (incompatível com virtualização).");
  }

  const count = mode === "server" ? total : ctrl.processedItems.length;

  const body = useVirtual ? (
    <DataListVirtualized
      items={ctrl.processedItems}
      density={density}
      estimateItemSize={estimateItemSize}
      selectable={selectable}
      selectedIds={ctrl.selected}
      openId={openId}
      onToggleSelect={ctrl.toggleSelect}
      onItemClick={onItemClick}
      renderItem={renderItem}
      getMenuItems={getMenuItems}
    />
  ) : (
    <List
      layout={layout}
      items={ctrl.processedItems}
      groups={groups}
      renderItem={renderItem}
      getMenuItems={getMenuItems}
      onItemClick={onItemClick}
      openId={openId}
      groupSurface={groupSurface}
      density={density}
      selectable={selectable}
      selectedIds={ctrl.selected}
      onSelectionChange={ctrl.replaceSelection}
      expandedIds={ctrl.expanded}
      onExpandedChange={handleExpandedChange}
      enableDnD={dndEnabled}
      onReorder={onReorder}
      onMove={onMove}
      loading={loading}
      emptyState={emptyState}
    />
  );

  const selCount = ctrl.selected.size;

  return (
    <div className={cn("flex flex-col gap-gp-lg", className)}>
      <DataListToolbar
        title={title}
        count={count}
        views={ctrl.views}
        activeViewId={ctrl.activeViewId}
        onApplyView={ctrl.applyView}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        search={ctrl.query.search}
        onSearch={ctrl.setSearch}
        filterFields={filterFields}
        filterModel={ctrl.query.filterModel}
        onFilterModelChange={ctrl.setFilterModel}
        onRefresh={onRefresh}
        moreActions={moreActions}
        loading={loading}
      />

      {selectable && selCount > 0 && bulkActions && bulkActions.length > 0 && (
        <div className="flex items-center gap-gp-md rounded-radius-lg border border-border-brand-subtle bg-bg-brand-subtle px-pad-xl py-pad-md">
          <span className="text-body-sm font-medium text-fg-default">{selCount} selecionado(s)</span>
          <div className="ml-auto flex items-center gap-gp-sm">
            {bulkActions.map((a, i) => (
              <Button
                key={i}
                size="sm"
                variant={a.destructive ? "soft" : "soft"}
                color={a.destructive ? "critical" : "secondary"}
                iconLeft={a.icon}
                onClick={() => a.onClick(ctrl.selected)}
              >
                {a.label}
              </Button>
            ))}
            <Button size="sm" variant="ghost" color="secondary" onClick={ctrl.clearSelection}>
              Limpar
            </Button>
          </div>
        </div>
      )}

      {body}

      {onLoadMore && !useVirtual && (
        <DataListInfinite
          onLoadMore={onLoadMore}
          hasMore={Boolean(hasMore)}
          loading={Boolean(loadingMore)}
        />
      )}
    </div>
  );
}
