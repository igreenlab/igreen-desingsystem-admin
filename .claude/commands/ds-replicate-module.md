---
name: ds-replicate-module
description: >
  Replica uma família de telas (módulo/segmento) para um novo segmento trocando
  dataset + rótulos e mantendo a estrutura. Antes de copiar, avalia se é melhor
  PARAMETRIZAR. Skill: .claude/skills/module-replicator/
---

# Replicar módulo/segmento — iGreen DS

## Fluxo

```
/ds-replicate-module [origem → destino]
        │
        ▼  SKILL.md (module-replicator)
1. COPIAR ou PARAMETRIZAR?  (≥3 clones → parametrizar; 1-2 → copiar)
        │
        ▼  (se copiar)
2. Separar varia (dados/rótulos/ícone/cor/href) × estrutural (idêntico)
        │
        ▼
3. Copiar telas → novo segmento · trocar só o que varia · registrar nav + rotas · tsc
```

## Argumento opcional

`[origem → destino]` — ex.: `/ds-replicate-module energia → telecom`.

## ⛔ Verificações antes de qualquer ação

1. O módulo-fonte existe e é estável? (telas + nav + rotas)
2. As telas são realmente clones estruturais (só mudam dados/rótulos)? Se vão
   divergir muito, replicar arquivos faz sentido; se são idênticas e mantidas
   juntas, **parametrize**.

## Passo 1 — Carregar skill

Carregar `.claude/skills/module-replicator/SKILL.md` via SkillTool.

## Princípio

Nunca altere a ESTRUTURA na cópia (senão vira manutenção ×N). Registro de rotas =
mapa declarativo (skill `app-builder`), não if-chain.

## Handoff final

`MODULO_PRONTO: <segmento> (N telas)`
