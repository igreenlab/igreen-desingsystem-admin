import { describe, expect, it } from "vitest";
import {
  buildMonthMatrix,
  buildTimeAxis,
  clipToWindow,
  computeOverflow,
  dateToDayOffset,
  dateToX,
  daysOfBar,
  deriveSummaryRange,
  deriveWindow,
  flattenRows,
  monthBounds,
  packLanes,
  snapDate,
  xToDate,
  type GanttClippedBar,
  type GanttFlatRow,
} from "./layout";
import type { GanttBar, GanttRow } from "../gantt.types";

/**
 * Testes do núcleo geométrico.
 *
 * Cada bloco mira uma AFIRMAÇÃO feita num comentário do `layout.ts`. Comentário
 * que afirma garantia sem teste é a L-060 esperando acontecer: quem lê para de
 * investigar.
 */

const d = (a: number, m: number, dia: number, h = 0, min = 0) =>
  new Date(a, m - 1, dia, h, min);

const barra = (over: Partial<GanttBar> = {}): GanttBar => ({
  id: "b",
  start: d(2026, 9, 10),
  end: d(2026, 9, 15),
  ...over,
});

const linha = (over: Partial<GanttRow> = {}): GanttRow => ({
  id: "r",
  label: "Linha",
  bars: [barra()],
  ...over,
});

/* ══════════════════════════════════════════════════ data ↔ pixel ══ */

describe("dateToDayOffset — por calendário, não por timestamp", () => {
  it("dia seguinte é exatamente 1, sem fração", () => {
    expect(dateToDayOffset(d(2026, 9, 11), d(2026, 9, 10))).toBe(1);
  });

  it("a hora do dia entra como fração", () => {
    // 12:00 = meio dia
    expect(dateToDayOffset(d(2026, 9, 10, 12), d(2026, 9, 10))).toBeCloseTo(0.5, 5);
  });

  it("data anterior à janela devolve negativo", () => {
    expect(dateToDayOffset(d(2026, 9, 8), d(2026, 9, 10))).toBe(-2);
  });

  it("atravessar mudança de mês não perde nem ganha dia", () => {
    // 30/set → 2/out = 2 dias. Subtração de timestamp acertaria aqui, mas o
    // ponto é que o cálculo é por calendário e não depende de fuso.
    expect(dateToDayOffset(d(2026, 10, 2), d(2026, 9, 30))).toBe(2);
  });
});

describe("xToDate — inverso de dateToX", () => {
  it("ida e volta preserva o dia", () => {
    const janela = d(2026, 9, 1);
    const alvo = d(2026, 9, 17);
    const x = dateToX(alvo, janela, 24);
    const volta = xToDate(x, janela, 24);
    expect(volta.getDate()).toBe(17);
    expect(volta.getMonth()).toBe(8);
  });

  it("pxPerDay zero não estoura — devolve o início da janela", () => {
    const janela = d(2026, 9, 1);
    expect(xToDate(500, janela, 0).getTime()).toBe(janela.getTime());
  });

  it("x negativo devolve data antes da janela", () => {
    const janela = d(2026, 9, 10);
    expect(xToDate(-48, janela, 24).getDate()).toBe(8);
  });
});

describe("snapDate", () => {
  it("day zera a hora", () => {
    const r = snapDate(d(2026, 9, 10, 17, 43), "day");
    expect(r.getHours()).toBe(0);
    expect(r.getDate()).toBe(10);
  });

  it("week cai no domingo com weekStartsOn 0", () => {
    // 10/09/2026 é quinta. Domingo anterior = 06/09.
    expect(snapDate(d(2026, 9, 10), "week", 0).getDate()).toBe(6);
  });

  it("week cai na segunda com weekStartsOn 1", () => {
    expect(snapDate(d(2026, 9, 10), "week", 1).getDate()).toBe(7);
  });

  it("month cai no dia 1", () => {
    expect(snapDate(d(2026, 9, 23), "month").getDate()).toBe(1);
  });
});

/* ═══════════════════════════════════════════ recorte na janela ══ */

