import type { ReactNode } from "react";
import { CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toolbarApplied,
  toolbarAppliedChip,
  toolbarAppliedChipName,
  toolbarAppliedChipOp,
  toolbarAppliedChipRemove,
  toolbarAppliedChipValue,
  toolbarAppliedClearLink,
} from "../table-toolbar.styles";
import type { AppliedFilter, AppliedFilterOp } from "../table-toolbar.types";

/** Helper exportado pra renderizar um valor como tag estilizada — uso em renderChip custom. */
export const toolbarAppliedTagClass = toolbarAppliedChipValue;

export type ToolbarAppliedProps = {
  filters: AppliedFilter[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  /** Label do link "Limpar todos". Default "Limpar todos". Passe `null` pra esconder. */
  clearLabel?: React.ReactNode | null;
  /** Mapa operador → símbolo exibido (ex: { eq: "=", contains: "contém" }) */
  opLabels?: Partial<Record<string, string>>;
  /**
   * Render custom do chip — recebe o chip default (`<span>` com a estrutura
   * padrao) e permite envolver (ex: com PopoverTrigger). Use pra adicionar
   * comportamento (click reabre edicao) mantendo o layout visual.
   *
   * 2º param `isPendingOpen` informa se este chip está marcado como
   * "abrir popover automaticamente" via `pendingOpenId` — consumer usa pra
   * controlar `open={isPendingOpen}` do Popover wrapper.
   */
  renderChip?: (
    filter: AppliedFilter,
    defaultChip: ReactNode,
    isPendingOpen: boolean,
  ) => ReactNode;
  /**
   * Mostra separator (margem-topo + border) entre o toolbar header e os chips.
   * Default `true` (uso standalone). Setar `false` quando ja ha gap externo
   * (ex: dentro do DataTable que controla espacamento via wrapper).
   */
  separator?: boolean;
  /**
   * ID de chip que deve abrir popover automaticamente (controlled).
   * Quando definido, `renderChip` recebe `isPendingOpen=true` pro chip
   * com `filter.id === pendingOpenId`. Pattern usado pra "filter shortcut"
   * do header — clicar ícone na coluna abre o popover do chip aqui.
   */
  pendingOpenId?: string | null;
  /** Disparado quando o pending muda (null = popover fechado ou cleared). */
  onPendingOpenIdChange?: (next: string | null) => void;
  className?: string;
};

const DEFAULT_OP_LABELS: Record<string, string> = {
  equals:      "é",
  neq:         "não é",
  contains:    "contém",
  notContains: "não contém",
  startsWith:  "começa com",
  endsWith:    "termina com",
  gt:          ">",
  lt:          "<",
  gte:         "≥",
  lte:         "≤",
  isAnyOf:     "é",
  isNoneOf:    "não é",
  between:     "entre",
  isEmpty:     "vazio",
  isNotEmpty:  "não vazio",
};

/**
 * ToolbarApplied — chips dos filtros aplicados (renderiza embaixo da toolbar).
 *
 * Quando `filters` está vazio, retorna `null` (sem render).
 * Cada chip tem: [X remove] [Nome] [Operador] [Valor formatado]
 * Link "Limpar todos" à direita se houver mais de 0 filtros.
 *
 * Componente dumb: o consumer mantém o array de filtros e implementa o
 * delete/clear. Para gerenciar estado com menos boilerplate, veja `useToolbarFilters`.
 */
export function ToolbarApplied({
  filters,
  onRemove,
  onClearAll,
  clearLabel = "Limpar todos",
  opLabels,
  renderChip,
  separator = true,
  pendingOpenId,
  className,
}: ToolbarAppliedProps) {
  if (filters.length === 0) return null;

  const resolveOp = (op: AppliedFilterOp): string =>
    opLabels?.[op] ?? DEFAULT_OP_LABELS[op] ?? String(op);

  return (
    <div className={cn(toolbarApplied({ separator }), className)}>
      {filters.map((f) => {
        const isPendingOpen = pendingOpenId === f.id;
        const defaultChip = (
          <span className={toolbarAppliedChip({ interactive: !!renderChip })}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(f.id);
              }}
              aria-label="Remover filtro"
              className={toolbarAppliedChipRemove()}
            >
              <CircleX strokeWidth={2} aria-hidden="true" />
            </button>
            <span className={toolbarAppliedChipName()}>{f.columnLabel}</span>
            {/* Quando isEmpty (chip placeholder pré-ativo aguardando valor), renderiza
                apenas o nome da coluna — sem operador, sem value. Veja `showEmptyFilterChips`
                na DataTableProps + flag isEmpty no adapter. */}
            {!f.isEmpty && (
              <>
                <span className={toolbarAppliedChipOp()}>{f.opLabel ?? resolveOp(f.op)}</span>
                {Array.isArray(f.value) ? (
                  <span className="inline-flex items-center gap-gp-2xs">
                    {(f.value as ReactNode[]).map((v, i) => (
                      <span key={i} className={toolbarAppliedChipValue()}>
                        {v}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={toolbarAppliedChipValue()}>{f.value}</span>
                )}
              </>
            )}
          </span>
        );
        return (
          <div key={f.id} className="inline-flex">
            {renderChip
              ? renderChip(f, defaultChip, isPendingOpen)
              : defaultChip}
          </div>
        );
      })}
      {clearLabel !== null && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className={toolbarAppliedClearLink()}
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
