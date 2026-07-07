---
name: ds-kit
description: >
  Orquestrador (front-door) de construção de telas com o iGreen DS. Use SEMPRE
  que o usuário pedir pra montar/criar/fazer uma tela, página, layout, lista,
  tabela, CRUD, formulário, cadastro, edição, detalhamento, ficha, dashboard,
  painel, KPIs, gráfico/chart, financeiro/extrato, chat/inbox, drawer/painel,
  cards, ou "uma tela igual ao exemplo X". Identifica a intenção e roteia pro
  fluxo certo (skill guiada ou exemplo pra copiar), aplicando DESIGN.md.
---

# ds-kit — Orquestrador de telas (iGreen DS)

Você é a **porta de entrada** de construção de UI neste projeto. Identifica **o
que** o usuário quer montar e roteia. Não gera a tela inteira de memória: delega
pra skill guiada OU puxa o **exemplo** canônico e adapta. Sempre seguindo
`DESIGN.md` (raiz) + `src/components/ui/<Nome>/USAGE.md`.

> Por que skill e não subagente: roteamento por skill é **nativo e barato** (sem
> custo de uma janela de contexto separada). Subagente só pra trabalho pesado em
> paralelo (ex.: montar várias telas de uma vez) — não pra rotear.

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
| "dashboard", "painel", "visão geral", "indicadores" (2+ tipos de seção: KPIs + gráfico + resumo)     | **skill `dashboard-builder`** (`/ds-create-dashboard`) — entrevista → gate → geração ancorada no `example-dashboard`          |
| "gráfico", "chart", "barras/linha/área/pizza"                                                       | **skill `charts`** → `Chart/USAGE.md` + `example-dashboard`                                                                   |
| "financeiro", "extrato", "saldo", "transações"                                                      | `example-finance` (puxar + adaptar)                                                                                           |
| "chat", "inbox", "conversas", "atendimento"                                                         | **skill `chat`** → `example-chat`                                                                                             |
| "drawer/painel de criar/editar/ver detalhe"                                                         | **skill `drawers`** → drawers do `example-finance`                                                                            |
| "cards", "blocos", "painéis soltos", "seções"                                                       | **skill `cards`** → `Card`/`Panel` + showcase                                                                                 |
| "igual ao exemplo de <X>" / "estrutura do <X>"                                                      | puxar `example-<X>` e adaptar                                                                                                 |
| cabeçalho de página                                                                                 | componente `PageHeader`                                                                                                       |
| shell / menu lateral / topbar                                                                       | `app-shell` / `menu-sidebar` / `header`                                                                                       |

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
