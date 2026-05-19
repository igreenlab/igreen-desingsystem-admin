# Kanban — Guia de uso

Primitive dumb (igual `<Table>`, `<TableToolbar>`, `<FooterTable>`) — recebe `columns` + `cards` via props e renderiza um board horizontal de estágios. Não gerencia state de domínio (selection, detail, menus, dados) — tudo controlado externamente.

> Padrão equivalente ao DNA do DS: primitives dumb + smart orchestrators. Pra usar o Kanban acoplado a filter/sort/search da `<DataTable>`, veja [Integração com DataTable](#integração-com-datatable) abaixo.

---

## Imports

```tsx
import {
  Kanban,
  type KanbanColumn,
  type KanbanCardData,
  type KanbanMenuItem,
  type KanbanRenderCardParams,
} from "@/components/ui/Kanban";
```

---

## Quick start — uso standalone

```tsx
const columns: KanbanColumn[] = [
  { id: "todo",  label: "A fazer", dotColor: "var(--color-fg-muted)" },
  { id: "doing", label: "Em andamento", dotColor: "var(--color-fg-info)" },
  { id: "done",  label: "Concluído", dotColor: "var(--color-fg-success)", canReceiveDrop: false },
];

const cards: KanbanCardData[] = tasks.map((t) => ({
  id: t.id,
  columnId: t.status,
  title: t.title,
  subtitle: t.code,
  avatar: <Avatar size="sm" colorHex={t.assignee.color}>{t.assignee.initials}</Avatar>,
  chip: <Chip color="warning" variant="soft" size="sm">Urgente</Chip>,
  value: formatBRL(t.value),
}));

<Kanban
  columns={columns}
  cards={cards}
  selectedIds={selectedIds}
  onToggleSelect={toggleSelect}
  onOpenCard={(id) => openTaskDetail(id)}
/>
```

---

## Capacidades

| Capability | Como ativar |
|------------|-------------|
| **Seleção (bulk)** | `selectedIds: Set<string>` + `onToggleSelect: (cardId) => void` — checkbox aparece no hover do card |
| **Card aberto (detail)** | `openCardId` + `onOpenCard: (cardId) => void` — strip lateral brand |
| **Add card (header)** | `onAddCard: (columnId) => void` — botão `+` no header da coluna |
| **Add card (footer)** | `onAddInFooter: (columnId) => void` + `hideFooterAdd?: false` (default) |
| **Menu coluna** | `onColumnMenu: (columnId, anchor) => void` (manual) OU `getColumnMenuItems: (col) => KanbanMenuItem[]` (auto) |
| **Menu card** | `onCardMenu: (cardId, anchor) => void` (manual) OU `getCardMenuItems: (card) => KanbanMenuItem[]` (auto) |
| **Card render custom** | `renderCard: ({ card, selected, open }) => ReactNode` — substitui o miolo; wrapper continua sob controle do primitive |
| **DnD entre colunas** | `enableDnD: true` + `onCardMove: (cardId, from, to) => void \| Promise<unknown>` |
| **Constraint por coluna** | `column.canReceiveDrop: false` (terminal) + `column.canDragFrom: false` (locked) |

---

## Recipes

### Menus padronizados via items

```tsx
const cardMenu = (card: KanbanCardData): KanbanMenuItem[] => [
  { label: "Ver detalhes", icon: <Eye />,    onClick: () => openDetail(card.id) },
  { label: "Editar",       icon: <Pencil />, onClick: () => openEdit(card.id) },
  { separator: true },
  { label: "Excluir",      icon: <Trash2 />, destructive: true, onClick: () => remove(card.id) },
];

<Kanban {...} getCardMenuItems={cardMenu} />
```

Primitive renderiza `<DropdownMenu>` DS automático. `KanbanMenuItem`:
- `label?` — string (ignorado se `separator: true`)
- `icon?` — ReactNode
- `onClick?` — handler
- `destructive?` — vermelho via `variant="destructive"`
- `disabled?` — bloqueia hover/click
- `separator?` — renderiza `<DropdownMenuSeparator>`

Coexiste com `onCardMenu`/`onColumnMenu` (callbacks manuais) — quando ambos fornecidos, `get*MenuItems` ganha.

### Drag-and-Drop entre colunas

```tsx
<Kanban
  columns={[
    { id: "active",   label: "Ativo" },
    { id: "pending",  label: "Pendente" },
    { id: "done",     label: "Concluído", canReceiveDrop: false }, // terminal
    { id: "archived", label: "Arquivado", canDragFrom: false },     // locked source
  ]}
  cards={cards}
  enableDnD
  onCardMove={(cardId, from, to) => {
    // Optimistic update (consumer comita via props)
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, columnId: to } : c)),
    );
  }}
/>
```

**Visual feedback built-in:**
- Card sendo arrastado: `opacity-40 cursor-grabbing`
- Coluna candidata válida durante drag: outline brand + bg subtle + **drop placeholder** (linha fina com ícone `+`) na posição que vai aterrissar (antes do card hovered, ou no fim se hover em área vazia)
- Coluna inválida (`canReceiveDrop: false`): `opacity-50` sempre durante drag (atenuada); `cursor-not-allowed` quando over

**Primitive não faz revert**: se `onCardMove` falhar, consumer mantém `cards` props inalterado e o card visualmente "volta" (porque a fonte da verdade são os props). Pra async commit:

```tsx
onCardMove={async (cardId, from, to) => {
  setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, columnId: to } : c)); // optimistic
  try {
    await api.patch(`/cards/${cardId}`, { columnId: to });
  } catch {
    setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, columnId: from } : c)); // revert
  }
}}
```

### Render custom do card

```tsx
<Kanban
  {...}
  renderCard={({ card, selected, open }) => (
    <>
      <div className="flex items-center gap-gp-md">
        {card.avatar}
        <span className="text-body-md font-medium flex-1 truncate">{card.title}</span>
        {open && <Eye className="size-icon-sm text-fg-brand" />}
      </div>
      <Timeline events={card.description} />
    </>
  )}
/>
```

Consumer customiza o **miolo** do card. Wrapper externo (border, shadow, focus ring, checkbox/menu positioning, accessibility) continua sob controle do primitive — garante consistência visual entre boards customizados.

---

## Integração com DataTable

`<DataTable>` é o smart orchestrator. Quando `viewMode="kanban"` + `kanbanConfig`:
- Filter/search/sort/selection aplicam transparente nas rows
- O processado (já filtrado/ordenado) é mapeado em `<Kanban>` cards via `kanbanConfig.renderCard`
- Paginação é desligada automaticamente (não se aplica em board)
- TableToolbar parts irrelevantes (density, columns popover) podem ser ocultados via `toolbar.enableDensity: false`/`enableColumns: false` condicional

### Paridade com `<Kanban>` standalone

O `DataTableKanbanConfig` é **1:1 com `KanbanProps`** — toda capability do primitive está exposta no smart wrapper. Bridge automático resolve `cardId → row` onde aplicável.

| `<Kanban>` prop | `kanbanConfig.*` | Bridge |
|---|---|---|
| `columns` | `columns?` | Auto-deriva de valores únicos do `groupByField` se omitido |
| `cards` | (derivado) | Transformer `useDataTableViewMode` mapeia rows → cards |
| `selectedIds` | (auto) | Bridge: `selectionModel.ids` (apenas modo include) |
| `onToggleSelect` | (auto) | Bridge: `cardId → row → selection.toggleRow(row)` |
| `openCardId` | `openCardId?` | Passthrough direto |
| `onOpenCard` | (auto) | Bridge: `cardId → row → onRowClick(row)` |
| `onAddCard` | `onAddCard?` | Passthrough direto (recebe `columnId`) |
| `onAddInFooter` | `onAddInFooter?` | Passthrough direto |
| `hideFooterAdd` | `hideFooterAdd?` | Passthrough direto |
| `getCardMenuItems` | `getCardMenuItems?` | Bridge: recebe `row` (não `card`) — consumer-friendly |
| `onCardMenu` | `onCardMenu?` | Passthrough direto (recebe `cardId, anchor`). Ignorado se `getCardMenuItems` definido |
| `getColumnMenuItems` | `getColumnMenuItems?` | Passthrough direto |
| `onColumnMenu` | `onColumnMenu?` | Passthrough direto. Ignorado se `getColumnMenuItems` definido |
| `renderCard` (slot) | `renderCardContent?` | Bridge: recebe `{ card, row, selected, open }` — adiciona `row` original |
| `enableDnD` | `enableDnD?` | Passthrough direto |
| `onCardMove` | `onCardMove?` | Passthrough direto |
| `emptyLabel` | `emptyLabel?` | Passthrough direto |
| `addLabel` | `addLabel?` | Passthrough direto |

> `renderCard` no `DataTableKanbanConfig` é o **mapeador de slots** (avatar/title/chip/...) — diferente do `renderCardContent` que substitui o miolo inteiro.

### Exemplo completo

```tsx
const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
const [openCardId, setOpenCardId] = useState<string>();

<DataTable<Task>
  rows={tasks}
  columns={tableColumns}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  onRowClick={(row) => setOpenCardId(row.id)} // bridge cobre kanban também
  kanbanConfig={{
    groupByField: "status",
    columns: [
      { id: "todo",  label: "A fazer" },
      { id: "doing", label: "Em andamento" },
      { id: "done",  label: "Concluído", canReceiveDrop: false },
    ],

    // Mapeador de slots (uso comum)
    renderCard: ({ row }) => ({
      title: row.title,
      subtitle: row.code,
      avatar: <Avatar size="sm" colorHex={row.assignee.color}>{row.assignee.initials}</Avatar>,
      chip: <Chip color="warning" variant="soft" size="sm">{row.priority}</Chip>,
      value: formatBRL(row.value),
    }),

    // Detail panel
    openCardId,

    // Add card buttons
    onAddCard: (columnId) => createNewTask(columnId),
    onAddInFooter: (columnId) => createNewTask(columnId),
    hideFooterAdd: false,

    // Menus padronizados (auto via DropdownMenu DS)
    getCardMenuItems: (row) => [
      { label: "Editar", icon: <Pencil />, onClick: () => editTask(row) },
      { separator: true },
      { label: "Excluir", icon: <Trash2 />, destructive: true, onClick: () => deleteTask(row) },
    ],
    getColumnMenuItems: (col) => [
      { label: "Renomear", icon: <Pencil />, onClick: () => renameColumn(col.id) },
    ],

    // DnD
    enableDnD: true,
    onCardMove: (cardId, _from, to) =>
      setTasks((prev) => prev.map((t) => (t.id === cardId ? { ...t, status: to } : t))),

    // Override TOTAL do miolo (opcional — sobrescreve `renderCard` slots)
    // renderCardContent: ({ card, row, selected, open }) => <CustomTimelineCard row={row} />,
  }}
  toolbar={{
    enableSearch: true,
    enableFilters: true,
    enableColumns: viewMode === "table", // oculta em kanban
    enableDensity: viewMode === "table", // oculta em kanban
    customLeft: <ToolbarSegmented value={viewMode} onValueChange={setViewMode} items={VIEW_MODES} />,
  }}
/>
```

Veja [src/preview/pages/ClientsKanbanPreview.tsx](../../preview/pages/ClientsKanbanPreview.tsx) pra exemplo runnable com toggle table/kanban + DnD + filters compartilhados.

---

## API resumida

### `KanbanProps`
| Prop | Type | Default | Descrição |
|---|---|---|---|
| `columns` | `KanbanColumn[]` | — | Definição das colunas (ordem = visual) |
| `cards` | `KanbanCardData[]` | — | Cards distribuídos via `columnId` |
| `selectedIds` | `Set<string>` | — | IDs selecionados; presença ativa checkbox |
| `onToggleSelect` | `(cardId: string) => void` | — | Toggle do checkbox |
| `openCardId` | `string` | — | Card aberto no detail panel (strip brand) |
| `onOpenCard` | `(cardId: string) => void` | — | Click no card |
| `onAddCard` | `(columnId: string) => void` | — | Botão `+` do header |
| `onColumnMenu` | `(columnId: string, anchor: HTMLElement) => void` | — | Menu manual da coluna |
| `getColumnMenuItems` | `(column) => KanbanMenuItem[]` | — | Menu auto (ganha de `onColumnMenu`) |
| `onAddInFooter` | `(columnId: string) => void` | — | Botão `+ Adicionar` do rodapé |
| `hideFooterAdd` | `boolean` | `false` | Oculta o `+ Adicionar` |
| `onCardMenu` | `(cardId: string, anchor: HTMLElement) => void` | — | Menu manual do card |
| `getCardMenuItems` | `(card) => KanbanMenuItem[]` | — | Menu auto (ganha de `onCardMenu`) |
| `renderCard` | `({ card, selected, open }) => ReactNode` | — | Custom miolo do card |
| `enableDnD` | `boolean` | `false` | Habilita DnD |
| `onCardMove` | `(cardId, from, to) => void \| Promise<unknown>` | — | Callback de drop |
| `emptyLabel` | `string` | `"Nenhum item neste estágio"` | Texto do empty state |
| `addLabel` | `string` | `"Adicionar"` | Texto do botão `+ Adicionar` |
| `className` | `string` | — | className extra no root |

### `KanbanColumn`
| Field | Type | Default | Descrição |
|---|---|---|---|
| `id` | `string` | — | Identificador único |
| `label` | `string` | — | Label do header |
| `dotColor` | `string` | — | Cor do dot (CSS var ou hex) |
| `count` | `number` | auto | Override do badge (default = `cards.filter(c => c.columnId === id).length`) |
| `canReceiveDrop` | `boolean` | `true` | `false` = coluna terminal/locked |
| `canDragFrom` | `boolean` | `true` | `false` = cards desta coluna não-arrastáveis |

### `KanbanCardData`
Cada slot (`avatar`, `chip`, `value`, `footerLeft`, `footerRight`, `description`) é `ReactNode` — consumer monta usando DS (`<Avatar>`, `<Chip>`, etc) sem o Kanban ditar visual interno.

---

## Performance

- `cards` e `columns` devem ser memoizados pelo consumer (`useMemo`) — evita recompute do filter interno (`cards.filter(c => c.columnId === col.id)`) a cada render
- Em integração com DataTable, o transformer (`useDataTableViewMode`) já é memoizado em `rows`/`config`/`getRowId`
- Pra > 1000 cards, considere virtualizar dentro de cada coluna (não built-in V1; consumer pode wrap `renderCard` com `react-window` se precisar)

---

## ARIA

- Root `<Kanban>`: `role="region" aria-label="Quadro Kanban"`
- Botões de ação/menu (`<Button>` DS) têm `aria-label` derivados das props
- DnD via `@dnd-kit/core` traz suporte a teclado (Space/Setas) — KeyboardSensor sem configuração extra

---

## Troubleshooting

| Sintoma | Causa | Fix |
|---|---|---|
| Cards não aparecem em coluna esperada | `columnId` da card não bate com `column.id` | Verificar mapping `getValue` ou hard-coded values |
| Scroll horizontal aparece durante drag | Estado bug do `transform` (corrigido na V1 — não use `useDraggable.transform` no source quando há `<DragOverlay>`) | Atualizar Kanban primitive — V1 já não aplica transform no source |
| Checkbox visível ao desmarcar | Bug antigo (`group-focus-within` mantém visível) | Corrigido na V1 — usa `group-focus-visible` |
| Card "fica grande" no hover sem checkbox | `reserveCheck` aplicado por default | Corrigido na V1 — variant `reserveCheck` só ativa quando `onToggleSelect` é fornecido |
| Avatar com letra desproporcional/desalinhada | Avatar shadcn antigo, sem `<Avatar>` iGreen | Use `<Avatar size="xs\|sm\|md\|lg\|xl" colorHex={hex}>{initials}</Avatar>` |
| Scrollbar grossa demais | Não usa utility DS | Migrado pra `scrollbar-thin` (utility @utility no `tailwind-theme.css`) — V1 já aplica |
| `onCardMove` chamado mas card não move | Esquema reverse: consumer não atualiza `cards` props | Optimistic update via setState (veja DnD recipe) |
| DnD não preserva keyboard navigation | KeyboardSensor não fornecido | Já incluído via `useKanbanDnD` interno — nada a fazer |

---

## Versão atual: V1 — production-ready

**O que entrou na V1** (refator completo 2026-05):
- Bugs corrigidos: checkbox focus-within, avatar typography desalinhada, hover shift sem checkbox, scroll horizontal durante drag
- Features novas: `renderCard` slot, `getCardMenuItems`/`getColumnMenuItems` padronizados, DnD entre colunas com placeholder localizado + feedback visual de coluna inválida, empty state com ícone
- DS conformance: 3 botões raw → `<Button>` DS, 10+ hardcoded tokens migrados, scrollbar via utility `scrollbar-thin`, Avatar iGreen consumido nas previews
- Integração: `<DataTable viewMode="kanban" kanbanConfig={...}>` orquestra filter/sort/search/selection compartilhados

**Defer pra V2** (não bloqueia produção):
- Virtualização por coluna (cards count > 1000)
- Multi-level grouping (swimlanes)
- WIP limits per coluna (count + visual warning)
- Reordenação dentro da mesma coluna (hoje DnD só move entre colunas)
- Saved views capturarem `viewMode` no DataTable persistence
