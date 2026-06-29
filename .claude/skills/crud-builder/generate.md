---
name: crud-builder-generate
description: >
  Estágio 3 do CRUD Builder — carregado SÓ após aprovação do gate. Matriz de
  exemplos canônicos, esqueletos com placeholders, receita de registro no
  preview, sequência de validação e checklist final.
---

# CRUD Builder — Geração

> ⚠️ Regra 13 do router: **LER o exemplo canônico antes de gerar**. Os
> esqueletos abaixo dão a ESTRUTURA; nomes de props/shapes vêm de
> `data-table.types.ts` + exemplo lido. Nunca de memória.

## 1. Matriz cenário → exemplo canônico (ler só os presentes no blueprint)

| Cenário no blueprint                                  | Arquivo a ler                                                  |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| CRUD client base · bulk · totalizers · inline edit    | `src/preview/pages/ClientsCRUDPreview.tsx`                     |
| Server mode (`fetchData`/`getRowId`) · coluna actions | `src/preview/pages/ClientsCRUDServerPreview.tsx`               |
| Filtros pré-aplicados · showEmptyFilterChips          | `src/preview/pages/ClientsPreFilteredPreview.tsx`              |
| Virtualização                                         | `src/preview/pages/ClientsVirtualizedPreview.tsx`              |
| Grouping (column-aligned + free-form)                 | `src/preview/pages/ClientsGroupedPreview.tsx`                  |
| Row expansion                                         | `src/preview/pages/ClientsExpandablePreview.tsx`               |
| Colunas 100% declarativas por type                    | `src/preview/pages/ClientsTypedPreview.tsx`                    |
| Kanban view                                           | `src/preview/pages/ClientsKanbanPreview.tsx`                   |
| **View Lista (toggle Tabela/Lista)** ⭐               | `src/preview/pages/ClientsListViewPreview.tsx`                 |
| AppShell + PageHeader + drawers + AlertModal          | `src/preview/pages/ClientesShowcase/ClientesShowcase.tsx`      |
| valueGetter lookup · render com Avatar · KPIs         | `src/preview/pages/ClientesFinanceiroShowcase/`                |
| **Célula rica (avatar/chip) + detail panel por categoria** ⭐ | `src/examples/finance/finance-screen.tsx` + `src/examples/finance/components/FinanceDetailPanel/finance-detail-panel.tsx` |
| API de props (qualquer dúvida)                        | `src/components/ui/DataTable/USAGE.md` + `data-table.types.ts` |
| Toolbar / Kanban / AppShell / PageHeader / FormField  | `src/components/ui/<X>/USAGE.md`                               |

> ⭐ **O finance é a referência de CONSISTÊNCIA visual** (tamanhos de fonte,
> avatar, badges, disposição, detail panel). Toda tabela nova deve sair com o
> mesmo "feeling" — ver as duas seções de padrões abaixo.

> 🔀 **Tabela + Lista no mesmo lugar (toggle):** quando o usuário quer alternar
> entre tabela e uma **lista de cards** (em vez de kanban), use `viewMode` +
> `listConfig={{ renderItem(row), paginated?, hierarchical?, getPath?, getMenuItems? }}`
> no PRÓPRIO DataTable — a toolbar é a mesma e o toggle Tabela/Lista aparece automático.
> NÃO monte um `<DataList>` paralelo + toggle na mão. Ref: `ClientsListViewPreview.tsx`.
>
> - **Lista flat paginada** → `listConfig.paginated: true` (v0.21.0+): a lista usa a
>   MESMA paginação da tabela + mostra o footer. Default `false` (mostra todas as rows,
>   sem footer). Ignorado quando `hierarchical`. Use sempre que a lista flat puder ter
>   muitas linhas — senão ela rola "infinito" enquanto a tabela pagina.
> - **Lista em árvore + tabela em árvore** → `listConfig.hierarchical` + `getTreeDataPath`
>   (liga tree-data nos dois; a tabela NÃO pagina).
> - **Tabela FLAT paginada + lista em ÁRVORE** → `listConfig.hierarchical` +
>   **`listConfig.getPath`** (caminho raiz→self) e **NÃO** passe `getTreeDataPath`
>   (senão a tabela vira tree-data e perde a paginação). Ref real: Mapa de Rede.

## 2. Esqueleto — página standalone (`ExamplePageLayout`)

