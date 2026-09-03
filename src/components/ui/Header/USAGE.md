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
| `breadcrumb` | `HeaderBreadcrumbItem[]` | Array de items (último = página atual, nunca link). Ver a forma completa abaixo |
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

### `HeaderBreadcrumbItem` — a forma completa

```ts
{
  label: string;
  href?: string;              // vira link; o ÚLTIMO item nunca é link
  onClick?: (e) => void;

  // Vira SELETOR de registro. Precisa dos TRÊS juntos; faltando um, o item
  // renderiza como texto — gatilho que abre lista vazia é pior que texto.
  switcher?: BreadcrumbSwitcherOption[];
  value?: string;
  onValueChange?: (v: string) => void;
  switcherTitle?: ReactNode;
  switcherSearchPlaceholder?: string;
  switcherFooter?: ReactNode;

  // Conteúdo livre DEPOIS do rótulo, no mesmo item.
  trailing?: ReactNode;
}
```

**`trailing`** aceita qualquer nó — o caso de origem foi um chip de status ao lado
do nome do registro aberto (`Clientes / Maria Silva [Ativo]`), mas o slot não sabe
disso. É a única forma de pôr algo ali neste modo: quem monta o `<li>` é o
componente, então não há onde escrever um irmão na mão.

⚠️ Ele é **irmão** do gatilho do seletor, não filho — é o que permite conteúdo
interativo (`<button>` dentro de `<button>` é HTML inválido). Consequência: clicar
no `trailing` **não** abre a lista do seletor.

```tsx
<Header
  breadcrumb={[
    { label: "Clientes", href: "/clientes" },
    {
      label: cliente.nome,
      switcher: CLIENTES, value: id, onValueChange: abrirCliente,
      trailing: <Chip size="sm" variant="soft" color={cliente.statusCor}>{cliente.status}</Chip>,
    },
  ]}
/>
```

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
