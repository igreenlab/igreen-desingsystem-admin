/**
 * Task 15 (item 9a do Sólis) — `typeOptions.prefix` / `typeOptions.suffix` em `number` e
 * `currency`, valendo no CAMPO e no CHIP, não só na célula.
 *
 * O pedido original é a unidade: o chip de faixa lia "100 – 500" e o consumidor precisa
 * de "100 – 500 kWh". Unidade que só aparece na célula resolve metade — quem está
 * filtrando olha o chip e o campo, e é ali que ele precisa saber de QUE grandeza é o
 * número que está digitando.
 *
 * Decisões que estes testes travam (cada uma tem o seu `it`):
 *
 *  1. **Ausente = formato de hoje, byte por byte.** Sem `prefix`/`suffix` nada muda em
 *     lugar nenhum — nem um `<span>` a mais no campo.
 *  2. **A string entra LITERAL, sem espaço automático.** `suffix: " kWh"` dá "1.234 kWh";
 *     `suffix: "%"` dá "1.234%". Injetar espaço acertaria um caso e erraria o outro, e
 *     não haveria como desligar.
 *  3. **`valueFormatter` VENCE e não concatena.** Ele já vence o formato do tipo e o
 *     `typeOptions` de moeda/locale desde a Rodada 1 — é o escape hatch inteiro: quem o
 *     passa já decidiu o texto. Grudar " kWh" no "1,2 mil" dele seria um texto que
 *     ninguém pediu e que não dá pra desligar.
 *  4. **Nada de unidade sem número.** Célula vazia continua vazia — "kWh" sozinho numa
 *     linha sem dado é pior que a célula em branco.
 *  5. **Faixa leva a unidade UMA vez**, no fim: "100 – 500 kWh", não "100 kWh – 500 kWh".
 *  6. **Ordenação e filtro operam no NÚMERO.** `prefix`/`suffix` são apresentação; se
 *     vazassem pro dado, "1.000 kWh" ordenaria antes de "900 kWh" (lexical) e um
 *     `between` deixaria de casar.
 *  7. **Export e clipboard NÃO levam o afixo** — decisão declarada, testada aqui pra não
 *     virar surpresa. Eles passam por `formatValue`, que nunca recebeu `typeOptions`
 *     (uma coluna `currency` com `typeOptions.currency: "USD"` já exporta em BRL hoje).
 *     Fazer só as duas chaves novas viajarem pra lá seria arbitrário, e fazer todas
 *     viajarem mudaria export de quem não pediu nada. Quem quer a unidade nas três
 *     superfícies usa `valueFormatter`, que é exatamente o botão pra isso.
 *
 * Sem jest-dom (derruba a suíte no `tsc` antes de rodar teste nenhum — ver USAGE).
 */
import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberColumnType } from "./definitions/number-column-type";
import { CurrencyColumnType } from "./definitions/currency-column-type";
import type { ColumnTypeDefinition } from "./column-types.types";
import { DataTable } from "../data-table";
import type { DataTableColumnDef, FilterModel } from "../data-table.types";

const KWH = { suffix: " kWh" };

/* Espaço NBSP que o Intl põe entre "R$" e o número — não digitar à mão. */
const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function textoDaCelula(
  tipo: ColumnTypeDefinition,
  valor: unknown,
  column: Record<string, unknown> = {},
) {
  const node = tipo.renderCell?.({ value: valor, row: {}, column } as never);
  const { container } = render(<>{node}</>);
  return container.textContent ?? "";
}

function textoDoChip(
  tipo: ColumnTypeDefinition,
  valor: unknown,
  typeOptions?: Record<string, unknown>,
) {
  const node = tipo.renderChipValue?.(valor as never, undefined, typeOptions);
  const { container } = render(<>{node}</>);
  return container.textContent ?? "";
}

function campo(
  tipo: ColumnTypeDefinition,
  props: Record<string, unknown>,
): HTMLElement {
  const node = tipo.renderFilterInput({
    value: null,
    onChange: () => {},
    operator: "equals",
    ...props,
  } as never);
  return render(<>{node}</>).container;
}

function chipPopover(
  tipo: ColumnTypeDefinition,
  props: Record<string, unknown>,
): HTMLElement {
  const node = tipo.renderFastFilterInput({
    value: null,
    onChange: () => {},
    ...props,
  } as never);
  return render(<>{node}</>).container;
}

/** Texto que o widget mostra FORA dos inputs — é ali que a unidade aparece. */
const textoForaDosInputs = (c: HTMLElement) => (c.textContent ?? "").trim();

