/**
 * P11 — o `error` do `useDataTableQuery` não era lido por ninguém.
 *
 * O hook guardava a mensagem (`:169`) e o controller nunca a mencionava (grep:
 * zero). O efeito na tela, medido: quando o `fetchData` rejeita, `isLoading`
 * desce, `data`/`total` FICAM, e a tabela renderiza as linhas antigas com o
 * rodapé na página nova — **permanentemente**, porque não há próxima resposta
 * pra corrigir o estado. Nada na tela avisa.
 *
 * É o que torna o "rodapé otimista" do `loadingMode` um estado DEFINITIVO em vez
 * de transitório. O `keep` não inventou a divergência rodapé↔corpo: ele a tornou
 * visível e passageira, enquanto o default já a produzia calada e pra sempre.
 *
 * ## O que entrou, e o que deliberadamente NÃO entrou
 *
 * Entrou ****onError****: o DS **avisa**, e o estado de erro na tela é do
 * consumidor (toast, banner, botão de tentar de novo). Não entrou um quarto slot
 * (`renderError` ao lado de `renderEmpty`/`renderLoading`/`renderNoResults`) —
 * é a regra do mantenedor: prop simples e ponto de extensão, não um motor de
 * configuração pro estado mais raro.
 *
 * Entrou também, **sem prop**, esconder o texto do range do rodapé enquanto a
 * última busca está falha. Não é exceção à régua "melhoria sem prop é mudança de
 * comportamento" — é a régua aplicada: *quem NÃO tem este defeito sente a
 * correção?* Não. Nada disto roda enquanto o `fetchData` resolve.
 *
 * ## O que estes testes travam
 *
 *   1. **O caminho antigo** — `fetchData` que RESOLVE não muda em nada: o range
 *      aparece, o `onError` não dispara. E sem a prop, nada quebra ao falhar.
 *   2. **O aviso** — `onError` recebe a mensagem do erro, uma vez.
 *   3. **O rodapé para de mentir** — o range some na falha e VOLTA na resposta
 *      seguinte (não é estado grudado).
 *   4. **Os controles ficam** — o botão de página continua lá; sumir com eles
 *      tiraria a saída do usuário (L-070).
 *   5. **Request superada não vira erro** — o guard de corrida roda ANTES, então
 *      trocar de página rápido não enche a tela do consumidor de aviso falso.
 *
 * ⚠️ Sem jest-dom: `vitest.setup.ts` está fora do `include` do `tsconfig.json`.
 */
