import { describe, expect, it } from "vitest";
import {
  buildMonthMatrix,
  computeOverflow,
  minutesToOffset,
  packLanes,
  pixelsToMinutes,
  resolveMonthDrop,
  resolveResize,
  resolveTimeGridMove,
  segmentMultiDay,
  snapToGrid,
} from "./layout";
import type { SchedulerEvent } from "../scheduler.types";

/**
 * Testes do núcleo puro do `Scheduler`.
 *
 * O foco é **borda**, não caminho felizardo: bug de calendário mora na virada
 * de semana, na virada de mês, no último dia da grade e na duração zero
 * (L-045 — "só aparece no último item" é quase sempre off-by-one mascarado por
 * um valor que coincide nos demais).
 *
 * As entradas são datas reais e as asserções são **valores concretos**
 * escritos à mão — nunca o resultado de reexecutar a mesma lógica dentro do
 * teste, que concordaria por construção (L-064).
 */

/** Setembro de 2026 começa numa TERÇA — é o mês dos prints de referência. */
const SEP_2026 = new Date(2026, 8, 1);

function ev(
  id: string,
  start: Date,
  end: Date,
  extra: Partial<SchedulerEvent> = {},
): SchedulerEvent {
  return { id, title: id, start, end, ...extra };
}

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m, d, h, min, 0, 0);

/* ────────────────────────────────────────────────────────────────────────
 * buildMonthMatrix
 * ──────────────────────────────────────────────────────────────────────── */

