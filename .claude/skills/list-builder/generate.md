---
name: list-builder-generate
description: >
  Estágio 3 do List Builder — carregado SÓ após aprovação do gate. Matriz de
  exemplos canônicos List*Preview, esqueleto com placeholders, receita de
  registro no preview, sequência de validação e checklist final.
---

# List Builder — Geração

> ⚠️ Regra 12 do router: **LER o exemplo canônico antes de gerar**. O esqueleto
> dá a ESTRUTURA; nomes de props/shapes vêm de `data-list.types.ts` +
> `list.types.ts` + exemplo lido. Nunca de memória.

## 1. Matriz cenário → exemplo canônico (ler só os presentes no blueprint)

| Cenário no blueprint | Arquivo a ler |
|---|---|
| Standard + toolbar (abas/busca/filtros) + menu | `src/preview/pages/ListStandardPreview.tsx` |
| Seleção + bulk bar | `src/preview/pages/ListSelectablePreview.tsx` |
| Grouped + DnD (onMove/onReorder stateful) | `src/preview/pages/ListGroupedPreview.tsx` |
| Hierarchical + branchHighlight (switcher) | `src/preview/pages/ListHierarchicalPreview.tsx` |
| Card rico (`renderItem`) | `src/preview/pages/ListRichPreview.tsx` |
| Infinite scroll + skeleton · Virtualização (1k) | `src/preview/pages/DataListDoc.tsx` |
| Mocks/helpers determinísticos (Avatar, StatusDot, makeTeam, ...) | `src/preview/pages/_list-example-data.tsx` |
| API de props (qualquer dúvida) | `src/components/ui/DataList/USAGE.md` + `data-list.types.ts` + `src/components/ui/List/USAGE.md` |
| Wrapper standalone | `src/preview/components/example-page-layout.tsx` |

## 2. Esqueleto — página standalone (`ExamplePageLayout`)

```tsx
// <PAGES_DIR><Entidade>Preview.tsx
import { useMemo } from "react";
import { DataList, type FilterableField } from "@/components/ui/DataList";
import type { ListItemData } from "@/components/ui/List";
import { ExamplePageLayout } from "../components/example-page-layout";

type <Entidade> = { /* campos do data dos itens */ };

const ITEMS: ListItemData[] = [ /* mock: id, leading, title, subtitle, meta, data */ ];

const FILTER_FIELDS: FilterableField[] = [
  // { id: "status", label: "Status", type: "select", accessor: (i) => (i.data as <Entidade>).status, options: [...] },
];

export default function <Entidade>Preview() {
  const items = useMemo(() => ITEMS, []);

  return (
    <ExamplePageLayout
      category="List Examples"
      title="<Título>"
      description="<Descrição>"
      code={EXAMPLE_CODE}
    >
      <DataList
        fillHeight
        className="flex-1 min-h-0"
        title="<Título>"
        items={items}
        /* layout="grouped"|"hierarchical" + groups/branchHighlight/defaultExpandedIds do blueprint */
        searchable
        filterFields={FILTER_FIELDS}
        /* views / selectable+bulkActions / renderItem / virtualized | onLoadMore... do blueprint */
        getMenuItems={() => [/* Editar · Excluir destructive */]}
        persistKey="<page-id>"
      />
    </ExamplePageLayout>
  );
}

const EXAMPLE_CODE = `/* snippet conceitual exibido no card do rodapé */`;
```

**Default export** — os `List*Preview` usam default export; o App.tsx importa sem chaves.

Reuse de mocks: se o domínio bate com pessoas/tarefas/org/pedidos, importe os
geradores de `_list-example-data.tsx` (`makeTeam`, `makeTasks`, `makeOrg`,
`makeOrders`, `PERSON_FILTER_FIELDS`, etc) em vez de recriar.

## 3. Snippets por cenário (confirmar shape no exemplo lido)

