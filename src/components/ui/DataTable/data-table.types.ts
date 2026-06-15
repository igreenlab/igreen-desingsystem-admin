import type { ReactNode } from "react";
import type { TableDensity, SortDirection, ColumnPinned, CellAlign } from "../Table";
import type { ToolbarSegmentedItem } from "../TableToolbar";
import type { KanbanCardData, KanbanColumn, KanbanMenuItem } from "../Kanban";
import type { SavedViewsService } from "./services/saved-views.types";

/* ── View mode (table OR kanban) ─────────────────────────────────── */

export type DataTableViewMode = "table" | "kanban";

/** Parâmetros do `renderCardContent` na view Kanban via DataTable. */
export type DataTableKanbanRenderCardParams<T> = {
  /** Card derivado (id, columnId, slots montados pelo `renderCard`). */
  card: KanbanCardData;
  /** Row original (acesso a fields que não estão no card derivado). */
  row: T;
  /** Estado de seleção do card. */
  selected: boolean;
  /** Estado de "aberto" (detail panel via `openCardId`). */
  open: boolean;
};

/**
 * Configuração da view Kanban — necessária quando `viewMode="kanban"`.
 *
 * O DataTable smart wrapper:
 * - Aplica filter/search/sort/selection nas rows como sempre
 * - Agrupa os resultados por `groupByField` em colunas do board
 * - Mapeia cada row em card via `renderCard`
 * - Desliga automaticamente paginação, density toggle e columns popover
 *   (não fazem sentido em board view)
 *
 * **Paridade com `<Kanban>` standalone**: as props deste config são passthrough
 * 1:1 pra `KanbanProps`, com bridges automáticos pra resolver `cardId → row`
 * onde aplicável (renderCardContent, getCardMenuItems).
 */
export type DataTableKanbanConfig<T> = {
  /** Campo da row que define em qual coluna do board ela vai (ex: "status"). */
  groupByField: keyof T | string;

  /**
   * Colunas do board (ordem, label, dotColor, canReceiveDrop, canDragFrom).
   * Quando ausente, o DataTable deriva automaticamente colunas dos valores
   * únicos de `groupByField` (id = value, label = value como string).
   */
  columns?: KanbanColumn[];

  /**
   * Fabrica os slots visuais do card (avatar/title/subtitle/chip/value/footer)
   * a partir da row processada. Retorna `Omit<KanbanCardData, "id" | "columnId">`
   * — `id` vem do `getRowId` e `columnId` vem do valor de `groupByField`.
   */
  renderCard: (params: { row: T }) => Omit<KanbanCardData, "id" | "columnId">;

  /**
   * Override TOTAL do miolo do card — substitui o layout default
   * (avatar/title/...). Wrapper externo (border, shadow, focus, checkbox
   * positioning) permanece sob controle do primitive. Use pra layouts
   * radicalmente diferentes (timeline, checklist, compact, etc).
   *
   * Recebe `row` (acesso à row original) + `card` (slots derivados via
   * `renderCard`, ainda úteis como atalho pra dados já montados) +
   * `selected` + `open`.
   */
  renderCardContent?: (params: DataTableKanbanRenderCardParams<T>) => ReactNode;

  /* ── Detail panel (controlled) ─────────────────────────────── */
  /**
   * ID do card "aberto" (strip brand lateral marca card ativo no detail panel).
   * Quando ausente, sem detail tracking; clicks vão pro `onRowClick` do DataTable
   * (que é traduzido em `onOpenCard` pro Kanban).
   */
  openCardId?: string;

  /* ── Add card (botões "+" na coluna) ──────────────────────── */
  /** Botão "+" no header da coluna — cria card naquela coluna. */
  onAddCard?: (columnId: string) => void;
  /** Botão "+ Adicionar" no rodapé da coluna. */
  onAddInFooter?: (columnId: string) => void;
  /** Esconde o botão "+ Adicionar" no rodapé. Default: `false`. */
  hideFooterAdd?: boolean;

  /* ── Menus (auto via items OU manual via callback) ────────── */
  /**
   * Items padronizados do menu "⋯" do card (preferido).
   * Recebe a row original; primitive monta `<DropdownMenu>` DS auto.
   * Quando definido, ignora `onCardMenu`.
   */
  getCardMenuItems?: (row: T) => KanbanMenuItem[];
  /**
   * Escape hatch — callback manual do botão "⋯" do card. Receba `cardId` +
   * `anchor` (HTMLElement) e construa seu próprio menu (Popover, Submenu, etc).
   * Ignorado se `getCardMenuItems` estiver fornecido.
   */
  onCardMenu?: (cardId: string, anchor: HTMLElement) => void;

  /**
   * Items padronizados do menu "⋯" da coluna (preferido).
   * Quando definido, ignora `onColumnMenu`.
   */
  getColumnMenuItems?: (column: KanbanColumn) => KanbanMenuItem[];
  /** Escape hatch — callback manual do menu da coluna. */
  onColumnMenu?: (columnId: string, anchor: HTMLElement) => void;

  /* ── DnD entre colunas ─────────────────────────────────────── */
  /** Habilita DnD entre colunas. Default: `false`. */
  enableDnD?: boolean;
  /**
   * Callback ao mover card entre colunas. Consumer comita via `rows` props
   * (optimistic update) ou via PATCH async. Primitive não faz revert.
   */
  onCardMove?: (cardId: string, from: string, to: string) => void | Promise<unknown>;

  /* ── Textos ────────────────────────────────────────────────── */
  /** Texto do empty state (coluna sem cards). */
  emptyLabel?: string;
  /** Texto do botão "+ Adicionar" no rodapé da coluna. */
  addLabel?: string;
};

