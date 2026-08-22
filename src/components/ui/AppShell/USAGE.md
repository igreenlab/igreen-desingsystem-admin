# AppShell — USAGE

<!-- ds:regras
- tem áreas separadas (Comercial, Financeiro…)? → `sidebar="menu"` + `contexts`. Não tem? → `"single"` + `categories`, sem `sidebarModules` nem `sidebarShowSearch`
- NÃO passe `sidebarLogo`: o default é a marca iGreen. Só com marca própria pedida explicitamente
- `sidebarTitle` = nome do projeto (vai à direita da logo) — pergunte, não invente
-->

Template de aplicação completo: MenuSidebar (rail + panel) + Header sticky + body com slot livre.

## Quando usar
- Páginas full-app (Showcases, CRUD, Chat, Dashboard)
- Quando precisar de contexts (workspace switcher) + breadcrumb + user menu unificados

## Import
```tsx
import { AppShell } from "@/components/ui/AppShell";
```

## Qual sidebar — `menu` (default) × `single`

O shell monta **uma das duas** sidebars. O tipo é **união discriminada**: cada escolha exige
o seu próprio conjunto de dados, e o TS cobra no editor.

| `sidebar` | quando | exige |
|---|---|---|
| `"menu"` (default) | app com **áreas distintas** (Comercial, Financeiro…), cada uma com menu próprio | `contexts` |
| `"single"` | **sistema único**, um menu só — busca opcional | `categories` + `sidebarLogo` + `sidebarTitle` |

```tsx
<AppShell
  sidebar="single"
  categories={CATEGORIES}
  sidebarLogo={<MinhaLogo />}
  sidebarTitle="Meu Sistema"
  sidebarShowSearch
  activeItemId={ativo}
  onSidebarItemClick={setAtivo}
  breadcrumb={[{ label: "Sistema" }]}
>…</AppShell>
```

**O toggle do Header funciona nas duas sem você cabear nada.** O mapeamento interno difere
porque os componentes modelam o estado de formas diferentes — `MenuSidebar` tem
`panelCollapsed` + drawer no mobile; a single tem `expanded`, e no mobile o `expanded` **é** a
visibilidade (expandida ocupa 100% da largura, recolhida some).

⚠️ **`onSidebarItemClick` é separado do `onItemClick`**, e não é redundância: o `MenuSidebar`
entrega o **item** (`SidebarMenuItem`), a single entrega o **`id`**. Mesmo nome faria você
receber um tipo e escrever pro outro.

⚠️ **Por que união e não props opcionais:** deixar `contexts` opcional trocaria erro de
compilação por falha silenciosa — ausente com a sidebar de menu, o rail renderiza **vazio**,
sem erro nenhum.

