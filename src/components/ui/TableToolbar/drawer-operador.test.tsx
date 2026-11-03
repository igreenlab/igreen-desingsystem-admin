/**
 * O `ToolbarSimpleFilterDrawer` preserva o operador que JÁ ESTÁ no modelo.
 *
 * Até esta correção os DOIS lados do drawer derivavam o operador do TIPO da coluna,
 * nunca de `items[0].operator`:
 *
 *   render (`:224`)  →  `defaultOperatorForFilterType(col.filterType)`
 *   escrita (`:125`) →  `promoteOperatorForFilterType(defaultOperatorForFilterType(...))`
 *
 * Consequência dupla: um filtro que chegou em `isNoneOf` / `between` / `notContains`
 * (de preset, de visão salva ou do builder avançado) era DESENHADO como se fosse o
 * default, e mexer no valor REESCREVIA o operador pro default, em silêncio.
 *
 * O drawer é compartilhado — `DataTable`, `DataList`, `Scheduler`, `ToolbarFilterControl`
 * e `TableToolbar` renderizam este mesmo componente. Os testes montam o drawer direto
 * (API pública, exportada no barrel) porque é a superfície única dos cinco.
 *
 * Os caminhos ANTIGOS têm teste próprio: field sem filtro no modelo continua nascendo
 * com o default do tipo, e `multiSelect` continua sendo promovido a `isAnyOf`.
 */
import { describe, expect, it, beforeAll, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolbarSimpleFilterDrawer } from "./parts/toolbar-simple-filter-drawer";
import type { FilterPopoverColumn } from "./popovers/filter-popover";
import type {
  FilterItem,
  FilterModel,
} from "@/components/ui/DataTable/data-table.types";
import { columnTypeRegistry } from "@/components/ui/DataTable/column-types";

/* jsdom não tem matchMedia nem ResizeObserver — o FloatingPanel usa o primeiro
   (responsive sheet) e o MultiSelectDropdown o segundo (largura travada). Mesmo
   shim do `ownsmulti-paridade.test` do DataList. */
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

const OPCOES = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" },
];

/** FilterModel com N items no MESMO field+operador — o formato que o drawer acumula. */
function modelo(
  field: string,
  operator: string,
  ...values: unknown[]
): FilterModel {
  return {
    logicOperator: "AND",
    items: values.map((value, i) => ({
      id: `f${i}`,
      field,
      operator,
      value,
    })) as FilterItem[],
  };
}

/** Drawer aberto e controlado — devolve o array com TODOS os modelos escritos. */
function montar(columns: FilterPopoverColumn[], inicial: FilterModel) {
  const escritos: FilterModel[] = [];
  function Harness() {
    const [model, setModel] = useState(inicial);
    return (
      <ToolbarSimpleFilterDrawer
        open
        onOpenChange={() => {}}
        columns={columns}
        filterModel={model}
        onFilterModelChange={(m) => {
          escritos.push(m);
          setModel(m);
        }}
      />
    );
  }
  render(<Harness />);
  return escritos;
}

const vazio: FilterModel = { logicOperator: "AND", items: [] };

const colNumero: FilterPopoverColumn = {
  key: "valor",
  label: "Valor",
  filterType: "number",
};
const colTexto: FilterPopoverColumn = {
  key: "nome",
  label: "Nome",
  filterType: "text",
};
const colMulti: FilterPopoverColumn = {
  key: "status",
  label: "Status",
  filterType: "multiSelect",
  options: OPCOES,
};
const colBadge: FilterPopoverColumn = {
  key: "tipo",
  label: "Tipo",
  filterType: "badge",
  options: OPCOES,
};

/** Abre o popover do widget multiSelect (trigger é o único botão da linha). */
async function abrirMulti() {
  const trigger = screen
    .getAllByRole("button")
    .find((b) => /Selecione|Ativo|Pausado|Encerrado|selecionados/.test(b.textContent ?? ""));
  if (!trigger) throw new Error("trigger do multiSelect não encontrado");
  await userEvent.click(trigger);
}

describe("drawer — exibição usa o operador do MODELO, não o default do tipo", () => {
  it("filtro `between` é desenhado com os dois campos do range", async () => {
    // `number` tem default `equals`: com o operador derivado do tipo, a tupla
    // [10, 20] caía num <Input type="number"> único e sumia da tela.
    montar([colNumero], modelo("valor", "between", [10, 20]));

    expect((screen.getByLabelText("Mínimo") as HTMLInputElement).value).toBe("10");
    expect((screen.getByLabelText("Máximo") as HTMLInputElement).value).toBe("20");
  });

  it("o widget recebe o operador do modelo (`isNoneOf`), não o default do tipo", async () => {
    // No `multiSelect` o segmented Incluindo/Excluindo só aparece com
    // `onOperatorChange`, que o `renderFilterInput` não carrega — então nada no
    // widget built-in denuncia o operador. Um tipo registrado captura o que chega.
    const recebidos: unknown[] = [];
    columnTypeRegistry.register({
      ...columnTypeRegistry.get("multiSelect"),
      type: "capturaOperador" as never,
      renderFilterInput: ({ operator }) => {
        recebidos.push(operator);
        return <div>widget-capturando</div>;
      },
    });

    montar(
      [{ key: "status", label: "Status", filterType: "capturaOperador", options: OPCOES }],
      modelo("status", "isNoneOf", "ativo"),
    );

    expect(screen.getByText("widget-capturando")).toBeTruthy();
    expect(recebidos[recebidos.length - 1]).toBe("isNoneOf");
  });
});

