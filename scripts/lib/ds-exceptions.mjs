/**
 * ds-exceptions — FONTE ÚNICA dos componentes de `src/components/ui/` que
 * deliberadamente NÃO vão pro registry nem pro showcase.
 *
 * Consumido por (nunca duplique a lista):
 *   - scripts/distribution-debt.mjs   → não cobra registry/catálogo
 *   - scripts/showcase-check.mjs      → não cobra Doc page nem rota
 *
 * Antes desta extração, `distribution-debt.mjs` tinha a lista e
 * `ds-inventory-check.sh` não tinha nenhuma — já divergiam sobre o que é
 * exceção deliberada. É o mesmo defeito que a fonte única de patterns resolveu.
 *
 * Chave = nome kebab (DataList → data-list). Valor = MOTIVO, obrigatório:
 * lista de exceção sem motivo apodrece, porque ninguém sabe se ainda vale.
 */

export const DS_EXCEPTIONS = new Map([
  ["tabela-teste", "página de teste interna — não é componente distribuível"],
  [
    "table-toolbar",
    "bundlado no item `data-table` do registry (acoplamento circular); chega no consumidor via igreen:add data-table",
  ],
  // Internos do example-chat — distribuídos junto do exemplo, não como itens
  // avulsos, e sem showcase próprio.
  ["conversation-list-item", "interno do example-chat — distribuído junto do exemplo"],
  ["date-separator-chip", "interno do example-chat — distribuído junto do exemplo"],
  ["message-ack", "interno do example-chat — distribuído junto do exemplo"],
  ["message-bubble", "interno do example-chat — distribuído junto do exemplo"],
  ["message-composer", "interno do example-chat — distribuído junto do exemplo"],
  ["message-variables-picker", "interno do example-chat — distribuído junto do exemplo"],
]);

/** @param {string} kebabName nome do componente em kebab-case */
export function isException(kebabName) {
  return DS_EXCEPTIONS.has(kebabName);
}
