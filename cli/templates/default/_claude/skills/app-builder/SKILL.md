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

## Passo 0 — duas perguntas ao usuário, nesta ordem

### 1. Como o projeto se chama?

Vai **à direita da logo** na sidebar (`sidebarTitle`), na raiz do breadcrumb e no título da
aba. É a única coisa deste passo que o DS não adivinha — e `sidebarTitle` é obrigatória de
propósito, pra o TS cobrar a pergunta.

### 2. O app tem módulos?

⚠️ **Vocabulário — leia ANTES de formular a pergunta.** A mesma coisa tem três nomes na boca
do usuário: **módulo**, **workspace** e, às vezes, **categoria**. E "categoria" é armadilha:
na API da sidebar única, `categories` são os **grupos do menu**, não os módulos — a palavra
nomeia os dois lados da escolha. Então **não** use "categoria" na pergunta, e **não** use
nome de componente (`MenuSidebar`/`SingleMenuSidebar`): descreva **o que aparece na tela**.

**Espelhe a palavra do usuário** — se ele disse "módulo" ou "workspace", use a dele. **Exceto
"categoria"**: essa é ambígua e você **não pode** adivinhar. Se ele disse "categorias",
desambigue antes de qualquer coisa:

> *"Quando você fala 'categorias', são **áreas grandes**, cada uma com o menu dela — tipo
> Comercial, Financeiro, Suporte? Ou são os **grupos dentro de um menu só** — tipo Cadastros,
> Relatórios, Configurações?"*

**Se ele JÁ listou as áreas** ("tenho Comercial, Financeiro e Suporte"), **não pergunte do
zero** — recomende e confirme numa linha: *"Como você tem 3 áreas separadas, vou de menu com
a coluna de módulos à esquerda (é o link X). Confirma?"*.

Fora isso, ofereça **duas** opções, e só essas duas — **com recomendação**, não neutro:

> *"Seu sistema é dividido em áreas grandes e separadas — tipo Comercial, Financeiro,
> Suporte — cada uma com o menu dela? Ou é um sistema só, com um menu único?*
>
> *1. **Tem áreas separadas** — cada área vira um ícone numa coluna estreita à esquerda, e o
> menu dela (com submenus) abre ao lado:
> https://igreen-desingsystem-admin.vercel.app/#/menu-sidebar*
>
> *2. **É um sistema só** — sem a coluna de ícones: só o nome do projeto no topo e, abaixo, os
> grupos do menu com seus submenus:
> https://igreen-desingsystem-admin.vercel.app/#/single-menu-sidebar*
>
> *Pelo que você me contou, eu iria de **<a que você inferiu>** — mas abra os dois links e me
> diga."*

⚠️ **Recomende sempre uma das duas**, com o motivo em meia linha ("porque você tem 3 áreas
distintas" / "porque é um sistema só"). Pergunta neutra devolve a decisão pra quem não conhece
os componentes — e foi assim que um consumidor escolheu errado sem querer (2026-08-22).

| resposta | `sidebar` | dados | o que NÃO passar |
|---|---|---|---|
| **tem áreas/módulos** | `"menu"` (default) | `contexts` | — |
| **é um sistema só** | `"single"` | `categories` | `sidebarModules` e `sidebarShowSearch` — é a variação **"Sem módulo / sem busca"** |

**Regra de tendência:** existe divisão → `"menu"`. Não existe → `"single"` enxuta. A sidebar
única **também** aceita módulos (`sidebarModules`), e é justamente o que não oferecer: quando
existe divisão, o rail da `"menu"` mostra as áreas todas de uma vez, enquanto na única elas
ficam atrás de um botão acima da busca. Quer conhecer as outras variações? Mande a página do
componente — ampliar o leque na entrevista é o que produz escolha errada.

```tsx
<AppShell
  sidebar="single"
  categories={CATEGORIES}
  sidebarTitle="Meu Sistema"     {/* ← o nome do projeto, à direita da logo */}
  activeItemId={ativo}
  onSidebarItemClick={setAtivo}
  breadcrumb={[{ label: "Meu Sistema" }]}
>…</AppShell>
```

### Logo e nome — aplique, não pergunte

- **A logo é a da iGreen, sempre.** **Não passe `sidebarLogo`** — o default já é a marca
  (lib vNEXT+; antes a prop era obrigatória, e trocar pra sidebar única fazia a logo da
  iGreen desaparecer, porque a API pedia outra). Só troque se o usuário pedir marca própria
  **explicitamente**, e aí ele fornece o arquivo. **Nunca pergunte "qual logo?"**.
- **O nome do projeto vai à direita dela** — é a resposta da pergunta 1.
- Numa lib anterior a essa a prop é obrigatória: passe
  `sidebarLogo={<SidebarBrandMark />}` (de `@/components/ui/MenuSidebar/sidebar-brand`) em
  vez de inventar uma.

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
