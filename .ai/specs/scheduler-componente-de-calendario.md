# Spec: `Scheduler` — calendário de eventos

**Status:** `PROPOSTA` — aguardando GATE humano (Regra 4)
**Autor:** DS Designer · **Data:** 2026-09-01
**Tipo:** componente iGreen composto → `src/components/ui/Scheduler/`
**Referência visual:** prints do Untitled UI (`untitledui.com/react/components/calendars`) — month, week, day+detalhe, list/agenda escura com busca + chips.

> Conteúdo é da referência; **pele e comportamento são do DS**. Da referência vêm copy,
> ordem dos campos e a gramática de tela. Do DS vêm fonte, tamanho, peso, cor, espaçamento,
> radius, sombra, foco e comportamento — sempre por token/preset.

---

## 0. Verificações obrigatórias (Regra 1 e Regra 2) — executadas

| Verificação | Resultado |
|---|---|
| `Scheduler` no `.ai/context/components/inventory.md` | ❌ **não existe** — 0 ocorrências |
| `src/components/ui/Scheduler/` no disco | ❌ **não existe** |
| Colisão com `Calendar` | `Calendar` (linha 105 do inventory) é o **primitivo shadcn / react-day-picker** — date-**picker**, escolhe uma data. `Scheduler` exibe **eventos no tempo**. Domínios distintos; o nome `Scheduler` foi escolhido justamente pra não colidir. Idem `DatePicker` e `MonthYearPicker`. |
| Tokens necessários já existem? | ✅ **sim para dimensão, espaço, forma, sombra e tipografia — zero cascata.** Ver §1. A **única** questão em aberto é cor de evento (§2), e a recomendação também é zero cascata. |

**Nenhum token novo é proposto por esta spec.** Regra 1 satisfeita por verificação, não por
suposição — cada classe citada abaixo foi conferida contra o token de origem e, nos casos
não óbvios, contra o CSS gerado (`src/styles/theme/tailwind-theme.css`).

---

## 1. Tokens de dimensão — resolvidos com o que já existe

O risco real de um calendário é inventar altura de linha de hora e largura de gutter na unha.
Não é necessário:

| Necessidade | Token DS | Valor | Verificado |
|---|---|---|---|
| Altura de 1 hora na grade week/day | `h-comp-3xl` | 48px | `--spacing-comp-3xl: 48px` (linha 190 do tema gerado) |
| Largura do gutter de horas | `w-comp-4xl` | 56px | `--spacing-comp-4xl: 56px` (linha 191) |
| Piso de altura da célula de mês | `min-h-comp-4xl` | 56px | idem |
| Altura da toolbar | itens em `h-form-lg` (40px) — como o `TableToolbar` | 40px | `form.lg` |
| Altura do pill de evento (month) | `min-h-comp-2xs` | 20px | `--spacing-comp-2xs: 20px` |
| Alvo de toque do slot vazio (mobile) | `min-h-form-xl` | 44px | WCAG |

⚠️ **A grade do mês NÃO tem altura fixa em px.** `grid grid-rows-6 h-full` + `min-h-comp-4xl`
por célula. Motivo: fixar altura de célula obriga a escolher entre cortar eventos em telas
altas e estourar em telas baixas. `layout.header-lg` (128px) existiria em valor, mas o nome é
"header" — usá-lo pra célula de calendário é exatamente a mentira de nome que a L-060 descreve.

---

## 2. ⚖️ DECISÃO ABERTA — cor do evento

### 2.1 O que a medição mostrou (e muda a pergunta)

Antes de escolher entre A e B, medi o que o DS já entrega. Conversão oklch→sRGB e razão de
contraste WCAG 2.x, com o pill soft montado como o `Chip variant="soft"` monta hoje
(`bg-bg-{cor}-muted` = cor a 14% + `text-fg-{cor}`):

**LIGHT — bg = cor a 14% sobre branco**

| família | hue | bg do pill | `text-fg-{cor}` | `text-fg-default` | `text-fg-muted` |
|---|---|---|---|---|---|
| `brand` | 151 | `#eff2ef` | **4.49** | 17.46 | 5.33 |
| `info` | 280 (violeta) | `#f2f1ff` | **3.49** | 17.62 | 5.38 |
| `success` | 161 | `#eff5f2` | **2.65** | 17.86 | 5.45 |
| `warning` | 81 | `#fef6ef` | **1.72** | 18.42 | 5.63 |
| `danger` | 25 | `#fdf0f0` | **3.38** | 17.65 | 5.39 |

**DARK — bg = cor a 14% sobre `bg-surface` `oklch(0.225 0 0)`**

| família | bg do pill | `text-fg-{cor}` | `text-fg-default` | `text-fg-muted` |
|---|---|---|---|---|
| `brand` | `#1a543c` | **3.96** | 8.37 | 3.35 |
| `info` | `#34326c` | **2.97** | 10.95 | 4.38 |
| `success` | `#1e4935` | **3.48** | 9.61 | 3.85 |
| `warning` | `#684d1d` | **4.31** | 7.45 | **2.98** |
| `danger` | `#652424` | **3.04** | 10.79 | 4.32 |

Três achados que a spec precisa carregar:

1. **O padrão soft do DS não sustenta texto primário.** `text-fg-{cor}` sobre
   `bg-bg-{cor}-muted` — exatamente o que o `Chip soft` faz — fica entre **1.72 e 4.49**.
   Nenhuma família passa AA 4.5:1 no light; `warning` fica em 1.72. Isso **não é defeito
   novo**: é o nível que o `Chip` já entrega hoje, e ali é tolerável porque o chip é rótulo
   secundário ao lado de texto legível. No `Scheduler` o texto do pill **é o conteúdo
   principal** — o mesmo token, com consequência diferente.
2. **`text-fg-default` resolve nos dois modos:** 17.46–18.42 no light, 7.45–10.95 no dark.
   AAA em todos.
3. **`text-fg-muted` falha no dark** (2.98 em `warning`) — logo, a hierarquia dentro do pill
   **não pode ser feita por cor de texto**.

→ **Consequência de design, independente de A ou B:** no pill de evento a cor mora no
**dot / barra de acento sólida + tint de fundo + borda**, nunca no texto. Título e horário
usam `text-fg-default`; a hierarquia entre eles é **peso e tamanho**, não cor.

Isso barateia a decisão: a paleta não precisa mais ser calibrada pra texto — só precisa que
os tons sejam **mutuamente distinguíveis**.

### 2.2 O segundo achado — capacidade real de A

Medindo separação de matiz das famílias existentes: `brand` hue **151** e `success` hue
**161** estão a **10°**. Como tint a 14% viram `#eff2ef` e `#eff5f2` — visualmente o mesmo
off-white. Sólidos (`#00803c` vs `#29ab77`) se distinguem, mas são obviamente a mesma família.

