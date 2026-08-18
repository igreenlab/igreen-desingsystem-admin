import { MoreHorizontal } from "lucide-react";
import { Button } from "../../Button/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import type { DataTableActionItem } from "../data-table.types";
import { splitActionSlots } from "../utils/action-slots";

export type DataTableActionsCellProps<T> = {
  /** Row da linha — passado pra disabled/hidden/onClick. */
  row: T;
  /** Lista de actions resolvida pra esta row. */
  actions: DataTableActionItem<T>[];
};

/**
 * Celula da coluna `type: "actions"` — renderiza icone-buttons inline e/ou o
 * dropdown "…". Quem decide o split é `splitActionSlots` (ver `utils/action-slots.ts`
 * pra a regra e a geometria que a justifica):
 *
 *   - algum item com `showInMenu` → o split do consumer manda, sem limite;
 *   - até 3 itens, nenhum marcado → todos inline, sem "…";
 *   - mais de 3, nenhum marcado → todos no "…" (4 ícones não cabem na coluna).
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
  // Split vem do módulo compartilhado — o `calculate-column-widths` chama o MESMO
  // para dimensionar a coluna. Duas cópias da regra divergiriam no primeiro ajuste
  // e a coluna passaria a reservar espaço pra um layout diferente do renderizado.
  const { inline: inlineActions, menu: menuActions } = splitActionSlots(actions, row);

  if (inlineActions.length === 0 && menuActions.length === 0) return null;

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
