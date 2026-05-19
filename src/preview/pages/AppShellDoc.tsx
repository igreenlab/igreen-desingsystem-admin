import { useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";
import { AppShell } from "../../components/ui/AppShell";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
  APP_SHELL_LAYOUT_OPTIONS,
  APP_SHELL_USER,
} from "../mocks/app-shell-mocks";

/* ── TOC ─────────────────────────────────────────────────── */

const TOC = [
  { id: "preview", label: "Preview" },
  { id: "body-slot", label: "Body slot — gap + padding" },
  { id: "api", label: "API Reference" },
];

/* ── Props tables ────────────────────────────────────────── */

const PROPS_APP_SHELL = [
  { name: "contexts", type: "SidebarContext[]", defaultVal: "—", required: true },
  { name: "defaultActiveContextId", type: "string", defaultVal: "contexts[0].id" },
  { name: "activeContextId", type: "string (controlled)", defaultVal: "—" },
  { name: "onContextChange", type: "(id) => void", defaultVal: "—" },
  { name: "defaultActiveItemHref", type: "string", defaultVal: "—" },
  { name: "activeItemHref", type: "string (controlled)", defaultVal: "—" },
  { name: "onItemClick", type: "(item) => void", defaultVal: "—" },
  { name: "breadcrumb", type: "HeaderBreadcrumbItem[]", defaultVal: "—", required: true },
  { name: "commandGroups", type: "HeaderCommandGroup[]", defaultVal: "—" },
  { name: "notifications", type: "HeaderNotificationsConfig", defaultVal: "—" },
  { name: "messages", type: "HeaderMessagesConfig", defaultVal: "—" },
  { name: "theme", type: "string (controlled)", defaultVal: "—" },
  { name: "onThemeChange", type: "(id) => void", defaultVal: "—" },
  { name: "themeOptions", type: "HeaderThemeOption[]", defaultVal: "[light, dark]" },
  { name: "headerRightSlot", type: "ReactNode", defaultVal: "—" },
  { name: "user", type: "AppShellUser", defaultVal: "— (avatar \"SV\" estático)" },
  { name: "layout", type: "string (controlled)", defaultVal: "—" },
  { name: "onLayoutChange", type: "(id) => void", defaultVal: "—" },
  { name: "layoutOptions", type: "AppShellLayoutOption[]", defaultVal: "—" },
  { name: "onSettings", type: "() => void", defaultVal: "— (item escondido)" },
  { name: "onLogout", type: "() => void", defaultVal: "— (item escondido)" },
  { name: "menuCollapsed", type: "boolean (controlled)", defaultVal: "—" },
  { name: "defaultMenuCollapsed", type: "boolean", defaultVal: "false" },
  { name: "onMenuCollapseChange", type: "(collapsed) => void", defaultVal: "—" },
  { name: "children", type: "ReactNode (body slot)", defaultVal: "—", required: true },
  { name: "bodyClassName", type: "string (extra no body)", defaultVal: "—" },
  { name: "className", type: "string (extra no root)", defaultVal: "—" },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export function AppShellDoc() {
  const { theme, setTheme } = useTheme();
  const [layout, setLayout] = useState<string>("fluid");

  /* Body de exemplo — apenas placeholder demonstrando o slot. */
  const sampleBody = (
    <div className="flex-1 min-h-[200px] flex items-center justify-center bg-bg-surface border-2 border-dashed border-border-subtle rounded-radius-lg">
      <span className="text-body-md text-fg-muted font-mono">children</span>
    </div>
  );

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Templates"
        title="AppShell"
        description="Template de aplicação — compõe MenuSidebar (rail + panel) + Header (top bar) + body slot livre. Aplicado em todas as telas do app; consumer customiza apenas children (body)."
      />

      <DocSeparator />

      <SectionH2 id="preview" title="Preview" />

      <ExampleSection
        id="ex-full"
        title="AppShell completo — sidebar + header + body"
        description='Sidebar com 5 contextos (Inbox/CRM/Engajamento/IA/Configuração), Header full (breadcrumb + command + notif + messages + theme), e body com cards exemplo demonstrando o slot "gap-gp-md p-pad-2xl".'
        code={CODE_FULL}
      >
        <div className="h-[640px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden">
          <AppShell
            contexts={APP_SHELL_CONTEXTS}
            defaultActiveContextId="inbox"
            defaultActiveItemHref="#atendimentos"
            breadcrumb={[{ label: "Inbox" }, { label: "Atendimentos" }]}
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
            user={APP_SHELL_USER}
            layout={layout}
            onLayoutChange={setLayout}
            layoutOptions={APP_SHELL_LAYOUT_OPTIONS}
            onSettings={() => alert("Configurações")}
            onLogout={() => alert("Sair (mock)")}
          >
            {sampleBody}
          </AppShell>
        </div>
      </ExampleSection>

      <SectionH2 id="body-slot" title="Body slot — gap + padding" />

      <p className="text-body-lg text-fg-default mb-gp-lg max-w-[760px]">
        O body tem 3 propriedades de layout fixas (não-configuráveis):
      </p>

      <ul className="text-body-md text-fg-muted mb-gp-2xl max-w-[760px] list-disc pl-pad-2xl space-y-gp-sm">
        <li>
          <code className="font-mono">gap-gp-md</code> (16px) — espaço vertical entre filhos diretos
        </li>
        <li>
          <code className="font-mono">p-pad-6xl</code> (32px) — padding em todos os lados
        </li>
        <li>
          <code className="font-mono">flex-col flex-1 min-h-0 overflow-auto scrollbar-thin</code> —
          ocupa o resto do viewport (depois do Header), com scroll vertical interno (não scrolla a página)
        </li>
      </ul>

      <p className="text-body-md text-fg-muted mb-gp-3xl max-w-[760px]">
        Padronizado intencionalmente — todas as telas têm o mesmo respiro. Pra ajustes pontuais use
        <code className="font-mono">bodyClassName</code>. Pra trocar fundamentos (ex: padding diferente
        em telas full-bleed), o template precisa ser estendido ou consumer wrappa AppShell.
      </p>

      <SectionH2 id="api" title="API Reference" />

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">
          AppShellProps
        </h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl max-w-[760px]">
          Props divididas em 4 grupos: <strong>Sidebar</strong> (passthrough pra MenuSidebar),
          <strong> Header</strong> (passthrough), <strong>Menu collapse</strong> (state híbrido
          controlled/uncontrolled), <strong>Body</strong> (children + classNames).
        </p>
        <PropsTable items={PROPS_APP_SHELL} />
      </div>
    </DocLayout>
  );
}

