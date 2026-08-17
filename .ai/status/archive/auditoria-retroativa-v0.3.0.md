# Auditoria retroativa — v0.3.0 (2026-05-19 a 2026-06-09)

> **Arquivado de `.ai/status/pipeline-state.md` em 2026-08-17.** Nada foi editado —
> a seção foi movida inteira, com o conteúdo original.
>
> Encerrada. Varredura retroativa feita na v0.3.0 pra dar Assumption a decisões
> tomadas antes de o campo existir.
>
> Motivo: o arquivo ativo estava em **431 KB e 146 entradas**, contra a política de
> ~50 KB / ~100 entradas registrada no `orchestrator.md`.

---

## Auditoria retroativa — v0.3.0 (2026-05-19)

> Trabalhos desta release foram implementados em colaboração direta com o usuário durante sessão Claude Code, sem invocação formal das skills do pipeline (`spec-component.md` / `impl-igreen.md` / `review-component.md`) nem entries em tempo real neste log. Registro retroativo abaixo pra preservar rastreabilidade e auditabilidade futura.

### 2026-05-19 | DS DESIGNER (retroativo) | container.main-content-max | CONCLUÍDO

- Input: Necessidade de max-width canônico pro body do AppShell em modo `layout=compact` (proposta do usuário: 1368px pra evitar conteúdo "esticar" em ultrawide)
- Output: Token `container.main-content-max = "1368px"` adicionado em `tokens/brands/default/components/sizing.ts` + CSS var `--container-main-content-max: 1368px` em `tailwind-theme.css`
- Decisões: usar a sub-categoria `container` (não criar nova) — é uma largura semântica de body, encaixa no namespace existente
- Alternativas descartadas:
  1. Aproximar pra `container.xl` (1280px) — perde os 88px que o usuário queria
  2. Criar nova categoria `layout-width` — over-engineering, container existe e cobre semanticamente
- Assumption: 1368px é o sweet spot pra body do AppShell em monitores 1440-1920px (3 colunas KPI + actions à direita confortáveis sem largura excessiva de linha)
- Lições novas: nenhuma (token sólido, segue pattern existente)

### 2026-05-19 | DS DEV (retroativo) | container.main-content-max | CONCLUÍDO

- Input: spec acima
- Output: token criado em `components/sizing.ts:63` + CSS var gerado em `tailwind-theme.css:167`
- Consumido por: `AppShell/app-shell.styles.ts` (variant `layout.compact`) via `max-w-[var(--container-main-content-max)]`. Também consumido inicialmente em `ShowcasePageV2.tsx` (depois trocado pra `max-w-[1660px]` arbitrário a pedido do usuário pra essa página específica)
- Decisões: usar nome verboso `main-content-max` (não `main`) pra evitar colisão com sub-keys curtos da escala xs/sm/md
- Assumption: o transform `to-tailwind-v4.ts` regenera o CSS var corretamente da config TS (verificado manualmente pq usuário pediu pra não rodar `npm run tokens:tw4` — edit manual no CSS gerado + edit no source)
- Lições novas: nenhuma

### 2026-05-19 | DS REVIEWER (retroativo) | container.main-content-max | APROVADO

- Spec verificada: sim — entry acima
- Assumption verificada: sim — token funcional em ambos os temas (não há override dark pra container width); valor 1368 é consistente com uso em layouts ultrawide; nome verboso é justificável
- Critique genuína: examinei se a sub-categoria `container` é o lugar certo pra tokens semânticos de layout (vs criar nova categoria `layout-width`). Conclusão: `container` cobre, mas estamos misturando "page containers genéricos" (xs..3xl) com "containers semânticos especiais" (main-content-max, modal-md, drawer-sm). Pode ser refatorado futuramente em sub-namespace `container.layout.*` se crescer
- Regressões: nenhuma
- Lições novas: nenhuma

### 2026-05-19 | DS DESIGNER (retroativo) | FloatingPanel | CONCLUÍDO

