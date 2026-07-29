import { describe, expect, it } from "vitest";
import { DS_EXCEPTIONS, isException } from "./ds-exceptions.mjs";

/* Fonte única dos componentes deliberadamente fora do registry/showcase.
   Antes desta extração, distribution-debt.mjs tinha a lista e
   ds-inventory-check.sh não tinha nenhuma — já divergiam. */

describe("DS_EXCEPTIONS", () => {
  it("mantém as 8 exceções que já existiam no distribution-debt", () => {
    for (const name of [
      "tabela-teste",
      "table-toolbar",
      "conversation-list-item",
      "date-separator-chip",
      "message-ack",
      "message-bubble",
      "message-composer",
      "message-variables-picker",
    ]) {
      expect(isException(name), name).toBe(true);
    }
    expect(DS_EXCEPTIONS.size).toBe(8);
  });

  it("toda exceção carrega um motivo não-vazio — lista sem motivo apodrece", () => {
    for (const [name, motivo] of DS_EXCEPTIONS) {
      expect(motivo, name).toBeTruthy();
      expect(motivo.length, name).toBeGreaterThan(15);
    }
  });

  it("componente normal não é exceção", () => {
    expect(isException("button")).toBe(false);
    expect(isException("data-table")).toBe(false);
  });

  it("usa nome kebab, não PascalCase", () => {
    expect(isException("TabelaTeste")).toBe(false);
    expect(isException("tabela-teste")).toBe(true);
  });
});
