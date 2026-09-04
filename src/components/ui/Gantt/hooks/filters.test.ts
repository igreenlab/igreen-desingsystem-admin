import { describe, expect, it } from "vitest";
import {
  aplicarFiltros,
  campoVazio,
  contarAplicados,
  linhaPassaNoCampo,
  normalizarTexto,
  operadorDoCampo,
  valoresDoChip,
} from "./filters";
import type { GanttFilterField, GanttRow } from "../gantt.types";

/**
 * Testes do núcleo de filtro.
 *
 * Cada bloco ataca uma AFIRMAÇÃO feita num comentário de `filters.ts`. Comentário
 * é load-bearing (L-060): quem lê para de investigar, então o que ele garante
 * tem que estar coberto.
 */

const linha = (id: string, meta: Record<string, unknown>): GanttRow => ({
  id,
  label: id,
  bars: [
    {
      id: `${id}-b`,
      start: new Date(2026, 8, 1),
      end: new Date(2026, 8, 5),
      meta,
    },
  ],
});

const campo = (over: Partial<GanttFilterField>): GanttFilterField => ({
  id: "f",
  label: "Campo",
  accessor: (r) => (r.bars[0]?.meta as Record<string, string>)?.v,
  ...over,
});

/* ══════════════════════════════════════════ normalização ══ */

describe("normalizarTexto", () => {
  it("remove acento e caixa", () => {
    expect(normalizarTexto("Sustentação")).toBe("sustentacao");
    expect(normalizarTexto("  FÁBIO  ")).toBe("fabio");
  });

  it("é o que faz 'fabio' achar 'Fábio' — a razão declarada no comentário", () => {
    const c = campo({ kind: "text" });
    const r = linha("a", { v: "Fábio Queiroz" });
    expect(linhaPassaNoCampo(c, ["fabio"], r)).toBe(true);
    expect(linhaPassaNoCampo(c, ["fabio"], r)).toBe(true);
  });
});

/* ══════════════════════════════════════════════ vazio ══ */

describe("campoVazio", () => {
  it("lista vazia é vazio em qualquer tipo", () => {
    expect(campoVazio("multi", [])).toBe(true);
    expect(campoVazio("number", [])).toBe(true);
    expect(campoVazio("date", undefined)).toBe(true);
  });

  /**
   * ⚠️ O caso que motivou a função existir. `["", ""]` tem length 2 — a conta
   * antiga (`v.length > 0`) o daria como filtro ATIVO, acendendo o badge e
   * fazendo `linhaPassaNoCampo` excluir toda linha não-numérica: "sumiu tudo"
   * sem nada marcado na tela.
   */
  it('["", ""] de faixa NÃO é filtro ativo, apesar de length 2', () => {
    expect(campoVazio("number", ["", ""])).toBe(true);
    expect(campoVazio("date", ["", ""])).toBe(true);
    expect(campoVazio("text", [""])).toBe(true);

    // e a conta antiga daria o oposto — é a regressão que este teste tranca
    expect(["", ""].length > 0).toBe(true);
  });

  it("um limite preenchido já é filtro ativo", () => {
    expect(campoVazio("number", ["3", ""])).toBe(false);
    expect(campoVazio("number", ["", "10"])).toBe(false);
    expect(campoVazio("date", ["2026-09-01", ""])).toBe(false);
  });

  it("multi/single/boolean não tratam string vazia como ausência", () => {
    // Ali o valor "" seria uma opção legítima (raro, mas possível), então a
    // ausência é medida por length e não por conteúdo.
    expect(campoVazio("multi", [""])).toBe(false);
    expect(campoVazio("boolean", ["false"])).toBe(false);
  });
});

/* ═══════════════════════════════════════════ operador ══ */

