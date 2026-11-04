/**
 * Achado I-5 da review da Task 11 — o estado vazio que apagava a própria saída.
 *
 * O `DataTable` tem dois vazios, e a diferença entre eles é a SAÍDA:
 *
 *   - `renderEmpty`     → "Nenhum dado cadastrado". Afirma que o conjunto está
 *                         vazio. Não oferece nada pra clicar.
 *   - `renderNoResults` → "Nenhum dado encontrado" **+ botão "Limpar filtros"**,
 *                         já cabeado pelo próprio componente.
 *
 * `isDataEmpty` vencia o `isNoResults` (que é guardado por `!isDataEmpty`), e
 * não olhava se havia filtro ativo. Em server mode o `totalRowsForEmpty` é o
 * total **depois do filtro**, então filtrar até zerar derrubava o total a 0 e a
 * tela dizia *"não existe nada"* — **falso**, porque existe; o filtro é que não
 * casou — **e sem a saída de limpar**, exatamente quando o usuário precisa
 * dela. É a L-070: o estado que apaga a própria saída.
 *
 * Medido antes da correção:
 *
 * |                         | "Nenhum dado cadastrado" | "limpar filtros" na tela |
 * |-------------------------|--------------------------|--------------------------|
 * | client                  | não                      | **sim**                  |
 * | `processingMode="server"` | **sim**                | **não**                  |
 * | `fetchData`             | **sim**                  | **não**                  |
 *
 * ## A escolha do mantenedor foi a opção A: consertar os DOIS caminhos de server
 *
 * Isso **muda o `fetchData`**, que é comportamento existente, e é deliberado:
 * quem hoje vê "Nenhum dado cadastrado" ao filtrar até zero está lendo uma
 * afirmação falsa, sem saída. A opção B (consertar só atrás da prop nova) foi
 * recusada porque faria os dois caminhos de server divergirem — e a própria T11
 * gastou um commit argumentando que "server quer dizer a mesma coisa nos dois".
 *
 * ## O que estes testes travam
 *
 *   1. **O client NÃO mudou** — e isso tem duas metades. A óbvia (tem `rows`,
 *      filtra até zerar → já era `NoResults`) e a que de fato distingue a
 *      correção escopada da correção cega: **`rows: []` COM filtro ativo
 *      continua dizendo "Nenhum dado cadastrado"**. Em client o total é o de
 *      ANTES do filtro, então ali a afirmação é verdadeira e oferecer "limpar
 *      filtros" prometeria revelar algo que não existe. Um `&& !temFiltro`
 *      aplicado sem escopo passaria em todos os outros testes deste arquivo e
 *      morreria **só** neste.
 *   2. **Os dois caminhos de server passam a dizer a mesma coisa** — e um teste
 *      de cada lado, porque o ramo é o mesmo mas o caminho até ele não é.
 *   3. **Sem filtro, nada muda em lugar nenhum** — total 0 e nenhum filtro
 *      segue sendo "Nenhum dado cadastrado" nos três modos.
 *
 * ⚠️ Asserções em `toBeNull()`/`getAttribute()`, nunca jest-dom: o
 * `vitest.setup.ts` o registra em runtime mas está FORA do `include` do
 * `tsconfig.json`, e `npm test` roda `tsc --noEmit` antes do vitest.
 */
import { describe, expect, it, beforeAll, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table";
import type {
  DataTableColumnDef,
  DataTableProps,
  FilterModel,
  GridFetchParams,
  GridFetchResult,
} from "./data-table.types";

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

type Row = { id: string; nome: string };

const LOTE: Row[] = [
  { id: "1", nome: "Ana" },
  { id: "2", nome: "Bruno" },
];

const COLUNAS: DataTableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "nome", headerName: "Nome" },
];

/** Filtro que NÃO casa com ninguém — é o que zera o resultado. */
const FILTRO_QUE_ZERA: FilterModel = {
  items: [{ id: "f1", field: "nome", operator: "contains", value: "zzzz" }],
  logicOperator: "AND",
};

/* ── Leitores de DOM ───────────────────────────────────────────────────── */

const diz = (texto: string) => screen.queryByText(texto) !== null;
const vazioCadastrado = () => diz("Nenhum dado cadastrado");
const vazioFiltrado = () => diz("Nenhum dado encontrado");
const botaoLimpar = () =>
  screen.queryByRole("button", { name: /Limpar filtros/i });

/** Os dois vazios + a saída, num objeto só — o par é o que importa. */
function estado() {
  return {
    cadastrado: vazioCadastrado(),
    filtrado: vazioFiltrado(),
    temSaida: botaoLimpar() !== null,
  };
}

function montar(props: Partial<DataTableProps<Row>> = {}) {
  return render(
    <DataTable<Row>
      rows={LOTE}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      paginationConfig={{ enabled: true, initialPageSize: 10 }}
      {...props}
    />,
  );
}