/* ── Modelos de estado ───────────────────────────────────────────── */

export type SortModel = {
  field: string;
  direction: Exclude<SortDirection, null>;
};

export type PaginationModel = {
  page: number;       // 1-based
  pageSize: number;
};

export type GridRowId = string | number;

export type GridSelectionState = {
  type: "include" | "exclude";
  ids: Set<GridRowId>;
};

export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Date
  // Fase F.2 — ranges pra date/number between operator
  | [string | null, string | null]
  | [number | null, number | null]
  | null
  | undefined;

export type FilterOperator =
  | "contains" | "notContains" | "equals" | "neq" | "startsWith" | "endsWith"
  | "isEmpty" | "isNotEmpty" | "isAnyOf" | "isNoneOf"
  | "gt" | "lt" | "gte" | "lte"
  // Fase F.2 — range/period filter (date e number)
  | "between";

export type FilterItem = {
  id: string;
  field: string;
  operator: FilterOperator;
  value?: FilterValue;
};

export type FilterModel = {
  items: FilterItem[];
  logicOperator: "AND" | "OR";
};

/* ── Server mode (F5) ────────────────────────────────────────────── */

/** Parâmetros enviados ao `fetchData` em cada refetch. */
export type GridFetchParams = {
  pagination: PaginationModel;
  /** Multi-sort: array de criterios (primeiro = prioridade maior). Vazio = sem sort. */
  sort: SortModel[];
  filters: FilterModel;
  /** Search debounced (já após o delay de 500ms). */
  search: string;
  /** Field específico de busca, ou undefined pra "todos os campos". */
  searchField?: string;
};

/** Retorno esperado do `fetchData`. */
export type GridFetchResult<T> = {
  /** Linhas da página atual. */
  data: T[];
  /** Total global (todas as páginas) — necessário pra paginação calcular última página. */
  total: number;
};

/* ── ColumnDef estendido (superset do que Table primitivo precisa) ── */

/**
 * Item de ação para coluna `type: "actions"`. Cada item vira um icone-button
 * inline ou um item dentro do dropdown 3-pontos (quando `showInMenu: true`).
 *
 * `disabled` e `hidden` aceitam booleano fixo ou função que recebe a row.
 */
export type DataTableActionItem<T = unknown> = {
  /** Identificador unico (key do React + analytics). */
  id: string;
  /** Texto exibido como tooltip (inline) ou label (no menu). */
  label: string;
  /** Icone — recomendado lucide. Obrigatorio pra acoes inline; opcional no menu. */
  icon?: ReactNode;
  /** Handler do click. Recebe a row. */
  onClick: (row: T) => void;
  /** Default false = renderiza inline como icone. True = move pro dropdown 3-pontos. */
  showInMenu?: boolean;
  /** Cor critical (vermelho) — usar pra delete/remove. */
  destructive?: boolean;
  /** Desabilita o item. Aceita fn(row) pra logica por linha. */
  disabled?: boolean | ((row: T) => boolean);
  /** Esconde o item completamente. Aceita fn(row) pra logica por linha. */
  hidden?: boolean | ((row: T) => boolean);
};

