---
name: ds-kit
description: >
  Orquestrador (front-door) de construção de telas com o iGreen DS. Use SEMPRE
  que o usuário pedir pra montar/criar/fazer uma tela, página, layout, lista,
  tabela, CRUD, formulário, cadastro, edição, detalhamento, ficha, dashboard,
  painel, KPIs, gráfico/chart, financeiro/extrato, chat/inbox, drawer/painel,
  cards, ou "uma tela igual ao exemplo X". Use TAMBÉM quando o usuário citar um
  código de bloco no formato dsgreen-<categoria>-<n> (ex.: "aplica o
  dsgreen-chart-1 aqui", "usa a referência dsgreen-chart-2") — nesse caso o
  Passo 0 resolve o código antes de qualquer classificação. Identifica a intenção
  e roteia pro fluxo certo (skill guiada, bloco de referência ou exemplo pra
  copiar), aplicando DESIGN.md.
---

# ds-kit — Orquestrador de telas (iGreen DS)

Você é a **porta de entrada** de construção de UI neste projeto. Identifica **o
que** o usuário quer montar e roteia. Não gera a tela inteira de memória: delega
pra skill guiada OU puxa o **exemplo** canônico e adapta. Sempre seguindo
`DESIGN.md` (raiz) + `src/components/ui/<Nome>/USAGE.md`.

> Por que skill e não subagente: roteamento por skill é **nativo e barato** (sem
> custo de uma janela de contexto separada). Subagente só pra trabalho pesado em
> paralelo (ex.: montar várias telas de uma vez) — não pra rotear.

## Passo 0 — O usuário citou um código de BLOCO? Resolva antes de classificar

Se a fala contém um código no formato **`dsgreen-<categoria>-<n>`** (ex.: `dsgreen-chart-1`,
`dsgreen-chart-lines-2`), **pare aqui**: ele não quer que você decida a composição, quer **aquela**
composição. Classificar intenção nesse caso é ignorar o que ele pediu.

**Bloco não é componente.** É uma composição de referência — feita só com componentes que você já
tem — que existe porque a IA sabe as peças e os tokens mas não sabe o **arranjo** que um designer
escolheu. Ele não tem props nem versão própria: você lê a estrutura e reconstrói com os dados do
usuário.

**Como resolver:** abra **`.claude/skills/ds-kit/blocks-index.md`** — é o índice do catálogo
(gerado a partir dos arquivos, então nunca está defasado). Ele dá, por código: a composição, quando
serve, o que usa, e o **caminho do arquivo**.

| modo | onde o arquivo está |
|---|---|
| **submódulo** (`.claude/ds-config.json` com `"mode": "submodule"`) | já no disco: `<dsPath>/<arquivo do índice>`. **Leia direto** |
| **copy-in / scaffold** | não vem instalado. `npm run igreen:add -- <código>` traz o arquivo |

Se o código citado **não estiver no índice**, diga isso em vez de adivinhar uma composição
parecida: o valor do código é ser determinístico, e um palpite silencioso destrói exatamente isso.

**Depois de achar:** leia o arquivo inteiro, incluindo o JSDoc no topo — ele carrega as regras que
aquela composição embute (qual token de cor, por que `tabular-nums`, o que NÃO copiar). Adapte os
dados e os rótulos ao caso do usuário **preservando a estrutura e o espaçamento**. Não "melhore" o
arranjo: ele é o motivo pelo qual o código foi citado.

**Catálogo visual:** a galeria fica na seção **Blocks** do showcase do DS (`#/blocks-charts` para
gráficos), com o código ao lado de cada composição renderizada — é de lá que o usuário tira o
código.

---

## Passo 1 — Classifique a intenção → rota

| Sinais na fala do usuário                                                                           | Rota (skill / exemplo)                                                                                                        |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| "tabela", "grade", "grid de dados", "crud", "datatable", "planilha", "colunas"                      | **skill `crud-builder`** (`/ds-create-crud`) — entrevista guiada                                                              |
| "kanban", "board", "funil", "pipeline de vendas", "quadro por status/etapa"                         | **skill `crud-builder`** (`/ds-create-crud`) — kanban é `viewMode` do DataTable; ref. `example-finance` (kanban por situação) |
| "tabela E lista no mesmo lugar", "alternar tabela/lista", "toggle de visão tabela↔lista"            | **skill `crud-builder`** (`/ds-create-crud`) — é `viewMode:"list"` + `listConfig` do DataTable (não DataList paralelo)        |
| "lista de cards", "árvore", "hierarquia", "rede/organograma", "níveis", "treeview", "feed de cards" | **skill `list-builder`** (`/ds-create-list`) — entrevista guiada                                                              |
| "lista" / "listagem de X" (ambíguo: grade ou cards?)                                                | **PERGUNTE** "grade de colunas ou cards?" → `crud-builder` ou `list-builder` (ou front-door `/ds-create-screen`)              |
| "formulário", "cadastro", "tela de edição", "editar X", "novo X", "multi-step"                      | **skill `page-edit`** → `example-edit-page`                                                                                   |
| "detalhe", "detalhamento", "ficha", "página de X com abas", "visão geral do pedido"                 | **skill `page-detail`** → `example-order-detail`                                                                              |
| "login", "entrar", "acesso", "autenticação", "sign in", "esqueci a senha", "tela de login"          | **skill `auth-builder`** (`/ds-create-login`) → `example-login` (fullscreen, painel por tokens)                              |
| "dashboard", "painel", "visão geral", "indicadores" (2+ tipos de seção: KPIs + gráfico + resumo)     | **skill `dashboard-builder`** (`/ds-create-dashboard`) — entrevista → gate → geração ancorada no `example-dashboard`          |
| "tabela + detalhe ao lado", "clicar abre o detalhe", "filtro no topo que muda tudo" (2+ peças que conversam) | **skill `screen-composer`** — master-detail / cross-filter; monta as peças pelos builders + cabeia o estado compartilhado (a receita está na própria skill) |
| "gráfico", "chart", "barras/linha/área/pizza"                                                       | **skill `charts`** → `Chart/USAGE.md` + `example-dashboard`                                                                   |
| "financeiro", "extrato", "saldo", "transações"                                                      | `example-finance` (puxar + adaptar)                                                                                           |
| "chat", "inbox", "conversas", "atendimento"                                                         | **skill `chat`** → `example-chat`                                                                                             |
| "drawer/painel de criar/editar/ver detalhe"                                                         | **skill `drawers`** → drawers do `example-finance`                                                                            |
| "cards", "blocos", "painéis soltos", "seções"                                                       | **skill `cards`** → `Card`/`Panel` + showcase                                                                                 |
| "igual ao exemplo de <X>" / "estrutura do <X>"                                                      | puxar `example-<X>` e adaptar                                                                                                 |
| cabeçalho de página                                                                                 | componente `PageHeader`                                                                                                       |
| "esqueleto do app", "estrutura/base do app", "shell + navegação + rotas", "montar o app do zero"    | **skill `app-builder`** (`/ds-create-app`) → `example-app-shell` (AppShell + nav-data + mapa de rotas declarativo)           |
| "replica o módulo X igual ao Y", "mesma estrutura pra outro segmento/vertical", "clonar telas"      | **skill `module-replicator`** (`/ds-replicate-module`) — avalia copiar × parametrizar; troca dados/rótulos, mantém estrutura  |
| shell / menu lateral / topbar (só o componente)                                                     | `app-shell` / `menu-sidebar` / `header`                                                                                       |
| "que componente uso pra X", "tem componente de Y?", "quais opções pra abas / filtro / data", "o que o DS tem pra formulário" | **rule `.claude/rules/ds-components.md`** — vocabulário dos componentes **por tarefa**, com o critério de escolha. Não é pedido de tela: responda pela rule, não abra builder |

⚠️ **Nunca invente nome de componente nem componha na unha antes de conferir a rule
`ds-components.md`.** Ela lista TODO o catálogo agrupado por tarefa (formulário, abas,
feedback, sobreposição, dados, layout, métrica, identidade, comando) e diz *qual usar e por
quê* — a pergunta que aparece na prática não é "existe?", é "qual dos três?". A rule
auto-carrega ao editar `.tsx`; numa conversa **sem** edição de arquivo, abra-a você mesmo.

Em dúvida entre 2 rotas, **pergunte 1 coisa** ("é uma listagem de dados ou um formulário de cadastro?") antes de agir. Pedido composto (ex.: "dashboard com tabela embaixo") → **`dashboard-builder`** (ele delega a tabela/lista embutida ao `crud-builder`/`list-builder` na Fase 5). 1 tabela/lista/gráfico só ≠ dashboard.

### ⛔ Intenção de "adicionar filtro" numa tabela/lista (vibe-coder guard)

Quando, numa tela de tabela/lista (existente ou nova), o usuário pedir pra **adicionar
filtro** — "um select de status em cima", "filtrar por período/categoria", "campo de
filtro" — **NÃO gere form/selects soltos acima da grade** (anti-pattern feio + código
extra). A tabela/lista do DS já tem **motor de filtro reativo** (chips clicáveis e
editáveis, zero código). Sugira automaticamente:

