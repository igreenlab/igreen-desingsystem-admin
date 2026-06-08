import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  Banknote,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTablePresetView,
  type DataTableRef,
} from "@/components/ui/DataTable";
import { AlertModal } from "@/components/ui/AlertModal";
import { AppShell } from "@/components/ui/AppShell";
import { Avatar } from "@/components/ui/Avatar";
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
import { FinanceDetailDrawer } from "./components/FinanceDetailDrawer";
import {
  FINANCE_STATUS_META,
  type FinanceClientRow,
  type FinanceStatus,
} from "./clientes-financeiro.types";

/* ── Columns financeiras ────────────────────────────────────────── */

type ColumnHandlers = {
  onEdit: (row: FinanceClientRow) => void;
  onSacar: (row: FinanceClientRow) => void;
  onOpenDetail: (row: FinanceClientRow) => void;
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
      // Nome clicável — abre FinanceDetailDrawer com dados do licenciado
      // (mesmo pattern do DetailDrawer da ClientesShowcase mas variante
      // financeira). text-fg-brand + underline-on-hover sinaliza link.
      render: ({ row }) => (
        <div className="flex flex-col gap-gp-3xs min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onOpenDetail(row);
            }}
            className="text-body-sm font-medium text-fg-brand truncate text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand rounded-radius-xs cursor-pointer"
          >
            {row.name}
          </button>
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
    // Conta bancária — bank icon (initials + cor) + agência/conta.
    // valueGetter retorna `bank` (id do banco) — viabiliza filtro/preset
    // por banco sem precisar de coluna espelho separada. O `render` continua
    // mostrando o avatar + nome + agência/conta como antes.
    {
      field: "bankAccount",
      headerName: "Conta bancária",
      type: "text",
      width: 240,
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: [
        { value: "bb",        label: "Banco do Brasil" },
        { value: "itau",      label: "Itaú" },
        { value: "nubank",    label: "Nubank" },
        { value: "santander", label: "Santander" },
        { value: "bradesco",  label: "Bradesco" },
      ],
      valueGetter: (row) => row.bankAccount.bank,
      render: ({ row }) => {
        const meta = BANKS[row.bankAccount.bank];
        return (
          <div className="flex items-center gap-gp-md min-w-0">
            {/* Avatar do banco — bg via colorHex, texto auto-contrast (L-027).
             *  BB amarelo agora aparece com texto PRETO (antes branco = ratio
             *  1.29:1 falhava WCAG AA); roxos/vermelhos/laranjas escuros
             *  continuam com branco. */}
            <Avatar
              size="lg"
              colorHex={meta.color}
              className="text-caption-md font-bold"
            >
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
    // Status financeiro — Chip semântico (warning/success/neutral)
    {
      field: "financeStatus",
      headerName: "Status",
      type: "select",
      width: 160,
      sortable: true,
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: (Object.keys(FINANCE_STATUS_META) as FinanceStatus[]).map(
        (id) => ({ value: id, label: FINANCE_STATUS_META[id].label }),
      ),
      render: ({ value }) => {
        const meta = FINANCE_STATUS_META[value as FinanceStatus];
        if (!meta) return null;
        return (
          <Chip color={meta.color} variant="soft" size="sm" shape="rounded">
            {meta.label}
          </Chip>
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

/* ── Preset Views (filtros pré-aplicados) ───────────────────────── */

/**
 * Views pré-configuradas que aparecem como tabs após "Default".
 *
 * 1. **Digitais** — só Nubank (banco online/digital nativo)
 * 2. **Saques pendentes** — `financeStatus = "pending_withdrawal"`
 *    (clientes que estão aguardando processamento de saque)
 *
 * Filtro por banco usa `field: "bankAccount"` — a coluna define
 * `valueGetter: (row) => row.bankAccount.bank` então o equals match
 * direto contra o id do banco ("nubank", "bb" etc).
 */
const DEFAULT_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:digitais",
    name: "Digitais",
    filters: [{ field: "bankAccount", value: "nubank" }],
  }),
  presetView({
    id: "preset:saques-pendentes",
    name: "Saques pendentes",
    filters: [{ field: "financeStatus", value: "pending_withdrawal" }],
    sort: [{ field: "availableBalance", direction: "desc" }],
  }),
];

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
 * KpiCard compacto — layout horizontal pra altura ~50% menor que o card
 * "vertical" do DashboardShowcase. Ícone à esquerda + stack title/value à
 * direita. Hint removido (info do contexto já implícita).
 *
 * Altura aproximada: ~68px (vs ~160px do layout anterior). Mantém
 * `<article>` + bg-surface + border-subtle + rounded-xl + shadow-sm.
 */
function KpiCard({
  icon: Icon,
  title,
  value,
  tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  value: string;
  tone?: KpiTone;
}) {
  const cls = KPI_TONE_CLASSES[tone];
  return (
    <article className="flex items-center gap-gp-lg p-pad-xl bg-bg-surface border border-border-subtle rounded-radius-xl shadow-sh-sm">
      <span
        className={`grid place-items-center size-form-lg rounded-radius-md shrink-0 ${cls.bg} ${cls.fg}`}
        aria-hidden="true"
      >
        <Icon className="size-icon-md" strokeWidth={1.8} />
      </span>
      <div className="flex flex-col flex-1 min-w-0 gap-gp-3xs">
        <span className="text-caption-md text-fg-muted truncate leading-tight">
          {title}
        </span>
        <span className="text-body-xl font-bold text-fg-default tabular-nums leading-tight truncate">
          {value}
        </span>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Page — Clientes Financeiro (showcase com tema financeiro)
   ═══════════════════════════════════════════════════════════════════ */

/** Dados do saque concluído pra exibir no AlertModal de sucesso. */
type SacarSuccess = {
  clientId: string;
  clientName: string;
  amount: number;
  bankName: string;
};

export default function ClientesFinanceiroShowcase() {
  const { theme, setTheme } = useTheme();
  const [rows] = useState<FinanceClientRow[]>(FINANCE_CLIENTS);
  const [layout, setLayout] = useState<string>("fluid");
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<FinanceClientRow | null>(null);
  const [sacarClient, setSacarClient] = useState<FinanceClientRow | null>(null);
  /** Drawer "Detalhes do licenciado" — abre ao clicar no nome na coluna. */
  const [detailClient, setDetailClient] = useState<FinanceClientRow | null>(null);
  /** Feedback de saque concluído via <AlertModal tone="success">. */
  const [sacarSuccess, setSacarSuccess] = useState<SacarSuccess | null>(null);
  const tableRef = useRef<DataTableRef>(null);

  const handleEdit = useCallback((row: FinanceClientRow) => {
    setEditingClient(row);
  }, []);

  const handleSacar = useCallback((row: FinanceClientRow) => {
    setSacarClient(row);
  }, []);

  const handleOpenDetail = useCallback((row: FinanceClientRow) => {
    setDetailClient(row);
  }, []);

  /** Confirmação do saque vinda do SacarDialog — dispara AlertModal de sucesso
   *  em vez do `window.alert` legado pra feedback consistente com o DS. */
  const handleSacarConfirm = useCallback(
    (data: {
      clientId: string;
      amount: number;
      account: { bankName: string };
    }) => {
      const sourceRow = rows.find((r) => r.id === data.clientId) ?? null;
      setSacarSuccess({
        clientId: data.clientId,
        clientName: sourceRow?.name ?? "—",
        amount: data.amount,
        bankName: data.account.bankName,
      });
    },
    [rows],
  );

  const columns = useMemo(
    () =>
      buildColumns({
        onEdit: handleEdit,
        onSacar: handleSacar,
        onOpenDetail: handleOpenDetail,
      }),
    [handleEdit, handleSacar, handleOpenDetail],
  );

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#atendimentos"
      breadcrumb={[{ label: "Financeiro" }]}
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
        title="Financeiro"
        description="Acompanhe saldos disponíveis, contas bancárias e realize saques pra clientes da carteira."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {rows.length.toLocaleString("pt-BR")} licenciados
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
              Novo Licenciado
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
          tone="brand"
        />
        <KpiCard
          icon={TrendingUp}
          title="High-value (≥ R$ 5k)"
          value={`${FINANCE_KPIS.highValueCount} licenciados`}
          tone="success"
        />
        <KpiCard
          icon={Banknote}
          title="Saldo médio por cliente"
          value={formatBRL(FINANCE_KPIS.averageBalance)}
          tone="info"
        />
      </section>

      {/* DataTable */}
      <DataTable<FinanceClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        // v4 — adicionada coluna `financeStatus` (Status), view "Alto valor"
        // renomeada pra "Saques pendentes" com filtro novo. Bump força
        // reset de localStorage com schema antigo.
        persistId="showcase-finance-crud-v4"
        defaultViews={DEFAULT_VIEWS}
        // SimpleFilter ON — UX recomendada pro consumer (split button + drawer)
        simpleFilter={{ enabled: true }}
        toolbar={{
          enableSearch: true,
          // Sem refresh nessa tela — os dados são mockados, refresh visual
          // não agrega valor pro usuário do financeiro.
          enableRefresh: false,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
          // Sem export — financeiro não exporta dados sensíveis pelo UI.
          enableExport: false,
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

      {/* Detalhes do licenciado — abre ao clicar no nome (botão da coluna).
       *  FloatingPanel non-modal (não bloqueia tabela atrás), resizable + max. */}
      <FinanceDetailDrawer
        row={detailClient}
        onClose={() => setDetailClient(null)}
        onEdit={(row) => {
          setDetailClient(null);
          setEditingClient(row);
        }}
        onSacar={(row) => {
          setDetailClient(null);
          setSacarClient(row);
        }}
      />

      {/* Confirmação de saque — substitui o window.alert legado.
       *  AlertModal tone="success" com ícone CheckCircle2 + descrição
       *  estruturada. Botão único "OK" pra fechar (sem cancel). */}
      <AlertModal
        open={sacarSuccess !== null}
        onOpenChange={(open) => !open && setSacarSuccess(null)}
        tone="success"
        icon={<CheckCircle2 />}
        title="Saque confirmado!"
        description={
          sacarSuccess
            ? `Saque de ${formatBRL(sacarSuccess.amount)} para o cliente ${sacarSuccess.clientName} (${sacarSuccess.clientId}) foi enviado pra conta ${sacarSuccess.bankName}. Disponível em até 1 dia útil.`
            : ""
        }
        confirmLabel="OK"
        hideCancel
        onConfirm={() => setSacarSuccess(null)}
      />
    </AppShell>
  );
}
