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

`IMPL_PRONTA: shadcn/[nome] — pronto para DS Reviewer`
