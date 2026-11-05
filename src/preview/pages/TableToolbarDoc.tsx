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
  ToolbarApplied,
  useToolbarFilters,
  type AppliedFilter,
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

/* Os MESMOS chips nas duas barras da seção "Chip aplicado × chip vazio" — a
   única diferença entre elas é a prop, e é isso que a seção demonstra. */
const CHIPS_DEMO: AppliedFilter[] = [
  { id: "status", columnLabel: "Status", op: "isAnyOf", value: "Ativo" },
  { id: "saldo", columnLabel: "Saldo", op: "between", value: "R$ 10,00 – R$ 500,00" },
  { id: "uf", columnLabel: "UF", op: "isAnyOf", value: [], isEmpty: true },
  { id: "titular", columnLabel: "Titular", op: "isAnyOf", value: [], isEmpty: true },
];

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

  // Filtro simples (funil → drawer) — FilterModel próprio (aplicação LIVE).
  // Os três items nascem com operador NÃO-default de propósito, e cada um mostra
  // uma metade da regra:
  //   `between` num `number` (default `equals`) → faixa desenhada com DOIS campos
  //   `neq` num `select`     (default `equals`) → valor à vista, operador mantido
  //   `isEmpty` num `text`   (default `contains`) → linha SEM o que editar, que por
  //      isso ganha a saída própria "Limpar" (o rodapé apagaria todos os campos)
  const [simpleFilterOpen, setSimpleFilterOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<FilterModel>({
    items: [
      { id: "sf-valor", field: "value", operator: "between", value: [100, 9000] },
      { id: "sf-status", field: "status", operator: "neq", value: "inactive" },
      { id: "sf-nome", field: "name", operator: "isEmpty" },
    ],
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
        { id: "ex-chips", label: "Chip aplicado × chip vazio" },
        { id: "ex-actions", label: "Ações custom (slot actions)" },
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
        description="Clique em Configurações (sliders) pra abrir o menu em níveis: o nível 0 lista Ordenação/Colunas/Filtros avançados + Densidade; clicar numa opção navega pro painel correspondente com botão voltar. O funil abre o drawer de filtro simples — ele já entra com três filtros de operador NÃO-default: Saldo disponível `between` (desenhado como faixa, dois campos), Status `neq` (valor à vista) e Razão Social `isEmpty`. Editar qualquer um NÃO rebaixa o operador pro default do tipo. A linha do `isEmpty` não tem o que editar — e é a única que ganha um “Limpar” próprio, porque sem ele a saída seria o “Limpar todos” do rodapé, que apaga os outros campos junto. Tudo com os controles reais (mock state)."
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
        id="ex-chips"
        title="Chip aplicado × chip vazio"
        description="O destaque do chip APLICADO é OPT-IN: `highlightAppliedFilterChips`. Sem a prop (primeira barra) todo chip usa o tracejado neutro de sempre — é o default e o pixel de antes. Com a prop (segunda barra) o chip com valor ganha borda sólida de marca sobre fundo de marca sutil, com o valor em verde, e o chip vazio continua tracejado. ⚠️ Ligue quando a barra TIVER chip vazio (o placeholder de showEmptyFilterChips): é contra o vazio que o destaque contrasta, e é só aí que ele paga. Numa barra onde todo chip já está aplicado, ele não distingue nada — só muda a cor de tudo. O destaque nasceu automático na v0.71.0 e virou opt-in no mesmo ciclo, porque a maioria das telas não usa chip pré-definido. ⚠️ No tema escuro o VALOR volta ao neutro de propósito: o verde de marca ali mede 4,36:1 e reprovaria o contraste mínimo de texto — quem carrega o estado lá é a borda, que mede 7,99:1 contra a barra (o chip vazio fica em 1,24). O chip de Saldo mostra a outra mudança da v0.71.0: faixa (`between`) NÃO imprime mais a palavra 'entre', porque o valor já lê como faixa — antes saía 'entre R$ 10,00 → R$ 500,00', e no lado aberto 'entre desde 01/01'. Pra ter a palavra de volta, `opLabels={{ between: 'entre' }}`."
        code={`{/* default — sem destaque, o pixel de sempre */}
<ToolbarApplied separator={false} onRemove={remover} filters={chips} />

{/* opt-in — só vale a pena porque há chip vazio na mesma barra */}
<ToolbarApplied
  separator={false}
  onRemove={remover}
  highlightAppliedFilterChips
  filters={chips}
/>

const chips = [
  { id: "status", columnLabel: "Status", op: "isAnyOf", value: "Ativo" },
  { id: "uf", columnLabel: "UF", op: "isAnyOf", value: [], isEmpty: true },
];`}
      >
        <div className="flex flex-col gap-gp-2xl">
          <div className="flex flex-col gap-gp-md">
            <span className="text-caption-md text-fg-subtle">
              default — sem a prop
            </span>
            <ToolbarApplied
              separator={false}
              onRemove={() => {}}
              filters={CHIPS_DEMO}
            />
          </div>
          <div className="flex flex-col gap-gp-md">
            <span className="text-caption-md text-fg-subtle">
              com highlightAppliedFilterChips
            </span>
            <ToolbarApplied
              separator={false}
              onRemove={() => {}}
              highlightAppliedFilterChips
              filters={CHIPS_DEMO}
            />
          </div>
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

      <SectionH2 id="api-reference" title="API Reference" />

      <div className="mb-gp-4xl" id="api-actions-props">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          ToolbarActions
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Props do componente <code>&lt;ToolbarActions&gt;</code> usado no slot{" "}
          <code>actions</code> do TableToolbar.
        </p>
        <PropsTable items={PROPS_TOOLBAR_ACTIONS} />
      </div>

      <div className="mb-gp-4xl" id="api-action">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          ToolbarAction
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          União discriminada por <code>kind</code>. Os campos marcados com ·
          button/dropdown/input pertencem só àquela forma.
        </p>
        <PropsTable items={PROPS_TOOLBAR_ACTION} />
      </div>

      <div className="mb-gp-4xl" id="api-menu-item">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          ToolbarActionMenuItem
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Item de um <code>dropdown</code> (e de <code>extraItems</code>).
        </p>
        <PropsTable items={PROPS_ACTION_MENU_ITEM} />
      </div>

      <div className="mb-gp-4xl" id="api-exposure">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          Onde é exposto
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          O mesmo slot chega aos componentes inteligentes.
        </p>
        <PropsTable items={PROPS_EXPOSURE} />
      </div>
    </DocLayout>
  );
}
