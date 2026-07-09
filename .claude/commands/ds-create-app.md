---
name: ds-create-app
description: >
  Skill focada de ESQUELETO de app consumindo o padrão do DS (example-app-shell):
  AppShell + navegação (nav-data) + mapa de rotas declarativo. Leia-e-adapte o
  exemplo canônico. Skill: .claude/skills/app-builder/
---

# Criar esqueleto de App — iGreen DS

## Fluxo

```
/ds-create-app [hint]
        │
        ▼  SKILL.md (app-builder)
1. LER  src/examples/app-shell/{nav-data,routes,app-shell-example} + AppShell/USAGE.md
        │
        ▼
2. ADAPTAR  nav-data (módulos/telas) · routes (mapa href → tela)
        │
        ▼
3. REGISTRAR (se novo)  ?app=<id> + doc-nav · tsc limpo
```

## Argumento opcional

`hint` — módulos/telas do app em prosa.

## ⛔ Verificações antes de qualquer ação

1. AppShell/MenuSidebar/Header existem e estão estáveis? (`src/components/ui/`)
2. É mesmo o ESQUELETO (shell/nav/rotas), não uma tela de conteúdo? (conteúdo →
   crud/list/dashboard builders)
3. Já existe `example-app-shell`? Adaptar, não recriar do zero.

## Passo 1 — Carregar skill

Carregar `.claude/skills/app-builder/SKILL.md` via SkillTool.

## Princípio

Rota é MAPA declarativo (href → tela), nunca cadeia de `if`. O shell só navega;
cada tela é um builder. Distribuição (registry/CLI) → `/ds-release`.

## Handoff final

`APP_PRONTO: <app> — ?app=<id>`
