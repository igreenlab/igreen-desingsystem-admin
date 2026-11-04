/**
 * Task 9 (item 18 do Sólis) — `simpleFilter.open` / `simpleFilter.onOpenChange`.
 *
 * O consumidor precisa abrir e fechar o drawer do funil POR FORA (um botão da tela
 * dele, um atalho, um deep-link). Até aqui `v2FilterOpen` era `useState` privado do
 * `DataTable` e não havia porta nenhuma — o drawer só abria pelo funil da toolbar.
 *
 * O que estes testes travam, nesta ordem de importância:
 *
 *   1. **O caminho antigo.** Sem nenhuma das duas props, o drawer abre e fecha
 *      sozinho, byte por byte como antes. É a regra do lote: prop ausente =
 *      comportamento de hoje.
 *   2. **Com `open`, a prop manda** — e manda nos DOIS sentidos: clicar no funil
 *      não abre nada, e clicar em "Fechar" não fecha nada. O estado interno deixa
 *      de decidir, não "decide junto".
 *   3. **`onOpenChange` avisa nos dois modos.** É notificação da intenção, não
 *      controle: quem só quer OBSERVAR a abertura (telemetria, badge, "o funil
 *      está aberto?") não precisa assumir o estado. Mesma forma do `showHistory`
 *      do `Gantt` (`gantt.tsx:748`), que é o precedente mais recente do repo.
 *   4. **O caso misto** (`open` sem `onOpenChange`) — L-070: o X, o Esc e o
 *      backdrop ficam inertes e o usuário não tem saída. A prop continua
 *      mandando (trocar o contrato por causa de uma segunda prop seria pior), mas
 *      sai um `console.warn` em DEV nomeando a prop e a consequência. Precedente
 *      exato no repo: `Scheduler` com `date` sem `onDateChange`
 *      (`hooks/use-scheduler-state.ts:83`).
 *
 * ⚠️ O alvo é o `DataTable` REAL, não o `ToolbarSimpleFilterDrawer` isolado — o
 * drawer SEMPRE aceitou `open`/`onOpenChange` (são props obrigatórias dele). O que
 * não existia era o `DataTable` expor. Testar o drawer direto passaria sem o fix.
 */
import { describe, expect, it, beforeAll, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table";
import type { DataTableColumnDef, DataTableProps } from "./data-table.types";

/* jsdom não tem matchMedia nem ResizeObserver, e o DataTable usa os dois.
   Mesmo preâmbulo de `owns-multi.test.tsx`. */
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
  window.ResizeObserver ??= vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

type Row = { id: string; nome: string };

const ROWS: Row[] = [
  { id: "1", nome: "Alfa" },
  { id: "2", nome: "Beta" },
];

const COLUNAS: DataTableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "nome", headerName: "Nome", enableColumnFilter: true },
];

type SimpleFilterProp = NonNullable<DataTableProps<Row>["simpleFilter"]>;

function montar(simpleFilter?: SimpleFilterProp) {
  return render(
    <DataTable
      rows={ROWS}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      toolbar={{ enableFilters: true }}
      simpleFilter={simpleFilter}
    />,
  );
}

/** O botão funil da toolbar — `ToolbarFilterButton`, `aria-label="Filtros"`. */
const funil = () => screen.getByRole("button", { name: "Filtros" });

/** O `FloatingPanel` só renderiza `role="dialog"` quando aberto. */
const drawerAberto = () => screen.queryByRole("dialog") !== null;

/** "Fechar" existe DUAS vezes (X do header + botão do rodapé) — o X é o primeiro. */
const fecharX = () => screen.getAllByRole("button", { name: "Fechar" })[0];

describe("simpleFilter — abertura controlada do drawer do funil", () => {
  it("sem as props, o drawer abre e fecha sozinho como hoje", async () => {
    montar();
    expect(drawerAberto()).toBe(false);

    await userEvent.click(funil());
    expect(drawerAberto()).toBe(true);

    await userEvent.click(fecharX());
    expect(drawerAberto()).toBe(false);
  });

  it("com `open`, quem manda é a prop — o funil não abre e o X não fecha", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DataTable
        rows={ROWS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        toolbar={{ enableFilters: true }}
        simpleFilter={{ open: false, onOpenChange }}
      />,
    );

    // `open={false}` e o usuário clica no funil: a intenção é avisada, mas o
    // estado interno NÃO abre nada por conta própria.
    await userEvent.click(funil());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(drawerAberto()).toBe(false);

    // O consumidor decide abrir.
    rerender(
      <DataTable
        rows={ROWS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        toolbar={{ enableFilters: true }}
        simpleFilter={{ open: true, onOpenChange }}
      />,
    );
    expect(drawerAberto()).toBe(true);

    // E o outro sentido: o X avisa, mas não fecha enquanto a prop disser aberto.
    onOpenChange.mockClear();
    await userEvent.click(fecharX());
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(drawerAberto()).toBe(true);
  });

  it("o callback avisa da intenção nos DOIS modos (sem `open`, só observando)", async () => {
    const onOpenChange = vi.fn();
    montar({ onOpenChange });

    await userEvent.click(funil());
    // Observar não é assumir: o drawer abriu pelo estado interno...
    expect(drawerAberto()).toBe(true);
    // ...e mesmo assim o consumidor foi avisado.
    expect(onOpenChange).toHaveBeenCalledWith(true);

    onOpenChange.mockClear();
    await userEvent.click(fecharX());
    expect(drawerAberto()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("`open` sem `onOpenChange` avisa em DEV — é a L-070, estado sem saída", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    montar({ open: true });

    const mensagens = warn.mock.calls.map((c) => String(c[0]));
    const aviso = mensagens.find((m) => m.includes("simpleFilter.open"));
    expect(aviso, `nenhum aviso citando simpleFilter.open em ${JSON.stringify(mensagens)}`)
      .toBeTruthy();
    // O aviso tem que nomear a saída que deixou de funcionar, não só a prop:
    // é o que diferencia "avisei" de "o leitor sabe o que fazer" (L-060).
    expect(aviso).toContain("onOpenChange");
  });

  it("os modos BEM formados não avisam nada (o aviso não vira ruído)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const semNada = render(
      <DataTable
        rows={ROWS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        toolbar={{ enableFilters: true }}
      />,
    );
    semNada.unmount();

    montar({ open: false, onOpenChange: () => {} });
    await userEvent.click(funil());

    const citamSimpleFilter = warn.mock.calls
      .map((c) => String(c[0]))
      .filter((m) => m.includes("simpleFilter"));
    expect(citamSimpleFilter).toEqual([]);
  });
});
