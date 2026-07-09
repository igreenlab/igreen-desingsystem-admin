---
name: app-builder
description: >
  Monta o ESQUELETO de uma aplicação com o iGreen DS — AppShell (rail de módulos
  + Header com breadcrumb/⌘K/notificações/tema/user) + navegação (nav-data) +
  mapa de rotas declarativo. Use quando o usuário pedir "estrutura do app",
  "shell", "menu lateral + topbar", "esqueleto", "layout base", "navegação do
  app", "montar o app do zero". Ancora no example-app-shell.
---

# app-builder — Esqueleto de aplicação (AppShell + navegação + rotas)

O "chassi" onde as telas moram. Não é uma tela de conteúdo — é o shell + nav +
roteamento. Conteúdo de cada tela vem depois dos builders (crud/list/dashboard).
Não gere de memória: puxe e adapte o exemplo.

## Fluxo

1. `npm run igreen:add -- example-app-shell` (traz o esqueleto + AppShell, MenuSidebar, Header, PageHeader).
2. **Leia** `src/examples/app-shell/` — 3 arquivos:
   - `nav-data.ts` — contextos (módulos do rail) + itens/subitens + helpers.
   - `routes.tsx` — **mapa de rotas declarativo** (href → tela) + resolveRoute.
   - `app-shell-example.tsx` — o cabeamento do AppShell (não costuma mexer).
   + `src/components/ui/AppShell/USAGE.md`.
3. Adapte: **`nav-data.ts`** (os módulos/telas do app do usuário) e **`routes.tsx`**
   (uma linha por tela; troque `<StubPage/>` pela tela real conforme for criando).
4. Ligue ao seu app (renderize `<AppShellExample/>` na raiz, ou copie o cabeamento).
   `npx tsc --noEmit` limpo.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> componentes/exemplos JÁ estão em `<dsPath>/src` — **não** rode `igreen:add`. Use `importBase`
> do config e leia o exemplo em `<dsPath>/src/examples/app-shell/`.

## Gotchas do tipo

- **Rota é um MAPA declarativo, não `if/else`**: registrar tela = 1 linha em
  `ROUTES` (`"#/path": () => <Screen/>`). Nunca reintroduza a cadeia de `if`.
- **AppShell é controlled pra navegação real**: ligue `activeContextId`/`onContextChange`
  + `activeItemHref`/`onItemClick` ao seu router; `href` = path. Os `default*` são só
  pro modo uncontrolled/preview.
- **breadcrumb + ⌘K + notificações derivam da nav** (não hardcode): veja como o
  exemplo mapeia `NAV_ENTRIES` → commandGroups e a entry ativa → breadcrumb.
- **Tema**: o exemplo usa state local que alterna `.dark` no `<html>`. Se o app já
  tem provider de tema, ligue nele (`theme` + `onThemeChange`).
- **Conteúdo NÃO vai aqui**: cada tela é um builder (crud/list/dashboard). O shell
  só navega e resolve a rota.
- Fullscreen sem outro shell por volta. Body do AppShell já tem padding próprio.

Aplique `DESIGN.md` + `.claude/rules/ds-design.md`. Handoff: `APP_PRONTO: <app>` + rotas.
