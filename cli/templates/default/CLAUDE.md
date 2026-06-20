# Projeto consome o iGreen Design System (via registry shadcn)

Bootstrappado via `npx @snksergio/create-design-system`. Contexto pro Claude
Code / Cursor / agentes gerarem UI nos padrões do iGreen DS.

## Modelo de consumo — registry shadcn (copy-in), NÃO npm

Os componentes do DS são **copiados pro seu projeto** via `shadcn add @igreen/<nome>`
(viram código seu, em `src/components/ui/`). NÃO existe `import ... from "@snksergio/design-system"`.

```bash
# 1. token do registry privado no .env.local (peça ao mantenedor)
cp .env.local.example .env.local   # cole o IGREEN_TOKEN

# 2. puxe componentes sob demanda — PREFIRA o wrapper (mantém o manifesto):
npm run igreen:add -- button form-field card badge dialog
#   (equivale a `npx shadcn add @igreen/<x>` + registra rev/hash no manifesto)

# 3. valide integridade/defasagem (use em CI):
npm run igreen:drift

# 4. atualize componentes com segurança (protege edição local; --all / --force):
npm run igreen:update -- button card        # ou: --all
```

> **Manifesto + drift + update:** `npm run igreen:add` grava cada componente (rev + hash) em
> `.igreen-ds/manifest.json` (commite-o). `npm run igreen:drift` falha (exit 1) se
> algum componente foi **editado localmente** e avisa se está **defasado** vs o registry.
> `npm run igreen:update -- <x>` (ou `--all`) atualiza com segurança: **pula** componentes
> editados localmente (não sobrescreve tua edição) salvo `--force`, e re-baseline o manifesto.
> Commite antes — se quebrar, `git restore` volta a versão antiga.
> `npm run doctor` valida o `cn`/`tv` contra o registry. Pode usar `npx shadcn add`
> direto, mas aí o manifesto não acompanha (o drift acusaria como não-gerenciado).

```tsx
// import sempre via alias @/ (copy-in), nunca de package npm
import { Button } from "@/components/ui/Button";
import { FormFieldInput } from "@/components/ui/FormField";
```

### Componente do shadcn OFICIAL (não-@igreen) → já vem iGreen-tematizado
O `index.css` tem um **bridge shadcn→iGreen** (`@theme inline`) que mapeia o vocabulário
base do shadcn (`bg-primary`, `bg-background`, `border`, `rounded-md`…) pros tokens iGreen.
Então se você puxar um componente do registry **oficial** (ex.: `npx shadcn add skeleton`,
sem `@igreen/`), ele nasce **iGreen-tematizado automaticamente** (brand no primary, etc.),
light + dark. ⚠️ Componentes oficiais podem precisar de deps próprias (ex.: `radix-ui`,
`class-variance-authority`) — se o `shadcn add` não instalar, rode `npm i <dep>`. Isso é do
componente oficial, não do DS.

### MCP — descoberta assistida por IA (já configurado)
O projeto vem com **`.mcp.json`** (servidor `shadcn mcp`) → o **Claude Code** já consegue
**listar / buscar / ver / adicionar** componentes `@igreen` por conta própria (lê o
`components.json` + o `IGREEN_TOKEN` do `.env.local`). Peça à IA: *"liste os componentes
@igreen"*, *"como uso o DataTable?"*, *"adicione o form-field"*. Cada componente traz seu
`USAGE.md` no copy-in — a IA lê pra saber a API. Pra **Cursor / VSCode / Codex**:
`npx shadcn mcp init --client cursor` (ou `vscode`/`codex`).

### Já vem configurado (não mexa sem motivo)
- `src/lib/utils.ts` (`cn`) e `src/utils/tv.ts` (`tv`) — **configurados pros prefixos
  DS** (pad/sp/gp/radius/sh/form) + presets tipográficos (L-016). Se sobrescrever pelo
  cn padrão do shadcn, a resolução de classe quebra em silêncio. `npm run doctor` valida.
- `src/styles/theme/tailwind-theme.css` — tokens OKLCH, importado no `index.css` ANTES
  dos componentes.
- `components.json` — registry `@igreen` + Bearer já apontados.

