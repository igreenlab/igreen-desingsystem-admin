import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  AlertTriangle,
  Banknote,
  Download,
  History,
  Lock,
  MoreHorizontal,
  Pause,
  Pencil,
  Plus,
  ShieldAlert,
  TrendingUp,
  Unlock,
  Wallet,
} from "lucide-react";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTableKanbanConfig,
  type DataTablePresetView,
  type DataTableRef,
  type DataTableViewMode,
} from "@/components/ui/DataTable";
import type { KanbanColumn } from "@/components/ui/Kanban";
import { AppShell } from "@/components/ui/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { Switch } from "@/components/shadcn/switch";
import { AGENTS } from "../TableDoc";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
  APP_SHELL_LAYOUT_OPTIONS,
  APP_SHELL_USER,
} from "../../mocks/app-shell-mocks";
import { NovoClienteDrawer } from "../ClientesShowcase/components/NovoClienteDrawer";
import {
  ACCOUNT_STATUS,
  BANKS,
  FINANCE_CLIENTS,
  FINANCE_KPIS,
  formatBRL,
  formatRelativeDays,
} from "./clientes-financeiro-mocks";
import { SacarDialog } from "./components/SacarDialog";
import { ExtratoExpansion } from "./components/ExtratoExpansion";
import type {
  AccountStatus,
  FinanceClientRow,
  PaymentMethod,
} from "./clientes-financeiro.types";

/* ── Lookups derivados pros filtros/colunas ─────────────────────── */

const ACCOUNT_STATUS_OPTIONS = (
  Object.entries(ACCOUNT_STATUS) as [AccountStatus, (typeof ACCOUNT_STATUS)[AccountStatus]][]
).map(([value, m]) => ({ value, label: m.label, color: m.color }));

const BANK_OPTIONS = [
  { value: "bb", label: "Banco do Brasil" },
  { value: "itau", label: "Itaú" },
  { value: "nubank", label: "Nubank" },
  { value: "santander", label: "Santander" },
  { value: "bradesco", label: "Bradesco" },
];

const AGENT_OPTIONS = Object.entries(AGENTS).map(([value, a]) => ({
  value,
  label: a.name,
}));

/** typeOptions.users do column-type `user` — id → { name, initials }. */
const AGENT_USERS = Object.fromEntries(
  Object.entries(AGENTS).map(([id, a]) => [id, { name: a.name, initials: a.initials }]),
);

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "PIX" },
  { value: "ted", label: "TED" },
  { value: "boleto", label: "Boleto" },
];
const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: "PIX",
  ted: "TED",
  boleto: "Boleto",
};

/* ── Columns financeiras ────────────────────────────────────────── */

type ColumnHandlers = {
  onEdit: (row: FinanceClientRow) => void;
  onSacar: (row: FinanceClientRow) => void;
  onToggleBlock: (row: FinanceClientRow) => void;
  onToggleAutoWithdraw: (row: FinanceClientRow, next: boolean) => void;
};

