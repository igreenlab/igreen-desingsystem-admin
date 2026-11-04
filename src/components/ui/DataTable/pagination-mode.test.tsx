/**
 * Task 11 (item 11 do Sólis) — `paginationMode: "client" | "server"`.
 *
 * O consumidor já pagina no servidor e passa em `rows` a página pronta. Hoje o
 * `DataTable` fatia de novo: `use-data-table-processor.ts` roda
 * filtro → busca → ordenação → `sorted.slice(start, start + pageSize)` sobre
 * TUDO que chega em `rows`. Com uma página de 25 numa tabela de `pageSize` 25,
 * a página 2 mostra `slice(25, 50)` de 25 linhas = **vazio**.
 *
 * ## O alcance, que é a decisão desta tarefa
 *
 * A flag desliga o pipeline **inteiro**, não só o `slice` — e isso é mais do que
 * o nome promete, de propósito:
 *
 *   - **ordenação**: ordenar o lote recebido é ordenar 25 linhas como se fossem
 *     as 1.000. A tabela diz "ordenado por nome" e está ordenada só por dentro
 *     da página. Afirmação falsa, sem nada na tela que a denuncie.
 *   - **filtro e busca**: apagam linhas do lote que o `rowCount` continua
 *     contando — o corpo mostra 7 linhas e o rodapé diz "1–25 de 1.000". Pior
 *     que a soma das partes: as semânticas divergem (busca do banco é
 *     acento-insensível, `applySearch` local não é; `localeCompare` ≠ collation
 *     do SQL), então o lote CERTO perde linhas CERTAS no cliente.
 *
 * Paginar no servidor e filtrar/ordenar no cliente não é uma combinação válida:
 * fronteira de página só existe sobre um conjunto já filtrado e já ordenado. Por
 * isso é uma prop só, e não três (o `fetchData` deste mesmo componente já define
 * "server" como os três juntos — `data-table.types.ts`: *"delega filter/sort/
 * pagination ao servidor"*).
 *
 * ## O que estes testes travam, nesta ordem de importância
 *
 *   1. **O caminho antigo** — sem a prop, fatia, ordena, filtra e busca
 *      localmente, e `rowCount` continua **ignorado**. É a regra do lote: prop
 *      ausente = comportamento de hoje. Quatro dos testes abaixo só existem pra
 *      isso, e são os que morrem quando a flag vaza pro default.
 *   2. **`"server"` não fatia** — as `rows` recebidas aparecem inteiras, mesmo
 *      com `pageSize` menor que elas, e a página 2 não as apaga.
 *   3. **`"server"` não processa** — `sortModel`, `filterModel` e `search`
 *      deixam a ordem e a quantidade do lote intactas.
 *   4. **`"server"` só emite** — os callbacks continuam disparando, porque é
 *      por eles que a tela sabe que precisa buscar a página seguinte.
 *   5. **`rowCount` vira a fonte do total** no rodapé, e sem ele o rodapé
 *      degrada pro tamanho do lote em vez de mentir.
 *
 * Asserções em `toBeNull()`/`getAttribute()`, nunca jest-dom: o
 * `vitest.setup.ts` o registra em runtime mas está FORA do `include` do
 * `tsconfig.json`, e `npm test` roda `tsc --noEmit` antes do vitest — um
 * `toBeInTheDocument` derruba a suíte inteira antes de rodar teste nenhum.
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

/* jsdom não tem matchMedia (o DataTable usa pro card mode). Mesmo preâmbulo de
   `loading-mode.test.tsx`; o ResizeObserver já vem do vitest.setup. */
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

/* A PÁGINA que o servidor devolveu — já fatiada e já na ordem dele.
   Propositalmente FORA de ordem alfabética: uma ordenação local por `nome`
   reorganizaria pra Alfa/Mike/Zulu, e essa é a diferença que os testes leem. */
const PAGINA: Row[] = [
  { id: "7", nome: "Zulu" },
  { id: "8", nome: "Alfa" },
  { id: "9", nome: "Mike" },
];
const NOMES = ["Zulu", "Alfa", "Mike"];