export type DataTableColumnDef<T> = {
  /** Caminho do dado. Suporta dot-path: 'user.name'. */
  field: keyof T | string;
  headerName: string;
  type?:
    | "text"
    | "number"
    | "currency"
    | "percentage"
    | "date"
    | "datetime"
    | "email"
    | "phone"
    | "url"
    | "status"
    | "badge"
    | "boolean"
    | "user"
    | "tags"
    | "select"
    | "multiSelect"
    | "actions"
    | (string & {}); // permite custom types registrados

  /** Coluna `type: "actions"` — fabrica items por row. Quando definido,
   *  o DataTable auto-renderiza `DataTableActionsCell` (ignora `render`).
   *  Para escapatoria customizada, defina `render` em vez de `getActions`. */
  getActions?: (params: { row: T }) => DataTableActionItem<T>[];

  /** Layout */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  pinned?: ColumnPinned;
  align?: CellAlign;
  ellipsis?: boolean;

  /** Comportamento */
  resizable?: boolean;     // default true (exceto type=actions ou checkbox)
  sortable?: boolean;      // default true
  hideable?: boolean;      // default true
  isPrimary?: boolean;     // título no card mode
  /** Mostra menu 3-pontos no header. Default true. False esconde. */
  enableColumnMenu?: boolean;
  /** Items extras no menu da coluna (slot apos sort/pin/hide). */
  columnMenuItems?: Array<{
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    onSelect?: () => void;
    destructive?: boolean;
    disabled?: boolean;
  }>;

  /** Filtros (F4 + F6) */
  enableColumnFilter?: boolean;
  /**
   * Tipo de filtro da coluna — escolhe o widget + operadores do registry,
   * independente do `type` (render de célula). União ABERTA: aceita qualquer
   * column-type registrado (ex: `"currency"`, `"tags"`) além dos comuns. Cai em
   * `"text"` se o tipo não estiver registrado.
   */
  filterType?:
    | "text"
    | "select"
    | "multiSelect"
    | "date"
    | "boolean"
    | "number"
    | (string & {});
  filterOptions?: Array<{ label: string; value: string | number; color?: string }>;
  defaultFilterValue?: FilterValue;

  /** Render customizado */
  render?: (params: { row: T; value: unknown }) => ReactNode;
  valueGetter?: (row: T) => unknown;
  valueFormatter?: (value: unknown) => string;

  /** Ícone do tipo no header (lucide). */
  icon?: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;

  /** Opções específicas do `type` — Fase G.2/G.3. Estrutura depende do tipo:
   *  - `user`: { users: Record<id, { name, avatar?, initials? }> }
   *  - `currency`: { currency?: "BRL" | "USD" | ..., locale?: string }
   *  - `date`/`datetime`: { format?: "short" | "long" | Intl options }
   *  - custom types: o que o tipo definir */
  typeOptions?: Record<string, unknown>;

  /** Read-more — célula "Ler mais". Quando ativo, o conteúdo é truncado
   *  (1 linha + reticências por default, ou N linhas via `{ lines }`) e um
   *  gatilho "Ler mais" abre o texto completo num popover. Equivalente DS do
   *  `ReadMoreCell` legado. Aceita `true` (1 linha, label "Ler mais") ou um
   *  objeto `{ lines?, label? }`. Aplica-se ao render default ou ao `render`
   *  custom (o nó renderizado é envolvido). Ignorado em `type: "actions"`,
   *  células em edição e na coluna primária de tree-data. */
  readMore?: boolean | { lines?: number; label?: string };

  /** Copy-cell — ícone de copiar revelado no hover/foco da célula, com
   *  feedback "Copiado!" (~2s). Sem dependência nova (`navigator.clipboard`).
   *  Aceita `true` (copia o texto da célula) ou um objeto `{ value?, label? }`
   *  pra customizar o texto copiado (string) ou o aria-label do botão. Quando
   *  `value` é função, recebe a row. Ignorado em `type: "actions"`, células em
   *  edição e na coluna primária de tree-data. */
  copyable?:
    | boolean
    | { value?: string | ((row: T) => string); label?: string };

  /** Row expansion trigger — Fase F.4b. Quando true, células dessa coluna
   *  ganham chevron + cursor pointer e click toggla a expansão da row.
   *  Funciona apenas se DataTable também receber `renderRowExpansion`. */
  expandable?: boolean;

  /** Tree-data trigger — Fase F.4c. Quando true, esta é a coluna primária da
   *  árvore: suas células ganham indentação por nível + chevron expand/collapse
   *  + (opcional) contagem de descendentes. Funciona apenas se o DataTable
   *  receber `getTreeDataPath`. Se nenhuma coluna marcar `treeColumn: true`, o
   *  DataTable usa a primeira coluna não-`actions` automaticamente. */
  treeColumn?: boolean;

  /** Inline edit — Fase D.
   *  `editable: true` ativa edit-on-double-click. `editType` define o input
   *  (default deriva de `type`: number → number input, select-like → Select).
   *  Pra customizar o editor, passe `renderEdit`. */
  editable?: boolean;
  editType?: "text" | "number" | "select";
  /** Editor customizado. Recebe row + value atual + callbacks pra commit/cancel/onChange.
   *  Se omitido, DataTable renderiza editor default baseado em `editType`. */
  renderEdit?: (params: {
    row: T;
    value: unknown;
    onChange: (next: unknown) => void;
    onCommit: () => void;
    onCancel: () => void;
  }) => ReactNode;

  /** Totalizer — Fase E.2. Aparece no footer row quando DataTable tem `showTotalizers`.
   *  Built-in: 'sum' | 'avg' | 'count' | 'min' | 'max' (apenas para valores numericos).
   *  Custom: função recebe `rows` (em client mode = allPagesProcessed; em server mode =
   *  current page rows). Para server mode com agregacao global do dataset, use
   *  `DataTableProps.aggregateRow[field]` que sobrescreve a computacao local. */
  aggregate?:
    | "sum"
    | "avg"
    | "count"
    | "min"
    | "max"
    | ((rows: T[]) => ReactNode);
  /** Formatter aplicado ao resultado de `aggregate` built-in (sum/avg/min/max).
   *  Útil pra mostrar moeda/percentual em totalizer. Default: valueFormatter. */
  aggregateFormatter?: (value: number) => string;
};