### Catálogo de componentes (`@igreen/<nome>`)
Primitivos: `button` `input` `label` `textarea` `select` `card` `badge` `separator`
`checkbox` `accordion` `alert` `alert-dialog` `avatar` `breadcrumb` `calendar` `command`
`dialog` `dropdown-menu` `input-group` `pagination` `popover` `progress` `radio-group`
`sheet` `slider` `switch` `tabs` `tooltip` `skeleton` `sonner` `collapsible` `scroll-area`
`toggle` `toggle-group` `input-otp` `context-menu` `hover-card` `menubar` `navigation-menu`
`carousel` `aspect-ratio` `drawer`.
Composites: `form-field` `alert-modal` `button-group` `floating-panel` `modal` `panel`
`footer-table` `kanban` `list` `combobox` `card-checkbox` `chip` `icon` `page-header` `avatar-ig`
`date-picker` `toast`.

> **Flutuantes** (`dropdown-menu` `popover` `select` `context-menu` `menubar`
> `navigation-menu` `hover-card` `tooltip`) seguem a MESMA receita visual do DS
> (bg-dropdown frosted + border-default + radius 12 + shadow-lg + outline-float).
> **Feedback**: `toast` (card de notificação ergonômico sobre o Sonner — `toast.success/.error/.warning/.info({ title, description, icon, action, cancel, onClose })`, status muda só o icon-chip; PREFIRA pra UI rica) · `sonner` (toaster cru — monte `<Toaster/>` 1× no root; o `toast` usa ele por baixo) · `skeleton` (loading)
> · `tooltip`/`hover-card` (dica/prévia no hover).
App-level (templates de layout): `chart` `table` `menu-sidebar` `header` `app-shell`.
Exemplos (telas inteiras de referência): `example-clientes` `example-finance`
`example-edit-page` `example-order-detail` `example-dashboard` `example-chat`.

## 🧭 Mapa de intenção → referência (IA: USE ISTO PRIMEIRO)

Quando o usuário pedir uma **tela / página / fluxo**, NÃO comece do zero. Primeiro
puxe o **exemplo** mais próximo (`npm run igreen:add -- <item>`) — é uma tela completa,
pronta de produção, nos padrões do DS. Depois **edite o copy-in** pro caso dele (é código
dele). O catálogo visual hospedado mostra como cada um fica:
**https://igreen-desingsystem-admin.vercel.app**.

| Usuário diz algo como… | Puxe este item | Componente-chave |
|---|---|---|
| "crud", "lista", "tabela", "grid de dados", "listagem de X" | `example-clientes` | DataTable |
| "financeiro", "extrato", "saldo/entradas/saídas", "transações", "KPIs + tabela" | `example-finance` | DataTable + KPI cards |
| "tela de edição", "cadastro", "formulário", "editar X", "novo X" | `example-edit-page` | FormField |
| "detalhamento", "detalhe do pedido/cliente", "página de detalhe", "ficha", "abas de info" | `example-order-detail` | Tabs + Cards |
| "dashboard", "painel", "visão geral", "gráfico", "indicadores" | `example-dashboard` | Chart + KPI cards |
| "chat", "inbox", "conversas", "atendimento", "mensagens" | `example-chat` | ConversationColumn + thread |
| "shell do app", "layout com menu lateral", "casca", "estrutura base" | `app-shell` (template) | AppShell |
| "menu lateral", "sidebar", "navegação lateral" | `menu-sidebar` (template) | MenuSidebar |
| "cabeçalho do app", "topbar", "header com usuário" | `header` (template) | Header |
| "cabeçalho de página", "título + ações + breadcrumb" | `page-header` (template) | PageHeader |
| "gráfico de barras/linha/área/pizza" | `chart` (componente) | ChartContainer |

> **Regra pra IA**: "quero igual ao exemplo de Finance" / "seguir a estrutura do Finance"
> → `npm run igreen:add -- example-finance` e adapte. Combine livremente: um dashboard com
> tabela embaixo = `example-dashboard` + `example-clientes` como base. Cada exemplo traz
> seus `registryDependencies` (os componentes vêm juntos automaticamente). Sempre prefira
> **adaptar um exemplo** a escrever uma tela na unha — é a garantia de produção que o
> showcase promete.

