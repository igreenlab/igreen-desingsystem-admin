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
      { label: "Distribution", href: "distribution" },
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
      { label: "Aspect Ratio", href: "aspect-ratio" },
      { label: "Alert", href: "alert" },
      { label: "Alert Modal", href: "alert-modal" },
      { label: "Modal", href: "modal" },
      { label: "Floating Panel", href: "floating-panel" },
      { label: "Avatar", href: "avatar" },
      { label: "Badge", href: "badge" },
      { label: "Chip", href: "chip" },
      { label: "Breadcrumb", href: "breadcrumb" },
      { label: "Button", href: "button" },
      { label: "ButtonGroup", href: "button-group" },
      { label: "Calendar", href: "calendar" },
      { label: "Carousel", href: "carousel" },
      { label: "Card", href: "card" },
      { label: "Card Checkbox", href: "card-checkbox" },
      { label: "Checkbox", href: "checkbox" },
      { label: "Collapsible", href: "collapsible" },
      { label: "Combobox", href: "combobox" },
      { label: "Command", href: "command" },
      { label: "Context Menu", href: "context-menu" },
      { label: "Date Picker", href: "date-picker" },
      { label: "Dialog", href: "dialog" },
      { label: "Dropdown Menu", href: "dropdown-menu" },
      { label: "Drawer", href: "drawer" },
      { label: "Hover Card", href: "hover-card" },
      { label: "FormField", href: "form-field" },
      { label: "Icon", href: "icon" },
      { label: "Input", href: "input" },
      { label: "Input Group", href: "input-group" },
      { label: "Input OTP", href: "input-otp" },
      { label: "Pagination", href: "pagination" },
      { label: "Label", href: "label" },
      { label: "Menubar", href: "menubar" },
      { label: "Navigation Menu", href: "navigation-menu" },
      { label: "Panel", href: "panel" },
      { label: "Popover", href: "popover" },
      { label: "Progress", href: "progress" },
      { label: "Radio Group", href: "radio-group" },
      { label: "Scroll Area", href: "scroll-area" },
      { label: "Select", href: "select" },
      { label: "Separator", href: "separator" },
      { label: "Sheet", href: "sheet" },
      { label: "Skeleton", href: "skeleton" },
      { label: "Spinner", href: "spinner" },
      { label: "Empty State", href: "empty-state" },
      { label: "Markdown Text", href: "markdown-text" },
      { label: "File Upload Field", href: "file-upload-field" },
      { label: "Month Year Picker", href: "month-year-picker" },
      { label: "Color Picker", href: "color-picker" },
      { label: "Slider", href: "slider" },
      { label: "Switch", href: "switch" },
      { label: "Tabs", href: "tabs" },
      { label: "Textarea", href: "textarea" },
      { label: "Toggle", href: "toggle" },
      { label: "Toggle Group", href: "toggle-group" },
      { label: "Sonner", href: "sonner" },
      { label: "Toast", href: "toast" },
      { label: "Tooltip", href: "tooltip" },
    ],
  },
  {
    title: "Charts",
    items: [
      { label: "Area", href: "chart-area" },
      { label: "Bars", href: "chart-bar" },
      { label: "Lines", href: "chart-line" },
      { label: "Pies", href: "chart-pie" },
      { label: "Radars", href: "chart-radar" },
      { label: "Radials", href: "chart-radial" },
      { label: "Maps", href: "chart-map" },
      { label: "Compositions", href: "chart-showcase" },
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
      { label: "Example: Tree-data", href: "clients-tree" },
      { label: "Example: Column types", href: "clients-typed" },
      { label: "Example: Kanban view", href: "clients-kanban" },
      { label: "Example: List view (toggle)", href: "clients-list-view" },
    ],
  },
  {
    title: "List Components",
    items: [
      { label: "List", href: "list" },
      { label: "DataList", href: "data-list" },
      // Exemplos do DataList (telas dedicadas)
      { label: "Example: Standard", href: "list-standard" },
      { label: "Example: Grouped + DnD", href: "list-grouped" },
      { label: "Example: Hierarchical", href: "list-hierarchical" },
      { label: "Example: Selecionável", href: "list-selectable" },
      { label: "Example: Card rico", href: "list-rich" },
    ],
  },
  {
    title: "Templates",
    items: [
      { label: "Header", href: "header" },
      { label: "MenuSidebar", href: "menu-sidebar" },
      { label: "SingleMenuSidebar", href: "single-menu-sidebar" },
      { label: "KPI", href: "kpi" },
      { label: "App Shell", href: "app-shell" },
      { label: "Page Header", href: "page-header" },
    ],
  },
  {
    title: "Examples",
    items: [
      { label: "Showcase", href: "showcase-v2" },
      { label: "CRUD", href: "clientes-showcase" },
      { label: "Mapa de Rede", href: "mapa-rede" },
      { label: "Chat", href: "chat-v2" },
      { label: "Dashboard", href: "dashboard-showcase" },
      // Apps standalone (fullscreen via ?app=) — abrem fora do chrome de docs.
      { label: "Finance", href: "finance", url: "?app=finance" },
      { label: "Order Detail", href: "order-detail", url: "?app=order-detail" },
      { label: "Edit Page", href: "edit-page", url: "?app=edit-page" },
      // Tour guiado sobre a tela Finance — onboarding dos recursos do DataTable.
      {
        label: "Tutorial DataTable",
        href: "finance-tutorial",
        url: "?app=finance-tutorial",
      },
    ],
  },
  {
    title: "Demos",
    items: [
      // App de demonstração de consumo real do DS — vive em projeto/virtual-proposta
      // DENTRO deste repo. Servido navegável no MESMO deploy do showcase, em /demo/
      // (buildado junto via `build:showcase` + vercel.json). Abre no mesmo domínio.
      {
        label: "Virtual Proposta",
        href: "demo-virtual-proposta",
        url: "/demo/",
      },
    ],
  },
];

/** Retorna o nav com o item ativo marcado por label */
export function getDocNav(activeLabel: string): DocNavSection[] {
  return BASE_NAV.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      active: item.label === activeLabel,
    })),
  }));
}

/** Retorna o nav com o item ativo marcado por href (page ID) */
export function getDocNavByHref(activeHref: string): DocNavSection[] {
  return BASE_NAV.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      active: item.href === activeHref,
    })),
  }));
}
