/**
 * O grão da combinação de filtros do `DataList` — P1 + P2 da folha de decisão.
 *
 * Até 2026-11-04 o `applyFilterModel` combinava os itens ESCALARES do mesmo campo
 * por **AND** (`for (const g of scalar) { if (!matchOp(...)) return false; }`),
 * enquanto o `DataTable` agrupa por `field|operator` e combina por **OR**
 * (`use-data-table-processor.ts`, `items.some(...)`).
 *
 * Medido ANTES, com 3 itens e um campo `select`:
 *
 *   equals "ativo" + equals "pausado"   DataTable → ["1","2"]   DataList → []
 *
 * Uma célula tem UM valor: "é ativo E é pausado" não tem resposta possível, então
 * a lista esvaziava em silêncio. A decisão do mantenedor é alinhar à tabela — OR.
 *
 * ## O grão é `field|operator`, não `field`
 *
 * É a parte que um "OR por campo" erraria: `contains "a"` + `notContains "b"` é
 * combinação legítima do painel avançado, e OR entre elas é verdadeiro para quase
 * tudo. Operadores diferentes seguem em AND — como na tabela.
 *
 * ## O que cada bloco trava
 *
 *   1. **O caminho NOVO** — dois `equals` no mesmo campo devolvem a união.
 *   2. **O caminho ANTIGO que tem que sobreviver** — operadores DIFERENTES no mesmo
 *      campo seguem em AND, e campos diferentes seguem em AND. São os dois casos que
 *      um OR frouxo demais quebraria, e os dois já funcionavam antes.
 *   3. **Paridade com o `DataTable`** — o mesmo `FilterModel` roda nos DOIS motores
 *      e os ids batem. É o teste que não concorda com a implementação por construção
 *      (L-064): a régua é o outro componente, não a minha leitura dele.
 *   4. **Array num item de operador escalar** (P1) — `ownsMulti` com operador escalar
 *      grava `value: ["a","b"]` num item só; antes coagia pra `"a,b"` e nunca casava.
 *
 * ⚠️ Sem jest-dom: `vitest.setup.ts` está fora do `include` do `tsconfig.json` e
 * `npm test` roda `tsc --noEmit` antes do vitest.
 */
import { describe, expect, it } from "vitest";
import { applyFilterModel } from "./utils/apply-filter-model";
import { useDataTableProcessor } from "@/components/ui/DataTable/hooks/use-data-table-processor";
import { renderHook } from "@testing-library/react";
import type { FilterFieldType, FilterableField } from "./data-list.types";
import type {
  DataTableColumnDef,
  FilterModel,
} from "@/components/ui/DataTable/data-table.types";
import type { ListItemData } from "@/components/ui/List";

type Linha = { id: string; nome: string; status: string; cidade: string };

const LINHAS: Linha[] = [
  { id: "1", nome: "Alfa", status: "ativo", cidade: "Recife" },
  { id: "2", nome: "Beta", status: "pausado", cidade: "Olinda" },
  { id: "3", nome: "Gama", status: "encerrado", cidade: "Recife" },
];

/** Os MESMOS dados na forma do `DataList`. */
const ITEMS: ListItemData[] = LINHAS.map((l) => ({
  id: l.id,
  title: l.nome,
  data: l,
}));

const CAMPOS: FilterableField[] = [
  {
    id: "status",
    label: "Status",
    accessor: (it) => (it.data as Linha).status,
    type: "select" as FilterFieldType,
  },
  {
    id: "nome",
    label: "Nome",
    accessor: (it) => (it.data as Linha).nome,
    type: "text" as FilterFieldType,
  },
  {
    id: "cidade",
    label: "Cidade",
    accessor: (it) => (it.data as Linha).cidade,
    type: "text" as FilterFieldType,
  },
];

const PORID = new Map(CAMPOS.map((f) => [f.id, f]));

const COLUNAS: DataTableColumnDef<Linha>[] = [
  { field: "status", headerName: "Status", filterType: "select" },
  { field: "nome", headerName: "Nome", filterType: "text" },
  { field: "cidade", headerName: "Cidade", filterType: "text" },
];

function modelo(
  ...items: Array<{ field: string; operator: string; value: unknown }>
): FilterModel {
  return {
    logicOperator: "AND",
    items: items.map((it, i) => ({ id: `f${i}`, ...it })) as FilterModel["items"],
  };
}

const idsLista = (r: ListItemData[]) => r.map((i) => String(i.id));

/** Roda o MESMO FilterModel pelo motor do `DataTable` (sem paginar). */
function idsTabela(model: FilterModel): string[] {
  const { result } = renderHook(() =>
    useDataTableProcessor<Linha>({
      rows: LINHAS,
      columns: COLUNAS,
      filterModel: model,
      search: "",
      sortModel: [],
      paginationModel: { page: 1, pageSize: 100 },
      paginate: false,
    }),
  );
  return result.current.rowsToRender.map((r) => r.id);
}