→ A opção A entrega **6 nomes e ~5 categorias praticáveis**, com duas verdes confundíveis.
Os prints usam ~7 tons. Essa é a perda, dita com número.

Nota de crédito para A: `info` é `oklch(0.62 0.210 280)` — **hue 280 é violeta/índigo**, não
azul. O "roxo" dos prints já está coberto. O que falta mesmo é rosa e um azul verdadeiro.

### 2.3 Trade-off

| | **A — 6 famílias existentes** | **B — cascata `event-*` (~8 tons)** |
|---|---|---|
| Tons praticáveis | ~5 (brand≈success) | 8 |
| Custo antes da 1ª linha de código | **zero** | spec de token + gate próprio + `tokens:tw4` + `brand:check` + `brand:contrast` — **bloqueia o componente** (Regra 3) |
| Superfícies tocadas | 0 | `color-light.ts` + `color-dark.ts` × derivação nas 5 marcas + tema gerado + 4 canais |
| Risco medido | conhecido e quantificado acima | as 3 armadilhas de `ds-standards §multi-marca`: teto de croma varia por hue, "não existe roxo claro e saturado em sRGB", e valor em arquivo não é evidência de pixel (L-066: 13 tokens resolveram errado no dark com `tsc` verde) |
| Semântica | ⚠️ **vaza**: `danger` vermelho para a categoria "Reunião" lê como erro pra quem aprendeu a linguagem de status no resto do app | limpa — categórico é categórico |
| Evolução | união fechada; ampliar depois é **aditivo, não breaking** | — |
| Precedente no repo | `chart-1..5` já é a família categórica do DS e **já são só 5** — o DS já fez essa aposta uma vez | — |

### 2.4 ✅ Recomendação: **A**, com duas emendas

**Adotar A na v1**, com o desenho de pill medido acima, e registrar:

```ts
type SchedulerEventColor =
  | "brand" | "info" | "success" | "warning" | "danger" | "neutral";  // default: "brand"
```

Mapa de tokens por valor (soft, o único variant de pill da v1):

| valor | tint / bloco | acento (dot, barra 3px) | borda | texto |
|---|---|---|---|---|
| `brand` | `bg-bg-brand-subtle` | `bg-bg-brand` | `border-border-brand-subtle` | `text-fg-default` |
| `info` | `bg-bg-info-muted` | `bg-bg-info` | `border-border-info-muted` | `text-fg-default` |
| `success` | `bg-bg-success-muted` | `bg-bg-success` | `border-border-success-muted` | `text-fg-default` |
| `warning` | `bg-bg-warning-muted` | `bg-bg-warning` | `border-border-warning-muted` | `text-fg-default` |
| `danger` | `bg-bg-danger-muted` | `bg-bg-danger` | `border-border-danger-muted` | `text-fg-default` |
| `neutral` | `bg-bg-muted` | `bg-bg-emphasis` | `border-border-default` | `text-fg-default` |

⚠️ Note a assimetria obrigatória: **`brand` usa `-subtle`, status usa `-muted`, neutro usa
tokens neutros crus.** Não existe `bg-bg-brand-muted` nem `bg-bg-success-subtle` — a classe
errada não emite CSS e some em silêncio (gate `dead-theme-classes`).

**Emenda 1 — nomes.** `brand`, não `primary`. O `Chip` expõe `primary` por herança da
nomenclatura V2 extinta; componente novo não herda dívida (CLAUDE.md §Nomenclatura de cores).

**Emenda 2 — documentar o teto.** O `USAGE.md` diz, em uma linha: *"há 5 categorias
visualmente separáveis; `brand` e `success` são ambos verdes (10° de matiz) e não devem ser
usados como duas categorias adjacentes no mesmo calendário."* Sem isso o consumidor descobre
no browser.

**Gatilho explícito para reabrir como B:** um consumidor real precisar de **>5 categorias
simultâneas** no mesmo calendário. Aí a cascata se justifica e vira spec de token própria —
não antes. Se e quando acontecer, B deve derivar de `chart-*` (que já existe nas 5 marcas e
já é a família categórica), acrescentando o par soft pela **mesma fórmula** já usada pelos
status (`color-mix 14%` para bg, `36%` para border), em vez de inventar 8 hues do zero.

**Rejeitado explicitamente: `color` aceitar hex arbitrário.** Forçaria
`getContrastTextColor()` (L-027) em cada pill, impediria o par dark-aware (hex não tem modo
escuro) e abriria hardcode de cor no consumidor. A união fechada é a fronteira.

---

## 3. API completa

### 3.1 Modelo de dado

```ts
type SchedulerEvent = {
  id: string;
  title: ReactNode;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: SchedulerEventColor;
  categoryId?: string;
  tagIds?: string[];
  description?: ReactNode;
  draggable?: boolean;
  resizable?: boolean;
  meta?: unknown;
};
```

**Refinos sobre o ponto de partida, com justificativa:**

| # | Refino | Por quê |
|---|---|---|
| 1 | `end` **obrigatório**, nunca opcional | `end` opcional obriga cada função de `layout.ts` a inventar uma duração default. Duração-zero é caso legítimo (§7) e deve ser dita como `end === start`, não como ausência. |
| 2 | Invariante `end >= start`, validada uma vez na normalização | Evento invertido produz altura negativa e some. Normalizar na entrada, com `console.warn` em DEV nomeando o `id`. Não descartar o evento em silêncio. |
| 3 | `allDay` implica que **hora é ignorada** — a faixa é `[startOfDay(start), endOfDay(end)]` | Sem essa regra escrita, cada view interpreta `allDay` diferente. |
| 4 | `title: ReactNode` mas o motor de busca casa **só string** | Buscar dentro de `ReactNode` exige varrer a árvore React. Quando `title` não é string, o consumidor fornece `searchText?: string`. Documentar em vez de silenciosamente não achar. |
| 5 | Acrescentar `searchText?: string` | Consequência do #4. |
| 6 | `meta?: unknown` mantido, devolvido cru no `onEventClick` | É o que impede o componente de conhecer o domínio — mesma escolha do `meta` de card do Kanban. |

### 3.2 Props do `<Scheduler>`

**Dados**

