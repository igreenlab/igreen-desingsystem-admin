import { useMemo, useState } from "react";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableKanbanConfig,
  type DataTableViewMode,
  type FilterModel,
  columnTypeRegistry,
  MultiSelectDropdown,
  MultiSelectFieldDropdown,
  presetView,
} from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { Switch } from "@/components/shadcn/switch";
import {
  CLIENTS_MOCK,
  STATUSES,
  AGENTS,
  formatCurrency,
  type ClientRow,
} from "./TableDoc";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

/* ── TOC ─────────────────────────────────────────────────────── */

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick start" },
  { id: "view-mode", label: "ViewMode (Table × Kanban × Lista)" },
  { id: "saved-views", label: "Saved Views & Presets" },
  { id: "server-mode", label: "Server mode" },
  { id: "features", label: "Features built-in" },
  { id: "custom-filter", label: "Widget de filtro próprio" },
  { id: "drawer-controlado", label: "Drawer de filtros controlado" },
  { id: "header-actions", label: "Ações do cabeçalho" },
  { id: "api", label: "API Reference" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

/* ── Saved views — campos capturados ────────────────────────── */

const SAVED_VIEW_FIELDS: Array<{
  field: string;
  type: string;
  captured: string;
}> = [
  { field: "filterModel", type: "FilterModel", captured: "✅ Sempre" },
  { field: "sortModel", type: "SortModel[]", captured: "✅ Sempre" },
  {
    field: "density",
    type: "'compact'|'standard'|'comfortable'",
    captured: "✅ Sempre",
  },
  {
    field: "columnWidths",
    type: "Record<field, number>",
    captured: "✅ Quando customizado",
  },
  {
    field: "pinnedColumns",
    type: "Record<field, 'left'|'right'>",
    captured: "✅ Quando há pin",
  },
  { field: "hiddenColumns", type: "string[]", captured: "✅ Quando há oculta" },
  { field: "columnOrder", type: "string[]", captured: "✅ Quando reordenado" },
  { field: "viewMode", type: "'table' | 'kanban' | 'list'", captured: "✅ NOVO" },
  { field: "groupBy", type: "string | undefined", captured: "✅ NOVO" },
  { field: "expandedRowIds", type: "GridRowId[]", captured: "✅ NOVO" },
  { field: "search", type: "string", captured: "❌ Volátil (sessão)" },
  {
    field: "paginationModel",
    type: "{ page, pageSize }",
    captured: "❌ Volátil (reseta ao filtrar)",
  },
  {
    field: "selectionModel",
    type: "GridSelectionState",
    captured: "❌ Volátil (sessão)",
  },
];

/* ── Mock dataset (pequeno pra demo) ──────────────────────────── */

const DEMO_ROWS: ClientRow[] = CLIENTS_MOCK.slice(0, 8);

/* ── Capabilities matrix ──────────────────────────────────────── */

const CAPABILITIES: Array<{ name: string; how: string }> = [
  {
    name: "Ações do cabeçalho (funil, menu, ícone)",
    how: 'enableHeaderFilter: false na coluna esconde SÓ o funil (menu e filtro seguem) · enableColumnMenu: false esconde o menu INTEIRO, com Fixar e Ocultar — não use pra tirar só o funil · showTypeIcons={false} (prop raiz) desliga o ícone do tipo. "Ordenar" só aparece no menu de coluna ordenável. Ver "Ações do cabeçalho".',
  },
  {
    name: "Sort multi-coluna",
    how: "sortable: true por coluna; toolbar mostra SortPopover quando há ≥ 1 sortable",
  },
  {
    name: "Filter chip rápido",
    how: "enableColumnFilter + filterType (text/number/date/select/multiSelect/boolean)",
  },
  {
    name: "Filter avançado (AND/OR)",
    how: "Auto-habilitado se há ≥ 1 coluna com enableColumnFilter",
  },
  {
    name: "Search global",
    how: "toolbar.enableSearch (default true), debounced 500ms",
  },
  {
    name: "Pagination",
    how: "paginationConfig.initialPageSize/pageSizeOptions (10/25/50/100)",
  },
  {
    name: "Selection (bulk)",
    how: "selectionConfig.enabled + enableGlobal (modo include/exclude)",
  },
  {
    name: "Column popover",
    how: "Show/hide, pin (left/right), reorder via drag",
  },
  {
    name: "Density toggle",
    how: "compact/standard/comfortable; densityItems pra override",
  },
  {
    name: "Inline edit",
    how: "editable: true por coluna + onCellEditCommit (suporta Promise + reject + retry)",
  },
  {
    name: "Column types registry",
    how: "type: 'currency' | 'email' | 'status' | ... resolve render/filter/format",
  },
  {
    name: "Widget de filtro próprio (chip multi)",
    how: "tipo registrado no columnTypeRegistry com ownsMulti: true — o chip multi inteiro passa a ser do tipo (colar lista, atalhos…) e o value chega SEMPRE como array. Monte com MultiSelectDropdown (chip) + MultiSelectFieldDropdown (modal avançado). Ver 'Widget de filtro próprio' abaixo",
  },
  { name: "Virtualização", how: "virtualize: true (recomendado > 500 rows)" },
  {
    name: "Row grouping",
    how: "groupBy: 'field' + renderGroupHeader/Content (column-aligned ou freeform)",
  },
  {
    name: "Row expansion",
    how: "renderRowExpansion + column.expandable: true",
  },
  {
    name: "Totalizers footer",
    how: "showTotalizers + column.aggregate ('sum'|'avg'|'count'|...) + aggregateFormatter",
  },
  {
    name: "Server mode",
    how: "fetchData em vez de rows; refetch automático em mudança de params",
  },
  {
    name: "Saved views",
    how: "persistId + savedViewsService (default: localStorage mock) + defaultViews",
  },
  {
    name: "Persist state",
    how: "persistId — density/sort/columnWidths/pinned/hidden em localStorage",
  },
  {
    name: "Export",
    how: "toolbar.enableExport: true OU { formats, items }; ref.current.exportCsv(scope)",
  },
  {
    name: "Ações custom no toolbar",
    how: "toolbar.actions: ToolbarAction[] (button/dropdown/input, ex.: seletor de período) — inline no desktop, ⋯ no mobile. Ver #/table-toolbar",
  },
  {
    name: "Coluna de ações (por row)",
    how: 'type: "actions" + getActions (ou o builder actionColumn). É o type que garante as 3 coisas: última coluna, ancorada à direita e fora do rateio do autoFit — coluna de botões montada na unha não recebe nenhuma. Largura derivada do nº de ações (30n+14): 1→44px, 2→74px, 3→104px, 4+ colapsam no "…" (44px). showInMenu: true em algum item desliga o automático e respeita seu split.',
  },
  {
    name: "View mode (Kanban)",
    how: "viewMode + kanbanConfig — alterna entre Table e Kanban com mesma fonte de dados",
  },
  {
    name: "View mode (Lista)",
    how: "viewMode='list' + listConfig={{ renderItem, hierarchical?, getMenuItems? }} — toggle Tabela/Lista na toolbar; corpo vira <List> com as rows processadas. hierarchical + getTreeDataPath = árvore. Ver #/clients-list-view",
  },
  {
    name: "Card responsivo (mobile)",
    how: "cardBreakpoint (default 768). Abaixo do breakpoint, rows viram TableCardRow automaticamente. Toolbar/footer continuam intactos.",
  },
  {
    name: "Keyboard nav",
    how: "Setas/Home/End/PgUp/PgDn no body; Enter ativa onRowClick; auto-incluído",
  },
];

/* ── Props tables ─────────────────────────────────────────────── */

const CORE_PROPS = [
  { name: "rows", type: "T[]", defaultVal: "—" },
  {
    name: "fetchData",
    type: "(params: GridFetchParams) => Promise<GridFetchResult<T>>",
    defaultVal: "—",
  },
  { name: "columns", type: "DataTableColumnDef<T>[]", defaultVal: "—" },
  { name: "getRowId", type: "(row: T) => GridRowId", defaultVal: "row.id" },
  { name: "rowCount", type: "number (server mode opcional)", defaultVal: "—" },
  { name: "cardBreakpoint", type: "number | false", defaultVal: "768 (px)" },
  {
    name: "virtualize",
    type: "boolean",
    defaultVal: "false (recomendado em listas > 500 rows)",
  },
  {
    name: "autoFit",
    type: "boolean — mede o header inteiro como piso e distribui a sobra proporcionalmente (col.width vira base/piso, não trava)",
    defaultVal: "true (false = widths estáticos legacy)",
  },
  {
    name: "grabToScroll",
    type: "boolean — NATIVO: arrastar o corpo (mouse/pen) rola lateralmente após ~6px de threshold; pulado em touch. Passe false pra desabilitar",
    defaultVal: "true",
  },
  {
    name: "showTypeIcons",
    type: "boolean — mostra o ícone do tipo no cabeçalho (o do tipo registrado OU o `icon` da coluna). false desliga os dois e os 21px que reservavam no autoFit",
    defaultVal: "true",
  },
  {
    name: "simpleFilter.open",
    type: "boolean — abertura CONTROLADA do drawer do funil. Presente: a prop manda e o funil/X/Esc/backdrop passam a só avisar. Passar sem onOpenChange prende o drawer (console.warn em DEV)",
    defaultVal: "— (ausente = estado interno)",
  },
  {
    name: "simpleFilter.onOpenChange",
    type: "(open: boolean) => void — avisado quando algo pede pra abrir ou fechar o drawer. Dispara nos DOIS modos: sem `open`, só observa",
    defaultVal: "—",
  },
];

const TOOLBAR_PROPS = [
  { name: "toolbar.title", type: "string", defaultVal: "—" },
  { name: "toolbar.enableSearch", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableRefresh", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableFilters", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableColumns", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableDensity", type: "boolean", defaultVal: "true" },
  {
    name: "toolbar.enableExport",
    type: "boolean | { formats?, items? }",
    defaultVal: "false",
  },
  {
    name: "toolbar.actions",
    type: "ToolbarAction[] — ações custom (button/dropdown/input)",
    defaultVal: "—",
  },
  {
    name: "toolbar.moreMenu",
    type: "{ items: DataTableMoreMenuItem[] }",
    defaultVal: "—",
  },
  {
    name: "toolbar.viewToggle",
    type: "ReactNode",
    defaultVal: "auto (se viewMode + kanbanConfig)",
  },
  {
    name: "toolbar.customLeft",
    type: "ReactNode — componente livre, entre o refresh e a busca",
    defaultVal: "—",
  },
];

const COLUMN_DEF_PROPS = [
  {
    name: "field",
    type: "keyof T | string (dot-path 'user.name')",
    defaultVal: "—",
  },
  { name: "headerName", type: "string", defaultVal: "—" },
  {
    name: "type",
    type: "'text'|'number'|'currency'|'date'|'email'|'phone'|'status'|'badge'|'user'|'actions'|...",
    defaultVal: "—",
  },
  {
    name: "width / minWidth / maxWidth / flex",
    type: "number",
    defaultVal: "—",
  },
  { name: "pinned", type: "'left' | 'right'", defaultVal: "—" },
  {
    name: "align",
    type: "'left' | 'center' | 'right'",
    defaultVal: "auto (deriva de type)",
  },
  {
    name: "sortable",
    type: "boolean — false tira o ordenar do header E o 'Ordenar crescente/decrescente' do menu da coluna",
    defaultVal: "true",
  },
  { name: "hideable", type: "boolean", defaultVal: "true" },
  { name: "resizable", type: "boolean", defaultVal: "true" },
  { name: "enableColumnFilter", type: "boolean", defaultVal: "false" },
  {
    name: "enableHeaderFilter",
    type: "boolean — false esconde SÓ o funil do cabeçalho; o menu da coluna e o filtro (chips, painel, filterModel) continuam. Só vale com enableColumnFilter",
    defaultVal: "true",
  },
  {
    name: "enableColumnMenu",
    type: "boolean — false esconde o menu 3-pontos INTEIRO (Ordenar, Fixar, Ocultar, extras). Pra tirar só o funil, use enableHeaderFilter",
    defaultVal: "true",
  },
  {
    name: "filterType",
    type: "'text'|'select'|'multiSelect'|'date'|'boolean'|'number'",
    defaultVal: "—",
  },
  { name: "render", type: "({ row, value }) => ReactNode", defaultVal: "—" },
  {
    name: "valueGetter / valueFormatter",
    type: "(row) => any / (value) => string",
    defaultVal: "—",
  },
  { name: "editable", type: "boolean", defaultVal: "false" },
  {
    name: "copyable",
    type: "boolean | { value?: string | (row) => string; label? } — ícone copiar revelado no hover/foco da célula + feedback 'Copiado!' (~2s, navigator.clipboard). value customiza o texto copiado; label o aria-label",
    defaultVal: "false",
  },
  { name: "readMore", type: "boolean | { lines?, label? } — trunca + popover 'Ler mais'", defaultVal: "false" },
  {
    name: "expandable",
    type: "boolean (trigger row expansion)",
    defaultVal: "false",
  },
  {
    name: "aggregate",
    type: "'sum'|'avg'|'count'|'min'|'max' | (rows) => ReactNode",
    defaultVal: "—",
  },
  {
    name: "isPrimary",
    type: "boolean (título no card mode)",
    defaultVal: "auto (1ª coluna não-actions)",
  },
];

const KANBAN_CONFIG_PROPS = [
  { name: "groupByField", type: "keyof T | string — define as COLUNAS do board", defaultVal: "—" },
  {
    name: "ungroupedLaneLabel",
    type: 'string | null — rótulo da raia dos cards sem valor no `groupBy`. `null` esconde a raia. ⚠️ O eixo da raia é o **`groupBy` do DataTable**, não uma prop daqui: o mesmo estado que agrupa linhas na tabela agrupa cards no board, e por isso entra nas saved views de graça. Sem `groupBy`, board plano',
    defaultVal: '"Sem grupo"',
  },
  {
    name: "columns",
    type: "KanbanColumn[]",
    defaultVal: "auto-deriva de valores únicos",
  },
  {
    name: "renderCard",
    type: "({ row }) => Omit<KanbanCardData, 'id'|'columnId'>",
    defaultVal: "—",
  },
  {
    name: "renderCardContent",
    type: "({ card, row, selected, open }) => ReactNode",
    defaultVal: "—",
  },
  { name: "openCardId", type: "string", defaultVal: "—" },
  {
    name: "onAddCard / onAddInFooter / hideFooterAdd",
    type: "(columnId) => void",
    defaultVal: "—",
  },
  {
    name: "getCardMenuItems / getColumnMenuItems",
    type: "(row|column) => KanbanMenuItem[]",
    defaultVal: "—",
  },
  {
    name: "onCardMenu / onColumnMenu",
    type: "manual callbacks (escape hatch)",
    defaultVal: "—",
  },
  {
    name: "enableDnD / onCardMove",
    type: "boolean + (cardId, from, to) => void | Promise",
    defaultVal: "false",
  },
];

const LIST_CONFIG_PROPS = [
  {
    name: "renderItem",
    type: "(row, { depth, open }) => ReactNode",
    defaultVal: "—",
  },
  { name: "hierarchical", type: "boolean", defaultVal: "false" },
  {
    name: "getPath",
    type: "(row) => (string|number)[]",
    defaultVal: "getTreeDataPath (fallback)",
  },
  { name: "defaultExpanded", type: "boolean", defaultVal: "true" },
  {
    name: "paginated",
    type: "boolean — pagina a view Lista flat (mesma paginação da tabela + footer); ignorado quando hierarchical",
    defaultVal: "false (mostra todas as rows processadas)",
  },
  { name: "getMenuItems", type: "(row) => ListMenuItem[]", defaultVal: "—" },
];

/* ── Troubleshooting ──────────────────────────────────────────── */

const TROUBLESHOOTING: Array<{ symptom: string; cause: string; fix: string }> =
  [
    {
      symptom: "Tabela re-renderiza inteira a cada digit",
      cause: "columns não memoizado",
      fix: "Wrap em useMemo(() => [...], [deps])",
    },
    {
      symptom: "Filter chip não aparece",
      cause: "Coluna sem enableColumnFilter",
      fix: "Adicionar enableColumnFilter: true",
    },
    {
      symptom: "Sort não funciona",
      cause: "Coluna sem sortable",
      fix: "sortable: true (default true; provavelmente false explícito)",
    },
    {
      symptom: "Server mode loop infinito",
      cause: "fetchData não memoizado",
      fix: "useCallback(fetchData, [deps])",
    },
    {
      symptom: "Virtualização 'pula'",
      cause: "estimateRowHeight muito diferente do real",
      fix: "Ajustar (compact=40, standard=56, comfortable=64)",
    },
    {
      symptom: "Inline edit não fecha",
      cause: "onCellEditCommit retornou Promise<reject>",
      fix: "Edit fica aberto pro user corrigir — comportamento esperado (Fase F.1)",
    },
    {
      symptom: "Saved views não persiste",
      cause: "persistId ausente OU savedViewsService mock em prod",
      fix: "Adicionar persistId + implementar SavedViewsService real",
    },
    {
      symptom: "Kanban view não aparece",
      cause: "viewMode='kanban' sem kanbanConfig",
      fix: "kanbanConfig é obrigatório quando viewMode='kanban'",
    },
    {
      symptom: "DnD do Kanban não comita",
      cause: "Consumer não atualiza rows props no onCardMove",
      fix: "Optimistic update: setRows(prev => prev.map(...))",
    },
  ];

/* ── Widget de filtro próprio (ownsMulti) ─────────────────────── */

/**
 * Tipo registrado SÓ pra demonstrar o escape hatch na seção "Widget de filtro próprio".
 *
 * O `columnTypeRegistry` é um singleton global e vale pro showcase inteiro, então o nome é
 * próprio de propósito (não sobrescreve nenhum tipo do DS) e o registro é guardado por
 * `has()` — sem isso, cada reavaliação do módulo (HMR) avisa "já registrado" no console.
 */
const TIPO_MULTI_PROPRIO = "docMultiProprio";

if (!columnTypeRegistry.has(TIPO_MULTI_PROPRIO)) {
  columnTypeRegistry.register({
    ...columnTypeRegistry.get("multiSelect"), // operadores, matchesFilter, texto do chip
    type: TIPO_MULTI_PROPRIO,
    ownsMulti: true, // value chega como ARRAY, sempre — mesmo com 1 item
    renderFastFilterInput: (p) => (
      <div>
        {/* o popover do chip é p-0: o MultiSelectDropdown traz o próprio padding,
            então o que é do consumidor precisa trazer o dele */}
        <div className="flex flex-col gap-gp-xs px-pad-md pt-pad-md">
          <p className="text-caption-md text-fg-muted">
            value = {JSON.stringify(p.value)}
          </p>
          <Button
            color="secondary"
            variant="ghost"
            size="2xs"
            className="self-start"
            onClick={() => p.onChange(["active"])}
          >
            Só ativos
          </Button>
        </div>
        <MultiSelectDropdown {...p} />
      </div>
    ),
    renderFilterInput: (p) => <MultiSelectFieldDropdown {...p} />,
  });
}

/* ── Página ───────────────────────────────────────────────────── */

export function DataTableDoc() {
  const [rows, setRows] = useState<ClientRow[]>(DEMO_ROWS);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
  // Controlado de propósito: o chip já nasce aplicado, e o widget próprio mostra o `value`
  // que recebe (a lista inteira, em array).
  const [filtroProprio, setFiltroProprio] = useState<FilterModel>({
    logicOperator: "AND",
    items: [
      {
        id: "doc-f1",
        field: "statusId",
        operator: "isAnyOf",
        value: ["active", "pending"],
      },
    ],
  });

  // Interruptor do exemplo "Ações do cabeçalho" — liga/desliga `showTypeIcons` ao vivo.
  const [iconesDoTipo, setIconesDoTipo] = useState(true);

  // Exemplo "Drawer de filtros controlado": o estado do funil mora NA TELA, não no
  // DataTable. É o que `simpleFilter.open`/`onOpenChange` tornaram possível — antes
  // o drawer só abria pelo botão de funil da própria toolbar.
  const [funilAberto, setFunilAberto] = useState(false);
  const [ultimoAvisoDoFunil, setUltimoAvisoDoFunil] = useState<string | null>(null);

  const basicColumns = useMemo<DataTableColumnDef<ClientRow>[]>(
    () => [
      { field: "id", headerName: "ID", type: "text", width: 110 },
      { field: "name", headerName: "Nome", type: "user", sortable: true },
      { field: "email", headerName: "Email", type: "email" },
      {
        field: "statusId",
        headerName: "Status",
        type: "status",
        enableColumnFilter: true,
        filterType: "multiSelect",
        filterOptions: Object.entries(STATUSES).map(([v, s]) => ({
          value: v,
          label: s.label,
          color: "neutral",
        })),
      },
      {
        field: "value",
        headerName: "Valor",
        type: "currency",
        sortable: true,
        aggregate: "sum",
      },
    ],
    [],
  );

  const filtroProprioColumns = useMemo<DataTableColumnDef<ClientRow>[]>(
    () => [
      { field: "name", headerName: "Nome", type: "user" },
      {
        field: "statusId",
        headerName: "Status",
        type: "status",
        enableColumnFilter: true,
        filterType: TIPO_MULTI_PROPRIO, // aponta pro tipo registrado acima
        filterOptions: Object.entries(STATUSES).map(([v, s]) => ({
          value: v,
          label: s.label,
        })),
      },
      { field: "value", headerName: "Valor", type: "currency" },
    ],
    [],
  );

  const cabecalhoColumns = useMemo<DataTableColumnDef<ClientRow>[]>(
    () => [
      // Tem tudo: funil + menu (Ordenar, Fixar, Ocultar).
      {
        field: "name",
        headerName: "Nome",
        type: "user",
        enableColumnFilter: true,
        filterType: "text",
      },
      // SÓ o funil some — o menu e o chip de filtro continuam.
      {
        field: "statusId",
        headerName: "Status",
        type: "status",
        enableColumnFilter: true,
        enableHeaderFilter: false,
        filterType: "multiSelect",
        filterOptions: Object.entries(STATUSES).map(([v, s]) => ({
          value: v,
          label: s.label,
        })),
      },
      // Não ordenável: o menu não oferece "Ordenar".
      { field: "email", headerName: "E-mail", type: "email", sortable: false },
      { field: "value", headerName: "Valor", type: "currency" },
    ],
    [],
  );

  const kanbanConfig = useMemo<DataTableKanbanConfig<ClientRow>>(
    () => ({
      groupByField: "statusId",
      columns: [
        { id: "active", label: "Ativo", dotColor: "var(--color-fg-success)" },
        {
          id: "pending",
          label: "Pendente",
          dotColor: "var(--color-fg-warning)",
        },
        { id: "paused", label: "Pausado", dotColor: "var(--color-fg-info)" },
        {
          id: "inactive",
          label: "Inativo",
          dotColor: "var(--color-fg-muted)",
          canReceiveDrop: false,
        },
      ],
      renderCard: ({ row }) => {
        const agent = AGENTS[row.agentId];
        return {
          title: row.name,
          subtitle: row.id,
          avatar: (
            <Avatar size="sm" colorHex={row.avatarColor}>
              {row.initials}
            </Avatar>
          ),
          chip: (
            <Chip color="warning" variant="soft" size="sm">
              {row.categoryId}
            </Chip>
          ),
          value: formatCurrency(row.value),
          footerLeft: agent ? (
            <span className="text-caption-sm text-fg-muted truncate">
              {agent.name}
            </span>
          ) : undefined,
        };
      },
      enableDnD: true,
      onCardMove: (cardId, _from, to) =>
        setRows((prev) =>
          prev.map((r) =>
            r.id === cardId
              ? { ...r, statusId: to as ClientRow["statusId"] }
              : r,
          ),
        ),
    }),
    [],
  );

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Data Table Components"
        title="DataTable"
        description="Smart orchestrator que compõe Table + TableToolbar + FooterTable. Inclui filter/sort/search/pagination/selection/virtualização/grouping/row expansion/inline edit/column types registry/saved views, e integração com Kanban view via viewMode."
      />

      <DocSeparator />

      <SectionH2 id="overview" title="Overview" />

      <p className="text-body-lg text-fg-default mb-gp-2xl max-w-[760px]">
        O DataTable é o "smart wrapper" da família data-display do iGreen DS.
        Internamente orquestra 17+ hooks SRP (filter, sort, search, pagination,
        selection, density, query, export, saved views, etc) e delega
        renderização pros primitives <code>&lt;Table&gt;</code>,{" "}
        <code>&lt;TableToolbar&gt;</code>, <code>&lt;FooterTable&gt;</code> e
        (quando <code>viewMode="kanban"</code>)<code>&lt;Kanban&gt;</code>. Veja
        a sidebar pra acessar exemplos focados em cenários específicos (CRUD,
        Server mode, Virtualized, Grouped, Expandable row, Column types, Kanban
        view).
      </p>

      <SectionH2 id="quick-start" title="Quick start" />

      <ExampleSection
        id="ex-basic"
        title="Client mode básico (declarativo)"
        description="Apenas declare type por coluna; o registry resolve render/filter/format. columns deve ser memoizado."
        code={CODE_BASIC}
      >
        <div className="h-[480px] w-full flex">
          <DataTable<ClientRow>
            rows={rows}
            columns={basicColumns}
            getRowId={(r) => r.id}
            toolbar={{
              title: "Clientes",
              enableSearch: true,
              enableFilters: true,
            }}
            paginationConfig={{ enabled: true, initialPageSize: 25 }}
            selectionConfig={{ enabled: true }}
            showTotalizers
            className="max-h-full"
          />
        </div>
      </ExampleSection>

      <SectionH2 id="view-mode" title="ViewMode (Table × Kanban)" />

      <ExampleSection
        id="ex-kanban"
        title="Toggle entre Tabela e Kanban com mesma fonte de dados"
        description="viewMode + kanbanConfig integram a view Kanban no DataTable. ViewToggle é auto-renderizado na toolbar (entre Refresh e Views). Filter/search/sort aplicam transparente em ambas as views. DnD atualiza via onCardMove. Desde a v0.70.0 o groupBy vira o SEGUNDO eixo: o mesmo estado que agrupa linhas na tabela vira raia dentro de cada coluna do board — e por ser o mesmo estado, entra nas saved views sem código novo. Sem groupBy o board é plano, como sempre foi."
        code={CODE_KANBAN}
      >
        <div className="h-[560px] w-full flex">
          <DataTable<ClientRow>
            rows={rows}
            columns={basicColumns}
            getRowId={(r) => r.id}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            kanbanConfig={kanbanConfig}
            toolbar={{
              title: "Clientes",
              enableSearch: true,
              enableFilters: true,
              enableColumns: viewMode === "table",
              enableDensity: viewMode === "table",
            }}
            paginationConfig={{ enabled: viewMode === "table" }}
            selectionConfig={{ enabled: true }}
            className="max-h-full"
          />
        </div>
      </ExampleSection>

      <SectionH2 id="saved-views" title="Saved Views & Presets" />

      <p className="text-body-md text-fg-default mb-gp-lg max-w-[760px]">
        Views são snapshots nomeados da configuração da tabela (filtros, sort,
        layout, density, viewMode, groupBy, rows expandidas). Há dois tipos:
      </p>

      <ul className="text-body-md text-fg-muted mb-gp-3xl max-w-[760px] list-disc pl-pad-2xl space-y-gp-sm">
        <li>
          <strong>Saved views</strong> — criadas pelo usuário em runtime via
          "Salvar view"; persistem no localStorage (ou backend via{" "}
          <code>savedViewsService</code> custom). Públicas (compartilhadas) ou
          privadas. Editáveis e deletáveis.
        </li>
        <li>
          <strong>Preset views (default views)</strong> — declaradas pelo dev no
          código via <code>defaultViews: DataTablePresetView[]</code>. Read-only
          (não-deletáveis), sempre aparecem antes das saved views. Use pra "tabs
          nativos" da tela.
        </li>
      </ul>

      <div className="border border-border-subtle rounded-radius-lg bg-bg-subtle p-pad-2xl mb-gp-3xl max-w-[760px] space-y-gp-md">
        <p className="text-body-md text-fg-default">
          <strong>
            <code>allowCreateView={"{false}"}</code> (v0.23.0)
          </strong>{" "}
          — esconde o botão "+" das visões. A tabela exibe só os{" "}
          <code>defaultViews</code> (+ Default), read-only — o usuário não cria
          nem salva visões. Default <code>true</code> (não-breaking).
        </p>
        <p className="text-body-md text-fg-default">
          <strong>
            <code>maxViewTabs</code>
          </strong>{" "}
          — quantas abas cabem na barra, <strong>contando a "Default"</strong>.
          Default <code>3</code>, ou seja <strong>2 presets</strong> viram aba.
          ⚠️ O excedente é cortado — com 3 presets o terceiro não aparece, sem
          erro e sem overflow. Em <strong>DEV</strong> sai um{" "}
          <code>console.warn</code> (v0.43.1) nomeando a visão engolida e o valor
          que resolve; em produção o corte é silencioso. O aviso vale nos canais
          em que <strong>você compila a fonte</strong> (copy-in/registry,
          scaffold, submódulo) — no pacote <code>npm</code>, que é pré-buildado,
          o bloco de dev é eliminado no nosso build e não dispara. Precisa de N
          abas fixas?{" "}
          <code>maxViewTabs={"{N + 1}"}</code>. E lembre que a aba{" "}
          <strong>Default já é a visão sem filtro</strong>: um preset
          "Todos"/"Todas" duplica ela e gasta um slot.
        </p>
        <p className="text-body-md text-fg-default">
          <strong>viewMode "sticky" ao trocar de visão (v0.23.0)</strong> —
          aplicar uma visão só troca Tabela↔Lista↔Kanban se a visão{" "}
          <strong>definir</strong> um <code>viewMode</code> explícito. Presets
          sem <code>viewMode</code> (o caso comum) mantêm o que o usuário está
          vendo; clicar "Default" também não flipa a view.
        </p>
      </div>

      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
        Builder <code>presetView()</code> — declarar presets em código
      </h3>
      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        Helper com defaults razoáveis pra eliminar boilerplate. Receba apenas o
        que diferencia: id + name + (filters | sort | viewMode | groupBy | ...).
      </p>

      <ExampleSection
        id="ex-presets"
        title="Presets declarativos com builder"
        description="3 presets — filtro simples, filtro + sort, view Kanban agrupada. Cada um é declarado em ~3 linhas (vs ~14 linhas do shape verboso)."
        code={CODE_PRESETS}
      >
        <div className="h-[480px] w-full flex">
          <DataTable<ClientRow>
            rows={rows}
            columns={basicColumns}
            getRowId={(r) => r.id}
            persistId="data-table-doc-presets"
            defaultViews={DEMO_PRESETS}
            // DEMO_PRESETS tem 3 presets e o default de `maxViewTabs` é 3 CONTANDO a aba
            // "Default" — então esta demo mostrava 2 e engolia "Pipeline (Kanban)" em
            // silêncio (medido no browser em 2026-08-14, nesta própria página). 3 + 1.
            maxViewTabs={4}
            kanbanConfig={kanbanConfig}
            toolbar={{
              title: "Clientes",
              enableSearch: true,
              enableFilters: true,
            }}
            paginationConfig={{ enabled: true, initialPageSize: 25 }}
            className="max-h-full"
          />
        </div>
      </ExampleSection>

      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs mt-gp-4xl">
        O que uma view captura
      </h3>
      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        Snapshot é versionado em <code>DataTableSavedViewState</code> e idêntico
        entre saved e preset views.
      </p>

      <div className="border border-border-subtle rounded-radius-lg overflow-hidden mb-gp-3xl">
        <table className="w-full">
          <thead className="bg-bg-subtle">
            <tr>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Field
              </th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Type
              </th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Capturado
              </th>
            </tr>
          </thead>
          <tbody>
            {SAVED_VIEW_FIELDS.map((f, i) => (
              <tr
                key={f.field}
                className={i % 2 === 0 ? "bg-bg-surface" : "bg-bg-canvas"}
              >
                <td className="px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-mono border-t border-border-subtle">
                  {f.field}
                </td>
                <td className="px-pad-lg py-pad-md text-body-sm font-normal text-fg-muted font-mono border-t border-border-subtle">
                  {f.type}
                </td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">
                  {f.captured}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
        Persistência
      </h3>
      <p className="text-body-md text-fg-muted mb-gp-3xl max-w-[760px]">
        Saved views requerem <code>persistId: string</code> (escopo de
        armazenamento). Default service usa localStorage (
        <code>savedViewsMockService</code>). Pra produção, implemente{" "}
        <code>SavedViewsService</code> custom (REST/GraphQL) e passe via prop{" "}
        <code>savedViewsService</code>. A última view aplicada é restaurada
        automaticamente no remount (cache do <code>lastActiveViewId</code> em
        localStorage por <code>persistId</code>).
      </p>

      <SectionH2 id="server-mode" title="Server mode" />

      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        Passe <code>fetchData</code> em vez de <code>rows</code>. O DataTable
        re-dispara a função em mudança de filter/sort/search/page e mostra
        spinner default durante loading. <code>ref.current.refresh()</code>
        força refetch sem mudar params. Veja{" "}
        <strong>Example: CRUD Server</strong> no menu lateral pro fluxo
        completo.
      </p>

      <pre className="px-pad-xl py-pad-lg bg-bg-subtle border border-border-subtle rounded-radius-lg text-code-sm font-mono text-fg-default overflow-x-auto scrollbar-thin mb-gp-3xl">
        {`async function fetchClients(params: GridFetchParams): Promise<GridFetchResult<ClientRow>> {
  const res = await api.get("/clients", { params: serialize(params) });
  return { data: res.data.items, total: res.data.total };
}

<DataTable<ClientRow>
  fetchData={fetchClients}  // ← sem prop "rows"
  columns={columns}
  toolbar={{ enableSearch: true, enableFilters: true }}
/>`}
      </pre>

      <SectionH2 id="features" title="Features built-in" />

      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        Resumo do que está embutido. Cada uma tem props dedicadas em{" "}
        <code>DataTableProps</code> e exemplos focados nos itens "Example: ..."
        do menu lateral.
      </p>

      <div className="border border-border-subtle rounded-radius-lg overflow-hidden mb-gp-3xl">
        <table className="w-full">
          <thead className="bg-bg-subtle">
            <tr>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Capability
              </th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Como ativar
              </th>
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((c, i) => (
              <tr
                key={c.name}
                className={i % 2 === 0 ? "bg-bg-surface" : "bg-bg-canvas"}
              >
                <td className="px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium border-t border-border-subtle">
                  {c.name}
                </td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">
                  {c.how}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionH2 id="custom-filter" title="Widget de filtro próprio" />

      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        O chip multi (<code>isAnyOf</code>/<code>isNoneOf</code>) é do DS por
        padrão. Quando uma tela precisa de uma regra de interação própria —
        colar uma lista, atalhos, clique que substitui em vez de somar — o
        consumidor <strong>troca o widget</strong> registrando um tipo no{" "}
        <code>columnTypeRegistry</code> com <code>ownsMulti: true</code>, sem
        esperar release do DS. A peça pra montar o widget sai do barrel:{" "}
        <code>MultiSelectDropdown</code> no <code>renderFastFilterInput</code>{" "}
        (o chip já está dentro de um popover) e{" "}
        <code>MultiSelectFieldDropdown</code> no <code>renderFilterInput</code>{" "}
        (modal de filtros avançados) — chip e avançado ficam consistentes sem
        reescrever busca e lista.
      </p>

      <ul className="list-disc pl-pad-4xl mb-gp-2xl max-w-[760px] flex flex-col gap-gp-xs text-body-md text-fg-muted">
        <li>
          <strong>É declarado, não deduzido.</strong> Declarar{" "}
          <code>isAnyOf</code>/<code>isNoneOf</code> nos <code>operators</code>{" "}
          não dá posse: <code>badge</code> e <code>user</code> declaram o
          operador só pro builder avançado, e o chip deles é de valor único.
        </li>
        <li>
          <strong>
            O <code>value</code> chega sempre como array
          </strong>{" "}
          — a lista inteira do grupo, e <code>["active"]</code> com um valor só,
          nunca <code>"active"</code>. Não faça{" "}
          <code>typeof value === "string"</code>; <code>onChange</code> também
          recebe array.
        </li>
        <li>
          <strong>Widget de valor único? Não declare o flag.</strong> O chip cai
          no <code>multiSelect</code> built-in, que já traz busca, “Selecionar
          todos”, opções fixas e o alternador Incluindo/Excluindo.
        </li>
      </ul>

      <ExampleSection
        id="ex-owns-multi"
        title="Tipo próprio com ownsMulti"
        description="Abra o chip Status. A linha value = … e o botão Só ativos são do tipo registrado pelo exemplo; a lista com Incluindo/Excluindo logo abaixo é o MultiSelectDropdown do DS, embrulhado. Repare que value mostra o array mesmo quando há um único item marcado."
        code={CODE_OWNS_MULTI}
      >
        <div className="h-[420px] w-full flex">
          <DataTable<ClientRow>
            rows={DEMO_ROWS}
            columns={filtroProprioColumns}
            getRowId={(r) => r.id}
            filterModel={filtroProprio}
            onFilterModelChange={setFiltroProprio}
            toolbar={{ title: "Clientes" }}
            className="max-h-full"
          />
        </div>
      </ExampleSection>

      <SectionH2
        id="drawer-controlado"
        title="Drawer de filtros controlado"
      />

      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        O drawer do funil abre e fecha sozinho por padrão. Quando a abertura
        precisa vir <strong>de fora</strong> — um botão “Filtrar” no cabeçalho
        da página, um atalho de teclado, um deep-link que já chega com o painel
        aberto — o par <code>simpleFilter.open</code> +{" "}
        <code>simpleFilter.onOpenChange</code> entrega o estado pra tela. Com{" "}
        <code>open</code> presente a prop manda: o funil da toolbar, o X, o Esc
        e o backdrop passam a só <em>avisar</em>.
      </p>

      <ul className="list-disc pl-pad-4xl mb-gp-2xl max-w-[760px] flex flex-col gap-gp-xs text-body-md text-fg-muted">
        <li>
          <strong>
            <code>onOpenChange</code> dispara nos dois modos.
          </strong>{" "}
          É notificação de intenção, não controle — sem <code>open</code> o
          drawer continua se virando sozinho e o callback só observa
          (telemetria, badge, espelhar o estado).
        </li>
        <li>
          <strong>
            <code>open</code> sem <code>onOpenChange</code> prende o drawer
          </strong>{" "}
          no valor da prop: as três saídas do usuário ficam inertes. O
          comportamento não muda (a prop segue mandando), mas sai um{" "}
          <code>console.warn</code> em DEV nomeando a prop e a consequência.
        </li>
        <li>
          <strong>Nada muda pra quem não passa nada.</strong> Sem as duas
          props, é o funil de sempre.
        </li>
      </ul>

      <ExampleSection
        id="ex-drawer-controlado"
        title="Botão da tela abrindo o funil"
        description="O botão está FORA da tabela. Abra por ele, feche pelo X do drawer, e repare na linha de aviso: ela é escrita pelo onOpenChange, que dispara também quando o funil da toolbar é clicado."
        code={CODE_DRAWER_CONTROLADO}
      >
        <div className="flex flex-col gap-gp-lg w-full">
          <div className="flex items-center gap-gp-lg flex-wrap">
            <Button
              variant="filled"
              color="primary"
              size="sm"
              onClick={() => setFunilAberto(true)}
            >
              Filtrar clientes
            </Button>
            <Button
              variant="soft"
              color="secondary"
              size="sm"
              onClick={() => setFunilAberto(false)}
            >
              Fechar o funil
            </Button>
            <span className="text-body-sm text-fg-muted">
              {`open = ${funilAberto}`}
              {ultimoAvisoDoFunil ? ` · último aviso: ${ultimoAvisoDoFunil}` : ""}
            </span>
          </div>

          <div className="h-[420px] w-full flex">
            <DataTable<ClientRow>
              rows={DEMO_ROWS}
              columns={basicColumns}
              getRowId={(r) => r.id}
              toolbar={{ title: "Clientes" }}
              simpleFilter={{
                open: funilAberto,
                onOpenChange: (aberto) => {
                  setFunilAberto(aberto);
                  setUltimoAvisoDoFunil(
                    `onOpenChange(${aberto}) às ${new Date().toLocaleTimeString("pt-BR")}`,
                  );
                },
              }}
              className="max-h-full"
            />
          </div>
        </div>
      </ExampleSection>

      <SectionH2 id="header-actions" title="Ações do cabeçalho" />

      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        O cabeçalho de cada coluna mostra o <strong>ícone do tipo</strong> e, no
        hover, o <strong>funil</strong> (atalho do chip de filtro) e o{" "}
        <strong>menu</strong> de 3 pontos (Ordenar, Fixar, Ocultar). Cada um
        tem o seu interruptor e todos nascem ligados — sem nenhuma prop, o
        cabeçalho é o de sempre.
      </p>

      <ul className="list-disc pl-pad-4xl mb-gp-2xl max-w-[760px] flex flex-col gap-gp-xs text-body-md text-fg-muted">
        <li>
          <strong>Só o funil?</strong> <code>enableHeaderFilter: false</code> na
          coluna. O menu e o filtro (chips, painel “Filtros”) continuam.{" "}
          <code>enableColumnMenu: false</code> não serve: leva o menu inteiro,
          com Fixar e Ocultar.
        </li>
        <li>
          <strong>“Ordenar” só em coluna ordenável.</strong> O menu segue o{" "}
          <code>sortable</code> da coluna, já resolvido com o default do tipo.
          Se uma coluna não ordenável estiver ordenada por um{" "}
          <code>sortModel</code> controlado, “Limpar ordenação” continua lá —
          é a saída desse estado.
        </li>
        <li>
          <strong>Coluna estreita.</strong> O piso de largura do cabeçalho conta
          as ações visíveis (sort + funil + menu, até 84px):{" "}
          <code>width: 64</code> com funil e menu rende 84px, em vez de o
          conjunto transbordar da célula. É um <code>max</code> com o piso do
          título, não uma soma — coluna de título normal não muda.
        </li>
      </ul>

      <ExampleSection
        id="ex-header-actions"
        title="Funil, menu e ícone do tipo"
        description="Passe o mouse no cabeçalho. Nome tem tudo. Status esconde só o funil (enableHeaderFilter: false): o chip dele segue na barra e o menu continua. E-mail não é ordenável — abra o menu dele e repare que não há Ordenar. O interruptor liga e desliga o ícone do tipo em todas as colunas."
        code={CODE_HEADER_ACTIONS}
      >
        <div className="flex flex-col gap-gp-lg w-full">
          <label className="inline-flex items-center gap-gp-md self-start text-body-md text-fg-default">
            <Switch checked={iconesDoTipo} onCheckedChange={setIconesDoTipo} />
            showTypeIcons
          </label>
          <div className="h-[360px] w-full flex">
            <DataTable<ClientRow>
              rows={DEMO_ROWS}
              columns={cabecalhoColumns}
              getRowId={(r) => r.id}
              showTypeIcons={iconesDoTipo}
              showEmptyFilterChips={["statusId"]}
              toolbar={{ title: "Clientes" }}
              className="max-h-full"
            />
          </div>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          DataTableProps — Core
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-lg">
          Props essenciais. Tipos completos em{" "}
          <code>src/components/ui/DataTable/data-table.types.ts</code>.
        </p>
        <PropsTable items={CORE_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          DataTableToolbarConfig
        </h3>
        <PropsTable items={TOOLBAR_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          DataTableColumnDef&lt;T&gt;
        </h3>
        <PropsTable items={COLUMN_DEF_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          DataTableKanbanConfig&lt;T&gt;
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-lg">
          Paridade 1:1 com <code>KanbanProps</code>; bridges automáticos
          resolvem
          <code>cardId → row</code> onde aplicável.
        </p>
        <PropsTable items={KANBAN_CONFIG_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          DataTableListConfig&lt;T&gt;
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-lg">
          Habilita a view <strong>Lista</strong> (<code>viewMode="list"</code>): a
          toolbar é a mesma e o corpo vira um <code>&lt;List&gt;</code> com as rows
          processadas. <code>hierarchical</code> + <code>getTreeDataPath</code> =
          lista em árvore. Showcase: <code>#/clients-list-view</code>.
        </p>
        <PropsTable items={LIST_CONFIG_PROPS} />
      </div>

      <SectionH2 id="troubleshooting" title="Troubleshooting" />

      <div className="border border-border-subtle rounded-radius-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-subtle">
            <tr>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Sintoma
              </th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Causa
              </th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">
                Fix
              </th>
            </tr>
          </thead>
          <tbody>
            {TROUBLESHOOTING.map((t, i) => (
              <tr
                key={t.symptom}
                className={i % 2 === 0 ? "bg-bg-surface" : "bg-bg-canvas"}
              >
                <td className="px-pad-lg py-pad-md text-body-md text-fg-default border-t border-border-subtle">
                  {t.symptom}
                </td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">
                  {t.cause}
                </td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">
                  {t.fix}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocLayout>
  );
}

export default DataTableDoc;

/* ── Code snippets pros ExampleSections ────────────────────────── */

const CODE_BASIC = `import { DataTable, type DataTableColumnDef } from "@/components/ui/DataTable";

const columns = useMemo<DataTableColumnDef<ClientRow>[]>(() => [
  { field: "id",       headerName: "ID",     type: "text" },
  { field: "name",     headerName: "Nome",   type: "user", sortable: true },
  { field: "email",    headerName: "Email",  type: "email" },
  { field: "statusId", headerName: "Status", type: "status",
    enableColumnFilter: true, filterType: "multiSelect",
    filterOptions: STATUS_OPTIONS },
  { field: "value",    headerName: "Valor",  type: "currency",
    sortable: true, aggregate: "sum" },
], []);

<DataTable<ClientRow>
  rows={rows}
  columns={columns}
  getRowId={(r) => r.id}
  toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true }}
  paginationConfig={{ enabled: true, initialPageSize: 25 }}
  selectionConfig={{ enabled: true }}
  showTotalizers
/>`;

const CODE_OWNS_MULTI = `import {
  columnTypeRegistry,
  MultiSelectDropdown,        // chip (já está dentro de um popover)
  MultiSelectFieldDropdown,   // modal de filtros avançados
} from "@/components/ui/DataTable";

columnTypeRegistry.register({
  ...columnTypeRegistry.get("multiSelect"),  // operadores, matchesFilter, texto do chip
  type: "meuMulti",
  ownsMulti: true,   // value chega como ARRAY, sempre — mesmo com 1 item
  renderFastFilterInput: (p) => (
    <div>
      {/* o popover do chip é p-0 e o MultiSelectDropdown traz o próprio
          padding — o que é seu precisa trazer o dele */}
      <div className="flex flex-col gap-gp-xs px-pad-md pt-pad-md">
        <p className="text-caption-md text-fg-muted">
          value = {JSON.stringify(p.value)}
        </p>
        <Button size="2xs" variant="ghost" color="secondary"
          onClick={() => p.onChange(["active"])}>   {/* onChange também é array */}
          Só ativos
        </Button>
      </div>
      <MultiSelectDropdown {...p} />                {/* busca/lista/seleção do DS */}
    </div>
  ),
  renderFilterInput: (p) => <MultiSelectFieldDropdown {...p} />,
});

// A coluna aponta pro tipo registrado pelo filterType
{ field: "statusId", headerName: "Status", type: "status",
  enableColumnFilter: true, filterType: "meuMulti",
  filterOptions: STATUS_OPTIONS }`;

const CODE_DRAWER_CONTROLADO = `const [funilAberto, setFunilAberto] = useState(false);

// O botão vive FORA da tabela — é a tela que manda o drawer abrir
<Button onClick={() => setFunilAberto(true)}>Filtrar clientes</Button>

<DataTable
  rows={rows}
  columns={columns}
  getRowId={(r) => r.id}
  simpleFilter={{
    open: funilAberto,
    // dispara também quando o usuário usa o funil da toolbar, o X, o Esc
    // ou o backdrop — com \`open\` presente, eles só AVISAM
    onOpenChange: setFunilAberto,
  }}
/>

// Só observando, sem assumir o estado: sem \`open\`, o drawer continua
// abrindo e fechando sozinho e o callback apenas notifica.
<DataTable
  rows={rows}
  columns={columns}
  getRowId={(r) => r.id}
  simpleFilter={{ onOpenChange: (aberto) => track("funil", aberto) }}
/>`;

const CODE_HEADER_ACTIONS = `const columns: DataTableColumnDef<ClientRow>[] = [
  // Tem tudo: funil + menu (Ordenar, Fixar, Ocultar)
  { field: "name", headerName: "Nome", type: "user",
    enableColumnFilter: true, filterType: "text" },

  // SÓ o funil some — o menu e o chip de filtro continuam
  { field: "statusId", headerName: "Status", type: "status",
    enableColumnFilter: true, enableHeaderFilter: false,
    filterType: "multiSelect", filterOptions: STATUS_OPTIONS },

  // Não ordenável: o menu não oferece Ordenar crescente/decrescente
  { field: "email", headerName: "E-mail", type: "email", sortable: false },

  { field: "value", headerName: "Valor", type: "currency" },
];

<DataTable<ClientRow>
  rows={rows}
  columns={columns}
  showTypeIcons={false}                // sem o ícone do tipo em nenhuma coluna
  showEmptyFilterChips={["statusId"]}  // o chip de Status visível desde o load
/>

// ⚠️ enableColumnMenu: false tira o menu INTEIRO (Fixar e Ocultar vão junto).
// Pra esconder só o funil, é enableHeaderFilter: false.`;

const CODE_KANBAN = `import { DataTable, type DataTableViewMode, type DataTableKanbanConfig } from "@/components/ui/DataTable";

const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
const [rows, setRows] = useState<ClientRow[]>(MOCK);

const kanbanConfig: DataTableKanbanConfig<ClientRow> = {
  groupByField: "statusId",
  columns: [
    { id: "active",   label: "Ativo",    dotColor: "var(--color-fg-success)" },
    { id: "pending",  label: "Pendente" },
    { id: "inactive", label: "Inativo",  canReceiveDrop: false }, // terminal
  ],
  renderCard: ({ row }) => ({
    title: row.name,
    subtitle: row.id,
    avatar: <Avatar size="sm" colorHex={row.avatarColor}>{row.initials}</Avatar>,
    chip: <Chip variant="soft" size="sm">{row.categoryLabel}</Chip>,
    value: formatCurrency(row.value),
  }),
  enableDnD: true,
  onCardMove: (cardId, _from, to) =>
    setRows(prev => prev.map(r => r.id === cardId ? { ...r, statusId: to } : r)),
};

<DataTable<ClientRow>
  rows={rows}
  columns={columns}
  viewMode={viewMode}
  onViewModeChange={setViewMode}     // ViewToggle auto-rendereado na toolbar
  kanbanConfig={kanbanConfig}
  toolbar={{
    enableColumns: viewMode === "table",  // ocultos em kanban
    enableDensity: viewMode === "table",
  }}
  paginationConfig={{ enabled: viewMode === "table" }}
/>`;

/* ── Presets demo ─────────────────────────────────────────────── */

const DEMO_PRESETS = [
  presetView({
    id: "preset:ativos",
    name: "Ativos",
    filters: [{ field: "statusId", value: "active" }],
  }),
  presetView({
    id: "preset:alto-valor",
    name: "Alto valor (desc)",
    sort: [{ field: "value", direction: "desc" }],
  }),
  presetView({
    id: "preset:pipeline-kanban",
    name: "Pipeline (Kanban)",
    viewMode: "kanban",
  }),
];

const CODE_PRESETS = `import { DataTable, presetView } from "@/components/ui/DataTable";

const DEFAULT_VIEWS = [
  // Filtro simples — 3 linhas
  presetView({
    id: "preset:ativos",
    name: "Ativos",
    filters: [{ field: "statusId", value: "active" }],
  }),

  // Sort + filtro composto — sem boilerplate de logicOperator/density/etc
  presetView({
    id: "preset:alto-valor",
    name: "Alto valor (desc)",
    filters: [{ field: "value", operator: "gt", value: 10000 }],
    sort: [{ field: "value", direction: "desc" }],
  }),

  // View Kanban — viewMode é capturado e restaurado
  presetView({
    id: "preset:pipeline-kanban",
    name: "Pipeline (Kanban)",
    viewMode: "kanban",
    groupBy: "statusId",          // groupBy também é capturado
  }),

  // Layout customizado — pin/hide/order são opcionais
  presetView({
    id: "preset:compact",
    name: "Visão compacta",
    density: "compact",
    hiddenColumns: ["lastContact", "createdAt"],
    pinnedColumns: { name: "left" },
  }),
];

<DataTable<ClientRow>
  rows={rows}
  columns={columns}
  persistId="clients-table"          // ← Necessário pra views (saved + last-active)
  defaultViews={DEFAULT_VIEWS}        // ← Presets sempre antes das saved
  kanbanConfig={kanbanConfig}         // ← Necessário se algum preset usa viewMode="kanban"
  toolbar={{ enableSearch: true, enableFilters: true }}
/>`;
