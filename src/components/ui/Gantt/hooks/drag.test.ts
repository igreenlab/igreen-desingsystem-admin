import { describe, expect, it } from "vitest";
import { dragToDates, linkTypeFromSides, sideFromPointer } from "./drag";

/**
 * Testes do núcleo do gesto. Cada bloco ataca uma afirmação de `drag.ts`.
 */

const d = (dia: number) => new Date(2026, 8, dia); // setembro/2026
const iso = (x: Date) => `${x.getDate()}`;

describe("dragToDates — move", () => {
  const barra = { start: d(10), end: d(15) };

  it("desloca as duas pontas e PRESERVA a duração", () => {
    const r = dragToDates(barra, 46 * 3, 46, "move");
    expect([iso(r.start), iso(r.end)]).toEqual(["13", "18"]);
  });

  it("aceita delta negativo", () => {
    const r = dragToDates(barra, -46 * 2, 46, "move");
    expect([iso(r.start), iso(r.end)]).toEqual(["8", "13"]);
  });

  /** Snap em dia inteiro: meio dia de arraste não move nada. */
  it("arraste menor que meio dia não move", () => {
    const r = dragToDates(barra, 20, 46, "move");
    expect([iso(r.start), iso(r.end)]).toEqual(["10", "15"]);
  });

  it("arraste de mais de meio dia arredonda pra 1 dia", () => {
    const r = dragToDates(barra, 24, 46, "move");
    expect([iso(r.start), iso(r.end)]).toEqual(["11", "16"]);
  });

  it("devolve o dia zerado, não o horário original", () => {
    const comHora = { start: new Date(2026, 8, 10, 14, 30), end: new Date(2026, 8, 15, 9) };
    const r = dragToDates(comHora, 0, 46, "move");
    expect(r.start.getHours()).toBe(0);
    expect(r.end.getHours()).toBe(0);
  });
});

describe("dragToDates — resize", () => {
  const barra = { start: d(10), end: d(15) };

  it("resize-start move só o início", () => {
    const r = dragToDates(barra, -46 * 2, 46, "resize-start");
    expect([iso(r.start), iso(r.end)]).toEqual(["8", "15"]);
  });

  it("resize-end move só o fim", () => {
    const r = dragToDates(barra, 46 * 4, 46, "resize-end");
    expect([iso(r.start), iso(r.end)]).toEqual(["10", "19"]);
  });

  /**
   * ⚠️ A borda que importa: arrastar o punho inicial PARA DEPOIS do fim.
   *
   * Sem clamp a duração ficaria negativa, e como `left`/`width` saem de
   * `dateToX`, a largura viraria negativa e a barra **desapareceria** no meio do
   * gesto — sem erro, sem exceção, sem nada no console.
   */
  it("resize-start não passa do fim: para em start === end", () => {
    const r = dragToDates(barra, 46 * 20, 46, "resize-start");
    expect([iso(r.start), iso(r.end)]).toEqual(["15", "15"]);
    expect(r.start.getTime()).toBeLessThanOrEqual(r.end.getTime());
  });

  it("resize-end não passa do início: para em end === start", () => {
    const r = dragToDates(barra, -46 * 20, 46, "resize-end");
    expect([iso(r.start), iso(r.end)]).toEqual(["10", "10"]);
    expect(r.end.getTime()).toBeGreaterThanOrEqual(r.start.getTime());
  });

  it("chegar EXATAMENTE na outra ponta é permitido (duração 1 dia)", () => {
    const r = dragToDates(barra, 46 * 5, 46, "resize-start");
    expect([iso(r.start), iso(r.end)]).toEqual(["15", "15"]);
  });

  it("passar um dia além da outra ponta ainda para nela", () => {
    const r = dragToDates(barra, 46 * 6, 46, "resize-start");
    expect([iso(r.start), iso(r.end)]).toEqual(["15", "15"]);
  });
});

describe("dragToDates — guardas", () => {
  const barra = { start: d(10), end: d(15) };

  /**
   * `pxPerDay` zero acontece de verdade: o container ainda não foi medido no
   * primeiro paint. Sem a guarda, `deltaPx / 0` é `Infinity` e `addDays`
   * devolve `Invalid Date` — a barra sai da tela e não volta.
   */
  it("pxPerDay zero ou negativo devolve a barra intacta", () => {
    for (const px of [0, -46, Number.NaN, Number.POSITIVE_INFINITY]) {
      const r = dragToDates(barra, 500, px, "move");
      expect([iso(r.start), iso(r.end)]).toEqual(["10", "15"]);
    }
  });

  it("delta zero devolve a barra intacta", () => {
    const r = dragToDates(barra, 0, 46, "resize-end");
    expect([iso(r.start), iso(r.end)]).toEqual(["10", "15"]);
  });

  /**
   * ⛔ A razão de `addDays` e não soma de milissegundos: num fuso com horário de
   * verão o dia tem 23 ou 25 horas. A soma em ms deslocaria 1 hora, e com snap
   * de dia inteiro 1 hora vira **um dia** de erro.
   *
   * Aqui a verificação é estrutural: o resultado é sempre meia-noite local e a
   * diferença em dias de CALENDÁRIO é exatamente a pedida — o que a soma de ms
   * não garante.
   */
  it("o deslocamento é em dias de calendário, não em 86.400.000ms", () => {
    // Uma janela larga o suficiente pra cruzar qualquer virada de DST do ano.
    for (let mes = 0; mes < 12; mes++) {
      const b = { start: new Date(2026, mes, 10), end: new Date(2026, mes, 12) };
      const r = dragToDates(b, 46 * 7, 46, "move");
      expect(r.start.getHours()).toBe(0);
      expect(r.end.getHours()).toBe(0);
      expect(r.start.getDate()).toBe(17);
    }
  });
});

describe("linkTypeFromSides", () => {
  /** As 4 combinações cobrem os 4 tipos — nenhuma sobra, nenhuma falta. */
  it("mapeia as 4 combinações nos 4 tipos", () => {
    expect(linkTypeFromSides("end", "start")).toBe("FS");
    expect(linkTypeFromSides("start", "start")).toBe("SS");
    expect(linkTypeFromSides("end", "end")).toBe("FF");
    expect(linkTypeFromSides("start", "end")).toBe("SF");
  });

  it("as 4 saídas são distintas — o mapa é injetivo", () => {
    const saidas = new Set([
      linkTypeFromSides("end", "start"),
      linkTypeFromSides("start", "start"),
      linkTypeFromSides("end", "end"),
      linkTypeFromSides("start", "end"),
    ]);
    expect(saidas.size).toBe(4);
  });
});

describe("sideFromPointer", () => {
  it("metade esquerda é start, metade direita é end", () => {
    expect(sideFromPointer(110, 100, 40)).toBe("start");
    expect(sideFromPointer(130, 100, 40)).toBe("end");
  });

  it("o centro exato conta como end", () => {
    // `x < centro` é falso no centro — decisão arbitrária, mas fixada por
    // teste pra não virar comportamento diferente numa refatoração.
    expect(sideFromPointer(120, 100, 40)).toBe("end");
  });

  /** Barra sem largura não tem duas metades; `start` é a ponta do caso comum. */
  it("largura zero devolve start", () => {
    expect(sideFromPointer(100, 100, 0)).toBe("start");
    expect(sideFromPointer(999, 100, -5)).toBe("start");
  });
});
