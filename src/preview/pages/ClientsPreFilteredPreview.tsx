import { useMemo, useRef, useState } from "react";
import {
  Hash,
  User,
  AtSign,
  Phone,
  CheckCircle2,
  Tag,
  Users as UsersIcon,
  DollarSign,
  Calendar,
  Type,
  Download,
  Trash2,
} from "lucide-react";
import {
  CLIENTS_MOCK,
  STATUSES,
  CATEGORIES,
  AGENTS,
  formatCurrency,
  formatDateShort,
  PersonCell,
  AgentCell,
  StatusDot,
  CategoryChip,
  type ClientRow,
} from "./TableDoc";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTablePresetView,
  presetView,
  type DataTableRef,
  type FilterModel,
} from "@/components/ui/DataTable";
import { BulkActionButton } from "@/components/ui/TableToolbar";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Dataset 5x: 50 clientes com IDs únicos ────────────────────── */

const CLIENTS_50: ClientRow[] = Array.from({ length: 5 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${3500 + batch * 10 + i}`,
  })),
).flat();

/* ── Columns no formato DataTableColumnDef ──────────────────────
 * Mesmas colunas do CRUD — comportamento de filtro herdado das definições
 * (enableColumnFilter + filterType + filterOptions). A diferença desta
 * página está apenas no `filterModel` controlado abaixo, que pré-ativa
 * 3 filtros no carregamento. */

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 120,
    icon: Hash,
    type: "text",
    aggregate: (rows) => (
      <span className="text-fg-muted">{rows.length} registros</span>
    ),
  },
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
    width: 240,
    icon: AtSign,
    enableColumnFilter: true,
    filterType: "text",
    render: ({ value }) => (
      <a
        href={`mailto:${value}`}
        className="text-fg-brand hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value as string}
      </a>
    ),
  },
  {
    field: "phone",
    headerName: "Telefone",
    width: 170,
    icon: Phone,
    editable: true,
    render: ({ value }) => (
      <a
        href={`tel:${String(value).replace(/\D/g, "")}`}
        className="text-fg-brand hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value as string}
      </a>
    ),
  },
  {
    field: "statusId",
    headerName: "Status",
    width: 140,
    icon: CheckCircle2,
    editable: true,
    editType: "select",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(STATUSES).map(([v, m]) => ({
      value: v,
      label: m.label,
    })),
    valueFormatter: (v) => STATUSES[v as keyof typeof STATUSES]?.label ?? String(v ?? ""),
    render: ({ value }) => (
      <StatusDot statusId={value as keyof typeof STATUSES} />
    ),
  },
  {
    field: "categoryId",
    headerName: "Categoria",
    width: 130,
    icon: Tag,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(CATEGORIES).map(([v, m]) => ({
      value: v,
      label: m.label,
    })),
    valueFormatter: (v) => CATEGORIES[v as keyof typeof CATEGORIES]?.label ?? String(v ?? ""),
    render: ({ value }) => (
      <CategoryChip categoryId={value as keyof typeof CATEGORIES} />
    ),
  },
  {
    field: "agentId",
    headerName: "Atribuído",
    width: 170,
    icon: UsersIcon,
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: Object.entries(AGENTS).map(([v, a]) => ({
      value: v,
      label: a.name,
    })),
    valueFormatter: (v) => AGENTS[v as keyof typeof AGENTS]?.name ?? String(v ?? ""),
    render: ({ value }) => (
      <AgentCell agentId={value as keyof typeof AGENTS} />
    ),
  },
  {
    field: "value",
    headerName: "Valor",
    width: 130,
    icon: DollarSign,
    align: "right",
    sortable: true,
    editable: true,
    editType: "number",
    enableColumnFilter: true,
    filterType: "number",
    aggregate: "sum",
    aggregateFormatter: (v) => formatCurrency(v),
    valueFormatter: (v) => (typeof v === "number" ? formatCurrency(v) : ""),
    render: ({ value }) => (
      <span className="font-semibold tabular-nums">
        {formatCurrency(value as number)}
      </span>
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
      <span className="text-fg-muted tabular-nums">
        {formatDateShort(value as number)}
      </span>
    ),
  },
  {
    field: "lastContact",
    headerName: "Último contato",
    width: 150,
    icon: Calendar,
    sortable: true,
    enableColumnFilter: true,
    filterType: "date",
    valueFormatter: (v) => (typeof v === "number" ? formatDateShort(v) : ""),
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">
        {formatDateShort(value as number)}
      </span>
    ),
  },
  {
    field: "location",
    headerName: "Localização",
    width: 150,
    icon: Type,
    editable: true,
    enableColumnFilter: true,
    filterType: "text",
  },
];

/* ── Default views (presets read-only) ─────────────────────────── */

const DEFAULT_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:ativos",
    name: "Ativos",
    filters: [{ field: "statusId", value: "active" }],
  }),
];

/* ── showEmptyFilterChips — chips placeholder nativos na toolbar ─
 *
 * A prop `showEmptyFilterChips` (v0.6.0+) é um array de field names que
 * renderizam como chips placeholder na toolbar do DataTable. Cada chip
 * mostra APENAS o nome da coluna (sem operador, sem value), pronto pra
 * usuário clicar e preencher.
 *
 * Use case: dashboards onde o set de filtros relevantes é conhecido de
 * antemão (Status / Categoria / Atribuído) — reduz cliques de
 * "abrir popover de Filtros + adicionar filtro" pra zero.
 *
 * Comportamento:
 *   - Chip placeholder fica visível enquanto a coluna NÃO tem filtro com
 *     valor no filterModel. Quando user preenche valor, vira filtro normal
 *     e o placeholder some. Quando user remove o valor (X no chip), o
 *     placeholder reaparece automaticamente.
 *   - Placeholders NÃO aparecem no popover de "Filtros" (esse popover lista
 *     apenas filtros reais com valor).
 *   - Cleanup automático de filtros vazios em outros lugares é PRESERVADO
 *     intacto — esta prop só adiciona chips extras na toolbar.
 *   - Quando user clica no X de um chip placeholder, ele é "descartado" pra
 *     a sessão (state interno). Pra trazê-lo de volta, recarregue a página.
 *
 * Diferença vs outras abordagens:
 *   - `defaultFilterValue` na column def: só preenche valor inicial QUANDO
 *     usuário ativa o filtro manualmente clicando no ícone do header.
 *   - `filterModel` controlado com items.value undefined: não funciona —
 *     cleanup automático suprime chips vazios da toolbar (regra padrão).
 *   - `showEmptyFilterChips={fields[]}` ⭐: chips placeholder visíveis
 *     desde load, prontos pra preencher. Implementação separada do
 *     filterModel (placeholders vivem no state interno do DataTable).
 */
// Mix de filterTypes pra validar que showEmptyFilterChips funciona com tipos
// diferentes — multiSelect (Status/Categoria/Atribuído), text (Email),
// date (Criado em), number (Valor).
const NATIVE_FILTER_FIELDS = [
  "statusId",     // multiSelect → isAnyOf
  "categoryId",   // multiSelect → isAnyOf
  "agentId",      // multiSelect → isAnyOf
  "email",        // text         → contains
  "createdAt",    // date         → between
  "value",        // number       → equals
];

export default function ClientsPreFilteredPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows, setRows] = useState<ClientRow[]>(() => CLIENTS_50);
  // filterModel começa VAZIO — chips placeholder vêm da prop showEmptyFilterChips,
  // não do filterModel. Filtros reais (com valor) vão acumulando aqui conforme
  // user preenche.
  const [filterModel, setFilterModel] = useState<FilterModel>({
    items: [],
    logicOperator: "AND",
  });
  const tableRef = useRef<DataTableRef>(null);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Pre-filtered (chips placeholder nativos)"
      description="DataTable com showEmptyFilterChips (v0.6.0) — 6 chips placeholder cobrindo filterTypes diferentes (multiSelect: Status/Categoria/Atribuído · text: Email · date: Criado em · number: Valor) aparecem na toolbar no load inicial, mostrando apenas o nome da coluna. Click no chip ativa o filtro (popover abre com o widget correto pra cada tipo). Preenchido vira filtro normal. X descarta o placeholder na sessão. Use case: dashboards onde o set de filtros relevantes é conhecido de antemão — reduz cliques de 'abrir popover de filtros + adicionar filtro' pra zero. Cleanup automático em outros casos (filtros vazios criados via popover) é preservado intacto."
      code={CODE}
    >
      <DataTable<ClientRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="clients-pre-filtered-demo"
        defaultViews={DEFAULT_VIEWS}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        showEmptyFilterChips={NATIVE_FILTER_FIELDS}
        toolbar={{
          title: "Clientes (pre-filtered)",
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
                onClick={() => {
                  console.log("Excluir", selectedIds);
                  clearSelection();
                }}
              >
                Excluir
              </BulkActionButton>
            </>
          ),
        }}
        onRowClick={(row) => console.log("Row click:", row.name, row.id)}
        onCellEditCommit={async ({ id, field, value }) => {
          await new Promise((res) => setTimeout(res, 800));
          if (Math.random() < 0.15) {
            throw new Error("Falha ao salvar — tente novamente");
          }
          setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
          );
          console.log("Edit commit:", { id, field, value });
        }}
        showTotalizers
        className="max-h-full"
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { useState } from "react";
import { DataTable, type FilterModel } from "@/components/ui/DataTable";

// Lista de fields que aparecem como chips placeholder na toolbar.
// A prop é filterType-agnostic — o popover abre o widget correto pra cada tipo
// (multiSelect → dropdown, text → input, date → range, number → numeric input).
const NATIVE_FILTER_FIELDS = [
  "statusId",     // multiSelect → isAnyOf
  "categoryId",   // multiSelect → isAnyOf
  "agentId",      // multiSelect → isAnyOf
  "email",        // text         → contains
  "createdAt",    // date         → between
  "value",        // number       → equals
];

export default function PreFilteredExample() {
  // filterModel começa vazio — placeholders vivem fora do filterModel
  const [filterModel, setFilterModel] = useState<FilterModel>({
    items: [],
    logicOperator: "AND",
  });
  const [rows, setRows] = useState<ClientRow[]>(MOCK_50);

  return (
    <DataTable<ClientRow>
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      persistId="clients-pre-filtered-demo"

      filterModel={filterModel}
      onFilterModelChange={setFilterModel}

      // ⭐ Array de field names que renderizam como chips placeholder
      //    na toolbar (visíveis desde o load, prontos pra preencher).
      //    Chips placeholder somem quando a coluna ganha valor real.
      //    Filtros adicionados via popover "Filtros" funcionam normal.
      showEmptyFilterChips={NATIVE_FILTER_FIELDS}

      toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true /* ... */ }}
      paginationConfig={{ enabled: true, initialPageSize: 25 }}
      // ... resto igual ao CRUD
    />
  );
}

// Comportamento esperado:
//   - 6 chips placeholder aparecem na toolbar no load cobrindo filterTypes diversos
//     (multiSelect: Status / Categoria / Atribuído · text: Email · date: Criado em ·
//     number: Valor) mostrando APENAS o nome da coluna (sem operador, sem value)
//   - User clica num chip → popover abre com widget correto pra cada filterType
//   - User preenche valor → chip vira filtro normal (com X funcionando)
//   - User remove valor (X no chip preenchido) → placeholder volta automaticamente
//   - User remove placeholder (X no chip vazio) → descartado pra sessão
//   - User adiciona filtro via "Filtros" → vai pra filterModel normalmente
//   - Filtros vazios criados via popover "Filtros" são limpos automaticamente
//     ao fechar (cleanup automático preservado intacto)
//
// Vantagens vs outras abordagens:
//   - defaultFilterValue por coluna: só preenche valor inicial quando
//     user ativa o filtro manualmente clicando no ícone do header
//   - filterModel com items.value undefined: não funciona — cleanup
//     automático suprime chips vazios da toolbar (regra padrão)
//   - showEmptyFilterChips array ⭐: prop separada e simples, lista os
//     fields que devem ter chip placeholder. Implementação interna do
//     DataTable mantém filterModel limpo — placeholders vivem em state
//     local do componente, não poluem a fonte de verdade dos filtros`;
