import type { FilterItem } from "../data-table.types";

/**
 * Mapeamento de operadores entre FilterPopover (UI) e FilterOperator (logic).
 *
 * FilterPopover usa nomes curtos compatíveis com SQL parser (eq, neq, gt, lt).
 * Processor/FilterModel usa nomes longos semânticos (equals, neq, gt, lt).
 *
 * Single source of truth — adicione 1 entrada aqui e ambos os maps refletem.
 */
const OPERATOR_PAIRS: ReadonlyArray<[string, FilterItem["operator"]]> = [
  ["eq", "equals"],
  ["neq", "neq"],
  ["contains", "contains"],
  ["gt", "gt"],
  ["lt", "lt"],
  ["between", "between"],
];

/** FilterPopover op (eq, neq, contains, gt, lt, between) → FilterModel operator (equals, …) */
export const POPOVER_OP_TO_FILTER_OP: Record<string, FilterItem["operator"]> =
  Object.fromEntries(OPERATOR_PAIRS) as Record<string, FilterItem["operator"]>;

/** FilterModel operator → FilterPopover op id (reverso do POPOVER_OP_TO_FILTER_OP). */
export const FILTER_OP_TO_POPOVER_OP: Record<string, string> =
  Object.fromEntries(OPERATOR_PAIRS.map(([k, v]) => [v, k]));