- Input: Necessidade de drawer não-modal que coexista com interação atrás (caso de uso: DetailDrawer da CRUD)
- Output: Spec do FloatingPanel — drawer flutuante com `position:fixed`, sem backdrop modal, sem foco trap, resize horizontal opcional, maximize toggle, sheet bottom-up em mobile
- Decisões:
  1. Render via createPortal em document.body (escapa overflow/transform de ancestrais)
  2. Sem Radix Dialog/Sheet (mantém non-modal explícito; ESC manual via listener)
  3. Hook `useFloatingPanelResize` próprio (parametrizado por side L/R)
- Alternativas descartadas:
  1. Estender o `<Panel>` existente com `modal={false}` — Panel está acoplado a Sheet/Dialog do Radix que sempre renderiza overlay; mexer no Panel quebraria o uso atual
  2. Usar `<Sheet modal={false}>` direto — viola o pattern do DS (Panel é o wrapper canônico)
- Assumption: drawer non-modal é necessidade recorrente (detail panels em listagens, side info em dashboards, configurações secundárias). Se aparecer só 1 caso de uso, era over-engineering — mas o Sergio já citou múltiplas telas potenciais (kanban detail, chat side panel)
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | FloatingPanel | CONCLUÍDO

- Input: spec acima
- Output: `src/components/ui/FloatingPanel/` com 5 arquivos canônicos:
  - `floating-panel.tsx` — componente principal
  - `floating-panel.styles.ts` — tv() slots (root + handle + header + body + footer + variants side/maximized)
  - `floating-panel.types.ts` — `FloatingPanelProps`, `FloatingPanelSide`, `FloatingPanelSize`
  - `use-floating-panel-resize.ts` — hook drag-resize com persist localStorage opcional
  - `index.ts` — barrel
  - `USAGE.md` — guia completo
- Decisões: `titleSlot` ReactNode opcional pra header rico (Avatar + nome + status dot — caso do DetailDrawer); `desktopBreakpoint` reservado pra futura prop responsiva. Animação mount-only (slide-in + fade); sem animação de saída (mount/unmount instantâneo no close)
- Assumption: createPortal funciona consistentemente em testes E2E e SSR (verificado manualmente em dev; produção precisa retestar)
- Lições novas: nenhuma — pattern segue Panel mas sem Sheet primitive

### 2026-05-19 | DS REVIEWER (retroativo) | FloatingPanel | APROVADO

- Spec verificada: sim — entry acima
- Assumption verificada: sim — o caso de uso single (DetailDrawer) provou viabilidade; doc page `/floating-panel` com 5 exemplos cobre os patterns mais comuns
- Critique genuína: examinei se a duplicação de "shell visual" entre `<Panel>` e `<FloatingPanel>` é justificada. Conclusão: SIM — semânticas diferentes (modal vs non-modal), comportamento Radix Dialog não-overridável sem hacks, manter isolados é cleaner que adicionar prop `modal={false}` no Panel (que precisaria de branching em portal/overlay/foco trap)
- Regressões: nenhuma — `npx tsc --noEmit` passa; grep L-001/002/003/004/005/007 sem matches no FloatingPanel
- Lições novas: nenhuma

### 2026-05-19 | DS DESIGNER (retroativo) | PageHeader | CONCLUÍDO

- Input: Repetição de markup "title + description + badge + actions" em ClientesShowcase + DashboardShowcase (2+ ocorrências). Necessidade de Templates component canônico pra page headers
- Output: Spec do PageHeader na categoria Templates, com slot `children` pra row extra (tabs/filtros), e responsividade mobile built-in (`hideTextOnMobile` + `fluidPrimaryOnMobile`)
- Decisões: NÃO incluir back button / breadcrumb (delegado ao AppShell global); `badge` é ReactNode (não só Chip) pra flexibilidade
- Alternativas descartadas:
  1. Macro JSX inline em cada page (status quo) — vira drift entre pages
  2. Extender o `<header>` do AppShell — confunde semântica (AppShell.header = breadcrumb global; page header = title local)
