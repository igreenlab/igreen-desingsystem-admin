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
 * O drawer é compartilhado. As superfícies, conferidas por `grep -rn "<ToolbarSimpleFilterDrawer"`
 * (com o `<`, que casa JSX e não comentário):
 *
 *   `DataTable/data-table.tsx:1969`                      — como `SimpleFilterDrawer`
 *   `DataList/parts/data-list-toolbar.tsx:424`
 *   `TableToolbar/parts/toolbar-filter-control.tsx:171`
 *   `src/preview/pages/TableToolbarDoc.tsx:434`          — showcase
 *   `src/components/index.ts:106`                        — barrel público: consumidor monta direto
 *
 * ⚠️ `Scheduler` e `TableToolbar/table-toolbar.tsx` **NÃO** renderizam este drawer —
 * só citam o nome em comentário/JSDoc, e um `grep -l` os devolve. O Scheduler usa o
 * `SchedulerFilterPanel` próprio. Esta lista já esteve errada aqui: quem a lesse iria
 * procurar no Scheduler um acoplamento que não existe (L-060).
 *
 * Os testes montam o drawer direto, que é a superfície única de todas elas.
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
import { defaultOperatorForFilterType } from "@/components/ui/DataTable/utils/filter-ops";

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

  it("coluna `multiSelect` sem filtro no modelo nasce em `isAnyOf`", async () => {
    const escritos = montar([colMulti], vazio);

    await abrirMulti();
    await userEvent.click(screen.getByLabelText("Ativo"));

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items).toHaveLength(1);
    expect(ultimo.items[0].operator).toBe("isAnyOf");
    expect(ultimo.items[0].value).toBe("ativo");
  });

  it("o `isAnyOf` do `multiSelect` vem do REGISTRY (`operators[0]`), não de promoção", () => {
    // Quem garante o teste acima é o primeiro operador declarado pelo tipo — o
    // `defaultOperatorForFilterType` lê dali, e é a fonte única.
    //
    // Até 2026-11-03 o fallback do drawer embrulhava isso num
    // `promoteOperatorForFilterType`, cujo comentário prometia a garantia. A chamada
    // era INERTE e não podia deixar de ser: ela só age sobre `equals`/`neq`, e recebia
    // justamente o default do registry — medido, `MUDOU=false` nos 16 tipos. O teste
    // acima passava com e sem ela, então não pinava nada (L-061 + L-064). Removida a
    // chamada, a garantia ficou inteira aqui: reordene `MultiSelectColumnType.operators`
    // e os DOIS reprovam.
    expect(columnTypeRegistry.get("multiSelect").operators?.[0]?.id).toBe("isAnyOf");
    expect(defaultOperatorForFilterType("multiSelect")).toBe("isAnyOf");
  });
});

/**
 * A preservação é a ÚNICA porta por onde `isEmpty`/`isNotEmpty` chegam ao drawer —
 * nenhum tipo built-in os tem como default. E o widget deles não tem o que editar:
 * `text`, `select` e `multiSelect` devolvem "(sem valor)", sem `onChange`.
 *
 * Antes da preservação a linha era editável — editável ERRADO (digitar trocava o
 * `isEmpty` por `contains` em silêncio), mas o usuário saía do estado. Preservar sem
 * dar saída trocaria um defeito silencioso por um beco sem saída cuja única porta
 * ("Limpar todos") apaga os filtros de TODOS os campos. É a L-070 ao pé da letra:
 * existe aqui dentro alguma ação cuja função é encerrar este estado?
 */
describe("drawer — linha sem valor a editar tem saída PRÓPRIA", () => {
  it("linha `isEmpty` é read-only e mesmo assim oferece como sair dela", async () => {
    const escritos = montar([colTexto], modelo("nome", "isEmpty", undefined));

    // read-only: o widget do `text` devolve "(sem valor)", sem campo pra digitar
    expect(screen.getByText("(sem valor)")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Limpar filtro de Nome" }),
    );

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items.filter((i) => i.field === "nome")).toHaveLength(0);
  });

  it("a saída remove SÓ aquele campo — os outros filtros sobrevivem", async () => {
    const escritos = montar([colTexto, colMulti], {
      logicOperator: "AND",
      items: [
        { id: "f0", field: "nome", operator: "isEmpty" },
        { id: "f1", field: "status", operator: "isAnyOf", value: "ativo" },
        { id: "f2", field: "status", operator: "isAnyOf", value: "pausado" },
      ],
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Limpar filtro de Nome" }),
    );

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items.map((i) => [i.field, i.value])).toEqual([
      ["status", "ativo"],
      ["status", "pausado"],
    ]);
  });

  it("linha EDITÁVEL não ganha botão nenhum — a saída nasce só onde ela sumiu", async () => {
    // O escopo prometido: nenhuma outra linha do drawer muda de aparência.
    montar([colTexto, colMulti], modelo("nome", "contains", "ana"));

    expect(screen.getByDisplayValue("ana")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Limpar filtro de/ })).toBeNull();
  });
});

