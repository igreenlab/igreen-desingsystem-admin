import type { FilterItem } from "../../chat-v2.types";
import { filterRowStyles } from "./filter-row.styles";

export type FilterRowProps = {
  item: FilterItem;
  isActive: boolean;
  onClick: () => void;
};

/**
 * Row clicável da `FiltersColumn` expandida. Layout: leading (icon ou dot) +
 * label (ellipsis) + dot unread opcional + count tabular.
 */
export function FilterRow({ item, isActive, onClick }: FilterRowProps) {
  const Icon = item.icon;
  const s = filterRowStyles({ isActive });

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={s.button()}
    >
      <span className={s.leading()}>
        {Icon ? (
          <Icon
            size={15}
            strokeWidth={1.8}
            style={{ color: item.color ?? "var(--color-fg-muted)" }}
          />
        ) : (
          <span
            className={s.fallbackDot()}
            style={{ background: item.color ?? "var(--color-fg-muted)" }}
            aria-hidden
          />
        )}
      </span>
      <span className={s.label()}>{item.name}</span>
      {item.hasUnread && <span className={s.unreadDot()} aria-label="tem novidades" />}
      <span className={s.count()}>{item.count}</span>
    </button>
  );
}
