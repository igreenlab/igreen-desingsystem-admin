# Scheduler

**Categoria:** Data Display · **Dep:** `date-fns`

Calendário de **eventos ao longo do tempo**, com 4 modos de visualização
(mês · semana · dia · lista), toolbar embutida e detalhe por callback.

A toolbar traz: título do período + grupo `‹ Hoje ›` à esquerda; e à direita
busca, área custom, **seletor de view** (dropdown), **Filtro** e ação primária —
nessa ordem, do recorte mais amplo (qual período) pro mais específico (o que
dentro dele).

**O botão Filtro carrega dois sinais independentes:**

- **Verde** (`primary soft` + `border-border-brand` → brand a **14%** de
  opacidade, texto e borda em brand) = a ferramenta está **engajada**: painel
  aberto **ou** filtro aplicado.
- **Ponto** no canto = existe **filtro aplicado**, e só isso.

| Situação | Verde? | Ponto? |
|---|---|---|
| nada aberto, nada filtrado | não | não |
| painel aberto, sem filtro | **sim** | não |
| filtro aplicado, painel fechado | **sim** | **sim** |
| filtro aplicado, painel aberto | **sim** | **sim** |

A cor é a mesma receita do `ToolbarToolButton` do `TableToolbar` — o precedente
do DS pra "esta ferramenta tem algo ligado". O ponto **não** é redundante com
ela: é o que separa "abri pra olhar" de "tem filtro mexendo no que eu vejo", e é
o portador não-cromático da informação pra quem não distingue o verde.

O botão Filtro abre um **painel-coluna à direita da grade** — não um overlay.

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

## Estado atual — o que está e o que NÃO está pronto

Leia antes de planejar uma tela em cima disto:

| | Status |
|---|---|
| view `month` | ✅ grade 6×7, multi-dia com pontas truncadas, `+N mais` em popover, `+` de criar no hover |
| views `week` / `day` | ✅ a MESMA view (`views/time-grid.tsx`) com 7 ou 1 coluna — gutter de horas, banda de dia inteiro, lane-packing, linha do "agora", faixa de hora clicável |
| view `list` | ✅ agenda agrupada por dia, **só os dias que têm evento** |
| drag & drop | ✅ mover no mês (muda a data, preserva hora e duração), mover em week/day (coluna + minutos snapados), **redimensionar** pela borda do bloco em week/day |
| navegação por teclado | ✅ roving tabindex — cada grade é **uma** parada de `Tab`, setas movem dentro, `Home`/`End` vão às pontas da linha, `Enter` cria no slot focado |

O núcleo é puro e testado: `hooks/layout.test.ts` (51 casos de borda) mais
`hooks/use-scheduler-dnd.test.ts` (19 casos da resolução do drop).

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
| `toolbarActions` | `ReactNode` | — | área custom, entre o filtro e o seletor de view |
| `defaultFilterPanelOpen` | `boolean` | `false` | o painel-coluna de filtro já vem aberto |
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

### 1. O pai precisa ter altura — e é a altura dele que dimensiona tudo

A grade é `flex-1` dentro de um `flex-col`. Num pai sem altura definida ela
colapsa pra altura mínima das células. Embrulhe em algo com altura
(`h-[720px]`, ou `flex-1 min-h-0` numa página que já tem altura).

**Não existe prop de "tela cheia".** O componente já é `h-full`: pra usá-lo como
página inteira, dê `h-screen` ao container e deixe o `Scheduler` em `flex-1`.

E isso não é só esticar — **a célula do mês passa a caber mais eventos**. O corte
do `+N mais` é derivado da altura MEDIDA da linha, como as linhas da tabela.
Medido no browser, mesmo dataset:

| viewport | altura da linha | pills por célula | células com "+N mais" |
|---|---|---|---|
| 800px | 76px | **2** | 13 |
| 1400px | 176px | **6** | 2 |

Pra travar num número fixo (quando a tela precisa de altura de linha previsível
independentemente do conteúdo), a view de mês aceita `maxPerCell` — mas o
default adaptativo é o que aproveita a tela.

