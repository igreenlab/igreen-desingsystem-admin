import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NumberColumnType } from "./definitions/number-column-type";
import { CurrencyColumnType } from "./definitions/currency-column-type";
import type { ColumnTypeDefinition } from "./column-types.types";
import { DataTable } from "../data-table";
import type { DataTableColumnDef } from "../data-table.types";

/**
 * `column.valueFormatter` alcança a célula também em `type: "number"` e `type: "currency"`.
 *
 * Os tipos `date` e `datetime` já respeitavam o formatter da coluna (`date-format.test.tsx`).
 * `number` e `currency` não: a cadeia de render é
 * `col.render > registry.renderCell > col.valueFormatter`, então o `renderCell` do tipo
 * vencia e ignorava o campo. Quem passava `valueFormatter` numa coluna `number` via o
 * formatter agir no export, no totalizador e no clipboard — e **não na célula**. O DS
 * discordava de si mesmo: três tipos com o escape hatch, dois sem.
 *
 * Referência de uso real: abreviar "1.234" para "1,2 mil" numa coluna de métrica.
 */

function textoDaCelula(
  tipo: ColumnTypeDefinition,
  valor: unknown,
  props: Record<string, unknown> = {},
) {
  const node = tipo.renderCell?.({ value: valor, row: {}, ...props } as never);
  const { container } = render(<>{node}</>);
  return container.textContent ?? "";
}

/** "1.234" → "1,2 mil" — o caso real que motivou o ajuste. */
const abreviar = (v: unknown) => {
  const n = Number(v);
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")} mil` : String(n);
};

/* Espaço NBSP que o Intl põe entre "R$" e o número — não digitar à mão. */
const BRL_1234_56 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(1234.56);

/* O `getByText` colapsa todo espaço (inclusive NBSP) num espaço comum antes de comparar;
   a string procurada não passa pelo mesmo normalizador. Sem isto o teste procura um
   NBSP que o DOM já normalizou e reprova por motivo nenhum do código. */
const BRL_1234_56_NO_DOM = BRL_1234_56.replace(/\s/g, " ");

describe("type: number — column.valueFormatter vence o formato do tipo", () => {
  it("number usa column.valueFormatter quando há", () => {
    const txt = textoDaCelula(NumberColumnType, 1234, {
      column: { valueFormatter: abreviar },
    });
    expect(txt).toBe("1,2 mil");
  });

  it("recebe o valor cru (não o já formatado pelo tipo)", () => {
    const recebidos: unknown[] = [];
    textoDaCelula(NumberColumnType, 1234, {
      column: {
        valueFormatter: (v: unknown) => {
          recebidos.push(v);
          return "x";
        },
      },
    });
    expect(recebidos).toEqual([1234]);
  });

  /* CAMINHO ANTIGO — o que não pode mudar pra quem não usa valueFormatter. */
  it("sem valueFormatter, o formato do TIPO continua valendo", () => {
    expect(textoDaCelula(NumberColumnType, 1234)).toBe("1.234");
    expect(textoDaCelula(NumberColumnType, 1234, { column: {} })).toBe("1.234");
    expect(textoDaCelula(NumberColumnType, 1234, { column: { field: "kwh" } })).toBe(
      "1.234",
    );
  });

  it("sem valueFormatter, valor vazio/inválido segue sem render (não vira '0')", () => {
    const node = NumberColumnType.renderCell?.({
      value: null,
      row: {},
      column: {},
    } as never);
    expect(node).toBeNull();
    expect(NumberColumnType.renderCell?.({ value: "abc", row: {} } as never)).toBeNull();
  });

  /* Review Focus #3 — a precedência é por EXISTÊNCIA do formatter, não pelo retorno.
     Implementação com `formatter(v) || formatoDoTipo(v)` reprova aqui. */
  it("valueFormatter que devolve string vazia renderiza vazio, não o valor cru", () => {
    const txt = textoDaCelula(NumberColumnType, 1234, {
      column: { valueFormatter: () => "" },
    });
    expect(txt).toBe("");
  });
});