```tsx
// <PAGES_DIR><Entidade>CRUDPreview.tsx
import { useMemo, useState } from "react";
import { ExamplePageLayout } from "../components/example-page-layout";
import { DataTable, type DataTableColumnDef } from "@/components/ui/DataTable";
// builders opcionais (reduzem boilerplate — ver USAGE.md §Imports):
// textColumn, currencyColumn, dateColumn, statusColumn, actionColumn, presetView

type <Entidade>Row = { /* shape confirmado na entrevista */ };

const ROWS: <Entidade>Row[] = [ /* mock ou import */ ];

export default function <Entidade>CRUDPreview() {
  const [rows, setRows] = useState(ROWS);

  // Guardrail 2 — useMemo SEMPRE.
  const columns = useMemo<DataTableColumnDef<<Entidade>Row>[]>(() => [
    // ...colunas do blueprint (preferir type do registry a render custom)
  ], []);

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="<Título>"
      description="<Descrição>"
      code={EXAMPLE_CODE}
    >
      <DataTable<<Entidade>Row>
        rows={rows}
        columns={columns}
        persistId="<page-id>"
        toolbar={{ /* flags do blueprint */ }}
        paginationConfig={{ enabled: true, initialPageSize: 25 }}
        /* + selectionConfig / showTotalizers / virtualize / etc do blueprint */
        className="flex-1 min-h-0"
      />
    </ExamplePageLayout>
  );
}

const EXAMPLE_CODE = `/* snippet conceitual exibido no card do rodapé */`;
```

**Default export** — os `Clients*Preview` usam default export e o App.tsx
importa sem chaves.

## 3. Esqueleto — AppShell (showcase real)

Estrutura de pasta (padrão `ClientesShowcase/`):

```
<PAGES_DIR><Entidade>Showcase/
├── index.ts                      // export { default } from "./<Entidade>Showcase"
├── <Entidade>Showcase.tsx        // AppShell + PageHeader + DataTable + drawers
├── <entidade>.types.ts           // Row type + mocks
└── components/                   // DetailDrawer / Novo<Entidade>Drawer (se houver)
```

Miolo (ler `ClientesShowcase.tsx` pro shape real de AppShell props):

```tsx
<AppShell {...APP_SHELL_PROPS}>
  <PageHeader
    title="<Título>"
    description="<Descrição>"
    badge={<Chip color="primary" variant="soft" size="sm">{rows.length} registros</Chip>}
    actions={<Button variant="filled" color="primary" iconLeft={<Plus />}>Novo</Button>}
  />
  <DataTable<Row> ... className="flex-1 min-h-0" />
  {/* drawers: forms usam <FormField> (L-023) + gap-form-gap (L-024) */}
</AppShell>
```

## Regras de coluna (OBRIGATÓRIO — pega bugs comuns)

1. **Filtro em TODAS as colunas de dados.** Cada coluna ganha
   `enableColumnFilter: true` + `filterType` derivado do `type` (text→`"text"`,
   number/currency/percentage→`"number"`, date/datetime→`"date"`,
   badge/status/select→`"select"`, multiSelect/tags→`"multiSelect"`). Só ficam de
   fora `actions` e render-custom sem valor filtrável. ⚠️ **NÃO marque só as
   badge/status** — o funil de filtros (e o drawer) só lista colunas com
   `enableColumnFilter`. Marcar só 2 = bug "filtra só 2 colunas".

2. **Coluna `actions` por ÚLTIMO** no array, `type: "actions"` (via
   `actionColumn`/`getActions`). O DataTable já **ancora à direita e estreita por
   default** — não precisa `pinned`/`width`. (Mesmo se declarada no meio, ela é
   movida pro fim na renderização.)

3. **Largura: prefira NÃO setar `width` nas colunas de dados.** `autoFit` é
   **default ON** e distribui pra preencher o container (tabela "de verdade", sem
   scroll, sem 1ª coluna esticada). Nunca passe `autoFit: false` sem motivo.
   - **(v0.22.0+) `col.width` virou BASE/piso, não trava fixa**: o autoFit usa o
     `width` como largura mínima e ainda distribui o espaço que sobra
     proporcionalmente entre as colunas. Ou seja, setar `width` em várias colunas
     **não** deixa mais "sobra à direita" — preenche. Pra **travar** de fato uma
     coluna, use `width` + `maxWidth` iguais (ou um `type` fixo: `actions`/`checkbox`).
   - **Título do header nunca trunca**: a largura mínima de cada coluna já inclui o
     texto do `headerName` + ícone/sort/menu. Não precisa fixar `width` só pra caber
     o título.