describe("clipToWindow", () => {
  it("barra inteiramente fora devolve null", () => {
    const r = clipToWindow(barra({ start: d(2026, 8, 1), end: d(2026, 8, 5) }), d(2026, 9, 1), d(2026, 9, 30));
    expect(r).toBeNull();
  });

  it("barra que TERMINA no início da janela ainda aparece", () => {
    // A afirmação do comentário: a comparação é por DIA. Uma barra que termina
    // às 08:00 do windowStart toca a janela.
    const r = clipToWindow(
      barra({ start: d(2026, 8, 28), end: d(2026, 9, 1, 8) }),
      d(2026, 9, 1),
      d(2026, 9, 30),
    );
    expect(r).not.toBeNull();
    expect(r!.continuesBefore).toBe(true);
  });

  it("barra que COMEÇA no último dia da janela ainda aparece", () => {
    const r = clipToWindow(
      barra({ start: d(2026, 9, 30, 22), end: d(2026, 10, 5) }),
      d(2026, 9, 1),
      d(2026, 9, 30),
    );
    expect(r).not.toBeNull();
    expect(r!.continuesAfter).toBe(true);
  });

  it("barra inteiramente dentro não marca continuação", () => {
    const r = clipToWindow(barra(), d(2026, 9, 1), d(2026, 9, 30))!;
    expect(r.continuesBefore).toBe(false);
    expect(r.continuesAfter).toBe(false);
    expect(r.start.getDate()).toBe(10);
  });

  it("flag do consumidor VENCE o derivado", () => {
    // Quem pagina no servidor sabe que continua fora; o componente não.
    const r = clipToWindow(
      barra({ continuesAfter: true }),
      d(2026, 9, 1),
      d(2026, 9, 30),
    )!;
    expect(r.continuesAfter).toBe(true);
  });

  it("flag false do consumidor também vence — não é só truthy", () => {
    const r = clipToWindow(
      barra({ start: d(2026, 8, 20), end: d(2026, 9, 5), continuesBefore: false }),
      d(2026, 9, 1),
      d(2026, 9, 30),
    )!;
    expect(r.continuesBefore).toBe(false);
  });
});

/* ══════════════════════════════════════════════ lane packing ══ */

const clip = (id: string, ini: Date, fim: Date): GanttClippedBar => ({
  bar: { id, start: ini, end: fim },
  start: ini,
  end: fim,
  continuesBefore: false,
  continuesAfter: false,
});

describe("packLanes", () => {
  it("stack devolve uma lane por barra, na ordem recebida", () => {
    const lanes = packLanes(
      [clip("a", d(2026, 9, 1), d(2026, 9, 5)), clip("b", d(2026, 9, 2), d(2026, 9, 6))],
      "stack",
    );
    expect(lanes).toHaveLength(2);
    expect(lanes[0][0].bar.id).toBe("a");
  });

  it("compact junta barras que NÃO se sobrepõem", () => {
    const lanes = packLanes(
      [clip("a", d(2026, 9, 1), d(2026, 9, 5)), clip("b", d(2026, 9, 8), d(2026, 9, 10))],
      "compact",
    );
    expect(lanes).toHaveLength(1);
    expect(lanes[0].map((b) => b.bar.id)).toEqual(["a", "b"]);
  });

  it("compact separa barras que se sobrepõem", () => {
    const lanes = packLanes(
      [clip("a", d(2026, 9, 1), d(2026, 9, 10)), clip("b", d(2026, 9, 5), d(2026, 9, 15))],
      "compact",
    );
    expect(lanes).toHaveLength(2);
  });

  it("CONSECUTIVAS dividem lane — a fronteira é `<`, não `<=`", () => {
    // A afirmação do comentário: `a` termina no dia 5 e `b` começa no dia 5.
    // Com `<=` a cadeia sequencial inteira iria pra lanes separadas, que é o
    // oposto de "compact".
    const lanes = packLanes(
      [clip("a", d(2026, 9, 1), d(2026, 9, 5)), clip("b", d(2026, 9, 5), d(2026, 9, 9))],
      "compact",
    );
    expect(lanes).toHaveLength(1);
  });

  it("compact ordena por início antes de empacotar", () => {
    const lanes = packLanes(
      [clip("tarde", d(2026, 9, 20), d(2026, 9, 25)), clip("cedo", d(2026, 9, 1), d(2026, 9, 5))],
      "compact",
    );
    expect(lanes[0].map((b) => b.bar.id)).toEqual(["cedo", "tarde"]);
  });

  it("lista vazia devolve zero lanes nos dois modos", () => {
    expect(packLanes([], "stack")).toEqual([]);
    expect(packLanes([], "compact")).toEqual([]);
  });
});

/* ═════════════════════════════════════════════════ hierarquia ══ */

