import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, MoreHorizontal, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  TableToolbar,
  ToolbarSearch,
  ToolbarToolButton,
  ToolbarSimpleFilterDrawer,
} from "@/components/ui/TableToolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import type { FilterModel } from "@/components/ui/DataTable/data-table.types";
import type { FilterPopoverColumn } from "@/components/ui/TableToolbar";
import type { DataListView, FilterableField } from "../data-list.types";
import type { ListMenuItem } from "@/components/ui/List";

type Props = {
  title?: ReactNode;
  count?: number;
  views: DataListView[];
  activeViewId: string | null;
  onApplyView: (v: DataListView | null) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  search: string;
  onSearch: (s: string) => void;
  filterFields?: FilterableField[];
  filterModel: FilterModel;
  onFilterModelChange: (m: FilterModel) => void;
  onRefresh?: () => void;
  moreActions?: ListMenuItem[];
  loading?: boolean;
};

/** Mapeia campos filtráveis → colunas do drawer da TableToolbar. */
function toColumns(fields: FilterableField[]): FilterPopoverColumn[] {
  return fields.map((f) => ({
    key: f.id,
    label: f.label,
    filterType: f.type,
    type: f.type === "select" ? "select" : f.type === "number" ? "number" : "text",
    options: f.options,
  }));
}

/**
 * Toolbar do DataList — reusa o `<TableToolbar>` (dumb, slot-based) passando só
 * os slots necessários (savedViews/título · refresh · search · filtro→drawer ·
 * ⋯). SEM viewToggle e SEM settings/colunas. O filtro é o MESMO drawer da tabela.
 */
export function DataListToolbar({
  title,
  count,
  views,
  activeViewId,
  onApplyView,
  searchable,
  searchPlaceholder,
  search,
  onSearch,
  filterFields,
  filterModel,
  onFilterModelChange,
  onRefresh,
  moreActions,
  loading,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeView = views.find((v) => v.id === activeViewId) ?? null;
  const columns = useMemo(() => toColumns(filterFields ?? []), [filterFields]);
  const filterCount = useMemo(
    () =>
      filterModel.items.filter(
        (i) =>
          i.operator === "isEmpty" ||
          i.operator === "isNotEmpty" ||
          (i.value != null && i.value !== "" && !(Array.isArray(i.value) && i.value.length === 0)),
      ).length,
    [filterModel],
  );

  const savedViewsSlot =
    views.length > 0 ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" color="secondary" size="sm" iconRight={<ChevronDown />}>
            {activeView?.label ?? title ?? "Todos"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4}>
          <DropdownMenuItem onSelect={() => onApplyView(null)}>Todos</DropdownMenuItem>
          <DropdownMenuSeparator />
          {views.map((v) => (
            <DropdownMenuItem key={v.id} onSelect={() => onApplyView(v)}>
              {v.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : title ? (
      <h2 className="text-title-md font-semibold text-fg-default">
        {title}
        {typeof count === "number" && (
          <span className="ml-gp-sm text-body-sm font-normal text-fg-muted">{count}</span>
        )}
      </h2>
    ) : undefined;

  return (
    <>
      <TableToolbar
        savedViews={savedViewsSlot}
        refresh={
          onRefresh ? (
            <ToolbarToolButton
              icon={<RefreshCw className={loading ? "animate-spin" : undefined} />}
              aria-label="Atualizar"
              title="Atualizar"
              onClick={onRefresh}
            />
          ) : undefined
        }
        search={
          searchable ? (
            <ToolbarSearch
              value={search}
              placeholder={searchPlaceholder ?? "Buscar..."}
              onChange={(e) => onSearch(e.target.value)}
            />
          ) : undefined
        }
        filter={
          filterFields && filterFields.length > 0 ? (
            <ToolbarToolButton
              icon={<SlidersHorizontal />}
              label="Filtros"
              isActive={filterCount > 0}
              hasIndicator={filterCount > 0}
              onClick={() => setDrawerOpen(true)}
            />
          ) : undefined
        }
        more={
          moreActions && moreActions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarToolButton icon={<MoreHorizontal />} aria-label="Mais ações" title="Mais ações" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                {moreActions.map((a, i) =>
                  a.separator ? (
                    <DropdownMenuSeparator key={`s${i}`} />
                  ) : (
                    <DropdownMenuItem
                      key={a.label?.toString() ?? i}
                      variant={a.destructive ? "destructive" : "default"}
                      disabled={a.disabled}
                      onSelect={() => a.onClick?.()}
                    >
                      {a.icon}
                      {a.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined
        }
      />

      {filterFields && filterFields.length > 0 && (
        <ToolbarSimpleFilterDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          columns={columns}
          filterModel={filterModel}
          onFilterModelChange={onFilterModelChange}
        />
      )}
    </>
  );
}
