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

## Distribuição de infos (ordem/roles das colunas) — receita canônica

Ordem esquerda→direita: **identidade → status → categóricos → secundários muted →
numéricos/datas à direita**. Detalhe completo (props-chave + render por role) em
`.ai/context/components/dashboard-patterns.md` §5. Resumo:
primário `isPrimary`+`minWidth`+`font-medium text-fg-default truncate`; status
`Chip variant="soft" size="sm" shape="rounded"` (cor por `STATUS_CHIP`); moeda/data
`align:"right"` + `tabular-nums` (muted p/ contexto, `text-fg-default` só no headline);
todo campo substantivo leva `icon` no header.

## Regras de coluna (OBRIGATÓRIO — pega bugs comuns)

1. **Filtro em TODAS as colunas de dados.** Cada coluna ganha
   `enableColumnFilter: true` + `filterType` derivado do `type` (text→`"text"`,
   number/currency/percentage→`"number"`, date/datetime→`"date"`,
   badge/status/select→`"select"`, multiSelect/tags→`"multiSelect"`). Só ficam de
   fora `actions` e render-custom sem valor filtrável. ⚠️ **NÃO marque só as
   badge/status** — o funil de filtros (e o drawer) só lista colunas com
   `enableColumnFilter`. Marcar só 2 = bug "filtra só 2 colunas".

2. **Coluna `actions` por ÚLTIMO** no array, `type: "actions"` (via
   `actionColumn`/`getActions`). O DataTable já **ancora à direita por default** —
   `pinned: "right"` é redundante (`use-data-table-columns.ts`: `col.pinned ?? (isActions
   ? "right" : undefined)`). (Mesmo se declarada no meio, ela é movida pro fim na
   renderização.)
   ⚠️ **NÃO passe `width` nesta coluna** (v0.42.0+). A largura é **derivada do número de
   ações**: `30n + 14` — 1 ação 44px, 2 74px, 3 104px, e **4+ colapsam no "…"** (44px).
   Fixar width volta a reservar espaço errado. Até a v0.41.x esta instrução mandava
   espelhar `width: 64` "porque é seguro" — e era pior que inútil: o
   `calculate-column-widths` **ignorava `col.width`** nesta coluna (lia só `minWidth`),
   então o 64 nunca valeu nada. Agora vale, e 64px comporta **1** ícone.

   **Quantas ações inline:** até 3 aparecem como ícone; **acima de 3, todas vão pro "…"**
   automaticamente (4 ícones não cabem na coluna). Pra forçar outro split, marque
   `showInMenu: true` nos itens que devem ir pro menu — isso desliga o automático.

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
4. **Copiar valor da célula** (`copyable`) — **inferir, não esperar que peçam.** O
   DataTable revela um ícone de copiar no **hover/foco** da célula, com feedback
   "Copiado!" (~2s, `navigator.clipboard`, sem dep nova).

   **Critério: o valor é um identificador que a pessoa cola em outro lugar.**

   | Marque `copyable: true` | Deixe sem |
   |---|---|
   | documento (CPF/CNPJ/RG/IE) · e-mail · telefone/WhatsApp · conta/agência/chave PIX · código de rastreio/protocolo/contrato/NF/pedido · token/hash · ID **externo** | nome de pessoa/empresa · status · data · valor monetário · quantidade · percentual · endereço em prosa |

   ⚠️ `id` sequencial curto (1, 2, 3) **não** ganha; UUID/protocolo/NF ganha. O que
   decide é servir fora da tela — não a coluna se chamar "id".

   **Limites, verificados no `parts/data-table-row.tsx`** (não presumidos):

   - **Inerte** em coluna `actions`, na coluna de árvore e na célula em edição
     (`addonsEligible = !isActionsCol && !isEditingThisCell && !isTreeCol`). Marcar
     lá não dá erro — simplesmente não aparece, o que é pior: parece configurado.
   - **`readMore` vence `copyable`** quando os dois estão na mesma coluna (ternário,
     nessa ordem). Escolha um.
   - Copia o texto **formatado** (`valueFormatter` → `formatValue` do type → valor).
     Numa coluna `currency` isso copia `R$ 1.234,56`, não `1234.56`. Quando o que se
     cola é o valor cru, passe `copyable: { value: (row) => String(row.x) }`.
   - Texto diferente do exibido (ex.: só o número da conta, sem a agência):
     `copyable: { value: (row) => "...", label: "Copiar conta" }` — `label` é o
     aria-label.

   **Declare no gate** o que você inferiu (linha `copyable` na tabela de colunas), pra
   o usuário poder recusar em lote. Inferência silenciosa em recurso que ele não sabe
   que existe não é conveniência, é surpresa.
