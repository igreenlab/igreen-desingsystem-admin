/**
 * Regressão do achado ALTO do 2º review do PR #343.
 *
 * A promoção pro widget `multiSelect` built-in era desligada por um critério DEDUZIDO:
 * "o tipo declara isAnyOf/isNoneOf nos próprios operators → ele é dono do chip multi".
 * A dedução pegava dois tipos built-in que declaram o operador **para funcionar no
 * builder avançado** mas cujo widget de chip é um `<Select>` ÚNICO (`onChange` com
 * string, não array): `badge` e `user`.
 *
 * Resultado medido na branch antes do fix: coluna `badge`/`user` com operador `isAnyOf`
 * — que é exatamente o que o builder avançado gera — abria escolha única sobre um campo
 * de array, e escolher um valor substituía a lista inteira.
 *
 * O fix troca dedução por declaração (`ColumnTypeDefinition.ownsMulti`). Este teste monta
 * o DataTable REAL e conta checkboxes no popover do chip — não inspeciona o critério, que
 * é o que faria o teste concordar com o bug por construção (L-064).
 */
import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table";
import type { DataTableColumnDef, FilterModel } from "./data-table.types";
import { columnTypeRegistry } from "./column-types";

/* jsdom não tem matchMedia nem ResizeObserver, e o DataTable usa os dois.
   Nenhum teste do repo renderizava o DataTable inteiro até aqui. */
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

type Row = { id: string; status: string };

const ROWS: Row[] = [
  { id: "1", status: "ativo" },
  { id: "2", status: "pausado" },
];

const OPCOES = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" },
];

/** O operador multi é o que o builder avançado produz. */
const MODEL_ANY_OF: FilterModel = {
  logicOperator: "AND",
  items: [{ id: "f1", field: "status", operator: "isAnyOf", value: ["ativo"] }],
};

function colunas(filterType: string): DataTableColumnDef<Row>[] {
  return [
    { field: "id", headerName: "ID" },
    {
      field: "status",
      headerName: "Status",
      enableColumnFilter: true,
      filterType,
      filterOptions: OPCOES,
    },
  ];
}

/** Abre o chip e devolve quantos checkboxes o popover oferece. */
async function checkboxesDoChip(filterType: string): Promise<number> {
  render(
    <DataTable
      rows={ROWS}
      columns={colunas(filterType)}
      getRowId={(r) => r.id}
      filterModel={MODEL_ANY_OF}
      onFilterModelChange={() => {}}
      toolbar={{ enableFilters: true }}
    />,
  );
  // O chip não é <button> nem tem role — o alvo é o menor elemento cujo texto
  // começa pelo rótulo da coluna.
  const chip = Array.from(document.querySelectorAll("div,span"))
    .filter((e) => /^Status/.test(e.textContent ?? ""))
    .sort((a, b) => (a.textContent ?? "").length - (b.textContent ?? "").length)[0];
  if (!chip) throw new Error(`chip de Status não encontrado para "${filterType}"`);
  await userEvent.click(chip);
  return screen.queryAllByRole("checkbox").length;
}

describe("chip multi — a posse é declarada (ownsMulti), não deduzida dos operadores", () => {
  it("multiSelect oferece seleção múltipla (controle: prova que o harness enxerga o widget)", async () => {
    expect(await checkboxesDoChip("multiSelect")).toBeGreaterThan(0);
  });

  /* Os três abaixo declaram isAnyOf/isNoneOf nos operators e NENHUM declara
     `ownsMulti` — então todos cedem o chip multi ao widget built-in, que é o
     comportamento que a `main` sempre teve. */
  it.each(["tags", "badge", "user"])(
    "%s declara isAnyOf mas não ownsMulti → cai no multiSelect built-in",
    async (tipo) => {
      expect(await checkboxesDoChip(tipo)).toBeGreaterThan(0);
    },
  );

  it("tipo custom com ownsMulti fica com o PRÓPRIO widget — é o ponto de extensão", async () => {
    const MARCA = "widget-do-consumidor";
    columnTypeRegistry.register({
      ...columnTypeRegistry.get("multiSelect"),
      type: "meuMulti" as never,
      ownsMulti: true,
      // Sem checkbox nenhum: se a promoção sequestrar, o teste vê checkboxes.
      renderFastFilterInput: () => <div>{MARCA}</div>,
    });

    const n = await checkboxesDoChip("meuMulti");
    expect(screen.getByText(MARCA)).toBeTruthy();
    expect(n).toBe(0);
  });

  it("ownsMulti não é herdado por typo no filterType (registry cai no `text`)", async () => {
    // `meuMultII` não existe; o registry devolve `text`, cujo type !== filterType.
    // Sem a guarda, o tipo devolvido emprestaria o ownsMulti dele.
    expect(await checkboxesDoChip("meuMultII")).toBeGreaterThan(0);
  });
});