/** O que o servidor diz existir no total — 100 páginas de 3. */
const TOTAL_NO_SERVIDOR = 300;

const COLUNAS: DataTableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "nome", headerName: "Nome" },
];

/** Filtro que, aplicado LOCALMENTE, deixaria só "Alfa" (zulu/mike não têm "a"). */
const FILTRO_SO_ALFA: FilterModel = {
  items: [{ id: "f1", field: "nome", operator: "contains", value: "a" }],
  logicOperator: "AND",
};

/**
 * `pageSize` 3 = o tamanho da página do servidor (o caso realista, em que o
 * rodapé pode falar do lote sem mentir). `pageSize` 2 nos testes de fatiamento:
 * com 3 linhas na mão, ele torna o `slice` visível a olho nu.
 */
function montar(props: Partial<DataTableProps<Row>> = {}, pageSize = 3) {
  return render(
    <DataTable<Row>
      rows={PAGINA}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      paginationConfig={{
        enabled: true,
        initialPageSize: pageSize,
        pageSizeOptions: [2, 3],
      }}
      {...props}
    />,
  );
}

/* ── Leitores de DOM ──────────────────────────────────────────────────────
   Os nomes na ORDEM em que o corpo os renderiza. Um `queryAllByText` por nome
   devolveria a ordem do fixture, não a da tela — e é exatamente a ordem que
   distingue "não ordenou" de "ordenou". */
function nomesNaTela(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[role="row"]')]
    .map((linha) => NOMES.find((n) => (linha.textContent ?? "").includes(n)))
    .filter((n): n is string => n !== undefined);
}

/**
 * O texto do range do rodapé real, normalizado: "1–3 de 300".
 *
 * Lido do `<span>` do range, ancorado no início DELE — não do `<footer>`
 * inteiro. O select de "Linhas por página" renderiza o número colado no range
 * ("3" + "1–3 de 42"), e um casamento solto devolvia "31–3 de 42": o detector
 * casando mais do que a afirmação que ele sustenta, que é a armadilha do ritual.
 */
function rangeDoRodape(container: HTMLElement): string | null {
  const spans = container.querySelector("footer")?.querySelectorAll("span");
  for (const span of spans ?? []) {
    const texto = (span.textContent ?? "").replace(/\s+/g, " ").trim();
    const m = texto.match(/^(\d[\d.,]*)–(\d[\d.,]*) de (\d[\d.,]*)\b/);
    if (m) return `${m[1]}–${m[2]} de ${m[3]}`;
  }
  return null;
}

const estadoVazio = () => screen.queryByText("Nenhum dado cadastrado");

/* ────────────────────────────────────────────────────────────────────────── */