describe("operadorDoCampo", () => {
  it("multi, single e boolean dizem 'é'", () => {
    expect(operadorDoCampo("multi", ["a"])).toBe("é");
    expect(operadorDoCampo("single", ["a"])).toBe("é");
    expect(operadorDoCampo("boolean", ["true"])).toBe("é");
  });

  it("text diz 'contém'", () => {
    expect(operadorDoCampo("text", ["mapa"])).toBe("contém");
  });

  /**
   * A afirmação do comentário: operador FIXO mentiria em 2 dos 3 casos de
   * faixa. Aqui os 3 casos, explicitamente.
   */
  it("number varia com quais limites estão preenchidos", () => {
    expect(operadorDoCampo("number", ["3", "10"])).toBe("entre");
    expect(operadorDoCampo("number", ["3", ""])).toBe("≥");
    expect(operadorDoCampo("number", ["", "10"])).toBe("≤");
  });

  it("date varia igual, com as palavras de data", () => {
    expect(operadorDoCampo("date", ["2026-09-01", "2026-09-30"])).toBe("entre");
    expect(operadorDoCampo("date", ["2026-09-01", ""])).toBe("a partir de");
    expect(operadorDoCampo("date", ["", "2026-09-30"])).toBe("até");
  });
});

/* ══════════════════════════════════════════ predicado ══ */

describe("linhaPassaNoCampo — multi", () => {
  const c = campo({ kind: "multi" });

  it("interseção: qualquer valor marcado basta", () => {
    expect(linhaPassaNoCampo(c, ["design"], linha("a", { v: "design" }))).toBe(true);
    expect(linhaPassaNoCampo(c, ["design"], linha("a", { v: "produto" }))).toBe(false);
  });

  it("acessor que devolve lista casa por interseção", () => {
    const cl = campo({
      kind: "multi",
      accessor: () => ["design", "qa"],
    });
    expect(linhaPassaNoCampo(cl, ["qa"], linha("a", {}))).toBe(true);
    expect(linhaPassaNoCampo(cl, ["produto"], linha("a", {}))).toBe(false);
  });

  /**
   * A afirmação: linha sem valor é EXCLUÍDA, não incluída "por falta de
   * informação". Filtrar por "Responsável = Ana" e receber as linhas sem
   * responsável é o oposto do pedido.
   */
  it("acessor undefined/null exclui a linha", () => {
    expect(linhaPassaNoCampo(c, ["design"], linha("a", {}))).toBe(false);
    const cn = campo({ kind: "multi", accessor: () => null });
    expect(linhaPassaNoCampo(cn, ["design"], linha("a", {}))).toBe(false);
  });

  it("campo vazio passa TODAS — 'vazio = sem filtro'", () => {
    expect(linhaPassaNoCampo(c, [], linha("a", {}))).toBe(true);
    expect(linhaPassaNoCampo(c, undefined, linha("a", {}))).toBe(true);
  });
});

describe("linhaPassaNoCampo — text", () => {
  const c = campo({ kind: "text" });

  it("substring, não igualdade", () => {
    const r = linha("a", { v: "Mapa de processos" });
    expect(linhaPassaNoCampo(c, ["processo"], r)).toBe(true);
    expect(linhaPassaNoCampo(c, ["Mapa de processos"], r)).toBe(true);
    expect(linhaPassaNoCampo(c, ["cronograma"], r)).toBe(false);
  });

  it("termo só de espaço não filtra nada", () => {
    expect(linhaPassaNoCampo(c, ["   "], linha("a", {}))).toBe(true);
  });
});

