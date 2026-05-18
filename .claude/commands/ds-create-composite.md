---
name: ds-create-composite
description: >
  Cenário 3 — Criar componente composto.
  Entry point com verificações obrigatórias.
  Implementação detalhada em .claude/skills/ds-dev/impl-composite.md
---

# Criar componente composto — iGreen DS v2

## ⛔ Três verificações antes de qualquer código

```
1. Composto existe em .ai/context/components/inventory.md?
   Sim → PARAR. Editar o existente.

2. Todos os componentes-base existem em shadcn/ ou ui/?
   Base ausente → PARAR. Criar a base primeiro.

3. Tokens necessários existem?
   Token ausente → PARAR. Sinalizar cascata ao Orchestrator.
```

## Implementação

Carregar `.claude/skills/ds-dev/impl-composite.md` para:
- Estrutura (5 arquivos)
- Template com tv() slots
- Regras de API limpa e acessibilidade
- Checklist completo

## Handoff

`IMPL_PRONTA: ui/[NomeComposto] (composto) — pronto para DS Reviewer`
