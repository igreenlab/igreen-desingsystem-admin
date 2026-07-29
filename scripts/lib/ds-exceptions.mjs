/**
 * ds-exceptions — FONTE ÚNICA dos componentes de `src/components/ui/` que
 * deliberadamente NÃO vão pro registry nem pro showcase.
 *
 * Consumido pelos TRÊS (nunca duplique a lista):
 *   - scripts/distribution-debt.mjs         → não cobra registry/catálogo
 *   - scripts/lib/showcase-registration.mjs → não cobra Doc page nem rota
 *     (e por tabela, o CLI `scripts/showcase-check.mjs`, que usa o módulo)
 *   - .claude/hooks/ds-inventory-check.sh   → não avisa registry (via `node -e`)
 *
 * Antes desta extração, `distribution-debt.mjs` tinha a lista e
 * `ds-inventory-check.sh` tinha um `TabelaTeste` hardcoded — já divergiam sobre o
 * que é exceção deliberada (editar interno do example-chat avisava "não será
 * distribuído" com a exceção declarada aqui). É o mesmo defeito que a fonte única
 * de patterns resolveu, e por isso o hook virou o terceiro consumidor.
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
