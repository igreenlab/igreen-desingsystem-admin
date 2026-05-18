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
| `contexts` | Context[] | Lista de workspaces (rail) — `{ id, label, icon, items }` |
| `activeContextId` | string | Context ativo (controlled) |
| `defaultActiveContextId` | string | Context inicial (uncontrolled) |
| `activeItemHref` | string | Item ativo no panel |
| `onContextChange` | (id: string) => void | Callback |
| `collapsed` | boolean | Panel oculto (só rail visível) |
| `floating` | boolean | Panel flutua sobre conteúdo (não empurra) |
| `mobile` | boolean | Vira drawer fixed bottom-up |
| `mobileOpen` | boolean | Drawer aberto |
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
- Mobile: vira drawer overlay (translate-x) — backdrop separado via `<SidebarMobileBackdrop>`
- `floating=true` faz panel `absolute` — útil pra hover-to-expand sem reflow
- Items hierárquicos: `items: [{ label, href, children: [...] }]` — subitems renderizam indentados
