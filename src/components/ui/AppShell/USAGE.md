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
| `contexts` | SidebarContext[] | — | Lista de workspaces no rail |
| `defaultActiveContextId` | string | primeiro do array | Workspace inicial (uncontrolled) |
| `activeContextId` | string | — | Workspace ativo (controlled) |
| `onContextChange` | (id: string) => void | — | Callback de troca de workspace |
| `defaultActiveItemHref` | string | — | Item do panel ativo inicial (uncontrolled) |
| `activeItemHref` | string | — | Item do panel ativo (controlled) |
| `onItemClick` | (item: SidebarMenuItem) => void | — | Clique em item do panel — ponto de integração com o router |
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
| `defaultMenuCollapsed` | boolean | false | Estado inicial do collapse (uncontrolled) |
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
- Body interno tem `gap-gp-4xl` + `p-pad-6xl` (24+32px) fixos — customize spacing dentro do `children`
- `contexts` mínimo 1; sem isso o rail fica vazio
- Mobile: `mobileEdgeToEdge` remove padding do body
- User menu (layout + tema + settings + logout) só renderiza quando `user` é passado; sem ele o rail mantém o avatar default
- `layout` é controlled-only: sem `onLayoutChange` o switcher Fluido/Compacto do user menu não tem efeito — guarde o valor em state e devolva via `layout`
- Pra navegação real, use `activeItemHref` + `onItemClick` (controlled) ligados ao router — os `default*` servem só pro modo uncontrolled/preview
