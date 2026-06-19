---
name: ds-create-component
description: >
  Cenário 2 — Criar componente iGreen com tv().
  Entry point com verificações obrigatórias.
  Implementação detalhada em .claude/skills/ds-dev/impl-igreen.md
---

# Criar componente iGreen — iGreen DS

## ⛔ Três verificações antes de qualquer código

```
1. Componente existe em .ai/context/components/inventory.md?
   Sim → PARAR. Usar/adaptar o existente.

2. Tem lógica interativa complexa (modal, dropdown, portal, teclado)?
   Sim → PARAR. Usar /ds-add-shadcn (Cenário 1).

3. Todos os tokens necessários existem?
   Token ausente → PARAR. Sinalizar cascata ao Orchestrator.
```

## Implementação

Carregar `.claude/skills/ds-dev/impl-igreen.md` para:
- Estrutura obrigatória (5 arquivos)
- Template `.styles.ts` com tv()
- Template `.tsx` com forwardRef
- Padrões de ring, tamanho, cor
- Checklist completo antes de sinalizar

## Handoff

1. `IMPL_PRONTA: [NomeComponente] — pronto para DS Reviewer` → rodar `ds-reviewer`.
2. **Fechar por PR (Regra 8 / L-041):** carregar `ds-dev/handoff-pr.md` → branch +
   commit descritivo + push `mirror` + `gh pr create` → **reportar o link pro gate humano**.
   PARAR no merge (humano aprova). Registrar no registry = no `/ds-release` (anotar no PR).
