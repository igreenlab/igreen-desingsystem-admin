---
name: ds-create-login
description: >
  Skill focada de tela de LOGIN / autenticação consumindo o padrão do DS
  (example-login): form split + painel de marca por tokens. Leia-e-adapte o
  exemplo canônico. Skill: .claude/skills/auth-builder/
---

# Criar tela de Login — iGreen DS

## Fluxo

```
/ds-create-login [hint]
        │
        ▼  SKILL.md (auth-builder)
1. LER  src/examples/login/login-screen.tsx + FormField/USAGE.md
        │
        ▼
2. ADAPTAR  marca/copy do painel · campos do form · handler de auth
        │
        ▼
3. REGISTRAR (se nova)  ?app=<id> + doc-nav (fullscreen) · tsc limpo
```

## Argumento opcional

`hint` — contexto em prosa (marca, campos, SSO, etc.).

## ⛔ Verificações antes de qualquer ação

1. FormField/Button existem e estão estáveis? (`src/components/ui/`)
2. É mesmo login/autenticação? (senão → `/ds-create-screen` desambigua)
3. Já existe `example-login` cobrindo o caso? Adaptar, não recriar do zero.

## Passo 1 — Carregar skill

Carregar `.claude/skills/auth-builder/SKILL.md` via SkillTool.

## Out of scope

Auth real (backend/OAuth), sessão, guards de rota — o exemplo é mockado
(`onSubmit` só previne default). Distribuição (registry/CLI) → `/ds-release`.

## Handoff final

`LOGIN_PRONTO: <marca> — ?app=<id>`
