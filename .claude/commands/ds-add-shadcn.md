---
name: ds-add-shadcn
description: >
  Cenário 1 — Adicionar componente Shadcn.
  Entry point com verificações obrigatórias.
  Implementação detalhada em .claude/skills/ds-dev/impl-shadcn.md
---

# Adicionar componente Shadcn — iGreen DS

## ⛔ Verificações antes de qualquer código

```
1. shadcn/[nome].tsx já existe em .ai/context/components/inventory.md?
   Sim → PARAR. Editar o existente. NÃO reinstalar.
   Não → continuar

2. Tem tokens DS necessários?
   Token ausente → PARAR. Sinalizar cascata ao Orchestrator.
   Todos presentes → continuar
```

## Implementação

Carregar `.claude/skills/ds-dev/impl-shadcn.md` para o processo completo:
- Instalar via CLI + mover para `shadcn/`
- Substituir focus ring (obrigatório)
- Substituições recomendadas de tokens
- Barrel exports
- Checklist antes de sinalizar

## Handoff

1. `IMPL_PRONTA: shadcn/[nome] — pronto para DS Reviewer` → rodar `ds-reviewer`.
2. **Fechar por PR (Regra 8 / L-041):** carregar `ds-dev/handoff-pr.md` → branch +
   commit descritivo + push `mirror` + `gh pr create` → **reportar o link pro gate humano**.
   PARAR no merge (humano aprova). Registrar no registry = no `/ds-release` (anotar no PR).
