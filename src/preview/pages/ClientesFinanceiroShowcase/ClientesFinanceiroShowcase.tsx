import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  Banknote,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTablePresetView,
  type DataTableRef,
} from "@/components/ui/DataTable";
import {
  ToolbarApplied,
  ToolbarSimpleFilterDrawer,
  type AppliedFilter,
  type AddViewModalSubmit,
} from "@/components/ui/TableToolbar";
import {
  POPOVER_OP_TO_FILTER_OP,
  FILTER_OP_TO_POPOVER_OP,
} from "@/components/ui/DataTable/utils/operator-mapping";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Checkbox } from "@/components/shadcn/checkbox";
import type { FilterModel, SortModel } from "@/components/ui/DataTable";
import type { TableDensity } from "@/components/ui/Table";
import { AlertModal } from "@/components/ui/AlertModal";
import { AppShell } from "@/components/ui/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { FinanceCustomToolbar } from "./components/FinanceCustomToolbar";
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

/* ── normalizeFilterModel ─────────────────────────────────────────────
 * Consolida N FilterItems com mesmo (field, operator=isAnyOf|isNoneOf) em
 * UM único item com value: array. Resolve dois bugs:
 *
 *   1) Drawer simples / advanced criavam N items single-value pra mesma
 *      coluna → AND default não matchava nada (rows têm 1 banco só);
 *   2) Chip aplicado renderizava N chips visualmente em vez de UM.
 *
 * Items com operator não-multi (equals, contains, between, etc) passam sem
 * alteração — só isAnyOf/isNoneOf são agregados. Ordem original preservada:
 * o item agregado fica na posição do PRIMEIRO item daquele field+operator.
 */