- **Filtro por COLUNA/campo** (status, categoria, tipo, data…) → use o filtro nativo
  (`enableColumnFilter`/`filterFields`). Quer abrir **já filtrado**? **pré-aplique**
  (`defaultViews`/`presetView`/`filterModel` no DataTable; `views`/`filterModel` no
  DataList) → a tela abre com o **chip aplicado**, editável. Pode pré-setar **vários**
  de uma vez (id/período/status/…) sem nenhum campo.
- **toolbar.actions/toolbarActions é SÓ pra caso pequeno e simples que NÃO reage com
  coluna/campo** (ex.: data/período, escopo global) — **label curta**, **máx ~2**.
  Se o controle mexe com coluna da tabela, é grande/complexo, ou são muitos → **NÃO**
  use o toolbar.
- **Muitos filtros, ou ligados a coluna/campo** → SEMPRE os nativos **pré-aplicados**
  (chips no load) + drawer "Filtros". Nunca empilhar selects.

Regra de ouro: **filtro é recurso da tabela/lista (reativo), não UI montada na unha.**

## Passo 2 — Execute a rota

> **Modo submódulo:** se existe `.claude/ds-config.json` com `"mode": "submodule"`, o DS é
> consumido como submódulo (não copy-in) — os componentes/exemplos já estão em `<dsPath>/src`,
> **não** rode `igreen:add`. Importe via `importBase` do config (ex.: `@ds/components/ui/*`) e
> leia os exemplos direto do disco. As skills abaixo já tratam esse modo.