5. **Grab-to-scroll é NATIVO** (`grabToScroll` default `true`, v0.26.0+): toda tabela
   já rola lateralmente ao arrastar o corpo (mouse/pen, threshold ~6px, clique/seleção
   preservados). **Não precisa configurar** — só passe `grabToScroll={false}` se, por
   algum motivo, quiser desabilitar.

**Formato de data.** `type: "date"` renderiza `14/03/2023` e `type: "datetime"` renderiza `14/03/2023 09:30` — **com ano** (lib 0.43.0+). Precisa de outro formato (mês escrito, relativo, ISO)? Passe **`valueFormatter`** na coluna: ele vence o formato do tipo e vale na célula, no export e no clipboard. **NÃO** escreva `render` próprio só pra formatar data. ⚠️ Até a 0.42.1 esses tipos mostravam a data **sem ano** e o `valueFormatter` não chegava na célula — se você viu `render` de data em código antigo, era contorno disso.


## Padrões de CÉLULA (consistência finance — OBRIGATÓRIO)

Espelhar `finance-screen.tsx`. Não inventar tamanhos/pesos por célula:

| Conteúdo da célula        | Padrão                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Coluna primária (nome)**| `isPrimary` + `render`: `<Avatar size="md">` + nome `text-body-sm font-medium` + secundária `text-caption-md text-fg-muted` (email/ID/doc) + ícone "abrir detalhe" (`<SquareArrowOutUpRight>` em `size-[24px] rounded-radius-sm border border-border-default bg-bg-canvas shadow-sh-sm` (o `24px` é o tamanho do botão; o radius é 6px)) quando o row click abre painel |
| **Status / badge**        | `type: "badge"` + `render`: `<Chip variant="soft" size="sm" shape="pill">` (cor semântica). **Nunca** pill na unha com classes manuais |
| **Avatar**                | `size="md"` na tabela (não `sm`); `colorHex` p/ cor de marca, senão `color` semântico                  |
| **Números / moeda / %**   | `tabular-nums`; moeda/percent via `type` (`currency`/`percentage`) + `align: "right"`                   |
| **Tags / métodos**        | `type: "tags"` + `render` com `<Chip variant="soft" size="sm" shape="rounded">`                         |
| **Datas**                 | `type: "date"`/`"datetime"` + formatter pt-BR
| **Código / identificador / valor técnico** | preset **`text-code-sm`** (13px, Geist Mono, tracking 0) — chave de env, ID, hash, slug, token, path. **Nunca** compor na unha (`font-mono text-body-sm`, `tracking-widest`): o papel `code` é 1 dos 7 do DS e existe pra isto |                                                           |

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

> ⛔ **No MÁXIMO 2 presets — e NUNCA um preset "Todos"/"Todas".** Medido em
> `TableToolbar/parts/table-toolbar-views.tsx`: `maxTabs` default é **3**,
> `maxCustomTabs = maxTabs - 1` (a aba **Default**, nativa, consome 1 slot), e o
> excedente é cortado por `.slice(0, maxCustomTabs)` — em DEV com `console.warn` nomeando
> a visão engolida (v0.43.1); em produção, silencioso.
> Com 3 presets, o terceiro simplesmente não aparece na barra.
> Precisa de mais? **`maxViewTabs={N + 1}`** no `<DataTable>` (o `+1` é a aba Default).
> Até 2026-08-14 não havia saída — `maxTabs` existia só dentro do `TableToolbarViews`,
> inalcançável pelo consumidor, e a única alternativa era remover um preset.
> Ainda assim, **2 é o default por um motivo**: barra de visões não é menu. Só aumente
> quando as abas forem realmente o eixo de navegação da tela.
> A aba **Default já É a visão sem filtro**: criar um preset "Todos" duplica ela e
> gasta um dos 2 slots com nada. Caso real numa geração de 2026-08-14 — 3 presets
> viraram 2 abas, e o que sumiu foi útil.
>
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
