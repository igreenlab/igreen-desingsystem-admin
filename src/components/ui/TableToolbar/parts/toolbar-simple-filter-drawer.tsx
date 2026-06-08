import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FloatingPanel } from "../../FloatingPanel";
import { Button } from "../../Button/button";
// Coupling-aceita: TableToolbar consome utilities do DataTable que são API
// pública (ColumnTypeRegistry, operator mapping, FilterModel types). O mesmo
// pattern já existe em FilterPopover que importa `ColumnOption`. Coupling
// reverso (DataTable → TableToolbar) continua proibido.
import { columnTypeRegistry } from "../../DataTable/column-types";
import type { ColumnOption } from "../../DataTable/column-types";
import { POPOVER_OP_TO_FILTER_OP } from "../../DataTable/utils/operator-mapping";
import type {
  FilterItem,
  FilterModel,
  FilterOperator,
} from "../../DataTable/data-table.types";
import type { FilterPopoverColumn } from "../popovers/filter-popover";

/**
 * SimpleFilterDrawer — alternativa simplificada ao query builder do FilterPopover.
 *
 * Renderiza uma lista vertical com TODOS os campos filtráveis das colunas
 * (cada linha: label da coluna + widget de filtro do column-type). Sem
 * "Adicionar condição" — todos os campos estão sempre visíveis.
 *
 * Aplicação LIVE — não tem botão "Aplicar". Cada mudança no widget atualiza
 * `filterModel` na hora (mesmo flow do filter shortcut do header). User vê
 * a tabela filtrar enquanto edita.
 *
 * Comportamento:
 *   - Cada coluna filtrável vira 1 linha (escondida se field listado em hiddenFields)
 *   - Operator é INFERIDO automaticamente do filterType (multiSelect → isAnyOf,
 *     text → contains, etc) — user não escolhe operator no drawer (pra isso,
 *     existe o query builder via chevron)
 *   - Footer: "Limpar todos" remove todos items do filterModel
 *   - Drawer é non-modal — coexiste com tabela atrás
 */

export type ToolbarSimpleFilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Colunas filtráveis — vem do filterPopoverColumns do adapter. */
  columns: FilterPopoverColumn[];

  /** FilterModel atual + setter. */
  filterModel: FilterModel;
  onFilterModelChange: (model: FilterModel) => void;

  /**
   * Lista de field names que NÃO devem aparecer no drawer (mesmo sendo
   * filtráveis). Útil pra ocultar filtros que só fazem sentido no advanced
   * (ex: filtros internos). Default: array vazio (mostra todos).
   */
  hiddenFields?: string[];

  /** Override do título do drawer. Default: "Filtros". */
  title?: string;

  /** Override da descrição do drawer. Default: contagem de filtros ativos. */
  description?: string;

  /**
   * Tamanho do drawer. Default: "md" (400px). Use "lg" (560px) se há muitos
   * campos com widgets largos (dates, multi-select com muitas options).
   */
  size?: "sm" | "md" | "lg" | "xl";
};

/** Infere operator default do filterType — alinha com inferOperatorFromFilterType
 *  do DataTable. NÃO duplicar lógica: se mudar lá, mudar aqui. */
function inferOperator(filterType: string | undefined): FilterOperator {
  switch (filterType) {
    case "multiSelect": return "isAnyOf";
    case "select":      return "equals";
    case "date":        return "between";
    case "number":      return "equals";
    case "boolean":     return "equals";
    default:            return "contains";
  }
}

/** True se o value é vazio (não preenchido) pelos critérios do isFilterValueEmpty. */
function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.length === 0;
  if (Array.isArray(v)) {
    return v.every(x => x == null || (typeof x === "string" && x.length === 0));
  }
  return false;
}

