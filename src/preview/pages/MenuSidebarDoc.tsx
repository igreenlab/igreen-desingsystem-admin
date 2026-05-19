import { useState } from "react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";
import { Button } from "../../components/ui/Button/button";
import { MenuSidebar } from "../../components/ui/MenuSidebar";
import type {
  SidebarContext,
} from "../../components/ui/MenuSidebar";
import { PanelLeftClose, PanelLeftOpen, Menu as MenuIcon } from "lucide-react";
import {
  Inbox,
  Contact,
  Megaphone,
  Brain,
  Settings as SettingsIcon,
  LayoutGrid,
  Target,
  Trophy,
  Tag,
  Reply,
  Star,
  GraduationCap,
  Activity,
  AlertCircle,
  Plug,
  ListOrdered,
  Network,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar Documentation Page
   ═══════════════════════════════════════════════════════════════════════════ */

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-full", label: "Full Sidebar (data-driven)" },
  { id: "ex-subgroup", label: "With Submenus" },
  { id: "ex-sections", label: "Sections (bookmarks/chats)" },
  { id: "ex-interactive", label: "Interactive Collapse" },
  { id: "ex-collapsed", label: "Panel Collapsed (default)" },
  { id: "ex-mobile", label: "Mobile Drawer" },
  { id: "api", label: "API Reference" },
  { id: "api-sidebar", label: "<MenuSidebar>" },
  { id: "api-types", label: "Data Types" },
];

