---
description: Vocabulário de componentes do iGreen DS — QUAL usar pra cada tarefa, e por quê
globs: ["**/*.tsx", "**/*.styles.ts"]
alwaysApply: true
---

# Que componente usar (iGreen DS)

Os nomes abaixo são os **ids do registry**. Para trazer um: `npm run igreen:add -- <id>`
— exceto em **modo submódulo** (existe `.claude/ds-config.json` com `"mode": "submodule"`),
onde tudo já está no disco em `<dsPath>/src` e você só importa pelo `importBase`.

**Onde está a API** (não invente props — nenhuma das duas fontes é sua memória):

- **Compostos do iGreen** (`components/ui/<Nome>/`) vêm com **`USAGE.md` ao lado** — props,
  variants, gotchas. Leia antes de compor.
- **Primitivos** **não** têm USAGE: a API é a padrão shadcn/Radix, e eles já chegam
  re-estilizados nos tokens do DS. Consulte o catálogo visual.
  ⚠️ No copy-in eles caem em **`components/ui/` como arquivo solto** (`ui/badge.tsx`,
  `ui/input.tsx`, `ui/avatar.tsx`), não numa pasta `components/shadcn/` — os itens de
  COMPONENTE do registry apontam para `components/ui/` (os demais vão pra `src/lib`,
  `src/utils`, `src/styles/theme` e `examples/`). Importe `@/components/ui/badge`.
  ⚠️ Em **modo submódulo** o layout é OUTRO: você lê o repo do DS, onde os primitivos ficam
  em `<importBase-irmão>/components/shadcn/<nome>` (kebab) e só os compostos em
  `components/ui/<Nome>`. O `ds-config.json` traz os dois caminhos (`importBase` e
  `primitivesBase`).

Catálogo visual: **https://igreen-desingsystem-admin.vercel.app**.

> Não existe "componente shadcn" vs "componente iGreen" pra você: todos chegam por
> `@igreen/<nome>` e todos já seguem os tokens do DS. Escolha pela tarefa, não pela origem.

> **Escopo desta regra: QUAL componente.** Como estilizar (tokens, spacing, foco, cor,
> tipografia) está em `ds-design.md` — deliberadamente não repetido aqui, pra as duas
> regras não divergirem.

## Formulário

`form-field` é wrapper **obrigatório** de todo campo — nunca `<label>` cru (ele cuida de
label, helper, erro e do `htmlFor`).

| Precisa de | Use |
|---|---|
| texto curto / longo | `input` · `textarea` |
| escolher de uma lista | `select` — muitas opções + busca → `combobox` |
| liga/desliga | `switch` (aplica na hora) · `checkbox` (confirma no submit) |
| escolha em bloco visual | `card-checkbox` (label nativo envolvendo o checkbox) |
| uma entre várias | `radio-group` |
| data | `date-picker` — `mode`: `single` (default) · `range` · `multiple` |
| só mês/ano | `month-year-picker` |
| arquivo | `file-upload-field` |
| código / OTP | `input-otp` — mesmos `size` (`xxs`/`xs`/`sm`/`md`) e `state` do `input`, então num form misto use o MESMO size dos dois. `variant`: `connected` (default) · `outlined` · `filled` · `underline` |
| cor | `color-picker` |
| faixa numérica | `slider` |
| prefixo, sufixo, ícone ou botão **dentro** do campo | `input-group` — não componha na mão |

## Abas e alternância de visão

- `tabs` — navegar entre **seções de conteúdo**. `variant` no `<Tabs>` (propagada por
  contexto, não no List/Trigger): `"segmented"` (default, pill) · `"line"` (underline).
- `button-group` — ações relacionadas lado a lado; uma dispara, **não guarda estado**.
- `toggle-group` — modo ou filtro que **persiste** · `toggle` para um só, on/off.
- ⚠️ Alternar tabela ↔ cards dos **mesmos dados** não é nenhum dos três: é `viewMode`
  do `data-table` (com `listConfig`). Não monte duas telas paralelas.

## Feedback e estado

| Situação | Use |
|---|---|
| notificação rica (title, description, ação) | `toast` — **prefira este** |
| toaster cru | `sonner` — monte `<Toaster/>` 1× no root; o `toast` roda sobre ele |
| aviso fixo dentro da página | `alert` |
| confirmar ação destrutiva | `alert-modal` — **obrigatório** antes de excluir, nunca delete direto |
| sem dados / primeira vez | `empty-state` |
| carregando layout / ação | `skeleton` (silhueta) · `spinner` (pontual) |
| progresso conhecido | `progress` |