describe("buildMonthMatrix", () => {
  it("devolve sempre 6 linhas de 7 dias, mesmo quando o mês cabe em 5", () => {
    // Fevereiro de 2026: 28 dias começando num domingo — cabe exato em 4
    // linhas. A grade ainda assim tem 6, senão a altura pularia entre meses.
    const feb = buildMonthMatrix(new Date(2026, 1, 15), 0);
    expect(feb).toHaveLength(6);
    expect(feb.every((row) => row.length === 7)).toBe(true);
  });

  it("alinha a primeira célula ao weekStartsOn (domingo)", () => {
    const weeks = buildMonthMatrix(SEP_2026, 0);
    // 1/set/2026 é terça → a linha começa no domingo 30/ago.
    expect(weeks[0][0].getDate()).toBe(30);
    expect(weeks[0][0].getMonth()).toBe(7); // agosto
    expect(weeks[0][2].getDate()).toBe(1); // terça = coluna 2
  });

  it("alinha a primeira célula ao weekStartsOn (segunda)", () => {
    const weeks = buildMonthMatrix(SEP_2026, 1);
    expect(weeks[0][0].getDate()).toBe(31); // segunda 31/ago
    expect(weeks[0][1].getDate()).toBe(1); // terça = coluna 1
  });

  it("o último dia da grade é o 42º a partir do início — a borda da L-045", () => {
    const weeks = buildMonthMatrix(SEP_2026, 0);
    const last = weeks[5][6];
    // 30/ago + 41 dias = 10/out/2026.
    expect(last.getDate()).toBe(10);
    expect(last.getMonth()).toBe(9); // outubro
  });

  it("normaliza cada dia em meia-noite local, pra comparação por getTime", () => {
    const weeks = buildMonthMatrix(new Date(2026, 8, 15, 23, 47), 0);
    const flat = weeks.flat();
    expect(
      flat.every(
        (d) =>
          d.getHours() === 0 &&
          d.getMinutes() === 0 &&
          d.getSeconds() === 0 &&
          d.getMilliseconds() === 0,
      ),
    ).toBe(true);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * segmentMultiDay
 * ──────────────────────────────────────────────────────────────────────── */

describe("segmentMultiDay", () => {
  const weeks = buildMonthMatrix(SEP_2026, 0);

  it("evento de 1 dia vira 1 segmento de 1 coluna, com as duas pontas", () => {
    const segs = segmentMultiDay(
      [ev("a", at(2026, 8, 2, 9), at(2026, 8, 2, 10))],
      weeks,
    );
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({
      weekIndex: 0,
      colStart: 3, // 30 31 1 2 → quarta-feira 2/set é a coluna 3
      colSpan: 1,
      isStart: true,
      isEnd: true,
    });
  });

  it("duração zero (start === end) também vira 1 segmento de 1 coluna", () => {
    const marco = at(2026, 8, 9, 14, 30);
    const segs = segmentMultiDay([ev("z", marco, marco)], weeks);
    expect(segs).toHaveLength(1);
    expect(segs[0].colSpan).toBe(1);
    expect(segs[0].isStart).toBe(true);
    expect(segs[0].isEnd).toBe(true);
  });

  it("evento que atravessa a virada de SEMANA vira 2 segmentos com pontas abertas", () => {
    // 4/set (sexta) → 8/set (terça): cruza o sábado 5 → domingo 6.
    const segs = segmentMultiDay(
      [ev("b", at(2026, 8, 4), at(2026, 8, 8))],
      weeks,
    );
    expect(segs).toHaveLength(2);

    // Linha 0: sex 4 e sáb 5 → começa na coluna 5, 2 colunas, tem início, NÃO tem fim.
    expect(segs[0]).toMatchObject({
      weekIndex: 0,
      colStart: 5,
      colSpan: 2,
      isStart: true,
      isEnd: false,
    });
    // Linha 1: dom 6 a ter 8 → coluna 0, 3 colunas, sem início, com fim.
    expect(segs[1]).toMatchObject({
      weekIndex: 1,
      colStart: 0,
      colSpan: 3,
      isStart: false,
      isEnd: true,
    });
  });

  it("virada de MÊS sozinha NÃO parte o evento — a linha da grade é que parte", () => {
    // 28/set → 3/out cruza a virada do mês, mas a linha 4 da grade de
    // setembro/2026 é 27/set–3/out: o evento cabe INTEIRO nela.
    //
    // Este caso está aqui porque é a armadilha: "atravessa o mês" e "atravessa
    // a linha" são coisas diferentes, e só a segunda produz segmento novo. A
    // primeira versão deste teste esperava 2 segmentos e reprovou — a fixture
    // estava errada, não o código (L-064).
    const segs = segmentMultiDay(
      [ev("c", at(2026, 8, 28), at(2026, 9, 3))],
      weeks,
    );
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({
      weekIndex: 4,
      colStart: 1, // 27/set é domingo → 28/set é a coluna 1
      colSpan: 6, // da coluna 1 ao sábado 3/out
      isStart: true,
      isEnd: true,
    });
  });

  it("virada de mês E de linha juntas produzem 2 segmentos", () => {
    // 30/set → 5/out: a linha 4 acaba em 3/out e a linha 5 começa em 4/out.
    const segs = segmentMultiDay(
      [ev("c2", at(2026, 8, 30), at(2026, 9, 5))],
      weeks,
    );
    expect(segs).toHaveLength(2);
    expect(segs[0]).toMatchObject({
      weekIndex: 4,
      colStart: 3, // 27 28 29 30 → coluna 3
      colSpan: 4, // 30/set a 3/out
      isStart: true,
      isEnd: false,
    });
    expect(segs[1]).toMatchObject({
      weekIndex: 5,
      colStart: 0,
      colSpan: 2, // 4/out e 5/out
      isStart: false,
      isEnd: true,
    });
  });

  it("evento que começa ANTES da grade chega truncado na primeira linha", () => {
    // 27/ago → 1/set: a grade começa em 30/ago.
    const segs = segmentMultiDay(
      [ev("d", at(2026, 7, 27), at(2026, 8, 1))],
      weeks,
    );
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({
      weekIndex: 0,
      colStart: 0,
      colSpan: 3, // 30, 31, 1
      isStart: false, // começou fora da janela recebida
      isEnd: true,
    });
  });

  it("evento inteiramente fora da grade não produz segmento", () => {
    const segs = segmentMultiDay(
      [ev("e", at(2026, 10, 5), at(2026, 10, 6))],
      weeks,
    );
    expect(segs).toEqual([]);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * packLanes
 * ──────────────────────────────────────────────────────────────────────── */

describe("packLanes", () => {
  it("eventos que não se sobrepõem ficam todos na lane 0, em grupos separados", () => {
    const boxes = packLanes(
      [
        ev("manha", at(2026, 8, 1, 9), at(2026, 8, 1, 10)),
        ev("tarde", at(2026, 8, 1, 14), at(2026, 8, 1, 15)),
      ],
      15,
    );
    expect(boxes.map((b) => b.laneIndex)).toEqual([0, 0]);
    expect(boxes.map((b) => b.laneCount)).toEqual([1, 1]);
  });

  it("3 sobrepostos ocupam 3 lanes e todos reportam laneCount 3", () => {
    const boxes = packLanes(
      [
        ev("a", at(2026, 8, 1, 9), at(2026, 8, 1, 11)),
        ev("b", at(2026, 8, 1, 9, 30), at(2026, 8, 1, 10, 30)),
        ev("c", at(2026, 8, 1, 10), at(2026, 8, 1, 12)),
      ],
      15,
    );
    expect(boxes).toHaveLength(3);
    expect(new Set(boxes.map((b) => b.laneIndex))).toEqual(new Set([0, 1, 2]));
    expect(boxes.every((b) => b.laneCount === 3)).toBe(true);
  });

  it("grupo da manhã NÃO herda o laneCount do grupo da tarde", () => {
    // Manhã: 2 sobrepostos. Tarde (disjunta): 3 sobrepostos. Se o laneCount
    // fosse do dia, a manhã ficaria com 1/3 de largura sem motivo.
    const boxes = packLanes(
      [
        ev("m1", at(2026, 8, 1, 8), at(2026, 8, 1, 9)),
        ev("m2", at(2026, 8, 1, 8, 30), at(2026, 8, 1, 9, 30)),
        ev("t1", at(2026, 8, 1, 14), at(2026, 8, 1, 16)),
        ev("t2", at(2026, 8, 1, 14, 30), at(2026, 8, 1, 15, 30)),
        ev("t3", at(2026, 8, 1, 15), at(2026, 8, 1, 17)),
      ],
      15,
    );
    const laneCountOf = (id: string) =>
      boxes.find((b) => b.event.id === id)!.laneCount;
    expect(laneCountOf("m1")).toBe(2);
    expect(laneCountOf("m2")).toBe(2);
    expect(laneCountOf("t1")).toBe(3);
  });

  it("evento que termina exatamente quando o outro começa NÃO colide", () => {
    const boxes = packLanes(
      [
        ev("a", at(2026, 8, 1, 9), at(2026, 8, 1, 10)),
        ev("b", at(2026, 8, 1, 10), at(2026, 8, 1, 11)),
      ],
      15,
    );
    expect(boxes.every((b) => b.laneCount === 1)).toBe(true);
  });

  it("dois eventos de duração ZERO no mesmo instante colidem e ganham lanes distintas", () => {
    // Sem tratar duração 0 como `snapMinutes`, os dois cairiam na mesma lane e
    // ficariam um por cima do outro na tela.
    const t = at(2026, 8, 1, 12);
    const boxes = packLanes([ev("z1", t, t), ev("z2", t, t)], 15);
    expect(boxes.every((b) => b.laneCount === 2)).toBe(true);
    expect(new Set(boxes.map((b) => b.laneIndex))).toEqual(new Set([0, 1]));
  });

  it("lista vazia devolve lista vazia", () => {
    expect(packLanes([], 15)).toEqual([]);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * computeOverflow
 * ──────────────────────────────────────────────────────────────────────── */

describe("computeOverflow", () => {
  // Pill 20px + gap 2px → cada slot custa 22px, e o último não paga gap.
  const evs = (n: number) =>
    Array.from({ length: n }, (_, i) =>
      ev(`e${i}`, at(2026, 8, 1, 9 + i), at(2026, 8, 1, 10 + i)),
    );

  it("tudo cabendo: nenhum overflow", () => {
    // 3 slots = 20*3 + 2*2 = 64px.
    const r = computeOverflow(evs(3), 64);
    expect(r.visible).toHaveLength(3);
    expect(r.overflowCount).toBe(0);
  });

  it("reserva 1 slot pro próprio '+N mais' quando não cabe tudo", () => {
    // Caberiam 3, mas há 5 eventos → mostra 2 e diz "+3", nunca 3 e "+2"
    // (que estouraria a altura pela própria linha de overflow).
    const r = computeOverflow(evs(5), 64);
    expect(r.visible).toHaveLength(2);
    expect(r.overflowCount).toBe(3);
    expect(r.visible.length + r.overflowCount).toBe(5);
  });

  it("altura zero: nada visível, todos em overflow", () => {
    const r = computeOverflow(evs(4), 0);
    expect(r.visible).toHaveLength(0);
    expect(r.overflowCount).toBe(4);
  });

  it("dia sem evento não inventa overflow", () => {
    const r = computeOverflow([], 200);
    expect(r.visible).toEqual([]);
    expect(r.overflowCount).toBe(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * snapToGrid
 * ──────────────────────────────────────────────────────────────────────── */

describe("snapToGrid", () => {
  it("arredonda pro múltiplo de snapMinutes mais próximo", () => {
    const r = snapToGrid(at(2026, 8, 1, 9, 7), 15, [0, 24]);
    expect(r.getHours()).toBe(9);
    expect(r.getMinutes()).toBe(0); // 7 < 7.5 → desce
  });

  it("meio exato arredonda pra cima", () => {
    // `new Date` direto, NÃO o helper `at()`: ele zera os segundos, e sem os
    // 30s o instante seria 9:07:00 — que arredonda pra BAIXO. A primeira versão
    // deste teste passava 30 num 6º argumento que o helper ignora, e reprovou
    // por fixture errada, não por defeito (L-064).
    const r = snapToGrid(new Date(2026, 8, 1, 9, 7, 30), 15, [0, 24]);
    // 7.5min de 15 → sobe pra 15.
    expect(r.getMinutes()).toBe(15);
  });

  it("clampa no início do dayRange", () => {
    const r = snapToGrid(at(2026, 8, 1, 5, 0), 30, [8, 18]);
    expect(r.getHours()).toBe(8);
    expect(r.getMinutes()).toBe(0);
  });

  it("clampa no fim do dayRange", () => {
    const r = snapToGrid(at(2026, 8, 1, 22, 0), 30, [8, 18]);
    expect(r.getHours()).toBe(18);
  });

  it("não escorrega pro dia seguinte perto da meia-noite", () => {
    const r = snapToGrid(at(2026, 8, 1, 23, 58), 15, [0, 24]);
    // 23:58 arredondaria pra 24:00 = 2/set 00:00; o clamp mantém em 1/set.
    expect(r.getDate()).toBe(1);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * resolveResize
 * ──────────────────────────────────────────────────────────────────────── */

describe("resolveResize", () => {
  const base = ev("r", at(2026, 8, 1, 10, 0), at(2026, 8, 1, 11, 0));

  it("alça de fim estende a duração e não move o início", () => {
    const r = resolveResize(base, "end", 30, 15);
    expect(r.start.getTime()).toBe(base.start.getTime());
    expect(r.end.getHours()).toBe(11);
    expect(r.end.getMinutes()).toBe(30);
  });

  it("alça de início encurta pela frente e não move o fim", () => {
    const r = resolveResize(base, "start", 30, 15);
    expect(r.start.getHours()).toBe(10);
    expect(r.start.getMinutes()).toBe(30);
    expect(r.end.getTime()).toBe(base.end.getTime());
  });

  it("aplica snap sobre o delta bruto", () => {
    const r = resolveResize(base, "end", 22, 15);
    // 22min / 15 → arredonda pra 15.
    expect(r.end.getMinutes()).toBe(15);
  });

  it("nunca deixa o início passar do fim — clampa em end - snapMinutes", () => {
    const r = resolveResize(base, "start", 600, 15);
    expect(r.start.getTime()).toBeLessThan(r.end.getTime());
    expect(r.start.getHours()).toBe(10);
    expect(r.start.getMinutes()).toBe(45);
  });

  it("nunca deixa o fim passar do início — clampa em start + snapMinutes", () => {
    const r = resolveResize(base, "end", -600, 15);
    expect(r.end.getTime()).toBeGreaterThan(r.start.getTime());
    expect(r.end.getHours()).toBe(10);
    expect(r.end.getMinutes()).toBe(15);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * pixelsToMinutes
 * ──────────────────────────────────────────────────────────────────────── */

describe("pixelsToMinutes", () => {
  it("é o inverso exato de minutesToOffset", () => {
    // 48px/hora: 24px = 30min.
    expect(pixelsToMinutes(24, 48)).toBe(30);
    expect(pixelsToMinutes(48, 48)).toBe(60);
    expect(pixelsToMinutes(-48, 48)).toBe(-60);
  });

  it("NÃO arredonda — o snap é de quem chama", () => {
    // 7px a 48px/hora = 8.75min. Arredondar aqui enviesaria o snap pra baixo.
    expect(pixelsToMinutes(7, 48)).toBeCloseTo(8.75, 5);
  });

  it("altura zero não divide por zero", () => {
    expect(pixelsToMinutes(100, 0)).toBe(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * resolveMonthDrop
 * ──────────────────────────────────────────────────────────────────────── */

describe("resolveMonthDrop", () => {
  it("preserva a HORA e a duração ao mudar de dia", () => {
    const e = ev("m", at(2026, 8, 2, 14, 0), at(2026, 8, 2, 15, 30));
    const r = resolveMonthDrop(e, at(2026, 8, 5));

    expect(r.start.getDate()).toBe(5);
    expect(r.start.getHours()).toBe(14);
    expect(r.start.getMinutes()).toBe(0);
    expect(r.end.getDate()).toBe(5);
    expect(r.end.getHours()).toBe(15);
    expect(r.end.getMinutes()).toBe(30);
  });

  it("soltar no MESMO dia não muda nada (identidade preservada)", () => {
    const e = ev("m", at(2026, 8, 2, 14, 0), at(2026, 8, 2, 15, 30));
    const r = resolveMonthDrop(e, at(2026, 8, 2, 23, 59));
    expect(r.start).toBe(e.start);
    expect(r.end).toBe(e.end);
  });

  it("mover pra trás desloca negativo", () => {
    const e = ev("m", at(2026, 8, 10, 9, 0), at(2026, 8, 10, 10, 0));
    const r = resolveMonthDrop(e, at(2026, 8, 3));
    expect(r.start.getDate()).toBe(3);
    expect(r.start.getHours()).toBe(9);
  });

  it("evento multi-dia mantém a duração em dias", () => {
    // 3 dias (9→11) largado no dia 20 → 20→22.
    const e = ev("multi", at(2026, 8, 9), at(2026, 8, 11), { allDay: true });
    const r = resolveMonthDrop(e, at(2026, 8, 20));
    expect(r.start.getDate()).toBe(20);
    expect(r.end.getDate()).toBe(22);
  });

  it("atravessa a virada de mês", () => {
    const e = ev("m", at(2026, 8, 28, 8, 0), at(2026, 8, 28, 9, 0));
    const r = resolveMonthDrop(e, at(2026, 9, 2));
    expect(r.start.getMonth()).toBe(9); // outubro
    expect(r.start.getDate()).toBe(2);
    expect(r.start.getHours()).toBe(8);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * resolveTimeGridMove
 * ──────────────────────────────────────────────────────────────────────── */

describe("resolveTimeGridMove", () => {
  const base = ev("t", at(2026, 8, 2, 10, 0), at(2026, 8, 2, 10, 50));

  it("move só na vertical, com snap no start e duração preservada", () => {
    // +30min exatos.
    const r = resolveTimeGridMove(base, 0, 30, 15, [0, 24]);
    expect(r.start.getHours()).toBe(10);
    expect(r.start.getMinutes()).toBe(30);
    // duração de 50min PRESERVADA — não snapada pra 45 nem 60.
    expect(r.end.getTime() - r.start.getTime()).toBe(50 * 60_000);
  });

  it("a duração sobrevive a delta não-múltiplo do snap", () => {
    // 37min de delta → start snapa, mas os 50min de duração continuam 50.
    const r = resolveTimeGridMove(base, 0, 37, 15, [0, 24]);
    expect(r.end.getTime() - r.start.getTime()).toBe(50 * 60_000);
  });

  it("move só na horizontal preserva o horário", () => {
    const r = resolveTimeGridMove(base, 2, 0, 15, [0, 24]);
    expect(r.start.getDate()).toBe(4);
    expect(r.start.getHours()).toBe(10);
    expect(r.start.getMinutes()).toBe(0);
  });

  it("combina os dois eixos", () => {
    const r = resolveTimeGridMove(base, -1, -60, 15, [0, 24]);
    expect(r.start.getDate()).toBe(1);
    expect(r.start.getHours()).toBe(9);
  });

  it("clampa no dayRange em vez de vazar pro dia seguinte", () => {
    // dayRange [8, 18]: arrastar +10h de 10:00 daria 20:00, fora da grade.
    const r = resolveTimeGridMove(base, 0, 600, 15, [8, 18]);
    expect(r.start.getHours()).toBe(18);
    expect(r.start.getDate()).toBe(2); // mesmo dia — não escorregou
  });

  it("clampa no início do dayRange", () => {
    const r = resolveTimeGridMove(base, 0, -600, 15, [8, 18]);
    expect(r.start.getHours()).toBe(8);
  });

  it("snap de 60 arredonda pra hora cheia", () => {
    const r = resolveTimeGridMove(base, 0, 25, 60, [0, 24]);
    // 10:00 + 25min = 10:25 → snap 60 → 10:00.
    expect(r.start.getHours()).toBe(10);
    expect(r.start.getMinutes()).toBe(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * minutesToOffset
 * ──────────────────────────────────────────────────────────────────────── */

describe("minutesToOffset", () => {
  it("o início da grade fica no offset 0", () => {
    expect(minutesToOffset(at(2026, 8, 1, 8, 0), [8, 18], 48)).toBe(0);
  });

  it("uma hora depois vale exatamente hourHeight", () => {
    expect(minutesToOffset(at(2026, 8, 1, 9, 0), [8, 18], 48)).toBe(48);
  });

  it("meia hora vale metade — precisão sub-minuto, sem truncar", () => {
    expect(minutesToOffset(at(2026, 8, 1, 8, 30), [8, 18], 48)).toBe(24);
    expect(minutesToOffset(at(2026, 8, 1, 8, 10), [8, 18], 48)).toBeCloseTo(8, 5);
  });

  it("hora antes do início da grade dá offset negativo (o chamador clampa)", () => {
    expect(minutesToOffset(at(2026, 8, 1, 7, 0), [8, 18], 48)).toBe(-48);
  });
});
