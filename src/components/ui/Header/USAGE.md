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
| `breadcrumb` | `HeaderBreadcrumbItem[]` (`{ label, href?, onClick? }`) | Array de items (último = página atual, nunca link) |
| `onCollapseMenu` | () => void | Botão de collapse do MenuSidebar (omitido = botão escondido) |
| `menuCollapsed` | boolean | Controla o ícone (PanelLeftClose vs PanelLeftOpen) |
| `showSearch` | boolean (default `true`) | Mostra o fake-input de busca; `false` desliga |
| `searchPlaceholder` | string | Texto do fake-input de busca |
| `commandGroups` | `HeaderCommandGroup[]` | Comandos do Command palette interno — sem isso o palette abre vazio |
| `theme` | string | Tema ativo |
| `themeOptions` | HeaderThemeOption[] | Lista de temas pro dropdown |
| `onThemeChange` | (id: string) => void | Callback |
| `notifications` | { items, onMarkAllRead, onViewAll } | Popover sino (vira bottom-sheet no mobile via `mobileSheet`) |
| `messages` | { items, onNewMessage, onExpand, onViewAll } | Popover chat (vira bottom-sheet no mobile via `mobileSheet`) |
| `rightSlot` | ReactNode | Slot livre à direita (botões custom antes dos ícones default) |

## Exemplo mínimo
```tsx
<Header
  breadcrumb={[{ label: "Clientes" }, { label: "Maria Silva" }]}
  onCollapseMenu={() => setCollapsed((c) => !c)}
  menuCollapsed={collapsed}
  searchPlaceholder="Buscar..."
  commandGroups={[
    {
      heading: "Ações",
      items: [{ label: "Novo cliente", onSelect: () => abrirDrawer() }],
    },
  ]}
  theme={theme}
  onThemeChange={setTheme}
  themeOptions={APP_SHELL_THEME_OPTIONS}
  notifications={{ items: notifs, onMarkAllRead, onViewAll }}
/>
```

## Cuidados / Gotchas
- Position é responsabilidade do consumer/template (Header só define altura + layout)
- Breadcrumb com 1 único item renderiza automaticamente como título standalone (15px); 2+ items viram cadeia (13px). Último item nunca é link
- Search é fake-input que abre o Command palette interno (⌘K / Ctrl+K) — popular via `commandGroups`, senão o palette abre vazio
- Badge dot no icon button: `kind="brand"` (mensagens) vs `kind="danger"` (alertas)
