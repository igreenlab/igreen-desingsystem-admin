import { describe, it, expect } from "vitest";
import { calculateColumnWidths } from "./calculate-column-widths";
import type { DataTableColumnDef } from "../data-table.types";

/**
 * A soma das larguras tem de FECHAR no container — inclusive as colunas fixas.
 *
 * O defeito que estes testes travam foi medido no browser, no próprio
 * `#/clientes-showcase`: 13 colunas somando 1950px num container de 1906 →
 * **44px de scroll horizontal**, e a coluna de ações mede exatamente 44px.
 *
 * A causa era o snap final do rateio comparar `soma(targets)` com o container
 * inteiro. `actions`/`checkbox` são excluídos dos targets, então os targets
 * preenchiam a tela toda e as fixas sobravam por cima.
 *
 * A coluna de SELEÇÃO nunca sofreu disso porque não está em `columns` — é
 * descontada antes, via `reservedWidth`. Só as fixas que ESTÃO em `columns`
 * caíam no buraco.
 */

type Row = { a: string; b: string; c: string; d: string };
const rows: Row[] = Array.from({ length: 30 }, (_, i) => ({
  a: `A${i}`,
  b: `B${i}`,
  c: `C${i}`,
  d: `D${i}`,
}));

const dados = (): DataTableColumnDef<Row>[] =>
  (["a", "b", "c", "d"] as const).map((f) => ({ field: f, headerName: f.toUpperCase() }));

const acoes = (extra: Partial<DataTableColumnDef<Row>> = {}) =>
  ({
    field: "_actions",
    headerName: "",
    type: "actions",
    getActions: () => [{ id: "x", label: "x", onClick: () => {} }],
    ...extra,
  }) as DataTableColumnDef<Row>;

const checkbox = (w = 56) =>
  ({ field: "_sel", headerName: "", type: "checkbox", width: w }) as DataTableColumnDef<Row>;

const somar = (w: Record<string, number>) =>
  Object.values(w).reduce((x, y) => x + y, 0);

const larguras = (cols: DataTableColumnDef<Row>[], containerWidth = 1200) =>
  calculateColumnWidths<Row>(cols, rows, { containerWidth, autoFit: true });

describe("calculateColumnWidths — a soma fecha no container", () => {
  it("sem colunas fixas: fecha exato (já era o caso)", () => {
    expect(somar(larguras(dados()))).toBe(1200);
  });

  it("COM coluna de ações: fecha exato — antes sobrava a largura dela", () => {
    const w = larguras([...dados(), acoes()]);
    expect(somar(w)).toBe(1200);
  });

  it("COM checkbox: fecha exato", () => {
    expect(somar(larguras([checkbox(), ...dados()]))).toBe(1200);
  });

  it("COM checkbox + ações: fecha exato — o pior caso, sobravam as duas", () => {
    expect(somar(larguras([checkbox(), ...dados(), acoes()]))).toBe(1200);
  });

  it("a coluna fixa mantém a largura dela; quem cede espaço são os targets", () => {
    const semFixa = larguras(dados());
    const comFixa = larguras([...dados(), acoes()]);
    const largAcoes = comFixa["_actions"];
    expect(largAcoes).toBeGreaterThan(0);
    // os targets perderam exatamente a largura da coluna fixa
    const somaTargetsSem = (["a", "b", "c", "d"] as const).reduce((s, f) => s + semFixa[f], 0);
    const somaTargetsCom = (["a", "b", "c", "d"] as const).reduce((s, f) => s + comFixa[f], 0);
    expect(somaTargetsSem - somaTargetsCom).toBe(largAcoes);
  });

  it("vale em vários tamanhos de container — quando o conteúdo cabe", () => {
    // 4 colunas de dados pedem 160px cada (DEFAULT_COLUMN_WIDTH) + 56 do checkbox
    // + a de ações: o mínimo natural fica em ~740px. Abaixo disso o rateio não roda
    // e o scroll é legítimo — é o caso do teste seguinte.
    for (const c of [900, 1140, 1280, 1600, 1920, 2560]) {
      expect(somar(larguras([checkbox(), ...dados(), acoes()], c)), `container ${c}`).toBe(c);
    }
  });

  it("com maxWidth travando os targets, NÃO infla além do container", () => {
    const cols: DataTableColumnDef<Row>[] = [
      ...(["a", "b", "c", "d"] as const).map((f) => ({
        field: f,
        headerName: f.toUpperCase(),
        width: 120,
        maxWidth: 120,
      })),
      acoes(),
    ];
    expect(somar(larguras(cols))).toBeLessThanOrEqual(1200);
  });

  it("container menor que o conteúdo: não comprime (scroll é legítimo)", () => {
    // ⚠️ `field` ÚNICO por coluna. A 1ª versão deste teste repetia `field: "a"` nas 12,
    // e como o retorno é `Record<field, number>` sobrava 1 chave — a soma dava 204 em
    // vez de ~2000 e o teste "falhou" por defeito da fixture, não do código.
    const muitas: DataTableColumnDef<Row>[] = Array.from({ length: 12 }, (_, i) => ({
      field: `col${i}`,
      headerName: `Coluna bem longa ${i}`,
    }));
    const soma = somar(larguras([...muitas, acoes()], 400));
    expect(soma).toBeGreaterThan(400);
    // e o rateio não roda: cada coluna fica no piso, ninguém encolhe abaixo dele
    expect(soma).toBeGreaterThanOrEqual(12 * 160);
  });
});