| prop | tipo | default | por quê |
|---|---|---|---|
| `events` | `SchedulerEvent[]` | — | Única fonte de eventos. O componente **nunca** muta este array. |
| `locale` | `Locale` (date-fns) | `ptBR` | Nome de mês/dia e primeira letra do weekday saem daqui; sem isso o componente hardcoda português. |
| `weekStartsOn` | `0…6` | `0` (domingo) | Convenção BR. É `0` e não `1` por decisão fechada. |
| `hourFormat` | `"12h" \| "24h"` | `"24h"` | Convenção BR; `12h` existe porque o gutter e o pill mudam de largura. |
| `dayRange` | `[number, number]` | `[0, 24]` | Recorte de horas visíveis. Não é scroll — é o que existe na grade. |
| `scrollToHour` | `number` | `8` | Âncora inicial do scroll. Separado de `dayRange` porque "mostrar 0–24 mas começar às 8" é o caso comum. |
| `nowIndicator` | `boolean` | `true` | Linha do agora em week/day. |

**Estado — controlado ou não (gramática do DataTable)**

| prop | tipo | default | por quê |
|---|---|---|---|
| `defaultDate` | `Date` | `new Date()` | Data-âncora do período. Modo não-controlado. |
| `date` | `Date` | — | Modo controlado; exige `onDateChange`. |
| `onDateChange` | `(date: Date) => void` | — | Disparado por Hoje / ‹ / › / clique em dia no mês. |
| `defaultView` | `SchedulerView` | `"month"` | `"month" \| "week" \| "day" \| "list"`. |
| `view` | `SchedulerView` | — | Modo controlado; exige `onViewChange`. |
| `onViewChange` | `(view: SchedulerView) => void` | — | — |

> Mesma regra do `DataTable`: passar `date` **e** `defaultDate` é erro de uso — `console.warn`
> em DEV, `date` vence. O DataTable já vive com esse par (`viewMode`/`defaultViewMode`) e o
> aviso é o que evita o bug mudo de "o componente não responde ao meu setState".

**Interação — o componente é dumb sobre mutação**

| prop | tipo | default | por quê |
|---|---|---|---|
| `onEventClick` | `(event, evt: React.MouseEvent \| React.KeyboardEvent) => void` | — | O 2º arg entrega o alvo pro consumidor ancorar painel/popover. Tipado com `KeyboardEvent` também porque `Enter` abre (§6). |
| `onSlotClick` | `(start: Date, end: Date) => void` | — | O `+` revelado no hover da célula e o clique em faixa vazia. |
| `onEventMove` | `({ id, start, end }) => void` | — | Emite. **Não muta.** Consumidor aplica. |
| `onEventResize` | `({ id, start, end }) => void` | — | Idem. Separado de `move` porque a intenção de negócio difere (reagendar × mudar duração) e frequentemente tem permissão diferente. |
| `draggable` | `boolean` | `false` | Global; `event.draggable` sobrepõe. **Default `false`** — ver nota abaixo. |
| `resizable` | `boolean` | `false` | Global; `event.resizable` sobrepõe. |
| `snapMinutes` | `15 \| 30 \| 60` | `15` | União fechada, não `number`: `snapMinutes: 7` produz grade que não fecha na hora. |
| `optimistic` | `boolean` | `false` | Preview local durante o gesto. Opt-in porque, ligado, o componente passa a ter um estado que pode divergir de `events`. |

> ⚠️ **`draggable` default `false`, divergindo do enunciado.** O `Kanban` usa
> `enableDnD: false` por default pela mesma razão: DnD ligado sem `onEventMove` conectado
> deixa o usuário arrastar e ver o evento voltar sozinho — o pior estado possível, porque
> parece bug do app. Em DEV, `draggable && !onEventMove` deve emitir `console.warn`.

**Toolbar, busca e filtros**

| prop | tipo | default | por quê |
|---|---|---|---|
| `searchable` | `boolean` | `true` | Casa `title` (ou `searchText`), `description` e labels de `tagIds`. |
| `search` / `onSearchChange` | `string` / `(s) => void` | — | Controlado opcional; sem eles o estado é interno. |
| `filterFields` | `SchedulerFilterField[]` | — | `{ id, label, options: { value, label, color? }[] }[]`. Declarativo: o componente renderiza os chips **e filtra sozinho**. |
| `filterModel` / `onFilterModelChange` | `SchedulerFilterModel` | — | Pré-aplicado ou controlado. Chip aplicado desde o load — **nunca** form solto acima da grade (L-051). |
| `filterMode` | `"client" \| "server"` | `"client"` | Em `server` só emite; não filtra. |
| `toolbarActions` | `ReactNode` | — | A área custom pedida. Fica **entre** os chips e o segmented. |
| `primaryAction` | `ReactNode` | — | Slot do botão primário à direita. `ReactNode` e não `{label,onClick}` porque o consumidor já tem `Button` do DS e vai querer split button / ícone. |
| `title` | `ReactNode` | auto | Override do título do período (default derivado de `date` + `view` + `locale`). |

**Escape hatches**

| prop | tipo | default | por quê |
|---|---|---|---|
| `renderEvent` | `(params: { event, view, selected }) => ReactNode` | — | Substitui **só o miolo**; o wrapper (posicionamento, foco, dnd, borda) permanece do componente. Cópia literal da divisão do `renderCard` do Kanban, e pela mesma razão: garante consistência entre calendários. |
| `emptyState` | `ReactNode` | — | Só a view `list` tem empty state; mês vazio é uma grade vazia legítima. |
| `className` | `string` | — | Root. |

**Ref imperativo** — `SchedulerRef`: `{ goToDate(d) · goToToday() · next() · prev() · getVisibleRange(): {start,end} }`.
`getVisibleRange` existe porque em `filterMode="server"` o consumidor precisa saber **qual
janela buscar** e derivar isso de fora duplicaria a lógica de `layout.ts`.

---

## 4. Anatomia — toolbar

Linha única; quebra abaixo de ~1024px (`max-lg:` → esquerda e direita em linhas separadas).

```
[título do período] [Hoje] [‹][›]        [busca] [chips] {toolbarActions} [segmented] [primário]
```

