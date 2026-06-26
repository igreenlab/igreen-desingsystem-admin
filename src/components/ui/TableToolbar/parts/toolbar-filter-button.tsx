import { Filter } from "lucide-react";
import { ToolbarToolButton } from "./toolbar-tool-button";

export type ToolbarFilterButtonProps = {
  /** Borda+texto em brand (há filtros aplicados). */
  isActive?: boolean;
  /** Dot indicator no canto (há filtros aplicados). */
  hasIndicator?: boolean;
  onClick?: () => void;
  /** Override do rótulo acessível. Default "Filtros". */
  ariaLabel?: string;
};

/**
 * ToolbarFilterButton — botão de Filtros PADRÃO (funil, icon-only).
 *
 * Fonte única pro botão de filtro simples do `DataTable` e do `DataList`, pra o
 * ícone/affordance virem do componente (sem cada consumer escolher o ícone e
 * divergir). Abre o drawer/popover de filtro via `onClick`.
 */
export function ToolbarFilterButton({
  isActive,
  hasIndicator,
  onClick,
  ariaLabel = "Filtros",
}: ToolbarFilterButtonProps) {
  return (
    <ToolbarToolButton
      icon={<Filter />}
      aria-label={ariaLabel}
      title={ariaLabel}
      isActive={isActive}
      hasIndicator={hasIndicator}
      onClick={onClick}
    />
  );
}
