import type { FilterItem, FilterModel } from "@/components/ui/DataTable/data-table.types";
import type { ListItemData } from "@/components/ui/List";
import type { FilterableField } from "../data-list.types";

function asText(v: unknown): string {
  return v == null ? "" : String(v);
}
function isEmptyVal(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/** Avalia UM operador escalar contra um valor do item. */
function matchOp(op: string, val: unknown, fv: unknown): boolean {
  const a = asText(val).toLowerCase();
  const b = asText(fv).toLowerCase();
  switch (op) {
    case "equals":
      return a === b;
    case "neq":
      return a !== b;
    case "contains":
      return a.includes(b);
    case "notContains":
      return !a.includes(b);
    case "startsWith":
      return a.startsWith(b);
    case "endsWith":
      return a.endsWith(b);
    case "gt":
      return Number(val) > Number(fv);
    case "lt":
      return Number(val) < Number(fv);
    case "gte":
      return Number(val) >= Number(fv);
    case "lte":
      return Number(val) <= Number(fv);
    case "between": {
      const [lo, hi] = Array.isArray(fv) ? fv : [undefined, undefined];
      const n = Number(val);
      return (lo == null || n >= Number(lo)) && (hi == null || n <= Number(hi));
    }
    case "isEmpty":
      return isEmptyVal(val);
    case "isNotEmpty":
      return !isEmptyVal(val);
    default:
      return a === b;
  }
}

/**
 * Aplica o FilterModel (do drawer da TableToolbar) sobre os itens, client-side.
 * Itens `isAnyOf`/`isNoneOf` do mesmo campo são agrupados (OR/none dentro do
 * campo); campos distintos combinam com AND. Cobre os operadores que o drawer
 * gera por filterType (text→contains, select→equals/isAnyOf, number→equals,
 * boolean→equals, date→equals/between).
 */
export function applyFilterModel(
  items: ListItemData[],
  model: FilterModel | undefined,
  fieldsById: Map<string, FilterableField>,
): ListItemData[] {
  const active = (model?.items ?? []).filter(
    (it) => it.operator === "isEmpty" || it.operator === "isNotEmpty" || !isEmptyVal(it.value),
  );
  if (active.length === 0) return items;

  // agrupa por campo (pra isAnyOf/isNoneOf juntar valores)
  const byField = new Map<string, FilterItem[]>();
  for (const it of active) {
    if (!byField.has(it.field)) byField.set(it.field, []);
    byField.get(it.field)!.push(it);
  }

  const matchField = (item: ListItemData, fieldId: string, group: FilterItem[]) => {
    const field = fieldsById.get(fieldId);
    if (!field) return true;
    const val = field.accessor(item);

    const anyOf = group.filter((g) => g.operator === "isAnyOf").map((g) => g.value);
    const noneOf = group.filter((g) => g.operator === "isNoneOf").map((g) => g.value);
    const scalar = group.filter((g) => g.operator !== "isAnyOf" && g.operator !== "isNoneOf");

    if (anyOf.length && !anyOf.some((v) => matchOp("equals", val, v))) return false;
    if (noneOf.length && noneOf.some((v) => matchOp("equals", val, v))) return false;
    for (const g of scalar) {
      if (!matchOp(g.operator, val, g.value)) return false;
    }
    return true;
  };

  return items.filter((item) => {
    for (const [fieldId, group] of byField) {
      if (!matchField(item, fieldId, group)) return false; // AND entre campos
    }
    return true;
  });
}