| parte | tokens |
|---|---|
| root | `flex items-center justify-between flex-wrap gap-gp-md md:gap-gp-2xl` — igual ao `toolbarRoot()` |
| grupo esquerdo | `flex items-center gap-gp-sm md:gap-[10px] min-w-0 [&>*]:shrink-0` |
| título do período | `text-title-md text-fg-default` (16/24/600) · `tabular-nums` no ano |
| `Hoje` | `Button variant="outline" size="sm"` → `min-h-form-md` (36px) |
| `‹` `›` | `Button variant="soft" color="secondary"` ícone, `size-icon-sm` (16px), `aria-label` obrigatório — botão de ícone sem label é anunciado só como "button" |
| grupo direito | `flex items-center flex-wrap shrink-0 gap-gp-sm md:gap-gp-md` |
| busca | espelha `toolbarSearch()`: `h-form-lg px-[14px] rounded-radius-lg bg-bg-surface dark:bg-bg-muted border border-border-subtle dark:border-border-input shadow-sh-sm dark:shadow-sh-none` + `md:w-[200px] md:focus-within:w-[300px]` + `focus-within:border-border-brand focus-within:shadow-sh-ring`. Wrapper é `<label>` — clicar em qualquer ponto foca o input, sem JS. |
| chips aplicados | espelha `toolbarAppliedChip()`: `h-form-md pl-pad-sm pr-pad-lg bg-bg-surface dark:bg-bg-muted border border-dashed border-border-input rounded-radius-lg text-body-xs text-fg-default`; remover = `CircleX`; link "Limpar todos" ao fim |
| linha de chips | `flex items-center gap-gp-md flex-nowrap overflow-x-auto sm:flex-wrap` — mobile rola em vez de empilhar e empurrar a grade pra baixo |
| segmented `Mês\|Semana\|Dia\|Lista` | track `inline-flex items-center gap-[2px] p-[3px] bg-bg-muted rounded-radius-lg h-form-lg` · item `h-[34px] min-w-[36px] px-pad-md rounded-radius-md text-body-sm font-normal text-fg-muted` · ativo `bg-bg-accent text-fg-default font-semibold shadow-sh-sm` · foco `focus-visible:shadow-sh-ring` · `role="radiogroup"` + `role="radio"` + `aria-checked` |
| divisor | `w-[1px] h-[24px] bg-border-default mx-[6px] self-center` |

### 4.1 ⛔ Decisão registrada — o segmented é **reimplementado**, não importado

**Proibido `import { ToolbarSegmented } from "../TableToolbar"`.** A gramática visual acima é
uma cópia deliberada de `toolbarSegmented()` / `toolbarSegmentedButton()`, transcrita em
`scheduler.styles.ts`.

**Por quê:** cross-import entre pastas de `ui/` é exatamente o que produziu o
`registryDependency` dangling da **L-049**. O `DataList` importou `TableToolbar`, que não tem
item próprio no registry (vive **dentro** do item `data-table`) — o registry passou a declarar
`@igreen/table-toolbar`, que não resolve, e o `igreen:add data-list` quebrou no consumidor.
`tsc` e o showcase ficam verdes: o defeito só existe no canal de distribuição.

Um `Scheduler` que importasse `../TableToolbar` reproduziria o bug **idêntico** — e o
`Scheduler` é justamente um item de registry novo, ou seja, estrearia quebrado.

**O custo aceito, dito com clareza:** duas cópias do segmented no repo, que podem divergir.
Mitigação: o bloco em `scheduler.styles.ts` leva comentário apontando
`TableToolbar/table-toolbar.styles.ts` como origem, e o `USAGE.md` registra que mudança
visual no segmented se aplica nos dois lugares. A alternativa correta de longo prazo —
extrair `ToolbarSegmented` pra item próprio no registry (`@igreen/toolbar-segmented`) — é
**fora do escopo desta spec** e vale uma tarefa própria: mexe no `data-table`, no `data-list`
e no embed de quem já rodou `igreen:add`.

---

## 5. Anatomia — as 4 views

### 5.1 `month`

```
┌ header de weekday ─────────────────────────────┐
│ dom  seg  ter  qua  qui  sex  sáb              │
├────┬────┬────┬────┬────┬────┬────┤
│ 27 │ 28 │ 29 │ 30 │  1 │  2 │  3 │   ← 6 linhas fixas
```

| elemento | tokens |
|---|---|
| grade | `grid grid-cols-7 grid-rows-6 h-full` · divisórias por `border-border-subtle` (1px), nunca `border` cru — sem cor a borda cai em `currentColor` (L-039) |
| header de weekday | `text-caption-md text-fg-muted uppercase tracking-[0.04em] py-gp-md text-center` · `border-b border-border-default` |
| célula | `min-h-comp-4xl p-pad-sm flex flex-col gap-gp-2xs` · `bg-bg-surface` · hover `bg-bg-table-row-hover` |
| número do dia | `text-body-xs font-medium text-fg-default tabular-nums` |
| dia fora do mês | `text-fg-subtle` + célula `bg-bg-subtle` |
| **hoje** | número em disco: `size-comp-3xs` (16px) `rounded-radius-full bg-bg-brand text-fg-on-brand grid place-items-center text-caption-md font-semibold` |
| dia selecionado | célula `bg-bg-brand-subtle` |
| **pill de evento** | `min-h-comp-2xs flex items-center gap-gp-xs px-pad-sm rounded-radius-sm text-caption-md text-fg-default truncate` + tint da família + `border` da família |
| dot do pill | `size-icon-2xs` (8px) `rounded-radius-full` + acento sólido da família · `shrink-0` |
| evento `allDay` / multi-dia | barra que atravessa colunas: mesmo pill, `rounded-radius-sm`, cantos internos retos na continuação (§7) |
| overflow | `+N mais` — `text-caption-md font-medium text-fg-muted hover:text-fg-default` → abre `parts/overflow-popover.tsx` |
| `+` do slot vazio | revelado em `group-hover`/`group-focus-within`, `size-icon-sm`, `text-fg-subtle`; em mobile vira alvo `min-h-form-xl` sempre visível (hover não existe em toque) |

### 5.2 `week` / `day` — a **mesma** view, com 7 ou 1 coluna

| elemento | tokens |
|---|---|
| header sticky de dias | `sticky top-0 z-10 bg-bg-surface border-b border-border-default` · weekday `text-caption-md text-fg-muted` + número `text-title-sm tabular-nums` |
| faixa all-day | linha própria acima da grade, `border-b border-border-default`, altura por conteúdo, **não rola** com o corpo |
| gutter de horas | `w-comp-4xl shrink-0` · rótulo `text-caption-sm text-fg-muted tabular-nums` alinhado ao topo da linha, deslocado `-translate-y-1/2` |
| linha de hora | `h-comp-3xl` (48px) · `border-t border-border-subtle` |
| meia-hora | `border-t border-dashed border-border-subtle` — ⛔ **não** usar alpha em classe de cor (`border-border-subtle/50`): o token já resolve o tom em cada modo, e o alpha extra quebra o dark |
| corpo | `relative overflow-y-auto` · scroll inicial ancorado em `scrollToHour` |
| **bloco de evento** | `absolute` posicionado por `layout.ts` · `rounded-radius-md overflow-hidden px-pad-md py-pad-xs` + tint + `border` da família |
| barra de acento | `absolute left-0 inset-y-0 w-[3px]` + acento sólido — pseudo-elemento posicional fino é exceção de hardcode válida (`ds-standards §Exceções`) |
| título do bloco | `text-body-xs font-semibold text-fg-default truncate` |
| horário do bloco | `text-caption-sm font-normal text-fg-default tabular-nums` — **`fg-default`, não `fg-muted`**, pela medição do §2.1 (2.98:1 no dark). Hierarquia por peso/tamanho. |
| bloco curto (< 30min) | 1 linha só; horário some, título trunca |
| alças de resize | `absolute inset-x-0 h-[6px]` topo e base, `cursor-ns-resize`, `opacity-0 group-hover:opacity-100`; alvo lógico ampliado a 10px |
| **linha do agora** | `absolute h-[1px] bg-bg-danger` + bolinha `size-icon-2xs rounded-radius-full bg-bg-danger` à esquerda; `aria-hidden` |