export function ToolbarSimpleFilterDrawer({
  open,
  onOpenChange,
  columns,
  filterModel,
  onFilterModelChange,
  hiddenFields,
  title = "Filtros",
  description,
  size = "md",
}: ToolbarSimpleFilterDrawerProps) {
  const hiddenSet = useMemo(
    () => new Set(hiddenFields ?? []),
    [hiddenFields],
  );

  /** Colunas que aparecem no drawer (não escondidas). */
  const visibleColumns = useMemo(
    () => columns.filter(c => !hiddenSet.has(c.key)),
    [columns, hiddenSet],
  );

  /** Map field → items do filterModel pra esse field (pode ser N pra multi). */
  const itemsByField = useMemo(() => {
    const m = new Map<string, FilterItem[]>();
    for (const item of filterModel.items) {
      if (!m.has(item.field)) m.set(item.field, []);
      m.get(item.field)!.push(item);
    }
    return m;
  }, [filterModel]);

  /** Contagem de filtros ativos (com valor) pra header. */
  const activeCount = useMemo(
    () => filterModel.items.filter(i => !isEmpty(i.value)).length,
    [filterModel],
  );

  const newId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  /** Atualiza valor de um field — substitui items existentes pelo novo array
   *  de items (1 por valor pra multi; 1 single pros demais). Mantém posição
   *  original dos items NO array preservando ordem de outros fields. */
  const updateFieldValue = (field: string, newValue: unknown, filterType: string | undefined) => {
    const operator = inferOperator(filterType);
    const widgetIsMulti = filterType === "multiSelect";

    // Resolve operator efetivo — promove eq → isAnyOf quando widget multi passa array
    const effectiveOperator: FilterOperator =
      Array.isArray(newValue) && widgetIsMulti && operator === "equals"
        ? "isAnyOf"
        : operator;

    // Constrói os novos items pro field
    const newItems: FilterItem[] = [];
    if (effectiveOperator === "isAnyOf" || effectiveOperator === "isNoneOf") {
      const arr = Array.isArray(newValue) ? newValue : (newValue != null && newValue !== "" ? [newValue] : []);
      for (const v of arr) {
        if (v == null || v === "") continue;
        newItems.push({ id: newId(), field, operator: effectiveOperator, value: v as FilterItem["value"] });
      }
    } else if (effectiveOperator === "between") {
      // Date/number range — value é tupla
      if (!isEmpty(newValue)) {
        newItems.push({ id: newId(), field, operator: effectiveOperator, value: newValue as FilterItem["value"] });
      }
    } else {
      // Single value (text/number/select)
      if (!isEmpty(newValue)) {
        newItems.push({ id: newId(), field, operator: effectiveOperator, value: newValue as FilterItem["value"] });
      }
    }

    // Substitui items do field NA POSIÇÃO ORIGINAL — preserva ordem de outros fields
    const reconstructed: FilterItem[] = [];
    let inserted = false;
    for (const item of filterModel.items) {
      if (item.field === field) {
        if (!inserted) {
          reconstructed.push(...newItems);
          inserted = true;
        }
        // skip — substituído pelo spread acima
      } else {
        reconstructed.push(item);
      }
    }
    if (!inserted) reconstructed.push(...newItems);

    onFilterModelChange({ ...filterModel, items: reconstructed });
  };

  /** Remove TODOS items do filterModel. */
  const clearAll = () => {
    onFilterModelChange({ ...filterModel, items: [] });
  };

  return (
    <FloatingPanel
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      size={size}
      title={title}
      description={description ?? `${activeCount} ${activeCount === 1 ? "filtro ativo" : "filtros ativos"}`}
      titleIcon={SlidersHorizontal}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            color="secondary"
            size="sm"
            onClick={clearAll}
            disabled={activeCount === 0}
            iconLeft={<X />}
          >
            Limpar todos
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      }
    >
      {/* Padding interno alinhado com header/footer do FloatingPanel (px-[18px] py-[14px]).
       *  O body do FloatingPanel é genérico (sem padding default) — cada consumer
       *  define o seu. Aqui usamos os mesmos valores do header/footer pra ter
       *  alinhamento visual consistente quando user lê o drawer de cima até a base. */}
      <div className="flex flex-col gap-gp-xl px-[18px] py-[14px]">
        {visibleColumns.length === 0 && (
          <p className="text-body-sm text-fg-muted text-center py-pad-2xl">
            Nenhuma coluna filtrável disponível.
          </p>
        )}

        {visibleColumns.map((col) => {
          const items = itemsByField.get(col.key) ?? [];
          const operator = inferOperator(col.filterType);
          const typeId = col.filterType ?? col.type ?? "text";
          const def = columnTypeRegistry.get(typeId);

          // currentValue depende do tipo:
          //  - multi: agregado dos items[].value (array)
          //  - tuple (between): primeiro item.value (já é tupla)
          //  - single: primeiro item.value
          const isMultiOp = operator === "isAnyOf" || operator === "isNoneOf";
          const isTupleOp = operator === "between";
          const currentValue = isMultiOp
            ? items
                .flatMap(it => Array.isArray(it.value) ? (it.value as unknown[]) : (it.value != null ? [it.value] : []))
                .filter(v => v != null && v !== "")
            : isTupleOp
              ? items[0]?.value
              : items[0]?.value;

          const filterOp = POPOVER_OP_TO_FILTER_OP[operator] ?? operator;
          const options = (col.options ?? []) as ColumnOption[];

          return (
            <div key={col.key} className="flex flex-col gap-gp-xs">
              <label className="text-body-sm font-medium text-fg-default">
                {col.label}
              </label>
              <div className="w-full">
                {def.renderFilterInput({
                  value: currentValue as never,
                  onChange: (v: unknown) => updateFieldValue(col.key, v, col.filterType),
                  operator: filterOp as never,
                  options,
                })}
              </div>
            </div>
          );
        })}
      </div>
    </FloatingPanel>
  );
}