## Padrões de CÉLULA (consistência finance — OBRIGATÓRIO)

Espelhar `finance-screen.tsx`. Não inventar tamanhos/pesos por célula:

| Conteúdo da célula        | Padrão                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Coluna primária (nome)**| `isPrimary` + `render`: `<Avatar size="md">` + nome `text-body-sm font-medium` + secundária `text-caption-md text-fg-muted` (email/ID/doc) + ícone "abrir detalhe" (`<SquareArrowOutUpRight>` em `size-[24px] rounded-radius-sm border bg-bg-canvas shadow-sh-sm`) quando o row click abre painel |
| **Status / badge**        | `type: "badge"` + `render`: `<Chip variant="soft" size="sm" shape="pill">` (cor semântica). **Nunca** pill na unha com classes manuais |
| **Avatar**                | `size="md"` na tabela (não `sm`); `colorHex` p/ cor de marca, senão `color` semântico                  |
| **Números / moeda / %**   | `tabular-nums`; moeda/percent via `type` (`currency`/`percentage`) + `align: "right"`                   |
| **Tags / métodos**        | `type: "tags"` + `render` com `<Chip variant="soft" size="sm" shape="rounded">`                         |
| **Datas**                 | `type: "date"`/`"datetime"` + formatter pt-BR                                                           |

Regra geral: **componente do DS sempre antes de markup manual** (Avatar, Chip,
Switch...). Se precisar de pill/badge → `<Chip>`, nunca `<span>` estilizado.

## Padrões de DETAIL PANEL (consistência finance — quando há row click → painel)

Espelhar `FinanceDetailPanel`. **Sempre** que o blueprint tiver "row click →
painel de detalhe", usar `<FloatingPanel>` (não markup solto):

- `titleSlot`: `<Avatar size="lg">` + nome (`text-body-md font-semibold`) +
  linha `ID · <Chip status>`.
- `headerActions` (ícones) + `footer` (ações primárias) — `<Button>` do DS.
- `bodyPadded={false}` + **agrupar por categoria** em `<FloatingPanelSection title="...">`.
- Cada dado simples = **uma linha** `<FloatingPanelField label value />` (formato lista).
- Destaque (saldo/progresso) = bloco próprio com gutter `px-[18px]`.
- Conteúdo rico não-tabular (checklist, timeline, extrato) **mantém o formato visual
  próprio** dentro de uma `FloatingPanelSection` — NÃO forçar em `FloatingPanelField`.

Imports: `FloatingPanel, FloatingPanelSection, FloatingPanelField` de
`@/components/ui/FloatingPanel`.

## 4. Snippets críticos

### INITIAL_FILTERS (controlled) — operador SEMPRE da tabela

| filterType  | default    | demais válidos                                                      |
| ----------- | ---------- | ------------------------------------------------------------------- |
| multiSelect | `isAnyOf`  | isNoneOf, isEmpty, isNotEmpty                                       |
| select      | `equals`   | neq, isEmpty, isNotEmpty                                            |
| text        | `contains` | notContains, equals, neq, startsWith, endsWith, isEmpty, isNotEmpty |
| number      | `equals`   | neq, gt, lt, gte, lte, between                                      |
| date        | `between`  | equals, gt, lt                                                      |
| boolean     | `equals`   | —                                                                   |

(Tabela completa + exemplos ❌/✅ do bug real: `DataTable/USAGE.md`
§"filterModel controlado". Errado = Select de operador VAZIO no popover.)

```tsx
const INITIAL_FILTERS: FilterModel = {
  items: [
    { id: "f1", field: "statusId", operator: "isAnyOf", value: "active" },
  ],
  logicOperator: "AND",
};
const [filterModel, setFilterModel] = useState<FilterModel>(INITIAL_FILTERS);
// <DataTable filterModel={filterModel} onFilterModelChange={setFilterModel} ... />
```

### fetchData (server mode) — Guardrail 3

```tsx
const fetchData = useCallback(async (params: GridFetchParams) => {
  // params: { pagination, sort, filters, search, searchField? }
  const res = await api.get("/<entidade>", { params: serialize(params) });
  return { data: res.items, total: res.total }; // GridFetchResult<T>
}, []);
```