/**
 * `ColumnTypeOperator.noValue` é API PÚBLICA (`column-types/index.ts` →
 * `DataTable/index.ts`) e até 2026-11-03 era **inerte**: nenhum dos 16 tipos declarava
 * e NADA lia — um consumidor podia pôr `noValue: true` no operador dele e não acontecia
 * nada, sem erro e sem aviso. É a L-061 ("no-op não é desligado, está ARMADO"), e o
 * caminho escolhido foi LIGAR em vez de remover, porque é campo exportado: remover
 * quebraria a compilação de quem já declarou, ligar entrega o que o nome prometia.
 *
 * Com isso o "limite conhecido" da saída por campo deixa de existir: tipo registrado
 * cujo widget não é editável em OUTRO operador agora tem como declarar isso.
 *
 * Os dois testes usam o MESMO tipo, com DOIS operadores — um declara `noValue`, o outro
 * não. Mesmo tipo, mesmo widget, mesma entrada de registry: a ÚNICA diferença entre as
 * duas linhas é a declaração, então o que reprova aponta pro campo e não pra alguma
 * outra coisa que mudou junto.
 *
 * ⚠️ Este comentário já afirmou que "com dois tipos diferentes a mutação de
 * sobre-disparo teria escapado". **É falso** — essa mutação também reprova o teste
 * `linha EDITÁVEL não ganha botão nenhum`, que usa tipo built-in e é anterior a esta
 * seção. A construção acima é melhor por isolar a variável, não por ser a única que
 * pega a mutação.
 */
describe("drawer — `noValue` do tipo registrado é um sinal VIVO (L-061)", () => {
  /** Tipo com `startsWith` sem valor (declarado) e `contains` normal. */
  function registrarTipoComNoValue(tipo: string) {
    columnTypeRegistry.register({
      ...columnTypeRegistry.get("text"),
      type: tipo as never,
      operators: [
        { id: "contains", label: "contém" },
        { id: "startsWith", label: "tem qualquer coisa", noValue: true },
      ],
      renderFilterInput: ({ operator, value, onChange }) =>
        operator === "startsWith" ? (
          // Sem `onChange`: o widget deste operador não tem o que editar — é
          // exatamente o estado que precisa de saída e que o DS não adivinha.
          <span>widget-sem-campo</span>
        ) : (
          <input
            aria-label="campo do consumidor"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        ),
    });
  }

  it("operador que DECLARA `noValue` ganha a saída, mesmo não sendo isEmpty/isNotEmpty", async () => {
    const tipo = "semValorDeclarado";
    registrarTipoComNoValue(tipo);
    const escritos = montar(
      [{ key: "nome", label: "Nome", filterType: tipo }],
      modelo("nome", "startsWith", "x"),
    );

    expect(screen.getByText("widget-sem-campo")).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Limpar filtro de Nome" }),
    );

    const ultimo = escritos[escritos.length - 1];
    expect(ultimo.items.filter((i) => i.field === "nome")).toHaveLength(0);
  });

  it("operador do MESMO tipo que NÃO declara `noValue` segue sem botão", async () => {
    // O caminho antigo: nenhum dos 16 built-in declara o campo, então nada muda
    // pra eles. Aqui o contraste é dentro do mesmo tipo registrado.
    const tipo = "semValorDeclaradoContra";
    registrarTipoComNoValue(tipo);
    montar(
      [{ key: "nome", label: "Nome", filterType: tipo }],
      modelo("nome", "contains", "ana"),
    );

    expect(screen.getByLabelText("campo do consumidor")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Limpar filtro de/ })).toBeNull();
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
