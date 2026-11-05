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

> ⚠️ **Vocabulário.** O board tem **dois** eixos: **colunas** (o `groupByField`) e
> **raias/swimlanes** (o `groupBy` do DataTable). Nos textos antigos "lane" queria
> dizer **coluna** — não use a palavra pra nenhum dos dois.

### 1. `groupByField` — o campo das COLUNAS

Qual campo define as colunas do board? Deve ser a coluna select/status confirmada.
Validar: cada valor possível do campo vira uma coluna.

### 1b. Raias (2º eixo) — PERGUNTAR SEMPRE

"Dentro de cada coluna, os cards devem ficar agrupados por algo — épico, responsável,
cliente?" Se sim, isso são **raias (swimlanes)**, e saem de graça: é o **`groupBy` do
DataTable**, o mesmo estado que agrupa linhas na tabela — entra no `persistId` e nas
visões salvas sem código novo. **Não há prop de raia no `kanbanConfig`** além de
`ungroupedLaneLabel` (rótulo dos cards sem valor no `groupBy`; `null` esconde a raia).

```tsx
<DataTable groupBy="epico" viewMode="kanban"
  kanbanConfig={{ groupByField: "status", renderCard, ungroupedLaneLabel: "Sem épico" }} />
```

- Sem `groupBy` → board plano (o default).
- `groupBy` **igual** ao `groupByField` é **ignorado** — daria uma raia por coluna com
  todos os cards dela. Valide que são campos diferentes.
- Recolher uma raia recolhe em **todas** as colunas: a raia é uma faixa horizontal.
- ⚠️ Avise o usuário: **arrastar move o card entre COLUNAS, nunca entre raias.** Trocar
  de épico/responsável é decisão de domínio → item do menu do card, não gesto.

### 2. Colunas (1 por option do campo)

Pra CADA option, confirmar:

| Item | Default | Notas |
|---|---|---|
| `id` | `option.value` | precisa bater com o valor do campo |
| `label` | `option.label` | |
| `dotColor` | cor da option (`filterOptions[].color`) | semântica DS: success/warning/danger/muted/primary |
| `canReceiveDrop` | `true` | `false` pra estados terminais (ex: "Inativo", "Cancelado") |

Ordem das colunas = fluxo do processo (esq → dir). Confirmar a ordem.

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
- Colunas com `canReceiveDrop: false` ficam fora do drop (visual de bloqueio é
  automático).
- O drop troca o valor do **`groupByField`**, nunca o da raia.

### 5. Extras (default off — só perguntar se contexto pedir)

`onAddCard` / `onAddInFooter` (criar card na coluna) · `getCardMenuItems`
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
groupByField `<campo>` (COLUNAS) · colunas: <id>(<dotColor>)→... · canReceiveDrop: <exceções>
raias (2º eixo, = `groupBy` do DataTable): <não | `<campo>` · ungroupedLaneLabel=<rótulo|null>>
card: title=<f> subtitle=<f> avatar=<f> chip=<f> value=<f> footerRight=<f>
DnD <on|off> (optimistic, move entre COLUNAS) · extras: <add/menus|nenhum>
```

Antes de gerar: LER `src/preview/pages/ClientsKanbanPreview.tsx` (shape real de
`DataTableKanbanConfig`) + `src/components/ui/Kanban/USAGE.md`.
