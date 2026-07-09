import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  User,
  UsersRound,
} from "lucide-react";
import type {
  SidebarContext,
  SidebarMenuItem,
} from "@/components/ui/MenuSidebar";

/**
 * nav-data — navegação do esqueleto de app, por CONTEXTO (módulo no rail).
 *
 * Modelo genérico de SaaS (adapte ao seu app): cada CONTEXTO é um módulo com
 * seus itens; itens podem ter `subitems` (grupo expansível). O `href` é o id de
 * navegação — o AppShell casa o item ativo por href e o mapa de rotas
 * (`routes.tsx`) resolve o componente. Sem router externo (troque por
 * react-router/next se quiser: mantenha o href como path).
 */
export const NAV_CONTEXTS: SidebarContext[] = [
  {
    id: "app",
    label: "Aplicação",
    icon: LayoutDashboard,
    items: [
      { name: "Início", icon: LayoutDashboard, href: "#/app/inicio" },
      { name: "Clientes", icon: Users, href: "#/app/clientes" },
      {
        name: "Relatórios",
        icon: BarChart3,
        subitems: [
          { name: "Vendas", href: "#/app/relatorios/vendas" },
          { name: "Desempenho", href: "#/app/relatorios/desempenho" },
        ],
      },
    ],
  },
  {
    id: "config",
    label: "Configurações",
    icon: Settings,
    items: [
      { name: "Perfil", icon: User, href: "#/config/perfil" },
      { name: "Equipe", icon: UsersRound, href: "#/config/equipe" },
    ],
  },
];

/** Entrada achatada por href — pro breadcrumb, command palette (⌘K) e lookups. */
export type NavEntry = {
  href: string;
  label: string;
  parentLabel?: string;
  contextId: string;
  contextLabel: string;
};

function flattenItem(
  item: SidebarMenuItem,
  contextId: string,
  contextLabel: string,
): NavEntry[] {
  if (item.subitems && item.subitems.length > 0) {
    return item.subitems
      .filter((s) => s.href)
      .map((s) => ({
        href: s.href!,
        label: s.name,
        parentLabel: item.name,
        contextId,
        contextLabel,
      }));
  }
  if (item.href) {
    return [{ href: item.href, label: item.name, contextId, contextLabel }];
  }
  return [];
}

/** Todas as folhas navegáveis (itens-link + sub-itens), achatadas. */
export const NAV_ENTRIES: NavEntry[] = NAV_CONTEXTS.flatMap((ctx) =>
  ctx.items.flatMap((item) => flattenItem(item, ctx.id, ctx.label)),
);

/** Primeiro href navegável de um contexto (evita item órfão ao trocar de módulo). */
export function firstHrefOfContext(contextId: string): string {
  const entry = NAV_ENTRIES.find((e) => e.contextId === contextId);
  return entry?.href ?? NAV_ENTRIES[0].href;
}

/** Entrada de um href (ou a primeira como fallback). */
export function entryOfHref(href: string): NavEntry {
  return NAV_ENTRIES.find((e) => e.href === href) ?? NAV_ENTRIES[0];
}