### presetView

```tsx
defaultViews={[
  presetView({
    id: "preset:<slug>",          // prefixo preset: + id estável
    name: "<Label da aba>",
    filters: [{ field: "<f>", operator: "<op-válido>", value: <v> }],
    sort: [{ field: "<f>", direction: "desc" }],   // opcional
    viewMode: "list",             // opcional — só se ESTE preset abre numa view fixa
  }),
]}
```

> **Visões read-only (`allowCreateView={false}`, v0.23.0+)** — quando a tela só
> deve oferecer as visões pré-definidas (abas nativas, sem o usuário salvar
> visões próprias), passe `allowCreateView={false}` no `<DataTable>`: esconde o
> botão "+". Default `true`. Use junto de `defaultViews` + `persistId`.
>
> **viewMode "sticky" (v0.23.0+)** — trocar de visão só muda Tabela↔Lista↔Kanban
> se o preset definir `viewMode` explícito (ver acima). Presets sem `viewMode`
> mantêm o que o usuário está vendo. Por isso só declare `viewMode` no
> `presetView` quando aquela visão DEVE forçar uma view específica.

## 5. Receita de registro no preview (4 edits, âncoras TEXTUAIS)

1. **`src/App.tsx` — import**: junto ao bloco dos exemplos
   (após `import ClientsKanbanPreview from "./preview/pages/ClientsKanbanPreview";`):
   `import <Entidade>CRUDPreview from "./preview/pages/<Entidade>CRUDPreview";`
2. **`src/App.tsx` — `DOC_PAGES`**: adicionar `"<page-id>"` na linha que contém
   `"clients-kanban"` (array de strings, ~L154).
3. **`src/App.tsx` — render**: dentro do bloco `isDocPage`, junto às linhas
   `{activePage === "clients-..." && <... />}`:
   `{activePage === "<page-id>" && <<Entidade>CRUDPreview />}`
4. **`src/preview/components/doc-nav-data.ts`**: item na seção certa —
   `"Data Table Components"` (`{ label: "Example: <Nome>", href: "<page-id>" }`)
   ou `"Examples"` pra showcases AppShell.

Deep-link `#/<page-id>` funciona automaticamente (`ALL_VALID_PAGES` deriva de
`DOC_PAGES`).

## 6. Sequência (abort-on-error)

1. Ler os canônicos da matriz (§1, só cenários do blueprint).
2. Criar a página (arquivo ou pasta).
3. Registrar (§5 — os 4 edits).
4. `npx tsc --noEmit` → erro: corrigir e repetir.
5. Validação visual (recomendada, não bloqueante): dev server porta 3100 →
   `#/<page-id>` → checklist:
   - [ ] Popover Filtros abre com Select de operador PREENCHIDO
   - [ ] Chips de filtros pré-aplicados visíveis e removíveis
   - [ ] Pagination/virtualização conforme blueprint
   - [ ] Kanban: lanes = todas as options; drag respeitando canReceiveDrop
   - [ ] Dark mode ok (toggle do preview)
   - [ ] Mobile: card mode + toolbar colapsada
6. `.ai/status/pipeline-state.md` → entrada `CONCLUÍDO` com Decisões +
   **Assumption** (herdada do gate).

## 7. Checklist final (tarefa aprovada se TODOS true)

- [ ] Página criada e espelha o(s) exemplo(s) canônico(s) lido(s)
- [ ] `columns` em useMemo; `fetchData` em useCallback (se server)
- [ ] Operadores de filtro válidos (re-grep no arquivo gerado)
- [ ] **Padrões de célula** (avatar `md`, badges via `<Chip>`, `tabular-nums`, ícone abrir-detalhe na primária) — consistente com finance
- [ ] **Colunas de dados sem `width`** fixo (autoFit preenche) — `width` é só base/piso (v0.22.0+); travar = `width`+`maxWidth` iguais
- [ ] **Detail panel** (se houver) = `FloatingPanel` + `Section` (por categoria) + `Field` (lista); conteúdo rico mantém formato próprio
- [ ] Zero Tailwind literal com equivalente DS · zero hardcode
- [ ] Registro completo (4 edits) — deep-link funciona
- [ ] `npx tsc --noEmit` limpo
- [ ] pipeline-state.md atualizado

## Handoff

`CRUD_PRONTO: <Entidade> — #/<page-id>`
