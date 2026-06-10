---
name: crud-builder-kanban
description: >
  Sub-fluxo do CRUD Builder — design guiado da visão kanban. Carregar SÓ se o
  usuário quiser kanban (Fase 5 da entrevista). Referências canônicas:
  ClientsKanbanPreview.tsx + Kanban/USAGE.md.
---

# CRUD Builder — Design do Kanban

Pré-requisito (da Fase 2): existir coluna `select`/`status` com
`filterOptions` completas. Sem isso → voltar e definir antes.

## Entrevista guiada (drill-down)

### 1. `groupByField`

Qual campo agrupa os cards? Deve ser a coluna select/status confirmada.
Validar: cada valor possível do campo vira uma lane.

### 2. Lanes (1 por option do campo)

Pra CADA option, confirmar:

| Item | Default | Notas |
|---|---|---|
| `id` | `option.value` | precisa bater com o valor do campo |
| `label` | `option.label` | |
| `dotColor` | cor da option (`filterOptions[].color`) | semântica DS: success/warning/danger/muted/primary |
| `canReceiveDrop` | `true` | `false` pra estados terminais (ex: "Inativo", "Cancelado") |

Ordem das lanes = fluxo do processo (esq → dir). Confirmar a ordem.

### 3. Card — mapping de slots (sugerir pelos tipos da Fase 2)

`renderCard: ({ row }) => ({ ...slots })` — sugerir automaticamente:

| Slot | Sugestão automática | Fonte |
|---|---|---|
| `title` | coluna `isPrimary` | obrigatório |
| `subtitle` | email ou segunda coluna text relevante | opcional |
| `avatar` | coluna `user` (avatar + initials) | opcional |
| `chip` | a própria option do groupByField OU outra coluna status/badge | opcional |
| `value` | coluna `currency` | opcional |
| `footerLeft` | tags / categoria secundária | opcional |
| `footerRight` | coluna `date` (relativa: "há 3 dias") | opcional |

Apresentar o mapping sugerido em tabela → usuário ajusta em lote.
Override total do miolo (`renderCardContent`) só se o usuário pedir layout
custom — anotar como render custom no blueprint.

### 4. Drag & drop

- `enableDnD`? Default: **sim** se o campo representa um fluxo editável
  (status de processo); **não** se é classificação fixa.
- Se sim: `onCardMove(cardId, from, to)` com **optimistic update** —
  client mode: `setRows(prev => prev.map(r => id(r) === cardId ? { ...r, [groupByField]: to } : r))`;
  server mode: PATCH + rollback no reject.
- Lanes com `canReceiveDrop: false` ficam fora do drop (visual de bloqueio é
  automático).

### 5. Extras (default off — só perguntar se contexto pedir)

`onAddCard` / `onAddInFooter` (criar card na lane) · `getCardMenuItems`
(menu ⋯ do card) · `getColumnMenuItems` · `emptyLabel`/`addLabel` custom.

## Regras de integração (guardrails 6)

- `viewMode` **controlado**: `const [viewMode, setViewMode] = useState<DataTableViewMode>("table")`
  + `viewMode={viewMode} onViewModeChange={setViewMode} kanbanConfig={KANBAN_CONFIG}`.
- Toggle table/kanban na toolbar é auto-renderizado quando `viewMode` +
  `kanbanConfig` presentes (override via `toolbar.viewToggle`).
- Filtros/search/sort aplicam transparente nas duas views — não duplicar lógica.
- Flags de toolbar que só fazem sentido em table (`enableColumns`,
  `enableDensity`) podem ser condicionais: `enableColumns: viewMode === "table"`.
- Pagination tipicamente `enabled: viewMode === "table"` (board mostra tudo).

## Saída

Bloco "Kanban" do blueprint:

```
groupByField `<campo>` · lanes: <id>(<dotColor>)→... · canReceiveDrop: <exceções>
card: title=<f> subtitle=<f> avatar=<f> chip=<f> value=<f> footerRight=<f>
DnD <on|off> (optimistic) · extras: <add/menus|nenhum>
```

Antes de gerar: LER `src/preview/pages/ClientsKanbanPreview.tsx` (shape real de
`DataTableKanbanConfig`) + `src/components/ui/Kanban/USAGE.md`.
