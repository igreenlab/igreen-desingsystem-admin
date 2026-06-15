# Chart patterns — referência canônica

Como construir gráficos e composições de dashboard no iGreen DS de forma que
**qualquer agente/IA replique e estenda sem sair do padrão**. Base: Recharts 3 +
wrapper `Chart` (`src/components/ui/Chart`). Catálogo vivo em
`src/preview/pages/ChartShowcaseDoc.tsx` (rota `#/chart-showcase`).

> Regra de ouro: gráfico **sempre** dentro de `<ChartContainer config={...}>`,
> cores **sempre** via tokens (`var(--color-chart-*)` / `--color-{key}` do config),
> grid **sempre** via token `chart-grid`. Nunca hex/px de cor avulso.

---

## 1. Fundação — ChartContainer + config

```tsx
const config = {
  gerada:    { label: "Gerada",    color: "var(--color-chart-1)" },
  consumida: { label: "Consumida", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-[260px] w-full">
  <BarChart data={DATA}>
    <CartesianGrid vertical={false} strokeDasharray="4 4" />
    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="gerada"    fill="var(--color-gerada)" radius={[4,4,0,0]} />
    <Bar dataKey="consumida" fill="var(--color-consumida)" radius={[4,4,0,0]} />
  </BarChart>
</ChartContainer>
```

- `config[key].color` → `ChartContainer` injeta `--color-{key}` escopado; elementos
  usam `var(--color-{key})`. `dataKey` **tem** que casar com a chave do config.
- Altura via `className` (`h-[NNNpx] w-full`), nunca prop `height`.
- `ChartContainer` já embute o `ResponsiveContainer` — não aninhar outro.

---

## 2. Tokens de cor de chart

| Token | Uso |
|---|---|
| `--color-chart-1` | verde da marca (primitive — acompanha a brand) |
| `--color-chart-2..5` | teal / azul / âmbar / violeta (harmônicas) |
| `--color-chart-grid` | **linhas-guia** (CartesianGrid/PolarGrid). light `gray[200]`, dark branco 12% |

Origem: `tokens/brands/default/semantic/color-light.ts` + `color-dark.ts`
(namespace `chart`). Após editar → `npm run tokens:tw4`.

### Convenção de paleta por tipo
- **1 série** → `chart-1` (verde).
- **2 séries** → verde (`chart-1`) + âmbar (`chart-4`). Não usar teal pra 2ª série.
- **Categórico (3–5 fatias/grupos)** → `chart-1..5` quando a distinção importa.
- **Pizza/donut** → preferir **rampa monocromática da brand** (não "carnaval"):
  `chart-1` → escurecendo via `color-mix(in oklch, var(--color-chart-1) N%, black)`
  (descendente: nunca mais claro que a brand, pra texto `on-brand` manter contraste).
- **Status/uptime** → verde (ok) / âmbar (degraded) / `fg-danger` (down) / `bg-muted` (inactive).
- Cores fora da paleta de chart (rosa/laranja vivos de exemplos externos) → mapear
  pro token mais próximo (`fg-danger` p/ vermelho, `chart-4` p/ âmbar).

---

## 3. Grid (linhas-guia) — padrão

```tsx
<CartesianGrid vertical={false} strokeDasharray="4 4" />
```

O `ChartContainer` já reescreve o stroke default (`#ccc`) do Recharts para
`var(--color-chart-grid)` (cartesian e polar). **Não** passar `stroke` manual.
Visível em light e dark por design.

---

## 4. Caveats do Recharts 3 (lições aprendidas)

| Sintoma | Causa | Solução |
|---|---|---|
| `text-display-sm` / `text-display-xs` renderizam 14px | **não existem** como utility no DS | usar `text-heading-sm` (24–32px) / `text-heading-xs` (24px), ou `text-display-md` (28–39px) |
| Pizza: `activeIndex`/`activeShape` não existem no `Pie` | API mudou no recharts 3 | usar a prop **`shape={(props, index) => ...}`** (render por setor) |
| Radial empilhado só mostra 1 segmento | falta eixo numérico | `<PolarAngleAxis type="number" domain={[0, total]} tick={false} />` |
| Eixo Y omite o tick `0` (ou o do topo) | dedupe automático nas bordas | `interval={0}` no `<YAxis>` força todos os ticks |
| Linha-guia duplicada "encavalada" no topo | `domain` máximo ≠ maior tick (ex: `[0,95]` com tick 90) | **domain máximo = maior tick** (`[0,90]`) |
| Tipo do setor não exporta (`PieSectorDataItem`) | sem export público | tipar a callback de `shape` de forma frouxa (`// eslint-disable-next-line` + `any`) |