describe("flattenRows", () => {
  const arvore: GanttRow[] = [
    linha({ id: "fase", label: "Fase", type: "summary", bars: [] }),
    linha({ id: "t1", label: "T1", parent: "fase" }),
    linha({ id: "sub", label: "Sub", parent: "fase", type: "summary", bars: [] }),
    linha({ id: "t2", label: "T2", parent: "sub" }),
    linha({ id: "solta", label: "Solta" }),
  ];

  it("achata na ordem de exibição com profundidade", () => {
    const r = flattenRows(arvore, new Set());
    expect(r.map((x) => x.row.id)).toEqual(["fase", "t1", "sub", "t2", "solta"]);
    expect(r.map((x) => x.depth)).toEqual([0, 1, 1, 2, 0]);
  });

  it("hasChildren só em quem tem filho", () => {
    const r = flattenRows(arvore, new Set());
    const porId = new Map(r.map((x) => [x.row.id, x]));
    expect(porId.get("fase")!.hasChildren).toBe(true);
    expect(porId.get("sub")!.hasChildren).toBe(true);
    expect(porId.get("t1")!.hasChildren).toBe(false);
  });

  it("colapsar o pai esconde filho E NETO", () => {
    // A afirmação: a recursão para no collapsed, senão o neto ficaria órfão
    // visível quando o pai colapsa e o avô não.
    const r = flattenRows(arvore, new Set(["fase"]));
    expect(r.map((x) => x.row.id)).toEqual(["fase", "solta"]);
  });

  it("colapsar o nível intermediário esconde só o neto", () => {
    const r = flattenRows(arvore, new Set(["sub"]));
    expect(r.map((x) => x.row.id)).toEqual(["fase", "t1", "sub", "solta"]);
  });

  it("`collapsed` na própria linha também vale", () => {
    const comFlag = arvore.map((r) => (r.id === "fase" ? { ...r, collapsed: true } : r));
    const r = flattenRows(comFlag, new Set());
    expect(r.map((x) => x.row.id)).toEqual(["fase", "solta"]);
  });

  it("parent apontando pra id INEXISTENTE é tratado como raiz, não descartado", () => {
    // Dado sujo do consumidor não deve virar tarefa invisível.
    const r = flattenRows([linha({ id: "orfa", parent: "nao-existe" })], new Set());
    expect(r).toHaveLength(1);
    expect(r[0].depth).toBe(0);
  });

  it("ciclo em parent não estoura a pilha", () => {
    const ciclo: GanttRow[] = [
      linha({ id: "a", parent: "b" }),
      linha({ id: "b", parent: "a" }),
    ];
    // Nenhum dos dois é raiz, então o resultado é vazio — mas o que importa é
    // não travar. Sem a guarda de `visitados`, isto seria recursão infinita.
    expect(() => flattenRows(ciclo, new Set())).not.toThrow();
  });

  it("lista vazia devolve vazio", () => {
    expect(flattenRows([], new Set())).toEqual([]);
  });
});

describe("deriveSummaryRange", () => {
  it("percorre TODA a descendência, não só os filhos diretos", () => {
    // A afirmação: um summary de fase cujos filhos são outros summary teria
    // intervalo vazio se olhasse um nível só.
    const rows: GanttRow[] = [
      linha({ id: "fase", type: "summary", bars: [] }),
      linha({ id: "sub", parent: "fase", type: "summary", bars: [] }),
      linha({ id: "neto", parent: "sub", bars: [barra({ start: d(2026, 9, 3), end: d(2026, 9, 20) })] }),
    ];
    const r = deriveSummaryRange("fase", rows)!;
    expect(r.start.getDate()).toBe(3);
    expect(r.end.getDate()).toBe(20);
  });

  it("pega o menor start e o maior end entre vários filhos", () => {
    const rows: GanttRow[] = [
      linha({ id: "p", type: "summary", bars: [] }),
      linha({ id: "a", parent: "p", bars: [barra({ start: d(2026, 9, 10), end: d(2026, 9, 12) })] }),
      linha({ id: "b", parent: "p", bars: [barra({ start: d(2026, 9, 5), end: d(2026, 9, 25) })] }),
    ];
    const r = deriveSummaryRange("p", rows)!;
    expect(r.start.getDate()).toBe(5);
    expect(r.end.getDate()).toBe(25);
  });

  it("sem descendente com barra devolve null, não intervalo em 1970", () => {
    const rows: GanttRow[] = [
      linha({ id: "p", type: "summary", bars: [] }),
      linha({ id: "f", parent: "p", bars: [] }),
    ];
    expect(deriveSummaryRange("p", rows)).toBeNull();
  });

  it("ciclo em parent não estoura", () => {
    const rows: GanttRow[] = [
      linha({ id: "a", parent: "b" }),
      linha({ id: "b", parent: "a" }),
    ];
    expect(() => deriveSummaryRange("a", rows)).not.toThrow();
  });
});

