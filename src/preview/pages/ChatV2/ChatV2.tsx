import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { AppShell } from "@/components/ui/AppShell";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
} from "../../mocks/app-shell-mocks";
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

export default function ChatV2() {
  const s = chatV2Styles();

  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
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
    // Mantém storageKey diferente da ChatShowcase pra não conflitar valores entre as 2 páginas.
    storageKey: "chat-v2.detailsWidth",
  });

  const activeConversation =
    CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0];
  const activeDetail =
    CONVERSATION_DETAILS[activeConversation.id] ?? DEFAULT_DETAIL;

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#chat-v2"
      breadcrumb={[{ label: "Atendimentos" }]}
      commandGroups={APP_SHELL_COMMANDS}
      notifications={{
        items: APP_SHELL_NOTIFICATIONS,
        onMarkAllRead: () => alert("Marcar todas como lidas"),
        onMoreActions: () => alert("Mais ações"),
        onViewAll: () => alert("Ver todas"),
      }}
      messages={{
        items: APP_SHELL_MESSAGES,
        onNewMessage: () => alert("Nova mensagem"),
        onExpand: () => alert("Expandir"),
        onViewAll: () => alert("Ver todas"),
      }}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={APP_SHELL_THEME_OPTIONS}
      mobileEdgeToEdge
    >
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
    </AppShell>
  );
}
