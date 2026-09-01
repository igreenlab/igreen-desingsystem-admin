# Scheduler

**Categoria:** Data Display · **Dep:** `date-fns`

Calendário de **eventos ao longo do tempo**, com 4 modos de visualização
(mês · semana · dia · lista), toolbar embutida (navegação de período, busca,
filtros declarativos, seletor de view), e detalhe por callback.

> ⚠️ **Não confunda com `Calendar`.** `Calendar` é o primitivo
> shadcn/react-day-picker: **seletor de data** dentro de um form. O `Scheduler`
> exibe **eventos**. As intenções são opostas, por isso os nomes são distintos.

---

## Quando usar

| Precisa de | Use |
|---|---|
| escolher uma data num campo | `Calendar` / `DatePicker` |
| escolher mês+ano | `MonthYearPicker` |
| **ver compromissos numa grade de tempo** | **`Scheduler`** |
| grade de registros com colunas | `DataTable` |
| lista de cards | `DataList` |
| quadro por estágio de workflow | `Kanban` |

---

## ⛔ Estado atual — o que NÃO está pronto

Leia antes de planejar uma tela em cima disto:

| | Status |
|---|---|
| view `month` | ✅ completa — grade, navegação, busca, filtros, `+N mais`, clique no evento, `+` de criar |
| views `week` · `day` · `list` | ⛔ **placeholder** — renderizam um aviso "em construção" |
| drag & drop (mover / redimensionar) | ⛔ não implementado; `onEventMove`/`onEventResize` existem na API e **não são chamados** ainda |
| navegação por teclado na grade | ⛔ não implementada (o foco por `Tab` funciona) |

O núcleo puro que as views faltantes vão consumir (`hooks/layout.ts`:
lane-packing, spans multi-dia, snap, resize) **já está implementado e testado**
— 36 testes unitários em `hooks/layout.test.ts`.

---

## Props essenciais

| Prop | Tipo | Default | Nota |
|---|---|---|---|
| `events` | `SchedulerEvent[]` | — | nunca é mutado pelo componente |
| `view` / `defaultView` | `"month" \| "week" \| "day" \| "list"` | `"month"` | controlado / não-controlado |
| `date` / `defaultDate` | `Date` | hoje | idem |
| `onDateChange` · `onViewChange` | `(v) => void` | — | **obrigatórios no modo controlado** |
| `locale` | `Locale` (date-fns) | en-US | passe `ptBR` |
| `weekStartsOn` | `0`–`6` | `0` (domingo) | |
| `hourFormat` | `"12h" \| "24h"` | `"24h"` | |
| `onEventClick` | `(event, evt) => void` | — | é assim que o detalhe abre |
| `onSlotClick` | `(start, end) => void` | — | o `+` revelado no hover da célula |
| `searchable` | `boolean` | `true` | |
| `filterFields` | `SchedulerFilterField[]` | — | declarativo; o componente filtra sozinho |
| `filterModel` | `Record<string, string[]>` | — | controlado / **pré-aplicado** |
| `filterMode` | `"client" \| "server"` | `"client"` | `server` só emite |
| `toolbarActions` | `ReactNode` | — | a área custom da toolbar |
| `primaryAction` | `ReactNode` | — | botão primário à direita |
| `renderEvent` | `({event, view, selected}) => ReactNode` | — | troca só o miolo |

### `SchedulerEvent`

| Campo | Tipo | Nota |
|---|---|---|
| `id` | `string` | |
| `title` | `ReactNode` | |
| `start` · `end` | `Date` | **`end` é obrigatório**; duração zero se diz `end === start` |
| `allDay` | `boolean` | |
| `color` | `"brand" \| "info" \| "success" \| "warning" \| "danger" \| "neutral"` | default `"brand"` |
| `categoryId` · `tagIds` | `string` · `string[]` | filtráveis |
| `description` | `ReactNode` | aparece na view `list` |
| `searchText` | `string` | **necessário quando `title` não é string** |
| `meta` | `unknown` | payload cru, devolvido em `onEventClick` |

---

## Exemplo mínimo

```tsx
import { ptBR } from "date-fns/locale";
import { Scheduler } from "@/components/ui/Scheduler";

<div className="h-[720px]">
  <Scheduler
    events={eventos}
    locale={ptBR}
    filterFields={[
      { id: "categoryId", label: "Categoria", options: [
        { value: "interna", label: "Interna" },
        { value: "cliente", label: "Cliente" },
      ]},
    ]}
    onEventClick={(evento) => setSelecionado(evento)}
    primaryAction={<Button variant="filled" size="sm">Novo evento</Button>}
  />
</div>
```