- Assumption: 80% das pages do CRM seguem o pattern title+desc+badge+actions. Se crescer pra > 4 layouts diferentes, refatora em variants
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | PageHeader | CONCLUÍDO

- Input: spec acima
- Output: `src/components/ui/PageHeader/` com 4 arquivos:
  - `page-header.tsx`
  - `page-header.styles.ts` — tv() com slots root/topRow/textCol/titleRow/title/description/actionsRow/extraRow + variants hideTextOnMobile/mobileFluid
  - `page-header.types.ts`
  - `index.ts`
  - `USAGE.md`
- Decisões:
  1. `title` usa `text-title-lg` (20px, bumped de 16px após feedback do usuário)
  2. `fluidPrimaryOnMobile` usa `[&>:last-child]:flex-1` no actions wrapper — assume que o último child é o CTA primary
  3. NÃO automaticamente esconde `badge` no mobile (badge é semanticamente parte do título)
- Assumption: padrão "icon button + CTA primary" é o mais comum em actions. Outros patterns (3 buttons iguais) podem precisar `fluidPrimaryOnMobile={false}` + className manual
- Consumido por: ClientesShowcase + DashboardShowcase em v0.3.0

### 2026-05-19 | DS REVIEWER (retroativo) | PageHeader | APROVADO

- Spec verificada: sim
- Assumption verificada: sim — 2 consumers já (CRUD + Dashboard); responsivo testado em ambos
- Critique genuína: examinei se faria sentido o PageHeader também aceitar uma prop `breadcrumb?: BreadcrumbItem[]` pra cobrir páginas sem AppShell global. Conclusão: NÃO nesta versão — adicionar quando aparecer caso de uso real (premature otimization); o slot `children` já permite o consumer adicionar Breadcrumb manualmente
- Regressões: nenhuma — grep dos anti-patterns sem matches
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | AppShell v0.3.0 extension | CONCLUÍDO

- Input: Necessidade de user menu funcional (avatar do rail vira dropdown com layout/tema/settings/logout), layout switcher (fluid/compact), e edge-to-edge no mobile pra páginas chat-like
- Output: Props novas no AppShellProps + UserMenu component interno em `ui/AppShell/user-menu.tsx`
- Decisões:
  1. UserMenu é componente interno do AppShell (não exportado standalone) — encapsula o pattern específico desta navegação
  2. `layout="compact"` consome `--container-main-content-max` (cascateado pro token novo)
  3. `mobileEdgeToEdge` é prop boolean simples (não variant) — caso binário (sim/não)
  4. Layout/tema dentro do UserMenu usam `DropdownMenuSub` (submenu) — mais limpo que radio inline (decisão revertida do mesmo dia: começou inline, mudou pra sub após feedback)
- Assumption: o UserMenu não vai precisar ser reusável fora do AppShell. Se aparecer caso de uso (ex: header standalone sem AppShell), promover pra `ui/UserMenu/` independente
- Consumido por: ClientesShowcase, DashboardShowcase, ChatV2 (todas migradas)

### 2026-05-19 | DS DEV (retroativo) | DataTable v0.3.0 extension | CONCLUÍDO

