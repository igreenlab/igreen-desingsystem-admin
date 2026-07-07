import {
  Crown,
  Network,
  Trophy,
  Wallet,
  Leaf,
  Antenna,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  Undo2,
  CreditCard,
  UserCheck,
  MapPin,
  Map,
} from "lucide-react";
import type {
  SidebarContext,
  SidebarMenuItem,
} from "@/components/ui/MenuSidebar";
import { FERRAMENTAS_CATALOG } from "./ferramentas-data";

/**
 * Navegação do Virtual Proposta — modelo por CONTEXTO (módulo) sobre o AppShell.
 *
 * Cada CONTEXTO do rail = um módulo:
 *   • Geral / Liderança  → tudo do líder e da rede dele (pessoal/transversal)
 *   • Energia · Telecom · Seguros → cada SEGMENTO, com a mesma estrutura
 *     (Dashboard · Clientes · Financeiro), pra navegação previsível.
 *
 * `href` é usado como id de navegação (mockado, sem router): o AppShell casa o
 * item ativo por href. Spec: docs/specs/2026-06-25-navegacao-single-menu-design.md
 */
export const NAV_CONTEXTS: SidebarContext[] = [
  {
    id: "geral",
    label: "Meu Painel",
    icon: Crown,
    items: [
      {
        name: "Painel do Líder",
        icon: LayoutDashboard,
        href: "#/geral/painel-v3",
      },
      {
        name: "Minha Rede",
        icon: Network,
        subitems: [
          { name: "Visão da Rede", href: "#/geral/rede-visao" },
          { name: "Mapa de Rede", href: "#/geral/mapa-rede" },
          { name: "Mapa de Clientes", href: "#/geral/mapa-clientes" },
          { name: "Pro Maker", href: "#/geral/pro-maker" },
        ],
      },
      {
        name: "Performance",
        icon: Trophy,
        subitems: [
          { name: "Análise da Rede", href: "#/geral/ranking" },
          { name: "Líder PRO", href: "#/geral/lider-pro" },
          { name: "Retenção", href: "#/geral/retencao" },
          { name: "Estatísticas", href: "#/geral/estatisticas" },
        ],
      },
      { name: "Extrato de Bônus", icon: Wallet, href: "#/geral/financeiro" },
    ],
    // "Ferramentas" não é mais um item de menu — virou seção de atalhos
    // (variante bookmark) injetada dinamicamente no AppShell, com catálogo
    // ativável via modal. Ver ferramentas-data.tsx + FerramentasCatalogDialog.
  },
  {
    id: "energia",
    label: "Energia",
    icon: Leaf,
    // Clientes Green — abas do original viraram itens de menu soltos.
    items: [
      { name: "Resumo", icon: LayoutDashboard, href: "#/energia/resumo" },
      { name: "Cadastros", icon: FileText, href: "#/energia/cadastros" },
      { name: "Devolutivas", icon: Undo2, href: "#/energia/devolutivas" },
      { name: "Financeiro", icon: CreditCard, href: "#/energia/financeiro-clientes" },
      { name: "Licenciados", icon: UserCheck, href: "#/energia/licenciados" },
      { name: "Cidades", icon: MapPin, href: "#/energia/cidades" },
      { name: "Mapa de Clientes", icon: Map, href: "#/energia/mapa" },
      { name: "Extrato de Bônus", icon: Receipt, href: "#/energia/financeiro" },
    ],
  },
  {
    id: "telecom",
    label: "Telecom",
    icon: Antenna,
    items: [
      { name: "Resumo", icon: LayoutDashboard, href: "#/telecom/resumo" },
      { name: "Cadastros", icon: FileText, href: "#/telecom/cadastros" },
      { name: "Pendências", icon: Undo2, href: "#/telecom/pendencias" },
      { name: "Financeiro", icon: CreditCard, href: "#/telecom/financeiro-clientes" },
      { name: "Licenciados", icon: UserCheck, href: "#/telecom/licenciados" },
      { name: "Cidades", icon: MapPin, href: "#/telecom/cidades" },
      { name: "Mapa de Clientes", icon: Map, href: "#/telecom/clientes" },
      { name: "Extrato de Bônus", icon: Receipt, href: "#/telecom/financeiro" },
    ],
  },
  {
    id: "seguros",
    label: "Seguros",
    icon: ShieldCheck,
    items: [
      { name: "Resumo", icon: LayoutDashboard, href: "#/seguros/resumo" },
      { name: "Cadastros", icon: FileText, href: "#/seguros/cadastros" },
      { name: "Pendências", icon: Undo2, href: "#/seguros/pendencias" },
      { name: "Financeiro", icon: CreditCard, href: "#/seguros/financeiro-clientes" },
      { name: "Licenciados", icon: UserCheck, href: "#/seguros/licenciados" },
      { name: "Cidades", icon: MapPin, href: "#/seguros/cidades" },
      { name: "Apólices / Clientes", icon: Users, href: "#/seguros/clientes" },
      { name: "Comissões", icon: Receipt, href: "#/seguros/financeiro" },
    ],
  },
];

/** Entrada achatada por href — pro breadcrumb, command palette e lookups. */
export type NavEntry = {
  href: string;
  /** Rótulo da folha (ex.: "Mapa de Rede"). */
  label: string;
  /** Rótulo do grupo pai, se houver (ex.: "Minha Rede"). */
  parentLabel?: string;
  contextId: string;
  contextLabel: string;
};

/** Todas as folhas navegáveis (itens-link + sub-itens), achatadas. */
export const NAV_ENTRIES: NavEntry[] = [
  ...NAV_CONTEXTS.flatMap((ctx) =>
    ctx.items.flatMap((item) => flattenItem(item, ctx.id, ctx.label)),
  ),
  // Ferramentas (atalhos) — registradas aqui pro breadcrumb e command palette
  // resolverem, mesmo não sendo itens de menu.
  ...FERRAMENTAS_CATALOG.map((t) => ({
    href: t.href,
    label: t.name,
    parentLabel: "Ferramentas",
    contextId: "geral",
    contextLabel: "Meu Painel",
  })),
];

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

/** Primeiro href navegável de um contexto. */
export function firstHrefOfContext(contextId: string): string {
  const entry = NAV_ENTRIES.find((e) => e.contextId === contextId);
  return entry?.href ?? NAV_ENTRIES[0].href;
}

/** Entrada de um href (ou a primeira como fallback). */
export function entryOfHref(href: string): NavEntry {
  return NAV_ENTRIES.find((e) => e.href === href) ?? NAV_ENTRIES[0];
}