**CRUD/tabela (fluxo guiado):** carregue `.claude/skills/crud-builder/SKILL.md` → entrevista → blueprint [GATE] → geração. É question-driven; NÃO pule o gate.

**Lista de cards (fluxo guiado):** carregue `.claude/skills/list-builder/SKILL.md` → mesmo fluxo (entrevista → blueprint [GATE] → geração), consumindo `DataList` + `example-mapa-rede`. Use quando for card/árvore/hierarquia/rede, não grade de colunas.

**Demais rotas (baseadas em exemplo):** carregue a skill correspondente em `.claude/skills/<rota>/SKILL.md` (ela tem os gotchas do tipo de tela). O padrão é sempre:

1. `npm run igreen:add -- <item/componente>` (traz a tela/componente + deps).
2. **Leia** o que foi puxado (`src/examples/<x>/...`) + `USAGE.md` dos componentes.
3. Adapte ao caso do usuário preservando estrutura/espaçamento do exemplo.
4. Renderize no roteador/local indicado, em wrapper com altura (DESIGN.md "Anatomia").
5. `npx tsc --noEmit` limpo antes de entregar.

## Passo 3 — Sempre aplique os padrões

- `DESIGN.md` (raiz): anatomia, ritmo de espaçamento, cor, do/don't, responsividade.
- `.claude/rules/ds-design.md` já está auto-carregado (regras duras).
- API do componente = `USAGE.md`. Nunca inventar prop/variante.

## Princípio

Cada tipo de tela tem um **exemplo de produção** como referência viva (extração 1:1 dos showcases). O melhor código é o exemplo adaptado — não o escrito do zero. Sua função: levar ao exemplo/skill certo e garantir aderência ao DESIGN.md.

> Crescível: novo tipo de tela = nova linha na tabela do Passo 1 + nova skill em `.claude/skills/`. Mantenha este roteador curto.
