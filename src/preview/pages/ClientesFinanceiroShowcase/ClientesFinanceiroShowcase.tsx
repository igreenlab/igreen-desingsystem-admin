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
      headerName: "Licenciado",
      type: "text",
      sortable: true,
      width: 240,
      render: ({ row }) => (
        <div className="flex flex-col gap-gp-3xs min-w-0">
          <span className="text-body-sm font-medium text-fg-default truncate">
            {row.name}
          </span>
          <span className="text-caption-md text-fg-muted truncate">
            {row.email}
          </span>
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
      width: 240,
    },
    {
      field: "cnpj",
      headerName: "CNPJ",
      type: "text",
      width: 180,
      enableColumnFilter: true,
      filterType: "text",
      render: ({ value }) => (
        <span className="text-body-sm tabular-nums text-fg-default">
          {value as string}
        </span>
      ),
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
              className="size-form-sm rounded-full grid place-items-center text-white text-caption-md font-bold shrink-0"
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
      // 1 button icon-only (kebab 36px) → width 40px é o mínimo viável
      // (36 do button + 2px de respiro lateral). 48 ainda dava "vazio
      // perceptível" em viewports apertados; 40 cola sem invadir o button.
      width: 40,
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

/* ── KPI Card (alinhado com pattern do DashboardShowcase) ───────── */

type KpiTone = "brand" | "success" | "warning" | "info" | "danger" | "neutral";

const KPI_TONE_CLASSES: Record<KpiTone, { bg: string; fg: string }> = {
  brand:   { bg: "bg-bg-brand-subtle",   fg: "text-fg-brand" },
  success: { bg: "bg-bg-success-muted",  fg: "text-fg-success" },
  warning: { bg: "bg-bg-warning-muted",  fg: "text-fg-warning" },
  info:    { bg: "bg-bg-info-muted",     fg: "text-fg-info" },
  danger:  { bg: "bg-bg-danger-muted",   fg: "text-fg-danger" },
  neutral: { bg: "bg-bg-muted",          fg: "text-fg-muted" },
};

/**
 * KpiCard alinhado com `DashboardShowcase.tsx` — header (title + icon
 * tone-based), value 2xl bold tabular-nums, hint opcional embaixo.
 * Usa <article> com bg-surface + border-subtle + rounded-xl + shadow-sm.
 */
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
        {hint && (
          <span className="text-caption-sm text-fg-subtle">{hint}</span>
        )}
      </div>
    </article>
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

      {/* KPI grid — alinhado com pattern do DashboardShowcase.
       *  Sem padding lateral (Sergio pediu) — section ocupa full width do
       *  container pai. Grid responsive: 1 col mobile, 2 cols sm, 3 cols lg. */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gp-2xl pb-pad-2xl">
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
      </section>

      {/* DataTable */}
      <DataTable<FinanceClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        // Bumpado pra v2 — reset reorder/visibility/widths persistidos da v1
        // (havia columns reorder antigo de testes que empurrava actions pro
        // meio em vez do pinned right).
        persistId="showcase-finance-crud-v2"
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
        // Sem showTotalizers — Sergio removeu o footer com soma da coluna
        // Saldo disponível (somatória vinha dropdown do KPI "Disponível
        // total" no header, era redundante).
        // flex-1 + min-h-0 + mb-pad-2xl: tabela limita altura ao container pai
        // (sem scroll de página inteira) + dá respiro embaixo pra paginação
        // não grudar no rodapé do AppShell.
        className="flex-1 min-h-0 mb-pad-2xl"
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
