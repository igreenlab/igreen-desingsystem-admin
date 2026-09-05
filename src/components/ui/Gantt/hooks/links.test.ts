import { describe, expect, it } from "vitest";
import {
  checkAllLinks,
  checkLink,
  computeCriticalPath,
  constraintDates,
  linkPath,
  linkSides,
  topoSort,
} from "./links";
import type { GanttBar, GanttLink, GanttLinkType } from "../gantt.types";

/**
 * Testes do grafo de vínculos.
 *
 * Duas coisas são verificadas aqui e não em outro lugar:
 * 1. que as 4 restrições estão nas pontas certas (errar `SF` por `FF` produz
 *    resultado *plausível* e errado — o pior modo de falha);
 * 2. que ciclo é RESULTADO e não exceção — lançar mataria a tela por causa de
 *    dois vínculos invertidos no dado do consumidor.
 */

const d = (dia: number, mes = 9) => new Date(2026, mes - 1, dia);

const b = (id: string, ini: number, fim: number): GanttBar => ({
  id,
  start: d(ini),
  end: d(fim),
});

const mapa = (...bars: GanttBar[]) => new Map(bars.map((x) => [x.id, x]));

const link = (over: Partial<GanttLink> = {}): GanttLink => ({
  id: "l",
  source: "a",
  target: "c",
  ...over,
});

/* ══════════════════════════════════════════════════ restrições ══ */

describe("constraintDates — a ponta de saída e a de chegada", () => {
  const a = b("a", 1, 10);
  const c = b("c", 20, 25);

  const casos: Array<[GanttLinkType, number, number]> = [
    // [tipo, dia do limite (vem do source), dia da ponta restringida no target]
    ["FS", 10, 20], // sai do Finish de a, restringe o Start de c
    ["SS", 1, 20], // sai do Start,  restringe o Start
    ["FF", 10, 25], // sai do Finish, restringe o End
    ["SF", 1, 25], // sai do Start,  restringe o End
  ];

  for (const [tipo, limiteEsperado, pontaEsperada] of casos) {
    it(`${tipo}: limite no dia ${limiteEsperado}, ponta alvo no dia ${pontaEsperada}`, () => {
      const r = constraintDates(tipo, a, c);
      expect(r.limite.getDate()).toBe(limiteEsperado);
      expect(r.pontaAlvo.getDate()).toBe(pontaEsperada);
    });
  }

  it("lag empurra o limite pra frente", () => {
    expect(constraintDates("FS", a, c, 3).limite.getDate()).toBe(13);
  });

  it("lag negativo (lead) puxa o limite pra trás", () => {
    expect(constraintDates("FS", a, c, -2).limite.getDate()).toBe(8);
  });
});

/* ══════════════════════════════════════════════════ validação ══ */

describe("checkLink", () => {
  it("FS satisfeito devolve null", () => {
    const bars = mapa(b("a", 1, 10), b("c", 12, 20));
    expect(checkLink(link(), bars)).toBeNull();
  });

  it("FS com o alvo começando NO dia do fim é satisfeito", () => {
    // Fronteira: `deficitDays <= 0` é satisfeito, então 0 passa.
    const bars = mapa(b("a", 1, 10), b("c", 10, 20));
    expect(checkLink(link(), bars)).toBeNull();
  });

  it("FS violado devolve o déficit em dias", () => {
    const bars = mapa(b("a", 1, 10), b("c", 7, 20));
    const v = checkLink(link(), bars)!;
    expect(v.deficitDays).toBe(3);
  });

  it("lag entra no déficit", () => {
    const bars = mapa(b("a", 1, 10), b("c", 12, 20));
    // Precisa começar em 15 (10 + 5); começa em 12 → déficit 3.
    const v = checkLink(link({ lag: 5 }), bars)!;
    expect(v.deficitDays).toBe(3);
  });

  it("source INEXISTENTE é ignorado, não reportado como violação", () => {
    // Referência pendente acontece em paginação e em edição otimista; tratar
    // como conflito encheria a tela de falso positivo transitório.
    const bars = mapa(b("c", 1, 5));
    expect(checkLink(link({ source: "fantasma" }), bars)).toBeNull();
  });

  it("target inexistente também é ignorado", () => {
    const bars = mapa(b("a", 1, 5));
    expect(checkLink(link({ target: "fantasma" }), bars)).toBeNull();
  });

  it("SS violado: o alvo começa antes do source", () => {
    const bars = mapa(b("a", 10, 20), b("c", 5, 15));
    const v = checkLink(link({ type: "SS" }), bars)!;
    expect(v.deficitDays).toBe(5);
  });

  it("FF violado: o alvo termina antes do source", () => {
    const bars = mapa(b("a", 1, 20), b("c", 5, 15));
    const v = checkLink(link({ type: "FF" }), bars)!;
    expect(v.deficitDays).toBe(5);
  });

  it("SF violado", () => {
    const bars = mapa(b("a", 10, 30), b("c", 1, 5));
    const v = checkLink(link({ type: "SF" }), bars)!;
    expect(v.deficitDays).toBe(5);
  });

  it("tipo omitido é tratado como FS", () => {
    const bars = mapa(b("a", 1, 10), b("c", 7, 20));
    const semTipo = checkLink(link(), bars)!;
    const comFS = checkLink(link({ type: "FS" }), bars)!;
    expect(semTipo.deficitDays).toBe(comFS.deficitDays);
  });
});

