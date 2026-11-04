/**
 * Task 10 (itens 5a e 5b do Sólis) — `loadingMode: "skeleton" | "keep"`.
 *
 * Em server mode, trocar de página PISCA: o corpo inteiro vira esqueleto enquanto
 * o `fetchData` da página seguinte não responde. O consumidor quer manter as linhas
 * anteriores no lugar até a próxima página chegar.
 *
 * ⚠️ **O dado já existe.** `use-data-table-query.ts` faz `setIsLoading(true)` e NÃO
 * limpa `data` — o resultado anterior continua no state o tempo todo. Quem descarta
 * é o render do `data-table.tsx`, que troca o corpo pelo esqueleto assim que
 * `isLoading` fica true. Então isto não é "guardar o dado": é parar de jogá-lo fora.
 *
 * O que estes testes travam, nesta ordem de importância:
 *
 *   1. **O caminho antigo.** Sem a prop, corpo E rodapé viram esqueleto durante o
 *      refetch, byte por byte como antes. É a regra do lote: prop ausente =
 *      comportamento de hoje.
 *   2. **`"keep"` mantém as linhas** durante o refetch — nem esqueleto, nem corpo
 *      vazio, nem "nenhum resultado".
 *   3. **`aria-busy` no que ficou.** Linha velha sem aviso é pior que esqueleto: o
 *      leitor de tela (e o teste automatizado do consumidor) não tem como saber que
 *      aquilo é conteúdo defasado. O esqueleto dizia isso por si (`DataTableLoading`
 *      já tem `aria-busy`); mantendo o corpo, alguém precisa dizer.
 *   4. **A PRIMEIRA carga** (Review Focus #5) — não existe linha anterior pra manter,
 *      e cair em corpo vazio seria PIOR que o esqueleto. `"keep"` degrada pro
 *      esqueleto sozinho, sem o consumidor ter que alternar a prop no primeiro render.
 *   5. **O rodapé acompanha o corpo.** O esqueleto do rodapé existe pra não mostrar
 *      "1 página" enquanto o `fetchData` responde — um problema que só existe quando
 *      NÃO há total anterior. Com linhas mantidas há total anterior, e trocar o
 *      rodapé por esqueleto sob linhas reais tiraria da mão do usuário justamente o
 *      controle que ele acabou de clicar.
 */
import { describe, expect, it, beforeAll, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table";
import type {
  DataTableColumnDef,
  DataTableProps,
  GridFetchParams,
  GridFetchResult,
} from "./data-table.types";

/* jsdom não tem matchMedia (o DataTable usa pro card mode). Mesmo preâmbulo de
   `simple-filter-controlado.test.tsx`; o ResizeObserver já vem do vitest.setup. */
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

const PAGINA_1: Row[] = [
  { id: "1", nome: "Alfa" },
  { id: "2", nome: "Beta" },
];
const PAGINA_2: Row[] = [
  { id: "3", nome: "Gama" },
  { id: "4", nome: "Delta" },
];
const TOTAL = 4;

const COLUNAS: DataTableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "nome", headerName: "Nome" },
];

/* ── fetchData controlado pelo teste ──────────────────────────────────────
   O ponto inteiro da tarefa é o que a tela mostra ENQUANTO a promise está em
   vôo. Um mock com `setTimeout` deixa esse instante à mercê do scheduler; aqui
   a promise só resolve quando o teste mandar. */
function criarFetchControlado() {
  const pendentes: Array<(r: GridFetchResult<Row>) => void> = [];
  // Identidade estável — server mode refetcha em loop com fetchData novo a cada render.
  const fetchData = (_params: GridFetchParams): Promise<GridFetchResult<Row>> =>
    new Promise<GridFetchResult<Row>>((resolve) => {
      pendentes.push(resolve);
    });
  async function responder(data: Row[], total = TOTAL) {
    const resolve = pendentes.shift();
    if (!resolve) throw new Error("responder() sem request pendente");
    await act(async () => {
      resolve({ data, total });
    });
  }
  return { fetchData, pendentes, responder };
}

function montar(props: Partial<DataTableProps<Row>> = {}) {
  const { fetchData, pendentes, responder } = criarFetchControlado();
  const view = render(
    <DataTable<Row>
      fetchData={fetchData}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      paginationConfig={{
        enabled: true,
        initialPageSize: 2,
        pageSizeOptions: [2],
      }}
      {...props}
    />,
  );
  return { ...view, pendentes, responder };
}

/* Asserções em boolean/atributo cru, não em matcher do jest-dom: o
   `vitest.setup.ts` o registra em runtime, mas fica FORA do `include` do
   `tsconfig.json` ("src", "tokens") — `toBeInTheDocument` não existe pro `tsc`
   e o `npm test` reprova no typecheck antes de rodar teste nenhum. Mesma forma
   de `simple-filter-controlado.test.tsx`. */

