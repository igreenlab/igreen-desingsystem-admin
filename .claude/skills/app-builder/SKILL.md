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

## Passo 0 — duas perguntas, nesta ordem

### 1. Como o projeto se chama?

Vai **à direita da logo** na sidebar (`sidebarTitle`), na raiz do breadcrumb e no título da
aba. É a única coisa deste passo que o DS não tem como adivinhar — e `sidebarTitle` segue
obrigatória de propósito, pra o TS cobrar a pergunta.

### 2. O app tem módulos?

⚠️ **Vocabulário — leia ANTES de formular a pergunta.** A mesma coisa tem três nomes na boca
do usuário: **módulo**, **workspace** e, às vezes, **categoria**. E "categoria" é armadilha:
na API da sidebar única, `categories` são os **grupos do menu** — não os módulos. A palavra
nomeia os dois lados da escolha ao mesmo tempo. Então:

- **não** use a palavra "categoria" na pergunta;
- **não** use nome de componente (`MenuSidebar`/`SingleMenuSidebar`) — não diz nada a quem
  não conhece o DS. Descreva **o que aparece na tela**.

Ofereça **duas** opções, e só essas duas:

> *"Seu sistema é dividido em áreas grandes e separadas — tipo Comercial, Financeiro,
> Suporte — cada uma com o menu dela? Ou é um sistema só, com um menu único?*
>
> *1. **Tem áreas separadas** — cada área vira um ícone numa coluna estreita à esquerda, e o
> menu dela abre ao lado:
> https://igreen-desingsystem-admin.vercel.app/#/menu-sidebar*
>
> *2. **É um sistema só** — um menu único, sem a coluna de ícones:
> https://igreen-desingsystem-admin.vercel.app/#/single-menu-sidebar*
>
> *Se quiser, abra os dois links antes de decidir."*

| resposta | `sidebar` | dados | o que NÃO passar |
|---|---|---|---|
| **tem áreas/módulos** | `"menu"` (default) | `contexts` | — |
| **é um sistema só** | `"single"` | `categories` | `sidebarModules` e `sidebarShowSearch` — é a variação **"Sem módulo / sem busca"** do showcase |

**Regra de tendência:** existe divisão → `"menu"`. Não existe → `"single"` enxuta.

A sidebar única **também** aceita módulos (`sidebarModules`) — e é exatamente o que não
oferecer na entrevista. Quando existe divisão, o rail da `"menu"` mostra as áreas todas de
uma vez; na única elas ficam atrás de um botão acima da busca. Se o usuário quiser conhecer
as outras variações, mande a página do componente: ampliar o leque na entrevista é o que
produz escolha errada.

### Logo e nome — aplique, não pergunte

- **A logo é a da iGreen, sempre.** **Não passe `sidebarLogo`** — o default já é a marca
  (desde 2026-08-22; antes a prop era obrigatória e trocar pra sidebar única fazia a logo
  desaparecer). Só troque se o usuário pedir marca própria **explicitamente**, e aí ele
  fornece o arquivo. **Nunca pergunte "qual logo?"**.
- **O nome do projeto vai à direita dela** — é a resposta da pergunta 1.

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
