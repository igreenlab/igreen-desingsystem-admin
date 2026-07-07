import { useMemo, useState, type ReactNode } from "react";
import {
  Sun,
  Moon,
  Monitor,
  UserX,
  TriangleAlert,
  TrendingDown,
} from "lucide-react";
import { AppShell as DSAppShell } from "@/components/ui/AppShell";
import { useTheme, type Theme } from "@/hooks/useTheme";
import type {
  HeaderCommandGroup,
  HeaderThemeOption,
  HeaderNotificationsConfig,
} from "@/components/ui/Header";
import type { SidebarMenuItem } from "@/components/ui/MenuSidebar";
import {
  NAV_CONTEXTS,
  NAV_ENTRIES,
  firstHrefOfContext,
  entryOfHref,
} from "~/nav/nav-data";
import {
  FERRAMENTAS_CATALOG,
  DEFAULT_ENABLED_TOOLS,
} from "~/nav/ferramentas-data";
import { FerramentasCatalogDialog } from "~/layout/FerramentasCatalogDialog";
import type { SidebarContext } from "@/components/ui/MenuSidebar";
import { alerts } from "~/pages/painel/painel-mock";
import { PainelPage } from "~/pages/painel/PainelPage";
import { PainelV2Page } from "~/pages/painel-v2/PainelV2Page";
import { PainelV3Page } from "~/pages/painel-v3/PainelV3Page";
import { RedeVisaoPage } from "~/pages/rede/RedeVisaoPage";
import { ProMakerPage } from "~/pages/pro-maker/ProMakerPage";
import { MapaRedePage } from "~/pages/mapa-rede/MapaRedePage";
import { MapaClientesPage } from "~/pages/mapa-clientes/MapaClientesPage";
import { ExtratoBonusPage } from "~/pages/extrato-bonus/ExtratoBonusPage";
import { AnaliseRedePage } from "~/pages/analise-rede/AnaliseRedePage";
import { LiderProPage } from "~/pages/lider-pro/LiderProPage";
import { RetencaoPage } from "~/pages/retencao/RetencaoPage";
import { EstatisticasPage } from "~/pages/estatisticas/EstatisticasPage";
import { EnergiaDashboardPage } from "~/pages/energia/EnergiaDashboardPage";
import { FinanceiroPage } from "~/pages/financeiro/FinanceiroPage";
import { CidadesPage } from "~/pages/cidades/CidadesPage";
import { LicenciadosPage } from "~/pages/licenciados/LicenciadosPage";
import { CadastrosPage } from "~/pages/cadastros/CadastrosPage";
import { DevolutivasPage } from "~/pages/devolutivas/DevolutivasPage";
import { TelecomResumoPage } from "~/pages/telecom/TelecomResumoPage";
import { TelecomCadastrosPage } from "~/pages/telecom/cadastros/TelecomCadastrosPage";
import { TelecomPendenciasPage } from "~/pages/telecom/pendencias/TelecomPendenciasPage";
import { TelecomFinanceiroPage } from "~/pages/telecom/financeiro/TelecomFinanceiroPage";
import { TelecomLicenciadosPage } from "~/pages/telecom/licenciados/TelecomLicenciadosPage";
import { TelecomCidadesPage } from "~/pages/telecom/cidades/TelecomCidadesPage";
import { SegurosResumoPage } from "~/pages/seguros/SegurosResumoPage";
import { SegurosCadastrosPage } from "~/pages/seguros/cadastros/SegurosCadastrosPage";
import { SegurosPendenciasPage } from "~/pages/seguros/pendencias/SegurosPendenciasPage";
import { SegurosFinanceiroPage } from "~/pages/seguros/financeiro/SegurosFinanceiroPage";
import { SegurosLicenciadosPage } from "~/pages/seguros/licenciados/SegurosLicenciadosPage";
import { SegurosCidadesPage } from "~/pages/seguros/cidades/SegurosCidadesPage";

