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
import { dataTableStyles } from "./data-table.styles";
import { useDataTableContext } from "./context/data-table-context";

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

/* ── Client mode (`rows` + `loading`) ─────────────────────────────────────
   O `loadingMode` NÃO é prop de server mode — o guard do controller olha
   `effectiveRows.length`, que em client mode vem do processor sobre `rows`.
   Aqui "resultado anterior" é o que o CONSUMIDOR ainda está passando em
   `rows` enquanto levanta o `loading`: é ele que preserva, não o DS. */
function elementoClient(props: Partial<DataTableProps<Row>>) {
  return (
    <DataTable<Row>
      rows={PAGINA_1}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      paginationConfig={{
        enabled: true,
        initialPageSize: 2,
        pageSizeOptions: [2],
      }}
      {...props}
    />
  );
}

function montarClient(props: Partial<DataTableProps<Row>> = {}) {
  const view = render(elementoClient(props));
  return {
    ...view,
    /** Levanta o `loading` mantendo tudo o mais igual — o refetch do consumidor. */
    carregar: (extra: Partial<DataTableProps<Row>> = {}) =>
      view.rerender(elementoClient({ ...props, loading: true, ...extra })),
  };
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

/* A live region `sr-only` do keep. Procurada pelo `.sr-only` e não por
   `role="status"`: o esqueleto do corpo e o dnd-kit também expõem esse role, e
   um seletor que casa três coisas não sustenta uma afirmação sobre uma. */
const liveRegion = (container: HTMLElement) =>
  container.querySelector('span.sr-only[role="status"]');
/** `null` = a região nem existe · `""` = existe e está calada. */
const textoAnunciado = (container: HTMLElement) =>
  liveRegion(container)?.textContent ?? null;
/** O texto "1–25 de 100 rows" do rodapé real — some durante o keep. */
const rangeDoRodape = (container: HTMLElement) =>
  [...container.querySelectorAll("footer span")].some((e) =>
    /\d+\s*–\s*\d+\s+de\s+\d+/.test(e.textContent ?? ""),
  );

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

  /* O rodapé NÃO é bloco atômico. Setas e números dizem pra onde o clique leva
     — isso continua verdade durante o vôo. O TEXTO do range diz o que está na
     tela, e aí mente: `page` já andou, as linhas não. Só ele sai. */

  it("`keep` esconde o range do rodapé — e só ele", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar({ loadingMode: "keep" });

    await responder(PAGINA_1);
    expect(rangeDoRodape(container)).toBe(true);

    await user.click(botaoPagina(2)!);

    // O texto que afirmaria "26–50" sobre as linhas 1–2 some…
    expect(rangeDoRodape(container)).toBe(false);
    // …e os controles, que não mentem, ficam.
    expect(botaoPagina(1)).not.toBeNull();
    expect(screen.queryAllByLabelText("Linhas").length).toBeGreaterThan(0);

    // Volta assim que ele descreve o que está na tela de novo.
    await responder(PAGINA_2);
    expect(rangeDoRodape(container)).toBe(true);
  });

  it("sem a prop, o range nunca é escondido por este caminho", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar();

    await responder(PAGINA_1);
    expect(rangeDoRodape(container)).toBe(true);

    await user.click(botaoPagina(2)!);
    // Em vôo o rodapé inteiro é esqueleto — não há range a esconder…
    expect(rodapeEsqueleto()).not.toBeNull();

    await responder(PAGINA_2);
    // …e ele volta inteiro, com range, exatamente como antes da prop existir.
    expect(rangeDoRodape(container)).toBe(true);
  });

  /* ── Live region (o ANÚNCIO) ────────────────────────────────────────────
     `aria-busy` ANOTA, não ANUNCIA. No default o leitor de tela é avisado
     porque o `DataTableLoading` é `role="status"`; mantendo o corpo esse aviso
     sumiria, e o usuário teria MENOS sinal no caminho em que a tela mente mais.
     A região é montada junto com a prop e fica calada fora do vôo — live region
     que nasce com texto não é anunciada de forma confiável. */

  it("`keep` anuncia que as linhas estão defasadas — e CALA na resposta", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar({ loadingMode: "keep" });

    await responder(PAGINA_1);
    // Existe (pré-montada, pra que a mutação seja anunciada) e está calada.
    expect(liveRegion(container)).not.toBeNull();
    expect(textoAnunciado(container)).toBe("");

    await user.click(botaoPagina(2)!);
    expect(textoAnunciado(container)).toMatch(/resultado anterior/i);

    // ⚠️ O que trava a regressão de verdade: resposta chegou, anúncio LIMPO.
    // Texto velho numa live region é relido por parte dos leitores de tela.
    await responder(PAGINA_2);
    expect(textoAnunciado(container)).toBe("");
  });

  it("sem a prop, não existe live region nova — o esqueleto já é o anúncio", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar();

    await responder(PAGINA_1);
    expect(liveRegion(container)).toBeNull();

    await user.click(botaoPagina(2)!);

    expect(liveRegion(container)).toBeNull();
    // O anúncio do caminho antigo é o próprio esqueleto, que é role=status.
    expect(corpoEsqueleto()!.getAttribute("role")).toBe("status");
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

  /* ── Client mode ────────────────────────────────────────────────────────
     A USAGE AFIRMA que o `loadingMode` vale nos dois modos. Até estes três
     testes isso era raciocínio sobre o código (o guard olha
     `effectiveRows.length`, que não sabe de onde as linhas vieram), e não
     medição — ou seja, uma garantia escrita numa superfície que o consumidor
     lê, sustentada por nada. É o modo de falha que esta série persegue.

     ⚠️ A semântica NÃO é a mesma, e isso importa na doc: em server mode quem
     preserva o resultado anterior é o `useDataTableQuery`; em client mode quem
     preserva é o CONSUMIDOR, que continua passando `rows` enquanto levanta o
     `loading`. Se ele zerar `rows` junto, não há o que manter — e o terceiro
     teste trava justamente esse caso. */

  it("client mode: sem a prop, `loading` troca o corpo pelo esqueleto, como hoje", () => {
    const { carregar } = montarClient();

    expect(temTexto("Alfa")).toBe(true);

    carregar();

    expect(corpoEsqueleto()).not.toBeNull();
    expect(rodapeEsqueleto()).not.toBeNull();
    expect(temTexto("Alfa")).toBe(false);
  });

  it("client mode: `keep` mantém as linhas que o consumidor segue passando", () => {
    const { container, carregar } = montarClient({ loadingMode: "keep" });

    expect(ariaBusyDaRaiz(container)).toBeNull();

    carregar();

    expect(corpoEsqueleto()).toBeNull();
    expect(rodapeEsqueleto()).toBeNull();
    expect(temTexto("Alfa")).toBe(true);
    expect(temTexto("Beta")).toBe(true);
    expect(ariaBusyDaRaiz(container)).toBe("true");
  });

  it("client mode: `keep` sem linha nenhuma pra manter cai no esqueleto", () => {
    const { container, carregar } = montarClient({ loadingMode: "keep" });

    // O consumidor zerou `rows` junto com o `loading` (ou é o primeiro load):
    // manter o corpo aqui seria mostrar vazio, que é pior que o esqueleto.
    carregar({ rows: [] });

    expect(corpoEsqueleto()).not.toBeNull();
    expect(rodapeEsqueleto()).not.toBeNull();
    expect(ariaBusyDaRaiz(container)).toBeNull();
  });
});

