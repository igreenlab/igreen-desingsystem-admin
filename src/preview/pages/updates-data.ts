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
