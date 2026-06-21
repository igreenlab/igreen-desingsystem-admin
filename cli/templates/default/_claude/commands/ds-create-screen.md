---
description: Front-door pra criar tela de dados — desambigua TABELA (grade) vs LISTA DE CARDS e roteia
---

Ponto de entrada único. **Primeiro desambigua, depois delega** — "lista" é usado
pra tabela com frequência, então nunca roteie sem confirmar.

## Passo 1 — Desambiguação (OBRIGATÓRIO)

Pergunte, descrevendo por **uso** (não pela palavra):

| Opção              | Sinais                                                                                                | Roteia pra                         |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Tabela (grade)** | colunas × linhas · muitos campos · ordenar/filtrar por coluna · editar célula · somatórios · planilha | `crud-builder` (`/ds-create-crud`) |
| **Lista de cards** | cada item é um card · poucos campos em destaque · visual · árvore/hierarquia/rede/DnD · feed          | `list-builder` (`/ds-create-list`) |

Se o $ARGUMENTS já deixar claro, confirme em 1 linha e siga. Na dúvida, pergunte.

> **Kanban / board / funil / pipeline de vendas** → rota **Tabela**. Kanban é uma
> `viewMode` do DataTable (mesmos dados, só muda a exibição); funil = board agrupado
> por etapa. Roteie pro `crud-builder` — a Fase 5 configura as lanes pela coluna de
> status/etapa. Não é um 3º builder.

## Passo 2 — Delegar

- **Tabela** → carregue `.claude/skills/crud-builder/SKILL.md` e siga o fluxo dele.
- **Lista de cards** → carregue `.claude/skills/list-builder/SKILL.md` e siga o fluxo dele.

A partir daí o builder escolhido assume (entrevista → blueprint [GATE] → geração).

Argumento opcional ($ARGUMENTS): contexto inicial (ex.: "rede de consultores em árvore",
"clientes com colunas e edição inline").
