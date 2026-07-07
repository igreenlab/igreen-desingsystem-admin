---
name: ds-create-list
description: >
  Construtor guiado de tela de LISTA DE CARDS consumindo o DataList (irmã do
  /ds-create-crud, que é pra tabela). Entrevista (fonte → card → layout →
  filtros → seleção → escala) → blueprint → [GATE] → geração espelhando os
  exemplos canônicos List*Preview. Skill: .claude/skills/list-builder/
---

# Criar tela de Lista — iGreen DS

## Fluxo

```
/ds-create-list [hint]
        │
        ▼  SKILL.md (router) + interview.md
1. ENTREVISTA — fases 0-6 (fonte → card/slots → layout → toolbar/filtros → seleção → escala)
        │
        ▼  blueprint.md
2. [GATE] BLUEPRINT — preview consolidado + pré-validações (excludências, operadores, colisões)
        │        aguardar "aprovar" — ⛔ zero edição antes
        ▼  generate.md
3. GERAÇÃO — ler canônicos → criar página → registrar (4 edits) → tsc → handoff
```

## Argumento opcional

`hint` — contexto inicial em prosa (ex: `/ds-create-list membros com filtro de
papel/status e bulk`). A entrevista usa como ponto de partida.

## ⛔ Verificações antes de qualquer ação

```
1. DataList existe e está estável? (src/components/ui/DataList/)
2. É mesmo LISTA DE CARDS? Se for grade/colunas/edição-por-célula → é TABELA →
   /ds-create-crud (a SKILL.md confirma isso na desambiguação).
3. Já existe exemplo cobrindo o caso? Sim → apontar e perguntar se ainda quer criar.
4. Resolver parâmetros do ambiente (repo DS vs consumer) — ver SKILL.md.
```

## Passo 1 — Carregar skill

Carregar `.claude/skills/list-builder/SKILL.md` via SkillTool. NUNCA confiar em
memória. O router encadeia as sub-skills por estágio.

> Sem o slash command (DS como subprojeto)? A IA LÊ e segue
> `.claude/skills/list-builder/SKILL.md` §"Invocação por prompt".

## Passo 2 — Gate

Blueprint consolidado (card, layout, toolbar/filtros, seleção/escala, arquivos).
Aguardar: `aprovar` → Passo 3 · `ajustar <X>` → novo gate · `cancelar` → aborta.
**Não tocar em arquivo antes da aprovação.**

## Passo 3 — Gerar

Sequência do `generate.md`: ler canônicos → criar página → registrar → `npx tsc
--noEmit` → pipeline-state.md → handoff.

## Out of scope deste command

- Tela de TABELA/CRUD denso → `/ds-create-crud`
- Componentes/tokens novos → `/ds-create-component` · `/ds-add-token` (cascata)
- Release → `/ds-release` depois

## Handoff final

`LIST_PRONTO: <Entidade> — #/<page-id>`

Próximo: validação visual no preview (porta 3100) + `/ds-release` quando fechar versão.
