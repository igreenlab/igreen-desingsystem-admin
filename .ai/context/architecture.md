# iGreen Design System — Arquitetura

Visão completa do DS: domínios, tokens, pipeline, fluxos. Fonte única (não há `architecture-flows.md` separado — está tudo consolidado aqui).

---

## Domínios do sistema

```
┌────────────────────────────────────────────────────────┐
│                    Orchestrator                         │
│   Classifica domínio · Detecta cascata · Gate          │
└─────────────┬─────────────────────┬────────────────────┘
              │                     │
       Domínio DS ✅          Domínio App 🚧
              │                     │
    ┌─────────┴───┐      ┌──────────┴────┐
    │ DS Designer │      │ App Designer  │ (aguardando)
    │ DS Dev      │      │ App Dev React │ (aguardando)
    │ DS Reviewer │      │ App Dev Back  │ (a criar)
    └─────────────┘      └───────────────┘
```

---

## Arquitetura de tokens (3 tiers)

```
TIER 1 — Primitives (API privada)
  color-palette · scales · fonts · motion
       ↓
TIER 2 — Semantic (API pública via CSS vars)
  color-light/dark · spacing · sizing · shape
  elevation · typography
       ↓
TIER 2.5 — Component tokens
  components/sizing.ts → form.* · layout.* · icon.* · container.*
  components/spacing.ts → padCard.* · padPage.* · formGap (20px)
       ↓ transforms/to-tailwind-v4.ts
  CSS vars + @utility classes + RUNTIME BASE (ver abaixo)
       ↓
  [nome].styles.ts usa tv() — fonte de verdade visual
```

---

## Fluxo de dados de tokens

```
color-palette  scales  fonts  motion     ← primitives (privado)
       └──────────────┴──────────┘
                     ↓
   color-light/dark  spacing  sizing
   shape  elevation  typography          ← semantic (público)
                     ↓
            to-tailwind-v4.ts            ← transform
                     ↓
     src/styles/theme/tailwind-theme.css ← ÚNICO arquivo que os 4 canais leem
                     ↓
     [nome].styles.ts usa tv()           ← fonte de verdade visual
     classes: gap-gp-*, px-pad-*,
     rounded-radius-*, shadow-sh-*       ← sem colisão com Tailwind nativo
```

### O que o transform emite (não é só variável)

| Bloco | Função geradora |
|---|---|
| `@theme { }` — as CSS vars | corpo do `generateTailwindV4Css()` |
| `.dark { }` — overrides de cor | idem |
| `@utility text-*` — 27 presets em 7 roles | `buildTypographyUtilities()` |
| `@theme inline` de shadow + `:root`/`.dark` de indireção | L-043 — shadow não é dark-aware por `var()` |
| `@font-face` Geist/Geist Mono · `--font-sans`/`--font-mono` · `@custom-variant dark` · `html { font-family }` · `body { … }` · `@layer base { button { cursor } }` | **`buildRuntimeBase()`** |
| `@utility outline-float` + media query do bottom-sheet mobile | **`buildFloatingUtilities()`** |
| `@utility scrollbar-thin` / `scrollbar-default` | **`buildScrollbarUtilities()`** |

As três últimas linhas **moraram no `globals.css` até 2026-08-07**. Lá elas existiam só pro
showcase e não chegavam em npm, submódulo nem copy-in — custou 6 defeitos simultâneos.
**É proibido redeclará-las no `globals.css`**: classe sem layer vence `@utility` e a segunda
declaração de `@custom-variant` vence a primeira, então duplicar faz o showcase mostrar o
comportamento certo enquanto o consumidor recebe o errado. Gates: `orphan-utilities.mjs` e
`runtime-base.test.mjs`.

### Marcas (overlays de cor)

`to-brand-overlay.ts` gera `src/styles/theme/brand-<id>.css` a partir de
`tokens/brands/<id>/`, emitindo **só o diff** vs. a default em 2 blocos mutuamente
exclusivos: `[data-theme="<id>"]:not(.dark)` e `.dark[data-theme="<id>"]` (L-066 — sem o
`:not(.dark)` o bloco light vencia o dark por ordem de fonte). 5 marcas: `default` (é o
tema-base, sem overlay) · `blue` · `green` · `pay` · `vibrant`. **Marca muda SOMENTE cor** —
spacing/sizing/radius/elevation/tipografia vêm sempre de `brands/default/`.

---

## Distribuição — 4 canais, nenhum depreciado

| Canal | Entrega | Gotcha crítico |
|---|---|---|
| **copy-in / registry** (`igreen:add`) | código copiado pro `src/` do consumidor | canal primário; deploy automático no merge |
| **scaffold** (`npm create`) | projeto novo já em copy-in + kit de IA + prompt de marca | publish manual do CLI |
| **npm install** | ESM + CJS + types + `theme.css` + 4 overlays + fontes Geist | **exige `@source`** cobrindo `dist-lib/**` — Tailwind v4 não escaneia `node_modules`, e sem isso ZERO classes são geradas, sem erro |
| **submódulo git** (`ds:link`) | lê componentes do disco + projeta o kit de IA no `.claude/` do pai | deps e `.woff2` do Geist **não** vêm junto; `@source` **não** é necessário |

