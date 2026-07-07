import type { QueueFilter } from "../../chat-v2.types";

export type QueueColumnProps = {
  activeId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  queueFilter: QueueFilter;
  onQueueFilterChange: (f: QueueFilter) => void;
  filtersCollapsed: boolean;
  onToggleFilters: () => void;
  className?: string;
};
