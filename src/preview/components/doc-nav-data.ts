import type { DocNavSection } from "./doc-sidebar";

/**
 * Dados de navegação compartilhados por todas as doc pages.
 * href = activePage ID do App.tsx
 * getDocNav("Button") marca "Button" como ativo
 */
const BASE_NAV: DocNavSection[] = [
  {
    title: "Get Started",
    items: [
      { label: "Introduction", href: "introduction" },
      { label: "Structure", href: "structure" },
      { label: "Installation", href: "installation" },
      { label: "Transform Tokens", href: "transform-tokens" },
      { label: "Updates", href: "updates" },
    ],
  },
  {
    title: "Agents",
    items: [
      { label: "Overview", href: "agents-overview" },
      { label: "Pipeline", href: "agents" },
      { label: "Orchestrator", href: "agent-orchestrator" },
      { label: "DS Designer", href: "agent-designer" },
      { label: "DS Dev", href: "agent-dev" },
      { label: "DS Reviewer", href: "agent-reviewer" },
    ],
  },
  {
    title: "Pipeline Infra",
    items: [
      { label: "Skills", href: "pipeline-skills" },
      { label: "Commands", href: "pipeline-commands" },
      { label: "Hooks", href: "pipeline-hooks" },
      { label: "Output Styles", href: "pipeline-output-styles" },
      { label: "MCP Servers", href: "pipeline-mcp" },
      { label: "Memory System", href: "pipeline-memory" },
    ],
  },
  {
    title: "Foundations",
    items: [
      { label: "Tokens Overview", href: "tokens-overview" },
      { label: "Color", href: "colors" },
      { label: "Typography", href: "typography" },
      { label: "Spacing", href: "spacing" },
      { label: "Sizing", href: "sizing" },
      { label: "Shape & Radius", href: "shape" },
      { label: "Elevation", href: "elevation" },
      { label: "Icons", href: "icons" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Accordion", href: "accordion" },
      { label: "Alert", href: "alert" },
      { label: "Alert Modal", href: "alert-modal" },
      { label: "Modal", href: "modal" },
      { label: "Floating Panel", href: "floating-panel" },
      { label: "Avatar", href: "avatar" },
      { label: "Badge", href: "badge" },
      { label: "Chip", href: "chip" },
      { label: "Breadcrumb", href: "breadcrumb" },
      { label: "Button", href: "button" },
      { label: "Calendar", href: "calendar" },
      { label: "Card", href: "card" },
      { label: "Checkbox", href: "checkbox" },
      { label: "Command", href: "command" },
      { label: "Dialog", href: "dialog" },
      { label: "Dropdown Menu", href: "dropdown-menu" },
      { label: "FormField", href: "form-field" },
      { label: "Input", href: "input" },
      { label: "Input Group", href: "input-group" },
      { label: "Pagination", href: "pagination" },
      { label: "Label", href: "label" },
      { label: "Panel", href: "panel" },
      { label: "Progress", href: "progress" },
      { label: "Radio Group", href: "radio-group" },
      { label: "Select", href: "select" },
      { label: "Separator", href: "separator" },
      { label: "Slider", href: "slider" },
      { label: "Switch", href: "switch" },
      { label: "Tabs", href: "tabs" },
      { label: "Textarea", href: "textarea" },
    ],
  },
  {
    title: "Data Table Components",
    items: [
      // Componentes da família data-display
      { label: "Table", href: "table" },
      { label: "Table Toolbar", href: "table-toolbar" },
      { label: "Footer Table", href: "footer-table" },
      { label: "Tabela Teste", href: "tabela-teste" },
      { label: "Kanban", href: "kanban" },
      { label: "DataTable", href: "data-table" },
      // Exemplos do DataTable
      { label: "Example: CRUD", href: "clients-crud" },
      { label: "Example: CRUD Server", href: "clients-crud-server" },
      { label: "Example: Pre-filtered", href: "clients-pre-filtered" },
      { label: "Example: Virtualized (10k)", href: "clients-virtualized" },
      { label: "Example: Grouped", href: "clients-grouped" },
      { label: "Example: Expandable row", href: "clients-expandable" },
      { label: "Example: Column types", href: "clients-typed" },
      { label: "Example: Kanban view", href: "clients-kanban" },
    ],
  },
  {
    title: "Templates",
    items: [
      { label: "Header", href: "header" },
      { label: "MenuSidebar", href: "menu-sidebar" },
      { label: "App Shell", href: "app-shell" },
      { label: "Page Header", href: "page-header" },
    ],
  },
  {
    title: "Examples",
    items: [
      { label: "Showcase", href: "showcase-v2" },
      { label: "CRUD", href: "clientes-showcase" },
      { label: "Chat", href: "chat-v2" },
      { label: "Dashboard", href: "dashboard-showcase" },
    ],
  },
];

/** Retorna o nav com o item ativo marcado por label */
export function getDocNav(activeLabel: string): DocNavSection[] {
  return BASE_NAV.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      active: item.label === activeLabel,
    })),
  }));
}

/** Retorna o nav com o item ativo marcado por href (page ID) */
export function getDocNavByHref(activeHref: string): DocNavSection[] {
  return BASE_NAV.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      active: item.href === activeHref,
    })),
  }));
}
