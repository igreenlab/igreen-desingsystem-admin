/**
 * Helpers compartilhados de operação de filtro — fonte ÚNICA da escrita no
 * FilterModel. Antes essa lógica estava duplicada em 4 lugares (2× no
 * use-filter-popover-adapter, 1× no controller, 1× no simple-filter-drawer),
 * com comportamentos sutilmente divergentes (o drawer só promovia equals→isAnyOf,
 * o controller promovia sem checar array, os adapters checavam array). Aqui há
 * um único contrato.
 */
import type {
  DataTableColumnDef,
  FilterOperator,
} from "../data-table.types";
import { columnTypeRegistry } from "../column-types";

/**
 * Operadores que carregam MÚLTIPLOS valores numa condição (chip+popover) —
 * multiSelect/tags. O FilterModel guarda 1 item por valor (spread).
 */
export const MULTI_VALUE_OPERATORS = new Set<FilterOperator>([
  "isAnyOf",
  "isNoneOf",
]);

/**
 * Operadores que se bastam SEM valor — o widget não tem o que editar.
 *
 * `renderFilterInput` de `text`, `select` e `multiSelect` já testa exatamente este par
 * pra devolver "(sem valor)" em vez de um campo. A constante existe pra quem precisa
 * saber disso de FORA do widget — hoje o `ToolbarSimpleFilterDrawer`, que oferece a
 * saída por campo justamente na linha que não tem `onChange`.
 *
 * É o **fallback dos built-in**, não a lista fechada: um tipo registrado declara o
 * operador sem valor DELE em `ColumnTypeOperator.noValue`, e o drawer soma os dois
 * sinais. (Esse campo era inerte até 2026-11-03 — exportado, declarado por ninguém e
 * lido por nada; foi ligado em vez de removido por ser API pública. L-061.)
 */
export const NO_VALUE_OPERATORS = new Set<FilterOperator>([
  "isEmpty",
  "isNotEmpty",
]);

/** ID estável pra um FilterItem — `crypto.randomUUID()` com fallback timestamp. */
export function genFilterId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * True quando um `FilterValue` é "vazio" (sem efeito) — null/undefined, string
 * vazia, ou tupla/array com todos os sides nulos/strings vazias.
 *
 * ⚠️ Checa só o VALUE. Pra saber se um FilterItem está ATIVO (operadores
 * `isEmpty`/`isNotEmpty` são ativos sem valor), use a lógica do processor.
 */
export function filterValueIsEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.length === 0;
  if (Array.isArray(v)) {
    return v.every(
      (x) => x == null || (typeof x === "string" && x.length === 0),
    );
  }
  return false;
}

/**
 * Promove operador escalar → multi quando a coluna é `filterType: "multiSelect"`.
 *
 * Invariante: coluna multiSelect SEMPRE usa `isAnyOf`/`isNoneOf` (o widget
 * MultiSelectFieldDropdown sempre togglea com array). Sem isso, presets
 * declarados como `{ field, value }` (operator default `equals`) ou shortcuts
 * de header ficam com operator escalar inconsistente — chip mostra
 * "Status = active, pending" em vez de "é um de", e o filterModel cria N items
 * separados em vez de 1 grupo.
 *
 * - `equals` → `isAnyOf`
 * - `neq`    → `isNoneOf`
 * - demais operadores / colunas não-multiSelect → inalterados
 */
export function promoteOperatorForFilterType(
  operator: FilterOperator,
  filterType: string | undefined,
): FilterOperator {
  if (filterType !== "multiSelect") return operator;
  if (operator === "equals") return "isAnyOf";
  if (operator === "neq") return "isNoneOf";
  return operator;
}

/** Conveniência: mesma promoção a partir de uma `DataTableColumnDef`. */
export function promoteOperatorForColumn<T>(
  operator: FilterOperator,
  col: DataTableColumnDef<T> | undefined,
): FilterOperator {
  return promoteOperatorForFilterType(operator, col?.filterType);
}

/**
 * Operador default de um tipo de filtro — derivado do REGISTRY (`operators[0]`),
 * fonte única. Sem switch hardcoded: um column-type novo já traz seu default
 * correto (ex: currency → equals, date → between, multiSelect → isAnyOf), e
 * nunca cai num `"contains"` que o tipo não suporta.
 */
export function defaultOperatorForFilterType(
  filterType: string | undefined,
): FilterOperator {
  const def = columnTypeRegistry.get(filterType ?? "text");
  return (def.operators?.[0]?.id as FilterOperator) ?? "contains";
}

/**
 * O tipo declarado em `filterType` é DONO do chip multi?
 *
 * Quando `true`, a promoção interna pro widget `multiSelect` built-in NÃO acontece:
 * o chip multi (operador `isAnyOf`/`isNoneOf`, ou 2+ valores acumulados) fica com o
 * `renderFastFilterInput` do próprio tipo, e o `value` chega SEMPRE como array. É o que
 * permite o consumidor substituir o popover multi inteiro (colar lista, clique-substitui…)
 * registrando um tipo, em vez de cada comportamento virar PR no DS.
 *
 * As três guardas, cada uma com motivo medido:
 *
 * 1. **`filterType` presente** — sem tipo declarado não há dono; o caminho é o built-in.
 * 2. **`!== "multiSelect"`** — o próprio built-in não "possui" nada: ele É o destino da
 *    promoção, e tratá-lo como dono só criaria um ramo equivalente mais caro.
 * 3. **`typeDef.type === filterType`** — o registry devolve `text` pra tipo desconhecido,
 *    então sem essa comparação um TYPO no `filterType` herdaria o `ownsMulti` de quem o
 *    registry devolveu por fallback. ⚠️ Hoje isso só MORDE se o próprio tipo de fallback
 *    declarar o flag — o `text` de fábrica não declara, e por isso a guarda 2ª metade
 *    bastava sozinha e a nº 3 ficou sem teste que a matasse até 2026-11-03. É
 *    defesa-em-profundidade real, não teatro: `register()` sobrescreve built-in com
 *    `console.warn`, não com throw, então um consumidor PODE re-registrar `text`. O caso
 *    está construído em `filter-ops-owns-multi.test.ts` — mutação na guarda reprova 1.
 *
 * ⚠️ A posse é DECLARADA, nunca deduzida da lista de operadores. A versão anterior inferia
 * posse de "declara isAnyOf/isNoneOf", e isso pegava `badge` e `user`: os dois declaram o
 * operador pra funcionar no builder avançado, mas o widget de chip deles é um `<Select>`
 * ÚNICO que chama `onChange` com string — o resultado era escolha única sobre campo de
 * array, e escolher um valor substituía a lista inteira.
 *
 * ⚠️ **Fonte única de propósito.** Esta regra é lida pelo chip do `DataTable`
 * (`data-table.tsx`) e pelo chip do `DataList` (`data-list-toolbar.tsx`), que renderizam
 * também o MESMO drawer compartilhado. Enquanto cada um tinha a sua cópia, o `DataList`
 * forçava `multiSelect` e o funil e o chip do mesmo componente mostravam widgets
 * diferentes a um clique de distância. Não reintroduza a condição inline.
 */
export function typeOwnsMulti(filterType: string | undefined): boolean {
  if (!filterType || filterType === "multiSelect") return false;
  const typeDef = columnTypeRegistry.get(filterType);
  return typeDef.type === filterType && typeDef.ownsMulti === true;
}
