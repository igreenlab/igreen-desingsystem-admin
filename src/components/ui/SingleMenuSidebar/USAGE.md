# SingleMenuSidebar

**O que é** — Sidebar de navegação de **nível único**: categoria → sub-itens em
accordion (1 aberto por vez). Categoria sem `items` é link simples.
**Categoria**: Templates / App-level (mesma família de `MenuSidebar`, `Header`, `AppShell`).

**Quando usar** — App com navegação plana, sem múltiplos contextos/rail. É a
alternativa **enxuta** ao `MenuSidebar` (que tem rail + painel + sections +
badges). Sem variantes — escolha o componente pela necessidade, não por props.
Precisa de rail + contextos + bookmarks/chats? → use `MenuSidebar`.

## Props essenciais

| Prop                            | Tipo                          | Default | Obrigatório |
| ------------------------------- | ----------------------------- | ------- | ----------- |
| `logo`                          | `ReactNode`                   | —       | ✅          |
| `title`                         | `string`                      | —       | ✅          |
| `user`                          | `SingleMenuUser`              | —       | ✅          |
| `categories`                    | `SingleMenuCategory[]`        | —       | opcional se usar `modules` |
| `modules`                       | `SingleMenuModuleConfig[]`    | —       |             |
| `activeModuleId` / `defaultModuleId` / `onModuleChange` | multi-módulo (controlado / inicial / callback) | — | |
| `module`                        | `SingleMenuModule`            | —       | **ignorado se `modules`** |
| `showSearch`                    | `boolean`                     | `true`  |             |
| `searchCommand`                 | `ReactNode`                   | —       |             |
| `searchPlaceholder`             | `string`                      | —       |             |
| `activeItemId`                  | `string`                      | —       |             |
| `onItemClick`                   | `(id: string) => void`        | —       |             |
| `defaultExpanded`               | `boolean`                     | `true`  |             |
| `expanded` / `onExpandedChange` | toggle controlado             | —       |             |
| `showToggleIndicator`           | `boolean`                     | `false` |             |

⚠️ **A busca NÃO é input controlado.** `searchValue`/`onSearchChange`/`searchRef` **não
existem** nesta API (estavam documentados aqui e nunca foram props do componente). A busca
abre um `CommandDialog`: você passa o **conteúdo** dele em `searchCommand` e, se quiser, o
texto do placeholder em `searchPlaceholder`. As props `value`/`onChange`/`inputRef` existem
em `SingleMenuSearchProps`, que é subcomponente interno.

### Multi-módulo

`modules` é a API pra sidebar que troca de contexto: cada `SingleMenuModuleConfig` traz suas
próprias `categories`, e trocar de módulo **sobrepõe** as categorias exibidas. Quando
`modules` é passado, `module` (singular) é ignorado e `categories` no nível raiz vira
opcional.

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
- **Seleção única** — sempre 1 item marcado: folha ativa OU pai aberto (abrir um
  pai o marca e suprime a folha) OU pai que contém o sub-item ativo. Clicar numa
  folha fecha o pai aberto e assume a marca.
- **Toggle** — botão no header trava/destrava o estado expandido. Após recolher
  manualmente, o hover-expand fica suprimido ~500ms (não "pisca" com o mouse por cima).
- **Hover-to-expand** — recolhida, o hover sobre a sidebar a expande
  temporariamente; sai o mouse, recolhe (~200ms). Categorias mostram tooltip.
- **Controlado/não-controlado** — `expanded` + `onExpandedChange` (controlado) ou
  `defaultExpanded` (não-controlado).
- **Responsivo (mobile)** — abaixo de `md` (768px) a sidebar ocupa **100% da
  largura** (pronta pra drawer); no desktop mantém a largura fixa (280px/80px). A
  sidebar é **dumb**: exibir/ocultar no mobile é responsabilidade do consumidor
  (um toggle/drawer controlado pelo seu app — veja o exemplo "Responsivo (mobile)").

## Gotchas

- **Sem variantes (por design).** Não há `variant`/`size`. Mudança visual = editar
  `single-menu-sidebar.styles.ts`. Outra forma de navegação = outro componente.
- **Dá altura ao container.** O `<aside>` é `h-full` — o pai precisa ter altura
  (ex.: `h-[680px]` ou `flex-1 min-h-0` num pai `h-full`).
- **`logo` e `avatar` são ReactNode** — você controla o tamanho; o slot do logo só
  faz `shrink-0`. Passe um elemento já dimensionado (ex.: caixa `size-form-lg`).
- **Cores 100% via tokens DS.** Estado marcado = `fg-brand` + `bg-sidebar-accent`;
  rodapé/hover = `bg-sidebar-accent`. Não usa palette própria `sidebar-*`.
- **`<TooltipProvider>` embutido** — o componente já envolve a árvore; não precisa
  de provider externo só pra ele.