> A linha do agora usa `danger` por convenção universal de calendário — e é o único uso de
> `danger` no componente que **não** é categoria de evento. O `USAGE.md` deve dizer isso,
> senão parece incoerente com o §2.

### 5.3 `list` (agenda)

| elemento | tokens |
|---|---|
| agrupamento | por dia, com cabeçalho sticky |
| cabeçalho de dia | `sticky top-0 z-10 bg-bg-surface border-b border-border-subtle` — fundo **sólido**, nunca translúcido: sticky com alpha deixa as linhas passarem por baixo. `text-body-sm font-semibold text-fg-default` + data `text-caption-md text-fg-muted tabular-nums` |
| linha de evento | `flex items-center gap-gp-xl px-pad-xl py-gp-md rounded-radius-md` · hover `bg-bg-table-row-hover` · `min-h-form-xl` (44px, alvo de toque) |
| coluna de horário | `w-comp-4xl shrink-0 text-caption-md text-fg-muted tabular-nums` — aqui `fg-muted` **é** permitido: o fundo é a superfície normal, não o tint |
| dot de cor | `size-icon-2xs rounded-radius-full` + acento sólido |
| título | `text-body-sm font-medium text-fg-default` |
| descrição | `text-caption-md text-fg-muted line-clamp-1` |
| separador | `border-b border-border-subtle` na última linha de cada grupo |
| vazio | `emptyState` ou `EmptyState` do DS |
| **sem drag** | decisão fechada — lista é ordem temporal derivada, arrastar não tem destino significativo |

---

## 6. Dark mode e foco/teclado

### 6.1 Dark

Nada no `Scheduler` declara cor de dark **exceto** os dois casos abaixo — todo o resto vem
dos tokens, que já são dark-aware.

1. **A busca** copia o par do `toolbarSearch()`: `bg-bg-surface dark:bg-bg-muted`,
   `border-border-subtle dark:border-border-input`, `shadow-sh-sm dark:shadow-sh-none`.
   Existe porque `--input` e `--border` são diferentes entre `:root` e `.dark` (L-010) e
   porque sombra clara sobre superfície escura vira halo (L-043).
2. **O chip aplicado** copia `bg-bg-surface dark:bg-bg-muted` + `dark:hover:bg-bg-accent`.

Checagens de dark que a implementação precisa passar:
- Hierarquia de bg preservada: `canvas < surface < subtle < muted` (L-008). A célula do mês é
  `surface`; dia fora do mês é `subtle`; o tint do evento senta **acima** de `surface`.
- Divisórias da grade: `border-subtle` no dark é `oklch(1 0 0 / 0.04)` — alpha sobre a
  superfície, não cinza fixo. Confirmar visualmente que a grade não some (L-009).
- **Não** usar `dark:` para cor de evento: `bg-bg-{cor}-muted` já resolve nos dois modos.
- Medição registrada: `text-fg-default` sobre o tint dá 7.45–10.95 no dark. Se alguém trocar
  por `fg-muted`, cai a 2.98 em `warning` — por isso está escrito na tabela e no USAGE.

### 6.2 Foco e teclado

Focus ring — **Padrão 1** (estático), porque toda superfície focável aqui é botão/célula:

```
base:  focus-visible:outline-none
item:  focus-visible:ring-4 focus-visible:ring-ring-brand
```

`ring-ring-brand` já embute alpha — **nunca** `/30` (L-001); `ring-4`, nunca `ring-3`
(L-003); `focus-visible:outline-none`, nunca `outline-none` solto (L-004).

**Modelo de foco — uma tab stop, não 42.** A grade é um `role="grid"` com roving tabindex:
um único `tabIndex={0}` na célula ativa, todas as outras `tabIndex={-1}`. Sem isso, tabular
pela toolbar exigiria 42 `Tab` no mês.

| tecla | month | week/day | list |
|---|---|---|---|
| `←` `→` | dia ∓1 | dia ∓1 (mesma hora) | — |
| `↑` `↓` | semana ∓1 | slot ∓1 (`snapMinutes`) | evento ∓1 |
| `Home` / `End` | 1º / último dia da semana | 1ª / última hora de `dayRange` | 1º / último do dia |
| `PageUp` / `PageDown` | mês ∓1 | semana/dia ∓1 | página ∓1 |
| `Enter` / `Space` | evento focado → `onEventClick`; célula vazia → `onSlotClick` | idem | `onEventClick` |
| `Esc` | fecha overflow-popover; **durante drag, cancela** | idem | — |
| `T` | vai pra hoje (atalho, só quando a grade tem foco) | idem | idem |

**Drag por teclado.** O `KeyboardSensor` do `@dnd-kit/core` já está no `useSensors` do
Kanban e deve estar aqui também: `Space` inicia o arrasto do evento focado, setas movem por
`snapMinutes` (ou por dia, no mês), `Space` confirma → `onEventMove`, **`Esc` cancela** →
`handleDragCancel`, sem emitir nada. Um calendário com dnd só de mouse é inacessível.

Acessibilidade estrutural:
- `role="grid"` na grade, `role="row"` nas linhas, `role="gridcell"` nas células.
- Cada evento é `<button type="button">` com `aria-label` completo — "Reunião de equipe,
  14 de março, 09:00 às 10:00" — porque o texto visível trunca e o horário pode nem aparecer
  em bloco curto.
- Mudança de período anuncia em `aria-live="polite"`: "Março de 2026, 12 eventos".
- A cor **nunca** é o único portador de informação: a categoria também aparece no `aria-label`
  e, quando `filterFields` a define, no chip.

---

## 7. Casos de borda que `layout.ts` precisa cobrir

`layout.ts` é **puro** — sem `import React`, sem `Date.now()` implícito (o "agora" entra como
argumento). É a condição pra ser testável sem render, e é onde bug de calendário mora.

