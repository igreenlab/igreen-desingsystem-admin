import { useState } from "react";
import {
  ArrowUpDown,
  AtSign,
  Calendar,
  CheckCircle2,
  Columns,
  Copy,
  DollarSign,
  Download,
  Edit2,
  Grid3x3,
  Hash,
  LayoutGrid,
  Mail,
  Maximize2,
  MoreHorizontal,
  Phone,
  Plus,
  Rows2,
  Rows3,
  Rows4,
  SlidersHorizontal,
  Square,
  Table as TableIcon,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import {
  BulkActionButton,
  BulkActionsBar,
  ColsPopover,
  type ColsPopoverColumn,
  FilterPopover,
  type FilterPopoverColumn,
  type FilterPopoverEntry,
  MoreMenu,
  SortPopover,
  type SortPopoverCriterion,
  ViewsPopover,
  type ViewsPopoverView,
  MoreMenuItem,
  MoreMenuSeparator,
  TableToolbar,
  ToolbarApplied,
  ToolbarDivider,
  ToolbarMobileDialog,
  ToolbarMobileSection,
  ToolbarSaveButton,
  ToolbarSearch,
  ToolbarSegmented,
  ToolbarTabs,
  ToolbarToolButton,
  useToolbarFilters,
  type ToolbarFilterEntry,
} from "../../components/ui/TableToolbar";
import { Button } from "../../components/ui/Button/button";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-full", label: "Full toolbar" },
  { id: "ex-bulk", label: "Bulk actions (selected)" },
  { id: "ex-applied", label: "Applied filters (chips)" },
  { id: "ex-parts", label: "Parts isoladas" },
  { id: "ex-mobile", label: "Mobile (sheet pattern)" },
  { id: "ex-more-menu", label: "More menu (popover)" },
  { id: "ex-cols", label: "Cols popover" },
  { id: "ex-sort", label: "Sort popover" },
  { id: "ex-views", label: "Views popover" },
  { id: "ex-filter", label: "Filter popover" },
  { id: "api", label: "API Reference" },
];

const ROOT_PROPS = [
  { name: "left", type: "ReactNode", defaultVal: "—" },
  { name: "actions", type: "ReactNode", defaultVal: "—" },
  { name: "bulkBar", type: "ReactNode (substitui left+actions quando renderizado)", defaultVal: "—" },
  { name: "className", type: "string", defaultVal: "—" },
];

const BULK_PROPS = [
  { name: "BulkActionsBar", type: "barra brand com contagem + ações + clear (null se count=0)", defaultVal: "—" },
  { name: "BulkActionButton", type: "helper compondo Button DS (variant: default | danger)", defaultVal: "—" },
];

const PARTS_PROPS = [
  { name: "ToolbarSearch", type: "input controlado expansível", defaultVal: "—" },
  { name: "ToolbarDivider", type: "divisor vertical 1px×24", defaultVal: "—" },
  { name: "ToolbarSegmented", type: "segmented group (density / view-mode)", defaultVal: "—" },
  { name: "ToolbarTabs", type: "view tabs (Todos/Meus/…) com X opcional", defaultVal: "—" },
  { name: "ToolbarToolButton", type: "botão tool (filtrar/exportar) + dot", defaultVal: "—" },
  { name: "ToolbarSaveButton", type: "botão + (open views popover)", defaultVal: "—" },
  { name: "ToolbarApplied", type: "chips de filtros aplicados", defaultVal: "—" },
  { name: "ToolbarMobileDialog", type: "modal centralizado pra mobile (md:hidden default)", defaultVal: "—" },
  { name: "ToolbarMobileSection", type: "grupo label + children no dialog", defaultVal: "—" },
];

const POPOVER_PROPS = [
  { name: "MoreMenu", type: "wrapper DropdownMenu (trigger + items)", defaultVal: '—' },
  { name: "MoreMenuItem", type: "alias DropdownMenuItem (variant: default | destructive)", defaultVal: "—" },
  { name: "MoreMenuCheckboxItem", type: "alias DropdownMenuCheckboxItem (toggle)", defaultVal: "—" },
  { name: "MoreMenuRadioGroup / RadioItem", type: "escolha única", defaultVal: "—" },
  { name: "MoreMenuSeparator", type: "1px divider", defaultVal: "—" },
  { name: "MoreMenuLabel", type: "heading discreto", defaultVal: "—" },
  { name: "ColsPopover", type: "popover de visibility + pin + reorder de colunas", defaultVal: "—" },
  { name: "SortPopover", type: "popover de ordenação multi-coluna (asc/desc)", defaultVal: "—" },
  { name: "ViewsPopover", type: "popover de visualizações salvas (tabs + busca + delete)", defaultVal: "—" },
  { name: "FilterPopover", type: "filter builder com rows (campo + operador + valor)", defaultVal: "—" },
];

