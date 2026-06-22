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
import { SingleMenuSidebar } from "../../components/ui/SingleMenuSidebar";
import { SidebarBrandIcon } from "../../components/ui/MenuSidebar";
import type {
  SingleMenuCategory,
  SingleMenuModule,
  SingleMenuUser,
} from "../../components/ui/SingleMenuSidebar";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  Zap,
  FileText,
  Wallet,
  Users,
  Network,
  Settings,
  LifeBuoy,
  LogOut,
  UserCog,
  Leaf,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   SingleMenuSidebar — Documentation Page
   ═══════════════════════════════════════════════════════════════════════════ */

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-full", label: "Sidebar completa" },
  { id: "ex-accordion", label: "Accordion (sub-itens)" },
  { id: "ex-collapsed", label: "Recolhida (rail)" },
  { id: "ex-interactive", label: "Toggle controlado" },
  { id: "ex-minimal", label: "Sem módulo / sem busca" },
  { id: "api", label: "API Reference" },
  { id: "api-sidebar", label: "<SingleMenuSidebar>" },
  { id: "api-types", label: "Data Types" },
];

/* ── Mock data ───────────────────────────────────────────────────────────── */
const MOCK_CATEGORIES: SingleMenuCategory[] = [
  { id: "dashboard", icon: <LayoutGrid />, label: "Dashboard", active: true },
  {
    id: "instalacoes",
    icon: <Zap />,
    label: "Instalações",
    items: [
      { id: "contratos-inst", label: "Contratos Instalação" },
      { id: "vistorias", label: "Vistorias" },
      { id: "ativacoes", label: "Ativações" },
    ],
  },
  {
    id: "faturamento",
    icon: <FileText />,
    label: "Faturamento",
    items: [
      { id: "faturas", label: "Faturas" },
      { id: "boletos", label: "Boletos" },
      { id: "conciliacao", label: "Conciliação" },
    ],
  },
  {
    id: "financeiro",
    icon: <Wallet />,
    label: "Financeiro",
    items: [
      { id: "saldo", label: "Saldo & Saques" },
      { id: "repasses", label: "Repasses" },
    ],
  },
  {
    id: "rede",
    icon: <Network />,
    label: "Rede de Consultores",
    items: [
      { id: "consultores", label: "Consultores" },
      { id: "hierarquia", label: "Hierarquia" },
      { id: "comissoes", label: "Comissões" },
    ],
  },
  { id: "clientes", icon: <Users />, label: "Clientes" },
  { id: "config", icon: <Settings />, label: "Configurações" },
];

const MOCK_MODULE: SingleMenuModule = {
  icon: <Zap className="size-icon-md" />,
  title: "Créditos",
  subtitle: "Módulo ativo",
  options: [
    {
      id: "creditos",
      label: "Créditos",
      icon: <Zap className="size-icon-sm" />,
    },
    {
      id: "energia",
      label: "Energia",
      icon: <Leaf className="size-icon-sm" />,
    },
    { id: "rede", label: "Rede", icon: <Network className="size-icon-sm" /> },
  ],
  onModuleChange: () => {},
};

const MOCK_USER: SingleMenuUser = {
  name: "Sérgio Vieira",
  email: "sergio@igreen.com.br",
  actions: [
    {
      id: "perfil",
      label: "Meu perfil",
      icon: <UserCog className="size-icon-sm" />,
    },
    {
      id: "suporte",
      label: "Suporte",
      icon: <LifeBuoy className="size-icon-sm" />,
    },
    {
      id: "logout",
      label: "Sair",
      icon: <LogOut className="size-icon-sm" />,
      variant: "destructive",
    },
  ],
  onAction: () => {},
};

const LOGO = (
  <div className="grid size-form-lg place-items-center rounded-radius-xl bg-bg-brand text-fg-on-brand">
    <SidebarBrandIcon size={18} />
  </div>
);

/* ── Preview container ───────────────────────────────────────────────────── */
function SidebarDemo({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[680px] w-full overflow-hidden rounded-radius-base bg-bg-canvas ring-1 ring-border-subtle">
      {children}
    </div>
  );
}

