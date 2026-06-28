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
| `onItemClick` | (item: SidebarMenuItem) => void | Callback ao clicar em item do panel |
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

## Cuidados / Gotchas
- `w-fit` no root é crítico — sem isso o hover-to-expand dispararia em qualquer lugar do parent
- Mobile é auto-detectado via `mobileBreakpoint` (matchMedia) — NÃO existe prop `mobile`. Vira drawer fixed overlay (translate-x lateral); backdrop scrim e botão de fechar (X) são renderizados automaticamente pelo próprio MenuSidebar. Consumer só controla `mobileOpen` (ex: hamburger no header)
- `floating` NÃO é prop pública do MenuSidebar — é prop interna de `<SidebarPanel>` (composição manual). No all-in-one, o overlay flutuante é gerenciado por `expandOnHover` + panel colapsado
- Items hierárquicos: `items: [{ name, href, subitems: [...] }]` — subitems renderizam indentados; `defaultOpen` define o estado inicial do grupo
- Context pode ter `sections?: SidebarSection[]` (variants `bookmark` | `chat`) renderizadas abaixo dos items do panel
- Bookmark item aceita `icon?` opcional: presente → ícone colorido (tingido com `color`, sem fundo; estilo atalho, ex.: ferramentas/integrações); ausente → dot redondo. `color` vale pra ambos. `onAdd?` na section renderiza o botão "+" no header (ex.: abrir catálogo)