describe("DataList — escalares do MESMO campo e operador combinam por OR", () => {
  it("dois `equals` no mesmo campo devolvem a UNIÃO (era lista vazia)", () => {
    const m = modelo(
      { field: "status", operator: "equals", value: "ativo" },
      { field: "status", operator: "equals", value: "pausado" },
    );
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(["1", "2"]);
  });

  it("três `contains` no mesmo campo devolvem a UNIÃO", () => {
    const m = modelo(
      { field: "nome", operator: "contains", value: "alf" },
      { field: "nome", operator: "contains", value: "gam" },
    );
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(["1", "3"]);
  });

  it("um `equals` sozinho continua filtrando igual (o caso que já funcionava)", () => {
    const m = modelo({ field: "status", operator: "equals", value: "ativo" });
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(["1"]);
  });
});

describe("DataList — o grão é `field|operator`: operadores diferentes seguem em AND", () => {
  it("`contains` + `notContains` no MESMO campo é AND (OR por campo os fundiria)", () => {
    // "contém a" OR "não contém b" seria verdadeiro pra Alfa, Beta E Gama.
    // Em AND sobra só quem contém "a" e não contém "b": Alfa e Gama.
    const m = modelo(
      { field: "nome", operator: "contains", value: "a" },
      { field: "nome", operator: "notContains", value: "b" },
    );
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(["1", "3"]);
  });

  it("`contains` + `notContains` que se excluem devolvem VAZIO, não tudo", () => {
    const m = modelo(
      { field: "nome", operator: "contains", value: "alf" },
      { field: "nome", operator: "notContains", value: "alf" },
    );
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual([]);
  });

  it("campos DIFERENTES seguem em AND", () => {
    const m = modelo(
      { field: "status", operator: "equals", value: "ativo" },
      { field: "cidade", operator: "equals", value: "olinda" },
    );
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual([]);
  });

  it("OR dentro do campo combinado com AND de outro campo", () => {
    // status ∈ {ativo, encerrado} AND cidade = Recife → Alfa e Gama.
    const m = modelo(
      { field: "status", operator: "equals", value: "ativo" },
      { field: "status", operator: "equals", value: "encerrado" },
      { field: "cidade", operator: "equals", value: "recife" },
    );
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(["1", "3"]);
  });
});

describe("paridade de motor — o MESMO FilterModel dá o MESMO conjunto nos dois", () => {
  const casos: Array<[string, FilterModel]> = [
    [
      "dois equals no mesmo campo",
      modelo(
        { field: "status", operator: "equals", value: "ativo" },
        { field: "status", operator: "equals", value: "pausado" },
      ),
    ],
    [
      "contains + notContains no mesmo campo",
      modelo(
        { field: "nome", operator: "contains", value: "a" },
        { field: "nome", operator: "notContains", value: "b" },
      ),
    ],
    [
      "OR num campo + AND com outro",
      modelo(
        { field: "status", operator: "equals", value: "ativo" },
        { field: "status", operator: "equals", value: "encerrado" },
        { field: "cidade", operator: "equals", value: "recife" },
      ),
    ],
    [
      "equals único",
      modelo({ field: "status", operator: "equals", value: "ativo" }),
    ],
  ];

  it.each(casos)("%s", (_nome, m) => {
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(idsTabela(m));
  });
});

describe("P1 — array num item de operador ESCALAR é lista de alternativas", () => {
  it("UM item `equals` com DOIS valores casa os dois (antes coagia pra 'a,b')", () => {
    const m = modelo({
      field: "status",
      operator: "equals",
      value: ["ativo", "pausado"],
    });
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(["1", "2"]);
  });

  it("UM item `equals` com UM valor no array segue casando", () => {
    const m = modelo({ field: "status", operator: "equals", value: ["ativo"] });
    expect(idsLista(applyFilterModel(ITEMS, m, PORID))).toEqual(["1"]);
  });

  it("`between` NÃO é achatado — o array é a tupla [lo, hi]", () => {
    const comNumero: FilterableField[] = [
      {
        id: "n",
        label: "N",
        accessor: (it) => (it.data as { n: number }).n,
        type: "number" as FilterFieldType,
      },
    ];
    const itens: ListItemData[] = [
      { id: "a", title: "a", data: { n: 1 } },
      { id: "b", title: "b", data: { n: 5 } },
      { id: "c", title: "c", data: { n: 9 } },
    ];
    const m = modelo({ field: "n", operator: "between", value: [2, 6] });
    // Achatar daria "n == 2 OU n == 6" (nenhum) ou pior; a tupla dá a faixa.
    expect(idsLista(applyFilterModel(itens, m, new Map([["n", comNumero[0]]])))).toEqual(["b"]);
  });
});