describe("linhaPassaNoCampo — number", () => {
  const c = campo({
    kind: "number",
    accessor: (r) => (r.bars[0]?.meta as Record<string, unknown>)?.n as number,
  });

  it("faixa fechada inclui as bordas", () => {
    expect(linhaPassaNoCampo(c, ["3", "10"], linha("a", { n: 3 }))).toBe(true);
    expect(linhaPassaNoCampo(c, ["3", "10"], linha("a", { n: 10 }))).toBe(true);
    expect(linhaPassaNoCampo(c, ["3", "10"], linha("a", { n: 2 }))).toBe(false);
    expect(linhaPassaNoCampo(c, ["3", "10"], linha("a", { n: 11 }))).toBe(false);
  });

  it("faixa aberta de um lado", () => {
    expect(linhaPassaNoCampo(c, ["3", ""], linha("a", { n: 999 }))).toBe(true);
    expect(linhaPassaNoCampo(c, ["", "10"], linha("a", { n: 1 }))).toBe(true);
    expect(linhaPassaNoCampo(c, ["", "10"], linha("a", { n: 11 }))).toBe(false);
  });

  /**
   * ⚠️ `Number("")` é **0**, e é por isso que `comoNumero` tem um guarda pra
   * string vazia. Sem ele, `["", "10"]` viraria a faixa `[0, 10]` — e o filtro
   * "até 10" passaria a excluir todo número negativo em silêncio.
   */
  it("string vazia é AUSÊNCIA de limite, não zero", () => {
    expect(linhaPassaNoCampo(c, ["", "10"], linha("a", { n: -5 }))).toBe(true);
    // a armadilha, explicitada
    expect(Number("")).toBe(0);
  });

  it("aceita string numérica e vírgula decimal", () => {
    expect(linhaPassaNoCampo(c, ["3", "10"], linha("a", { n: "7" }))).toBe(true);
    expect(linhaPassaNoCampo(c, ["3", "10"], linha("a", { n: "7,5" }))).toBe(true);
  });

  it("valor não-numérico exclui", () => {
    expect(linhaPassaNoCampo(c, ["3", "10"], linha("a", { n: "sete" }))).toBe(false);
  });
});

describe("linhaPassaNoCampo — date", () => {
  const c = campo({
    kind: "date",
    accessor: (r) => r.bars[0]?.start,
  });

  it("período fechado inclui os dois dias-limite", () => {
    const r = linha("a", {}); // start = 01/09/2026
    expect(linhaPassaNoCampo(c, ["2026-09-01", "2026-09-30"], r)).toBe(true);
    expect(linhaPassaNoCampo(c, ["2026-09-02", "2026-09-30"], r)).toBe(false);
  });

  /**
   * ⚠️ A razão de usar `differenceInCalendarDays` e não `<=` de timestamp: com
   * horário no dado, o próprio dia do limite superior seria recusado. Aqui a
   * linha começa às 14h do dia 30 e o filtro vai "até 30/09".
   */
  it("dado com HORÁRIO ainda casa o dia do limite superior", () => {
    const comHora: GanttRow = {
      id: "h",
      label: "h",
      bars: [
        {
          id: "hb",
          start: new Date(2026, 8, 30, 14, 30),
          end: new Date(2026, 8, 30, 18, 0),
        },
      ],
    };
    expect(linhaPassaNoCampo(c, ["2026-09-01", "2026-09-30"], comHora)).toBe(true);

    // e a comparação de timestamp crua daria o oposto — a regressão trancada
    const ate = new Date("2026-09-30");
    expect(comHora.bars[0]!.start.getTime() <= ate.getTime()).toBe(false);
  });

  it("período aberto de um lado", () => {
    const r = linha("a", {});
    expect(linhaPassaNoCampo(c, ["2026-08-01", ""], r)).toBe(true);
    expect(linhaPassaNoCampo(c, ["", "2026-08-31"], r)).toBe(false);
  });
});

describe("linhaPassaNoCampo — boolean", () => {
  const c = campo({
    kind: "boolean",
    accessor: (r) => (r.bars[0]?.meta as Record<string, unknown>)?.b as boolean,
  });

  it("casa true e false", () => {
    expect(linhaPassaNoCampo(c, ["true"], linha("a", { b: true }))).toBe(true);
    expect(linhaPassaNoCampo(c, ["true"], linha("a", { b: false }))).toBe(false);
    expect(linhaPassaNoCampo(c, ["false"], linha("a", { b: false }))).toBe(true);
  });

  /**
   * A afirmação: o dado do consumidor raramente vem como a string "true". Sem
   * a normalização, um campo que guarda "1"/"Sim" nunca casaria — filtro que
   * não filtra, sem erro nenhum.
   */
  it("normaliza 1/0, sim/não, yes/no", () => {
    for (const v of [1, "1", "Sim", "sim", "SIM", "yes", true]) {
      expect(linhaPassaNoCampo(c, ["true"], linha("a", { b: v }))).toBe(true);
    }
    for (const v of [0, "0", "Não", "nao", "no", false]) {
      expect(linhaPassaNoCampo(c, ["false"], linha("a", { b: v }))).toBe(true);
    }
  });
});