/* ── Configs da DataTableProps ───────────────────────────────────── */

/** Formato de export disponivel no dropdown "Exportar". */
export type DataTableExportFormat = {
  /** Identificador unico (ex: "csv", "xlsx"). */
  id: string;
  /** Label exibido no dropdown (ex: "CSV", "Excel"). */
  label: ReactNode;
  /** Icone opcional. */
  icon?: ReactNode;
  /**
   * Handler customizado. Se omitido em "csv", usa o exportCsv interno
   * com escopos all/filtered/selected. Senao, e responsabilidade do consumer.
   */
  onSelect?: () => void;
};

/** Item do MoreMenu (⋯) padrao do toolbar. */
export type DataTableMoreMenuItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Marca o item como destructive (cor critical). */
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export type DataTableToolbarConfig = {
  title?: string;
  enableSearch?: boolean;
  /**
   * Botao Refresh visivel apos o search (server mode dispara refetch;
   * client mode pisca spinner por consistencia visual). Default `true`.
   */
  enableRefresh?: boolean;
  enableFilters?: boolean;
  enableColumns?: boolean;
  enableDensity?: boolean;
  /**
   * Dropdown "Exportar" no canto direito. `true` = ativo com CSV default.
   * Objeto = configuracao avancada (formatos custom + items append).
   */
  enableExport?: boolean | {
    /** Formatos disponiveis. Quando omitido, mostra so "CSV". */
    formats?: DataTableExportFormat[];
    /** Items adicionais (apend depois dos formatos). */
    items?: DataTableMoreMenuItem[];
  };
  /**
   * MoreMenu (⋯) no canto direito. Sem items, o botao nao renderiza.
   * Items aceitam icone, destructive, disabled.
   */
  moreMenu?: { items: DataTableMoreMenuItem[] };
  /** @deprecated — use `moreMenu.items` em vez disso. */
  customActions?: ReactNode;
  /**
   * Toggle de tela cheia na toolbar (botão ⤢). Quando `true`, o DataTable
   * renderiza um tool button que expande o container pra ocupar a viewport
   * inteira (overlay full-screen) e volta ao normal no segundo clique ou Esc.
   * Default `false`.
   */
  enableFullscreen?: boolean;
  /** Slot livre na esquerda apos search/refresh. Use pra inserir custom controls. */
  customLeft?: ReactNode;
  /**
   * View toggle slot (table/kanban segmented control). Quando `viewMode` +
   * `kanbanConfig` estão definidos, o DataTable auto-renderiza um
   * `<ToolbarSegmented>` padrão. Pra override, passe seu próprio ReactNode
   * aqui. Pra esconder explicitamente, passe `null`.
   *
   * Posição na toolbar: depois do divider que sucede Search/Refresh.
   */
  viewToggle?: ReactNode;
};

