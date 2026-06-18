# iGreen Design System

Design system interno da iGreen para SaaS CRM, painéis admin e dashboards.

---

## Comece aqui

Escolha o caminho conforme seu objetivo:

- **Quero consumir o DS num projeto** → veja [`## Consumir em outro projeto`](#consumir-em-outro-projeto) (CLI/registry) e [`DISTRIBUICAO.md`](DISTRIBUICAO.md).
- **Quero desenvolver no DS** → veja [`## Setup (desenvolvimento no DS)`](#setup-desenvolvimento-no-ds) e [`CLAUDE.md`](CLAUDE.md).
- **Sou operador (não-dev)** → veja [`INICIO-DE-SESSAO.md`](INICIO-DE-SESSAO.md).

---

## O que é

Biblioteca de componentes, tokens e padrões usada pelas plataformas internas da iGreen — admin do CRM, dashboards operacionais, painéis de licenciamento e demais interfaces administrativas.

Stack canônica: **React 19 + TypeScript + Vite + Tailwind CSS v4 + Shadcn/ui + Radix UI**. Tailwind v4 e Shadcn são dependências diretas (não adapters opcionais) — todos os componentes são distribuídos com classes Tailwind nativas e padrões Shadcn.

---

## Para quem é

- Telas administrativas (CRM, ERP-like, BPM)
- Dashboards operacionais e analíticos
- Painéis internos de licenciados e parceiros
- Qualquer aplicação iGreen que precise de consistência visual e padrão de interação

Não é um DS público nem genérico. É opinionado para SaaS densos de dados — tabelas grandes, formulários complexos, filtros, kanbans, modais multi-step.

---

## Stack

| Camada | Tech |
|---|---|
| Framework | React 19 + Vite 6 |
| Linguagem | TypeScript 5.6 |
| Styling | Tailwind CSS v4 (@theme) |
| Variants | `tailwind-variants` via `@/utils/tv` |
| Primitives | Shadcn/ui + Radix UI |
| Ícones | Lucide Icons |
| Fonte | Geist |
| Dnd | `@dnd-kit` (Kanban) |
| Virtualização | `@tanstack/react-virtual` |
| Tabelas/charts | Recharts |
| Testes | Vitest |

---

## O que tem dentro

- **Componentes iGreen** custom em `src/components/ui/` construídos com `tv()` — Button, Chip, Avatar, AppShell, Header, MenuSidebar, Modal, AlertModal, FloatingPanel, Panel, PageHeader, FormField, Kanban, Table, TableToolbar, FooterTable e mais
- **Componentes Shadcn** adaptados em `src/components/shadcn/` — Badge, Input, Select, Tabs, Card, Switch, Checkbox, RadioGroup, Slider, Progress, Dialog, DropdownMenu, Tooltip, Calendar e demais primitives do Radix
- **3 tiers de tokens** em `tokens/brands/default/` (primitives → semantic → component)
- **Pipeline de AI** com 4 agentes em `.claude/agents/` (Claude Code) espelhado em `.cursor/rules/`
- **Preview app navegável** com docs vivas em `npm run dev` — sempre reflete o estado atual do código

---

## Arquitetura de tokens

```
tokens/brands/default/
│
├── primitives/          Tier 1 — valores raw (API privada)
│   ├── color-palette    Escalas OKLCH: brand, neutral, feedback, alpha
│   ├── scales           Escala espacial: sp(n) = n × 4px
│   ├── fonts            Escala tipográfica: BASE=16, ratio=1.25
│   └── motion           Duração + easing
│
├── semantic/            Tier 2 — intenção (API pública via CSS vars)
│   ├── color-light      bg.*, fg.*, border.*, ring.*, overlay.*
│   ├── color-dark       Mesmo contrato, valores dark
│   ├── spacing          space (sp-), gap (gp-), pad (pad-)
│   ├── sizing           comp.* (form, icon, layout, container)
│   ├── shape            radius.* + borderWidth
│   ├── elevation        shadow.* (light/dark), opacity, blur
│   └── typography       Presets compostos (rem + clamp): display, heading, title, label, paragraph, code
│
└── components/          Tier 2.5 — escalas componente-específicas
    ├── sizing           form.*, icon.*, layout.*, container.*
    └── spacing          padCard.*, padPage.*
```

**Componentes consomem semantic via CSS vars geradas pelo transform** — nunca importam primitives diretamente.

---

## Quick start (CLI)

Para criar um projeto novo do zero já consumindo o DS, com tudo configurado (Vite + React 19 + Tailwind v4 + tema light/dark + exemplo funcional):

```bash
npm create @snksergio/design-system my-app
cd my-app
npm run dev
```

O CLI pergunta o nome do projeto, package manager, se quer instalar deps e iniciar git. Em ~30 segundos você tem um app rodando em `http://localhost:3200` com 4 componentes do DS demonstrados. Sem precisar configurar nada manualmente, sem gotcha do `@source` do Tailwind v4.

**A partir de v0.1.5 (junho 2026):** o template default inclui também um `CLAUDE.md` na raiz com onboarding consumer-facing pra Claude Code / Cursor / agentes AI — lista de componentes, anti-patterns proibidos e padrões obrigatórios. Permite que qualquer agente AI gere UI consistente com o DS desde o primeiro prompt. **Mas o pipeline AI completo do DS (agents/skills/hooks/rules — ver seção [AI Pipeline](#ai-pipeline) abaixo) NÃO vem via CLI** — vive só neste repositório. Pra ter o pipeline completo, clone o repo.

Ver detalhes: [`cli/README.md`](cli/README.md).

---

## Consumir em outro projeto

O iGreen DS é distribuído por **copy-in via registry** (padrão shadcn) — **não** como pacote npm. O código de cada componente é **copiado pro seu projeto** (`src/`), virando código seu, editável.

**Projeto novo (recomendado):**

```bash
npx @snksergio/create-design-system@latest meu-app
```

Cria o projeto já conectado ao registry, com tema/`cn`/`tv` configurados, tela de boas-vindas, exemplos navegáveis e o kit de IA pra montar telas por intenção.

**Projeto existente:** configure o registry `@igreen` no `components.json` (Bearer `IGREEN_TOKEN`) e puxe componentes com `npx shadcn add @igreen/<nome>` (ou o wrapper `npm run igreen:add` no scaffold, que mantém o manifesto).

> ⚠️ O pacote npm `@snksergio/design-system` está **DEPRECIADO** (era uma tentativa antiga de virar lib). **Não use `npm install` dele** — o canal vivo é o registry/CLI acima. Modelo e versionamento explicados em `DISTRIBUICAO.md` e na página **Distribution** do catálogo.

**O que NÃO vem no copy-in:** o pipeline interno do DS (`.claude/agents|skills|hooks`, `.ai/context`, lições) vive só neste repositório. O **kit do consumidor** (orquestrador `ds-kit` + skills de tela + `DESIGN.md` + proteção por hook) vem via CLI no scaffold.

---

## Tutorial — produzir telas e CRUDs com IA (DS como subprojeto)

> Cenário: seu app tem o DS clonado numa **subpasta** (monorepo, `vendor/`,
> git submodule) e a sessão do Claude Code abre na raiz do SEU projeto.
> Nesse caso o Claude **não** descobre o `.claude/` do DS sozinho — os slash
> commands e skills do pipeline ficam invisíveis. A solução é **apontar**:
> skills são markdown, e a IA lê e segue os arquivos quando o prompt indica
> a porta de entrada.

### Passo 1 — Bootstrap de contexto (início de toda sessão)

Antes de qualquer tarefa que use o DS, mande (troque `<pasta-do-ds>` pelo
caminho real, ex: `packages/igreen-ds`):

```
Tenho o iGreen Design System em <pasta-do-ds>. Leia o CLAUDE.md e o
.claude/rules/ds-standards.md de lá pra ter o contexto real do design
system (regras, tokens, componentes, lições, anti-patterns). Siga essas
regras como autoritativas em tudo que fizer aqui. Quando precisar de um
componente, consulte <pasta-do-ds>/.ai/context/components/inventory.md e
o USAGE.md do componente antes de escrever código.
```

Isso carrega o mínimo certo (~regras + mapa). **Não** mande ler o
`README-PIPELINE-WORKFLOW.md` inteiro — é referência humana (~90KB).

### Passo 2 — Criar tela de tabela/CRUD (skill `crud-builder`)

O DS tem uma skill guiada que entrevista você (colunas, filtros, views,
kanban, virtualização…), monta um blueprint pra aprovação e só então gera a
página — sempre espelhando os exemplos canônicos. Prompt:

```
Use a skill crud-builder que está em
<pasta-do-ds>/.claude/skills/crud-builder/SKILL.md pra criar uma página de
tabela de <entidade> no meu app. Siga os arquivos da skill à risca, sem
improvisar fora deles. Meus dados: <cole um JSON de exemplo, a interface
TS, ou descreva o endpoint>.
```

Funciona mesmo sem o shape completo dos dados (a skill infere colunas de um
sample e confirma com você). Nada é gerado antes de você aprovar o blueprint.

### Alternativas

| Forma | Quando usar |
|---|---|
| **Apontar via prompt** (passos acima) | Default — zero setup, funciona em qualquer projeto |
| **Abrir a sessão dentro da pasta do DS** | Quer o pipeline nativo (`/ds-create-crud`, hooks, rules auto-carregadas) |
| **Copiar pro seu `.claude/`** | Copie `ds-create-crud.md` (commands) + `crud-builder/` (skills) pro `.claude/` do seu projeto — o slash command vira nativo; a skill detecta que está num consumer e adapta imports |
| **Consumo só via npm** (sem o repo no disco) | A skill não está no pacote — aponte pros arquivos no GitHub (`igreenlab/igreen-desingsystem-admin` → `.claude/skills/crud-builder/`) ou clone o repo |

Detalhes do mecanismo: [`README-PIPELINE-WORKFLOW.md`](README-PIPELINE-WORKFLOW.md) §8 "Usando skills quando o DS é subprojeto".

---

## Setup (desenvolvimento no DS)

Requisitos: Node 20+, npm 10+ (ou pnpm/yarn).

```bash
# 1. Clone
git clone https://github.com/igreenlab/igreen-desingsystem-admin.git
cd igreen-desingsystem-admin

# 2. Install
npm install

# 3. Gerar o tema Tailwind v4
npm run tokens:tw4

# 4. Subir o preview
npm run dev
# → http://localhost:3100
```

`npm run dev` regenera o tema automaticamente antes do Vite.

### Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Tokens + dev server (porta 3100) |
| `npm run build` | Tokens + tsc + vite build |
| `npm run preview` | Servir o build local |
| `npm run tokens:tw4` | Regenerar `tailwind-theme.css` |
| `npm run tokens:check` | `tsc --noEmit` nos tokens |
| `npm test` | Rodar Vitest |
| `npm run sync:agents` | Espelhar `.claude/agents/` em `.cursor/rules/` |

---

## Anti-collision prefixes

Tokens DS usam prefixos para não colidir com utilities nativas do Tailwind:

| Token | Classe DS | Em vez de |
|---|---|---|
| gap | `gap-gp-md` | `gap-4` |
| spacing | `p-sp-md` | `p-4` |
| pad | `px-pad-lg` | `px-3` |
| radius | `rounded-radius-base` | `rounded-lg` |
| shadow | `shadow-sh-md` | `shadow-md` |
| form height | `min-h-form-lg` (40px) | `h-10` |
| icon | `size-icon-md` (20px) | `size-5` |
| container | `max-w-container-md` | `max-w-md` |

---

## AI Pipeline

> **⚠️ Esta infra vive APENAS neste repositório de desenvolvimento.**
> Não é distribuída via npm nem via CLI bootstrap. Apps que apenas
> *consomem* o DS recebem componentes buildados + types + theme.css.
> Quem quer agents, skills, hooks, slash commands e rules
> auto-carregadas precisa clonar o repo (ver [Setup](#setup-desenvolvimento-no-ds)).
>
> Apps criados via `npm create @snksergio/design-system` recebem um
> arquivo `CLAUDE.md` de onboarding (a partir de v0.1.5) — suficiente
> pra Claude Code / Cursor gerar UI usando os tokens do DS, mas
> sem a infra de pipeline (gates de approval, auto-review,
> changelog automation, etc.).

Pipeline de 6 agentes (4 ativos + 2 placeholders 🚧 aguardando primeira tela do app desktop) configurado em `.claude/agents/` (Claude Code) e espelhado em `.cursor/rules/` (Cursor).

| Agente | Responsabilidade | Modelo | Status |
|---|---|---|---|
| `orchestrator` | Classifica a tarefa e delega | Sonnet | ✅ ativo |
| `ds-designer` | Especifica tokens e componentes (com gate) | Sonnet | ✅ ativo |
| `ds-dev` | Implementa a spec aprovada | Opus | ✅ ativo |
| `ds-reviewer` | Valida antes do merge (regression sweep + critique genuína) | Sonnet | ✅ ativo |
| `app-designer` | Especifica telas/fluxos do app consumidor | Sonnet | 🚧 placeholder (aguardando primeira tela) |
| `app-dev-react` | Implementa telas com componentes DS existentes | Opus | 🚧 placeholder (aguardando primeira tela) |

**Slash commands disponíveis:** `/ds-add-token`, `/ds-create-component`, `/ds-create-composite`, `/ds-add-shadcn`, `/ds-extract-figma`, `/ds-release` (release completa com branch + PR), `/ds-update` (timeline de updates), `/ds-create-crud` (construtor guiado de telas CRUD/tabela — ver [Tutorial](#tutorial--produzir-telas-e-cruds-com-ia-ds-como-subprojeto))

A infraestrutura inclui:
- **Skills** atômicas por agente (`.claude/skills/`)
- **Hooks** PreToolUse/PostToolUse (`format-on-save`, `block-rm-rf`, `block-sensitive-edit`)
- **Output style** terse aplicado a toda sessão
- **MCP servers** (Figma, filesystem, chrome-devtools)
- **Memory system 4 camadas** (user, project, audit log, lessons system)

Detalhes no preview app → seções **Agents** e **Pipeline Infra**.

---

## Component styles

Componentes iGreen seguem o padrão `tv()` do `tailwind-variants`. Cada componente tem 5 arquivos:

```
src/components/ui/Nome/
├── nome.tsx              # markup — zero hardcode
├── nome.styles.ts        # tv() — fonte de verdade visual
├── nome.types.ts         # VariantProps
├── index.ts              # barrel export
└── USAGE.md              # documentação por componente (atalho IA)
```

Mudar o visual = mudar **só** o `.styles.ts`. Componentes Shadcn ficam em `src/components/shadcn/` com a lógica Radix preservada e classes substituídas por tokens DS.

---

## Estrutura do repositório

```
├── tokens/              Tokens + transforms
├── src/
│   ├── components/ui/   Componentes iGreen (tv)
│   ├── components/shadcn/  Componentes Shadcn adaptados
│   ├── styles/theme/    CSS gerado pelo transform
│   ├── preview/         Doc pages (app navegável)
│   └── utils/           tv(), cn()
├── .claude/             Pipeline orchestration (agents, skills, hooks, rules)
├── .ai/                 Contexto técnico + audit log + lessons
├── memory/              Memória project-level
├── CLAUDE.md            Regras carregadas em toda sessão Claude
└── README-PIPELINE-WORKFLOW.md   Guia humano detalhado do pipeline
```

---

## Acessibilidade

- WCAG 2.5.5 — touch targets ≥ 44px (`min-h-form-xl`)
- Focus rings visíveis com `ring-ring-{color}` (cor por variant, nunca no base)
- Tokens dark com hierarquia crescente e shadows/rings amplificados

---

## Documentação completa

```bash
npm run dev
```

A preview app cobre:
- **Get Started** — Introduction, Structure, Installation, Transform Tokens
- **Agents** — Overview, Pipeline (estrutural + simulador), 4 agentes individuais
- **Pipeline Infra** — Skills, Commands, Hooks, Output Styles, MCP Servers, Memory System
- **Foundations** — Tokens Overview, Color, Typography, Spacing, Sizing, Shape, Elevation, Icons
- **Components** — docs com exemplos vivos para cada componente
- **Templates & Examples** — AppShell, Showcases, ChatV2, ClientesShowcase, Dashboard

---

## Licença

Uso interno iGreen. Sem distribuição pública.
