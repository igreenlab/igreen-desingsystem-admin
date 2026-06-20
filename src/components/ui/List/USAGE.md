# List — USAGE

**O que é:** primitivo de listagem em **cards** (cada row é um card). _Categoria: Data display._
Burro como o `Table` — a versão com toolbar/busca/filtros/server (`DataList`) é o passo 2.

**Quando usar:** listas de entidades em formato card, com 3 layouts:
- `standard` — lista plana.
- `grouped` — seções por status/seção + **drag-and-drop** (entre grupos e reorder dentro).
- `hierarchical` — árvore-como-lista colapsável com **linhas de conexão** (org, treeview).

Para tabela densa use `Table`/`DataTable`; para colunas horizontais use `Kanban`.

## Conteúdo do card
Slots (`ListItemData`): `leading` (avatar/ícone), `title`, `subtitle`, `description`,
`meta` (colunas alinhadas tipo Role/Status), `trailing` (valor/badge). Para card rico,
`renderItem(item, state)` substitui só o miolo — o wrapper (card, selected/open, handle,
checkbox, indent, conectores) é sempre do List.

## Exemplos mínimos
```tsx
// standard
<List items={team} onItemClick={open} getMenuItems={(i) => [{ label: "Editar", onClick }]} />

// grouped + DnD (consumer commita no onMove)
<List layout="grouped" items={tasks} groups={groups} enableDnD
      onMove={(id, from, to, toIndex) => commit(id, to, toIndex)} />

// hierarchical (children aninhados)
<List layout="hierarchical" items={org} defaultExpandedIds={new Set(["acme"])} />
```

## Props essenciais
| Prop | Nota |
|---|---|
| `layout` | `standard` (default) · `grouped` · `hierarchical` |
| `items` | `ListItemData[]`; na hierarquia, aninhe via `children` |
| `groups` | `ListGroup[]` (layout grouped) |
| `renderItem` | override do miolo do card |
| `getMenuItems` | kebab `⋯` por item |
| `selectable` + `selectedIds`/`defaultSelectedIds`/`onSelectionChange` | seleção (controlado/não-controlado) |
| `expandedIds`/`defaultExpandedIds`/`onExpandedChange` | colapso de grupos/hierarquia |
| `enableDnD` + `onReorder`(standard)/`onMove`(grouped) | drag-and-drop |
| `showConnectors` / `indentSize` | conectores / indent px (hierárquico) |
| `loading`/`skeletonCount` · `emptyState` · `density` | estados / densidade |

## Gotchas
- **DnD via `@hello-pangea/dnd`** (física natural de lista — displacement suave +
  placeholder que abre espaço). Burro: o List emite `onMove(id, from, to, toIndex)`
  (grouped) / `onReorder(id, toIndex)` (standard) e **o consumer commita** o estado.
  `toIndex` é o `destination.index` do hello-pangea (índice final no grupo destino).
- `groupSurface` envolve cada grupo num painel sutil ("card fino") pra diferenciar da
  superfície. Realce da área de destino (`isDraggingOver`) e elevação do card em
  arrasto (`isDragging`) são automáticos.
- **Grupos abrem por padrão**; hierarquia **colapsa** por padrão (semeie `defaultExpandedIds`).
- Hierarquia: a fonte canônica é a **árvore aninhada** (`children`), não `parentId`.
  Hierárquico **não** tem DnD no v1.
- `meta` (colunas) é escondido em telas estreitas (`hidden md:flex`) — use `trailing`/
  `subtitle` para info crítica em mobile.
- Dep extra: `@hello-pangea/dnd` (List); o Kanban usa `@dnd-kit` — DnD libs distintas
  por componente, por design (lista vertical favorece o hello-pangea).
