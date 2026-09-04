# Gantt

Cronograma de projeto: hierarquia de tarefas à esquerda, tempo à direita, e
**vínculos** entre as barras. Categoria: data-display.

## Quando usar

Quando a pergunta é **"o que depende de quê"**. Sem vínculo isto é uma timeline,
não um Gantt — e o DS já tem timeline.

| Precisa de | Use |
|---|---|
| escolher **uma data** num formulário | `DatePicker` · `Calendar` · `MonthYearPicker` |
| mostrar **quando** algo acontece (compromisso, reserva, agenda) | `Scheduler` |
| mostrar **o que bloqueia o quê**, com hierarquia e progresso | **`Gantt`** |
| linhas de registro sem eixo de tempo | `DataTable` · `DataList` |

## Import

```tsx
import { Gantt } from "@/components/ui/Gantt";
import type { GanttRow, GanttLink, GanttColumn } from "@/components/ui/Gantt";
```

## Exemplo mínimo

```tsx
<Gantt
  rows={[
    { id: "fase", label: "Descoberta", type: "summary", bars: [] },
    {
      id: "t1", label: "Entrevistas", parent: "fase",
      bars: [{ id: "b1", label: "Entrevistas", start: d1, end: d2,
               colorKey: "chart-1", progress: 100 }],
    },
    {
      id: "t2", label: "Escopo", parent: "fase",
      bars: [{ id: "b2", label: "Escopo", start: d2, end: d3, colorKey: "chart-1" }],
    },
  ]}
  links={[{ id: "v1", source: "b1", target: "b2", type: "FS" }]}
  searchable
  locale={ptBR}
  onBarClick={(bar, row) => abrirDetalhe(row.id)}
/>
```

## Props essenciais

| Prop | Tipo | Default |
|---|---|---|
| `rows` | `GanttRow[]` | — |
| `links` | `GanttLink[]` — ausente = sem setas | — |
| `view` | `"timeline" \| "calendar"` | `"timeline"` |
| `windowStart` / `windowEnd` | `Date` — **do consumidor** | derivada dos dados |
| `granularity` | `"day" \| "week" \| "month" \| "quarter"` | `"day"` |
| `columns` | `GanttColumn[]` | nome + início + fim |
| `gridWidth` | `number` — largura inicial; o divisor é arrastável | `360` |
| `draggable` / `resizable` / `linkable` | `boolean` | **`false`** |
| `criticalPath` | `boolean` — liga o realce | **`false`** |
| `criticalPathToggle` | `boolean` — mostra o botão "Crítico" na toolbar | `true` |
| `onBarClick` | `(bar, row, evt) => void` | — |
| `onBarMove` / `onBarResize` | `(change) => void` — **emite, não aplica** | — |
| `onLinkViolations` | `(violations) => void` | — |
| `onGraphError` | `({ kind: "cycle", barIds }) => void` | — |

`GanttBar`: `{ id, start, end, label?, searchText?, colorKey?, progress?, continuesBefore?, continuesAfter?, meta? }`
`GanttLink`: `{ id, source, target, type?, lag? }`
`GanttFilterField`: `{ id, label, kind?, options?, accessor, searchable?, placeholder? }`

### Filtro — os 6 `kind`

O vocabulário espelha o da `DataTable`, pra o usuário ler a mesma frase nas duas
telas: *"Status é Ativo"*, *"Duração entre 3 e 10"*, *"Início a partir de 01/09/26"*.

| `kind` | Controle no painel | `filterModel[id]` | Operador no chip |
|---|---|---|---|
| `multi` *(default)* | checkboxes + busca (≥7 opções) + "selecionar todas" | valores marcados | `é` |
| `single` | radio | um valor | `é` |
| `text` | um campo de texto | `[termo]` | `contém` |
| `number` | dois campos numéricos | `[min, max]` — `""` = livre | `entre` / `≥` / `≤` |
| `date` | dois campos de data | `[de, até]` — `""` = livre | `entre` / `a partir de` / `até` |
| `boolean` | radio Sim/Não (ou seus `options`) | `["true"]` \| `["false"]` | `é` |

```tsx
const FILTROS: GanttFilterField[] = [
  { id: "frente", label: "Frente", options: [...], accessor: r => meta(r).frente },
  { id: "desc", label: "Descrição", kind: "text", accessor: r => meta(r).descricao },
  { id: "dur", label: "Duração", kind: "number", accessor: r => dias(r) },
  { id: "inicio", label: "Início", kind: "date", accessor: r => r.bars[0]?.start },
  { id: "ok", label: "Concluída", kind: "boolean", accessor: r => r.bars[0]?.progress === 100 },
];
```

