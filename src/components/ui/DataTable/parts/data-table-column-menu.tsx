import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowDown,
  PinIcon,
  PinOff,
  EyeOff,
  MoreHorizontal,
  X as XIcon,
} from "lucide-react";
import { Button } from "../../Button/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/shadcn/dropdown-menu";

export type DataTableColumnMenuItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export type DataTableColumnMenuProps = {
  /** Nome da coluna (usado no aria-label). */
  columnName: string;
  /** Direção atual do sort (null = sem sort). */
  sortDirection: "asc" | "desc" | null;
  /** Pin atual (null = sem pin). */
  pinned: "left" | "right" | null;
  /** Pode esconder essa coluna? Default true. */
  canHide?: boolean;
  /** Handlers — null disabled */
  onSortAsc?: () => void;
  onSortDesc?: () => void;
  onSortClear?: () => void;
  onPinLeft?: () => void;
  onPinRight?: () => void;
  onUnpin?: () => void;
  onHide?: () => void;
  /** Items extras (slot pro consumer adicionar). */
  extraItems?: DataTableColumnMenuItem[];
};

/**
 * Menu 3-pontos no header de cada coluna do DataTable.
 * Acoes: Sort asc/desc/clear, Pin left/right/unpin, Hide column, extras.
 */
export function DataTableColumnMenu({
  columnName,
  sortDirection,
  pinned,
  canHide = true,
  onSortAsc,
  onSortDesc,
  onSortClear,
  onPinLeft,
  onPinRight,
  onUnpin,
  onHide,
  extraItems,
}: DataTableColumnMenuProps) {
  // Controlled open + keepMounted: mantem o botão visível durante a animação
  // de fechamento do portal (~200ms). Sem isso, o seletor :has([data-state=open])
  // do wrapper headMenuItem perde o match assim que Radix muda pra "closed", o
  // botao some e o portal animando pisca em (0,0) por ter perdido a âncora.
  const [open, setOpen] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setKeepMounted(true);
      return;
    }
    if (!keepMounted) return;
    const t = setTimeout(() => setKeepMounted(false), 200);
    return () => clearTimeout(t);
  }, [open, keepMounted]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-2xs"
          variant="ghost"
          color="secondary"
          aria-label={`Menu da coluna ${columnName}`}
          // data-menu-active fica true durante toda a vida do menu (abrindo,
          // aberto e janela de close animation). Wrapper headMenuItem usa
          // :has([data-menu-active=true]) pra continuar visivel.
          data-menu-active={keepMounted || undefined}
          // Interrompe propagacao em TODOS os eventos relevantes pra evitar
          // que o header sortable dispare handleSort enquanto o menu abre
          // (re-render durante anchor calculation faz o portal teleportar).
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {/* Sort */}
        <DropdownMenuItem
          onClick={onSortAsc}
          disabled={sortDirection === "asc"}
        >
          <ArrowUp className="size-icon-xs" />
          Ordenar crescente
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSortDesc}
          disabled={sortDirection === "desc"}
        >
          <ArrowDown className="size-icon-xs" />
          Ordenar decrescente
        </DropdownMenuItem>
        {sortDirection !== null && (
          <DropdownMenuItem onClick={onSortClear}>
            <XIcon className="size-icon-xs" />
            Limpar ordenação
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Pin */}
        {pinned !== "left" && (
          <DropdownMenuItem onClick={onPinLeft}>
            <PinIcon className="size-icon-xs" />
            Fixar à esquerda
          </DropdownMenuItem>
        )}
        {pinned !== "right" && (
          <DropdownMenuItem onClick={onPinRight}>
            <PinIcon className="size-icon-xs" />
            Fixar à direita
          </DropdownMenuItem>
        )}
        {pinned !== null && (
          <DropdownMenuItem onClick={onUnpin}>
            <PinOff className="size-icon-xs" />
            Remover fixação
          </DropdownMenuItem>
        )}

        {canHide && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onHide}>
              <EyeOff className="size-icon-xs" />
              Ocultar coluna
            </DropdownMenuItem>
          </>
        )}

        {extraItems && extraItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {extraItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={item.onSelect}
                disabled={item.disabled}
                variant={item.destructive ? "destructive" : "default"}
              >
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