const HOOKS_PROPS = [
  { name: "useToolbarFilters", type: "{ list, add, remove, update, clear, count }", defaultVal: "—" },
  { name: "useToolbarSort", type: "{ list, toggle, set, remove, clear, directionOf, count }", defaultVal: "—" },
];

const VIEW_TABS = [
  { id: "all",     name: "Todos" },
  { id: "mine",    name: "Meus",     custom: true },
  { id: "active",  name: "Ativos",   custom: true },
  { id: "royals",  name: "Royals",   custom: true },
  { id: "recent",  name: "Últimos 7 dias" },
];

const VIEW_MODES = [
  { value: "table",  label: "Tabela", children: <TableIcon /> },
  { value: "kanban", label: "Kanban", children: <LayoutGrid /> },
];

const DENSITIES = [
  { value: "compact",     label: "Compacto",    children: <Rows4 strokeWidth={1.8} /> },
  { value: "comfortable", label: "Confortável", children: <Rows3 strokeWidth={1.8} /> },
  { value: "spacious",    label: "Espaçoso",    children: <Rows2 strokeWidth={1.8} /> },
];

const FILTERABLE_COLUMNS: FilterPopoverColumn[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active",   label: "Ativo" },
      { value: "inactive", label: "Inativo" },
      { value: "pending",  label: "Pendente" },
    ],
  },
  {
    key: "category",
    label: "Categoria",
    type: "select",
    options: [
      { value: "royal",     label: "Royal" },
      { value: "premium",   label: "Premium" },
      { value: "regular",   label: "Regular" },
    ],
  },
  { key: "name",  label: "Nome",     type: "text" },
  { key: "email", label: "Email",    type: "text" },
  { key: "value", label: "Valor",    type: "number" },
];

const MOCK_VIEWS: ViewsPopoverView[] = [
  { id: "all",     name: "Todos os clientes",     owner: "me" },
  { id: "mine",    name: "Meus clientes",         owner: "me" },
  { id: "active",  name: "Ativos hoje",           owner: "me" },
  { id: "royals",  name: "Royals",                owner: "me" },
  { id: "recent7", name: "Últimos 7 dias",        owner: "team", ownerName: "Equipe Vendas" },
  { id: "noload",  name: "Pendentes de contato",  owner: "ana",  ownerName: "Ana C." },
  { id: "vip",     name: "VIPs",                  owner: "joao", ownerName: "João S." },
];

const MOCK_COLUMNS = [
  { key: "id",          label: "ID",             icon: Hash },
  { key: "name",        label: "Nome",           icon: User },
  { key: "email",       label: "Email",          icon: AtSign },
  { key: "phone",       label: "Telefone",       icon: Phone },
  { key: "status",      label: "Status",         icon: CheckCircle2 },
  { key: "category",    label: "Categoria",      icon: Tag },
  { key: "agent",       label: "Atribuído",      icon: Users },
  { key: "value",       label: "Valor",          icon: DollarSign },
  { key: "createdAt",   label: "Criado em",      icon: Calendar },
  { key: "lastContact", label: "Último contato", icon: Calendar },
];

