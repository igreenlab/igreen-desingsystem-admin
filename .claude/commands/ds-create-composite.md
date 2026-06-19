---
name: ds-create-composite
description: >
  Cenário 3 — Criar componente composto.
  Entry point com verificações obrigatórias.
  Implementação detalhada em .claude/skills/ds-dev/impl-composite.md
---

# Criar componente composto — iGreen DS

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

1. `IMPL_PRONTA: ui/[NomeComposto] (composto) — pronto para DS Reviewer` → rodar `ds-reviewer`.
2. **Fechar por PR (Regra 8 / L-041):** carregar `ds-dev/handoff-pr.md` → branch +
   commit descritivo + push `mirror` + `gh pr create` → **reportar o link pro gate humano**.
   PARAR no merge (humano aprova). Registrar no registry = no `/ds-release` (anotar no PR).