/* ════════════════════════════════════════════ janela derivada ══ */

describe("deriveWindow", () => {
  it("dá folga de 1 dia em cada ponta na granularidade de dia", () => {
    // Sem folga, a primeira barra encosta na borda e fica indistinguível de uma
    // que atravessa a janela.
    const r = deriveWindow([linha({ bars: [barra({ start: d(2026, 9, 10), end: d(2026, 9, 15) })] })], "day");
    expect(r.start.getDate()).toBe(9);
    expect(r.end.getDate()).toBe(16);
  });

  it("folga maior nas granularidades largas", () => {
    const r = deriveWindow([linha()], "month");
    expect(r.start.getMonth()).toBe(7); // agosto
  });

  it("sem nenhuma barra devolve 30 dias a partir de hoje", () => {
    const r = deriveWindow([], "day");
    expect(Math.round((r.end.getTime() - r.start.getTime()) / 86_400_000)).toBe(29);
  });

  it("ignora linhas sem barra ao calcular", () => {
    const r = deriveWindow(
      [linha({ id: "vazia", bars: [] }), linha({ id: "cheia", bars: [barra()] })],
      "day",
    );
    expect(r.start.getDate()).toBe(9);
  });
});

/* ═══════════════════════════════════════════════ eixo de tempo ══ */

describe("buildTimeAxis", () => {
  it("granularidade day: um tick por dia, totalDays inclusivo", () => {
    const a = buildTimeAxis(d(2026, 9, 1), d(2026, 9, 7), "day");
    expect(a.units).toHaveLength(7);
    expect(a.totalDays).toBe(7);
  });

  it("marca fim de semana só na granularidade day", () => {
    // 05 e 06 de setembro de 2026 são sábado e domingo.
    const a = buildTimeAxis(d(2026, 9, 1), d(2026, 9, 7), "day");
    const fds = a.units.filter((u) => u.isWeekend).map((u) => u.date.getDate());
    expect(fds).toEqual([5, 6]);
  });

  it("os spanDays das units somam o total", () => {
    for (const g of ["day", "week", "month", "quarter"] as const) {
      const a = buildTimeAxis(d(2026, 1, 15), d(2026, 12, 20), g);
      const soma = a.units.reduce((s, u) => s + u.spanDays, 0);
      expect(soma, `granularidade ${g}`).toBe(a.totalDays);
    }
  });

  it("os spanDays dos groups também somam o total", () => {
    for (const g of ["day", "week", "month", "quarter"] as const) {
      const a = buildTimeAxis(d(2026, 3, 10), d(2026, 8, 5), g);
      const soma = a.groups.reduce((s, x) => s + x.spanDays, 0);
      expect(soma, `granularidade ${g}`).toBe(a.totalDays);
    }
  });

  it("recorta a primeira e a última semana na janela", () => {
    // 10/09/2026 é quinta: a primeira semana entra parcial.
    const a = buildTimeAxis(d(2026, 9, 10), d(2026, 9, 20), "week", undefined, 0);
    expect(a.units[0].spanDays).toBeLessThan(7);
    expect(a.units.reduce((s, u) => s + u.spanDays, 0)).toBe(a.totalDays);
  });

  it("janela de um único dia não devolve eixo vazio", () => {
    const a = buildTimeAxis(d(2026, 9, 10), d(2026, 9, 10), "day");
    expect(a.units).toHaveLength(1);
    expect(a.totalDays).toBe(1);
  });

  it("dois níveis existem e o de cima é mais curto que o de baixo em day", () => {
    const a = buildTimeAxis(d(2026, 9, 1), d(2026, 11, 30), "day");
    expect(a.groups.length).toBeGreaterThan(0);
    expect(a.groups.length).toBeLessThan(a.units.length);
  });
});

/* ═════════════════════════════════ grade de mês (visão calendar) ══ */

