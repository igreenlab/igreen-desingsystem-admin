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
import { SidebarBrandIcon } from "../../components/ui/MenuSidebar";
import type { SingleMenuCategory } from "../../components/ui/SingleMenuSidebar";
import { LayoutGrid, Users, Wallet, Settings } from "lucide-react";
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
  { id: "sidebars", label: "Qual sidebar (menu × single)" },
  { id: "body-slot", label: "Body slot — gap + padding" },
  { id: "api", label: "API Reference" },
];

/**
 * Logo do header da sidebar — mesma caixa de marca do `#/single-menu-sidebar`.
 *
 * O header da sidebar é a **identidade do projeto**: logo + nome do sistema. Este
 * exemplo mostrava um ícone lucide cru (`<LayoutGrid/>`) e o texto "Sistema Único",
 * que é o nome da *variante* — quem olhava a página lia o rótulo da demo como se
 * fosse o padrão de conteúdo. O `logo` é `ReactNode` e o slot só faz `shrink-0`,
 * então o dimensionamento é de quem passa: caixa `size-form-lg` com o ícone dentro.
 */
const SIDEBAR_LOGO = (
  <div className="grid size-form-lg place-items-center rounded-radius-xl bg-bg-brand text-fg-on-brand">
    <SidebarBrandIcon size={18} />
  </div>
);

/**
 * Categorias pro exemplo de `sidebar="single"`. Nível único, sem módulos — é justamente o
 * caso que o `MenuSidebar` não atende: ele parte de um rail de módulos.
 *
 * Os `href` são de hash pra o exemplo navegar sem tirar o visitante da doc, e porque hash é
 * a exceção que NÃO tem a navegação cancelada (ver `@/utils/nav-link`).
 */
