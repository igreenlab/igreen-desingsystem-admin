# MenuSidebar — USAGE

Sidebar composto: rail 64px (ícones de contexts) + panel 264px (items do context ativo, colapsável).

## Quando usar
- Navegação primária de app multi-context (Inbox, Clientes, Configurações, etc)
- Dentro de `<AppShell>` (template canônico) ou standalone em apps custom

## Import
```tsx
import { MenuSidebar } from "@/components/ui/MenuSidebar";
```

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `contexts` | SidebarContext[] | Lista de workspaces (rail) — `{ id, label, icon, items, sections? }` |
| `activeContextId` | string | Context ativo (controlled) |
| `defaultActiveContextId` | string | Context inicial (uncontrolled) |
| `onContextChange` | (id: string) => void | Callback de troca de context |
| `activeItemHref` | string | Item ativo no panel (controlled, match por href) |
| `defaultActiveItemHref` | string | Item ativo inicial (uncontrolled) |
| `onItemClick` | (item, event?) => void | Callback ao clicar em item do panel. **O 2º arg é o `MouseEvent`** — use pra `preventDefault()` se você roteia na mão |
| `renderLink` | (props) => ReactNode | ⭐ **Integração com router** — substitui o `<a>` interno pelo `<Link>` do seu router. Ver a seção abaixo |
| `brandHref` | string | Destino do brand no rail. Default `"/"`; `""` torna não-navegável (vira `<button>`) |
| `onBrandClick` | (e) => void | Clique no brand |
| `panelCollapsed` | boolean | Panel colapsado — só rail visível (controlled) |
| `defaultPanelCollapsed` | boolean | Panel colapsado inicial (uncontrolled) |
| `onPanelCollapseChange` | (collapsed: boolean) => void | Callback do collapse |
| `expandOnHover` | boolean (default `true`) | Com panel colapsado, hover abre o panel como overlay absoluto (não empurra conteúdo) |
| `mobileOpen` | boolean | Drawer mobile aberto (controlled) |
| `defaultMobileOpen` | boolean (default `false`) | Drawer mobile inicial (uncontrolled) |
| `onMobileOpenChange` | (open: boolean) => void | Callback do drawer mobile |
| `mobileBreakpoint` | string (default `"(max-width: 767px)"`) | Media query que ativa o modo mobile (matchMedia) |
| `brand` | ReactNode | Logo/avatar no topo do rail |
| `user` | ReactNode | Avatar+menu no bottom do rail |

## Exemplo mínimo
```tsx
<MenuSidebar
  contexts={MOCK_CONTEXTS}
  defaultActiveContextId="inbox"
  defaultActiveItemHref="#chat"
  brand={<Logo />}
  user={<UserMenu user={currentUser} />}
/>
```

## 🧭 Integração com router — LEIA se seu app tem rotas

O sidebar renderiza `<a href={item.href}>`. Sem integração, clicar num item com `href` de
**path** (`/app/clientes`) faz o browser **recarregar a página inteira** — foi um bug real,
reportado por consumidor em 2026-08-08 e corrigido na v0.38.0.

### Recomendado: `renderLink`

```tsx
import { Link } from "react-router-dom";

<MenuSidebar
  contexts={contexts}
  renderLink={(p) => <Link {...p} to={p.href} />}
/>
```

| Router | `renderLink` |
|---|---|
| **react-router** | `(p) => <Link {...p} to={p.href} />` |
| **Next.js** | `(p) => <Link {...p} />` (já usa `href`) |
| **TanStack Router** | `(p) => <Link {...p} to={p.href} />` |

Com `renderLink`, o sidebar **não** mexe em `preventDefault` — quem decide é o `<Link>`.
Você ganha navegação client-side **e** mantém ctrl/cmd+clique pra abrir em nova aba.

> ⚠️ **É render-prop, não `linkComponent`.** Um prop que recebe *tipo de componente* e é
> escrito inline cria um tipo novo a cada render, e o React desmonta/remonta a subárvore —
> perde foco, reinicia animação, e o sintoma parece aleatório. Render-prop inline é seguro.

