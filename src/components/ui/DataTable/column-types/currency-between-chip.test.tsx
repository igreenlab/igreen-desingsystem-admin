/**
 * Task 16 (item 9b do Sólis) — `between` do `currency` também no popover do chip.
 *
 * O `number` já trata a faixa no chip: `renderFastFilterInput` olha o operador (e o
 * formato do valor) e troca o campo único por um par mín/máx. O `currency` declara
 * `between` nos `operators`, o `matchesFilter` dele filtra por faixa e o
 * `renderChipValue` já escreve "R$ 10,00 → R$ 500,00" — mas o widget do chip ignorava
 * o operador e renderizava UM `<input type="number">` só. Com a tupla `[10, 500]`
 * dentro de um campo único, o que aparecia na tela era `10,500`: nem valor editável,
 * nem faixa.
 *
 * É paridade, não feature: nada aqui inventa comportamento — copia o do irmão.
 *
 * ⚠️ **Depende da Task 8**, já mergeada. Enquanto o drawer do funil reescrevia o
 * operador para `def.operators[0]` (= `equals` no currency), um filtro de moeda nunca
 * CHEGAVA ao chip como `between` — e um teste do caminho real passaria por acidente,
 * concordando com o bug por construção (L-064). Com o T8 dentro, `between` sobrevive
 * ao drawer e o teste do `DataTable` real abaixo exercita o widget de verdade.
 *
 * Sem jest-dom de propósito: `npm test` roda `tsc --noEmit` antes do vitest e o
 * `vitest.setup.ts` está fora do `include` do tsconfig — `toBeInTheDocument` derruba a
 * suíte inteira. Convenção do repo: `toBeNull()` / `getAttribute()` / `.value`.
 */
import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencyColumnType } from "./definitions/currency-column-type";
import { NumberColumnType } from "./definitions/number-column-type";
import type { ColumnTypeDefinition } from "./column-types.types";
import { DataTable } from "../data-table";
import type { DataTableColumnDef, FilterModel } from "../data-table.types";

/** Renderiza o widget do CHIP (fast filter) e devolve os inputs que ele ofereceu. */
function camposDoChip(
  tipo: ColumnTypeDefinition,
  props: Record<string, unknown>,
): HTMLInputElement[] {
  const node = tipo.renderFastFilterInput({
    value: null,
    onChange: () => {},
    ...props,
  } as never);
  const { container } = render(<>{node}</>);
  return Array.from(container.querySelectorAll("input"));
}

describe("chip do currency — `between` abre a faixa, igual ao number", () => {
  it("currency com between abre em between no chip: dois campos, mín e máx", () => {
    const campos = camposDoChip(CurrencyColumnType, {
      value: [10, 500],
      operator: "between",
    });
    expect(campos.length).toBe(2);
    expect(campos[0].value).toBe("10");
    expect(campos[1].value).toBe("500");
  });

  it("a faixa aberta tem lado mínimo e lado máximo distinguíveis (não dois campos mudos)", () => {
    const campos = camposDoChip(CurrencyColumnType, {
      value: [10, 500],
      operator: "between",
    });
    expect(campos[0].getAttribute("aria-label")).toBe("Mínimo");
    expect(campos[1].getAttribute("aria-label")).toBe("Máximo");
  });

  it("tupla sem operador explícito também abre a faixa (mesma guarda do number)", () => {
    // Visão salva / preset pode trazer o valor em tupla antes de o operador
    // chegar ao widget. O number já cobre esse caso com `Array.isArray(value)`.
    expect(camposDoChip(CurrencyColumnType, { value: [10, 500] }).length).toBe(2);
  });

  it("paridade: number e currency abrem o MESMO número de campos em between", () => {
    const comNumber = camposDoChip(NumberColumnType, {
      value: [10, 500],
      operator: "between",
    });
    const comCurrency = camposDoChip(CurrencyColumnType, {
      value: [10, 500],
      operator: "between",
    });
    expect(comCurrency.length).toBe(comNumber.length);
  });

  it("faixa vazia abre os dois campos vazios, não um campo com 'null'", () => {
    const campos = camposDoChip(CurrencyColumnType, {
      value: [null, null],
      operator: "between",
    });
    expect(campos.length).toBe(2);
    expect(campos[0].value).toBe("");
    expect(campos[1].value).toBe("");
  });

  it("os dois campos do chip têm largura própria — cabem lado a lado no popover", () => {
    // Sem largura declarada, dois `<input>` de largura intrínseca (~20ch) estouram a
    // caixa do popover: o máximo sai da tela. É por isso que o `number` fixa `w-[90px]`.
    const campos = camposDoChip(CurrencyColumnType, {
      value: [10, 500],
      operator: "between",
    });
    expect(campos[0].className.includes("w-[110px]")).toBe(true);
    expect(campos[1].className.includes("w-[110px]")).toBe(true);
  });

  it("faixa de lado aberto mostra só o lado preenchido", () => {
    const campos = camposDoChip(CurrencyColumnType, {
      value: [null, 500],
      operator: "between",
    });
    expect(campos[0].value).toBe("");
    expect(campos[1].value).toBe("500");
  });
});

