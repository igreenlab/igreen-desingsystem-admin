/**
 * updates-data.ts — Timeline de updates do iGreen Design System
 *
 * Como adicionar uma nova entry:
 *   1. Adicione um objeto ReleaseEntry NO TOPO do array RELEASES (mais recente primeiro)
 *   2. Use semver ou tag "preview" para versões em desenvolvimento
 *   3. Agrupe as mudanças por type ("added" | "changed" | "fixed" | "removed" | "improved" | "deprecated" | "breaking")
 *   4. Cada item da lista vai virar uma linha bullet na timeline
 *
 * Esse arquivo é fonte única — a página UpdatesDoc renderiza tudo automaticamente.
 */

export type ChangeType =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "improved"
  | "deprecated"
  | "breaking";

export type ReleaseTag = "preview" | "release" | "patch" | "milestone";

export interface ChangeGroup {
  type: ChangeType;
  items: string[];
}

export interface ReleaseEntry {
  /** Versão semver ou identificador de preview */
  version: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Tag visual da release */
  tag: ReleaseTag;
  /** Título curto resumindo a release */
  title: string;
  /** Parágrafo opcional explicando o contexto */
  summary?: string;
  /** Lista de mudanças agrupadas por tipo */
  changes: ChangeGroup[];
}

/**
 * Adicione novas entries NO TOPO. Mais recente primeiro.
 */
