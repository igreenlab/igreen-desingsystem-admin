import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Metadados de hierarquia da row, propagados do `buildTreeRows` até a cell da
 * coluna primária. Bundle estável (objeto novo só quando muda) pra não invalidar
 * o memo da row sem necessidade.
 */
export type DataTableTreeMeta = {
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  descendantCount: number;
  childCount: number;
};

export type DataTableTreeToggleProps = {
  meta: DataTableTreeMeta;
  /** Conteúdo original da cell (label da coluna primária). */
  children: ReactNode;
  /** Mostra "(N)" descendentes ao lado do label. */
  showDescendantCount?: boolean;
  /** Toggle expand/collapse do nó. */
  onToggle: () => void;
};

/**
 * Prefixo de tree-data na coluna primária: indentação por nível + chevron
 * (quando o nó tem filhos) + label + contagem opcional de descendentes.
 *
 * Indentação: `calc(var(--spacing-pad-2xl) * level)` — usa o token DS
 * `pad-2xl` (16px) como unidade por nível, multiplicado inline. Sem hardcode de
 * px (a unidade é o CSS var do token; o multiplicador é o nível, um número).
 *
 * Nós-folha (sem filhos) reservam o mesmo espaço do chevron (`size-icon-sm`)
 * pra que os labels alinhem verticalmente independente de ter ou não chevron.
 */
export function DataTableTreeToggle({
  meta,
  children,
  showDescendantCount = false,
  onToggle,
}: DataTableTreeToggleProps) {
  const { level, hasChildren, isExpanded, descendantCount } = meta;

  return (
    <span
      className="flex items-center gap-gp-xs w-full min-w-0"
      style={{
        // Unidade = token DS pad-2xl (16px) via CSS var; multiplicador = nível.
        paddingLeft: `calc(var(--spacing-pad-2xl) * ${level})`,
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-label={isExpanded ? "Recolher" : "Expandir"}
          aria-expanded={isExpanded}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "shrink-0 flex items-center justify-center",
            "size-icon-md rounded-radius-sm",
            "text-fg-muted hover:text-fg-strong hover:bg-bg-muted",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
          )}
        >
          <ChevronRight
            className={cn(
              "size-icon-sm transition-transform duration-150",
              isExpanded && "rotate-90",
            )}
            aria-hidden
          />
        </button>
      ) : (
        // Espaçador do tamanho do botão do chevron — mantém labels alinhados.
        <span className="shrink-0 size-icon-md" aria-hidden />
      )}
      <span className="flex-1 min-w-0 truncate">{children}</span>
      {showDescendantCount && descendantCount > 0 && (
        <span className="shrink-0 text-fg-muted tabular-nums text-body-xs">
          ({descendantCount})
        </span>
      )}
    </span>
  );
}
