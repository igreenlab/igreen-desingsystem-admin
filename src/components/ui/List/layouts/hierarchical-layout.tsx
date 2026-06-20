import { useMemo, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { listStyles, type ListStyleVariants } from "../list.styles";
import { ListItem } from "../list-item";
import { flattenTree, type FlatRow } from "../utils/flatten-tree";
import type {
  ListItemData,
  ListMenuItem,
  ListRenderState,
} from "../list.types";

type BranchHighlight = "none" | "block" | "active";

type HierarchicalLayoutProps = {
  items: ListItemData[];
  density: NonNullable<ListStyleVariants["density"]>;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  showConnectors: boolean;
  indentSize: number;
  branchHighlight?: BranchHighlight;
  selectable?: boolean;
  selectedIds: Set<string>;
  openId?: string;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
};

/**
 * Layout hierárquico (tree-as-list). Dois modos de visualização:
 * - `branchHighlight="none"` (default) → conectores (elbow lines) em linhas planas.
 * - `branchHighlight="block"|"active"` → painéis aninhados que destacam a "família".
 */
export function HierarchicalLayout(props: HierarchicalLayoutProps) {
  if (props.branchHighlight && props.branchHighlight !== "none") {
    return (
      <NestedHierarchy {...props} branchHighlight={props.branchHighlight} />
    );
  }
  return <FlatHierarchy {...props} />;
}

/* ═══════════════════════════════════════════════════════════════════
   "none" — conectores clássicos (flat rows + elbow lines)
   ═══════════════════════════════════════════════════════════════════ */

function FlatHierarchy({
  items,
  density,
  expanded,
  onToggleExpand,
  showConnectors,
  indentSize,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
}: HierarchicalLayoutProps) {
  const s = listStyles({ density });
  const rows = flattenTree(items, expanded);
  // gap entre cards (+4px vs densidade base) — o bridge dos conectores usa o
  // MESMO valor pra estender cada guia vertical e manter as linhas contínuas.
  const gap = density === "compact" ? 10 : 12;

  return (
    <div className="flex flex-col" style={{ gap }}>
      {rows.map((row) => (
        <div key={row.item.id} className="flex items-stretch">
          {showConnectors && row.depth > 0 && (
            <Connector row={row} indentSize={indentSize} gap={gap} styles={s} />
          )}
          {!showConnectors && row.depth > 0 && (
            <span
              style={{ width: row.depth * indentSize }}
              className="shrink-0"
              aria-hidden
            />
          )}
          <ListItem
            item={row.item}
            state={{
              selected: selectedIds.has(row.item.id),
              open: openId === row.item.id,
              dragging: false,
              depth: row.depth,
            }}
            density={density}
            renderItem={renderItem}
            getMenuItems={getMenuItems}
            onClick={onItemClick}
            selectable={selectable}
            onToggleSelect={onToggleSelect}
            expandToggle={
              row.hasChildren ? (
                <ExpandToggle
                  open={row.expanded}
                  styles={s}
                  onClick={() => onToggleExpand(row.item.id)}
                />
              ) : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Gutter de conectores à esquerda do card. Uma coluna por nível de indent:
 * - colunas dos ancestrais → linha vertical full-height quando o ancestral
 *   ainda tem irmão depois (a guia "continua descendo").
 * - última coluna → elbow (∟): vertical até o centro + horizontal até o card;
 *   continua abaixo do centro só se o nó tiver irmão (não é o último).
 */
function Connector({
  row,
  indentSize,
  gap,
  styles: s,
}: {
  row: FlatRow;
  indentSize: number;
  gap: number;
  styles: ReturnType<typeof listStyles>;
}) {
  const cols = Array.from({ length: row.depth });
  const vLine = {
    left: "50%",
    width: 1,
    transform: "translateX(-50%)",
  } as const;
  return (
    <div className="flex shrink-0" aria-hidden>
      {cols.map((_, i) => {
        const isElbow = i === row.depth - 1;
        if (isElbow) {
          return (
            <span key={i} style={{ width: indentSize }} className={s.indent()}>
              {/* vertical: (gap acima) → centro do card */}
              <span
                className={s.connector()}
                style={{ ...vLine, top: -gap, height: `calc(50% + ${gap}px)` }}
              />
              {/* vertical: centro → base (só se tem irmão depois) */}
              {!row.isLast && (
                <span
                  className={s.connector()}
                  style={{ ...vLine, top: "50%", bottom: 0 }}
                />
              )}
              {/* horizontal: centro → card */}
              <span
                className={s.connector()}
                style={{
                  left: "50%",
                  right: 0,
                  top: "50%",
                  height: 1,
                  transform: "translateY(-50%)",
                }}
              />
            </span>
          );
        }
        // pass-through dos ancestrais — estende pra cima pelo gap (linha contínua).
        // Coluna i (x = i*indent) hospeda o elbow de nós em depth i+1, então a
        // continuação vertical depende do ancestral em depth i+1 ter irmão —
        // ancestorHasNext[i+1], NÃO [i]. Com [i] (off-by-one) a guia sumia no
        // último root (ancestorHasNext[0]=false); nos demais o root tinha next
        // e mascarava o bug.
        const continues = row.ancestorHasNext[i + 1];
        return (
          <span key={i} style={{ width: indentSize }} className={s.indent()}>
            {continues && (
              <span
                className={s.connector()}
                style={{ ...vLine, top: -gap, bottom: 0 }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   "block" / "active" — painéis aninhados (destaque de família)
   ═══════════════════════════════════════════════════════════════════ */

function NestedHierarchy({
  items,
  density,
  expanded,
  onToggleExpand,
  branchHighlight,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
}: HierarchicalLayoutProps & { branchHighlight: BranchHighlight }) {
  // nó "ativo" = último expandido (modo "active"). Seed = ramo aberto mais profundo.
  const [activeId, setActiveId] = useState<string | null>(() =>
    branchHighlight === "active" ? deepestExpanded(items, expanded) : null,
  );

  const { trail, subtree } = useMemo(() => {
    if (branchHighlight !== "active" || !activeId) {
      return { trail: new Set<string>(), subtree: new Set<string>() };
    }
    const path = findPath(items, activeId) ?? [];
    const node = findNode(items, activeId);
    return {
      trail: new Set(path.slice(0, -1)), // ancestrais (sem o próprio ativo)
      subtree: new Set(node ? collectSubtree(node) : []),
    };
  }, [items, activeId, branchHighlight]);

  const handleToggle = (id: string) => {
    if (!expanded.has(id)) setActiveId(id); // ao EXPANDIR, vira o ativo
    onToggleExpand(id);
  };

  return (
    <NestedTree
      nodes={items}
      density={density}
      depth={0}
      expanded={expanded}
      onToggle={handleToggle}
      branchHighlight={branchHighlight}
      trail={trail}
      subtree={subtree}
      activeId={activeId}
      selectable={selectable}
      selectedIds={selectedIds}
      openId={openId}
      onToggleSelect={onToggleSelect}
      onItemClick={onItemClick}
      renderItem={renderItem}
      getMenuItems={getMenuItems}
    />
  );
}

type NestedTreeProps = {
  nodes: ListItemData[];
  density: NonNullable<ListStyleVariants["density"]>;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  branchHighlight: BranchHighlight;
  trail: Set<string>;
  subtree: Set<string>;
  activeId: string | null;
  selectable?: boolean;
  selectedIds: Set<string>;
  openId?: string;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (id: string) => void;
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
};

function NestedTree({
  nodes,
  density,
  depth,
  expanded,
  onToggle,
  branchHighlight,
  trail,
  subtree,
  activeId,
  selectable,
  selectedIds,
  openId,
  onToggleSelect,
  onItemClick,
  renderItem,
  getMenuItems,
}: NestedTreeProps) {
  const s = listStyles({ density });
  return (
    <div className="flex flex-col gap-gp-md">
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isOpen = hasChildren && expanded.has(node.id);
        return (
          <div key={node.id} className="flex flex-col gap-gp-md">
            <ListItem
              item={node}
              state={{
                selected: selectedIds.has(node.id),
                open:
                  openId === node.id ||
                  (branchHighlight === "active" && node.id === activeId),
                dragging: false,
                depth,
              }}
              density={density}
              renderItem={renderItem}
              getMenuItems={getMenuItems}
              onClick={onItemClick}
              selectable={selectable}
              onToggleSelect={onToggleSelect}
              expandToggle={
                hasChildren ? (
                  <ExpandToggle
                    open={isOpen}
                    styles={s}
                    onClick={() => onToggle(node.id)}
                  />
                ) : (
                  <span className="size-[20px] shrink-0" aria-hidden />
                )
              }
            />
            {isOpen && (
              <div
                className={cn(
                  "pl-pad-xl",
                  branchContainer(branchHighlight, node.id, trail, subtree),
                )}
              >
                <NestedTree
                  nodes={node.children!}
                  density={density}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  branchHighlight={branchHighlight}
                  trail={trail}
                  subtree={subtree}
                  activeId={activeId}
                  selectable={selectable}
                  selectedIds={selectedIds}
                  openId={openId}
                  onToggleSelect={onToggleSelect}
                  onItemClick={onItemClick}
                  renderItem={renderItem}
                  getMenuItems={getMenuItems}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Painel sutil de "família" — mesmo visual no block e no subtree do active. */
const PANEL =
  "ml-[12px] rounded-radius-lg border border-border-subtle border-l-2 border-l-border-brand-subtle bg-bg-muted/40 dark:bg-bg-surface/40 py-pad-md pr-pad-xs";
const TRAIL = "ml-[12px] border-l-2 border-l-border-brand-subtle py-pad-2xs";
const GUIDE = "ml-[12px] border-l border-border-subtle py-pad-2xs";

/** Classe do container de filhos por tratamento. `parentId` = nó dono dos filhos. */
function branchContainer(
  mode: BranchHighlight,
  parentId: string,
  trail: Set<string>,
  subtree: Set<string>,
): string {
  if (mode === "block") return PANEL;
  if (mode === "active") {
    if (subtree.has(parentId)) return PANEL; // subtree do ativo = mesmo painel
    if (trail.has(parentId)) return TRAIL; // ancestral → só a trilha (spine)
    return GUIDE; // fora do ramo ativo → guia neutra
  }
  return GUIDE;
}

/* ── shared ────────────────────────────────────────────────────── */

function ExpandToggle({
  open,
  styles: s,
  onClick,
}: {
  open: boolean;
  styles: ReturnType<typeof listStyles>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={s.groupToggle()}
      aria-expanded={open}
      aria-label={open ? "Recolher" : "Expandir"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <ChevronRight
        className={cn("size-[16px] transition-transform", open && "rotate-90")}
      />
    </button>
  );
}

function findNode(nodes: ListItemData[], id: string): ListItemData | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const r = findNode(n.children, id);
      if (r) return r;
    }
  }
  return null;
}

function findPath(
  nodes: ListItemData[],
  id: string,
  acc: string[] = [],
): string[] | null {
  for (const n of nodes) {
    const next = [...acc, n.id];
    if (n.id === id) return next;
    if (n.children) {
      const r = findPath(n.children, id, next);
      if (r) return r;
    }
  }
  return null;
}

function collectSubtree(node: ListItemData): string[] {
  const ids = [node.id];
  node.children?.forEach((c) => ids.push(...collectSubtree(c)));
  return ids;
}

/** Nó aberto mais profundo seguindo a cadeia de expandidos (seed do "active"). */
function deepestExpanded(
  nodes: ListItemData[],
  expanded: Set<string>,
): string | null {
  for (const n of nodes) {
    if (expanded.has(n.id) && n.children?.length) {
      const deeper = deepestExpanded(n.children, expanded);
      return deeper ?? n.id;
    }
  }
  return null;
}