### Alternativa: `onItemClick` + `navigate()`

Se preferir rotear na mão, funciona sem `renderLink` — o sidebar cancela a navegação
nativa automaticamente quando você passa `onItemClick`:

```tsx
const navigate = useNavigate();
<MenuSidebar contexts={contexts} onItemClick={(item) => item.href && navigate(item.href)} />
```

O 2º argumento é o evento, se você precisar dele: `onItemClick={(item, e) => { … }}`.

### O que o cancelamento automático NÃO faz (de propósito)

Ele **nunca** cancela nestes 5 casos, e cada um quebraria algo real:

| Caso | Por que não cancela |
|---|---|
| ctrl/cmd/shift/alt ou botão do meio | é como o usuário abre em nova aba |
| `target: "_blank"` no item | o item pediu outra aba |
| `href` externo (`https:`, `mailto:`, `tel:`, `//host`) | não é rota do app; cancelar deixa o link morto |
| **`href` de hash (`#/rota`)** | hash router escuta `hashchange`; cancelar impede o fragmento de mudar e o evento **nunca dispara** |
| sem `onItemClick` nem `item.onClick` | ninguém trataria — o `<a>` é a navegação pretendida |

A regra vive em **`@/utils/nav-link`** e é exportada (`shouldPreventNavigation`,
`isExternalHref`, `isHashHref`, `isModifiedClick`) pra quem compõe com `<SidebarItem>`
avulso — reimplementar na unha é como o bug volta.

> ⚠️ **Mudou de lugar em 2026-08-18**: era `MenuSidebar/nav-link.ts`, virou
> `src/utils/nav-link.ts`. O `SingleMenuSidebar` passou a precisar da MESMA regra, e as
> alternativas eram piores: duplicar cria duas cópias divergindo, e importar do MenuSidebar
> faria o `single-menu-sidebar` depender do item de registry do MenuSidebar **inteiro** por
> 60 linhas puras. Agora é util compartilhada, embutida como `registry:file` nos dois itens
> — mesmo padrão do `@/utils/color-contrast`.
>
> **O re-export por `@/components/ui/MenuSidebar` continua valendo**, então quem importava
> daqui não muda nada. Só quem fazia deep-import do arquivo (`.../MenuSidebar/nav-link`)
> precisa apontar pro caminho novo.

> **Por que passou meses invisível:** o exemplo canônico
> (`src/examples/app-shell/nav-data.ts`) usa `href` de **hash** em todos os itens, e hash
> não recarrega documento. Showcase verde, consumidor quebrado.

## Cuidados / Gotchas
- `w-fit` no root é crítico — sem isso o hover-to-expand dispararia em qualquer lugar do parent
- Mobile é auto-detectado via `mobileBreakpoint` (matchMedia) — NÃO existe prop `mobile`. Vira drawer fixed overlay (translate-x lateral); backdrop scrim e botão de fechar (X) são renderizados automaticamente pelo próprio MenuSidebar. Consumer só controla `mobileOpen` (ex: hamburger no header)
- `floating` NÃO é prop pública do MenuSidebar — é prop interna de `<SidebarPanel>` (composição manual). No all-in-one, o overlay flutuante é gerenciado por `expandOnHover` + panel colapsado
- Items hierárquicos: `items: [{ name, href, subitems: [...] }]` — subitems renderizam indentados; `defaultOpen` define o estado inicial do grupo
- Context pode ter `sections?: SidebarSection[]` (variants `bookmark` | `chat`) renderizadas abaixo dos items do panel
- Bookmark item aceita `icon?` opcional: presente → ícone colorido (tingido com `color`, sem fundo; estilo atalho, ex.: ferramentas/integrações); ausente → dot redondo. `color` vale pra ambos. `onAdd?` na section renderiza o botão "+" no header (ex.: abrir catálogo)