Detalhe por canal: `README.md`, `SUBMODULE-SETUP.md`, `DISTRIBUICAO.md` e
`cli/templates/default/_claude/rules/ds-channels.md` (a versão que o consumidor lê).

---

## Pipeline DS — fluxo por tipo de tarefa

| Tarefa | Fluxo |
|---|---|
| Token novo (qualquer tipo) | DS Designer → **[GATE]** → DS Dev → DS Reviewer |
| Componente iGreen novo | DS Designer → **[GATE]** → DS Dev → DS Reviewer |
| Componente Shadcn | DS Dev → DS Reviewer |
| Componente composto | DS Dev → DS Reviewer |
| Editar visual existente | DS Dev → DS Reviewer |
| Extração Figma | DS Designer → **[GATE]** → DS Dev |

---

## Decisão: componente DS vs tela App

| Situação | Domínio | Pasta | Command |
|---|---|---|---|
| Lógica Radix (modal, dropdown) | DS | `shadcn/` | `/ds-add-shadcn` |
| Visual sem lógica complexa | DS | `ui/` | `/ds-create-component` |
| Composição de existentes | DS | `ui/` | `/ds-create-composite` |
| Página / tela do app | App 🚧 | `pages/` | aguardando |
| Feature com lógica de negócio | App 🚧 | `features/` | aguardando |

---

## Cascatas

**Intra-DS:** Dev descobre token faltante → Orchestrator pausa → pipeline token → retoma componente.

**Cross-domínio (App → DS):** App precisa componente DS → Orchestrator pausa App → pipeline DS completo → retoma App.

---

## Estrutura detalhada — tokens/

```
tokens/brands/default/
├── primitives/                    ← TIER 1 — valores raw, API privada
│   ├── color-palette.ts
│   ├── scales.ts
│   ├── fonts.ts
│   └── motion.ts
├── semantic/                      ← TIER 2 — intenção, API pública
│   ├── color-light.ts / color-dark.ts
│   ├── spacing.ts                 ← space.* · gap.* · pad.*
│   ├── sizing.ts                  ← comp.*
│   ├── shape.ts                   ← radius.* · borderWidth.*
│   ├── elevation.ts               ← shadow.light/dark · opacity · blur · zIndex
│   └── typography.ts              ← display · heading · title · label · paragraph · subheading · caption · code
└── components/                    ← TIER 2.5 — orientado a componente
    ├── sizing.ts                  ← form.* · layout.* · icon.* · container.*
    └── spacing.ts                 ← padCard.* · padPage.* · formGap (20px)

tokens/brands/{blue,green,pay,vibrant}/   ← overlays de marca (só cor)
    primitives/color-palette.ts · semantic/color-{light,dark}.ts

transforms/                        ← 6 arquivos
├── to-tailwind-v4.ts              ← tema-base (produção) — o que os 4 canais leem
├── to-brand-overlay.ts            ← overlay por marca → brand-<id>.css (só o DIFF)
├── to-tailwind.ts                 ← saída Tailwind v3 (legado)
├── to-css-vars.ts                 ← `npm run tokens:css` → dist/tokens.css (NÃO gera globals.css)
├── to-js-theme.ts                 ← theme object
└── to-dtcg.ts                     ← .tokens.json para Figma
```

---

## Estrutura detalhada — src/

```
src/
├── utils/tv.ts                    ← wrapper tv() com tailwind-merge configurado
├── lib/utils.ts                   ← cn() com tailwind-merge configurado pros prefixos DS
├── styles/globals.css             ← APENAS: @imports + bridge shadcn + keyframes do showcase
│                                     ⛔ não redeclare aqui nada que o tema gerado emite
├── styles/theme/                  ← GERADO — não editar à mão
│   ├── tailwind-theme.css         ← tema-base: vars + @utility + runtime base
│   └── brand-{blue,green,pay,vibrant}.css  ← overlays de marca (só o diff)
├── hooks/useTheme.ts              ← toggle light/dark
├── hooks/useBrand.ts              ← marca ativa; catálogo INJETÁVEL (`useBrand({ brands })`)
│                                     `isBrand` valida contra o catálogo ativo; retorna `current`
├── components/
│   ├── ui/[Nome]/                 ← componentes iGreen
│   │   ├── [nome].styles.ts       ← tv() — fonte de verdade visual
│   │   ├── [nome].tsx
│   │   ├── [nome].types.ts
│   │   ├── index.ts
│   │   └── USAGE.md               ← OBRIGATÓRIO (atalho IA)
│   └── shadcn/                    ← componentes Shadcn (wrappers adaptados)
└── preview/pages/                 ← doc pages + showcases + previews
```

---

## Estrutura detalhada — `.claude/` + `.ai/`