/* ──────────────────────────────────────────────────────────────────────────
   P8 — as linhas mantidas precisam de um sinal VISUAL.

   O `keep` resolveu o "piscar" e criou um segundo problema: por ~500ms a tela
   mostra as linhas da página anterior sem nada que diga isso. O `aria-busy` e
   a live region avisam quem usa leitor de tela; quem ENXERGA não recebe nada —
   e o rodapé já andou de página, então a tela inteira se comporta como se o
   novo lote tivesse chegado, menos as linhas.

   ⚠️ **Por que o sinal NÃO é esmaecer as linhas**, que é o que se propõe
   primeiro (a própria pendência sugere `opacity:.6` no `role="rowgroup"`):
   `opacity` é a única opção que mexe no contraste de texto que o DS não
   escreve — a célula vem de `render` do consumidor. Medido sobre os tokens
   gerados, no tema CLARO, para `text-fg-muted` (que é o VALOR da célula no
   `type: "date"`, não um subtítulo decorativo) sobre `bg-bg-table`:

       opacidade   1.00 → 6.01:1 AA     0.90 → 4.77:1 AA
                   0.88 → 4.56:1 AA     0.85 → 4.27:1 ✗
                   0.80 → 3.83:1 ✗      0.60 → 2.57:1 ✗

   O piso para continuar AA (4.5:1) é **0.88**. Um esmaecimento de 12% não é
   sinal; qualquer esmaecimento que SEJA sinal rebaixa texto legível. E um
   fundo também não serve: `bg-bg-muted` resolve pro MESMO hex de
   `bg-bg-table-row-hover` nos dois temas (#f6f6f6 claro, #222222 escuro) —
   linha defasada ficaria idêntica a linha sob o mouse.

   O sinal escolhido é uma régua de 3px em `bg-bg-brand` presa no topo do
   cartão, desenhada em `::before`: não ocupa layout (zero deslocamento, que é
   justamente o que o `keep` existe pra evitar), não toca em nenhum texto, e
   mede 5.06:1 (claro) / 7.63:1 (escuro) contra `bg-bg-table` — acima do piso
   de 3:1 de objeto gráfico (WCAG 1.4.11).

   O que estes testes travam:
     1. **O caminho antigo.** Sem `loadingMode="keep"` nenhum elemento ganha o
        sinal, em instante nenhum. É a regra do lote.
     2. O sinal aparece SÓ enquanto `isKeepingPreviousRows` é verdade.
     3. O sinal não cobra nada das linhas — nem `opacity`, nem
        `pointer-events-none`, nem `cursor-not-allowed`. É o que o separa de
        `disabled`: linha defasada continua clicável e selecionável.
     4. A rota React de customização existe — `isKeepingPreviousRows` no
        `DataTableContextValue`, que é público via `useDataTableContext`.
   ────────────────────────────────────────────────────────────────────────── */

