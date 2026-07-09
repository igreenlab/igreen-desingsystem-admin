---
description: Monta o esqueleto de um app (AppShell + navegação + rotas) com o iGreen DS
---

Carregue e siga a skill `.claude/skills/app-builder/SKILL.md`.

$ARGUMENTS = contexto do app (módulos/telas). Puxe o exemplo com
`npm run igreen:add -- example-app-shell`, leia `src/examples/app-shell/`
(`nav-data.ts` + `routes.tsx` + `app-shell-example.tsx`) + `AppShell/USAGE.md`, e
adapte: **nav-data** (módulos/telas do usuário) + **routes** (mapa declarativo
href → tela). Rota é MAPA, nunca cadeia de `if`. Conteúdo de cada tela vem dos
builders (crud/list/dashboard) — aqui é só shell + navegação. Ligue ao router
real via `activeItemHref`/`onItemClick`. `npx tsc --noEmit` limpo. Aplique `DESIGN.md`.

> **Modo submódulo:** se existe `.claude/ds-config.json` com `"mode": "submodule"`, NÃO rode
> `igreen:add` — leia o exemplo em `<dsPath>/src/examples/app-shell/` e importe via `importBase`.
