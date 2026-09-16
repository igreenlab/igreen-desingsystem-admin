import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable } from "./data-table";
import type { DataTableColumnDef } from "./data-table.types";

/**
 * `toolbar.customLeft` prometia um slot e não era lida por nada.
 *
 * A prop existia no tipo, com doc dizendo *"Slot livre na esquerda apos search/refresh.
 * Use pra inserir custom controls"* — e `grep customLeft` em `src/components/ui/DataTable/`
 * retornava **uma única linha**: a declaração. Nenhum render a consumia.
 *
 * O efeito no consumidor é o pior tipo: ele passa o componente, o **TS aceita** (é
 * `ReactNode`), o build passa, o teste passa, e o toolbar renderiza sem o controle. Não há
 * erro pra investigar — só a conclusão errada de que "o DataTable não suporta isso".
 * Encontrado em 2026-09-16 tentando pôr um `DatePicker` de período ao lado da busca num
 * consumidor real; a alternativa (`toolbar.actions`) não serve porque `ToolbarAction` tem
 * três kinds — `button`/`dropdown`/`input` — e nenhum recebe componente arbitrário.
 *
 * A `customActions`, irmã dela, está no mesmo estado e segue sem efeito de propósito:
 * é `@deprecated` e removê-la é mudança de tipo, não correção de defeito. O que mudou
 * nela foi a mensagem, que agora diz que não faz nada.
 *
 * ⚠️ Por que o teste renderiza o `DataTable` inteiro e não o `TableToolbar`: o slot
 * `actions` do `TableToolbar` **sempre funcionou**. O defeito mora só na fiação entre os
 * dois. Um teste do `TableToolbar` isolado passaria com o bug em pé.
 */

interface Linha {
  id: string;
  nome: string;
}

const LINHAS: Linha[] = [
  { id: "1", nome: "Alfa" },
  { id: "2", nome: "Beta" },
];

const COLUNAS: DataTableColumnDef<Linha>[] = [
  { field: "nome", headerName: "Nome", type: "text" },
];

/**
 * O `DataTable` chama `useMediaQuery` (via `MenuSidebar/use-media-query`) e o corpo usa
 * `ResizeObserver`. jsdom não tem nenhum dos dois, e sem os stubs o render estoura ANTES
 * de chegar no toolbar — o teste reprovaria com o defeito já corrigido, o que o tornaria
 * inútil como gate (L-064: teste que falha por motivo alheio não é evidência).
 */
beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

function montar(extra: Record<string, unknown> = {}) {
  return render(
    <DataTable<Linha>
      rows={LINHAS}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      {...extra}
    />,
  );
}

describe("DataTable — slots de nó no toolbar", () => {
  it("renderiza o componente passado em toolbar.customLeft", () => {
    montar({
      toolbar: {
        enableSearch: true,
        customLeft: <button type="button">Mês atual</button>,
      },
    });

    expect(screen.getByRole("button", { name: "Mês atual" })).toBeTruthy();
  });

  it("aceita customLeft e actions juntos, com o customLeft primeiro", () => {
    montar({
      toolbar: {
        enableSearch: true,
        customLeft: <button type="button">Período</button>,
        actions: [
          {
            kind: "button" as const,
            id: "exportar",
            label: "Exportar",
            onClick: () => {},
          },
        ],
      },
    });

    const custom = screen.getByRole("button", { name: "Período" });
    const acao = screen.getByRole("button", { name: "Exportar" });

    expect(custom).toBeTruthy();
    expect(acao).toBeTruthy();
    // `compareDocumentPosition` em vez de índice num array de botões: o toolbar tem
    // outros botões (refresh, filtros, ⋯) e a contagem deles muda com as flags.
    expect(
      custom.compareDocumentPosition(acao) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("não quebra o toolbar quando customLeft é omitida", () => {
    montar({ toolbar: { enableSearch: true } });

    // A busca é o vizinho do slot: se a fiação do `actions` tivesse regredido pra
    // `undefined` em todo caso, ou estourado, isto cairia junto.
    expect(screen.getByPlaceholderText(/buscar/i)).toBeTruthy();
  });
});
