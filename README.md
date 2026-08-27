# iGreen Design System

Design system interno da iGreen para SaaS CRM, painéis admin e dashboards.

---

## Comece aqui

Escolha o caminho conforme seu objetivo:

- **Quero ver o DS funcionando** → catálogo + documentação viva em **[igreen-desingsystem-admin.vercel.app](https://igreen-desingsystem-admin.vercel.app/#/introduction)** (componentes, tokens, exemplos e pipeline).
- **Quero consumir o DS num projeto** → veja [`## Consumir em outro projeto`](#consumir-em-outro-projeto) (CLI/registry) e [`DISTRIBUICAO.md`](DISTRIBUICAO.md).
- **Quero contribuir com o DS (primeira PR)** → comece em **[`CONTRIBUTING.md`](CONTRIBUTING.md)** — o fluxo, o que o CI verifica e as regras que não têm exceção. Depois, [`## Setup (desenvolvimento no DS)`](#setup-desenvolvimento-no-ds).
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
- **Pipeline de AI** com 6 agentes em `.claude/agents/` (4 ativos + 2 placeholders do domínio App) espelhado em `.cursor/rules/`
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
npm create @snksergio/design-system@latest my-app
cd my-app
npm run dev
```

O CLI pergunta o nome do projeto, package manager, se quer instalar deps e iniciar git, e o `IGREEN_TOKEN` do registry (pode pular e colar depois). Em ~30 segundos você tem um app rodando em `http://localhost:3200` com tela de boas-vindas, exemplos navegáveis no menu e tema claro/escuro/sistema. Sem configurar nada manualmente, sem gotcha do `@source` do Tailwind v4.

O template default já inclui um `CLAUDE.md` de onboarding **+ um kit de IA pro consumidor** (orquestrador `ds-kit`, skills de tela, `DESIGN.md`, hook de proteção) — pra Claude Code / Cursor montarem telas no padrão por intenção. **Mas o pipeline de desenvolvimento do DS** (agents/skills/hooks/rules de criação de token/componente — ver [AI Pipeline](#ai-pipeline)) **NÃO vem via CLI** — vive só neste repositório. Pra ter o pipeline completo, clone o repo.

Ver detalhes: [`cli/README.md`](cli/README.md).

---

## Consumir em outro projeto

O iGreen DS tem **4 canais de consumo, todos suportados — nenhum depreciado**:

| Canal | Como | O que muda |
|---|---|---|
| **copy-in / registry** (padrão shadcn) | `npm run igreen:add -- <x>` | o código é **copiado pro seu `src/`** e vira seu, editável |
| **scaffold** | `npm create @snksergio/design-system` | projeto novo já em copy-in, com tema + kit de IA + prompt de marca |
| **npm install** | `npm i @snksergio/design-system` | consome como **dependência**; exige a diretiva `@source` (abaixo) |
| **submódulo git** | `npm run ds:link` no repo pai | lê os componentes **do disco**; ganha o mesmo kit de IA |

O copy-in é o canal **primário** — é onde as versões saem primeiro, porque o deploy do
registry é automático no merge. Os outros três dependem de um `npm publish` manual do
mantenedor, então podem ficar uma versão atrás. Isso é **ordem de publicação**, não
hierarquia de suporte: escolha o canal pelo modelo que você quer (código seu × dependência
versionada × fonte compartilhada), não por qual "vale mais".

Detalhe por canal: `DISTRIBUICAO.md`, `SUBMODULE-SETUP.md` e a página **Distribution** do catálogo.

**Projeto novo (recomendado):**

```bash
npx @snksergio/create-design-system@latest meu-app
```

Cria o projeto já conectado ao registry, com tema/`cn`/`tv` configurados, tela de boas-vindas, exemplos navegáveis e o kit de IA pra montar telas por intenção.

**Projeto existente:** configure o registry `@igreen` no `components.json` (Bearer `IGREEN_TOKEN`) e puxe componentes com `npx shadcn add @igreen/<nome>` (ou o wrapper `npm run igreen:add` no scaffold, que mantém o manifesto).

> O pacote npm `@snksergio/design-system` entrega ESM + CJS + types + `theme.css` + os 4
> overlays de marca + as fontes Geist. Ele é publicado por passo manual do mantenedor
> (token/2FA), então pode estar uma versão atrás do registry — mas **não é depreciado**,
> e o setup abaixo é obrigatório pra ele funcionar.

### Consumindo por `npm install` — setup completo

⚠️ **A linha `@source` é obrigatória.** O Tailwind v4 **não escaneia `node_modules`**, então
sem ela nenhuma classe do DS é gerada e os componentes renderizam **sem estilo nenhum** —
não parcialmente: medido em 2026-08-07, **9 regras CSS** contra as milhares do showcase, com
o `<Button>` saindo transparente, 24px de altura e radius 0. Não há erro, e é fácil concluir
que "o pacote está quebrado".

```css
/* seu src/index.css */
@import "tailwindcss";
@source "../node_modules/@snksergio/design-system/dist-lib/**/*.mjs";
@import "@snksergio/design-system/theme.css";
```

O `@source` precisa cobrir `dist-lib/**`, não só o `index.mjs`: as classes dos componentes
flutuantes (Modal, Panel, dropdown, popover) vivem nos **chunks**.

O `theme.css` já traz tudo que o runtime precisa — `@font-face` do Geist, `--font-sans`,
`@custom-variant dark` (dark por classe, não por `prefers-color-scheme`), `body` e as
utilities do DS. Antes da v0.35.0 nada disso viajava e o canal ficava com fundo branco no
dark, tipografia em system-ui e `dark:` amarrado ao tema do sistema operacional.

**Fontes.** O `@font-face` aponta pra `/fonts/*.woff2` — caminho relativo à **raiz do site**,
não ao pacote. Copie os dois arquivos pro seu `public/fonts/`:

```bash
cp node_modules/@snksergio/design-system/dist-lib/fonts/*.woff2 public/fonts/
```

Sem isso a tipografia cai em `system-ui` e os 27 presets do DS renderizam na fonte errada.

**Animações.** Overlays (dropdown, popover, dialog, sheet) usam `animate-in`/`fade-in`/
`zoom-in`, que vêm do `tw-animate-css`. Sem ele funcionam, mas sem transição:

```css
@import "tw-animate-css";   /* opcional — só as animações de entrada/saída */
```

**O que dá pra importar (≥ 0.37.0).** Duas entradas:

```ts
// raiz — 41 dos 42 componentes ui/ + os hooks de tema
import { Button, DataTable, AppShell, Chart, DataList, List, toast, useBrand } from "@snksergio/design-system";

// subpath — os 41 primitivos shadcn adaptados aos tokens do DS
import { Dialog, Select, Tabs, Popover, Tooltip, Card, Calendar } from "@snksergio/design-system/shadcn";
```

São duas entradas, e não uma, porque os primitivos somam 41 arquivos / 233 nomes exportados
enquanto o consumidor típico usa 3 ou 4 — no mesmo barrel, qualquer `import` do pacote
arrastaria Radix + cmdk + vaul + embla + input-otp + sonner antes de o bundler conseguir
podar. Quem não importa `/shadcn` não paga por eles.

O único componente `ui/` fora do npm é `TabelaTeste` (demo interno do showcase). Até a
0.36.0 o barrel tinha 37 — `Chart`, `DataList`, `List` e `Toast` ficavam de fora, e não
havia subpath `/shadcn`.

**O que NÃO vem no copy-in:** o pipeline interno do DS (`.claude/agents|skills|hooks`, `.ai/context`, lições) vive só neste repositório. O **kit do consumidor** (orquestrador `ds-kit` + skills de tela + `DESIGN.md` + proteção por hook) vem via CLI no scaffold.

### Trocar o tema de marca

O DS tem 5 marcas (`default` · `blue` · `green` · `pay` · `vibrant`). Cada uma não-default
é um **overlay** escopado em `[data-theme="<id>"]` que sobrescreve só as cores que diferem
do tema-base. Marca e claro/escuro são eixos independentes e combinam livremente.

**Projeto novo:** o prompt **"Tema de cor?"** do scaffold já pergunta e aplica.

**Projeto em andamento** — 2 passos, qualquer canal:

```bash
# copy-in (scaffold): o tema é um item do registry, igual a um componente
npm run igreen:add -- theme-vibrant
```
```css
/* 1. importar DEPOIS do tema-base */
@import "@snksergio/design-system/theme.css";                 /* npm       */
@import "@snksergio/design-system/theme/brand-vibrant.css";
/* ou, em copy-in / submódulo, o caminho local do arquivo */
```
```html
<!-- 2. ativar — sem isto o CSS fica INERTE, e não dá erro -->
<html data-theme="vibrant">
```

Via **npm** exige `@snksergio/design-system` ≥ **0.31.1**. Via **submódulo** o arquivo já
está no disco: só importar e `git pull` traz temas novos.

Guia completo (trocar, criar tema novo, troca em runtime, armadilhas) na página
**Temas de marca** do catálogo, e a tabela de qual canal entrega o quê em
`DISTRIBUICAO.md` §2.1.

---

## Tutorial — produzir telas e CRUDs com IA (DS como subprojeto)

> Cenário: seu app tem o DS clonado numa **subpasta** (monorepo, `vendor/`,
> git submodule) e a sessão do Claude Code abre na raiz do SEU projeto.
> Nesse caso o Claude **não** descobre o `.claude/` do DS sozinho — os slash
> commands e skills do pipeline ficam invisíveis.

### Recomendado — `ds-link` (setup uma vez)

Se o DS está no disco (submódulo/subpasta), rode o **`ds-link`** na raiz do SEU
projeto: ele projeta o mesmo kit de IA que o CLI npm instala (skills
`crud-builder`/`list-builder`/`dashboard-builder`, commands, rules) pra dentro do
seu `.claude/` — aí `/ds-create-crud`, `/ds-create-dashboard` etc. viram
**descobríveis nativamente**, sem bootstrap por sessão.

```bash
# ajuste "design-system" pro caminho real do submódulo
npm --prefix design-system run ds:link
# ou:  node design-system/scripts/ds-link.mjs
```

Escreve `.claude/ds-config.json` (`mode: submodule`) — as skills leem componentes/
exemplos direto de `<submódulo>/src` (sem `igreen:add`/registry) e importam pelo
alias detectado no seu `tsconfig`/`vite` (fallback `@ds`). Re-rode após
`git submodule update --remote --merge` (idempotente); `--unlink` desfaz. Guia completo:
[`SUBMODULE-SETUP.md`](SUBMODULE-SETUP.md).

> Sem poder rodar o script? O caminho **manual** (apontar por prompt) abaixo
> continua válido como fallback.

### Passo 1 — Bootstrap de contexto (fallback manual, início de toda sessão)

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
| **`ds-link`** (recomendado) | DS no disco (submódulo/subpasta) — projeta o kit no seu `.claude/`, slash commands nativos, sem bootstrap por sessão. `npm --prefix <ds> run ds:link` |
| **Apontar via prompt** (Passo 1) | Fallback — não pode rodar o script; zero setup, funciona em qualquer projeto |
| **Abrir a sessão dentro da pasta do DS** | Quer o pipeline de desenvolvimento nativo (agents/hooks/rules do DS, não só o kit de telas) |
| **Consumo só via npm** (sem o repo no disco) | O kit vem no scaffold do CLI (`npx @snksergio/create-design-system`); num projeto já existente, aponte pros arquivos no GitHub ou clone o repo |

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
| container | `max-w-md` (escala do DS: 768px) | — **única exceção: não dobra prefixo** |

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

**Slash commands disponíveis (15):**

| Comando | O que faz |
|---|---|
| `/ds-add-token` | token semântico novo (gate obrigatório) |
| `/ds-create-component` · `/ds-create-composite` · `/ds-add-shadcn` | componente iGreen / composto / adaptação shadcn |
| `/ds-extract-figma` | extrair componente ou tokens do Figma |
| `/ds-create-brand` | marca/tema de cor novo (overlay `[data-theme]`, 10 superfícies) |
| `/ds-create-screen` | front-door: desambigua e roteia pro builder certo |
| `/ds-create-crud` · `/ds-create-list` · `/ds-create-dashboard` | tela de tabela / lista de cards / painel (entrevista guiada) |
| `/ds-create-app` · `/ds-create-login` | app completo / tela de autenticação |
| `/ds-replicate-module` | replicar módulo existente pra outro domínio |
| `/ds-release` | release completa: changelog + bump + registry + branch + PR |
| `/ds-update` | só a timeline de updates (sem bump/PR) |

Tutorial de telas: [Tutorial](#tutorial--produzir-telas-e-cruds-com-ia-ds-como-subprojeto).

A infraestrutura inclui:
- **Skills** atômicas por agente (`.claude/skills/`)
- **Hooks** PreToolUse/PostToolUse — 5: informativos (`ds-lint-styles`, `ds-inventory-check`, `ds-tokens-check`) e bloqueantes (`block-rm-rf`, `block-sensitive-edit`)
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

Online (sempre na última versão publicada): **[igreen-desingsystem-admin.vercel.app/#/introduction](https://igreen-desingsystem-admin.vercel.app/#/introduction)**.

Ou localmente, refletindo o estado atual do código:

```bash
npm run dev
```

A preview app cobre:
- **Get Started** — Introduction, Structure, Installation, Transform Tokens
- **Agents** — Overview, Pipeline (estrutural + simulador), 6 agentes individuais
- **Pipeline Infra** — Skills, Commands, Hooks, Output Styles, MCP Servers, Memory System
- **Foundations** — Tokens Overview, Color, Typography, Spacing, Sizing, Shape, Elevation, Icons
- **Components** — docs com exemplos vivos para cada componente
- **Templates & Examples** — AppShell, Showcases, ChatV2, ClientesShowcase, Dashboard

---

## Licença

Uso interno iGreen. Sem distribuição pública.
