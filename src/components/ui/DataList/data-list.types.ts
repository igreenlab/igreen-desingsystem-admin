import type { ReactNode } from "react";
import type { FilterModel } from "@/components/ui/DataTable/data-table.types";
import type {
  ListGroup,
  ListItemData,
  ListLayout,
  ListMenuItem,
  ListRenderState,
} from "@/components/ui/List";

/** Tipo de um campo filtrável (sem colunas — o consumer declara). */
export type FilterFieldType = "text" | "select" | "boolean" | "number" | "date";

export type FilterableField = {
  id: string;
  label: string;
  /** Extrai o valor do item pra filtrar. */
  accessor: (item: ListItemData) => unknown;
  type: FilterFieldType;
  /** Opções (type "select"). */
  options?: { label: string; value: string }[];
};

/** Query corrente (persistida / enviada ao server). Usa o FilterModel da
 *  TableToolbar — assim o drawer de filtro é o MESMO da tabela. */
export type DataListQuery = {
  search: string;
  filterModel: FilterModel;
};

/** Saved view (Visão) — um preset de query. */
export type DataListView = {
  id: string;
  label: string;
  query: DataListQuery;
};

export type DataListMode = "client" | "server";

export type DataListProps = {
  /* ── dados / layout (repassados ao List) ──────────────────── */
  items: ListItemData[];
  layout?: ListLayout;
  groups?: ListGroup[];
  renderItem?: (item: ListItemData, state: ListRenderState) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
  onItemClick?: (id: string) => void;
  openId?: string;
  groupSurface?: boolean;
  density?: "comfortable" | "compact";

  /* ── toolbar ──────────────────────────────────────────────── */
  /** Título à esquerda (quando não há savedViews, ou ao lado). */
  title?: ReactNode;
  /** Busca textual (client: filtra; server: vai no onQueryChange). */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Campos pra montar o popover de filtro. */
  filterFields?: FilterableField[];
  /** Visões salvas (presets de query). */
  views?: DataListView[];
  /** Botão refresh (callback). */
  onRefresh?: () => void;
  /** Itens do botão "⋯" (opcional). */
  moreActions?: ListMenuItem[];

  /* ── server/async ─────────────────────────────────────────── */
  mode?: DataListMode;
  loading?: boolean;
  /** Total de itens (server) — usado no contador. */
  total?: number;
  /** Disparado quando a query muda (server faz o fetch). */
  onQueryChange?: (query: DataListQuery) => void;

  /* ── infinite scroll ──────────────────────────────────────── */
  /** Carrega a próxima página ao chegar no fim da lista (sentinel). */
  onLoadMore?: () => void;
  /** Há mais itens pra carregar (controla o sentinel + skeleton). */
  hasMore?: boolean;
  /** Carregando a próxima página — mostra cards skeleton no fim. */
  loadingMore?: boolean;

  /* ── virtualização (só layout standard; exclui DnD) ───────── */
  virtualized?: boolean;
  /** Altura estimada de cada card (px) — virtualização. Default 76. */
  estimateItemSize?: number;

  /* ── hierarquia lazy ──────────────────────────────────────── */
  onLoadChildren?: (id: string) => Promise<ListItemData[]>;
  /** Nós expandidos no mount (layout hierarchical / grouped). */
  defaultExpandedIds?: Set<string>;

  /* ── seleção / dnd / persistência ─────────────────────────── */
  selectable?: boolean;
  onSelectionChange?: (ids: Set<string>) => void;
  bulkActions?: { label: string; icon?: ReactNode; onClick: (ids: Set<string>) => void; destructive?: boolean }[];
  enableDnD?: boolean;
  onReorder?: (id: string, toIndex: number) => void;
  onMove?: (id: string, fromGroupId: string, toGroupId: string, toIndex: number) => void;
  /** Chave do localStorage pra persistir a query (search+filtros+view). */
  persistKey?: string;

  className?: string;
  emptyState?: ReactNode;
};