⚠️ **`GanttFilterModel` não mudou de forma** — segue `Record<string, string[]>`. Os 6
tipos codificam o valor em `string[]`, então `filterModel` controlado, persistência e
"Limpar tudo" que você já tinha continuam funcionando **sem migração**.

## Gotchas / cuidados

### 1. O pai precisa ter altura

O componente é `h-full`. Sem altura no pai, ele colapsa e você vê só a toolbar.

```tsx
<div className="flex h-[520px] flex-col">   {/* ou h-full num pai com altura */}
  <Gantt … />
</div>
```

### 2. `links` referencia id de BARRA, não de linha

```tsx
rows:  { id: "t1", bars: [{ id: "b1", … }] }
links: { source: "b1", target: "b2" }        // ✅ id da barra
links: { source: "t1", target: "t2" }        // ❌ silenciosamente ignorado
```

Uma linha-contêiner tem N barras, e o vínculo é entre trabalhos. Vínculo cujas
pontas não existem é **ignorado**, não reportado como erro — referência pendente
acontece em paginação e em edição otimista, e tratar como conflito encheria a
tela de falso positivo transitório.

### 3. O componente NÃO reagenda

Arrastar emite `onBarMove`. Vínculo violado emite `onLinkViolations` com o
déficit em dias. **Nada se move sozinho.**

Corrigir cronograma é decisão de negócio: mover a tarefa que atrasou, cortar
escopo, aceitar o atraso ou renegociar o vínculo são quatro respostas diferentes
pro mesmo conflito. Datas reescritas sozinhas parecem dados, e o erro seria
invisível.

### 4. A janela é do consumidor

`windowStart`/`windowEnd` vêm por prop, e as setas `‹ ›` **não fazem nada**
quando você as controla — mover é sua decisão. Omitidas, o componente mantém a
janela em estado próprio, derivada dos dados na primeira montagem.

### 5. `progress: undefined` ≠ `progress: 0`

Ausente = "não rastreia progresso", e não desenha trilha nenhuma.
`0` = "rastreia, e está em zero", e desenha a trilha vazia. Os dois estados
aparecem lado a lado em cronograma real.

### 6. A cor diz CATEGORIA, não estado

`colorKey` usa a paleta de chart (`chart-1`…`chart-5`) porque no Gantt a cor diz
**qual frente**. Status vai em `row.trailing` como `Chip`:

```tsx
{ id: "fase", label: "Design", type: "summary", bars: [],
  trailing: <Chip size="sm" variant="soft" color="warning">Em andamento</Chip> }
```

Azul (`chart-3`) é legítimo aqui: o `DESIGN.md` proíbe azul na **interface**, e o
`Chart/USAGE.md` o inclui como **dado categórico**. Barra de Gantt é dado.

### 7. A barra é tingida, não sólida com texto branco

Se você vier de uma referência com barra saturada e texto branco: o DS não faz
isso, e a razão foi **medida** — texto branco ou colorido sobre pílula tingida dá
contraste de **1.72–4.49 no light**, e nenhuma família passa AA. A cor viva vive
no acento da borda esquerda e no preenchimento de progresso; o texto é
`fg-default`.

### 8. `summary` deriva o intervalo dos filhos

`type: "summary"` com `bars: []` calcula o intervalo de **toda** a descendência
(não só filhos diretos). Passar `bars` num `summary` vence o cálculo — serve pra
quem tem o agregado do servidor.

O intervalo é derivado de **todas** as linhas, não das visíveis: colapsar não
encolhe a barra do summary, porque colapsar é justamente quando ela passa a ser
a única informação.

### 9. Caminho crítico só considera `FS`

Limite conhecido e declarado. Os outros três tipos exigem tratar as duas pontas
como nós independentes no grafo, e implementar isso pela metade daria caminho
crítico **plausível e errado** — que é pior que não ter. `SS`, `FF` e `SF`
continuam sendo validados como conflito; só não entram no cálculo de criticidade.

Ciclo no grafo → `onGraphError` e o crítico simplesmente não pinta. Ciclo é dado
do consumidor, não exceção do componente.

### 10. Uma altura de linha, duas superfícies