## 🛠️ Kit de construção (orquestrador + skills + DESIGN.md)

Este projeto já vem com um kit pra montar telas no padrão do DS — **use-o**:

- **`DESIGN.md`** (raiz) — guia de composição: anatomia de tela, ritmo de espaçamento
  (24px pós-PageHeader, `gap-form-gap` em form), do/don't de tokens, responsividade.
  **Leia antes de montar qualquer tela.** A API de cada componente fica no
  `USAGE.md` ao lado dele (`src/components/ui/<Nome>/USAGE.md`).
- **`.claude/rules/ds-design.md`** — regras duras, **auto-carregadas** (você aplica
  sem ser pedido: gap do PageHeader, FormField em form, classes DS antes de Tailwind).
- **`.claude/skills/ds-kit`** — **orquestrador (front-door)**: identifica a intenção da
  tela e roteia pra skill/exemplo certo. É a porta de entrada de qualquer pedido de UI.
- **Skills focadas** (cada uma dispara pela própria descrição, ou via ds-kit):
  - `crud-builder` (`/ds-create-crud`) — tabela/CRUD por **entrevista guiada**. Fluxo principal.
  - `page-edit` — edição/cadastro/formulário (→ `example-edit-page`).
  - `page-detail` — detalhe/ficha com abas (→ `example-order-detail`).
  - `dashboard` — KPIs + gráficos (→ `example-dashboard`).
  - `charts` — gráficos isolados (Chart/Recharts, caveats).
  - `chat` — inbox/conversas (→ `example-chat`).
  - `drawers` — criar/editar/detalhe (→ drawers do `example-finance`).
  - `cards` — composição de cards/painéis soltos.
- **`/ds-build-page`** — entrada genérica que roteia qualquer tela pelo orquestrador.

**Como a IA deve agir:** pedido de tela → `ds-kit` classifica a intenção → CRUD vai pra
`crud-builder` (entrevista com gate); demais tipos carregam a skill focada, que puxa o
`example-*`/componente e adapta — sempre aplicando `DESIGN.md` + as regras auto-carregadas.
Roteamento é por **skill** (nativo, barato) — sem subagente pra rotear; subagente só pra
trabalho pesado em paralelo (ex.: montar várias telas de uma vez).

### 🔒 Integridade do DS (protegido por hook)
Tema/tokens (`src/styles/theme/**`) e a fundação (`cn`/`tv`/`lucide-types`) são
**gerenciados** — um hook (`.claude/hooks/protect-ds.mjs`) **bloqueia** edição manual
deles (quebram o visual todo e somem no update). Editar um componente do DS é
**permitido mas avisado** (vira drift). A regra: **customize na composição da sua tela**
(props/variantes + classes DS), não nos tokens nem nos internals do componente. Pra mudar
o tema, re-sincronize com o DS. Cheque integridade com `npm run igreen:drift`.

## Anti-patterns proibidos

```ts
// ❌ Tailwind literal quando existe token DS
gap-4 → gap-gp-md          p-4 → p-sp-md
rounded-lg → rounded-radius-lg   shadow-md → shadow-sh-md
// ❌ Heights fixos
h-9 → min-h-form-md   h-10 → min-h-form-lg   h-11 → min-h-form-xl (WCAG mobile)
// ❌ Ring / focus
ring-ring-primary/30 → ring-ring-primary   ring-3 → ring-4
outline-none → focus-visible:outline-none
// ❌ Tipografia avulsa
text-sm font-medium → text-body-md font-medium
text-[14px] → text-body-md
```

## Padrões obrigatórios

```ts
focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-{color}
min-h-form-lg   // 40px desktop default · min-h-form-xl 44px mobile
// Typography (6 roles): display / heading / title / body / caption / code
// body-sm (13/500) = default do projeto · title weight 600 default
text-body-sm font-semibold   // override de weight sobre preset
```

## Dark mode
CSS vars `--color-*` (light) + `.dark { }` (dark). Aplique `.dark` no `<html>` —
componentes consomem tokens, sem lógica condicional de tema.

## Pipeline completo do DS
→ https://github.com/snksergio/igreen-admin-desingsystem