Radial "track" (faixa-guia atrás da barra parcial):
```tsx
<RadialBar dataKey="pct" cornerRadius={9}
  fill="var(--color-chart-1)" background={{ fill: "var(--color-bg-muted)" }} />
// + PolarAngleAxis type="number" domain={[0, MAX]} pra a barra ser parcial
```

---

## 5. Composição (cards de dashboard)

Catálogo em `ChartShowcaseDoc.tsx`. Blocos reutilizáveis dessa página:

| Bloco | O que é |
|---|---|
| `Panel` | wrapper do card (`rounded-radius-lg bg-bg-surface p-pad-4xl shadow-sh-lg ring-1`). Largura via `className="max-w-[NNNpx]"` |
| `CardHead` | título (`text-title-md font-semibold`) + subtítulo (`text-body-sm text-fg-muted`) + ação opcional. **Padrão de header título+subtítulo** |
| `KPI_LABEL` + `KPI_VALUE` | header de KPI: label `caption-md` muted + valor **30px** bold. Para cards cujo cabeçalho é um número de destaque (ex: SaaS revenue, Revenue Performance, Crypto) |
| `SectionLabel` | cabeçalho de categoria (full-width, `caption-md` uppercase muted + divider) |

### Convenções de layout
- **1 card por linha** (`flex flex-col items-center gap-gp-6xl` → 32px entre cards).
- Cards **largos** (gráfico grande, tabela, painel lateral): largura cheia.
- Cards **estreitos** (mini-chart + lista/KPI): `max-w-[NNNpx]` fixo, **coluna única**
  internamente (nunca chart e conteúdo lado-a-lado — fica espremido).
- Larguras de referência usadas: Weekly 400 · Total sales 400 · Vehicle 520 ·
  Budget 450 · Crypto 512 · Anatomy 420 · Support 440 · Traffic 440.
- Agrupar por **categoria** com `SectionLabel` (Receita & Finanças, Usuários &
  Crescimento, Operações & Status, Cobrança & Campanhas, Mercado).

### Eixos / formatação
- `XAxis tickLine={false} axisLine={false} tickMargin={8}`; séries longas
  (diárias) → `minTickGap={24..32}` ou `interval`.
- `YAxis` com `ticks` explícitos + `domain` terminando no maior tick + `interval={0}`.
- `tickFormatter` p/ milhares (`${v/1000}k`) e moeda (`$${v}k` / `$${v}K`).
- Tooltip/legenda **sempre** do DS (`ChartTooltipContent` / `ChartLegendContent`).
  `hideIndicator` quando a série é única (sem ponto de cor fantasma).

### Texto central (donut/gauge/radial)
- número `~22px` bold + descrição `caption-sm`; gap ≈ 20px; centralizar o bloco
  considerando o vazio inferior do gauge (`-mb` no wrapper pra "absorver").

---

## 6. Checklist para um gráfico novo (IA)

1. Envolver em `<ChartContainer config={...}>` com `ChartConfig` tipado.
2. Cores só por token (`chart-1..5` / config keys). 2 séries = verde+âmbar.
3. `CartesianGrid vertical={false} strokeDasharray="4 4"` (grid já tokenizado).
4. `YAxis`: `domain` máximo = maior tick + `interval={0}`.
5. Tooltip/legend do DS. `hideIndicator` em série única.
6. Card: `Panel` + `CardHead` (ou `KPI_LABEL`/`KPI_VALUE`). Estreito = `max-w` + coluna única.
7. Pizza → `shape` (não activeIndex). Radial stack → `PolarAngleAxis type=number`.
8. Nada de `text-display-sm/xs` (use `heading-*`). Nada de hex/px de cor avulso.