| # | Caso | Comportamento exigido |
|---|---|---|
| 1 | Evento multi-dia atravessando a **virada de semana** | Quebra em **N segmentos**, um por linha da grade. Segmento inicial: `rounded-radius-sm` só à esquerda. Segmento final: só à direita. Intermediário: reto dos dois lados. Cada segmento carrega `isStart`/`isEnd` — sem isso a barra parece um evento novo a cada segunda-feira. |
| 2 | Evento atravessando a **virada de mês** | Aparece em ambas as grades, recortado pela janela visível. O segmento na grade de abril de um evento que começou em março **não é** `isStart`. |
| 3 | **Sobreposição de 3+** na mesma faixa (week/day) | Lane-packing: ordenar por `start` asc, `end` desc como desempate; alocar na 1ª lane livre; largura = `1/nLanes` do grupo de colisão, `left = laneIndex/nLanes`. O `nLanes` é do **grupo conexo**, não do dia inteiro — senão 2 eventos às 9h ficam com 1/5 da largura porque existem 5 eventos às 17h. |
| 4 | **Duração 0** (`start === end`) | Altura mínima de render (`min-h-comp-2xs`, 20px) mas duração lógica **preservada em 0**. Nunca inflar `end` — o consumidor recebe de volta o que mandou. Na list view renderiza como marco pontual (sem "às"). |
| 5 | **all-day × cronometrado** | Faixas separadas: `allDay` na barra fixa acima; cronometrado na grade. Nunca no mesmo cálculo de lane — um não tem posição vertical. Ordenação no mês: `allDay` primeiro, depois por `start`, depois por `title`. |
| 6 | **Último dia da grade** (L-045) | A grade de 6 linhas mostra dias do mês seguinte. Evento que começa no **último dia visível** e termina fora: o segmento é truncado e marcado `isEnd: false`. É o caso onde off-by-one se esconde, porque em qualquer outra célula o valor coincide. Teste explícito. |
| 7 | **Primeiro dia da grade** | Espelho do #6: evento iniciado antes da janela → `isStart: false`. |
| 8 | **Horário de verão / offset** | v1 opera em horário **local** (sem tz por evento). Num dia de 23h ou 25h, a altura da grade deve derivar de `differenceInMinutes(endOfDay, startOfDay)`, **não** de `24 * 60` fixo. Sem isso o dia da virada desalinha em uma hora inteira. |
| 9 | **Snap na borda do dia** | Arrastar um evento das 23:50 pra baixo com `snapMinutes: 15` não pode gerar `end` no dia seguinte silenciosamente. Clampar em `endOfDay` e emitir o valor clampado. |
| 10 | **Resize invertendo** | Arrastar a alça superior abaixo da inferior: clampar em `end - snapMinutes`. Nunca emitir `start > end`. |
| 11 | **Overflow "mais N"** | N é calculado pela altura **disponível** da célula, não por constante. Célula que cabe 3 mostra 2 + "mais N" — a própria linha de overflow ocupa um slot. Erro clássico: mostrar "mais 1". |
| 12 | **`dayRange` parcial** | Com `[8, 18]`, evento das 07:00 às 09:00 aparece truncado no topo, com indicação de continuação. Não some. |
| 13 | **Semana vazia** | Grade de 6 linhas pode ter a 6ª inteira no mês seguinte. Renderiza normalmente — não colapsar, senão a altura da grade pula entre meses. |

---

## 8. Arquitetura interna — validada, com 4 ajustes

```
src/components/ui/Scheduler/
├── index.ts                       # barrel da pasta
├── USAGE.md
├── scheduler.tsx                  # raiz: compõe estado + toolbar + view ativa
├── scheduler.types.ts
├── scheduler.styles.ts            # tv() — inclui a cópia do segmented (§4.1)
├── scheduler.constants.ts         # ← AJUSTE 1
├── parts/
│   ├── scheduler-toolbar.tsx
│   ├── scheduler-event.tsx        # ← AJUSTE 2 (era event-pill.tsx)
│   └── overflow-popover.tsx
├── views/
│   ├── month.tsx
│   ├── time-grid.tsx              # ← AJUSTE 3 (era week.tsx)
│   └── list.tsx
└── hooks/
    ├── use-scheduler-state.ts
    ├── use-scheduler-filter.ts
    ├── use-scheduler-dnd.ts
    ├── use-scheduler-keyboard.ts  # ← AJUSTE 4
    └── layout.ts                  # PURO — sem React
```

| ajuste | o quê | por quê |
|---|---|---|
| 1 | `scheduler.constants.ts` | `HOUR_HEIGHT`, `SNAP_DEFAULT`, `MAX_LANES`, prefixos de `droppableId`. Espelha `data-table.constants.ts`, e evita que `layout.ts` (puro, testado) carregue constante de layout visual. |
| 2 | `event-pill.tsx` → `scheduler-event.tsx`, com variante `render: "pill" \| "block" \| "row"` | "pill" só descreve o mês; week/day renderiza bloco e a lista renderiza linha. Três arquivos com a mesma lógica de cor/acento/aria divergem. Nome que descreve um terço do uso é o defeito da L-060. |
| 3 | `week.tsx` → `time-grid.tsx` | O arquivo renderiza week **e** day (decisão fechada: mesma view, 1 ou 7 colunas). Um `week.tsx` que desenha o dia é uma mentira de nome — e a próxima pessoa procura `day.tsx` e não acha. |
| 4 | `use-scheduler-keyboard.ts` **novo** | Roving tabindex + o mapa de teclas do §6.2 não cabem em `scheduler.tsx` sem inchá-lo, e precisam de teste próprio. Estava ausente da proposta. |

**Contrato de `layout.ts`** (superfície pública, tudo puro):

```
buildMonthMatrix(date, weekStartsOn, locale)        → Date[][]        (6×7)
segmentMultiDay(events, weekRows)                   → MonthSegment[]  (§7 #1,2,6,7)
packLanes(events, snapMinutes)                      → LaneBox[]       (§7 #3)
computeOverflow(dayEvents, availableHeight)         → { visible, overflowCount }  (§7 #11)
snapToGrid(date, snapMinutes, dayRange)             → Date            (§7 #9)
resolveResize(event, edge, deltaMin, snapMinutes)   → { start, end }  (§7 #10)
minutesToOffset(date, dayRange, hourHeight)         → number          (§7 #8)
```

`use-scheduler-dnd.ts` espelha `use-kanban-dnd.ts` na estrutura: `useSensors` com
`PointerSensor({ activationConstraint: { distance: 5 } })` — que é o que preserva o
click-to-open contra o drag — mais `KeyboardSensor`; `droppableId` com prefixo namespaced
(`day:` / `slot:` / `event:`) e um `resolveOver` que traduz de volta; `handleDragCancel`
zerando tudo. Diferença: o Kanban resolve **coluna de destino**; aqui resolve **instante de
destino**, passando por `snapToGrid`.

**Dependências reais a declarar** (L-037 / L-058): `@dnd-kit/core@^6.3.1`,
`lucide-react@^1.7.0` e **`date-fns@^4.1.0`**.

