/**
 * Parser SQL-like — converte texto livre ↔ FilterPopoverEntry[] (round-trip-safe).
 *
 * Suporta o conjunto COMPLETO de operadores do FilterModel. Operadores
 * estruturais (lista/intervalo) usam sintaxe de COLCHETES pra não conflitar com
 * o split por AND/OR (colchetes nunca contêm ` AND `/` OR ` solto):
 *
 *   field = value            → equals          field != value        → neq
 *   field contains value     → contains        field not contains v  → notContains
 *   field starts with value  → startsWith      field ends with value → endsWith
 *   field > value            → gt              field < value          → lt
 *   field >= value           → gte             field <= value         → lte
 *   field is empty           → isEmpty         field is not empty     → isNotEmpty
 *   field in [a, b, c]       → isAnyOf         field not in [a, b, c] → isNoneOf
 *   field between [x, y]     → between
 *
 * Logical: AND, OR (case-insensitive, um único conector). Sem parênteses/nested.
 */

export type ParsedFilterOp =
  | "equals"
  | "neq"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "isEmpty"
  | "isNotEmpty"
  | "isAnyOf"
  | "isNoneOf"
  | "between";

export type ParsedFilterEntry = {
  field: string;
  op: ParsedFilterOp;
  /** string pros ops escalares; string[] pros estruturais (in/not in/between). */
  value: string | string[];
};

export type ParseResult =
  | { ok: true; entries: ParsedFilterEntry[]; logicOperator: "AND" | "OR" }
  | { ok: false; error: string };