/** O cartão da tabela — `role="grid"` do primitivo `Table`. */
const grade = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[role="grid"]');

/* As classes DISTINTIVAS do sinal: só as do pseudo-element. O slot também traz
   `relative`, que metade do DOM tem — procurar por ela acusaria qualquer coisa.
   Lidas do próprio slot, não copiadas: assim o teste segue o estilo se ele
   mudar de valor, mas continua exigindo que ele seja APLICADO. */
const CLASSES_DO_SINAL = dataTableStyles()
  .staleRows()
  .split(/\s+/)
  .filter((c) => c.startsWith("before:"));

const temSinal = (el: Element | null) =>
  !!el && CLASSES_DO_SINAL.every((c) => el.classList.contains(c));

/** Alguém, em qualquer lugar da árvore, carrega alguma classe do sinal? */
const algumElementoComSinal = (container: HTMLElement) =>
  [...container.querySelectorAll("*")].some((el) =>
    CLASSES_DO_SINAL.some((c) => el.classList.contains(c)),
  );

/** Sonda que lê o context público de dentro de uma célula. */
function SondaContexto() {
  const ctx = useDataTableContext<Row>();
  return (
    <span data-testid="sonda">{String(ctx.isKeepingPreviousRows)}</span>
  );
}

const COLUNAS_COM_SONDA: DataTableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "nome", headerName: "Nome", render: () => <SondaContexto /> },
];

const lidoPelaSonda = () =>
  screen.queryAllByTestId("sonda")[0]?.textContent ?? null;