describe("type: currency — column.valueFormatter vence o formato do tipo", () => {
  it("currency usa column.valueFormatter quando há", () => {
    const txt = textoDaCelula(CurrencyColumnType, 1234.56, {
      column: { valueFormatter: (v: unknown) => `R$ ${abreviar(v)}` },
    });
    expect(txt).toBe("R$ 1,2 mil");
  });

  it("recebe o valor cru, então dá pra formatar de verdade", () => {
    const recebidos: unknown[] = [];
    textoDaCelula(CurrencyColumnType, 1234.56, {
      column: {
        valueFormatter: (v: unknown) => {
          recebidos.push(v);
          return "x";
        },
      },
    });
    expect(recebidos).toEqual([1234.56]);
  });

  /* CAMINHO ANTIGO */
  it("sem valueFormatter, o formato do TIPO continua valendo", () => {
    expect(textoDaCelula(CurrencyColumnType, 1234.56)).toBe(BRL_1234_56);
    expect(textoDaCelula(CurrencyColumnType, 1234.56, { column: {} })).toBe(BRL_1234_56);
  });

  it("sem valueFormatter, typeOptions (moeda/locale) continuam mandando", () => {
    const txt = textoDaCelula(CurrencyColumnType, 1234.56, {
      column: { typeOptions: { currency: "USD", locale: "en-US" } },
    });
    expect(txt).toBe("$1,234.56");
  });

  it("valueFormatter que devolve string vazia renderiza vazio, não o valor cru", () => {
    const txt = textoDaCelula(CurrencyColumnType, 1234.56, {
      column: { valueFormatter: () => "" },
    });
    expect(txt).toBe("");
  });

  it("o formatter vence typeOptions também (é o escape hatch inteiro)", () => {
    const txt = textoDaCelula(CurrencyColumnType, 1234.56, {
      column: {
        valueFormatter: () => "custom",
        typeOptions: { currency: "USD", locale: "en-US" },
      },
    });
    expect(txt).toBe("custom");
  });
});

/* O teste unitário acima prova o `renderCell`; este prova o CAMINHO: coluna declarada
   no DataTable real → `data-table-row` → registry → célula. É onde o defeito aparecia
   pro consumidor, e onde um refactor da cadeia de fallback o reabriria. */
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

  type Row = { id: string; kwh: number; valor: number };
  const ROWS: Row[] = [{ id: "1", kwh: 1234, valor: 1234.56 }];

  function monta(colunas: DataTableColumnDef<Row>[]) {
    return render(
      <DataTable
        rows={ROWS}
        columns={colunas}
        getRowId={(r) => r.id}
        toolbar={{ enableSearch: false }}
      />,
    );
  }

  it("a célula number e a currency mostram o que o formatter da coluna devolve", () => {
    monta([
      { field: "kwh", headerName: "kWh", type: "number", valueFormatter: abreviar },
      {
        field: "valor",
        headerName: "Valor",
        type: "currency",
        valueFormatter: (v) => `R$ ${abreviar(v)}`,
      },
    ]);
    expect(screen.getByText("1,2 mil")).toBeTruthy();
    expect(screen.getByText("R$ 1,2 mil")).toBeTruthy();
    // E o formato do tipo NÃO aparece junto.
    expect(screen.queryByText("1.234")).toBeNull();
    expect(screen.queryByText(BRL_1234_56_NO_DOM)).toBeNull();
  });

  it("sem valueFormatter nas colunas, o DataTable mostra o formato do tipo (caminho antigo)", () => {
    monta([
      { field: "kwh", headerName: "kWh", type: "number" },
      { field: "valor", headerName: "Valor", type: "currency" },
    ]);
    expect(screen.getByText("1.234")).toBeTruthy();
    expect(screen.getByText(BRL_1234_56_NO_DOM)).toBeTruthy();
  });
});
