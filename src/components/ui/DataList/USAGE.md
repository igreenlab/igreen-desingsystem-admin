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
o drawer de filtro é o MESMO `<ToolbarSimpleFilterDrawer>` da tabela. Os **chips são
clicáveis**: abrem o fast-filter do column-type (via `columnTypeRegistry`) pra editar o
valor inline — mesma UX do DataTable (sem precisar reabrir o drawer).

## Exemplo

```tsx
<DataList
  title="Membros"
  items={people}
  searchable
  filterFields={[
    {
      id: "role",
      label: "Papel",
      type: "select",
      accessor: (i) => i.data.role,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      accessor: (i) => i.data.status,
      options: [
        { label: "Ativo", value: "active" },
        { label: "Pendente", value: "pending" },
      ],
    },
  ]}
  views={[
    {
      id: "admins",
      label: "Admins",
      query: {
        search: "",
        filterModel: {
          logicOperator: "AND",
          items: [
            { id: "v1", field: "role", operator: "equals", value: "admin" },
          ],
        },
      },
    },
  ]}
  selectable
  bulkActions={[{ label: "Arquivar", onClick: (ids) => archive(ids) }]}
  onRefresh={refetch}
  persistKey="members"
/>
```

## Props essenciais

| Prop                                                                            | Nota                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items` / `layout` / `groups`                                                   | repassados ao `List` (layout é fixo, não troca na toolbar)                                                                                                                                                              |
| `title` · `searchable` · `filterFields` · `views` · `onRefresh` · `moreActions` | toolbar                                                                                                                                                                                                                 |
| `toolbarActions`                                                                | `ToolbarAction[]` — ações custom no toolbar (`button`/`dropdown`/`input`, ex.: seletor de período). Inline no desktop (entre Filtros e ⋯); no **mobile colapsam num ⋯** junto com `moreActions`. Ver `<ToolbarActions>` |
| `filterFields`                                                                  | `{ id, label, accessor, type: text/select/boolean/number/date, options? }`                                                                                                                                              |
| `mode` `"client"`/`"server"` + `onQueryChange` · `loading` · `total`            | dados server/async                                                                                                                                                                                                      |
| `onLoadMore` + `hasMore` + `loadingMore`                                        | infinite scroll (sentinel IntersectionObserver + cards skeleton) — **não virtualizado**                                                                                                                                 |
| `virtualized` (+ `estimateItemSize`)                                            | listas grandes — **só layout standard**                                                                                                                                                                                 |
| `onLoadChildren(id)`                                                            | lazy-load de filhos (hierarchical)                                                                                                                                                                                      |
| `defaultExpandedIds`                                                            | `Set<string>` — nós abertos no mount (hierarchical/grouped)                                                                                                                                                             |
| `branchHighlight`                                                               | destaque de família (hierárquico, passa pro List): `none` · `block` (painéis) · `active` (ramo do último aberto)                                                                                                        |
| `selectable` + `onSelectionChange` + `bulkActions`                              | seleção + bulk bar                                                                                                                                                                                                      |
| `enableDnD` + `onReorder`/`onMove`                                              | DnD (passa pro List)                                                                                                                                                                                                    |
| `persistKey`                                                                    | persiste a query (search+filtros) em localStorage                                                                                                                                                                       |
| `fillHeight`                                                                    | ocupa 100% da altura do pai e faz **só a lista rolar** (toolbar/chips/bulk fixos). Dê altura ao pai + `className="flex-1 min-h-0"`. Não combinar com `virtualized`                                                      |

## Forma do `filterModel` — um item POR VALOR

Em `isAnyOf` / `isNoneOf`, a forma canônica é **um `FilterItem` por valor**, não um item
com array:

```tsx
// ✅ canônico — é o que o chip e o funil gravam
items: [
  { id: "a", field: "status", operator: "isAnyOf", value: "ativo" },
  { id: "b", field: "status", operator: "isAnyOf", value: "pausado" },
]

// ⚠️ tolerado, mas não escreva assim em preset novo
items: [{ id: "a", field: "status", operator: "isAnyOf", value: ["ativo", "pausado"] }]
```

A segunda forma **é aceita na leitura** (`vNEXT`+) — tem que ser, porque existe estado
assim salvo em `localStorage` de quem usou o componente antes, e `persistKey` não migra
nada. Mas ela **esvaziava a lista** até a `vNEXT`: o motor comparava o `value` do item
como um todo, e `["ativo","pausado"]` não casava com célula nenhuma. Com um valor só
funcionava por acidente, o que escondeu o defeito.

Um modelo na forma antiga **se migra sozinho** no primeiro toque do usuário no chip.

⚠️ `between` é a exceção: a tupla fica inteira num item só — ali o array é `[lo, hi]`, não
uma lista de valores.

## Como os filtros combinam — `field|operator`, OR dentro, AND fora (`vNEXT`+)

**O mesmo grão do `DataTable`.** Itens agrupam por **campo + operador**; dentro do grupo
combinam por **OR**, entre grupos por **AND**:

```tsx
// status é "ativo" OU "pausado"  → devolve os dois
{ field: "status", operator: "equals", value: "ativo" }
{ field: "status", operator: "equals", value: "pausado" }

