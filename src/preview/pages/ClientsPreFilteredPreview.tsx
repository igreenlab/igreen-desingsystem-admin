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

/* ── Filter model padrão — 3 filtros pré-ativos vazios ──────────
 * O DataTable aceita `filterModel` controlado. Ao passar items com
 * `value: undefined`, os chips de filtro aparecem como "aplicados" na
 * toolbar desde o load inicial, sem valor preenchido — usuário só
 * precisa clicar em cada chip pra escolher o valor.
 *
 * Use case típico: dashboard onde sabe-se de antemão quais 3 filtros
 * o usuário sempre vai querer ajustar (Status / Categoria / Atribuído).
 *
 * Diferença vs `defaultFilterValue` na column def:
 *   - defaultFilterValue: só preenche valor inicial QUANDO usuário ativa
 *     o filtro manualmente clicando no ícone do header.
 *   - filterModel controlado: pré-ATIVA o filtro (chip aparece na toolbar
 *     desde o carregamento), mesmo sem valor.
 */
const INITIAL_FILTER_MODEL: FilterModel = {
  items: [
    { id: "f_status",   field: "statusId",   operator: "isAnyOf", value: undefined },
    { id: "f_category", field: "categoryId", operator: "isAnyOf", value: undefined },
    { id: "f_agent",    field: "agentId",    operator: "isAnyOf", value: undefined },
  ],
  logicOperator: "AND",
};

export default function ClientsPreFilteredPreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows, setRows] = useState<ClientRow[]>(() => CLIENTS_50);
  const [filterModel, setFilterModel] = useState<FilterModel>(INITIAL_FILTER_MODEL);
  const tableRef = useRef<DataTableRef>(null);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Pre-filtered"
      description="DataTable com filterModel controlado — 3 filtros pré-ativos vazios (Status / Categoria / Atribuído) já aparecem como chips aplicados na toolbar no carregamento inicial, prontos pra usuário preencher. Use case: dashboards onde o set de filtros relevantes é conhecido de antemão e poupar 3 cliques de 'abrir filtros + adicionar filtro' melhora o fluxo."
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

// 3 filtros pré-ativos vazios — chips aparecem como aplicados no load
const INITIAL_FILTER_MODEL: FilterModel = {
  items: [
    { id: "f_status",   field: "statusId",   operator: "isAnyOf", value: undefined },
    { id: "f_category", field: "categoryId", operator: "isAnyOf", value: undefined },
    { id: "f_agent",    field: "agentId",    operator: "isAnyOf", value: undefined },
  ],
  logicOperator: "AND",
};

export default function PreFilteredExample() {
  const [filterModel, setFilterModel] = useState<FilterModel>(INITIAL_FILTER_MODEL);
  const [rows, setRows] = useState<ClientRow[]>(MOCK_50);

  return (
    <DataTable<ClientRow>
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      persistId="clients-pre-filtered-demo"

      // Filtros controlados — passa o modelo inicial + handler de mudança
      filterModel={filterModel}
      onFilterModelChange={setFilterModel}

      toolbar={{ title: "Clientes", enableSearch: true, enableFilters: true /* ... */ }}
      paginationConfig={{ enabled: true, initialPageSize: 25 }}
      // ... resto igual ao CRUD
    />
  );
}

// Comportamento esperado no load inicial:
//   - 3 chips de filtro aparecem como aplicados na toolbar
//     (Status, Categoria, Atribuído) — todos sem valor
//   - Usuário clica num chip → popover abre para preencher valor
//   - Tabela mostra todas as rows (filtros vazios não filtram)
//   - Filtros vazios podem ser removidos pelo X do chip
//
// Diferença vs defaultFilterValue por coluna:
//   - defaultFilterValue: só preenche valor inicial quando user
//     ativa o filtro manualmente (clica no ícone do header)
//   - filterModel controlado: pré-ATIVA o filtro (chip aparece na
//     toolbar desde o carregamento), mesmo sem valor`;
