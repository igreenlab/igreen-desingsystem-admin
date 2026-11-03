import { describe, it, expect, afterEach } from "vitest";
import { typeOwnsMulti } from "./filter-ops";
import { columnTypeRegistry } from "../column-types";
import type { ColumnTypeDefinition } from "../column-types";

/**
 * As três guardas do `typeOwnsMulti`, uma por uma.
 *
 * ⚠️ Este arquivo existe por um achado de review: a guarda nº 3
 * (`typeDef.type === filterType`) **não era morta por teste nenhum**. O teste que
 * supostamente a cobria — `owns-multi.test.tsx` "ownsMulti não é herdado por typo no
 * filterType" — passava com a guarda removida, medido. Motivo: o registry devolve `text`
 * pra tipo desconhecido, e `text` não declara o flag, então a segunda metade da condição
 * (`typeDef.ownsMulti === true`) já bastava sozinha.
 *
 * Ou seja: o teste descrevia uma proteção que ele não exercitava. Para exercitá-la de
 * verdade é preciso construir o único cenário em que ela importa — o tipo de FALLBACK
 * declarando `ownsMulti`. É o que o caso "typo" abaixo faz, sobrescrevendo o `text`.
 *
 * Isso não é hipótese de laboratório: `register()` sobrescreve com `console.warn`, não com
 * throw (é deliberado, pra hot reload), então qualquer consumidor pode re-registrar `text`.
 */

const textOriginal = columnTypeRegistry.get("text");

afterEach(() => {
  columnTypeRegistry.register(textOriginal);
});

describe("typeOwnsMulti — as três guardas", () => {
  it("guarda 1: sem filterType não há dono", () => {
    expect(typeOwnsMulti(undefined)).toBe(false);
    expect(typeOwnsMulti("")).toBe(false);
  });

  it("guarda 2: o próprio multiSelect não possui nada — ele É o destino da promoção", () => {
    expect(typeOwnsMulti("multiSelect")).toBe(false);
  });

  it("guarda 3: TYPO não herda o ownsMulti do tipo de fallback", () => {
    // O cenário que torna a guarda 3 load-bearing: o `text` — que é para onde o
    // registry manda todo tipo desconhecido — passa a declarar posse.
    columnTypeRegistry.register({
      ...textOriginal,
      ownsMulti: true,
    } as ColumnTypeDefinition);

    // Sanidade: o fallback agora DECLARA posse, então a 2ª metade da condição
    // sozinha diria `true`. É exatamente aqui que a guarda 3 trabalha.
    expect(columnTypeRegistry.get("meuTipoQueNaoExiste").ownsMulti).toBe(true);

    expect(typeOwnsMulti("meuTipoQueNaoExiste")).toBe(false);
  });

  it("posse é DECLARADA, não deduzida dos operadores", () => {
    // `badge` e `user` declaram isAnyOf para funcionar no builder avançado, mas o
    // widget de chip deles é um Select único. Deduzir posse da lista de operadores
    // foi o bug que a v0.69.0 teve.
    for (const id of ["badge", "user"]) {
      const def = columnTypeRegistry.get(id);
      expect(def.ownsMulti, id).toBeUndefined();
      expect(typeOwnsMulti(id), id).toBe(false);
    }
  });

  it("tipo que DECLARA ownsMulti é reconhecido", () => {
    const meu = {
      ...textOriginal,
      type: "meuMultiDeTeste",
      ownsMulti: true,
    } as ColumnTypeDefinition;
    columnTypeRegistry.register(meu);

    expect(typeOwnsMulti("meuMultiDeTeste")).toBe(true);
  });
});
