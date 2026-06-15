# Chart — USAGE

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
| `ChartContainer` | `className` | controle de altura/aspect (ex: `h-[260px] w-full`) |
| `ChartTooltip` | `content={<ChartTooltipContent/>}` | tooltip do DS |
| `ChartTooltipContent` | `hideLabel`, `hideIndicator`, `indicator` (`dot`/`line`/`dashed`), `labelFormatter`, `formatter`, `nameKey`, `labelKey` | customização |
| `ChartLegend` | `content={<ChartLegendContent/>}` | legenda do DS |

## Cores

Use os tokens `var(--color-chart-1)` … `var(--color-chart-5)` no `config`.
Paleta verde-marca + harmônicas (teal/azul/âmbar/violeta), light/dark-aware.

## Gotchas

- `ChartContainer` já embute o `ResponsiveContainer` — passe só o gráfico (ex:
  `<AreaChart>`) como filho, **sem** envolver em outro ResponsiveContainer.
- Defina **altura** via `className` (ex: `h-[260px]`) — o aspect default é `video`.
- Recharts 3: `dataKey` precisa casar com a chave do `config` pra `--color-{key}`
  resolver.
