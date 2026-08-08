# Projeto consome o iGreen Design System (via registry shadcn)

Bootstrappado via `npx @snksergio/create-design-system`. Contexto pro Claude
Code / Cursor / agentes gerarem UI nos padrões do iGreen DS.

## Modelo de consumo DESTE projeto — registry shadcn (copy-in)

**Este projeto** foi criado pelo scaffold e consome por **copy-in**: os componentes do DS são
**copiados pro seu projeto** via `shadcn add @igreen/<nome>` e viram código seu, em
`src/components/ui/`. Aqui, portanto, você importa por `@/components/ui/...` — não de um
pacote npm.

> ⚠️ **Isso é uma propriedade DESTE scaffold, não do Design System.** O iGreen DS tem **4
> canais de consumo, todos suportados** — copy-in (este), **npm**, **submódulo git** e o
> prompt de tema do `npm create`. Nenhum deles é depreciado.
>
> Se você chegou aqui procurando saber se pode consumir por **npm ou submódulo**: pode. O que
> muda é o alcance — veja `.claude/rules/ds-channels.md`.

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
`components.json` + o `IGREEN_TOKEN` do `.env.local`). Peça à IA: _"liste os componentes
@igreen"_, _"como uso o DataTable?"_, _"adicione o form-field"_. Cada componente traz seu
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

**O índice completo é `.claude/rules/ds-components.md`** — carregado automaticamente ao
editar qualquer `.tsx`. Ele é organizado **por tarefa** (formulário, abas, feedback,
sobreposição, dados, layout, métrica, identidade, comando) e diz **qual usar e por quê** —
não é uma lista de nomes. Consulte-o antes de compor qualquer UI.

> Por que não a lista aqui: nome solto responde "existe?", não responde "qual dos três?".
> Saber que `tabs`, `button-group` e `toggle-group` existem não diz qual serve pra alternar
> visão — e essa é a pergunta que aparece na prática.

Exemplos (telas inteiras de referência, puxe e adapte): `example-clientes` `example-finance`
`example-edit-page` `example-order-detail` `example-dashboard` `example-chat`
`example-mapa-rede` `example-login` `example-app-shell`.

## 🧭 Mapa de intenção → referência (IA: USE ISTO PRIMEIRO)

Quando o usuário pedir uma **tela / página / fluxo**, NÃO comece do zero. Primeiro
puxe o **exemplo** mais próximo (`npm run igreen:add -- <item>`) — é uma tela completa,
pronta de produção, nos padrões do DS. Depois **edite o copy-in** pro caso dele (é código
dele). O catálogo visual hospedado mostra como cada um fica:
**https://igreen-desingsystem-admin.vercel.app**.

| Usuário diz algo como…                                                                    | Puxe este item                   | Componente-chave            |
| ----------------------------------------------------------------------------------------- | -------------------------------- | --------------------------- |
| "crud", "tabela", "grade/colunas", "planilha", "grid de dados"                            | `example-clientes`               | DataTable                   |
| "financeiro", "extrato", "saldo/entradas/saídas", "transações", "KPIs + tabela"           | `example-finance`                | DataTable + KPI cards       |
| "kanban", "board", "funil", "pipeline de vendas", "quadro por status/etapa"               | `example-finance`                | DataTable (viewMode kanban) |
| "lista de cards", "árvore/hierarquia", "rede/organograma", "níveis", "treeview", "feed"   | `example-mapa-rede`              | DataList                    |
| "tela de edição", "cadastro", "formulário", "editar X", "novo X"                          | `example-edit-page`              | FormField                   |
| "detalhamento", "detalhe do pedido/cliente", "página de detalhe", "ficha", "abas de info" | `example-order-detail`           | Tabs + Cards                |
| "dashboard", "painel", "visão geral", "indicadores" (2+ tipos de seção)                   | skill `dashboard-builder` (`/ds-create-dashboard`) → `example-dashboard` | Kpi/KpiGroup + Chart |
| "gráfico isolado" (barras/linha/área/pizza, sem o resto do painel)                        | `chart` (componente)             | ChartContainer              |
| "mapa do Brasil por estado/município", "coroplético", "penetração por UF"                 | `choropleth-map` (componente)    | ChoroplethMap               |
| "mapa FIXO do Brasil só pra KPI" (sem drill-down)                                          | receita de paths inline (sem dep) | — ver ChoroplethMap/USAGE.md |
| "chat", "inbox", "conversas", "atendimento", "mensagens"                                  | `example-chat`                   | ConversationColumn + thread |
| "shell do app", "layout com menu lateral", "casca", "estrutura base"                      | `app-shell` (template)           | AppShell                    |
| "menu lateral", "sidebar", "navegação lateral" (rail + contextos)                         | `menu-sidebar` (template)        | MenuSidebar                 |
| "menu lateral simples", "sidebar de nível único", "menu sem rail/contextos"               | `single-menu-sidebar` (template) | SingleMenuSidebar           |
| "kpi", "card de métrica", "indicador", "stat card", "row de métricas/dashboard cards"     | `kpi` (componente)               | Kpi / KpiGroup / KpiDelta   |
| "cabeçalho do app", "topbar", "header com usuário"                                        | `header` (template)              | Header                      |
| "cabeçalho de página", "título + ações + breadcrumb"                                      | `page-header` (template)         | PageHeader                  |
| "gráfico de barras/linha/área/pizza"                                                      | `chart` (componente)             | ChartContainer              |

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
  - `list-builder` (`/ds-create-list`) — lista de cards por **entrevista guiada** (→ `example-mapa-rede`).
  - `dashboard-builder` (`/ds-create-dashboard`) — dashboard/painel (KPIs + gráficos + rankings) por **entrevista guiada** (→ `example-dashboard`). Delega tabela/lista embutida a crud/list-builder.
  - `page-edit` — edição/cadastro/formulário (→ `example-edit-page`).
  - `page-detail` — detalhe/ficha com abas (→ `example-order-detail`).
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

### 🎨 Tema de marca (trocar ou adicionar)

O DS tem 5 marcas: `default` (verde iGreen) · `blue` · `green` · `pay` · `vibrant` (verde
fluorescente). Cada não-default é um **overlay de cor** escopado em `[data-theme="<id>"]` —
sobrescreve só as cores que diferem do tema-base, e combina livremente com claro/escuro.

**Projeto novo:** o prompt "Tema de cor?" do scaffold já pergunta e aplica.

**Este projeto já existe** — 2 passos:

```bash
npm run igreen:add -- theme-vibrant        # tema é item do registry, igual a um componente
```
```css
@import "./styles/theme/tailwind-theme.css";
@import "./styles/theme/brand-vibrant.css";   /* DEPOIS do tema-base */
```
```html
<html data-theme="vibrant">   <!-- sem isto o CSS fica INERTE, e não dá erro -->
```

⚠️ Os 2 erros que respondem por quase toda falha aqui: **(1)** importar o CSS sem pôr o
`data-theme` no `<html>` — o overlay é escopado, então nada casa; **(2)** importar o overlay
**antes** do `tailwind-theme.css` — o base ganha por ordem de fonte. Nenhum dos dois dá erro.

**Detalhe completo em `.claude/rules/ds-themes.md`** (auto-carregada) — inclui o caminho pra
modo submódulo, troca em runtime e o que NÃO fazer (sobrescrever CSS var na unha pra "simular"
uma marca sai do sistema e o hook de integridade bloqueia).

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

→ https://github.com/igreenlab/igreen-desingsystem-admin
