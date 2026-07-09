---
description: Front-door pra criar tela de dados — desambigua TABELA (grade) vs LISTA DE CARDS vs DASHBOARD/PAINEL e roteia
---

Ponto de entrada único. **Primeiro desambigua, depois delega** — "lista" é usado
pra tabela com frequência, então nunca roteie sem confirmar.

## Passo 1 — Desambiguação (OBRIGATÓRIO)

Pergunte, descrevendo por **uso** (não pela palavra):

| Opção              | Sinais                                                                                                | Roteia pra                         |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Tabela (grade)** | colunas × linhas · muitos campos · ordenar/filtrar por coluna · editar célula · somatórios · planilha | `crud-builder` (`/ds-create-crud`) |
| **Lista de cards** | cada item é um card · poucos campos em destaque · visual · árvore/hierarquia/rede/DnD · feed          | `list-builder` (`/ds-create-list`) |
| **Dashboard/painel** | **compõe 2+ tipos de seção**: KPIs + gráfico(s) + ranking/resumo · "visão geral" · métrica/tendência | `dashboard-builder` (`/ds-create-dashboard`) |

Se o $ARGUMENTS já deixar claro, confirme em 1 linha e siga. Na dúvida, pergunte.
Dashboard = 2+ tipos de seção; 1 tabela/lista/gráfico só → não é dashboard.

> **Página COMPOSTA (2+ peças que CONVERSAM entre si)** — "tabela + detalhe ao
> lado que abre ao clicar", "filtro/período no topo que muda KPIs + gráfico +
> tabela juntos", master-detail, cross-filter → **skill `screen-composer`**
> (`.claude/skills/screen-composer/SKILL.md`). Ela monta cada peça pelos builders
> e cabeia o **estado compartilhado** (dashboard-patterns §7). Diferente de
> "dashboard com tabela embutida" (sem interação cruzada → dashboard-builder).

> **Kanban / board / funil / pipeline de vendas** → rota **Tabela**. Kanban é uma
> `viewMode` do DataTable (mesmos dados, só muda a exibição); funil = board agrupado
> por etapa. Roteie pro `crud-builder` — a Fase 5 configura as lanes pela coluna de
> status/etapa. Não é um 3º builder.

## Passo 2 — Delegar

- **Tabela** → carregue `.claude/skills/crud-builder/SKILL.md` e siga o fluxo dele.
- **Lista de cards** → carregue `.claude/skills/list-builder/SKILL.md` e siga o fluxo dele.
- **Dashboard/painel** → carregue `.claude/skills/dashboard-builder/SKILL.md` e siga o fluxo dele.

A partir daí o builder escolhido assume (entrevista → blueprint [GATE] → geração).

> **Dashboard com tabela/lista embutida** ("painel com KPIs + gráfico e uma tabela embaixo")
> → rota **Dashboard**; o dashboard-builder delega a tabela/lista ao crud/list-builder.

Argumento opcional ($ARGUMENTS): contexto inicial (ex.: "rede de consultores em árvore",
"clientes com colunas e edição inline").
