import { describe, expect, it } from "vitest";
import {
  parseSqlFilter,
  entriesToSql,
  type ParsedFilterEntry,
  type ParsedFilterOp,
} from "./filter-sql-parser";

/**
 * Tests do parser SQL-like do Filtro Avançado.
 *
 * Foco: campo MULTI-PALAVRA (com/sem aspas) — o bug que rejeitava `nome cliente`
 * — e round-trip `entriesToSql ↔ parseSqlFilter` por operador. O parser só
 * estrutura `{field, op, value}`; segurança (allowlist/bind) é no backend.
 */

/** Atalho: parseia 1 condição e devolve a 1ª entry (falha o teste se !ok). */
function parseOne(input: string): ParsedFilterEntry {
  const r = parseSqlFilter(input);
  if (!r.ok) throw new Error(`esperava ok, veio erro: ${r.error}`);
  expect(r.entries).toHaveLength(1);
  return r.entries[0]!;
}

describe("parseSqlFilter — campo multi-palavra", () => {
  it("aceita campo com espaço sem aspas (campo = tudo até o operador)", () => {
    expect(parseOne("nome cliente = ana luisa")).toEqual({
      field: "nome cliente",
      op: "equals",
      value: "ana luisa",
    });
  });

  it("aceita campo entre aspas duplas", () => {
    expect(parseOne('"nome cliente" = ana')).toEqual({
      field: "nome cliente",
      op: "equals",
      value: "ana",
    });
  });

  it("aceita campo entre aspas simples", () => {
    expect(parseOne("'data cadastro' > 2026-01-01")).toEqual({
      field: "data cadastro",
      op: "gt",
      value: "2026-01-01",
    });
  });

  it("aceita campo multi-palavra com operador em palavra (contains)", () => {
    expect(parseOne("nome cliente contains ana")).toEqual({
      field: "nome cliente",
      op: "contains",
      value: "ana",
    });
  });

  it("aceita is empty / is not empty em campo multi-palavra", () => {
    expect(parseOne("nome cliente is empty")).toEqual({
      field: "nome cliente",
      op: "isEmpty",
      value: "",
    });
    expect(parseOne("nome cliente is not empty")).toEqual({
      field: "nome cliente",
      op: "isNotEmpty",
      value: "",
    });
  });
});

describe("parseSqlFilter — símbolos e listas", () => {
  it("símbolo colado ao campo (sem espaço)", () => {
    expect(parseOne("value>1000")).toEqual({
      field: "value",
      op: "gt",
      value: "1000",
    });
  });

  it(">= antes de > (especificidade)", () => {
    expect(parseOne("score >= 10")).toEqual({
      field: "score",
      op: "gte",
      value: "10",
    });
  });

  it("lista in [..] vira isAnyOf", () => {
    expect(parseOne("tags in [a, b, c]")).toEqual({
      field: "tags",
      op: "isAnyOf",
      value: ["a", "b", "c"],
    });
  });

  it("not in [..] vira isNoneOf", () => {
    expect(parseOne("uf not in [SP, RJ]")).toEqual({
      field: "uf",
      op: "isNoneOf",
      value: ["SP", "RJ"],
    });
  });

  it("between [x, y]", () => {
    expect(parseOne("valor between [10, 20]")).toEqual({
      field: "valor",
      op: "between",
      value: ["10", "20"],
    });
  });
});

describe("parseSqlFilter — conectores e erros", () => {
  it("detecta AND e múltiplas condições", () => {
    const r = parseSqlFilter('status = ativo AND value > 1000');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.logicOperator).toBe("AND");
    expect(r.entries).toHaveLength(2);
  });

  it("detecta OR", () => {
    const r = parseSqlFilter("a = 1 OR b = 2");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.logicOperator).toBe("OR");
  });

  it("erro quando falta operador", () => {
    const r = parseSqlFilter("apenasCampo");
    expect(r.ok).toBe(false);
  });

  it("texto vazio → ok com zero entries", () => {
    const r = parseSqlFilter("   \n  -- comentário\n");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entries).toHaveLength(0);
  });
});

describe("round-trip entriesToSql ↔ parseSqlFilter", () => {
  const cases: ParsedFilterEntry[] = [
    { field: "status", op: "equals", value: "active" },
    { field: "status", op: "neq", value: "x" },
    { field: "nome", op: "contains", value: "foo" },
    { field: "nome", op: "notContains", value: "bar" },
    { field: "nome", op: "startsWith", value: "pre" },
    { field: "nome", op: "endsWith", value: "suf" },
    { field: "score", op: "gt", value: "10" },
    { field: "score", op: "lt", value: "5" },
    { field: "score", op: "gte", value: "1" },
    { field: "score", op: "lte", value: "9" },
    { field: "nome", op: "isEmpty", value: "" },
    { field: "nome", op: "isNotEmpty", value: "" },
    { field: "uf", op: "isAnyOf", value: ["SP", "RJ"] },
    { field: "uf", op: "isNoneOf", value: ["MG", "BA"] },
    { field: "valor", op: "between", value: ["10", "20"] },
  ];

  for (const entry of cases) {
    it(`op "${entry.op}" sobrevive ao round-trip`, () => {
      const sql = entriesToSql([entry], "AND");
      const parsed = parseSqlFilter(sql);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;
      expect(parsed.entries).toEqual([entry]);
    });
  }

  it("campo com espaço é quotado e sobrevive ao round-trip", () => {
    const entry: ParsedFilterEntry = {
      field: "nome cliente",
      op: "equals" as ParsedFilterOp,
      value: "ana luisa",
    };
    const sql = entriesToSql([entry], "AND");
    expect(sql).toContain('"nome cliente"');
    const parsed = parseSqlFilter(sql);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.entries).toEqual([entry]);
  });

  it("valor com espaço é quotado e sobrevive ao round-trip", () => {
    const entry: ParsedFilterEntry = {
      field: "cidade",
      op: "equals",
      value: "São Paulo",
    };
    const sql = entriesToSql([entry], "AND");
    const parsed = parseSqlFilter(sql);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.entries).toEqual([entry]);
  });
});