import { createRef } from "react";
import { describe, expect, it, beforeAll, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table";
import type {
  DataTableColumnDef,
  DataTableProps,
  DataTableRef,
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

/**
 * `fetchData` que o TESTE resolve ou rejeita. O ponto é o instante entre o
 * clique e a resposta; mock com `setTimeout` deixaria isso ao scheduler.
 */
function criarFetchControlado() {
  const pendentes: Array<{
    resolve: (r: GridFetchResult<Row>) => void;
    reject: (e: unknown) => void;
  }> = [];
  const fetchData = (_p: GridFetchParams): Promise<GridFetchResult<Row>> =>
    new Promise<GridFetchResult<Row>>((resolve, reject) => {
      pendentes.push({ resolve, reject });
    });
  async function responder(data: Row[], total = TOTAL) {
    const p = pendentes.shift();
    if (!p) throw new Error("responder() sem request pendente");
    await act(async () => {
      p.resolve({ data, total });
    });
  }
  async function falhar(msg = "500 — servidor fora do ar") {
    const p = pendentes.shift();
    if (!p) throw new Error("falhar() sem request pendente");
    await act(async () => {
      p.reject(new Error(msg));
    });
  }
  /** Rejeita a request MAIS ANTIGA sem consumir as demais (teste do guard). */
  async function falharAIndiceZeroSemRemover(msg = "abortada") {
    const p = pendentes[0];
    if (!p) throw new Error("sem request pendente");
    pendentes.splice(0, 1);
    await act(async () => {
      p.reject(new Error(msg));
    });
  }
  return { fetchData, pendentes, responder, falhar, falharAIndiceZeroSemRemover };
}

function montar(props: Partial<DataTableProps<Row>> = {}) {
  const ctl = criarFetchControlado();
  const view = render(
    <DataTable<Row>
      fetchData={ctl.fetchData}
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
  return { ...view, ...ctl };
}

const temTexto = (t: string) => screen.queryAllByText(t).length > 0;
const botaoPagina = (n: number) => screen.queryByLabelText(`Página ${n}`);
/** O "1–2 de 4" do rodapé real. */
const rangeDoRodape = (container: HTMLElement) =>
  [...container.querySelectorAll("footer span")].some((e) =>
    /\d+\s*–\s*\d+\s+de\s+\d+/.test(e.textContent ?? ""),
  );

describe("DataTable — o caminho antigo (fetchData que responde) não muda", () => {
  it("com resposta normal o range aparece e o onError não dispara", async () => {
    const onError = vi.fn();
    const { container, responder } = montar({ onError });
    await responder(PAGINA_1);

    expect(temTexto("Alfa")).toBe(true);
    expect(rangeDoRodape(container)).toBe(true);
    expect(onError).not.toHaveBeenCalled();
  });

  it("SEM a prop, uma falha não quebra nada (segue renderizando as linhas)", async () => {
    const { responder, falhar } = montar();
    await responder(PAGINA_1);
    await userEvent.click(botaoPagina(2)!);
    await falhar();

    expect(temTexto("Alfa")).toBe(true);
  });
});

describe("DataTable — a falha deixa de ser invisível", () => {
  it("onError recebe a mensagem do erro", async () => {
    const onError = vi.fn();
    const { responder, falhar } = montar({ onError });
    await responder(PAGINA_1);
    await userEvent.click(botaoPagina(2)!);
    await falhar("500 — servidor fora do ar");

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe("500 — servidor fora do ar");
  });

  it("o range do rodapé SOME na falha — ele seria a única afirmação falsa", async () => {
    const { container, responder, falhar } = montar();
    await responder(PAGINA_1);
    expect(rangeDoRodape(container)).toBe(true);

    await userEvent.click(botaoPagina(2)!);
    await falhar();

    // as linhas na tela continuam sendo as da página 1…
    expect(temTexto("Alfa")).toBe(true);
    // …então "3–4 de 4" não pode estar escrito embaixo delas.
    expect(rangeDoRodape(container)).toBe(false);
  });

  it("os CONTROLES de página ficam — sumir com eles tiraria a saída", async () => {
    const { responder, falhar } = montar();
    await responder(PAGINA_1);
    await userEvent.click(botaoPagina(2)!);
    await falhar();

    expect(botaoPagina(1)).not.toBeNull();
  });

  it("o range VOLTA na resposta seguinte (não é estado grudado)", async () => {
    const { container, responder, falhar } = montar();
    await responder(PAGINA_1);
    await userEvent.click(botaoPagina(2)!);
    await falhar();
    expect(rangeDoRodape(container)).toBe(false);

    await userEvent.click(botaoPagina(1)!);
    await responder(PAGINA_1);

    expect(rangeDoRodape(container)).toBe(true);
  });
});

describe("DataTable — request superada não vira erro na tela do consumidor", () => {
  it("rejeição de request já substituída por outra NÃO chama o onError", async () => {
    // Duas requests em vôo ao mesmo tempo. O `refresh()` imperativo é o jeito
    // mais direto de obtê-las: trocar de página não serve, porque durante o
    // carregamento o rodapé vira esqueleto e o botão da página some.
    const onError = vi.fn();
    const ref = createRef<DataTableRef>();
    const ctl = criarFetchControlado();
    render(
      <DataTable<Row>
        ref={ref}
        fetchData={ctl.fetchData}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        onError={onError}
      />,
    );
    await ctl.responder(PAGINA_1);

    await act(async () => {
      ref.current!.refresh();
    });
    await act(async () => {
      ref.current!.refresh();
    });
    expect(ctl.pendentes.length).toBe(2);

    await ctl.falharAIndiceZeroSemRemover("abortada");
    expect(onError).not.toHaveBeenCalled();

    // e a request CORRENTE, quando falha, avisa normalmente
    await ctl.falhar("essa vale");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe("essa vale");
  });
});

describe("DataTable — client mode não é alcançado", () => {
  it("sem fetchData o range aparece normalmente e o onError nunca dispara", () => {
    const onError = vi.fn();
    const { container } = render(
      <DataTable<Row>
        rows={[...PAGINA_1, ...PAGINA_2]}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        onError={onError}
        paginationConfig={{
          enabled: true,
          initialPageSize: 2,
          pageSizeOptions: [2],
        }}
      />,
    );
    expect(rangeDoRodape(container)).toBe(true);
    expect(onError).not.toHaveBeenCalled();
  });
});