describe("DataTable — paginationMode: o caminho antigo (default 'client')", () => {
  it("sem a prop, fatia as rows localmente — a página 1 só mostra o pageSize", () => {
    const { container } = montar({}, 2);

    // 3 rows, pageSize 2 → `slice(0, 2)`. "Mike" ficou na página 2.
    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa"]);
    expect(rangeDoRodape(container)).toBe("1–2 de 3");
  });

  it("sem a prop, a página 2 mostra a fatia seguinte", async () => {
    const user = userEvent.setup();
    const { container } = montar({}, 2);

    await user.click(screen.getByLabelText("Página 2"));

    expect(nomesNaTela(container)).toEqual(["Mike"]);
  });

  it("sem a prop, o sortModel ordena as rows localmente — e ordena ANTES de fatiar", () => {
    const { container } = montar(
      { sortModel: { field: "nome", direction: "asc" } },
      2,
    );

    // Ordem do servidor era Zulu/Alfa/Mike. Se o sort rodasse DEPOIS do slice,
    // a página 1 seria Alfa/Zulu. "Mike" aqui prova a cascata inteira.
    expect(nomesNaTela(container)).toEqual(["Alfa", "Mike"]);
  });

  it("sem a prop, o filterModel filtra as rows localmente", () => {
    const { container } = montar({ filterModel: FILTRO_SO_ALFA });

    expect(nomesNaTela(container)).toEqual(["Alfa"]);
  });

  it("sem a prop, a busca filtra as rows localmente", () => {
    // `search` controlado: o `debouncedValue` inicia JÁ no valor da prop, então
    // o processor o aplica no primeiro render — sem depender dos 500ms.
    const { container } = montar({ search: "Alfa" });

    expect(nomesNaTela(container)).toEqual(["Alfa"]);
  });

  it("sem a prop, `rowCount` é IGNORADO — o rodapé conta as rows locais", () => {
    const { container } = montar({ rowCount: TOTAL_NO_SERVIDOR }, 2);

    // A prop existe hoje e só vale com `fetchData`. Em client mode ela não pode
    // passar a valer sozinha: é o que separa "aditivo" de "mudou pra todo mundo".
    expect(rangeDoRodape(container)).toBe("1–2 de 3");
  });

  it("sem a prop, lote vazio com `rowCount` alto segue afirmando 'nenhum dado'", () => {
    montar({ rows: [], rowCount: TOTAL_NO_SERVIDOR });

    expect(estadoVazio()).not.toBeNull();
  });
});

describe("DataTable — paginationMode: 'server' não fatia", () => {
  it("renderiza as rows recebidas SEM fatiar, mesmo com pageSize menor", () => {
    const { container } = montar(
      { paginationMode: "server", rowCount: TOTAL_NO_SERVIDOR },
      2,
    );

    // pageSize 2 e 3 linhas na tela: o `slice` não rodou.
    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa", "Mike"]);
  });

  it("ir pra página 2 não apaga o lote — quem refetcha é a tela", async () => {
    const user = userEvent.setup();
    const aoPaginar = vi.fn();
    const { container } = montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
      onPaginationModelChange: aoPaginar,
    });

    await user.click(screen.getByLabelText("Página 2"));

    // Com o slice local, `slice(3, 6)` de 3 linhas é vazio: a tela limpava
    // sozinha enquanto a tela de verdade ainda nem tinha buscado nada.
    expect(aoPaginar).toHaveBeenCalledWith({ page: 2, pageSize: 3 });
    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa", "Mike"]);
  });
});

describe("DataTable — paginationMode: 'server' não processa, só emite", () => {
  it("NÃO ordena localmente — a ordem do servidor fica intacta", () => {
    const { container } = montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
      sortModel: { field: "nome", direction: "asc" },
    });

    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa", "Mike"]);
  });

  it("NÃO filtra localmente — o filterModel vale pro servidor, não pro lote", () => {
    const { container } = montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
      filterModel: FILTRO_SO_ALFA,
    });

    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa", "Mike"]);
  });

  it("NÃO busca localmente — o lote já é o resultado da busca do servidor", () => {
    const { container } = montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
      search: "Alfa",
    });

    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa", "Mike"]);
  });

  it("continua emitindo o sort ao clicar no cabeçalho", async () => {
    const user = userEvent.setup();
    const aoOrdenar = vi.fn();
    const { container } = montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
      onSortModelChange: aoOrdenar,
    });

    await user.click(screen.getByRole("columnheader", { name: /Nome/ }));

    // Emitir sem processar é o contrato inteiro: o clique vira request da tela.
    expect(aoOrdenar).toHaveBeenCalledWith([
      { field: "nome", direction: "asc" },
    ]);
    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa", "Mike"]);
  });

  it("continua emitindo a busca ao digitar", async () => {
    const user = userEvent.setup();
    const aoBuscar = vi.fn();
    const { container } = montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
      onSearchChange: aoBuscar,
    });

    await user.type(screen.getByLabelText("Buscar"), "Al");

    expect(aoBuscar).toHaveBeenCalledWith("Al");
    expect(nomesNaTela(container)).toEqual(["Zulu", "Alfa", "Mike"]);
  });
});