- Input: Necessidade de DataTable responsivo (mobile usability ruim na CRUD), skeleton pagination, polish na coluna actions
- Output:
  1. **Auto-card mode em mobile** — `cardBreakpoint` (default 768px); abaixo dele `rowsToRender` vira lista de `<TableCardRow>` automaticamente, mapeando colunas pra `header`/`headerActions`/`items` com base em `isPrimary` + `type==="actions"`
  2. **Toolbar responsiva** — Sort/Cols/Density/Export/MoreMenu colapsam em `ToolbarMobileDialog` em <xl (1280px); Refresh/ViewToggle/SavedViews só colapsam em <md (768px). Trigger `...` com `desktopBreakpoint="xl"`. View mode mobile usa items custom com icon+texto fluid. MoreMenu reagrupa items num único trigger "Mais ações" dentro do dialog
  3. **FooterTableSkeleton** — mesma silhueta do FooterTable (page-size + range + 7 botões) com `animate-pulse`. Renderiza durante `isLoading` no lugar do FooterTable real (evita "1 página" flash)
  4. **Coluna actions polish** — sem ícone no head (ignora defaultIcon do registry); cell anterior à actions perde border-right via CSS sibling selector `has-[+_[data-purpose='actions']]`
  5. **Row focused** — agora aplica `bg-bg-table-row-selected` (mesmo visual da row selected via checkbox) + outline brand interno
- Decisões:
  - `ToolbarMobileDialog` foi promovido de @deprecated pra uso oficial (consumido pelo DataTable)
  - `display:contents` nos wrappers desktop-only — preserva flex layout do parent sem wrapper visual
  - Triggers DUPLICADOS (icon-md desktop / fullWidth button mobile) usando mesmo state via prop `trigger` dos popovers — Radix gerencia stacking via portal
- Assumption: o pattern "1280px = laptop pequeno onde toolbar quebra" é razoável. Se aparecer device com viewport diferente quebrando, ajustar `desktopBreakpoint` no prop ou criar `xl-mid` breakpoint custom

### 2026-05-19 | DS DEV (retroativo) | useTheme refactor (3 valores + sync) | CONCLUÍDO

- Input: ClientesShowcase tinha state local `theme` que dessincronizava do useTheme global (DocSidebar). Bug: entrar na CRUD com tema dark global forçava reset pra light
- Output: `src/hooks/useTheme.ts` refatorado pra:
  - Type `Theme = "light" | "dark" | "system"` (era apenas light/dark)
  - State inicial lê de `localStorage["igreen-ds-theme"]` (default `"system"`)
  - Sincronização entre instâncias via `CustomEvent("igreen-ds-theme-change")` + `storage` event (cross-tab)
  - Quando theme=`"system"`, observa `prefers-color-scheme` e segue mudanças do SO em runtime
  - Exports: `theme`, `setTheme`, `isDark`, `toggle` (backwards-compat: toggle só light↔dark)
- Decisões: SEM Context Provider — sincronização via custom event é leve e não exige wrapping da app inteira
- Migrou: ChatShowcase, ChatV2, DashboardShowcase, AppShellDoc, ClientesShowcase pra usar `useTheme()` em vez de `useState<string>("light")` local

### 2026-05-19 | DS DEV (retroativo) | Slider/Progress track + Input hover | CONCLUÍDO

- Input: Track do Slider/Progress invisível no light (`bg-bg-input` = white) e fraco demais no dark (`bg-bg-muted` alpha 4%). Hover do Input/Select/Textarea sem variante visual
- Output:
  - **Slider/Progress track**: `bg-bg-emphasis dark:bg-bg-accent` (gray[100] light + alpha 16% dark — visíveis em ambos)
  - **Input/Select/Textarea/InputGroup hover**: consomem token `bg-input-hover` (light = gray[50] 0.973, dark = alpha 8%) — token já existia mas não estava sendo consumido
  - **bg-input-hover light** ajustado de gray[100] (0.94) → gray[50] (0.973) — hover mais sutil
- Decisões: usar `bg-emphasis` no light pq é o único cinza sólido com contraste suficiente sobre white; `bg-accent` no dark pq alpha 16% supera o `bg-muted` 4% sem ser overkill como `accent-hover` 12%/16%

### 2026-05-19 | DS DEV (retroativo) | DropdownMenu RadioItem brand state | CONCLUÍDO

- Input: RadioItem com state `data-state=checked` usava Circle bullet — visualmente fraco e inconsistente com CheckboxItem (Check icon)
- Output: `DropdownMenuRadioItem` atualizado:
  - Indicator trocado de `<Circle h-2 w-2 fill-current>` pra `<Check size-4>`
  - State checked: `bg-bg-brand-subtle + text-fg-brand + Check icon` (era apenas Circle sem destaque visual)
