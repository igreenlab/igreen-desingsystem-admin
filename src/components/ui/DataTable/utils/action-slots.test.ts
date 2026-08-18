import { describe, it, expect } from "vitest";
import {
  ACTIONS_INLINE_MAX,
  actionsWidthForSlots,
  splitActionSlots,
  countActionSlots,
  measureActionsWidth,
} from "./action-slots";
import { calculateColumnWidths } from "./calculate-column-widths";
import { ACTIONS_COLUMN_WIDTH } from "../data-table.constants";
import type { DataTableActionItem, DataTableColumnDef } from "../data-table.types";

type Pedido = { id: number; status: "aberto" | "fechado" };

const acao = (
  id: string,
  extra: Partial<DataTableActionItem<Pedido>> = {},
): DataTableActionItem<Pedido> => ({
  id,
  label: id,
  onClick: () => {},
  ...extra,
});

const row: Pedido = { id: 1, status: "aberto" };

describe("splitActionSlots — a regra de inline vs menu", () => {
  it("1 ação: um ícone, sem o “…” (o caso `editar`)", () => {
    const s = splitActionSlots([acao("editar")], row);
    expect(s.inline.map((a) => a.id)).toEqual(["editar"]);
    expect(s.menu).toEqual([]);
    expect(countActionSlots(s)).toBe(1);
  });

  it("3 ações: todas inline, ainda sem “…”", () => {
    const s = splitActionSlots([acao("ver"), acao("editar"), acao("excluir")], row);
    expect(s.inline).toHaveLength(3);
    expect(s.menu).toEqual([]);
    expect(countActionSlots(s)).toBe(3);
  });

  it("4 ações: TODAS vão pro “…” — 4 ícones não cabem na coluna", () => {
    const s = splitActionSlots(
      [acao("ver"), acao("editar"), acao("duplicar"), acao("excluir")],
      row,
    );
    expect(s.inline).toEqual([]);
    expect(s.menu).toHaveLength(4);
    expect(countActionSlots(s)).toBe(1); // só o "…"
  });

  it("split explícito do consumer manda, mesmo acima de 3", () => {
    const s = splitActionSlots(
      [
        acao("a"),
        acao("b"),
        acao("c"),
        acao("d"),
        acao("arquivar", { showInMenu: true }),
      ],
      row,
    );
    expect(s.inline.map((a) => a.id)).toEqual(["a", "b", "c", "d"]);
    expect(s.menu.map((a) => a.id)).toEqual(["arquivar"]);
    expect(countActionSlots(s)).toBe(5);
  });

  it("`hidden` por row remove antes de contar — 4 com 1 oculta volta a caber inline", () => {
    const acoes = [
      acao("ver"),
      acao("editar"),
      acao("excluir"),
      acao("cancelar", { hidden: (r: Pedido) => r.status === "fechado" }),
    ];
    const aberto = splitActionSlots(acoes, { id: 1, status: "aberto" });
    const fechado = splitActionSlots(acoes, { id: 2, status: "fechado" });
    expect(countActionSlots(aberto)).toBe(1); // 4 visíveis → tudo no menu
    expect(fechado.inline).toHaveLength(3); // 3 visíveis → inline
    expect(fechado.menu).toEqual([]);
  });

  it("nenhuma ação visível: nada a renderizar", () => {
    const s = splitActionSlots([acao("x", { hidden: true })], row);
    expect(countActionSlots(s)).toBe(0);
  });
});

describe("actionsWidthForSlots — a geometria", () => {
  it("30n + 14, dos tokens da variante `actions` (pad-md×2 + form-xs + gp-2xs)", () => {
    // Números conferidos no browser, não derivados no papel: a célula renderizada mede
    // padding 8px/8px e botão 28px. A primeira versão usava pad-2xl (16px) e dava
    // 30n+30 — o teste concordava porque saía da mesma fórmula errada (L-064).
    expect(actionsWidthForSlots(1)).toBe(44);
    expect(actionsWidthForSlots(2)).toBe(74);
    expect(actionsWidthForSlots(3)).toBe(104);
    expect(actionsWidthForSlots(4)).toBe(134);
  });

  it("ACTIONS_INLINE_MAX é o maior nº de slots que CABE nos 120px legados", () => {
    // A justificativa do limite: 3 cabem, 4 não. Note que 120 NÃO é a largura de 3
    // slots (são 104) — é só um valor legado com folga suficiente pra 3.
    expect(actionsWidthForSlots(ACTIONS_INLINE_MAX)).toBeLessThanOrEqual(
      ACTIONS_COLUMN_WIDTH,
    );
    expect(actionsWidthForSlots(ACTIONS_INLINE_MAX + 1)).toBeGreaterThan(
      ACTIONS_COLUMN_WIDTH,
    );
  });

  it("nunca devolve menos que 1 slot", () => {
    expect(actionsWidthForSlots(0)).toBe(44);
  });
});

