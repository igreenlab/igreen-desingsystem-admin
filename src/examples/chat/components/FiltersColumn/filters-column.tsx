import { cn } from "@/lib/utils";
import { FILTER_GROUPS } from "../../chat-v2-mocks";
import type { FilterGroupKey, FilterItem } from "../../chat-v2.types";
import { FilterRow } from "../FilterRow";
import { filtersColumnStyles } from "./filters-column.styles";
import type { FiltersColumnProps, FiltersState } from "./filters-column.types";

/**
 * Coluna esquerda expandida (280px) com as 4 seções de filtros definidas
 * em `FILTER_GROUPS` (mocks).
 */
export function FiltersColumn({
  filters,
  onToggleFilter,
  className,
}: FiltersColumnProps) {
  const s = filtersColumnStyles();
  return (
    <aside aria-label="Filtros" className={cn(s.root(), className)}>
      <div className={s.scroll()}>
        {FILTER_GROUPS.map((sec, i) => (
          <FilterSection
            key={sec.group}
            title={sec.title}
            group={sec.group}
            items={sec.items}
            filters={filters}
            onToggle={onToggleFilter}
            isFirst={i === 0}
          />
        ))}
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  group,
  items,
  filters,
  onToggle,
  isFirst,
}: {
  title: string;
  group: FilterGroupKey;
  items: FilterItem[];
  filters: FiltersState;
  onToggle: (group: FilterGroupKey, id: string) => void;
  isFirst?: boolean;
}) {
  const s = filtersColumnStyles();
  return (
    <section className={cn(s.section(), !isFirst && s.sectionDivider())}>
      <div className={s.sectionTitle()}>{title}</div>
      {items.map((item) => (
        <FilterRow
          key={item.id}
          item={item}
          isActive={filters[group].has(item.id)}
          onClick={() => onToggle(group, item.id)}
        />
      ))}
    </section>
  );
}
