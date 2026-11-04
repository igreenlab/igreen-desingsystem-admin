/**
 * Task 12 (item 19 do Sólis) — `isRowExpandable`.
 *
 * Linha expansível era tudo-ou-nada: ligou `renderRowExpansion`, TODA linha da
 * coluna `expandable` ganhava chevron. O consumidor tem linhas que não têm o que
 * mostrar (pedido sem item, cliente sem contrato) e o chevron delas abria um
 * painel vazio.
 *
 * ## As três decisões desta tarefa
 *
 *   1. **Recusar tira o chevron E o clique.** Chevron que não faz nada é pior
 *      que chevron ausente — o usuário clica, nada acontece, e ele não sabe se é
 *      defeito ou se não há nada ali. Então somem juntos o `onClick`, o
 *      `aria-expanded`, o `data-expandable` e o cursor: para o leitor de tela e
 *      para o mouse, a célula recusada é uma célula comum.
 *   2. **O ESPAÇO do chevron fica reservado.** Sem espaçador, o texto da coluna
 *      gatilho dançaria ~16px entre uma linha que expande e a vizinha que não —
 *      e a leitura vertical da coluna é o que torna uma tabela legível. É a
 *      mesma escolha que `DataTableTreeToggle` já faz pro nó-folha, e está no
 *      repo desde o tree-data.
 *   3. **Linha aberta que passa a ser recusada FECHA.** O predicado lê os dados
 *      da row, então a recusa pode chegar depois da expansão (o item foi
 *      excluído, o lote foi refetchado). Deixar o painel aberto sem chevron pra
 *      fechá-lo é o estado que apaga a própria saída — L-070, o mesmo modo de
 *      falha do `disabled` na raiz do `MessageComposer`.
 *
 * ## O que estes testes travam
 *
 *   - **O caminho antigo** — sem a prop, toda linha expande, nenhuma ganha
 *      espaçador, e a célula gatilho continua com `data-expandable`/
 *      `aria-expanded`. Regra do lote: prop ausente = DOM de hoje.
 *   - **A recusa é completa** — chevron, clique e anúncio saem juntos. Um teste
 *      por saída, porque são três sítios diferentes do mesmo render.
 *   - **A recusa não é destrutiva** — o id segue no Set do controller; a linha
 *      reabre se voltar a aceitar.
 *
 * ⚠️ Asserções em `toBeNull()`/`getAttribute()`, nunca jest-dom: o
 * `vitest.setup.ts` o registra em runtime mas está FORA do `include` do
 * `tsconfig.json`, e `npm test` roda `tsc --noEmit` antes do vitest — um
 * `toBeInTheDocument` derrubaria a suíte inteira antes de rodar teste nenhum.
 *
 * ⚠️ Alinhamento é estrutura AQUI e pixel NO BROWSER. jsdom não faz layout:
 * estes testes provam que o espaçador existe e carrega o MESMO token de tamanho
 * do chevron (`size-icon-sm`). Que os dois ocupem a mesma largura renderizada é
 * medição de tela, e está no relatório.
 */