export const RELEASES: ReleaseEntry[] = [
  {
    version: "0.3.0",
    date: "2026-05-19",
    tag: "preview",
    title: "FloatingPanel + PageHeader + DataTable responsivo + CLI bootstrap",
    summary:
      "Release grande consolidando 2 componentes DS novos (FloatingPanel non-modal e PageHeader template), DataTable inteiramente responsivo (auto-switch table↔card em mobile, toolbar colapsável em <xl, skeleton pagination), AppShell com user menu + layout switcher, e a CLI @snksergio/create-design-system pra bootstrap. Também várias melhorias de cross-component (useTheme global sincronizado, hover tokens, dark mode contrast).",
    changes: [
      {
        type: "added",
        items: [
          "Componente FloatingPanel — drawer card flutuante non-modal com resize horizontal, maximize toggle e auto sheet bottom-up em mobile",
          "Componente PageHeader (Templates) — title + description + badge + actions + slot children, mobile-ready (esconde texto e CTA vira fluido por default)",
          "AppShell user menu — avatar do rail vira DropdownMenu com nome/email + layout (Fluido/Compacto) + tema (Sistema/Claro/Escuro) + Configurações + Sair",
          "AppShell layout prop ('fluid' | 'compact') — modo compact limita body em var(--container-main-content-max) centralizado",
          "AppShell mobileEdgeToEdge prop — zera padding mobile do body (chat-like screens)",
          "DataTable auto-card mode em mobile — abaixo de cardBreakpoint (default 768px) cada row vira <TableCardRow> automaticamente; coluna isPrimary vira título do card",
          "DataTable toolbar responsiva — sort/cols/density/export/moreMenu colapsam num icon-button dropdown via ToolbarMobileDialog em viewports <xl (1280px)",
          "FooterTableSkeleton — skeleton silhouette pro footer durante isLoading do DataTable (server mode sem flash 1-página)",
          "ClientesShowcase CRUD completo — NovoClienteDrawer (form), DetailDrawer (FloatingPanel) e AlertModal pro fluxo de delete (row action + bulk + drawer)",
          "DashboardShowcase — KPIs primary/quality, charts (Volume stacked + Visits donut), tabela Traffic, padrão completo de admin dashboard",
          "CLI @snksergio/create-design-system — bootstrap CLI pra criar novo projeto a partir do template default",
          "Setup npm package (build de library) com multi-entry exports",
          "Token container-main-content-max (1368px) — max-width canônico de body em modo compact",
        ],
      },
      {
        type: "improved",
        items: [
          "Hook useTheme com 3 valores (light/dark/system) e sincronização entre instâncias via CustomEvent + storage (cross-tab)",
          "DataTable row focused: bg-bg-table-row-selected + outline brand (mesmo visual do row selected via checkbox)",
          "Hover token bg-input-hover consumido por Input/Select/Textarea/InputGroup (visível no light, alpha no dark)",
          "DropdownMenu RadioItem com state checked: bg-bg-brand-subtle + text-fg-brand + Check icon (antes era Circle bullet)",
          "Header title vertical alignment: leading-none no breadcrumb-item (antes empurrava pra cima)",
          "Slider e Progress track: bg-bg-emphasis (light) / bg-bg-accent (dark) — antes era invisível no light",
          "ShowcasePageV2: masonry layout via CSS columns, max-w 1660px centralizado, tabs FAQ fluid, dropdowns shadow-sh-xl no dark",
          "DashboardShowcase: KPIs 1-por-linha no mobile, badges shape='pill', Volume IA cor brand-subtle, traffic +1 row Referral, header migrado pra PageHeader",
        ],
      },
      {
        type: "changed",
        items: [
          "Token bg-input-hover light: gray[100] (0.94) → gray[50] (0.973) — hover mais sutil",
          "ClientesShowcase refatorado em folder structure (pattern ChatV2): components/NovoClienteDrawer, components/DetailDrawer, mocks/types/styles separados",
          "DataTable coluna type='actions': sem ícone no head e remove border-right da cell anterior (via data-purpose CSS sibling)",
          "AppShell exports: tipos AppShellUser e AppShellLayoutOption expostos via index",
          "DropdownMenu RadioItem indicator: Circle → Check (consistente com CheckboxItem)",
          "ToolbarMobileDialog: prop desktopBreakpoint (md/lg/xl/2xl) controla quando o trigger esconde",
        ],
      },
      {
        type: "fixed",
        items: [
          "CLI: usa cross-spawn pra resolver EINVAL no Windows",
          "CLI: copy template robusto e args não quebram com shell:true no Windows",
          "Tela branca causada por import inexistente em sidebar-rail.tsx (sidebarRailUserDefault)",
          "DataTable bulk delete: cast selectedIds.map(String) pra evitar mismatch GridRowId vs string",
        ],
      },
      {
        type: "removed",
        items: [
          "Showcase v1 (ShowcasePage.tsx) — substituído por Showcase (antigo V2, renomeado)",
          "Chat v1 (ChatShowcase.tsx) — substituído por Chat (antigo V2, renomeado)",
          "@deprecated tag em ToolbarMobileDialog/Sheet (agora consumido oficialmente pelo DataTable)",
        ],
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-18",
    tag: "preview",
    title: "Docs refresh + Updates timeline",
    summary:
      "Atualização ampla da documentação interna, criação da seção Pipeline Infra, página Tokens Overview, novo README focado em SaaS CRM, e esta própria página de Updates para acompanhar o crescimento do DS.",
    changes: [
      {
        type: "added",
        items: [
          "Página Updates (esta) — timeline de versões e features",
          "Página Tokens Overview em Foundations (hierarquia 3-tier, prefixos anti-collision, naming V3)",
          "Página Installation em Get Started (requirements, scripts, troubleshooting)",
          "Seção Pipeline Infra: Skills, Commands, Hooks, Output Styles, MCP Servers, Memory System",
          "Visão estrutural hierárquica na página Pipeline (4 camadas + diagrama de fluxo)",
          "Hook block-sensitive-edit.sh (PreToolUse — bloqueia .env, secrets, migrations, credentials)",
        ],
      },
      {
        type: "improved",
        items: [
          "README reescrito com foco em SaaS CRM, admin panels e dashboards (stack canônica explícita)",
          "Páginas Introduction, Structure e Transform Tokens refletem o estado atual do projeto",
          "Hook format-on-save loga em .ai/scratch/hook-log.txt (debug visível)",
          "DS Reviewer checklist agora valida atualização do inventory.md (dupla verificação)",
        ],
      },
      {
        type: "changed",
        items: [
          "Package name: @igreen/design-system-v2 → @igreen/design-system (drop v2 suffix)",
          "HTML <title>: \"iGreen DS v2 — Preview\" → \"iGreen Design System — Preview\"",
          "Pipeline Simulator renomeado para Pipeline (com visão estrutural acima do simulador)",
          "Padronização de naming: critical → danger em todos os pipeline .md (alinha com tokens CSS reais)",
        ],
      },
      {
        type: "fixed",
        items: [
          "Inconsistência critical/danger em 7 arquivos do pipeline (token --color-*-danger é o real)",
          "Script sync:agents apontava para .js mas arquivo era .cjs",
          "Bug pego pelo critique genuína do DS Reviewer durante teste do pipeline (NotificationBanner)",
        ],
      },
      {
        type: "removed",
        items: [
          "Referências a outros design systems (Material 3, Carbon, Spectrum) no README e docs",
          "Framing de Tailwind/Shadcn como \"adapters opcionais\" — agora são dependências diretas declaradas",
          "Sufixo v2 e wording \"stack-agnostic\" das páginas visíveis ao usuário",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-18",
    tag: "milestone",
    title: "Initial commit — v1 baseline",
    summary:
      "Primeiro commit do iGreen Design System. Captura o estado pré-publicação com tokens, componentes, pipeline AI e infra organizacional consolidados.",
    changes: [
      {
        type: "added",
        items: [
          "Arquitetura de tokens 3-tier (primitives → semantic → component) em tokens/brands/default/",
          "Transforms: to-tailwind-v4 (primary), to-css-vars, to-dtcg, to-js-theme",
          "Componentes iGreen custom em src/components/ui/ usando tv() de @/utils/tv",
          "Componentes Shadcn adaptados em src/components/shadcn/ com Radix preservado",
          "Pipeline AI com 4 agentes: orchestrator, ds-designer, ds-dev, ds-reviewer",
          "Skills atômicas por agente em .claude/skills/",
          "Slash commands: /ds-create-component, /ds-create-composite, /ds-add-shadcn, /ds-add-token, /ds-extract-figma",
          "Output style terse aplicado a toda sessão",
          "Memory system 4 camadas (user, project, audit log, lessons)",
          "MCP servers integrados: Figma, igreen-workspace, chrome-devtools, pencil",
          "Preview app com docs navegáveis em todas as seções",
        ],
      },
      {
        type: "improved",
        items: [
          "Anti-collision prefixes (gp-, sp-, pad-, radius-, sh-, form-, icon-, container-) para coexistir com Tailwind nativo",
          "Dark mode com hierarquia bg crescente + shadows/rings amplificados (L-008..L-011)",
          "WCAG 2.5.5 — touch targets ≥ 44px (min-h-form-xl)",
        ],
      },
    ],
  },
];