export default AppShellDoc;

/* ── Code snippet pro ExampleSection ─────────────────────── */

const CODE_FULL = `import { AppShell } from "@/components/ui/AppShell";

// Mocks declarados em arquivo compartilhado (ex: src/config/app-shell-mocks.ts)
import {
  CONTEXTS, COMMANDS, NOTIFICATIONS, MESSAGES,
  THEME_OPTIONS, LAYOUT_OPTIONS, USER,
} from "@/config/app-shell-mocks";

export function AtendimentosPage() {
  const [theme, setTheme] = useState("light");
  const [layout, setLayout] = useState("fluid");

  return (
    <AppShell
      contexts={CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#atendimentos"
      breadcrumb={[{ label: "Inbox" }, { label: "Atendimentos" }]}
      commandGroups={COMMANDS}
      notifications={{ items: NOTIFICATIONS, onMarkAllRead, onViewAll }}
      messages={{ items: MESSAGES, onNewMessage, onViewAll }}
      theme={theme}
      onThemeChange={setTheme}
      themeOptions={THEME_OPTIONS}
      // User menu (avatar do rail com DropdownMenu)
      user={USER}                              // { name, email, initials?, avatarSrc? }
      layout={layout}
      onLayoutChange={setLayout}
      layoutOptions={LAYOUT_OPTIONS}           // [{ id: "fluid", label, icon }, ...]
      onSettings={() => router.push("/settings")}
      onLogout={() => signOut()}
    >
      {/* Body — o que muda entre telas. gap-gp-md + p-pad-2xl aplicados auto. */}
      <h1 className="text-heading-md">Atendimentos</h1>
      <DataTable ... />
    </AppShell>
  );
}`;
