# Chart — USAGE

<!-- ds:regras
- a altura do `className` é a altura do GRÁFICO, não do bloco: a legenda é renderizada fora dessa caixa e SOMA. `h-[250px]` + legenda de 1 linha = 272px no total, com 250px de plotagem
- `empty` é opt-in e só troca o gráfico quando não há nenhum número finito nas props `data` (a do gráfico e a das séries). `0` é dado; `null`/`undefined`/texto não são
- gráfico que carrega dado (`data={query.data}`) merece `empty` — sem ele o Recharts desenha a grade e os eixos sem nenhuma série, e a tela parece quebrada em vez de vazia
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
| `ChartContainer` | `className` | controle de altura/aspect **da área do gráfico** (ex: `h-[260px] w-full`) — a legenda soma por fora |
| `ChartContainer` | `empty?: ReactNode` | conteúdo a mostrar no lugar do gráfico quando não há dado. Ausente = Recharts desenha os eixos vazios |
| `ChartTooltip` | `content={<ChartTooltipContent/>}` | tooltip do DS |
| `ChartTooltipContent` | `hideLabel`, `hideIndicator`, `indicator` (`dot`/`line`/`dashed`), `labelFormatter`, `formatter`, `nameKey`, `labelKey` | customização |
| `ChartLegend` | `content={<ChartLegendContent/>}` | legenda do DS |

## Sem dados — `empty`

```tsx
<ChartContainer
  config={config}
  className="h-[250px] w-full"
  empty={
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

## Legenda — a altura pedida é a do gráfico

`<ChartLegend>` é renderizada **fora** da caixa que carrega o `className`
(portal do Recharts), dentro do `[data-chart]`. Duas consequências:

- **o `className` dimensiona a plotagem**, e a legenda soma por fora. `h-[250px]`
  + legenda de 1 linha = **272px** de bloco com **250px** de gráfico. Antes, os
  mesmos 250px viravam 228px de gráfico.
- **legenda que quebra em 2 linhas cresce o bloco**, não encolhe o gráfico — que
  era o defeito: 48px de legenda tiravam 48px das barras e nada na tela explicava.
  `ChartLegendContent` já vem com `flex-wrap`.

`layout="vertical"` e `verticalAlign="middle"` seguem **dentro** do gráfico (ali a
legenda ocupa a lateral/o meio; empurrá-la pra baixo mudaria a composição).

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
  Essa altura é a da **plotagem**; com legenda, o bloco fica mais alto que ela.
- Sobreposição posicionada por cima do gráfico (texto central de donut, por ex.)
  continua ancorada no **pai** `relative` do `ChartContainer`. Com legenda, o
  bloco cresce e o centro do pai deixa de ser o centro do gráfico — ancore no
  `[data-chart-plot]` ou mantenha a legenda fora desses casos.
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
