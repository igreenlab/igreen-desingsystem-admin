import { useState } from "react";
import {
  AtSign,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Copy,
  Search,
  DollarSign,
  Download,
  FileText,
  Filter,
  Hash,
  LayoutGrid,
  Maximize2,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Rows2,
  Rows3,
  Rows4,
  Settings2,
  Table as TableIcon,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import {
  TableToolbar,
  ColsPanel,
  type ColsPopoverColumn,
  FilterPanel,
  type FilterPopoverColumn,
  type FilterPopoverEntry,
  MoreMenu,
  MoreMenuItem,
  MoreMenuSeparator,
  SortPanel,
  type SortPopoverCriterion,
  ToolbarSettingsMenu,
  ToolbarSimpleFilterDrawer,
  ViewsPopover,
  type ViewsPopoverView,
  ToolbarSaveButton,
  ToolbarSearch,
  ToolbarSegmented,
  ToolbarTabs,
  ToolbarToolButton,
  ToolbarActions,
  useToolbarFilters,
  type ToolbarFilterEntry,
} from "../../components/ui/TableToolbar";
import type { FilterModel } from "../../components/ui/DataTable/data-table.types";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

/* ── API Reference — ToolbarActions ──────────────────────────────── */
const PROPS_TOOLBAR_ACTIONS = [
  { name: "actions", type: "ToolbarAction[]", defaultVal: "— (obrigatório)" },
  { name: "extraItems", type: "ToolbarActionMenuItem[]", defaultVal: "—" },
  { name: "className", type: "string", defaultVal: "—" },
];
const PROPS_TOOLBAR_ACTION = [
  {
    name: "kind",
    type: '"button" | "dropdown" | "input"',
    defaultVal: "— (obrigatório)",
  },
  { name: "id", type: "string", defaultVal: "— (obrigatório)" },
  { name: "label", type: "string", defaultVal: "— (obrigatório)" },
  { name: "icon", type: "ReactNode", defaultVal: "—" },
  {
    name: "onClick · button",
    type: "() => void",
    defaultVal: "— (obrigatório)",
  },
  { name: "isActive · button", type: "boolean", defaultVal: "false" },
  { name: "disabled · button", type: "boolean", defaultVal: "false" },
  {
    name: "items · dropdown",
    type: "ToolbarActionMenuItem[]",
    defaultVal: "— (obrigatório)",
  },
  { name: "value · input", type: "string", defaultVal: "— (obrigatório)" },
  {
    name: "onChange · input",
    type: "(v: string) => void",
    defaultVal: "— (obrigatório)",
  },
  { name: "placeholder · input", type: "string", defaultVal: "—" },
];
const PROPS_ACTION_MENU_ITEM = [
  { name: "label", type: "ReactNode", defaultVal: "— (obrigatório)" },
  { name: "icon", type: "ReactNode", defaultVal: "—" },
  { name: "onClick", type: "() => void", defaultVal: "—" },
  { name: "active", type: "boolean", defaultVal: "false" },
  { name: "destructive", type: "boolean", defaultVal: "false" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "separator", type: "boolean", defaultVal: "false" },
];
const PROPS_EXPOSURE = [
  {
    name: "TableToolbar.actions",
    type: "ReactNode (use <ToolbarActions>)",
    defaultVal: "—",
  },
  {
    name: "DataTable.toolbar.actions",
    type: "ToolbarAction[]",
    defaultVal: "—",
  },
  { name: "DataList.toolbarActions", type: "ToolbarAction[]", defaultVal: "—" },
];

const VIEW_TABS = [
  { id: "all", name: "Todos" },
  { id: "mine", name: "Meus", custom: true },
  { id: "active", name: "Ativos", custom: true },
];

const VIEW_MODES = [
  { value: "table", label: "Tabela", children: <TableIcon /> },
  { value: "kanban", label: "Kanban", children: <LayoutGrid /> },
];

const DENSITIES = [
  {
    value: "compact",
    label: "Compacto",
    children: <Rows4 strokeWidth={1.8} />,
  },
  {
    value: "comfortable",
    label: "Confortável",
    children: <Rows3 strokeWidth={1.8} />,
  },
  {
    value: "spacious",
    label: "Espaçoso",
    children: <Rows2 strokeWidth={1.8} />,
  },
];

const FILTERABLE_COLUMNS: FilterPopoverColumn[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    filterType: "select",
    options: [
      { value: "active", label: "Ativo" },
      { value: "inactive", label: "Inativo" },
      { value: "pending", label: "Pendente" },
    ],
  },
  { key: "name", label: "Razão Social", type: "text", filterType: "text" },
  {
    key: "value",
    label: "Saldo disponível",
    type: "number",
    filterType: "number",
  },
];

