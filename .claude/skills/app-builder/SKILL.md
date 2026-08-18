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

## Passo 0 — PERGUNTE: o app tem módulos?

Não presuma. As duas sidebars do DS resolvem problemas diferentes, e escolher errado só
aparece quando o app já está montado:

| resposta do usuário | `sidebar` do AppShell | dados |
|---|---|---|
| **Tem áreas/módulos distintos** (ex.: Comercial, Financeiro, Suporte) — cada um com o próprio menu | `"menu"` (default) | `contexts` |
| **Não tem módulos** — é um sistema só, menu único de categorias | `"single"` | `categories` + `sidebarLogo` + `sidebarTitle` |

Pergunta prática, que não exige o usuário conhecer os componentes:

> *"O sistema vai ter áreas separadas — tipo Comercial, Financeiro, Suporte — cada uma com
> o próprio menu? Ou é um sistema único com um menu só?"*

**O `AppShell` monta as DUAS** (desde a v0.41.0). O tipo é união discriminada, então o TS
cobra o conjunto certo pra cada escolha. O toggle do Header funciona nos dois casos sem
cabeamento — e na variante `single` ele **sai** do Header no desktop, porque a sidebar tem o
próprio botão (no mobile volta, senão não haveria como abrir).

Na `single`, **não ligue `sidebarShowSearch`** se o Header já tem `commandGroups`: seriam
duas buscas na mesma tela. O shell já entrega a da sidebar desligada por default.

> ⚠️ **Até 2026-08-18 esta seção dizia o contrário** — que o AppShell "só monta com
> MenuSidebar" porque o Single "não tem `collapsed` nem drawer mobile". **Era falso**: ele tem
> colapso controlado completo, chamado **`expanded`**, e tem mobile (`< md`: expandida ocupa
> 100% da largura, recolhida some). Eu havia procurado pelo nome errado e escrito a conclusão
> como ressalva permanente. Quem seguisse a versão anterior montaria layout na mão sem
> necessidade.

## Fluxo

1. **Leia** `src/examples/app-shell/` (fonte única): `nav-data.ts` (contextos +
   itens + helpers), `routes.tsx` (**mapa de rotas declarativo** href → tela +
   resolveRoute), `app-shell-example.tsx` (cabeamento do AppShell) +
   `src/components/ui/AppShell/USAGE.md`.
2. Adapte: `nav-data.ts` (módulos/telas do app) + `routes.tsx` (1 linha por tela).
3. **Item de menu com destino? Declare `href`** — nas duas sidebars ele emite `<a>`, o que
   dá ctrl+clique e nova aba. Router próprio → `renderLink={({href,...r}) => <Link to={href} {...r} />}`.
4. **AppShell embutido em container com altura** (layout com footer, aba, preview)? →
   `fillHeight`. Sem isso ele mede 100vh, transborda o container e o conteúdo aparece
   cortado na base — parece falta de padding e não é.
5. `npx tsc --noEmit` limpo.

## Registro no showcase (app-shell = fullscreen puro, sem outro shell)

Segue o padrão dos apps standalone (`finance`, `order-detail`): entry point é só o `?app=`.

1. `src/App.tsx` — import `AppShellExampleShowcase` (wrapper que renderiza `<AppShellExample/>`).
2. `src/App.tsx` — handler `if (standaloneApp === "<id>") return <AppShellExampleShowcase />;`.
3. `src/preview/components/doc-nav-data.ts` — seção "Examples", item **com `url`**:
   `{ label: "App (esqueleto)", href: "<id>-example", url: "?app=<id>" }` (href ≠ ids do `DOC_PAGES`;
   cuidado: `app-shell` já é doc-page do componente — use outro href de nav).

Distribuição (registry.json + vocabulário do consumidor) → consolida no `/ds-release`.

## Gotchas do tipo

- **Rota = MAPA declarativo**, nunca cadeia de `if` (era o ponto fraco do VP):
  registrar tela = 1 linha em `ROUTES`; `resolveRoute(href)` faz o lookup + fallback.
- **AppShell controlled** pra nav real: `activeContextId`/`onContextChange` +
  `activeItemHref`/`onItemClick` ligados ao router; `href` = path.
- **breadcrumb + ⌘K + notificações derivam da nav** (mapear `NAV_ENTRIES`), não hardcode.
- **Conteúdo NÃO vai no shell** — cada tela é um builder (crud/list/dashboard).
- Tema: state local alterna `.dark` no `<html>` (ou ligue no provider do app).

Handoff: `APP_PRONTO: <app> — ?app=<id>`. Registrar CONCLUÍDO em `.ai/status/pipeline-state.md`.
