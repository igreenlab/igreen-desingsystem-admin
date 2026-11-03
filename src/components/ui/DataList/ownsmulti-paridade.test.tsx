/**
 * Paridade do `ownsMulti` entre o DRAWER e o CHIP do mesmo `DataList`.
 *
 * O `DataListToolbar` renderiza os dois widgets de filtro: o `ToolbarSimpleFilterDrawer`
 * compartilhado (funil) e um editor de chip próprio (popover ao clicar no chip). Até esta
 * correção os dois resolviam o tipo do widget por critérios DIFERENTES:
 *
 *   drawer  →  `col.filterType ?? col.type ?? "text"`   (respeita o tipo custom)
 *   chip    →  `isMulti ? "multiSelect" : fieldDef.type` (força o built-in, sempre)
 *
 * Resultado medido: abrir o funil entregava o widget do consumidor e clicar no chip que
 * ele acabou de gerar entregava o `multiSelect` built-in. Mesmo componente, um clique de
 * distância, dois widgets.
 *
 * Os testes montam o `<DataList>` REAL e olham o que aparece na tela — não o critério,
 * que é o que faria o teste concordar com o bug por construção (L-064).
 *
 * ⚠️ `FilterableField.type` é a união FECHADA `FilterFieldType` (text|select|boolean|
 * number|date) — não existe `filterType` separado como no `DataTableColumnDef`. Um tipo
 * custom só chega ao campo por cast, aqui e no consumidor. Ver o relatório da Task 7b.
 */
import { describe, expect, it, beforeAll, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataList } from "./data-list";
import type { FilterFieldType, FilterableField } from "./data-list.types";
import type { FilterModel } from "@/components/ui/DataTable/data-table.types";
import { columnTypeRegistry } from "@/components/ui/DataTable/column-types";
import type { ListItemData } from "@/components/ui/List";

/* jsdom não tem matchMedia nem ResizeObserver — o mesmo shim do owns-multi.test do
   DataTable (a toolbar compartilhada usa os dois). */
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

beforeEach(() => {
  localStorage.clear();
});

const ITEMS: ListItemData[] = [
  { id: "1", title: "ativo" },
  { id: "2", title: "pausado" },
];

const OPCOES = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" },
];

/** Campo filtrável com o `type` pedido — cast porque a união é fechada (ver cabeçalho). */
function campo(tipo: string): FilterableField {
  return {
    id: "status",
    label: "Status",
    accessor: (it) => it.title,
    type: tipo as FilterFieldType,
    options: OPCOES,
  };
}

/** FilterModel com N items no MESMO field+operador — o formato que o drawer acumula. */
function modelo(
  operator: string,
  ...values: unknown[]
): FilterModel {
  return {
    logicOperator: "AND",
    items: values.map((value, i) => ({
      id: `f${i}`,
      field: "status",
      operator,
      value,
    })) as FilterModel["items"],
  };
}

let chave = 0;

/** Monta o DataList com o filterModel já aplicado (via persistKey → loadPersisted). */
function montar(tipo: string, model: FilterModel) {
  const persistKey = `ownsmulti-paridade-${chave++}`;
  localStorage.setItem(
    `ds-datalist:${persistKey}`,
    JSON.stringify({ search: "", filterModel: model }),
  );
  render(
    <DataList items={ITEMS} filterFields={[campo(tipo)]} persistKey={persistKey} />,
  );
}

/** Clica no chip de Status (é um `<span>` sem role — alvo é o menor nó que começa pelo rótulo). */
async function clicarNoChip() {
  const chip = Array.from(document.querySelectorAll("div,span"))
    .filter((e) => /^Status/.test(e.textContent ?? ""))
    .sort(
      (a, b) => (a.textContent ?? "").length - (b.textContent ?? "").length,
    )[0];
  if (!chip) throw new Error("chip de Status não encontrado");
  await userEvent.click(chip);
}

/** Monta, abre o chip, devolve quantos checkboxes o popover oferece. */
async function checkboxesDoChip(tipo: string, model: FilterModel) {
  montar(tipo, model);
  await clicarNoChip();
  return screen.queryAllByRole("checkbox").length;
}

