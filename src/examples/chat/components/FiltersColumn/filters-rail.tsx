import { cn } from "@/lib/utils";
import { FILTER_GROUPS } from "../../chat-v2-mocks";
import { RailItem } from "../RailItem";
import { filtersColumnStyles } from "./filters-column.styles";
import type { FiltersColumnProps } from "./filters-column.types";

/**
 * Coluna esquerda compacta (64px) — só ícones, divididos por grupo
 * com divider top entre grupos. Consome `FILTER_GROUPS` (mocks).
 */
export function FiltersRail({
  filters,
  onToggleFilter,
  className,
}: FiltersColumnProps) {
  const s = filtersColumnStyles();
  return (
    <aside aria-label="Filtros (compactos)" className={cn(s.rail(), className)}>
      <div className={s.railScroll()}>
        {FILTER_GROUPS.map(({ group, items }, gi) => (
          <div
            key={group}
            className={cn(s.railGroup(), gi > 0 && s.railGroupDivider())}
          >
            {items.map((item) => (
              <RailItem
                key={item.id}
                item={item}
                isActive={filters[group].has(item.id)}
                onClick={() => onToggleFilter(group, item.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