const SINGLE_CATEGORIES: SingleMenuCategory[] = [
  { id: "dashboard", icon: <LayoutGrid />, label: "Dashboard", href: "#s-dashboard" },
  {
    id: "clientes",
    icon: <Users />,
    label: "Clientes",
    items: [
      { id: "clientes-lista", label: "Todos", href: "#s-clientes" },
      { id: "clientes-novos", label: "Novos", href: "#s-novos" },
    ],
  },
  {
    id: "financeiro",
    icon: <Wallet />,
    label: "Financeiro",
    items: [
      { id: "fin-extrato", label: "Extrato", href: "#s-extrato" },
      { id: "fin-faturas", label: "Faturas", href: "#s-faturas" },
    ],
  },
  { id: "config", icon: <Settings />, label: "Configurações", href: "#s-config" },
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
  {
    name: "renderLink",
    type: "(props: SidebarLinkProps) => ReactNode",
    defaultVal: "— (<a href>)",
    description:
      "Integração de router. Sem ela o item de menu é um <a href> puro: com href de PATH (/app/clientes) o browser RECARREGA a página inteira a cada clique — bug achado por um consumidor em produção (L-068). O exemplo canônico usa href de HASH (#/app/clientes), e fragmento não recarrega documento, então nenhum gate pegava. Render-prop, não linkComponent: prop de tipo-de-componente escrita inline remonta a subárvore a cada render.",
  },
  {
    name: "brandHref",
    type: "string",
    defaultVal: '"#"',
    description:
      'O href do brand mark. O default "#" empurra "#" na URL do seu app. Passe "" (ou undefined + onBrandClick) pra desligar a navegação.',
  },
  {
    name: "onBrandClick",
    type: "(e: MouseEvent<HTMLAnchorElement>) => void",
    defaultVal: "—",
    description: "Clique no brand mark. Recebe o evento — útil com brandHref vazio.",
  },

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
  {
    name: "defaultMenuCollapsed",
    type: "boolean",
    defaultVal: "responsivo",
    description:
      "Estado inicial do collapse (uncontrolled). Omitido: colapsado abaixo de 1536px, expandido acima — mesma fronteira do padding do body. Valor explícito vence, inclusive false. Só no mount: resize não re-colapsa, pra não brigar com quem abriu o menu na mão.",
  },
  { name: "onMenuCollapseChange", type: "(collapsed) => void", defaultVal: "—" },
  { name: "children", type: "ReactNode (body slot)", defaultVal: "—", required: true },
  { name: "bodyClassName", type: "string (extra no body)", defaultVal: "—" },
  { name: "className", type: "string (extra no root)", defaultVal: "—" },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export function AppShellDoc() {
  const { theme, setTheme } = useTheme();
  const [layout, setLayout] = useState<string>("fluid");
  /** Item ativo do exemplo de `sidebar="single"` — controlado, pra mostrar o callback. */
  const [itemSingle, setItemSingle] = useState("dashboard");

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
        description='Sidebar com 5 contextos (Inbox/CRM/Engajamento/IA/Configuração), Header full (breadcrumb + command + notif + messages + theme), e body com cards exemplo demonstrando o slot (gap-gp-4xl + padding responsivo 18/24/32px).'
        code={CODE_FULL}
      >
        {/* `fillHeight` é OBRIGATÓRIO aqui: sem ele o shell mede 100vh, transborda
            esta caixa de 640px e o `overflow-hidden` corta o rodapé do body — o
            padding-bottom de 24px desaparecia junto, e o resultado parecia (mas não
            era) falta de padding. Medido em 2026-08-18: main de 660px numa caixa de
            640, terminando 56px abaixo da borda. */}
        <div className="h-[640px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden">
          <AppShell
            fillHeight
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

      <SectionH2 id="sidebars" title="Qual sidebar — menu × single" />

      <p className="text-body-lg text-fg-default mb-gp-lg max-w-[760px]">
        O shell monta <strong>uma das duas</strong> sidebars, pela prop{" "}
        <code className="font-mono">sidebar</code>. O default é{" "}
        <code className="font-mono">&quot;menu&quot;</code> — o mesmo comportamento de
        sempre, então nada muda pra quem já usa.
      </p>

      <div className="tw mb-gp-2xl max-w-[760px]">
        <table>
          <thead>
            <tr>
              <th>sidebar</th>
              <th>quando usar</th>
              <th>dados que exige</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="font-mono">&quot;menu&quot;</code> (default)
              </td>
              <td>
                app com <strong>áreas distintas</strong> (Comercial, Financeiro…), cada uma
                com menu próprio
              </td>
              <td>
                <code className="font-mono">contexts</code>
              </td>
            </tr>
            <tr>
              <td>
                <code className="font-mono">&quot;single&quot;</code>
              </td>
              <td>
                <strong>sistema único</strong>, um menu só — busca opcional
              </td>
              <td>
                <code className="font-mono">categories</code> +{" "}
                <code className="font-mono">sidebarLogo</code> +{" "}
                <code className="font-mono">sidebarTitle</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-body-md text-fg-muted mb-gp-2xl max-w-[760px]">
        O <strong>toggle do Header funciona nas duas</strong> sem o consumidor cabear nada. O
        mapeamento interno difere porque os componentes modelam o estado de formas diferentes:
        o MenuSidebar tem <code className="font-mono">panelCollapsed</code> + drawer no mobile;
        a single tem <code className="font-mono">expanded</code>, e no mobile o{" "}
        <code className="font-mono">expanded</code> <em>é</em> a visibilidade (expandida ocupa
        100% da largura, recolhida some).
      </p>

      <ExampleSection
        id="ex-sidebar-menu"
        title='sidebar="menu" — com módulos (default)'
        description="Rail de módulos à esquerda + painel do módulo ativo. É o que o shell monta quando você não passa a prop."
        code={`<AppShell contexts={CONTEXTS} breadcrumb={…}>…</AppShell>

{/* equivalente explícito */}
<AppShell sidebar="menu" contexts={CONTEXTS} …>`}
      >
        <div className="h-[420px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden">
          <AppShell
            fillHeight
            // Nasce expandido: o default do shell é RESPONSIVO (colapsa abaixo de 1536px), e
            // numa caixa de exemplo isso esconderia justamente o que se quer mostrar.
            defaultMenuCollapsed={false}
            sidebar="menu"
            contexts={APP_SHELL_CONTEXTS}
            defaultActiveContextId="inbox"
            defaultActiveItemHref="#atendimentos"
            breadcrumb={[{ label: "Inbox" }, { label: "Atendimentos" }]}
            user={APP_SHELL_USER}
          >
            <div className="flex-1 min-h-[120px] flex items-center justify-center bg-bg-surface border-2 border-dashed border-border-subtle rounded-radius-lg">
              <span className="text-body-md text-fg-muted font-mono">children</span>
            </div>
          </AppShell>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sidebar-single"
        title='sidebar="single" — sem módulos'
        description="Menu de nível único: logo e título no header da própria sidebar, com o toggle de recolher ali dentro. Sem rail de módulos e sem busca — o Header já tem a dele, e duplicar não faz sentido. O shell esconde o botão de colapsar do Header nesta variação, porque a sidebar tem o próprio (no mobile ele volta, senão não haveria como abrir)."
        code={`<AppShell
  sidebar="single"
  categories={CATEGORIES}
  sidebarLogo={<MinhaLogo />}
  sidebarTitle="Meu Sistema"
  activeItemId={ativo}
  onSidebarItemClick={setAtivo}
  breadcrumb={…}
>…</AppShell>

{/* busca: NÃO passe sidebarShowSearch aqui — o Header já tem \`commandGroups\`.
    Ligue só se a sidebar precisar de uma busca PRÓPRIA, de escopo diferente. */}`}
      >
        <div className="h-[420px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden">
          <AppShell
            fillHeight
            defaultMenuCollapsed={false}
            sidebar="single"
            categories={SINGLE_CATEGORIES}
            sidebarLogo={SIDEBAR_LOGO}
            sidebarTitle="iGreen System"
            activeItemId={itemSingle}
            onSidebarItemClick={setItemSingle}
            breadcrumb={[{ label: "Sistema" }, { label: "Dashboard" }]}
            user={APP_SHELL_USER}
            onSettings={() => alert("Configurações")}
            onLogout={() => alert("Sair (mock)")}
          >
            <div className="flex-1 min-h-[120px] flex items-center justify-center bg-bg-surface border-2 border-dashed border-border-subtle rounded-radius-lg">
              <span className="text-body-md text-fg-muted font-mono">
                children — item ativo: {itemSingle}
              </span>
            </div>
          </AppShell>
        </div>
      </ExampleSection>

      <DocSeparator />

      <SectionH2 id="body-slot" title="Body slot — gap + padding" />

      <p className="text-body-lg text-fg-default mb-gp-lg max-w-[760px]">
        O body tem 3 propriedades de layout fixas (não-configuráveis):
      </p>

      <ul className="text-body-md text-fg-muted mb-gp-2xl max-w-[760px] list-disc pl-pad-2xl space-y-gp-sm">
        <li>
          <code className="font-mono">gap-gp-4xl</code> (24px) — espaço vertical entre filhos diretos
        </li>
        <li>
          <strong className="text-fg-default">Padding responsivo em 3 patamares</strong> —{" "}
          <code className="font-mono">18px</code> abaixo de 768px,{" "}
          <code className="font-mono">p-pad-4xl</code> (24px) entre 768 e 1535px (notebook) e{" "}
          <code className="font-mono">p-pad-6xl</code> (32px) de 1536px pra cima. O corte é em{" "}
          <code className="font-mono">2xl</code> e não em <code className="font-mono">xl</code> porque
          1366 e 1536 são as duas resoluções de notebook dominantes — cortar em{" "}
          <code className="font-mono">xl</code> (1280) deixaria a 1536 herdando a moldura de desktop.
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
      {/* Body — o que muda entre telas. gap-gp-4xl + padding responsivo (18/24/32px) aplicados auto. */}
      <h1 className="text-heading-md">Atendimentos</h1>
      <DataTable ... />
    </AppShell>
  );
}`;
