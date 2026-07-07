import type { ListItemData } from "../list.types";

export type FlatRow = {
  item: ListItemData;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  /** É o último filho do seu pai (define o "∟" do conector). */
  isLast: boolean;
  /**
   * Pra cada nível ancestral (índice = depth do ancestral), indica se aquele
   * ancestral ainda tem irmão depois dele — controla se a guia vertical
   * continua descendo naquela coluna de indent.
   */
  ancestorHasNext: boolean[];
};

/**
 * Achata uma árvore (`children`) em linhas, descendo só nos nós expandidos.
 * Produz `depth` + flags de conector pra UI de tree-as-list.
 */
export function flattenTree(
  roots: ListItemData[],
  expanded: Set<string>,
): FlatRow[] {
  const rows: FlatRow[] = [];

  const walk = (
    nodes: ListItemData[],
    depth: number,
    ancestorHasNext: boolean[],
  ) => {
    nodes.forEach((item, idx) => {
      const hasChildren = Boolean(item.children && item.children.length > 0);
      const isExpanded = hasChildren && expanded.has(item.id);
      const isLast = idx === nodes.length - 1;
      rows.push({
        item,
        depth,
        hasChildren,
        expanded: isExpanded,
        isLast,
        ancestorHasNext,
      });
      if (isExpanded) {
        walk(item.children!, depth + 1, [...ancestorHasNext, !isLast]);
      }
    });
  };

  walk(roots, 0, []);
  return rows;
}

/** IDs de todos os nós com filhos (pra expandir/colapsar tudo). */
export function collectExpandableIds(roots: ListItemData[]): string[] {
  const ids: string[] = [];
  const walk = (nodes: ListItemData[]) => {
    for (const n of nodes) {
      if (n.children && n.children.length > 0) {
        ids.push(n.id);
        walk(n.children);
      }
    }
  };
  walk(roots);
  return ids;
}