/**
 * Registra um tipo custom cujos DOIS renderers marcam presença e capturam o `value`.
 * Sem checkbox nenhum: se o built-in sequestrar o widget, o teste vê checkboxes.
 */
function registrarTipo(tipo: string, ownsMulti: boolean) {
  const chip: unknown[] = [];
  const drawer: unknown[] = [];
  columnTypeRegistry.register({
    ...columnTypeRegistry.get("multiSelect"),
    type: tipo as never,
    ...(ownsMulti ? { ownsMulti: true } : {}),
    renderFastFilterInput: ({ value }) => {
      chip.push(value);
      return <div>{`chip-do-consumidor:${tipo}`}</div>;
    },
    renderFilterInput: ({ value }) => {
      drawer.push(value);
      return <div>{`drawer-do-consumidor:${tipo}`}</div>;
    },
  });
  return { chip, drawer };
}

describe("DataList — chip respeita o `ownsMulti` do tipo custom (paridade com o drawer)", () => {
  it("tipo custom com ownsMulti renderiza o widget DELE no chip do DataList", async () => {
    const tipo = "listaDona";
    registrarTipo(tipo, true);
    const n = await checkboxesDoChip(tipo, modelo("isAnyOf", ["ativo"]));
    expect(screen.getByText(`chip-do-consumidor:${tipo}`)).toBeTruthy();
    expect(n).toBe(0);
  });

  it("o widget recebe ARRAY, não o primeiro valor", async () => {
    const tipo = "listaDonaValor";
    const { chip } = registrarTipo(tipo, true);
    // Três items no MESMO field+operador — o acumulado do drawer.
    montar(tipo, modelo("isAnyOf", ["ativo"], ["pausado"], ["encerrado"]));
    await clicarNoChip();
    expect(screen.getByText(`chip-do-consumidor:${tipo}`)).toBeTruthy();
    expect(chip[chip.length - 1]).toEqual(["ativo", "pausado", "encerrado"]);
  });

  it("ownsMulti com operador de valor único também recebe ARRAY (mesmo contrato do DataTable)", async () => {
    // O flag promete "o widget lê e escreve LISTA", sem exceção por tamanho nem por
    // operador — é o que `data-table.tsx` faz (`useMulti || customOwnsMulti`).
    const tipo = "listaDonaEquals";
    const { chip } = registrarTipo(tipo, true);
    montar(tipo, modelo("equals", "ativo"));
    await clicarNoChip();
    expect(screen.getByText(`chip-do-consumidor:${tipo}`)).toBeTruthy();
    expect(chip[chip.length - 1]).toEqual(["ativo"]);
  });

  /* ── Os dois caminhos ANTIGOS: nada muda pra quem não declarou o flag ───────── */

  it("tipo custom SEM o flag continua caindo no multiSelect", async () => {
    const tipo = "listaSemDono";
    registrarTipo(tipo, false);
    const n = await checkboxesDoChip(tipo, modelo("isAnyOf", ["ativo"]));
    expect(n).toBeGreaterThan(0);
    expect(screen.queryByText(`chip-do-consumidor:${tipo}`)).toBeNull();
  });

  it("campo sem filterType custom segue idêntico", async () => {
    // `select` é built-in e nenhum built-in declara ownsMulti → multiSelect, como sempre.
    const n = await checkboxesDoChip("select", modelo("isAnyOf", ["ativo"]));
    expect(n).toBeGreaterThan(0);
  });
});

describe("DataList — drawer e chip do MESMO componente resolvem o mesmo tipo", () => {
  it("drawer e chip do MESMO DataList resolvem o mesmo tipo", async () => {
    const tipo = "listaParidade";
    registrarTipo(tipo, true);
    montar(tipo, modelo("isAnyOf", ["ativo"]));

    // 1) funil → drawer compartilhado
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }));
    expect(screen.getByText(`drawer-do-consumidor:${tipo}`)).toBeTruthy();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);

    // 2) fecha o drawer e abre o chip que ele representa
    // (o FloatingPanel tem dois "Fechar": o X do header e o botão do rodapé)
    const fechar = screen.getAllByRole("button", { name: /fechar/i });
    await userEvent.click(fechar[fechar.length - 1]);
    await clicarNoChip();
    expect(screen.getByText(`chip-do-consumidor:${tipo}`)).toBeTruthy();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});
