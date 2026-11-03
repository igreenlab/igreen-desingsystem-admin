/**
 * Chip de filtro MULTI do `DataList` com 2+ valores — escrita e leitura discordavam
 * sobre a forma do `FilterModel`, e o resultado era a lista VAZIA.
 *
 * Medido antes da correção, com 3 itens e um campo `select`:
 *
 *   um item, value ["ativo"]             → ["1"]        ✅ (acidente: matchOp("equals", v, ["ativo"]) coage)
 *   um item, value ["ativo","pausado"]   → []           ❌
 *   dois items, um por valor             → ["1","2"]    ✅
 *
 * As duas pontas:
 *   `data-list-toolbar.tsx` `setGroupValue` gravava UM item cujo `value` era o array inteiro;
 *   `utils/apply-filter-model.ts` monta `anyOf = group.map(g => g.value)` e compara cada
 *   `value` COMO UM TODO — isto é, espera UM ITEM POR VALOR.
 *
 * A forma canônica do sistema é o SPREAD (1 item por valor), e `setGroupValue` era o único
 * escritor do repo que não a seguia — inclusive contra o drawer que o PRÓPRIO
 * `DataListToolbar` renderiza (`ToolbarSimpleFilterDrawer.updateFieldValue` spreada). Por
 * isso a correção é nos DOIS lados:
 *
 *   (a) escrita  → `setGroupValue` spreada, igual ao drawer e ao `updateGroupValue` do DataTable;
 *   (b) leitura  → `applyFilterModel` achata valor-array, igual ao `matchesFilter` de TODO
 *                  column-type do DataTable ("Aceita escalar (do preset) ou array" — badge).
 *
 * (b) não é zelo: `persistKey` grava o `filterModel` cru em `localStorage` e `loadPersisted`
 * devolve `p.filterModel.items` SEM migração. Quem marcou 2 valores antes desta correção tem
 * um modelo quebrado salvo no navegador agora; só (a) o deixaria quebrado pra sempre.
 *
 * Os testes de componente montam o `<DataList>` REAL e olham a LISTA — não o formato
 * interno, que é o que faria o teste concordar com o bug por construção (L-064).
 */
import type { ComponentProps } from "react";
import { describe, expect, it, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataList } from "./data-list";
import { applyFilterModel } from "./utils/apply-filter-model";
import type { FilterFieldType, FilterableField } from "./data-list.types";
import type { FilterModel } from "@/components/ui/DataTable/data-table.types";
import type { ListItemData } from "@/components/ui/List";

/* jsdom não tem matchMedia nem ResizeObserver — mesmo shim do ownsmulti-paridade.test
   (a toolbar compartilhada e o MultiSelectDropdown usam os dois). */
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
  { id: "1", title: "Projeto Alfa", data: { status: "ativo" } },
  { id: "2", title: "Projeto Beta", data: { status: "pausado" } },
  { id: "3", title: "Projeto Gama", data: { status: "encerrado" } },
];

const OPCOES = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" },
];

const CAMPO: FilterableField = {
  id: "status",
  label: "Status",
  accessor: (it) => (it.data as { status: string }).status,
  type: "select" as FilterFieldType,
  options: OPCOES,
};

const PORID = new Map([[CAMPO.id, CAMPO]]);

/** FilterModel com os items EXATAMENTE como passados — sem normalizar nada. */
function modelo(
  ...items: Array<{ operator: string; value: unknown }>
): FilterModel {
  return {
    logicOperator: "AND",
    items: items.map((it, i) => ({
      id: `f${i}`,
      field: "status",
      operator: it.operator,
      value: it.value,
    })) as FilterModel["items"],
  };
}

const ids = (r: ListItemData[]) => r.map((i) => i.id);

describe("applyFilterModel — a forma do valor multi não pode mudar o resultado", () => {
  it("UM item com DOIS valores no array casa os DOIS (era lista vazia)", () => {
    const r = applyFilterModel(
      ITEMS,
      modelo({ operator: "isAnyOf", value: ["ativo", "pausado"] }),
      PORID,
    );
    expect(ids(r)).toEqual(["1", "2"]);
  });

  it("UM item por valor (o spread canônico do drawer) casa os dois", () => {
    const r = applyFilterModel(
      ITEMS,
      modelo(
        { operator: "isAnyOf", value: "ativo" },
        { operator: "isAnyOf", value: "pausado" },
      ),
      PORID,
    );
    expect(ids(r)).toEqual(["1", "2"]);
  });

  it("UM item com UM valor no array segue casando", () => {
    const r = applyFilterModel(
      ITEMS,
      modelo({ operator: "isAnyOf", value: ["ativo"] }),
      PORID,
    );
    expect(ids(r)).toEqual(["1"]);
  });

  it("UM item com valor ESCALAR (preset escrito à mão) segue casando", () => {
    // `src/examples/clientes/clientes-screen.tsx` escreve exatamente assim.
    const r = applyFilterModel(
      ITEMS,
      modelo({ operator: "isAnyOf", value: "ativo" }),
      PORID,
    );
    expect(ids(r)).toEqual(["1"]);
  });

  it("isNoneOf com DOIS valores num item exclui os DOIS", () => {
    const r = applyFilterModel(
      ITEMS,
      modelo({ operator: "isNoneOf", value: ["ativo", "pausado"] }),
      PORID,
    );
    expect(ids(r)).toEqual(["3"]);
  });

  it("mistura das duas formas no mesmo grupo soma os valores (OR)", () => {
    // Estado real de quem tinha filtro antigo salvo e marcou mais um valor depois.
    const r = applyFilterModel(
      ITEMS,
      modelo(
        { operator: "isAnyOf", value: ["ativo", "pausado"] },
        { operator: "isAnyOf", value: "encerrado" },
      ),
      PORID,
    );
    expect(ids(r)).toEqual(["1", "2", "3"]);
  });
});