> ⚠️ `date-fns` está no `package.json`, mas **nenhum componente de `src/components/` o
> importa hoje** — verificado por grep. O `Scheduler` seria o primeiro. Logo o item do
> registry precisa declará-lo explicitamente; herdar de `react-day-picker` (que o traz
> transitivamente pro `Calendar`) é a receita exata da L-037: resolve no showcase e quebra no
> consumidor.

---

## 9. As 8 superfícies da L-042

| # | Superfície | O que este componente exige |
|---|---|---|
| 1 | **Código** | A árvore do §8. |
| 2 | **USAGE.md** | Formato canônico + os gotchas específicos: (a) o teto de 5 categorias e o par `brand`≈`success`; (b) `draggable` default `false` e o warning de `onEventMove` ausente; (c) o pai precisa ter altura — `h-full`/`flex-1 min-h-0` — senão a grade colapsa; (d) `filterMode="server"` não filtra; (e) a linha do agora usa `danger` por convenção, não por semântica; (f) o segmented é cópia do `TableToolbar` (§4.1). Itens (b), (c) e (d) são **regra de comportamento** → também no bloco `ds:regras` e no vocabulário do consumidor (gate `rule-surfaces`). |
| 3 | **inventory.md** | Entrada nova na tabela de `ui/`, com a distinção explícita de `Calendar`/`DatePicker`/`MonthYearPicker` — senão o próximo agente cai na Regra 2 ao contrário e acha que já existe. |
| 4 | **Showcase** | `src/preview/pages/SchedulerDoc.tsx` + import/render em `src/App.tsx` + entrada em **`DOC_PAGES`** (`src/App.tsx:239`) + `src/preview/components/doc-nav-data.ts`. **As quatro coisas** — DocPage sem rota renderiza em branco (L-042, hook `ds-inventory-check`). |
| 5 | **registry.json** | Item `scheduler` (`registry:ui`) com as 3 `dependencies` do §8 e `registryDependencies` **que existam como item** — `@igreen/utils`, `@igreen/tv`, `@igreen/button`, `@igreen/popover`, `@igreen/chip`. ⛔ **Não** declarar `@igreen/table-toolbar`: não existe como item (L-049) — é a razão do §4.1. |
| 6 | **Vocabulário do consumidor** | `cli/templates/default/_claude/rules/ds-components.md`, no grupo **"Dados em grade e lista"** (linha 107), com o critério de escolha: *"evento no tempo → `Scheduler`; escolher uma data → `DatePicker`; grade de registros → `DataTable`"*. Sem isso o componente é distribuído e invisível — o gap do `Toast`. |
| 7 | **Changelog** | `src/preview/pages/updates-data.ts`, no `/ds-release`. |
| 8 | **Barrel** | `src/components/index.ts` — define o canal npm. Sem isso `import { Scheduler } from "@igreen/..."` estoura "not exported" só no consumidor npm; foi assim que `Chart`/`DataList`/`List`/`Toast` passaram meses. Gate: `barrel-completeness`. |

1–4 e 8 fecham **no PR**. 5, 6 e 7 consolidam no `/ds-release` — anotar no corpo do PR que faltam.

---

## 10. Plano de teste

### 10.1 Unitário puro — `hooks/layout.test.ts` (o núcleo)

Sem render, sem jsdom. Cada linha do §7 vira um caso:

