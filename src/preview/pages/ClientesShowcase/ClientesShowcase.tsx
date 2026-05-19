import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  Archive,
  Clock,
  Copy,
  Download,
  Maximize2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  CATEGORIES,
  AGENTS,
  type ClientRow,
} from "../TableDoc";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTableKanbanConfig,
  type DataTablePresetView,
  type DataTableRef,
  type DataTableViewMode,
  type FilterModel,
} from "@/components/ui/DataTable";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
  APP_SHELL_LAYOUT_OPTIONS,
  APP_SHELL_USER,
} from "../../mocks/app-shell-mocks";
import {
  CLIENTS_87,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  AGENT_OPTIONS,
  AGENTS_LOOKUP,
  KANBAN_COLUMNS,
  CATEGORY_KIND,
  formatBRL,
  formatShortDate,
} from "./clientes-showcase-mocks";
import { NovoClienteDrawer } from "./components/NovoClienteDrawer";
import { DetailDrawer } from "./components/DetailDrawer";
import { AlertModal } from "@/components/ui/AlertModal";

/* ── Columns declarativas (type-based) ─────────────────────────── */

type ColumnHandlers = {
  /** Pede confirmação de exclusão (abre o AlertModal). */
  onAskDelete: (row: ClientRow) => void;
};

function buildColumns(handlers: ColumnHandlers): DataTableColumnDef<ClientRow>[] {
  return [
  { field: "id", headerName: "ID", type: "text", width: 130 },
  {
    field: "name",
    headerName: "Nome",
    type: "user",
    sortable: true,
    width: 220,
    typeOptions: {
      users: Object.fromEntries(
        CLIENTS_87.map((c) => [
          c.name,
          {
            name: c.name,
            initials: c.initials,
            color: c.avatarColor,
          },
        ]),
      ),
    },
    valueGetter: (row) => row.name,
  },
  {
    field: "email",
    headerName: "Email",
    type: "email",
    enableColumnFilter: true,
    filterType: "text",
  },
  {
    field: "phone",
    headerName: "Telefone",
    type: "phone",
  },
  {
    field: "statusId",
    headerName: "Status",
    type: "status",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: STATUS_OPTIONS,
  },
  {
    field: "categoryId",
    headerName: "Categoria",
    type: "badge",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: CATEGORY_OPTIONS,
  },
  {
    field: "agentId",
    headerName: "Atribuído",
    type: "user",
    enableColumnFilter: true,
    filterType: "select",
    filterOptions: AGENT_OPTIONS,
    typeOptions: { users: AGENTS_LOOKUP },
  },
  {
    field: "value",
    headerName: "Valor",
    type: "currency",
    sortable: true,
    enableColumnFilter: true,
    filterType: "number",
    aggregate: "sum",
    aggregateFormatter: (v) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v),
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    type: "date",
    sortable: true,
    enableColumnFilter: true,
    filterType: "date",
    width: 130,
  },
  {
    field: "lastContact",
    headerName: "Último contato",
    type: "date",
    sortable: true,
    width: 150,
  },
  {
    field: "location",
    headerName: "Localização",
    type: "text",
    minWidth: 150,
  },
  {
    field: "_actions",
    headerName: "",
    type: "actions",
    width: 64,
    pinned: "right",
    getActions: ({ row }) => [
      {
        id: "edit",
        label: "Editar",
        icon: <Pencil />,
        showInMenu: true,
        onClick: () => console.log("Editar", row.id),
      },
      {
        id: "whatsapp",
        label: "Abrir atendimento (WhatsApp)",
        icon: <MessageSquare />,
        showInMenu: true,
        onClick: () => console.log("Atendimento", row.id),
      },
      {
        id: "archive",
        label: "Arquivar",
        icon: <Archive />,
        showInMenu: true,
        onClick: () => console.log("Arquivar", row.id),
      },
      {
        id: "delete",
        label: "Excluir cliente",
        icon: <Trash2 />,
        showInMenu: true,
        destructive: true,
        onClick: () => handlers.onAskDelete(row),
      },
    ],
  },
  ];
}

/* ── Saved views / Presets — tabs do toolbar ───────────────────── */

const DEFAULT_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:meus",
    name: "Meus",
    filters: [{ field: "agentId", value: "you" }],
  }),
  presetView({
    id: "preset:ativos",
    name: "Ativos",
    filters: [{ field: "statusId", value: "active" }],
  }),
  presetView({
    id: "preset:royals",
    name: "Royals",
    filters: [{ field: "categoryId", value: "royal" }],
  }),
  presetView({
    id: "preset:ultimos-7-dias",
    name: "Últimos 7 dias",
    sort: [{ field: "createdAt", direction: "desc" }],
  }),
];

