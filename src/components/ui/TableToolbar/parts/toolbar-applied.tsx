import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FilterChip } from "@/components/ui/FilterChip";
import {
  toolbarApplied,
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
  /**
   * Destaca o chip APLICADO (com valor): borda sólida de marca sobre
   * `bg-brand-subtle`, com o valor em `fg-brand`. Default `false` — sem a prop,
   * todo chip usa o tracejado neutro de sempre.
   *
   * **Ligue quando a barra tiver chip VAZIO** (o placeholder de
   * `showEmptyFilterChips`): é contra o vazio que o destaque contrasta, e é só
   * aí que ele paga. Numa barra onde todo chip visível já está aplicado, ele
   * não distingue nada — só muda a cor de tudo.
   *
   * Por isso é opt-in e não derivado de `isEmpty`: o `DataList` **nunca**
   * produz chip vazio (`toAppliedFilters` descarta item sem valor), e o
   * `DataTable` só produz com `showEmptyFilterChips` ou no chip transitório do
   * atalho de filtro do cabeçalho.
   */
  highlightAppliedFilterChips?: boolean;
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
  highlightAppliedFilterChips = false,
  className,
}: ToolbarAppliedProps) {
  if (filters.length === 0) return null;

  const resolveOp = (op: AppliedFilterOp): string =>
    opLabels?.[op] ?? DEFAULT_OP_LABELS[op] ?? String(op);

  return (
    <div className={cn(toolbarApplied({ separator }), className)}>
      {filters.map((f) => {
        const isPendingOpen = pendingOpenId === f.id;
        /* Destaque do chip APLICADO: tem valor **e** o consumidor pediu.
           `isEmpty` sozinho não serve de gatilho — o destaque existe pra
           contrastar com o chip vazio, e numa barra sem nenhum vazio ele
           pinta 100% dos chips de marca sem distinguir nada. Ver
           `highlightAppliedFilterChips` acima. */
        const destacado = highlightAppliedFilterChips && !f.isEmpty;
        /* `between` NÃO imprime o rótulo do operador: o valor já é
           auto-descritivo em todos os tipos que têm faixa —
             number   `100 – 500`            · `≥ 100`       · `≤ 500`
             currency `R$ 10 → R$ 500`       · `≥ R$ 10`     · `≤ R$ 500`
             date     `01/01 → 31/01`        · `desde 01/01` · `até 31/01`
           Lido inteiro, o chip dizia a faixa duas vezes ("entre 100 – 500"),
           e no lado aberto saía "entre desde 01/01".

           O `opLabels` do consumidor é a saída pra quem quer a palavra de
           volta — e é só ele: `f.opLabel` vem do registry do tipo, que
           declara "entre" em todos eles. */
        const rotuloDoOperador =
          f.op === "between"
            ? (opLabels?.between ?? null)
            : (f.opLabel ?? resolveOp(f.op));
        /* Quando isEmpty (chip placeholder pré-ativo aguardando valor), vai
           apenas o nome da coluna — sem operador, sem value. Veja
           `showEmptyFilterChips` na DataTableProps + flag isEmpty no adapter. */
        const valores: ReactNode[] = f.isEmpty
          ? []
          : Array.isArray(f.value)
            ? (f.value as ReactNode[])
            : [f.value];
        const defaultChip = (
          /* `removable === false` → chip fixo: no lugar do ⊗ entra um ⊕
             DECORATIVO (indica "clique pra preencher" e mantém o alinhamento).
             Não é botão: o clique no chip inteiro é que abre o popover. */
          <FilterChip
            interactive={!!renderChip}
            active={destacado}
            removable={f.removable !== false}
            onRemove={() => onRemove(f.id)}
            name={f.columnLabel}
            /* Exclusão (isNoneOf) ganha destaque de EXCEÇÃO — danger — pra
               "não é" não passar despercebido no meio dos chips (item 8). */
            op={f.isEmpty ? null : rotuloDoOperador}
            opClassName={cn(f.op === "isNoneOf" && "text-fg-danger font-semibold")}
            values={valores}
          />
        );
        return (
          // shrink-0: no scroll horizontal mobile (flex-nowrap) os chips não comprimem.
          <div key={f.id} className="inline-flex shrink-0">
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
          className={cn(toolbarAppliedClearLink(), "shrink-0")}
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
