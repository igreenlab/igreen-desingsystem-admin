# SingleMenuSidebar

**O que é** — Sidebar de navegação de **nível único**: categoria → sub-itens em
accordion (1 aberto por vez). Categoria sem `items` é link simples.
**Categoria**: Templates / App-level (mesma família de `MenuSidebar`, `Header`, `AppShell`).

**Quando usar** — App com navegação plana, sem múltiplos contextos/rail. É a
alternativa **enxuta** ao `MenuSidebar` (que tem rail + painel + sections +
badges). Sem variantes — escolha o componente pela necessidade, não por props.
Precisa de rail + contextos + bookmarks/chats? → use `MenuSidebar`.

## Props essenciais

| Prop                                           | Tipo                   | Default | Obrigatório |
| ---------------------------------------------- | ---------------------- | ------- | ----------- |
| `logo`                                         | `ReactNode`            | —       | ✅          |
| `title`                                        | `string`               | —       | ✅          |
| `categories`                                   | `SingleMenuCategory[]` | —       | ✅          |
| `user`                                         | `SingleMenuUser`       | —       | ✅          |
| `module`                                       | `SingleMenuModule`     | —       |             |
| `showSearch`                                   | `boolean`              | `true`  |             |
| `searchValue` / `onSearchChange` / `searchRef` | busca controlada       | —       |             |
| `activeItemId`                                 | `string`               | —       |             |
| `onItemClick`                                  | `(id: string) => void` | —       |             |
| `defaultExpanded`                              | `boolean`              | `true`  |             |
| `expanded` / `onExpandedChange`                | toggle controlado      | —       |             |
| `showToggleIndicator`                          | `boolean`              | `false` |             |

## Data model

```ts
SingleMenuCategory  = { id, icon, label, href?, items?, active? }
SingleMenuSubItem   = { id, label, href? }
SingleMenuModule    = { icon, title, subtitle, options?, onModuleChange? }
SingleMenuUser      = { name, email, avatar?, actions?, onAction? }
SingleMenuUserAction= { id, label, icon?, variant?: "default" | "destructive" }
```

## Exemplo mínimo

```tsx
import { SingleMenuSidebar } from "@/components/ui/SingleMenuSidebar";

<SingleMenuSidebar
  logo={<Logo />}
  title="Sólis iGreen"
  module={{
    icon: <Zap />,
    title: "Créditos",
    subtitle: "MÓDULO ATIVO",
    options,
  }}
  categories={[
    { id: "dashboard", icon: <LayoutGrid />, label: "Dashboard", active: true },
    {
      id: "instalacoes",
      icon: <Zap />,
      label: "Instalações",
      items: [
        { id: "contratos", label: "Contratos" },
        { id: "vistorias", label: "Vistorias" },
      ],
    },
  ]}
  user={{ name: "Sérgio", email: "sergio@igreen.com.br", actions }}
  activeItemId={activeItemId}
  onItemClick={setActiveItemId}
/>;
```

## Comportamentos

- **Accordion** — apenas 1 categoria aberta por vez. Definir `activeItemId` abre
  automaticamente a categoria que contém o item.
- **Toggle** — botão no header trava/destrava o estado expandido.
- **Hover-to-expand** — recolhida, o hover sobre a sidebar a expande
  temporariamente; sai o mouse, recolhe (~200ms). Categorias mostram tooltip.
- **Controlado/não-controlado** — `expanded` + `onExpandedChange` (controlado) ou
  `defaultExpanded` (não-controlado).

## Gotchas

- **Sem variantes (por design).** Não há `variant`/`size`. Mudança visual = editar
  `single-menu-sidebar.styles.ts`. Outra forma de navegação = outro componente.
- **Dá altura ao container.** O `<aside>` é `h-full` — o pai precisa ter altura
  (ex.: `h-[680px]` ou `flex-1 min-h-0` num pai `h-full`).
- **`logo` e `avatar` são ReactNode** — você controla o tamanho. O slot do logo é
  `size-[38px]`; passe um ícone/elemento que caiba.
- **Cores 100% via tokens DS.** Estado ativo = `fg-brand` + `bg-surface`; rodapé/
  hover = `bg-sidebar-accent`. Não usa palette própria `sidebar-*`.
- **`<TooltipProvider>` embutido** — o componente já envolve a árvore; não precisa
  de provider externo só pra ele.
