import type { FilterItem } from "../../chat-v2.types";
import { railItemStyles } from "./rail-item.styles";

export type RailItemProps = {
  item: FilterItem;
  isActive: boolean;
  onClick: () => void;
};

/**
 * Botão ícone compacto (32px) usado na `FiltersRail`. Suporta cor por
 * `item.color`, ícone Lucide ou fallback dot, e badge "tem novidades".
 */
export function RailItem({ item, isActive, onClick }: RailItemProps) {
  const Icon = item.icon;
  const s = railItemStyles({ isActive });

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      title={`${item.name} (${item.count})`}
      className={s.button()}
    >
      {Icon ? (
        <Icon
          size={16}
          strokeWidth={1.8}
          style={{ color: item.color ?? "currentColor" }}
        />
      ) : (
        <span
          className={s.fallbackDot()}
          style={{ background: item.color ?? "var(--color-fg-muted)" }}
          aria-hidden
        />
      )}
      {item.hasUnread && <span className={s.unreadDot()} aria-label="tem novidades" />}
    </button>
  );
}
