import { useState } from "react";
import {
  AtSign,
  Calendar,
  CheckCircle2,
  Copy,
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
} from "../components";

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
  { value: "compact", label: "Compacto", children: <Rows4 strokeWidth={1.8} /> },
  { value: "comfortable", label: "Confortável", children: <Rows3 strokeWidth={1.8} /> },
  { value: "spacious", label: "Espaçoso", children: <Rows2 strokeWidth={1.8} /> },
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
  { key: "value", label: "Saldo disponível", type: "number", filterType: "number" },
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

  const [colsOrder, setColsOrder] = useState<ColsPopoverColumn[]>(MOCK_COLUMNS);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(MOCK_COLUMNS.map((c) => c.key)),
  );
  const [pinnedCols, setPinnedCols] = useState<Set<string>>(() => new Set(["name"]));

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
                  onClose={(id) => setTabs((prev) => prev.filter((t) => t.id !== id))}
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
                  onDelete={(id) => setViews((prev) => prev.filter((v) => v.id !== id))}
                  onCreate={() => console.log("criar nova view")}
                />
              </>
            }
            refresh={
              <ToolbarToolButton
                icon={<RefreshCw className={isRefreshing ? "animate-spin" : ""} />}
                aria-label="Atualizar"
                onClick={handleRefresh}
              />
            }
            search={
              <ToolbarSearch value={search} onChange={(e) => setSearch(e.target.value)} />
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
                trigger={<ToolbarToolButton icon={<MoreHorizontal />} aria-label="Opções" />}
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
    </DocLayout>
  );
}
