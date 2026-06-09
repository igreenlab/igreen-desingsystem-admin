import { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  DollarSign,
  Download,
  FileText,
  Filter,
  Hash,
  Inbox,
  LayoutGrid,
  Maximize2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Rows2,
  Rows3,
  Rows4,
  Settings2,
  Table as TableIcon,
  Trash2,
  Upload,
} from "lucide-react";
import {
  TableToolbarV2,
  ColsPanel,
  type ColsPopoverColumn,
  FilterPanel,
  type FilterPopoverColumn,
  type FilterPopoverEntry,
  MoreMenu,
  MoreMenuItem,
  MoreMenuSeparator,
  SortPanel,
  type SortPopoverColumn,
  type SortPopoverCriterion,
  ToolbarApplied,
  type AppliedFilter,
  BulkActionsBar,
  BulkActionButton,
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
} from "../../components/ui/TableToolbarV2";
import type {
  FilterModel,
  FilterOperator,
} from "../../components/ui/DataTable/data-table.types";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  SELECTION_COLUMN_WIDTH,
  useColumnWidths,
  type TableDensity,
} from "../../components/ui/Table";
import { Checkbox } from "../../components/shadcn/checkbox";
import { Button } from "../../components/ui/Button/button";
import { Chip } from "../../components/ui/Chip";
import { Panel } from "../../components/ui/Panel";
import { FloatingPanel } from "../../components/ui/FloatingPanel";
import { AlertModal } from "../../components/ui/AlertModal";
import { PageHeader } from "../../components/ui/PageHeader";
import { FooterTable } from "../../components/ui/FooterTable";
import { Kanban, type KanbanColumn, type KanbanCardData } from "../../components/ui/Kanban";
import { FormFieldInput, FormFieldSelect } from "../../components/ui/FormField";
import { AppShell } from "../../components/ui/AppShell";
import { useTheme, type Theme } from "../../hooks/useTheme";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
  APP_SHELL_LAYOUT_OPTIONS,
  APP_SHELL_USER,
} from "../mocks/app-shell-mocks";

/* ── Tipos + mock ────────────────────────────────────────────────── */
type Status = "active" | "inactive" | "pending";

type Client = {
  id: string;
  razaoSocial: string;
  cnpj: string;
  conta: string;
  saldo: number;
  status: Status;
  clienteDesde: string; // ISO
};

const STATUS_META: Record<Status, { label: string; color: "success" | "neutral" | "warning" }> = {
  active: { label: "Ativo", color: "success" },
  inactive: { label: "Inativo", color: "neutral" },
  pending: { label: "Pendente", color: "warning" },
};

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "pending", label: "Pendente" },
];

const INITIAL: Client[] = [
  { id: "CLI-001", razaoSocial: "Aurora Energia Ltda", cnpj: "12.345.678/0001-90", conta: "Banco do Brasil", saldo: 12450.9, status: "active", clienteDesde: "2024-02-16" },
  { id: "CLI-002", razaoSocial: "Solis Distribuidora SA", cnpj: "98.765.432/0001-10", conta: "Itaú", saldo: 8230.0, status: "active", clienteDesde: "2024-04-06" },
  { id: "CLI-003", razaoSocial: "Verde Campo Comércio", cnpj: "11.222.333/0001-44", conta: "Nubank", saldo: 0, status: "pending", clienteDesde: "2024-10-30" },
  { id: "CLI-004", razaoSocial: "Lumen Tecnologia", cnpj: "44.555.666/0001-77", conta: "Bradesco", saldo: 54300.75, status: "active", clienteDesde: "2023-12-22" },
  { id: "CLI-005", razaoSocial: "Horizonte Agro", cnpj: "22.333.444/0001-55", conta: "Santander", saldo: 1890.4, status: "inactive", clienteDesde: "2024-01-13" },
  { id: "CLI-006", razaoSocial: "Pampa Logística", cnpj: "33.444.555/0001-66", conta: "Inter", saldo: 23110.2, status: "active", clienteDesde: "2024-07-05" },
  { id: "CLI-007", razaoSocial: "Costa Azul Pescados", cnpj: "55.666.777/0001-88", conta: "Caixa", saldo: 760.0, status: "pending", clienteDesde: "2024-09-18" },
  { id: "CLI-008", razaoSocial: "Nova Era Materiais", cnpj: "66.777.888/0001-99", conta: "Itaú", saldo: 9999.99, status: "inactive", clienteDesde: "2023-11-02" },
];

