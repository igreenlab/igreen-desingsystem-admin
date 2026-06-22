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
  SingleMenuModuleConfig,
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
  { id: "ex-interactive", label: "Toggle controlado" },
  { id: "ex-mobile", label: "Responsivo (mobile)" },
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

/* Módulos com menu próprio — trocar no seletor troca o módulo + o menu. */
const MODULES: SingleMenuModuleConfig[] = [
  {
    id: "creditos",
    icon: <Zap className="size-icon-md" />,
    title: "Créditos",
    subtitle: "Módulo ativo",
    categories: MOCK_CATEGORIES,
  },
  {
    id: "energia",
    icon: <Leaf className="size-icon-md" />,
    title: "Energia",
    subtitle: "Geração",
    categories: [
      { id: "energia-dashboard", icon: <LayoutGrid />, label: "Visão geral" },
      {
        id: "usinas",
        icon: <Zap />,
        label: "Usinas",
        items: [
          { id: "usinas-ativas", label: "Ativas" },
          { id: "usinas-manutencao", label: "Em manutenção" },
        ],
      },
      { id: "energia-faturas", icon: <FileText />, label: "Faturas" },
      { id: "energia-config", icon: <Settings />, label: "Configurações" },
    ],
  },
  {
    id: "rede",
    icon: <Network className="size-icon-md" />,
    title: "Rede",
    subtitle: "Consultores",
    categories: [
      { id: "rede-dashboard", icon: <LayoutGrid />, label: "Visão geral" },
      {
        id: "rede-consultores",
        icon: <Users />,
        label: "Consultores",
        items: [
          { id: "rede-todos", label: "Todos" },
          { id: "rede-hierarquia", label: "Hierarquia" },
        ],
      },
      { id: "rede-comissoes", icon: <Wallet />, label: "Comissões" },
    ],
  },
];

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
  { name: "user", type: "SingleMenuUser", defaultVal: "—", required: true },
  {
    name: "categories",
    type: "SingleMenuCategory[]",
    defaultVal: "—",
    required: false,
  },
  { name: "modules", type: "SingleMenuModuleConfig[]", defaultVal: "—" },
  { name: "activeModuleId", type: "string", defaultVal: "—" },
  { name: "defaultModuleId", type: "string", defaultVal: "modules[0].id" },
  { name: "onModuleChange", type: "(id: string) => void", defaultVal: "—" },
  { name: "module", type: "SingleMenuModule (modo simples)", defaultVal: "—" },
  { name: "showSearch", type: "boolean", defaultVal: "true" },
  { name: "searchPlaceholder", type: "string", defaultVal: '"Buscar"' },
  {
    name: "searchCommand",
    type: "ReactNode (custom da busca)",
    defaultVal: "auto",
  },
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
    name: "SingleMenuModuleConfig",
    type: "{ id, icon, title, subtitle?, categories }",
    defaultVal: "—",
  },
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
        description="Com `modules`, cada módulo tem seu próprio menu — trocar no seletor atualiza o módulo ativo E as categorias. A busca (⌘K ou clique) abre uma paleta listando os itens do menu. Categorias com `items` viram accordion; sem `items` são links simples."
        code={`<SingleMenuSidebar
  logo={<Logo />}
  title="iGreen System"
  modules={[
    { id: "creditos", icon, title: "Créditos", subtitle: "Módulo ativo", categories: [...] },
    { id: "energia",  icon, title: "Energia",  subtitle: "Geração",     categories: [...] },
  ]}
  defaultModuleId="creditos"
  onModuleChange={(id) => ...}
  user={{ name: "Sérgio", email: "sergio@igreen.com.br", actions }}
  activeItemId={activeItemId}
  onItemClick={setActiveItemId}
/>`}
      >
        <SidebarDemo>
          <SingleMenuSidebar
            logo={LOGO}
            title="iGreen System"
            modules={MODULES}
            defaultModuleId="creditos"
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

      {/* Mobile / responsivo */}
      <ExampleSection
        id="ex-mobile"
        title="Responsivo (mobile)"
        description="Abaixo de `md` (768px) a sidebar ocupa 100% da largura — pronta pra um drawer mobile. A sidebar é dumb: exibir/ocultar é responsabilidade do consumidor (um toggle controlado pelo seu app). No desktop ela mantém a largura fixa (280px)."
        code={`// A sidebar só PREENCHE 100% no mobile — o toggle/visibilidade é do SEU app.
function AppNav({ mobileOpen, onClose, ...props }) {
  return (
    <>
      {/* Desktop: largura fixa, sempre visível */}
      <div className="hidden md:block h-full">
        <SingleMenuSidebar {...props} />
      </div>

      {/* Mobile: drawer 100% controlado externamente */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-overlay-scrim" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-full max-w-[88%]">
            <SingleMenuSidebar {...props} />
          </div>
        </div>
      )}
    </>
  );
}`}
      >
        <div className="flex flex-col gap-gp-md">
          <p className="text-body-sm text-fg-muted">
            Simulação do mobile — a sidebar preenchendo 100% da largura do
            container (no app real, dentro de um drawer que o seu código abre/
            fecha):
          </p>
          <div className="h-[560px] w-full max-w-[380px] overflow-hidden rounded-radius-base bg-bg-canvas ring-1 ring-border-subtle">
            <SingleMenuSidebar
              className="!w-full"
              logo={LOGO}
              title="iGreen System"
              module={MOCK_MODULE}
              categories={MOCK_CATEGORIES}
              user={MOCK_USER}
              activeItemId="dashboard"
            />
          </div>
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
