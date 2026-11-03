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
 *
 * Num item multi o `value` pode ser um VALOR ou um ARRAY de valores — as duas
 * formas dão o mesmo resultado (ver o `achatar` abaixo e o porquê de cada
 * produtor). Operador escalar e `between` continuam lendo o `value` inteiro.
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

    /* `isAnyOf`/`isNoneOf` acumulam valores, e a forma canônica é 1 item por valor —
     * é o que o drawer e o chip gravam. Mas um item pode trazer o ARRAY inteiro, e
     * esse caso NÃO é hipotético:
     *   · preset escrito à mão (`examples/finance`: `value: ["negociacao","bloqueado"]`);
     *   · `view.filterModel` montado pelo consumidor;
     *   · `filterModel` que o `persistKey` salvou no localStorage ANTES da correção do
     *     chip de 2026-11-03 — e `loadPersisted` devolve `p.filterModel.items` sem
     *     migrar nada. localStorage não se migra sozinho: sem achatar aqui, quem marcou
     *     2 valores antes da correção abre a tela numa lista vazia pra sempre.
     * Achatar é o que TODO `matchesFilter` de column-type do DataTable já faz — o
     * `badge` diz com todas as letras "Aceita escalar (do preset) ou array". Este motor
     * era o único do sistema que não aceitava. */
    const achatar = (op: string) =>
      group
        .filter((g) => g.operator === op)
        .flatMap((g) => (Array.isArray(g.value) ? (g.value as unknown[]) : [g.value]));

    const anyOf = achatar("isAnyOf");
    const noneOf = achatar("isNoneOf");
    /* `between` fica aqui e mantém a TUPLA inteira: `matchOp` a desestrutura em
     * [lo, hi]. Achatar valor de operador escalar seria errado — eles combinam por
     * AND abaixo, e dois pedaços do mesmo valor nunca casariam. */
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