Exemplo vivo: **Example: Scheduler tela cheia** no menu do showcase
(`#/scheduler-full`).

> ⚠️ A re-medição pós-montagem depende de `ResizeObserver`. Ela **não pôde ser
> verificada** no browser de teste: a emulação de viewport por CDP não dispara
> `ResizeObserver`, nem `window.resize`, nem `MediaQueryList.change` — medido,
> zero callbacks nos três. O que foi verificado é a montagem correta em cada
> altura (a tabela acima veio de reloads reais). Em browser de verdade o
> `ResizeObserver` é o mesmo mecanismo que o resto do DS usa.

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

### 4b. O painel de filtro é uma COLUNA, e some abaixo de 1024px

O botão **Filtro** não abre popover nem sheet: abre uma coluna à direita que
**empurra** a grade (~296px). É deliberado — filtro é o controle cujo resultado
você quer ver *enquanto* mexe, e por cima da grade isso viraria
marcar → fechar → olhar → reabrir.

Três consequências práticas:

- **A grade encolhe.** Se a sua tela é estreita, prefira deixar
  `defaultFilterPanelOpen` em `false` (o default).
- **O cabeçalho do painel é `sticky` e a barra é a do DS.** O bloco "Filtros /
  Limpar / ×" fica fixo no topo enquanto o resto rola, com `bg-bg-surface`
  opaco — `sticky` não cria fundo, e sem ele o mini-calendário passaria por
  baixo do título. A rolagem usa `scrollbar-thin`, a `@utility` do tema gerado
  (trilho transparente + thumb tokenizado), que é o padrão do repo com 26 usos.
- **O painel nunca estica a altura da linha.** Ele acompanha a altura da grade e
  **rola por dentro** (medido: 664px de caixa com 958px de conteúdo). É por isso
  que o root é `h-full` — sem isso ele dimensionava por conteúdo, o painel ficava
  mais alto que a grade e passava a mandar na altura das duas, vazando pra fora
  do container. Se você vir o calendário cortado, o pai é que está sem altura
  (gotcha nº 1).
- **Abaixo de 1024px o painel não existe.** A coluna extra não cabe junto de
  uma semana legível, então nessa faixa o botão fica **desabilitado** com
  `title` explicando. Não é bug: é a alternativa a alternar um estado que o CSS
  esconde.

O breakpoint vive em dois lugares — o `lg:flex` de `schedulerFilterAside` e o
`useMediaQuery("(min-width: 1024px)")` em `scheduler.tsx`. CSS resolve layout,
JS resolve o estado do botão; se mudar, mude os dois.

### 4c. "Nada marcado" = sem filtro, não "esconde tudo"

Num app de calendário de verdade, desmarcar todas as agendas esconde tudo.
**Aqui não**: campo sem opção marcada significa *sem restrição* — a convenção do
`filterModel` do DS, a mesma do `DataTable` e do `DataList`. O cabeçalho do
grupo mostra **"Todas"** nesse estado, pra não parecer que a seleção se perdeu.

Inverter isso só neste componente faria o mesmo `filterModel` significar coisas
opostas em telas diferentes.

### 4d. A contagem ao lado da opção ignora os filtros de campo

O número é "quantos eventos casam com a **busca** e têm esta opção" — **não**
"quantos vou ver se marcar".

A base exclui de propósito todos os filtros de campo, inclusive o do próprio
campo, pra que os números fiquem **estáveis enquanto você marca e desmarca**.
Com a facet count clássica (base = os outros campos já aplicados), cada clique
mexeria nos números das outras listas, e a leitura vira alvo móvel exatamente na
hora de decidir. As duas leituras são defensáveis; confundi-las é que engana.

### 5. `filterFields` no modo `client` só filtra 3 ids

`categoryId`, `tagIds` e `color`. Qualquer outro `id` **renderiza o chip e não
filtra nada** — o componente emite `console.warn` em DEV nomeando o campo.
Para filtrar por campo próprio, use `filterMode="server"` e filtre fora.

### 5b. Drag & drop: você PRECISA aplicar a mudança

O componente é dumb sobre mutação — ele emite e para:

