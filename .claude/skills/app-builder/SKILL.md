---
name: app-builder
description: >
  Monta/edita o ESQUELETO de uma aplicação com o iGreen DS — AppShell (rail de
  módulos + Header com breadcrumb/⌘K/notificações/tema/user) + navegação
  (nav-data) + mapa de rotas declarativo. Use quando o usuário pedir "estrutura
  do app", "shell", "menu + topbar", "esqueleto", "layout base do app",
  "navegação". Ancora no example-app-shell.
---

# app-builder — Esqueleto de aplicação (repo DS)

O "chassi" onde as telas moram (shell + nav + roteamento). Não é conteúdo — o
conteúdo de cada tela vem dos builders (crud/list/dashboard). Skill focada:
leia e adapte o exemplo canônico, não gere de memória.

## Fluxo

1. **Leia** `src/examples/app-shell/` (fonte única): `nav-data.ts` (contextos +
   itens + helpers), `routes.tsx` (**mapa de rotas declarativo** href → tela +
   resolveRoute), `app-shell-example.tsx` (cabeamento do AppShell) +
   `src/components/ui/AppShell/USAGE.md`.
2. Adapte: `nav-data.ts` (módulos/telas do app) + `routes.tsx` (1 linha por tela).
3. `npx tsc --noEmit` limpo.

## Registro no showcase (app-shell = fullscreen puro, sem outro shell)

Segue o padrão dos apps standalone (`finance`, `order-detail`): entry point é só o `?app=`.

1. `src/App.tsx` — import `AppShellExampleShowcase` (wrapper que renderiza `<AppShellExample/>`).
2. `src/App.tsx` — handler `if (standaloneApp === "<id>") return <AppShellExampleShowcase />;`.
3. `src/preview/components/doc-nav-data.ts` — seção "Examples", item **com `url`**:
   `{ label: "App (esqueleto)", href: "<id>-example", url: "?app=<id>" }` (href ≠ ids do `DOC_PAGES`;
   cuidado: `app-shell` já é doc-page do componente — use outro href de nav).

Distribuição (registry.json + catálogo CLI) → consolida no `/ds-release`.

## Gotchas do tipo

- **Rota = MAPA declarativo**, nunca cadeia de `if` (era o ponto fraco do VP):
  registrar tela = 1 linha em `ROUTES`; `resolveRoute(href)` faz o lookup + fallback.
- **AppShell controlled** pra nav real: `activeContextId`/`onContextChange` +
  `activeItemHref`/`onItemClick` ligados ao router; `href` = path.
- **breadcrumb + ⌘K + notificações derivam da nav** (mapear `NAV_ENTRIES`), não hardcode.
- **Conteúdo NÃO vai no shell** — cada tela é um builder (crud/list/dashboard).
- Tema: state local alterna `.dark` no `<html>` (ou ligue no provider do app).

Handoff: `APP_PRONTO: <app> — ?app=<id>`. Registrar CONCLUÍDO em `.ai/status/pipeline-state.md`.
