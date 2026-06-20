import type { ReactNode } from "react";
import { ChevronDown, MoreHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ToolbarSearch } from "@/components/ui/TableToolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { DataListFilterPopover } from "./data-list-filter-popover";
import type {
  ActiveFilter,
  DataListView,
  FilterableField,
} from "../data-list.types";
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
  filters: ActiveFilter[];
  onFilters: (f: ActiveFilter[]) => void;
  onRefresh?: () => void;
  moreActions?: ListMenuItem[];
  loading?: boolean;
};

/** Toolbar enxuta do DataList — sem viewToggle e sem menu de configurações. */
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
  filters,
  onFilters,
  onRefresh,
  moreActions,
  loading,
}: Props) {
  const activeView = views.find((v) => v.id === activeViewId) ?? null;

  return (
    <div className="flex items-center gap-gp-md">
      {/* esquerda: Visões (se houver) ou título */}
      {views.length > 0 ? (
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
      ) : (
        title && (
          <h2 className="text-title-md font-semibold text-fg-default">
            {title}
            {typeof count === "number" && (
              <span className="ml-gp-sm text-body-sm font-normal text-fg-muted">{count}</span>
            )}
          </h2>
        )
      )}

      {/* direita */}
      <div className="ml-auto flex items-center gap-gp-sm">
        {onRefresh && (
          <Button
            variant="outline"
            color="secondary"
            size="icon-sm"
            aria-label="Atualizar"
            title="Atualizar"
            onClick={onRefresh}
          >
            <RefreshCw className={loading ? "animate-spin" : undefined} />
          </Button>
        )}
        {searchable && (
          <ToolbarSearch
            value={search}
            placeholder={searchPlaceholder ?? "Buscar..."}
            onChange={(e) => onSearch(e.target.value)}
          />
        )}
        {filterFields && filterFields.length > 0 && (
          <DataListFilterPopover fields={filterFields} value={filters} onChange={onFilters} />
        )}
        {moreActions && moreActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" color="secondary" size="icon-sm" aria-label="Mais ações" title="Mais ações">
                <MoreHorizontal />
              </Button>
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
        )}
      </div>
    </div>
  );
}