| suíte | casos |
|---|---|
| `buildMonthMatrix` | 6×7 sempre · `weekStartsOn` 0 e 1 · mês que começa no 1º dia da semana (a linha extra) · fevereiro bissexto |
| `segmentMultiDay` | 1 dia · 2 dias na mesma linha · virada de semana (#1) · virada de mês (#2) · **começa no último dia visível** (#6) · **termina no primeiro** (#7) · flags `isStart`/`isEnd` corretas em cada segmento |
| `packLanes` | 2 sobrepostos · **3+ sobrepostos** (#3) · dois grupos disjuntos no mesmo dia — o grupo da manhã **não** pode herdar `nLanes` do grupo da tarde · encadeamento A∩B, B∩C, A∌C · duração 0 (#4) |
| `computeOverflow` | cabe tudo · cabe N-1 → "mais 2", nunca "mais 1" (#11) · altura menor que 1 evento |
| `snapToGrid` | 15/30/60 · arredondamento no meio exato · clamp em `endOfDay` (#9) · clamp em `dayRange` parcial (#12) |
| `resolveResize` | alça superior · alça inferior · **inversão** (#10) · resize abaixo do mínimo |
| `minutesToOffset` | dia normal · `dayRange` parcial · **dia de 23h e de 25h** (#8) |

**Regra de construção destes testes (L-064).** Montar a entrada **pela função de produção**
(`buildMonthMatrix` alimenta `segmentMultiDay`), nunca por fixture escrita à mão a partir do
mesmo modelo mental do código — teste assim concorda por construção. Para os casos #6/#7,
usar meses reais com a borda conhecida (ex.: **março de 2026**, cuja grade termina em
11/04) em vez de datas inventadas.

### 10.2 Comportamento — `scheduler.test.tsx` (jsdom)

- Não-controlado: `defaultView="month"` → clicar "Semana" troca a view.
- Controlado: passar `view` sem `onViewChange` → clicar não troca (e avisa em DEV).
- Passar `date` **e** `defaultDate` → `console.warn`, `date` vence.
- `draggable` sem `onEventMove` → `console.warn` em DEV.
- `filterFields` + clique em opção → chip aplicado + contagem de eventos cai.
- `filterMode="server"` → chip aparece, `onFilterModelChange` dispara, **contagem não muda**.
- `searchable` com `title: ReactNode` sem `searchText` → não casa, e é isso mesmo (§3.1 #4).
- Roving tabindex: exatamente **1** elemento com `tabIndex=0` na grade.
- `Esc` durante drag → `onEventMove` **não** é chamado.

⚠️ Estes leem **classe**, não valor computado: jsdom não carrega o CSS. Não afirmar altura
nem cor a partir daqui (é a nota que o `avatar-group.test.tsx` já carrega).

### 10.3 Verificação visual — obrigatória, no browser

Contraste e sobreposição não se provam em jsdom (L-064: "onde o render é do UA, só medição
visual vale"; L-066: 13 tokens erraram no dark com `tsc` verde).

1. Showcase em **light e dark**, e nas **5 marcas** — o tint de evento é derivado da cor da
   marca em `brand`, então `vibrant` pode mudar o resultado.
2. Reconferir no DevTools que `text-fg-default` sobre cada tint bate com a tabela do §2.1.
3. Mês com 8 eventos num dia → o "mais N" conta certo e o popover abre dentro do viewport.
4. Semana com 4 sobrepostos → 4 lanes, nenhuma largura negativa.
5. Drag de mouse, drag de teclado, e `Esc` cancelando os dois.
6. Mobile (≤768px): toolbar quebrada, chips rolando na horizontal, `+` do slot visível sem hover.

### 10.4 Gates que precisam passar

`npm test` — em especial `dead-theme-classes` (cada classe de cor do §5 existe),
`barrel-completeness` (superfície 8), `deps-declared` (`date-fns`), `registry-imports` e
`new-component-folders`. Mais `.ai/scratch/hook-log.txt` depois de cada Edit em
`scheduler.styles.ts` — o `ds-lint-styles` sai com `exit 0` e **não** alcança o agente.

---

## 11. Fora da v1 — YAGNI declarado

Recorrência/RRULE · múltiplos calendários ou visão por recurso (swimlane) · fuso horário por
evento · export ICS · impressão · virtualização.

Sobre **virtualização**: a grade é limitada por construção — 42 células no mês, 24×7 slots na
semana. Virtualizar traria `@tanstack/react-virtual`, `measureElement` e a incompatibilidade
com `fillHeight` que a L-046 já documenta no `DataList`, para resolver um problema que não
existe. A view `list` é a única que pode crescer sem limite: se um consumidor real trouxer
mil eventos, ela — **e só ela** — vira candidata.

Sobre **RRULE**: é a mais pedida e a mais cara. Expandir ocorrências muda o contrato de
`events` de "array do que existe" para "array de regras", e arrasta `onEventMove` para a
pergunta "editar esta ocorrência ou a série?". É componente diferente disfarçado de prop.

---

## 12. Perspectiva Strategist

### Alternativas descartadas

1. **4 componentes (`SchedulerMonth`, `SchedulerWeek`, …) em vez de 1 com `view`.**
   Descartada: toolbar, busca, filtro, dnd e estado de data são idênticos nas quatro; separar
   força o consumidor a montar o switch e ressincronizar `date`/`filterModel` na mão. É a
   escolha que o `DataTable` já fez com `viewMode` (table/kanban/list) e que funcionou.

2. **Estender o `DataTable` com `viewMode="calendar"`.**
   Descartada: o `DataTable` é orientado a **linhas e colunas** — `filterModel` opera sobre
   `field` de coluna, e o Scheduler não tem colunas. Ganharia a toolbar de graça e carregaria
   virtualização, densidade, pinning, saved-views e export CSV que não significam nada num
   calendário. O item do registry já tem 20 `registryDependencies`.

3. **Importar `ToolbarSegmented` de `../TableToolbar`.**
   Descartada com evidência: reproduz a L-049 literalmente — `@igreen/table-toolbar` não
   existe como item de registry e o `igreen:add scheduler` quebraria no consumidor, com
   `tsc` e showcase verdes. Custo aceito e mitigação em §4.1.

4. **Opção B agora — cascata de paleta `event-*` de 8 tons.**
   Descartada **para a v1**, não em princípio. Bloqueia o componente atrás de uma spec de
   token com gate próprio, em 5 marcas × 2 modos, num terreno que o `ds-standards` marca com
   três armadilhas de julgamento. O ganho medido é ir de ~5 para 8 categorias — e a união
   fechada torna a ampliação **aditiva, não breaking**. Gatilho de reabertura nomeado em §2.4.

5. **`color` aceitando hex arbitrário.**
   Descartada: exigiria `getContrastTextColor()` por pill (L-027), não teria par dark, e
   abriria hardcode de cor no consumidor — o oposto da regra de ouro.

6. **`text-fg-{cor}` no pill, como o `Chip soft` faz.**
   Descartada **por medição**: 1.72:1 em `warning` no light, 2.97:1 em `info` no dark. É o
   nível que o Chip já entrega, tolerável num rótulo secundário e não no conteúdo principal
   de um calendário.

7. **Fixar altura da célula do mês em px.**
   Descartada: obriga a escolher entre cortar em telas altas e estourar em telas baixas.
   `grid-rows-6 h-full` + piso resolve. Consequência declarada: o pai **precisa** ter altura.

8. **Virtualizar a grade.** Ver §11.

### Assumption central

> **O consumidor consegue distinguir e nomear seus eventos com 5 categorias de cor visualmente
> separáveis — e a cor do evento é reforço, nunca o único portador da informação.**

É disso que a Opção A depende inteiramente. Se um consumidor real precisar de 6+ categorias
concorrentes no mesmo calendário, a assumption quebrou e a Opção B passa a ser o caminho —
de forma aditiva, sem quebrar quem já usa a união de 6 nomes.

**Como o DS Reviewer verifica isto após a implementação** (não por opinião):
1. Renderizar as 6 cores lado a lado, em light e dark, nas 5 marcas, e confirmar no browser
   que `brand` e `success` são de fato confundíveis como tint — o número (10° de matiz) prevê
   que sim; se forem distinguíveis, a assumption é mais forte que o previsto e o teto sobe pra 6.
2. Medir no DevTools `text-fg-default` sobre cada tint e conferir contra a tabela do §2.1.
   Divergência aqui significa que um token de cor mudou desde 2026-09-01 e a spec envelheceu.

**Assumptions secundárias, explicitadas para não virarem surpresa:**
- O consumidor sempre dá altura ao pai. Se não der, a grade colapsa — mitigado por gotcha no
  `USAGE.md` (regra de comportamento, 3 superfícies) e por um `min-h` de segurança na raiz.
- v1 opera em horário local. Consumidor com times em fusos diferentes não é atendido — e é
  melhor não atender do que atender pela metade.

---

## 13. Definição de pronto (para o DS Dev, após o gate)

- [ ] Superfícies 1–4 e 8 da L-042 fechadas **no PR**; 5/6/7 anotadas no corpo do PR para o `/ds-release`
- [ ] `layout.ts` puro, sem `import React`, com todos os 13 casos do §7 cobertos por teste
- [ ] Zero `import` de `../TableToolbar` ou de qualquer outra pasta de `ui/` sem item próprio no registry
- [ ] Zero Tailwind literal onde há token DS · zero hex · zero `text-label-*` (preset extinto)
- [ ] `disabled` como **último** `compoundVariant` em cada `tv()` (L-006)
- [ ] `npm test` verde, incluindo `dead-theme-classes`, `barrel-completeness` e `deps-declared`
- [ ] `.ai/scratch/hook-log.txt` conferido após os Edits em `*.styles.ts`
- [ ] Verificação visual do §10.3 feita **no browser**, light + dark, 5 marcas
- [ ] Handoff por PR (Regra 8): branch → commit descritivo → push no remote canônico resolvido
      **por URL** (`igreenlab/igreen-desingsystem-admin`, L-069) → `gh pr create` → reportar link
- [ ] `pipeline-state.md` atualizado com a `Assumption` do §12
```
