import type { ListGroup, ListItemData } from "../list.types";

export type GroupedBucket = {
  group: ListGroup;
  items: ListItemData[];
  count: number;
};

/**
 * Particiona itens planos por `groupId`, na ordem definida em `groups`.
 * Grupos sem itens são preservados (renderizam vazio / drop target).
 * Itens cujo `groupId` não bate com nenhum grupo são ignorados.
 */
export function groupItems(
  items: ListItemData[],
  groups: ListGroup[],
): GroupedBucket[] {
  const byGroup = new Map<string, ListItemData[]>();
  for (const g of groups) byGroup.set(g.id, []);
  for (const item of items) {
    if (item.groupId && byGroup.has(item.groupId)) {
      byGroup.get(item.groupId)!.push(item);
    }
  }
  return groups.map((group) => {
    const bucket = byGroup.get(group.id) ?? [];
    return { group, items: bucket, count: group.count ?? bucket.length };
  });
}