/* ── Filtros iniciais (Status=Ativo + Categoria=Royal — print) ─── */

const INITIAL_FILTERS: FilterModel = {
  items: [
    { id: "filter-status-ativo", field: "statusId", operator: "equals", value: "active" },
    { id: "filter-categoria-royal", field: "categoryId", operator: "equals", value: "royal" },
  ],
  logicOperator: "AND",
};

/* ── Kanban config (renderCard com JSX) ────────────────────────── */

const KANBAN_CONFIG: DataTableKanbanConfig<ClientRow> = {
  groupByField: "statusId",
  columns: KANBAN_COLUMNS,
  renderCard: ({ row }) => {
    const cat = CATEGORIES[row.categoryId as keyof typeof CATEGORIES];
    const agent = AGENTS[row.agentId as keyof typeof AGENTS];
    const agentInitials = agent?.name.split(" ").map((s) => s[0]).join("").slice(0, 2) ?? "?";
    return {
      title: row.name,
      subtitle: row.id,
      avatar: (
        <Avatar className="size-[28px]" style={{ background: row.avatarColor }}>
          <AvatarFallback className="bg-transparent text-white text-caption-sm font-bold">
            {row.initials}
          </AvatarFallback>
        </Avatar>
      ),
      chip: cat ? (
        <Chip
          color={CATEGORY_KIND[row.categoryId] ?? "info"}
          variant="soft"
          size="sm"
          shape="pill"
        >
          {cat.label}
        </Chip>
      ) : null,
      value: formatBRL(row.value),
      footerLeft: agent ? (
        <span className="inline-flex items-center gap-gp-sm min-w-0 flex-1">
          <Avatar className="size-[22px]" style={{ background: agent.color }}>
            <AvatarFallback className="bg-transparent text-white text-caption-xs font-bold">
              {agentInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-body-xs font-normal text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis">
            {agent.name}
          </span>
        </span>
      ) : null,
      footerRight: (
        <span className="inline-flex items-center gap-[4px] text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums] shrink-0">
          <Clock size={11} strokeWidth={1.8} aria-hidden />
          {formatShortDate(row.lastContact)}
        </span>
      ),
    };
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Page — Clientes (showcase usando AppShell + DataTable real)
   ═══════════════════════════════════════════════════════════════════════════ */

type ConfirmDeleteState = {
  ids: string[];
  label: string;
  /** Callback opcional após confirmar — usado pelo bulk pra limpar seleção. */
  onAfter?: () => void;
} | null;

export default function ClientesShowcase() {
  const { theme, setTheme } = useTheme();
  const [rows, setRows] = useState<ClientRow[]>(() => CLIENTS_87);
  const [layout, setLayout] = useState<string>("fluid");
  const [filterModel, setFilterModel] = useState<FilterModel>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [detailRowId, setDetailRowId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null);
  const detailRow = detailRowId ? rows.find((r) => r.id === detailRowId) ?? null : null;
  const tableRef = useRef<DataTableRef>(null);

  const askDelete = useCallback(
    (row: ClientRow) =>
      setConfirmDelete({ ids: [row.id], label: row.name }),
    [],
  );

  const askBulkDelete = useCallback(
    (ids: string[], onAfter: () => void) =>
      setConfirmDelete({
        ids,
        label: `${ids.length} cliente${ids.length === 1 ? "" : "s"}`,
        onAfter,
      }),
    [],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!confirmDelete) return;
    const ids = new Set(confirmDelete.ids);
    setRows((prev) => prev.filter((r) => !ids.has(r.id)));
    if (detailRowId && ids.has(detailRowId)) setDetailRowId(null);
    confirmDelete.onAfter?.();
    setConfirmDelete(null);
  }, [confirmDelete, detailRowId]);

  const columns = useMemo(
    () => buildColumns({ onAskDelete: askDelete }),
    [askDelete],
  );

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#atendimentos"
      breadcrumb={[{ label: "Atendimentos" }]}
      commandGroups={APP_SHELL_COMMANDS}
      notifications={{
        items: APP_SHELL_NOTIFICATIONS,
        onMarkAllRead: () => alert("Marcar todas como lidas"),
        onMoreActions: () => alert("Mais ações"),
        onViewAll: () => alert("Ver todas"),
      }}
      messages={{
        items: APP_SHELL_MESSAGES,
        onNewMessage: () => alert("Nova mensagem"),
        onExpand: () => alert("Expandir"),
        onViewAll: () => alert("Ver todas"),
      }}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={APP_SHELL_THEME_OPTIONS}
      user={APP_SHELL_USER}
      layout={layout}
      onLayoutChange={setLayout}
      layoutOptions={APP_SHELL_LAYOUT_OPTIONS}
      onSettings={() => alert("Abrir Configurações")}
      onLogout={() => alert("Sair (mock)")}
    >
      <PageHeader
        title="Clientes"
        description="Gerencie sua base de clientes, acompanhe status de cadastro e abra atendimentos diretos pelo WhatsApp."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {rows.length.toLocaleString("pt-BR")} registros
          </Chip>
        }
        actions={
          <>
            <Button
              variant="outline"
              color="secondary"
              size="icon-md"
              aria-label="Mais ações"
              onClick={() => alert("Mais ações")}
            >
              <MoreHorizontal />
            </Button>
            <Button
              variant="filled"
              color="primary"
              size="md"
              iconLeft={<Plus />}
              onClick={() => setNovoClienteOpen(true)}
            >
              Novo cliente
            </Button>
          </>
        }
      />

      {/* DataTable — ocupa o resto do body ──────────────────────── */}
      <DataTable<ClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="showcase-clientes-crud"
        defaultViews={DEFAULT_VIEWS}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        kanbanConfig={KANBAN_CONFIG}
        toolbar={{
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
          enableExport: true,
          moreMenu: {
            items: [
              {
                id: "fullscreen",
                label: "Tela cheia",
                icon: <Maximize2 />,
                onSelect: () => alert("Tela cheia"),
              },
              {
                id: "duplicate",
                label: "Duplicar visualização",
                icon: <Copy />,
                onSelect: () => alert("Duplicar visualização"),
              },
              {
                id: "import",
                label: "Importar CSV",
                icon: <Upload />,
                onSelect: () => alert("Importar CSV"),
              },
              {
                id: "reset",
                label: "Resetar visualização",
                icon: <RotateCcw />,
                destructive: true,
                onSelect: () => tableRef.current?.resetPersistedState(),
              },
            ],
          },
        }}
        paginationConfig={{
          enabled: true,
          initialPageSize: 10,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        selectionConfig={{
          enabled: true,
          enableGlobal: true,
          actions: (selectedIds, clearSelection) => (
            <>
              <BulkActionButton
                icon={<Download />}
                onClick={() => tableRef.current?.exportCsv("selected")}
              >
                Exportar
              </BulkActionButton>
              <BulkActionButton
                icon={<Trash2 />}
                variant="danger"
                onClick={() => askBulkDelete(selectedIds.map(String), clearSelection)}
              >
                Excluir
              </BulkActionButton>
            </>
          ),
        }}
        onCellEditCommit={async ({ id, field, value }) => {
          await new Promise((res) => setTimeout(res, 400));
          setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
          );
        }}
        onRowClick={(row) => setDetailRowId(row.id)}
        className="flex-1 min-h-0"
      />

      {/* Drawer "Novo cliente" — controlado pelo botão do header */}
      <NovoClienteDrawer
        open={novoClienteOpen}
        onOpenChange={setNovoClienteOpen}
        onSubmit={(data) => {
          console.log("Novo cliente:", data);
          alert(`Cliente "${data.name}" criado (mock)`);
        }}
      />

      {/* DetailDrawer — abre ao clicar numa row, slide-in da direita SEM
          backdrop modal (tabela continua interativa atrás). */}
      <DetailDrawer
        row={detailRow}
        onClose={() => setDetailRowId(null)}
        onEdit={(r) => console.log("Editar", r.id)}
        onDelete={(r) => askDelete(r)}
        onSave={(r) => alert(`Salvar alterações em ${r.name} (mock)`)}
      />

      {/* AlertModal de confirmação de exclusão — compartilhado entre
          row action menu, bulk action e DetailDrawer.onDelete. */}
      <AlertModal
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
        tone="danger"
        title={
          confirmDelete && confirmDelete.ids.length > 1
            ? `Excluir ${confirmDelete.label}?`
            : "Excluir cliente?"
        }
        description={
          confirmDelete
            ? confirmDelete.ids.length > 1
              ? `Esta ação não pode ser desfeita. ${confirmDelete.label} serão removidos permanentemente.`
              : `Esta ação não pode ser desfeita. "${confirmDelete.label}" será removido permanentemente.`
            : null
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
      />
    </AppShell>
  );
}
