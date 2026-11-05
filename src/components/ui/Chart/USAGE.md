# Chart — USAGE

<!-- ds:regras
- por default a altura do `className` é a do BLOCO e a legenda desconta dela: `h-[250px]` + legenda de 1 linha = 250px de bloco com 228px de gráfico, e 2 linhas tiram o dobro
- `keepPlotHeight` (`vNEXT`+) inverte isso: a altura passa a ser a da PLOTAGEM e a legenda soma por fora — os mesmos `h-[250px]` dão 272px de bloco com 250px de gráfico. Ligue quando a legenda puder quebrar em 2 linhas
- `emptyState` (`vNEXT`+) é opt-in e só troca o gráfico quando não há nenhum número finito nas props `data` (a do gráfico e a das séries). `0` é dado; `null`/`undefined`/texto não são
- gráfico que carrega dado (`data={query.data}`) merece `emptyState` — sem ele o Recharts desenha a grade e os eixos sem nenhuma série, e a tela parece quebrada em vez de vazia
-->

Wrapper sobre o **Recharts 3** que aplica a paleta do DS (tokens `--color-chart-1..5`) e fornece Tooltip/Legend já estilizados com os tokens iGreen. Categoria: data-display.

## Quando usar

- Qualquer gráfico (área, barras, linhas, pizza, radar, radial) numa tela do iGreen
- Garantir cores, tooltip e legenda consistentes entre gráficos

## Import

```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
```

## Conceito

`ChartContainer` recebe um `config` (mapa série → label/cor/ícone) e injeta cada
cor como CSS var `--color-{key}` **escopada nessa instância**. Os elementos do
Recharts referenciam `var(--color-{key})`.

```tsx
const config = {
  desktop: { label: "Desktop", color: "var(--color-chart-1)" },
  mobile:  { label: "Mobile",  color: "var(--color-chart-2)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-[260px] w-full">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area dataKey="desktop" fill="var(--color-desktop)" stroke="var(--color-desktop)" />
    <Area dataKey="mobile"  fill="var(--color-mobile)"  stroke="var(--color-mobile)" />
  </AreaChart>
</ChartContainer>
```

## Props essenciais

| Componente | Prop | Função |
|---|---|---|
| `ChartContainer` | `config: ChartConfig` | mapa série → `{ label, color?, icon?, theme? }` |
| `ChartContainer` | `className` | controle de altura/aspect. Por default é a altura do **bloco** e a legenda desconta dela; com `keepPlotHeight`, é a da **plotagem** e a legenda soma por fora |
| `ChartContainer` | `emptyState?: ReactNode` | **(`vNEXT`+)** conteúdo a mostrar no lugar do gráfico quando não há dado. Ausente = Recharts desenha os eixos vazios |
| `ChartContainer` | `keepPlotHeight?: boolean` | **(`vNEXT`+)** tira a legenda da caixa de altura: a plotagem fica com os pixels pedidos e o bloco cresce. Ausente (default) = a legenda desconta da plotagem, como sempre |
| `ChartTooltip` | `content={<ChartTooltipContent/>}` | tooltip do DS |
| `ChartTooltipContent` | `hideLabel`, `hideIndicator`, `indicator` (`dot`/`line`/`dashed`), `labelFormatter`, `formatter`, `nameKey`, `labelKey` | customização |
| `ChartLegend` | `content={<ChartLegendContent/>}` | legenda do DS |

## Sem dados — `emptyState` (`vNEXT`)

```tsx
<ChartContainer
  config={config}
  className="h-[250px] w-full"
  emptyState={
    <EmptyState
      size="sm"
      icon={ChartColumnBig}
      title="Sem geração no período"
      description="Nenhuma unidade consumidora registrou energia entre Janeiro e Junho."
    />
  }
>
  <BarChart data={rows}>…</BarChart>
</ChartContainer>
```

**Quando o container considera que não há dado:** quando **nenhum número finito**
aparece nas props `data` que ele encontra — a do gráfico (`<BarChart data>`) e a
das séries (`<Pie data>`), até 2 níveis.

| Caso | Vazio? | Por quê |
|---|---|---|
| `data={[]}` | sim | nenhuma linha |
| `data={undefined}` (carregando) | sim | é o caso mais comum; exigir `[]` deixaria ele de fora |
| `[{ mes: "jan", total: null }]` | sim | só a categoria do eixo preenchida = os eixos vazios do item 28 |
| `[{ mes: "jan", total: 0 }]` | **não** | `0` é dado: barra de altura zero é "não houve consumo", não ausência |
| `<PieChart><Pie data={…}/></PieChart>` | **não** | o dado está na série, e o container varre os filhos por isso |

Dois limites, declarados: (1) se o dado entra por um componente **seu** em volta
da série, o container não enxerga — a varredura é da árvore escrita, não da
renderizada; (2) não distinguimos chave de categoria de chave de valor, então um
eixo X numérico (timestamp) com a série toda nula conta como dado.