## Sobreposição (o que cobre a tela)

| Quando | Use |
|---|---|
| clique, ancorado, conteúdo curto | `popover` |
| lista de ações a partir de um gatilho | `dropdown-menu` |
| clique com o botão direito | `context-menu` |
| hover: dica de 1 linha / prévia rica | `tooltip` · `hover-card` |
| **bloqueia** a página, centralizado | `modal` (body já rola sozinho — não trate scroll no children) |
| **bloqueia**, lateral, mais espaço que o modal | `panel` (560px default) · `sheet` · `drawer` (mobile, gesto) |
| **não** bloqueia — coexiste com a lista atrás, resizável | `floating-panel` |
| diálogo cru, sem o chrome do DS | `dialog` · `alert-dialog` |

Todo flutuante já segue a mesma receita visual (superfície frosted, radius 12,
`shadow-sh-lg`). Não re-estilize.

## Dados em grade e lista

| Precisa de | Use |
|---|---|
| grade com colunas: filtros, visões, seleção, kanban, virtualização | `data-table` — o completo |
| tabela simples, sem inteligência | `table` |
| rodapé de paginação/page-size/contagem | `footer-table` — já embutido no `data-table` |
| lista de **cards** com filtros, visões, hierarquia/árvore | `data-list` |
| lista de cards simples | `list` |
| quadro por status/etapa | `kanban` — ou `viewMode: "kanban"` do `data-table` |
| paginar algo que não é tabela | `pagination` |

### ⛔ Filtro em tabela/lista → SEMPRE nativo, nunca form/select acima

"Filtrar por X" numa grade/lista **não** é montar select ou form acima da tabela — isso
empilha UI na unha, come espaço e foge do padrão. Filtro é **recurso reativo** do
`data-table`/`data-list`. Aplique esta hierarquia **sempre — inclusive em pedido em lote e
sem passar pela entrevista guiada** (é justamente aí que o erro aparece):

1. **X é uma coluna** (status, categoria, tipo, graduação… — o caso normal, ~90%):
   - Na coluna: `enableColumnFilter: true` + `filterType` + `filterOptions`.
   - **Deixe o filtro visível na tabela**: `showEmptyFilterChips={["status", …]}` — o chip
     nasce **vazio e clicável** já no load, o usuário vê a afordância sem abrir menu nenhum.
   - Abrir **já filtrado** → `defaultViews`/`presetView` com filtros pré-aplicados (`filterModel`) → chip aplicado.
   - Status é o **eixo de navegação** (poucos valores, muito usado) → **uma visão por valor**
     (`defaultViews`, ex.: "Ativos", "Pendentes"; `allowCreateView={false}` se forem fixas).
2. **X não é coluna, pequeno e simples** (período/mês, um toggle) → `toolbar.actions`
   (máx ~2, label curta). Período que afeta a página toda → `PageHeader.actions` (dropdown).
3. **Muitos filtros, ou muito grandes** → drawer "Filtros" **nativo** do `data-table` + chips
   pré-aplicados. Nunca empilhar selects soltos.

> As exceções (2 e 3) são raras. Sempre que a informação já está numa coluna: **chip nativo
> primeiro**. Exemplo vivo do padrão: `example-clientes` (status/categoria pré-aplicados +
> chip vazio de "Atribuído"). Entrevista guiada completa em `/ds-create-crud`.

## Layout e chrome do app

