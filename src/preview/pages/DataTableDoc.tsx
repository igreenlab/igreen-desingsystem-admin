import { useMemo, useState } from "react";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableKanbanConfig,
  type DataTableViewMode,
  presetView,
} from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
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
  { id: "view-mode", label: "ViewMode (Table × Kanban)" },
  { id: "saved-views", label: "Saved Views & Presets" },
  { id: "server-mode", label: "Server mode" },
  { id: "features", label: "Features built-in" },
  { id: "api", label: "API Reference" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

/* ── Saved views — campos capturados ────────────────────────── */

const SAVED_VIEW_FIELDS: Array<{ field: string; type: string; captured: string }> = [
  { field: "filterModel",    type: "FilterModel",                    captured: "✅ Sempre" },
  { field: "sortModel",      type: "SortModel[]",                    captured: "✅ Sempre" },
  { field: "density",        type: "'compact'|'standard'|'comfortable'", captured: "✅ Sempre" },
  { field: "columnWidths",   type: "Record<field, number>",          captured: "✅ Quando customizado" },
  { field: "pinnedColumns",  type: "Record<field, 'left'|'right'>",  captured: "✅ Quando há pin" },
  { field: "hiddenColumns",  type: "string[]",                       captured: "✅ Quando há oculta" },
  { field: "columnOrder",    type: "string[]",                       captured: "✅ Quando reordenado" },
  { field: "viewMode",       type: "'table' | 'kanban'",             captured: "✅ NOVO" },
  { field: "groupBy",        type: "string | undefined",             captured: "✅ NOVO" },
  { field: "expandedRowIds", type: "GridRowId[]",                    captured: "✅ NOVO" },
  { field: "search",         type: "string",                         captured: "❌ Volátil (sessão)" },
  { field: "paginationModel",type: "{ page, pageSize }",             captured: "❌ Volátil (reseta ao filtrar)" },
  { field: "selectionModel", type: "GridSelectionState",             captured: "❌ Volátil (sessão)" },
];

/* ── Mock dataset (pequeno pra demo) ──────────────────────────── */

const DEMO_ROWS: ClientRow[] = CLIENTS_MOCK.slice(0, 8);

/* ── Capabilities matrix ──────────────────────────────────────── */

const CAPABILITIES: Array<{ name: string; how: string }> = [
  { name: "Sort multi-coluna",  how: "sortable: true por coluna; toolbar mostra SortPopover quando há ≥ 1 sortable" },
  { name: "Filter chip rápido", how: "enableColumnFilter + filterType (text/number/date/select/multiSelect/boolean)" },
  { name: "Filter avançado (AND/OR)", how: "Auto-habilitado se há ≥ 1 coluna com enableColumnFilter" },
  { name: "Search global",      how: "toolbar.enableSearch (default true), debounced 500ms" },
  { name: "Pagination",         how: "paginationConfig.initialPageSize/pageSizeOptions (10/25/50/100)" },
  { name: "Selection (bulk)",   how: "selectionConfig.enabled + enableGlobal (modo include/exclude)" },
  { name: "Column popover",     how: "Show/hide, pin (left/right), reorder via drag" },
  { name: "Density toggle",     how: "compact/standard/comfortable; densityItems pra override" },
  { name: "Inline edit",        how: "editable: true por coluna + onCellEditCommit (suporta Promise + reject + retry)" },
  { name: "Column types registry", how: "type: 'currency' | 'email' | 'status' | ... resolve render/filter/format" },
  { name: "Virtualização",      how: "virtualize: true (recomendado > 500 rows)" },
  { name: "Row grouping",       how: "groupBy: 'field' + renderGroupHeader/Content (column-aligned ou freeform)" },
  { name: "Row expansion",      how: "renderRowExpansion + column.expandable: true" },
  { name: "Totalizers footer",  how: "showTotalizers + column.aggregate ('sum'|'avg'|'count'|...) + aggregateFormatter" },
  { name: "Server mode",        how: "fetchData em vez de rows; refetch automático em mudança de params" },
  { name: "Saved views",        how: "persistId + savedViewsService (default: localStorage mock) + defaultViews" },
  { name: "Persist state",      how: "persistId — density/sort/columnWidths/pinned/hidden em localStorage" },
  { name: "Export",             how: "toolbar.enableExport: true OU { formats, items }; ref.current.exportCsv(scope)" },
  { name: "View mode (Kanban)", how: "viewMode + kanbanConfig — alterna entre Table e Kanban com mesma fonte de dados" },
  { name: "Card responsivo (mobile)", how: "cardBreakpoint (default 768). Abaixo do breakpoint, rows viram TableCardRow automaticamente. Toolbar/footer continuam intactos." },
  { name: "Keyboard nav",       how: "Setas/Home/End/PgUp/PgDn no body; Enter ativa onRowClick; auto-incluído" },
];

/* ── Props tables ─────────────────────────────────────────────── */

const CORE_PROPS = [
  { name: "rows", type: "T[]", defaultVal: "—" },
  { name: "fetchData", type: "(params: GridFetchParams) => Promise<GridFetchResult<T>>", defaultVal: "—" },
  { name: "columns", type: "DataTableColumnDef<T>[]", defaultVal: "—" },
  { name: "getRowId", type: "(row: T) => GridRowId", defaultVal: "row.id" },
  { name: "rowCount", type: "number (server mode opcional)", defaultVal: "—" },
  { name: "cardBreakpoint", type: "number | false", defaultVal: "768 (px)" },
  { name: "virtualize", type: "boolean", defaultVal: "false (recomendado em listas > 500 rows)" },
];

const TOOLBAR_PROPS = [
  { name: "toolbar.title", type: "string", defaultVal: "—" },
  { name: "toolbar.enableSearch", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableRefresh", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableFilters", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableColumns", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableDensity", type: "boolean", defaultVal: "true" },
  { name: "toolbar.enableExport", type: "boolean | { formats?, items? }", defaultVal: "false" },
  { name: "toolbar.moreMenu", type: "{ items: DataTableMoreMenuItem[] }", defaultVal: "—" },
  { name: "toolbar.viewToggle", type: "ReactNode", defaultVal: "auto (se viewMode + kanbanConfig)" },
  { name: "toolbar.customLeft", type: "ReactNode", defaultVal: "—" },
];

const COLUMN_DEF_PROPS = [
  { name: "field", type: "keyof T | string (dot-path 'user.name')", defaultVal: "—" },
  { name: "headerName", type: "string", defaultVal: "—" },
  { name: "type", type: "'text'|'number'|'currency'|'date'|'email'|'phone'|'status'|'badge'|'user'|'actions'|...", defaultVal: "—" },
  { name: "width / minWidth / maxWidth / flex", type: "number", defaultVal: "—" },
  { name: "pinned", type: "'left' | 'right'", defaultVal: "—" },
  { name: "align", type: "'left' | 'center' | 'right'", defaultVal: "auto (deriva de type)" },
  { name: "sortable", type: "boolean", defaultVal: "true" },
  { name: "hideable", type: "boolean", defaultVal: "true" },
  { name: "resizable", type: "boolean", defaultVal: "true" },
  { name: "enableColumnFilter", type: "boolean", defaultVal: "false" },
  { name: "filterType", type: "'text'|'select'|'multiSelect'|'date'|'boolean'|'number'", defaultVal: "—" },
  { name: "render", type: "({ row, value }) => ReactNode", defaultVal: "—" },
  { name: "valueGetter / valueFormatter", type: "(row) => any / (value) => string", defaultVal: "—" },
  { name: "editable", type: "boolean", defaultVal: "false" },
  { name: "expandable", type: "boolean (trigger row expansion)", defaultVal: "false" },
  { name: "aggregate", type: "'sum'|'avg'|'count'|'min'|'max' | (rows) => ReactNode", defaultVal: "—" },
  { name: "isPrimary", type: "boolean (título no card mode)", defaultVal: "auto (1ª coluna não-actions)" },
];

const KANBAN_CONFIG_PROPS = [
  { name: "groupByField", type: "keyof T | string", defaultVal: "—" },
  { name: "columns", type: "KanbanColumn[]", defaultVal: "auto-deriva de valores únicos" },
  { name: "renderCard", type: "({ row }) => Omit<KanbanCardData, 'id'|'columnId'>", defaultVal: "—" },
  { name: "renderCardContent", type: "({ card, row, selected, open }) => ReactNode", defaultVal: "—" },
  { name: "openCardId", type: "string", defaultVal: "—" },
  { name: "onAddCard / onAddInFooter / hideFooterAdd", type: "(columnId) => void", defaultVal: "—" },
  { name: "getCardMenuItems / getColumnMenuItems", type: "(row|column) => KanbanMenuItem[]", defaultVal: "—" },
  { name: "onCardMenu / onColumnMenu", type: "manual callbacks (escape hatch)", defaultVal: "—" },
  { name: "enableDnD / onCardMove", type: "boolean + (cardId, from, to) => void | Promise", defaultVal: "false" },
];

/* ── Troubleshooting ──────────────────────────────────────────── */

const TROUBLESHOOTING: Array<{ symptom: string; cause: string; fix: string }> = [
  { symptom: "Tabela re-renderiza inteira a cada digit", cause: "columns não memoizado", fix: "Wrap em useMemo(() => [...], [deps])" },
  { symptom: "Filter chip não aparece", cause: "Coluna sem enableColumnFilter", fix: "Adicionar enableColumnFilter: true" },
  { symptom: "Sort não funciona", cause: "Coluna sem sortable", fix: "sortable: true (default true; provavelmente false explícito)" },
  { symptom: "Server mode loop infinito", cause: "fetchData não memoizado", fix: "useCallback(fetchData, [deps])" },
  { symptom: "Virtualização 'pula'", cause: "estimateRowHeight muito diferente do real", fix: "Ajustar (compact=40, standard=56, comfortable=64)" },
  { symptom: "Inline edit não fecha", cause: "onCellEditCommit retornou Promise<reject>", fix: "Edit fica aberto pro user corrigir — comportamento esperado (Fase F.1)" },
  { symptom: "Saved views não persiste", cause: "persistId ausente OU savedViewsService mock em prod", fix: "Adicionar persistId + implementar SavedViewsService real" },
  { symptom: "Kanban view não aparece", cause: "viewMode='kanban' sem kanbanConfig", fix: "kanbanConfig é obrigatório quando viewMode='kanban'" },
  { symptom: "DnD do Kanban não comita", cause: "Consumer não atualiza rows props no onCardMove", fix: "Optimistic update: setRows(prev => prev.map(...))" },
];

/* ── Página ───────────────────────────────────────────────────── */

export function DataTableDoc() {
  const [rows, setRows] = useState<ClientRow[]>(DEMO_ROWS);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");

  const basicColumns = useMemo<DataTableColumnDef<ClientRow>[]>(() => [
    { field: "id",         headerName: "ID",       type: "text", width: 110 },
    { field: "name",       headerName: "Nome",     type: "user", sortable: true },
    { field: "email",      headerName: "Email",    type: "email" },
    { field: "statusId",   headerName: "Status",   type: "status",
      enableColumnFilter: true, filterType: "multiSelect",
      filterOptions: Object.entries(STATUSES).map(([v, s]) => ({
        value: v, label: s.label, color: "neutral",
      })),
    },
    { field: "value",      headerName: "Valor",    type: "currency",
      sortable: true, aggregate: "sum" },
  ], []);

  const kanbanConfig = useMemo<DataTableKanbanConfig<ClientRow>>(() => ({
    groupByField: "statusId",
    columns: [
      { id: "active",   label: "Ativo",    dotColor: "var(--color-fg-success)" },
      { id: "pending",  label: "Pendente", dotColor: "var(--color-fg-warning)" },
      { id: "paused",   label: "Pausado",  dotColor: "var(--color-fg-info)" },
      { id: "inactive", label: "Inativo",  dotColor: "var(--color-fg-muted)", canReceiveDrop: false },
    ],
    renderCard: ({ row }) => {
      const agent = AGENTS[row.agentId];
      return {
        title: row.name,
        subtitle: row.id,
        avatar: <Avatar size="sm" colorHex={row.avatarColor}>{row.initials}</Avatar>,
        chip: <Chip color="warning" variant="soft" size="sm">{row.categoryId}</Chip>,
        value: formatCurrency(row.value),
        footerLeft: agent ? (
          <span className="text-caption-sm text-fg-muted truncate">{agent.name}</span>
        ) : undefined,
      };
    },
    enableDnD: true,
    onCardMove: (cardId, _from, to) =>
      setRows((prev) =>
        prev.map((r) => (r.id === cardId ? { ...r, statusId: to as ClientRow["statusId"] } : r)),
      ),
  }), []);

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
        selection, density, query, export, saved views, etc) e delega renderização
        pros primitives <code>&lt;Table&gt;</code>, <code>&lt;TableToolbar&gt;</code>,
        {" "}<code>&lt;FooterTable&gt;</code> e (quando <code>viewMode="kanban"</code>)
        <code>&lt;Kanban&gt;</code>. Veja a sidebar pra acessar exemplos focados
        em cenários específicos (CRUD, Server mode, Virtualized, Grouped,
        Expandable row, Column types, Kanban view).
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
            toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true }}
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
        description="viewMode + kanbanConfig integram a view Kanban no DataTable. ViewToggle é auto-renderizado na toolbar (entre Refresh e Views). Filter/search/sort aplicam transparente em ambas as views. DnD atualiza via onCardMove."
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
        Views são snapshots nomeados da configuração da tabela (filtros, sort, layout, density, viewMode, groupBy, rows expandidas). Há dois tipos:
      </p>

      <ul className="text-body-md text-fg-muted mb-gp-3xl max-w-[760px] list-disc pl-pad-2xl space-y-gp-sm">
        <li><strong>Saved views</strong> — criadas pelo usuário em runtime via "Salvar view"; persistem no localStorage (ou backend via{" "}
          <code>savedViewsService</code> custom). Públicas (compartilhadas) ou privadas. Editáveis e deletáveis.
        </li>
        <li><strong>Preset views (default views)</strong> — declaradas pelo dev no código via{" "}
          <code>defaultViews: DataTablePresetView[]</code>. Read-only (não-deletáveis), sempre aparecem antes das saved views. Use pra "tabs nativos" da tela.
        </li>
      </ul>

      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
        Builder <code>presetView()</code> — declarar presets em código
      </h3>
      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        Helper com defaults razoáveis pra eliminar boilerplate. Receba apenas o que diferencia: id + name + (filters | sort | viewMode | groupBy | ...).
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
            kanbanConfig={kanbanConfig}
            toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true }}
            paginationConfig={{ enabled: true, initialPageSize: 25 }}
            className="max-h-full"
          />
        </div>
      </ExampleSection>

      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs mt-gp-4xl">
        O que uma view captura
      </h3>
      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        Snapshot é versionado em <code>DataTableSavedViewState</code> e idêntico entre saved e preset views.
      </p>

      <div className="border border-border-subtle rounded-radius-lg overflow-hidden mb-gp-3xl">
        <table className="w-full">
          <thead className="bg-bg-subtle">
            <tr>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Field</th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Type</th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Capturado</th>
            </tr>
          </thead>
          <tbody>
            {SAVED_VIEW_FIELDS.map((f, i) => (
              <tr key={f.field} className={i % 2 === 0 ? "bg-bg-surface" : "bg-bg-canvas"}>
                <td className="px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-mono border-t border-border-subtle">{f.field}</td>
                <td className="px-pad-lg py-pad-md text-body-sm font-normal text-fg-muted font-mono border-t border-border-subtle">{f.type}</td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">{f.captured}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
        Persistência
      </h3>
      <p className="text-body-md text-fg-muted mb-gp-3xl max-w-[760px]">
        Saved views requerem <code>persistId: string</code> (escopo de armazenamento). Default service usa localStorage (<code>savedViewsMockService</code>). Pra produção, implemente <code>SavedViewsService</code> custom (REST/GraphQL) e passe via prop{" "}
        <code>savedViewsService</code>. A última view aplicada é restaurada automaticamente no remount (cache do <code>lastActiveViewId</code> em localStorage por <code>persistId</code>).
      </p>

      <SectionH2 id="server-mode" title="Server mode" />

      <p className="text-body-md text-fg-muted mb-gp-lg max-w-[760px]">
        Passe <code>fetchData</code> em vez de <code>rows</code>. O DataTable
        re-dispara a função em mudança de filter/sort/search/page e mostra
        spinner default durante loading. <code>ref.current.refresh()</code>
        força refetch sem mudar params. Veja{" "}
        <strong>Example: CRUD Server</strong> no menu lateral pro fluxo completo.
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
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Capability</th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Como ativar</th>
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((c, i) => (
              <tr key={c.name} className={i % 2 === 0 ? "bg-bg-surface" : "bg-bg-canvas"}>
                <td className="px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium border-t border-border-subtle">{c.name}</td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">{c.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionH2 id="api" title="API Reference" />

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">DataTableProps — Core</h3>
        <p className="text-body-md text-fg-muted mb-gp-lg">
          Props essenciais. Tipos completos em{" "}
          <code>src/components/ui/DataTable/data-table.types.ts</code>.
        </p>
        <PropsTable items={CORE_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">DataTableToolbarConfig</h3>
        <PropsTable items={TOOLBAR_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">DataTableColumnDef&lt;T&gt;</h3>
        <PropsTable items={COLUMN_DEF_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">DataTableKanbanConfig&lt;T&gt;</h3>
        <p className="text-body-md text-fg-muted mb-gp-lg">
          Paridade 1:1 com <code>KanbanProps</code>; bridges automáticos resolvem
          <code>cardId → row</code> onde aplicável.
        </p>
        <PropsTable items={KANBAN_CONFIG_PROPS} />
      </div>

      <SectionH2 id="troubleshooting" title="Troubleshooting" />

      <div className="border border-border-subtle rounded-radius-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-subtle">
            <tr>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Sintoma</th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Causa</th>
              <th className="text-left px-pad-lg py-pad-md text-body-md font-medium text-fg-default font-medium">Fix</th>
            </tr>
          </thead>
          <tbody>
            {TROUBLESHOOTING.map((t, i) => (
              <tr key={t.symptom} className={i % 2 === 0 ? "bg-bg-surface" : "bg-bg-canvas"}>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-default border-t border-border-subtle">{t.symptom}</td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">{t.cause}</td>
                <td className="px-pad-lg py-pad-md text-body-md text-fg-muted border-t border-border-subtle">{t.fix}</td>
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
