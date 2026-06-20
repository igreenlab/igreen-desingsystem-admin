import { useMemo, useState } from "react";
import { ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListItem, type ListItemData } from "../../components/ui/List";
import { Button } from "../../components/ui/Button";
import { ExamplePageLayout } from "../components/example-page-layout";
import { makeOrg } from "./_list-example-data";

/* ═══════════════════════════════════════════════════════════════════
   SANDBOX — teste de destaque visual de "família" no tree-as-list.
   NÃO é feature do DS: renderização própria (recursiva) reusando o card
   <ListItem>, pra experimentar 3 tratamentos alternáveis ao vivo:
     · neutro  — só guia (linha) à esquerda, baseline de comparação
     · block   — filhos dentro de um painel sutil (1 bloco = 1 família)
     · active  — realça o ramo ativo: trilha (spine) até o nó aberto +
                 subtree do nó aberto tingida ("a qual pertence + filhos")
   ═══════════════════════════════════════════════════════════════════ */

type Mode = "neutro" | "block" | "active";

/* ── helpers de árvore ─────────────────────────────────────────── */

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

function findPath(nodes: ListItemData[], id: string, acc: string[] = []): string[] | null {
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

/* ── tree recursivo ────────────────────────────────────────────── */

type TreeProps = {
  nodes: ListItemData[];
  mode: Mode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  /** ids no caminho root→ativo (trilha), exclusivo do próprio ativo. */
  trail: Set<string>;
  /** ids do subtree do nó ativo (ativo + descendentes). */
  subtree: Set<string>;
  activeId: string | null;
};

function Tree({ nodes, mode, depth, expanded, onToggle, trail, subtree, activeId }: TreeProps) {
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
                selected: false,
                open: mode === "active" && node.id === activeId,
                dragging: false,
                depth,
              }}
              density="comfortable"
              onClick={hasChildren ? () => onToggle(node.id) : undefined}
              getMenuItems={() => [{ label: "Ver perfil", icon: <User /> }]}
              expandToggle={
                hasChildren ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Recolher" : "Expandir"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(node.id);
                    }}
                    className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-radius-sm text-fg-muted transition-colors hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
                  >
                    <ChevronRight
                      className={cn("size-[16px] transition-transform", isOpen && "rotate-90")}
                    />
                  </button>
                ) : (
                  <span className="size-[20px] shrink-0" aria-hidden />
                )
              }
            />

            {isOpen && (
              <div className={cn("mt-[-2px] pl-pad-xl", childContainer(mode, node.id, trail, subtree))}>
                <Tree
                  nodes={node.children!}
                  mode={mode}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  trail={trail}
                  subtree={subtree}
                  activeId={activeId}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Classe do container de filhos por tratamento. `parentId` = nó dono dos filhos. */
function childContainer(mode: Mode, parentId: string, trail: Set<string>, subtree: Set<string>): string {
  if (mode === "block") {
    // 1 bloco = 1 família: painel sutil + borda esquerda de marca + respiro
    return "ml-[12px] rounded-radius-lg border border-border-subtle border-l-2 border-l-border-brand-subtle bg-bg-muted/40 dark:bg-bg-surface/40 py-pad-md pr-pad-xs";
  }
  if (mode === "active") {
    if (subtree.has(parentId)) {
      // filhos fazem parte do subtree do nó ativo → tinge + spine forte
      return "ml-[12px] rounded-radius-lg border-l-2 border-l-bg-brand bg-bg-brand-subtle/25 py-pad-md pr-pad-xs";
    }
    if (trail.has(parentId)) {
      // ancestral do ativo → só a trilha (spine), sem fundo
      return "ml-[12px] border-l-2 border-l-border-brand-subtle py-pad-2xs";
    }
    return "ml-[12px] border-l border-border-subtle py-pad-2xs";
  }
  // neutro — só a guia (linha) à esquerda
  return "ml-[12px] border-l border-border-subtle py-pad-2xs";
}

/* ── página ────────────────────────────────────────────────────── */

const MODES: { id: Mode; label: string }[] = [
  { id: "block", label: "Bloco/painel" },
  { id: "active", label: "Ramo ativo" },
  { id: "neutro", label: "Neutro" },
];

export default function ListHierarchicalSandboxPreview() {
  const org = useMemo(() => makeOrg(), []);
  const [mode, setMode] = useState<Mode>("block");
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(org.flatMap((c) => [c.id, `${c.id}-m0`])),
  );
  // nó "ativo" = último expandido; alimenta a trilha/subtree do modo "active"
  const [activeId, setActiveId] = useState<string | null>("acme-m0");

  const { trail, subtree } = useMemo(() => {
    if (!activeId) return { trail: new Set<string>(), subtree: new Set<string>() };
    const path = findPath(org, activeId) ?? [];
    const node = findNode(org, activeId);
    return {
      trail: new Set(path.slice(0, -1)), // ancestrais (sem o próprio ativo)
      subtree: new Set(node ? collectSubtree(node) : []),
    };
  }, [org, activeId]);

  const handleToggle = (id: string) => {
    setActiveId(id);
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <ExamplePageLayout
      category="List Examples · Sandbox"
      title="Hierarchical — destaque de família (sandbox)"
      description="Teste exploratório (NÃO é feature do DS): ao abrir um nível, destacar visualmente a 'família' pra não se perder em árvores grandes. Alterne os tratamentos no topo: Bloco/painel (filhos dentro de um painel = 1 família), Ramo ativo (trilha até o nó aberto + subtree tingido) e Neutro (baseline, só a guia). Clique no card ou no chevron pra abrir; o último aberto vira o 'ativo'."
      code={CODE}
    >
      <div className="flex flex-1 min-h-0 flex-col gap-gp-xl">
        {/* seletor de tratamento */}
        <div className="flex shrink-0 items-center gap-gp-sm">
          <span className="text-body-sm text-fg-muted">Tratamento:</span>
          {MODES.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={mode === m.id ? "soft" : "ghost"}
              color={mode === m.id ? "primary" : "secondary"}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        {/* árvore */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin pr-pad-xs">
          <Tree
            nodes={org}
            mode={mode}
            depth={0}
            expanded={expanded}
            onToggle={handleToggle}
            trail={trail}
            subtree={subtree}
            activeId={activeId}
          />
        </div>
      </div>
    </ExamplePageLayout>
  );
}

const CODE = `// SANDBOX — não é feature do DS. Renderização recursiva própria reusando
// o card <ListItem>, pra testar destaque de "família" no tree-as-list.
//
// 3 tratamentos alternáveis:
//   · block  — filhos dentro de um painel sutil (border-l de marca + bg-bg-muted/40)
//   · active — trilha (spine) root→nó aberto + subtree do nó aberto tingido
//   · neutro — só a guia (border-l) à esquerda  [baseline]
//
// A ideia: em árvores grandes, ao abrir um nível fica claro a qual família
// o nó pertence e quais são seus filhos. Container de filhos por modo:

function childContainer(mode, parentId, trail, subtree) {
  if (mode === "block")
    return "rounded-radius-lg border border-border-subtle border-l-2 " +
           "border-l-border-brand-subtle bg-bg-muted/40 py-pad-md";
  if (mode === "active") {
    if (subtree.has(parentId))      // subtree do ativo
      return "rounded-radius-lg border-l-2 border-l-bg-brand bg-bg-brand-subtle/25";
    if (trail.has(parentId))        // ancestral (trilha)
      return "border-l-2 border-l-border-brand-subtle";
  }
  return "border-l border-border-subtle";  // neutro
}`;