function buildColumns(
  handlers: ColumnHandlers,
): DataTableColumnDef<FinanceClientRow>[] {
  return [
    {
      field: "id",
      headerName: "ID",
      type: "text",
      width: 110,
      expandable: true, // chevron → abre o extrato (ExtratoExpansion)
      aggregate: (rows) => (
        <span className="text-fg-muted">{rows.length} clientes</span>
      ),
    },
    {
      field: "name",
      headerName: "Licenciado",
      type: "text",
      sortable: true,
      width: 240,
      isPrimary: true,
      enableColumnFilter: true,
      filterType: "text",
      render: ({ row }) => (
        <div className="flex items-center gap-gp-md min-w-0">
          <Avatar size="md" colorHex={row.avatarColor}>
            {row.initials}
          </Avatar>
          <div className="flex flex-col gap-gp-2xs min-w-0">
            <span className="text-body-sm font-medium text-fg-default truncate">
              {row.name}
            </span>
            <span className="text-caption-md text-fg-muted truncate">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      field: "companyName",
      headerName: "Razão Social",
      type: "text",
      sortable: true,
      enableColumnFilter: true,
      filterType: "text",
      width: 220,
    },
    {
      field: "cnpj",
      headerName: "CNPJ",
      type: "text",
      width: 170,
      enableColumnFilter: true,
      filterType: "text",
      render: ({ value }) => (
        <span className="text-body-sm tabular-nums text-fg-default">
          {value as string}
        </span>
      ),
    },
    // Situação — badge chip + eixo do Kanban.
    {
      field: "accountStatus",
      headerName: "Situação",
      type: "badge",
      width: 150,
      enableColumnFilter: true,
      filterType: "multiSelect",
      filterOptions: ACCOUNT_STATUS_OPTIONS,
      valueFormatter: (v) =>
        ACCOUNT_STATUS[v as AccountStatus]?.label ?? String(v ?? ""),
      render: ({ value }) => {
        const meta = ACCOUNT_STATUS[value as AccountStatus];
        if (!meta) return null;
        return (
          <Chip color={meta.color} variant="soft" size="sm" shape="pill">
            {meta.label}
          </Chip>
        );
      },
    },
    {
      field: "availableBalance",
      headerName: "Saldo disponível",
      type: "currency",
      sortable: true,
      enableColumnFilter: true,
      filterType: "number",
      align: "right",
      width: 160,
      aggregate: "sum",
      aggregateFormatter: (v) => formatBRL(v),
      render: ({ value }) => (
        <span className="font-semibold tabular-nums text-fg-success">
          {formatBRL(value as number)}
        </span>
      ),
    },
    {
      field: "monthlyVolume",
      headerName: "Volume mensal",
      type: "currency",
      sortable: true,
      enableColumnFilter: true,
      filterType: "number",
      align: "right",
      width: 150,
      aggregate: "sum",
      aggregateFormatter: (v) => formatBRL(v),
      render: ({ value }) => (
        <span className="tabular-nums text-fg-default">
          {formatBRL(value as number)}
        </span>
      ),
    },
    // Comissão — percentage + inline edit (editType number).
    {
      field: "commissionRate",
      headerName: "Comissão",
      type: "percentage",
      typeOptions: { decimals: 1 },
      align: "right",
      width: 130,
      sortable: true,
      editable: true,
      editType: "number",
      enableColumnFilter: true,
      filterType: "number",
      aggregate: "avg",
      aggregateFormatter: (v) =>
        `${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
    },
    // Conta bancária — avatar do banco; valueGetter expõe o id pro filtro/preset.
    {
      field: "bankAccount",
      headerName: "Conta bancária",
      type: "text",
      width: 220,
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: BANK_OPTIONS,
      valueGetter: (row) => row.bankAccount.bank,
      render: ({ row }) => {
        const meta = BANKS[row.bankAccount.bank];
        return (
          <div className="flex items-center gap-gp-md min-w-0">
            <Avatar size="lg" colorHex={meta.color} className="text-caption-md font-bold">
              {meta.initials}
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-body-sm font-medium text-fg-default truncate">
                {row.bankAccount.bankName}
              </span>
              <span className="text-caption-md text-fg-muted tabular-nums">
                Ag {row.bankAccount.agency} · {row.bankAccount.account}
              </span>
            </div>
          </div>
        );
      },
    },
    // Saque automático — toggle direto (interação, não inline-edit).
    {
      field: "autoWithdraw",
      headerName: "Saque auto",
      type: "boolean",
      width: 120,
      align: "center",
      enableColumnFilter: true,
      filterType: "boolean",
      render: ({ row, value }) => (
        <Switch
          checked={value as boolean}
          onCheckedChange={(next) => handlers.onToggleAutoWithdraw(row, next)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Saque automático de ${row.name}`}
        />
      ),
    },
    {
      field: "paymentMethods",
      headerName: "Métodos",
      type: "tags",
      width: 170,
      enableColumnFilter: true,
      filterType: "multiSelect",
      filterOptions: PAYMENT_METHOD_OPTIONS,
      valueFormatter: (v) =>
        Array.isArray(v)
          ? (v as PaymentMethod[]).map((m) => PAYMENT_METHOD_LABEL[m]).join(", ")
          : "",
      render: ({ value }) => (
        <div className="flex flex-wrap gap-gp-2xs">
          {(value as PaymentMethod[]).map((m) => (
            <Chip key={m} color="neutral" variant="outline" size="sm" shape="rounded">
              {PAYMENT_METHOD_LABEL[m]}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      field: "agentId",
      headerName: "Gestor",
      type: "user",
      typeOptions: { users: AGENT_USERS },
      width: 180,
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: AGENT_OPTIONS,
      valueFormatter: (v) => AGENTS[v as keyof typeof AGENTS]?.name ?? String(v ?? ""),
    },
    {
      field: "lastMovement",
      headerName: "Última mov.",
      type: "datetime",
      sortable: true,
      enableColumnFilter: true,
      filterType: "date",
      width: 150,
      render: ({ value }) => (
        <span className="text-body-sm text-fg-muted tabular-nums">
          {formatRelativeDays(value as number)}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Cliente desde",
      type: "date",
      sortable: true,
      enableColumnFilter: true,
      filterType: "date",
      width: 140,
    },
    {
      field: "_actions",
      headerName: "",
      type: "actions",
      width: 40,
      pinned: "right",
      getActions: ({ row }) => {
        const blocked = row.accountStatus === "bloqueado";
        return [
          {
            id: "edit",
            label: "Editar dados",
            icon: <Pencil />,
            showInMenu: true,
            onClick: () => handlers.onEdit(row),
          },
          {
            id: "sacar",
            label: "Realizar saque",
            icon: <Banknote />,
            showInMenu: true,
            disabled: blocked,
            onClick: () => handlers.onSacar(row),
          },
          {
            id: "history",
            label: "Histórico de saques",
            icon: <History />,
            showInMenu: true,
            onClick: () =>
              window.alert(`Histórico de ${row.name} — ${row.transactions.length} movimentações (mock).`),
          },
          {
            id: "block",
            label: blocked ? "Desbloquear conta" : "Bloquear conta",
            icon: blocked ? <Unlock /> : <Lock />,
            showInMenu: true,
            destructive: !blocked,
            onClick: () => handlers.onToggleBlock(row),
          },
        ];
      },
    },
  ];
}

/* ── Preset Views ───────────────────────────────────────────────── */

const DEFAULT_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:digitais",
    name: "Digitais",
    filters: [{ field: "bankAccount", value: "nubank" }],
  }),
  presetView({
    id: "preset:alto-valor",
    name: "Alto valor (≥ R$ 5k)",
    filters: [{ field: "availableBalance", operator: "gte", value: 5000 }],
    sort: [{ field: "availableBalance", direction: "desc" }],
  }),
  presetView({
    id: "preset:inadimplentes",
    name: "Inadimplentes",
    // accountStatus é badge → operador isAnyOf (multi-valor).
    filters: [
      { field: "accountStatus", operator: "isAnyOf", value: ["negociacao", "bloqueado"] },
    ],
  }),
  presetView({
    id: "preset:saque-auto",
    name: "Saque automático",
    filters: [{ field: "autoWithdraw", operator: "equals", value: true }],
  }),
];

/* ── Kanban — board por situação da conta ───────────────────────── */

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "pendente",   label: "Pendente",      dotColor: "var(--color-fg-warning)" },
  { id: "ativo",      label: "Ativo",         dotColor: "var(--color-fg-success)" },
  { id: "negociacao", label: "Em negociação", dotColor: "var(--color-fg-info)" },
  { id: "bloqueado",  label: "Bloqueado",     dotColor: "var(--color-fg-danger)" },
];

