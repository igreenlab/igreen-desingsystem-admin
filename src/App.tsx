import { useState, useRef, useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { AgentsPreview } from "./preview/pages/AgentsPreview";
import { ComponentDocTemplate } from "./preview/pages/ComponentDocTemplate";
import { DemoComparison } from "./preview/pages/DemoComparison";
import { ShowcasePageV2 } from "./preview/pages/ShowcasePageV2";
import { ComponentsPreview } from "./preview/pages/ComponentsPreview";
import { ButtonDoc } from "./preview/pages/ButtonDoc";
import { BadgeDoc } from "./preview/pages/BadgeDoc";
import { ChipDoc } from "./preview/pages/ChipDoc";
import { InputDoc } from "./preview/pages/InputDoc";
import { InputGroupDoc } from "./preview/pages/InputGroupDoc";
import { SelectDoc } from "./preview/pages/SelectDoc";
import { TabsDoc } from "./preview/pages/TabsDoc";
import { CardDoc } from "./preview/pages/CardDoc";
import { SwitchDoc } from "./preview/pages/SwitchDoc";
import { CheckboxDoc } from "./preview/pages/CheckboxDoc";
import { RadioGroupDoc } from "./preview/pages/RadioGroupDoc";
import { SliderDoc } from "./preview/pages/SliderDoc";
import { ProgressDoc } from "./preview/pages/ProgressDoc";
import { PaginationDoc } from "./preview/pages/PaginationDoc";
import { FooterTableDoc } from "./preview/pages/FooterTableDoc";
import { TableToolbarDoc } from "./preview/pages/TableToolbarDoc";
import TableDoc from "./preview/pages/TableDoc";
import DataTableDoc from "./preview/pages/DataTableDoc";
import { TabelaTesteDoc } from "./preview/pages/TabelaTesteDoc";
import { KanbanDoc } from "./preview/pages/KanbanDoc";
import { ModalDoc } from "./preview/pages/ModalDoc";
import ClientsCRUDPreview from "./preview/pages/ClientsCRUDPreview";
import ClientsCRUDServerPreview from "./preview/pages/ClientsCRUDServerPreview";
import ClientsVirtualizedPreview from "./preview/pages/ClientsVirtualizedPreview";
import ClientsGroupedPreview from "./preview/pages/ClientsGroupedPreview";
import ClientsExpandablePreview from "./preview/pages/ClientsExpandablePreview";
import ClientsTypedPreview from "./preview/pages/ClientsTypedPreview";
import ClientsKanbanPreview from "./preview/pages/ClientsKanbanPreview";
import { AccordionDoc } from "./preview/pages/AccordionDoc";
import { AlertDoc } from "./preview/pages/AlertDoc";
import { AlertModalDoc } from "./preview/pages/AlertModalDoc";
import { DialogDoc } from "./preview/pages/DialogDoc";
import { DropdownMenuDoc } from "./preview/pages/DropdownMenuDoc";
import { AvatarDoc } from "./preview/pages/AvatarDoc";
import { BreadcrumbDoc } from "./preview/pages/BreadcrumbDoc";
import { CalendarDoc } from "./preview/pages/CalendarDoc";
import { CommandDoc } from "./preview/pages/CommandDoc";
import { PanelDoc } from "./preview/pages/PanelDoc";
import { FloatingPanelDoc } from "./preview/pages/FloatingPanelDoc";
import { TextareaDoc } from "./preview/pages/TextareaDoc";
import { FormFieldDoc } from "./preview/pages/FormFieldDoc";
import { LabelDoc } from "./preview/pages/LabelDoc";
import { SeparatorDoc } from "./preview/pages/SeparatorDoc";
import { MenuSidebarDoc } from "./preview/pages/MenuSidebarDoc";
import { HeaderDoc } from "./preview/pages/HeaderDoc";
import { AppShellDoc } from "./preview/pages/AppShellDoc";
import { PageHeaderDoc } from "./preview/pages/PageHeaderDoc";
import ClientesShowcase from "./preview/pages/ClientesShowcase";
import ChatV2 from "./preview/pages/ChatV2";
import DashboardShowcase from "./preview/pages/DashboardShowcase";
import { ColorsDoc } from "./preview/pages/ColorsDoc";
import { TokensOverviewDoc } from "./preview/pages/TokensOverviewDoc";
import { TypographyDoc } from "./preview/pages/TypographyDoc";
import { SpacingDoc } from "./preview/pages/SpacingDoc";
import { ElevationDoc } from "./preview/pages/ElevationDoc";
import { SizingDoc } from "./preview/pages/SizingDoc";
import { ShapeDoc } from "./preview/pages/ShapeDoc";
import { IntroductionDoc } from "./preview/pages/IntroductionDoc";
import { StructureDoc } from "./preview/pages/StructureDoc";
import { TransformTokensDoc } from "./preview/pages/TransformTokensDoc";
import { InstallationDoc } from "./preview/pages/InstallationDoc";
import { UpdatesDoc } from "./preview/pages/UpdatesDoc";
import { PipelineSkillsDoc } from "./preview/pages/PipelineSkillsDoc";
import { PipelineCommandsDoc } from "./preview/pages/PipelineCommandsDoc";
import { PipelineHooksDoc } from "./preview/pages/PipelineHooksDoc";
import { PipelineOutputStylesDoc } from "./preview/pages/PipelineOutputStylesDoc";
import { PipelineMcpDoc } from "./preview/pages/PipelineMcpDoc";
import { PipelineMemoryDoc } from "./preview/pages/PipelineMemoryDoc";
import { AgentsOverviewDoc } from "./preview/pages/AgentsOverviewDoc";
import { AgentOrchestratorDoc } from "./preview/pages/AgentOrchestratorDoc";
import { AgentDesignerDoc } from "./preview/pages/AgentDesignerDoc";
import { IconsDoc } from "./preview/pages/IconsDoc";
import { AgentDevDoc } from "./preview/pages/AgentDevDoc";
import { AgentReviewerDoc } from "./preview/pages/AgentReviewerDoc";
import { DocNavProvider, DocSidebar, getDocNavByHref } from "./preview/components";
import { Zap, Download, Bot, Palette, Type, Layers, Box, LayoutGrid, ChevronDown } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar Navigation Structure
   ═══════════════════════════════════════════════════════════════════════════ */

type NavSection = {
  title: string;
  defaultOpen?: boolean;
  items: { id: string; label: string; icon?: React.ComponentType<{ className?: string }>; badge?: string }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Getting Started",
    defaultOpen: true,
    items: [
      { id: "introduction", label: "Introduction", icon: Zap },
      { id: "structure", label: "Structure", icon: Layers },
      { id: "installation", label: "Installation", icon: Download },
      { id: "transform-tokens", label: "Transform Tokens", icon: Box },
    ],
  },
  {
    title: "Agents",
    items: [
      { id: "agents-overview", label: "Overview", icon: Bot },
      { id: "agent-orchestrator", label: "Orchestrator", icon: Bot },
      { id: "agents", label: "Pipeline Simulator", icon: Bot },
    ],
  },
  {
    title: "Foundations",
    items: [
      { id: "colors", label: "Colors", icon: Palette },
      { id: "typography", label: "Typography", icon: Type },
      { id: "spacing", label: "Spacing" },
      { id: "sizing", label: "Sizing" },
      { id: "shape", label: "Shape & Radius" },
      { id: "elevation", label: "Elevation" },
    ],
  },
  {
    title: "Previews",
    defaultOpen: true,
    items: [
      { id: "components", label: "All Components", icon: LayoutGrid },
      { id: "showcase", label: "Showcase", icon: LayoutGrid },
      { id: "demo", label: "Comparison", icon: LayoutGrid },
    ],
  },
];