describe("célula — prefix/suffix em number e currency", () => {
  it("number com suffix mostra a unidade depois do número", () => {
    expect(textoDaCelula(NumberColumnType, 1234, { typeOptions: KWH })).toBe(
      "1.234 kWh",
    );
  });

  it("number com prefix mostra antes", () => {
    expect(
      textoDaCelula(NumberColumnType, 1234, { typeOptions: { prefix: "≈ " } }),
    ).toBe("≈ 1.234");
  });

  it("currency com suffix mostra depois do valor formatado", () => {
    expect(
      textoDaCelula(CurrencyColumnType, 1234.56, {
        typeOptions: { suffix: " /mês" },
      }),
    ).toBe(`${BRL(1234.56)} /mês`);
  });

  it("currency combina suffix com a moeda do typeOptions (as duas chaves convivem)", () => {
    const txt = textoDaCelula(CurrencyColumnType, 1234.56, {
      typeOptions: { currency: "USD", locale: "en-US", suffix: " /mo" },
    });
    expect(txt).toBe("$1,234.56 /mo");
  });

  it("a string entra LITERAL — sem espaço automático", () => {
    expect(
      textoDaCelula(NumberColumnType, 1234, { typeOptions: { suffix: "%" } }),
    ).toBe("1.234%");
  });

  /* CAMINHO ANTIGO */
  it("sem prefix/suffix o formato de hoje continua, byte por byte", () => {
    expect(textoDaCelula(NumberColumnType, 1234)).toBe("1.234");
    expect(textoDaCelula(NumberColumnType, 1234, { typeOptions: {} })).toBe("1.234");
    expect(textoDaCelula(CurrencyColumnType, 1234.56)).toBe(BRL(1234.56));
    expect(textoDaCelula(CurrencyColumnType, 1234.56, { typeOptions: {} })).toBe(
      BRL(1234.56),
    );
  });

  it("valueFormatter VENCE o afixo — não concatena", () => {
    expect(
      textoDaCelula(NumberColumnType, 1234, {
        typeOptions: KWH,
        valueFormatter: () => "1,2 mil",
      }),
    ).toBe("1,2 mil");
    expect(
      textoDaCelula(CurrencyColumnType, 1234.56, {
        typeOptions: { suffix: " /mês" },
        valueFormatter: () => "custom",
      }),
    ).toBe("custom");
  });

  it("célula sem número NÃO vira a unidade sozinha", () => {
    const node = NumberColumnType.renderCell?.({
      value: null,
      row: {},
      column: { typeOptions: KWH },
    } as never);
    expect(node).toBeNull();
    expect(
      textoDaCelula(CurrencyColumnType, null, { typeOptions: { suffix: " /mês" } }),
    ).toBe("");
  });
});

describe("chip — a unidade chega no rótulo do filtro aplicado", () => {
  it("number: valor único leva a unidade", () => {
    expect(textoDoChip(NumberColumnType, 1234, KWH)).toBe("1.234 kWh");
  });

  it("number: a FAIXA leva a unidade uma vez, no fim", () => {
    expect(textoDoChip(NumberColumnType, [100, 500], KWH)).toBe("100 – 500 kWh");
  });

  it("number: faixa de lado aberto também", () => {
    expect(textoDoChip(NumberColumnType, [100, null], KWH)).toBe("≥ 100 kWh");
    expect(textoDoChip(NumberColumnType, [null, 500], KWH)).toBe("≤ 500 kWh");
  });

  it("currency: valor único e faixa levam a unidade", () => {
    expect(textoDoChip(CurrencyColumnType, 1234.56, { suffix: " /mês" })).toBe(
      `${BRL(1234.56)} /mês`,
    );
    expect(
      textoDoChip(CurrencyColumnType, [10, 500], { suffix: " /mês" }),
    ).toBe(`${BRL(10)} → ${BRL(500)} /mês`);
  });

  /* CAMINHO ANTIGO */
  it("sem afixo o chip continua idêntico", () => {
    expect(textoDoChip(NumberColumnType, 1234)).toBe("1.234");
    expect(textoDoChip(NumberColumnType, [100, 500])).toBe("100 – 500");
    expect(textoDoChip(CurrencyColumnType, [10, 500])).toBe(
      `${BRL(10)} → ${BRL(500)}`,
    );
  });

  it("chip vazio continua vazio — não vira a unidade sozinha", () => {
    expect(textoDoChip(NumberColumnType, [null, null], KWH)).toBe("");
    expect(textoDoChip(CurrencyColumnType, [null, null], { suffix: " /mês" })).toBe(
      "",
    );
  });
});