/** Monta o DataList com o filterModel já aplicado (via persistKey → loadPersisted). */
let chave = 0;
function montar(
  model: FilterModel,
  extra?: Partial<ComponentProps<typeof DataList>>,
) {
  const persistKey = `chip-multi-valor-${chave++}`;
  localStorage.setItem(
    `ds-datalist:${persistKey}`,
    JSON.stringify({ search: "", filterModel: model }),
  );
  render(
    <DataList
      items={ITEMS}
      filterFields={[CAMPO]}
      persistKey={persistKey}
      {...extra}
    />,
  );
}

/** Clica no chip de Status (span sem role — alvo é o menor nó que começa pelo rótulo). */
async function clicarNoChip() {
  const chip = Array.from(document.querySelectorAll("div,span"))
    .filter((e) => /^Status/.test(e.textContent ?? ""))
    .sort((a, b) => (a.textContent ?? "").length - (b.textContent ?? "").length)[0];
  if (!chip) throw new Error("chip de Status não encontrado");
  await userEvent.click(chip);
}

/** Títulos que a LISTA está mostrando agora. */
const naTela = () =>
  ITEMS.map((i) => i.title as string).filter((t) => screen.queryByText(t));

describe("DataList — marcar o 2º valor no chip não pode esvaziar a lista", () => {
  it("chip com 'Ativo' marcado + marcar 'Pausado' mostra as DUAS categorias", async () => {
    montar(modelo({ operator: "isAnyOf", value: "ativo" }));
    expect(naTela()).toEqual(["Projeto Alfa"]);

    await clicarNoChip();
    // O MultiSelectDropdown built-in chama onChange com o ARRAY inteiro a cada toggle.
    await userEvent.click(screen.getByRole("checkbox", { name: /pausado/i }));

    expect(naTela()).toEqual(["Projeto Alfa", "Projeto Beta"]);
  });

  it("o chip grava UM item POR VALOR — a forma canônica do resto do sistema", async () => {
    // (a): o drawer que este MESMO componente renderiza spreada; o chip tem que
    // emitir o mesmo formato, senão o `onQueryChange` entrega ao servidor uma forma
    // que depende de qual dos dois widgets o usuário abriu.
    // `mode="server"` porque é o único em que o `onQueryChange` dispara (debounce 250ms).
    const emitidos: FilterModel[] = [];
    montar(modelo({ operator: "isAnyOf", value: "ativo" }), {
      mode: "server",
      onQueryChange: (q) => emitidos.push(q.filterModel),
    });

    await clicarNoChip();
    await userEvent.click(screen.getByRole("checkbox", { name: /pausado/i }));

    await waitFor(() => expect(emitidos.length).toBeGreaterThan(0));
    const ultimo = emitidos[emitidos.length - 1];
    expect(ultimo.items).toHaveLength(2);
    expect(ultimo.items.map((i) => i.value)).toEqual(["ativo", "pausado"]);
  });
});

describe("DataList — filterModel gravado ANTES da correção continua funcionando", () => {
  it("modelo persistido na forma ANTIGA (um item, array de 2) filtra certo", async () => {
    // Estado que já está no localStorage de quem usa: `setGroupValue` gravava assim.
    // localStorage não se migra sozinho — sem a tolerância da leitura, esse usuário
    // abre a tela numa lista vazia e não tem como saber por quê.
    montar(modelo({ operator: "isAnyOf", value: ["ativo", "pausado"] }));
    expect(naTela()).toEqual(["Projeto Alfa", "Projeto Beta"]);
  });

  it("e o chip dele ainda abre com os DOIS valores marcados", async () => {
    montar(modelo({ operator: "isAnyOf", value: ["ativo", "pausado"] }));
    await clicarNoChip();
    const marcados = screen
      .getAllByRole("checkbox")
      .filter((c) => (c as HTMLInputElement).checked || c.getAttribute("data-state") === "checked");
    expect(marcados).toHaveLength(2);
  });
});