describe("DataTable — paginationMode: 'server' e o total", () => {
  it("usa o `rowCount` como total do rodapé", () => {
    const { container } = montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
    });

    expect(rangeDoRodape(container)).toBe("1–3 de 300");
    // E a última página existe, que é o que torna o rodapé navegável.
    expect(screen.queryByLabelText("Página 100")).not.toBeNull();
  });

  it("sem `rowCount`, degrada pro tamanho do lote em vez de inventar", () => {
    const { container } = montar({ paginationMode: "server" });

    expect(rangeDoRodape(container)).toBe("1–3 de 3");
  });

  it("lote vazio com `rowCount` alto NÃO afirma 'nenhum dado'", () => {
    // O vazio da PÁGINA não é o vazio do conjunto. Com `fetchData` o DataTable
    // já decide isso pelo total; aqui passa a decidir igual.
    montar({
      rows: [],
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
    });

    expect(estadoVazio()).toBeNull();
  });

  it("lote vazio com `rowCount` zero segue afirmando 'nenhum dado'", () => {
    montar({ rows: [], paginationMode: "server", rowCount: 0 });

    expect(estadoVazio()).not.toBeNull();
  });
});

describe("DataTable — paginationMode: o export sabe que só tem a página", () => {
  async function abrirMenuDeOpcoes(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Opções" }));
    return screen.findByRole("menu");
  }

  it("sem a prop, o menu oferece 'Todos' — e é verdade", async () => {
    const user = userEvent.setup();
    montar({ toolbar: { enableExport: true } });

    const menu = await abrirMenuDeOpcoes(user);

    expect(menu.textContent).toContain("Todos");
  });

  it("'server' troca 'Todos' por 'Página atual'", async () => {
    const user = userEvent.setup();
    montar({
      paginationMode: "server",
      rowCount: TOTAL_NO_SERVIDOR,
      toolbar: { enableExport: true },
    });

    const menu = await abrirMenuDeOpcoes(user);

    // O exporter só tem o lote na mão (`rowsAll` = as rows passadas = a página).
    // Oferecer "Todos" prometeria 300 linhas e entregaria 3.
    expect(menu.textContent).toContain("Página atual");
    expect(menu.textContent).not.toContain("Todos");
  });
});

describe("DataTable — paginationMode convive com fetchData", () => {
  it("com `fetchData` presente, `paginationMode` é inerte — ele já é server mode", async () => {
    // Os dois caminhos de server mode não se somam: `fetchData` vence `rows`
    // (já documentado), e esta prop manda em `rows`. Quem passar os dois recebe
    // o comportamento do `fetchData`, não um terceiro.
    const resolvers: Array<(r: GridFetchResult<Row>) => void> = [];
    const fetchData = (_p: GridFetchParams): Promise<GridFetchResult<Row>> =>
      new Promise((resolve) => {
        resolvers.push(resolve);
      });

    const { container } = render(
      <DataTable<Row>
        rows={PAGINA}
        fetchData={fetchData}
        paginationMode="server"
        columns={COLUNAS}
        getRowId={(r) => r.id}
        paginationConfig={{
          enabled: true,
          initialPageSize: 3,
          pageSizeOptions: [3],
        }}
      />,
    );

    await screen.findByLabelText("Carregando dados");
    const resolve = resolvers.shift()!;
    await act(async () => {
      resolve({ data: [{ id: "1", nome: "Mike" }], total: 42 });
    });

    // O que está na tela é a resposta do fetch, não as `rows` locais.
    expect(nomesNaTela(container)).toEqual(["Mike"]);
    // "1–3", não "1–1": o range é ARITMÉTICA sobre `pageSize` × `page`, nunca
    // uma contagem do corpo. Vale pro `paginationMode="server"` também — se o
    // `pageSize` da tabela não for o do servidor, o texto mente (está na JSDoc).
    expect(rangeDoRodape(container)).toBe("1–3 de 42");
  });
});
