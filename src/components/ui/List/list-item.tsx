import { Fragment, type MouseEvent, type ReactNode } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { listStyles, type ListStyleVariants } from "./list.styles";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "./list.types";

type ListItemProps = {
  item: ListItemData;
  state: ListRenderState;
  density: NonNullable<ListStyleVariants["density"]>;

  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
  onClick?: (id: string) => void;

  /* seleção */
  selectable?: boolean;
  onToggleSelect?: (id: string) => void;

  /* hierarquia — toggle de expandir renderizado à esquerda */
  expandToggle?: ReactNode;

  /* dnd (vindo do layout) */
  setNodeRef?: (node: HTMLElement | null) => void;
  attributes?: DraggableAttributes;
  handleListeners?: DraggableSyntheticListeners;
  showHandle?: boolean;

  className?: string;
};

/**
 * <ListItem> — card (row) do List. Wrapper sempre controlado pelo componente
 * (estados selected/open/dragging, checkbox, handle, menu). O miolo é o layout
 * default por slots OU `renderItem` (override). Não use direto pra montar a
 * lista — é renderizado pelos layouts do `<List>`.
 */
export function ListItem({
  item,
  state,
  density,
  renderItem,
  getMenuItems,
  onClick,
  selectable,
  onToggleSelect,
  expandToggle,
  setNodeRef,
  attributes,
  handleListeners,
  showHandle,
  className,
}: ListItemProps) {
  const s = listStyles({
    density,
    selected: state.selected,
    open: state.open,
    dragging: state.dragging,
    clickable: Boolean(onClick),
  });

  const menuItems = getMenuItems?.(item) ?? [];
  const stop = (e: MouseEvent) => e.stopPropagation();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (
      (e.target as HTMLElement).closest(
        'button, a, input, label, [role="menu"], [role="menuitem"], [data-slot="list-actions"]',
      )
    ) {
      return;
    }
    onClick(item.id);
  };

  return (
    <div
      ref={setNodeRef}
      role="article"
      aria-selected={state.selected || undefined}
      className={cn(s.item(), className)}
      onClick={onClick ? handleClick : undefined}
      {...attributes}
    >
      {showHandle && (
        <span
          className={s.handle()}
          aria-label="Arrastar"
          {...handleListeners}
          onClick={stop}
        >
          <GripVertical />
        </span>
      )}

      {selectable && (
        <span className={s.checkbox()} onClick={stop} onPointerDown={stop}>
          <Checkbox
            checked={state.selected}
            onCheckedChange={() => onToggleSelect?.(item.id)}
            aria-label="Selecionar item"
          />
        </span>
      )}

      {expandToggle}

      {renderItem ? (
        <Fragment>{renderItem(item, state)}</Fragment>
      ) : (
        <Fragment>
          {item.leading && <span className={s.leading()}>{item.leading}</span>}

          <div className={s.content()}>
            <div className={s.title()}>{item.title}</div>
            {item.subtitle && <div className={s.subtitle()}>{item.subtitle}</div>}
            {item.description && (
              <div className={s.description()}>{item.description}</div>
            )}
          </div>

          {item.meta && item.meta.length > 0 && (
            <div className={s.metaRow()}>
              {item.meta.map((m, i) => (
                <div
                  key={i}
                  className={cn(s.metaCol(), m.align === "end" && "items-end text-right")}
                >
                  <span className={s.metaLabel()}>{m.label}</span>
                  <span className={s.metaValue()}>{m.value}</span>
                </div>
              ))}
            </div>
          )}

          {item.trailing && <div className={s.trailing()}>{item.trailing}</div>}
        </Fragment>
      )}

      {menuItems.length > 0 && (
        <div className={s.actions()} data-slot="list-actions" onClick={stop} onPointerDown={stop}>
          <ListAutoMenu items={menuItems} />
        </div>
      )}
    </div>
  );
}

function ListAutoMenu({ items }: { items: ListMenuItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" color="secondary" size="icon-2xs" aria-label="Ações" title="Ações">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {items.map((item, idx) =>
          item.separator ? (
            <DropdownMenuSeparator key={`sep-${idx}`} />
          ) : (
            <DropdownMenuItem
              key={item.label?.toString() ?? idx}
              variant={item.destructive ? "destructive" : "default"}
              disabled={item.disabled}
              onSelect={() => item.onClick?.()}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
