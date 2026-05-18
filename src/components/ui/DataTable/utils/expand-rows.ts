import type { GridRowId } from "../data-table.types";

/** Marker pra "row expansion" — substitui ou se intercala com data rows.
 *  Symbol-as-discriminator pra evitar conflito com props do T. */
export const ROW_EXPANSION_TYPE = Symbol("dt-row-expansion");

export type DataTableRowExpansionItem<T = unknown> = {
  __type: typeof ROW_EXPANSION_TYPE;
  /** ID da row que está expandida (== getRowId(row)). */
  id: GridRowId;
  /** Referência à row pai pra que o render do consumer tenha acesso. */
  row: T;
};

/** Type guard pra ExpansionRow. Aceita union ampla (T | GroupRow | GroupContent | etc)
 *  pra coexistir com outras transformações no mesmo array. */
export function isExpansionRow<T>(
  item: unknown,
): item is DataTableRowExpansionItem<T> {
  return (
    item != null &&
    typeof item === "object" &&
    "__type" in item &&
    (item as { __type: symbol }).__type === ROW_EXPANSION_TYPE
  );
}

/**
 * Reshape do array de rows pra incluir markers de expansão.
 * Após cada row que tem ID em `expandedIds`, insere 1 marker de expansão.
 *
 * Resultado é um array misto `(T | DataTableRowExpansionItem<T>)[]` — o render
 * faz branching via `isExpansionRow` type guard. Virtualizer recebe esse array
 * direto e calcula scroll height baseado em count.
 *
 * Quando `expandedIds` vazia ou nenhum row match, retorna o array original
 * (referência preservada pra evitar re-renders desnecessários).
 */
export function expandRows<T>(
  rows: T[],
  expandedIds: Set<GridRowId>,
  getRowId: (row: T) => GridRowId,
): Array<T | DataTableRowExpansionItem<T>> {
  if (expandedIds.size === 0) return rows;
  let hasAnyMatch = false;
  for (const row of rows) {
    if (expandedIds.has(getRowId(row))) {
      hasAnyMatch = true;
      break;
    }
  }
  if (!hasAnyMatch) return rows;

  const result: Array<T | DataTableRowExpansionItem<T>> = [];
  for (const row of rows) {
    result.push(row);
    const id = getRowId(row);
    if (expandedIds.has(id)) {
      result.push({ __type: ROW_EXPANSION_TYPE, id, row });
    }
  }
  return result;
}
