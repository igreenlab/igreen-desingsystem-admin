import { useEffect, useMemo, useState } from "react";
import { Hash, User, AtSign, CheckCircle2, DollarSign } from "lucide-react";
import {
  CLIENTS_MOCK,
  formatCurrency,
  PersonCell,
  StatusDot,
  type ClientRow,
} from "./TableDoc";
import {
  DataTable,
  type DataTableColumnDef,
  type FilterModel,
  type PaginationModel,
  type SortModel,
} from "@/components/ui/DataTable";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── O "banco" ─────────────────────────────────────────────────────────── */

const CLIENTS_100: ClientRow[] = Array.from({ length: 10 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({ ...row, id: `CLI-${3000 + batch * 10 + i}` })),
).flat();

type Consulta = {
  pagination: PaginationModel;
  sort: SortModel[];
  filters: FilterModel;
  search: string;
};

/**
 * O endpoint. Filtra, ordena E fatia — é o ponto inteiro: a tela recebe a
 * PÁGINA pronta, e o DataTable não pode reprocessá-la.
 */
async function buscarClientes(
  q: Consulta,
): Promise<{ items: ClientRow[]; total: number }> {
  await new Promise((r) => setTimeout(r, 450));

  let result = [...CLIENTS_100];

  for (const item of q.filters.items) {
    if (item.value == null || item.value === "") continue;
    const alvo = String(item.value).toLowerCase();
    result = result.filter((row) => {
      const v = String(
        (row as unknown as Record<string, unknown>)[item.field] ?? "",
      ).toLowerCase();
      return item.operator === "equals" ? v === alvo : v.includes(alvo);
    });
  }

  if (q.search.trim()) {
    const needle = q.search.trim().toLowerCase();
    result = result.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(needle)),
    );
  }

  if (q.sort.length > 0) {
    result.sort((a, b) => {
      for (const s of q.sort) {
        const va = (a as unknown as Record<string, unknown>)[s.field];
        const vb = (b as unknown as Record<string, unknown>)[s.field];
        const sign = s.direction === "asc" ? 1 : -1;
        const cmp =
          typeof va === "number" && typeof vb === "number"
            ? (va - vb) * sign
            : String(va).localeCompare(String(vb)) * sign;
        if (cmp !== 0) return cmp;
      }
      return 0;
    });
  }

  const total = result.length;
  const start = (q.pagination.page - 1) * q.pagination.pageSize;
  return { items: result.slice(start, start + q.pagination.pageSize), total };
}

/* ── Colunas ───────────────────────────────────────────────────────────── */

const COLUMNS: DataTableColumnDef<ClientRow>[] = [
  { field: "id", headerName: "ID", width: 120, icon: Hash, type: "text" },
  {
    field: "name",
    headerName: "Nome",
    width: 240,
    icon: User,
    sortable: true,
    render: ({ row }) => <PersonCell row={row} />,
  },
  { field: "email", headerName: "Email", width: 240, icon: AtSign },
  {
    field: "statusId",
    headerName: "Status",
    width: 140,
    icon: CheckCircle2,
    enableColumnFilter: true,
    render: ({ row }) => <StatusDot statusId={row.statusId} />,
  },
  {
    field: "value",
    headerName: "Valor",
    width: 140,
    icon: DollarSign,
    align: "right",
    sortable: true,
    valueFormatter: (value) => formatCurrency(value as number),
  },
];

/** O tamanho de página da API. O do DataTable tem que ser o MESMO: o range do
 *  rodapé é aritmética sobre `page × pageSize`, não uma contagem do corpo. */
const PAGE_SIZE = 25;

const DESCRICAO =
  'O outro caminho de server mode: a TELA busca e passa a página pronta em "rows", ' +
  'e processingMode="server" manda o DataTable não reprocessar nada — nem fatiar, ' +
  "nem ordenar, nem filtrar, nem buscar. O total vem de rowCount. Use este caminho " +
  "quando já existe react-query/SWR dono do fetch; use fetchData quando não existe. " +
  "Ordene por Nome: a primeira linha passa a ser a menor das 100, não das 25 da tela. " +
  'Busque por "zzzz": o vazio filtrado vem com o botão de limpar filtros — antes da vNEXT ' +
  'os dois caminhos de server diziam "Nenhum dado cadastrado", sem saída.';

