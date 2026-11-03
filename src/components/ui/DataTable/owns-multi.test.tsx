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
import { MultiSelectFieldDropdown } from "./index";

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

/** Monta o DataTable com o `filterModel` dado e abre o chip de Status. */
async function abrirChip(filterType: string, model: FilterModel = MODEL_ANY_OF) {
  render(
    <DataTable
      rows={ROWS}
      columns={colunas(filterType)}
      getRowId={(r) => r.id}
      filterModel={model}
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
}

/** Abre o chip e devolve quantos checkboxes o popover oferece. */
async function checkboxesDoChip(filterType: string): Promise<number> {
  await abrirChip(filterType);
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

  it("typo no filterType cai no `text` e o chip não vira do consumidor", async () => {
    // `meuMultII` não existe; o registry devolve `text`, que NÃO declara ownsMulti.
    //
    // ⚠️ Este caso NÃO exercita a guarda `typeDef.type === filterType`, apesar de o
    // comentário antigo dizer que sim: medido em 2026-11-03, removendo aquela guarda
    // ele continuava verde, porque `text.ownsMulti` é `undefined` e a segunda metade
    // da condição já reprova sozinha. O que ele trava é o efeito observável (typo não
    // sequestra o chip), e isso vale manter. A GUARDA em si é travada por
    // `utils/filter-ops-owns-multi.test.ts`, que constrói o único cenário em que ela
    // importa: o tipo de fallback declarando o flag.
    expect(await checkboxesDoChip("meuMultII")).toBeGreaterThan(0);
  });
});

/**
 * O `ownsMulti` da v0.69.0 declarava a posse do chip multi e entregava o PRIMEIRO valor.
 *
 * O bloco acima prova que o widget do tipo é montado; nenhum dos casos olha o que ele
 * RECEBE — e é por isso que o defeito passou: o `renderFastFilterInput` de teste ignorava
 * `value`. O `currentValue` só devolvia array quando a promoção ao `multiSelect` built-in
 * estava ativa (`useMulti`), e `ownsMulti` desliga exatamente essa promoção — então
 * `useMulti` era sempre falso e o widget do consumidor recebia `"A"` em vez de `["A","B","C"]`.
 *
 * Aqui o widget registrado GUARDA o `value` que o DataTable real passa.
 */
describe("ownsMulti — o widget recebe o valor que a posse promete", () => {
  /** Registra um tipo que só captura o `value` recebido no chip. */
  function registrarCaptura(tipo: string, ownsMulti: boolean) {
    const recebidos: unknown[] = [];
    columnTypeRegistry.register({
      ...columnTypeRegistry.get("multiSelect"),
      type: tipo as never,
      ...(ownsMulti ? { ownsMulti: true } : {}),
      renderFastFilterInput: ({ value }) => {
        recebidos.push(value);
        return <div>{`captura:${tipo}`}</div>;
      },
    });
    return recebidos;
  }

  const modelo = (
    operator: string,
    value: unknown,
    extra: Array<{ operator: string; value: unknown }> = [],
  ): FilterModel => ({
    logicOperator: "AND",
    items: [{ operator, value }, ...extra].map((it, i) => ({
      id: `f${i}`,
      field: "status",
      operator: it.operator,
      value: it.value,
    })) as FilterModel["items"],
  });

  it("tipo que declara ownsMulti recebe a LISTA inteira, não o primeiro valor", async () => {
    const recebidos = registrarCaptura("capturaDono", true);
    // Três itens no MESMO field+operador: é o formato que o builder avançado acumula.
    await abrirChip(
      "capturaDono",
      modelo("isAnyOf", ["A"], [
        { operator: "isAnyOf", value: ["B"] },
        { operator: "isAnyOf", value: ["C"] },
      ]),
    );
    expect(screen.getByText("captura:capturaDono")).toBeTruthy();
    expect(recebidos[recebidos.length - 1]).toEqual(["A", "B", "C"]);
  });

  it("ownsMulti com UM valor continua recebendo array de um, não a string", async () => {
    // O caso que "funcionava" antes (1 valor → o widget leu "A"). Passa a ser array
    // de um: o contrato do flag é "o widget lê e escreve LISTA", sem exceção por tamanho.
    const recebidos = registrarCaptura("capturaDonoUm", true);
    await abrirChip("capturaDonoUm", modelo("isAnyOf", ["A"]));
    expect(recebidos[recebidos.length - 1]).toEqual(["A"]);
  });

  /* ── O caminho ANTIGO: tipo sem ownsMulti não pode mudar de forma ────────────────
     Nenhum built-in declara `ownsMulti`, então a correção só pode alcançar quem
     registrou tipo próprio COM o flag. Sem o flag, valor único segue chegando como
     valor único (string), exatamente como na `main`. */
  it("tipo SEM ownsMulti com valor único continua recebendo o valor cru, não array", async () => {
    const recebidos = registrarCaptura("capturaSemDono", false);
    await abrirChip("capturaSemDono", modelo("equals", "A"));
    expect(screen.getByText("captura:capturaSemDono")).toBeTruthy();
    expect(recebidos[recebidos.length - 1]).toBe("A");
  });

  it("nenhum tipo built-in declara ownsMulti (a correção não alcança quem não registrou o flag)", () => {
    // É a premissa que faz o fix não ser mudança de comportamento: se algum built-in
    // ganhar o flag, ele passa a receber array e este teste obriga a decisão consciente.
    const builtins = [
      "text", "number", "date", "select", "multiSelect", "boolean", "currency",
      "percentage", "email", "phone", "url", "user", "badge", "status", "tags",
    ];
    for (const id of builtins) {
      expect(columnTypeRegistry.get(id).ownsMulti, id).toBeUndefined();
    }
  });
});

/**
 * O flag sozinho não basta: o tipo custom com `ownsMulti` tem dois lugares a preencher —
 * o chip (`renderFastFilterInput`, que o `MultiSelectDropdown` já atendia) e o modal
 * avançado (`renderFilterInput`). A peça do segundo existia mas era privada.
 * Importa pelo barrel do DataTable — é o caminho do consumidor.
 */
describe("MultiSelectFieldDropdown — peça pública do renderFilterInput do tipo dono", () => {
  it("sai do barrel do DataTable e mostra a lista que recebe (trigger compacto)", () => {
    expect(typeof MultiSelectFieldDropdown).toBe("function");
    render(
      <MultiSelectFieldDropdown
        value={["ativo", "pausado"]}
        onChange={() => {}}
        operator="isAnyOf"
        options={OPCOES}
      />,
    );
    // 2 selecionados → o trigger lista os rótulos (3+ vira "N selecionados").
    expect(screen.getByText("Ativo, Pausado")).toBeTruthy();
  });
});
