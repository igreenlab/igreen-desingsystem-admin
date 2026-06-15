import { describe, expect, it } from "vitest";
import { toDateMs, toDate, toIsoDate } from "./_shared";

/**
 * Regressão do off-by-one de fuso nos componentes de data.
 *
 * Bug: clicar 1/jun no picker mostrava 31/mai no input. Causa: `toIsoDate`
 * serializa com getters LOCAIS ("2026-06-01"), mas `toDateMs` parseava
 * `new Date("2026-06-01")` como UTC → em BR (UTC-3) voltava pro dia anterior.
 */
describe("_shared — datas date-only sem off-by-one", () => {
  it("toDateMs parseia 'YYYY-MM-DD' como meia-noite LOCAL (não UTC)", () => {
    // Contrato: casa com a meia-noite local construída por componentes.
    expect(toDateMs("2026-06-01")).toBe(new Date(2026, 5, 1).getTime());
  });

  it("toDate('2026-06-01') tem os componentes LOCAIS corretos (1/jun, não 31/mai)", () => {
    const d = toDate("2026-06-01")!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5); // junho (0-indexed)
    expect(d.getDate()).toBe(1);
  });

  it("round-trip estável: toIsoDate(toDate(x)) === x", () => {
    for (const iso of ["2026-06-01", "2026-01-01", "2025-12-31", "2024-02-29"]) {
      expect(toIsoDate(toDate(iso))).toBe(iso);
    }
  });

  it("datetime com hora continua parseando normal (regex só pega date-only)", () => {
    // String com tempo não casa o atalho local — usa o parser nativo.
    expect(toDateMs("2026-06-01T12:00:00.000Z")).toBe(
      new Date("2026-06-01T12:00:00.000Z").getTime(),
    );
  });
});