describe("buildMonthMatrix — duplicado do Scheduler de propósito", () => {
  it("SEMPRE 6 linhas × 7 colunas", () => {
    for (const mes of [1, 2, 4, 9, 12]) {
      const m = buildMonthMatrix(d(2026, mes, 1));
      expect(m, `mês ${mes}`).toHaveLength(6);
      for (const semana of m) expect(semana).toHaveLength(7);
    }
  });

  it("fevereiro de ano comum também tem 6 linhas", () => {
    // 2026 não é bissexto. Grade que muda de altura faz o conteúdo abaixo pular.
    expect(buildMonthMatrix(d(2026, 2, 1))).toHaveLength(6);
  });

  it("começa no domingo com weekStartsOn 0", () => {
    const m = buildMonthMatrix(d(2026, 9, 1), 0);
    expect(m[0][0].getDay()).toBe(0);
  });

  it("começa na segunda com weekStartsOn 1", () => {
    const m = buildMonthMatrix(d(2026, 9, 1), 1);
    expect(m[0][0].getDay()).toBe(1);
  });

  it("os 42 dias são consecutivos, sem buraco na virada de mês", () => {
    const dias = buildMonthMatrix(d(2026, 12, 1)).flat();
    for (let i = 1; i < dias.length; i++) {
      const delta = (dias[i].getTime() - dias[i - 1].getTime()) / 86_400_000;
      expect(Math.round(delta), `entre ${i - 1} e ${i}`).toBe(1);
    }
  });

  it("contém o dia 1 do mês âncora", () => {
    const dias = buildMonthMatrix(d(2026, 9, 1)).flat().map((x) => x.getTime());
    expect(dias).toContain(d(2026, 9, 1).getTime());
  });
});

describe("computeOverflow — duplicado do Scheduler de propósito", () => {
  it("cabendo tudo, não há estouro", () => {
    expect(computeOverflow(2, 4)).toEqual({ visible: 2, overflowCount: 0 });
  });

  it("total EXATAMENTE igual ao max mostra todos", () => {
    // Trocar um chip por um aviso "+1 mais" seria pior que mostrar o chip.
    expect(computeOverflow(4, 4)).toEqual({ visible: 4, overflowCount: 0 });
  });

  it("a linha +N ocupa um slot — visible é max - 1", () => {
    expect(computeOverflow(9, 4)).toEqual({ visible: 3, overflowCount: 6 });
  });

  it("visible + overflowCount sempre reconstrói o total", () => {
    for (const [total, max] of [[9, 4], [5, 4], [1, 1], [100, 3], [0, 4]]) {
      const r = computeOverflow(total, max);
      expect(r.visible + r.overflowCount, `total ${total} max ${max}`).toBe(total);
    }
  });

  it("max zero joga tudo pro estouro sem quebrar", () => {
    expect(computeOverflow(5, 0)).toEqual({ visible: 0, overflowCount: 5 });
  });
});

describe("daysOfBar", () => {
  it("inclui as duas pontas", () => {
    const r = daysOfBar(barra({ start: d(2026, 9, 10), end: d(2026, 9, 12) }));
    expect(r.map((x) => x.getDate())).toEqual([10, 11, 12]);
  });

  it("duração zero devolve um dia", () => {
    const r = daysOfBar(barra({ start: d(2026, 9, 10), end: d(2026, 9, 10) }));
    expect(r).toHaveLength(1);
  });

  it("end ANTES de start devolve vazio, não loop infinito", () => {
    const r = daysOfBar(barra({ start: d(2026, 9, 20), end: d(2026, 9, 10) }));
    expect(r).toEqual([]);
  });

  it("atravessa virada de mês corretamente", () => {
    const r = daysOfBar(barra({ start: d(2026, 9, 29), end: d(2026, 10, 2) }));
    expect(r.map((x) => x.getDate())).toEqual([29, 30, 1, 2]);
  });
});

describe("monthBounds", () => {
  it("devolve o primeiro e o último dia do mês âncora", () => {
    const r = monthBounds(d(2026, 9, 17));
    expect(r.start.getDate()).toBe(1);
    expect(r.end.getDate()).toBe(30);
  });

  it("fevereiro de ano comum termina em 28", () => {
    expect(monthBounds(d(2026, 2, 10)).end.getDate()).toBe(28);
  });
});

/* ═══════════════════════════════ conector de árvore (L-045) ══ */