/* ═══════════════════════════════════════ composição ══ */

describe("aplicarFiltros", () => {
  const rows = [
    linha("a", { frente: "design", dur: 6 }),
    linha("b", { frente: "design", dur: 12 }),
    linha("c", { frente: "produto", dur: 6 }),
  ];
  const porFrente = campo({
    id: "frente",
    kind: "multi",
    accessor: (r) => (r.bars[0]?.meta as Record<string, string>)?.frente,
  });
  const porDuracao = campo({
    id: "dur",
    kind: "number",
    accessor: (r) => (r.bars[0]?.meta as Record<string, unknown>)?.dur as number,
  });

  it("campos são CONJUNÇÃO — todos têm que passar", () => {
    const out = aplicarFiltros(rows, [porFrente, porDuracao], {
      frente: ["design"],
      dur: ["", "8"],
    });
    expect(out.map((r) => r.id)).toEqual(["a"]);
  });

  it("campo vazio não restringe", () => {
    const out = aplicarFiltros(rows, [porFrente, porDuracao], {
      frente: ["design"],
      dur: ["", ""],
    });
    expect(out.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("sem campos, devolve tudo (e uma cópia, não a mesma referência)", () => {
    const out = aplicarFiltros(rows, undefined, {});
    expect(out).toHaveLength(3);
    expect(out).not.toBe(rows);
  });
});

describe("contarAplicados", () => {
  const cs = [
    campo({ id: "a", kind: "multi" }),
    campo({ id: "b", kind: "number" }),
    campo({ id: "c", kind: "text" }),
  ];

  it("conta só o que de fato filtra", () => {
    expect(contarAplicados(cs, {})).toBe(0);
    expect(contarAplicados(cs, { a: ["x"] })).toBe(1);
    expect(contarAplicados(cs, { a: ["x"], b: ["1", "2"] })).toBe(2);
  });

  /** O badge não pode acender por um par de limites vazios. */
  it('par vazio de faixa e texto em branco não contam', () => {
    expect(contarAplicados(cs, { b: ["", ""], c: [""] })).toBe(0);
  });
});

/* ═════════════════════════════════════ texto do chip ══ */

describe("valoresDoChip", () => {
  it("multi devolve UMA entrada por valor marcado", () => {
    const c = campo({
      kind: "multi",
      options: [
        { value: "a", label: "Ana" },
        { value: "b", label: "Bruno" },
        { value: "c", label: "Carla" },
      ],
    });
    expect(valoresDoChip(c, ["a", "c"])).toEqual(["Ana", "Carla"]);
  });

  it("number junta o par numa entrada só", () => {
    const c = campo({ kind: "number" });
    expect(valoresDoChip(c, ["3", "10"])).toEqual(["3 e 10"]);
    expect(valoresDoChip(c, ["3", ""])).toEqual(["3"]);
    expect(valoresDoChip(c, ["", "10"])).toEqual(["10"]);
  });

  it("date passa pelo formatador recebido", () => {
    const c = campo({ kind: "date" });
    const fmt = (iso: string) => `[${iso}]`;
    expect(valoresDoChip(c, ["2026-09-01", "2026-09-30"], fmt)).toEqual([
      "[2026-09-01] e [2026-09-30]",
    ]);
    expect(valoresDoChip(c, ["2026-09-01", ""], fmt)).toEqual(["[2026-09-01]"]);
  });

  it("boolean sem options cai no par universal Sim/Não", () => {
    const c = campo({ kind: "boolean" });
    expect(valoresDoChip(c, ["true"])).toEqual(["Sim"]);
    expect(valoresDoChip(c, ["false"])).toEqual(["Não"]);
  });

  it("boolean COM options usa os rótulos do consumidor", () => {
    const c = campo({
      kind: "boolean",
      options: [
        { value: "true", label: "Concluída" },
        { value: "false", label: "Aberta" },
      ],
    });
    expect(valoresDoChip(c, ["true"])).toEqual(["Concluída"]);
  });

  it("text devolve o termo cru", () => {
    expect(valoresDoChip(campo({ kind: "text" }), ["mapa"])).toEqual(["mapa"]);
  });
});
