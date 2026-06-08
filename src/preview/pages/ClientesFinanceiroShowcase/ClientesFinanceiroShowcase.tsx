import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  Banknote,
  MoreHorizontal,
  Pencil,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableRef,
} from "@/components/ui/DataTable";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
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
  BANKS,
  FINANCE_CLIENTS,
  FINANCE_KPIS,
  formatBRL,
} from "./clientes-financeiro-mocks";
import { SacarDialog } from "./components/SacarDialog";
import type { FinanceClientRow } from "./clientes-financeiro.types";

/* ── Columns financeiras ────────────────────────────────────────── */

type ColumnHandlers = {
  onEdit: (row: FinanceClientRow) => void;
  onSacar: (row: FinanceClientRow) => void;
};

function buildColumns(
  handlers: ColumnHandlers,
): DataTableColumnDef<FinanceClientRow>[] {
  return [
    { field: "id", headerName: "ID", type: "text", width: 100 },
    {
      field: "name",
      headerName: "Cliente",
      type: "text",
      sortable: true,
      width: 200,
    },
    {
      field: "email",
      headerName: "Email",
      type: "email",
      enableColumnFilter: true,
      filterType: "text",
      width: 220,
    },
    // Saldo disponível — currency right-aligned, destaque em verde via render
    {
      field: "availableBalance",
      headerName: "Saldo disponível",
      type: "currency",
      sortable: true,
      enableColumnFilter: true,
      filterType: "number",
      align: "right",
      width: 170,
      aggregate: "sum",
      aggregateFormatter: (v) => formatBRL(v),
      render: ({ value }) => (
        <span className="font-semibold tabular-nums text-fg-success">
          {formatBRL(value as number)}
        </span>
      ),
    },
    // Conta bancária — bank icon (initials + cor) + agência/conta
    {
      field: "bankAccount",
      headerName: "Conta bancária",
      type: "text",
      width: 240,
      enableColumnFilter: false,
      render: ({ row }) => {
        const meta = BANKS[row.bankAccount.bank];
        return (
          <div className="flex items-center gap-gp-md min-w-0">
            <div
              className="size-form-sm rounded-full grid place-items-center text-fg-on-brand text-caption-md font-bold shrink-0"
              style={{ backgroundColor: meta.color }}
              aria-hidden="true"
            >
              {meta.initials}
            </div>
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
    {
      field: "categoryId",
      headerName: "Categoria",
      type: "badge",
      enableColumnFilter: true,
      filterType: "multiSelect",
      width: 140,
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
      width: 72,
      pinned: "right",
      getActions: ({ row }) => [
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
          onClick: () => handlers.onSacar(row),
        },
      ],
    },
  ];
}

/* ── KPI Card (mini stat card pra header da página) ─────────────── */

function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-gp-lg p-pad-xl rounded-radius-lg border border-border-default bg-bg-surface shadow-sh-sm min-w-[200px]">
      <div className="size-form-lg rounded-radius-md bg-bg-brand-subtle text-fg-brand grid place-items-center shrink-0 [&_svg]:size-icon-md">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-caption-md font-medium text-fg-muted">{label}</span>
        <span className="text-heading-sm font-bold text-fg-default tabular-nums">
          {value}
        </span>
        {hint && (
          <span className="text-caption-sm text-fg-muted truncate">{hint}</span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Page — Clientes Financeiro (showcase com tema financeiro)
   ═══════════════════════════════════════════════════════════════════ */

export default function ClientesFinanceiroShowcase() {
  const { theme, setTheme } = useTheme();
  const [rows] = useState<FinanceClientRow[]>(FINANCE_CLIENTS);
  const [layout, setLayout] = useState<string>("fluid");
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

  const handleSacarConfirm = useCallback(
    (data: { clientId: string; amount: number; account: { bankName: string } }) => {
      // Mocado — só feedback visual (snackbar/alert)
      window.alert(
        `Saque de ${formatBRL(data.amount)} confirmado!\n\n` +
          `Cliente: ${data.clientId}\n` +
          `Conta destino: ${data.account.bankName}\n\n` +
          `Disponível em até 1 dia útil.`,
      );
    },
    [],
  );

  const columns = useMemo(
    () => buildColumns({ onEdit: handleEdit, onSacar: handleSacar }),
    [handleEdit, handleSacar],
  );

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
        description="Acompanhe saldos disponíveis, contas bancárias e realize saques pra clientes da carteira."
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

      {/* KPI row — 3 cards estatísticos sobre a carteira */}
      <div className="flex flex-wrap gap-gp-lg px-pad-3xl pb-pad-2xl">
        <KpiCard
          icon={<Wallet />}
          label="Disponível total"
          value={formatBRL(FINANCE_KPIS.totalAvailable)}
          hint="Soma de todos os saldos"
        />
        <KpiCard
          icon={<TrendingUp />}
          label="High-value (≥ R$ 5k)"
          value={String(FINANCE_KPIS.highValueCount)}
          hint="Clientes acima de R$ 5.000"
        />
        <KpiCard
          icon={<Banknote />}
          label="Saldo médio"
          value={formatBRL(FINANCE_KPIS.averageBalance)}
          hint="Por cliente"
        />
      </div>

      {/* DataTable */}
      <DataTable<FinanceClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="showcase-finance-crud"
        // SimpleFilter ON — UX recomendada pro consumer (split button + drawer)
        simpleFilter={{ enabled: true }}
        toolbar={{
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
          enableExport: true,
        }}
        paginationConfig={{
          enabled: true,
          initialPageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        selectionConfig={{ enabled: true, enableGlobal: true }}
        showTotalizers
        className="max-h-full"
      />

      {/* Drawers + Modals */}
      <NovoClienteDrawer
        open={novoClienteOpen}
        onOpenChange={setNovoClienteOpen}
        onSubmit={() => {
          // Mocado — feedback visual via alert
          window.alert("Cliente criado com sucesso! (mock)");
        }}
      />

      {/* Editar drawer reaproveita NovoClienteDrawer — controla via editingClient.
       *  TODO futuro: extrair `EditarClienteDrawer` separado com pre-fill dos
       *  dados financeiros (banco, conta) — fora do escopo desta PR. */}
      <NovoClienteDrawer
        open={editingClient !== null}
        onOpenChange={(o) => !o && setEditingClient(null)}
        onSubmit={() => {
          window.alert(
            `Cliente ${editingClient?.name ?? ""} atualizado com sucesso! (mock)`,
          );
        }}
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