describe("drawer — escrita preserva o operador vigente", () => {
  it("filtro `between` continua `between` depois de editar o valor", async () => {
    const escritos = montar([colNumero], modelo("valor", "between", [10, 20]));

    await userEvent.type(screen.getByLabelText("Mínimo"), "5");

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items).toHaveLength(1);
    expect(ultimo.items[0].operator).toBe("between");
    expect(ultimo.items[0].value).toEqual([105, 20]);
  });

  it("filtro `isNoneOf` (Excluindo) continua `isNoneOf` depois de marcar outro valor", async () => {
    const escritos = montar([colMulti], modelo("status", "isNoneOf", "ativo"));

    await abrirMulti();
    await userEvent.click(screen.getByLabelText("Pausado"));

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items.map((i) => i.operator)).toEqual(["isNoneOf", "isNoneOf"]);
    expect(ultimo.items.map((i) => i.value)).toEqual(["ativo", "pausado"]);
  });

  it("filtro `notContains` continua `notContains` depois de digitar", async () => {
    const escritos = montar([colTexto], modelo("nome", "notContains", "ana"));

    await userEvent.type(screen.getByDisplayValue("ana"), "s");

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items).toHaveLength(1);
    expect(ultimo.items[0].operator).toBe("notContains");
    expect(ultimo.items[0].value).toBe("anas");
  });
});

describe("drawer — caminho antigo: field SEM filtro nasce com o default do tipo", () => {
  it("coluna de texto sem filtro no modelo nasce em `contains`", async () => {
    const escritos = montar([colTexto], vazio);

    await userEvent.type(screen.getByPlaceholderText("Valor..."), "a");

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items).toHaveLength(1);
    expect(ultimo.items[0].operator).toBe("contains");
  });

  it("coluna `multiSelect` sem filtro no modelo nasce promovida a `isAnyOf`", async () => {
    const escritos = montar([colMulti], vazio);

    await abrirMulti();
    await userEvent.click(screen.getByLabelText("Ativo"));

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items).toHaveLength(1);
    expect(ultimo.items[0].operator).toBe("isAnyOf");
    expect(ultimo.items[0].value).toBe("ativo");
  });
});

describe("drawer — guardas da preservação", () => {
  it("operador que o tipo NÃO declara cai no default (não vira filtro morto)", async () => {
    // `text` não declara `between`. Preservá-lo renderizaria o Input de texto com
    // a tupla e escreveria `{between, "..."}` — item que o `matchesFilter` do
    // `text` devolve `null`, ou seja, filtro que some sem avisar.
    const escritos = montar([colTexto], modelo("nome", "between", ["a", "b"]));

    await userEvent.type(screen.getByRole("textbox"), "x");

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items).toHaveLength(1);
    expect(ultimo.items[0].operator).toBe("contains");
  });

  it("`badge` em `isAnyOf` com 2 valores continua mostrando o valor, não o placeholder", async () => {
    // `badge` DECLARA `isAnyOf` (pro builder avançado) e renderiza um <Select>
    // ÚNICO — a mesma dupla badge/user que o JSDoc de `ownsMulti` nomeia. Agregar
    // os items num array apagaria da tela um campo que tem valor.
    montar([colBadge], modelo("tipo", "isAnyOf", "ativo", "pausado"));

    expect(screen.getByText("Ativo")).toBeTruthy();
    expect(screen.queryByText("Selecione...")).toBeNull();
  });

  it("tipo de valor único que declara `isAnyOf` recebe escalar e mantém o operador na escrita", async () => {
    // A guarda de agregação é só sobre a FORMA do valor: o operador segue preservado.
    const recebidos: unknown[] = [];
    columnTypeRegistry.register({
      ...columnTypeRegistry.get("badge"),
      type: "selecaoUnica" as never,
      renderFilterInput: ({ value, onChange }) => {
        recebidos.push(value);
        return (
          <button type="button" onClick={() => onChange("pausado")}>
            escolher-pausado
          </button>
        );
      },
    });

    const escritos = montar(
      [{ key: "tipo", label: "Tipo", filterType: "selecaoUnica", options: OPCOES }],
      modelo("tipo", "isAnyOf", "ativo", "encerrado"),
    );

    expect(recebidos[recebidos.length - 1]).toBe("ativo");

    await userEvent.click(screen.getByText("escolher-pausado"));

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items).toHaveLength(1);
    expect(ultimo.items[0].operator).toBe("isAnyOf");
    expect(ultimo.items[0].value).toBe("pausado");
  });
});
