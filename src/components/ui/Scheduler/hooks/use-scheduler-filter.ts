import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  SchedulerEvent,
  SchedulerFilterField,
  SchedulerFilterMode,
  SchedulerFilterModel,
} from "../scheduler.types";

/**
 * Busca + filtros declarativos. O componente renderiza os chips **e aplica**
 * o filtro (modo `"client"`) — nunca um form solto acima da grade (L-051): o
 * chip clicável é o que deixa visível o que está filtrado e permite desfazer
 * sem procurar o controle que produziu o estado.
 *
 * Em `"server"` nada é filtrado localmente: o hook só emite
 * `onFilterModelChange`/`onSearchChange` e devolve `events` intacto. É o modo
 * correto pra dado paginado — filtrar no cliente uma página já recortada
 * mostraria "3 de 500" como se fossem todos.
 */

type UseSchedulerFilterParams = {
  events: SchedulerEvent[];
  searchable: boolean;
  search?: string;
  onSearchChange?: (search: string) => void;
  filterFields?: SchedulerFilterField[];
  filterModel?: SchedulerFilterModel;
  onFilterModelChange?: (model: SchedulerFilterModel) => void;
  filterMode: SchedulerFilterMode;
};

/**
 * Onde cada `fieldId` procura o valor no evento. `categoryId` é 1:1;
 * `tagIds` é N:1 e casa se QUALQUER tag do evento estiver selecionada; `color`
 * espelha a paleta.
 *
 * ⚠️ Um `fieldId` que não é nenhum dos três é **ignorado no filtro** — e isso
 * é deliberado, não omissão: o componente não sabe ler campo arbitrário de
 * `meta` (que é `unknown`). Quem precisa filtrar por campo próprio usa
 * `filterMode="server"` e filtra fora. Em DEV sai um `console.warn` nomeando
 * o campo, porque um filtro que renderiza chip e não filtra nada é o pior
 * silêncio possível.
 */
const KNOWN_FIELDS = new Set(["categoryId", "tagIds", "color"]);

function matchesField(
  event: SchedulerEvent,
  fieldId: string,
  values: string[],
): boolean {
  if (values.length === 0) return true;
  switch (fieldId) {
    case "categoryId":
      return event.categoryId !== undefined && values.includes(event.categoryId);
    case "tagIds":
      return (event.tagIds ?? []).some((tag) => values.includes(tag));
    case "color":
      return values.includes(event.color ?? "brand");
    default:
      // Campo desconhecido não filtra nada — ver nota acima.
      return true;
  }
}

/**
 * Casa o termo em `searchText` (quando existe), no `title` **só se ele for
 * string**, na `description` idem, e nos `tagIds`.
 *
 * `title` é `ReactNode`: varrer a árvore de elementos pra extrair texto é
 * caro e frágil, então não é feito. Um evento com título rico
 * (`<b>Reunião</b> — Cliente X`) só é encontrável se declarar `searchText` —
 * está documentado no type e no USAGE porque falha em silêncio.
 */
function matchesSearch(event: SchedulerEvent, term: string): boolean {
  if (term === "") return true;
  const haystack: string[] = [];

  if (event.searchText) haystack.push(event.searchText);
  if (typeof event.title === "string") haystack.push(event.title);
  if (typeof event.description === "string") haystack.push(event.description);
  if (event.tagIds?.length) haystack.push(...event.tagIds);

  return haystack.some((piece) => piece.toLowerCase().includes(term));
}

export function useSchedulerFilter({
  events,
  searchable,
  search: searchProp,
  onSearchChange,
  filterFields,
  filterModel: modelProp,
  onFilterModelChange,
  filterMode,
}: UseSchedulerFilterParams) {
  const isSearchControlled = searchProp !== undefined;
  const isModelControlled = modelProp !== undefined;

  const [searchState, setSearchState] = useState("");
  const [modelState, setModelState] = useState<SchedulerFilterModel>({});

  const search = isSearchControlled ? searchProp : searchState;
  const filterModel = isModelControlled ? modelProp : modelState;

  const warned = useRef(false);
  useEffect(() => {
    if (!import.meta.env?.DEV || warned.current) return;
    const unknown = (filterFields ?? [])
      .map((f) => f.id)
      .filter((id) => !KNOWN_FIELDS.has(id));
    if (unknown.length > 0 && filterMode === "client") {
      warned.current = true;
      console.warn(
        `[Scheduler] filterFields com id desconhecido: ${unknown.join(", ")}. ` +
          `No modo "client" o componente só filtra por "categoryId", "tagIds" e "color" — ` +
          `esses chips vão renderizar e não filtrar nada. Use filterMode="server" e filtre fora.`,
      );
    }
  }, [filterFields, filterMode]);

  const commitSearch = useCallback(
    (next: string) => {
      if (!isSearchControlled) setSearchState(next);
      onSearchChange?.(next);
    },
    [isSearchControlled, onSearchChange],
  );

  const commitModel = useCallback(
    (next: SchedulerFilterModel) => {
      if (!isModelControlled) setModelState(next);
      onFilterModelChange?.(next);
    },
    [isModelControlled, onFilterModelChange],
  );

  /** Liga/desliga uma opção de um campo. Campo que fica vazio SAI do model —
   *  `{ tagIds: [] }` e `{}` significam a mesma coisa, e manter a chave vazia
   *  faria o chip parecer aplicado. */
  const toggleValue = useCallback(
    (fieldId: string, value: string) => {
      const current = filterModel[fieldId] ?? [];
      const nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      const next: SchedulerFilterModel = { ...filterModel };
      if (nextValues.length === 0) {
        delete next[fieldId];
      } else {
        next[fieldId] = nextValues;
      }
      commitModel(next);
    },
    [commitModel, filterModel],
  );

  const clearField = useCallback(
    (fieldId: string) => {
      const next: SchedulerFilterModel = { ...filterModel };
      delete next[fieldId];
      commitModel(next);
    },
    [commitModel, filterModel],
  );

  const clearAll = useCallback(() => {
    commitModel({});
    commitSearch("");
  }, [commitModel, commitSearch]);

  const appliedCount = useMemo(
    () =>
      Object.values(filterModel).reduce(
        (total, values) => total + values.length,
        0,
      ),
    [filterModel],
  );

  const filteredEvents = useMemo(() => {
    if (filterMode === "server") return events;

    const term = searchable ? search.trim().toLowerCase() : "";
    const activeFields = Object.entries(filterModel).filter(
      ([, values]) => values.length > 0,
    );

    if (term === "" && activeFields.length === 0) return events;

    return events.filter((event) => {
      if (!matchesSearch(event, term)) return false;
      // AND entre campos, OR dentro do campo — a convenção que o
      // `TableToolbar` já usa, e a que o usuário espera ao empilhar chips.
      return activeFields.every(([fieldId, values]) =>
        matchesField(event, fieldId, values),
      );
    });
  }, [events, filterMode, filterModel, search, searchable]);

  return {
    search,
    setSearch: commitSearch,
    filterModel,
    toggleValue,
    clearField,
    clearAll,
    appliedCount,
    filteredEvents,
  };
}
