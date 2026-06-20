# DataList — USAGE

**O que é:** componente **inteligente** sobre o `List` (como `DataTable` é sobre o
`Table`). Toolbar enxuta + busca + filtros + saved-views + persistência + seleção/
bulk + server/async + virtualização + lazy-load. _Categoria: List Components._

**Quando usar:** lista de cards que precisa de busca/filtro/views/seleção. Para
cards "crus" sem toolbar, use `List`. Para tabela densa, `DataTable`.

## Toolbar (enxuta — sem colunas)
Visões (ou `title`) · refresh · search · filtro · `⋯`. **Não tem** toggle de visão
nem menu de configurações de colunas (é cards, não tabela).

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
  views={[{ id: "admins", label: "Admins", query: { search: "", filters: [{ fieldId: "role", value: "admin" }] } }]}
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
| `virtualized` (+ `estimateItemSize`) | listas grandes — **só layout standard** |
| `onLoadChildren(id)` | lazy-load de filhos (hierarchical) |
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
- A doc viva é o showcase `#/data-list`.