/* ── KPI Card ───────────────────────────────────────────────────── */

type KpiTone = "brand" | "success" | "warning" | "info" | "danger" | "neutral";

const KPI_TONE_CLASSES: Record<KpiTone, { bg: string; fg: string }> = {
  brand:   { bg: "bg-bg-brand-subtle",   fg: "text-fg-brand" },
  success: { bg: "bg-bg-success-muted",  fg: "text-fg-success" },
  warning: { bg: "bg-bg-warning-muted",  fg: "text-fg-warning" },
  info:    { bg: "bg-bg-info-muted",     fg: "text-fg-info" },
  danger:  { bg: "bg-bg-danger-muted",   fg: "text-fg-danger" },
  neutral: { bg: "bg-bg-muted",          fg: "text-fg-muted" },
};

function KpiCard({
  icon: Icon,
  title,
  value,
  hint,
  tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  value: string;
  hint?: string;
  tone?: KpiTone;
}) {
  const cls = KPI_TONE_CLASSES[tone];
  return (
    <article className="flex flex-col gap-gp-lg p-pad-3xl bg-bg-surface border border-border-subtle rounded-radius-xl shadow-sh-sm">
      <header className="flex items-start justify-between gap-gp-md">
        <h3 className="m-0 text-body-md font-semibold text-fg-default">{title}</h3>
        <span
          className={`grid place-items-center size-form-lg rounded-radius-lg shrink-0 ${cls.bg} ${cls.fg}`}
          aria-hidden="true"
        >
          <Icon className="size-icon-md" strokeWidth={1.8} />
        </span>
      </header>
      <div className="flex flex-col gap-gp-xs">
        <span className="text-body-2xl font-bold text-fg-default leading-none [font-variant-numeric:tabular-nums]">
          {value}
        </span>
        {hint && <span className="text-caption-sm text-fg-subtle">{hint}</span>}
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Page — Clientes Financeiro
   ═══════════════════════════════════════════════════════════════════ */

export default function ClientesFinanceiroShowcase() {
  const { theme, setTheme } = useTheme();
  const [rows, setRows] = useState<FinanceClientRow[]>(FINANCE_CLIENTS);
  const [layout, setLayout] = useState<string>("fluid");
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<FinanceClientRow | null>(null);
  const [sacarClient, setSacarClient] = useState<FinanceClientRow | null>(null);
  const tableRef = useRef<DataTableRef>(null);

  const handleEdit = useCallback((row: FinanceClientRow) => {
    setEditingClient(row);
  }, []);

  const handleSacar = useCallback((row: FinanceClientRow) => {
    setSacarClient(row);
  }, []);

  const handleToggleBlock = useCallback((row: FinanceClientRow) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, accountStatus: r.accountStatus === "bloqueado" ? "ativo" : "bloqueado" }
          : r,
      ),
    );
  }, []);

  const handleToggleAutoWithdraw = useCallback(
    (row: FinanceClientRow, next: boolean) => {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, autoWithdraw: next } : r)),
      );
    },
    [],
  );

  const handleSacarConfirm = useCallback(
    (data: { clientId: string; amount: number; account: { bankName: string } }) => {
      window.alert(
        `Saque de ${formatBRL(data.amount)} confirmado!\n\n` +
          `Cliente: ${data.clientId}\n` +
          `Conta destino: ${data.account.bankName}\n\n` +
          `Disponível em até 1 dia útil.`,
      );
    },
    [],
  );

  // Inline edit (commissionRate) — async com latência simulada.
  const handleCellEditCommit = useCallback(
    async ({ id, field, value }: { id: string | number; field: string; value: unknown }) => {
      await new Promise((res) => setTimeout(res, 600));
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: Number(value) } : r)),
      );
    },
    [],
  );

  const columns = useMemo(
    () =>
      buildColumns({
        onEdit: handleEdit,
        onSacar: handleSacar,
        onToggleBlock: handleToggleBlock,
        onToggleAutoWithdraw: handleToggleAutoWithdraw,
      }),
    [handleEdit, handleSacar, handleToggleBlock, handleToggleAutoWithdraw],
  );

  const kanbanConfig = useMemo<DataTableKanbanConfig<FinanceClientRow>>(
    () => ({
      groupByField: "accountStatus",
      columns: KANBAN_COLUMNS,
      renderCard: ({ row }) => {
        const bank = BANKS[row.bankAccount.bank];
        return {
          title: row.name,
          subtitle: row.companyName,
          avatar: (
            <Avatar size="sm" colorHex={row.avatarColor}>
              {row.initials}
            </Avatar>
          ),
          chip: (
            <Chip color="neutral" variant="soft" size="sm" shape="pill">
              {bank.initials}
            </Chip>
          ),
          value: formatBRL(row.availableBalance),
          footerLeft: (
            <span className="inline-flex flex-wrap gap-gp-2xs min-w-0">
              {row.paymentMethods.map((m) => (
                <Chip key={m} color="neutral" variant="outline" size="sm" shape="rounded">
                  {PAYMENT_METHOD_LABEL[m]}
                </Chip>
              ))}
            </span>
          ),
          footerRight: (
            <span className="text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums] shrink-0">
              {formatRelativeDays(row.lastMovement)}
            </span>
          ),
        };
      },
      enableDnD: true,
      onCardMove: (cardId, _from, to) => {
        setRows((prev) =>
          prev.map((r) =>
            r.id === cardId ? { ...r, accountStatus: to as AccountStatus } : r,
          ),
        );
      },
    }),
    [],
  );

  const isTable = viewMode === "table";

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#atendimentos"
      breadcrumb={[{ label: "Financeiro" }, { label: "Clientes" }]}
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
        title="Clientes — Financeiro"
        description="Acompanhe saldos, situação das contas e fluxo financeiro dos licenciados. Arraste cards no Kanban pra mudar a situação; edite comissão e saque automático direto na tabela."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {rows.length.toLocaleString("pt-BR")} clientes
          </Chip>
        }
        actions={
          <>
            <Button
              variant="outline"
              color="secondary"
              size="icon-md"
              aria-label="Mais ações"
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

      {/* KPI grid — 4 cards. */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gp-2xl pb-pad-2xl">
        <KpiCard
          icon={Wallet}
          title="Disponível total"
          value={formatBRL(FINANCE_KPIS.totalAvailable)}
          hint="Soma de todos os saldos"
          tone="brand"
        />
        <KpiCard
          icon={TrendingUp}
          title="High-value (≥ R$ 5k)"
          value={String(FINANCE_KPIS.highValueCount)}
          hint="Clientes acima de R$ 5.000"
          tone="success"
        />
        <KpiCard
          icon={Banknote}
          title="Saldo médio"
          value={formatBRL(FINANCE_KPIS.averageBalance)}
          hint="Por cliente"
          tone="info"
        />
        <KpiCard
          icon={ShieldAlert}
          title="Em risco"
          value={String(FINANCE_KPIS.atRiskCount)}
          hint="Em negociação ou bloqueado"
          tone="danger"
        />
      </section>

      <DataTable<FinanceClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        // v4 — colunas + kanban + inline edit reformulados (auditoria 2026-06-10)
        persistId="showcase-finance-crud-v4"
        defaultViews={DEFAULT_VIEWS}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        kanbanConfig={kanbanConfig}
        // Extrato da row (chevron na coluna ID).
        renderRowExpansion={({ row }) => <ExtratoExpansion row={row} />}
        // Inline edit da comissão (async, latência simulada).
        onCellEditCommit={handleCellEditCommit}
        // Totalizers no footer (só faz sentido na tabela).
        showTotalizers={isTable}
        toolbar={{
          enableSearch: true,
          enableFilters: true,
          // Cols/density só na tabela (board não tem colunas/densidade).
          enableColumns: isTable,
          enableDensity: isTable,
          enableExport: true,
        }}
        paginationConfig={{
          enabled: isTable,
          initialPageSize: 25,
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
                icon={<Pause />}
                onClick={() => {
                  const ids = new Set(selectedIds.map(String));
                  setRows((prev) =>
                    prev.map((r) =>
                      ids.has(r.id) ? { ...r, autoWithdraw: false } : r,
                    ),
                  );
                  clearSelection();
                }}
              >
                Pausar saque auto
              </BulkActionButton>
              <BulkActionButton
                icon={<AlertTriangle />}
                variant="danger"
                onClick={() => {
                  const ids = new Set(selectedIds.map(String));
                  setRows((prev) =>
                    prev.map((r) =>
                      ids.has(r.id) ? { ...r, accountStatus: "negociacao" } : r,
                    ),
                  );
                  clearSelection();
                }}
              >
                Marcar p/ revisão
              </BulkActionButton>
            </>
          ),
        }}
        className="flex-1 min-h-0 mb-pad-2xl"
      />

      {/* Drawers + Modals */}
      <NovoClienteDrawer
        open={novoClienteOpen}
        onOpenChange={setNovoClienteOpen}
        onSubmit={() => window.alert("Cliente criado com sucesso! (mock)")}
      />
      <NovoClienteDrawer
        open={editingClient !== null}
        onOpenChange={(o) => !o && setEditingClient(null)}
        onSubmit={() =>
          window.alert(`Cliente ${editingClient?.name ?? ""} atualizado! (mock)`)
        }
      />
      <SacarDialog
        open={sacarClient !== null}
        onOpenChange={(o) => !o && setSacarClient(null)}
        client={sacarClient}
        onConfirm={handleSacarConfirm}
      />
    </AppShell>
  );
}
