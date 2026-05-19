import { useState } from "react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";
import { Header } from "../../components/ui/Header";
import type {
  HeaderCommandGroup,
  HeaderNotification,
  HeaderMessage,
} from "../../components/ui/Header";
import {
  Users,
  Ticket,
  Plus,
  Settings,
  Search as SearchIcon,
  UserCheck,
  AlertTriangle,
  Sparkles,
  CreditCard,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from "lucide-react";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-full", label: "Full Header (all blocks)" },
  { id: "ex-breadcrumb", label: "Breadcrumb (multi-level)" },
  { id: "ex-minimal", label: "Minimal (só título)" },
  { id: "ex-collapse", label: "Collapse menu integrado" },
  { id: "api", label: "API Reference" },
  { id: "api-header", label: "<Header>" },
  { id: "api-types", label: "Data Types" },
];

/* ── Mock data ────────────────────────────────────────────────────────────── */

const MOCK_COMMANDS: HeaderCommandGroup[] = [
  {
    heading: "Navegação rápida",
    items: [
      { label: "Clientes", icon: Users, onSelect: () => alert("→ Clientes") },
      { label: "Tickets", icon: Ticket, onSelect: () => alert("→ Tickets") },
      { label: "Configurações", icon: Settings, shortcut: "⌘,", onSelect: () => alert("→ Settings") },
    ],
  },
  {
    heading: "Ações",
    items: [
      { label: "Novo cliente", icon: Plus, shortcut: "⌘N", onSelect: () => alert("Novo cliente") },
      { label: "Sair", icon: LogOut, shortcut: "⌘Q", destructive: true, onSelect: () => alert("Sair") },
    ],
  },
];

const MOCK_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: "n1",
    icon: UserCheck,
    color: "#10B881",
    title: "Aline Castro mencionou você",
    body: 'em "Royais — In progress" comentou: "@você pode revisar?"',
    time: "2 min",
    unread: true,
    kind: "mention",
  },
  {
    id: "n2",
    icon: AlertTriangle,
    color: "#f59e0b",
    title: "SLA em risco",
    body: "Ticket #20260504-00031 sem resposta há 28 minutos",
    time: "15 min",
    unread: true,
    kind: "alert",
  },
  {
    id: "n3",
    icon: Sparkles,
    color: "#8754ec",
    title: "Sol Traces atualizado",
    body: "Nova versão com 12 melhorias na qualidade das respostas",
    time: "1 h",
    unread: true,
    kind: "system",
  },
  {
    id: "n4",
    icon: CreditCard,
    color: "#0FC589",
    title: "Fatura paga",
    body: "Pagamento de R$ 4.250,00 confirmado.",
    time: "3 h",
    kind: "billing",
  },
];

const MOCK_MESSAGES: HeaderMessage[] = [
  { id: "m1", name: "Aline Castro", initials: "AC", color: "#f59e0b", preview: "Olá! Você pode revisar o ticket #1234?", time: "2 min", unread: true },
  { id: "m2", name: "Equipe Suporte", initials: "ES", color: "#0088cc", preview: "Bruno: pessoal, alguém disponível pra cobrir...", time: "12 min", unread: true, group: true },
  { id: "m3", name: "Carlos Souza", initials: "CS", color: "#8754ec", preview: "Boa tarde! Aquele cliente confirmou.", time: "1 h" },
  { id: "m4", name: "Maria Lima", initials: "ML", color: "#ef4444", preview: "Reunião remarcada pra amanhã 10h.", time: "ontem" },
];

/* ── Props tables ─────────────────────────────────────────────────────────── */

const PROPS_HEADER = [
  { name: "breadcrumb", type: "HeaderBreadcrumbItem[]", defaultVal: "—", required: true },
  { name: "onCollapseMenu", type: "() => void", defaultVal: "—" },
  { name: "menuCollapsed", type: "boolean", defaultVal: "—" },
  { name: "showSearch", type: "boolean", defaultVal: "true" },
  { name: "searchPlaceholder", type: "string", defaultVal: '"Buscar..."' },
  { name: "searchShortcut", type: "string", defaultVal: '"⌘K"' },
  { name: "commandGroups", type: "HeaderCommandGroup[]", defaultVal: "[]" },
  { name: "commandPlaceholder", type: "string", defaultVal: '"Digite um comando ou busque..."' },
  { name: "commandEmptyMessage", type: "string", defaultVal: '"Nenhum resultado encontrado."' },
  { name: "notifications", type: "HeaderNotificationsConfig", defaultVal: "—" },
  { name: "messages", type: "HeaderMessagesConfig", defaultVal: "—" },
  { name: "theme", type: "string", defaultVal: "—" },
  { name: "onThemeChange", type: "(id: string) => void", defaultVal: "—" },
  { name: "themeOptions", type: "HeaderThemeOption[]", defaultVal: "[light, dark]" },
  { name: "rightSlot", type: "ReactNode", defaultVal: "—" },
];

const PROPS_DATA = [
  { name: "HeaderBreadcrumbItem", type: "{ label, href?, onClick? }", defaultVal: "—" },
  { name: "HeaderCommandGroup", type: "{ heading, items: HeaderCommandItem[] }", defaultVal: "—" },
  { name: "HeaderCommandItem", type: "{ label, icon?, shortcut?, keywords?, destructive?, onSelect }", defaultVal: "—" },
  { name: "HeaderNotification", type: "{ id, icon, color, title, body, time, unread?, kind?, onClick? }", defaultVal: "—" },
  { name: "HeaderNotificationsConfig", type: "{ items, filters?, onMarkAllRead?, onViewAll?, ... }", defaultVal: "—" },
  { name: "HeaderMessage", type: "{ id, name, initials, color, preview, time, unread?, group?, avatarUrl?, onClick? }", defaultVal: "—" },
  { name: "HeaderMessagesConfig", type: "{ items, filters?, showSearch?, onNewMessage?, onViewAll?, ... }", defaultVal: "—" },
  { name: "HeaderThemeOption", type: "{ id, label, icon: LucideIcon }", defaultVal: "—" },
];