describe("campo de filtro — a unidade aparece ao lado do input", () => {
  it("number: campo único mostra a unidade", () => {
    const c = campo(NumberColumnType, { value: 10, typeOptions: KWH });
    expect(textoForaDosInputs(c)).toBe("kWh");
  });

  it("number: a FAIXA mostra a unidade uma vez (não uma por lado)", () => {
    const c = campo(NumberColumnType, {
      value: [10, 500],
      operator: "between",
      typeOptions: KWH,
    });
    // o "–" separador dos dois lados continua lá; a unidade entra UMA vez
    expect((textoForaDosInputs(c).match(/kWh/g) ?? []).length).toBe(1);
  });

  it("currency: campo único e faixa mostram a unidade", () => {
    expect(
      textoForaDosInputs(campo(CurrencyColumnType, { value: 10, typeOptions: { suffix: " /mês" } })),
    ).toContain("/mês");
    expect(
      (
        textoForaDosInputs(
          campo(CurrencyColumnType, {
            value: [10, 500],
            operator: "between",
            typeOptions: { suffix: " /mês" },
          }),
        ).match(/\/mês/g) ?? []
      ).length,
    ).toBe(1);
  });

  it("popover do chip (fast filter) também mostra a unidade, nos dois tipos", () => {
    expect(
      textoForaDosInputs(chipPopover(NumberColumnType, { value: 10, typeOptions: KWH })),
    ).toContain("kWh");
    expect(
      textoForaDosInputs(
        chipPopover(NumberColumnType, {
          value: [10, 500],
          operator: "between",
          typeOptions: KWH,
        }),
      ),
    ).toContain("kWh");
    expect(
      textoForaDosInputs(
        chipPopover(CurrencyColumnType, { value: 10, typeOptions: { suffix: " /mês" } }),
      ),
    ).toContain("/mês");
    // A FAIXA do currency tem ramo próprio no popover (widget diferente do valor
    // único) — sem este caso o ramo fica sem teste e a unidade some só nele.
    expect(
      textoForaDosInputs(
        chipPopover(CurrencyColumnType, {
          value: [10, 500],
          operator: "between",
          typeOptions: { suffix: " /mês" },
        }),
      ),
    ).toContain("/mês");
  });

  it("prefix aparece ANTES do input", () => {
    const c = campo(NumberColumnType, { value: 10, typeOptions: { prefix: "≈" } });
    expect(textoForaDosInputs(c)).toBe("≈");
  });

  /* CAMINHO ANTIGO — nem um nó a mais sem a opção */
  it("sem afixo, o campo não ganha nenhum texto solto", () => {
    expect(textoForaDosInputs(campo(NumberColumnType, { value: 10 }))).toBe("");
    expect(
      textoForaDosInputs(campo(NumberColumnType, { value: 10, typeOptions: {} })),
    ).toBe("");
    expect(
      textoForaDosInputs(chipPopover(NumberColumnType, { value: 10 })),
    ).toBe("");
    expect(textoForaDosInputs(campo(CurrencyColumnType, { value: 10 }))).toBe("");
  });

  it("sem afixo, o campo mantém a MESMA estrutura de nós de hoje", () => {
    // A guarda é estrutural: o wrapper da unidade não pode existir quando não há
    // unidade — senão "byte por byte" vira "quase igual".
    const semOpts = campo(NumberColumnType, { value: 10 });
    const comOptsVazio = campo(NumberColumnType, { value: 10, typeOptions: {} });
    expect(comOptsVazio.innerHTML).toBe(semOpts.innerHTML);
  });
});

describe("afixo é APRESENTAÇÃO — não entra no dado", () => {
  it("matchesFilter ignora prefix/suffix: o filtro compara número com número", () => {
    // O afixo nem chega no matchesFilter — e é isso que garante que uma coluna
    // com unidade continue filtrando igual a uma sem.
    expect(NumberColumnType.matchesFilter(300, [100, 500], "between")).toBe(true);
    expect(NumberColumnType.matchesFilter(900, [100, 500], "between")).toBe(false);
    expect(CurrencyColumnType.matchesFilter(300, [100, 500], "between")).toBe(true);
  });

  it("export/clipboard (formatValue) NÃO levam o afixo — decisão declarada", () => {
    expect(NumberColumnType.formatValue?.(1234)).toBe("1.234");
    expect(CurrencyColumnType.formatValue?.(1234.56)).toBe(BRL(1234.56));
  });
});

/* O unitário prova cada slot. Este prova o CAMINHO: coluna declarada no DataTable real →
   célula, chip e ORDENAÇÃO. É onde o afixo vazaria pro dado sem ninguém ver. */
