import { describe, expect, it } from "vitest";
import {
  buildWeekSegments,
  hiddenPerColumn,
  laneCount,
} from "./week-segments";

/**
 * A semana de teste: 6 a 12 de setembro de 2026 (domingo a sábado).
 * Índices de coluna:   6=0  7=1  8=2  9=3  10=4  11=5  12=6
 */
const SEMANA = [6, 7, 8, 9, 10, 11, 12].map((d) => new Date(2026, 8, d));
const d = (dia: number) => new Date(2026, 8, dia);
const barra = (id: string, ini: number, fim: number) => ({
  id,
  start: d(ini),
  end: d(fim),
});

describe("buildWeekSegments — recorte", () => {
  it("barra de um dia ocupa uma coluna", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 8, 8)]);
    expect(s).toMatchObject({
      barId: "a",
      colStart: 2,
      colSpan: 1,
      continuesBefore: false,
      continuesAfter: false,
    });
  });

  it("barra de vários dias vira UM segmento com span", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 8, 11)]);
    expect(s).toMatchObject({ colStart: 2, colSpan: 4 });
  });

  it("barra que cobre a semana inteira tem span 7", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 6, 12)]);
    expect(s).toMatchObject({ colStart: 0, colSpan: 7 });
  });

  /**
   * ⚠️ A borda que o comentário de `continuesBefore` declara: uma barra que
   * começa EXATAMENTE no primeiro dia da semana tem `colStart` 0 e **não**
   * continua antes. Comparar contra `colStart` em vez da borda daria `true`
   * aqui e desenharia uma ponta cortada onde a barra realmente começa.
   */
  it("começar no primeiro dia NÃO é continuesBefore", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 6, 8)]);
    expect(s.colStart).toBe(0);
    expect(s.continuesBefore).toBe(false);
  });

  it("terminar no último dia NÃO é continuesAfter", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 10, 12)]);
    expect(s.continuesAfter).toBe(false);
  });

  it("barra que entra pela esquerda é recortada e marcada", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 3, 9)]);
    expect(s).toMatchObject({
      colStart: 0,
      colSpan: 4,
      continuesBefore: true,
      continuesAfter: false,
    });
  });

  it("barra que sai pela direita é recortada e marcada", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 10, 20)]);
    expect(s).toMatchObject({
      colStart: 4,
      colSpan: 3,
      continuesBefore: false,
      continuesAfter: true,
    });
  });

  it("barra que atravessa a semana inteira é marcada nas DUAS pontas", () => {
    const [s] = buildWeekSegments(SEMANA, [barra("a", 1, 30)]);
    expect(s).toMatchObject({
      colStart: 0,
      colSpan: 7,
      continuesBefore: true,
      continuesAfter: true,
    });
  });

  it("barra fora da semana não gera segmento", () => {
    expect(buildWeekSegments(SEMANA, [barra("a", 1, 5)])).toHaveLength(0);
    expect(buildWeekSegments(SEMANA, [barra("a", 13, 20)])).toHaveLength(0);
  });

  it("encostar na borda pelo lado de fora ainda conta", () => {
    // termina no dia 6 = primeiro dia da semana
    expect(buildWeekSegments(SEMANA, [barra("a", 1, 6)])).toHaveLength(1);
    // começa no dia 12 = último dia da semana
    expect(buildWeekSegments(SEMANA, [barra("a", 12, 20)])).toHaveLength(1);
  });

  it("intervalo invertido é descartado, não desenhado com span negativo", () => {
    expect(buildWeekSegments(SEMANA, [barra("a", 10, 8)])).toHaveLength(0);
  });

  it("semana vazia devolve lista vazia", () => {
    expect(buildWeekSegments([], [barra("a", 8, 9)])).toEqual([]);
  });
});