// Default = "system" (segue o tema do SO; no caso do usuário, dark). O hook
// useTheme persiste em localStorage e aplica `.dark` no <html>.
const THEME_OPTIONS: HeaderThemeOption[] = [
  { id: "system", label: "Sistema", icon: Monitor },
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const [contextId, setContextId] = useState("geral");
  const [itemHref, setItemHref] = useState(() => firstHrefOfContext("geral"));
  const { theme, setTheme } = useTheme();

  // Ferramentas ativadas (atalhos no sidebar) + estado do catálogo (modal).
  const [enabledTools, setEnabledTools] = useState<string[]>(DEFAULT_ENABLED_TOOLS);
  const [catalogOpen, setCatalogOpen] = useState(false);

  function toggleTool(id: string) {
    setEnabledTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  // Injeta a seção "Ferramentas" (variante bookmark) no contexto "geral":
  // só as ferramentas ativadas viram atalho; o "+" abre o catálogo.
  const contexts = useMemo<SidebarContext[]>(
    () =>
      NAV_CONTEXTS.map((ctx) => {
        if (ctx.id !== "geral") return ctx;
        const toolItems = FERRAMENTAS_CATALOG.filter((t) =>
          enabledTools.includes(t.id),
        ).map((t) => ({
          name: t.name,
          color: t.color,
          icon: t.icon,
          onClick: () => setItemHref(t.href),
        }));
        return {
          ...ctx,
          sections: [
            ...(ctx.sections ?? []),
            {
              id: "ferramentas",
              label: "Ferramentas",
              variant: "bookmark" as const,
              items: toolItems,
              onAdd: () => setCatalogOpen(true),
            },
          ],
        };
      }),
    [enabledTools],
  );

  function handleContextChange(id: string) {
    setContextId(id);
    setItemHref(firstHrefOfContext(id)); // evita item órfão de outro contexto
  }

  function handleItemClick(item: SidebarMenuItem) {
    if (item.href) setItemHref(item.href);
  }

  const active = entryOfHref(itemHref);

  const breadcrumb = useMemo(
    () =>
      active.parentLabel
        ? [
            { label: active.contextLabel },
            { label: active.parentLabel },
            { label: active.label },
          ]
        : [{ label: active.contextLabel }, { label: active.label }],
    [active],
  );

  // Notificações = "ações necessárias" do painel (inativos / licenças / quedas).
  const notifications = useMemo<HeaderNotificationsConfig>(
    () => ({
      items: [
        {
          id: "inativos",
          icon: UserX,
          color: "var(--color-fg-danger)",
          title: `${alerts.inativos.count} licenciados inativos`,
          body: alerts.inativos.hint,
          time: "agora",
          unread: alerts.inativos.count > 0,
          kind: "alert",
        },
        {
          id: "licencas",
          icon: TriangleAlert,
          color: "var(--color-fg-warning)",
          title: `${alerts.licencas.count} licenças a vencer`,
          body: alerts.licencas.hint,
          time: "agora",
          unread: alerts.licencas.count > 0,
          kind: "alert",
        },
        {
          id: "quedas",
          icon: TrendingDown,
          color: "var(--color-fg-danger)",
          title: `${alerts.quedasRanking.count} quedas de ranking`,
          body: alerts.quedasRanking.hint,
          time: "este mês",
          unread: alerts.quedasRanking.count > 0,
          kind: "alert",
        },
      ],
      emptyMessage: "Nenhuma ação pendente.",
      onMarkAllRead: () => {},
      onViewAll: () => {},
      viewAllLabel: "Ver todas as ações",
    }),
    [],
  );

  // Command palette (⌘K): um grupo por contexto, navegando ao selecionar.
  const commandGroups = useMemo<HeaderCommandGroup[]>(
    () =>
      NAV_CONTEXTS.map((ctx) => ({
        heading: ctx.label,
        items: NAV_ENTRIES.filter((e) => e.contextId === ctx.id).map((e) => ({
          id: e.href,
          label: e.parentLabel ? `${e.parentLabel} › ${e.label}` : e.label,
          onSelect: () => {
            setContextId(e.contextId);
            setItemHref(e.href);
          },
        })),
      })),
    [],
  );

  return (
    <>
      <DSAppShell
        contexts={contexts}
        activeContextId={contextId}
        onContextChange={handleContextChange}
        activeItemHref={itemHref}
        onItemClick={handleItemClick}
        breadcrumb={breadcrumb}
        commandGroups={commandGroups}
        notifications={notifications}
        searchPlaceholder="Buscar no Virtual Office…"
        theme={theme}
        onThemeChange={(id) => setTheme(id as Theme)}
        themeOptions={THEME_OPTIONS}
        user={{
          name: "Sérgio Vieira",
          email: "sergio.vieira@igreenenergy.com.br",
        }}
        onLogout={() => {
          window.location.hash = "#/login";
        }}
        onSettings={() => {}}
      >
        {children ?? renderContent()}
      </DSAppShell>

      <FerramentasCatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        enabledIds={enabledTools}
        onToggle={toggleTool}
      />
    </>
  );

  function renderContent() {
    if (itemHref === "#/geral/painel") return <PainelPage />;
    if (itemHref === "#/geral/painel-v2") return <PainelV2Page />;
    if (itemHref === "#/geral/painel-v3") return <PainelV3Page />;
    if (itemHref === "#/geral/rede-visao") return <RedeVisaoPage />;
    if (itemHref === "#/geral/pro-maker") return <ProMakerPage />;
    if (itemHref === "#/geral/mapa-rede") return <MapaRedePage />;
    if (itemHref === "#/geral/mapa-clientes") return <MapaClientesPage />;
    if (itemHref === "#/geral/financeiro") return <ExtratoBonusPage />;
    if (itemHref === "#/geral/ranking") return <AnaliseRedePage />;
    if (itemHref === "#/geral/lider-pro") return <LiderProPage />;
    if (itemHref === "#/geral/retencao") return <RetencaoPage />;
    if (itemHref === "#/geral/estatisticas") return <EstatisticasPage />;
    if (itemHref === "#/energia/resumo") return <EnergiaDashboardPage />;
    if (itemHref === "#/energia/financeiro-clientes") return <FinanceiroPage />;
    if (itemHref === "#/energia/cidades") return <CidadesPage />;
    if (itemHref === "#/energia/licenciados") return <LicenciadosPage />;
    if (itemHref === "#/energia/cadastros") return <CadastrosPage />;
    if (itemHref === "#/energia/devolutivas") return <DevolutivasPage />;
    // Mapa de Clientes e Extrato de Bônus do Green reutilizam as telas do Meu
    // Painel (mesmas telas; sem dimensão de categoria nos mocks por ora).
    if (itemHref === "#/energia/mapa") return <MapaClientesPage />;
    if (itemHref === "#/energia/financeiro") return <ExtratoBonusPage />;
    if (itemHref === "#/telecom/resumo") return <TelecomResumoPage />;
    if (itemHref === "#/telecom/cadastros") return <TelecomCadastrosPage />;
    if (itemHref === "#/telecom/pendencias") return <TelecomPendenciasPage />;
    if (itemHref === "#/telecom/financeiro-clientes") return <TelecomFinanceiroPage />;
    if (itemHref === "#/telecom/licenciados") return <TelecomLicenciadosPage />;
    if (itemHref === "#/telecom/cidades") return <TelecomCidadesPage />;
    // Mapa de Clientes e Extrato de Bônus do Telecom reusam as telas do Meu Painel.
    if (itemHref === "#/telecom/clientes") return <MapaClientesPage />;
    if (itemHref === "#/telecom/financeiro") return <ExtratoBonusPage />;
    if (itemHref === "#/seguros/resumo") return <SegurosResumoPage />;
    if (itemHref === "#/seguros/cadastros") return <SegurosCadastrosPage />;
    if (itemHref === "#/seguros/pendencias") return <SegurosPendenciasPage />;
    if (itemHref === "#/seguros/financeiro-clientes") return <SegurosFinanceiroPage />;
    if (itemHref === "#/seguros/licenciados") return <SegurosLicenciadosPage />;
    if (itemHref === "#/seguros/cidades") return <SegurosCidadesPage />;
    // Apólices/Clientes e Comissões do Seguros reusam as telas do Meu Painel.
    if (itemHref === "#/seguros/clientes") return <MapaClientesPage />;
    if (itemHref === "#/seguros/financeiro") return <ExtratoBonusPage />;
    return <ContentPlaceholder />;
  }

  function ContentPlaceholder() {
    return (
      <div className="grid h-full min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-gp-sm text-center">
          <span className="text-caption-md uppercase tracking-wide text-fg-muted">
            {active.contextLabel}
          </span>
          <h1 className="text-heading-md text-fg-default">{active.label}</h1>
          <p className="text-body-sm text-fg-muted">Tela em construção.</p>
        </div>
      </div>
    );
  }
}
