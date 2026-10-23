/**
 * As 6 situações do pedido Sollution (início/fim/tarefa inteira × adiada/
 * antecipada) saem de UMA regra: cada data anterior que não é a atual vira uma
 * marca na ponta que ela era. Este teste é a prova de que a regra cobre as 6 —
 * se alguém reintroduzir casos especiais, ele continua verde e a complexidade
 * volta sem necessidade.
 */
import { describe, expect, it } from "vitest";
import {
  clusterHistoryMarks,
  deriveHistoryMarks,
  historyMarkOpacity,
} from "./history-marks";
import type { GanttBar } from "../gantt.types";

const d = (iso: string) => new Date(`${iso}T00:00:00`);

const barra = (over: Partial<GanttBar>): GanttBar => ({
  id: "b1",
  start: d("2026-03-10"),
  end: d("2026-03-20"),
  ...over,
});

describe("deriveHistoryMarks — as 6 situações numa regra só", () => {
  it("sem history, nenhuma marca", () => {
    expect(deriveHistoryMarks(barra({}))).toEqual([]);
  });

  it("1. início ADIADO — a marca fica antes do início atual", () => {
    const m = deriveHistoryMarks(
      barra({ history: [{ start: d("2026-03-05"), end: d("2026-03-20") }] }),
    );
    expect(m).toHaveLength(1);
    expect(m[0].edge).toBe("start");
    expect(m[0].date).toEqual(d("2026-03-05"));
  });

  it("2. início ANTECIPADO — mesma regra, marca depois do início atual", () => {
    const m = deriveHistoryMarks(
      barra({ history: [{ start: d("2026-03-14"), end: d("2026-03-20") }] }),
    );
    expect(m).toHaveLength(1);
    expect(m[0].edge).toBe("start");
    expect(m[0].date).toEqual(d("2026-03-14"));
  });

  it("3. fim ADIADO e 4. fim ANTECIPADO só diferem na posição", () => {
    const adiado = deriveHistoryMarks(
      barra({ history: [{ start: d("2026-03-10"), end: d("2026-03-16") }] }),
    );
    const antecipado = deriveHistoryMarks(
      barra({ history: [{ start: d("2026-03-10"), end: d("2026-03-28") }] }),
    );
    expect(adiado[0].edge).toBe("end");
    expect(antecipado[0].edge).toBe("end");
    expect(adiado[0].date.getTime()).toBeLessThan(antecipado[0].date.getTime());
  });

  it("5/6. tarefa INTEIRA movida vira DUAS marcas, uma por ponta", () => {
    const m = deriveHistoryMarks(
      barra({ history: [{ start: d("2026-03-01"), end: d("2026-03-11") }] }),
    );
    expect(m.map((x) => x.edge)).toEqual(["start", "end"]);
  });

  it("ponta que NÃO mudou não vira marca", () => {
    // start igual ao atual; só o end mudou.
    const m = deriveHistoryMarks(
      barra({ history: [{ start: d("2026-03-10"), end: d("2026-03-25") }] }),
    );
    expect(m).toHaveLength(1);
    expect(m[0].edge).toBe("end");
  });

  it("data REPETIDA fica só na ocorrência mais recente", () => {
    const m = deriveHistoryMarks(
      barra({
        history: [
          { start: d("2026-03-10"), end: d("2026-03-25"), meta: "antiga" },
          { start: d("2026-03-10"), end: d("2026-03-27") },
          { start: d("2026-03-10"), end: d("2026-03-25"), meta: "recente" },
        ],
      }),
    );
    const em25 = m.filter((x) => x.date.getTime() === d("2026-03-25").getTime());
    expect(em25).toHaveLength(1);
    expect(em25[0].entry.meta).toBe("recente");
  });

  it("marcas saem ordenadas pelo eixo do tempo", () => {
    const m = deriveHistoryMarks(
      barra({
        history: [
          { start: d("2026-03-10"), end: d("2026-03-28") },
          { start: d("2026-03-02"), end: d("2026-03-20") },
        ],
      }),
    );
    expect(m.map((x) => x.date.getTime())).toEqual(
      [...m].map((x) => x.date.getTime()).sort((a, b) => a - b),
    );
  });

  it("data inválida é ignorada em vez de virar NaN no layout", () => {
    const m = deriveHistoryMarks(
      barra({
        history: [{ start: new Date("x"), end: d("2026-03-25") }],
      }),
    );
    expect(m).toHaveLength(1);
    expect(m[0].edge).toBe("end");
  });
});

describe("historyMarkOpacity — mais clara é mais antiga", () => {
  it("cresce do mais antigo pro mais recente, com piso visível", () => {
    expect(historyMarkOpacity(0, 4)).toBeCloseTo(0.35);
    expect(historyMarkOpacity(3, 4)).toBeCloseTo(1);
    expect(historyMarkOpacity(0, 4)).toBeLessThan(historyMarkOpacity(2, 4));
  });

  it("marca única é opaca — não há 'mais antiga' pra comparar", () => {
    expect(historyMarkOpacity(0, 1)).toBe(1);
  });

  /**
   * Regressão de um defeito que `tsc` e o resto destes testes não pegariam:
   * `index` conta ENTRADAS e o total tem que contar entradas também. Uma
   * entrada que remarcou as duas pontas produz DUAS marcas de índice 0 — se o
   * total vier de `marks.length`, ela cai em `historyMarkOpacity(0, 2)` = piso,
   * e a única alteração da barra aparece apagada como se fosse a mais antiga.
   * Encontrado no browser, na linha "Piloto em campo" da GanttDoc.
   */
  it("entrada que remarca as DUAS pontas fica opaca, não no piso", () => {
    const marks = deriveHistoryMarks(
      barra({
        start: d("2026-03-10"),
        end: d("2026-03-20"),
        history: [{ start: d("2026-03-05"), end: d("2026-03-16") }],
      }),
    );

    expect(marks).toHaveLength(2);
    expect(marks.map((m) => m.index)).toEqual([0, 0]);

    const totalEntradas = 1;
    for (const m of marks) {
      expect(historyMarkOpacity(m.index, totalEntradas)).toBe(1);
    }
    // E a conta errada, a que o defeito fazia:
    expect(historyMarkOpacity(0, marks.length)).toBeCloseTo(0.35);
  });
});

describe("clusterHistoryMarks — escala larga vira contador", () => {
  const marks = deriveHistoryMarks(
    barra({
      history: [
        { start: d("2026-03-01"), end: d("2026-03-20") },
        { start: d("2026-03-02"), end: d("2026-03-20") },
        { start: d("2026-03-03"), end: d("2026-03-20") },
      ],
    }),
  );

  it("na escala dia (muitos px por dia) cada marca fica sozinha", () => {
    const c = clusterHistoryMarks(marks, (m) => m.date.getDate() * 40, 12);
    expect(c).toHaveLength(3);
  });

  it("na escala semana (poucos px por dia) viram um grupo só", () => {
    const c = clusterHistoryMarks(marks, (m) => m.date.getDate() * 2, 12);
    expect(c).toHaveLength(1);
    expect(c[0].marks).toHaveLength(3);
  });
});