/* ── Props tables ────────────────────────────────────────────────────────── */
const PROPS_SIDEBAR = [
  { name: "logo", type: "ReactNode", defaultVal: "—", required: true },
  { name: "title", type: "string", defaultVal: "—", required: true },
  {
    name: "categories",
    type: "SingleMenuCategory[]",
    defaultVal: "—",
    required: true,
  },
  { name: "user", type: "SingleMenuUser", defaultVal: "—", required: true },
  { name: "module", type: "SingleMenuModule", defaultVal: "—" },
  { name: "showSearch", type: "boolean", defaultVal: "true" },
  { name: "searchPlaceholder", type: "string", defaultVal: '"Buscar"' },
  { name: "searchValue", type: "string", defaultVal: "—" },
  { name: "onSearchChange", type: "(value: string) => void", defaultVal: "—" },
  { name: "activeItemId", type: "string", defaultVal: "—" },
  { name: "onItemClick", type: "(id: string) => void", defaultVal: "—" },
  { name: "defaultExpanded", type: "boolean", defaultVal: "true" },
  { name: "expanded", type: "boolean", defaultVal: "—" },
  {
    name: "onExpandedChange",
    type: "(expanded: boolean) => void",
    defaultVal: "—",
  },
  { name: "showToggleIndicator", type: "boolean", defaultVal: "false" },
];

const PROPS_DATA = [
  {
    name: "SingleMenuCategory",
    type: "{ id, icon, label, href?, items?, active? }",
    defaultVal: "—",
  },
  { name: "SingleMenuSubItem", type: "{ id, label, href? }", defaultVal: "—" },
  {
    name: "SingleMenuModule",
    type: "{ icon, title, subtitle, options?, onModuleChange? }",
    defaultVal: "—",
  },
  {
    name: "SingleMenuModuleOption",
    type: "{ id, label, icon }",
    defaultVal: "—",
  },
  {
    name: "SingleMenuUser",
    type: "{ name, email, avatar?, actions?, onAction? }",
    defaultVal: "—",
  },
  {
    name: "SingleMenuUserAction",
    type: '{ id, label, icon?, variant?: "default" | "destructive" }',
    defaultVal: "—",
  },
];