export type DataTablePaginationConfig = {
  enabled?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

export type DataTableSelectionConfig = {
  enabled?: boolean;
  enableGlobal?: boolean;
  actions?: (selectedIds: GridRowId[], clearSelection: () => void) => ReactNode;
};

/* ── DataTableProps principal ───────────────────────────────────── */

export type DataTableProps<T> = {
  /** Dados client mode. NÃO passar junto com `fetchData` — quando ambos presentes, `fetchData` ganha. */
  rows?: T[];
  /** Server mode — quando definido, o DataTable delega filter/sort/pagination ao servidor.
   *  A função deve ser estável (`useCallback`) pra evitar refetch em loop. */
  fetchData?: (params: GridFetchParams) => Promise<GridFetchResult<T>>;
  /** Total externo (server mode opcional). Quando undefined, usa o `total` retornado por `fetchData`. */
  rowCount?: number;
  columns: DataTableColumnDef<T>[];
  /** Função pra extrair id da row. Default: row.id */
  getRowId?: (row: T) => GridRowId;

  /**
   * Grab-to-scroll horizontal — arrastar o corpo da tabela (mouse/pen) pra
   * rolar lateralmente, equivalente ao `useGrabToScroll` legado. Um arrasto só
   * inicia após cruzar um threshold (~6px), preservando clique/seleção de
   * célula; o scroll por roda do mouse permanece intacto. Pulado em touch
   * (scroll nativo já funciona). Default `false`.
   */
  grabToScroll?: boolean;

  /**
   * Auto-fit das colunas ao container. Quando true (default), o DataTable
   * observa o container via ResizeObserver e:
   *   1) Mede o conteúdo das primeiras N rows (canvas) pra calcular width ideal
   *   2) Distribui espaço sobrando entre colunas SEM `col.width` explícito
   *
   * Colunas com `col.width` definido pelo consumer mantêm largura fixa.
   * Resize manual pelo usuário sobrescreve o auto-fit (drag "trava" a coluna).
   *
   * Para desativar e manter widths estáticos (comportamento legacy), passe `false`.
   * Default: `true`.
   */
  autoFit?: boolean;

  /** Toolbar config (default: tudo enabled) */
  toolbar?: DataTableToolbarConfig;

  /** Paginação config */
  paginationConfig?: DataTablePaginationConfig;

  /** Selection config */
  selectionConfig?: DataTableSelectionConfig;

  /** Visual */
  density?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  /** Override dos items do toggle de density. Default 3 items (compact/standard/comfortable).
   *  Use pra customizar ícones/labels ou esconder algum modo. */
  densityItems?: ToolbarSegmentedItem<TableDensity>[];
  cardBreakpoint?: number | false;
  className?: string;

  /**
   * Sort controlado. Aceita single (1 criterio) ou array (multi-sort).
   * Array vazio = sem sort. Callback sempre retorna array.
   */
  sortModel?: SortModel | SortModel[] | null;
  onSortModelChange?: (model: SortModel[]) => void;

  /** Paginação controlada */
  paginationModel?: PaginationModel;
  onPaginationModelChange?: (model: PaginationModel) => void;

  /** Selection controlada */
  selectionModel?: GridSelectionState;
  onSelectionModelChange?: (model: GridSelectionState) => void;

  /** Filters controlados */
  filterModel?: FilterModel;
  onFilterModelChange?: (model: FilterModel) => void;

  /** Lista de field names que devem aparecer como chips placeholder nativos na
   *  toolbar — visíveis desde o load inicial mesmo sem valor preenchido.
   *  Cada field listado renderiza um chip mostrando APENAS o nome da coluna
   *  (sem operador, sem value), pronto pra usuário clicar e preencher.
   *
   *  Use case: dashboards onde o set de filtros relevantes é conhecido de
   *  antemão (ex: Status, Categoria, Atribuído) — reduz cliques de
   *  "abrir popover de Filtros + adicionar filtro" pra zero.
   *
   *  Comportamento:
   *   - Chip placeholder fica visível enquanto a coluna NÃO tem filtro com valor
   *     no `filterModel`. Quando user preenche valor (via click no chip ou via
   *     popover de Filtros), o chip vira um filtro normal e o "placeholder" some
   *     automaticamente. Quando user remove o valor (X), o placeholder reaparece.
   *   - Items vazios persistentes NÃO aparecem no popover de Filtros (esse
   *     popover lista apenas filtros reais com valor no filterModel).
   *   - Cleanup automático de filtros vazios em outras situações é PRESERVADO
   *     intacto — esta prop só adiciona chips placeholders extras na toolbar.
   *   - Quando user clica no X de um chip placeholder, ele é "descartado" pra
   *     a sessão (state interno do componente). Pra trazer de volta, reload.
   *
   *  Implementação: lista de fields é prop pura — não modifica `filterModel`.
   */
  showEmptyFilterChips?: string[];

  /**
   *  Configuração do drawer de Filtros (funil). O botão funil da toolbar abre um
   *  drawer lateral com TODOS os filtros em lista vertical (1 linha por coluna,
   *  widget do registry, aplicação LIVE — operator inferido do filterType). O
   *  query builder avançado (AND/OR + operadores explícitos + SQL) vive no menu
   *  de Configurações da toolbar.
   *
   *  Prop OPCIONAL — só pra customizar o drawer; o funil aparece sempre que
   *  `toolbar.enableFilters !== false` e há colunas filtráveis.
   */
  simpleFilter?: {
    /**
     * Fields que NÃO devem aparecer no drawer (mesmo sendo filtráveis).
     * Útil pra ocultar filtros que só fazem sentido no advanced. Default [].
     */
    hiddenFields?: string[];
    /** Override do título do drawer. Default "Filtros". */
    title?: string;
    /** Tamanho do drawer. Default "md" (400px). */
    size?: "sm" | "md" | "lg" | "xl";
  };

  /** Search controlado */
  search?: string;
  onSearchChange?: (search: string) => void;

  /** Row callbacks */
  onRowClick?: (row: T) => void;
  onRowChange?: (row: T) => void;
  getRowClassName?: (params: { row: T; index: number }) => string;

  /** Inline edit — Fase D.
   *  Disparado no commit (Enter/blur) de uma celula editavel.
   *  Pode retornar Promise<void> — Fase F.1: DataTable mostra spinner na cell
   *  enquanto await, mantem edit mode aberto, e fecha apenas no resolve.
   *  No reject, edit mode fica aberto pro user corrigir/cancelar.
   *  Em server mode: chame seu endpoint PUT/PATCH aqui retornando a Promise.
   *  Em client mode: aplique mutacao sincrona no array de `rows`. */
  onCellEditCommit?: (params: {
    id: GridRowId;
    field: string;
    value: unknown;
    oldValue: unknown;
    row: T;
  }) => void | Promise<void>;

  /** Totalizers footer — Fase E.2. Quando true, renderiza row sticky no fim do body
   *  com agregacoes definidas por `column.aggregate`. */
  showTotalizers?: boolean;
  /** Server-mode override: valores pre-computados por coluna (field → ReactNode).
   *  Quando definido pra um field, ignora `column.aggregate` e usa esse valor.
   *  Use pra mostrar agregacoes globais do dataset (sum de TODAS as rows, nao
   *  apenas as da pagina atual). */
  aggregateRow?: Record<string, ReactNode>;

  /** Virtualização — Fase F.3. Quando true, renderiza apenas as rows visíveis
   *  na viewport (+ buffer) via @tanstack/react-virtual. Recomendado pra >500 rows.
   *  Trade-off: row heights ficam fixas (deriva de density). Default false. */
  virtualize?: boolean;
  /** Override do tamanho estimado de row em px (default deriva de density:
   *  compact=40, standard=56, comfortable=64). */
  estimateRowHeight?: number;
  /** Rows extras renderizadas antes/depois da viewport pra suavizar scroll. Default 10. */
  overscan?: number;

  /** Agrupamento — Fase F.4. Field pelo qual agrupar as rows (controlled).
   *  Quando definido: rows são reorganizadas em grupos com headers expansíveis.
   *  Compatível com virtualize, search, filter, sort. Pagination é desligada
   *  automaticamente. V1 = 1 field; nested fica pra V2.
   *
   *  Padrão controlled/uncontrolled: passe `groupBy` + `onGroupByChange` (controlled)
   *  OU `defaultGroupBy` (uncontrolled). Sem nenhum dos dois, não há agrupamento.
   *  Saved views podem alternar groupBy via `applyView` (sempre dispara o callback). */
  groupBy?: string;
  /** Valor inicial de groupBy quando uncontrolled (sem `groupBy` prop). */
  defaultGroupBy?: string;
  /** Callback quando groupBy muda (controlled OU saved view aplica). */
  onGroupByChange?: (groupBy: string | undefined) => void;
  /** Quando true, todos os grupos iniciam expandidos. Default true. */
  defaultGroupExpanded?: boolean;
  /** Override do header do grupo — recebe `group` (label/count/rows/isExpanded)
   *  + `toggle()`. Retorna ReactNode que substitui o layout default (column-aligned).
   *  Use pra free-form: title customizado, ações inline, badges, etc.
   *  Sem este prop, o default é column-aligned com chevron + label + count +
   *  subtotalizers nas cells correspondentes. */
  renderGroupHeader?: (params: {
    group: {
      key: string;
      field: string;
      value: unknown;
      label: string;
      count: number;
      isExpanded: boolean;
    };
    toggle: () => void;
  }) => ReactNode;
  /** Override do conteúdo do grupo quando expandido — recebe `group` com
   *  as rows do grupo. Retorna ReactNode que ocupa row inteira (não alinhado
   *  às colunas). Use pra sub-tabela, lista, cards, qualquer coisa.
   *  Sem este prop, default = renderizar cada row como TableRow normal
   *  (mesmas colunas da tabela principal). */
  renderGroupContent?: (params: {
    group: {
      key: string;
      field: string;
      value: unknown;
      label: string;
      count: number;
      rows: T[];
    };
  }) => ReactNode;

  /** Row expansion — Fase F.4b. Quando definido, click numa cell de coluna
   *  `expandable: true` abre slot expandido abaixo da row com conteúdo livre.
   *  Mutuamente exclusivo com `groupBy` (groupBy tem precedência se ambos). */
  renderRowExpansion?: (params: { row: T }) => ReactNode;
  /**
   * IDs controladas de rows expandidas. Quando passado, expansion fica
   * controlled — consumer responsável por atualizar via `onExpandedRowIdsChange`.
   * Quando omitido, primitive usa state interno (uncontrolled).
   */
  expandedRowIds?: GridRowId[];
  /** Valor inicial de rows expandidas quando uncontrolled. Default `[]`. */
  defaultExpandedRowIds?: GridRowId[];
  /** Callback quando o set de rows expandidas muda (toggle, single-expand, view aplicada). */
  onExpandedRowIdsChange?: (ids: GridRowId[]) => void;
  /** Quando true, abrir uma row colapsa as demais. Default false (múltiplas abertas). */
  singleExpand?: boolean;

  /* ── Tree-data (hierarquia multi-nível) — Fase F.4c ─────────────── */

  /**
   * Tree-data hierárquico multi-nível (padrão AG Grid). Recebe uma row FLAT e
   * retorna o caminho hierárquico dela (ex: `["Ana"]`, `["Ana", "Bruno"]`,
   * `["Ana", "Bruno", "Carla"]`). O DataTable reconstrói a árvore a partir
   * desses caminhos e renderiza:
   *   - Indentação por nível na coluna primária (ver `treeColumn`)
   *   - Chevron expand/collapse por nó com filhos
   *   - (Opcional) contagem de descendentes via `treeData.showDescendantCount`
   *
   * As rows continuam FLAT no `rows` prop — apenas o caminho define a hierarquia.
   * Compatível com search/filter/sort (operam sobre as rows; a árvore é
   * reconstruída do resultado). **Pagination é desligada automaticamente** —
   * paginar quebraria a hierarquia. Em server-mode tree-data não é suportado
   * (passe todas as rows do escopo via `rows` + `virtualize`).
   *
   * Mutuamente exclusivo com `groupBy` e `renderRowExpansion` — se mais de um
   * estiver definido, a precedência é `groupBy` > `getTreeDataPath` >
   * `renderRowExpansion`.
   *
   * O estado de expansão dos nós reusa `expandedRowIds` / `defaultExpandedRowIds`
   * / `onExpandedRowIdsChange` (mesma máquina de row-expansion).
   */
  getTreeDataPath?: (row: T) => Array<string | number>;
  /** Ajustes do modo tree-data. */
  treeData?: {
    /**
     * Mostra a contagem de descendentes ao lado do label do nó (ex: "Ana (12)").
     * Default `false`.
     */
    showDescendantCount?: boolean;
    /**
     * Estado de expansão default dos nós com filhos. `true` = árvore inteira
     * começa aberta; `false` = só as raízes aparecem. Default `true`.
     */
    defaultExpanded?: boolean;
  };

  /** Slots de feedback custom */
  renderEmpty?: ReactNode;
  renderLoading?: ReactNode;
  renderNoResults?: ReactNode;
  /** Loading externo (sem fetchData ainda — útil pra estados iniciais). */
  loading?: boolean;

  /**
   * Opt-in pra persistir estado da tabela no localStorage (schema v4 — workspace "Default").
   * Persiste: density, sortModel, pageSize, currentPage, columnWidths, pinnedColumns,
   * hiddenColumns, columnOrder, filterModel, search, viewMode, groupBy, expandedRowIds,
   * lastActiveViewId. Ver `hooks/state-persistence-utils.ts` (fonte de verdade do shape).
   * Use ids estaveis por tela (ex: "clients-table"). Chame `ref.current.resetPersistedState()` pra limpar.
   */
  persistId?: string;

  /**
   * Service para Saved Views — opt-in. Default: mock que usa localStorage.
   * Pra producao, passar adapter que chama API REST. Requer persistId pra escopo.
   */
  savedViewsService?: SavedViewsService;

  /**
   * Views pre-definidas pelo desenvolvedor — sempre aparecem antes das views
   * criadas pelo usuario, nao podem ser editadas/deletadas. Use pra configurar
   * presets contextuais (ex: "Ativos", "Inadimplentes", "Mensal").
   *
   * Aparecem como tabs apos a "Default" e antes das `userViews`. Cada preset
   * deve ter `id` unico estavel (recomendado prefixo `preset:`).
   */
  defaultViews?: DataTablePresetView[];

  /* ── View mode (table OR kanban) ──────────────────────────────── */

  /**
   * Modo de visualização — `"table"` (default) ou `"kanban"`. Pode ser
   * controlado (passar `viewMode` + `onViewModeChange`) ou uncontrolled
   * (passar `defaultViewMode`). Quando `"kanban"`, requer `kanbanConfig`.
   */
  viewMode?: DataTableViewMode;
  /** Modo inicial pra uso uncontrolled. Default: `"table"`. */
  defaultViewMode?: DataTableViewMode;
  /** Callback quando o consumer alterna a view. */
  onViewModeChange?: (mode: DataTableViewMode) => void;
  /**
   * Configuração da view Kanban — obrigatório quando `viewMode="kanban"`.
   * Veja `DataTableKanbanConfig` para detalhes.
   */
  kanbanConfig?: DataTableKanbanConfig<T>;
};

/** View pre-definida pelo dev (read-only) — passada via prop `defaultViews`.
 *  Shape de `state` é **idêntico** a `SavedView["state"]` (type unificado
 *  `DataTableSavedViewState`) — presets e saved views são interoperáveis. */
export type DataTablePresetView = {
  /** Id unico e estavel — sugerido prefixo `preset:` (ex: "preset:ativos"). */
  id: string;
  /** Label da view no tab e no popover. */
  name: string;
  /** Estado completo capturado (mesmo shape de SavedView.state). */
  state: import("./services/saved-views.types").DataTableSavedViewState;
};

/* ── Snapshot completo do estado (pra DataTableRef.getState) ────── */

export type DataTableState = {
  density: TableDensity;
  /** Multi-sort: array de criterios. */
  sortModel: SortModel[];
  paginationModel: PaginationModel;
  selectionModel: GridSelectionState;
  filterModel: FilterModel;
  search: string;
  columnWidths: Record<string, number>;
  pinnedColumns: Record<string, ColumnPinned>;
  hiddenColumns: Set<string>;
  columnOrder: string[];
};

export type DataTableRef = {
  /** No-op em client mode (server mode dispara refetch). */
  refresh: () => void;
  getState: () => DataTableState;
  getSelectedIds: () => GridRowId[];
  getSelectedCount: () => number;
  clearSelection: () => void;
  /** Dispara o download CSV no escopo escolhido (mesma logica do dropdown Exportar). */
  exportCsv: (scope: "all" | "filtered" | "selected") => void;
  /** Limpa o estado persistido no localStorage (no-op se persistId nao foi passado). */
  resetPersistedState: () => void;
  /**
   * Tree-data: expande TODOS os nós da árvore de uma vez. No-op quando a tabela
   * não está em modo tree-data (sem `getTreeDataPath`). Opera sobre todas as
   * rows pós-filtro/sort (tree-data desliga paginação), respeitando
   * `treeData.defaultExpanded`. Pareia com `collapseAllTree`.
   */
  expandAllTree: () => void;
  /**
   * Tree-data: recolhe TODOS os nós da árvore de uma vez. No-op quando a tabela
   * não está em modo tree-data (sem `getTreeDataPath`). Pareia com `expandAllTree`.
   */
  collapseAllTree: () => void;
};