/* ── Mock data — espelha o sandbox /design-and-table-v2 ──────────────────── */
const MOCK_CONTEXTS: SidebarContext[] = [
  {
    id: "inbox",
    label: "Inbox / Operação",
    icon: Inbox,
    items: [
      { name: "Atendimentos", icon: Inbox, href: "#atendimentos", badge: "12", badgeKind: "counter" },
      { name: "Filas", icon: ListOrdered, href: "#filas", badge: "3" },
      { name: "Dashboards", icon: LayoutGrid, href: "#dashboards" },
      {
        name: "Escalation",
        icon: AlertCircle,
        subitems: [
          { name: "Dashboard", href: "#esc-dash" },
          { name: "Departamentos", href: "#esc-deps" },
          { name: "Regras", href: "#esc-rules" },
        ],
      },
    ],
    sections: [
      {
        id: "filtros-rapidos",
        label: "Filtros rápidos",
        variant: "bookmark",
        items: [
          { color: "#1cb280", name: "Royais — In progress" },
          { color: "#f6b51e", name: "Licenciados — Waiting" },
          { color: "#8754ec", name: "IA — handover pendente" },
          { color: "#ef4444", name: "SLA crítico (> 30min)" },
        ],
      },
      {
        id: "mensagens-rapidas",
        label: "Mensagens rápidas",
        variant: "chat",
        items: [
          { name: "Aline Castro", initials: "AC", color: "#f59e0b", status: "online" },
          { name: "Carlos Souza", initials: "CS", color: "#8754ec", status: "online" },
          { name: "Maria Lima", initials: "ML", color: "#ef4444", status: "offline" },
          { name: "João Pedro", initials: "JP", color: "#1cb280", status: "online" },
        ],
      },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: Contact,
    items: [
      { name: "Contatos", icon: Contact, href: "#contatos", badge: "2.1k" },
      { name: "Segmentos", icon: Target, href: "#segmentos" },
      { name: "Tiers", icon: Trophy, href: "#tiers" },
      { name: "Tags", icon: Tag, href: "#tags" },
      { name: "Respostas Rápidas", icon: Reply, href: "#respostas" },
    ],
    sections: [
      {
        id: "listas-salvas",
        label: "Listas salvas",
        variant: "bookmark",
        items: [
          { color: "#0088cc", name: "Top 100 ativos" },
          { color: "#f59e0b", name: "Sem cadastro completo" },
          { color: "#1cb280", name: "Convertidos último mês" },
        ],
      },
    ],
  },
  {
    id: "engajamento",
    label: "Engajamento",
    icon: Megaphone,
    items: [
      { name: "Campanhas", icon: Megaphone, href: "#campanhas", badge: "6" },
      { name: "Pesquisa Satisfação", icon: Star, href: "#csat", badge: "CSAT", badgeKind: "success" },
      { name: "Capacitações", icon: GraduationCap, href: "#capacitacoes" },
      {
        name: "Green Points",
        icon: Trophy,
        subitems: [
          { name: "My Points", href: "#gp-my" },
          { name: "Management", href: "#gp-mgmt" },
          { name: "Periods", href: "#gp-periods" },
          { name: "Configuration", href: "#gp-config" },
        ],
      },
    ],
  },
  {
    id: "ia",
    label: "IA — Agente Sol",
    icon: Brain,
    items: [
      { name: "Sol Traces", icon: Activity, href: "#sol-traces", badge: "94 pgs" },
      { name: "Central de Alertas", icon: AlertCircle, href: "#alertas", badge: "1085", badgeKind: "counter" },
      {
        name: "AI Rules",
        icon: Brain,
        subitems: [
          { name: "Provenance", href: "#ai-prov" },
          { name: "Embeddings Health", href: "#ai-emb" },
          { name: "Few-shots Candidates", href: "#ai-fs" },
        ],
      },
    ],
  },
  {
    id: "config",
    label: "Configuração",
    icon: SettingsIcon,
    items: [
      { name: "Conexões", icon: Plug, href: "#conexoes", badge: "2" },
      { name: "Filas & Chatbot", icon: ListOrdered, href: "#filas-cb", badge: "8" },
      { name: "Regras de Fila", icon: Network, href: "#regras-fila" },
      { name: "Channels", icon: LayoutGrid, href: "#channels", badge: "2" },
    ],
  },
];

/* ── Preview container ─────────────────────────────────────────────────────── */
function MenuSidebarDemo({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[640px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden bg-bg-canvas">
      {children}
    </div>
  );
}

/* ── Props tables ─────────────────────────────────────────────────────────── */
const PROPS_SIDEBAR = [
  { name: "contexts", type: "SidebarContext[]", defaultVal: "—", required: true },
  { name: "brand", type: "ReactNode", defaultVal: "<MenuSidebarBrandIcon />" },
  { name: "user", type: "ReactNode", defaultVal: '"SV"' },
  { name: "showRailAdd", type: "boolean", defaultVal: "false" },
  { name: "onRailAddClick", type: "() => void", defaultVal: "—" },
  { name: "activeContextId", type: "string", defaultVal: "—" },
  { name: "defaultActiveContextId", type: "string", defaultVal: "contexts[0].id" },
  { name: "onContextChange", type: "(id: string) => void", defaultVal: "—" },
  { name: "activeItemHref", type: "string", defaultVal: "—" },
  { name: "defaultActiveItemHref", type: "string", defaultVal: '""' },
  { name: "onItemClick", type: "(item: SidebarMenuItem) => void", defaultVal: "—" },
  { name: "panelCollapsed", type: "boolean", defaultVal: "—" },
  { name: "defaultPanelCollapsed", type: "boolean", defaultVal: "false" },
  { name: "onPanelCollapseChange", type: "(collapsed: boolean) => void", defaultVal: "—" },
  { name: "expandOnHover", type: "boolean", defaultVal: "true" },
  { name: "mobileOpen", type: "boolean", defaultVal: "—" },
  { name: "defaultMobileOpen", type: "boolean", defaultVal: "false" },
  { name: "onMobileOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
  { name: "mobileBreakpoint", type: "string (CSS media query)", defaultVal: '"(max-width: 767px)"' },
  { name: "onPanelTitleClick", type: "() => void", defaultVal: "—" },
];

const PROPS_DATA = [
  { name: "SidebarContext", type: "{ id, label, icon, items, sections? }", defaultVal: "—" },
  { name: "SidebarMenuItem", type: "{ name, icon?, href?, badge?, badgeKind?, subitems? }", defaultVal: "—" },
  { name: "SidebarSection (bookmark)", type: '{ id, label, variant:"bookmark", items:[{ name, color, href? }] }', defaultVal: "—" },
  { name: "SidebarSection (chat)", type: '{ id, label, variant:"chat", items:[{ name, initials, color, status? }] }', defaultVal: "—" },
];

export function MenuSidebarDoc() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Templates"
        title="MenuSidebar"
        description="Two-column navigation template (rail + panel). Suporta submenus, sections colapsáveis (bookmarks/chats), badges, hover-to-expand e drawer mobile auto-responsivo. Data-driven via contexts array."
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Full Sidebar */}
      <ExampleSection
        id="ex-full"
        title="Full Sidebar"
        description="Pass an array of contexts and the component handles rail + panel + sections automatically."
        code={`<MenuSidebar contexts={CONTEXTS} defaultActiveContextId="inbox" defaultActiveItemHref="#atendimentos" />`}
      >
        <MenuSidebarDemo>
          <MenuSidebar
            contexts={MOCK_CONTEXTS}
            defaultActiveContextId="inbox"
            defaultActiveItemHref="#atendimentos"
          />
        </MenuSidebarDemo>
      </ExampleSection>

      {/* With Submenus */}
      <ExampleSection
        id="ex-subgroup"
        title="With Submenus"
        description='Items with `subitems` render as collapsible groups (1 level deep). When a child is active, the parent auto-expands.'
        code={`{ name: "Escalation", icon: AlertCircle, subitems: [
  { name: "Dashboard",     href: "#esc-dash" },
  { name: "Departamentos", href: "#esc-deps" },
] }`}
      >
        <MenuSidebarDemo>
          <MenuSidebar
            contexts={MOCK_CONTEXTS}
            defaultActiveContextId="engajamento"
            defaultActiveItemHref="#gp-mgmt"
          />
        </MenuSidebarDemo>
      </ExampleSection>

      {/* Sections */}
      <ExampleSection
        id="ex-sections"
        title="Collapsible Sections"
        description='Sections render below the main items. Two variants: `bookmark` (colored dot + name) and `chat` (avatar + name + status). Both are collapsible.'
        code={`sections: [
  { id: "filtros", label: "Filtros rápidos", variant: "bookmark",
    items: [{ name: "Royais", color: "#1cb280" }, ...] },
  { id: "msgs", label: "Mensagens rápidas", variant: "chat",
    items: [{ name: "Aline", initials: "AC", color: "#f59e0b", status: "online" }, ...] },
]`}
      >
        <MenuSidebarDemo>
          <MenuSidebar
            contexts={MOCK_CONTEXTS}
            defaultActiveContextId="inbox"
          />
        </MenuSidebarDemo>
      </ExampleSection>

      {/* Interactive collapse */}
      <ExampleSection
        id="ex-interactive"
        title="Interactive Collapse"
        description='Controlled mode — pass `panelCollapsed` + `onPanelCollapseChange` to toggle externally. Quando colapsado, passar o mouse sobre o sidebar expande o panel como overlay flutuante automaticamente (built-in). Saindo o mouse, recolhe. Pra desabilitar esse comportamento passe `expandOnHover={false}`.'
        code={`const [collapsed, setCollapsed] = useState(false);

<Button onClick={() => setCollapsed(c => !c)}>
  {collapsed ? "Expandir" : "Colapsar"}
</Button>

<MenuSidebar
  contexts={CONTEXTS}
  panelCollapsed={collapsed}
  onPanelCollapseChange={setCollapsed}
/>`}
      >
        <div className="flex flex-col gap-gp-xl w-full">
          <div>
            <Button
              color="secondary"
              variant="outline"
              size="sm"
              iconLeft={
                collapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )
              }
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? "Expandir panel" : "Colapsar panel"}
            </Button>
          </div>
          <MenuSidebarDemo>
            <MenuSidebar
              contexts={MOCK_CONTEXTS}
              defaultActiveContextId="inbox"
              defaultActiveItemHref="#atendimentos"
              panelCollapsed={collapsed}
              onPanelCollapseChange={setCollapsed}
            />
          </MenuSidebarDemo>
        </div>
      </ExampleSection>

      {/* Default Collapsed */}
      <ExampleSection
        id="ex-collapsed"
        title="Panel Collapsed (default)"
        description="Use `defaultPanelCollapsed` quando o usuário não precisa controlar — abre direto em rail-only."
        code={`<MenuSidebar contexts={CONTEXTS} defaultPanelCollapsed />`}
      >
        <MenuSidebarDemo>
          <MenuSidebar
            contexts={MOCK_CONTEXTS}
            defaultActiveContextId="crm"
            defaultPanelCollapsed
          />
        </MenuSidebarDemo>
      </ExampleSection>

      {/* Mobile Drawer */}
      <ExampleSection
        id="ex-mobile"
        title="Mobile Drawer"
        description='No mobile (≤ 767px por default), o MenuSidebar vira **drawer fixed overlay** sobre o conteúdo. Panel sempre aberto (sem rail-only collapse), close button (X) no canto + backdrop scrim clicável pra fechar. Estado controlado via `mobileOpen` + `onMobileOpenChange` — qualquer botão hamburger no header do app pode abrir/fechar.'
        code={`const [mobileOpen, setMobileOpen] = useState(false);

<Button onClick={() => setMobileOpen(true)} iconLeft={<Menu />}>
  Abrir menu
</Button>

<MenuSidebar
  contexts={CONTEXTS}
  mobileOpen={mobileOpen}
  onMobileOpenChange={setMobileOpen}
  mobileBreakpoint="(max-width: 767px)"  // default
/>`}
      >
        <div className="flex flex-col gap-gp-xl w-full">
          <div className="flex items-center gap-gp-md">
            <Button
              color="secondary"
              variant="outline"
              size="sm"
              iconLeft={<MenuIcon className="size-4" />}
              onClick={() => setMobileOpen(true)}
            >
              Abrir menu (hamburger)
            </Button>
            <p className="text-body-md text-fg-muted">
              Forçado em modo mobile aqui. No app real, breakpoint default = ≤ 767px.
            </p>
          </div>
          {/* `transform: translateZ(0)` cria containing block pro fixed do drawer */}
          <div
            className="relative h-[640px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden bg-bg-canvas"
            style={{ transform: "translateZ(0)" }}
          >
            <MenuSidebar
              contexts={MOCK_CONTEXTS}
              defaultActiveContextId="inbox"
              defaultActiveItemHref="#atendimentos"
              mobileOpen={mobileOpen}
              onMobileOpenChange={setMobileOpen}
              mobileBreakpoint="all"
            />
            {/* Conteúdo fake pra ilustrar overlay */}
            <div className="p-pad-4xl">
              <h4 className="text-title-md font-semibold text-fg-default">
                Conteúdo do app
              </h4>
              <p className="text-body-md text-fg-muted mt-gp-md">
                O drawer abre por cima sem empurrar este conteúdo. Clique no
                backdrop ou no X pra fechar.
              </p>
            </div>
          </div>
        </div>
      </ExampleSection>

      {/* API Reference */}
      <SectionH2 id="api" title="API Reference" />

      <div id="api-sidebar" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          {"<MenuSidebar>"}
        </h3>
        <PropsTable items={PROPS_SIDEBAR} />
      </div>

      <div id="api-types" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          Data Types
        </h3>
        <PropsTable items={PROPS_DATA} />
      </div>
    </DocLayout>
  );
}