`GANTT_ROW_HEIGHT_PX` (48px) é constante e é consumida pelos **dois** painéis. Não
tente sobrescrever por CSS num deles: o desalinho entre nome e barra é o pior
defeito possível aqui, porque produz leitura errada sem parecer quebrado.

### 11. Trocar de escala nunca esconde trabalho

Quando o consumidor não controla `windowStart`/`windowEnd`, trocar a escala faz
duas coisas:

1. **A janela** vira a UNIÃO da largura própria daquela escala (60 dias em
   `day`, 1825 em `quarter`) com a extensão real do cronograma. União e não
   `max` porque ela é idempotente: `day → quarter → day` devolve exatamente a
   janela original. Antes a janela era só a largura da escala, e voltar de
   `quarter` pra `day` recortava em 60 dias — as barras das duas pontas
   desapareciam sem nada dizer que havia mais.
2. **A viewport** recentra no mesmo instante do tempo que estava no meio da
   tela. Sem isso, ir pra `quarter` deixava você olhando o começo de uma janela
   de 5 anos cujos dados vivem no meio dela: canvas vazio.

Com `windowStart`/`windowEnd` controlados, nada disso acontece: a janela é sua,
e o componente não sobrescreve a sua decisão.

### 12. O `accessor` tem que casar com o `kind`

`number` precisa de número (ou string numérica); `date` precisa de `Date` ou ISO;
`boolean` aceita `true`/`1`/`"sim"`. Devolver a coisa errada **não é erro de tipo** —
o `accessor` é declarado largo de propósito — e o campo simplesmente não casa nada.

E `undefined` **exclui** a linha quando o filtro está ativo: filtrar por
"Responsável = Ana" e receber de volta as linhas sem responsável nenhum é o oposto
do pedido.

⚠️ Se você monta o valor de `date` na mão, **não** use `new Date("2026-09-30")`: ISO
date-only é parseado como **UTC** e volta um dia em fuso negativo (medido em UTC−3:
vira 29/09 21:00). O componente usa `parseDiaISO` internamente pelos dois lados —
predicado e chip — pra os dois nunca divergirem.

### 13. Em telas estreitas, declare o limite

Grade + eixo não caben em 375px. O componente não finge que cabe — em vez de
espremer os dois, use `granularity="week"` ou mais, reduza `gridWidth`, ou ofereça
outra visão. Um Gantt legível precisa de ~900px.

## ⚠️ O que ainda NÃO existe

Declarado pra não virar descoberta:

| | Estado |
|---|---|
| `view="calendar"` | **placeholder** — a grade de mês tem o núcleo puro pronto e testado (`buildMonthMatrix`, `computeOverflow`, `daysOfBar`), mas a view não foi montada |
| `draggable` / `resizable` / `linkable` | os punhos e conectores **renderizam** e são acessíveis, mas o gesto não está ligado. ⚠️ Pior que isso: `onBarMove`/`onBarResize`/`onLinkCreate`/`onLinkDelete` estão declarados no tipo e **nem chegam a ser recebidos** pela raiz — é superfície de API sem nada por trás |
| seletor de visão na toolbar | **não existe** — `onViewChange` está na API mas nada o chama. `view` só muda por prop, então `calendar` seria inalcançável pela UI mesmo depois de construída |

O que está completo: as duas visões de dado (tarefa e portfólio), hierarquia com
collapse e **conectores de árvore**, `summary` derivado, marcos, progresso, os
**4 tipos de vínculo** com `lag`, detecção de conflito, caminho crítico, busca,
zoom em 4 escalas, divisor arrastável, **filtro nos 6 tipos** com painel lateral
e chips de aplicado, seleção de linha e de coluna, e virada de mês no eixo.

## Núcleo puro exportado

Útil fora do render — validar cronograma no servidor, calcular crítico num job:

```tsx
import { checkAllLinks, computeCriticalPath, topoSort } from "@/components/ui/Gantt";
import { buildTimeAxis, clipToWindow, packLanes } from "@/components/ui/Gantt";
```

**146 testes** cobrem as bordas: virada de mês, barra que cruza a janela, lane
packing com sobreposição parcial, ciclo em `parent` (que devolvia lista VAZIA até
o teste existir), auto-vínculo, as 4 restrições nas pontas certas, o índice
`ancestorHasNext[i+1]` do conector (L-045) e o parse de `YYYY-MM-DD` como
meia-noite local (com `new Date` era UTC e o filtro de data voltava um dia).
