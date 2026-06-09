/**
 * Helpers compartilhados de operação de filtro — fonte ÚNICA da escrita no
 * FilterModel. Antes essa lógica estava duplicada em 4 lugares (2× no
 * use-filter-popover-adapter, 1× no controller, 1× no simple-filter-drawer),
 * com comportamentos sutilmente divergentes (o drawer só promovia equals→isAnyOf,
 * o controller promovia sem checar array, os adapters checavam array). Aqui há
 * um único contrato.
 */
import type {
  DataTableColumnDef,
  FilterOperator,
} from "../data-table.types";
import { columnTypeRegistry } from "../column-types";

/**
 * Operadores que carregam MÚLTIPLOS valores numa condição (chip+popover) —
 * multiSelect/tags. O FilterModel guarda 1 item por valor (spread).
 */
export const MULTI_VALUE_OPERATORS = new Set<FilterOperator>([
  "isAnyOf",
  "isNoneOf",
]);

/** ID estável pra um FilterItem — `crypto.randomUUID()` com fallback timestamp. */
export function genFilterId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * True quando um `FilterValue` é "vazio" (sem efeito) — null/undefined, string
 * vazia, ou tupla/array com todos os sides nulos/strings vazias.
 *
 * ⚠️ Checa só o VALUE. Pra saber se um FilterItem está ATIVO (operadores
 * `isEmpty`/`isNotEmpty` são ativos sem valor), use a lógica do processor.
 */
export function filterValueIsEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.length === 0;
  if (Array.isArray(v)) {
    return v.every(
      (x) => x == null || (typeof x === "string" && x.length === 0),
    );
  }
  return false;
}

/**
 * Promove operador escalar → multi quando a coluna é `filterType: "multiSelect"`.
 *
 * Invariante: coluna multiSelect SEMPRE usa `isAnyOf`/`isNoneOf` (o widget
 * MultiSelectFieldDropdown sempre togglea com array). Sem isso, presets
 * declarados como `{ field, value }` (operator default `equals`) ou shortcuts
 * de header ficam com operator escalar inconsistente — chip mostra
 * "Status = active, pending" em vez de "é um de", e o filterModel cria N items
 * separados em vez de 1 grupo.
 *
 * - `equals` → `isAnyOf`
 * - `neq`    → `isNoneOf`
 * - demais operadores / colunas não-multiSelect → inalterados
 */
export function promoteOperatorForFilterType(
  operator: FilterOperator,
  filterType: string | undefined,
): FilterOperator {
  if (filterType !== "multiSelect") return operator;
  if (operator === "equals") return "isAnyOf";
  if (operator === "neq") return "isNoneOf";
  return operator;
}

/** Conveniência: mesma promoção a partir de uma `DataTableColumnDef`. */
export function promoteOperatorForColumn<T>(
  operator: FilterOperator,
  col: DataTableColumnDef<T> | undefined,
): FilterOperator {
  return promoteOperatorForFilterType(operator, col?.filterType);
}

/**
 * Operador default de um tipo de filtro — derivado do REGISTRY (`operators[0]`),
 * fonte única. Sem switch hardcoded: um column-type novo já traz seu default
 * correto (ex: currency → equals, date → between, multiSelect → isAnyOf), e
 * nunca cai num `"contains"` que o tipo não suporta.
 */
export function defaultOperatorForFilterType(
  filterType: string | undefined,
): FilterOperator {
  const def = columnTypeRegistry.get(filterType ?? "text");
  return (def.operators?.[0]?.id as FilterOperator) ?? "contains";
}
