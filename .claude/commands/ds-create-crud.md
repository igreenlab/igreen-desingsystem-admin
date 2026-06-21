---
name: ds-create-crud
description: >
  Construtor guiado de tela CRUD/tabela consumindo o DataTable. Entrevista
  híbrida (fases + drill-down, suporta dados vindos de API) → blueprint →
  [GATE] → geração espelhando os exemplos canônicos do preview.
  Skill: .claude/skills/crud-builder/
---

# Criar tela CRUD — iGreen DS

## Fluxo

```
/ds-create-crud [hint]
        │
        ▼  SKILL.md (router) + interview.md
1. ENTREVISTA — fases 0-5 (fonte de dados → colunas → filtros → comportamento → kanban?)
        │        kanban-design.md carregado só se kanban=sim
        ▼  blueprint.md
2. [GATE] BLUEPRINT — preview consolidado + pré-validações (operadores, colisões)
        │        aguardar "aprovar" — ⛔ zero edição antes
        ▼  generate.md
3. GERAÇÃO — ler canônicos → criar página → registrar (4 edits) → tsc → handoff
```

## Argumento opcional

`hint` — contexto inicial em prosa (ex: `/ds-create-crud pedidos com kanban,
dados da API /orders`). A entrevista usa como ponto de partida e pula o que já
estiver respondido.

## ⛔ Verificações antes de qualquer ação

```
1. DataTable existe e está estável? (src/components/ui/DataTable/)
2. A tela é de TABELA/CRUD (grade de colunas)? Se for LISTA DE CARDS (card/feed/
   árvore/agrupamento visual) → `/ds-create-list` (skill irmã `list-builder`).
   Na dúvida tabela-vs-lista, use o front-door `/ds-create-screen`.
   Dashboard/form/wizard → fora de escopo (skill irmã futura).
3. Já existe exemplo/showcase cobrindo exatamente esse caso?
   Sim → apontar o existente e perguntar se ainda quer criar.
4. Resolver parâmetros do ambiente (repo DS vs consumer) — ver SKILL.md.
```

## Passo 1 — Carregar skill

Carregar `.claude/skills/crud-builder/SKILL.md` via SkillTool. NUNCA confiar em
memória de sessão anterior. O router encadeia as sub-skills por estágio.

> Sem o slash command (DS como subprojeto/monorepo)? A IA deve LER e seguir
> `.claude/skills/crud-builder/SKILL.md` §"Invocação por prompt" — mesmo fluxo,
> mesma ordem, mesmo gate.

## Passo 2 — Gate

Blueprint consolidado apresentado de uma vez (colunas, filtros validados,
comportamento, kanban, arquivos). Aguardar:

- `aprovar` → Passo 3
- `ajustar <X>` → re-montar blueprint → novo gate
- `cancelar` → abortar (zero edição no disco)

**Não tocar em arquivo antes da aprovação.**

## Passo 3 — Gerar

Sequência do `generate.md`, abortando ao primeiro erro:
ler canônicos → criar página → registrar no preview → `npx tsc --noEmit` →
pipeline-state.md → handoff.

## Out of scope deste command

- Componentes novos do DS (use `/ds-create-component` — e cascata se a tela
  revelar gap de componente)
- Tokens novos (use `/ds-add-token` via cascata)
- Backend/API real (a tela usa mock ou o fetchData do consumer)
- Release (use `/ds-release` depois)

## Handoff final

`CRUD_PRONTO: <Entidade> — #/<page-id>`

Próximo: validação visual no preview (porta 3100) + `/ds-release` quando o
trabalho acumulado fechar versão.