```tsx
// grouped + DnD (stateful) — espelhar ListGroupedPreview
const [items, setItems] = useState(makeItems());
<DataList layout="grouped" items={items} groups={GROUPS} groupSurface enableDnD
  onMove={handleMove} onReorder={handleReorder} />

// hierarchical + branchHighlight — espelhar ListHierarchicalPreview
<DataList layout="hierarchical" items={tree} branchHighlight="block"
  defaultExpandedIds={new Set([...])} />

// card rico — espelhar ListRichPreview
<DataList items={orders} renderItem={renderOrderCard} filterFields={...} />

// seleção + bulk — espelhar ListSelectablePreview
<DataList selectable bulkActions={[{ label:"Excluir", destructive:true, onClick:(ids)=>{} }]} />

// infinite scroll — espelhar DataListDoc (InfiniteExample)
const [items, setItems] = useState(pool.slice(0, 8));
const [loadingMore, setLoadingMore] = useState(false);
const hasMore = items.length < pool.length;
<DataList items={items} onLoadMore={loadMore} hasMore={hasMore} loadingMore={loadingMore} />

// server mode
<DataList mode="server" items={data} total={total} loading={loading}
  onQueryChange={(q) => fetch(q)} />
```

## 3.5 Distribuição de infos no card (slots) — receita canônica

`renderItem` distribui em slots fixos: **linha1** = título bold `body-md` + `·`
secundário muted; **linha2** = 1 linha muted `caption-md` juntando `lugar · pessoa ·
data` com `·`; **status** = `Chip variant="soft" size="sm" shape="pill"` (cor por
mapa); **valor** = moeda à direita, largura fixa, `font-semibold tabular-nums`.
**Nunca botão de ação na linha.** Detalhe + class strings em
`.ai/context/components/dashboard-patterns.md` §6 (inclui slots do kanban).

## 4. Receita de registro no preview (4 edits, âncoras TEXTUAIS)

1. **`src/App.tsx` — import**: junto ao bloco dos exemplos de lista (após
   `import ListRichPreview from "./preview/pages/ListRichPreview";`):
   `import <Entidade>Preview from "./preview/pages/<Entidade>Preview";`
2. **`src/App.tsx` — `DOC_PAGES`**: adicionar `"<page-id>"` na linha que contém
   `"list-rich"` (array de strings).
3. **`src/App.tsx` — render**: junto às linhas `{activePage === "list-..." && <... />}`:
   `{activePage === "<page-id>" && <<Entidade>Preview />}`
4. **`src/preview/components/doc-nav-data.ts`**: item na seção `"List Components"`
   (`{ label: "Example: <Nome>", href: "<page-id>" }`).

Deep-link `#/<page-id>` funciona automaticamente (`ALL_VALID_PAGES` deriva de `DOC_PAGES`).

## 5. Sequência (abort-on-error)

1. Ler os canônicos da matriz (§1, só cenários do blueprint).
2. Criar a página (arquivo ou pasta).
3. Registrar (§4 — os 4 edits).
4. `npx tsc --noEmit` → erro: corrigir e repetir.
5. Validação visual (recomendada): dev server porta 3100 → `#/<page-id>`:
   - [ ] Toolbar (abas/busca/filtros/⋯) e chips de filtro funcionando
   - [ ] Layout correto (grouped DnD / hierarchical branchHighlight / card rico)
   - [ ] Seleção → bulk bar · escala (virtualized/infinite) conforme blueprint
   - [ ] `fillHeight`: toolbar fixa, só a lista rola
   - [ ] Dark mode ok (toggle do preview)
6. `.ai/status/pipeline-state.md` → entrada `CONCLUÍDO` com Decisões + **Assumption**.

## 6. Checklist final (aprovado se TODOS true)

- [ ] Página criada e espelha o(s) exemplo(s) canônico(s) lido(s)
- [ ] `filterFields` com `accessor`; operadores de view válidos
- [ ] Excludências respeitadas (virtualized⊕DnD⊕infinite; branchHighlight só hierarchical)
- [ ] Zero Tailwind literal com equivalente DS · zero hardcode
- [ ] Registro completo (4 edits) — deep-link funciona
- [ ] `npx tsc --noEmit` limpo
- [ ] pipeline-state.md atualizado

## Handoff

`LIST_PRONTO: <Entidade> — #/<page-id>`
