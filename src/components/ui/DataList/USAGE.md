# DataList — USAGE

**O que é:** componente **inteligente** sobre o `List` (como `DataTable` é sobre o
`Table`). Toolbar enxuta + busca + filtros + saved-views + persistência + seleção/
bulk + server/async + virtualização + lazy-load. _Categoria: List Components._

**Quando usar:** lista de cards que precisa de busca/filtro/views/seleção. Para
cards "crus" sem toolbar, use `List`. Para tabela densa, `DataTable`.

## Toolbar (enxuta — sem colunas)
Visões (ou `title`) · refresh · search · filtro · `⋯`. **Não tem** toggle de visão
nem menu de configurações de colunas (é cards, não tabela). Reusa o `<TableToolbar>`
(dumb): as **visões viram abas** (1ª aba = `title`/"Todos", igual à DataTable) e os
filtros aplicados aparecem como **chips** (`<ToolbarApplied>`) abaixo da toolbar —
o drawer de filtro é o MESMO `<ToolbarSimpleFilterDrawer>` da tabela.

## Exemplo
```tsx
<DataList
  title="Membros"
  items={people}
  searchable
  filterFields={[
    { id: "role", label: "Papel", type: "select", accessor: (i) => i.data.role,
      options: [{ label: "Admin", value: "admin" }, { label: "Editor", value: "editor" }] },
    { id: "status", label: "Status", type: "select", accessor: (i) => i.data.status,
      options: [{ label: "Ativo", value: "active" }, { label: "Pendente", value: "pending" }] },
  ]}
  views={[{ id: "admins", label: "Admins", query: { search: "", filterModel: { logicOperator: "AND", items: [{ id: "v1", field: "role", operator: "equals", value: "admin" }] } } }]}
  selectable
  bulkActions={[{ label: "Arquivar", onClick: (ids) => archive(ids) }]}
  onRefresh={refetch}
  persistKey="members"
/>
```

## Props essenciais
| Prop | Nota |
|---|---|
| `items` / `layout` / `groups` | repassados ao `List` (layout é fixo, não troca na toolbar) |
| `title` · `searchable` · `filterFields` · `views` · `onRefresh` · `moreActions` | toolbar |
| `filterFields` | `{ id, label, accessor, type: text/select/boolean/number/date, options? }` |
| `mode` `"client"`/`"server"` + `onQueryChange` · `loading` · `total` | dados server/async |
| `onLoadMore` + `hasMore` + `loadingMore` | infinite scroll (sentinel IntersectionObserver + cards skeleton) — **não virtualizado** |
| `virtualized` (+ `estimateItemSize`) | listas grandes — **só layout standard** |
| `onLoadChildren(id)` | lazy-load de filhos (hierarchical) |
| `defaultExpandedIds` | `Set<string>` — nós abertos no mount (hierarchical/grouped) |
| `selectable` + `onSelectionChange` + `bulkActions` | seleção + bulk bar |
| `enableDnD` + `onReorder`/`onMove` | DnD (passa pro List) |
| `persistKey` | persiste a query (search+filtros) em localStorage |

## Gotchas
- **`virtualized` desliga o DnD** (mutuamente exclusivos: o `@hello-pangea/dnd` precisa
  de todos os cards montados; a virtualização desmonta os fora da viewport). Virtualização
  só no layout `standard`.
- **Modo server:** o DataList NÃO filtra localmente — emite `onQueryChange({search, filters})`
  (debounce no search) e renderiza o que vier em `items` (use `loading`/`total`).
- **Filtros por campos** (não colunas): o consumer declara `filterFields`. Busca textual
  cobre title/subtitle/description + accessors dos campos.
- **Infinite scroll** (`onLoadMore`/`hasMore`/`loadingMore`): o consumer controla os `items`
  (append da próxima página) — o DataList só dispara `onLoadMore` quando o sentinel entra na
  viewport (rootMargin 200px) e mostra skeletons enquanto `loadingMore`. Incompatível com
  `virtualized` (use um, não os dois).
- A doc viva é o showcase `#/data-list`.