- `app-shell` — a casca (rail de módulos + header + área de conteúdo). **Embutido em container com altura** (layout com footer, aba, preview) → passe `fillHeight`; sem isso ele mede 100vh, transborda e o conteúdo fica cortado na base.
- `header` — barra superior de 60px (breadcrumb, busca, tema, usuário) dentro do shell.
- **Menu lateral — a escolha depende de o app ter módulos, então PERGUNTE:**
  - **tem áreas separadas** (Comercial, Financeiro…), cada uma com menu próprio → `menu-sidebar` (rail + contextos). É o que o `app-shell` usa.
  - **sistema único**, um menu só → `single-menu-sidebar` (nível único). No `app-shell` passe `sidebar="single"` + `categories` + `sidebarLogo` + `sidebarTitle`. ⚠️ **Não** ligue `sidebarShowSearch` se o header já tem busca — o shell já entrega a da sidebar desligada. (Até o CLI 0.25.0 esta linha dizia que o `single-menu-sidebar` não encaixava no `app-shell`: era **falso**, ele tem colapso e mobile.)
  - Nas duas: item com destino declara `href` (vira `<a>`, então ctrl+clique e nova aba funcionam). Router próprio → `renderLink`.

  > 🧭 **O app tem router (react-router, Next, TanStack)? Passe `renderLink`.**
  > `<AppShell renderLink={(p) => <Link {...p} to={p.href} />} … />`
  >
  > O menu renderiza `<a href={item.href}>`. Sem `renderLink`, um `item.href` de **path**
  > (`/clientes`) fazia o browser **recarregar a página inteira** a cada clique — bug
  > reportado por consumidor e corrigido na v0.38.0. Alternativa: passar `onItemClick`
  > (aí o menu cancela a navegação nativa sozinho, preservando ctrl+clique, link externo
  > e `item.href` de hash). Detalhe: `MenuSidebar/USAGE.md` §Integração com router.
- `page-header` — título + ações + breadcrumb **dentro** do body.
- `card` — container de conteúdo · `separator` · `scroll-area` (scroll estilizado) ·
  `aspect-ratio`.
- Esconder/mostrar conteúdo: `accordion` (várias seções abrindo) · `collapsible` (uma) ·
  `carousel` (deslizar horizontal).

## Métrica e gráfico

- `kpi` — `Kpi` / `KpiGroup` / `KpiDelta` para cards de métrica e faixas de indicadores.
- `chart` — wrapper do Recharts (barras, linha, área, pizza, radar, radial).
- `choropleth-map` — mapa por região colorido por valor (traz `d3-geo` como dependência).

## Blocos — composições de referência (não são componentes)

Um **bloco** é um arranjo pronto, feito só com os componentes acima, que existe porque o arranjo é
o que a IA não inventa: você sabe as peças e os tokens, mas não a disposição que um designer
escolheu. Ele **não tem props nem versão própria** — você lê a estrutura e reconstrói com os dados
do usuário.

Cada bloco tem um código no formato `dsgreen-<categoria>-<n>`. **Quando o usuário citar um código,
não classifique intenção** — resolva o código (é o Passo 0 da skill ds-kit).

**A lista dos blocos NÃO está aqui**, de propósito: ela vive em
`.claude/skills/ds-kit/blocks-index.md`, que é **gerado** a partir dos arquivos e carregado **só
quando um código é citado**. Esta regra é `alwaysApply` — listar cada bloco aqui faria o custo de
contexto crescer a cada bloco novo, e o catálogo é feito pra crescer. Bloco só entra em jogo quando
o humano cita um ID, então não há caso em que você precise descobrir blocos sem ser provocada.

O catálogo **visual** fica na seção **Blocks** do showcase do DS — é de lá que o usuário tira o
código.

## Identidade, status e navegação

- `avatar` — foto com fallback · `avatar-ig` — badge de iniciais com presets de cor do DS
  (escolhe preto/branco por contraste WCAG quando recebe hex).
- `badge` — rótulo estático · `chip` — pílula de status/tag/filtro, pode ser interativa.
- `icon` — ícones do DS, incluindo o set de marca `igreen-*`.
- `breadcrumb` · `menubar` (barra de menus estilo desktop) · `navigation-menu` (mega-menu).
- `label` — só fora de formulário; **dentro** de form quem cuida é o `form-field`.

## Comando e texto

- `command` — paleta de comandos / busca com teclado (⌘K).
- `markdown-text` — renderizar markdown (chat, descrições vindas de API).
- `calendar` — calendário inline; para **campo** de data use `date-picker`.
- `button` — ação. Variações (cor, tamanho, ícone, loading) na própria API; ver o USAGE.

---

**Não achou o que precisa?** Antes de compor na unha, confira o catálogo visual. E para
**telas inteiras** não escolha componente a componente: use `/ds-create-crud` (tabela),
`/ds-create-list` (cards) ou `/ds-create-dashboard` (painel) — eles entrevistam e montam a
tela no padrão, e existem `example-*` prontos pra adaptar. Adaptar sempre ganha de escrever
do zero.