/* ── Colunas ─────────────────────────────────────────────────────── */
type ColMeta = {
  field: keyof Client;
  label: string;
  icon: ColsPopoverColumn["icon"];
  width: number;
  align?: "left" | "right";
  sortable?: boolean;
};

const COLUMNS: ColMeta[] = [
  { field: "id", label: "ID", icon: Hash, width: 100, sortable: true },
  { field: "razaoSocial", label: "Razão Social", icon: Building2, width: 220, sortable: true },
  { field: "cnpj", label: "CNPJ", icon: FileText, width: 170 },
  { field: "conta", label: "Conta bancária", icon: Building2, width: 150 },
  { field: "saldo", label: "Saldo disponível", icon: DollarSign, width: 160, align: "right", sortable: true },
  { field: "status", label: "Status", icon: CheckCircle2, width: 130 },
  { field: "clienteDesde", label: "Cliente desde", icon: Calendar, width: 150, sortable: true },
];

const FILTER_COLUMNS: FilterPopoverColumn[] = [
  { key: "status", label: "Status", type: "select", filterType: "select", options: STATUS_OPTIONS },
  { key: "razaoSocial", label: "Razão Social", type: "text", filterType: "text" },
  { key: "saldo", label: "Saldo disponível", type: "number", filterType: "number" },
];

const SORT_COLUMNS: SortPopoverColumn[] = COLUMNS.filter((c) => c.sortable).map((c) => ({
  key: c.field,
  label: c.label,
  icon: c.icon,
}));

const VIEW_MODES = [
  { value: "table", label: "Tabela", children: <TableIcon /> },
  { value: "kanban", label: "Kanban", children: <LayoutGrid /> },
];

const DENSITIES = [
  { value: "compact", label: "Compacto", children: <Rows4 strokeWidth={1.8} /> },
  { value: "comfortable", label: "Confortável", children: <Rows3 strokeWidth={1.8} /> },
  { value: "spacious", label: "Espaçoso", children: <Rows2 strokeWidth={1.8} /> },
];

const VIEW_TABS = [
  { id: "all", name: "Todos" },
  { id: "active", name: "Ativos", custom: true },
];

const MOCK_VIEWS: ViewsPopoverView[] = [
  { id: "all", name: "Todos os clientes", owner: "me" },
  { id: "active", name: "Ativos hoje", owner: "me" },
];

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

/* ── Matcher genérico (filtro simples + avançado) ────────────────── */
function matchField(client: Client, field: string, operator: string, value: unknown): boolean {
  const raw = client[field as keyof Client];
  // Valor vazio → não filtra (exceto operadores que dispensam valor)
  const emptyValue =
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);
  if (emptyValue && operator !== "isEmpty" && operator !== "isNotEmpty") return true;

  const asStr = String(raw).toLowerCase();
  const valStr = String(value).toLowerCase();
  const arr = Array.isArray(value) ? value.map((v) => String(v).toLowerCase()) : [valStr];

  switch (operator as FilterOperator | "eq" | "lt" | "gt") {
    case "equals":
    case "eq":
      return Array.isArray(value) ? arr.includes(asStr) : asStr === valStr;
    case "neq":
      return asStr !== valStr;
    case "contains":
      return asStr.includes(valStr);
    case "notContains":
      return !asStr.includes(valStr);
    case "startsWith":
      return asStr.startsWith(valStr);
    case "endsWith":
      return asStr.endsWith(valStr);
    case "isAnyOf":
      return arr.includes(asStr);
    case "isNoneOf":
      return !arr.includes(asStr);
    case "gt":
      return Number(raw) > Number(value);
    case "lt":
      return Number(raw) < Number(value);
    case "gte":
      return Number(raw) >= Number(value);
    case "lte":
      return Number(raw) <= Number(value);
    case "isEmpty":
      return raw == null || raw === "";
    case "isNotEmpty":
      return raw != null && raw !== "";
    default:
      return true;
  }
}

const DENSITY_MAP: Record<string, TableDensity> = {
  compact: "compact",
  comfortable: "standard",
  spacious: "comfortable",
};