## Props essenciais
| Prop | Tipo | Default | Função |
|---|---|---|---|
| `sidebar` | `"menu" \| "single"` | `"menu"` | Qual menu lateral montar — ver a seção acima |
| `fillHeight` | boolean | `false` | O shell obedece a altura do **pai** (`h-full`) em vez de 100vh. **Ligue quando embutir o shell em algo com altura** (layout com footer, aba, preview): sem isso ele transborda e o `overflow-hidden` do container corta o rodapé do body junto com o padding — o sintoma é "conteúdo colado na borda", e não é falta de padding. ⚠️ exige pai com altura |
| `contexts` | SidebarContext[] | — | Lista de workspaces no rail (**só** com `sidebar="menu"`) |
| `categories` | SingleMenuCategory[] | — | Categorias do menu (**só** com `sidebar="single"`) |
| `sidebarLogo` | ReactNode | **marca iGreen** | Logo do header da sidebar single. **Omita** pra ficar com a marca — só passe se o app tem marca própria |
| `sidebarTitle` | string | — | **Nome do projeto**, à direita da logo. Obrigatória de propósito: é o que o DS não adivinha |
| `activeItemId` | string | — | Item ativo da single (a variante `menu` usa `activeItemHref`) |
| `onSidebarItemClick` | (id: string) => void | — | Clique em item da single |
| `sidebarModules` | SingleMenuModuleConfig[] | — | Módulos com menu próprio — o seletor troca o conjunto de categorias |
| `sidebarShowSearch` | boolean | — | Busca no topo da sidebar (é um botão que abre command palette, não um input) |
| `sidebarSearchPlaceholder` | string | — | Placeholder da busca **da sidebar** — distinto do `searchPlaceholder`, que é do Header |
| `defaultActiveContextId` | string | primeiro do array | Workspace inicial (uncontrolled) |
| `activeContextId` | string | — | Workspace ativo (controlled) |
| `onContextChange` | (id: string) => void | — | Callback de troca de workspace |
| `defaultActiveItemHref` | string | — | Item do panel ativo inicial (uncontrolled) |
| `activeItemHref` | string | — | Item do panel ativo (controlled) |
| `onItemClick` | (item, event?) => void | — | Clique em item do panel. **2º arg é o `MouseEvent`** |
| `renderLink` | (props) => ReactNode | — | ⭐ **Integração com router** — troca o `<a>` interno pelo `<Link>`. Ver `MenuSidebar/USAGE.md` §Integração com router |
| `brandHref` | string | `"/"` | Destino do brand no rail; `""` torna não-navegável |
| `onBrandClick` | (e) => void | — | Clique no brand |
| `breadcrumb` | HeaderBreadcrumbItem[] | — | Caminho atual exibido no Header |
| `commandGroups` | HeaderCommandGroup[] | — | Command palette (⌘K) |
| `notifications` | { items, onMarkAllRead, onViewAll } | — | Dropdown de notificações |
| `messages` | { items, onNewMessage, onExpand, onViewAll } | — | Dropdown de mensagens |
| `theme` | string | — | Tema atual (light/dark) |
| `onThemeChange` | (id: string) => void | — | Callback de troca de tema |
| `themeOptions` | HeaderThemeOption[] | — | Opções de tema disponíveis |
| `headerRightSlot` | ReactNode | — | Slot extra no canto direito do Header |
| `user` | AppShellUser | — | Avatar + user menu no rail bottom |
| `layout` | string ("fluid" \| "compact") | comportamento "fluid" | Densidade do body (qualquer valor ≠ "compact" cai em fluid) |
| `onLayoutChange` | (id: string) => void | — | Callback do switcher Fluido/Compacto do user menu |
| `layoutOptions` | AppShellLayoutOption[] | — | Opções do switcher de layout |
| `onSettings` | () => void | — | Ação "Configurações" do user menu (item escondido se omitido) |
| `onLogout` | () => void | — | Ação "Sair" do user menu (item escondido se omitido) |
| `menuCollapsed` | boolean | — | Sidebar colapsado (controlled) |
| `defaultMenuCollapsed` | boolean | **responsivo** | Estado inicial do collapse (uncontrolled). Omitido: colapsado `<1536px`, expandido acima. Valor explícito vence — inclusive `false`. Só no mount, resize não re-colapsa |
| `onMenuCollapseChange` | (collapsed: boolean) => void | — | Callback no toggle do collapse (persistir entre sessões) |

## Exemplo mínimo
```tsx
<AppShell
  contexts={APP_SHELL_CONTEXTS}
  defaultActiveContextId="inbox"
  breadcrumb={[{ label: "Clientes" }]}
  theme={theme}
  onThemeChange={setTheme}
>
  <YourPageContent />
</AppShell>
```

## Cuidados / Gotchas
- Body interno tem `gap-gp-4xl` (24px) fixo e padding **responsivo em 3 patamares**: 18px `<768`, **24px `768–1535` (notebook)**, 32px `≥1536`. Customize spacing dentro do `children`, não aqui
- `contexts` mínimo 1; sem isso o rail fica vazio
- Mobile: `mobileEdgeToEdge` remove padding do body
- User menu (layout + tema + settings + logout) só renderiza quando `user` é passado; sem ele o rail mantém o avatar default
- `layout` é controlled-only: sem `onLayoutChange` o switcher Fluido/Compacto do user menu não tem efeito — guarde o valor em state e devolva via `layout`
- Pra navegação real, use `activeItemHref` + `onItemClick` (controlled) ligados ao router — os `default*` servem só pro modo uncontrolled/preview
- ⚠️ **Com react-router (ou qualquer router de history), passe `renderLink`**: `renderLink={(p) => <Link {...p} to={p.href} />}`. Sem isso, `href` de path fazia o browser recarregar a página inteira a cada clique de menu — bug real reportado em 2026-08-08, corrigido na v0.38.0. Detalhe e as 5 exceções em `MenuSidebar/USAGE.md` §Integração com router