- Afeta: UserMenu (Layout/Tema submenus), TableToolbar density (more-menu RadioItem), DropdownMenuDoc demos
- Decisões: padrão visual brand-tint é consistente com Chip selected + Table row selected — refoça a "cor de identidade" em estados ativos

### 2026-05-19 | DS REVIEWER (retroativo) | v0.3.0 release bundle | APROVADO (parcial)

- Critique genuína: a maioria dos trabalhos passou pelo "gate informal" do usuário (cada peça aprovada via diálogo da conversa), mas:
  1. **Sem entries em tempo real** no pipeline-state.md — comprometeu auditabilidade
  2. **Inventory.md não atualizado** — FloatingPanel/PageHeader não estavam registrados pra próximas sessões encontrarem
  3. **Token novo criado sem cascata formal** (container-main-content-max) — DS Dev criou inline em vez de pausar/sinalizar Designer
- Lições novas:
  - **L-015** Pipeline gate informal via diálogo é OK pra colaboração rápida com usuário, MAS exige registro retroativo em pipeline-state.md no fim da sessão pra preservar auditabilidade. Adicionar checklist "audit log atualizado?" no encerramento de sessão (CLAUDE.md já tem essa entrada — reforçar)
  - **L-016** Componentes novos precisam atualizar `inventory.md` no MESMO commit (não em commits separados). Sem isso, próxima sessão pode duplicar trabalho. Adicionar como item explícito no checklist do `impl-igreen.md`
- Aprovação parcial: trabalhos visualmente OK + TS limpo + nenhuma regressão. Mas governance teve dívida técnica registrada agora

> NOTA: as menções a "L-015" (Pipeline gate informal) e "L-016" (inventory.md no commit) acima
> são propostas RETROATIVAS desta entry — não foram promovidas ao `lessons.md` canônico. As lições
> oficiais L-015 e L-016 no `lessons.md` têm conteúdos diferentes (scrollbar-width e typography
> preset/tv.ts respectivamente).

### 2026-05-19 | DS DEV (typography pipeline) | Limpeza decimais + órfãos | CONCLUÍDO

- Input: usuário pediu auditoria + limpeza da escala tipográfica (decimais e órfãos eliminados)
- Output: 4 Ondas executadas — `text-[10.5/11.5/12.5/13.5/14.5/15/17/22/26 px]` eliminados em 24 arquivos. Escala discreta resultante: 10/11/12/13/14/16/18/20/24 px
- Decisões:
  - Tier KPI Dashboard `text-[26px]` → 24px (sem preset novo)
  - Body padrão do projeto permanece 13px (tables, dropdowns, inputs)
  - Decimais convertidos caso-a-caso (10.5→10, 11.5→11, 12.5→12 ou 13 dependendo do contexto)
  - Modal title `text-[17px]` → `text-[16px]` (alinhado com title tier)
  - 14.5px (sidebar panel title) → 16px (subiu tier)
- Audit pré: `.ai/audits/typography-inventory-2026-05-18.md` (snapshot read-only)
- Assumption: pixels da escala discreta cobrem todos os contextos visuais sem regressão perceptível

### 2026-05-19 | DS DEV (typography pipeline) | Rewrite typography.ts (32→23 presets) | CONCLUÍDO

- Input: usuário pediu "tipografia REAL com tokens primitivos + compostos, enxuto, sem duplicidade"
- Output: `typography.ts` reescrito completamente — 32 presets em 8 namespaces → **23 presets em 6 roles** (display/heading/title/body/caption/code)
  - Removidos: `paragraph-*` (6), `label-*` (7), `subheading-*` (6) — 19 presets eliminados
  - Adicionados: `body-*` (6 tiers xs/sm/md/lg/xl/2xl), `caption-md` (12/400)
  - Title weight default: 500 → 600 (semibold) — alinhado com uso real (56× semibold vs 2× bold)
  - Body-xs/sm interactive = 500; body-md+ corrido = 400