const MOCK_VIEWS: ViewsPopoverView[] = [
  { id: "all", name: "Todos os clientes", owner: "me" },
  { id: "mine", name: "Meus clientes", owner: "me" },
  { id: "active", name: "Ativos hoje", owner: "me" },
];

const MOCK_COLUMNS = [
  { key: "id", label: "ID", icon: Hash },
  { key: "name", label: "Razão Social", icon: User },
  { key: "email", label: "Email", icon: AtSign },
  { key: "phone", label: "Telefone", icon: Phone },
  { key: "status", label: "Status", icon: CheckCircle2 },
  { key: "category", label: "Categoria", icon: Tag },
  { key: "agent", label: "Atribuído", icon: Users },
  { key: "value", label: "Saldo disponível", icon: DollarSign },
  { key: "createdAt", label: "Cliente desde", icon: Calendar },
];

export function TableToolbarDoc() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [density, setDensity] = useState("comfortable");
  const [activeView, setActiveView] = useState("all");
  const [tabs, setTabs] = useState(VIEW_TABS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Demo do slot `actions` (button/dropdown/input).
  const [periodo, setPeriodo] = useState("Junho de 2026");
  const [quick, setQuick] = useState("");

  const [colsOrder, setColsOrder] = useState<ColsPopoverColumn[]>(MOCK_COLUMNS);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(MOCK_COLUMNS.map((c) => c.key)),
  );
  const [pinnedCols, setPinnedCols] = useState<Set<string>>(
    () => new Set(["name"]),
  );

  const [sortBy, setSortBy] = useState<SortPopoverCriterion[]>([]);

  const [views, setViews] = useState<ViewsPopoverView[]>(MOCK_VIEWS);
  const [activeViewId, setActiveViewId] = useState<string | undefined>("all");

  // Filtro avançado (query builder dentro do settings menu)
  const filters = useToolbarFilters<ToolbarFilterEntry>({ initial: [] });

  // Filtro simples (funil → drawer) — FilterModel próprio (aplicação LIVE)
  const [simpleFilterOpen, setSimpleFilterOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<FilterModel>({
    items: [],
    logicOperator: "AND",
  });
  const simpleActiveCount = filterModel.items.length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const settingsHasIndicator = sortBy.length > 0 || filters.count > 0;

  return (
    <DocLayout
      toc={[
        { id: "examples", label: "Examples" },
        { id: "ex-full", label: "Drill-down (Configurações)" },
        { id: "ex-actions", label: "Ações custom (slot actions)" },
        { id: "api-actions", label: "API — ToolbarActions" },
        { id: "api-reference", label: "API Reference" },
      ]}
    >
      <DocHeader
        category="Tables"
        title="Table Toolbar"
        description="Toolbar de tabela com layout **opinativo** e a direita simplificada em 3 controles: **Busca**, **Filtros** (funil → drawer simples) e **Configurações** (sliders → menu drill-down com Ordenação · Colunas · Filtros avançados · Densidade), além de **Refresh** e **⋯** (export + ações). Esquerda mantém Kanban/Lista · Abas · Adicionar. É a toolbar padrão do DataTable — a versão antiga vive em **Table Toolbar (Deprecated)**."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-full"
        title="Busca · filtros · configurações"
        description="Clique em Configurações (sliders) pra abrir o menu em níveis: o nível 0 lista Ordenação/Colunas/Filtros avançados + Densidade; clicar numa opção navega pro painel correspondente com botão voltar. O funil abre o drawer de filtro simples. Tudo com os controles reais (mock state)."
        code={`<TableToolbar
  viewToggle={<ToolbarSegmented items={VIEW_MODES} ... />}
  savedViews={<><ToolbarTabs ... /><ViewsPopover trigger={<ToolbarSaveButton><Plus/></ToolbarSaveButton>} ... /></>}
  refresh={<ToolbarToolButton icon={<RefreshCw />} onClick={refresh} aria-label="Atualizar" />}
  search={<ToolbarSearch value={search} onChange={...} />}
  filter={<ToolbarToolButton icon={<Filter />} aria-label="Filtros" onClick={() => setDrawerOpen(true)} />}
  settings={
    <ToolbarSettingsMenu
      trigger={<ToolbarToolButton icon={<Settings2 />} aria-label="Configurações" />}
      sortPanel={(onBack) => <SortPanel onBack={onBack} ... />}
      colsPanel={(onBack) => <ColsPanel onBack={onBack} ... />}
      filterPanel={(onBack) => <FilterPanel onBack={onBack} enableAdvanced ... />}
      density={<ToolbarSegmented fluid items={DENSITIES} ... />}
    />
  }
  more={<MoreMenu trigger={<ToolbarToolButton icon={<MoreHorizontal />} />}>...</MoreMenu>}
/>
<ToolbarSimpleFilterDrawer open={drawerOpen} onOpenChange={setDrawerOpen} ... />`}
      >
        <div className="w-full">
          <TableToolbar
            viewToggle={
              <ToolbarSegmented
                value={viewMode}
                onValueChange={setViewMode}
                items={VIEW_MODES}
                ariaLabel="Tipo de visualização"
              />
            }
            savedViews={
              <>
                <ToolbarTabs
                  tabs={tabs}
                  activeId={activeView}
                  onSelect={setActiveView}
                  onClose={(id) =>
                    setTabs((prev) => prev.filter((t) => t.id !== id))
                  }
                />
                <ViewsPopover
                  trigger={
                    <ToolbarSaveButton aria-label="Visões salvas">
                      <Plus strokeWidth={2.4} />
                    </ToolbarSaveButton>
                  }
                  views={views}
                  activeViewId={activeViewId}
                  onApply={(v) => setActiveViewId(v.id)}
                  onDelete={(id) =>
                    setViews((prev) => prev.filter((v) => v.id !== id))
                  }
                  onCreate={() => console.log("criar nova view")}
                />
              </>
            }
            refresh={
              <ToolbarToolButton
                icon={
                  <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
                }
                aria-label="Atualizar"
                onClick={handleRefresh}
              />
            }
            search={
              <ToolbarSearch
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filter={
              <ToolbarToolButton
                icon={<Filter />}
                aria-label="Filtros"
                isActive={simpleActiveCount > 0}
                hasIndicator={simpleActiveCount > 0}
                onClick={() => setSimpleFilterOpen(true)}
              />
            }
            settings={
              <ToolbarSettingsMenu
                trigger={
                  <ToolbarToolButton
                    icon={<Settings2 />}
                    aria-label="Configurações"
                    hasIndicator={settingsHasIndicator}
                  />
                }
                sortPanel={(onBack) => (
                  <SortPanel
                    onBack={onBack}
                    columns={colsOrder}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                  />
                )}
                colsPanel={(onBack) => (
                  <ColsPanel
                    onBack={onBack}
                    columns={colsOrder}
                    visibleCols={visibleCols}
                    onVisibleChange={setVisibleCols}
                    pinnedCols={pinnedCols}
                    onPinnedChange={setPinnedCols}
                    onColumnsReorder={setColsOrder}
                  />
                )}
                filterPanel={(onBack) => (
                  <FilterPanel
                    onBack={onBack}
                    columns={FILTERABLE_COLUMNS}
                    filters={filters.list as FilterPopoverEntry[]}
                    onFiltersChange={(next) => filters.replaceAll(next)}
                    enableAdvanced
                  />
                )}
                density={
                  <ToolbarSegmented
                    fluid
                    value={density}
                    onValueChange={setDensity}
                    items={DENSITIES}
                    ariaLabel="Densidade da tabela"
                  />
                }
              />
            }
            more={
              <MoreMenu
                trigger={
                  <ToolbarToolButton
                    icon={<MoreHorizontal />}
                    aria-label="Opções"
                  />
                }
              >
                <MoreMenuItem>
                  <FileText />
                  Exportar CSV
                </MoreMenuItem>
                <MoreMenuItem>
                  <Download />
                  Exportar Excel
                </MoreMenuItem>
                <MoreMenuSeparator />
                <MoreMenuItem>
                  <Upload />
                  Importar CSV
                </MoreMenuItem>
                <MoreMenuItem>
                  <Maximize2 />
                  Tela cheia
                </MoreMenuItem>
                <MoreMenuItem>
                  <Copy />
                  Duplicar visualização
                </MoreMenuItem>
                <MoreMenuSeparator />
                <MoreMenuItem variant="destructive">
                  <Trash2 />
                  Resetar visualização
                </MoreMenuItem>
              </MoreMenu>
            }
          />

          <ToolbarSimpleFilterDrawer
            open={simpleFilterOpen}
            onOpenChange={setSimpleFilterOpen}
            columns={FILTERABLE_COLUMNS}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-actions"
        title="Ações custom (slot actions)"
        description="O slot `actions` aceita `<ToolbarActions>` com ações `button`, `dropdown` (ex.: seletor de período) e `input` (busca secundária). No desktop renderizam inline entre Filtros e ⋯; em < md colapsam automaticamente num único ⋯ — `extraItems` injeta itens extras (ex.: o ⋯ antigo) no mesmo menu. Diminua a janela pra ver o colapso."
        code={`<TableToolbar
  search={<ToolbarSearch ... />}
  filter={<ToolbarToolButton icon={<Filter />} ... />}
  actions={
    <ToolbarActions
      actions={[
        { kind: "input",    id: "quick",   label: "Busca rápida", icon: <Search />,
          value: quick, onChange: setQuick, placeholder: "Filtro rápido…" },
        { kind: "dropdown", id: "periodo", label: periodo, icon: <CalendarDays />,
          items: PERIODOS.map((p) => ({ label: p, active: p === periodo, onClick: () => setPeriodo(p) })) },
        { kind: "button",   id: "novo",    label: "Novo", icon: <Plus />, onClick: () => {} },
      ]}
      extraItems={[{ label: "Exportar CSV", icon: <FileText />, onClick: () => {} }]}
    />
  }
/>`}
      >
        <div className="w-full">
          <TableToolbar
            search={
              <ToolbarSearch
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filter={
              <ToolbarToolButton
                icon={<Filter />}
                aria-label="Filtros"
                onClick={() => setSimpleFilterOpen(true)}
              />
            }
            actions={
              <ToolbarActions
                actions={[
                  {
                    kind: "input",
                    id: "quick",
                    label: "Busca rápida",
                    icon: <Search />,
                    value: quick,
                    onChange: setQuick,
                    placeholder: "Filtro rápido…",
                  },
                  {
                    kind: "dropdown",
                    id: "periodo",
                    label: periodo,
                    icon: <CalendarDays />,
                    items: PERIODOS.map((p) => ({
                      label: p,
                      active: p === periodo,
                      onClick: () => setPeriodo(p),
                    })),
                  },
                  {
                    kind: "button",
                    id: "novo",
                    label: "Novo",
                    icon: <Plus />,
                    onClick: () => {},
                  },
                ]}
                extraItems={[
                  {
                    label: "Exportar CSV",
                    icon: <FileText />,
                    onClick: () => {},
                  },
                ]}
              />
            }
          />
        </div>
      </ExampleSection>

      <SectionH2 id="api-actions" title="API — ToolbarActions" />
      <ExampleSection
        id="api-actions-shape"
        title="Tipos"
        description="Três formas de ação, todas colapsam no ⋯ no mobile. Exposto também via DataTable (`toolbar.actions`) e DataList (`toolbarActions`)."
        code={`type ToolbarActionMenuItem = {
  label: ReactNode; icon?: ReactNode; onClick?: () => void;
  active?: boolean; destructive?: boolean; disabled?: boolean; separator?: boolean;
};

type ToolbarAction =
  | { kind: "button";   id: string; label: string; icon?: ReactNode; onClick: () => void; isActive?: boolean; disabled?: boolean }
  | { kind: "dropdown"; id: string; label: string; icon?: ReactNode; items: ToolbarActionMenuItem[] }
  | { kind: "input";    id: string; label: string; icon?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string };

type ToolbarActionsProps = {
  actions: ToolbarAction[];
  /** itens extras que entram SÓ no ⋯ mobile (ex.: o more antigo) */
  extraItems?: ToolbarActionMenuItem[];
  className?: string;
};`}
      >
        <div className="flex flex-col gap-gp-sm text-body-sm text-fg-muted">
          <p>
            <strong className="text-fg-default">Slot no TableToolbar:</strong>{" "}
            <code>actions</code> (entre <code>filter</code> e <code>more</code>
            ).
          </p>
          <p>
            <strong className="text-fg-default">DataTable:</strong>{" "}
            <code>toolbar.actions: ToolbarAction[]</code> ·{" "}
            <strong className="text-fg-default">DataList:</strong>{" "}
            <code>toolbarActions: ToolbarAction[]</code> (colapsa no ⋯ junto com{" "}
            <code>moreActions</code>).
          </p>
        </div>
      </ExampleSection>

      <SectionH2 id="api-reference" title="API Reference" />

      <ExampleSection
        id="api-ref-actions"
        title="ToolbarActionsProps"
        description="Props do componente `<ToolbarActions>` (slot `actions` do TableToolbar)."
      >
        <PropsTable items={PROPS_TOOLBAR_ACTIONS} />
      </ExampleSection>

      <ExampleSection
        id="api-ref-action"
        title="ToolbarAction"
        description="União discriminada por `kind` (button/dropdown/input). Campos marcados com · button/dropdown/input pertencem só àquela forma."
      >
        <PropsTable items={PROPS_TOOLBAR_ACTION} />
      </ExampleSection>

      <ExampleSection
        id="api-ref-menu-item"
        title="ToolbarActionMenuItem"
        description="Item de um `dropdown` (e de `extraItems`)."
      >
        <PropsTable items={PROPS_ACTION_MENU_ITEM} />
      </ExampleSection>

      <ExampleSection
        id="api-ref-exposure"
        title="Onde é exposto"
        description="O mesmo slot chega aos componentes inteligentes."
      >
        <PropsTable items={PROPS_EXPOSURE} />
      </ExampleSection>
    </DocLayout>
  );
}
