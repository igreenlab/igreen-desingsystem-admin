import { useState } from "react";
import { cn } from "@/lib/utils";
import { chatV2Styles, mobileOverlay } from "./chat-v2.styles";
import { CONVERSATIONS, CONVERSATION_DETAILS, DEFAULT_DETAIL } from "./chat-v2-mocks";
import type { FilterGroupKey, QueueFilter } from "./chat-v2.types";
import { useResizable } from "./hooks/use-resizable";
import { ConversationColumn } from "./components/ConversationColumn";
import { DetailsColumn, type SectionsState } from "./components/DetailsColumn";
import { FiltersColumn, FiltersRail, type FiltersState } from "./components/FiltersColumn";
import { QueueColumn } from "./components/QueueColumn";

/** Em mobile (<md) só uma view fica visível por vez. */
type MobileView = "list" | "chat" | "details";

export function ChatScreen() {
  const s = chatV2Styles();

  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setMobileView("chat");
  };

  // Toggle de detalhes:
  // - Desktop: alterna o painel lateral (detailsOpen).
  // - Mobile (<md): navega entre "chat" ↔ "details" SEM fechar o painel.
  const handleToggleDetails = () => {
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      setDetailsOpen(true);
      setMobileView((v) => (v === "details" ? "chat" : "details"));
    } else {
      setDetailsOpen((o) => !o);
    }
  };

  // Filtros multi-seleção (Set por grupo)
  const [filters, setFilters] = useState<FiltersState>({
    status: new Set(["open"]),
    channels: new Set(),
    categories: new Set(),
    innerStatus: new Set(),
  });
  const toggleFilter = (group: FilterGroupKey, id: string) => {
    setFilters((prev) => {
      const next = new Set(prev[group]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [group]: next };
    });
  };

  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [openSections, setOpenSections] = useState<SectionsState>({
    contact: true,
    ticket: true,
    history: true,
  });
  const toggleSection = (id: keyof SectionsState) =>
    setOpenSections((m) => ({ ...m, [id]: !m[id] }));

  const detailsResize = useResizable({
    initial: 360,
    min: 280,
    max: 520,
    storageKey: "chat-screen.detailsWidth",
  });

  const activeConversation =
    CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0];
  const activeDetail =
    CONVERSATION_DETAILS[activeConversation.id] ?? DEFAULT_DETAIL;

  return (
    // Conteúdo da página (sem shell). Embrulhe no seu AppShell/layout — o
    // parent precisa dar altura (h-full/flex) pra a tela de chat preencher.
    <div className="flex flex-col h-full min-h-0">
      {/* Body — desktop: 4 colunas lado a lado.
         Mobile (<md): só uma view visível por vez, fullscreen, controlada por
         `mobileView` (list → chat → details). Simula navegação de app. */}
      <div className={s.root()}>
        {/* Filters: escondido em mobile. `md:contents` mantém a coluna no flex parent. */}
        <div className={s.filtersWrap()}>
          {filtersCollapsed ? (
            <FiltersRail filters={filters} onToggleFilter={toggleFilter} />
          ) : (
            <FiltersColumn filters={filters} onToggleFilter={toggleFilter} />
          )}
        </div>

        <QueueColumn
          activeId={activeId}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          queueFilter={queueFilter}
          onQueueFilterChange={setQueueFilter}
          filtersCollapsed={filtersCollapsed}
          onToggleFilters={() => setFiltersCollapsed((c) => !c)}
          className={cn(
            mobileView === "list"
              ? `${mobileOverlay.active} max-md:z-[1]`
              : mobileOverlay.hidden,
          )}
        />

        <ConversationColumn
          conversation={activeConversation}
          detailsOpen={detailsOpen}
          onToggleDetails={handleToggleDetails}
          onBackToList={() => setMobileView("list")}
          className={cn(
            mobileView === "chat"
              ? `${mobileOverlay.active} max-md:z-[2]`
              : mobileOverlay.hidden,
          )}
        />

        {detailsOpen && (
          <DetailsColumn
            conversation={activeConversation}
            detail={activeDetail}
            openSections={openSections}
            onToggleSection={toggleSection}
            onClose={() => {
              setDetailsOpen(false);
              setMobileView("chat");
            }}
            onBackToChat={() => setMobileView("chat")}
            width={detailsResize.width}
            onResizeStart={detailsResize.onResizeStart}
            className={cn(
              mobileView === "details"
                ? `${mobileOverlay.active} max-md:!w-full max-md:z-[3]`
                : mobileOverlay.hidden,
            )}
          />
        )}
      </div>
    </div>
  );
}

export default ChatScreen;