/** `fetchData` + controle manual da resposta. */
async function montarComFetch(props: Partial<DataTableProps<Row>> = {}) {
  const resolvers: Array<(r: GridFetchResult<Row>) => void> = [];
  const fetchData = (_p: GridFetchParams): Promise<GridFetchResult<Row>> =>
    new Promise((resolve) => {
      resolvers.push(resolve);
    });

  const view = render(
    <DataTable<Row>
      fetchData={fetchData}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      paginationConfig={{ enabled: true, initialPageSize: 10 }}
      {...props}
    />,
  );
  await screen.findByLabelText("Carregando dados");
  return {
    ...view,
    responder: async (data: Row[], total: number) => {
      const resolve = resolvers.shift();
      if (!resolve) throw new Error("responder() sem request pendente");
      await act(async () => {
        resolve({ data, total });
      });
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────── */

describe("estado vazio — o caminho CLIENT não mudou", () => {
  it("com rows e filtro que zera: 'Nenhum dado encontrado' + a saída, como sempre", () => {
    montar({ filterModel: FILTRO_QUE_ZERA });

    expect(estado()).toEqual({
      cadastrado: false,
      filtrado: true,
      temSaida: true,
    });
  });

  it("sem rows e SEM filtro: 'Nenhum dado cadastrado', sem saída — como sempre", () => {
    montar({ rows: [] });

    expect(estado()).toEqual({
      cadastrado: true,
      filtrado: false,
      temSaida: false,
    });
  });

  it("⚠️ sem rows e COM filtro ativo: CONTINUA 'Nenhum dado cadastrado'", () => {
    /* Este é o teste que separa a correção escopada da correção cega.
       Em client o total é o de ANTES do filtro: `rows` vazio quer dizer que o
       conjunto está vazio MESMO, com ou sem filtro. "Limpar filtros" aqui
       prometeria revelar algo que não existe. Um `&& !temFiltroOuBusca` sem o
       escopo de server passaria em todos os outros testes deste arquivo e
       morreria só aqui. */
    montar({ rows: [], filterModel: FILTRO_QUE_ZERA });

    expect(estado()).toEqual({
      cadastrado: true,
      filtrado: false,
      temSaida: false,
    });
  });

  it("com rows e BUSCA que zera: 'Nenhum dado encontrado' + saída, como sempre", () => {
    // `search` controlado: o `debouncedValue` nasce no valor final, sem os 500ms.
    montar({ search: "zzzz" });

    expect(estado()).toEqual({
      cadastrado: false,
      filtrado: true,
      temSaida: true,
    });
  });
});

describe("estado vazio — `processingMode='server'`", () => {
  it("filtro que zera o total passa a dizer 'Nenhum dado encontrado' + a saída", () => {
    montar({
      rows: [],
      processingMode: "server",
      rowCount: 0,
      filterModel: FILTRO_QUE_ZERA,
    });

    expect(estado()).toEqual({
      cadastrado: false,
      filtrado: true,
      temSaida: true,
    });
  });

  it("BUSCA que zera o total também", () => {
    montar({ rows: [], processingMode: "server", rowCount: 0, search: "zzzz" });

    expect(estado()).toEqual({
      cadastrado: false,
      filtrado: true,
      temSaida: true,
    });
  });

  it("SEM filtro e total 0 continua 'Nenhum dado cadastrado'", () => {
    montar({ rows: [], processingMode: "server", rowCount: 0 });

    expect(estado()).toEqual({
      cadastrado: true,
      filtrado: false,
      temSaida: false,
    });
  });

  it("lote vazio com `rowCount` alto não cai em vazio nenhum", () => {
    // Continua valendo o que a T11 travou: o vazio da PÁGINA não é o do conjunto.
    montar({
      rows: [],
      processingMode: "server",
      rowCount: 300,
      filterModel: FILTRO_QUE_ZERA,
    });

    expect(estado()).toEqual({
      cadastrado: false,
      filtrado: false,
      temSaida: false,
    });
  });
});

describe("estado vazio — `fetchData` (o comportamento que MUDOU)", () => {
  it("filtro que zera: era 'Nenhum dado cadastrado' sem saída, agora é 'encontrado' + saída", async () => {
    const { responder } = await montarComFetch({
      filterModel: FILTRO_QUE_ZERA,
    });

    await responder([], 0);

    expect(estado()).toEqual({
      cadastrado: false,
      filtrado: true,
      temSaida: true,
    });
  });

  it("e a saída FUNCIONA: clicar em 'Limpar filtros' devolve o filtro vazio", async () => {
    // O botão existir não é o ponto — o ponto é ele ser saída. O `filterModel`
    // é controlado, então o que medimos é o que o componente EMITE.
    const user = userEvent.setup();
    const aoFiltrar = vi.fn();
    const { responder } = await montarComFetch({
      filterModel: FILTRO_QUE_ZERA,
      onFilterModelChange: aoFiltrar,
    });
    await responder([], 0);

    await user.click(botaoLimpar()!);

    expect(aoFiltrar).toHaveBeenCalledWith({ items: [], logicOperator: "AND" });
  });

  it("SEM filtro e total 0 continua 'Nenhum dado cadastrado'", async () => {
    const { responder } = await montarComFetch();

    await responder([], 0);

    expect(estado()).toEqual({
      cadastrado: true,
      filtrado: false,
      temSaida: false,
    });
  });

  it("resposta com linhas não mostra vazio nenhum, com ou sem filtro", async () => {
    const { responder } = await montarComFetch({ filterModel: FILTRO_QUE_ZERA });

    await responder(LOTE, 2);

    expect(estado()).toEqual({
      cadastrado: false,
      filtrado: false,
      temSaida: false,
    });
  });
});

describe("estado vazio — os dois caminhos de server dizem a MESMA coisa", () => {
  it("mesmo filtro, mesmo total 0, mesmo par de vazio+saída", async () => {
    /* O ponto da opção A, num teste só: a escolha de caminho de server é da
       TELA (quem dispara a request), não do usuário — e o usuário não pode ver
       mensagens diferentes por causa dela. Era essa divergência que a opção B
       criaria de propósito. */
    const { unmount } = montar({
      rows: [],
      processingMode: "server",
      rowCount: 0,
      filterModel: FILTRO_QUE_ZERA,
    });
    const porRows = estado();
    unmount();

    const { responder } = await montarComFetch({
      filterModel: FILTRO_QUE_ZERA,
    });
    await responder([], 0);
    const porFetch = estado();

    expect(porRows).toEqual(porFetch);
    expect(porFetch).toEqual({
      cadastrado: false,
      filtrado: true,
      temSaida: true,
    });
  });
});