describe("checkAllLinks", () => {
  it("devolve só os violados", () => {
    const bars = mapa(b("a", 1, 10), b("c", 12, 20), b("e", 5, 8));
    const r = checkAllLinks(
      [
        link({ id: "ok", source: "a", target: "c" }),
        link({ id: "ruim", source: "a", target: "e" }),
      ],
      bars,
    );
    expect(r.map((x) => x.link.id)).toEqual(["ruim"]);
  });

  it("nenhum vínculo devolve lista vazia", () => {
    expect(checkAllLinks([], mapa(b("a", 1, 2)))).toEqual([]);
  });
});

/* ═══════════════════════════════════════ ordenação topológica ══ */

describe("topoSort", () => {
  it("cadeia linear sai em ordem", () => {
    const r = topoSort(["a", "b", "c"], [
      link({ id: "1", source: "a", target: "b" }),
      link({ id: "2", source: "b", target: "c" }),
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.order).toEqual(["a", "b", "c"]);
  });

  it("nós sem vínculo nenhum entram na ordem", () => {
    const r = topoSort(["x", "y"], []);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.order).toHaveLength(2);
  });

  it("ciclo devolve ok:false, NÃO lança", () => {
    // Ciclo é dado do consumidor, não bug do componente.
    let r: ReturnType<typeof topoSort>;
    expect(() => {
      r = topoSort(["a", "b"], [
        link({ id: "1", source: "a", target: "b" }),
        link({ id: "2", source: "b", target: "a" }),
      ]);
    }).not.toThrow();
    r = topoSort(["a", "b"], [
      link({ id: "1", source: "a", target: "b" }),
      link({ id: "2", source: "b", target: "a" }),
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.cycle.sort()).toEqual(["a", "b"]);
  });

  it("AUTO-VÍNCULO conta como ciclo", () => {
    // Acontece de verdade: duplicar uma tarefa junto com seus vínculos produz
    // exatamente isso. Sem a checagem, o nó ficaria com grau de entrada 1 pra
    // sempre e a ordem sairia incompleta em silêncio.
    const r = topoSort(["a"], [link({ id: "1", source: "a", target: "a" })]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.cycle).toEqual(["a"]);
  });

  it("vínculo pra id fora do conjunto é ignorado, não trava", () => {
    const r = topoSort(["a"], [link({ id: "1", source: "a", target: "fora" })]);
    expect(r.ok).toBe(true);
  });

  it("ciclo parcial isola só os nós do ciclo", () => {
    const r = topoSort(["livre", "a", "b"], [
      link({ id: "1", source: "a", target: "b" }),
      link({ id: "2", source: "b", target: "a" }),
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.cycle.sort()).toEqual(["a", "b"]);
      expect(r.cycle).not.toContain("livre");
    }
  });

  it("diamante (dois caminhos convergindo) resolve", () => {
    const r = topoSort(["a", "b", "c", "d"], [
      link({ id: "1", source: "a", target: "b" }),
      link({ id: "2", source: "a", target: "c" }),
      link({ id: "3", source: "b", target: "d" }),
      link({ id: "4", source: "c", target: "d" }),
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.order[0]).toBe("a");
      expect(r.order[3]).toBe("d");
    }
  });
});

/* ════════════════════════════════════════════ caminho crítico ══ */

describe("computeCriticalPath", () => {
  it("cadeia sem folga: todas críticas", () => {
    const bars = [b("a", 1, 5), b("b", 5, 10)];
    const r = computeCriticalPath(bars, [link({ id: "1", source: "a", target: "b" })]);
    expect("critical" in r).toBe(true);
    if ("critical" in r) {
      expect(r.critical.has("a")).toBe(true);
      expect(r.critical.has("b")).toBe(true);
    }
  });

  it("ramo curto ao lado do longo NÃO é crítico", () => {
    //  a(1→10) ─┬─→ longo(10→30) ─→ fim
    //           └─→ curto(10→12) ─→ fim
    // O curto tem folga: pode atrasar 18 dias sem mexer no fim do projeto.
    const bars = [b("a", 1, 10), b("longo", 10, 30), b("curto", 10, 12)];
    const r = computeCriticalPath(bars, [
      link({ id: "1", source: "a", target: "longo" }),
      link({ id: "2", source: "a", target: "curto" }),
    ]);
    if (!("critical" in r)) throw new Error("esperava crítico, veio ciclo");
    expect(r.critical.has("longo")).toBe(true);
    expect(r.critical.has("curto")).toBe(false);
  });

  it("ciclo devolve o ciclo em vez de crítico", () => {
    const bars = [b("a", 1, 5), b("b", 5, 10)];
    const r = computeCriticalPath(bars, [
      link({ id: "1", source: "a", target: "b" }),
      link({ id: "2", source: "b", target: "a" }),
    ]);
    expect("cycle" in r).toBe(true);
  });

  it("SÓ considera FS — os outros tipos não entram no cálculo", () => {
    // Limite conhecido e declarado: implementar SS/FF/SF pela metade daria
    // caminho crítico plausível e errado, que é pior que não ter.
    const bars = [b("a", 1, 10), b("b", 20, 22)];
    const r = computeCriticalPath(bars, [
      link({ id: "1", source: "a", target: "b", type: "SS" }),
    ]);
    if (!("critical" in r)) throw new Error("esperava crítico");
    // Sem aresta FS, `b` é um nó solto que termina depois → é o fim do projeto.
    expect(r.critical.has("b")).toBe(true);
  });

  it("sem vínculo nenhum, a barra que termina mais tarde é crítica", () => {
    const bars = [b("curta", 1, 3), b("longa", 1, 20)];
    const r = computeCriticalPath(bars, []);
    if (!("critical" in r)) throw new Error("esperava crítico");
    expect(r.critical.has("longa")).toBe(true);
  });

  it("conjunto vazio não estoura", () => {
    expect(() => computeCriticalPath([], [])).not.toThrow();
  });

  it("uma barra só é crítica", () => {
    const r = computeCriticalPath([b("a", 1, 5)], []);
    if (!("critical" in r)) throw new Error("esperava crítico");
    expect(r.critical.has("a")).toBe(true);
  });
});

/* ════════════════════════════════════════════ geometria da seta ══ */

describe("linkSides — de que lado a seta sai e entra", () => {
  it("FS sai da direita e entra na esquerda", () => {
    expect(linkSides("FS")).toEqual({ saiDireita: true, entraEsquerda: true });
  });

  it("SS sai da esquerda e entra na esquerda", () => {
    expect(linkSides("SS")).toEqual({ saiDireita: false, entraEsquerda: true });
  });

  it("FF sai da direita e entra na direita", () => {
    expect(linkSides("FF")).toEqual({ saiDireita: true, entraEsquerda: false });
  });

  it("SF sai da esquerda e entra na direita", () => {
    expect(linkSides("SF")).toEqual({ saiDireita: false, entraEsquerda: false });
  });
});

describe("linkPath", () => {
  it("começa no ponto de saída e termina no de chegada", () => {
    const p = linkPath({ x: 100, y: 20 }, { x: 300, y: 60 }, {
      saiDireita: true,
      entraEsquerda: true,
    });
    expect(p.startsWith("M 100 20")).toBe(true);
    expect(p.endsWith("L 300 60")).toBe(true);
  });

  it("é ortogonal: só comandos M e L, nenhuma curva", () => {
    // Segmentos retos se leem mesmo cruzados; 40 curvas de Bézier viram um
    // emaranhado onde não se segue nenhuma.
    const p = linkPath({ x: 0, y: 0 }, { x: 100, y: 40 }, {
      saiDireita: true,
      entraEsquerda: true,
    });
    expect(p).not.toMatch(/[CQSTA]/);
    expect(p.match(/L/g)!.length).toBeGreaterThanOrEqual(3);
  });

  it("mesma linha degenera em caminho reto (sem cotovelo vertical)", () => {
    const p = linkPath({ x: 10, y: 30 }, { x: 200, y: 30 }, {
      saiDireita: true,
      entraEsquerda: true,
    });
    // Todos os Y do path são 30 — nenhum desvio vertical.
    const ys = [...p.matchAll(/-?\d+(?:\.\d+)?(?= |$)/g)]
      .map((m) => Number(m[0]))
      .filter((_, i) => i % 2 === 1);
    expect(new Set(ys)).toEqual(new Set([30]));
  });

  it("o recuo respeita o lado de saída", () => {
    const direita = linkPath({ x: 100, y: 0 }, { x: 300, y: 0 }, {
      saiDireita: true,
      entraEsquerda: true,
      recuo: 20,
    });
    const esquerda = linkPath({ x: 100, y: 0 }, { x: 300, y: 0 }, {
      saiDireita: false,
      entraEsquerda: true,
      recuo: 20,
    });
    expect(direita).toContain("L 120 0");
    expect(esquerda).toContain("L 80 0");
  });
});