describe("DataTable — sinal visual das linhas defasadas (P8)", () => {
  /* Guarda-chuva: se o slot ficar vazio, todas as asserções de "tem o sinal"
     passariam por vacuidade (`[].every(...)` é true). */
  it("o slot do sinal é uma régua de 3px na cor de marca — e não um esmaecimento", () => {
    const sinal = dataTableStyles().staleRows();
    const tokens = sinal.split(/\s+/).filter(Boolean);

    expect(CLASSES_DO_SINAL.length).toBeGreaterThanOrEqual(3);
    expect(tokens).toContain("before:h-[3px]");
    expect(tokens).toContain("before:bg-bg-brand");
    // Fora do fluxo: o sinal não pode empurrar a tabela 3px pra baixo — o
    // `keep` existe justamente pra que nada se mexa durante o vôo.
    expect(tokens).toContain("before:absolute");

    // E nada da gramática de `disabled` (opacity-50 + pointer-events-none +
    // cursor-not-allowed) nem esmaecimento de qualquer força.
    expect(tokens.filter((t) => /opacity-/.test(t))).toEqual([]);
    expect(tokens).not.toContain("pointer-events-none");
    expect(tokens).not.toContain("cursor-not-allowed");
  });

  it("`keep` em vôo marca a grade — e só enquanto ela está defasada", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar({ loadingMode: "keep" });

    await responder(PAGINA_1);
    expect(temSinal(grade(container))).toBe(false);

    await user.click(botaoPagina(2)!);
    // As linhas antigas seguem na tela (é o ponto do `keep`) — agora COM aviso.
    expect(temTexto("Alfa")).toBe(true);
    expect(temSinal(grade(container))).toBe(true);

    await responder(PAGINA_2);
    expect(temSinal(grade(container))).toBe(false);
  });

  it("sem a prop, nenhum elemento ganha o sinal em instante nenhum", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar();

    await responder(PAGINA_1);
    expect(algumElementoComSinal(container)).toBe(false);

    await user.click(botaoPagina(2)!);
    // Caminho antigo: esqueleto no corpo, e nada de sinal em lugar nenhum.
    expect(corpoEsqueleto()).not.toBeNull();
    expect(algumElementoComSinal(container)).toBe(false);

    await responder(PAGINA_2);
    expect(algumElementoComSinal(container)).toBe(false);
  });

  /* ⚠️ Os TRÊS instantes, não só o do vôo. Na primeira escrita este teste
     checava apenas depois do clique — e a prova vermelha mostrou que ali ele
     não distingue nada: no modo esqueleto a grade nem existe durante o vôo
     (o `DataTableLoading` ocupou o lugar), então "nenhum elemento com o
     sinal" é verdade mesmo com o guard do keep REMOVIDO. Era um verde que
     passava por ausência de alvo, não por ausência de sinal. */
  it("`skeleton` explícito também nunca marca nada, em instante nenhum", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar({ loadingMode: "skeleton" });

    await responder(PAGINA_1);
    expect(grade(container)).not.toBeNull();
    expect(algumElementoComSinal(container)).toBe(false);

    await user.click(botaoPagina(2)!);
    expect(algumElementoComSinal(container)).toBe(false);

    await responder(PAGINA_2);
    expect(grade(container)).not.toBeNull();
    expect(algumElementoComSinal(container)).toBe(false);
  });

  it("`keep` na PRIMEIRA carga não marca nada — não há linha defasada", async () => {
    const { container, responder } = montar({ loadingMode: "keep" });

    // Sem resultado anterior o `keep` degrada pro esqueleto; marcar um
    // esqueleto de "defasado" seria mentira do sinal.
    expect(corpoEsqueleto()).not.toBeNull();
    expect(algumElementoComSinal(container)).toBe(false);

    await responder(PAGINA_1);
    expect(algumElementoComSinal(container)).toBe(false);
  });

  it("client mode: `keep` marca a grade das linhas que o consumidor segue passando", () => {
    const { container, carregar } = montarClient({ loadingMode: "keep" });

    expect(temSinal(grade(container))).toBe(false);

    carregar();

    expect(temTexto("Alfa")).toBe(true);
    expect(temSinal(grade(container))).toBe(true);
  });

  /* O sinal não pode cobrar nada das LINHAS. Esmaecer o `rowgroup` baixaria o
     contraste de célula que o DS não escreve; `pointer-events-none` imitaria
     `disabled` e tiraria o clique e a seleção, que continuam válidos — a linha
     é velha, não inerte. A régua mora no cartão e deixa as linhas intactas. */
  it("o sinal não altera uma classe sequer das linhas", async () => {
    const user = userEvent.setup();
    const { container, responder } = montar({ loadingMode: "keep" });

    await responder(PAGINA_1);
    const corpo = container.querySelector<HTMLElement>('[role="rowgroup"]');
    const primeiraLinha = container.querySelector<HTMLElement>('[role="row"]');
    const corpoAntes = corpo!.className;
    const linhaAntes = primeiraLinha!.className;

    await user.click(botaoPagina(2)!);

    expect(
      container.querySelector<HTMLElement>('[role="rowgroup"]')!.className,
    ).toBe(corpoAntes);
    expect(
      container.querySelector<HTMLElement>('[role="row"]')!.className,
    ).toBe(linhaAntes);
  });

  /* Rota React de customização: a pendência registrava que ela NÃO existia —
     o `DataTableContextValue` não carregava a flag, e `useDataTableContext` é
     público. Com ela exposta, quem quiser outro sinal (um banner, um
     esmaecimento próprio, um overlay) compõe sem tocar no DS. */
  it("o context público expõe `isKeepingPreviousRows`", async () => {
    const user = userEvent.setup();
    const { responder } = montar({
      loadingMode: "keep",
      columns: COLUNAS_COM_SONDA,
    });

    await responder(PAGINA_1);
    expect(lidoPelaSonda()).toBe("false");

    await user.click(botaoPagina(2)!);
    expect(lidoPelaSonda()).toBe("true");

    await responder(PAGINA_2);
    expect(lidoPelaSonda()).toBe("false");
  });

  it("sem a prop, o context expõe `false` o tempo todo", async () => {
    const user = userEvent.setup();
    const { responder } = montar({ columns: COLUNAS_COM_SONDA });

    await responder(PAGINA_1);
    expect(lidoPelaSonda()).toBe("false");

    await user.click(botaoPagina(2)!);
    // Caminho antigo: corpo virou esqueleto, a sonda nem está montada.
    expect(lidoPelaSonda()).toBeNull();

    await responder(PAGINA_2);
    expect(lidoPelaSonda()).toBe("false");
  });
});
