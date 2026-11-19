/**
 * A visão salva guarda o texto da busca.
 *
 * Até aqui o `saveCurrentAsView` capturava filtro, ordenação, densidade e layout, mas
 * não a busca: quem salvava "Clientes Alfa" com a busca digitada e escolhia a visão
 * depois recebia os filtros sem a busca. Relatado no Hub (HUB-99), em Contatos.
 *
 * O contrato é aditivo:
 *   - visão nova grava o texto que o usuário vê (`inputValue`), e `""` quando vazio;
 *   - aplicar visão com `search` repõe a busca e a busca chega ao resultado (linhas em
 *     client mode, `fetchData` em server mode), não só ao campo;
 *   - visão salva antes do campo existir (sem `search`) não mexe na busca atual.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useDataTableController } from "./use-data-table-controller";
import type {
  DataTableColumnDef,
  DataTableProps,
  GridFetchParams,
} from "../data-table.types";
import type { SavedView } from "../services/saved-views.types";
import { savedViewsMockService } from "../services/saved-views-mock-service";

type Row = { id: string; nome: string };

const ROWS: Row[] = [
  { id: "1", nome: "Alfa" },
  { id: "2", nome: "Beta" },
  { id: "3", nome: "Gama" },
];

const COLUNAS: DataTableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "nome", headerName: "Nome" },
];

const ESPERA = { timeout: 2000 };

function visaoAntiga(id: string): SavedView {
  return {
    id,
    name: "Antiga",
    isPublic: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    state: {
      filterModel: { items: [], logicOperator: "AND" },
      sortModel: [],
      density: "standard",
    },
  };
}

function semear(persistId: string, views: SavedView[]) {
  window.localStorage.setItem(`igreen-datatable-views:${persistId}`, JSON.stringify(views));
}

function montar(props: DataTableProps<Row>) {
  return renderHook(() => useDataTableController<Row>(props, null));
}

const nomes = (rows: Row[]) => rows.map((r) => r.nome);

beforeEach(() => {
  window.localStorage.clear();
});

describe("visão salva guarda a busca", () => {
  it("salvar com busca, limpar e escolher a visão devolve a busca e as linhas", async () => {
    const persistId = "visao-busca-client";
    const { result } = montar({ rows: ROWS, columns: COLUNAS, getRowId: (r) => r.id, persistId });
    await waitFor(() => expect(result.current.savedViews.isLoading).toBe(false));

    act(() => result.current.search.setInputValue("Alfa"));
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toEqual(["Alfa"]), ESPERA);

    let salva: SavedView | null = null;
    await act(async () => {
      salva = await result.current.saveCurrentAsView("Só Alfa");
    });
    const guardada = (await savedViewsMockService.list(persistId))[0];
    expect(guardada.state.search).toBe("Alfa");

    act(() => result.current.applyDefault());
    act(() => result.current.search.setInputValue(""));
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toEqual(["Alfa", "Beta", "Gama"]), ESPERA);

    act(() => result.current.applyViewById(salva!.id));
    expect(result.current.search.inputValue).toBe("Alfa");
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toEqual(["Alfa"]), ESPERA);
  });

  it("visão salva com a busca vazia grava \"\" e, ao ser escolhida, limpa a busca", async () => {
    const persistId = "visao-busca-vazia";
    const { result } = montar({ rows: ROWS, columns: COLUNAS, getRowId: (r) => r.id, persistId });
    await waitFor(() => expect(result.current.savedViews.isLoading).toBe(false));

    let salva: SavedView | null = null;
    await act(async () => {
      salva = await result.current.saveCurrentAsView("Tudo");
    });
    const guardada = (await savedViewsMockService.list(persistId))[0];
    expect(guardada.state.search).toBe("");

    act(() => result.current.search.setInputValue("Beta"));
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toEqual(["Beta"]), ESPERA);

    act(() => result.current.applyViewById(salva!.id));
    expect(result.current.search.inputValue).toBe("");
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toEqual(["Alfa", "Beta", "Gama"]), ESPERA);
  });

  it("visão salva antes do campo existir não mexe na busca atual", async () => {
    const persistId = "visao-busca-antiga";
    semear(persistId, [visaoAntiga("view-antiga")]);
    const { result } = montar({ rows: ROWS, columns: COLUNAS, getRowId: (r) => r.id, persistId });
    await waitFor(() => expect(result.current.savedViews.views).toHaveLength(1));

    act(() => result.current.search.setInputValue("Gama"));
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toEqual(["Gama"]), ESPERA);

    act(() => result.current.applyViewById("view-antiga"));
    expect(result.current.savedViews.currentViewId).toBe("view-antiga");
    expect(result.current.search.inputValue).toBe("Gama");
    expect(nomes(result.current.rowsToRender)).toEqual(["Gama"]);
  });

  it("em server mode a busca da visão chega ao fetchData", async () => {
    const persistId = "visao-busca-server";
    const fetchData = vi.fn(async (params: GridFetchParams) => {
      const data = ROWS.filter((r) => r.nome.includes(params.search));
      return { data, total: data.length };
    });
    const { result } = montar({ fetchData, columns: COLUNAS, getRowId: (r) => r.id, persistId });
    await waitFor(() => expect(result.current.savedViews.isLoading).toBe(false));

    act(() => result.current.search.setInputValue("Beta"));
    await waitFor(() => expect(fetchData).toHaveBeenLastCalledWith(expect.objectContaining({ search: "Beta" })), ESPERA);

    let salva: SavedView | null = null;
    await act(async () => {
      salva = await result.current.saveCurrentAsView("Só Beta");
    });

    act(() => result.current.search.setInputValue(""));
    await waitFor(() => expect(fetchData).toHaveBeenLastCalledWith(expect.objectContaining({ search: "" })), ESPERA);
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toHaveLength(3), ESPERA);

    act(() => result.current.applyViewById(salva!.id));
    await waitFor(() => expect(fetchData).toHaveBeenLastCalledWith(expect.objectContaining({ search: "Beta" })), ESPERA);
    await waitFor(() => expect(nomes(result.current.rowsToRender)).toEqual(["Beta"]), ESPERA);
  });
});