function unquote(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

/** Parseia uma lista entre colchetes `[a, "b c", 'd']` → string[] (unquoted). */
function parseList(raw: string): string[] | null {
  const t = raw.trim();
  if (!t.startsWith("[") || !t.endsWith("]")) return null;
  const inner = t.slice(1, -1).trim();
  if (!inner) return [];
  // split por vírgula respeitando aspas simples
  const out: string[] = [];
  let buf = "";
  let quote: '"' | "'" | null = null;
  for (const ch of inner) {
    if (quote) {
      if (ch === quote) quote = null;
      else buf += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ",") {
      out.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out.map((v) => v.trim());
}

/**
 * Tenta casar um operador no início de `rest` (já sem o field). Retorna o op +
 * o restante (value bruto), ou null se nenhum operador casou. Ordem importa:
 * frases mais específicas/longas primeiro.
 */
function matchOperator(
  rest: string,
): { op: ParsedFilterOp; rawValue: string } | null {
  const r = rest.trim();
  const lower = r.toLowerCase();

  // No-value (frase completa, value vazio)
  if (lower === "is not empty") return { op: "isNotEmpty", rawValue: "" };
  if (lower === "is empty") return { op: "isEmpty", rawValue: "" };

  // Multi-palavra com value
  const phrase: Array<[RegExp, ParsedFilterOp]> = [
    [/^not\s+in\b/i, "isNoneOf"],
    [/^in\b/i, "isAnyOf"],
    [/^between\b/i, "between"],
    [/^not\s+contains\b/i, "notContains"],
    [/^starts\s+with\b/i, "startsWith"],
    [/^ends\s+with\b/i, "endsWith"],
    [/^contains\b/i, "contains"],
    [/^like\b/i, "contains"],
  ];
  for (const [re, op] of phrase) {
    const m = r.match(re);
    if (m) return { op, rawValue: r.slice(m[0].length).trim() };
  }

  // Símbolos (sem precisar de espaço)
  const sym: Array<[string, ParsedFilterOp]> = [
    [">=", "gte"],
    ["<=", "lte"],
    ["!=", "neq"],
    ["<>", "neq"],
    ["==", "equals"],
    ["=", "equals"],
    [">", "gt"],
    ["<", "lt"],
  ];
  for (const [symbol, op] of sym) {
    if (r.startsWith(symbol)) {
      return { op, rawValue: r.slice(symbol.length).trim() };
    }
  }
  return null;
}

const LIST_OPS = new Set<ParsedFilterOp>(["isAnyOf", "isNoneOf", "between"]);
const NO_VALUE_OPS = new Set<ParsedFilterOp>(["isEmpty", "isNotEmpty"]);

export function parseSqlFilter(input: string): ParseResult {
  const trimmed = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("--"))
    .join(" ")
    .trim();
  if (!trimmed) return { ok: true, entries: [], logicOperator: "AND" };

  const logicMatch = trimmed.match(/\s(AND|OR)\s/i);
  const logicOperator: "AND" | "OR" =
    logicMatch?.[1]?.toUpperCase() === "OR" ? "OR" : "AND";

  const parts = trimmed
    .split(/\s+(?:AND|OR)\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  const entries: ParsedFilterEntry[] = [];
  for (const part of parts) {
    // field = primeiro token (sem espaço); pode ter dots (user.name)
    const fm = part.match(/^(\S+)\s*(.*)$/s);
    const field = fm?.[1]?.trim();
    if (!field) {
      return { ok: false, error: `Campo ausente em "${part}".` };
    }
    const matched = matchOperator(fm![2]);
    if (!matched) {
      return {
        ok: false,
        error: `Sem operador válido em "${part}". Use =, !=, >, contains, in [..], between [..], is empty, etc.`,
      };
    }
    const { op, rawValue } = matched;

    if (NO_VALUE_OPS.has(op)) {
      entries.push({ field, op, value: "" });
      continue;
    }
    if (LIST_OPS.has(op)) {
      const list = parseList(rawValue);
      if (!list) {
        return {
          ok: false,
          error: `"${op}" espera lista entre colchetes em "${part}" (ex: in [a, b]).`,
        };
      }
      entries.push({ field, op, value: list });
      continue;
    }
    const value = unquote(rawValue);
    if (!value) {
      return { ok: false, error: `Valor ausente em "${part}".` };
    }
    entries.push({ field, op, value });
  }

  return { ok: true, entries, logicOperator };
}

/* ── Serialização (FilterPopoverEntry → texto) ───────────────────── */

const SYMBOL_OP: Partial<Record<ParsedFilterOp, string>> = {
  equals: "=",
  neq: "!=",
  gt: ">",
  lt: "<",
  gte: ">=",
  lte: "<=",
};
const PHRASE_OP: Partial<Record<ParsedFilterOp, string>> = {
  contains: "contains",
  notContains: "not contains",
  startsWith: "starts with",
  endsWith: "ends with",
};

/** Aspas se o valor tem espaço/aspas/vírgula. */
function quoteIfNeeded(v: string): string {
  return /[\s",[\]]/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v;
}

function serializeList(value: string | string[]): string {
  const arr = Array.isArray(value) ? value : value === "" ? [] : [value];
  return `[${arr.map((v) => quoteIfNeeded(String(v))).join(", ")}]`;
}

/** Converte FilterPopoverEntry[] de volta pra string SQL-like (round-trip). */
export function entriesToSql(
  entries: ParsedFilterEntry[],
  logicOperator: "AND" | "OR" = "AND",
): string {
  return entries
    .map((e) => {
      if (e.op === "isEmpty") return `${e.field} is empty`;
      if (e.op === "isNotEmpty") return `${e.field} is not empty`;
      if (e.op === "isAnyOf") return `${e.field} in ${serializeList(e.value)}`;
      if (e.op === "isNoneOf")
        return `${e.field} not in ${serializeList(e.value)}`;
      if (e.op === "between")
        return `${e.field} between ${serializeList(e.value)}`;

      const v = quoteIfNeeded(String(Array.isArray(e.value) ? e.value.join(",") : e.value));
      const sym = SYMBOL_OP[e.op];
      if (sym) return `${e.field} ${sym} ${v}`;
      const phrase = PHRASE_OP[e.op];
      return `${e.field} ${phrase ?? "contains"} ${v}`;
    })
    .join(` ${logicOperator} `);
}
