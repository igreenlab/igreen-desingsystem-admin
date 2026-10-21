import { useMemo, useState } from "react";
import {
  Hash,
  User,
  AtSign,
  CheckCircle2,
  Tag,
  Users as UsersIcon,
  DollarSign,
  Calendar,
  Search,
} from "lucide-react";
import {
  CLIENTS_MOCK,
  STATUSES,
  AGENTS,
  formatCurrency,
  formatDateShort,
  PersonCell,
  AgentCell,
  StatusDot,
  type ClientRow,
} from "./TableDoc";
import {
  DataTable,
  columnTypeRegistry,
  type ColumnTypeDefinition,
  type DataTableColumnDef,
  type FilterModel,
} from "@/components/ui/DataTable";
import { Input } from "@/components/shadcn/input";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Tipo de coluna CUSTOM: "agente" (registry) ──────────────────
 *
 * Demonstra o ponto de extensão da pergunta 2: um filtro com BUSCA, lista
 * própria (avatar + nome) e ação diferenciada ("Limpar") — tudo definido
 * pelo consumidor via `columnTypeRegistry.register()`, sem tocar no núcleo.
 *
 * ⚠️ Limite medido no núcleo (data-table.tsx, `useMulti`): o popover do CHIP
 * promove pro widget multiSelect BUILT-IN quando o operador é isAnyOf/isNoneOf
 * ou o valor agregado tem 2+ itens. Ou seja: widget custom no chip funciona
 * pra filtro de VALOR ÚNICO (equals/neq/contains/gt...); um multi-picker
 * custom exigiria mudança no DS (a promoção teria que preferir o filterType
 * registrado antes de forçar "multiSelect").
 */
