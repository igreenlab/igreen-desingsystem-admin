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
  components/spacing.ts → padCard.* · padPage.*
       ↓ transforms/to-tailwind-v4.ts
  CSS vars + @utility classes
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
     src/styles/theme/tailwind-theme.css ← CSS vars + @utility classes
                     ↓
     [nome].styles.ts usa tv()           ← fonte de verdade visual
     classes: gap-gp-*, px-pad-*,
     rounded-radius-*, shadow-sh-*       ← sem colisão com Tailwind nativo
```

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
    └── spacing.ts                 ← padCard.* · padPage.*

transforms/
├── to-tailwind-v4.ts              ← CSS @theme tokens (produção)
├── to-css-vars.ts                 ← globals.css com CSS Custom Properties
├── to-js-theme.ts                 ← theme object
└── to-dtcg.ts                     ← .tokens.json para Figma
```

---

## Estrutura detalhada — src/

```
src/
├── utils/tv.ts                    ← wrapper tv() com tailwind-merge configurado
├── styles/globals.css             ← @import tailwindcss + theme + shadcn compat
├── hooks/useTheme.ts              ← toggle light/dark
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
├── commands/             ← Slash commands (entry points)
│   ├── ds-add-token.md
│   ├── ds-add-shadcn.md
│   ├── ds-create-component.md
│   ├── ds-create-composite.md
│   └── ds-extract-figma.md
├── skills/               ← Routers + sub-skills modulares
│   ├── ds-designer/      (SKILL.md + 6 sub-skills)
│   ├── ds-dev/           (SKILL.md + 4 sub-skills)
│   ├── ds-reviewer/      (SKILL.md + review-component)
│   ├── frontend-design/
│   ├── app-designer/     (🚧)
│   ├── app-dev-react/    (🚧)
│   └── igreen-page/      (🚧)
├── rules/                ← Regras carregadas auto (glob-scoped)
│   └── ds-standards.md   (regras + lessons + forbidden — consolidado)
├── hooks/                ← Shell scripts que sempre disparam
│   ├── ds-lint-styles.sh
│   └── block-rm-rf.sh
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
    ├── lessons.md         ← L-001 a L-014+ completas
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
| Regras DS + 14 lições + anti-patterns | `.claude/rules/ds-standards.md` |
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
