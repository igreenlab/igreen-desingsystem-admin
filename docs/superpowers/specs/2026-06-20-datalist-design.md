# Spec — Componente `DataList` (iGreen DS)

**Data:** 2026-06-20
**Status:** design aprovado no gate; pendente revisão da spec escrita
**Branch:** `feat/datalist`
**Depende de:** `List` (v0.13.0) — ver `2026-06-20-list-component-design.md`

---

## 1. Contexto e objetivo

`DataList` é o componente **inteligente** sobre o `List`, espelhando a relação
`Table` → `DataTable`. O `List` é o primitivo de apresentação (cards, 3 layouts,
DnD, slots); o `DataList` adiciona **toolbar + busca + filtros + saved-views +
persistência + seleção/bulk + server/async + virtualização + lazy-load**, sem a
complexidade de colunas do DataTable (aqui são cards).

## 2. Decisões do gate

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Escopo v1 | **Tudo de uma vez** — client + server/async + virtualização + lazy-load |
| 2 | Filtros (sem colunas) | **Campos filtráveis** declarados pelo consumer (`FilterableField[]`) |
| 3 | Toolbar | **enxuta** (ver §3) — sem viewToggle, sem menu de configurações/colunas |
| 4 | Menu | `List` + `DataList` em seção própria **"List Components"** (fora de "Data Table Components") |

## 3. Toolbar (escopo reduzido — decisão do usuário)

Slots, na ordem: **Saved Views (Visões) OU título da lista** · **refresh** ·
**search** · **filtro** · **"⋯" (more, opcional)**.

- ❌ **Sem** toggle de visão (list/kanban) — o layout (standard/grouped/hierarchical)
  é prop fixa do consumer, não troca em runtime na toolbar.
- ❌ **Sem** menu "configurações da tabela" (ordenação/colunas/densidade) — não há
  colunas pra gerenciar.
- **Bulk bar** aparece quando há seleção (reusa `bulk-actions-bar` do TableToolbar).

Implementação: reusar `<TableToolbar>` com props pra **esconder** viewToggle e
settings. Se a granularidade atual não permitir, expor flags
(`showViewToggle={false}`, `showSettings={false}`) ou montar uma toolbar dedicada
`data-list-toolbar` compondo os parts existentes (search/filter/views/more).

## 4. Arquitetura

```
DataList (componente)
├─ useDataList (controller)         → estado: search, filters, sort?, savedView,
│                                      selection, expanded, pagination/cursor,
│                                      persistência (localStorage)
├─ <TableToolbar> (slots reduzidos) → views · refresh · search · filtro · more · bulk
└─ <List ...>                        → recebe items processados + estado de UI
```

- **Modo client:** `useDataList` faz search + filtro (+ sort opcional) sobre `items`.
- **Modo server:** consumer passa `items` + `loading` + `total`/`hasMore` e recebe
  `onQueryChange({ search, filters, sort, page/cursor })` pra buscar; o controller
  não filtra localmente.
- **Reuso do DataTable:** hooks que operam sobre **dados** (busca, saved-views,
  persistência, seleção). Filtros do DataTable são **column-coupled** → no DataList
  usamos um **filtro por campos** (`FilterableField[]`), reaproveitando a **UI**
  do `FilterPopover`/parts do TableToolbar, não o `ColumnTypeRegistry`.

## 5. Filtros por campos

```ts
type FilterableField = {
  id: string;
  label: string;
  accessor: (item) => unknown;          // ou keyof item
  type: "text" | "select" | "date" | "boolean" | "number";
  options?: { label: string; value: string }[]; // type select
};
```
O consumer passa `filterFields`. A toolbar gera o popover de filtro a partir disso;
o controller aplica os predicados (client) ou serializa em `onQueryChange` (server).

## 6. Props (esboço)

```ts
type DataListProps = {
  // dados
  items: ListItemData[];
  layout?: ListLayout;                 // fixo (não troca na toolbar)
  groups?: ListGroup[];

  // toolbar / busca / filtro
  title?: ReactNode;                   // título OU savedViews ocupam o lado esquerdo
  searchable?: boolean; searchPlaceholder?: string;
  filterFields?: FilterableField[];
  savedViews?: SavedViewConfig;        // mesma infra do DataTable
  onRefresh?: () => void;
  moreActions?: ListMenuItem[];        // botão "⋯" (opcional)

  // server/async
  mode?: "client" | "server";          // default client
  loading?: boolean; total?: number; hasMore?: boolean;
  onQueryChange?: (q: DataListQuery) => void;

  // virtualização (só standard; exclui DnD)
  virtualized?: boolean;

  // hierarquia lazy
  onLoadChildren?: (id: string) => Promise<ListItemData[]>;

  // seleção / dnd / persistência
  selectable?: boolean; onSelectionChange?: (ids: Set<string>) => void;
  enableDnD?: boolean; onMove?: ...; onReorder?: ...;
  persistKey?: string;                 // localStorage (view/filtros/search)

  // repasse de render do card
  renderItem?: ...; getMenuItems?: ...; onItemClick?: ...; groupSurface?: boolean;
};
```

## 7. Estrutura de arquivos

```
src/components/ui/DataList/
  index.ts
  data-list.tsx                 # componente: toolbar + List + fia o controller
  data-list.types.ts            # DataListProps · FilterableField · DataListQuery
  hooks/
    use-data-list.ts            # controller (orquestra os sub-hooks)
    use-data-list-filters.ts    # filtro por campos (client) / serialização (server)
    use-data-list-search.ts     # (ou reuso direto do DataTable)
    use-data-list-virtual.ts    # @tanstack/react-virtual no standard
  USAGE.md
```
(Onde fizer sentido, importar hooks do `DataTable` em vez de duplicar; extrair p/
`_shared` só com evidência — L-040/anti-duplicação.)

## 8. Restrições técnicas (Assumption / riscos)

- **Virtualização ✗ DnD (mutuamente exclusivos):** `@hello-pangea/dnd` exige todos
  os draggables montados; a virtualização desmonta os fora da viewport. Logo, quando
  `virtualized`, o DnD é desligado (e vice-versa). Documentar e travar via runtime
  (warn se ambos `true`). Virtualização mira o layout **standard** (flat); grouped/
  hierarchical virtualizados ficam fora do v1 (lista plana é o caso de "10k").
- **Toolbar slots:** depende de o `TableToolbar` permitir esconder viewToggle/settings.
  Se não, criar `data-list-toolbar` compondo os parts (sem refatorar o TableToolbar).
- **Filtro field-based** difere do column-based do DataTable → hook novo, UI reusada.
- **Server + saved-views/persistência**: a view persiste a *query* (search+filtros+
  sort), não os dados.

## 9. Definição de Pronto (L-042 — 7 superfícies) + menu

1. código (`ui/DataList/`) · 2. USAGE · 3. inventory (+contador) · 4. **showcase**
(`DataListDoc` + `App.tsx` import/render/`DOC_PAGES` + nav) · 5. registry · 6. catálogo
CLI · 7. changelog. **+ Menu:** mover `List` p/ nova seção **"List Components"** e
adicionar `DataList`. Distribuição (5/6/7) no `/ds-release`.

## 10. Fora de escopo

- Troca de layout em runtime via toolbar (layout é prop).
- Gerência de colunas / column-types (é cards).
- Virtualização de grouped/hierarchical (v1 só standard).