/* O campo (builder avançado + funil) JÁ tinha a faixa. Ele passou a compartilhar o
   widget com o chip, então entra aqui como caminho antigo: o que muda de lado é o
   chip, não ele. */
describe("campo do currency — a faixa que já existia não mudou", () => {
  function camposDoFiltro(props: Record<string, unknown>): HTMLInputElement[] {
    const node = CurrencyColumnType.renderFilterInput({
      value: null,
      onChange: () => {},
      operator: "equals",
      ...props,
    } as never);
    const { container } = render(<>{node}</>);
    return Array.from(container.querySelectorAll("input"));
  }

  it("campo em between continua com os dois lados e os valores", () => {
    const campos = camposDoFiltro({ value: [10, 500], operator: "between" });
    expect(campos.length).toBe(2);
    expect(campos[0].value).toBe("10");
    expect(campos[1].value).toBe("500");
  });

  it("campo em between continua na altura do FilterField (36px)", () => {
    // `FILTER_FIELD_SIZE` é o que alinha Campo/Operador/Valor na mesma linha.
    // É a ÚNICA diferença entre a faixa do campo e a do chip.
    const campos = camposDoFiltro({ value: [10, 500], operator: "between" });
    expect(campos[0].className.includes("min-h-form-md")).toBe(true);
    expect(campos[1].className.includes("min-h-form-md")).toBe(true);
  });

  it("campo em equals continua com um input só", () => {
    const campos = camposDoFiltro({ value: 10, operator: "equals" });
    expect(campos.length).toBe(1);
    expect(campos[0].getAttribute("placeholder")).toBe("0,00");
  });
});

describe("chip do currency — editar a faixa emite a TUPLA, nunca um escalar", () => {
  it("editar o mínimo preserva o máximo", () => {
    const emitidos: unknown[] = [];
    const campos = camposDoChip(CurrencyColumnType, {
      value: [10, 500],
      operator: "between",
      onChange: (v: unknown) => emitidos.push(v),
    });
    fireEvent.change(campos[0], { target: { value: "20" } });
    expect(emitidos).toEqual([[20, 500]]);
  });

  it("editar o máximo preserva o mínimo", () => {
    const emitidos: unknown[] = [];
    const campos = camposDoChip(CurrencyColumnType, {
      value: [10, 500],
      operator: "between",
      onChange: (v: unknown) => emitidos.push(v),
    });
    fireEvent.change(campos[1], { target: { value: "900" } });
    expect(emitidos).toEqual([[10, 900]]);
  });

  it("limpar um lado emite null nele — não 0, que é um filtro de verdade", () => {
    const emitidos: unknown[] = [];
    const campos = camposDoChip(CurrencyColumnType, {
      value: [10, 500],
      operator: "between",
      onChange: (v: unknown) => emitidos.push(v),
    });
    fireEvent.change(campos[0], { target: { value: "" } });
    expect(emitidos).toEqual([[null, 500]]);
  });
});