export function SingleMenuSidebarDoc() {
  const [expanded, setExpanded] = useState(true);
  const [activeItemId, setActiveItemId] = useState("dashboard");

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Templates"
        title="SingleMenuSidebar"
        description="Sidebar de navegação de nível único — categoria → sub-itens em accordion (1 aberto por vez). Alternativa enxuta ao MenuSidebar quando não há necessidade de rail + múltiplos contextos. Header com toggle, hover-to-expand quando recolhida, seletor de módulo + busca opcionais e rodapé de usuário com dropdown. Data-driven via categories array. Sem variantes."
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Full Sidebar */}
      <ExampleSection
        id="ex-full"
        title="Sidebar completa"
        description="Passe logo + title + categories + user. Categorias com `items` viram accordion; sem `items` são links simples. `module` e busca são opcionais."
        code={`<SingleMenuSidebar
  logo={<Logo />}
  title="iGreen System"
  module={{ icon, title: "Créditos", subtitle: "MÓDULO ATIVO", options }}
  categories={CATEGORIES}
  user={{ name: "Sérgio", email: "sergio@igreen.com.br", actions }}
  activeItemId={activeItemId}
  onItemClick={setActiveItemId}
/>`}
      >
        <SidebarDemo>
          <SingleMenuSidebar
            logo={LOGO}
            title="iGreen System"
            module={MOCK_MODULE}
            categories={MOCK_CATEGORIES}
            user={MOCK_USER}
            activeItemId={activeItemId}
            onItemClick={setActiveItemId}
          />
        </SidebarDemo>
      </ExampleSection>

      {/* Accordion */}
      <ExampleSection
        id="ex-accordion"
        title="Accordion (sub-itens)"
        description="Categorias com `items` expandem em accordion — apenas 1 aberta por vez. Ao definir `activeItemId`, a categoria que contém o item é aberta automaticamente."
        code={`{
  id: "instalacoes",
  icon: <Zap />,
  label: "Instalações",
  items: [
    { id: "contratos-inst", label: "Contratos Instalação" },
    { id: "vistorias", label: "Vistorias" },
  ],
}`}
      >
        <SidebarDemo>
          <SingleMenuSidebar
            logo={LOGO}
            title="iGreen System"
            categories={MOCK_CATEGORIES}
            user={MOCK_USER}
            defaultExpanded
            activeItemId="comissoes"
          />
        </SidebarDemo>
      </ExampleSection>

      {/* Collapsed */}
      <ExampleSection
        id="ex-collapsed"
        title="Recolhida (rail)"
        description="Com `defaultExpanded={false}` abre como rail de ícones. Cada categoria mostra um tooltip no hover; passar o mouse sobre a sidebar a expande temporariamente (hover-to-expand)."
        code={`<SingleMenuSidebar
  /* ... */
  defaultExpanded={false}
  showToggleIndicator
/>`}
      >
        <SidebarDemo>
          <SingleMenuSidebar
            logo={LOGO}
            title="iGreen System"
            module={MOCK_MODULE}
            categories={MOCK_CATEGORIES}
            user={MOCK_USER}
            defaultExpanded={false}
            showToggleIndicator
          />
        </SidebarDemo>
      </ExampleSection>

      {/* Interactive */}
      <ExampleSection
        id="ex-interactive"
        title="Toggle controlado"
        description="Modo controlado — passe `expanded` + `onExpandedChange` para alternar externamente (ex.: por um botão no header do app)."
        code={`const [expanded, setExpanded] = useState(true);

<Button onClick={() => setExpanded(e => !e)}>
  {expanded ? "Recolher" : "Expandir"}
</Button>

<SingleMenuSidebar
  /* ... */
  expanded={expanded}
  onExpandedChange={setExpanded}
/>`}
      >
        <div className="flex w-full flex-col gap-gp-xl">
          <div>
            <Button
              color="secondary"
              variant="outline"
              size="sm"
              iconLeft={
                expanded ? (
                  <PanelLeftClose className="size-icon-sm" />
                ) : (
                  <PanelLeftOpen className="size-icon-sm" />
                )
              }
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Recolher sidebar" : "Expandir sidebar"}
            </Button>
          </div>
          <SidebarDemo>
            <SingleMenuSidebar
              logo={LOGO}
              title="iGreen System"
              module={MOCK_MODULE}
              categories={MOCK_CATEGORIES}
              user={MOCK_USER}
              expanded={expanded}
              onExpandedChange={setExpanded}
              activeItemId={activeItemId}
              onItemClick={setActiveItemId}
            />
          </SidebarDemo>
        </div>
      </ExampleSection>

      {/* Minimal */}
      <ExampleSection
        id="ex-minimal"
        title="Sem módulo / sem busca"
        description="Omita `module` e passe `showSearch={false}` para uma navegação minimalista — só logo, categorias e usuário."
        code={`<SingleMenuSidebar
  logo={<Logo />}
  title="iGreen System"
  showSearch={false}
  categories={CATEGORIES}
  user={USER}
/>`}
      >
        <SidebarDemo>
          <SingleMenuSidebar
            logo={LOGO}
            title="iGreen System"
            showSearch={false}
            categories={MOCK_CATEGORIES}
            user={MOCK_USER}
          />
        </SidebarDemo>
      </ExampleSection>

      {/* API Reference */}
      <SectionH2 id="api" title="API Reference" />

      <div id="api-sidebar" className="mb-14 scroll-mt-6">
        <h3 className="mb-gp-2xl text-title-lg font-semibold text-fg-default">
          {"<SingleMenuSidebar>"}
        </h3>
        <PropsTable items={PROPS_SIDEBAR} />
      </div>

      <div id="api-types" className="mb-14 scroll-mt-6">
        <h3 className="mb-gp-2xl text-title-lg font-semibold text-fg-default">
          Data Types
        </h3>
        <PropsTable items={PROPS_DATA} />
      </div>
    </DocLayout>
  );
}
