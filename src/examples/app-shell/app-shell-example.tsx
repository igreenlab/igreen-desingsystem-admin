import { useEffect, useMemo, useState } from "react";
import { Sun, Moon, CheckCircle2, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
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
} from "./nav-data";
import { resolveRoute } from "./routes";

/**
 * AppShellExample — esqueleto de aplicação runnable: rail de contextos (módulos)
 * + Header (breadcrumb, ⌘K, notificações, tema, user) + body resolvido por um
 * MAPA DE ROTAS declarativo (`routes.tsx`).
 *
 * Tudo que muda por app: `nav-data.ts` (contextos/itens) e `routes.tsx` (href →
 * tela). Este arquivo é o cabeamento — normalmente não precisa mexer. Navegação
 * é por estado (mock); pra router real, ligue `activeItemHref`/`onItemClick` +
 * `activeContextId`/`onContextChange` ao seu router e mantenha o href como path.
 *
 * Tema: state local que alterna a classe `.dark` no `<html>` (self-contained,
 * sem dep de hook externo). Troque pelo provider de tema do seu app se tiver.
 */
const THEME_OPTIONS: HeaderThemeOption[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
];

export function AppShellExample() {
  const [contextId, setContextId] = useState(NAV_CONTEXTS[0].id);
  const [itemHref, setItemHref] = useState(() =>
    firstHrefOfContext(NAV_CONTEXTS[0].id),
  );
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

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

  // ⌘K: um grupo por contexto, navegando ao selecionar.
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

  const notifications = useMemo<HeaderNotificationsConfig>(
    () => ({
      items: [
        {
          id: "welcome",
          icon: CheckCircle2,
          color: "var(--color-fg-success)",
          title: "Bem-vindo ao esqueleto",
          body: "Troque nav-data + routes pelo seu app.",
          time: "agora",
          unread: true,
        },
        {
          id: "stub",
          icon: TriangleAlert,
          color: "var(--color-fg-warning)",
          title: "Telas em stub",
          body: "Monte cada tela com os builders do DS.",
          time: "agora",
          unread: true,
        },
      ],
      emptyMessage: "Nenhuma notificação.",
      onMarkAllRead: () => {},
      onViewAll: () => {},
    }),
    [],
  );

  return (
    <AppShell
      contexts={NAV_CONTEXTS}
      activeContextId={contextId}
      onContextChange={handleContextChange}
      activeItemHref={itemHref}
      onItemClick={handleItemClick}
      breadcrumb={breadcrumb}
      commandGroups={commandGroups}
      notifications={notifications}
      searchPlaceholder="Buscar…"
      theme={theme}
      onThemeChange={(id) => setTheme(id === "dark" ? "dark" : "light")}
      themeOptions={THEME_OPTIONS}
      user={{ name: "Ana Souza", email: "ana@exemplo.com" }}
      onSettings={() => setItemHref("#/config/perfil")}
      onLogout={() => {}}
    >
      {resolveRoute(itemHref)}
    </AppShell>
  );
}

export default AppShellExample;
