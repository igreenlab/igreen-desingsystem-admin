import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

export type MoreMenuProps = {
  /** Botão que dispara o menu (geralmente `<ToolbarToolButton icon={<MoreHorizontal />}>`) */
  trigger: ReactNode;
  /** Itens do menu — use `MoreMenuItem`, `MoreMenuCheckboxItem`, `MoreMenuSeparator`. */
  children: ReactNode;
  /** Estado controlado (opcional — auto-gerencia se omitido). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Alinhamento do menu em relação ao trigger. Default `"end"` (alinha à direita). */
  align?: "start" | "center" | "end";
  /** Espaço entre trigger e menu (px). Default 6. */
  sideOffset?: number;
  /** className extra no DropdownMenuContent (caso queira ajustar min-width). */
  className?: string;
};

/**
 * MoreMenu — popover de "..." (mais ações) da TableToolbar.
 *
 * Wrapper fino do `<DropdownMenu>` do shadcn com defaults pra contexto de
 * toolbar (`align="end"`, `sideOffset=6`). Pra customizar items use os aliases:
 *
 *   <MoreMenu trigger={<ToolbarToolButton ... />}>
 *     <MoreMenuItem onSelect={...}>
 *       <Grid3x3 />
 *       Mostrar bordas entre colunas
 *     </MoreMenuItem>
 *     <MoreMenuItem onSelect={...}>
 *       <Maximize2 />
 *       Tela cheia
 *     </MoreMenuItem>
 *     <MoreMenuSeparator />
 *     <MoreMenuItem variant="destructive" onSelect={...}>
 *       <Trash2 />
 *       Resetar visualização
 *     </MoreMenuItem>
 *   </MoreMenu>
 *
 * Aliases re-exportam os primitives equivalentes do DropdownMenu:
 *   - `MoreMenuItem`            → `DropdownMenuItem`            (com variant?: "default" | "destructive")
 *   - `MoreMenuCheckboxItem`    → `DropdownMenuCheckboxItem`    (toggle com check)
 *   - `MoreMenuRadioGroup` + `MoreMenuRadioItem` → escolha única
 *   - `MoreMenuSeparator`       → `DropdownMenuSeparator`       (1px divider)
 *   - `MoreMenuLabel`           → `DropdownMenuLabel`           (heading discreto)
 */
export function MoreMenu({
  trigger,
  children,
  open,
  onOpenChange,
  align = "end",
  sideOffset = 6,
  className,
}: MoreMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={className}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Aliases — items prontos pro MoreMenu ──────────────────────────── */
export {
  DropdownMenuItem as MoreMenuItem,
  DropdownMenuCheckboxItem as MoreMenuCheckboxItem,
  DropdownMenuRadioGroup as MoreMenuRadioGroup,
  DropdownMenuRadioItem as MoreMenuRadioItem,
  DropdownMenuSeparator as MoreMenuSeparator,
  DropdownMenuLabel as MoreMenuLabel,
};