type DraftMode = { kind: "create" } | { kind: "edit"; id: string } | null;
const EMPTY_DRAFT: Omit<Client, "id" | "clienteDesde"> = {
  razaoSocial: "",
  cnpj: "",
  conta: "",
  saldo: 0,
  status: "active",
};

export default function TableToolbarV2CrudPreview() {
  const { theme, setTheme } = useTheme();
  const [layout, setLayout] = useState<string>("fluid");
  const [rows, setRows] = useState<Client[]>(INITIAL);

  // Controller dirigido pela toolbar v2
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [density, setDensity] = useState("comfortable");
  const [activeView, setActiveView] = useState("all");
  const [tabs, setTabs] = useState(VIEW_TABS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortPopoverCriterion[]>([]);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(COLUMNS.map((c) => c.field)),
  );
  const [pinnedCols, setPinnedCols] = useState<Set<string>>(() => new Set());
  const [colsOrder, setColsOrder] = useState<ColsPopoverColumn[]>(
    COLUMNS.map((c) => ({ key: c.field, label: c.label, icon: c.icon })),
  );
  const [views, setViews] = useState<ViewsPopoverView[]>(MOCK_VIEWS);
  const [activeViewId, setActiveViewId] = useState<string | undefined>("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [simpleFilterOpen, setSimpleFilterOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<FilterModel>({ items: [], logicOperator: "AND" });
  const advFilters = useToolbarFilters<ToolbarFilterEntry>({ initial: [] });

  // CRUD modals
  const [draftMode, setDraftMode] = useState<DraftMode>(null);
  const [draft, setDraft] = useState<Omit<Client, "id" | "clienteDesde">>(EMPTY_DRAFT);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const toggleSort = (key: string) => {
    setSortBy((prev) => {
      const cur = prev[0];
      if (!cur || cur.key !== key) return [{ key, dir: "asc" }];
      if (cur.dir === "asc") return [{ key, dir: "desc" }];
      return [];
    });
  };
  const sortDirOf = (key: string) =>
    sortBy[0]?.key === key ? sortBy[0].dir : undefined;

  /* ── Linhas derivadas (search → simple → advanced → sort) ──────── */
  const derived = useMemo(() => {
    let r = rows;
    const q = search.trim().toLowerCase();
    if (q) {
      r = r.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(q) ||
          c.cnpj.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    }
    for (const item of filterModel.items) {
      r = r.filter((c) => matchField(c, item.field, item.operator, item.value));
    }
    for (const e of advFilters.list) {
      r = r.filter((c) => matchField(c, e.columnKey, e.op, e.value));
    }
    const crit = sortBy[0];
    if (crit) {
      const dir = crit.dir === "asc" ? 1 : -1;
      r = [...r].sort((a, b) => {
        const av = a[crit.key as keyof Client];
        const bv = b[crit.key as keyof Client];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }
    return r;
  }, [rows, search, filterModel, advFilters.list, sortBy]);

  const orderedVisible = colsOrder.filter((c) => visibleCols.has(c.key));
  const colByField = (field: string) => COLUMNS.find((c) => c.field === field)!;
  const tableDensity = DENSITY_MAP[density] ?? "standard";

  // Paginação — fatia as linhas derivadas. safePage clampa quando o filtro
  // reduz o total abaixo da página atual (evita página vazia).
  const totalPages = Math.max(1, Math.ceil(derived.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = derived.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Pinning — colunas fixadas vão pra frente (após a seleção) e ganham sticky.
  // useColumnWidths calcula os offsets cumulativos (selection + pinned).
  const pinnedVisible = orderedVisible.filter((c) => pinnedCols.has(c.key));
  const unpinnedVisible = orderedVisible.filter((c) => !pinnedCols.has(c.key));
  const displayCols = [...pinnedVisible, ...unpinnedVisible];
  const { offsets } = useColumnWidths([
    { field: "__select", width: SELECTION_COLUMN_WIDTH, pinned: "left" },
    ...pinnedVisible.map((c) => ({ field: c.key, width: colByField(c.key).width, pinned: "left" as const })),
    ...unpinnedVisible.map((c) => ({ field: c.key, width: colByField(c.key).width })),
  ]);

  const renderCell = (client: Client, field: keyof Client) => {
    if (field === "status") {
      const meta = STATUS_META[client.status];
      return (
        <Chip color={meta.color} variant="soft" size="sm" shape="pill">
          {meta.label}
        </Chip>
      );
    }
    if (field === "saldo") return brl.format(client.saldo);
    if (field === "clienteDesde") return dateFmt.format(new Date(client.clienteDesde));
    return String(client[field]);
  };

  /* ── CRUD handlers ─────────────────────────────────────────────── */
  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setDraftMode({ kind: "create" });
  };
  const openEdit = (c: Client) => {
    setDraft({ razaoSocial: c.razaoSocial, cnpj: c.cnpj, conta: c.conta, saldo: c.saldo, status: c.status });
    setDraftMode({ kind: "edit", id: c.id });
  };
  const saveDraft = () => {
    if (!draftMode) return;
    if (draftMode.kind === "create") {
      const nextId = `CLI-${String(rows.length + 1).padStart(3, "0")}`;
      setRows((prev) => [
        { id: nextId, clienteDesde: new Date().toISOString().slice(0, 10), ...draft },
        ...prev,
      ]);
    } else {
      setRows((prev) => prev.map((c) => (c.id === draftMode.id ? { ...c, ...draft } : c)));
    }
    setDraftMode(null);
  };
  const confirmDelete = () => {
    if (deleting) setRows((prev) => prev.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  };

  const settingsHasIndicator = sortBy.length > 0 || advFilters.count > 0;
  const simpleActiveCount = filterModel.items.length;

  /* ── Chips de filtros aplicados (simples + avançado) ───────────── */
  const hasValue = (v: unknown) =>
    v != null &&
    v !== "" &&
    (!Array.isArray(v) || v.some((x) => x != null && x !== ""));

  const fieldLabel = (key: string) =>
    COLUMNS.find((c) => c.field === key)?.label ??
    FILTER_COLUMNS.find((c) => c.key === key)?.label ??
    key;

  const labelValue = (field: string, value: unknown): React.ReactNode | React.ReactNode[] => {
    const one = (v: unknown) =>
      field === "status"
        ? STATUS_META[v as Status]?.label ?? String(v)
        : field === "saldo"
          ? brl.format(Number(v))
          : String(v);
    return Array.isArray(value) ? value.map(one) : one(value);
  };

  // FilterOperator (equals/gt/…) → AppliedFilterOp (eq/gt/…) pros labels do chip.
  const normalizeOp = (op: string): string =>
    (({ equals: "eq", notEquals: "neq", greaterThan: "gt", lessThan: "lt", gte: "gt", lte: "lt" }) as Record<string, string>)[op] ?? op;

  const appliedChips: AppliedFilter[] = [
    ...filterModel.items
      .filter((i) => hasValue(i.value) || i.operator === "isEmpty" || i.operator === "isNotEmpty")
      .map((i) => ({
        id: `s:${i.id}`,
        columnLabel: fieldLabel(i.field),
        op: normalizeOp(i.operator),
        value: labelValue(i.field, i.value),
      })),
    ...advFilters.list
      .filter((e) => hasValue(e.value) || e.op === "isEmpty" || e.op === "isNotEmpty")
      .map((e) => ({
        id: `a:${e.id}`,
        columnLabel: fieldLabel(e.columnKey),
        op: normalizeOp(e.op),
        value: labelValue(e.columnKey, e.value),
      })),
  ];

  const removeChip = (id: string) => {
    if (id.startsWith("s:")) {
      const itemId = id.slice(2);
      setFilterModel((m) => ({ ...m, items: m.items.filter((it) => it.id !== itemId) }));
    } else if (id.startsWith("a:")) {
      const eId = id.slice(2);
      advFilters.replaceAll(advFilters.list.filter((e) => e.id !== eId));
    }
  };

  const clearAllFilters = () => {
    setFilterModel((m) => ({ ...m, items: [] }));
    advFilters.clear();
  };

  /* ── Seleção (bulk actions) — base na página atual ─────────────── */
  const allSelected = paged.length > 0 && paged.every((c) => selectedIds.has(c.id));
  const someSelected = paged.some((c) => selectedIds.has(c.id));
  const headerCheckState: boolean | "indeterminate" = allSelected
    ? true
    : someSelected
      ? "indeterminate"
      : false;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelectedIds((prev) => {
      // Toggle dos itens da página atual
      const next = new Set(prev);
      if (allSelected) paged.forEach((c) => next.delete(c.id));
      else paged.forEach((c) => next.add(c.id));
      return next;
    });
  const clearSelection = () => setSelectedIds(new Set());
  const deleteSelected = () => {
    setRows((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    clearSelection();
  };

  /* ── Kanban view (board por status) ────────────────────────────── */
  const KANBAN_COLUMNS: KanbanColumn[] = (["active", "pending", "inactive"] as Status[]).map(
    (s) => ({ id: s, label: STATUS_META[s].label }),
  );
  const kanbanCards: KanbanCardData[] = derived.map((c) => ({
    id: c.id,
    columnId: c.status,
    title: c.razaoSocial,
    subtitle: c.id,
    chip: (
      <Chip color={STATUS_META[c.status].color} variant="soft" size="sm" shape="pill">
        {STATUS_META[c.status].label}
      </Chip>
    ),
    value: brl.format(c.saldo),
    footerRight: dateFmt.format(new Date(c.clienteDesde)),
  }));
  const moveCard = (cardId: string, _from: string, to: string) =>
    setRows((prev) => prev.map((c) => (c.id === cardId ? { ...c, status: to as Status } : c)));

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#atendimentos"
      breadcrumb={[{ label: "Comercial" }, { label: "Clientes" }]}
      commandGroups={APP_SHELL_COMMANDS}
      notifications={{
        items: APP_SHELL_NOTIFICATIONS,
        onMarkAllRead: () => {},
        onMoreActions: () => {},
        onViewAll: () => {},
      }}
      messages={{
        items: APP_SHELL_MESSAGES,
        onNewMessage: () => {},
        onExpand: () => {},
        onViewAll: () => {},
      }}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={APP_SHELL_THEME_OPTIONS}
      user={APP_SHELL_USER}
      layout={layout}
      onLayoutChange={setLayout}
      layoutOptions={APP_SHELL_LAYOUT_OPTIONS}
      onSettings={() => {}}
      onLogout={() => {}}
    >
      <PageHeader
        title="Clientes"
        description="Gerencie a carteira de clientes — busca, filtros, ordenação e visualização Kanban/Lista."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {rows.length.toLocaleString("pt-BR")} clientes
          </Chip>
        }
        actions={
          <>
            <Button variant="outline" color="secondary" size="icon-md" aria-label="Mais ações">
              <MoreHorizontal />
            </Button>
            <Button color="primary" variant="filled" size="md" iconLeft={<Plus />} onClick={openCreate}>
              Novo cliente
            </Button>
          </>
        }
      />

      {/* Toolbar + tabela + footer agrupados — espelha o root do DataTable
          (flex-col gap-gp-2xl, SEM border própria: o <Table> já é um card). */}
      <div className="flex flex-col gap-gp-2xl">
      {/* toolbar + chips num wrapper sem gap — o separator dos chips dá o divider (como v1) */}
      <div className="flex flex-col">
      <TableToolbarV2
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
          <ToolbarSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por razão social, CNPJ…"
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
              <SortPanel onBack={onBack} columns={SORT_COLUMNS} sortBy={sortBy} onSortByChange={setSortBy} />
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
                columns={FILTER_COLUMNS}
                filters={advFilters.list as FilterPopoverEntry[]}
                onFiltersChange={(next) => advFilters.replaceAll(next)}
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
            // Só-mobile: toggle de visualização + visões pré-definidas migram
            // pro menu quando o lado esquerdo da toolbar colapsa em <md.
            mobileViewToggle={
              <ToolbarSegmented
                fluid
                value={viewMode}
                onValueChange={setViewMode}
                items={VIEW_MODES}
                ariaLabel="Tipo de visualização"
              />
            }
            mobileViews={{
              items: tabs.map((t) => ({ id: t.id, name: t.name })),
              activeId: activeView,
              onSelect: setActiveView,
            }}
          />
        }
        more={
          <MoreMenu trigger={<ToolbarToolButton icon={<MoreHorizontal />} aria-label="Opções" />}>
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
          </MoreMenu>
        }
        bulkBar={
          selectedIds.size > 0 ? (
            <BulkActionsBar count={selectedIds.size} onClear={clearSelection}>
              <BulkActionButton icon={<Download />} onClick={() => console.log("exportar", selectedIds.size)}>
                Exportar
              </BulkActionButton>
              <BulkActionButton icon={<Trash2 />} variant="danger" onClick={deleteSelected}>
                Excluir
              </BulkActionButton>
            </BulkActionsBar>
          ) : undefined
        }
      />

      {/* Chips de filtros aplicados (simples + avançado) — divider no topo (como v1) */}
      <ToolbarApplied
        filters={appliedChips}
        onRemove={removeChip}
        onClearAll={clearAllFilters}
      />
      </div>

      {/* View: Kanban (board por status) ou Tabela */}
      {viewMode === "kanban" ? (
        <Kanban
          columns={KANBAN_COLUMNS}
          cards={kanbanCards}
          enableDnD
          onCardMove={moveCard}
          openCardId={detailClient?.id}
          onOpenCard={(id) => setDetailClient(rows.find((c) => c.id === id) ?? null)}
          getCardMenuItems={(card) => {
            const c = rows.find((r) => r.id === card.id);
            return c
              ? [
                  { label: "Editar", icon: <Pencil />, onClick: () => openEdit(c) },
                  { separator: true },
                  { label: "Excluir", icon: <Trash2 />, destructive: true, onClick: () => setDeleting(c) },
                ]
              : [];
          }}
        />
      ) : (
        <>
          <Table density={tableDensity} cellBorders ariaLabel="Clientes">
            <TableHead>
              <TableHeadCell
                field="__select"
                width={SELECTION_COLUMN_WIDTH}
                purpose="selection"
                pinned="left"
                pinOffset={offsets.__select}
              >
                <Checkbox
                  checked={headerCheckState}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </TableHeadCell>
              {displayCols.map((col) => {
                const meta = colByField(col.key);
                const isPinned = pinnedCols.has(col.key);
                return (
                  <TableHeadCell
                    key={col.key}
                    field={col.key}
                    icon={meta.icon}
                    width={meta.width}
                    align={meta.align}
                    sortable={meta.sortable}
                    sortDirection={meta.sortable ? sortDirOf(col.key) : undefined}
                    onSortClick={meta.sortable ? () => toggleSort(col.key) : undefined}
                    pinned={isPinned ? "left" : undefined}
                    pinOffset={isPinned ? offsets[col.key] : undefined}
                  >
                    {meta.label}
                  </TableHeadCell>
                );
              })}
              <TableHeadCell field="__actions" width={88} align="right">
                {""}
              </TableHeadCell>
            </TableHead>

            <TableBody>
              {paged.map((client) => (
                <TableRow
                  key={client.id}
                  clickable
                  selected={selectedIds.has(client.id)}
                  open={detailClient?.id === client.id}
                  onClick={() => setDetailClient(client)}
                >
                  <TableCell
                    field="__select"
                    width={SELECTION_COLUMN_WIDTH}
                    purpose="selection"
                    pinned="left"
                    pinOffset={offsets.__select}
                    rootProps={{ onClick: (e) => e.stopPropagation() }}
                  >
                    <Checkbox
                      checked={selectedIds.has(client.id)}
                      onCheckedChange={() => toggleOne(client.id)}
                      aria-label={`Selecionar ${client.razaoSocial}`}
                    />
                  </TableCell>
                  {displayCols.map((col) => {
                    const meta = colByField(col.key);
                    const isPinned = pinnedCols.has(col.key);
                    return (
                      <TableCell
                        key={col.key}
                        field={col.key}
                        width={meta.width}
                        align={meta.align}
                        ellipsis={col.key === "razaoSocial"}
                        pinned={isPinned ? "left" : undefined}
                        pinOffset={isPinned ? offsets[col.key] : undefined}
                      >
                        {renderCell(client, col.key as keyof Client)}
                      </TableCell>
                    );
                  })}
                  <TableCell
                    field="__actions"
                    width={88}
                    align="right"
                    rootProps={{ onClick: (e) => e.stopPropagation() }}
                  >
                    <div className="flex items-center justify-end gap-gp-xs">
                      <Button
                        color="secondary"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Editar ${client.razaoSocial}`}
                        onClick={() => openEdit(client)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        color="secondary"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Excluir ${client.razaoSocial}`}
                        onClick={() => setDeleting(client)}
                        className="hover:bg-bg-danger-muted hover:text-fg-danger"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {derived.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-gp-md py-pad-4xl text-center">
              <Inbox className="size-[28px] text-fg-muted" strokeWidth={1.5} />
              <p className="text-body-md text-fg-muted">Nenhum cliente encontrado com os filtros atuais.</p>
            </div>
          )}

          <div className="flex-shrink-0">
            <FooterTable
              totalCount={derived.length}
              page={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 25]}
              selectionCount={selectedIds.size}
            />
          </div>
        </>
      )}
      </div>

      {/* Drawer de filtro simples (funil) */}
      <ToolbarSimpleFilterDrawer
        open={simpleFilterOpen}
        onOpenChange={setSimpleFilterOpen}
        columns={FILTER_COLUMNS}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
      />

      {/* Drawer Criar/Editar */}
      <Panel
        open={draftMode !== null}
        onOpenChange={(o) => !o && setDraftMode(null)}
        title={draftMode?.kind === "edit" ? "Editar cliente" : "Novo cliente"}
        description={draftMode?.kind === "edit" ? "Atualize os dados do cliente." : "Preencha os dados pra cadastrar."}
        footer={
          <>
            <Button color="secondary" variant="outline" onClick={() => setDraftMode(null)}>
              Cancelar
            </Button>
            <Button color="primary" variant="filled" onClick={saveDraft}>
              {draftMode?.kind === "edit" ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </>
        }
      >
        <FormFieldInput
          label="Razão Social"
          placeholder="Empresa Ltda"
          value={draft.razaoSocial}
          onChange={(e) => setDraft((d) => ({ ...d, razaoSocial: e.target.value }))}
        />
        <FormFieldInput
          label="CNPJ"
          placeholder="00.000.000/0001-00"
          value={draft.cnpj}
          onChange={(e) => setDraft((d) => ({ ...d, cnpj: e.target.value }))}
        />
        <FormFieldInput
          label="Conta bancária"
          placeholder="Banco"
          value={draft.conta}
          onChange={(e) => setDraft((d) => ({ ...d, conta: e.target.value }))}
        />
        <FormFieldInput
          label="Saldo disponível"
          type="number"
          startAddon="R$"
          value={String(draft.saldo)}
          onChange={(e) => setDraft((d) => ({ ...d, saldo: Number(e.target.value) || 0 }))}
        />
        <FormFieldSelect
          label="Status"
          options={STATUS_OPTIONS}
          value={draft.status}
          onValueChange={(v) => setDraft((d) => ({ ...d, status: v as Status }))}
        />
      </Panel>

      {/* Confirmação de exclusão */}
      <AlertModal
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        tone="danger"
        title="Excluir cliente"
        description={
          deleting
            ? `Tem certeza que deseja excluir “${deleting.razaoSocial}”? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
      />

      {/* Detalhe do cliente (row click / abrir card) — FloatingPanel read-only */}
      <FloatingPanel
        open={detailClient !== null}
        onOpenChange={(o) => !o && setDetailClient(null)}
        title={detailClient?.razaoSocial}
        description={detailClient?.id}
        titleIcon={Building2}
        footer={
          detailClient && (
            <Button
              color="primary"
              variant="filled"
              iconLeft={<Pencil />}
              onClick={() => {
                openEdit(detailClient);
                setDetailClient(null);
              }}
            >
              Editar
            </Button>
          )
        }
      >
        {detailClient && (
          <dl className="flex flex-col gap-form-gap p-pad-3xl">
            {[
              { label: "CNPJ", value: detailClient.cnpj },
              { label: "Conta bancária", value: detailClient.conta },
              { label: "Saldo disponível", value: brl.format(detailClient.saldo) },
              {
                label: "Status",
                value: (
                  <Chip color={STATUS_META[detailClient.status].color} variant="soft" size="sm" shape="pill">
                    {STATUS_META[detailClient.status].label}
                  </Chip>
                ),
              },
              { label: "Cliente desde", value: dateFmt.format(new Date(detailClient.clienteDesde)) },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-body-xs text-fg-subtle uppercase tracking-wider">{row.label}</dt>
                <dd className="text-body-lg text-fg-default mt-gp-xs">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </FloatingPanel>
    </AppShell>
  );
}