function AgentePickerList({
  value,
  onChange,
  onClose,
}: {
  value: unknown;
  onChange: (v: string | null) => void;
  onClose?: () => void;
}) {
  const [busca, setBusca] = useState("");
  const entries = Object.entries(AGENTS).filter(([, a]) =>
    a.name.toLowerCase().includes(busca.toLowerCase()),
  );
  return (
    <div className="flex w-[260px] flex-col gap-gp-xs p-pad-md">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-pad-md top-1/2 size-icon-sm -translate-y-1/2 text-fg-subtle"
        />
        <Input
          autoFocus
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar agente..."
          className="pl-[32px]"
        />
      </div>
      <div className="flex max-h-[220px] flex-col gap-gp-2xs overflow-y-auto">
        {entries.length === 0 && (
          <p className="px-pad-md py-pad-sm text-body-xs font-normal text-fg-muted">
            Nenhum agente encontrado
          </p>
        )}
        {entries.map(([id]) => {
          const selecionado = String(value ?? "") === id;
          return (
            <button
              key={id}
              type="button"
              // ⚠️ NÃO chamar onClose() aqui: onChange+onClose no MESMO clique
              // disparam dois setFilterModel a partir do mesmo estado stale e o
              // cleanup do closeChip (remove itens vazios) apaga o valor recém
              // escolhido — o chip volta a placeholder. Fechar no clique-fora
              // (dismiss do Radix) roda num tick posterior, com estado fresco.
              // O mesmo vale pros built-ins single-select em chip placeholder.
              onClick={() => onChange(id)}
              className={`flex w-full items-center justify-between gap-gp-md rounded-radius-md px-pad-md py-pad-sm text-left transition-colors duration-100 hover:bg-bg-muted ${
                selecionado ? "bg-bg-brand-subtle" : ""
              }`}
            >
              <AgentCell agentId={id as keyof typeof AGENTS} />
              {selecionado && (
                <CheckCircle2 className="size-icon-sm shrink-0 text-fg-brand" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle pt-pad-sm">
        <button
          type="button"
          onClick={() => {
            onChange(null);
            onClose?.();
          }}
          className="rounded-radius-sm px-pad-md py-pad-xs text-body-xs font-semibold text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg-default"
        >
          Limpar
        </button>
        <span className="text-caption-xs text-fg-subtle">
          {entries.length} agente{entries.length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

const AgenteColumnType: ColumnTypeDefinition = {
  type: "agente",
  // 1º operador = default do tipo (defaultOperatorForFilterType lê operators[0]).
  operators: [
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
  ],
  renderFilterInput: ({ value, onChange }) => (
    <AgentePickerList value={value} onChange={onChange} />
  ),
  renderFastFilterInput: ({ value, onChange, onClose }) => (
    <AgentePickerList value={value} onChange={onChange} onClose={onClose} />
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    if (operator === "equals") return String(cellValue) === String(filterValue);
    if (operator === "neq") return String(cellValue) !== String(filterValue);
    return null;
  },
  renderChipValue: (value) => {
    const a = AGENTS[String(value) as keyof typeof AGENTS];
    return a ? a.name : String(value ?? "");
  },
};

// Registro uma vez, a nível de módulo (o registry avisa — e tolera — re-registro
// em hot reload de dev).
columnTypeRegistry.register(AgenteColumnType);

/* ── BU: lista GRANDE (40 valores) pro multiSelect built-in ──────────
 * Exercita o que o chip multi-valor ganhou: busca (lista ≥ 10 opções),
 * "Selecionar todos/visíveis", "Limpar" e contador N/M. */
const BUS = Array.from({ length: 40 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { value: `bu-${n}`, label: `BU ${n} — Unidade ${n}` };
});

type RowComBu = ClientRow & { bu: string };

const ROWS: RowComBu[] = CLIENTS_MOCK.map((r, i) => ({
  ...r,
  bu: BUS[(i * 7) % BUS.length].value,
}));

const BU_LABEL = new Map(BUS.map((b) => [b.value, b.label]));

/* ── Colunas ─────────────────────────────────────────────────────── */

const COLUMNS: DataTableColumnDef<RowComBu>[] = [
  { field: "id", headerName: "ID", width: 110, icon: Hash, type: "text" },
  {
    field: "name",
    headerName: "Nome",
    width: 220,
    icon: User,
    sortable: true,
    render: ({ row }) => <PersonCell row={row} />,
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
    icon: AtSign,
    enableColumnFilter: true,
    filterType: "text",
  },
  {
    field: "statusId",
    headerName: "Status",
    width: 140,
    icon: CheckCircle2,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(STATUSES).map(([v, m]) => ({
      value: v,
      label: m.label,
    })),
    valueFormatter: (v) => STATUSES[v as keyof typeof STATUSES]?.label ?? String(v ?? ""),
    render: ({ value }) => <StatusDot statusId={value as keyof typeof STATUSES} />,
  },
  {
    field: "agentId",
    headerName: "Atribuído",
    width: 180,
    icon: UsersIcon,
    enableColumnFilter: true,
    // ⭐ filterType CUSTOM — resolve o widget no registry (busca + lista + ações).
    filterType: "agente",
    valueFormatter: (v) => AGENTS[v as keyof typeof AGENTS]?.name ?? String(v ?? ""),
    render: ({ value }) => <AgentCell agentId={value as keyof typeof AGENTS} />,
  },
  {
    field: "bu",
    headerName: "BU",
    width: 190,
    icon: Tag,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: BUS,
    valueFormatter: (v) => BU_LABEL.get(String(v)) ?? String(v ?? ""),
    render: ({ value }) => (
      <span className="text-fg-muted">{BU_LABEL.get(String(value))}</span>
    ),
  },
  {
    field: "value",
    headerName: "Valor",
    width: 130,
    icon: DollarSign,
    align: "right",
    sortable: true,
    enableColumnFilter: true,
    filterType: "number",
    valueFormatter: (v) => (typeof v === "number" ? formatCurrency(v) : ""),
    render: ({ value }) => (
      <span className="font-semibold tabular-nums">{formatCurrency(value as number)}</span>
    ),
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    width: 130,
    icon: Calendar,
    sortable: true,
    enableColumnFilter: true,
    filterType: "date",
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ),
  },
];

/* ── Filtro pré-aplicado "por regra" (pergunta 1) ────────────────
 * Entra na tela já com Status = Ativo no filterModel. O field está listado
 * em showEmptyFilterChips, então o X no chip LIMPA o valor mas o chip volta
 * como placeholder vazio — não some da toolbar. */
const FILTRO_INICIAL: FilterModel = {
  items: [{ id: "regra-status", field: "statusId", operator: "isAnyOf", value: ["active"] }],
  logicOperator: "AND",
};

// dismissable: false → chip FIXO: o placeholder vazio nem renderiza o X,
// então ele NUNCA sai da toolbar. O X do chip preenchido continua (limpa o
// valor e o chip volta a placeholder). "email" fica descartável de propósito,
// pra comparar os dois comportamentos lado a lado.
const CHIPS_FIXOS: Array<string | { field: string; dismissable?: boolean }> = [
  { field: "statusId", dismissable: false },
  { field: "agentId", dismissable: false },
  { field: "bu", dismissable: false },
  "email",
];

export default function FilterChipsLabPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [filterModel, setFilterModel] = useState<FilterModel>(FILTRO_INICIAL);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Filtros: chips persistentes + tipo custom"
      description="Demo das duas capacidades avaliadas. (1) Chips FIXOS: Status e Atribuído entram como { field, dismissable: false } em showEmptyFilterChips — o X do chip preenchido limpa o valor, mas o chip volta como placeholder SEM X: nunca sai da toolbar. Email está na lista como string simples (descartável) pra comparar: o placeholder dele tem X e some ao clicar. A tela entra com Status = Ativo pré-aplicado por regra (filterModel inicial). (2) Tipo de filtro custom via columnTypeRegistry: a coluna Atribuído usa filterType 'agente' — o popover do chip tem busca, lista própria com avatar e ação Limpar, tudo definido fora do núcleo. Limite do núcleo: chip com operador isAnyOf/isNoneOf ou 2+ valores promove pro widget multiSelect built-in — widget custom no chip é pra filtro de valor único."
      code={CODE}
    >
      <DataTable<RowComBu>
        rows={ROWS}
        columns={columns}
        getRowId={(r) => r.id}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        showEmptyFilterChips={CHIPS_FIXOS}
        toolbar={{
          title: "Clientes",
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
        }}
        paginationConfig={{ enabled: true, initialPageSize: 10 }}
        className="max-h-full"
      />
    </ExamplePageLayout>
  );
}

const CODE = `import {
  DataTable,
  columnTypeRegistry,
  type ColumnTypeDefinition,
  type FilterModel,
} from "@/components/ui/DataTable";

/* 1) CHIPS FIXOS — filtro por regra que limpa sem NUNCA sumir
 *    - filterModel inicial carrega o filtro da regra (Status = Ativo)
 *    - { field, dismissable: false } → chip fixo:
 *      X num chip preenchido → limpa o valor, chip vira placeholder vazio
 *      placeholder vazio     → NÃO tem X: nunca sai da toolbar
 *    - string simples ("email") → placeholder descartável (comportamento default) */
const FILTRO_INICIAL: FilterModel = {
  items: [{ id: "regra-status", field: "statusId", operator: "isAnyOf", value: ["active"] }],
  logicOperator: "AND",
};

<DataTable
  filterModel={filterModel}
  onFilterModelChange={setFilterModel}
  showEmptyFilterChips={[
    { field: "statusId", dismissable: false },
    { field: "agentId", dismissable: false },
    "email",
  ]}
  // ...
/>

/* 2) FILTRO CUSTOM — busca + lista própria + ações, via registry
 *    O popover do chip e o builder avançado renderizam o que o tipo definir. */
const AgenteColumnType: ColumnTypeDefinition = {
  type: "agente",
  operators: [{ id: "equals", label: "é" }, { id: "neq", label: "não é" }],
  renderFastFilterInput: ({ value, onChange, onClose }) => (
    <MinhaListaComBusca value={value} onChange={onChange} onClose={onClose} />
  ),
  renderFilterInput: ({ value, onChange }) => (
    <MinhaListaComBusca value={value} onChange={onChange} />
  ),
  matchesFilter: (cell, filtro, op) =>
    op === "equals" ? String(cell) === String(filtro)
    : op === "neq"  ? String(cell) !== String(filtro)
    : null,
  renderChipValue: (v) => NOMES[String(v)] ?? String(v ?? ""),
};
columnTypeRegistry.register(AgenteColumnType);

// Na coluna: filterType custom resolve o widget no registry
{ field: "agentId", headerName: "Atribuído", enableColumnFilter: true, filterType: "agente" }

// ⚠️ Limite atual do núcleo: chip com isAnyOf/isNoneOf ou 2+ valores usa o
//    widget multiSelect BUILT-IN (promoção interna) — custom no chip é pra
//    filtro de valor único. Multi-picker custom = mudança no DS.`;