```tsx
const [eventos, setEventos] = useState(EVENTOS);
const aplicar = ({ id, start, end }) =>
  setEventos((a) => a.map((e) => (e.id === id ? { ...e, start, end } : e)));

<Scheduler
  events={eventos}
  draggable
  resizable
  onEventMove={aplicar}
  onEventResize={aplicar}
/>
```

O que cada gesto significa:

| gesto | resultado |
|---|---|
| arrastar no **mês** | muda a **data**; hora e duração preservadas |
| arrastar em **week/day** | combina coluna (dia) + `delta.y` (minutos, snapado por `snapMinutes`) |
| arrastar a **borda** do bloco (week/day) | muda a **duração**, uma ponta só |

Detalhes que evitam surpresa:

- **A duração nunca é snapada separadamente.** Um evento de 50min movido continua
  com 50min — snapar as duas pontas o encurtaria pra 45 a cada arrasto.
- **Resize não existe no mês** (a altura da pílula não representa duração) nem em
  evento `allDay`.
- **All-day em week/day ignora o `delta.y`** e só troca de dia: ele mora na banda,
  não na grade de horas.
- **Arrastar pra baixo perto do fim da grade encosta no limite** em vez de vazar
  pro dia seguinte. Mudar de dia se faz atravessando a coluna — o gesto explícito.

> ⚠️ O gesto real **não pôde ser verificado no browser de teste**: o
> `PointerSensor` do dnd-kit usa `setPointerCapture` com `pointerId` real, e nem
> `left_click_drag` nem `PointerEvent` sintéticos ativam o arraste — medido, o
> evento não sai do lugar. A resolução do drop é coberta por
> `hooks/use-scheduler-dnd.test.ts` (19 casos), e a presença dos alvos foi
> medida no DOM: 12 blocos e 24 alças na view de semana.

### 5c. Teclado: a grade é UMA parada de `Tab`

Roving tabindex (padrão WAI-ARIA de `grid`): a célula ativa tem `tabIndex=0`, as
outras `-1`.

| tecla | ação |
|---|---|
| `←` `→` | dia anterior / seguinte |
| `↑` `↓` | mesma coluna, linha acima / abaixo (mês: semana; week/day: hora) |
| `Home` / `End` | início / fim da **linha** — não da grade |
| `PageUp` / `PageDown` | primeira / última célula |
| `Enter` ou `Space` | cria no slot focado (dispara `onSlotClick`) |

Sem isso a grade do mês custava **42 `Tab`** e a da semana **168**. O `+` de
criar tem `tabIndex={-1}` de propósito: ele é alcançado pelo `Enter` na célula,
e deixá-lo tabbável reintroduziria as 42 paradas.

Medido no browser: `→` levou de 0 pra 1, `↓` de 1 pra 8 (+7), `Home` de 8 pra 7
(início da linha), com sempre exatamente 1 célula em `tabIndex=0`.

### 6. `draggable` e `resizable` nascem `false`

Deliberado (mesmo default do `enableDnD` do `Kanban`): dnd ligado sem
`onEventMove` conectado deixa o usuário arrastar e ver o evento voltar sozinho
— o pior estado possível, porque parece bug do app.

O componente **não liga o dnd** se não houver `onEventMove`/`onEventResize`
conectado, e em DEV avisa por `console.warn` nomeando qual falta. `event.draggable`
e `event.resizable` sobrepõem por evento — é como se diz "esta reunião é fixa"
sem desligar o board todo.

### 6b. `SchedulerFilterPanel` também é exportado solto

Mesmo padrão do `TableToolbar`, que expõe `ToolbarSearch`, `ToolbarSegmented` e
as outras partes pelo barrel. Serve pra tela que queira posicionar o painel em
outro lugar do próprio layout — e pra doc page, que o renderiza isolado pra
mostrar a anatomia (cabeçalho sticky · mini-calendário · um grupo por campo).

**Em uso normal você não precisa dele:** o `Scheduler` monta e controla o seu.
Usando solto, todo o estado é seu — `filterModel`, `counts`, `date`, `now` e os
callbacks vêm por prop, e nada é derivado sozinho.

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