function normalizeFilterModel(model: FilterModel): FilterModel {
  type Grp = { field: string; op: "isAnyOf" | "isNoneOf"; values: unknown[] };
  const groups = new Map<string, Grp>();
  const result: FilterModel["items"] = [];
  const insertedKeys = new Set<string>();

  for (const it of model.items) {
    if (it.operator !== "isAnyOf" && it.operator !== "isNoneOf") {
      result.push(it);
      continue;
    }
    const key = `${it.field}|${it.operator}`;
    let grp = groups.get(key);
    if (!grp) {
      grp = { field: it.field, op: it.operator, values: [] };
      groups.set(key, grp);
    }
    const v = it.value;
    if (Array.isArray(v)) {
      for (const x of v as unknown[]) {
        if (x != null && x !== "") grp.values.push(x);
      }
    } else if (v != null && v !== "") {
      grp.values.push(v);
    }
    if (!insertedKeys.has(key)) {
      insertedKeys.add(key);
      // Placeholder — substituído depois na ordem
      result.push({
        id: `${it.field}_${it.operator}`,
        field: it.field,
        operator: it.operator,
        value: [] as never,
      });
    }
  }

  // Preenche placeholders com array deduplicado + descarta vazios
  const finalItems = result
    .map((it) => {
      if (it.operator !== "isAnyOf" && it.operator !== "isNoneOf") return it;
      const grp = groups.get(`${it.field}|${it.operator}`);
      if (!grp) return null;
      // Dedupe preservando ordem
      const seen = new Set<string>();
      const dedup: unknown[] = [];
      for (const v of grp.values) {
        const k = String(v);
        if (seen.has(k)) continue;
        seen.add(k);
        dedup.push(v);
      }
      if (dedup.length === 0) return null;
      return { ...it, value: dedup as never };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return { ...model, items: finalItems };
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

/** Tipo da view salva no estado local — alinhado com TableToolbarViewsItem
 *  do DS (id, name, owner, ownerName). owner="me" → tab "Pessoais" + lixinho. */
type SavedView = {
  id: string;
  name: string;
  owner: string;
  ownerName?: string;
  /** Estado capturado quando a view foi salva — replicado ao aplicar. */
  state: {
    filterModel: FilterModel;
    sortModel: SortModel[];
  };
};

/** Views iniciais — presets vindos de DEFAULT_VIEWS (owner="org" pra ficarem
 *  na tab "Todos" sem ícone de exclusão). User pode criar suas próprias com
 *  owner="me" via "Salvar visão atual". */
const INITIAL_SAVED_VIEWS: SavedView[] = DEFAULT_VIEWS.map((v) => ({
  id: v.id,
  name: v.name,
  owner: "org",
  ownerName: "iGreen",
  state: {
    filterModel: v.state.filterModel ?? { items: [], logicOperator: "AND" },
    sortModel: v.state.sortModel ?? [],
  },
}));

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

  /* ── State controlado da custom toolbar ─────────────────────── */

  /** View ativa — `null` = Default (sem preset aplicado). */
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  /** Storage local de views — começa com presets, user adiciona/remove via UI. */
  const [savedViews, setSavedViews] = useState<SavedView[]>(INITIAL_SAVED_VIEWS);
  const [search, setSearch] = useState("");
  const [filterModelRaw, setFilterModelRaw] = useState<FilterModel>({
    items: [],
    logicOperator: "AND",
  });
  /** Wrapper sobre setFilterModelRaw — normaliza o modelo antes de armazenar:
   *  consolida N FilterItems com mesmo (field, operator=isAnyOf|isNoneOf) num
   *  único item com value: array. Fix pra bug do drawer/advanced que criavam
   *  N items separados — DataTable processor com logicOperator=AND não casava
   *  rows (cada item single-value, AND entre eles → 0 matches). Pós-normalize,
   *  1 item com array funciona corretamente. */
  const filterModel = filterModelRaw;
  const setFilterModel = useCallback(
    (m: FilterModel | ((prev: FilterModel) => FilterModel)) => {
      setFilterModelRaw((prev) => {
        const next = typeof m === "function" ? m(prev) : m;
        return normalizeFilterModel(next);
      });
    },
    [],
  );
  const [sortModel, setSortModel] = useState<SortModel[]>([]);
  const [density, setDensity] = useState<TableDensity>("standard");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [pinnedColumns, setPinnedColumns] = useState<Set<string>>(
    new Set(["_actions"]),
  );
  /** Ordem das colunas controlada externamente — array de `field` strings na
   *  ordem desejada. Drag no ColsView muda esta ordem; propagamos via
   *  `tableRef.current.setColumnOrder()` (DataTableRef expõe esse método). */
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [simpleFilterOpen, setSimpleFilterOpen] = useState(false);
  /** Counter signal — incrementa quando user clica num chip de filtro
   *  aplicado, sinalizando ao FinanceCustomToolbar pra abrir dropdown
   *  em view "advanced". */
  const [advancedOpenSignal, setAdvancedOpenSignal] = useState(0);

  /** Header filter popover — ativado quando user clica no ícone "Filtrar X"
   *  do header de uma coluna. Armazena retângulo do botão (pra posicionar
   *  PopoverAnchor) + field da coluna. Popover renderiza checkbox list (para
   *  selects com options) com aplicação LIVE via isAnyOf array. */
  const [headerFilter, setHeaderFilter] = useState<{
    rect: DOMRect;
    field: string;
  } | null>(null);

  /** Captura clicks nos botões "Filtrar X" do header da tabela ANTES do React
   *  delegation rodar. Sem isso, o handler interno do DataTable
   *  (`handleFilterShortcut`) cria um filtro vazio + tenta abrir o chip popover
   *  (que está dentro do toolbarWrap escondido → nada acontece visível).
   *  Hijack: stopPropagation + abre popover ancorado ao botão clicado. */
  useEffect(() => {
    const onCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest('[aria-label^="Filtrar "]') as HTMLElement | null;
      if (!btn) return;
      // Identifica a coluna pelo aria-label "Filtrar <headerName>"
      const label = btn.getAttribute("aria-label") ?? "";
      const headerName = label.replace(/^Filtrar\s+/, "").trim();
      const col = columns.find((c) => (c.headerName ?? c.field) === headerName);
      if (!col) return;
      // Para evitar que o handler interno do DataTable também rode
      e.stopPropagation();
      e.preventDefault();
      // Fallback robusto: se o botão tem 0 dimensão (foi clicado via API/teste
      // sem hover real), usa o columnheader pai como rect. Em uso normal, o
      // user precisou hover pra ver o ícone — rect sempre válido aqui.
      let rect = btn.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        const header = btn.closest('[role="columnheader"]') as HTMLElement | null;
        if (header) rect = header.getBoundingClientRect();
      }
      setHeaderFilter({ rect, field: String(col.field) });
    };
    document.addEventListener("click", onCapture, { capture: true });
    return () =>
      document.removeEventListener("click", onCapture, { capture: true });
    // columns é estável (declarado top-level no escopo render); intentional
    // re-bind ao mudar.
  }, []);

  /** Aplica preset de view salva — replica filterModel + sortModel. */
  const handleApplyView = useCallback(
    (id: string) => {
      setActiveViewId(id);
      const view = savedViews.find((v) => v.id === id);
      if (!view) return;
      setFilterModel(view.state.filterModel);
      setSortModel(view.state.sortModel);
    },
    [savedViews],
  );

  /** Reseta pra Default — limpa tudo (filtros/sort). */
  const handleApplyDefault = useCallback(() => {
    setActiveViewId(null);
    setFilterModel({ items: [], logicOperator: "AND" });
    setSortModel([]);
  }, []);

  /** Salvar visão atual — captura state corrente + adiciona ao storage. */
  const handleSaveView = useCallback(
    (data: AddViewModalSubmit) => {
      const newView: SavedView = {
        id: `view_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: data.name,
        owner: "me",
        state: {
          filterModel,
          sortModel,
        },
      };
      setSavedViews((prev) => [...prev, newView]);
      setActiveViewId(newView.id);
    },
    [filterModel, sortModel],
  );

  /** Excluir view permanentemente (chamado após confirmação no AlertModal). */
  const handleDeleteView = useCallback(
    (id: string) => {
      setSavedViews((prev) => prev.filter((v) => v.id !== id));
      if (activeViewId === id) handleApplyDefault();
    },
    [activeViewId, handleApplyDefault],
  );

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

      {/* Toolbar custom + chips de filtros — agrupados num wrapper com gap
       *  menor (16px) pra evitar o gap-gp-4xl (24px) padrão do AppShell bodyInner
       *  entre toolbar e divider/chips. */}
      <div className="flex flex-col gap-gp-2xl">
      <FinanceCustomToolbar
        views={savedViews}
        activeViewId={activeViewId}
        onApplyView={handleApplyView}
        onApplyDefault={handleApplyDefault}
        onSaveView={handleSaveView}
        onDeleteView={handleDeleteView}
        searchValue={search}
        onSearchChange={setSearch}
        onOpenSimpleFilter={() => setSimpleFilterOpen(true)}
        filterActiveCount={filterModel.items.length}
        filterColumns={columns
          .filter((c) => c.enableColumnFilter !== false && c.field !== "_actions")
          .map((c) => {
            const allowed: "text" | "number" | "select" =
              c.filterType === "select"
                ? "select"
                : c.filterType === "number"
                  ? "number"
                  : "text";
            return {
              key: String(c.field),
              label: c.headerName || String(c.field),
              type: allowed,
              options: c.filterOptions?.map((o) => ({
                value: String(o.value),
                label: o.label,
              })),
            };
          })}
        // Mapping op ↔ operator: FilterPopover usa nomes curtos (eq, neq,
        // gt, lt, between) e filterModel usa longos (equals, neq, gt, ...).
        // Sem isso, filtros adicionados via dropdown não filtram a tabela.
        filters={filterModel.items.map((it) => ({
          id: it.id,
          columnKey: it.field,
          op: FILTER_OP_TO_POPOVER_OP[it.operator] ?? it.operator,
          value: it.value,
        }))}
        onFiltersChange={(next) => {
          setFilterModel({
            items: next.map((f) => ({
              id: f.id,
              field: f.columnKey,
              operator:
                (POPOVER_OP_TO_FILTER_OP[f.op] ?? f.op) as never,
              value: f.value as never,
            })),
            logicOperator: filterModel.logicOperator,
          });
        }}
        sortColumns={columns
          .filter((c) => c.sortable !== false && c.field !== "_actions")
          .map((c) => ({
            key: String(c.field),
            label: c.headerName || String(c.field),
          }))}
        sortBy={sortModel.map((s) => ({ key: s.field, dir: s.direction }))}
        onSortByChange={(next) =>
          setSortModel(
            next.map((s) => ({ field: s.key, direction: s.dir as "asc" | "desc" })),
          )
        }
        colColumns={(() => {
          // Aplica `columnOrder` (state local) sobre as columns. Campos novos
          // não listados aparecem no final preservando ordem do array original.
          const base = columns.filter((c) => c.field !== "_actions");
          const byField = new Map(base.map((c) => [String(c.field), c]));
          const orderedFields = [
            ...columnOrder.filter((f) => byField.has(f)),
            ...base
              .map((c) => String(c.field))
              .filter((f) => !columnOrder.includes(f)),
          ];
          return orderedFields.map((f) => {
            const c = byField.get(f)!;
            return {
              key: String(c.field),
              label: c.headerName || String(c.field),
            };
          });
        })()}
        visibleCols={
          new Set(
            columns
              .filter(
                (c) => c.field !== "_actions" && !hiddenColumns.has(String(c.field)),
              )
              .map((c) => String(c.field)),
          )
        }
        onVisibleChange={(next) => {
          const allFields = columns
            .filter((c) => c.field !== "_actions")
            .map((c) => String(c.field));
          setHiddenColumns(new Set(allFields.filter((f) => !next.has(f))));
        }}
        pinnedCols={pinnedColumns}
        onPinnedChange={setPinnedColumns}
        onColsReorder={(next) => {
          // Aplica a nova ordem no state local + propaga pro DataTable via ref
          // (única forma de controlar columnOrder externamente — useFica internal).
          const fields = next.map((c) => c.key);
          setColumnOrder(fields);
          tableRef.current?.setColumnOrder(fields);
        }}
        density={density}
        onDensityChange={setDensity}
        advancedOpenSignal={advancedOpenSignal}
      />

      {/* Chips de filtros aplicados — antes ficavam dentro do toolbarWrap
       *  interno do DataTable, mas como escondemos esse wrapper, precisamos
       *  renderizar ToolbarApplied explicitamente aqui. */}
      <ToolbarApplied
        filters={filterModel.items
          .filter((it) => {
            const col = columns.find((c) => String(c.field) === it.field);
            if (!col) return false;
            // Pula entries sem valor (popover gera rows vazias em edição)
            const v = it.value;
            if (it.operator === "isEmpty" || it.operator === "isNotEmpty")
              return true;
            if (v == null) return false;
            if (typeof v === "string") return v.length > 0;
            if (Array.isArray(v)) return v.some((x) => x != null && x !== "");
            return true;
          })
          .map<AppliedFilter>((it) => {
            const col = columns.find((c) => String(c.field) === it.field);
            const opId =
              FILTER_OP_TO_POPOVER_OP[it.operator] ?? String(it.operator);
            // Formata value pra display:
            //   - array (isAnyOf/isNoneOf):
            //       N <= 2  → array de labels (ToolbarApplied renderiza N badges no MESMO chip)
            //       N >= 3  → string única "N selecionados" (alinhado com master DataTable)
            //   - single → label da option (se houver) ou string raw
            let displayValue: AppliedFilter["value"];
            if (Array.isArray(it.value)) {
              const arr = it.value as unknown[];
              if (arr.length >= 3) {
                displayValue = `${arr.length} selecionados`;
              } else {
                displayValue = arr.map((v) => {
                  if (col?.filterOptions) {
                    const opt = col.filterOptions.find(
                      (o) => String(o.value) === String(v),
                    );
                    if (opt) return opt.label;
                  }
                  return String(v ?? "");
                });
              }
            } else {
              displayValue = String(it.value ?? "");
              if (col?.filterOptions && it.value != null) {
                const opt = col.filterOptions.find(
                  (o) => String(o.value) === String(it.value),
                );
                if (opt) displayValue = opt.label;
              }
            }
            return {
              id: it.id,
              columnLabel: col?.headerName ?? it.field,
              op: opId as never,
              value: displayValue,
            };
          })}
        onRemove={(id) =>
          setFilterModel({
            ...filterModel,
            items: filterModel.items.filter((it) => it.id !== id),
          })
        }
        onClearAll={() =>
          setFilterModel({ items: [], logicOperator: filterModel.logicOperator })
        }
        // separator={false} + className custom — o parent flex já dá 16px de
        // gap acima (gap-gp-2xl), então NÃO precisa de mt-pad-2xl do separator
        // default (que somaria + 16px = 32px acima do divider). Apenas border-t
        // + pt-pad-2xl (16px abaixo do divider antes dos chips).
        separator={false}
        className="border-t border-border-default pt-pad-2xl"
        // Renderiza chip wrappado em Popover — click abre dropdown com
        // checkbox list (se select com options) ou redireciona pro Avançado
        // (texto/number).
        renderChip={(filter, defaultChip) => {
          const col = columns.find(
            (c) => (c.headerName ?? String(c.field)) === filter.columnLabel,
          );
          const field = col ? String(col.field) : null;
          const hasSelectOptions =
            col?.filterType === "select" && (col?.filterOptions?.length ?? 0) > 0;

          // Sem options (text/number/date) → click abre Avançado
          if (!hasSelectOptions || !field) {
            return (
              <button
                type="button"
                onClick={() => setAdvancedOpenSignal((s) => s + 1)}
                className="bg-transparent border-0 p-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring-brand rounded-radius-md"
                aria-label="Editar filtro"
              >
                {defaultChip}
              </button>
            );
          }

          // Agrega valores de todos os filterModel items com mesmo field
          // (agrupamento simples — multi-select editor).
          const groupItems = filterModel.items.filter((it) => it.field === field);
          const selectedValues = new Set(
            groupItems.flatMap((it) =>
              Array.isArray(it.value)
                ? (it.value as unknown[]).map(String)
                : it.value != null
                  ? [String(it.value)]
                  : [],
            ),
          );

          const toggleValue = (val: string) => {
            const next = new Set(selectedValues);
            if (next.has(val)) next.delete(val);
            else next.add(val);

            // Consolida em UM ÚNICO FilterItem por field com operator
            // "isAnyOf" + value: array. ToolbarApplied renderiza ARRAY como
            // múltiplos badges no MESMO chip (igual ao comportamento da
            // branch master). Quando vazio, remove o item.
            const others = filterModel.items.filter((it) => it.field !== field);
            const arr = Array.from(next);
            const newItems =
              arr.length === 0
                ? []
                : [
                    {
                      // ID estável por field — mantém Popover state consistente
                      // entre re-renders e edições incrementais.
                      id: `${field}_isAnyOf`,
                      field,
                      operator: "isAnyOf" as const,
                      value: arr as never,
                    },
                  ];
            setFilterModel({
              ...filterModel,
              items: [...others, ...newItems],
            });
          };

          return (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring-brand rounded-radius-md"
                  aria-label="Editar filtro"
                >
                  {defaultChip}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-pad-2xs min-w-[220px]">
                <div className="flex flex-col gap-gp-3xs">
                  {col!.filterOptions!.map((opt) => {
                    const valStr = String(opt.value);
                    const isChecked = selectedValues.has(valStr);
                    return (
                      <label
                        key={valStr}
                        className="flex items-center gap-gp-md w-full px-pad-md py-pad-sm rounded-radius-md text-body-sm text-fg-default cursor-pointer hover:bg-bg-muted focus-within:bg-bg-muted transition-colors duration-100"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleValue(valStr)}
                          aria-label={opt.label}
                          className="shrink-0"
                        />
                        <span className="flex-1 min-w-0 truncate">
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      </div>

      {/* Filtros simples — drawer panel lateral. Lista vertical de todos os
       *  filtros com aplicação LIVE.
       *
       *  Promoção `select` → `multiSelect`: quando a coluna tem filterType=select
       *  + filterOptions, no drawer renderizamos multi-select (igual ao chip
       *  e ao filtro avançado). Sem isso, Status/Conta bancária ficavam como
       *  single Select — inconsistente com o resto da UI multi-value. */}
      <ToolbarSimpleFilterDrawer
        open={simpleFilterOpen}
        onOpenChange={setSimpleFilterOpen}
        columns={columns
          .filter((c) => c.enableColumnFilter !== false && c.field !== "_actions")
          .map((c) => {
            const hasOptions = (c.filterOptions?.length ?? 0) > 0;
            // Promove select com options → multiSelect (renderiza checkbox list)
            const effectiveFilterType =
              c.filterType === "select" && hasOptions ? "multiSelect" : c.filterType;
            const allowed: "text" | "number" | "select" =
              c.filterType === "select"
                ? "select"
                : c.filterType === "number"
                  ? "number"
                  : "text";
            return {
              key: String(c.field),
              label: c.headerName || String(c.field),
              type: allowed,
              filterType: effectiveFilterType,
              options: c.filterOptions?.map((o) => ({
                value: String(o.value),
                label: o.label,
              })),
            };
          })}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
      />

      {/* Header filter popover — ancorado ao botão "Filtrar X" do header da
       *  coluna. Conteúdo: checkbox list pra colunas tipo select com options
       *  (toggle adiciona/remove valores no MESMO chip via isAnyOf array).
       *  Aplicação LIVE — chip aparece/atualiza enquanto user marca os itens.
       *
       *  Usa virtual anchor (div fixed posicionada no rect capturado) +
       *  PopoverAnchor pra que o Radix posicione o conteúdo abaixo. */}
      {headerFilter && (
        <HeaderFilterPopover
          rect={headerFilter.rect}
          field={headerFilter.field}
          columns={columns}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          onClose={() => setHeaderFilter(null)}
        />
      )}

      {/* DataTable — toolbar INTERNA escondida via [&>div:first-child]:hidden.
       *  Tudo controlado externamente pela FinanceCustomToolbar acima. */}
      <DataTable<FinanceClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        // Controlled state
        search={search}
        onSearchChange={setSearch}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        density={density}
        onDensityChange={setDensity}
        paginationConfig={{
          enabled: true,
          initialPageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        selectionConfig={{ enabled: true, enableGlobal: true }}
        // Toolbar interna escondida — `[&>div:first-child]:hidden` esconde o
        // primeiro div filho do root (toolbarWrap). Footer pt zerado idem
        // ao anterior.
        className="flex-1 min-h-0 [&>div:first-child]:hidden [&_footer]:!pt-0"
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

/* ── HeaderFilterPopover ──────────────────────────────────────────────
 * Popover ancorado a um retângulo absoluto (botão "Filtrar X" do header).
 *
 * Uso de PopoverAnchor + virtual rect: criamos um div fixed posicionado nos
 * coords do rect capturado. Esse div é o "anchor" do Radix — o conteúdo
 * abre logo abaixo sem precisar de DOM hierarchy.
 *
 * Comportamento:
 *  - Coluna tipo select com options → checkbox list (multi via isAnyOf)
 *  - Coluna tipo text/number → input simples (operator contains/equals)
 *  - Aplicação LIVE: toggle/digitação atualiza filterModel imediatamente,
 *    chip aparece/atualiza embaixo da toolbar enquanto user interage
 *  - Multi-select: SEMPRE 1 FilterItem único com operator isAnyOf + value
 *    array (não cria N items separados — bug que aconteceu antes).
 */
function HeaderFilterPopover({
  rect,
  field,
  columns,
  filterModel,
  onFilterModelChange,
  onClose,
}: {
  rect: DOMRect;
  field: string;
  columns: DataTableColumnDef<FinanceClientRow>[];
  filterModel: FilterModel;
  onFilterModelChange: (m: FilterModel) => void;
  onClose: () => void;
}) {
  const col = columns.find((c) => String(c.field) === field);
  if (!col) return null;
  const hasSelectOptions =
    col.filterType === "select" && (col.filterOptions?.length ?? 0) > 0;

  // Agrega valores selecionados de TODOS os items com mesmo field
  // (isAnyOf array OR múltiplos equals legados — flat).
  const groupItems = filterModel.items.filter((it) => it.field === field);
  const selectedValues = new Set(
    groupItems.flatMap((it) =>
      Array.isArray(it.value)
        ? (it.value as unknown[]).map(String)
        : it.value != null
          ? [String(it.value)]
          : [],
    ),
  );

  /** Toggle UM valor multi-select. Consolida em UM ÚNICO FilterItem com
   *  operator isAnyOf + value array. Quando vazio, remove o item. */
  const toggleValue = (val: string) => {
    const next = new Set(selectedValues);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    const others = filterModel.items.filter((it) => it.field !== field);
    const arr = Array.from(next);
    const newItems =
      arr.length === 0
        ? []
        : [
            {
              id: `${field}_isAnyOf`,
              field,
              operator: "isAnyOf" as const,
              value: arr as never,
            },
          ];
    onFilterModelChange({ ...filterModel, items: [...others, ...newItems] });
  };

  /** Single value (text/number) — operator contains pra text, equals pra
   *  number. Substitui qualquer item existente do field. */
  const setSingleValue = (val: string) => {
    const others = filterModel.items.filter((it) => it.field !== field);
    if (val === "") {
      onFilterModelChange({ ...filterModel, items: others });
      return;
    }
    const op =
      col.filterType === "number" ? ("equals" as const) : ("contains" as const);
    onFilterModelChange({
      ...filterModel,
      items: [
        ...others,
        {
          id: `${field}_${op}`,
          field,
          operator: op,
          value: val as never,
        },
      ],
    });
  };

  const currentSingleValue = (() => {
    if (hasSelectOptions) return "";
    const first = groupItems[0];
    if (!first) return "";
    return typeof first.value === "string" ? first.value : String(first.value ?? "");
  })();

  return (
    <Popover open onOpenChange={(o) => !o && onClose()}>
      <PopoverAnchor asChild>
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            pointerEvents: "none",
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="p-pad-2xs min-w-[220px]"
      >
        {hasSelectOptions ? (
          <div className="flex flex-col gap-gp-3xs">
            {col.filterOptions!.map((opt) => {
              const valStr = String(opt.value);
              const isChecked = selectedValues.has(valStr);
              return (
                <label
                  key={valStr}
                  className="flex items-center gap-gp-md w-full px-pad-md py-pad-sm rounded-radius-md text-body-sm text-fg-default cursor-pointer hover:bg-bg-muted focus-within:bg-bg-muted transition-colors duration-100"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleValue(valStr)}
                    aria-label={opt.label}
                    className="shrink-0"
                  />
                  <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-gp-xs p-pad-xs">
            <input
              type={col.filterType === "number" ? "number" : "text"}
              autoFocus
              value={currentSingleValue}
              onChange={(e) => setSingleValue(e.target.value)}
              placeholder={`Filtrar ${col.headerName ?? field}…`}
              className="min-h-form-md h-form-md w-full px-pad-xl rounded-radius-md text-body-sm bg-bg-input dark:bg-bg-muted border border-border-input text-fg-default placeholder:text-fg-muted outline-none focus:border-border-brand focus:shadow-sh-ring transition-[border-color,box-shadow] duration-150"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