/* ── Demo wrapper (preserva position pra demo) ────────────────────────────── */
function HeaderDemo({ children, tall }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <div
      className={`w-full rounded-radius-base ring-1 ring-border-subtle overflow-visible bg-bg-canvas ${
        tall ? "min-h-[640px]" : ""
      }`}
    >
      {children}
      <div className="p-pad-4xl">
        <p className="text-body-md text-fg-muted">
          (conteúdo da página fica aqui — o Header não é sticky por default, posição fica a cargo do template)
        </p>
      </div>
    </div>
  );
}

export function HeaderDoc() {
  const [theme, setTheme] = useState<string>("light");
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Templates"
        title="Header"
        description="Top bar template — breadcrumb + busca (Command palette) + theme switcher + messages + notifications. Todos os blocos opcionais via props/configs. Posição (sticky/fixed) fica a cargo do template consumer."
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Full Header */}
      <ExampleSection
        id="ex-full"
        title="Full Header"
        description="Todos os blocos ativos — breadcrumb, search com command palette, theme switcher, messages e notifications."
        code={`<Header
  breadcrumb={[{ label: "Clientes" }]}
  onCollapseMenu={() => setMenuCollapsed(c => !c)}
  menuCollapsed={menuCollapsed}
  commandGroups={COMMANDS}
  notifications={{ items: NOTIFICATIONS, onMarkAllRead, onViewAll }}
  messages={{ items: MESSAGES, onNewMessage, onViewAll }}
  theme={theme}
  onThemeChange={setTheme}
/>`}
      >
        <HeaderDemo tall>
          <Header
            breadcrumb={[{ label: "Clientes" }]}
            onCollapseMenu={() => setMenuCollapsed((c) => !c)}
            menuCollapsed={menuCollapsed}
            commandGroups={MOCK_COMMANDS}
            notifications={{
              items: MOCK_NOTIFICATIONS,
              onMarkAllRead: () => alert("Marcar todas como lidas"),
              onMoreActions: () => alert("Mais ações"),
              onViewAll: () => alert("Ver todas"),
            }}
            messages={{
              items: MOCK_MESSAGES,
              onNewMessage: () => alert("Nova mensagem"),
              onExpand: () => alert("Expandir"),
              onViewAll: () => alert("Ver todas"),
            }}
            theme={theme}
            onThemeChange={setTheme}
            themeOptions={[
              { id: "light", label: "Claro", icon: Sun },
              { id: "dark", label: "Escuro", icon: Moon },
              { id: "system", label: "Sistema", icon: Monitor },
            ]}
          />
        </HeaderDemo>
      </ExampleSection>

      {/* Breadcrumb */}
      <ExampleSection
        id="ex-breadcrumb"
        title="Breadcrumb multi-level"
        description="Array com 2+ itens renderiza como cadeia clicável. Último item é página atual (sem link)."
        code={`<Header breadcrumb={[
  { label: "Configurações", href: "/settings" },
  { label: "Usuários", href: "/settings/users" },
  { label: "João Silva" },
]} />`}
      >
        <HeaderDemo>
          <Header
            breadcrumb={[
              { label: "Configurações", href: "#settings", onClick: () => alert("→ Configurações") },
              { label: "Usuários", href: "#users", onClick: () => alert("→ Usuários") },
              { label: "João Silva" },
            ]}
            commandGroups={MOCK_COMMANDS}
          />
        </HeaderDemo>
      </ExampleSection>

      {/* Minimal */}
      <ExampleSection
        id="ex-minimal"
        title="Minimal (só título)"
        description="Sem busca, sem theme, sem notifications. Útil quando o Header é só pra título da página."
        code={`<Header
  breadcrumb={[{ label: "Dashboard" }]}
  showSearch={false}
/>`}
      >
        <HeaderDemo>
          <Header
            breadcrumb={[{ label: "Dashboard" }]}
            showSearch={false}
          />
        </HeaderDemo>
      </ExampleSection>

      {/* Collapse menu integrado */}
      <ExampleSection
        id="ex-collapse"
        title="Collapse menu integrado"
        description='Quando passar `onCollapseMenu`, o ícone aparece no canto esquerdo. Ícone alterna entre `PanelLeftClose` (aberto) e `PanelLeftOpen` (colapsado) conforme `menuCollapsed`. Use pra integrar com `<MenuSidebar>` via estado compartilhado.'
        code={`const [collapsed, setCollapsed] = useState(false);

<Header
  breadcrumb={[{ label: "Atendimentos" }]}
  onCollapseMenu={() => setCollapsed(c => !c)}
  menuCollapsed={collapsed}
/>

<MenuSidebar
  contexts={CONTEXTS}
  panelCollapsed={collapsed}
  onPanelCollapseChange={setCollapsed}
/>`}
      >
        <HeaderDemo>
          <Header
            breadcrumb={[{ label: "Atendimentos" }]}
            onCollapseMenu={() => setMenuCollapsed((c) => !c)}
            menuCollapsed={menuCollapsed}
            showSearch={false}
          />
          <div className="px-pad-4xl pb-pad-md text-body-md text-fg-muted">
            Estado: panel {menuCollapsed ? "colapsado" : "aberto"}.
            Clique o ícone à esquerda do título pra alternar.
          </div>
        </HeaderDemo>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div id="api-header" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          {"<Header>"}
        </h3>
        <PropsTable items={PROPS_HEADER} />
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
