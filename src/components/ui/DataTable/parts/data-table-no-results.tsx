import type { ReactNode } from "react";
import { SearchX, FilterX } from "lucide-react";
import { Button } from "../../Button/button";

export type DataTableNoResultsProps = {
  /** Icone na ilustracao. Default: SearchX. */
  icon?: ReactNode;
  /** Titulo principal. Default: "Nenhum dado encontrado". */
  title?: string;
  /** Descricao secundaria. */
  description?: string;
  /** Acao primaria customizada — substitui o botao "Limpar filtros" default. */
  action?: ReactNode;
  /** Callback que limpa filtros — quando definido SEM `action`, renderiza
   *  botao default "Limpar filtros". DataTable auto-wira isso pra
   *  filters.clearFilters / search.flush. */
  onClearFilters?: () => void;
};

/**
 * Estado "nada encontrado com filtros aplicados". Diferente de Empty
 * (dataset vazio em absoluto). Sugere ajustar/limpar filtros.
 *
 * Auto-wire: DataTable passa `onClearFilters` que limpa filterModel + search.
 * Consumer pode customizar via props ou substituir 100% via `props.renderNoResults`.
 */
export function DataTableNoResults({
  icon = <SearchX aria-hidden />,
  title = "Nenhum dado encontrado",
  description = "Não encontramos nada com os critérios pesquisados. Tente ajustar os filtros.",
  action,
  onClearFilters,
}: DataTableNoResultsProps = {}) {
  // Render default action quando onClearFilters definido E action nao customizado
  const resolvedAction =
    action ??
    (onClearFilters ? (
      <Button
        size="sm"
        variant="outline"
        color="secondary"
        iconLeft={<FilterX />}
        onClick={onClearFilters}
      >
        Limpar filtros
      </Button>
    ) : null);

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-gp-lg p-pad-4xl text-center">
      <div
        className="flex items-center justify-center size-[80px] rounded-full bg-bg-muted [&_svg]:size-icon-2xl [&_svg]:text-fg-muted"
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex flex-col gap-gp-2xs items-center">
        <p className="text-title-md text-fg-strong">{title}</p>
        <p className="text-body-md text-fg-muted max-w-[360px]">
          {description}
        </p>
      </div>
      {resolvedAction && <div className="mt-pad-md">{resolvedAction}</div>}
    </div>
  );
}
