# Header — USAGE

Barra superior fixa (60px) com breadcrumb à esquerda + search/theme/notifications/messages/user à direita.

## Quando usar
- Topo de qualquer página dentro de `<AppShell>`
- Standalone (raro): pages que não usam AppShell mas precisam de chrome consistente

## Import
```tsx
import { Header } from "@/components/ui/Header";
```

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `breadcrumb` | `{ label, href? }[]` | Array de items (último = current) |
| `onMenuToggle` | () => void | Botão de collapse do MenuSidebar |
| `searchPlaceholder` | string | Texto do fake-input de busca |
| `onSearchClick` | () => void | Abre command palette ou modal de search |
| `theme` | string | Tema ativo |
| `themeOptions` | ThemeOption[] | Lista de temas pro dropdown |
| `onThemeChange` | (id: string) => void | Callback |
| `notifications` | { items, onMarkAllRead, onViewAll } | Dropdown sino |
| `messages` | { items, onNewMessage, onExpand, onViewAll } | Dropdown chat |

## Exemplo mínimo
```tsx
<Header
  breadcrumb={[{ label: "Clientes" }, { label: "Maria Silva" }]}
  searchPlaceholder="Buscar..."
  theme={theme}
  onThemeChange={setTheme}
  themeOptions={APP_SHELL_THEME_OPTIONS}
  notifications={{ items: notifs, onMarkAllRead, onViewAll }}
/>
```

## Cuidados / Gotchas
- Position é responsabilidade do consumer/template (Header só define altura + layout)
- Breadcrumb único com `current: true` aplica variant `standalone` (15px em vez de 13px)
- Search é fake-input (visual) — `onSearchClick` deve abrir palette/modal real
- Badge dot no icon button: `kind="brand"` (mensagens) vs `kind="danger"` (alertas)