// nome contém "a" E não contém "b" → operadores diferentes seguem em AND
{ field: "nome", operator: "contains",    value: "a" }
{ field: "nome", operator: "notContains", value: "b" }
```

⚠️ **Até a `vNEXT` os escalares combinavam por AND**, inclusive dentro do mesmo operador:
dois `equals` no mesmo campo pediam que uma célula fosse dois valores ao mesmo tempo e a
lista **esvaziava em silêncio** — enquanto a tabela, com o mesmo modelo, devolvia a união.
Se você contornava isso escrevendo um filtro por vez, pode parar.

Um item de operador escalar cujo `value` é um **array** vale como lista de alternativas
(OR), igual ao multi — `{ operator: "equals", value: ["ativo","pausado"] }` casa os dois.
Antes coagia pra `"ativo,pausado"` e não casava nada. `between` segue fora disso.

**O operador que você declarar no preset sobrevive ao funil** (`vNEXT`+). Campo que já tem
filtro é desenhado e reescrito com o operador DELE; só o campo vazio nasce com o default do
tipo. Antes o drawer derivava o operador do tipo nos dois lados, e mexer no valor rebaixava
um `isNoneOf` do preset pra `isAnyOf` em silêncio.

## Gotchas

- **`virtualized` desliga o DnD** (mutuamente exclusivos: o `@hello-pangea/dnd` precisa
  de todos os cards montados; a virtualização desmonta os fora da viewport). Virtualização
  só no layout `standard`.
- **Modo server:** o DataList NÃO filtra localmente — emite `onQueryChange({search, filters})`
  (debounce no search) e renderiza o que vier em `items` (use `loading`/`total`).
  ⚠️ **O que sai é só filtro COM valor** (`vNEXT`+): item sem valor nunca chega ao
  `onQueryChange`, e pôr/tirar um não dispara request repetida. Mesma regra do
  `useDataTableQuery` — "filtro incompleto não dispara nada".
- **Editar o chip e desmarcar TUDO não fecha o popover** (`vNEXT`+). O grupo fica no
  `filterModel` com **um item sem valor** enquanto o popover está aberto — ele é a âncora
  do popover, e removê-lo desmontava o chip no meio da interação. O item é inerte (não
  filtra, não vai pro servidor) e sai sozinho quando o popover fecha. Só aparece no
  `filterModel` que o `persistKey` grava, e ali também é inerte na releitura.
- **Filtros por campos** (não colunas): o consumer declara `filterFields`. Busca textual
  cobre title/subtitle/description + accessors dos campos.
- **Tipo de coluna CUSTOM no filtro:** o `type` do `filterFields` é o id do
  `columnTypeRegistry`, e é a MESMA chave que alimenta o funil e o chip — tipo com
  `ownsMulti: true` fica com o widget próprio nos dois, recebendo `value` como **array
  sempre**. Até 2026-11-03 o chip forçava o `multiSelect` built-in em operador multi:
  abrir o funil entregava um widget e clicar no chip que ele gerou entregava outro.
  ⚠️ `FilterFieldType` ainda é a união fechada `text|select|boolean|number|date`, então um
  id custom exige cast no `type` — o runtime aceita, o TS não.
- **Infinite scroll** (`onLoadMore`/`hasMore`/`loadingMore`): o consumer controla os `items`
  (append da próxima página) — o DataList só dispara `onLoadMore` quando o sentinel entra na
  viewport (rootMargin 200px) e mostra skeletons enquanto `loadingMore`. Incompatível com
  `virtualized` (use um, não os dois).
- **`toolbarActions`** (ações custom no toolbar): formato `ToolbarAction[]`. Inline no
  desktop; no mobile colapsam num único ⋯ (junto com `moreActions`). Shapes:
  ```ts
  { kind: "button",   id, label, icon?, onClick, isActive?, disabled? }
  { kind: "dropdown", id, label, icon?, items: { label, icon?, onClick, active?, separator?, destructive? }[] }
  { kind: "input",    id, label, icon?, value, onChange, placeholder? }
  ```
  Ex.: seletor de período → `{ kind:"dropdown", id:"periodo", label:mes, items:[...] }`.
- A doc viva é o showcase `#/data-list` e `#/list-standard` (exemplo do seletor de período).