import { describe, expect, it, beforeAll, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table";
import type { DataTableColumnDef, DataTableProps } from "./data-table.types";

/* jsdom não tem matchMedia (o DataTable usa pro card mode). Mesmo preâmbulo de
   `processing-mode.test.tsx`; o ResizeObserver já vem do vitest.setup. */
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

type Pedido = { id: string; cliente: string; itens: number };

/** Alfa é a linha SEM nada pra mostrar — a que o predicado recusa. */
const PEDIDOS: Pedido[] = [
  { id: "p1", cliente: "Zulu", itens: 2 },
  { id: "p2", cliente: "Alfa", itens: 0 },
  { id: "p3", cliente: "Mike", itens: 1 },
];

const COLUNAS: DataTableColumnDef<Pedido>[] = [
  { field: "cliente", headerName: "Cliente", expandable: true },
  { field: "itens", headerName: "Itens" },
];

/** O predicado da tarefa: só expande quem tem item. Recusa a Alfa. */
const SO_QUEM_TEM_ITEM = (row: Pedido) => row.itens > 0;

function montar(props: Partial<DataTableProps<Pedido>> = {}) {
  return render(
    <DataTable<Pedido>
      rows={PEDIDOS}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      renderRowExpansion={({ row }) => <div>Detalhe de {row.cliente}</div>}
      paginationConfig={{ enabled: false }}
      {...props}
    />,
  );
}

/* ── Leitores de DOM ──────────────────────────────────────────────────────
   A célula gatilho é a da coluna `cliente` (a marcada `expandable`) DENTRO da
   linha daquele cliente. Ancorar pelo `data-field` em vez de por posição: a
   ordem das colunas é reconfigurável e um índice fixo mentiria em silêncio. */
function celulaGatilho(container: HTMLElement, cliente: string): HTMLElement {
  const linha = [...container.querySelectorAll('[role="row"]')].find(
    (el) =>
      el.getAttribute("data-row-expansion") !== "true" &&
      (el.textContent ?? "").includes(cliente),
  );
  if (!linha) throw new Error(`linha de ${cliente} não está na tela`);
  const celula = linha.querySelector<HTMLElement>('[data-field="cliente"]');
  if (!celula) throw new Error(`célula gatilho de ${cliente} não existe`);
  return celula;
}

/** Quantos painéis de detalhe estão abertos (o marker do `expandRows`). */
function paineisAbertos(container: HTMLElement): number {
  return container.querySelectorAll('[data-row-expansion="true"]').length;
}

const temChevron = (celula: HTMLElement) =>
  celula.querySelector("svg") !== null;
const espacador = (celula: HTMLElement) =>
  celula.querySelector<HTMLElement>("[data-expand-spacer]");

/* ────────────────────────────────────────────────────────────────────────── */

describe("DataTable — isRowExpandable: o caminho antigo (prop ausente)", () => {
  it("sem a prop, TODA linha mostra chevron", () => {
    const { container } = montar();

    for (const cliente of ["Zulu", "Alfa", "Mike"]) {
      expect(temChevron(celulaGatilho(container, cliente))).toBe(true);
    }
  });

  it("sem a prop, NENHUMA linha ganha espaçador — o chevron ocupa o lugar", () => {
    const { container } = montar();

    expect(container.querySelectorAll("[data-expand-spacer]").length).toBe(0);
  });

  it("sem a prop, a célula gatilho anuncia que expande", () => {
    const { container } = montar();

    const celula = celulaGatilho(container, "Alfa");
    expect(celula.getAttribute("data-expandable")).toBe("true");
    expect(celula.getAttribute("aria-expanded")).toBe("false");
  });

  it("sem a prop, clicar em qualquer linha abre o painel — inclusive a sem item", async () => {
    const user = userEvent.setup();
    const { container } = montar();

    await user.click(celulaGatilho(container, "Alfa"));

    expect(paineisAbertos(container)).toBe(1);
    expect(screen.queryByText("Detalhe de Alfa")).not.toBeNull();
  });

  it("predicado que aceita TODAS é indistinguível de não passar a prop", async () => {
    const user = userEvent.setup();
    const { container } = montar({ isRowExpandable: () => true });

    for (const cliente of ["Zulu", "Alfa", "Mike"]) {
      expect(temChevron(celulaGatilho(container, cliente))).toBe(true);
    }
    expect(container.querySelectorAll("[data-expand-spacer]").length).toBe(0);

    await user.click(celulaGatilho(container, "Alfa"));
    expect(paineisAbertos(container)).toBe(1);
  });
});

describe("DataTable — isRowExpandable: a linha recusada", () => {
  it("não mostra chevron — e as vizinhas continuam mostrando", () => {
    const { container } = montar({ isRowExpandable: SO_QUEM_TEM_ITEM });

    expect(temChevron(celulaGatilho(container, "Alfa"))).toBe(false);
    expect(temChevron(celulaGatilho(container, "Zulu"))).toBe(true);
    expect(temChevron(celulaGatilho(container, "Mike"))).toBe(true);
  });

  it("NÃO responde ao clique — nenhum painel abre", async () => {
    /* ⚠️ Verde por DUAS cintas: a célula não recebe `onClick` E o `finalItems`
       filtra o id recusado. Medido: nenhuma mutação de uma só delas derruba
       este teste — é o par que o mata. Os dois testes vizinhos medem cada
       cinta sozinha. */
    const user = userEvent.setup();
    const { container } = montar({ isRowExpandable: SO_QUEM_TEM_ITEM });

    await user.click(celulaGatilho(container, "Alfa"));

    expect(paineisAbertos(container)).toBe(0);
    expect(screen.queryByText("Detalhe de Alfa")).toBeNull();
  });

  it("não anuncia `aria-expanded` nem `data-expandable` — o leitor de tela não promete expansão", () => {
    const { container } = montar({ isRowExpandable: SO_QUEM_TEM_ITEM });

    const celula = celulaGatilho(container, "Alfa");
    expect(celula.getAttribute("data-expandable")).toBeNull();
    expect(celula.getAttribute("aria-expanded")).toBeNull();
  });

  it("o clique na recusada não MEXE no estado — com `singleExpand`, não fecha a que está aberta", async () => {
    /* ⚠️ Este teste existe por causa do que a mutação mostrou: "nenhum painel
       abre" tem DUAS cintas independentes — o `onClick` que não é instalado na
       célula e o filtro do `finalItems`. Cada uma sozinha já esconde o painel,
       então nenhuma mutação de UMA delas derruba aquele teste; ele só morre no
       par. Quem mede a cinta do clique sozinha é este, porque o efeito aqui é
       de ESTADO, não de render: com `singleExpand`, um toggle fantasma na linha
       recusada fecharia a linha que o usuário tinha aberto. */
    const user = userEvent.setup();
    const aoMudar = vi.fn();
    const { container } = montar({
      isRowExpandable: SO_QUEM_TEM_ITEM,
      singleExpand: true,
      defaultExpandedRowIds: ["p1"],
      onExpandedRowIdsChange: aoMudar,
    });
    expect(paineisAbertos(container)).toBe(1);

    await user.click(celulaGatilho(container, "Alfa"));

    expect(aoMudar).not.toHaveBeenCalled();
    expect(paineisAbertos(container)).toBe(1);
    expect(screen.queryByText("Detalhe de Zulu")).not.toBeNull();
  });

  it("volta a ser célula comum: o clique nela chega no `onRowClick`", async () => {
    // Consequência direta de tirar o `onClick` (que fazia `stopPropagation`).
    // É o comportamento certo — a célula recusada não tem mais função própria —
    // mas é observável, então está travado aqui e documentado na USAGE.
    const user = userEvent.setup();
    const aoClicarNaLinha = vi.fn();
    const { container } = montar({
      isRowExpandable: SO_QUEM_TEM_ITEM,
      onRowClick: aoClicarNaLinha,
    });

    await user.click(celulaGatilho(container, "Alfa"));

    expect(aoClicarNaLinha).toHaveBeenCalledWith(PEDIDOS[1]);
  });

  it("a linha ACEITA ao lado continua expandindo normalmente", async () => {
    const user = userEvent.setup();
    const { container } = montar({ isRowExpandable: SO_QUEM_TEM_ITEM });

    await user.click(celulaGatilho(container, "Zulu"));

    expect(paineisAbertos(container)).toBe(1);
    expect(screen.queryByText("Detalhe de Zulu")).not.toBeNull();
  });

  it("o predicado recebe a row inteira", () => {
    const espiao = vi.fn((row: Pedido) => row.itens > 0);
    montar({ isRowExpandable: espiao });

    expect(espiao).toHaveBeenCalledWith(PEDIDOS[0]);
    expect(espiao).toHaveBeenCalledWith(PEDIDOS[1]);
    expect(espiao).toHaveBeenCalledWith(PEDIDOS[2]);
  });
});

describe("DataTable — isRowExpandable: alinhamento da coluna gatilho", () => {
  it("a célula recusada reserva o espaço do chevron, com o MESMO token de tamanho", () => {
    const { container } = montar({ isRowExpandable: SO_QUEM_TEM_ITEM });

    const vazio = espacador(celulaGatilho(container, "Alfa"));
    expect(vazio).not.toBeNull();
    // `size-icon-sm` é a classe do próprio `<ChevronRight>` acima. Divergir aqui
    // é o defeito: o espaçador existiria e alinharia errado, o que é pior que
    // não existir — some do radar e some do teste.
    expect(vazio!.className).toContain("size-icon-sm");
    expect(vazio!.className).toContain("shrink-0");
  });

  it("a célula que ACEITA não ganha espaçador — seria dois espaços", () => {
    const { container } = montar({ isRowExpandable: SO_QUEM_TEM_ITEM });

    expect(espacador(celulaGatilho(container, "Zulu"))).toBeNull();
  });

  it("o espaçador é `aria-hidden` — espaço reservado não é conteúdo", () => {
    const { container } = montar({ isRowExpandable: SO_QUEM_TEM_ITEM });

    expect(
      espacador(celulaGatilho(container, "Alfa"))!.getAttribute("aria-hidden"),
    ).toBe("true");
  });
});

describe("DataTable — isRowExpandable: a recusa não prende (L-070)", () => {
  it("linha ABERTA que passa a ser recusada fecha o painel", () => {
    // O painel ficaria aberto sem chevron pra fechá-lo: a saída apagada.
    const { container, rerender } = render(
      <DataTable<Pedido>
        rows={PEDIDOS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        renderRowExpansion={({ row }) => <div>Detalhe de {row.cliente}</div>}
        defaultExpandedRowIds={["p2"]}
        paginationConfig={{ enabled: false }}
      />,
    );
    expect(paineisAbertos(container)).toBe(1);

    rerender(
      <DataTable<Pedido>
        rows={PEDIDOS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        renderRowExpansion={({ row }) => <div>Detalhe de {row.cliente}</div>}
        defaultExpandedRowIds={["p2"]}
        isRowExpandable={SO_QUEM_TEM_ITEM}
        paginationConfig={{ enabled: false }}
      />,
    );

    expect(paineisAbertos(container)).toBe(0);
    expect(screen.queryByText("Detalhe de Alfa")).toBeNull();
  });

  it("`defaultExpandedRowIds` com id recusado não abre painel nenhum", () => {
    const { container } = montar({
      defaultExpandedRowIds: ["p2"],
      isRowExpandable: SO_QUEM_TEM_ITEM,
    });

    expect(paineisAbertos(container)).toBe(0);
  });

  it("o id NÃO é descartado: a linha reabre quando volta a aceitar", () => {
    // Recusar é decisão de RENDER, não de estado. Se o predicado apagasse o id,
    // o lote seguinte reabriria a tela com tudo fechado sem o usuário ter
    // fechado nada.
    const props = {
      rows: PEDIDOS,
      columns: COLUNAS,
      getRowId: (r: Pedido) => r.id,
      renderRowExpansion: ({ row }: { row: Pedido }) => (
        <div>Detalhe de {row.cliente}</div>
      ),
      defaultExpandedRowIds: ["p2"],
      paginationConfig: { enabled: false },
    };
    const { container, rerender } = render(
      <DataTable<Pedido> {...props} isRowExpandable={SO_QUEM_TEM_ITEM} />,
    );
    expect(paineisAbertos(container)).toBe(0);

    rerender(<DataTable<Pedido> {...props} isRowExpandable={() => true} />);

    expect(paineisAbertos(container)).toBe(1);
    expect(screen.queryByText("Detalhe de Alfa")).not.toBeNull();
  });
});