describe("measureActionsWidth — máximo entre as rows amostradas", () => {
  const rows: Pedido[] = [
    { id: 1, status: "fechado" }, // 3 visíveis → 3 slots → 104
    { id: 2, status: "aberto" }, // 4 visíveis → tudo no menu → 1 slot → 44
  ];
  const getActions = () => [
    acao("ver"),
    acao("editar"),
    acao("excluir"),
    acao("cancelar", { hidden: (r: Pedido) => r.status === "fechado" }),
  ];

  it("reserva pelo MAIOR — a row mais completa não pode ser cortada", () => {
    expect(measureActionsWidth(getActions, rows)).toBe(104);
    expect(measureActionsWidth(getActions, [rows[1]])).toBe(44);
  });

  it("sem getActions ou sem rows devolve null (quem chama decide o fallback)", () => {
    expect(measureActionsWidth(undefined, rows)).toBeNull();
    expect(measureActionsWidth(getActions, [])).toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Integração com o cálculo de largura — a precedência, e os 2 defeitos medidos
   ═══════════════════════════════════════════════════════════════════════════ */

describe("calculateColumnWidths — coluna de ações", () => {
  const dados: DataTableColumnDef<Pedido>[] = [
    { field: "id", headerName: "ID" },
    { field: "status", headerName: "Status" },
  ];
  const rows: Pedido[] = [{ id: 1, status: "aberto" }];

  const larguraDe = (acoes: Partial<DataTableColumnDef<Pedido>>) =>
    calculateColumnWidths<Pedido>(
      [
        ...dados,
        {
          field: "_actions",
          headerName: "",
          type: "actions",
          ...acoes,
        } as DataTableColumnDef<Pedido>,
      ],
      rows,
      { containerWidth: 1200, autoFit: true },
    )["_actions"];

  it("honra `col.width` — antes era IGNORADO em silêncio (devolvia 120)", () => {
    expect(larguraDe({ width: 64 })).toBe(64);
    expect(larguraDe({ width: 240 })).toBe(240);
  });

  it("`minWidth` segue funcionando (era a única saída que funcionava)", () => {
    expect(larguraDe({ minWidth: 200 })).toBe(200);
  });

  it("sem width explícito, DERIVA do número de ações", () => {
    expect(larguraDe({ getActions: () => [acao("editar")] })).toBe(44);
    expect(larguraDe({ getActions: () => [acao("a"), acao("b")] })).toBe(74);
    expect(larguraDe({ getActions: () => [acao("a"), acao("b"), acao("c")] })).toBe(104);
    // 4 ações colapsam no "…" → 1 slot → 44, em vez de pedir 134 num campo de 120
    expect(
      larguraDe({ getActions: () => [acao("a"), acao("b"), acao("c"), acao("d")] }),
    ).toBe(44);
  });

  it("sem `getActions` cai no legado 120", () => {
    expect(larguraDe({})).toBe(ACTIONS_COLUMN_WIDTH);
  });

  it("nunca entra no flex — não estica com container largo", () => {
    const estreito = calculateColumnWidths<Pedido>(
      [...dados, { field: "_actions", headerName: "", type: "actions" }],
      rows,
      { containerWidth: 600, autoFit: true },
    )["_actions"];
    const largo = calculateColumnWidths<Pedido>(
      [...dados, { field: "_actions", headerName: "", type: "actions" }],
      rows,
      { containerWidth: 2400, autoFit: true },
    )["_actions"];
    expect(estreito).toBe(largo);
  });
});