describe("pelo DataTable real", () => {
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

  type Row = { id: string; consumo: number };
  const ROWS: Row[] = [
    { id: "1", consumo: 900 },
    { id: "2", consumo: 1000 },
    { id: "3", consumo: 300 },
  ];

  const COLUNAS: DataTableColumnDef<Row>[] = [
    {
      field: "consumo",
      headerName: "Consumo",
      type: "number",
      filterType: "number",
      enableColumnFilter: true,
      sortable: true,
      typeOptions: { suffix: " kWh" },
    },
  ];

  function monta(
    extra: Partial<React.ComponentProps<typeof DataTable<Row>>> = {},
  ) {
    return render(
      <DataTable<Row>
        rows={ROWS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        toolbar={{ enableFilters: true }}
        {...extra}
      />,
    );
  }

  const comFiltro = (value: [number, number]) => ({
    filterModel: {
      logicOperator: "AND",
      items: [{ id: "f1", field: "consumo", operator: "between", value }],
    } as FilterModel,
    onFilterModelChange: () => {},
  });

  it("a célula mostra a unidade", () => {
    monta();
    expect(screen.getByText("900 kWh")).toBeTruthy();
    expect(screen.getByText("1.000 kWh")).toBeTruthy();
  });

  it("o chip da faixa mostra a unidade uma vez", () => {
    monta(comFiltro([100, 500]));
    // O rótulo do chip é o nó de texto que o `renderChipValue` devolveu.
    expect(screen.getByText("100 – 500 kWh")).toBeTruthy();
    // E a unidade entra UMA vez na toolbar inteira (não uma por lado da faixa).
    const toolbar = document.body.textContent ?? "";
    expect((toolbar.match(/100 – 500 kWh/g) ?? []).length).toBe(1);
    expect(toolbar.includes("100 kWh")).toBe(false);
  });

  it("o filtro continua casando por NÚMERO, não pelo texto com unidade", () => {
    monta(comFiltro([100, 500]));
    expect(screen.getByText("300 kWh")).toBeTruthy();
    expect(screen.queryByText("900 kWh")).toBeNull();
    expect(screen.queryByText("1.000 kWh")).toBeNull();
  });

  /* As duas superfícies de FILTRO pelo caminho real. Cada uma tem uma linha de
     plumbing própria (o chip em `data-table.tsx`, o campo no
     `toolbar-simple-filter-drawer` + `FilterPopoverColumn`), e sem teste aqui a
     unidade poderia chegar na célula e não no lugar onde o usuário filtra — que é
     exatamente o defeito que o item 9a reclama. */
  it("o popover do chip mostra a unidade (caminho real do DataTable)", async () => {
    monta(comFiltro([100, 500]));
    const chip = Array.from(document.querySelectorAll("div,span"))
      .filter((e) => /^Consumo/.test(e.textContent ?? ""))
      .sort((a, b) => (a.textContent ?? "").length - (b.textContent ?? "").length)[0];
    expect(chip).toBeTruthy();
    await userEvent.click(chip!);
    const popover = document.querySelector("[data-radix-popper-content-wrapper]");
    expect(popover).toBeTruthy();
    expect((popover!.textContent ?? "").includes("kWh")).toBe(true);
  });

  it("o campo do funil mostra a unidade (caminho real do drawer)", async () => {
    monta();
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }));
    const drawer = screen.getByRole("dialog");
    expect((drawer.textContent ?? "").includes("kWh")).toBe(true);
  });

  it("o campo do builder avançado mostra a unidade (Configurações › Filtros avançados)", async () => {
    monta();
    await userEvent.click(
      screen.getByRole("button", { name: /Configurações da tabela/i }),
    );
    await userEvent.click(screen.getByText("Filtros avançados"));
    await userEvent.click(screen.getByText(/Adicionar condição/i));
    // ⚠️ Escopo no PAINEL, não em `document.body`: o corpo da tabela já mostra
    // "900 kWh" nas células, e `body.textContent` passaria com o campo mudo —
    // verde por outro mecanismo (medido: a mutação do repasse sobrevivia).
    const painel = document.querySelector("[data-radix-popper-content-wrapper]");
    expect(painel).toBeTruthy();
    expect((painel!.textContent ?? "").includes("kWh")).toBe(true);
  });

  it("a ordenação continua NUMÉRICA — '1.000 kWh' vem DEPOIS de '900 kWh'", () => {
    // Ordenação lexical sobre o texto formatado poria "1.000 kWh" ANTES de
    // "300 kWh" ("1" < "3"). É o modo de falha de deixar a apresentação vazar
    // pro dado — e um sort crescente que começa no maior número não parece
    // defeito de unidade, parece defeito de tabela.
    monta({ sortModel: { field: "consumo", direction: "asc" } });
    // `getAllByText` devolve em ordem de documento = ordem das linhas.
    const ordem = screen.getAllByText(/kWh$/).map((e) => (e.textContent ?? "").trim());
    expect(ordem).toEqual(["300 kWh", "900 kWh", "1.000 kWh"]);
  });
});