Sem a prop, nada muda: o Recharts desenha a grade e os eixos sem série.

## Legenda — `keepPlotHeight` decide de quem é a altura (`vNEXT`)

O Recharts mede o wrapper da legenda e **desconta** essa altura da área de
plotagem. É o default, e é o que sempre valeu: com `h-[250px]`, uma legenda de 1
linha deixa 228px de gráfico e uma de 2 linhas deixa 206px. O bloco não muda de
tamanho — quem encolhe é o gráfico, e nada na tela explica.

`keepPlotHeight` inverte: a `<ChartLegend>` passa a ser renderizada **fora** da
caixa que carrega o `className` (portal do Recharts, num slot dentro do
`[data-chart]` — é lá que as CSS vars de cor vivem). O `className` dimensiona a
**plotagem**, e a legenda soma por fora.

| `h-[250px]` + legenda | sem a prop | com `keepPlotHeight` |
|---|---|---|
| 1 linha (22px) | 250px de bloco · **228px** de gráfico | 272px de bloco · **250px** de gráfico |
| 2 linhas (48px) | 250px de bloco · **202px** de gráfico | 298px de bloco · **250px** de gráfico |

```tsx
<ChartContainer config={config} className="h-[250px] w-full" keepPlotHeight>
  <BarChart data={rows}>
    …
    <ChartLegend content={<ChartLegendContent />} />
  </BarChart>
</ChartContainer>
```

**Quando ligar:** quando a legenda pode quebrar em 2 linhas (muitas séries, card
estreito, rótulos longos) e o gráfico não pode encolher por isso. **Quando
deixar quieto:** legenda curta de 1 linha num layout já aprovado — ligar a prop
muda a altura do bloco em 22px e pode desalinhar o card vizinho.

É opt-in porque a troca muda o pixel de **todo** gráfico com legenda, inclusive o
de 1 linha, que nunca teve queixa.

Dois detalhes que valem nos **dois** modos:

- `ChartLegendContent` tem `flex-wrap` sempre. Sem ele os itens estouram a
  largura em silêncio e uma série some da legenda. Para forçar linha única,
  passe `flex-nowrap` no `className` da legenda.
- `layout="vertical"` e `verticalAlign="middle"` seguem **dentro** do gráfico
  (ali a legenda ocupa a lateral/o meio; empurrá-la pra baixo mudaria a
  composição). A prop não tem efeito nesses casos.

## Cores

Use os tokens `var(--color-chart-1)` … `var(--color-chart-5)` no `config`.
Paleta verde-marca + harmônicas (teal/azul/âmbar/violeta), light/dark-aware.

## Grid (linhas-guia)

`<CartesianGrid vertical={false} strokeDasharray="4 4" />` — **sem** passar
`stroke`. O container já reescreve o stroke default pro token `--color-chart-grid`
(visível em light e dark). Mesmo vale pro `PolarGrid` (radar/radial).

## Gotchas

- `ChartContainer` já embute o `ResponsiveContainer` — passe só o gráfico (ex:
  `<AreaChart>`) como filho, **sem** envolver em outro ResponsiveContainer.
- Defina **altura** via `className` (ex: `h-[260px]`) — o aspect default é `video`.
  Com `keepPlotHeight`, essa altura é a da **plotagem** e o bloco fica mais alto
  que ela; sem a prop, é a do bloco e a legenda desconta.
- Sobreposição posicionada por cima do gráfico (texto central de donut, por ex.)
  continua ancorada no **pai** `relative` do `ChartContainer`. Com
  `keepPlotHeight` + legenda, o bloco cresce e o centro do pai deixa de ser o
  centro do gráfico — ancore no `[data-chart-plot]`.
- Recharts 3: `dataKey` precisa casar com a chave do `config` pra `--color-{key}`
  resolver.

### Recharts 3 — caveats que quebram silenciosamente

- **`text-display-sm` / `text-display-xs` NÃO existem** como utility (renderizam
  14px). Em KPIs use `text-heading-sm` (24–32px) / `text-heading-xs` (24px) ou
  `text-display-md` (28–39px).
- **Pizza**: não há `activeIndex`/`activeShape` no `Pie` — usar a prop
  `shape={(props, index) => <Sector .../>}` (render por setor).
- **Radial empilhado**: precisa de `<PolarAngleAxis type="number" domain={[0,total]} />`
  senão só 1 segmento aparece.
- **Eixo Y omite ticks de borda** (ex: o `0`): `interval={0}` força todos.
- **Linha-guia duplicada no topo**: o `domain` máximo deve ser igual ao maior
  `tick` (ex: `domain={[0,90]}` com tick 90, não `[0,95]`).

## Composições de dashboard

Catálogo + padrões de header/card/categoria/largura na rota `#/chart-showcase` do
catálogo hospedado. (Fonte no repo do DS: `.ai/context/components/chart-patterns.md`
— caminho **interno**, não existe em quem consome por npm ou copy-in.)