describe("chip do currency — CAMINHO ANTIGO: sem between, nada mudou", () => {
  it("currency sem between continua em equals: um campo só, com o valor", () => {
    const campos = camposDoChip(CurrencyColumnType, {
      value: 10,
      operator: "equals",
    });
    expect(campos.length).toBe(1);
    expect(campos[0].value).toBe("10");
    expect(campos[0].getAttribute("type")).toBe("number");
    expect(campos[0].getAttribute("placeholder")).toBe("0,00");
  });

  it("currency sem operador nenhum continua num campo só", () => {
    expect(camposDoChip(CurrencyColumnType, { value: 10 }).length).toBe(1);
  });

  it("currency vazio em equals continua com o campo vazio (não 'null')", () => {
    const campos = camposDoChip(CurrencyColumnType, {
      value: null,
      operator: "equals",
    });
    expect(campos.length).toBe(1);
    expect(campos[0].value).toBe("");
  });

  it.each(["gt", "lt", "gte", "lte"])(
    "currency em %s continua num campo só",
    (op) => {
      expect(camposDoChip(CurrencyColumnType, { value: 10, operator: op }).length).toBe(
        1,
      );
    },
  );

  it("o campo único emite ESCALAR, não tupla", () => {
    const emitidos: unknown[] = [];
    const campos = camposDoChip(CurrencyColumnType, {
      value: 10,
      operator: "equals",
      onChange: (v: unknown) => emitidos.push(v),
    });
    fireEvent.change(campos[0], { target: { value: "42" } });
    expect(emitidos).toEqual([42]);
  });
});

/* O unitário acima prova o widget. Este prova o CAMINHO: coluna currency declarada no
   DataTable real → chip aplicado → popover. É onde o consumidor via o `10,500`, e onde
   um refactor do roteamento de widget do chip (`isTupleOperator`) reabriria o defeito. */
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

  type Row = { id: string; valor: number };
  const ROWS: Row[] = [
    { id: "1", valor: 120 },
    { id: "2", valor: 980 },
  ];

  const COLUNAS: DataTableColumnDef<Row>[] = [
    { field: "id", headerName: "ID" },
    {
      field: "valor",
      headerName: "Valor",
      type: "currency",
      // O roteamento do widget do chip lê `col.filterType` (não cai pro `type`):
      // `data-table.tsx` resolve `col?.filterType ?? "text"`. Declarado aqui de
      // propósito — é o que um consumidor de filtro de moeda escreve hoje.
      filterType: "currency",
      enableColumnFilter: true,
    },
  ];

  /** Abre o chip de Valor e devolve os inputs do popover. */
  async function abrirChipDeValor(model: FilterModel): Promise<HTMLInputElement[]> {
    render(
      <DataTable
        rows={ROWS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        filterModel={model}
        onFilterModelChange={() => {}}
        toolbar={{ enableFilters: true }}
      />,
    );
    // Mesmo alvo do `owns-multi.test.tsx`: o chip não é <button> nem tem role —
    // é o menor elemento cujo texto começa pelo rótulo da coluna.
    const chip = Array.from(document.querySelectorAll("div,span"))
      .filter((e) => /^Valor/.test(e.textContent ?? ""))
      .sort((a, b) => (a.textContent ?? "").length - (b.textContent ?? "").length)[0];
    if (!chip) throw new Error("chip de Valor não encontrado");
    await userEvent.click(chip);
    return Array.from(
      document.querySelectorAll<HTMLInputElement>("[data-radix-popper-content-wrapper] input"),
    );
  }

  it("chip de currency em between abre os DOIS campos da faixa", async () => {
    const campos = await abrirChipDeValor({
      logicOperator: "AND",
      items: [{ id: "f1", field: "valor", operator: "between", value: [10, 500] }],
    });
    expect(campos.length).toBe(2);
    expect(campos[0].value).toBe("10");
    expect(campos[1].value).toBe("500");
  });

  it("chip de currency em equals continua com UM campo (caminho antigo)", async () => {
    const campos = await abrirChipDeValor({
      logicOperator: "AND",
      items: [{ id: "f1", field: "valor", operator: "equals", value: 120 }],
    });
    expect(campos.length).toBe(1);
    expect(campos[0].value).toBe("120");
  });
});
