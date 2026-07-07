---
name: ds-create-screen
description: >
  Front-door único pra criar tela de dados: desambigua TABELA (grade) vs LISTA DE
  CARDS vs DASHBOARD/PAINEL e roteia pro builder certo (crud-builder, list-builder
  ou dashboard-builder). Existe porque muita gente chama tabela de "lista" — a
  pergunta evita criar a coisa errada.
---

# Criar tela de dados — iGreen DS (front-door)

Ponto de entrada único. **Primeiro desambigua, depois delega** — nunca rotear sem
a confirmação, porque "lista" é usado pra tabela com frequência.

## Passo 1 — Desambiguação (OBRIGATÓRIO, antes de qualquer coisa)

Perguntar (use `AskUserQuestion`), descrevendo por **uso**, não pela palavra:

| Opção              | Sinais                                                                                                                          | Exemplos                                           | Roteia pra     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------- |
| **Tabela (grade)** | colunas × linhas · muitos campos por registro · comparar/ordenar/filtrar **por coluna** · editar célula · somatórios · densa    | clientes, financeiro, pedidos                      | `crud-builder` |
| **Lista de cards** | cada item é um **card** · poucos campos em destaque (avatar/título/subtítulo/meta) · visual · hierarquia/agrupamento/DnD · feed | membros, tarefas, organização (árvore), atividades | `list-builder` |
| **Dashboard/painel** | **compõe** várias seções numa "visão geral": KPIs rápidos + gráfico(s) + ranking/resumo (**2+ tipos de seção**) · foco em métrica/tendência, pouca edição | painel do líder, resumo de categoria, visão da rede | `dashboard-builder` |

Se o `hint` do usuário já deixar claro (ex: "tabela de clientes com colunas e
edição inline"), confirme em 1 linha e siga — não force a pergunta redundante.
Na dúvida, **pergunte**. Dashboard = **2+ tipos de seção**; 1 tabela/lista/gráfico só
→ não é dashboard.

> **Kanban / board / funil / pipeline de vendas** → é a rota **Tabela**. Kanban é
> uma `viewMode` do DataTable (mesmos dados/colunas/filtros, só muda a exibição pra
> board); funil = board agrupado por etapa. Roteie pro `crud-builder` — a Fase 5 do
> interview configura as lanes pela coluna de status/etapa. **Não é um 3º builder.**

## Passo 2 — Delegar

- **Tabela** → carregar `.claude/skills/crud-builder/SKILL.md` (ou `/ds-create-crud`)
  e seguir o fluxo dele (entrevista → blueprint → gate → geração).
- **Lista de cards** → carregar `.claude/skills/list-builder/SKILL.md` (ou
  `/ds-create-list`) e seguir o fluxo dele.
- **Dashboard/painel** → carregar `.claude/skills/dashboard-builder/SKILL.md` (ou
  `/ds-create-dashboard`) e seguir o fluxo dele.

A partir daqui o builder escolhido assume; este command não interfere mais.

> **Dashboard com tabela/lista embutida** (ex.: "painel com KPIs + gráfico e uma
> tabela embaixo") → rota **Dashboard**; o dashboard-builder delega a tabela/lista
> ao crud/list-builder na Fase 5. Não precisa escolher os dois aqui.

## Argumento opcional

`hint` — contexto inicial (ex: `/ds-create-screen organização em árvore de
empresas`). Repassado pro builder escolhido como ponto de partida.

## Atalhos diretos (pulam a desambiguação)

- `/ds-create-crud` — já sabe que é tabela.
- `/ds-create-list` — já sabe que é lista de cards.
- `/ds-create-dashboard` — já sabe que é dashboard/painel.

## Handoff

Delegado ao builder escolhido — handoff final é o dele (`CRUD_PRONTO:`,
`LIST_PRONTO:` ou `DASHBOARD_PRONTO:`).