// Collect all valid page IDs
const ALL_PAGE_IDS = NAV_SECTIONS.flatMap(s => s.items.map(i => i.id));
type PageId = string;

/* ═══════════════════════════════════════════════════════════════════════════
   Collapsible Section
   ═══════════════════════════════════════════════════════════════════════════ */

function SidebarSection({
  section,
  activePage,
  onSelect,
}: {
  section: NavSection;
  activePage: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-2 py-2 text-body-xs text-fg-default uppercase tracking-wider hover:text-fg-default transition-colors"
      >
        {section.title}
        <ChevronDown className={`size-3 text-fg-subtle transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="flex flex-col">
          {section.items.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={[
                  "flex items-center gap-gp-md w-full px-pad-xl py-pad-md rounded-radius-md text-body-md transition-all text-left",
                  isActive
                    ? "bg-bg-surface text-fg-brand font-semibold shadow-sh-sm dark:bg-bg-sidebar-accent dark:shadow-sh-none"
                    : "text-fg-muted hover:text-fg-default hover:bg-bg-sidebar-accent",
                ].join(" ")}
              >
                {item.icon && <item.icon className="size-4 shrink-0" />}
                {!item.icon && <span className="w-4" />}
                {item.label}
                {item.badge && (
                  <span className={`ml-auto text-caption-sm font-medium ${item.badge === "PRO" ? "text-fg-danger" : "text-fg-subtle"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <div className="border-b border-dashed border-border-subtle my-sp-md mx-2" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   App
   ═══════════════════════════════════════════════════════════════════════════ */

export function App() {
  const { isDark, toggle } = useTheme();
  const theme = isDark ? "dark" : "light";
  const [activePage, setActivePage] = useState<PageId>("button");

  // Doc pages têm seu próprio sidebar (DocSidebar) — renderizam full width
  const DOC_PAGES = [
    "button", "badge", "chip", "input", "tabs", "card", "docs", "docs-template",
    "introduction", "structure", "installation", "transform-tokens", "updates",
    "agents", "agents-overview", "agent-orchestrator", "agent-designer", "agent-dev", "agent-reviewer",
    "pipeline-skills", "pipeline-commands", "pipeline-hooks", "pipeline-output-styles", "pipeline-mcp", "pipeline-memory",
    "tokens-overview", "colors", "typography", "spacing", "shape", "elevation", "sizing", "icons",
    "switch", "checkbox", "radio-group", "slider", "progress",
    "accordion", "alert", "dialog", "dropdown-menu",
    "avatar", "breadcrumb", "calendar", "command", "panel", "floating-panel", "textarea", "label", "separator", "select", "menu-sidebar", "header", "app-shell", "page-header", "form-field", "input-group", "alert-modal", "modal", "pagination", "footer-table", "table-toolbar", "table", "data-table", "tabela-teste", "kanban", "clients-crud", "clients-crud-server", "clients-virtualized", "clients-grouped", "clients-expandable", "clients-typed", "clients-kanban", "clientes-showcase", "chat-v2", "dashboard-showcase", "showcase-v2",
  ];
  const isDocPage = DOC_PAGES.includes(activePage);

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [activePage]);

  if (isDocPage) {
    return (
      <DocNavProvider onNavigate={setActivePage}>
      <div className="flex h-screen overflow-hidden">
        <DocSidebar sections={getDocNavByHref(activePage)} onNavigate={setActivePage} theme={theme} onToggleTheme={toggle} />
        <main ref={contentRef} className="flex-1 overflow-auto bg-bg-canvas">
          {activePage === "button" && <ButtonDoc />}
          {activePage === "badge" && <BadgeDoc />}
          {activePage === "chip" && <ChipDoc />}
          {activePage === "input" && <InputDoc />}
          {activePage === "input-group" && <InputGroupDoc />}
          {activePage === "select" && <SelectDoc />}
          {activePage === "tabs" && <TabsDoc />}
          {activePage === "card" && <CardDoc />}
          {activePage === "switch" && <SwitchDoc />}
          {activePage === "checkbox" && <CheckboxDoc />}
          {activePage === "radio-group" && <RadioGroupDoc />}
          {activePage === "slider" && <SliderDoc />}
          {activePage === "progress" && <ProgressDoc />}
          {activePage === "pagination" && <PaginationDoc />}
          {activePage === "footer-table" && <FooterTableDoc />}
          {activePage === "table-toolbar" && <TableToolbarDoc />}
          {activePage === "table" && <TableDoc />}
          {activePage === "data-table" && <DataTableDoc />}
          {activePage === "tabela-teste" && <TabelaTesteDoc />}
          {activePage === "kanban" && <KanbanDoc />}
          {activePage === "modal" && <ModalDoc />}
          {activePage === "clients-crud" && <ClientsCRUDPreview />}
          {activePage === "clients-crud-server" && <ClientsCRUDServerPreview />}
          {activePage === "clients-virtualized" && <ClientsVirtualizedPreview />}
          {activePage === "clients-grouped" && <ClientsGroupedPreview />}
          {activePage === "clients-expandable" && <ClientsExpandablePreview />}
          {activePage === "clients-typed" && <ClientsTypedPreview />}
          {activePage === "clients-kanban" && <ClientsKanbanPreview />}
          {activePage === "accordion" && <AccordionDoc />}
          {activePage === "alert" && <AlertDoc />}
          {activePage === "alert-modal" && <AlertModalDoc />}
          {activePage === "dialog" && <DialogDoc />}
          {activePage === "dropdown-menu" && <DropdownMenuDoc />}
          {activePage === "avatar" && <AvatarDoc />}
          {activePage === "breadcrumb" && <BreadcrumbDoc />}
          {activePage === "calendar" && <CalendarDoc />}
          {activePage === "command" && <CommandDoc />}
          {activePage === "panel" && <PanelDoc />}
          {activePage === "floating-panel" && <FloatingPanelDoc />}
          {activePage === "textarea" && <TextareaDoc />}
          {activePage === "form-field" && <FormFieldDoc />}
          {activePage === "label" && <LabelDoc />}
          {activePage === "separator" && <SeparatorDoc />}
          {activePage === "menu-sidebar" && <MenuSidebarDoc />}
          {activePage === "header" && <HeaderDoc />}
          {activePage === "app-shell" && <AppShellDoc />}
          {activePage === "page-header" && <PageHeaderDoc />}
          {activePage === "clientes-showcase" && <ClientesShowcase />}
          {activePage === "chat-v2" && <ChatV2 />}
          {activePage === "dashboard-showcase" && <DashboardShowcase />}
          {activePage === "tokens-overview" && <TokensOverviewDoc />}
          {activePage === "colors" && <ColorsDoc />}
          {activePage === "typography" && <TypographyDoc />}
          {activePage === "spacing" && <SpacingDoc />}
          {activePage === "shape" && <ShapeDoc />}
          {activePage === "elevation" && <ElevationDoc />}
          {activePage === "sizing" && <SizingDoc />}
          {activePage === "icons" && <IconsDoc />}
          {activePage === "showcase-v2" && <ShowcasePageV2 />}
          {activePage === "agents" && <AgentsPreview />}
          {activePage === "agents-overview" && <AgentsOverviewDoc />}
          {activePage === "agent-orchestrator" && <AgentOrchestratorDoc />}
          {activePage === "agent-designer" && <AgentDesignerDoc />}
          {activePage === "agent-dev" && <AgentDevDoc />}
          {activePage === "agent-reviewer" && <AgentReviewerDoc />}
          {activePage === "introduction" && <IntroductionDoc />}
          {activePage === "structure" && <StructureDoc />}
          {activePage === "transform-tokens" && <TransformTokensDoc />}
          {activePage === "installation" && <InstallationDoc />}
          {activePage === "updates" && <UpdatesDoc />}
          {activePage === "pipeline-skills" && <PipelineSkillsDoc />}
          {activePage === "pipeline-commands" && <PipelineCommandsDoc />}
          {activePage === "pipeline-hooks" && <PipelineHooksDoc />}
          {activePage === "pipeline-output-styles" && <PipelineOutputStylesDoc />}
          {activePage === "pipeline-mcp" && <PipelineMcpDoc />}
          {activePage === "pipeline-memory" && <PipelineMemoryDoc />}
          {activePage === "docs" && <ComponentDocTemplate />}
          {activePage === "docs-template" && <ComponentDocTemplate />}
        </main>
      </div>
      </DocNavProvider>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 border-r border-border-sidebar bg-bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-gp-xl px-pad-3xl py-pad-2xl border-b border-border-sidebar">
          <div className="w-9 h-9 rounded-radius-lg bg-bg-brand text-fg-on-brand flex items-center justify-center font-bold text-body-sm font-normal">iG</div>
          <div>
            <div className="text-body-md font-medium text-fg-default">iGreen DS</div>
            <div className="text-caption-sm text-fg-subtle">preview</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-auto px-pad-xl py-pad-2xl">
          {NAV_SECTIONS.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              activePage={activePage}
              onSelect={setActivePage}
            />
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-pad-3xl py-pad-2xl border-t border-border-sidebar">
          <button onClick={toggle} className="flex items-center gap-gp-md px-pad-xl py-pad-md rounded-radius-md text-body-md text-fg-muted w-full capitalize hover:bg-bg-sidebar-accent transition-colors">
            {theme === "dark" ? "☀️" : "🌙"} {theme}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-bg-canvas">
        {activePage === "components" && <ComponentsPreview />}
        {activePage === "demo" && <DemoComparison />}
      </main>
    </div>
  );
}