/** O corpo-esqueleto (`DataTableLoading`) — `role="status"` + este label. */
const corpoEsqueleto = () => screen.queryByLabelText("Carregando dados");
/** O rodapé-esqueleto (`FooterTableSkeleton`). */
const rodapeEsqueleto = () => screen.queryByLabelText("Carregando paginação");
/** Um botão de página do rodapé REAL. */
const botaoPagina = (n: number) => screen.queryByLabelText(`Página ${n}`);
const temTexto = (t: string) => screen.queryAllByText(t).length > 0;
const ariaBusyDaRaiz = (container: HTMLElement) =>
  container.firstElementChild!.getAttribute("aria-busy");

describe("DataTable — loadingMode", () => {
  it("sem a prop, o refetch troca o corpo pelo esqueleto, como hoje", async () => {
    const user = userEvent.setup();
    const { responder } = montar();

    await responder(PAGINA_1);
    expect(temTexto("Alfa")).toBe(true);
    expect(corpoEsqueleto()).toBeNull();

    await user.click(botaoPagina(2)!);

    // Caminho antigo: as linhas somem e o esqueleto ocupa o corpo.
    expect(corpoEsqueleto()).not.toBeNull();
    expect(temTexto("Alfa")).toBe(false);
  });

  it("sem a prop, o rodapé também vira esqueleto durante o refetch, como hoje", async () => {
    const user = userEvent.setup();
    const { responder } = montar();

    await responder(PAGINA_1);
    expect(rodapeEsqueleto()).toBeNull();

    await user.click(botaoPagina(2)!);

    expect(rodapeEsqueleto()).not.toBeNull();
    expect(botaoPagina(2)).toBeNull();
  });

  it("`keep` mantém as linhas anteriores durante o refetch", async () => {
    const user = userEvent.setup();
    const { responder } = montar({ loadingMode: "keep" });

    await responder(PAGINA_1);
    expect(temTexto("Alfa")).toBe(true);

    await user.click(botaoPagina(2)!);

    // Em vôo: nada de esqueleto, e as linhas da página anterior seguem na tela.
    expect(corpoEsqueleto()).toBeNull();
    expect(temTexto("Alfa")).toBe(true);
    expect(temTexto("Beta")).toBe(true);

    // E quando a resposta chega, a troca acontece normalmente.
    await responder(PAGINA_2);
    expect(temTexto("Gama")).toBe(true);
    expect(temTexto("Alfa")).toBe(false);
  });

  it("`keep` marca aria-busy no corpo mantido — e só enquanto ele está defasado", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar({ loadingMode: "keep" });

    await responder(PAGINA_1);
    expect(ariaBusyDaRaiz(container)).toBeNull();

    await user.click(botaoPagina(2)!);
    expect(ariaBusyDaRaiz(container)).toBe("true");

    await responder(PAGINA_2);
    expect(ariaBusyDaRaiz(container)).toBeNull();
  });

  it("sem a prop, nada de aria-busy na raiz — o esqueleto já é o aviso", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar();

    await responder(PAGINA_1);
    await user.click(botaoPagina(2)!);

    expect(ariaBusyDaRaiz(container)).toBeNull();
    // O aviso está no esqueleto, que tem o seu próprio aria-busy.
    expect(corpoEsqueleto()!.getAttribute("aria-busy")).toBe("true");
  });

  it("`keep` na PRIMEIRA carga cai no esqueleto, não em corpo vazio", async () => {
    const { container, responder } = montar({ loadingMode: "keep" });

    // Primeira request em vôo: não existe linha anterior pra manter.
    expect(corpoEsqueleto()).not.toBeNull();
    expect(rodapeEsqueleto()).not.toBeNull();
    // E a tela NÃO afirma que não há nada — nem empty, nem "sem resultado".
    expect(screen.queryAllByText(/nenhum/i)).toEqual([]);
    expect(ariaBusyDaRaiz(container)).toBeNull();

    await responder(PAGINA_1);
    expect(temTexto("Alfa")).toBe(true);
  });

  it("`keep` mantém o rodapé navegável durante o refetch", async () => {
    const user = userEvent.setup();
    const { responder } = montar({ loadingMode: "keep" });

    await responder(PAGINA_1);
    await user.click(botaoPagina(2)!);

    // O rodapé não pisca junto com o corpo: o total anterior continua válido e o
    // controle que o usuário acabou de clicar continua na mão dele.
    expect(rodapeEsqueleto()).toBeNull();
    expect(botaoPagina(1)).not.toBeNull();
    expect(botaoPagina(2)).not.toBeNull();
    expect(screen.queryAllByLabelText("Linhas").length).toBeGreaterThan(0);
  });

  it("`skeleton` explícito é idêntico ao default", async () => {
    const user = userEvent.setup();
    const { responder } = montar({ loadingMode: "skeleton" });

    await responder(PAGINA_1);
    await user.click(botaoPagina(2)!);

    expect(corpoEsqueleto()).not.toBeNull();
    expect(rodapeEsqueleto()).not.toBeNull();
    expect(temTexto("Alfa")).toBe(false);
  });
});
