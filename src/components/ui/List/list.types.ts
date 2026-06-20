import type { ReactNode } from "react";

/** Layout do List. */
export type ListLayout = "standard" | "grouped" | "hierarchical";

/** Densidade vertical dos cards. */
export type ListDensity = "comfortable" | "compact";

/**
 * Meta alinhada dentro do card — colunas tipo `ROLE · STATUS · LAST SEEN`
 * (padrão Supabase "List Patterns"). Renderizadas à direita do conteúdo.
 */
export type ListItemMeta = {
  label: ReactNode;
  value: ReactNode;
  /** Alinhamento do bloco. Default "start". */
  align?: "start" | "end";
};

/**
 * Item da lista (um card). Os slots cobrem o caso comum; pra um card totalmente
 * custom use `renderItem` no `<List>` (o wrapper continua sendo do List).
 */
export type ListItemData = {
  /** Identificador único. */
  id: string;

  /* ── Slots de conteúdo (layout default do card) ───────────── */
  /** Avatar / ícone / icon-chip à esquerda. */
  leading?: ReactNode;
  /** Título principal. */
  title: ReactNode;
  /** Segunda linha (ex.: e-mail). */
  subtitle?: ReactNode;
  /** Descrição com line-clamp. */
  description?: ReactNode;
  /** Colunas de meta alinhadas (ROLE/STATUS/LAST SEEN). */
  meta?: ListItemMeta[];
  /** Valor/badge à direita de tudo (ex.: contagem, status pill). */
  trailing?: ReactNode;

  /* ── Estrutura ────────────────────────────────────────────── */
  /** Grupo a que pertence (layout "grouped"). */
  groupId?: string;
  /** Filhos (layout "hierarchical" — árvore aninhada canônica). */
  children?: ListItemData[];

  /* ── DnD ──────────────────────────────────────────────────── */
  /** Pode ser arrastado. Default true. */
  canDrag?: boolean;
  /** Pode receber drop antes de si (alvo). Default true. */
  canDrop?: boolean;

  /** Passthrough livre — disponível em `renderItem`. */
  data?: unknown;
};

/** Grupo (seção) do layout "grouped". */
export type ListGroup = {
  id: string;
  label: ReactNode;
  /** Cor do dot do header. Ideal var de token DS. */
  color?: string;
  /** Override do count; senão calculado pelos itens do grupo. */
  count?: number;
  /** Aceita drop de itens. Default true. */
  canReceiveDrop?: boolean;
};

/** Item de menu (kebab) — mesmo shape do Kanban. */
export type ListMenuItem = {
  label?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
};

/** Estado passado pro `renderItem`. */
export type ListRenderState = {
  selected: boolean;
  open: boolean;
  dragging: boolean;
  /** Profundidade na hierarquia (0 = raiz). 0 nos demais layouts. */
  depth: number;
};

/** Props do componente raiz `<List>`. */
export type ListProps = {
  /** Layout. Default "standard". */
  layout?: ListLayout;
  /** Itens. No "hierarchical" use `children` pra aninhar. */
  items: ListItemData[];
  /** Definição/ordem dos grupos (layout "grouped"). */
  groups?: ListGroup[];
  /** Painel sutil por grupo ("card fino" que diferencia da superfície). Default false. */
  groupSurface?: boolean;

  /* ── Conteúdo / interação ─────────────────────────────────── */
  /** Render custom do miolo do card (wrapper continua do List). */
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  /** Itens do menu "⋯" do card. Quando retorna [], não renderiza o menu. */
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
  /** Click no card (fora de checkbox/menu/link). */
  onItemClick?: (id: string) => void;
  /** Id do card "aberto" (detail panel) — realce brand. */
  openId?: string;

  /* ── Seleção (controlado/não-controlado) ──────────────────── */
  /** Mostra checkbox por card. */
  selectable?: boolean;
  selectedIds?: Set<string>;
  defaultSelectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;

  /* ── Hierarquia (controlado/não-controlado) ───────────────── */
  expandedIds?: Set<string>;
  defaultExpandedIds?: Set<string>;
  onExpandedChange?: (ids: Set<string>) => void;
  /** Linhas de conexão entre níveis. Default true. */
  showConnectors?: boolean;
  /** Indent por nível (px). Default 24. */
  indentSize?: number;

  /* ── DnD ──────────────────────────────────────────────────── */
  /** Habilita drag-and-drop. Default false. */
  enableDnD?: boolean;
  /** Reorder no layout "standard". `toIndex` = posição final desejada. */
  onReorder?: (id: string, toIndex: number) => void;
  /** Mover/reordenar no "grouped". `toIndex` = posição no grupo destino. */
  onMove?: (id: string, fromGroupId: string, toGroupId: string, toIndex: number) => void;

  /* ── Estados / visual ─────────────────────────────────────── */
  loading?: boolean;
  skeletonCount?: number;
  emptyState?: ReactNode;
  density?: ListDensity;
  className?: string;
};