- Migração em 14 ondas:
  - Ondas 1-4: decimais e órfãos eliminados (ver entry anterior)
  - Onda 5: typography.ts aditivo (legados + novos co-existindo)
  - Ondas 6-10: migração de presets antigos → novos via sed (mesmos valores → zero diff visual)
  - Ondas 11-13: substituição de literais `text-[Npx]` por presets (199 → 4 exceções)
  - Onda 14: remoção de legados + renomear `title-*-new` → `title-*` + adicionar `caption-md` novo
- Audit pós: `.ai/audits/typography-inventory-2026-05-19.md`
- Spec do rewrite: `.ai/specs/typography-rewrite-2026-05-19.md`
- Bug crítico encontrado durante validação visual (via Chrome DevTools MCP): após rewrite, botões e textos perderam font-size — caíam no default browser (16px). Root cause: `src/utils/tv.ts` (`twMergeConfig`) tinha lista desatualizada (legados, sem `body-*`) → `tailwind-merge` removia silenciosamente as classes `text-body-*` por confundir com `text-fg-X`. Fix: lista atualizada com os 23 presets novos. Promovido para lição L-016.
- Lições novas:
  - **L-016 (canônico em `lessons.md`)** — Novo preset em `typography.ts` exige registro IMEDIATO em `src/utils/tv.ts > twMergeConfig.extend.classGroups["font-size"][0].text`. Senão o `tailwind-merge` (usado por `tv()`) confunde com `text-fg-X` (color) e remove a classe do output final. Visual quebra silenciosamente sem erro de tsc/build.
- Decisões arquiteturais:
  - **6 roles** (vs 8 anteriores) — eliminação de label/paragraph/subheading namespaces, consolidação em `body` com weight default por tier
  - **Override convencional via Tailwind nativo** — preset cobre size+lh+tracking+family; weight via `font-bold/semibold/medium/normal`; leading via `leading-X`
  - **`caption-md` é 12/400** (não 13/400 como era no legado) — mudança semântica: caption-tier 12 era cobertura órfã, agora é o caption-padrão
  - **`body-sm` é 13/500** (interactive) — body default do projeto. Para texto corrido 13/400, usar `text-body-sm font-normal` (override)
  - 4 exceções de `text-[Npx]` aceitas: ícones Unicode (`text-[2rem]`, `text-[20px]` ✦/✅) + DocHeader h1 fluid (`text-[2rem]`)
- Assumption: 23 presets cobrem 100% dos casos de uso reais sem precisar de variantes adicionais. Override via Tailwind nativo é confiável quando `twMergeConfig` está sincronizado com `typography.ts` (L-016).

### 2026-05-20 | DS DEV | DataTable autoFit + persist v4 | CONCLUÍDO

- Input: usuário reportou (1) tabela com poucas colunas não preenche container (espaço vazio à direita) e (2) "alguns filtros salvam outros não" entre sessões/views
- Output: duas features novas na DataTable em release v0.5.0 (minor, opt-in zero):
  1. **AutoFit em 3 layers** (Type Heuristics + Smart Content Sampling via canvas + Flex Distribution). ResizeObserver mantém widths sincronizados. Default `true`. Resize manual continua override.
  2. **Persistência schema v4** — `filterModel`/`search`/`currentPage` agora persistem como parte do workspace Default. `defaultSnapshotRef` mantém Default congelado quando view custom ativa. `applyDefault` restaura tudo do snapshot.
