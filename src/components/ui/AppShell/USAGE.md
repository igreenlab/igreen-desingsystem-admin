# AppShell — USAGE

Template de aplicação completo: MenuSidebar (rail + panel) + Header sticky + body com slot livre.

## Quando usar
- Páginas full-app (Showcases, CRUD, Chat, Dashboard)
- Quando precisar de contexts (workspace switcher) + breadcrumb + user menu unificados

## Import
```tsx
import { AppShell } from "@/components/ui/AppShell";
```

## Props essenciais
| Prop | Tipo | Default | Função |
|---|---|---|---|
| `contexts` | Context[] | — | Lista de workspaces no rail |
| `defaultActiveContextId` | string | — | Workspace inicial |
| `defaultActiveItemHref` | string | — | Item do panel ativo inicial |
| `breadcrumb` | { label }[] | — | Caminho atual exibido no Header |
| `commandGroups` | Group[] | — | Command palette (⌘K) |
| `notifications` | { items, onMarkAllRead, onViewAll } | — | Dropdown de notificações |
| `messages` | { items, onNewMessage, onExpand, onViewAll } | — | Dropdown de mensagens |
| `theme` | string | — | Tema atual (light/dark) |
| `onThemeChange` | (id: string) => void | — | Callback de troca de tema |
| `themeOptions` | ThemeOption[] | — | Opções de tema disponíveis |
| `user` | User | — | Avatar + nome no rail bottom |
| `onLogout` | () => void | — | Ação do logout |
| `layout` | "fluid" \| "compact" | "fluid" | Densidade |

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
- Body interno tem `gap-gp-4xl` + `p-pad-6xl` (24+32px) fixos — customize spacing dentro do `children`
- `contexts` mínimo 1; sem isso o rail fica vazio
- Mobile: `mobileEdgeToEdge` remove padding do body
