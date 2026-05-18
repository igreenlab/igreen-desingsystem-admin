import { MoreHorizontal } from "lucide-react";
import { Button } from "../../Button/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../shadcn/dropdown-menu";
import type { DataTableActionItem } from "../data-table.types";

export type DataTableActionsCellProps<T> = {
  /** Row da linha — passado pra disabled/hidden/onClick. */
  row: T;
  /** Lista de actions resolvida pra esta row. */
  actions: DataTableActionItem<T>[];
};

/**
 * Celula da coluna `type: "actions"` — renderiza icone-buttons inline
 * (items com `showInMenu` false ou undefined) e/ou dropdown 3-pontos
 * (items com `showInMenu: true`).
 *
 * Items com `hidden(row) === true` somem completamente. Items com
 * `disabled(row) === true` ficam atenuados e sem click.
 *
 * Stopa propagacao no click do botao/menu pra nao disparar `onRowClick`
 * do TableRow ancestral.
 */
export function DataTableActionsCell<T>({
  row,
  actions,
}: DataTableActionsCellProps<T>) {
  // Resolve hidden por row e separa inline vs menu
  const visible = actions.filter((a) => {
    if (typeof a.hidden === "function") return !a.hidden(row);
    return !a.hidden;
  });
  const inlineActions = visible.filter((a) => !a.showInMenu);
  const menuActions = visible.filter((a) => a.showInMenu);

  if (visible.length === 0) return null;

  const resolveDisabled = (a: DataTableActionItem<T>): boolean => {
    if (typeof a.disabled === "function") return a.disabled(row);
    return !!a.disabled;
  };

  return (
    <div className="flex items-center gap-gp-2xs justify-end w-full">
      {/* Icones inline */}
      {inlineActions.map((a) => (
        <Button
          key={a.id}
          size="icon-2xs"
          variant="ghost"
          color={a.destructive ? "critical" : "secondary"}
          aria-label={a.label}
          title={a.label}
          disabled={resolveDisabled(a)}
          onClick={(e) => {
            e.stopPropagation();
            a.onClick(row);
          }}
        >
          {a.icon}
        </Button>
      ))}

      {/* Dropdown 3-pontos com items showInMenu */}
      {menuActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-2xs"
              variant="ghost"
              color="secondary"
              aria-label="Mais acoes"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            {menuActions.map((a) => (
              <DropdownMenuItem
                key={a.id}
                onClick={() => a.onClick(row)}
                disabled={resolveDisabled(a)}
                variant={a.destructive ? "destructive" : "default"}
              >
                {a.icon}
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