- Arquivos novos: `utils/measure-text.ts`, `utils/calculate-column-widths.ts`, `hooks/use-column-auto-width.ts`
- Arquivos modificados: `data-table.types.ts` (+autoFit), `data-table.tsx`, `hooks/use-data-table-{controller,columns,search,pagination}.ts`, `hooks/state-persistence-utils.ts` (+v4)
- Inspirado em padrão analisado em `design-tabela/` (referência externa) — replicado approach das 3 layers + ResizeObserver + canvas measure, adaptado pra coexistir com resize manual + persistId existente do iGreen
- Validação E2E via Chrome DevTools MCP:
  - Example: CRUD com 12 colunas → containerWidth (2208) === scrollWidth (2208), overflow 0px
  - Filter search="maria" → persistido v4 → reload → input restaurou
  - Aplicou view "Ativos" → snapshot Default preservou search="maria"
  - Voltou Default → restaurou search="maria"
- Lições novas: nenhuma — toda lógica reutiliza patterns existentes (persistId, defaultSnapshotRef, ResizeObserver). Nenhum bug arquitetural novo.
- Assumption: ResizeObserver + canvas measureText têm custo aceitável em runtime (medido em arquivos com até 50 rows × 12 colunas sem percepção de lag). Para tabelas gigantes (10k rows com virtualization), Layer 2 amostra primeiras 20 rows apenas — custo independe do total de rows.

---

### [2026-06-09] | DS DESIGNER + DS DEV | Token `formGap` + componente `CardCheckbox` | CONCLUÍDO

- **Input:** feedback Sergio durante refinamento do SacarDialog v0.7.0 — "gap entre inputs poderia ser 20px, criar token formGap... e o checkbox de salvar poderia ser um card checkbox igual o card radio".
- **Output entregue:**
  1. Token `formGap = scale[5]` (20px) em `tokens/brands/default/components/spacing.ts`
  2. CSS var `--spacing-form-gap` gerada via `to-tailwind-v4.ts` → classe `gap-form-gap`
  3. Componente novo `<CardCheckbox>` em `src/components/ui/CardCheckbox/`:
     - `card-checkbox.styles.ts` (tv() — slots root/body/label/description, variants selected/disabled)
     - `card-checkbox.tsx` (forwardRef, label htmlFor wrap, suporte a icon prop)
     - `USAGE.md` (formato canônico DS)
     - `index.ts` (barrel)
  4. SacarDialog migrado: `gap-gp-lg` → `gap-form-gap` (form Outra conta vertical + grid Agência/Conta), `FormFieldCheckbox` → `CardCheckbox` (opção "Salvar conta pra usar depois")
  5. Tabela ClientesFinanceiroShowcase: actions column width 72 → 48 (1 button icon), `showTotalizers` removido (footer com soma redundante com KPI "Disponível total" no header)
- **Decisões:**
  - `formGap` é valor único (não Record com base/sm/lg) — caso de uso é exatamente 20px; variantes não emergiram em bench
  - `CardCheckbox` usa `<label htmlFor>` wrap (não `<button onClick>`) — preserva semântica accessibility (screen reader anuncia "checkbox", não "button") + form integration nativa + click target consistente
  - Card visual idêntico aos radio cards (bg-success-muted + border-brand no selected + shadow-sh-sm) — Sergio pediu paridade visual explícita
  - L-024 (formGap) + L-025 (label htmlFor wrap) adicionadas
- **Cascata:** nenhuma adicional — token e componente novos foram criados juntos numa única sessão (token compõe componente, componente compõe SacarDialog). Estado pipeline-state inicia em CONCLUÍDO direto pelo agente unificado nesta sessão (DS Designer ad-hoc + DS Dev imediato em modo autônomo).
- **Lições novas:** L-024 (formGap), L-025 (label htmlFor wrap em card inputs).
- **Assumption:**
  - `formGap = 20px` cobre 95%+ dos forms do projeto sem precisar de tier sm/lg
  - `<label htmlFor>` wrap dispara checkbox toggle corretamente em todos os browsers (testado: Chrome devtools dark mode)
  - 48px de width pra coluna actions é suficiente pra 1 button icon-only — se futuro adicionar 2+ icons inline, precisará revisar

---

