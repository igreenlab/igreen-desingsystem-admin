import type { FilterGroupKey } from "../../chat-v2.types";

/**
 * Estado dos filtros — um Set de IDs por grupo. Centralizado no parent
 * (`ChatV2`) e passado pra baixo.
 */
export type FiltersState = Record<FilterGroupKey, Set<string>>;

export type FiltersColumnProps = {
  filters: FiltersState;
  onToggleFilter: (group: FilterGroupKey, id: string) => void;
  className?: string;
};
