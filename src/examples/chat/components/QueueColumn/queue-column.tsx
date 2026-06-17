import { useMemo } from "react";
import { Menu as MenuIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/button";
import { Chip, ChipGroup, ChipGroupItem } from "@/components/ui/Chip";
import { Input } from "@/components/shadcn/input";
import { CONVERSATIONS } from "../../chat-v2-mocks";
import type { QueueFilter } from "../../chat-v2.types";
import { ConversationListItem } from "../ConversationListItem";
import { queueColumnStyles } from "./queue-column.styles";
import type { QueueColumnProps } from "./queue-column.types";

/**
 * Coluna da fila de conversas (340px). Header com toggle de filtros + título +
 * badge de contagem; Search + chips Todas/Não lidas/Lidas; lista scrollável.
 */
export function QueueColumn({
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  queueFilter,
  onQueueFilterChange,
  filtersCollapsed,
  onToggleFilters,
  className,
}: QueueColumnProps) {
  const s = queueColumnStyles();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const bySearch = q
      ? CONVERSATIONS.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.last.toLowerCase().includes(q),
        )
      : CONVERSATIONS;
    if (queueFilter === "unread") return bySearch.filter((c) => c.unread > 0);
    if (queueFilter === "read") return bySearch.filter((c) => c.unread === 0);
    return bySearch;
  }, [searchQuery, queueFilter]);

  const counts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const bySearch = q
      ? CONVERSATIONS.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.last.toLowerCase().includes(q),
        )
      : CONVERSATIONS;
    return {
      all: bySearch.length,
      unread: bySearch.filter((c) => c.unread > 0).length,
      read: bySearch.filter((c) => c.unread === 0).length,
    };
  }, [searchQuery]);

  return (
    <aside aria-label="Fila de conversas" className={cn(s.root(), className)}>
      <header className={s.header()}>
        <Button
          color="secondary"
          variant="ghost"
          size="icon-sm"
          onClick={onToggleFilters}
          aria-label={filtersCollapsed ? "Expandir filtros" : "Colapsar filtros"}
          aria-pressed={!filtersCollapsed}
        >
          <MenuIcon />
        </Button>
        <h2 className={s.title()}>Conversas</h2>
        <Chip color="primary" variant="soft" size="sm" shape="rounded">
          {filtered.length}
        </Chip>
      </header>

      <div className={s.searchWrap()}>
        <div className={s.searchInner()}>
          <Search size={14} strokeWidth={1.8} className={s.searchIcon()} />
          <Input
            type="text"
            placeholder="Buscar conversa, ID ou nome..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={s.searchInput()}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className={s.searchClear()}
              aria-label="Limpar busca"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className={s.chipsWrap()}>
        <ChipGroup
          type="single"
          value={queueFilter}
          onValueChange={(v) => onQueueFilterChange((v || "all") as QueueFilter)}
          size="md"
          ariaLabel="Filtrar conversas"
        >
          <ChipGroupItem value="all">
            Todas{counts.all > 0 && ` (${counts.all})`}
          </ChipGroupItem>
          <ChipGroupItem value="unread">
            Não lidas{counts.unread > 0 && ` (${counts.unread})`}
          </ChipGroupItem>
          <ChipGroupItem value="read">
            Lidas{counts.read > 0 && ` (${counts.read})`}
          </ChipGroupItem>
        </ChipGroup>
      </div>

      <div className={s.list()}>
        {filtered.length === 0 ? (
          <div className={s.empty()}>Nenhuma conversa encontrada.</div>
        ) : (
          filtered.map((c) => (
            <ConversationListItem
              key={c.id}
              conv={c}
              isActive={c.id === activeId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}
