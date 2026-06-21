---
name: ds-create-screen
description: >
  Front-door único pra criar tela de dados: desambigua TABELA (grade) vs LISTA DE
  CARDS e roteia pro builder certo (crud-builder ou list-builder). Existe porque
  muita gente chama tabela de "lista" — a pergunta evita criar a coisa errada.
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

Se o `hint` do usuário já deixar claro (ex: "tabela de clientes com colunas e
edição inline"), confirme em 1 linha e siga — não force a pergunta redundante.
Na dúvida, **pergunte**.

> **Kanban / board / funil / pipeline de vendas** → é a rota **Tabela**. Kanban é
> uma `viewMode` do DataTable (mesmos dados/colunas/filtros, só muda a exibição pra
> board); funil = board agrupado por etapa. Roteie pro `crud-builder` — a Fase 5 do
> interview configura as lanes pela coluna de status/etapa. **Não é um 3º builder.**

## Passo 2 — Delegar

- **Tabela** → carregar `.claude/skills/crud-builder/SKILL.md` (ou `/ds-create-crud`)
  e seguir o fluxo dele (entrevista → blueprint → gate → geração).
- **Lista de cards** → carregar `.claude/skills/list-builder/SKILL.md` (ou
  `/ds-create-list`) e seguir o fluxo dele.

A partir daqui o builder escolhido assume; este command não interfere mais.

## Argumento opcional

`hint` — contexto inicial (ex: `/ds-create-screen organização em árvore de
empresas`). Repassado pro builder escolhido como ponto de partida.

## Atalhos diretos (pulam a desambiguação)

- `/ds-create-crud` — já sabe que é tabela.
- `/ds-create-list` — já sabe que é lista de cards.

## Handoff

Delegado ao builder escolhido — handoff final é o dele (`CRUD_PRONTO:` ou
`LIST_PRONTO:`).
