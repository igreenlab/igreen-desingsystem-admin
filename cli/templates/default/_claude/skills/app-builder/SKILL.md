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

## Passo 0 — PERGUNTE ao usuário: o app tem módulos?

Não presuma. Escolher a navegação errada só aparece quando o app já está montado.

> *"O sistema vai ter áreas separadas — tipo Comercial, Financeiro, Suporte — cada uma com
> o próprio menu? Ou é um sistema único com um menu só?"*

| resposta | `sidebar` do AppShell | dados que exige |
|---|---|---|
| **com áreas/módulos** | `"menu"` (default) | `contexts` |
| **sistema único** | `"single"` | `categories` + `sidebarLogo` + `sidebarTitle` |

```tsx
<AppShell
  sidebar="single"
  categories={CATEGORIES}
  sidebarLogo={<MinhaLogo />}
  sidebarTitle="Meu Sistema"
  activeItemId={ativo}
  onSidebarItemClick={setAtivo}
  breadcrumb={[{ label: "Sistema" }]}
>…</AppShell>
```

**O AppShell monta as DUAS** (lib ≥ 0.41.0). O tipo é união discriminada: o TS cobra o
conjunto certo pra cada escolha. O toggle do Header funciona nos dois sem cabeamento — e na
variante `single` ele **sai** do Header no desktop, porque a sidebar tem o próprio botão (no
mobile volta, senão não haveria como abrir).

⚠️ **Não ligue `sidebarShowSearch`** se o Header já tem `commandGroups` — seriam duas buscas
na mesma tela. O shell entrega a busca da sidebar **desligada** por default.

> ⚠️ **Até o CLI 0.25.0 esta seção dizia o contrário** — que o AppShell só montava com
> `menu-sidebar`, porque o `single-menu-sidebar` "não tem colapso nem drawer mobile". **Era
> falso**: ele tem colapso controlado (`expanded`) e tem mobile. Se você montou layout na mão
> por causa dessa instrução, agora dá pra usar o AppShell.

**Item de menu com destino → declare `href`** (as duas sidebars emitem `<a>`: ctrl+clique e
nova aba funcionam). Com router próprio, passe
`renderLink={({ href, ...rest }) => <Link to={href} {...rest} />}`.

**AppShell dentro de container com altura** (layout com footer seu, aba, preview) →
`fillHeight`. Sem isso ele mede 100vh, transborda e o conteúdo fica cortado na base.

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
- Fullscreen sem outro shell por volta. Body do AppShell já tem padding próprio —
  **responsivo**: 18px (<768) · 24px (768–1535) · 32px (≥1536). Não adicione padding
  por fora nem por dentro do slot.
- **O menu NASCE COLAPSADO abaixo de 1536px.** Notebook (1366/1440) abre com o rail,
  ganhando ~264px de largura útil. Se o app precisa do menu sempre aberto, passe
  **`defaultMenuCollapsed={false}` explícito** — o default responsivo só vale quando a
  prop é omitida. É aplicado **só no mount**: não reage a resize, de propósito (senão
  brigaria com quem abriu o menu na mão). Abaixo de 768px o menu vira drawer e ignora
  isso.

Aplique `DESIGN.md` + `.claude/rules/ds-design.md`. Handoff: `APP_PRONTO: <app>` + rotas.