---

## Gotchas

### 1. O pai precisa ter altura

A grade é `flex-1` dentro de um `flex-col`. Num pai sem altura definida ela
colapsa pra altura mínima das células. Embrulhe em algo com altura
(`h-[720px]`, ou `flex-1 min-h-0` numa página que já tem altura).

### 2. A cor **nunca** vai no texto — e nunca é o único portador da informação

Medido em WCAG antes de decidir: `text-fg-{cor}` sobre a pílula tingida dá
**1.72–4.49** no claro e **2.97–4.31** no escuro. Nenhuma das 6 famílias passa
AA, e `warning` chega a 1.72:1.

Por isso o texto é sempre `fg-default` (medido no browser: **16.2–18.2** no
claro, **16.4–17.8** no escuro — AAA nos dois modos) e a cor mora no **dot, na
borda e no tint de fundo**.

Corolário pra quem monta a tela: **cor é reforço**. O título tem que dizer o
que o evento é — quem não distingue as cores precisa continuar entendendo a
agenda.

### 3. O teto real é ~5 categorias, não 6

`brand` (matiz 151) e `success` (161) estão a **10°** de distância. Como tint a
14% os dois viram praticamente o mesmo off-white — **não use os dois como
categorias distintas no mesmo calendário**.

`info` é matiz 280, ou seja **violeta**: se você precisa de "roxo", ele já
existe.

Precisa de 6+ categorias simultâneas e distinguíveis? Isso é o gatilho pra
abrir uma paleta categórica própria (`event-*`) via cascata de token — não
force a união atual.

### 4. Busca não lê `title` rico

O motor casa **só string**: `searchText`, `title` (se for string),
`description` (idem) e `tagIds`. Varrer a árvore de um `ReactNode` é caro e
frágil, então não é feito.

Consequência: `title={<b>Reunião</b> — Cliente X}` **não é encontrável** —
falha em silêncio. Declare `searchText` nesses casos.

### 5. `filterFields` no modo `client` só filtra 3 ids

`categoryId`, `tagIds` e `color`. Qualquer outro `id` **renderiza o chip e não
filtra nada** — o componente emite `console.warn` em DEV nomeando o campo.
Para filtrar por campo próprio, use `filterMode="server"` e filtre fora.

### 6. `draggable` e `resizable` nascem `false`

Deliberado (mesmo default do `enableDnD` do `Kanban`): dnd ligado sem
`onEventMove` conectado deixa o usuário arrastar e ver o evento voltar sozinho
— o pior estado possível, porque parece bug do app. **Nesta versão o dnd ainda
não está implementado**, então ligar as props não faz nada.

### 7. O painel de detalhe é seu, não do componente

O `Scheduler` não importa `FloatingPanel`. Ele emite
`onEventClick(event, evt)` e devolve `event.meta` intacto; quem monta o painel
é a tela. O padrão de referência é o bloco **`dsgreen-paneldetail-2`**
(`side="right"`, `size="lg"`, `titleSlot` com o contexto, lista plana de
propriedades) — há um exemplo completo em `src/preview/pages/SchedulerDoc.tsx`.

⚠️ O body do `FloatingPanel` **não tem gap entre filhos**. Sem um wrapper
`flex flex-col gap-gp-2xl`, título e lista ficam colados.

### 8. No mês, evento multi-dia aparece por dia, não como barra contínua

`hooks/layout.ts` já calcula `colStart`/`colSpan` por linha, mas a view desenha
o evento em **cada dia que ocupa**, com as pontas truncadas marcando a
continuação. A barra única atravessando as colunas exige reservar a mesma faixa
vertical em todas as células (lane-packing por linha da grade) e vem com o dnd.
A extensão do evento é lida corretamente — o que falta é refinamento visual.

### 9. `filterModel` pré-aplicado é o caminho certo pra "já vem filtrado"

Nunca monte um form de filtro acima da grade (L-051). Passe `filterModel` e o
chip aparece já aplicado, com o `×` pra desfazer.

### 10. Nada aqui importa de `TableToolbar`

A gramática visual do segmented, da busca e dos chips é **copiada** em
`scheduler.styles.ts`, não importada. Cross-import entre pastas de `ui/` é o
que gerou o `registryDependency` dangling da L-049 (`@igreen/table-toolbar` não
existe como item de registry). Se você editar o visual da toolbar do
`TableToolbar`, considere se esta cópia deve acompanhar.