```
.claude/                  ← Pipeline organizacional (Claude Code)
├── agents/               ← Identidade dos 6 agents
│   ├── orchestrator.md   (carregado em qualquer tarefa)
│   ├── ds-designer.md
│   ├── ds-dev.md
│   ├── ds-reviewer.md
│   ├── app-designer.md   (🚧)
│   └── app-dev-react.md  (🚧)
├── commands/             ← Slash commands (entry points) — 15
│   ├── ds-add-token · ds-add-shadcn · ds-create-component · ds-create-composite
│   ├── ds-extract-figma · ds-create-brand
│   ├── ds-create-screen · ds-create-crud · ds-create-list · ds-create-dashboard
│   ├── ds-create-app · ds-create-login · ds-replicate-module
│   └── ds-release · ds-update
├── skills/               ← Routers + sub-skills modulares — 14 pastas
│   ├── ds-designer/      (SKILL.md + sub-skills)
│   ├── ds-dev/           (SKILL.md + sub-skills)
│   ├── ds-reviewer/      (SKILL.md + review-component + pre-commit-check)
│   ├── brand-builder/    ← marca/tema novo (10 superfícies)
│   ├── crud-builder/ · list-builder/ · dashboard-builder/
│   ├── app-builder/ · auth-builder/ · screen-composer/ · module-replicator/
│   ├── app-designer/     (🚧)
│   ├── app-dev-react/    (🚧)
│   └── igreen-frontend/  (fallback de composição — prefira os builders, que têm gate)
├── rules/                ← Regras carregadas auto (glob-scoped)
│   └── ds-standards.md   (regras + lessons + forbidden — consolidado)
├── hooks/                ← Shell scripts que sempre disparam — 5
│   ├── ds-lint-styles.sh       (informativo — anti-patterns em *.styles.ts)
│   ├── ds-inventory-check.sh   (informativo — 5 das 8 superfícies do componente)
│   ├── ds-tokens-check.sh      (informativo — lembra tokens:tw4 + distribuição)
│   ├── block-rm-rf.sh          (BLOQUEIA)
│   └── block-sensitive-edit.sh (BLOQUEIA .env/credentials/migrations)
├── output-styles/        ← Response shapes
│   └── terse.md
├── scripts/
│   └── sync-agents-to-cursor.cjs  ← mirror .claude/agents → .cursor/rules
└── settings.json         ← Control panel (permissions + hooks + outputStyle)

.ai/                      ← Contexto técnico do projeto
├── context/              ← Context maps (sob demanda)
│   ├── architecture.md   (este arquivo — fonte única)
│   ├── doc-guide.md
│   ├── shared-app-context.md  (🚧 aguardando App)
│   ├── components/
│   │   ├── inventory.md   ← lista canônica (fonte única)
│   │   ├── guide.md
│   │   └── shadcn-token-map.md
│   └── tokens/
│       ├── color.md
│       ├── spacing.md
│       ├── sizing-shape-elevation.md
│       ├── typography.md
│       └── motion.md
├── rules/
│   └── coding-standards.md  ← padrão tv() detalhado (carrega on-demand)
├── specs/                ← Specs ativas (humano-facing)
│   └── table-replica-from-sandbox.md
└── status/
    ├── pipeline-state.md  ← audit log (append-only)
    ├── lessons.md         ← lições L-NNN no formato completo (contagem: só no título
    │                        do resumo em ds-standards.md, que é o lugar com gate)
    ├── lessons-archive.md ← lições absorvidas em gate automático
    ├── BACKLOG.md
    └── archive/
        └── superpowers-2026-05/  (plans/specs implementados)
```

---

## Mirror Cursor (`.cursor/rules/`)

`sync-agents-to-cursor.cjs` espelha `.claude/agents/*.md` → `.cursor/rules/_agent-*.mdc` automaticamente. Mantém integração Cursor sincronizada quando os agents são editados.

Rodar manualmente:
```bash
node .claude/scripts/sync-agents-to-cursor.cjs
```

---

## Fonte única por tipo de informação

| Tipo de informação | Fonte canônica |
|---|---|
| Regras DS + lições (L-NNN) + anti-patterns | `.claude/rules/ds-standards.md` |
| Identidade dos agents | `.claude/agents/<nome>.md` |
| Templates de implementação | `.claude/skills/<agent>/<skill>.md` |
| Slash commands | `.claude/commands/<nome>.md` |
| Hooks (shell automations) | `.claude/hooks/<nome>.sh` |
| Output shapes | `.claude/output-styles/<nome>.md` |
| Settings + hooks registry | `.claude/settings.json` |
| **Arquitetura (este doc)** | `.ai/context/architecture.md` |
| Inventário de componentes | `.ai/context/components/inventory.md` |
| Spec de tokens (por tipo) | `.ai/context/tokens/<tipo>.md` |
| Padrão tv() completo (long-form) | `.ai/rules/coding-standards.md` |
| Audit log de decisões | `.ai/status/pipeline-state.md` |
| Lições completas (L-NNN) | `.ai/status/lessons.md` |
| Backlog | `.ai/status/BACKLOG.md` |
| Docs por componente | `src/components/ui/<Nome>/USAGE.md` |
| Doc humana do pipeline | `README-PIPELINE-WORKFLOW.md` (raiz) |