describe("flattenRows — flags de conector", () => {
  /**
   * A árvore de teste, e a forma dela É o teste:
   *
   *   r1                 depth 0, tem irmão
   *   ├ a1               depth 1
   *   └ a2               depth 1, ÚLTIMO
   *     └ n1             depth 2, ÚLTIMO — sob um pai que também é último
   *   r2                 depth 0, ÚLTIMO ROOT ← a borda da L-045
   *   └ b1               depth 1, ÚLTIMO
   */
  const arvore: GanttRow[] = [
    { id: "r1", label: "r1", bars: [] },
    { id: "a1", label: "a1", parent: "r1", bars: [] },
    { id: "a2", label: "a2", parent: "r1", bars: [] },
    { id: "n1", label: "n1", parent: "a2", bars: [] },
    { id: "r2", label: "r2", bars: [] },
    { id: "b1", label: "b1", parent: "r2", bars: [] },
  ];

  const porId = (rows: GanttFlatRow[]) =>
    new Map(rows.map((f) => [f.row.id, f]));

  it("isLast marca o último irmão de cada nível", () => {
    const m = porId(flattenRows(arvore, new Set()));
    expect(m.get("r1")!.isLast).toBe(false);
    expect(m.get("r2")!.isLast).toBe(true);
    expect(m.get("a1")!.isLast).toBe(false);
    expect(m.get("a2")!.isLast).toBe(true);
    expect(m.get("n1")!.isLast).toBe(true);
    expect(m.get("b1")!.isLast).toBe(true);
  });

  it("ancestorHasNext tem um item por nível ancestral", () => {
    const m = porId(flattenRows(arvore, new Set()));
    expect(m.get("r1")!.ancestorHasNext).toEqual([]);
    expect(m.get("a1")!.ancestorHasNext).toEqual([true]); // r1 tem irmão (r2)
    expect(m.get("n1")!.ancestorHasNext).toEqual([true, false]); // r1 sim, a2 não
    expect(m.get("b1")!.ancestorHasNext).toEqual([false]); // r2 é o último root
  });

  /**
   * ⚠️ **A borda da L-045.** A coluna de recuo `i` hospeda o cotovelo dos nós em
   * `depth i+1`, então a continuação vertical dela é `ancestorHasNext[i + 1]`.
   *
   * Com o índice errado (`[i]`) a guia **sumia no último root** e aparecia em
   * todos os outros — porque nos outros o root tinha irmão e mascarava o erro.
   * Este teste compara as duas leituras no MESMO nó, pra a diferença ficar
   * explícita em vez de depender de eu reproduzir o raciocínio certo de novo.
   */
  it("a leitura [i+1] difere de [i] justamente onde o pai é o último", () => {
    const m = porId(flattenRows(arvore, new Set()));

    // `b1` em depth 1: a coluna 0 hospeda o cotovelo DELE.
    expect(m.get("b1")!.ancestorHasNext[0]).toBe(false); // r2 não tem irmão

    // `n1` em depth 2: a coluna 0 é pass-through do nível 1, e quem decide é o
    // ancestral em depth 1 (`a2`) — ou seja `ancestorHasNext[1]`.
    const n1 = m.get("n1")!;
    expect(n1.ancestorHasNext[1]).toBe(false); // a2 é último → NÃO continua
    expect(n1.ancestorHasNext[0]).toBe(true); // r1 tem irmão → a leitura ERRADA
    // As duas divergem, e é por isso que o índice importa:
    expect(n1.ancestorHasNext[0]).not.toBe(n1.ancestorHasNext[1]);
  });

  it("isLast do nó colapsado não muda — ele segue sendo o último irmão", () => {
    const m = porId(flattenRows(arvore, new Set(["a2"])));
    expect(m.get("a2")!.isLast).toBe(true);
    expect(m.get("a2")!.collapsed).toBe(true);
    // e o filho dele saiu da lista
    expect(m.has("n1")).toBe(false);
  });

  it("um root só: isLast true e pilha vazia", () => {
    const rows = flattenRows([{ id: "so", label: "so", bars: [] }], new Set());
    expect(rows[0]!.isLast).toBe(true);
    expect(rows[0]!.ancestorHasNext).toEqual([]);
  });

  it("ciclo em parent não estoura a pilha nem perde as flags", () => {
    const ciclo: GanttRow[] = [
      { id: "x", label: "x", parent: "y", bars: [] },
      { id: "y", label: "y", parent: "x", bars: [] },
    ];
    const rows = flattenRows(ciclo, new Set());
    expect(rows.length).toBeGreaterThan(0);
    for (const f of rows) expect(Array.isArray(f.ancestorHasNext)).toBe(true);
  });
});
