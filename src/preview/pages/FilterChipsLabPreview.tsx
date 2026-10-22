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
  MapPin,
  BadgeCheck,
  ListChecks,
  ChevronDown,
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
  type PaginationModel,
} from "@/components/ui/DataTable";
import { Input } from "@/components/shadcn/input";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { cn } from "@/lib/utils";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ═══════════════════════════════════════════════════════════════════
   Tipos custom (registry) — personalização que NÃO muda o DS
   ═══════════════════════════════════════════════════════════════════ */

/* Tipo custom: busca + lista própria + ação (demonstra o registry). */
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
      <div className="flex max-h-[220px] flex-col gap-gp-2xs overflow-y-auto scrollbar-thin">
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
              onClick={() => {
                onChange(id);
                onClose?.();
              }}
              className={cn(
                "flex w-full items-center justify-between gap-gp-md rounded-radius-md px-pad-md py-pad-sm text-left transition-colors duration-100 hover:bg-bg-muted",
                selecionado && "bg-bg-brand-subtle",
              )}
            >
              <AgentCell agentId={id as keyof typeof AGENTS} />
              {selecionado && (
                <CheckCircle2 className="size-icon-sm shrink-0 text-fg-brand" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const AgenteColumnType: ColumnTypeDefinition = {
  type: "agente",
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
columnTypeRegistry.register(AgenteColumnType);

/* Tipo custom: UMA data cobrindo DUAS colunas (valueGetter devolve o par). */
const DataNoPeriodoType: ColumnTypeDefinition = {
  type: "data-no-periodo",
  operators: [{ id: "equals", label: "cobre" }],
  renderFilterInput: ({ value, onChange }) => (
    <Input
      type="date"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Data dentro do período"
    />
  ),
  renderFastFilterInput: ({ value, onChange }) => (
    <div className="p-pad-md">
      <Input
        autoFocus
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Data dentro do período"
      />
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    if (operator !== "equals") return null;
    if (!Array.isArray(cellValue) || typeof filterValue !== "string") return null;
    const [inicio, fim] = cellValue as [number, number];
    const d = new Date(`${filterValue}T12:00:00`).getTime();
    return d >= inicio && d <= fim;
  },
  renderChipValue: (value) =>
    typeof value === "string" && value
      ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR")
      : "",
};
columnTypeRegistry.register(DataNoPeriodoType);

/* ═══════════════════════════════════════════════════════════════════
   Dados mock
   ═══════════════════════════════════════════════════════════════════ */

/* BU: lista grande (40) + opção FIXA "Sem BU" (item 7). */
const BUS = [
  { value: "sem-bu", label: "Sem BU", pinned: true },
  ...Array.from({ length: 40 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { value: `bu-${n}`, label: `BU ${n} — Unidade ${n}` };
  }),
];
const BU_LABEL = new Map(BUS.map((b) => [b.value, b.label]));

/* UFs — coluna OCULTA só pelo filtro (item 1). */
const UFS = ["SP", "MG", "PR", "RS", "RJ", "BA", "SC", "PE", "GO", "CE"];

/* "Servidor" fake de titulares (item 6): 500 nomes, busca + paginação. */
const TITULARES = Array.from({ length: 500 }, (_, i) => ({
  value: `tit-${i + 1}`,
  label: `Titular ${String(i + 1).padStart(3, "0")} ${["Silva", "Souza", "Lima", "Costa", "Rocha"][i % 5]}`,
}));
const TITULAR_LABEL = new Map(TITULARES.map((t) => [t.value, t.label]));
const buscarTitulares = (search: string, page: number) =>
  new Promise<{ options: typeof TITULARES; hasMore: boolean }>((resolve) => {
    setTimeout(() => {
      const filtrados = search
        ? TITULARES.filter((t) =>
            t.label.toLowerCase().includes(search.toLowerCase()),
          )
        : TITULARES;
      const PAGE = 20;
      const slice = filtrados.slice((page - 1) * PAGE, page * PAGE);
      resolve({ options: slice, hasMore: page * PAGE < filtrados.length });
    }, 400); // latência simulada
  });

type RowLab = ClientRow & {
  bu: string;
  uf: string;
  titularId: string;
  conferencia: "sim" | "nao";
};

const ROWS: RowLab[] = CLIENTS_MOCK.map((r, i) => ({
  ...r,
  bu: i % 4 === 3 ? "sem-bu" : BUS[1 + ((i * 7) % 40)].value,
  uf: UFS[i % UFS.length],
  titularId: TITULARES[i * 37].value,
  conferencia: i % 3 === 0 ? "nao" : "sim",
}));

/* ═══════════════════════════════════════════════════════════════════
   Colunas
   ═══════════════════════════════════════════════════════════════════ */

const COLUMNS: DataTableColumnDef<RowLab>[] = [
  { field: "id", headerName: "ID", width: 100, icon: Hash, type: "text" },
  {
    field: "name",
    headerName: "Nome",
    width: 200,
    icon: User,
    sortable: true,
    render: ({ row }) => <PersonCell row={row} />,
  },
  {
    field: "titularId",
    headerName: "Titular",
    width: 170,
    icon: UsersIcon,
    enableColumnFilter: true,
    filterType: "multiSelect",
    // ⭐ Item 6: opções do "servidor" — busca com debounce + Carregar mais.
    filterLoadOptions: buscarTitulares,
    filterValueLabel: (v) => TITULAR_LABEL.get(String(v)) ?? String(v),
    valueFormatter: (v) => TITULAR_LABEL.get(String(v)) ?? String(v ?? ""),
    render: ({ value }) => (
      <span className="text-fg-muted">{TITULAR_LABEL.get(String(value))}</span>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    width: 210,
    icon: AtSign,
    enableColumnFilter: true,
    filterType: "multiSelect",
    // ⭐ Item 5: nome do FILTRO difere do título da coluna.
    filterLabel: "E-mail do cliente",
  },
  {
    field: "statusId",
    headerName: "Status",
    width: 130,
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
    field: "conferencia",
    headerName: "Conferência",
    width: 130,
    icon: BadgeCheck,
    enableColumnFilter: true,
    // ⭐ Item 3: select = ESCOLHA ÚNICA no chip (fecha ao escolher).
    filterType: "select",
    filterOptions: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
    ],
    valueFormatter: (v) => (v === "sim" ? "Sim" : "Não"),
    render: ({ value }) => (
      <span className={value === "sim" ? "text-fg-success" : "text-fg-muted"}>
        {value === "sim" ? "Sim" : "Não"}
      </span>
    ),
  },
  {
    field: "agentId",
    headerName: "Atribuído",
    width: 170,
    icon: UsersIcon,
    enableColumnFilter: true,
    filterType: "agente", // tipo CUSTOM (registry)
    valueFormatter: (v) => AGENTS[v as keyof typeof AGENTS]?.name ?? String(v ?? ""),
    render: ({ value }) => <AgentCell agentId={value as keyof typeof AGENTS} />,
  },
  {
    field: "bu",
    headerName: "BU",
    width: 180,
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
    // ⭐ Item 1: coluna OCULTA que existe só pelo filtro.
    field: "uf",
    headerName: "UF",
    width: 90,
    icon: MapPin,
    hidden: true,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterLabel: "UF (Estado)",
    filterOptions: UFS.map((u) => ({ value: u, label: u })),
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
    headerName: "Data início",
    width: 115,
    icon: Calendar,
    sortable: true,
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ),
  },
  {
    field: "lastContact",
    headerName: "Data fim",
    width: 115,
    icon: Calendar,
    sortable: true,
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{formatDateShort(value as number)}</span>
    ),
  },
  {
    // Coluna VIRTUAL: 1 data filtra as DUAS colunas acima.
    field: "periodo",
    headerName: "Período",
    width: 145,
    icon: Calendar,
    hidden: true,
    enableColumnFilter: true,
    filterType: "data-no-periodo",
    valueGetter: (row) => [row.createdAt, row.lastContact],
    valueFormatter: (v) =>
      Array.isArray(v)
        ? `${formatDateShort(v[0] as number)} → ${formatDateShort(v[1] as number)}`
        : "",
  },
];

/* Filtros "por regra" no load: Status preenchido + Valor em FAIXA (item 12). */
const FILTRO_INICIAL: FilterModel = {
  items: [
    { id: "regra-status", field: "statusId", operator: "isAnyOf", value: ["active"] },
    { id: "regra-valor", field: "value", operator: "between", value: [100, 9000] },
  ],
  logicOperator: "AND",
};

const CHIPS_FIXOS: Array<string | { field: string; dismissable?: boolean }> = [
  { field: "statusId", dismissable: false },
  { field: "conferencia", dismissable: false },
  { field: "agentId", dismissable: false },
  { field: "bu", dismissable: false },
  { field: "titularId", dismissable: false },
  { field: "uf", dismissable: false },
  { field: "periodo", dismissable: false },
  "email",
];

/* ═══════════════════════════════════════════════════════════════════
   Navegador flutuante — item a item do feedback, com "como ver"
   ═══════════════════════════════════════════════════════════════════ */

type ItemNav = {
  n: number;
  titulo: string;
  tag: "novo" | "fix" | "já tinha" | "custom";
  comoVer: string;
};

const ITENS_NAV: ItemNav[] = [
  { n: 1, tag: "novo", titulo: "Filtro sem coluna visível", comoVer: "Os chips 'UF (Estado)' e 'Período' filtram colunas que nascem OCULTAS (hidden: true) — confira em Configurações → Colunas que elas estão desligadas, e os filtros seguem vivos no chip e no painel." },
  { n: 2, tag: "novo", titulo: "X do chip fixo limpa só o valor", comoVer: "Aperte o X no chip 'Status é Ativo': o valor limpa e o chip vira ⊕ placeholder — nunca sai da toolbar (dismissable: false). 'Email' é descartável, pra comparar." },
  { n: 3, tag: "fix", titulo: "Escolha única no chip (select)", comoVer: "Clique no chip 'Conferência': lista de escolha ÚNICA (Sim/Não) que fecha ao escolher — antes o select virava multiSelect com checkbox." },
  { n: 4, tag: "novo", titulo: "'Limpar todos' avisa a tela", comoVer: "Clique 'Limpar todos' nos chips: a linha de eventos abaixo da tabela registra o onFiltersClearAll — gancho pra tela zerar filtro próprio (ex.: SQL avançado)." },
  { n: 5, tag: "novo", titulo: "Nome do filtro ≠ título da coluna", comoVer: "A coluna 'Email' filtra como 'E-mail do cliente' (filterLabel) — veja no chip e no funil de Filtros." },
  { n: 6, tag: "novo", titulo: "Opções buscadas no servidor", comoVer: "Abra o chip 'Titular': 500 valores paginados num servidor simulado (400ms) — digite pra buscar com debounce, role e use 'Carregar mais'; os marcados ficam no topo com rótulo resolvido mesmo fora da página carregada." },
  { n: 7, tag: "novo", titulo: "multiSelect completo", comoVer: "Abra o chip 'BU': 'Sem BU' FIXA no topo (fora da busca e do Selecionar todos), busca a partir de 10 opções, marcados primeiro ao reabrir, altura limitada pela viewport." },
  { n: 8, tag: "novo", titulo: "Incluindo / Excluindo no chip", comoVer: "Abra 'Status' ou 'BU' e use o rodapé 'Incluindo/Excluindo os selecionados' — com Excluindo, o operador do chip fica vermelho (exceção) sem fechar o popover." },
  { n: 9, tag: "já tinha", titulo: "'Limpar' dentro do chip", comoVer: "Qualquer lista de chip tem 'Limpar' no rodapé — zera os valores mantendo o popover aberto." },
  { n: 10, tag: "fix", titulo: "Chip não fecha ao desmarcar o último", comoVer: "No chip 'BU', marque 1 valor e desmarque: o popover PERMANECE aberto (0/41); fecha só no clique-fora." },
  { n: 11, tag: "fix", titulo: "Linha vazia do painel não some", comoVer: "Configurações → Filtros avançados: adicione uma condição, deixe sem valor e troque o operador 2× — a linha permanece até você removê-la ou fechar." },
  { n: 12, tag: "novo", titulo: "Faixa numérica num chip só", comoVer: "O chip 'Valor entre 100 – 9.000' já entra aplicado: mín e máx no MESMO chip (operador between no number), vírgula aceita como decimal." },
  { n: 13, tag: "novo", titulo: "Avançado separado do funil", comoVer: "toolbar.enableAdvancedFilters desliga SÓ o builder avançado (pra tela com montador próprio). Aqui está ligado — veja em Configurações." },
  { n: 14, tag: "novo", titulo: "Campo de filtro público", comoVer: "FILTER_FIELD_CLASS e FastSingleSelectList agora saem do barrel do DataTable — tipo custom não importa mais caminho interno. (Code-level: veja o código do exemplo.)" },
  { n: 15, tag: "fix", titulo: "pageSize em modo controlado", comoVer: "A paginação desta tabela é CONTROLADA (veja a linha de eventos). Troque 'Linhas' no rodapé: o tamanho muda e volta pra página 1 — antes o 2º evento desfazia a troca." },
  { n: 16, tag: "novo", titulo: "Barra de seleção configurável", comoVer: "Marque linhas (checkbox): com bar: 'inline' a toolbar CONTINUA visível e a barra entra abaixo, com countLabel ('N clientes marcados') e 'Desmarcar tudo' custom — que também dispara onClearAll pra tela limpar seleção de outras páginas (totalSelected exibe o total cross-page quando o app passa)." },
  { n: 17, tag: "fix", titulo: "Configurações dentro da tela", comoVer: "Abra 'Configurações da tabela' com a janela baixa: o popover limita a altura pelo espaço disponível real e rola por dentro." },
  { n: 0, tag: "custom", titulo: "Registry: tipos custom do app", comoVer: "'Atribuído' (busca + lista com avatar) e 'Período' (1 data → 2 colunas) são columnTypeRegistry do APP, não do DS — é onde moram comportamentos exclusivos (colar lista, contém «texto», clique-substitui...)." },
];

const TAG_STYLE: Record<ItemNav["tag"], string> = {
  novo: "bg-bg-brand-subtle text-fg-brand",
  fix: "bg-bg-success-muted text-fg-success",
  "já tinha": "bg-bg-muted text-fg-muted",
  custom: "bg-bg-info-muted text-fg-info",
};

function NavegadorFeedback() {
  const [aberto, setAberto] = useState(true);
  const [ativo, setAtivo] = useState<number | null>(null);
  return (
    <div className="fixed bottom-[24px] right-[24px] z-40 w-[320px]">
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-bg-surface shadow-sh-lg">
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          className="flex w-full items-center justify-between gap-gp-md bg-bg-muted px-pad-xl py-pad-lg text-left"
        >
          <span className="inline-flex items-center gap-gp-md text-body-sm font-semibold text-fg-default">
            <ListChecks className="size-icon-sm text-fg-brand" aria-hidden="true" />
            Feedback Sólis — item a item
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-icon-sm text-fg-muted transition-transform",
              aberto && "rotate-180",
            )}
          />
        </button>
        {aberto && (
          <div className="flex max-h-[50vh] flex-col gap-gp-2xs overflow-y-auto scrollbar-thin p-pad-sm">
            {ITENS_NAV.map((item) => {
              const estaAtivo = ativo === item.n;
              return (
                <button
                  key={`${item.n}-${item.titulo}`}
                  type="button"
                  onClick={() => setAtivo(estaAtivo ? null : item.n)}
                  className={cn(
                    "flex flex-col gap-gp-xs rounded-radius-md px-pad-md py-pad-sm text-left transition-colors",
                    estaAtivo ? "bg-bg-brand-subtle" : "hover:bg-bg-muted",
                  )}
                >
                  <span className="flex items-center gap-gp-md">
                    <span className="text-caption-sm font-semibold tabular-nums text-fg-subtle">
                      {item.n === 0 ? "—" : String(item.n).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-body-sm font-semibold text-fg-default">
                      {item.titulo}
                    </span>
                    <span
                      className={cn(
                        "rounded-radius-full px-pad-md py-[1px] text-caption-xs font-semibold",
                        TAG_STYLE[item.tag],
                      )}
                    >
                      {item.tag}
                    </span>
                  </span>
                  {estaAtivo && (
                    <span className="text-body-xs font-normal leading-relaxed text-fg-muted">
                      {item.comoVer}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Página
   ═══════════════════════════════════════════════════════════════════ */

export default function FilterChipsLabPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [filterModel, setFilterModel] = useState<FilterModel>(FILTRO_INICIAL);
  // Paginação CONTROLADA de propósito (item 15 — era onde o defeito mordia).
  const [paginacao, setPaginacao] = useState<PaginationModel>({
    page: 1,
    pageSize: 5,
  });
  const [eventos, setEventos] = useState<string[]>([]);
  const log = (msg: string) =>
    setEventos((prev) =>
      [`${new Date().toLocaleTimeString("pt-BR")} — ${msg}`, ...prev].slice(0, 4),
    );

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Filtros: feedback Sólis item a item"
      description="Laboratório dos itens de DataTable do feedback Sólis — defeitos corrigidos (3, 10, 11, 15, 17), recursos novos (1, 2, 4, 5, 6, 7, 8, 12, 13, 14) e o que fica no app via registry (tipos custom). O navegador flutuante no canto lista cada item com o passo de verificação."
      code={CODE}
    >
      {/* w-full + min-w-0: o preview do ExamplePageLayout é flex row — sem
          largura explícita o wrapper encolhe pro fit-content e a tabela fica
          mais estreita que a página. */}
      <div className="flex w-full min-w-0 flex-col gap-gp-md">
        <DataTable<RowLab>
          rows={ROWS}
          columns={columns}
          getRowId={(r) => r.id}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          onFiltersClearAll={() => log("onFiltersClearAll — a tela limpa o filtro próprio dela")}
          showEmptyFilterChips={CHIPS_FIXOS}
          paginationModel={paginacao}
          onPaginationModelChange={(m) => {
            setPaginacao(m);
            log(`paginação → página ${m.page}, ${m.pageSize} por página`);
          }}
          toolbar={{
            title: "Clientes",
            enableSearch: true,
            enableFilters: true,
            enableAdvancedFilters: true,
            enableColumns: true,
            enableDensity: true,
          }}
          paginationConfig={{
            enabled: true,
            initialPageSize: 5,
            pageSizeOptions: [5, 10, 25],
          }}
          selectionConfig={{
            enabled: true,
            // ⭐ Item 16: "inline" — a toolbar (busca/filtros) CONTINUA visível
            // com linhas marcadas; a barra entra numa linha abaixo. countLabel
            // e clearLabel customizam os textos; onClearAll avisa a tela
            // (seleção que persiste entre páginas mora no app — totalSelected
            // exibe o total dela quando presente).
            bar: "inline",
            countLabel: (n) => `${n} cliente${n > 1 ? "s" : ""} marcado${n > 1 ? "s" : ""}`,
            clearLabel: "Desmarcar tudo",
            onClearAll: () => log("onClearAll da seleção — a tela limpa as outras páginas"),
            actions: (ids) => (
              <BulkActionButton onClick={() => log(`ação em lote: ${ids.length} id(s)`)}>
                Exportar seleção
              </BulkActionButton>
            ),
          }}
          className="max-h-full"
        />
        {/* Linha de eventos — prova visível dos callbacks (itens 4 e 15). */}
        <div className="rounded-radius-md bg-bg-muted px-pad-xl py-pad-lg">
          <p className="text-caption-sm font-semibold text-fg-muted">
            Eventos da tela (onFiltersClearAll · onPaginationModelChange)
          </p>
          {eventos.length === 0 ? (
            <p className="text-body-xs font-normal text-fg-subtle">
              Nenhum evento ainda — troque o tamanho da página ou clique "Limpar todos".
            </p>
          ) : (
            eventos.map((e) => (
              <p key={e} className="text-body-xs font-normal tabular-nums text-fg-default">
                {e}
              </p>
            ))
          )}
        </div>
      </div>
      <NavegadorFeedback />
    </ExamplePageLayout>
  );
}

const CODE = `/* Laboratório do feedback Sólis — o que cada parte demonstra:

CHIPS FIXOS (item 2): showEmptyFilterChips={[{ field, dismissable: false }, ...]}
  → X limpa o valor, chip vira ⊕ e nunca sai. String simples = descartável.

FILTRO SEM COLUNA VISÍVEL (item 1): coluna com hidden: true + enableColumnFilter
  → filtra normalmente (chips, funil, avançado) sem aparecer na grade.
  { field: "uf", headerName: "UF", hidden: true, enableColumnFilter: true,
    filterType: "multiSelect", filterLabel: "UF (Estado)" }

NOME DO FILTRO (item 5): filterLabel: "E-mail do cliente" na coluna Email.

SELECT = ESCOLHA ÚNICA (item 3, fix): filterType: "select" abre lista single
  no chip e fecha ao escolher — não vira mais multiSelect.

OPÇÕES DO SERVIDOR (item 6): filterLoadOptions + filterValueLabel na coluna:
  filterLoadOptions: (search, page) =>
    api.buscarTitulares(search, page), // → { options, hasMore }
  filterValueLabel: (v) => cacheDeLabels.get(v) ?? String(v),

MULTISELECT COMPLETO (itens 7/8/9/10): busca (≥10 opções), opção pinned
  fixa no topo ({ value: "sem-bu", label: "Sem BU", pinned: true }),
  marcados primeiro, altura pela viewport, Selecionar todos/visíveis,
  Limpar, Incluindo/Excluindo (isNoneOf pinta o chip de danger) e o
  popover NÃO fecha ao desmarcar o último valor.

FAIXA NUM CHIP SÓ (item 12): operador between no number —
  { id: "regra-valor", field: "value", operator: "between", value: [100, 9000] }

CALLBACKS (itens 4/15): onFiltersClearAll avisa a tela no "Limpar todos";
  paginação controlada (paginationModel/onPaginationModelChange) com a troca
  de pageSize num evento só { page: 1, pageSize }.

AVANÇADO SEPARADO (item 13): toolbar.enableAdvancedFilters: false desliga só
  o builder (tela com montador SQL próprio); default segue enableFilters.

EXPORTS (item 14): import { FILTER_FIELD_CLASS, FastSingleSelectList,
  columnTypeRegistry } from "@/components/ui/DataTable";

O QUE FICA NO APP (registry, não muda o DS): tipos custom como "agente"
  (busca + lista com avatar + seleção que fecha) e "data-no-periodo"
  (1 data cobrindo 2 colunas via valueGetter de par) — mesmo mecanismo
  pra "colar lista", "contém «texto»", clique-substitui etc. */`;
