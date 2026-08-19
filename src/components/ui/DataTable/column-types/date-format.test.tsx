import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DateColumnType } from "./definitions/date-column-type";
import { DatetimeColumnType } from "./definitions/datetime-column-type";
import type { ColumnTypeDefinition } from "./column-types.types";

/**
 * `type: "date"` e `type: "datetime"` mostram o ANO, e `column.valueFormatter` alcança
 * a célula.
 *
 * Os dois defeitos foram achados por um agente consumidor gerando uma tela de usinas:
 *
 * 1. O formato era `{ day: "2-digit", month: "short" }` → "14 de mar", **sem ano** e sem
 *    forma de mudar. Numa carteira que atravessa anos, usina de 2015 e de 2024 apareciam
 *    idênticas. Era o único achado daquela rodada **sem documentação em lugar nenhum**.
 *
 * 2. `valueFormatter` não alcançava a célula: a cadeia é
 *    `col.render > registry.renderCell > col.valueFormatter`, então o `renderCell` do tipo
 *    vencia e ignorava o formatter. Passar `valueFormatter` num `type: "date"` mudava
 *    export, totalizador e clipboard e **não mudava o que aparecia** — enquanto o JSDoc de
 *    `formatValue` afirmava "aplicado quando consumer não passa `column.valueFormatter`".
 *    A doc descrevia o comportamento certo; o código fazia outro.
 */

/** 14 de março de 2023, 09:30 — data fixa, sem depender do relógio do CI. */
const QUANDO = new Date(2023, 2, 14, 9, 30).getTime();

function textoDaCelula(tipo: ColumnTypeDefinition, props: Record<string, unknown>) {
  const node = tipo.renderCell?.({ value: QUANDO, row: {}, ...props } as never);
  const { container } = render(<>{node}</>);
  return container.textContent ?? "";
}

describe("type: date — a célula mostra o ano", () => {
  it("renderCell inclui o ano", () => {
    const txt = textoDaCelula(DateColumnType, {});
    expect(txt).toContain("2023");
    expect(txt).toBe("14/03/2023");
  });

  it("formatValue (export, totalizador, clipboard) inclui o ano", () => {
    expect(DateColumnType.formatValue?.(QUANDO)).toBe("14/03/2023");
  });

  it("célula e export concordam — senão a tabela mostra uma coisa e o CSV outra", () => {
    expect(textoDaCelula(DateColumnType, {})).toBe(DateColumnType.formatValue?.(QUANDO));
  });

  it("valor vazio/inválido não vira data falsa", () => {
    expect(DateColumnType.formatValue?.(null)).toBe("");
    expect(DateColumnType.formatValue?.(undefined)).toBe("");
    expect(DateColumnType.formatValue?.("não é data")).toBe("");
  });
});

describe("type: datetime — a célula mostra o ano e a hora", () => {
  it("renderCell inclui ano e hora", () => {
    const txt = textoDaCelula(DatetimeColumnType, {});
    expect(txt).toContain("2023");
    expect(txt).toContain("09:30");
    expect(txt).toContain("14/03/2023");
  });

  it("formatValue concorda com a célula", () => {
    expect(textoDaCelula(DatetimeColumnType, {})).toBe(
      DatetimeColumnType.formatValue?.(QUANDO),
    );
  });
});

describe("column.valueFormatter alcança a célula", () => {
  it("date: o formatter do consumer vence o formato do tipo", () => {
    const txt = textoDaCelula(DateColumnType, {
      column: { valueFormatter: () => "março de 2023" },
    });
    expect(txt).toBe("março de 2023");
  });

  it("datetime: idem", () => {
    const txt = textoDaCelula(DatetimeColumnType, {
      column: { valueFormatter: () => "há 2 dias" },
    });
    expect(txt).toBe("há 2 dias");
  });

  it("recebe o valor cru, então dá pra formatar de verdade", () => {
    const recebidos: unknown[] = [];
    textoDaCelula(DateColumnType, {
      column: {
        valueFormatter: (v: unknown) => {
          recebidos.push(v);
          return "x";
        },
      },
    });
    expect(recebidos).toEqual([QUANDO]);
  });

  it("sem valueFormatter, cai no formato do tipo (não quebra quem não usa)", () => {
    expect(textoDaCelula(DateColumnType, { column: {} })).toBe("14/03/2023");
    expect(textoDaCelula(DateColumnType, { column: { field: "criadoEm" } })).toBe(
      "14/03/2023",
    );
  });
});