export function TableToolbarDoc() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [density, setDensity] = useState("comfortable");
  const [activeView, setActiveView] = useState("all");
  const [tabs, setTabs] = useState(VIEW_TABS);
  const [cellBorders, setCellBorders] = useState(true);

  // ColsPopover state — mock columns + visible/pinned sets + order
  const [colsOrder, setColsOrder] = useState<ColsPopoverColumn[]>(MOCK_COLUMNS);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(MOCK_COLUMNS.map((c) => c.key)),
  );
  const [pinnedCols, setPinnedCols] = useState<Set<string>>(
    () => new Set(["name"]),
  );

  // SortPopover state
  const [sortBy, setSortBy] = useState<SortPopoverCriterion[]>([
    { key: "name", dir: "asc" },
  ]);

  // ViewsPopover state
  const [views, setViews] = useState<ViewsPopoverView[]>(MOCK_VIEWS);
  const [activeViewId, setActiveViewIdLocal] = useState<string | undefined>("all");

  // Bulk mode demo state (começa em 3 pra você ver a bulk bar de primeira)
  const [selectedCount, setSelectedCount] = useState(3);

  // Hook opcional pra gerenciar filtros — substitui useState + handlers manuais.
  // Tipagem explícita pra ToolbarFilterEntry (value: unknown) — sem isso a
  // inferência infere value: string e falha ao receber arrays do multiSelect.
  const filters = useToolbarFilters<ToolbarFilterEntry>({
    initial: [
      { id: "f1", columnKey: "status",   op: "eq", value: "active" },
      { id: "f2", columnKey: "category", op: "eq", value: "royal" },
    ],
  });

  // Map dos filtros internos pro formato de display (AppliedFilter).
  // Filtra apenas filtros COM valor preenchido — filtros vazios (recém-adicionados,
  // sem valor) não viram chip aplicado.
  const appliedDisplay = filters.list
    .filter((f) => f.value !== undefined && f.value !== null && f.value !== "")
    .map((f) => ({
      id: f.id,
      columnLabel:
        f.columnKey === "status" ? "Status" :
        f.columnKey === "category" ? "Categoria" :
        f.columnKey,
      op: f.op,
      value:
        f.value === "active" ? "Ativo" :
        f.value === "royal"  ? "Royal" :
        String(f.value),
    }));

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Tables"
        title="Table Toolbar"
        description="Toolbar completa pra tabelas — composição de partes (search, view tabs, segmented, tool buttons) + chips de filtros aplicados. Componente dumb com hooks opcionais pra gerenciar filtros e sort."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-full"
        title="Full toolbar (responsive)"
        description="Em desktop (≥ md) tudo aparece inline com flex-wrap natural — items quebram pra próxima linha quando o espaço aperta. Em mobile (< md) só search + filter icon + dialog (todos os outros controles colapsam num modal centralizado estilo command). Redimensione a janela pra ver."
        code={`<TableToolbar
  left={<>
    <ToolbarSearch value={search} onChange={...} />
    {/* Desktop only */}
    <ToolbarDivider className="hidden md:block" />
    <ToolbarSegmented value={viewMode} ... className="hidden md:inline-flex" />
    <ToolbarTabs tabs={...} ... className="hidden md:inline-flex" />
    <ToolbarSaveButton className="hidden md:grid">+</ToolbarSaveButton>
  </>}
  actions={<>
    {/* Desktop only */}
    <ToolbarToolButton icon={<SlidersHorizontal />} label="Filtrar" className="hidden md:inline-flex" />
    <ToolbarToolButton icon={<ArrowUpDown />} aria-label="Ordenar" className="hidden md:inline-flex" />
    <ToolbarToolButton icon={<Columns />} aria-label="Colunas" className="hidden md:inline-flex" />
    <ToolbarDivider className="hidden md:block" />
    <ToolbarSegmented value={density} ... className="hidden md:inline-flex" />
    <ToolbarDivider className="hidden md:block" />
    <ToolbarToolButton icon={<Download />} label="Exportar" className="hidden md:inline-flex" />
    <span className="hidden md:contents">
      <MoreMenu trigger={<ToolbarToolButton icon={<MoreHorizontal />} ... />}>
        {/* MoreMenuItem... */}
      </MoreMenu>
    </span>

    {/* Mobile only — filter icon + dialog */}
    <ToolbarToolButton icon={<SlidersHorizontal />} aria-label="Filtrar" className="md:hidden" />
    <ToolbarMobileDialog>
      <ToolbarMobileSection title="Visualização"><ToolbarSegmented fluid ... /></ToolbarMobileSection>
      <ToolbarMobileSection title="Densidade"><ToolbarSegmented fluid ... /></ToolbarMobileSection>
      <ToolbarMobileSection title="Ações"><Button outline fullWidth className="justify-start">Ordenar</Button>{/* etc */}</ToolbarMobileSection>
    </ToolbarMobileDialog>
  </>}
/>`}
      >
        <div className="w-full">
          <TableToolbar
            left={
              <>
                <ToolbarSearch
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {/* Desktop only — items soltos com flex-wrap natural */}
                <ToolbarDivider className="hidden md:block" />
                <ToolbarSegmented
                  value={viewMode}
                  onValueChange={setViewMode}
                  items={VIEW_MODES}
                  ariaLabel="Tipo de visualização"
                  className="hidden md:inline-flex"
                />
                <ToolbarTabs
                  tabs={tabs}
                  activeId={activeView}
                  onSelect={setActiveView}
                  onClose={(id) => setTabs((prev) => prev.filter((t) => t.id !== id))}
                  className="hidden md:inline-flex"
                />
                <span className="hidden md:contents">
                  <ViewsPopover
                    trigger={
                      <ToolbarSaveButton aria-label="Visões salvas">
                        <Plus strokeWidth={2.4} />
                      </ToolbarSaveButton>
                    }
                    views={views}
                    activeViewId={activeViewId}
                    onApply={(v) => setActiveViewIdLocal(v.id)}
                    onDelete={(id) =>
                      setViews((prev) => prev.filter((v) => v.id !== id))
                    }
                    onCreate={() => console.log("criar nova view")}
                  />
                </span>
              </>
            }
            actions={
              <>
                {/* Desktop only — items soltos com flex-wrap natural */}
                <span className="hidden md:contents">
                  <FilterPopover
                    trigger={
                      <ToolbarToolButton
                        icon={<SlidersHorizontal />}
                        label="Filtrar"
                        isActive={filters.count > 0}
                        hasIndicator={filters.count > 0}
                      />
                    }
                    columns={FILTERABLE_COLUMNS}
                    filters={filters.list as FilterPopoverEntry[]}
                    onFiltersChange={(next) => filters.replaceAll(next)}
                    enableAdvanced
                  />
                </span>
                <span className="hidden md:contents">
                  <SortPopover
                    trigger={
                      <ToolbarToolButton
                        icon={<ArrowUpDown />}
                        aria-label="Ordenar"
                        isActive={sortBy.length > 0}
                        hasIndicator={sortBy.length > 0}
                      />
                    }
                    columns={colsOrder}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                  />
                </span>
                <span className="hidden md:contents">
                  <ColsPopover
                    trigger={
                      <ToolbarToolButton
                        icon={<Columns />}
                        aria-label="Colunas"
                      />
                    }
                    columns={colsOrder}
                    visibleCols={visibleCols}
                    onVisibleChange={setVisibleCols}
                    pinnedCols={pinnedCols}
                    onPinnedChange={setPinnedCols}
                    onColumnsReorder={setColsOrder}
                  />
                </span>
                <ToolbarDivider className="hidden md:block" />
                <ToolbarSegmented
                  value={density}
                  onValueChange={setDensity}
                  items={DENSITIES}
                  ariaLabel="Densidade da tabela"
                  className="hidden md:inline-flex"
                />
                <ToolbarDivider className="hidden md:block" />
                <ToolbarToolButton
                  icon={<Download />}
                  label="Exportar"
                  className="hidden md:inline-flex"
                />
                <span className="hidden md:contents">
                  <MoreMenu
                    trigger={
                      <ToolbarToolButton
                        icon={<MoreHorizontal />}
                        aria-label="Mais ações"
                      />
                    }
                  >
                    <MoreMenuItem onSelect={() => setCellBorders((b) => !b)}>
                      {cellBorders ? <Square /> : <Grid3x3 />}
                      {cellBorders
                        ? "Remover bordas entre colunas"
                        : "Mostrar bordas entre colunas"}
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
                    <MoreMenuItem>
                      <Upload />
                      Importar CSV
                    </MoreMenuItem>
                    <MoreMenuItem>
                      <Download />
                      Exportar Excel
                    </MoreMenuItem>
                    <MoreMenuSeparator />
                    <MoreMenuItem variant="destructive">
                      <Trash2 />
                      Resetar visualização
                    </MoreMenuItem>
                  </MoreMenu>
                </span>

                {/* Mobile only — Filter icon + dialog trigger */}
                <span className="contents md:hidden">
                  <FilterPopover
                    trigger={
                      <ToolbarToolButton
                        icon={<SlidersHorizontal />}
                        aria-label="Filtrar"
                        isActive={filters.count > 0}
                        hasIndicator={filters.count > 0}
                      />
                    }
                    columns={FILTERABLE_COLUMNS}
                    filters={filters.list as FilterPopoverEntry[]}
                    onFiltersChange={(next) => filters.replaceAll(next)}
                  />
                </span>
                <ToolbarMobileDialog>
                  <ToolbarMobileSection title="Visualização">
                    <ToolbarSegmented
                      fluid
                      value={viewMode}
                      onValueChange={setViewMode}
                      items={VIEW_MODES}
                      ariaLabel="Tipo de visualização"
                    />
                  </ToolbarMobileSection>
                  <ToolbarMobileSection title="Densidade">
                    <ToolbarSegmented
                      fluid
                      value={density}
                      onValueChange={setDensity}
                      items={DENSITIES}
                      ariaLabel="Densidade da tabela"
                    />
                  </ToolbarMobileSection>
                  <ToolbarMobileSection title="Views salvas">
                    <ToolbarTabs
                      fluid
                      tabs={tabs}
                      activeId={activeView}
                      onSelect={setActiveView}
                      onClose={(id) => setTabs((prev) => prev.filter((t) => t.id !== id))}
                    />
                  </ToolbarMobileSection>
                  <ToolbarMobileSection title="Ações">
                    <Button
                      color="secondary"
                      variant="outline"
                      iconLeft={<ArrowUpDown />}
                      fullWidth
                      className="justify-start"
                    >
                      Ordenar
                    </Button>
                    <Button
                      color="secondary"
                      variant="outline"
                      iconLeft={<Columns />}
                      fullWidth
                      className="justify-start"
                    >
                      Colunas
                    </Button>
                    <Button
                      color="secondary"
                      variant="outline"
                      iconLeft={<Download />}
                      fullWidth
                      className="justify-start"
                    >
                      Exportar
                    </Button>
                    <Button
                      color="secondary"
                      variant="outline"
                      iconLeft={<MoreHorizontal />}
                      fullWidth
                      className="justify-start"
                    >
                      Mais ações
                    </Button>
                  </ToolbarMobileSection>
                </ToolbarMobileDialog>
              </>
            }
          />
          <ToolbarApplied
            filters={appliedDisplay}
            onRemove={filters.remove}
            onClearAll={filters.clear}
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-bulk"
        title="Bulk actions (selected)"
        description="Quando há itens selecionados na tabela, a toolbar troca pra `<BulkActionsBar>` (passada via prop `bulkBar`). O `<BulkActionsBar>` retorna null quando `count = 0` — então o swap fica automático: passe ele direto na prop sem condicional externa. Visual brand-subtle + border-brand alinhado com `.tbl-bulk-bar` do sandbox. Ações usam o `<BulkActionButton>` (helper do Button DS), com `variant='danger'` pro destrutivo. Clique nos botões abaixo pra simular seleção:"
        code={`const [selected, setSelected] = useState<string[]>([]);

<TableToolbar
  left={<>{/* search, tabs... */}</>}
  actions={<>{/* filter, sort, cols... */}</>}
  bulkBar={
    <BulkActionsBar
      count={selected.length}
      onClear={() => setSelected([])}
    >
      <BulkActionButton icon={<Edit2 />} onClick={...}>Editar</BulkActionButton>
      <BulkActionButton icon={<Users />} onClick={...}>Atribuir</BulkActionButton>
      <BulkActionButton icon={<Download />} onClick={...}>Exportar</BulkActionButton>
      <BulkActionButton icon={<Trash2 />} variant="danger" onClick={...}>
        Excluir
      </BulkActionButton>
    </BulkActionsBar>
  }
/>

// BulkActionsBar retorna null quando count=0 — o swap acontece automaticamente.
// countLabel customizável: countLabel={(n) => \`\${n} item(s)\`}`}
      >
        <div className="flex flex-col gap-gp-lg w-full">
          <div className="flex flex-wrap gap-gp-sm">
            <Button
              color="secondary"
              variant="outline"
              size="xs"
              onClick={() => setSelectedCount(0)}
              disabled={selectedCount === 0}
            >
              Limpar seleção
            </Button>
            <Button
              color="primary"
              variant="outline"
              size="xs"
              onClick={() => setSelectedCount(1)}
            >
              Selecionar 1
            </Button>
            <Button
              color="primary"
              variant="outline"
              size="xs"
              onClick={() => setSelectedCount(3)}
            >
              Selecionar 3
            </Button>
            <Button
              color="primary"
              variant="outline"
              size="xs"
              onClick={() => setSelectedCount(12)}
            >
              Selecionar 12
            </Button>
          </div>

          <TableToolbar
            left={
              <ToolbarSearch
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            actions={
              <ToolbarToolButton
                icon={<SlidersHorizontal />}
                label="Filtrar"
              />
            }
            bulkBar={
              <BulkActionsBar
                count={selectedCount}
                onClear={() => setSelectedCount(0)}
              >
                <BulkActionButton
                  icon={<Edit2 />}
                  onClick={() => console.log("editar", selectedCount)}
                >
                  Editar
                </BulkActionButton>
                <BulkActionButton
                  icon={<Users />}
                  onClick={() => console.log("atribuir", selectedCount)}
                >
                  Atribuir
                </BulkActionButton>
                <BulkActionButton
                  icon={<Download />}
                  onClick={() => console.log("exportar", selectedCount)}
                >
                  Exportar
                </BulkActionButton>
                <BulkActionButton
                  icon={<Trash2 />}
                  variant="danger"
                  onClick={() => {
                    console.log("excluir", selectedCount);
                    setSelectedCount(0);
                  }}
                >
                  Excluir
                </BulkActionButton>
              </BulkActionsBar>
            }
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-applied"
        title="Applied filters (chips)"
        description="Componente separado pra renderizar embaixo da toolbar. Vazio = não renderiza nada. Operadores customizáveis via `opLabels`."
        code={`<ToolbarApplied
  filters={[
    { id: "f1", columnLabel: "Status",    op: "eq", value: "Ativo" },
    { id: "f2", columnLabel: "Categoria", op: "eq", value: "Royal" },
  ]}
  onRemove={(id) => ...}
  onClearAll={() => ...}
/>`}
      >
        <ToolbarApplied
          filters={appliedDisplay}
          onRemove={filters.remove}
          onClearAll={filters.clear}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-parts"
        title="Parts isoladas"
        description="As partes podem ser usadas fora do TableToolbar. Cada uma é dumb e cuida de uma responsabilidade só."
        code={`<ToolbarSearch value={...} onChange={...} />
<ToolbarSegmented value={...} onValueChange={...} items={DENSITIES} />
<ToolbarToolButton icon={<SlidersHorizontal />} label="Filtrar" isActive hasIndicator />`}
      >
        <div className="flex flex-col gap-gp-2xl">
          <ToolbarSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ToolbarSegmented
            value={density}
            onValueChange={setDensity}
            items={DENSITIES}
            ariaLabel="Densidade"
          />
          <div className="flex gap-gp-md">
            <ToolbarToolButton
              icon={<SlidersHorizontal />}
              label="Filtrar"
              isActive
              hasIndicator
            />
            <ToolbarToolButton
              icon={<Download />}
              label="Exportar"
            />
            <ToolbarToolButton
              icon={<MoreHorizontal />}
              aria-label="Mais"
            />
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-mobile"
        title="Mobile (dialog estilo command)"
        description="Pattern recomendado pra mobile: search ocupa a linha, demais controles vão pra um Dialog centralizado acionado pelo botão Sliders. Visual alinhado com o `<CommandDialog>` — 384px, radius 12px, halo outline-float, sem header visível. Use `hidden md:flex` nos elementos desktop e adicione `<ToolbarMobileDialog>` (auto-hidden em ≥md). Aqui o Dialog abre mesmo em desktop pra demonstração — em produção, fica `md:hidden`."
        code={`<ToolbarMobileDialog>
  <ToolbarMobileSection title="Visualização">
    <ToolbarSegmented fluid value={viewMode} onValueChange={...} items={VIEW_MODES} />
  </ToolbarMobileSection>

  <ToolbarMobileSection title="Densidade">
    <ToolbarSegmented fluid value={density} onValueChange={...} items={DENSITIES} />
  </ToolbarMobileSection>

  <ToolbarMobileSection title="Views salvas">
    <ToolbarTabs fluid tabs={...} activeId={...} onSelect={...} />
  </ToolbarMobileSection>

  <ToolbarMobileSection title="Ações">
    <Button color="secondary" variant="outline" iconLeft={<SlidersHorizontal />} fullWidth className="justify-start">
      Filtrar
    </Button>
    {/* ...demais Buttons outline com justify-start... */}
  </ToolbarMobileSection>
</ToolbarMobileDialog>`}
      >
        <div className="flex flex-col gap-gp-md">
          <p className="text-body-md text-fg-muted">
            Clique pra abrir o sheet:
          </p>
          <div>
            <ToolbarMobileDialog className="md:flex">
              <ToolbarMobileSection title="Visualização">
                <ToolbarSegmented
                  fluid
                  value={viewMode}
                  onValueChange={setViewMode}
                  items={VIEW_MODES}
                  ariaLabel="Visualização"
                />
              </ToolbarMobileSection>

              <ToolbarMobileSection title="Densidade">
                <ToolbarSegmented
                  fluid
                  value={density}
                  onValueChange={setDensity}
                  items={DENSITIES}
                  ariaLabel="Densidade"
                />
              </ToolbarMobileSection>

              <ToolbarMobileSection title="Views salvas">
                <ToolbarTabs
                  fluid
                  tabs={tabs}
                  activeId={activeView}
                  onSelect={setActiveView}
                  onClose={(id) =>
                    setTabs((prev) => prev.filter((t) => t.id !== id))
                  }
                />
              </ToolbarMobileSection>

              <ToolbarMobileSection title="Ações">
                <Button
                  color="secondary"
                  variant="outline"
                  iconLeft={<SlidersHorizontal />}
                  fullWidth
                  className="justify-start"
                >
                  Filtrar{filters.count > 0 ? ` (${filters.count})` : ""}
                </Button>
                <Button
                  color="secondary"
                  variant="outline"
                  iconLeft={<ArrowUpDown />}
                  fullWidth
                  className="justify-start"
                >
                  Ordenar
                </Button>
                <Button
                  color="secondary"
                  variant="outline"
                  iconLeft={<Columns />}
                  fullWidth
                  className="justify-start"
                >
                  Colunas
                </Button>
                <Button
                  color="secondary"
                  variant="outline"
                  iconLeft={<Download />}
                  fullWidth
                  className="justify-start"
                >
                  Exportar
                </Button>
                <Button
                  color="secondary"
                  variant="outline"
                  iconLeft={<MoreHorizontal />}
                  fullWidth
                  className="justify-start"
                >
                  Mais ações
                </Button>
              </ToolbarMobileSection>
            </ToolbarMobileDialog>
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-more-menu"
        title="More menu (popover)"
        description="O botão `...` da toolbar abre um DropdownMenu com ações secundárias. `MoreMenu` é um wrapper fino do `<DropdownMenu>` com defaults pra toolbar (`align='end'`, `sideOffset=6`). Items reusam o `DropdownMenuItem` do DS (suporta `variant='destructive'`, ícones esquerda automáticos, e checkbox/radio variants)."
        code={`const [cellBorders, setCellBorders] = useState(true);

<MoreMenu
  trigger={<ToolbarToolButton icon={<MoreHorizontal />} aria-label="Mais ações" />}
>
  <MoreMenuItem onSelect={() => setCellBorders((b) => !b)}>
    {cellBorders ? <Square /> : <Grid3x3 />}
    {cellBorders ? "Remover bordas entre colunas" : "Mostrar bordas entre colunas"}
  </MoreMenuItem>
  <MoreMenuItem><Maximize2 /> Tela cheia</MoreMenuItem>
  <MoreMenuItem><Copy /> Duplicar visualização</MoreMenuItem>
  <MoreMenuSeparator />
  <MoreMenuItem><Upload /> Importar CSV</MoreMenuItem>
  <MoreMenuItem><Download /> Exportar Excel</MoreMenuItem>
  <MoreMenuSeparator />
  <MoreMenuItem variant="destructive">
    <Trash2 /> Resetar visualização
  </MoreMenuItem>
</MoreMenu>

// Outras variantes:
<MoreMenuCheckboxItem checked={value} onCheckedChange={...}>
  Mostrar coluna
</MoreMenuCheckboxItem>

<MoreMenuRadioGroup value={...} onValueChange={...}>
  <MoreMenuRadioItem value="asc">Crescente</MoreMenuRadioItem>
  <MoreMenuRadioItem value="desc">Decrescente</MoreMenuRadioItem>
</MoreMenuRadioGroup>`}
      >
        <MoreMenu
          trigger={
            <ToolbarToolButton
              icon={<MoreHorizontal />}
              aria-label="Mais ações"
            />
          }
        >
          <MoreMenuItem onSelect={() => setCellBorders((b) => !b)}>
            {cellBorders ? <Square /> : <Grid3x3 />}
            {cellBorders
              ? "Remover bordas entre colunas"
              : "Mostrar bordas entre colunas"}
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
          <MoreMenuItem>
            <Upload />
            Importar CSV
          </MoreMenuItem>
          <MoreMenuItem>
            <Download />
            Exportar Excel
          </MoreMenuItem>
          <MoreMenuSeparator />
          <MoreMenuItem variant="destructive">
            <Trash2 />
            Resetar visualização
          </MoreMenuItem>
        </MoreMenu>
      </ExampleSection>

      <ExampleSection
        id="ex-cols"
        title="Cols popover"
        description="Popover de gerenciamento de colunas: toggle visibility (checkbox), toggle pin (botão pin que aparece em hover ou quando fixado) e drag-reorder (grip handle + HTML5 drag — ativa quando `onColumnsReorder` é passado). Footer com atalhos 'Mostrar todas' e 'Só fixadas'. Componente dumb: ordem/visible/pinned vêm via props."
        code={`const [columns, setColumns] = useState(COLUMNS);
const [visibleCols, setVisibleCols] = useState(new Set(COLUMNS.map(c => c.key)));
const [pinnedCols, setPinnedCols] = useState(new Set(["name"]));

<ColsPopover
  trigger={<ToolbarToolButton icon={<Columns />} aria-label="Colunas" />}
  columns={columns}
  visibleCols={visibleCols}  onVisibleChange={setVisibleCols}
  pinnedCols={pinnedCols}    onPinnedChange={setPinnedCols}
  onColumnsReorder={setColumns}  // ativa drag handle + reorder
  // optional:
  title="Colunas visíveis"
  hideShowAll={false}
  hideOnlyPinned={false}
/>`}
      >
        <ColsPopover
          trigger={
            <ToolbarToolButton
              icon={<Columns />}
              label="Colunas"
            />
          }
          columns={colsOrder}
          visibleCols={visibleCols}
          onVisibleChange={setVisibleCols}
          pinnedCols={pinnedCols}
          onPinnedChange={setPinnedCols}
          onColumnsReorder={setColsOrder}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-sort"
        title="Sort popover"
        description="Popover de ordenação multi-coluna. Lista de critérios atuais (com toggle asc/desc e remover individual) + section pra adicionar critérios novos (só colunas ainda não usadas). Footer com link 'Limpar' quando há critérios. Dumb: `sortBy` (array de critérios) vem via props."
        code={`const [sortBy, setSortBy] = useState([{ key: "name", dir: "asc" }]);

<SortPopover
  trigger={<ToolbarToolButton icon={<ArrowUpDown />} aria-label="Ordenar" />}
  columns={[
    { key: "name",  label: "Nome",  icon: User },
    { key: "email", label: "Email", icon: AtSign },
    // ...
  ]}
  sortBy={sortBy}
  onSortByChange={setSortBy}
/>

// Alternativa: useToolbarSort hook gerencia state pronto:
const sort = useToolbarSort({ initial: [...] });
<SortPopover ... sortBy={sort.list} onSortByChange={sort.replaceAll} />`}
      >
        <SortPopover
          trigger={
            <ToolbarToolButton
              icon={<ArrowUpDown />}
              label="Ordenar"
              isActive={sortBy.length > 0}
              hasIndicator={sortBy.length > 0}
            />
          }
          columns={colsOrder}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-views"
        title="Views popover"
        description="Popover de visualizações salvas com tabs Todos/Pessoais, busca local (por nome ou autor) e botão de criar no footer. Cada item exibe o autor quando não é 'minha' (`owner !== myOwnerKey`); apenas views 'minhas' mostram o botão de deletar no hover."
        code={`const [views, setViews] = useState(VIEWS);
const [activeId, setActiveId] = useState("all");

<ViewsPopover
  trigger={<ToolbarSaveButton aria-label="Visões"><Plus /></ToolbarSaveButton>}
  views={views}
  activeViewId={activeId}
  onApply={(v) => setActiveId(v.id)}
  onDelete={(id) => setViews((p) => p.filter((v) => v.id !== id))}
  onCreate={() => openSaveDialog()}
  // optional:
  myOwnerKey="me"           // identifica views "minhas"
  hideTabs={false}
  hideSearch={false}
  hideCreate={false}
/>`}
      >
        <ViewsPopover
          trigger={
            <ToolbarToolButton
              icon={<Plus strokeWidth={2.2} />}
              label="Visões"
            />
          }
          views={views}
          activeViewId={activeViewId}
          onApply={(v) => setActiveViewIdLocal(v.id)}
          onDelete={(id) =>
            setViews((prev) => prev.filter((v) => v.id !== id))
          }
          onCreate={() => console.log("criar nova view")}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-filter"
        title="Filter popover"
        description="Filter builder: rows dinâmicas com campo + operador + valor (input ou select dependendo do tipo da coluna). Empty state com CTA quando vazio. Footer com 'Limpar todos' + contagem ativa. Modo Avançado opcional via `enableAdvanced` adiciona tabs Visual/Avançado (textarea SQL-like, sem parser real)."
        code={`const filters = useToolbarFilters({ initial: [...] });

<FilterPopover
  trigger={<ToolbarToolButton icon={<SlidersHorizontal />} label="Filtrar" />}
  columns={[
    { key: "status", label: "Status", type: "select", options: [...] },
    { key: "name",   label: "Nome",   type: "text" },
    { key: "value",  label: "Valor",  type: "number" },
  ]}
  filters={filters.list}
  onFiltersChange={filters.replaceAll}
  // optional:
  operators={DEFAULT_FILTER_OPERATORS}  // eq / neq / contains / gt / lt
  conjLabels={{ first: "Se", rest: "E" }}
  enableAdvanced
/>`}
      >
        <FilterPopover
          trigger={
            <ToolbarToolButton
              icon={<SlidersHorizontal />}
              label="Filtrar"
              isActive={filters.count > 0}
              hasIndicator={filters.count > 0}
            />
          }
          columns={FILTERABLE_COLUMNS}
          filters={filters.list as FilterPopoverEntry[]}
          onFiltersChange={(next) => filters.replaceAll(next)}
          enableAdvanced
        />
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <p className="text-body-md text-fg-muted mb-gp-lg">
        <strong className="text-fg-default">TableToolbar</strong> (root):
      </p>
      <PropsTable items={ROOT_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        Parts (exportadas de <code>ui/TableToolbar</code>):
      </p>
      <PropsTable items={PARTS_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        Popovers (Fase 2):
      </p>
      <PropsTable items={POPOVER_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        Bulk actions (selected mode):
      </p>
      <PropsTable items={BULK_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        Hooks (opcionais):
      </p>
      <PropsTable items={HOOKS_PROPS} />
    </DocLayout>
  );
}

