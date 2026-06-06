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
    version: "0.5.1",
    date: "2026-06-05",
    tag: "patch",
    title: "Fix crítico de types no npm + transferência de repo + pipeline drift",
    summary:
      "Patch que destrava o consumo TypeScript do pacote. Versões v0.1.0 até v0.5.0 publicavam .d.ts referenciando paths fora do tarball (vite-plugin-dts preservava estrutura de source, mas o `files` do package.json não incluía `dist-lib/src/**` nem `dist-lib/tokens/**`). Consumers TypeScript instalavam mas não tinham IntelliSense — import retornava `any`. Bug silencioso por 4 releases. Plus: repositório transferido pra organização `igreenlab/igreen-desingsystem-admin`, licença declarada explicitamente (UNLICENSED), engines.node >=20.0.0 documentado. CLI bootstrap (@snksergio/create-design-system) também subiu pra v0.1.4 com template alinhado: pin atualizado pra ^0.5.1, classes de tipografia migradas pro novo schema (typography rewrite 2026-05-19), Geist font carregada via @font-face. Pipeline interno auditado: 14 arquivos de skills/rules/context tinham presets removidos (`text-label-*`, `text-paragraph-*`) ainda como pattern canônico — corrigidos.",
    changes: [
      {
        type: "fixed",
        items: [
          "Types TypeScript funcionando — tarball agora inclui `dist-lib/src/**` e `dist-lib/tokens/**` (era o bug crítico que afetou v0.1.0-v0.5.0). Consumers ganham IntelliSense completo ao instalar (L-017)",
          "Template do CLI bootstrap (@snksergio/create-design-system@0.1.4) alinhado com lib atual: classes `text-paragraph-sm`/`text-label-md` substituídas pelos presets atuais (text-body-sm, text-caption-md font-semibold), AlertModal `tone='critical'` corrigido pra `tone='danger'`, strings JSX exibindo versão atualizadas pra @0.5.1 (L-018)",
          "Pipeline interno auditado — 14 arquivos de skills/rules/context guides tinham presets typography removidos (rewrite 2026-05-19) ainda como pattern canônico. Próximos componentes criados via /ds-create-component agora seguem o schema atual (L-019)",
        ],
      },
      {
        type: "changed",
        items: [
          "Repositório transferido de `snksergio/igreen-desingsystem-admin` para `igreenlab/igreen-desingsystem-admin` (organização). package.json (lib + CLI), README.md e InstallationDoc atualizados",
          "Licença declarada explicitamente: `\"license\": \"UNLICENSED\"` (antes ausente — npm exibia \"Proprietary\" como default)",
          "Engines declarado: `engines.node: \">=20.0.0\"`",
          "CLI template default agora pinha `\"geist\": \"^1.7.0\"` explicitamente (antes era transitive via design-system) — fonte Geist carregada via @font-face no index.css apontando pro node_modules/geist",
        ],
      },
      {
        type: "added",
        items: [
          "L-017 em lessons.md — files do package.json deve incluir paths emitidos por vite-plugin-dts",
          "L-018 em lessons.md — release minor/major da lib exige bump do template CLI bootstrap",
          "L-019 em lessons.md — remover/renomear token exige grep em TODOS os scopes (não só src/)",
        ],
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-05-20",
    tag: "preview",
    title: "DataTable — fluid auto-fit + persistência completa do workspace Default",
    summary:
      "Duas features grandes na DataTable, opt-in zero (default ligado, sem breaking change). (1) Auto-fit de colunas em 3 camadas: type heuristics + canvas measureText nos primeiros 20 rows + distribuição flex do espaço sobrando. ResizeObserver mantém widths sincronizados quando o container muda. Resolve o caso 'tabela com poucas colunas e espaço vazio à direita' que pesava em vários showcases. (2) Persistência completa do workspace Default: filterModel/search/currentPage agora também persistem em localStorage (schema v4) junto com sort/density/widths. Quando user aplica view custom, snapshot da Default fica congelado; voltar para Default restaura tudo intacto. Limpeza só manual.",
    changes: [
      {
        type: "added",
        items: [
          "Prop `autoFit?: boolean` em `DataTableProps` — default `true`. Quando ligado, observa o container via ResizeObserver e calcula widths em 3 layers (type defaultWidth, canvas measureText nos primeiros 20 rows, flex distribution do espaço sobrando). Precedência: resize manual > autoFit > col.width > typeDef.defaultWidth. Inspirado em padrões de DataGrids modernos (AG Grid / TanStack) e na referência `design-tabela/` analisada antes do design",
          "Hook `useColumnAutoWidth` — observa container ref via ResizeObserver, coalesce eventos via rAF, atualiza state apenas quando widths efetivamente mudam (skip re-render)",
          "Utility `calculateColumnWidths` (3 layers) — exposta para reuso futuro fora do hook",
          "Utility `measureTextWidth` — canvas singleton (zero overhead em re-uso), fonte default alinhada com body-sm do DS (13px Geist), SSR-safe (retorna 0 sem `document`)",
          "Schema v4 da persistência DataTable — adiciona `filterModel`, `search`, `currentPage` ao workspace Default persistido em localStorage. Schema antigo (v3) é descartado silenciosamente (não quebra)",
          "Hidratação de `useDataTableSearch` (`initialSearch`) e `useDataTablePagination` (`initialPage`) — agora aceitam estado inicial vindo do localStorage",
          "Logic: `persistedSnapshotForSave` usa `defaultSnapshotRef` quando view custom está ativa — view custom NUNCA polui o snapshot Default no localStorage",
          "`applyDefault` (transição para Default) agora restaura `filterModel`/`search`/`currentPage` do snapshot — workspace pessoal completo intacto",
        ],
      },
      {
        type: "improved",
        items: [
          "DataTable em todas as DocPages/showcases (CRUD, Dashboard, Clientes, etc) agora preenche todo o container — sem espaço vazio à direita. Validado via Chrome DevTools MCP: containerWidth === scrollWidth (overflow 0px) em Example: CRUD e Example: Column types",
          "Selection column (checkbox 56px) é descontada do cálculo de auto-fit via `reservedWidth` no hook — evita overflow de 56px que apareceria sem o ajuste",
          "`scrollContainerRef` movido do `data-table.tsx` para o `useDataTableController` — compartilhado entre `Table.scrollRef` (scroll y/x) e `useColumnAutoWidth` (medição contentRect.width). Reduz uma `useRef` duplicada",
        ],
      },
      {
        type: "fixed",
        items: [
          "Comportamento de persistência inconsistente reportado pelo user: \"alguns filtros salvam outros não\". Causa: por design v3, `filterModel/search/page` eram excluídos do save (`/** Subset persistido — exclui filters, search, page (volátil entre sessões). */`). Agora persistem no schema v4 com lógica de Default snapshot que isola do state de views custom",
        ],
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-19",
    tag: "preview",
    title: "Typography rewrite — 6 roles / 23 presets + pre-commit gate",
    summary:
      "Reescrita enxuta da tipografia do DS. 32 presets em 8 namespaces → 23 presets em 6 roles (display / heading / title / body / caption / code). Body é o role central — substitui paragraph + label legados. Title default weight passou de 500 → 600 (alinhado com uso real). Override convencional via Tailwind nativo (font-bold/leading-none/tracking-wider). Migração executada em 14 ondas com validação visual e zero regressão. Bug crítico descoberto e fixado durante validação: tailwind-merge removia silenciosamente classes de presets não registrados em tv.ts e lib/utils.ts — lição L-016 + nova skill ds-reviewer/pre-commit-check pra capturar essa classe de sincronia em commits futuros.",
    changes: [
      {
        type: "breaking",
        items: [
          "typography.ts — removidos presets `paragraph-*` (6), `label-*` (7), `subheading-*` (6). Consumers externos do package precisam migrar nomes (`paragraph-sm` → `body-md`, `label-sm` → `body-md font-medium`, etc) — tabela de mapeamento completa em .ai/specs/typography-rewrite-2026-05-19.md",
          "title-sm/md/lg passam de weight 500 → 600 (semibold) default. Consumers que esperavam 500 precisam adicionar `font-medium` override",
          "caption-md muda significado: era 13/400, agora é 12/400. Quem usava `text-caption-md` esperando 13px precisa migrar para `text-body-sm font-normal`",
        ],
      },
      {
        type: "added",
        items: [
          "Role `body` (6 presets): body-xs (12/500), body-sm (13/500), body-md (14/400), body-lg (16/400), body-xl (18/400), body-2xl (24/400). Substitui paragraph + label legados — overrides de weight via Tailwind nativo (font-bold/semibold/medium/normal)",
          "Preset caption-xs (10/400) — tier 10px com weight regular, substitui o uso disperso de subheading-strong-sm",
          "Skill ds-reviewer/pre-commit-check.md — gate amplo invocado antes de commit significativo. Valida: USAGE.md atualizado em todos os componentes UI tocados; DocPages do showcase refletindo mudanças de tokens; sincronia 1:1 tv.ts ↔ lib/utils.ts ↔ typography.ts (L-016); pipeline-state.md com entry CONCLUÍDO; memory pointers; nova lição registrada em ds-standards.md",
          "Regra 7 em .claude/rules/ds-standards.md: 'Gate de pre-commit obrigatório antes de commit significativo'",
          "Audit retroativo .ai/audits/typography-inventory-2026-05-18.md (pré-rewrite) e .ai/audits/typography-inventory-2026-05-19.md (pós-Ondas)",
          "Spec do rewrite .ai/specs/typography-rewrite-2026-05-19.md com tabela completa antigo → novo + decisões",
          "Lição L-016 — novo preset em typography.ts exige registro 1:1 em src/utils/tv.ts e src/lib/utils.ts (twMergeConfig). Sem isso, tailwind-merge confunde com text-fg-X (color) e remove a classe silenciosamente",
        ],
      },
      {
        type: "changed",
        items: [
          "Escala discreta tipográfica em px: 10/11/12/13/14/16/18/20/24 — eliminados decimais (10.5, 11.5, 12.5, 13.5, 14.5) e órfãos (15, 17, 22, 26) que pulularam ao longo dos componentes",
          "body-sm (13/500) é agora o body default do projeto — usado em buttons, dropdowns, inputs, table cells. Texto corrido 13px usa `text-body-sm font-normal` (override regular)",
          "body-xs/sm têm weight default 500 (medium) por serem interactive; body-md+ têm weight default 400 (regular) por serem corridos",
          "TypographyDoc.tsx reescrita refletindo os 6 roles novos + overview cards por role + seção 'Overrides convencionais' + aviso L-016",
          ".ai/context/tokens/typography.md atualizado com nova escala + tabela cruzada antigo → novo + regras de override",
          "src/utils/tv.ts twMergeConfig sincronizado 1:1 com typography.ts (23 presets)",
          "src/lib/utils.ts extendTailwindMerge (segunda fonte que afeta shadcn cn()) sincronizado 1:1",
        ],
      },
      {
        type: "improved",
        items: [
          "Eliminadas 199 ocorrências de `text-[Npx]` literal em componentes — substituídas por presets DS. 4 exceções justificadas: ícones Unicode (text-[2rem], text-[20px] em ✦/✅) e DocHeader h1 fluid",
          "TypographyDoc agora tem overview grid com 6 cards (1 por role) explicando tier + weight default + uso típico — facilita onboarding",
          "USAGE.md de PageHeader, Kanban, Avatar, TableToolbar atualizados com nomes de presets novos",
          "Comentários internos de label.tsx, FiltersColumn, ConversationListItem limpos de referências a presets legados",
          "Regra 'antes de commit significativo invocar pre-commit-check' adicionada ao resumo em ds-standards.md",
          ".claude/skills/ds-dev/release.md Passo 1.5 agora invoca pre-commit-check em vez de greps direto — gate mais amplo cobrindo USAGE/DocPage/memory/sync, não só L-001..L-007",
        ],
      },
      {
        type: "fixed",
        items: [
          "Bug crítico do tailwind-merge — após adicionar `text-body-sm` ao typography.ts mas esquecer de registrar em src/utils/tv.ts, o merge removia a classe silenciosamente. Componentes perdiam font-size/lh/weight/tracking e caíam no default do browser (16px). Sem erro de tsc/build. Detectado via Chrome DevTools MCP inspecionando button.styles.ts. Documentado como L-016 + criada skill pre-commit-check pra prevenir reincidência",
          "src/lib/utils.ts twMergeConfig estava com nomes legados (paragraph/label/subheading/overline) + entries fantasmas (body-lg-medium etc que não existiam). Sincronizado com typography.ts atual",
        ],
      },
    ],
  },
  {
    version: "0.3.1",
    date: "2026-05-19",
    tag: "patch",
    title: "Pipeline governance — autonomia + auditoria retroativa v0.3.0",
    summary:
      "Patch grande de governança. Fecha duas frentes: (1) auditoria retroativa da v0.3.0, que passou sem o pipeline formal DS Designer → Gate → Dev → Reviewer; (2) autonomia automática do pipeline via hooks PostToolUse + skill consolidada de spec-token + auto-review no /ds-release. Resultado: o pipeline deixa de depender de invocação manual em cada Edit — anti-patterns são sinalizados automaticamente enquanto o componente está sendo editado.",
    changes: [
      {
        type: "added",
        items: [
          "Hook ds-lint-styles.sh (PostToolUse) — grep automático de L-001/L-002/L-003/L-004/L-005/L-007 + import de tv em arquivos *.styles.{ts,tsx} dentro de src/components/. Warning em stderr (não bloqueia), Claude vê e corrige na hora",
          "Hook ds-inventory-check.sh (PostToolUse) — alerta quando componente em src/components/ui/<Nome>/ não tem USAGE.md ou não consta no inventory.md (L-016 vira automação)",
          "Skill ds-designer/spec-token.md consolidada — substitui spec-token-{color,spacing,sizing,typography}.md em 1 router único com argumento tipo. Os 4 antigos viraram aliases que apontam pra ela",
          "Passo 1.5 em ds-dev/release.md — auto-review do diff desde a última entry antes do bump. Violações aparecem no preview do gate; usuário decide se corrige, aceita débito ou cancela",
          "Skill ds-dev/release.md — orquestra release completa em 7 passos (verificações → auto-review → coletar → classificar/bump → preview gate → aplicar mudanças → publicar via git/gh → handoff)",
          "Comando /ds-release [tag] — entry point pra release ponta-a-ponta",
          "Lições L-015 e L-016 em pipeline-state.md — gate informal exige registro retroativo (L-015); inventory.md no mesmo commit do componente (L-016)",
          "Entry retroativa de FloatingPanel, PageHeader e container.main-content-max em pipeline-state.md (seção Auditoria retroativa v0.3.0) com triads DESIGNER+DEV+REVIEWER completas",
          "Token container.main-content-max (1368px) registrado em .ai/context/tokens/sizing-shape-elevation.md",
        ],
      },
      {
        type: "improved",
        items: [
          "Inventário .ai/context/components/inventory.md atualizado pra refletir v0.3.0: FloatingPanel + PageHeader (Templates) adicionados, AppShell estendido (user/layout/mobileEdgeToEdge), DataTable com toolbar responsiva e auto-card mobile",
          "Settings.json carrega os 3 hooks PostToolUse (format + ds-lint-styles + ds-inventory-check) automaticamente",
          "Fallback node nos hooks (jq não disponível no Git Bash do Windows) — parsing JSON de stdin funciona em qualquer ambiente que tenha node",
          "ds-standards.md ganhou seção 'Hooks automáticos (autonomia do pipeline)' descrevendo cada hook + auto-review na release",
          "CLAUDE.md ganhou seção 'Hooks automáticos (pipeline autônomo)' acima da arquitetura de tokens",
          "ds-add-token.md aponta pro spec-token.md consolidado com argumentos por tipo",
        ],
      },
      {
        type: "changed",
        items: [
          "spec-token-{color,spacing,sizing,typography}.md viraram aliases curtos — fonte única passa a ser spec-token.md com arg tipo. Reduz 4 arquivos de ~80 linhas cada pra 1 router de 200 linhas + 4 stubs de 15 linhas",
          "Workflow de release: agora orquestrado via /ds-release com auto-review antes do bump (antes era 100% manual)",
          "ds-standards.md atualizada pra L-001..L-016 (era L-001..L-014)",
        ],
      },
    ],
  },
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
