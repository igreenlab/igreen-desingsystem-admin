/**
 * Parser SQL-like simples — converte texto livre em FilterPopoverEntry[].
 *
 * Subset suportado:
 *   `field operator value`
 *   `field operator "quoted value"`
 *   `field1 = X AND field2 > Y`
 *   `field1 = X OR field2 = Y`
 *
 * Operadores: `=` `!=` `<>` `>` `<` `>=` `<=` `contains` `like`
 * Logical: AND, OR (case-insensitive). Sem parenteses, sem nested.
 *
 * Output: { entries, logicOperator } ou { error: string }.
 *
 * Mapeamento de operadores texto → FilterPopoverEntry.op (ids longos do FilterModel):
 *   = | ==     → "equals"
 *   != | <>    → "neq"
 *   contains   → "contains"
 *   like       → "contains"
 *   >          → "gt"
 *   <          → "lt"
 *   >=         → "gte"
 *   <=         → "lte"
 */

export type ParsedFilterEntry = {
  field: string;
  op: "equals" | "neq" | "contains" | "gt" | "lt" | "gte" | "lte";
  value: string;
};

export type ParseResult =
  | { ok: true; entries: ParsedFilterEntry[]; logicOperator: "AND" | "OR" }
  | { ok: false; error: string };

const OP_MAP: Record<string, ParsedFilterEntry["op"]> = {
  "=": "equals",
  "==": "equals",
  "!=": "neq",
  "<>": "neq",
  ">": "gt",
  "<": "lt",
  ">=": "gte",
  "<=": "lte",
  contains: "contains",
  like: "contains",
};

const OP_REGEX = /(>=|<=|!=|<>|==|=|>|<|\bcontains\b|\blike\b)/i;

function unquote(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

export function parseSqlFilter(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, entries: [], logicOperator: "AND" };

  // Detect logical operator (AND/OR) — assume um único conector
  const upperLogic = / AND | OR /i;
  const logicMatch = trimmed.match(upperLogic);
  const logicOperator: "AND" | "OR" = logicMatch?.[0]?.trim().toUpperCase() === "OR" ? "OR" : "AND";

  // Split por AND/OR (case-insensitive)
  const parts = trimmed
    .split(/\s+(?:AND|OR)\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  const entries: ParsedFilterEntry[] = [];
  for (const part of parts) {
    const match = part.match(OP_REGEX);
    if (!match) {
      return { ok: false, error: `Sem operador em "${part}". Use =, !=, >, <, contains.` };
    }
    const opText = match[0].toLowerCase();
    const op = OP_MAP[opText];
    if (!op) {
      return { ok: false, error: `Operador desconhecido "${match[0]}".` };
    }
    const [fieldRaw, valueRaw] = part.split(OP_REGEX, 1).concat(
      part.slice(part.indexOf(match[0]) + match[0].length),
    );
    const field = fieldRaw?.trim();
    const value = unquote(valueRaw ?? "");
    if (!field) {
      return { ok: false, error: `Campo ausente em "${part}".` };
    }
    if (!value) {
      return { ok: false, error: `Valor ausente em "${part}".` };
    }
    entries.push({ field, op, value });
  }

  return { ok: true, entries, logicOperator };
}

/** Converte FilterPopoverEntry[] de volta pra string SQL-like. */
export function entriesToSql(
  entries: ParsedFilterEntry[],
  logicOperator: "AND" | "OR" = "AND",
): string {
  const opText: Record<ParsedFilterEntry["op"], string> = {
    equals: "=",
    neq: "!=",
    contains: "contains",
    gt: ">",
    lt: "<",
    gte: ">=",
    lte: "<=",
  };
  return entries
    .map((e) => {
      const needsQuote = /\s|["']/.test(e.value);
      const v = needsQuote ? `"${e.value.replace(/"/g, '\\"')}"` : e.value;
      return `${e.field} ${opText[e.op]} ${v}`;
    })
    .join(` ${logicOperator} `);
}
