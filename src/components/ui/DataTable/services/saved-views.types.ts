import type {
  DataTableViewMode,
  FilterModel,
  GridRowId,
  SortModel,
} from "../data-table.types";
import type { ColumnPinned, TableDensity } from "../../Table";

/**
 * Snapshot do estado capturado por uma view (saved OR preset).
 *
 * **Capturado** (persistente):
 * - filterModel, sortModel — base filtros/ordenação
 * - density — visual da tabela
 * - columnWidths/pinnedColumns/hiddenColumns/columnOrder — layout das colunas
 * - viewMode — tabela OU kanban (quando integração viewMode ativa)
 * - groupBy — agrupamento por field (quando feature ativa)
 * - expandedRowIds — rows expandidas (quando feature ativa)
 *
 * **Não capturado** (volátil/sessão):
 * - search — limpa entre views
 * - paginationModel — page reseta ao aplicar filtros
 * - selectionModel — sessão; não tem sentido persistir
 * - virtualize/totalizers/etc — config-time, não state
 *
 * Layout fields (columnWidths/pinnedColumns/hiddenColumns/columnOrder) e features
 * novas (viewMode/groupBy/expandedRowIds) são **opcionais** pra permitir presets
 * declarativos minimalistas. Quando ausente, `applyView` aplica defaults
 * razoáveis (layout default, viewMode "table", sem groupBy, sem expansion).
 */
export type DataTableSavedViewState = {
  filterModel: FilterModel;
  /** Multi-sort — array de criterios (primeiro = prioridade maior). */
  sortModel: SortModel[];
  density: TableDensity;
  columnWidths?: Record<string, number>;
  pinnedColumns?: Record<string, ColumnPinned>;
  hiddenColumns?: string[];
  columnOrder?: string[];
  /** Modo de visualização — "table" (default histórico) ou "kanban". */
  viewMode?: DataTableViewMode;
  /** Field pelo qual agrupar (Fase F.4). `undefined` = sem grouping. */
  groupBy?: string;
  /** IDs de rows expandidas (Fase F.4b). `undefined`/`[]` = todas colapsadas. */
  expandedRowIds?: GridRowId[];
};

/**
 * Conjunto de configurações nomeado que o usuário pode salvar e re-aplicar.
 * Inclui filtros, sort, layout, density, e features capturadas em `state`.
 */
export type SavedView = {
  id: string;
  name: string;
  /**
   * `true` = visivel pra todos os usuarios da equipe (mostrada na tab "Todos").
   * `false` = privada, so o autor ve (tab "Pessoais"). Default `false`.
   * Mock service nao tem multi-user real — o flag eh persistido pra quando
   * backend real entrar.
   */
  isPublic: boolean;
  /** Snapshot do estado capturado no momento do save. */
  state: DataTableSavedViewState;
  /** ISO date — usado pra ordenacao na lista. */
  createdAt: string;
};

/**
 * Service trocavel — mock usa localStorage. Em producao, substituir por adapter
 * que persiste em backend via API. Mesma interface, comportamento async.
 */
export type SavedViewsService = {
  list: (persistId: string) => Promise<SavedView[]>;
  save: (persistId: string, view: SavedView) => Promise<SavedView>;
  delete: (persistId: string, id: string) => Promise<void>;
};