describe("buildWeekSegments — lanes", () => {
  it("barras que não se sobrepõem dividem a lane 0", () => {
    const segs = buildWeekSegments(SEMANA, [
      barra("a", 6, 7),
      barra("b", 9, 10),
    ]);
    expect(segs.map((s) => s.lane)).toEqual([0, 0]);
    expect(laneCount(segs)).toBe(1);
  });

  it("barras sobrepostas vão pra lanes diferentes", () => {
    const segs = buildWeekSegments(SEMANA, [
      barra("a", 6, 9),
      barra("b", 8, 11),
    ]);
    expect(segs.find((s) => s.barId === "a")!.lane).toBe(0);
    expect(segs.find((s) => s.barId === "b")!.lane).toBe(1);
  });

  /**
   * Consecutivas dividem lane: uma barra que acaba no dia 8 e outra que começa
   * no 9 não se sobrepõem. Se `ocupacao[lane] < colStart` fosse `<=`, toda
   * cadeia sequencial iria pra lanes separadas — o oposto de compactar.
   */
  it("consecutivas (acaba no 8, começa no 9) dividem a mesma lane", () => {
    const segs = buildWeekSegments(SEMANA, [
      barra("a", 6, 8),
      barra("b", 9, 12),
    ]);
    expect(segs.map((s) => s.lane)).toEqual([0, 0]);
  });

  it("encostadas no MESMO dia não dividem lane", () => {
    const segs = buildWeekSegments(SEMANA, [
      barra("a", 6, 8),
      barra("b", 8, 12),
    ]);
    expect(new Set(segs.map((s) => s.lane)).size).toBe(2);
  });

  /**
   * ⚠️ Este teste me corrigiu. Eu esperava `c` na lane 0 supondo que `a` (a
   * curta) ficaria em cima — mas o desempate por span põe a LONGA na lane 0,
   * então quem libera espaço é `a`, na lane 1.
   *
   * A asserção passou a ser sobre a PROPRIEDADE (uma lane liberada é reusada,
   * e o total não cresce) e não sobre o índice, que é consequência da ordem de
   * empacotamento e não contrato.
   */
  it("reusa a lane liberada por uma barra que já acabou", () => {
    const segs = buildWeekSegments(SEMANA, [
      barra("a", 6, 7), //  cols 0–1, curta
      barra("b", 6, 10), // cols 0–4, longa → lane 0
      barra("c", 9, 12), // cols 3–6, entra na lane que `a` liberou
    ]);
    const lane = (id: string) => segs.find((s) => s.barId === id)!.lane;
    // 3 barras, 2 lanes: houve reuso.
    expect(laneCount(segs)).toBe(2);
    expect(lane("b")).toBe(0);
    expect(lane("c")).toBe(lane("a"));
    expect(lane("c")).not.toBe(lane("b"));
  });

  /**
   * ⚠️ A afirmação do comentário: sem o desempate por span, a mesma semana
   * renderizaria diferente só porque o consumidor reordenou `rows`. Aqui as
   * duas ordens de entrada têm que produzir as MESMAS lanes.
   */
  it("a ordem de entrada não muda o resultado", () => {
    const curta = barra("curta", 6, 7);
    const longa = barra("longa", 6, 12);
    const a = buildWeekSegments(SEMANA, [curta, longa]);
    const b = buildWeekSegments(SEMANA, [longa, curta]);
    const lane = (segs: typeof a, id: string) =>
      segs.find((s) => s.barId === id)!.lane;
    expect(lane(a, "longa")).toBe(lane(b, "longa"));
    expect(lane(a, "curta")).toBe(lane(b, "curta"));
    // e a LONGA fica em cima — o "guarda-chuva" do calendário
    expect(lane(a, "longa")).toBe(0);
  });

  it("laneCount de lista vazia é 0", () => {
    expect(laneCount([])).toBe(0);
  });
});

describe("hiddenPerColumn", () => {
  const segs = buildWeekSegments(SEMANA, [
    barra("a", 6, 12), // lane 0
    barra("b", 6, 12), // lane 1
    barra("c", 8, 10), // lane 2 — cols 2–4
    barra("d", 11, 12), // lane 2 também (c acabou na col 4)
  ]);

  it("nada escondido quando todas as lanes cabem", () => {
    expect(hiddenPerColumn(segs, laneCount(segs))).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  /**
   * ⚠️ A afirmação central: a contagem é por COLUNA. `c` ocupa 3 dias, então
   * escondê-la tem que somar 1 em CADA um dos três — somar por semana daria o
   * total certo e a célula errada.
   */
  it("uma barra escondida de 3 dias soma 1 em cada uma das 3 colunas", () => {
    expect(hiddenPerColumn(segs, 2)).toEqual([0, 0, 1, 1, 1, 1, 1]);
  });

  it("esconder tudo conta todas as lanes por coluna", () => {
    expect(hiddenPerColumn(segs, 0)).toEqual([2, 2, 3, 3, 3, 3, 3]);
  });

  it("maxLanes negativo não estoura", () => {
    expect(hiddenPerColumn(segs, -1)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("segmento que passa da última coluna não escreve fora do array", () => {
    const fora = [{ barId: "x", colStart: 6, colSpan: 5, lane: 9, continuesBefore: false, continuesAfter: true }];
    const r = hiddenPerColumn(fora, 0);
    expect(r).toHaveLength(7);
    expect(r[6]).toBe(1);
  });
});