/**
 * Página standalone — DataTable em server mode **pela tela**
 * (`processingMode="server"` + `rows`), o caminho alternativo ao `fetchData`.
 *
 * Aqui quem dispara a request é a tela: o `useEffect` abaixo é o lugar onde,
 * num projeto real, entra `useQuery(["clients", consulta], …)`. O DataTable
 * recebe a página pronta, **não reprocessa nada** e só emite o que o usuário
 * pediu — ordenar, filtrar, buscar, virar a página.
 *
 * O que olhar nesta tela, e que só se vê mexendo:
 *   1. **Ordenar por Nome ou Valor** reordena as 100 linhas do "banco", não as
 *      25 da tela — a primeira linha muda para a menor de TODAS.
 *   2. **Virar a página** troca o lote; com `processingMode` ausente o
 *      DataTable fatiaria este lote de novo e a página 2 viria vazia.
 *   3. **O menu "Opções"** oferece "CSV — Página atual", não "Todos": a tela
 *      só entregou 25 linhas, e prometer 100 seria mentira.
 *   4. **Buscar por algo que não existe** (ex.: "zzzz") zera o `rowCount` e dá
 *      "Nenhum dado encontrado" **com o botão de limpar filtros**. Até a
 *      `vNEXT` esta mesma tela dizia "Nenhum dado cadastrado" — *"não existe
 *      nada"*, falso — e **sem** o botão: o estado que apaga a própria saída
 *      (L-070). Em server o total é o de DEPOIS do filtro, e não distingue
 *      "não existe" de "não casou".
 */
export default function ClientsServerRowsPreview() {
  const columns = useMemo(() => COLUMNS, []);

  /* O estado que, num projeto real, vira a chave do cache do react-query. */
  const [paginationModel, setPaginationModel] = useState<PaginationModel>({
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<SortModel[]>([]);
  const [filterModel, setFilterModel] = useState<FilterModel>({
    items: [],
    logicOperator: "AND",
  });
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<ClientRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    buscarClientes({
      pagination: paginationModel,
      sort: sortModel,
      filters: filterModel,
      search,
    }).then(({ items, total }) => {
      if (cancelado) return;
      setRows(items);
      setRowCount(total);
      setLoading(false);
    });
    return () => {
      cancelado = true;
    };
  }, [paginationModel, sortModel, filterModel, search]);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Server por rows"
      description={DESCRICAO}
      code={CODE}
    >
      <DataTable<ClientRow>
        rows={rows}
        rowCount={rowCount}
        processingMode="server"
        loading={loading}
        loadingMode="keep"
        columns={columns}
        getRowId={(r) => r.id}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        search={search}
        onSearchChange={setSearch}
        toolbar={{
          title: "Clientes",
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
          enableExport: true,
          // Quem recarrega é a tela — o botão Refresh só fala com o `fetchData`.
          enableRefresh: false,
        }}
        paginationConfig={{
          enabled: true,
          initialPageSize: PAGE_SIZE,
          pageSizeOptions: [PAGE_SIZE],
        }}
        className="max-h-full"
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable } from "@/components/ui/DataTable";

// A tela é dona do fetch — aqui com react-query, mas SWR/RTK-Query dá no mesmo.
const [paginationModel, setPaginationModel] = useState({ page: 1, pageSize: 25 });
const [sortModel, setSortModel] = useState([]);
const [filterModel, setFilterModel] = useState({ items: [], logicOperator: "AND" });
const [search, setSearch] = useState("");

const { data, isFetching } = useQuery({
  queryKey: ["clients", paginationModel, sortModel, filterModel, search],
  queryFn: () => api.get("/clients", { params: { paginationModel, sortModel, filterModel, search } }),
  placeholderData: keepPreviousData,   // o par natural do loadingMode="keep"
});

<DataTable<ClientRow>
  rows={data?.items ?? []}
  rowCount={data?.total ?? 0}     // o total do SERVIDOR — sem ele, só o lote
  processingMode="server"         // não fatia, não ordena, não filtra, não busca
  loading={isFetching}
  loadingMode="keep"
  columns={columns}
  getRowId={(r) => r.id}
  // Os 4 canais por onde o DataTable PEDE a página seguinte:
  paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
  sortModel={sortModel}             onSortModelChange={setSortModel}
  filterModel={filterModel}         onFilterModelChange={setFilterModel}
  search={search}                   onSearchChange={setSearch}
  // O pageSize tem que ser o da API: o range do rodapé é page × pageSize.
  paginationConfig={{ initialPageSize: 25, pageSizeOptions: [25] }}
  toolbar={{ title: "Clientes", enableRefresh: false }}
/>`;
