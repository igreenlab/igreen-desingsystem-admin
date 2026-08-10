/**
 * O `get()` tem duas responsabilidades que se anulavam:
 *
 *  1. **resolver** o tipo (ou cair no fallback `text`);
 *  2. **avisar** quando o tipo não existe — typo guard, pra `type="curency"` não
 *     degradar em silêncio.
 *
 * Medido em 2026-08-10 no `?app=finance`: **156 warnings por page load**, todos de
 * `type: "actions"` — que é tipo ESTRUTURAL e legitimamente não está no registry. Com
 * esse volume, um typo real fica invisível: o guard sepultava o próprio sinal.
 *
 * Estes testes travam as duas metades. O ponto crítico é o último bloco: a correção
 * **não pode** mudar o valor de retorno, porque muitos consumidores já usam a tabela.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { columnTypeRegistry } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

const REGISTRADOS = [
  "text", "number", "currency", "percentage", "date", "datetime",
  "email", "phone", "url", "status", "badge", "boolean", "user",
  "tags", "select", "multiSelect",
] as const;

describe("columnTypeRegistry — resolução (o que NÃO pode mudar)", () => {
  it("os 16 tipos de dado resolvem pra si mesmos", () => {
    for (const t of REGISTRADOS) {
      expect(columnTypeRegistry.get(t).type, t).toBe(t);
    }
  });

  it("`undefined` cai em `text` — sem tipo é intencional", () => {
    expect(columnTypeRegistry.get(undefined).type).toBe("text");
  });

  it("`actions` cai em `text`, IGUAL a antes da correção", () => {
    // O retorno é o mesmo de sempre. A correção silencia o aviso, não muda resolução —
    // e o `typeDef` da coluna de actions é descartado pelo render mesmo
    // (`isActionsCol && col.getActions` vence antes, em data-table-row.tsx).
    expect(columnTypeRegistry.get("actions").type).toBe("text");
  });

  it("tipo desconhecido cai em `text`", () => {
    expect(columnTypeRegistry.get("curency").type).toBe("text");
  });
});

describe("columnTypeRegistry — o typo guard", () => {
  it("NÃO avisa pra tipo estrutural (`actions`) — era o ruído de 156×", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    columnTypeRegistry.get("actions");
    expect(warn, "actions não é typo; avisar aqui anula o guard").not.toHaveBeenCalled();
  });

  it("AVISA pra typo de verdade — o guard segue vivo", () => {
    // Metade indispensável: sem esta asserção, alguém poderia "consertar" o ruído
    // desligando o warn inteiro, e `type="curency"` voltaria a degradar em silêncio.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    columnTypeRegistry.get("curency");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("curency");
  });

  it("NÃO avisa pra `undefined` — não há o que ser typo", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    columnTypeRegistry.get(undefined);
    expect(warn).not.toHaveBeenCalled();
  });

  it("nenhum tipo registrado avisa", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const t of REGISTRADOS) columnTypeRegistry.get(t);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("columnTypeRegistry — o repo hoje", () => {
  it("`actions` é o único da união que não está registrado", () => {
    // Se um tipo novo entrar na união e esquecerem de registrar, este teste avisa —
    // e a decisão passa a ser explícita: registrar, ou declarar como estrutural.
    const uniao = [...REGISTRADOS, "actions"];
    const naoRegistrados = uniao.filter((t) => !columnTypeRegistry.has(t));
    expect(naoRegistrados).toEqual(["actions"]);
  });

  it("`text` existe — é o fallback de todo mundo", () => {
    expect(columnTypeRegistry.has("text")).toBe(true);
  });
});
